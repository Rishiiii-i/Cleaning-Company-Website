import React from 'react';
import './Payments.css';

export default function AdminPayments({ payments, services }) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Transaction History</h3>
          <p>Real-time updates on client booking deposits and completed payments.</p>
        </div>
        {payments.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-data-table simple-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Paid Amount</th>
                  <th>Date</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td><strong>{pay.id}</strong></td>
                    <td><strong>{pay.customerName}</strong></td>
                    <td className="capitalize-text">{pay.serviceType} cleaning</td>
                    <td><strong className="primary-color-text">₹{pay.amount}</strong></td>
                    <td>{pay.date}</td>
                    <td>
                      <span className="payment-status-tag active">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No payments are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
