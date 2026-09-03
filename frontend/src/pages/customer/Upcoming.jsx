import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { User as StaffIcon } from 'lucide-react';
import './Upcoming.css';

export default function CustomerUpcoming({
  bookings,
  setActiveRescheduleId,
  setRescheduleDate,
  setRescheduleTime,
  handleCancelBooking,
  getServiceInfo,
  formatDate
}) {
  const scheduledBookings = bookings.filter(b => b.status === 'scheduled');

  return (
    <div className="dashboard-panel">
      <div className="bookings-list-cards">
        {scheduledBookings.length > 0 ? (
          scheduledBookings.map((booking) => {
            const info = getServiceInfo(booking.serviceType);
            return (
              <div key={booking.id} className="history-booking-card">
                <div className="booking-card-main">
                  <div className="booking-card-header">
                    <span className="booking-id-tag">ID: {booking.id}</span>
                    <span className="status-badge-indicator scheduled">scheduled</span>
                  </div>
                  <h4 className="service-name-label">{info.name}</h4>
                  <div className="booking-card-meta">
                    <span><Calendar size={14} /> {formatDate(booking.date)}</span>
                    <span><Clock size={14} /> {booking.time}</span>
                    <span><MapPin size={14} /> {booking.address}</span>
                    {/* show assigned cleaner badge */}
                    {booking.assignedStaff ? (
                      <span className="booking-staff-tag">
                        <StaffIcon size={14} /> Staff: <strong>{booking.assignedStaff}</strong>
                      </span>
                    ) : (
                      <span className="booking-staff-tag unassigned">
                        <StaffIcon size={14} /> Staff: <em>Assigning soon</em>
                      </span>
                    )}
                  </div>
                  {booking.notes && <p className="booking-card-notes"><strong>instructions: </strong>{booking.notes}</p>}
                </div>

                <div className="booking-card-sidebar">
                  <div className="booking-card-price">
                    <span>Fee</span>
                    <strong>₹{booking.price}</strong>
                  </div>
                  <div className="action-buttons-col">
                    <button
                      onClick={() => { setActiveRescheduleId(booking.id); setRescheduleDate(booking.date); setRescheduleTime(booking.time); }}
                      className="btn-reschedule-action"
                    >
                      <span>Reschedule Booking</span>
                    </button>
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn-cancel-service"
                    >
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state-banner">
            <p>No upcoming cleanings are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
