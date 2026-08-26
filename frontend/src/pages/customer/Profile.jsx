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
