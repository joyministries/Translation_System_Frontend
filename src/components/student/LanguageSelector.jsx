import { useState } from 'react';

export function LanguageSelector({ onSelect, loading = false }) {
  const staticLanguages = [
    { id: 1, name: 'Swahili', code: 'sw' },
    { id: 2, name: 'French', code: 'fr' },
    { id: 3, name: 'Spanish', code: 'es' },
    { id: 4, name: 'Portuguese', code: 'pt' },
    { id: 5, name: 'Arabic', code: 'ar' },
    { id: 6, name: 'Amharic', code: 'am' },
    { id: 7, name: 'Yoruba', code: 'yo' },
    { id: 8, name: 'Igbo', code: 'ig' },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [languages] = useState(staticLanguages);
  const [selectedLanguage, setSelectedLanguage] = useState(staticLanguages[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    onSelect?.(language);
  };

  return (
    <div className="relative w-full max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
      >
        <div className="flex items-center justify-between">
          <span>{selectedLanguage?.name || 'Select Language'}</span>
          <span className="text-gray-500">▼</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <input
            type="text"
            placeholder="Search languages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none"
          />
          <ul className="max-h-48 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              <li key={lang.id}>
                <button
                  onClick={() => handleSelect(lang)}
                  className={`w-full text-left px-4 py-2 hover:bg-primary-50 focus:outline-none ${
                    selectedLanguage?.id === lang.id
                      ? 'bg-primary-100 text-primary font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
          {filteredLanguages.length === 0 && (
            <div className="px-4 py-2 text-center text-gray-500 text-sm">
              No languages found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
