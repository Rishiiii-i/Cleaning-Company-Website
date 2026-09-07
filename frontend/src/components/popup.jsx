import React, { useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import './popup.css';

// component to show popup notification alert
export default function Popup({ popup, onClose }) {
  // auto close popup after five seconds
  useEffect(() => {
    if (!popup) {
      return;
    }
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [popup, onClose]);

  // do not render if no popup is active
  if (!popup) {
    return null;
  }

  return (
    <div className="notify-popup-card" role="alert">
      <div className="notify-popup-icon">
        <Bell size={18} />
      </div>
      <div className="notify-popup-body">
        <h5 className="notify-popup-title">{popup.title || 'New Notification'}</h5>
        <p className="notify-popup-message">{popup.message}</p>
      </div>
      <button
        onClick={onClose}
        className="notify-popup-close"
        aria-label="close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
