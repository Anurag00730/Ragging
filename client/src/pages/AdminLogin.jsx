import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const textData = await response.text();
        throw new Error(textData || 'Authentication failed');
      }

      if (!response.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }

      // Store token and admin info in localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Redirect to Admin Dashboard
      navigate('/admin/dashboard');
      window.location.reload(); // Refresh to update app state headers
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '5rem 0', maxWidth: '450px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem' }}>HOD / Admin Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Sign in to check and manage complaints.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#ff8a8a', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={15} /> Official Email
            </label>
            <input 
              type="email" 
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hod@college.edu"
              className="form-control"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={15} /> Password
            </label>
            <input 
              type="password" 
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-control"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', height: '45px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
          <p>Demo Account seeded automatically on first launch:</p>
          <p style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
            <strong>User:</strong> hod@college.edu | <strong>Pass:</strong> hodadmin123
          </p>
        </div>
      </div>
    </div>
  );
}
