import React from 'react';
import './Reports.css';

export default function AdminReports({ bookings, staff, completedCount, totalRevenue }) {
  return (
    <div className="dashboard-panel">
      
      {/* visual chart and analysis summaries */}
      <div className="reports-section-card">
        <div className="reports-panel-header">
          <div>
            <h3>Monthly Revenue Performance</h3>
            <p>Comparison reports across consecutive business operational months.</p>
          </div>
          <button className="btn btn-primary btn-download-csv" onClick={() => alert('Data report downloaded successfully!')}>
            <span>Download CSV Report</span>
          </button>
        </div>

        <div className="empty-state-banner reports-empty-banner">
          <p>No reports are found.</p>
        </div>
      </div>

      {/* annual business summaries list */}
      <div className="reports-section-card mt-12">
        <h3>Operational Stats Summary</h3>
        <div className="stats-grid-row">
          <div className="stat-card-box">
            <span className="stat-card-label">Avg Order Value</span>
            <h4 className="stat-card-val">₹{bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + b.price, 0) / bookings.length) : 0}</h4>
          </div>
          <div className="stat-card-box">
            <span className="stat-card-label">Field Utilization</span>
            <h4 className="stat-card-val">{staff.length > 0 ? Math.round((staff.filter(s => s.status === 'active').length / staff.length) * 100) : 0}%</h4>
          </div>
          <div className="stat-card-box">
            <span className="stat-card-label">Completion Rate</span>
            <h4 className="stat-card-val">{bookings.length > 0 ? Math.round((completedCount / bookings.length) * 100) : 0}%</h4>
          </div>
        </div>
      </div>

    </div>
  );
}
