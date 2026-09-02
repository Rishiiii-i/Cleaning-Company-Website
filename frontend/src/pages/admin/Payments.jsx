import React from 'react';
import './Payments.css';

export default function AdminPayments({ payments, services }) {
  // search payments text
  const [search, setSearch] = React.useState('');
  // status filter text
  const [statusFilter, setStatusFilter] = React.useState('all');
  // get handler from arguments or window
  const handlePaymentStatusChange = arguments[0]?.handlePaymentStatusChange || (typeof window !== 'undefined' && window.adminHandlers?.handlePaymentStatusChange);
  // filter payments list
  payments = (payments || []).filter((pay) => {
    if (!pay) return false;
    const nameStr = (pay.customerName || '').toLowerCase();
    const idStr = String(pay.id || pay._id || '').toLowerCase();
    const svcStr = (pay.serviceType || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = nameStr.includes(q) || idStr.includes(q) || svcStr.includes(q);
    const matchStatus = statusFilter === 'all' || pay.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // update payment status tag classes
  React.useEffect(() => {
    const tags = document.querySelectorAll('.payment-status-tag');
    tags.forEach((tag) => {
      const text = tag.textContent.trim().toLowerCase();
      if (text === 'unpaid') {
        tag.classList.remove('active');
        tag.classList.add('unpaid');
      } else {
        tag.classList.remove('unpaid');
        tag.classList.add('active');
      }
    });
  });
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Transaction History</h3>
          <p>Real-time updates on client booking deposits and completed payments.</p>
        </div>
        {/* search and filter row */}
        <div className="payments-filter-bar">
          <input
            type="text"
            placeholder="search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="payment-search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="payment-status-select"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
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
                  <th>Action</th>
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
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          const fn = handlePaymentStatusChange || (typeof window !== 'undefined' && window.adminHandlers?.handlePaymentStatusChange);
                          const next = pay.status === 'paid' ? 'unpaid' : 'paid';
                          if (fn) fn(pay.id || pay._id, next, pay.bookingId);
                        }}
                        className="btn-edit-price"
                      >
                        <span>Change Status</span>
                      </button>
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
