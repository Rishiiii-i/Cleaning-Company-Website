import React from 'react';
import { Plus } from 'lucide-react';
import './Staff.css';

export default function AdminStaff({
  staff,
  newStaffName,
  setNewStaffName,
  newStaffRole,
  setNewStaffRole,
  handleAddStaffSubmit
}) {
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
            {staff.length > 0 ? (
              <table className="admin-data-table simple-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Assigned Role</th>
                    <th>Total Jobs</th>
                    <th>Shift Status</th>
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
