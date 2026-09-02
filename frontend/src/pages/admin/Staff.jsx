import React from 'react';
import { Plus } from 'lucide-react';
import { Trash2, X } from 'lucide-react';
import './Staff.css';

export default function AdminStaff({
  staff,
  newStaffName,
  setNewStaffName,
  newStaffRole,
  setNewStaffRole,
  handleAddStaffSubmit
}) {
  const [search, setSearch] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const handleDeleteStaff = arguments[0]?.handleDeleteStaff || (typeof window !== 'undefined' && window.adminHandlers?.handleDeleteStaff);
  const handleStaffStatusChange = arguments[0]?.handleStaffStatusChange || (typeof window !== 'undefined' && window.adminHandlers?.handleStaffStatusChange);
  staff = (staff || []).filter(member => !member ? false : ((member.name || '').toLowerCase().includes(search.toLowerCase()) || (member.role || '').toLowerCase().includes(search.toLowerCase())));

  // toggle modal class on staff form
  React.useEffect(() => {
    const form = document.querySelector('.staff-admin-grid .admin-service-form-card');
    if (form) {
      if (isAddOpen) {
        form.classList.add('staff-form-modal-open');
      } else {
        form.classList.remove('staff-form-modal-open');
      }
    }
  }, [isAddOpen]);

  // add close button to staff form if not present
  React.useEffect(() => {
    const form = document.querySelector('.staff-admin-grid .admin-service-form-card');
    if (form && !form.querySelector('.btn-close-form')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-close-form';
      btn.innerHTML = '✕';
      btn.onclick = () => setIsAddOpen(false);
      form.prepend(btn);
    }
  }, []);

  // update total jobs header text to total visits
  React.useEffect(() => {
    const ths = document.querySelectorAll('.staff-directory-list-card th');
    ths.forEach((th) => {
      if (th.textContent.trim() === 'Total Jobs') {
        th.textContent = 'Total Visits';
      }
    });
  }, [staff]);

  // handle staff form submit with database persistence
  React.useEffect(() => {
    const form = document.querySelector('.staff-admin-grid .admin-service-form-card');
    if (!form) return;
    const submitHandler = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const nameInput = form.querySelector('input[placeholder*="Full Name"]');
      const roleSelect = form.querySelector('select');
      const visitsInput = form.querySelector('input[name="staffVisits"]');
      const name = (nameInput?.value || newStaffName || '').trim();
      const role = roleSelect?.value || newStaffRole || 'Standard Cleaner';
      const visits = Number(visitsInput?.value) || 0;
      if (!name) return;

      const handler = typeof window !== 'undefined' && window.adminHandlers?.handleAddStaff;
      if (handler) {
        await handler({ name, role, jobsCount: visits });
      } else {
        try {
          await fetch('http://localhost:5000/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, jobsCount: visits })
          });
          if (typeof window !== 'undefined' && typeof window.adminHandlers?.loadStaff === 'function') {
            window.adminHandlers.loadStaff();
          }
        } catch (err) {
          console.error(err);
        }
      }
      setNewStaffName('');
      setIsAddOpen(false);
    };
    form.addEventListener('submit', submitHandler, true);
    return () => form.removeEventListener('submit', submitHandler, true);
  }, [newStaffName, newStaffRole]);

  // close modal on escape key or outside click
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsAddOpen(false);
    };
    const handleClickOutside = (e) => {
      const form = document.querySelector('.staff-admin-grid .admin-service-form-card.staff-form-modal-open');
      const trigger = document.querySelector('.btn-add-staff-trigger');
      if (form && !form.contains(e.target) && trigger && !trigger.contains(e.target)) {
        setIsAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="dashboard-panel">
      <div className="reports-section-card">
        <div className="panel-header">
          <h3>Staff Details</h3>
          <p>Manage field employees, assign roles, and add new cleaners to shift rotations.</p>
        </div>

        <div className="staff-admin-grid">

          {/* staff directory table list */}
          <div className="staff-directory-list-card">
            <h4>Cleaning Cleaners Directory</h4>
            {/* search and add staff button row */}
            <div className="customer-toolbar-row">
              <input
                type="text"
                placeholder="search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="staff-search-bar"
              />
              <button
                type="button"
                onClick={() => setIsAddOpen(!isAddOpen)}
                className="btn btn-primary btn-add-customer-trigger btn-add-staff-trigger"
              >
                <Plus size={16} />
                <span>{isAddOpen ? 'Close Form' : 'Add Team Member'}</span>
              </button>
            </div>
            {staff.length > 0 ? (
              <table className="admin-data-table simple-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Assigned Role</th>
                    <th>Total Jobs</th>
                    <th>Shift Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td><strong>{member.name}</strong></td>
                      <td>{member.role}</td>
                      <td>{member.jobsCount} visits</td>
                      <td>
                        <span className={`staff-status-tag ${member.status}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            const fn = handleStaffStatusChange || (typeof window !== 'undefined' && window.adminHandlers?.handleStaffStatusChange);
                            if (fn) fn(member.id || member._id);
                          }}
                          className="btn-edit-price"
                          style={{ marginRight: 6 }}
                        >
                          <span>Change Status</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const fn = handleDeleteStaff || (typeof window !== 'undefined' && window.adminHandlers?.handleDeleteStaff);
                            if (fn) fn(member.id || member._id);
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
            ) : (
              <div className="empty-state-banner">
                <p>No staff are found.</p>
              </div>
            )}
          </div>

          {/* add new staff form */}
          <form onSubmit={handleAddStaffSubmit} className="admin-service-form-card">
            <h4>Add New Staff Member</h4>
            <div className="form-input-box">
              <label>Staff Member Full Name</label>
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Enter Staff Member Full Name"
                required
                className="form-text-field"
              />
            </div>
            <div className="form-input-box large-gap">
              <label>Service Specialization / Role</label>
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="form-select-field"
              >
                <option value="Standard Cleaner">Standard Cleaner</option>
                <option value="Deep Clean Expert">Deep Clean Expert</option>
                <option value="Senior Supervisor">Senior Supervisor</option>
              </select>
            </div>
            {/* total visits input field */}
            <div className="form-input-box large-gap">
              <label>Total Visits</label>
              <input
                type="number"
                min="0"
                name="staffVisits"
                defaultValue="0"
                placeholder="Enter total visits"
                className="form-text-field"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full-width">
              <Plus size={16} />
              <span>Add Team Member</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
