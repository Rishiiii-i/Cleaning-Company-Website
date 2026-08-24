import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Check } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // handle text input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API request submission
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-header">
        <span className="section-badge">Get in Touch</span>
        <h2>Contact Us</h2>
        <p>We would love to hear from you. Reach out for any questions, support, or custom cleaning quotes.</p>
      </div>

      <div className="contact-grid">
        {/* contact information column */}
        <div className="contact-info">
          <div className="contact-info-title">
            <h3>Our Office</h3>
            <p>Stop by or reach out directly via phone or email. Our team is here to assist you with all your cleaning needs.</p>
          </div>

          <div className="contact-methods">
            <div className="contact-method-card">
              <div className="contact-method-icon">
                <Phone size={20} />
              </div>
              <div className="contact-method-details">
                <h4>Phone Number</h4>
                <p>9876543210</p>
              </div>
            </div>

            <div className="contact-method-card">
              <div className="contact-method-icon">
                <Mail size={20} />
              </div>
              <div className="contact-method-details">
                <h4>Email Address</h4>
                <p>rishi@gmail.com</p>
              </div>
            </div>

            <div className="contact-method-card">
              <div className="contact-method-icon">
                <MapPin size={20} />
              </div>
              <div className="contact-method-details">
                <h4>Location</h4>
                <p>Eluru, Andhra Pradesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* contact form column */}
        <div className="contact-form-card">
          {submitted ? (
            <div className="contact-success animate-fade-in">
              <div className="success-icon-wrapper">
                <Check size={32} />
              </div>
              <h3>Message Sent Successfully!</h3>
              <p>Thank you for contacting GlowHome. Our support representative will get back to you shortly.</p>
              <button 
                onClick={() => setSubmitted(false)} 
                className="btn btn-secondary"
                style={{ marginTop: '16px' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-input-group">
                <label className="contact-input-label" htmlFor="name">full name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="contact-input"
                  required
                />
              </div>

              <div className="contact-input-group">
                <label className="contact-input-label" htmlFor="email">enter your mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your mail"
                  className="contact-input"
                  required
                />
              </div>

              <div className="contact-input-group">
                <label className="contact-input-label" htmlFor="subject">subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="contact-input"
                  required
                />
              </div>

              <div className="contact-input-group">
                <label className="contact-input-label" htmlFor="message">message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here..."
                  className="contact-textarea"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
