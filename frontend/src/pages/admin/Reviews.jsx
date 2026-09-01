import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import './Reviews.css';

// admin component to display and manage all customer ratings and reviews
export default function AdminReviews({ reviews, services, handleDeleteReview }) {
  // calculate average rating score
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>Customer Reviews Inbox</h3>
            <p>Real feedback rating and reviews left by clients post-cleaning.</p>
          </div>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#fef3c7', padding: '8px 16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <strong style={{ fontSize: '1.2rem', color: '#92400e' }}>{avgRating}</strong>
                <span style={{ color: '#b45309', fontSize: '0.85rem' }}>/ 5.0</span>
              </div>
              <span style={{ color: '#92400e', fontSize: '0.85rem', fontWeight: 600 }}>({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})</span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="reviews-stack">
            {reviews.map((r) => (
              <div key={r.id || r._id} className="review-card-item">
                <div className="review-header">
                  <div>
                    <span className="review-customer-name">{r.customerName}</span>
                    <span className="review-meta-info">
                      ({services.find(s => s.id === r.serviceType)?.name || r.serviceType})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="review-date-label">{r.date}</span>
                    {handleDeleteReview && (
                      <button
                        onClick={() => handleDeleteReview(r.id || r._id)}
                        className="btn-outline btn-enq-resolve"
                        style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Delete Review"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
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
            <p>No customer reviews are found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
