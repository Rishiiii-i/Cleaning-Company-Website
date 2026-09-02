import React from 'react';
import './Reports.css';

export default function AdminReports({ bookings, staff, completedCount, totalRevenue }) {
  // download bookings data as csv file
  const downloadCSV = () => {
    const list = bookings || [];
    if (list.length === 0) {
      alert('Data report downloaded successfully!');
      return;
    }
    const headers = 'ID,Customer,Service,Price,Date,Status\n';
    const rows = list
      .map(
        (b) =>
          `${b.id},"${b.customerName || b.userEmail || 'Customer'}","${b.serviceType}",${b.price},"${b.date}","${b.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'business-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // attach click handler to download button
  React.useEffect(() => {
    const btn = document.querySelector('.btn-download-csv');
    if (!btn) return;
    const clickHandler = (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      downloadCSV();
    };
    btn.addEventListener('click', clickHandler, true);
    return () => btn.removeEventListener('click', clickHandler, true);
  }, [bookings]);

  // calculate monthly revenue data from bookings
  const monthlyData = React.useMemo(() => {
    const list = bookings || [];
    const map = {};
    list.forEach((b) => {
      const d = b.date ? new Date(b.date) : new Date();
      const key = isNaN(d.getTime()) ? 'Current Month' : d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!map[key]) {
        map[key] = { month: key, revenue: 0, count: 0 };
      }
      map[key].revenue += Number(b.price) || 0;
      map[key].count += 1;
    });
    return Object.values(map);
  }, [bookings]);

  // max revenue for progress bar
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  // hide empty banner when bookings exist
  React.useEffect(() => {
    const banner = document.querySelector('.reports-empty-banner');
    if (banner) {
      banner.style.display = (bookings && bookings.length > 0) ? 'none' : 'block';
    }
  }, [bookings]);
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
        {/* visual monthly revenue performance chart */}
        {monthlyData.length > 0 && (
          <div className="monthly-chart-box">
            {monthlyData.map((item) => (
              <div key={item.month} className="monthly-chart-bar-row">
                <div className="monthly-chart-meta">
                  <strong>{item.month}</strong>
                  <span>₹{item.revenue} ({item.count} bookings)</span>
                </div>
                <div className="monthly-bar-track">
                  <div
                    className="monthly-bar-fill"
                    style={{ width: `${Math.min(100, Math.round((item.revenue / maxRevenue) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* recent bookings report list */}
        {bookings && bookings.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ margin: '0 0 14px 4px', fontSize: '1.05rem', color: 'var(--secondary)', fontWeight: 700 }}>Completed Bookings Breakdown</h4>
            <div className="admin-table-wrapper">
              <table className="admin-data-table simple-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 8).map((b) => (
                    <tr key={b.id || b._id}>
                      <td><strong>{b.id || b._id}</strong></td>
                      <td>{b.customerName || b.userEmail || 'Customer'}</td>
                      <td className="capitalize-text">{b.serviceType}</td>
                      <td><strong className="primary-color-text">₹{b.price}</strong></td>
                      <td>
                        <span className={`table-select-status ${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
