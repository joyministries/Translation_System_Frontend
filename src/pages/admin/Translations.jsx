import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { BooksTranslationsView } from '../../components/admin/BooksTranslationsView';

export function Translations() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200 font-medium"
        >
          <MdArrowBack className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Translations Library</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">View and download completed translations for all books</p>
        </div>
      </div>

      <BooksTranslationsView />
    </div>
  );
}
