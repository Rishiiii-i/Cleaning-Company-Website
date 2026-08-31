import React from 'react';
import './Payments.css';

export default function CustomerPayments({ bookings, getServiceInfo }) {
  // filter paid bookings for receipt logs
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');

  return (
    <div className="dashboard-panel">
      
      {/* receipt list table */}
      <div className="bookings-table-container">
        <table className="payments-data-table">
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Clean Service</th>
              <th>Payment Date</th>
              <th>Payment Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paidBookings.map((b, idx) => {
              const info = getServiceInfo(b.serviceType);
              return (
                <tr key={b.id}>
                  <td><strong>REC-00{idx + 1}</strong></td>
                  <td>{info.name} (ID: {b.id})</td>
                  <td>{b.date}</td>
                  <td><strong>₹{b.price}</strong></td>
                  <td><span className="payment-status-badge paid">paid</span></td>
                </tr>
              );
            })}
            {paidBookings.length === 0 && (
              <tr>
                <td colSpan="5" className="table-empty-row">
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
