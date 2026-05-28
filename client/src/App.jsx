import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Eye, Send, Lock, LayoutDashboard, Home as HomeIcon } from 'lucide-react';
import Home from './pages/Home';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <header>
        <div className="container nav-wrapper">
          <Link to="/" className="logo">
            <Shield color="var(--primary)" size={22} style={{ fill: 'rgba(245,158,11,0.1)' }} />
            Campus<span>Safe</span>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><HomeIcon size={14} /> Home</span>
            </Link>
            <Link to="/submit" className="nav-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Send size={14} /> Report Incident</span>
            </Link>
            <Link to="/track" className="nav-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={14} /> Track Case</span>
            </Link>
            {isAdminLoggedIn ? (
              <Link to="/admin/dashboard" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LayoutDashboard size={14} /> HOD Panel
              </Link>
            ) : (
              <Link to="/admin/login" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Lock size={14} /> HOD Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      <footer>
        <div className="container">
          <p>© 2026 CampusSafe - Anonymous Anti-Ragging & Campus Helpdesk.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'rgba(255,255,255,0.2)' }}>
            Developed securely with 100% Anonymity protection protocols.
          </p>
        </div>
      </footer>
    </Router>
  );
}
