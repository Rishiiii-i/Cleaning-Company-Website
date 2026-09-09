import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './imgview.css';

// image preview
export default function ImgView({ src, name, isOpen, onClose }) {
  // close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div className="imgview-backdrop" onClick={onClose} role="dialog" aria-label="image preview">
      <div className="imgview-container" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="imgview-close-btn"
          onClick={onClose}
          title="close preview"
        >
          <X size={20} />
        </button>
        <div className="imgview-body">
          <img src={src} alt={name || 'preview'} className="imgview-image" />
        </div>
      </div>
    </div>
  );
}
