import React from 'react';
import { useTheme } from '../context/ThemeContext';
import sunPng from '../assets/sun.png';
import moonPng from '../assets/moon.png';
import './ThemeToggle.css';

// component to toggle between dark and light themes
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn" 
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <img src={moonPng} alt="Moon Icon" className="theme-toggle-icon" />
      ) : (
        <img src={sunPng} alt="Sun Icon" className="theme-toggle-icon" />
      )}
    </button>
  );
}
