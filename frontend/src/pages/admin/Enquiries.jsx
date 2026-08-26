import React from 'react';
import './Enquiries.css';

export default function AdminEnquiries({ enquiries, handleToggleEnquiryStatus }) {
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Client Contact Enquiries</h3>
          <p>Follow up on questions, custom quote requests, and feedback messages.</p>
        </div>
        {enquiries.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-data-table simple-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact Details</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map(enq => (
                  <tr key={enq.id}>
                    <td><strong>{enq.name}</strong></td>
                    <td>
                      <div className="enq-contact-info">
                        <span>{enq.email}</span>
                        <span>{enq.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="enq-message-box">
                        {enq.message}
                      </div>
                    </td>
                    <td>{enq.date}</td>
                    <td>
                      <span className={`staff-status-tag ${enq.status === 'pending' ? 'inactive' : 'active'}`}>
                        {enq.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleEnquiryStatus(enq.id)}
                        className="btn btn-outline btn-enq-resolve"
                      >
                        <span>{enq.status === 'pending' ? 'Mark Resolved' : 'Mark Pending'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state-banner">
            <p>No enquiries are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
