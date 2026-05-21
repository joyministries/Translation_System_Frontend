import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api/admin.jsx';
import { UploadCloud, FileText, X, CheckCircle, Zap, Search, ChevronDown } from 'lucide-react';

export function ReferenceUploadForm({ onReferenceUploaded, onCancel }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [loadingBooks, setLoadingBooks] = useState(true);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        const res = await adminAPI.books.list(1, 1000);
        let booksData = [];
        if (res.data?.items) {
          booksData = res.data.items;
        } else if (res.data && Array.isArray(res.data)) {
          booksData = res.data;
        } else if (res.books) {
          booksData = res.books;
        } else if (Array.isArray(res)) {
          booksData = res;
        }
        setBooks(Array.isArray(booksData) ? booksData : []);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        toast.error('Failed to load books');
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBook = books.find(b => b.id === parseInt(selectedBookId));

  const validate = () => {
    const newErrors = {};
    if (!selectedBookId) {
      newErrors.book = 'Please select a book.';
    }
    if (files.length === 0) {
      newErrors.files = 'Please select at least one image file.';
    } else {
      files.forEach((file, index) => {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
          newErrors[`file_${index}`] = 'Only JPEG and PNG files are allowed';
        }
        if (file.size > MAX_FILE_SIZE) {
          newErrors[`file_${index}`] = `File size must be less than 50MB.`;
        }
      });
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setErrors({});
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length > 0) {
      setErrors({});
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
      Object.values(validationErrors).forEach(error => {
        if (typeof error === 'string') toast.error(error);
      });
      return;
    }

    setErrors({});
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload images using the API
      await adminAPI.books.uploadReferences(selectedBookId, files, (progress) => {
        setUploadProgress(progress.progress);
      });

      setUploadProgress(100);
      toast.success(`${files.length} image(s) uploaded successfully!`);
      clearFiles();
      if (onReferenceUploaded) onReferenceUploaded();
    } catch (error) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-lg">
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Book References</h2>
        <p className="text-gray-500 mt-1 text-sm">Add reference images to a book in the library</p>
      </div>

      {/* Book Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loadingBooks}
            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
              errors.book ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
            } ${selectedBookId ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <span>
              {loadingBooks
                ? 'Loading books...'
                : selectedBook
                ? selectedBook.title
                : 'Choose a book...'}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Books List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        setSelectedBookId(book.id.toString());
                        setShowDropdown(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group ${
                        selectedBookId === book.id.toString()
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{book.title}</span>
                      {selectedBookId === book.id.toString() && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No books found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {errors.book && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.book}</p>}
      </div>

      {/* File Upload Section */}
      {!uploading ? (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
            } ${errors.files ? 'border-red-500 bg-red-50/50' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/jpg"
              multiple
              className="hidden"
            />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 text-lg">
                <span className="font-semibold text-blue-600">Click to browse</span> or drag and drop
              </p>
              <p className="text-sm text-gray-400 mt-2">JPEG and PNG files only (Max 50MB each)</p>
            </div>
          </div>

          {errors.files && (
            <p className="text-red-500 text-xs mt-3 text-center">{errors.files}</p>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative p-3 border border-blue-100 rounded-lg bg-blue-50/30 flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors flex-shrink-0"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-500/20 outline-none flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-5 h-5" />
                Upload {files.length} Image{files.length !== 1 ? 's' : ''}
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
        </>
      ) : (
        /* Upload Progress State */
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-4">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Uploading Images</h3>
              <p className="text-xs text-gray-500 mt-1">Please do not close this window</p>
            </div>
            <span className="text-lg font-bold text-blue-600">{Math.round(uploadProgress)}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${uploadProgress}%` }}
            >
              <div
                className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                }}
              ></div>
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
  );
}
