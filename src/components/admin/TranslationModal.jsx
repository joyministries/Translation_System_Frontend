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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const toastId = toast.loading('Triggering translation on server...');

    try {
      // 1. Trigger translation
      let jobResponse = await adminAPI.translations.triggerTranslation(content.id, contentType, selectedLanguage);
      let jobData = jobResponse.data;

      // 2. Implement 2-second delay to allow backend to register the job
      await delay(2000);

      let translationId = jobData.translation_id || jobData.id;
      let status = jobData.status;

      // 3. Poll until completed
      if (status !== 'completed' && status !== 'done') {
        toast.loading('Translating document...', { id: toastId });
        
        let isDone = false;
        let attempts = 0;
        const maxAttempts = 30; // Approx 1 minute with 2s polling
        
        while (!isDone && attempts < maxAttempts) {
          await delay(2000);
          const pollResponse = await adminAPI.translations.getTranslation(translationId);
          jobData = pollResponse.data;
          
          if (jobData.status === 'completed' || jobData.status === 'done') {
            isDone = true;
          } else if (jobData.status === 'failed') {
            throw new Error(jobData.failure_reason || 'Translation job failed.');
          }
          attempts++;
        }
        
        if (!isDone) {
          throw new Error('Translation timed out. Please check again later.');
        }
      }

      toast.loading('Translation complete! Preparing download...', { id: toastId });

      // 4. Download file
      const { blob, filename } = await adminAPI.translations.download(translationId);

      // 5. Create local URL and trigger safe browser download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Translated_${content.title || contentType}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download has started!', { id: toastId });
      onClose();

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
