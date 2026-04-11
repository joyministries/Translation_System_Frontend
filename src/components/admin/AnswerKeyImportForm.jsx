import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '../shared/Button';
import { Spinner } from '../shared/Spinner';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { Input } from '../shared/Input.jsx';

export function AnswerKeyImportForm({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState({});

  const [books, setBooks] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);

  const [metadata, setMetadata] = useState({
    title: '',
    book_id: '',
    exam_id: '',
  });
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

  const fetchData = useCallback(async () => {
    try {
      const [booksRes, examsRes] = await Promise.all([
        adminAPI.books.list(1, 1000),
        adminAPI.exams.list(1, 1000)
      ]);
      setBooks(booksRes.data?.items || []);
      setExams(examsRes.data?.items || []);
    } catch (error) {
      console.error("Failed to fetch books and exams", error);
      toast.error("Could not load books and exams for selection.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (file) {
      const fileName = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
      setMetadata(prev => ({ ...prev, title: `${fileName} - Answer Key` }));
    }
  }, [file]);

  useEffect(() => {
    // Filter exams when a book is selected
    if (metadata.book_id) {
      const relevantExams = exams.filter(exam => exam.book_id === metadata.book_id);
      setFilteredExams(relevantExams);
      // If the currently selected exam doesn't belong to the new book, reset it
      if (metadata.exam_id && !relevantExams.some(e => e.id === metadata.exam_id)) {
        setMetadata(prev => ({ ...prev, exam_id: '' }));
      }
    } else {
      setFilteredExams([]);
      setMetadata(prev => ({ ...prev, exam_id: '' }));
    }
  }, [metadata.book_id, exams]);

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
    if (!metadata.book_id) newErrors.book_id = 'You must select a book.';
    if (!metadata.exam_id) newErrors.exam_id = 'You must select an exam.';

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
      await adminAPI.answerKeys.import(file, metadata);
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
    setMetadata({ title: '', book_id: '', exam_id: '' });
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
            <Input
              label="Answer Key Title"
              name="title"
              value={metadata.title}
              onChange={handleMetadataChange}
              error={errors.title}
              required
            />
            <div>
              <label htmlFor="book_id" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Book <span className="text-red-500">*</span>
              </label>
              <select
                id="book_id"
                name="book_id"
                value={metadata.book_id}
                onChange={handleMetadataChange}
                className={`w-full p-3 border rounded-md bg-white ${errors.book_id ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="" disabled>Select a book</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
              {errors.book_id && <p className="text-red-500 text-sm mt-1">{errors.book_id}</p>}
            </div>
            <div>
              <label htmlFor="exam_id" className="block text-sm font-medium text-gray-700 mb-1">
                Associated Exam <span className="text-red-500">*</span>
              </label>
              <select
                id="exam_id"
                name="exam_id"
                value={metadata.exam_id}
                onChange={handleMetadataChange}
                className={`w-full p-3 border rounded-md bg-white ${errors.exam_id ? 'border-red-500' : 'border-gray-300'}`}
                required
                disabled={!metadata.book_id || filteredExams.length === 0}
              >
                <option value="" disabled>
                  {metadata.book_id ? (filteredExams.length > 0 ? 'Select an exam' : 'No exams for this book') : 'Select a book first'}
                </option>
                {filteredExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
              {errors.exam_id && <p className="text-red-500 text-sm mt-1">{errors.exam_id}</p>}
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
          {importing ? <Spinner /> : 'Import Answer Key'}
        </Button>
      </div>
    </div>
  );
}
