import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CustomerDashboard from './pages/customer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Session from './components/session';

// main application routing component
export default function App() {
  return (
    <Router>
      <Session />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* client dashboard control route */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/dashboard/*" element={<CustomerDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/*" element={<CustomerDashboard />} />
        {/* administrator operation route */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
