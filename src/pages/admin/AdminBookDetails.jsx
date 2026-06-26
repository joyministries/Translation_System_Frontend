import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MdArrowBack, MdDownload, MdCalendarToday, MdPages,
  MdBookmark, MdTranslate, MdCheckCircle, MdMenuBook,
} from "react-icons/md";
import { adminAPI } from "../../api/admin.jsx";
import { toast } from "react-hot-toast";
import { Button } from "../../components/shared/Button.jsx";
import { Spinner } from "../../components/shared/Spinner.jsx";
import { saveBlob } from "../../utils/fileUtils";
import { delay } from "../../utils/Timer";

const PAGE_SIZE = 50;

export function AdminBookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(location.state?.book || null);
  const [isLoading, setIsLoading] = useState(!book);
  const [notFound, setNotFound] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [doneTranslations, setDoneTranslations] = useState([]);
  const [translationsLoading, setTranslationsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [translationsPage, setTranslationsPage] = useState(1);

  useEffect(() => {
    if (!book) {
      // If we don't have the book from state, fetch it from the list
      // Since adminAPI doesn't have a direct getBook by ID, we fetch the list and find it
      (async () => {
        setIsLoading(true);
        try {
          const response = await adminAPI.books.list(1, 1000);
          const foundBook = (response.items || response.data || []).find(b => b.id === parseInt(bookId) || b.id === bookId);
          if (!foundBook) setNotFound(true);
          else setBook(foundBook);
        } catch (e) {
          console.error(e);
          toast.error("Error fetching book details.");
          setNotFound(true);
        } finally { setIsLoading(false); }
      })();
    }
  }, [book, bookId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await adminAPI.languages.list();
        const langs = response.data.languages;
        if (Array.isArray(langs)) {
          setAvailableLanguages(langs.filter(l => l.isActive !== false));
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  const loadTranslations = async () => {
    setTranslationsLoading(true);
    try {
      const all = await adminAPI.books.getTranslations(bookId);
      setDoneTranslations(
        all.filter((t) => t.status === "done" || t.status === "completed")
      );
      setTranslationsPage(1);
    } catch (e) { console.error(e); }
    finally { setTranslationsLoading(false); }
  };

  useEffect(() => { loadTranslations(); }, [bookId]);

  const handleTranslate = async () => {
    if (!selectedLanguageId) { toast.error("Please select a language first."); return; }
    setIsTranslating(true);
    const tid = toast.loading("Starting translation…");
    try {
      const response = await adminAPI.translations.trigger(bookId, "book", selectedLanguageId);
      const job = response.data || response;
      const translId = job.translation_id || job.id;
      
      let isDone = false;
      let finalJob = job;
      let attempts = 0;
      
      while (!isDone && attempts < 60) {
        if (finalJob.status === "done" || finalJob.status === "completed") {
          isDone = true;
          break;
        } else if (finalJob.status === "failed") {
          throw new Error("Translation failed during processing.");
        }
        await delay(3000);
        const statusRes = await adminAPI.translations.getTranslation(translId);
        finalJob = statusRes.data || statusRes;
        attempts++;
      }
      
      if (!isDone) {
        toast.success("Translation is taking longer than expected. It will complete in the background.", { id: tid });
        await loadTranslations();
        return;
      }

      toast.loading("Preparing download…", { id: tid });
      const { blob, filename } = await adminAPI.translations.download(translId);
      
      let baseName = filename || book?.title || 'Translated_Book';
      baseName = baseName.replace(/\.[^/.]+$/, "");
      
      let safeExtension = "";
      switch (blob.type) {
        case 'application/pdf': safeExtension = '.pdf'; break;
        case 'application/msword': safeExtension = '.doc'; break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': safeExtension = '.docx'; break;
        default:
          const originalExtMatch = filename?.match(/\.[^/.]+$/);
          safeExtension = originalExtMatch ? originalExtMatch[0] : '';
      }
      const finalFileName = `${baseName}${safeExtension}`;
      saveBlob(blob, finalFileName);
      
      toast.success("Download started!", { id: tid });
      await loadTranslations();
    } catch (e) {
      toast.error(e.message || "Translation failed.", { id: tid });
    } finally { setIsTranslating(false); }
  };

  const handleDownloadRow = async (t) => {
    const id = t.id || t.translation_id;
    setDownloadingId(id);
    const tid = toast.loading("Preparing download…");
    try {
      const { blob, filename } = await adminAPI.translations.download(id);
      let baseName = filename || book?.title || 'Translated_Book';
      baseName = baseName.replace(/\.[^/.]+$/, "");

      let safeExtension = "";

      switch (blob.type) {
        case 'application/pdf':
          safeExtension = '.pdf';
          break;
        case 'application/msword':
          safeExtension = '.doc';
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          safeExtension = '.docx';
          break;
        default:
          const originalExtMatch = filename?.match(/\.[^/.]+$/);
          safeExtension = originalExtMatch ? originalExtMatch[0] : '';
      }
      const finalFileName = `${baseName}${safeExtension}`;
      saveBlob(blob, finalFileName);
      toast.success("Download started!", { id: tid });
    } catch (e) {
      toast.error("Failed to download translation.", { id: tid });
    } finally { setDownloadingId(null); }
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><Spinner /></div>;

  if (notFound || !book) return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Book Not Found</h1>
      <p className="text-slate-500 mb-6">This book doesn't exist or has been removed.</p>
      <button onClick={() => navigate("/admin/books")} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Back to Books</button>
    </div>
  );

  const totalPages = Math.max(1, Math.ceil(doneTranslations.length / PAGE_SIZE));
  const pageStart = (translationsPage - 1) * PAGE_SIZE;
  const pageRows = doneTranslations.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
            <MdArrowBack className="w-5 h-5" /> Back to Books
          </button>
        </div>

        <div className="flex-1 px-6 py-8 flex flex-col">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-md">
            <MdMenuBook className="text-white text-3xl" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4">
            {book.title}
          </h1>

          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
              {book.language || "Unknown Language"}
            </span>
          </div>

          {/* Translate panel */}
          <div className="mt-auto pt-10">
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MdTranslate className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-blue-800">Translate Book</h2>
              </div>
              <label htmlFor="lang-book" className="block text-sm font-medium text-slate-700 mb-2">Target language</label>
              <select
                id="lang-book"
                value={selectedLanguageId}
                onChange={(e) => setSelectedLanguageId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4 transition-shadow"
              >
                <option value="">Select a language…</option>
                {availableLanguages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <Button onClick={handleTranslate} disabled={isTranslating || !selectedLanguageId} className="w-full py-2.5 shadow-sm">
                {isTranslating ? "Translating…" : "Trigger Translation"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <MdTranslate className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Available Translations</h2>
            {!translationsLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {doneTranslations.length} done
              </span>
            )}
          </div>
          <button onClick={loadTranslations} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Refresh</button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {translationsLoading ? (
            <div className="flex items-center justify-center py-20"><Spinner /></div>
          ) : doneTranslations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <MdTranslate className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">No translations yet</p>
              <p className="text-slate-400 text-sm">Use the sidebar panel to generate a translation.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-100">
                      <th className="px-5 py-3 font-semibold">Language</th>
                      <th className="px-5 py-3 font-semibold">Code</th>
                      <th className="px-5 py-3 font-semibold">Created At</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((t) => {
                      const id = t.id || t.translation_id;
                      const busy = downloadingId === id;
                      return (
                        <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{t.language_name || t.target_language || "—"}</td>
                          <td className="px-5 py-3.5 text-sm font-mono text-slate-500 uppercase">{t.language_code || t.target_language_code || "—"}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-500">{t.created_at ? new Date(t.created_at).toLocaleString() : "—"}</td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <MdCheckCircle className="w-3.5 h-3.5" /> Translated
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDownloadRow(t)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MdDownload className="w-4 h-4" />
                              {busy ? "Downloading…" : "Download"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, doneTranslations.length)}</span> of <span className="font-semibold text-slate-700">{doneTranslations.length}</span> translations
                  </p>
                  <div className="flex items-center gap-1">
                    {[
                      { label: "«", action: () => setTranslationsPage(1), disabled: translationsPage === 1 },
                      { label: "‹ Prev", action: () => setTranslationsPage((p) => Math.max(1, p - 1)), disabled: translationsPage === 1 },
                    ].map(({ label, action, disabled }) => (
                      <button key={label} onClick={action} disabled={disabled} className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{label}</button>
                    ))}
                    <span className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold min-w-[2rem] text-center">{translationsPage}</span>
                    <span className="text-xs text-slate-400">/ {totalPages}</span>
                    {[
                      { label: "Next ›", action: () => setTranslationsPage((p) => Math.min(totalPages, p + 1)), disabled: translationsPage === totalPages },
                      { label: "»", action: () => setTranslationsPage(totalPages), disabled: translationsPage === totalPages },
                    ].map(({ label, action, disabled }) => (
                      <button key={label} onClick={action} disabled={disabled} className="px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{label}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
