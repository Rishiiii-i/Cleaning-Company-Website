import React from 'react';
import { Star, Quote } from 'lucide-react';
import './Reviews.css';

export default function Reviews() {
  // list of client feedback reviews
  const reviewList = [
    {
      name: 'Rishi',
      role: 'Homeowner',
      rating: 5,
      comment: 'The GlowHome team has been cleaning my house for six months. They are always on time, professional, and do a great job. I highly recommend their deep cleaning service.',
      tag: 'Home Cleaning'
    },
    {
      name: 'Dileep',
      role: 'Office Manager',
      rating: 5,
      comment: 'The office cleaning service is excellent. They work according to our schedule, and our office looks clean every morning. Great service!',
      tag: 'Office Cleaning'
    },
    {
      name: 'Kavya',
      role: 'Apartment Tenant',
      rating: 5,
      comment: 'I used their move-out cleaning service and got my full security deposit back. The kitchen and bathroom looked almost new.',
      tag: 'Move-Out Cleaning'
    }
  ];

  return (
    <section id="reviews" className="reviews-section">
      <div className="section-header">
        <span className="section-badge">Reviews</span>
        <h2>What Our Customers Say</h2>
        <p>Read what our customers think about our cleaning services.</p>
      </div>

      <div className="reviews-grid">
        {reviewList.map((review, index) => (
          <div key={index} className="review-card">
            <Quote className="quote-icon" />
            <div className="review-stars">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} size={16} className="star-icon" fill="currentColor" />
              ))}
            </div>
            <p className="review-comment">"{review.comment}"</p>
            <div className="review-footer">
              <div className="review-info">
                <h4>{review.name}</h4>
                <span>{review.role}</span>
              </div>
              <span className="review-tag">{review.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
