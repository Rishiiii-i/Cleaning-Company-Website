import React from 'react';
import './Bookings.css';

export default function AdminBookings({
  bookings,
  services,
  staff,
  handleAssignStaff,
  handleStatusChange
}) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Service Bookings Administration</h3>
          <p>Assign staff cleaners to client bookings, confirm deposits, and approve completed visits.</p>
        </div>

        {bookings.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer Details</th>
                  <th>Date & Time</th>
                  <th>Service & Price</th>
                  <th>Assigned Staff</th>
                  <th>Job Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.id}</strong></td>
                    <td>
                      <div className="customer-info-cell flex-col">
                        <strong>{booking.customerName}</strong>
                        <span className="email-meta">{booking.email}</span>
                        <span className="address-sub address-meta">{booking.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-info-cell flex-col">
                        <span>{booking.date}</span>
                        <span className="time-meta">{booking.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="price-info-cell flex-col">
                        <span className="svc-type svc-name-meta">{services.find(s => s.id === booking.serviceType)?.name || booking.serviceType}</span>
                        <strong className="svc-price svc-price-meta">₹{booking.price}</strong>
                      </div>
                    </td>
                    <td>
                      <select
                        value={booking.assignedStaff}
                        onChange={(e) => handleAssignStaff(booking.id, e.target.value)}
                        className="table-select-staff"
                      >
                        <option value="">Choose Staff...</option>
                        {staff.map(person => (
                          <option key={person.id} value={person.name}>{person.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`table-select-status ${booking.status}`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No bookings are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
