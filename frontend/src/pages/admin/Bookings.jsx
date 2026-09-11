import React from 'react';
import { Download } from 'lucide-react';
import { exportToCSV } from '../../utils/export';
import './Bookings.css';

export default function AdminBookings({
  bookings,
  services,
  staff,
  handleAssignStaff,
  handleStatusChange
}) {
  // search bookings text
  const [search, setSearch] = React.useState('');
  // status filter text
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [serviceFilter, setServiceFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('newest');
  const [optimisticStatus, setOptimisticStatus] = React.useState({});
  const onStatusChangeOptimistic = (bId, newStatus) => {
    setOptimisticStatus((prev) => ({ ...prev, [bId]: newStatus }));
    if (typeof handleStatusChange === 'function') {
      handleStatusChange(bId, newStatus);
    }
  };
  // safe fallback for staff and services
  staff = staff || [];
  services = services || [];
  // filter bookings list
  bookings = (bookings || []).filter((b) => {
    if (!b) return false;
    const nameStr = (b.customerName || b.userEmail || '').toLowerCase();
    const idStr = String(b.id || b._id || '').toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = nameStr.includes(q) || idStr.includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });
  bookings = bookings.map((b) => ({
    ...b,
    status: optimisticStatus[b.id || b._id] || b.status
  })).filter((b) => {
    if (serviceFilter === 'all') return true;
    const sName = (services.find(s => s.id === b.serviceType)?.name || b.serviceType || '').toLowerCase();
    return sName.includes(serviceFilter.toLowerCase()) || (b.serviceType || '').toLowerCase() === serviceFilter.toLowerCase();
  });
  bookings.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
    if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    return 0;
  });
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Service Bookings Administration</h3>
          <p>Assign staff cleaners to client bookings, confirm deposits, and approve completed visits.</p>
        </div>

        {/* search and filter row */}
        <div className="booking-filter-row">
          <input
            type="text"
            placeholder="search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="booking-search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="booking-status-filter"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="booking-status-filter"
            title="Filter by service"
          >
            <option value="all">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="booking-status-filter"
            title="Sort bookings"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
          </select>
          <button
            type="button"
            className="btn-export-csv"
            onClick={() => {
              const exportData = bookings.map((b) => ({
                'Booking ID': b.id || b._id,
                'Customer': b.customerName || b.userEmail,
                'Email': b.email || b.userEmail,
                'Service': services.find(s => s.id === b.serviceType)?.name || b.serviceType,
                'Price (INR)': b.price,
                'Date': b.date,
                'Time': b.time,
                'Status': b.status,
                'Payment': b.paymentStatus || 'unpaid',
                'Staff': b.assignedStaff || 'Unassigned',
                'Address': b.address
              }));
              exportToCSV(exportData, `bookings-${new Date().toISOString().slice(0, 10)}.csv`);
            }}
            title="Export filtered bookings to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
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
