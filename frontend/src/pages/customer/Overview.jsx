import React from 'react';
import { Home, Calendar, Clock, CircleCheck, AlertCircle, MapPin, ChevronRight, ArrowRight, Bell } from 'lucide-react';
// import staff user icon
import { User as StaffIcon } from 'lucide-react';
import './Overview.css';
import './Notifications.css';

export default function CustomerOverview({
  profile,
  totalBookings,
  upcomingCount,
  completedCount,
  pendingCount,
  nextBooking,
  formatDate,
  setActiveTab,
  getServiceInfo,
  notifications = []
}) {
  return (
    <div className="dashboard-panel">
      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker">Your home, beautifully cared for</span>
          <h2>Welcome back, {profile.name ? profile.name.split(' ')[0] : 'Client'}.</h2>
          <p>Everything you need to manage upcoming visits, payments, and preferences in one place.</p>
          <div className="welcome-actions">
            <button className="welcome-primary-action" onClick={() => setActiveTab('bookings')}>
              Schedule a cleaning <ArrowRight size={17} />
            </button>
            <button className="welcome-secondary-action" onClick={() => setActiveTab('upcoming')}>
              View upcoming visits
            </button>
          </div>
        </div>
        <div className="welcome-orb" aria-hidden="true"><Home size={42} /></div>
      </div>

      {/* dashboard grid cards matching totals */}
      <div className="stats-grid">
        <div className="stat-item-card stat-bookings">
          <span className="stat-icon"><Calendar size={19} /></span>
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{totalBookings}</span>
          <span className="stat-hint">registered visits</span>
        </div>
        <div className="stat-item-card stat-upcoming">
          <span className="stat-icon"><Clock size={19} /></span>
          <span className="stat-label">Upcoming</span>
          <span className="stat-value">{upcomingCount}</span>
          <span className="stat-hint">cleanings scheduled</span>
        </div>
        <div className="stat-item-card stat-completed">
          <span className="stat-icon"><CircleCheck size={19} /></span>
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedCount}</span>
          <span className="stat-hint">spotless homes</span>
        </div>
        <div className="stat-item-card stat-pending">
          <span className="stat-icon"><AlertCircle size={19} /></span>
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-hint">awaiting confirmations</span>
        </div>
        <div
          className="stat-item-card stat-notifications"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const el = document.getElementById('customer-overview-notifications');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else if (setActiveTab) {
              setActiveTab('notifications');
            }
          }}
        >
          <span className="stat-icon"><Bell size={19} /></span>
          <span className="stat-label">Notifications</span>
          <span className="stat-value">{notifications.length}</span>
          <span className="stat-hint">{notifications.filter(n => !n.read).length} unread alerts</span>
        </div>
      </div>

      {/* next booking */}
      <div className="recent-activity-section">
        <h3>Upcoming Visits</h3>
        {nextBooking ? (
          (() => {
            const info = getServiceInfo(nextBooking.serviceType);
            return (
              <div className="next-booking-card">
                <div className="next-booking-info">
                  <h4>{info.name}</h4>
                  <div className="info-meta">
                    <span className="meta-tag"><Calendar size={14} /> {formatDate(nextBooking.date)}</span>
                    <span className="meta-tag"><Clock size={14} /> {nextBooking.time}</span>
                    <span className="meta-tag"><MapPin size={14} /> {nextBooking.address}</span>
                    {nextBooking.assignedStaff && (
                      <span className="meta-tag" style={{ color: '#0369a1', fontWeight: 600 }}>
                        <StaffIcon size={14} /> Staff: {nextBooking.assignedStaff}
                      </span>
                    )}
                  </div>
                </div>
                <div className="next-booking-price">
                  <span>Appointment total</span>
                  <strong>₹{nextBooking.price}</strong>
                </div>
                <button className="next-booking-link" onClick={() => setActiveTab('upcoming')} aria-label="View appointment">
                  <ChevronRight size={20} />
                </button>
              </div>
            );
          })()
        ) : (
          <div className="empty-state-banner">
            <p>No upcoming cleanings are found.</p>
          </div>
        )}
      </div>

      {/* Notifications Card Preview in Customer Overview */}
      <div id="customer-overview-notifications" className="recent-activity-section" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#0284c7" />
            Recent Notifications
          </h3>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab('notifications')}
              className="btn-mark-all-read"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              <span>View All Notifications ({notifications.length})</span>
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="notifications-list-wrapper">
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.id || notif._id} className={`notification-card ${notif.read ? 'read' : 'unread'}`}>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4 className="notif-title">{notif.title}</h4>
                    <span className="notif-date">{notif.date}</span>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                </div>
                <span className={`staff-status-tag ${notif.read ? 'completed' : 'pending'}`}>
                  {notif.read ? 'Read' : 'New'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
