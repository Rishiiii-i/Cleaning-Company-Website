import React, { useState, useEffect } from 'react';
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

  // fetch all bookings from database
  const loadBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.map(b => ({
          ...b,
          id: b.id || b._id,
          customerName: b.userEmail ? b.userEmail.split('@')[0] : 'Customer',
          email: b.userEmail
        })));
        // set payments from bookings
        setPayments(data.map(b => ({
          id: `PAY-${String(b.id || b._id).slice(-5).toUpperCase()}`,
          bookingId: b.id || b._id,
          customerName: b.userEmail ? b.userEmail.split('@')[0] : 'Customer',
          serviceType: b.serviceType,
          amount: b.price,
          date: b.date,
          status: b.paymentStatus || 'paid'
        })));
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  // fetch all contact enquiries from database
  const loadEnquiries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.map(e => ({ ...e, id: e.id || e._id })));
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  // fetch all reviews from database
  const loadReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.map(r => ({ ...r, id: r.id || r._id })));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // load services from database
  const loadServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setServices(data.map(s => ({ ...s, id: s.id || s._id })));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // load customers from database
  const loadCustomers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // load staff from database
  const loadStaff = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // load live records on component mount
  useEffect(() => {
    loadBookings();
    loadEnquiries();
    loadReviews();
    loadServices();
    loadCustomers();
    loadStaff();
  }, []);

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

  // change booking status updates in database and local state
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = bookings.map((item) =>
          item.id === bookingId ? { ...item, status: newStatus } : item
        );
        setBookings(updated);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  // toggle enquiry resolution status in database and state
  const handleToggleEnquiryStatus = async (id) => {
    const item = enquiries.find(e => (e.id || e._id) === id);
    const nextStatus = item?.status === 'pending' ? 'resolved' : 'pending';
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = enquiries.map(e =>
          (e.id || e._id) === id ? { ...e, status: nextStatus } : e
        );
        setEnquiries(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating enquiry status:', err);
      return false;
    }
  };

  // delete enquiry from database and state
  const handleDeleteEnquiry = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/enquiries/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEnquiries(enquiries.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting enquiry:', err);
    }
  };

  // delete review from database and state
  const handleDeleteReview = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReviews(reviews.filter(r => (r.id || r._id) !== id));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
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

  // delete service from database
  const handleDeleteService = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE' });
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  // add new customer
  const handleAddCustomer = async (data) => {
    try {
      const res = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const created = await res.json();
        setCustomers([...customers, created]);
      } else {
        setCustomers([...customers, { ...data, id: `c-${Date.now()}` }]);
      }
    } catch (err) {
      setCustomers([...customers, { ...data, id: `c-${Date.now()}` }]);
    }
  };

  // delete customer
  const handleDeleteCustomer = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  // delete staff member
  const handleDeleteStaff = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/staff/${id}`, { method: 'DELETE' });
      setStaff(staff.filter(s => s.id !== id));
    } catch (err) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  // change staff status
  const handleStaffStatusChange = async (id) => {
    const member = staff.find(s => s.id === id);
    const nextStatus = member?.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`http://localhost:5000/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      setStaff(staff.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    } catch (err) {
      setStaff(staff.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    }
  };

  // change payment status
  const handlePaymentStatusChange = (id, newStatus) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  // sync payment status update to database
  const syncPaymentStatus = async (id, newStatus, optionalBookingId) => {
    const payment = payments.find(p => p.id === id || p.bookingId === id);
    const bookingId = optionalBookingId || payment?.bookingId || id;
    try {
      if (bookingId && !String(bookingId).startsWith('PAY-')) {
        await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus: newStatus })
        });
      }
      setBookings(prev => prev.map(b => (b.id === bookingId || b._id === bookingId) ? { ...b, paymentStatus: newStatus } : b));
    } catch (err) {
      console.error(err);
    }
  };

  // attach admin handlers for child components
  if (typeof window !== 'undefined') {
    window.adminHandlers = {
      handleDeleteService,
      handleAddCustomer,
      handleDeleteCustomer,
      handleDeleteStaff,
      handleStaffStatusChange,
      handlePaymentStatusChange: async (id, newStatus, optionalBookingId) => {
        handlePaymentStatusChange(id, newStatus);
        await syncPaymentStatus(id, newStatus, optionalBookingId);
      },
      loadStaff,
      handleAddStaff: async (staffData) => {
        try {
          const res = await fetch('http://localhost:5000/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(staffData)
          });
          if (res.ok) {
            const saved = await res.json();
            setStaff(prev => [...prev, saved]);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
  }

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaysBookingsCount = bookings.filter(b => b.date === todayDateStr).length;
  const pendingCount = bookings.filter(b => b.status === 'scheduled' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  const pendingEnquiriesCount = enquiries.filter(e => e.status === 'pending').length;

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
              <span>Contact Enquiries {pendingEnquiriesCount > 0 ? `(${pendingEnquiriesCount})` : ''}</span>
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
              handleDeleteReview={handleDeleteReview}
            />
          )}

          {activeTab === 'enquiries' && (
            <AdminEnquiries
              enquiries={enquiries}
              handleToggleEnquiryStatus={handleToggleEnquiryStatus}
              handleDeleteEnquiry={handleDeleteEnquiry}
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
