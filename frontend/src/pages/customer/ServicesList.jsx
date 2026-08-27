import React from 'react';
import { Home, Brush, Truck, Briefcase, Check, ArrowRight } from 'lucide-react';
import './ServicesList.css';

export default function ServicesList({ onBookServiceClick }) {
  // pricing configuration
  const servicePrices = {
    standard: 120,
    deep: 200,
    move: 280,
    office: 350
  };

  // detailed list of services
  const services = [
    {
      id: 'standard',
      title: 'Standard House Cleaning',
      price: servicePrices.standard,
      icon: <Home className="service-card-icon" size={28} />,
      desc: 'Regular cleaning to keep your home fresh and tidy.',
      features: [
        'Dusting',
        'Sweeping, vacuuming & mopping',
        'Kitchen counter and sink cleaning',
        'Basic bathroom cleaning',
        'Emptying trash'
      ]
    },
    {
      id: 'deep',
      title: 'Deep House Cleaning',
      price: servicePrices.deep,
      icon: <Brush className="service-card-icon" size={28} />,
      desc: 'Thorough cleaning for dirt and hard-to-reach areas.',
      features: [
        'Everything in Standard Cleaning',
        'Oven and microwave cleaning',
        'Baseboard cleaning',
        'Cabinet cleaning',
        'Window sill and glass cleaning'
      ]
    },
    {
      id: 'move',
      title: 'Move In / Out Cleaning',
      price: servicePrices.move,
      icon: <Truck className="service-card-icon" size={28} />,
      desc: 'Complete cleaning for moving into or leaving a house.',
      features: [
        'Deep floor cleaning',
        'Refrigerator cleaning',
        'Inside cabinet and drawer cleaning',
        'Window and track cleaning',
        'Wall spot cleaning'
      ]
    },
    {
      id: 'office',
      title: 'Office Workspace Cleaning',
      price: servicePrices.office,
      icon: <Briefcase className="service-card-icon" size={28} />,
      desc: 'Keep your office clean and comfortable.',
      features: [
        'Desk and chair cleaning',
        'Breakroom cleaning',
        'Restroom cleaning',
        'Floor and rug cleaning',
        'Trash disposal'
      ]
    }
  ];

  return (
    <div className="dashboard-panel">
      
      {/* service section intro header */}
      <div className="services-page-header">
        <div>
          <span className="section-kicker">Professional Cleaning</span>
          <h2>Select & Book a Service</h2>
          <p>Browse our catalog of detailed cleaning services with transparent pricing. Schedule your appointment instantly.</p>
        </div>
      </div>

      {/* grid layout listing all services */}
      <div className="services-list-grid">
        {services.map((srv) => (
          <div key={srv.id} className="service-list-card">
            
            {/* service icon and name title */}
            <div className="service-card-header">
              <div className="icon-badge">{srv.icon}</div>
              <div className="header-text">
                <h3>{srv.title}</h3>
                <span className="service-price-tag">₹{srv.price} / session</span>
              </div>
            </div>

            {/* detailed description */}
            <p className="service-card-description">{srv.desc}</p>

            {/* list of included service features */}
            <div className="service-card-features">
              <h4>What is included:</h4>
              <ul>
                {srv.features.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={14} className="feature-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* instant book button */}
            <button
              onClick={() => onBookServiceClick(srv.id)}
              className="btn-book-service"
            >
              <span>Book Appointment</span>
              <ArrowRight size={16} />
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
