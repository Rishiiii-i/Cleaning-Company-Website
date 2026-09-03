import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import heroImg from '../assets/hero.jpg';
import logoPng from '../assets/logo.png';
import googlePng from '../assets/google.png';
import './Login.css';
import OtpModal from '../components/OtpModal';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pending2FAEmail, setPending2FAEmail] = useState('');
  const [pendingAuthData, setPendingAuthData] = useState(null);

  // handle successful two factor verification
  const handleOtpSuccess = (data) => {
    setShowOtpModal(false);
    const tokenToSave = data.token || pendingAuthData?.token;
    const userToSave = data.user || pendingAuthData?.user;
    if (tokenToSave) localStorage.setItem('token', tokenToSave);
    if (userToSave) localStorage.setItem('user', JSON.stringify(userToSave));
    navigate('/customer');
  };

  // reset previous login session on login page load
  React.useEffect(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      console.error(err);
    }
  }, []);

  // handle text input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Predefined Admin Bypass
    if (formData.email === 'admin@gmail.com' && formData.password === 'Admin@123') {
      try {
        await fetch('http://localhost:5000/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Admin Operations',
            email: 'admin@gmail.com',
            password: 'Admin@123'
          })
        });
      } catch (err) {
        console.warn('Backend sync bypassed:', err);
      }
      localStorage.setItem('token', 'admin-session-token-xyz');
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: 'Admin Operations',
          email: 'admin@gmail.com'
        })
      );
      setLoading(false);
      navigate('/admin');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const token = await userCredential.user.getIdToken();

      // sync user details to database
      const syncResponse = await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email,
          password: formData.password
        })
      });

      if (!syncResponse.ok) {
        const syncData = await syncResponse.json();
        throw new Error(syncData.error || 'failed to sync user details to database');
      }

      // check if user has two factor authentication enabled
      if (userCredential.user.email !== 'admin@gmail.com') {
        try {
          const statusRes = await fetch(`http://localhost:5000/api/2fa/status?email=${encodeURIComponent(userCredential.user.email)}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.twoFactorEnabled) {
              await fetch('http://localhost:5000/api/2fa/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userCredential.user.email })
              });
              setPending2FAEmail(userCredential.user.email);
              setPendingAuthData({
                token,
                user: {
                  name: userCredential.user.displayName || 'User',
                  email: userCredential.user.email
                }
              });
              setShowOtpModal(true);
              setLoading(false);
              return;
            }
          }
        } catch (twoFactorErr) {
          console.error(twoFactorErr);
        }
      }

      localStorage.setItem('token', token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email
        })
      );

      // redirect admin to admin panel, otherwise send customers to dashboard
      if (userCredential.user.email === 'admin@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // clean error message from firebase response
      const cleanMessage = err.message.replace('Firebase: ', '').replace('auth/', '');
      setError(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  // handle google login
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const token = await userCredential.user.getIdToken();

      // sync user details to database
      const syncResponse = await fetch('http://localhost:5000/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email
        })
      });

      if (!syncResponse.ok) {
        const syncData = await syncResponse.json();
        throw new Error(syncData.error || 'failed to sync user details to database');
      }

      // check if google user has two factor authentication enabled
      if (userCredential.user.email !== 'admin@gmail.com') {
        try {
          const statusRes = await fetch(`http://localhost:5000/api/2fa/status?email=${encodeURIComponent(userCredential.user.email)}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.twoFactorEnabled) {
              await fetch('http://localhost:5000/api/2fa/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userCredential.user.email })
              });
              setPending2FAEmail(userCredential.user.email);
              setPendingAuthData({
                token,
                user: {
                  name: userCredential.user.displayName || 'User',
                  email: userCredential.user.email
                }
              });
              setShowOtpModal(true);
              setLoading(false);
              return;
            }
          }
        } catch (twoFactorErr) {
          console.error(twoFactorErr);
        }
      }

      localStorage.setItem('token', token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          name: userCredential.user.displayName || 'User',
          email: userCredential.user.email
        })
      );

      // redirect admin to admin panel, otherwise send customers to dashboard
      if (userCredential.user.email === 'admin@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // ignore popup cancellation errors initiated by the user
      if (
        err.code === 'auth/user-cancelled' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      // clean error message from firebase response
      const cleanMessage = err.message.replace('Firebase: ', '').replace('auth/', '');
      setError(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-split">
      {/* Left Column: Image and Text */}
      <div className="auth-promo-side" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="auth-promo-overlay"></div>
        <motion.div
          className="auth-promo-content"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link to="/" className="auth-promo-logo">
            <img src={logoPng} alt="GlowHome Logo" className="logo-icon-split logo-white" />
            <span>GlowHome</span>
          </Link>
          <div className="auth-promo-text">
            <h2>Experience the Joy of a Spotless Home</h2>
            <p>Join thousands of happy homeowners who trust GlowHome for premium, professional cleaning services.</p>
            <ul className="auth-promo-benefits">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>Verified & background-checked cleaners</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>100% satisfaction guarantee</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CheckCircle2 className="benefit-icon" />
                <span>Transparent pricing, no hidden fees</span>
              </motion.li>
            </ul>
          </div>
          <div className="auth-promo-footer">
            <span>&copy; 2026 GlowHome. All rights reserved.</span>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Form Card */}
      <div className="auth-form-side">
        <div className="auth-form-header-mobile">
          <Link to="/" className="auth-logo-mobile">
            <img src={logoPng} alt="GlowHome Logo" className="logo-icon-split" />
            <span>GlowHome</span>
          </Link>
        </div>
        <motion.div
          className="auth-card-split"
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link to="/" className="auth-back-home">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <h2>welcome back</h2>
          <p className="auth-subtitle">login to manage your cleaning appointments</p>

          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label" htmlFor="email">enter your mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your mail"
                  className="form-input icon-padding"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-wrapper">
                <label className="input-label" htmlFor="password">password</label>
                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="enter your password"
                  className="form-input icon-padding password-padding"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? (
                <span>logging in...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>login</span>
                </>
              )}
            </button>

            <div className="auth-divider" style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ height: '1px', backgroundColor: 'var(--border)', flexGrow: 1 }}></span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>or</span>
              <span style={{ height: '1px', backgroundColor: 'var(--border)', flexGrow: 1 }}></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="btn btn-secondary btn-full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <img src={googlePng} alt="Google Logo" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              <span>Continue with Google</span>
            </button>
          </form>

          <div className="auth-switch">
            <span>don't have an account</span>
            <Link to="/signup">sign up here</Link>
          </div>
        </motion.div>
      </div>

      {/* two factor authentication otp modal */}
      {showOtpModal && (
        <OtpModal
          email={pending2FAEmail}
          onVerifySuccess={handleOtpSuccess}
          onClose={() => {
            setShowOtpModal(false);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
