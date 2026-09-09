import React, { useState, useRef } from 'react';
import { X, FileText, Download, Upload, Folder, Eye } from 'lucide-react';
import { formatFileSize, isImageFile, downloadChatFile, uploadChatFile, openFilePreview } from '../utils/filestore';
import ImgView from './imgview';
import './chatfile.css';

// chat files
export default function ChatFile({ isOpen, onClose, files = [], onFileUploaded, chatId, role }) {
  const [filterType, setFilterType] = useState('all');
  const [activePreview, setActivePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // filter files
  const filteredFiles = files.filter((f) => {
    if (filterType === 'images') {
      return isImageFile(f.type, f.url);
    }
    if (filterType === 'docs') {
      return !isImageFile(f.type, f.url);
    }
    return true;
  });

  // upload file
  const handleUploadChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const stored = await uploadChatFile(file, {
        chatId: chatId || 'default',
        senderRole: role || 'user',
        folder: role === 'admin' ? 'admin' : 'customer'
      });

      if (stored && typeof onFileUploaded === 'function') {
        onFileUploaded(stored);
      }
    } catch (err) {
      console.warn('file upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <aside className="chatfile-drawer" role="dialog" aria-label="chat files">
        <div className="chatfile-header">
          <div className="chatfile-title-wrap">
            <Folder size={18} color="#38bdf8" />
            <h4 className="chatfile-title">Chat files</h4>
            <span className="chatfile-count-badge">{files.length}</span>
          </div>
          <button
            type="button"
            className="chatfile-close-btn"
            onClick={onClose}
            aria-label="close files"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chatfile-tabs">
          <button
            type="button"
            className={`chatfile-tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All ({files.length})
          </button>
          <button
            type="button"
            className={`chatfile-tab-btn ${filterType === 'images' ? 'active' : ''}`}
            onClick={() => setFilterType('images')}
          >
            Images ({files.filter((f) => isImageFile(f.type, f.url)).length})
          </button>
          <button
            type="button"
            className={`chatfile-tab-btn ${filterType === 'docs' ? 'active' : ''}`}
            onClick={() => setFilterType('docs')}
          >
            Docs ({files.filter((f) => !isImageFile(f.type, f.url)).length})
          </button>
        </div>

        <div className="chatfile-body">
          {filteredFiles.length === 0 ? (
            <div className="chatfile-empty">
              <Folder size={32} color="#475569" />
              <span>no files in this chat yet</span>
            </div>
          ) : (
            filteredFiles.map((file, idx) => {
              const isImg = isImageFile(file.type, file.url);
              return (
                <div key={file.id || idx} className="chatfile-card">
                  <div
                    className={`chatfile-thumb-box ${isImg ? 'clickable' : ''}`}
                    onClick={() => isImg && setActivePreview(file)}
                    title={isImg ? 'click to preview image' : 'file'}
                  >
                    {isImg ? (
                      <img src={file.url} alt={file.name} className="chatfile-thumb-img" />
                    ) : (
                      <FileText size={20} color="#38bdf8" />
                    )}
                  </div>
                  <div
                    className="chatfile-info"
                    onClick={() => isImg && setActivePreview(file)}
                    style={{ cursor: isImg ? 'pointer' : 'default' }}
                  >
                    <p className="chatfile-name" title={file.name}>
                      {file.name}
                    </p>
                    <p className="chatfile-sub">
                      {formatFileSize(file.size)} • {file.time || 'recent'}
                    </p>
                  </div>
                  <div className="chatfile-actions">
                    <button
                      type="button"
                      className="chatfile-act-btn"
                      onClick={() => (isImg ? setActivePreview(file) : openFilePreview(file.url, file.name))}
                      title={isImg ? 'preview image' : 'open file'}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      className="chatfile-act-btn"
                      onClick={() => downloadChatFile(file.url, file.name)}
                      title="download file"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="chatfile-footer">
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleUploadChange}
          />
          <button
            type="button"
            className="chatfile-upload-btn"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            <span>{isUploading ? 'uploading...' : 'upload to chat'}</span>
          </button>
        </div>
      </aside>

      <ImgView
        isOpen={!!activePreview}
        src={activePreview?.url}
        name={activePreview?.name}
        size={activePreview?.size}
        onClose={() => setActivePreview(null)}
      />
    </>
  );
}
