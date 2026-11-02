import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../utils/statusHelper';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB matching backend limit

const PdfDropzone = ({
  file,
  onFileSelected,
  onClearFile,
  isLoading = false,
  error = '',
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [clientError, setClientError] = useState('');
  const fileInputRef = useRef(null);

  const validateAndSelect = useCallback((candidateFile) => {
    setClientError('');

    if (!candidateFile) return;

    const fileNameLower = candidateFile.name.toLowerCase();
    const isPdf = fileNameLower.endsWith('.pdf') || candidateFile.type === 'application/pdf';

    if (!isPdf) {
      setClientError('Invalid file type: Only PDF documents (.pdf) are supported. Please select a valid lab report.');
      return;
    }

    if (candidateFile.size > MAX_FILE_SIZE) {
      setClientError(`File is too large (${formatFileSize(candidateFile.size)}). The maximum allowed size is 10MB.`);
      return;
    }

    if (candidateFile.size === 0) {
      setClientError('The selected PDF file is empty (0 bytes). Please choose a valid report document.');
      return;
    }

    onFileSelected(candidateFile);
  }, [onFileSelected]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
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

    if (disabled || isLoading) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setClientError('Single file upload only. Please drop one PDF report at a time.');
      return;
    }

    validateAndSelect(files[0]);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelect(files[0]);
    }
    // Reset file input value so re-uploading the same file works if needed
    e.target.value = '';
  };

  const handleClickBrowse = () => {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled || isLoading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const displayError = clientError || error;

  return (
    <div className="pdf-dropzone-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        disabled={disabled || isLoading}
        aria-hidden="true"
        id="pdf-file-upload-input"
      />

      {file ? (
        /* Selected File Chip Container */
        <div className="dropzone-file-chip-card">
          <div className="file-chip-details">
            <div className="file-chip-icon">
              <FileText size={24} className="text-primary" />
            </div>
            <div className="file-chip-meta">
              <div className="file-chip-name" title={file.name}>
                {file.name}
              </div>
              <div className="file-chip-size">
                {formatFileSize(file.size)} &bull; PDF Document
              </div>
            </div>
          </div>

          <div className="file-chip-actions">
            {isLoading ? (
              <div className="file-chip-loading">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span>Extracting biomarkers...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClearFile}
                className="btn btn-secondary btn-sm file-chip-remove-btn"
                title="Remove file and choose another"
                aria-label="Remove uploaded PDF file"
              >
                <X size={16} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Interactive Drag-and-Drop Area */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClickBrowse}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`dropzone-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          aria-label="Click or drag and drop your blood report PDF here to automatically extract biomarkers"
        >
          <div className="dropzone-icon-circle">
            <UploadCloud size={32} />
          </div>

          <div className="dropzone-text-block">
            <p className="dropzone-primary-text">
              <span className="dropzone-link-text">Click to browse</span> or drag and drop your lab report
            </p>
            <p className="dropzone-sub-text">
              Supported format: Single PDF document up to 10MB
            </p>
          </div>
        </div>
      )}

      {displayError && (
        <div className="dropzone-error-alert" role="alert">
          <AlertCircle size={16} className="text-danger flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
};

export default PdfDropzone;
