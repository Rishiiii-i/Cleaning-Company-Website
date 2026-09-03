import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import logoPng from '../assets/logo.png';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

export default function Navbar({ portalName, activeTab, rightActions }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const getUser = () => {
    try {
      const data = localStorage.getItem('user');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return {};
  };
  const user = getUser();

  const [isOpen, setIsOpen] = React.useState(false);
  const isDashboard = window.location.pathname === '/dashboard' || window.location.pathname === '/admin';

  const handleHomeClick = (e) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // keep user in current dashboard when clicking logo
  React.useEffect(() => {
    const logoLink = document.querySelector('.navbar-logo');
    if (!logoLink) return;
    const onLogoClick = (e) => {
      const path = window.location.pathname;
      const isDash = Boolean(portalName) || path === '/dashboard' || path.startsWith('/dashboard') || path === '/customer' || path.startsWith('/customer') || path === '/admin' || path.startsWith('/admin');
      if (isDash) {
        e.preventDefault();
        e.stopPropagation();
        if (path === '/admin' || path.startsWith('/admin') || portalName === 'Admin portal') {
          navigate('/admin');
        } else {
          navigate('/customer');
        }
      }
    };
    logoLink.addEventListener('click', onLogoClick, true);
    return () => logoLink.removeEventListener('click', onLogoClick, true);
  }, [portalName, navigate]);

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

        {isDashboard && (
          <div className="navbar-portal-title">
            <span className="portal-eyebrow">{portalName}</span>
            <h2 className="portal-heading">
              {activeTab === 'overview'
                ? 'Dashboard'
                : activeTab
                ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                : ''}
            </h2>
          </div>
        )}

        {/* render portal title if inside customer portal */}
        {(!isDashboard && Boolean(portalName)) && (
          <div className="navbar-portal-title">
            <span className="portal-eyebrow">{portalName}</span>
            <h2 className="portal-heading">
              {activeTab === 'overview'
                ? 'Dashboard'
                : activeTab
                ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                : ''}
            </h2>
          </div>
        )}

        {/* desktop menu navigation */}
        {!isDashboard && (
          <ul className="nav-links">
            <li>
              <ThemeToggle />
            </li>
            <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#contact">Contact Us</a></li>
            {token ? (
              <>
                <li>
                  <Link to={user.email === 'admin@gmail.com' ? '/admin' : '/dashboard'} className="nav-dashboard" style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    Dashboard
                  </Link>
                </li>
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
        )}

        {isDashboard && (
          <div className="dashboard-nav-actions">
            {rightActions}
            <div className="dashboard-nav-user">
              <User size={17} />
              <span>{user.name || 'Customer'}</span>
            </div>
          </div>
        )}

        {/* render dashboard actions if inside customer portal */}
        {(!isDashboard && Boolean(portalName)) && (
          <div className="dashboard-nav-actions">
            {rightActions}
            <div className="dashboard-nav-user">
              <User size={17} />
              <span>{user.name || 'Customer'}</span>
            </div>
          </div>
        )}

        {/* mobile hamburger button */}
        {!isDashboard && (
          <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* mobile menu navigation drawer */}
      {isOpen && (
        <div className="mobile-menu">
          <ul className="mobile-links">
            <li><Link to="/" onClick={(e) => { setIsOpen(false); handleHomeClick(e); }}>Home</Link></li>
            <li><a href="#services" onClick={() => setIsOpen(false)}>Services</a></li>
            <li><a href="#how-it-works" onClick={() => setIsOpen(false)}>How It Works</a></li>
            <li><a href="#contact" onClick={() => setIsOpen(false)}>Contact Us</a></li>
            {token ? (
              <>
                <li>
                  <Link 
                    to={user.email === 'admin@gmail.com' ? '/admin' : '/dashboard'} 
                    onClick={() => setIsOpen(false)} 
                    className="mobile-dashboard"
                    style={{ fontWeight: 600, color: 'var(--primary)' }}
                  >
                    Dashboard
                  </Link>
                </li>
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
            <li style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
