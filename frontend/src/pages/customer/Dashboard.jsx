import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { User, LogOut, ShieldCheck, Calendar, Clock, FileText, DollarSign, Star, Bell, X, Shield, Sparkles, ClipboardList } from 'lucide-react';
import './Dashboard.css';

import CustomerOverview from './Overview';
import CustomerBookings from './Bookings';
import CustomerUpcoming from './Upcoming';
import CustomerHistory from './History';
import CustomerPayments from './Payments';
import CustomerReviews from './Reviews';
import CustomerProfile from './Profile';
import CustomerNotifications from './Notifications';
import ServicesList from './ServicesList';

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

  // fetch cleaning bookings list from backend database
  useEffect(() => {
    const loadBookingsData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(profile.email)}`);
        if (response.ok) {
          const data = await response.json();
          // attach a standard id attribute from mongodb _id
          const formatted = data.map((b) => ({ ...b, id: b.id || b._id }));
          setBookings(formatted);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };
    if (profile.email) {
      loadBookingsData();
    }
  }, [profile.email]);

  // Notifications list state
  const [notifications, setNotifications] = useState([]);

  // Booking form details input state
  const [formData, setFormData] = useState({
    serviceType: 'standard',
    date: '',
    time: '',
    address: '',
    notes: '',
    paymentOption: 'online'
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

  // load razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // handle payment gateway initiation
  const handlePayment = async (booking) => {
    try {
      // load payment script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('failed to load razorpay SDK. check internet connection.');
        return;
      }
      // create payment order on server
      const response = await fetch('http://localhost:5000/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id })
      });
      if (!response.ok) {
        alert('failed to create payment order. try again.');
        return;
      }
      const order = await response.json();
      // initialize razorpay options object
      const options = {
        key: 'rzp_test_TWFaY8FTrY0x12',
        amount: order.amount,
        currency: order.currency,
        name: 'GlowHome Cleaning',
        description: `payment for ${getServiceInfo(booking.serviceType).name}`,
        order_id: order.id,
        prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (paymentResponse) => {
          try {
            // verify payment signature on backend
            const verifyRes = await fetch('http://localhost:5000/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              })
            });
            if (verifyRes.ok) {
              // reload booking list data
              const freshResponse = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(profile.email)}`);
              if (freshResponse.ok) {
                const freshData = await freshResponse.json();
                const formatted = freshData.map((b) => ({ ...b, id: b.id || b._id }));
                setBookings(formatted);
              }
              // add success alert notification
              const newNotif = {
                id: `N${Math.floor(10 + Math.random() * 90)}`,
                title: 'Payment Successful',
                message: `your payment of ₹${booking.price} has been received.`,
                date: new Date().toISOString().split('T')[0],
                read: false
              };
              setNotifications(prev => [newNotif, ...prev]);
              alert('payment successful and booking updated!');
            } else {
              alert('payment verification failed.');
            }
          } catch (err) {
            console.error('error verifying payment:', err);
          }
        }
      };
      // open razorpay checkout gateway
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('error processing payment:', err);
    }
  };

  // submit new service booking request
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const serviceDetails = getServiceInfo(formData.serviceType);

    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: profile.email,
          serviceType: formData.serviceType,
          price: serviceDetails.price,
          date: formData.date,
          time: formData.time,
          address: formData.address || profile.address,
          notes: formData.notes,
          paymentMethod: formData.paymentOption
        })
      });

      if (response.ok) {
        const newBookingData = await response.json();
        const bookingId = newBookingData.id || newBookingData._id;

        // refetch bookings from database
        const freshResponse = await fetch(`http://localhost:5000/api/bookings?email=${encodeURIComponent(profile.email)}`);
        if (freshResponse.ok) {
          const freshData = await freshResponse.json();
          const formatted = freshData.map((b) => ({ ...b, id: b.id || b._id }));
          setBookings(formatted);
        }

        const newNotif = {
          id: `N${Math.floor(10 + Math.random() * 90)}`,
          title: 'Booking Created',
          message: `your cleaning booking has been created successfully.`,
          date: new Date().toISOString().split('T')[0],
          read: false
        };
        setNotifications([newNotif, ...notifications]);

        setFormData({
          serviceType: 'standard',
          date: '',
          time: '',
          address: '',
          notes: '',
          paymentOption: 'online'
        });

        setActiveTab('bookings');

        // initiate payment for new booking if online is selected
        if (formData.paymentOption === 'online') {
          handlePayment({ ...newBookingData, id: bookingId });
        } else {
          alert('booking scheduled successfully with cash on delivery!');
        }
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
    }
  };

  // cancel a scheduled or pending booking
  const handleCancelBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
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
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // save rescheduled date and time
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${activeRescheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });

      if (response.ok) {
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
      }
    } catch (err) {
      console.error('Error rescheduling booking:', err);
    }
  };

  // open review modal and set existing rating details
  const handleOpenReview = (bookingId) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking && targetBooking.rating) {
      setRatingInput(targetBooking.rating);
      setReviewInput(targetBooking.review || '');
    } else {
      setRatingInput(5);
      setReviewInput('');
    }
    setActiveReviewId(bookingId);
  };

  // submit customer rating and review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      // save review to backend api
      const response = await fetch(`http://localhost:5000/api/bookings/${activeReviewId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingInput,
          review: reviewInput,
          customerName: profile.name || userLS.name || 'Customer'
        })
      });

      if (response.ok) {
        // update booking state with new review
        const updated = bookings.map((item) =>
          item.id === activeReviewId ? { ...item, rating: ratingInput, review: reviewInput } : item
        );
        setBookings(updated);

        // reset modal states
        setActiveReviewId(null);
        setRatingInput(5);
        setReviewInput('');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
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
  const totalBookings = bookings.length;
  const upcomingCount = bookings.filter(b => b.status === 'scheduled' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // calculate the next scheduled or pending booking
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextBooking = sortedBookings.find(b => b.status === 'scheduled' || b.status === 'pending') || null;

  const formatDate = (date) => {
    try {
      if (!date) return '';
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      }).format(new Date(`${date}T12:00:00`));
    } catch (e) {
      return date;
    }
  };
  const selectedService = getServiceInfo(formData.serviceType);

  // filter active bookings based on search input
  const activeBookings = bookings.filter(b => {
    const isStatusMatch = b.status === 'scheduled' || b.status === 'pending' || b.status === 'completed';
    const serviceName = getServiceInfo(b.serviceType).name.toLowerCase();
    const query = bookingSearch.toLowerCase();
    const idString = String(b.id || b._id || '').toLowerCase();
    const isSearchMatch = idString.includes(query) || serviceName.includes(query);
    return isStatusMatch && isSearchMatch;
  });

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
              className={`nav-item-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <ClipboardList size={18} />
              <span>Services List</span>
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

          {activeTab === 'services' && (
            <ServicesList
              onBookServiceClick={(serviceId) => {
                // select the service in bookings form and redirect to bookings tab
                setFormData(prev => ({ ...prev, serviceType: serviceId }));
                setActiveTab('bookings');
              }}
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
              handlePayment={handlePayment}
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
              setActiveReviewId={handleOpenReview}
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
              setActiveReviewId={handleOpenReview}
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
