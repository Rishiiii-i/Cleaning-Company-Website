import React from 'react';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
import './History.css';

export default function CustomerHistory({
  bookings,
  getServiceInfo,
  setActiveReviewId,
  formatDate
}) {
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="dashboard-panel">
      <div className="bookings-list-cards">
        {historyBookings.length > 0 ? (
          historyBookings.map((booking) => {
            const info = getServiceInfo(booking.serviceType);
            return (
              <div key={booking.id} className="history-booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <span className="booking-id-tag">ID: {booking.id}</span>
                    <span className={`status-badge-indicator ${booking.status}`}>{booking.status}</span>
                  </div>
                  <h4 className="service-name-label">{info.name}</h4>
                  <div className="booking-card-meta">
                    <span><Calendar size={14} /> {formatDate(booking.date)}</span>
                    <span><Clock size={14} /> {booking.time}</span>
                    <span><MapPin size={14} /> {booking.address}</span>
                  </div>
                </div>

                <div className="booking-card-sidebar">
                  <div className="booking-card-price">
                    <span>Fee</span>
                    <strong>₹{booking.price}</strong>
                  </div>
                  {booking.status === 'completed' && !booking.rating && (
                    <button
                      onClick={() => setActiveReviewId(booking.id)}
                      className="btn btn-secondary btn-small"
                    >
                      <Star size={14} />
                      <span>Rate Clean</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state-banner">
            <p>No history logs are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
