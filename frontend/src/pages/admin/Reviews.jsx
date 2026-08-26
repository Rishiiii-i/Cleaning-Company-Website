import React from 'react';
import { Star } from 'lucide-react';
import './Reviews.css';

export default function AdminReviews({ reviews, services }) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Customer Reviews Inbox</h3>
          <p>Real feedback rating and reviews left by clients post-cleaning.</p>
        </div>

        {reviews.length > 0 ? (
          <div className="reviews-stack">
            {reviews.map(r => (
              <div key={r.id} className="review-card-item">
                <div className="review-header">
                  <div>
                    <span className="review-customer-name">{r.customerName}</span>
                    <span className="review-meta-info">
                      ({services.find(s => s.id === r.serviceType)?.name || r.serviceType})
                    </span>
                  </div>
                  <span className="review-date-label">{r.date}</span>
                </div>
                <div className="review-stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      fill={star <= r.rating ? '#fbbf24' : 'none'} 
                      color={star <= r.rating ? '#fbbf24' : '#cbd5e1'} 
                    />
                  ))}
                </div>
                <p className="review-comment-text">"{r.comment}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No reviews are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
