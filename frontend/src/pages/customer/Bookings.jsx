import React from 'react';
import { Calendar, CheckCircle, Shield, Search, Clock } from 'lucide-react';
import './Bookings.css';

export default function CustomerBookings({
  activeBookings,
  bookingSearch,
  setBookingSearch,
  formData,
  handleInputChange,
  selectedService,
  handleBookingSubmit,
  setActiveRescheduleId,
  setRescheduleDate,
  setRescheduleTime,
  handleCancelBooking,
  getServiceInfo,
  formatDate
}) {
  return (
    <div className="dashboard-panel">
      <div className="booking-layout-grid">
        
        {/* booking details input form */}
        <form onSubmit={handleBookingSubmit} className="booking-form-card">
          <div className="booking-form-heading">
            <div><p className="section-kicker">New request</p><h3>Schedule a cleaning</h3></div>
            <Calendar size={21} />
          </div>
          <div className="form-group-row">
            <div className="form-input-box">
              <label>Select Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="form-select-field"
              >
                <option value="standard">Standard Cleaning - ₹120</option>
                <option value="deep">Deep Cleaning - ₹200</option>
                <option value="move">Move In / Out Cleaning - ₹280</option>
                <option value="office">Office Cleaning - ₹350</option>
              </select>
            </div>
          </div>

          <div className="service-price-preview">
            <div><span>Selected service</span><strong>{selectedService.name}</strong></div>
            <strong>₹{selectedService.price}</strong>
          </div>

          <div className="form-group-row two-cols">
            <div className="form-input-box">
              <label>Choose Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="form-date-field"
              />
            </div>
            <div className="form-input-box">
              <label>Choose Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="form-time-field"
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-input-box">
              <label>Service Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter Address"
                className="form-text-field"
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-input-box">
              <label>Special Instructions / Requirements</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter special instructions"
                rows="2"
                className="form-textarea-field"
              ></textarea>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full-width">
            <CheckCircle size={18} />
            <span>Schedule Service</span>
          </button>
          <p className="booking-form-note"><Shield size={15} /> You'll receive confirmation once your visit is approved.</p>
        </form>

        {/* view current booking statuses list */}
        <div className="bookings-list-cards">
          <div className="list-title-row"><div><p className="section-kicker">Your schedule</p><h3>Active service requests</h3></div><span>{activeBookings.length} active</span></div>
          <label className="booking-search-field">
            <Search size={17} />
            <input value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} placeholder="Search by service or booking ID" />
          </label>
          {activeBookings.length > 0 ? (
            activeBookings.map((booking) => {
              const info = getServiceInfo(booking.serviceType);
              return (
                <div key={booking.id} className="history-booking-card">
                  <div className="booking-card-main">
                    <div className="booking-card-header">
                      <span className="booking-id-tag">ID: {booking.id}</span>
                      <span className={`status-badge-indicator ${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>

                    <h4 className="service-name-label">{info.name}</h4>

                    <div className="booking-card-meta">
                      <span><Calendar size={14} /> {formatDate(booking.date)}</span>
                      <span><Clock size={14} /> {booking.time}</span>
                    </div>
                  </div>

                  <div className="booking-card-sidebar">
                    <strong className="booking-card-price">₹{booking.price}</strong>
                    {(booking.status === 'scheduled' || booking.status === 'pending') && (
                      <div className="action-buttons-col">
                        <button
                          onClick={() => { setActiveRescheduleId(booking.id); setRescheduleDate(booking.date); setRescheduleTime(booking.time); }}
                          className="btn-reschedule-action"
                        >
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn-cancel-service"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-banner">
              <p>{bookingSearch ? 'No bookings match your search.' : 'No bookings are found.'}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
