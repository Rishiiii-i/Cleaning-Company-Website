import React from 'react';
import './Notifications.css';

export default function CustomerNotifications({
  notifications,
  handleMarkAllRead,
  handleToggleRead
}) {
  return (
    <div className="dashboard-panel">
      <div className="notifications-header-actions">
        <button
          onClick={handleMarkAllRead}
          className="btn-mark-all-read"
        >
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="notifications-list-wrapper">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`notification-card ${notif.read ? 'read' : 'unread'}`}>
              <div className="notif-content">
                <div className="notif-header">
                  <h4 className="notif-title">{notif.title}</h4>
                  <span className="notif-date">{notif.date}</span>
                </div>
                <p className="notif-message">{notif.message}</p>
              </div>

              <button
                onClick={() => handleToggleRead(notif.id)}
                className="btn-toggle-unread"
              >
                {notif.read ? <span>Mark Unread</span> : <span>Mark Read</span>}
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state-banner">
            <p>No notifications are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
