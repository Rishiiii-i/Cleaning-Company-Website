import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import './Faq.css';

export default function Faq() {
  const [activeIndex, setActiveIndex] = useState(null);

  // toggle faq accordion panels
  const togglePanel = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // list of common customer inquiries
  const faqs = [
    {
      q: 'What is included in regular house cleaning?',
      a: 'Regular cleaning includes dusting, vacuuming, mopping, kitchen cleaning, and bathroom cleaning.'
    },
    {
      q: 'Do I need to be at home during the cleaning?',
      a: 'No. You can provide access instructions when making your booking.'
    },
    {
      q: 'Are the cleaning products safe for children and pets?',
      a: 'Yes. We use safe and carefully selected cleaning products.'
    },
    {
      q: 'Can I cancel or change my booking?',
      a: 'Yes. You can manage, cancel, or reschedule your booking through your customer dashboard.'
    }
  ];

  return (
    <section id="faq" className="faq-section">
      <div className="section-header">
        <span className="section-badge">FAQ</span>
        <h2>Frequently Asked Questions</h2>
        <p>Find answers to common questions about our cleaning services.</p>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div key={index} className={`faq-card ${isOpen ? 'open' : ''}`}>
              <button onClick={() => togglePanel(index)} className="faq-question">
                <div className="faq-q-text">
                  <HelpCircle size={18} className="faq-icon-help" />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {isOpen && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
