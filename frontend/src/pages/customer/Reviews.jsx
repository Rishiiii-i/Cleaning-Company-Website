import React from 'react';
import { Star } from 'lucide-react';
import './Reviews.css';

export default function CustomerReviews({
  bookings,
  getServiceInfo,
  setActiveReviewId
}) {
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="dashboard-panel">
      <div className="bookings-list-cards">
        {completedBookings.length > 0 ? (
          completedBookings.map((booking) => {
            const info = getServiceInfo(booking.serviceType);
            return (
              <div key={booking.id} className="history-booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <span className="booking-id-tag">ID: {booking.id}</span>
                    <span className="status-badge-indicator completed">completed</span>
                  </div>
                  <h4 className="service-name-label">{info.name} ({booking.date})</h4>

                  {booking.rating ? (
                    <div className="completed-review-display">
                      <div className="review-stars-row">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < booking.rating ? '#fbbf24' : 'none'}
                            color={i < booking.rating ? '#fbbf24' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                      <p className="review-text-italic">"{booking.review || 'no feedback written.'}"</p>
                      <button
                        onClick={() => setActiveReviewId(booking.id)}
                        className="btn btn-secondary btn-small btn-rating-trigger"
                      >
                        <Star size={14} />
                        <span>Edit Review</span>
                      </button>
                    </div>
                  ) : (
                    <div className="unreviewed-state-row">
                      <p className="unreviewed-label">this service is not reviewed yet.</p>
                      <button
                        onClick={() => setActiveReviewId(booking.id)}
                        className="btn btn-secondary btn-small btn-rating-trigger"
                      >
                        <Star size={14} />
                        <span>Leave Rating</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state-banner">
            <p>No completed services found yet. Once a cleaning is completed, you can leave your rating and review here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
