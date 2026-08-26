import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { User, LogOut, ShieldCheck, Calendar, Clock, FileText, DollarSign, Star, Bell, X, Shield } from 'lucide-react';
import './Dashboard.css';

import CustomerOverview from './Overview';
import CustomerBookings from './Bookings';
import CustomerUpcoming from './Upcoming';
import CustomerHistory from './History';
import CustomerPayments from './Payments';
import CustomerReviews from './Reviews';
import CustomerProfile from './Profile';
import CustomerNotifications from './Notifications';

export default function CustomerDashboard() {
  // safely retrieve user from localStorage
  const getUserLS = () => {
    try {
      const data = localStorage.getItem('user');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return { name: "Rishi Kumar", email: "rishi@gmail.com" };
  };
  const userLS = getUserLS();

  // Active navigation tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Initial profile state records
  const [profile, setProfile] = useState({
    name: userLS.name || 'Rishi M',
    email: userLS.email || 'rishi@gmail.com',
    phone: userLS.phone || '9876543210',
    address: userLS.address || 'Eluru, Andhra Pradesh',
    photo: userLS.photo || null
  });

  // Initial bookings state
  const [bookings, setBookings] = useState([]);

  // Notifications list state
  const [notifications, setNotifications] = useState([]);

  // Booking form details input state
  const [formData, setFormData] = useState({
    serviceType: 'standard',
    date: '',
    time: '',
    address: '',
    notes: ''
  });

  // Active reviews rating modal states
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');

  // Active reschedule booking modal states
  const [activeRescheduleId, setActiveRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Edit profile input states
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');

  // handle user logout request
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // handle text form input field changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle profile changes
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileSaveSuccess(false);
  };

  // handle photo uploader file selection
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, photo: reader.result }));
        setProfileSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // save updated profile details
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfile({ ...profileForm });
    setProfileSaveSuccess(true);
    const updatedUser = { ...userLS, name: profileForm.name, email: profileForm.email, photo: profileForm.photo };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // get pricing details by service type
  const getServiceInfo = (type) => {
    switch (type) {
      case 'standard':
        return { name: 'Standard Cleaning', price: 120 };
      case 'deep':
        return { name: 'Deep Cleaning', price: 200 };
      case 'move':
        return { name: 'Move In/Out Cleaning', price: 280 };
      case 'office':
        return { name: 'Office Cleaning', price: 350 };
      default:
        return { name: 'Standard Cleaning', price: 120 };
    }
  };

  // submit new service booking request
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const serviceDetails = getServiceInfo(formData.serviceType);

    const newBooking = {
      id: `B${Math.floor(100 + Math.random() * 900)}`,
      serviceType: formData.serviceType,
      date: formData.date,
      time: formData.time,
      address: formData.address || profile.address,
      notes: formData.notes,
      price: serviceDetails.price,
      status: 'scheduled',
      rating: null,
      review: null
    };

    setBookings([newBooking, ...bookings]);

    const newNotif = {
      id: `N${Math.floor(10 + Math.random() * 90)}`,
      title: 'Booking Created',
      message: `your cleaning booking ${newBooking.id} has been created successfully.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications([newNotif, ...notifications]);

    setFormData({
      serviceType: 'standard',
      date: '',
      time: '',
      address: '',
      notes: ''
    });

    setActiveTab('bookings');
  };

  // cancel a scheduled or pending booking
  const handleCancelBooking = (id) => {
    const updated = bookings.map((item) =>
      item.id === id ? { ...item, status: 'cancelled' } : item
    );
    setBookings(updated);

    const newNotif = {
      id: `N${Math.floor(10 + Math.random() * 90)}`,
      title: 'Booking Cancelled',
      message: `your cleaning booking ${id} was cancelled.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // save rescheduled date and time
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) return;

    const updated = bookings.map((item) =>
      item.id === activeRescheduleId ? { ...item, date: rescheduleDate, time: rescheduleTime } : item
    );
    setBookings(updated);

    const newNotif = {
      id: `N${Math.floor(10 + Math.random() * 90)}`,
      title: 'Booking Rescheduled',
      message: `your cleaning booking ${activeRescheduleId} was updated to ${rescheduleDate} at ${rescheduleTime}.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications([newNotif, ...notifications]);

    setActiveRescheduleId(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  // submit customer rating and review
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    const updated = bookings.map((item) =>
      item.id === activeReviewId ? { ...item, rating: ratingInput, review: reviewInput } : item
    );
    setBookings(updated);

    setActiveReviewId(null);
    setRatingInput(5);
    setReviewInput('');
  };

  // toggle notifications read status
  const handleToggleRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    setNotifications(updated);
  };

  // mark all system notifications as read
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  // calculate summary statistics for dynamic cards
  const totalBookings = 0;
  const upcomingCount = 0;
  const completedCount = 0;
  const pendingCount = 0;
  const unreadNotifications = 0;
  const nextBooking = null;
  const formatDate = (date) => new Intl.DateTimeFormat('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));
  const selectedService = getServiceInfo(formData.serviceType);
  const activeBookings = [];

  return (
    <div className="customer-dashboard-page">
      <Navbar
        portalName="Customer portal"
        activeTab={activeTab}
        rightActions={
          <>
            <button className="topbar-bell" onClick={() => setActiveTab('notifications')} aria-label="View notifications">
              <Bell size={20} />
              {unreadNotifications > 0 && <span className="bell-badge">{unreadNotifications}</span>}
            </button>
            <button className="btn btn-primary" onClick={() => setActiveTab('bookings')}>
              <span>+ Book a cleaning</span>
            </button>
          </>
        }
      />
      <div className="customer-dashboard-container">
        
        {/* sidebar panel layout */}
        <aside className="dashboard-sidebar">
          {/* dashboard tab navigations */}
          <nav className="sidebar-nav">
            <p className="sidebar-nav-label">Workspace</p>
            <button
              className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <ShieldCheck size={18} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} />
              <span>My Bookings</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Clock size={18} />
              <span>Upcoming Booking ({upcomingCount})</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FileText size={18} />
              <span>Booking History</span>
            </button>
            <p className="sidebar-nav-label sidebar-nav-label-secondary">Account</p>
            <button
              className={`nav-item-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <DollarSign size={18} />
              <span>Payments</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} />
              <span>Reviews</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} />
              <span>Notifications ({unreadNotifications})</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile-summary">
              <div className="avatar-placeholder">
                {profile.photo ? <img src={profile.photo} alt="Avatar" className="user-avatar-img" /> : <User size={22} />}
              </div>
              <div className="user-text-info">
                <h4>{profile.name}</h4>
                <p>Customer account</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout-client">
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* main content display area */}
        <main className="dashboard-main-content">
          {activeTab === 'overview' && (
            <CustomerOverview 
              profile={profile}
              totalBookings={totalBookings}
              upcomingCount={upcomingCount}
              completedCount={completedCount}
              pendingCount={pendingCount}
              nextBooking={nextBooking}
              formatDate={formatDate}
              setActiveTab={setActiveTab}
              getServiceInfo={getServiceInfo}
            />
          )}

          {activeTab === 'bookings' && (
            <CustomerBookings 
              activeBookings={activeBookings}
              bookingSearch={bookingSearch}
              setBookingSearch={setBookingSearch}
              formData={formData}
              handleInputChange={handleInputChange}
              selectedService={selectedService}
              handleBookingSubmit={handleBookingSubmit}
              setActiveRescheduleId={setActiveRescheduleId}
              setRescheduleDate={setRescheduleDate}
              setRescheduleTime={setRescheduleTime}
              handleCancelBooking={handleCancelBooking}
              getServiceInfo={getServiceInfo}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'upcoming' && (
            <CustomerUpcoming 
              bookings={bookings}
              setActiveRescheduleId={setActiveRescheduleId}
              setRescheduleDate={setRescheduleDate}
              setRescheduleTime={setRescheduleTime}
              handleCancelBooking={handleCancelBooking}
              getServiceInfo={getServiceInfo}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'history' && (
            <CustomerHistory 
              bookings={bookings}
              getServiceInfo={getServiceInfo}
              setActiveReviewId={setActiveReviewId}
              formatDate={formatDate}
            />
          )}

          {activeTab === 'payments' && (
            <CustomerPayments 
              bookings={bookings}
              getServiceInfo={getServiceInfo}
            />
          )}

          {activeTab === 'reviews' && (
            <CustomerReviews 
              bookings={bookings}
              getServiceInfo={getServiceInfo}
              setActiveReviewId={setActiveReviewId}
            />
          )}

          {activeTab === 'profile' && (
            <CustomerProfile 
              profileForm={profileForm}
              profileSaveSuccess={profileSaveSuccess}
              handleProfileSubmit={handleProfileSubmit}
              handleProfileChange={handleProfileChange}
              handlePhotoUpload={handlePhotoUpload}
            />
          )}

          {activeTab === 'notifications' && (
            <CustomerNotifications 
              notifications={notifications}
              handleMarkAllRead={handleMarkAllRead}
              handleToggleRead={handleToggleRead}
            />
          )}
        </main>

        {/* review details popup modal */}
        {activeReviewId && (
          <div className="modal-backdrop-overlay">
            <div className="review-modal-box">
              <button
                className="close-modal-btn"
                onClick={() => { setActiveReviewId(null); }}
              >
                <X size={20} />
              </button>

              <h3>Leave a Service Review</h3>
              <p className="modal-subtitle">
                Your feedback helps us maintain professional cleaning standards for all users.
              </p>

              <form onSubmit={handleReviewSubmit} className="modal-form">
                <div className="rating-stars-selection">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="star-btn"
                    >
                      <Star
                        size={28}
                        fill={star <= ratingInput ? '#fbbf24' : 'none'}
                        color={star <= ratingInput ? '#fbbf24' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                </div>

                <div className="form-input-box mb-20">
                  <label>Review details</label>
                  <textarea
                    value={reviewInput}
                    onChange={(e) => setReviewInput(e.target.value)}
                    placeholder="Enter review details here..."
                    rows="3"
                    className="form-textarea-field"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-full-width">
                  <span>Submit Rating</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* reschedule bookings popup modal */}
        {activeRescheduleId && (
          <div className="modal-backdrop-overlay">
            <div className="review-modal-box">
              <button
                className="close-modal-btn"
                onClick={() => { setActiveRescheduleId(null); }}
              >
                <X size={20} />
              </button>

              <h3>Reschedule Appointment</h3>
              <p className="modal-subtitle">
                Change your cleaning appointment date and time options.
              </p>

              <form onSubmit={handleRescheduleSubmit} className="modal-form">
                <div className="form-input-box mb-16">
                  <label>Select Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    className="form-date-field"
                  />
                </div>
                <div className="form-input-box mb-20">
                  <label>Select Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                    className="form-time-field"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full-width">
                  <span>Save Reschedule Changes</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
