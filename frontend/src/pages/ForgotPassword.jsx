import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import heroImg from '../assets/hero.jpg';
import logoPng from '../assets/logo.png';
import './Login.css'; 

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
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
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link to="/login" className="auth-back-home">
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </Link>
                <h2>Forgot Password?</h2>
                <p className="auth-subtitle">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="input-group">
                    <label className="input-label" htmlFor="email">enter your mail</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your mail"
                        className="form-input icon-padding"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary btn-full">
                    {loading ? (
                      <span>sending request...</span>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="auth-success-state"
              >
                <CheckCircle2 size={56} className="success-icon" />
                <h2>Check your mail</h2>
                <p>
                  We have sent a password recovery link to <strong>{email}</strong>. Please check your inbox and spam folders.
                </p>
                <Link to="/login" className="btn btn-primary btn-full">
                  <span>Return to Log In</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
