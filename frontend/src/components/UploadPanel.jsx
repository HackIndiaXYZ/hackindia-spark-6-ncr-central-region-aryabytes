import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, File, Sparkles, Zap } from 'lucide-react';

export default function UploadPanel({ onUpload, onDemo, isProcessing }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const getFileIcon = (file) => {
    if (!file) return <Upload size={32} />;
    if (file.type.startsWith('image/')) return <Image size={32} />;
    if (file.type === 'application/pdf') return <FileText size={32} />;
    return <File size={32} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-slide-in-left space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Upload size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Upload Document</h2>
          <p className="text-xs text-slate-400">JPG, PNG, or PDF files</p>
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          glass-card cursor-pointer p-6 text-center transition-all duration-300
          border-2 border-dashed
          ${isDragActive ? 'dropzone-active border-indigo-500 bg-indigo-500/10' : 'border-slate-600/50 hover:border-indigo-500/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragActive
              ? 'bg-indigo-500/20 text-indigo-400 scale-110'
              : 'bg-slate-700/50 text-slate-400'
            }
          `}>
            {getFileIcon(selectedFile)}
          </div>
          {isDragActive ? (
            <p className="text-indigo-400 font-medium">Drop your file here...</p>
          ) : (
            <>
              <p className="text-slate-300 font-medium">
                Drag & drop a file here
              </p>
              <p className="text-slate-500 text-sm">
                or click to browse
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="glass-card p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300">Selected File</h3>
            <button
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>

          {preview && (
            <div className="mb-3 rounded-lg overflow-hidden border border-slate-700/50">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-indigo-400">
              {getFileIcon(selectedFile)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={!selectedFile || isProcessing}
        className={`
          w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
          transition-all duration-300
          ${selectedFile && !isProcessing
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0'
            : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
          }
        `}
      >
        {isProcessing ? (
          <>
            <div className="spinner !w-5 !h-5 !border-2" />
            Processing...
          </>
        ) : (
          <>
            <Zap size={18} />
            Process Document
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700/50" />
        <span className="text-xs text-slate-500 font-medium">OR</span>
        <div className="flex-1 h-px bg-slate-700/50" />
      </div>

      {/* Demo Button */}
      <button
        onClick={onDemo}
        disabled={isProcessing}
        className="
          w-full py-3 px-4 rounded-xl font-semibold text-sm
          flex items-center justify-center gap-2
          bg-gradient-to-r from-amber-500/10 to-orange-500/10
          border border-amber-500/20 text-amber-400
          hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20
          hover:border-amber-500/40
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <Sparkles size={18} />
        Try Sample Document
      </button>
    </div>
  );
}
