import { useRef, useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';

export function BookUploadForm({ onBookUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    first_content_page: '1',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [errors, setErrors] = useState({});
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    if (file) {
      // Pre-fill title from filename, removing extension
      const fileName = file.name.replace(/\.pdf$/i, '');
      setMetadata(prev => ({ ...prev, title: fileName }));
    }
  }, [file]);

  const validate = () => {
    const newErrors = {};

    // File validation
    if (!file) {
      newErrors.file = 'Please select a file to upload.';
    } else {
      if (file.type !== 'application/pdf') {
        newErrors.file = 'Only PDF files are allowed';
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.file = `File size must be less than 50MB.`;
      }
    }

    // Metadata validation
    if (!metadata.title.trim()) {
      newErrors.title = 'Book title is required.';
    }
    if (!metadata.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }
    if (!metadata.first_content_page || isNaN(parseInt(metadata.first_content_page, 10)) || parseInt(metadata.first_content_page, 10) < 1) {
        newErrors.first_content_page = 'Must be a valid page number (>= 1).';
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
      setErrors({}); // Clear previous errors
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setErrors({}); // Clear previous errors
    setFile(selectedFile);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return Math.round(seconds) + 's';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const handleUpload = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach(error => toast.error(error));
      return;
    }

    setErrors({});
    setUploading(true);
    setUploadProgress(0);
    setUploadSpeed(0);
    setEstimatedTime(0);
    setUploadStartTime(Date.now());

    const handleProgress = (progressData) => {
      const { progress, loaded, total } = progressData;
      setUploadProgress(progress);

      // Calculate upload speed and estimated time
      const elapsedSeconds = (Date.now() - uploadStartTime) / 1000;
      if (elapsedSeconds > 0) {
        const speedBytesPerSecond = loaded / elapsedSeconds;
        setUploadSpeed(speedBytesPerSecond);

        if (speedBytesPerSecond > 0) {
          const remainingBytes = total - loaded;
          const estimatedSeconds = remainingBytes / speedBytesPerSecond;
          setEstimatedTime(estimatedSeconds);
        }
      }
    };

    try {
      await adminAPI.books.upload(file, metadata, handleProgress);

      toast.success(`Book "${metadata.title}" uploaded successfully!`);
      setFile(null);
      setMetadata({ title: '', subject: '', first_content_page: '1' });
      if (onBookUploaded) {
        onBookUploaded();
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadSpeed(0);
      setEstimatedTime(0);
      setUploadStartTime(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setMetadata({ title: '', subject: '', first_content_page: '1' });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload New Book</h2>
      
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${errors.file ? 'border-red-500' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            className="hidden"
          />
          <div className="text-center">
            <p className="text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF only, max 50MB</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                placeholder="Enter book title"
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={metadata.subject}
                onChange={handleMetadataChange}
                placeholder="e.g., Mathematics"
                className={`w-full p-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Content Page
              </label>
              <input
                type="number"
                name="first_content_page"
                value={metadata.first_content_page}
                onChange={handleMetadataChange}
                min="1"
                className={`w-full p-2 border rounded-md ${errors.first_content_page ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.first_content_page && <p className="text-red-500 text-xs mt-1">{errors.first_content_page}</p>}
            </div>
          </div>
        </div>
      ) } uploading ? (
      
        <div className="p-6 border border-green-200 rounded-lg bg-green-50">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Uploading: {file.name}</h3>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-900">Progress</span>
              <span className="text-sm font-bold text-green-900">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Upload Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-gray-600 mb-1">File Size</p>
              <p className="text-sm font-semibold text-gray-900">{formatBytes(file.size)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-gray-600 mb-1">Speed</p>
              <p className="text-sm font-semibold text-gray-900">{formatBytes(uploadSpeed)}/s</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-gray-600 mb-1">Time Remaining</p>
              <p className="text-sm font-semibold text-gray-900">{formatTime(estimatedTime)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="text-sm font-semibold text-gray-900">Uploading...</p>
            </div>
          </div>

          <p className="text-sm text-green-700">Please don't close this window while uploading.</p>
        </div>
      ) : (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
            <Button variant="danger" size="sm" onClick={clearFile} disabled={uploading}>
              Clear
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                placeholder="Enter book title"
                className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={metadata.subject}
                onChange={handleMetadataChange}
                placeholder="e.g., Mathematics"
                className={`w-full p-2 border rounded-md ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Content Page
              </label>
              <input
                type="number"
                name="first_content_page"
                value={metadata.first_content_page}
                onChange={handleMetadataChange}
                min="1"
                className={`w-full p-2 border rounded-md ${errors.first_content_page ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.first_content_page && <p className="text-red-500 text-xs mt-1">{errors.first_content_page}</p>}
            </div>
          </div>

          {/* File Size Info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              File size: <span className="font-semibold">{formatBytes(file.size)}</span>
            </p>
          </div>
        </div>
      )

      {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}

      {!uploading && (
        <div className="mt-6">
          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full"
          >
            Upload and Process Book
          </Button>
        </div>
      )}
    </div>
  );
}
