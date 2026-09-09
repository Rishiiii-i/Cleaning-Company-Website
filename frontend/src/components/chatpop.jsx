import React, { useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import './popup.css';

// chat popup
export default function ChatPop({ popup, onClose, onOpen }) {
  useEffect(() => {
    if (!popup) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [popup, onClose]);

  if (!popup) return null;

  const handleClick = () => {
    if (typeof onOpen === 'function') {
      onOpen();
    }
  };

  return (
    <div
      className="notify-popup-card"
      role="alert"
      style={{ cursor: 'pointer', zIndex: 100001 }}
      onClick={handleClick}
    >
      <div className="notify-popup-icon" style={{ color: '#38bdf8' }}>
        <MessageSquare size={18} />
      </div>
      <div className="notify-popup-body">
        <h5 className="notify-popup-title">{popup.title || 'New message'}</h5>
        <p className="notify-popup-message">{popup.message}</p>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          Click to reply • {popup.time || 'Just now'}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="notify-popup-close"
        aria-label="close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
