import React from 'react';
import { Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import './HowItWorks.css';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Calendar size={32} />,
      step: '01',
      title: 'Book Online',
      desc: 'Choose the cleaning service, select your date and time, and complete your booking online in less than 60 seconds.'
    },
    {
      icon: <UserCheck size={32} />,
      step: '02',
      title: 'Cleaner Arrives',
      desc: 'A trained and verified cleaning professional will arrive at your location with all the required cleaning equipment.'
    },
    {
      icon: <ShieldCheck size={32} />,
      step: '03',
      title: 'Enjoy a Clean Home',
      desc: 'Sit back and enjoy your clean and fresh home. We also provide a 100% satisfaction guarantee.'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-badge">How It Works</span>
        <h2>Three Simple Steps</h2>
        <p>Getting your home cleaned is easy and quick.</p>
      </motion.div>

      <div className="steps-container">
        {steps.map((item, index) => (
          <motion.div 
            key={index} 
            className="step-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <div className="step-number">{item.step}</div>
            <div className="step-icon-wrapper">
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
