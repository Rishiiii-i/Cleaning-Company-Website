import React from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './WhyChooseUs.css';

export default function WhyChooseUs() {
  const cards = [
    {
      title: 'Trained Professionals',
      desc: 'All our cleaners are trained, verified, and carefully selected.'
    },
    {
      title: 'Satisfaction Guarantee',
      desc: 'Not satisfied with our service? We will come back and clean the area again for free.'
    },
    {
      title: 'Easy Scheduling',
      desc: 'Easily book and manage your cleaning appointments from your customer dashboard.'
    }
  ];

  return (
    <section id="why-choose-us" className="trust-section">
      <div className="trust-container">
        <motion.div 
          className="section-header" 
          style={{ marginBottom: '40px' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-badge">Why Choose Us?</span>
          <h2>Why Choose Us?</h2>
        </motion.div>
        <div className="trust-grid">
          {cards.map((card, index) => (
            <motion.div 
              key={index} 
              className="trust-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <CheckCircle size={28} className="trust-icon" />
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
