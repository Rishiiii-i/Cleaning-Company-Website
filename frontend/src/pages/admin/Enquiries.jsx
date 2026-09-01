import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './Enquiries.css';

export default function AdminEnquiries({
  enquiries,
  handleToggleEnquiryStatus,
  handleDeleteEnquiry
}) {
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState('');

  const onToggleStatus = async (id, email) => {
    setUpdatingId(id);
    setNotification('');
    try {
      await handleToggleEnquiryStatus(id);
      setNotification(`Status updated & email sent to ${email}`);
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3>Client Contact Enquiries</h3>
            <p>Follow up on questions, custom quote requests, and feedback messages.</p>
          </div>
          {notification && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} />
              <span>{notification}</span>
            </div>
          )}
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
                {enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>
                      <strong>{enq.name}</strong>
                      {enq.subject && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          {enq.subject}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="enq-contact-info">
                        <span>{enq.email}</span>
                        {enq.phone && <span>{enq.phone}</span>}
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
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => onToggleStatus(enq.id || enq._id, enq.email)}
                          className="btn btn-outline btn-enq-resolve"
                          disabled={updatingId === (enq.id || enq._id)}
                          title="Change status and automatically notify client by email"
                        >
                          <span>
                            {updatingId === (enq.id || enq._id) 
                              ? 'Updating...' 
                              : (enq.status === 'pending' ? 'Mark Resolved' : 'Mark Pending')}
                          </span>
                        </button>

                        {handleDeleteEnquiry && (
                          <button
                            onClick={() => handleDeleteEnquiry(enq.id || enq._id)}
                            className="btn btn-outline btn-enq-resolve"
                            style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                            title="Delete enquiry"
                          >
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
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
