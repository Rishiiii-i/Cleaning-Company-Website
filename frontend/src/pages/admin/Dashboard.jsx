import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import { User, LogOut, ShieldCheck, Users, Briefcase, Calendar, FileText, Star, Mail, TrendingUp } from 'lucide-react';
import './Dashboard.css';
import '../customer/Dashboard.css'; // import customer CSS to share theme layout properties

import AdminOverview from './Overview';
import AdminCustomers from './Customers';
import AdminServices from './Services';
import AdminBookings from './Bookings';
import AdminStaff from './Staff';
import AdminPayments from './Payments';
import AdminReviews from './Reviews';
import AdminEnquiries from './Enquiries';
import AdminReports from './Reports';

export default function AdminDashboard() {
  // safely retrieve user from localStorage
  const getUserLS = () => {
    try {
      const data = localStorage.getItem('user');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return { name: "Admin Operations", email: "admin@gmail.com" };
  };
  const userLS = getUserLS();

  // Dashboard active tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Initial bookings state
  const [bookings, setBookings] = useState([]);

  // Initial staff list state
  const [staff, setStaff] = useState([]);

  // Initial services state
  const [services, setServices] = useState([
    { id: 'standard', name: 'Standard Cleaning', price: 120, desc: 'covers kitchen cleaning, bathrooms, bedroom dusting, and floor vacuuming.' },
    { id: 'deep', name: 'Deep Cleaning', price: 200, desc: 'thorough scrub including inside cabinets, oven cleaning, tiles, and glass windows.' },
    { id: 'move', name: 'Move In/Out Cleaning', price: 280, desc: 'complete sanitization of empty apartments for relocation inspections.' },
    { id: 'office', name: 'Office Cleaning', price: 350, desc: 'specialized disinfection for desk grids, conference halls, and public corporate lobbies.' }
  ]);

  // Initial customers state
  const [customers, setCustomers] = useState([]);

  // Initial payments state
  const [payments, setPayments] = useState([]);

  // Initial reviews state
  const [reviews, setReviews] = useState([]);

  // Initial contact enquiries state
  const [enquiries, setEnquiries] = useState([]);

  // Modal and input edit state variables
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  // New staff addition states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Standard Cleaner');

  // New service addition states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // assign staff member to a booking
  const handleAssignStaff = (bookingId, staffName) => {
    const updated = bookings.map((item) =>
      item.id === bookingId ? { ...item, assignedStaff: staffName } : item
    );
    setBookings(updated);
  };

  // change booking status updates
  const handleStatusChange = (bookingId, newStatus) => {
    const updated = bookings.map((item) =>
      item.id === bookingId ? { ...item, status: newStatus } : item
    );
    setBookings(updated);
  };

  // toggle enquiry resolution status
  const handleToggleEnquiryStatus = (id) => {
    const updated = enquiries.map(e => 
      e.id === id ? { ...e, status: e.status === 'pending' ? 'resolved' : 'pending' } : e
    );
    setEnquiries(updated);
  };

  // handle user logout request
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // update base pricing of an existing service
  const handleSaveServicePrice = (id) => {
    const updated = services.map((item) =>
      item.id === id ? { ...item, price: parseFloat(editPriceInput) || item.price } : item
    );
    setServices(updated);
    setEditingServiceId(null);
    setEditPriceInput('');
  };

  // add new staff member into system database
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newWorker = {
      id: `S${Math.floor(10 + Math.random() * 90)}`,
      name: newStaffName,
      role: newStaffRole,
      status: 'active',
      jobsCount: 0
    };

    setStaff([...staff, newWorker]);
    setNewStaffName('');
  };

  // add new service to catalog
  const handleAddServiceSubmit = (e) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService = {
      id: newServiceName.toLowerCase().replace(/\s+/g, '-'),
      name: newServiceName,
      price: parseFloat(newServicePrice) || 99,
      desc: newServiceDesc
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  // calculate summary statistics for dynamic cards (disabled for layouts mode)
  const todaysBookingsCount = 0;
  const pendingCount = 0;
  const completedCount = 0;
  const totalRevenue = 0;

  return (
    <div className="customer-dashboard-page">
      <Navbar
        portalName="Admin portal"
        activeTab={activeTab}
      />
      <div className="customer-dashboard-container">
        
        {/* sidebar panel layout */}
        <aside className="dashboard-sidebar">
          
          <nav className="sidebar-nav">
            <p className="sidebar-nav-label">Overview</p>
            <button
              className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <ShieldCheck size={18} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={18} />
              <span>Customers</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              <Briefcase size={18} />
              <span>Services</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar size={18} />
              <span>Bookings ({pendingCount})</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <User size={18} />
              <span>Staff</span>
            </button>

            <p className="sidebar-nav-label sidebar-nav-label-secondary">Reports & logs</p>
            <button
              className={`nav-item-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <FileText size={18} />
              <span>Payments</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={18} />
              <span>Reviews</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
              onClick={() => setActiveTab('enquiries')}
            >
              <Mail size={18} />
              <span>Contact Enquiries</span>
            </button>
            <button
              className={`nav-item-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <TrendingUp size={18} />
              <span>Reports</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="user-profile-summary">
              <div className="avatar-placeholder">
                <User size={22} />
              </div>
              <div className="user-text-info">
                <h4>{userLS.name || 'Admin'}</h4>
                <p>{userLS.email || 'admin@gmail.com'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout-client">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* main content display area */}
        <main className="dashboard-main-content">
          {activeTab === 'overview' && (
            <AdminOverview 
              customers={customers}
              bookings={bookings}
              todaysBookingsCount={todaysBookingsCount}
              pendingCount={pendingCount}
              completedCount={completedCount}
              totalRevenue={totalRevenue}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers customers={customers} />
          )}

          {activeTab === 'services' && (
            <AdminServices 
              services={services}
              editingServiceId={editingServiceId}
              setEditingServiceId={setEditingServiceId}
              editPriceInput={editPriceInput}
              setEditPriceInput={setEditPriceInput}
              newServiceName={newServiceName}
              setNewServiceName={setNewServiceName}
              newServicePrice={newServicePrice}
              setNewServicePrice={setNewServicePrice}
              newServiceDesc={newServiceDesc}
              setNewServiceDesc={setNewServiceDesc}
              handleSaveServicePrice={handleSaveServicePrice}
              handleAddServiceSubmit={handleAddServiceSubmit}
            />
          )}

          {activeTab === 'bookings' && (
            <AdminBookings 
              bookings={bookings}
              services={services}
              staff={staff}
              handleAssignStaff={handleAssignStaff}
              handleStatusChange={handleStatusChange}
            />
          )}

          {activeTab === 'staff' && (
            <AdminStaff 
              staff={staff}
              newStaffName={newStaffName}
              setNewStaffName={setNewStaffName}
              newStaffRole={newStaffRole}
              setNewStaffRole={setNewStaffRole}
              handleAddStaffSubmit={handleAddStaffSubmit}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPayments 
              payments={payments}
              services={services}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviews 
              reviews={reviews}
              services={services}
            />
          )}

          {activeTab === 'enquiries' && (
            <AdminEnquiries 
              enquiries={enquiries}
              handleToggleEnquiryStatus={handleToggleEnquiryStatus}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReports 
              bookings={bookings}
              staff={staff}
              completedCount={completedCount}
              totalRevenue={totalRevenue}
            />
          )}
        </main>
      </div>
    </div>
  );
}
