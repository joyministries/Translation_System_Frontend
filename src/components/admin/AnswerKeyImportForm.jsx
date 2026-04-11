import { useRef, useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';

export function AnswerKeyImportForm({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState({});
  const [metadata, setMetadata] = useState({
    title: '',
  });
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

  useEffect(() => {
    if (file) {
      const fileName = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
      setMetadata(prev => ({ ...prev, title: `${fileName} - Answer Key` }));
    }
  }, [file]);

  const validate = () => {
    const newErrors = {};

    if (!file) {
      newErrors.file = 'Please select a file to import.';
    } else {
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!VALID_EXTENSIONS.includes(fileExtension)) {
        newErrors.file = 'Only Excel (.xlsx, .xls) and CSV files are supported';
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.file = `File size must be less than 10MB.`;
      }
    }

    if (!metadata.title.trim()) newErrors.title = 'Answer key title is required.';

    return newErrors;
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setErrors({});
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setErrors({});
      setFile(files[0]);
    }
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImport = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach(error => toast.error(error));
      return;
    }

    setErrors({});
    setImporting(true);

    try {
      await adminAPI.answerkeys.upload(file, metadata);
      toast.success(`Answer Key "${metadata.title}" imported successfully!`);
      setFile(null);
      setMetadata({ title: '', book_id: '', exam_id: '' });
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      toast.error(error.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setMetadata({ title: '' });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Import Answer Key</h2>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${errors.file ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={VALID_EXTENSIONS.join(',')}
            className="hidden"
          />
          <div className="text-center">
            <p className="text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">Excel or CSV, max 10MB</p>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <Button variant="danger" size="sm" onClick={clearFile}>
              Clear
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Key Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
          </div>
        </div>
      )}

      {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}

      <div className="mt-6">
        <Button
          onClick={handleImport}
          disabled={importing || !file}
          className="w-full"
        >
          {importing ? 'Importing...' : 'Import Answer Key'}
        </Button>
      </div>
    </div>
  );
}
