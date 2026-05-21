import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { UploadCloud, FileText, X, CheckCircle, Clock, Activity, Zap } from 'lucide-react';

export function BookUploadForm({ onBookUploaded, onCancel }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesDragging, setImagesDragging] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    subject: '',
    first_content_page: '1',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

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
    return newErrors;
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragging(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragging(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setErrors(prev => ({ ...prev, images: null }));
      setImages(prev => [...prev, ...files]);
    }
  };

  const handleImageSelect = (e) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      setErrors(prev => ({ ...prev, images: null }));
      setImages(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

    const handleProgress = (progressData) => {
      const { progress } = progressData;
      setUploadProgress(progress);
    };

    try {
      await adminAPI.books.upload(file, metadata, images, handleProgress);
      toast.success(`Book "${metadata.title}" uploaded successfully!`);
      clearFile();
      if (onBookUploaded) onBookUploaded();
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setImages([]);
    setMetadata({ title: '', subject: '', first_content_page: '1' });
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-lg">
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload New Book</h2>
        <p className="text-gray-500 mt-1 text-sm">Add a new textbook or material to the library</p>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${isDragging
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
        <div className="space-y-6">
          {/* File Selected Card */}
          <div className="relative p-4 border border-blue-100 rounded-lg bg-blue-50/30 flex items-center gap-4 group transition-all">
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Book Title</label>
                <input
                  type="text"
                  name="title"
                  value={metadata.title}
                  onChange={handleMetadataChange}
                  placeholder="Enter book title"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.title ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.title}</p>}
              </div>

              {/* Reference Images Upload */}
              <div className="md:col-span-12">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Images (Optional)</label>
                <div
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  onDrop={handleImageDrop}
                  onClick={() => imagesInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    imagesDragging
                      ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={imagesInputRef}
                    onChange={handleImageSelect}
                    accept="image/jpeg,image/png,image/jpg"
                    multiple
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-semibold text-blue-600">Click</span> or drag images
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPEG & PNG files (Max 50MB each)</p>
                </div>

                {/* Selected Images Preview */}
                {images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected Images ({images.length})</p>
                    <div className="space-y-2">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="text-sm text-gray-700 truncate">{img.name}</p>
                          <button
                            onClick={() => removeImage(idx)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Upload Progress State */
            <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Uploading Document</h3>
                  <p className="text-xs text-gray-500 mt-1">Please do not close this window</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}></div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-xl border border-blue-100 min-w-[150px]">
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
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpload}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/20 outline-none flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Book
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
