import React from 'react';
import { TrendingUp, Users, Calendar, Clock, Check } from 'lucide-react';
import './Overview.css';

export default function AdminOverview({
  customers,
  bookings,
  todaysBookingsCount,
  pendingCount,
  completedCount,
  totalRevenue,
  setActiveTab
}) {
  return (
    <div className="dashboard-panel">
      <div className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-kicker">Operations Control Panel</span>
          <h2>Welcome back, Administrator.</h2>
          <p>Real-time overview of business cleanings, assigned staff, monthly revenues, and enquiries.</p>
        </div>
        <div className="welcome-orb" aria-hidden="true">
          <TrendingUp size={42} />
        </div>
      </div>

      {/* dashboard KPI cards */}
      <div className="stats-grid">
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-green">
            <Users size={19} />
          </span>
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{customers.length}</span>
          <span className="stat-hint">registered clients</span>
        </div>
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-blue">
            <Calendar size={19} />
          </span>
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{bookings.length}</span>
          <span className="stat-hint">lifetime orders</span>
        </div>
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-amber">
            <Clock size={19} />
          </span>
          <span className="stat-label">Today's Bookings</span>
          <span className="stat-value">{todaysBookingsCount}</span>
          <span className="stat-hint">scheduled for today</span>
        </div>
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-purple">
            <Clock size={19} />
          </span>
          <span className="stat-label">Pending Bookings</span>
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-hint">awaiting completion</span>
        </div>
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-green">
            <Check size={19} fill="none" />
          </span>
          <span className="stat-label">Completed Bookings</span>
          <span className="stat-value">{completedCount}</span>
          <span className="stat-hint">successful jobs</span>
        </div>
        <div className="stat-item-card">
          <span className="stat-icon stat-icon-rupee">
            ₹
          </span>
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">₹{totalRevenue}</span>
          <span className="stat-hint">completed payouts</span>
        </div>
      </div>

      {/* quick summaries table */}
      <div className="reports-section-card mt-12">
        <h3>Recent Bookings Log</h3>
        <p>Latest cleanings requiring staff dispatchments or status confirmations.</p>
        {bookings.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-data-table simple-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Service Category</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 3).map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong></td>
                    <td>{b.customerName}</td>
                    <td className="capitalize-text">{b.serviceType}</td>
                    <td><strong>₹{b.price}</strong></td>
                    <td>
                      <span className={`staff-status-tag ${b.status}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No bookings are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
