import React from 'react';
import './Payments.css';

export default function CustomerPayments({ bookings, getServiceInfo }) {
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="dashboard-panel">
      <div className="bookings-table-container">
        <table className="payments-data-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Clean Service</th>
              <th>Payment Date</th>
              <th>Mock Method</th>
              <th>Payment Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {completedBookings.map((b, idx) => {
              const info = getServiceInfo(b.serviceType);
              return (
                <tr key={b.id}>
                  <td><strong>REC-00{idx + 1}</strong></td>
                  <td>{info.name} (ID: {b.id})</td>
                  <td>{b.date}</td>
                  <td>Visa **** 4410</td>
                  <td><strong>₹{b.price}</strong></td>
                  <td><span className="payment-status-badge">paid</span></td>
                </tr>
              );
            })}
            {completedBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="table-empty-row">
                  No payments are found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
