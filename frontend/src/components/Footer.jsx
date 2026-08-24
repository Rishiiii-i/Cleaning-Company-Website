import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const handleHomeClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-info">
          <h3>GlowHome</h3>
          <p>We provide professional home and office cleaning services with a focus on quality and customer satisfaction.</p>
        </div>
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <ul>
            <li><Phone size={14} /> <span>9876543210</span></li>
            <li><Mail size={14} /> <span>rishi@gmail.com</span></li>
            <li><MapPin size={14} /> <span>Eluru, Andhra Pradesh</span></li>
          </ul>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><Link to="/signup">Book Now</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 GlowHome. All rights reserved.</p>
      </div>
    </footer>
  );
}
