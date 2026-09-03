import React from 'react';
import { User, Camera, CheckCircle } from 'lucide-react';
import './Profile.css';

export default function CustomerProfile({
  profileForm,
  profileSaveSuccess,
  handleProfileSubmit,
  handleProfileChange,
  handlePhotoUpload
}) {
  // two factor authentication state
  const [twoFactorActive, setTwoFactorActive] = React.useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(null);

  // load user two factor status from database
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!profileForm?.email) return;
        const res = await fetch(`http://localhost:5000/api/2fa/status?email=${encodeURIComponent(profileForm.email)}`);
        if (res.ok) {
          const data = await res.json();
          setTwoFactorActive(Boolean(data.twoFactorEnabled));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [profileForm?.email]);

  // handle countdown logout when 2fa is turned on
  React.useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, [countdown]);

  // handle toggle two factor authentication
  const handleToggle2FA = async () => {
    if (twoFactorLoading || countdown !== null) return;
    const nextState = !twoFactorActive;
    setTwoFactorLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/2fa/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profileForm.email, enable: nextState })
      });

      if (res.ok) {
        setTwoFactorActive(nextState);
        if (nextState) {
          setCountdown(3);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTwoFactorLoading(false);
    }
  };
  return (
    <div className="dashboard-panel">
      <form onSubmit={handleProfileSubmit} className="booking-form-card profile-form-container">
        <h3>Profile Settings</h3>

        {profileSaveSuccess && (
          <div className="profile-success-alert">
            <CheckCircle size={18} />
            <span>profile updated successfully!</span>
          </div>
        )}

        {/* top row container for side by side cards */}
        <div className="profile-top-grid">
        <div className="profile-photo-uploader-container">
          <div className="profile-photo-preview-circle">
            {profileForm.photo ? (
              <img src={profileForm.photo} alt="Avatar Preview" className="uploaded-avatar-preview" />
            ) : (
              <User size={38} />
            )}
            <label htmlFor="profile-photo-input" className="photo-upload-overlay" aria-label="Upload photo">
              <Camera size={18} />
            </label>
          </div>
          <input
            type="file"
            id="profile-photo-input"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden-file-input"
          />
          <div className="photo-upload-meta-text">
            <span className="photo-upload-title">Profile Picture</span>
            <span className="photo-upload-subtitle">JPG or PNG. Max size 2MB.</span>
          </div>
        </div>
        <div className="two-factor-beside-box">
          <div className="two-factor-header-row">
            <div>
              <h4 className="two-factor-title">Two-Factor Authentication (2FA)</h4>
              <p className="two-factor-description">
                Require a 6-digit verification code sent to your registered email when logging into your account.
              </p>
            </div>
            <button
              type="button"
              className={`two-factor-toggle-switch ${twoFactorActive ? 'active' : ''}`}
              onClick={handleToggle2FA}
              disabled={twoFactorLoading || countdown !== null}
              aria-label="Toggle two-factor authentication"
            >
              <span className="two-factor-toggle-knob"></span>
            </button>
          </div>

          {countdown !== null && (
            <div className="two-factor-countdown-banner">
              <div className="countdown-pulse-dot"></div>
              <span>Two-Factor Authentication Enabled! Logging out in {countdown} seconds...</span>
            </div>
          )}
        </div>
        </div>

        <div className="form-group-row">
          <div className="form-input-box">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              required
              className="form-text-field"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-input-box">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              required
              className="form-text-field"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-input-box">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              required
              className="form-text-field"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-input-box">
            <label>Street Address</label>
            <input
              type="text"
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
              required
              className="form-text-field"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          <span>Save Profile Changes</span>
        </button>
      </form>
    </div>
  );
}
