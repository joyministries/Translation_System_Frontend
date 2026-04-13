import { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { adminAPI } from '../../api/admin';
import toast from 'react-hot-toast';

export function TranslationModal({ isOpen, onClose, content, contentType }) {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchLanguages = async () => {
        try {
          const response = await adminAPI.languages.list();
          setLanguages(response.data.languages);
        } catch (error) {
          console.error('Failed to fetch languages:', error);
          toast.error('Could not load languages.');
        }
      };
      fetchLanguages();
    }
  }, [isOpen]);

  const handleTranslate = async () => {
    if (!selectedLanguage) {
      toast.error('Please select a language.');
      return;
    }
    if (!content) {
      toast.error('No content selected for translation.');
      return;
    }

    setIsTranslating(true);
    const toastId = toast.loading('Starting translation...');

    try {
      const jobResponse = await adminAPI.translations.trigger(content.id, contentType, selectedLanguage);

      if (jobResponse.data.status === 'completed' || jobResponse.data.status === 'done') {
        const translationId = jobResponse.data.translation_id || jobResponse.data.id;
        toast.loading('Translation complete! Preparing download...', { id: toastId });

        const { blob, filename } = await adminAPI.translations.download(translationId);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `${content.title.replace(/ /g, '_')}_translated.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success('Download has started!', { id: toastId });
        onClose();
      } else {
        toast.success('Translation job started. It may take a few moments.', { id: toastId });
        onClose();
      }
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error(error.message || 'Translation failed. Please try again.', { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Translate ${contentType}`}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{content?.title}</h3>
          <p className="text-sm text-gray-600">Select a language to translate this {contentType}.</p>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-2 border rounded-md"
          disabled={isTranslating}
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isTranslating}>
            Cancel
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !selectedLanguage}
          >
            {isTranslating ? 'Translating...' : 'Translate & Download'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
