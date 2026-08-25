import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, ShieldCheck, Clock3, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../assets/hero.jpg';
import badgeCheckPng from '../assets/badge-check.png';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero-section">
      {/* Ambient background blobs for premium depth */}
      <div className="hero-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="hero-container">
        {/* hero content text left side */}
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img src={badgeCheckPng} alt="Badge Check" className="badge-png-icon" />
            <span className="badge-highlight">Fully Insured</span>
            <span className="badge-divider"></span>
            <span className="badge-text">Professional Cleaning Service</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Clean Spaces. <span className="text-gradient">Easy Living.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            We provide professional cleaning services for homes and offices. Choose the service you need, book online in just 60 seconds, and enjoy a clean and healthy space.
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link to="/signup" className="btn btn-primary">
              <Calendar size={18} />
              <span>Book a Cleaning</span>
            </Link>
            <a href="#services" className="btn btn-secondary">
              <span>View Services</span>
              <ArrowRight size={16} />
            </a>
          </motion.div>
          
          <motion.div 
            className="hero-features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Fully Insured Cleaners</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Clear and Fixed Pricing</span>
            </div>
          </motion.div>
        </motion.div>

        {/* hero visual representation right side */}
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div 
            className="image-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          >
            <img src={heroImage} alt="cleaning services illustration" className="hero-img" />
          </motion.div>
          
          <motion.div 
            className="floating-badge"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, type: 'spring', stiffness: 100 }}
          >
            <span className="badge-number">4.9</span>
            <div className="badge-stars">★★★★★</div>
            <span className="badge-text">Customer Rating</span>
          </motion.div>
        </motion.div>

      </div>

      <motion.div 
        className="trust-strip" 
        aria-label="GlowHome service highlights"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
      >
        <div className="trust-strip-container">
          <motion.div 
            className="trust-strip-item"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <ShieldCheck size={22} />
            <div><strong>Fully insured</strong><span>Trusted professionals</span></div>
          </motion.div>
          <motion.div 
            className="trust-strip-item"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Clock3 size={22} />
            <div><strong>Book in 60 seconds</strong><span>Fast, simple scheduling</span></div>
          </motion.div>
          <motion.div 
            className="trust-strip-item"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Star size={22} />
            <div><strong>4.9 customer rating</strong><span>Care in every clean</span></div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
