import React from 'react';
import { Download, Search } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import './Payments.css';

export default function CustomerPayments({ bookings, getServiceInfo }) {
  // filter paid bookings for receipt logs
  const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');

  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest');

  const filteredPaidBookings = (paidBookings || []).filter(b => {
    const s = search.toLowerCase();
    const info = getServiceInfo ? getServiceInfo(b.serviceType) : {};
    return !s || String(b.id || '').includes(s) || (info?.name || '').toLowerCase().includes(s) || (b.date || '').includes(s);
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    return 0;
  });

  return (
    <div className="dashboard-panel">
      {/* payments toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search receipts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '0.88rem', cursor: 'pointer' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Highest Amount</option>
            <option value="price-low">Lowest Amount</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => exportToCSV(filteredPaidBookings.map((b, idx) => ({
            'Receipt No': `REC-00${idx + 1}`,
            'Service': getServiceInfo(b.serviceType)?.name || b.serviceType,
            'Date': b.date ? (String(b.date).includes('T') ? String(b.date).split('T')[0] : String(b.date)) : '',
            'Price (INR)': b.price,
            'Status': 'paid'
          })), 'payment-receipts')}
          className="btn btn-secondary"
          style={{ padding: '9px 16px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Download size={15} />
          <span>Export Receipts CSV</span>
        </button>
      </div>

      {/* payments table */}
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
            {filteredPaidBookings.map((b, idx) => {
              const info = getServiceInfo ? getServiceInfo(b.serviceType) : null;
              return (
                <tr key={b.id || idx}>
                  <td><strong>REC-00{idx + 1}</strong></td>
                  <td>{info?.name || b.serviceType} (ID: {b.id})</td>
                  <td>{b.date}</td>
                  <td><strong>₹{b.price}</strong></td>
                  <td><span className="payment-status-badge paid">paid</span></td>
                </tr>
              );
            })}
            {filteredPaidBookings.length === 0 && (
              <tr>
                <td colSpan="5" className="table-empty-row">
                  No payments found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

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
