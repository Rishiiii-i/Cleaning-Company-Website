import React from 'react';
// import icons for add, delete, and close
import { Plus, Trash2, X } from 'lucide-react';
import './Customers.css';

export default function AdminCustomers({ customers }) {
  // search customers text
  const [search, setSearch] = React.useState('');
  // form open toggle state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  // add customer form inputs
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [newCity, setNewCity] = React.useState('');
  // get handlers from arguments or window
  const handleAddCustomer = arguments[0]?.handleAddCustomer || (typeof window !== 'undefined' && window.adminHandlers?.handleAddCustomer);
  const handleDeleteCustomer = arguments[0]?.handleDeleteCustomer || (typeof window !== 'undefined' && window.adminHandlers?.handleDeleteCustomer);
  customers = (customers || []).filter(c => !c ? false : (c.email !== 'admin@gmail.com' && c.role !== 'admin' && ((c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase()))));
  // manage add customer modal visibility
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Customer Details</h3>
          <p>View registered clients, contact email/phones, and cities.</p>
        </div>
        {/* search and add customer button row */}
        <div className="customer-toolbar-row">
          <input
            type="text"
            placeholder="search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="customer-search-input"
          />
          <button
            type="button"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="btn btn-primary btn-add-customer-trigger"
          >
            <Plus size={16} />
            <span>{isAddOpen ? 'Close Form' : 'Add New Customer'}</span>
          </button>
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
                  <th>Action</th>
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
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          const fn = handleDeleteCustomer || (typeof window !== 'undefined' && window.adminHandlers?.handleDeleteCustomer);
                          if (fn) fn(c.id || c._id);
                        }}
                        className="btn-delete-price"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </td>
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
      {/* add new customer popup modal */}
      {isAddOpen && (
        <div className="customer-modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="customer-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header customer-form-header">
              <div>
                <h3>Add New Customer</h3>
                <p>Register a new client directly to the database.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="btn-close-form"
                title="Close form"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newName.trim() || !newEmail.trim()) return;
                if (handleAddCustomer) handleAddCustomer({ name: newName, email: newEmail, phone: newPhone, city: newCity });
                setNewName(''); setNewEmail(''); setNewPhone(''); setNewCity('');
                setIsAddOpen(false);
              }}
              className="customer-add-form"
            >
              <div className="form-input-box">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                  className="form-text-field"
                />
              </div>
              <div className="form-input-box">
                <label>Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter customer email"
                  required
                  className="form-text-field"
                />
              </div>
              <div className="form-input-box">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="form-text-field"
                />
              </div>
              <div className="form-input-box large-gap">
                <label>City / Location</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Enter city"
                  className="form-text-field"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full-width">
                <Plus size={16} />
                <span>Add Customer</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
