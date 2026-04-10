import { useRef, useState } from 'react';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Spinner } from '../shared/Spinner';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.api.js';

export function AnswerKeyImportForm({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showMapping, setShowMapping] = useState(false);
  const [errors, setErrors] = useState({});
  const [columnMapping, setColumnMapping] = useState({
    examTitle: 0,
    questionNumber: 1,
    correctAnswer: 2,
  });
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
  const availableColumns = ['Exam Title', 'Question Number', 'Correct Answer', 'Explanation', 'Difficulty'];

  const validateFile = (file) => {
    const newErrors = {};

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!VALID_EXTENSIONS.includes(fileExtension)) {
      newErrors.fileType = 'Only Excel (.xlsx, .xls) and CSV files are supported';
      return newErrors;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      newErrors.fileSize = `File size must be less than 10MB (actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
      return newErrors;
    }

    return newErrors;
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationErrors = validateFile(selectedFile);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFile(null);
      setPreview(null);
      Object.values(validationErrors).forEach((error) => toast.error(error));
      return;
    }

    setErrors({});
    setFile(selectedFile);
    
    // Simulate reading file preview
    const mockPreview = [
      { examTitle: 'Mathematics Final Exam', questionNumber: 1, correctAnswer: 'B' },
      { examTitle: 'Mathematics Final Exam', questionNumber: 2, correctAnswer: 'A' },
      { examTitle: 'Mathematics Final Exam', questionNumber: 3, correctAnswer: 'D' },
    ];
    setPreview(mockPreview);
    setShowMapping(true);
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
      handleFileSelect({ target: { files } });
    }
  };

  const handleImport = async () => {
    if (!file) {
      setErrors({ file: 'Please select a file' });
      toast.error('Please select a file');
      return;
    }

    const validationErrors = validateFile(file);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((error) => toast.error(error));
      return;
    }

    setErrors({});
    setImporting(true);
    
    try {
      const response = await adminAPI.answerKeys.import(file);
      
      toast.success(`✅ Imported ${response.successCount || 0} answer keys successfully`);
      
      if (response.errors && response.errors.length > 0) {
        toast.error(`⚠️ ${response.errors.length} rows had validation errors`);
      }

      setFile(null);
      setPreview(null);
      setShowMapping(false);
      onImportSuccess?.();
    } catch (error) {
      const errorMessage = error.message || 'Import failed';
      setErrors({ import: errorMessage });
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Answer Keys</h2>

        {/* Inline Validation Errors */}
        {(errors.fileType || errors.fileSize) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900">Validation Error</p>
            {errors.fileType && <p className="text-sm text-red-700 mt-1">• {errors.fileType}</p>}
            {errors.fileSize && <p className="text-sm text-red-700 mt-1">• {errors.fileSize}</p>}
          </div>
        )}

        {/* File Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            errors.fileType || errors.fileSize
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>

          <p className="text-gray-600 mb-2">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="text-sm text-gray-500 mb-4">Excel (.xlsx, .xls) or CSV • Max 10MB</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Select File
          </Button>
        </div>

        {/* Selected File Info */}
        {file && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              📄 {file.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Import Error */}
        {errors.import && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900">Import Error</p>
            <p className="text-sm text-red-700 mt-1">{errors.import}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFile(null);
              setPreview(null);
              setShowMapping(false);
              setErrors({});
            }}
            disabled={!file}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setShowMapping(true)}
            disabled={!file}
          >
            Configure & Preview
          </Button>
        </div>
      </div>

      {/* Column Mapping Modal */}
      <Modal
        isOpen={showMapping && !!preview}
        title="Configure Column Mapping"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowMapping(false)}
              disabled={importing}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Confirm & Import'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Column Mapping */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Map Columns</h3>
            {Object.entries(columnMapping).map(([key, colIndex]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-32 text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}:
                </label>
                <select
                  value={colIndex}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, [key]: parseInt(e.target.value) })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {availableColumns.map((col, idx) => (
                    <option key={idx} value={idx}>
                      Column {idx + 1}: {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Preview (First {Math.min(3, preview?.length || 0)} rows)</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Exam</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Q#</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {preview?.slice(0, 3).map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 truncate">{row.examTitle}</td>
                      <td className="px-4 py-2">{row.questionNumber}</td>
                      <td className="px-4 py-2 font-semibold">{row.correctAnswer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Total rows to import: {preview?.length || 0}
            </p>
          </div>

          {/* Loading State */}
          {importing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Spinner size="sm" />
              <span className="text-gray-600">Importing answer keys...</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
