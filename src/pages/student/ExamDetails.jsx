import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack, MdDownload, MdCalendarToday,
  MdTranslate, MdCheckCircle, MdQuiz, MdBookmark,
} from "react-icons/md";
import { studentAPI } from "../../api/student.jsx";
import { toast } from "react-hot-toast";
import { Button } from "../../components/shared/Button.jsx";
import { Spinner } from "../../components/shared/Spinner.jsx";

const PAGE_SIZE = 50;

function saveBlob(blob, filename) {
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [doneTranslations, setDoneTranslations] = useState([]);
  const [translationsLoading, setTranslationsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [translationsPage, setTranslationsPage] = useState(1);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await studentAPI.getExam(examId);
        if (!data) setNotFound(true);
        else setExam(data);
      } catch (e) {
        console.error(e);
        toast.error("Error fetching exam details.");
        setNotFound(true);
      } finally { setIsLoading(false); }
    })();
  }, [examId]);

  useEffect(() => {
    (async () => {
      try {
        const langs = await studentAPI.getAvailableLanguages();
        if (langs?.length) setAvailableLanguages(langs);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const loadTranslations = async () => {
    setTranslationsLoading(true);
    try {
      const all = await studentAPI.getExamTranslations(examId);
      setDoneTranslations(
        all.filter((t) => t.status === "done" || t.status === "completed")
      );
      setTranslationsPage(1);
    } catch (e) { console.error(e); }
    finally { setTranslationsLoading(false); }
  };

  useEffect(() => { loadTranslations(); }, [examId]);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleTranslate = async () => {
    if (!selectedLanguageId) { toast.error("Please select a language first."); return; }
    setIsTranslating(true);
    const tid = toast.loading("Starting translation…");
    try {
      const job = await studentAPI.triggerTranslation("exam", examId, selectedLanguageId);
      await delay(2000);
      if (job.status === "done" || job.status === "completed") {
        if (job.download_url) {
          toast.loading("Preparing download…", { id: tid });
          const { blob, filename } = await studentAPI.downloadFromUrl(job.download_url);
          saveBlob(blob, filename || `Translated_${exam?.title || "Exam"}`);
          toast.success("Download started!", { id: tid });
        } else {
          const translId = job.translation_id || job.id;
          toast.loading("Preparing download…", { id: tid });
          const { blob, filename } = await studentAPI.downloadTranslation(translId);
          saveBlob(blob, filename || `Translated_${exam?.title}`);
          toast.success("Download started!", { id: tid });
        }
        await loadTranslations();
      } else {
        toast.error("Translation taking longer than expected. Try again later.", { id: tid });
      }
    } catch (e) {
      toast.error(e.message || "Translation failed.", { id: tid });
    } finally { setIsTranslating(false); }
  };

  const handleDownloadRow = async (t) => {
    const id = t.id || t.translation_id;
    setDownloadingId(id);
    const tid = toast.loading("Preparing download…");
    try {
      const langName = t.language_name || t.target_language || "Translated";
      const defaultName = `${exam?.title || "Exam"}_${langName}`;
      if (t.download_url) {
        const { blob, filename } = await studentAPI.downloadFromUrl(t.download_url);
        saveBlob(blob, filename || defaultName);
        toast.success("Download started!", { id: tid });
      } else {
        const { blob, filename } = await studentAPI.downloadTranslation(id);
        saveBlob(blob, filename || defaultName);
        toast.success("Download started!", { id: tid });
      }
    } catch (e) {
      toast.error("Failed to download translation.", { id: tid });
    } finally { setDownloadingId(null); }
  };

  if (isLoading) return <div className="flex justify-center items-center py-20"><Spinner /></div>;

  if (notFound || !exam) return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Exam Not Found</h1>
      <p className="text-slate-500 mb-6">This exam doesn't exist or has been removed.</p>
      <button onClick={() => navigate("/student/browse-exams")} className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">Browse Exams</button>
    </div>
  );

  const totalPages = Math.max(1, Math.ceil(doneTranslations.length / PAGE_SIZE));
  const pageStart = (translationsPage - 1) * PAGE_SIZE;
  const pageRows = doneTranslations.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* ── SIDEBAR ── */}
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-violet-600 font-medium transition-colors">
            <MdArrowBack className="w-5 h-5" /> Back to Browse
          </button>
        </div>
        
        <div className="flex-1 px-6 py-8 flex flex-col">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-md">
            <MdQuiz className="text-white text-3xl" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-4">
            {exam.title}
          </h1>

          {/* Translate panel */}
          <div className="mt-auto pt-10">
            <div className="bg-violet-50 rounded-2xl border border-violet-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MdTranslate className="w-5 h-5 text-violet-600" />
                <h2 className="text-base font-semibold text-violet-800">Translate Exam</h2>
              </div>
              <label htmlFor="lang-exam" className="block text-sm font-medium text-slate-700 mb-2">Target language</label>
              <select
                id="lang-exam"
                value={selectedLanguageId}
                onChange={(e) => setSelectedLanguageId(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 text-sm border border-violet-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 mb-4 transition-shadow"
              >
                <option value="">Select a language…</option>
                {availableLanguages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <Button onClick={handleTranslate} disabled={isTranslating || !selectedLanguageId} className="w-full py-2.5 shadow-sm">
                {isTranslating ? "Translating…" : "Translate & Download"}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <MdTranslate className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Available Translations</h2>
            {!translationsLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {doneTranslations.length} done
              </span>
            )}
          </div>
          <button onClick={loadTranslations} className="text-xs text-slate-400 hover:text-violet-600 transition-colors">Refresh</button>
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <span className="px-3 py-1 rounded bg-violet-600 text-white text-xs font-semibold min-w-[2rem] text-center">{translationsPage}</span>
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
