import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import logoPng from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // handle logout request
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoPng} alt="GlowHome Logo" className="logo-icon" />
          <span>GlowHome</span>
        </Link>

        {/* desktop menu navigation */}
        <ul className="nav-links">
          <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact Us</a></li>
          {token ? (
            <>
              <li className="nav-user">
                <User size={18} />
                <span>{user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-login">Login</Link></li>
              <li><Link to="/signup" className="btn btn-primary nav-cta">Get Started</Link></li>
            </>
          )}
        </ul>

        {/* mobile hamburger button */}
        <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* mobile menu navigation drawer */}
      {isOpen && (
        <div className="mobile-menu">
          <ul className="mobile-links">
            <li><Link to="/" onClick={(e) => { setIsOpen(false); handleHomeClick(e); }}>Home</Link></li>
            <li><a href="#how-it-works" onClick={() => setIsOpen(false)}>How It Works</a></li>
            <li><a href="#services" onClick={() => setIsOpen(false)}>Services</a></li>
            <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact Us</a></li>
            {token ? (
              <>
                <li className="mobile-user">
                  <User size={18} />
                  <span>{user.name}</span>
                </li>
                <li>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn-logout-mobile">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={() => setIsOpen(false)} className="mobile-login">Login</Link></li>
                <li><Link to="/signup" onClick={() => setIsOpen(false)} className="btn btn-primary mobile-cta">Get Started</Link></li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
