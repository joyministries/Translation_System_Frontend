import { useRef, useState } from 'react';
import { Button } from '../shared/Button';
import { Spinner } from '../shared/Spinner';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.api.js';

export function BookUploadForm({ onBookUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    const newErrors = {};

    // Check file type
    if (file.type !== 'application/pdf') {
      newErrors.fileType = 'Only PDF files are allowed';
      return newErrors;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      newErrors.fileSize = `File size must be less than 50MB (actual: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
      return newErrors;
    }

    return newErrors;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      const validationErrors = validateFile(droppedFile);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setFile(null);
        Object.values(validationErrors).forEach((error) => toast.error(error));
      } else {
        setErrors({});
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validationErrors = validateFile(selectedFile);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFile(null);
      Object.values(validationErrors).forEach((error) => toast.error(error));
    } else {
      setErrors({});
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    // Final validation before submission
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
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await adminAPI.books.upload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Book uploaded successfully!');
      setFile(null);
      setUploadProgress(0);

      // Notify parent to refresh the book list
      onBookUploaded?.();
    } catch (error) {
      const errorMessage = error.message || 'Upload failed';
      setErrors({ upload: errorMessage });
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload a Book</h2>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary'
        } ${errors.fileType || errors.fileSize ? 'border-red-300 bg-red-50' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <svg
          className="w-12 h-12 mx-auto text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="text-gray-600 mb-2">
          <strong>Click to upload</strong> or drag and drop
        </p>
        <p className="text-sm text-gray-500">PDF only • Max 50MB</p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4"
        >
          Select File
        </Button>
      </div>

      {/* Inline Error Messages */}
      {(errors.fileType || errors.fileSize) && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900">Validation Error</p>
          {errors.fileType && <p className="text-sm text-red-700 mt-1">• {errors.fileType}</p>}
          {errors.fileSize && <p className="text-sm text-red-700 mt-1">• {errors.fileSize}</p>}
        </div>
      )}

      {/* File Info */}
      {file && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setErrors({});
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Remove file"
            >
              ✕
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Spinner size="sm" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Server Error */}
      {errors.upload && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-900">Upload Error</p>
          <p className="text-sm text-red-700 mt-1">{errors.upload}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="mt-6 flex gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setFile(null);
            setErrors({});
          }}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Book'}
        </Button>
      </div>
    </div>
  );
}
