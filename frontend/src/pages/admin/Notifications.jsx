import React, { useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import '../customer/Notifications.css';

// admin notifications
export default function AdminNotifications({
  notifications = [],
  handleMarkAllRead,
  handleToggleRead,
  handleDeleteNotification
}) {
  // store the selected filter
  const [filter, setFilter] = useState('all');

  // filter notifications based on selected tab
  const filtered = notifications.filter((notif) => {
    // show all notifications
    if (filter === 'all') {
      return true;
    }
    // show unread notifications
    if (filter === 'unread') {
      return !notif.read;
    }
    // show booking notifications
    if (filter === 'booking') {
      return notif.type === 'booking';
    }
    return true;
  });

  return (
    <div className="dashboard-panel">
      {/* notification header actions */}
      <div className="notifications-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {/* filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-toggle-unread ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span>All ({notifications.length})</span>
          </button>
          <button
            className={`btn-toggle-unread ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            <span>Unread ({notifications.filter((n) => !n.read).length})</span>
          </button>
        </div>

        {/* show mark all as read button */}
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-mark-all-read"
          >
            <CheckCheck size={16} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* notification list */}
      <div className="notifications-list-wrapper">
        {/* display filtered notifications */}
        {filtered.length > 0 ? (
          filtered.map((notif) => (
            /* notification card */
            <div key={notif.id} className={`notification-card ${notif.read ? 'read' : 'unread'}`}>
              <div className="notif-content">
                {/* notification title and date */}
                <div className="notif-header">
                  <h4 className="notif-title">{notif.title}</h4>
                  <span className="notif-date">{notif.date}</span>
                </div>
                {/* notification message */}
                <p className="notif-message">{notif.message}</p>
              </div>

              {/* notification action buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* mark notification as read or unread */}
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="btn-toggle-unread"
                  title={notif.read ? 'mark unread' : 'mark read'}
                >
                  {notif.read ? <span>Mark Unread</span> : <span>Mark Read</span>}
                </button>
                {/* delete notification */}
                {handleDeleteNotification && (
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="btn-toggle-unread"
                    style={{ color: '#ef4444' }}
                    title="delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          /* show message when there are no notifications */
          <div className="empty-state-banner">
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
