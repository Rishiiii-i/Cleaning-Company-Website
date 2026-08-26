import React from 'react';
import './Customers.css';

export default function AdminCustomers({ customers }) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Customer Details</h3>
          <p>View registered clients, contact email/phones, and cities.</p>
        </div>
        {customers.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-data-table simple-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Contact</th>
                  <th>City / Location</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No customers are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
