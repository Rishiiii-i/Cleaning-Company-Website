import React from 'react';
import { Home, Calendar, Clock, CircleCheck, AlertCircle, MapPin, ChevronRight, ArrowRight } from 'lucide-react';
import './Overview.css';

export default function CustomerOverview({ 
  profile, 
  totalBookings, 
  upcomingCount, 
  completedCount, 
  pendingCount, 
  nextBooking, 
  formatDate, 
  setActiveTab,
  getServiceInfo
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
      </div>

      {/* next booking and notification previews */}
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
                  </div>
                </div>
                <div className="next-booking-price">
                  <span>Appointment total</span>
                  <strong>₹{nextBooking.price}</strong>
                </div>
                <button className="next-booking-link" onClick={() => setActiveTab('upcoming')} aria-label="View appointment"><ChevronRight size={20} /></button>
              </div>
            );
          })()
        ) : (
          <div className="empty-state-banner">
            <p>No upcoming cleanings are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
