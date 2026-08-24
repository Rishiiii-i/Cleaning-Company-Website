import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImg from '../assets/hero.jpg';
import logoPng from '../assets/logo.png';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // handle text input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'login failed');
      }

      // save credentials and redirect to home
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      {/* Left Column: Image and Text */}
      <div className="auth-promo-side" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="auth-promo-overlay"></div>
        <motion.div 
          className="auth-promo-content"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/" className="auth-promo-logo">
            <img src={logoPng} alt="GlowHome Logo" className="logo-icon-split logo-white" />
            <span>GlowHome</span>
          </Link>
          <div className="auth-promo-text">
            <h2>Experience the Joy of a Spotless Home</h2>
            <p>Join thousands of happy homeowners who trust GlowHome for premium, professional cleaning services.</p>
            <ul className="auth-promo-benefits">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>Verified & background-checked cleaners</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>100% satisfaction guarantee</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>Transparent pricing, no hidden fees</span>
              </motion.li>
            </ul>
          </div>
          <div className="auth-promo-footer">
            <span>&copy; 2026 GlowHome. All rights reserved.</span>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Form Card */}
      <div className="auth-form-side">
        <div className="auth-form-header-mobile">
          <Link to="/" className="auth-logo-mobile">
            <img src={logoPng} alt="GlowHome Logo" className="logo-icon-split" />
            <span>GlowHome</span>
          </Link>
        </div>
        <motion.div 
          className="auth-card-split"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link to="/" className="auth-back-home">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <h2>welcome back</h2>
          <p className="auth-subtitle">login to manage your cleaning appointments</p>

          {error && (
            <motion.div 
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label" htmlFor="email">enter your mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your mail"
                  className="form-input icon-padding"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-wrapper">
                <label className="input-label" htmlFor="password">password</label>
                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="enter your password"
                  className="form-input icon-padding"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? (
                <span>logging in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>login</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>don't have an account</span>
            <Link to="/signup">sign up here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
