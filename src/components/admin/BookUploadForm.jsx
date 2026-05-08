import { useRef, useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { UploadCloud, FileText, X, CheckCircle, Clock, Activity, Zap } from 'lucide-react';

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
      const fileName = file.name.replace(/\.pdf$/i, '');
      setMetadata(prev => ({ ...prev, title: fileName }));
    }
  }, [file]);

  const validate = () => {
    const newErrors = {};
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
    if (!metadata.title.trim()) newErrors.title = 'Book title is required.';
    if (!metadata.subject.trim()) newErrors.subject = 'Subject is required.';
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
      setErrors({});
      setFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setErrors({});
    setFile(selectedFile);
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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
      clearFile();
      if (onBookUploaded) onBookUploaded();
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Upload New Book</h2>
        <p className="text-gray-500 mt-2 text-sm">Add a new textbook or material to the library</p>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' 
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
          } ${errors.file ? 'border-red-500 bg-red-50/50' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 text-lg">
              <span className="font-semibold text-blue-600">Click to browse</span> or drag and drop
            </p>
            <p className="text-sm text-gray-400 mt-2">PDF files only (Max 50MB)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* File Selected Card */}
          <div className="relative p-5 border border-blue-100 rounded-2xl bg-blue-50/30 flex items-center gap-4 group transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)}</p>
            </div>
            {!uploading && (
              <button
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors flex-shrink-0"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!uploading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Book Title</label>
                <input
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  placeholder="Enter book title"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.title}</p>}
              </div>
              <div className="md:col-span-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Category</label>
                <input
                  type="text"
                  name="subject"
                  value={metadata.subject}
                  onChange={handleMetadataChange}
                  placeholder="e.g., Mathematics"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                    errors.subject ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.subject}</p>}
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">First Content Page</label>
                <input
                  type="number"
                  name="first_content_page"
                  value={metadata.first_content_page}
                  onChange={handleMetadataChange}
                  min="1"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                    errors.first_content_page ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.first_content_page && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.first_content_page}</p>}
              </div>
            </div>
          ) : (
            /* Upload Progress State */
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Uploading Document</h3>
                  <p className="text-xs text-gray-500 mt-1">Please do not close this window</p>
                </div>
                <span className="text-xl font-bold text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Activity className="w-5 h-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 mb-0.5">Speed</p>
                  <p className="text-sm font-semibold text-gray-900">{formatBytes(uploadSpeed)}/s</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Clock className="w-5 h-5 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
                  <p className="text-sm font-semibold text-gray-900">{formatTime(estimatedTime)}</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Zap className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-xs text-blue-600 mb-0.5">Status</p>
                  <p className="text-sm font-semibold text-blue-700 animate-pulse">Processing</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {errors.file && <p className="text-red-500 text-sm mt-3 text-center">{errors.file}</p>}

      {!uploading && file && (
        <div className="mt-8">
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/20 outline-none flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Book
          </button>
        </div>
      )}
    </div>
  );
}
