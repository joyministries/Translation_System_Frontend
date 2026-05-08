import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin.jsx';
import { Book, ChevronDown, ChevronUp, Globe, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function BooksTranslationsView() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBookId, setExpandedBookId] = useState(null);
    const [translations, setTranslations] = useState({});
    const [loadingTranslations, setLoadingTranslations] = useState({});

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                const response = await adminAPI.books.list(1, 100);
                setBooks(response.items || response.data || []);
            } catch (error) {
                console.error('Failed to fetch books:', error);
                toast.error('Failed to load books');
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const toggleBook = async (bookId) => {
        if (expandedBookId === bookId) {
            setExpandedBookId(null);
            return;
        }

        setExpandedBookId(bookId);

        // Fetch translations if not already fetched
        if (!translations[bookId]) {
            try {
                setLoadingTranslations(prev => ({ ...prev, [bookId]: true }));
                const response = await adminAPI.books.getTranslations(bookId);
                setTranslations(prev => ({ ...prev, [bookId]: response }));
            } catch (error) {
                console.error(`Failed to fetch translations for book ${bookId}:`, error);
                toast.error('Failed to load translations for this book');
            } finally {
                setLoadingTranslations(prev => ({ ...prev, [bookId]: false }));
            }
        }
    };

    const handleDownload = async (translationId) => {
        const toastId = toast.loading('Preparing download...');
        try {
            const { blob, filename } = await adminAPI.translations.download(translationId);
            let finalName = filename || `Translation_${translationId}.pdf`;
            if (!finalName.toLowerCase().endsWith('.pdf')) {
                finalName += '.pdf';
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = finalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Download started!', { id: toastId });
        } catch (error) {
            toast.error('Failed to download file.', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Book className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Books Found</h3>
                <p className="text-gray-500">There are currently no books in the system.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Books and Translations</h2>
                <p className="text-sm text-gray-500 mt-1">View the translation status for each book across different languages.</p>
            </div>
            
            <div className="divide-y divide-gray-100">
                {books.map((book) => (
                    <div key={book.id} className="group">
                        <button
                            onClick={() => toggleBook(book.id)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Book className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-gray-900">{book.title}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{book.author || 'Unknown Author'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                {expandedBookId === book.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 group-hover:text-gray-600" />
                                )}
                            </div>
                        </button>
                        
                        {expandedBookId === book.id && (
                            <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                                {loadingTranslations[book.id] ? (
                                    <div className="flex justify-center p-4">
                                        <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-3 font-medium">Language</th>
                                                    <th className="px-6 py-3 font-medium">Status</th>
                                                    <th className="px-6 py-3 font-medium">Date</th>
                                                    <th className="px-6 py-3 font-medium flex justify-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {translations[book.id] && translations[book.id].length > 0 ? (
                                                    translations[book.id].map((translation) => (
                                                        <tr key={translation.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium flex items-center gap-2">
                                                                <Globe className="w-4 h-4 text-gray-400" />
                                                                {translation.target_language}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                                    translation.status === 'completed' || translation.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    translation.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    translation.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {translation.status || 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {new Date(translation.created_at || new Date()).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm flex justify-end">
                                                                {(translation.status === 'completed' || translation.status === 'done') ? (
                                                                    <button
                                                                        onClick={() => handleDownload(translation.id || translation.translation_id)}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                        Download
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-gray-400 text-sm px-3 py-1.5">Unavailable</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">
                                                            <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                            <p>No translations available for this book yet.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
