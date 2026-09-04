import React, { useState, useEffect } from 'react';
import { startSession, updateActivity, isSessionExpired, autoLogout } from '../utils/session';
import './session.css';

export default function Session() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('session_expired') === 'true') {
      setShowAlert(true);
      sessionStorage.removeItem('session_expired');
      const hideTimer = setTimeout(() => {
        setShowAlert(false);
      }, 6000);
      return () => clearTimeout(hideTimer);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      const start = localStorage.getItem('session_start');

      if (!token && start) {
        localStorage.removeItem('session_start');
        localStorage.removeItem('session_active');
      }

      if (token && !start) {
        startSession();
      }

      if (isSessionExpired()) {
        autoLogout();
      }
    }, 1000);

    let lastMove = 0;
    const handleAction = () => {
      const now = Date.now();
      if (now - lastMove > 10000) {
        lastMove = now;
        updateActivity();
      }
    };

    window.addEventListener('mousemove', handleAction);
    window.addEventListener('keydown', handleAction);
    window.addEventListener('click', handleAction);
    window.addEventListener('scroll', handleAction);

    const handleStorage = (e) => {
      if (e.key === 'token' && e.newValue) {
        startSession();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleAction);
      window.removeEventListener('keydown', handleAction);
      window.removeEventListener('click', handleAction);
      window.removeEventListener('scroll', handleAction);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleClose = () => {
    setShowAlert(false);
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="session-alert-banner" role="alert">
      <span className="session-alert-text">
        your session has expired after 1 hour. please log in again.
      </span>
      <button
        type="button"
        className="session-alert-close"
        onClick={handleClose}
        aria-label="close alert"
      >
        ×
      </button>
    </div>
  );
}
