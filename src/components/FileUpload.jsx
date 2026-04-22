import { useState, useRef } from 'react';

export default function FileUpload({ onDataLoaded, datasetLabel }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        setError('JSON must be an array of listening records');
        return;
      }

      setFileName(file.name);
      setError(null);
      onDataLoaded(data, file.name);
    } catch (e) {
      setError('Failed to parse JSON: ' + e.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`file-upload ${isDragging ? 'dragging' : ''} ${fileName ? 'loaded' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <div className="upload-content">
        <div className="upload-icon">{fileName ? '✓' : '📁'}</div>
        <div className="upload-label">{datasetLabel}</div>
        {fileName ? (
          <div className="file-name">{fileName}</div>
        ) : (
          <div className="upload-hint">Drop JSON file here or click to browse</div>
        )}
        {error && <div className="upload-error">{error}</div>}
      </div>
    </div>
  );
}
