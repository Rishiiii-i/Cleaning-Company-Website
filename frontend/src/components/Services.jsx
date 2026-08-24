import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

// import service visual assets
import kitchenImg from '../assets/kitchen.jpg';
import bathroomImg from '../assets/bathroom.jpg';
import officeImg from '../assets/office.jpg';
import moveImg from '../assets/move.jpg';
import './Services.css';

export default function Services() {
  // list of cleaning services we offer
  const serviceList = [
    {
      image: kitchenImg,
      title: 'Regular House Cleaning',
      price: '₹500 / hour',
      desc: 'Perfect for regular home cleaning. Includes dusting, vacuuming, mopping, and basic sanitizing.',
      features: ['Dusting all surfaces', 'Vacuuming and mopping', 'Kitchen cleaning', 'Bathroom cleaning']
    },
    {
      image: bathroomImg,
      title: 'Deep Cleaning',
      price: '₹900 / hour',
      desc: 'A detailed cleaning of your home, including areas that are difficult to clean.',
      features: ['Everything included in regular cleaning', 'Inside oven and microwave cleaning', 'Baseboard cleaning', 'Inside window cleaning']
    },
    {
      image: officeImg,
      title: 'Office Cleaning',
      price: '₹700 / hour',
      desc: 'Keep your office clean, fresh, and comfortable for your employees and customers.',
      features: ['Desk cleaning', 'Common area cleaning', 'Trash removal', 'Conference room cleaning']
    },
    {
      image: moveImg,
      title: 'Move-In / Move-Out Cleaning',
      price: '₹3600 flat rate',
      desc: 'A complete cleaning service for moving into a new home or leaving your current home.',
      features: ['Inside cabinet cleaning', 'Refrigerator and appliance cleaning', 'Deep floor cleaning', 'Wall cleaning']
    }
  ];

  return (
    <section id="services" className="services-section">
      <motion.div 
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-badge">Our Services</span>
        <h2>Professional Cleaning Services</h2>
        <p>Choose the cleaning service that best fits your home or office.</p>
      </motion.div>

      <div className="services-grid">
        {serviceList.map((service, index) => (
          <motion.div 
            key={index} 
            className="service-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="service-img-wrapper">
              <img src={service.image} alt={service.title} className="service-card-img" />
            </div>
            <div className="service-card-content">
              <h3>{service.title}</h3>
              <div className="service-price">{service.price}</div>
              <p className="service-desc">{service.desc}</p>
              <ul className="service-features">
                {service.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} className="check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
