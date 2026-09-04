import React from 'react';
import linkedinPng from '../assets/linkedin.png';
import instagramPng from '../assets/instagram.png';
import githubPng from '../assets/github.png';

export default function SocialLinks() {
  const accounts = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/rishimacha/',
      className: 'social-btn linkedin',
      icon: <img src={linkedinPng} alt="LinkedIn" className="social-png-icon" />
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/drxgo_18/',
      className: 'social-btn instagram',
      icon: <img src={instagramPng} alt="Instagram" className="social-png-icon" />
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Rishiiii-i',
      className: 'social-btn github',
      icon: <img src={githubPng} alt="GitHub" className="social-png-icon" />
    }
  ];

  return (
    <div className="footer-social-row">
      {accounts.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={item.className}
          aria-label={item.name}
          title={item.name}
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
