import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Services from '../components/Services';
import WhyChooseUs from '../components/WhyChooseUs';
import Reviews from '../components/Reviews';
import Faq from '../components/Faq';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Reviews />
      <Faq />
      <Contact />

      {/* final call to action cta banner */}
      <section className="cta-banner">
        <motion.div 
          className="cta-container"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2>Ready for a Clean Home?</h2>
          <p>Book your cleaning service in less than 60 seconds. Get clear pricing and instant booking confirmation.</p>
          <Link to="/signup" className="btn btn-primary btn-large">
            <Calendar size={18} />
            <span>Schedule Your Cleaning</span>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
