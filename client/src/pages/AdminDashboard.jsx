import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, CheckCircle2, AlertCircle, FileText, Calendar, Clock, MapPin, Eye, RefreshCw, Send, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('MyDept'); // 'MyDept' or 'AllDepts'
  const [searchTerm, setSearchTerm] = useState('');

  // Actions state
  const [statusUpdate, setStatusUpdate] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const adminToken = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!adminToken || !adminUser) {
      navigate('/admin/login');
      return;
    }
    fetchComplaints();
  }, [adminToken, deptFilter]);

  useEffect(() => {
    filterData();
  }, [complaints, statusFilter, searchTerm]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const isMyDept = deptFilter === 'MyDept';
      const response = await fetch(`/api/complaints?filterDept=${isMyDept}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...complaints];

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }

    // Search term (ID, Title, Location)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.trackingId.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.incidentLocation.toLowerCase().includes(term)
      );
    }

    setFilteredComplaints(result);
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdate(complaint.status);
    setPublicMessage('');
    setNewInternalNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          status: statusUpdate,
          publicMessage: publicMessage.trim() || `Status updated to: ${statusUpdate}`
        })
      });

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.msg || 'Failed to update status');

      // Update local state
      setComplaints(complaints.map(c => c._id === updated._id ? updated : c));
      setSelectedComplaint(updated);
      setPublicMessage('');
      alert('Status updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !newInternalNote.trim()) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/complaints/${selectedComplaint._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          note: newInternalNote.trim()
        })
      });

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.msg || 'Failed to add note');

      // Update local state
      setComplaints(complaints.map(c => c._id === updated._id ? updated : c));
      setSelectedComplaint(updated);
      setNewInternalNote('');
      alert('Internal Note added successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
    window.location.reload();
  };

  const getStatusCounts = () => {
    return {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      investigating: complaints.filter(c => c.status === 'Investigating').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length
    };
  };

  const counts = getStatusCounts();

  if (!adminUser) return null;

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '1200px' }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
            <Shield size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Welcome, <strong>{adminUser.name}</strong> ({adminUser.department} Department)
            </p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Counters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Complaints</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{counts.total}</h3>
          </div>
          <FileText size={32} color="var(--text-secondary)" />
        </div>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--danger)' }}>
          <div>
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Pending Action</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{counts.pending}</h3>
          </div>
          <AlertCircle size={32} color="var(--danger)" />
        </div>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--info)' }}>
          <div>
            <p style={{ color: 'var(--info)', fontSize: '0.85rem' }}>Investigating</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{counts.investigating}</h3>
          </div>
          <RefreshCw size={32} color="var(--info)" />
        </div>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--success)' }}>
          <div>
            <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Resolved Cases</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{counts.resolved}</h3>
          </div>
          <CheckCircle2 size={32} color="var(--success)" />
        </div>
      </div>

      {/* Main Workspace: Table List & Detail Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedComplaint ? '1.2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Table of tickets */}
        <div className="card" style={{ overflow: 'hidden', padding: '1.5rem' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setStatusFilter('All')} 
                className={`btn btn-secondary ${statusFilter === 'All' ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: statusFilter === 'All' ? 'var(--bg-tertiary)' : '' }}
              >
                All ({counts.total})
              </button>
              <button 
                onClick={() => setStatusFilter('Pending')} 
                className={`btn btn-secondary`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', background: statusFilter === 'Pending' ? 'rgba(239, 68, 68, 0.1)' : '' }}
              >
                Pending ({counts.pending})
              </button>
              <button 
                onClick={() => setStatusFilter('Investigating')} 
                className={`btn btn-secondary`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--info)', background: statusFilter === 'Investigating' ? 'rgba(59, 130, 246, 0.1)' : '' }}
              >
                Investigating ({counts.investigating})
              </button>
              <button 
                onClick={() => setStatusFilter('Resolved')} 
                className={`btn btn-secondary`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--success)', background: statusFilter === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' : '' }}
              >
                Resolved ({counts.resolved})
              </button>
            </div>

            {/* Department Scope Selector */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={deptFilter} 
                onChange={(e) => setDeptFilter(e.target.value)}
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="MyDept">My Department ({adminUser.department})</option>
                <option value="AllDepts">All Departments</option>
              </select>
              <button onClick={fetchComplaints} className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Refresh list">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tracking ID, Title, or Location..."
              className="form-control"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          {/* Table Container */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading complaints data...</div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No complaints found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Title</th>
                    <th style={{ padding: '0.75rem' }}>Incident Date/Location</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr 
                      key={c._id} 
                      style={{ 
                        borderBottom: '1px solid var(--glass-border)', 
                        background: selectedComplaint?._id === c._id ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectComplaint(c)}
                    >
                      <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>{c.trackingId}</td>
                      <td style={{ padding: '0.75rem' }}>{c.category}</td>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>{c.incidentDate}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                          <MapPin size={10} color="var(--danger)" /> {c.incidentLocation.length > 20 ? c.incidentLocation.substring(0, 20) + '...' : c.incidentLocation}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} className={`badge ${c.status === 'Pending' ? 'badge-pending' : c.status === 'Investigating' ? 'badge-investigating' : 'badge-resolved'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); handleSelectComplaint(c); }}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Details Panel */}
        {selectedComplaint && (
          <div className="card" style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            
            {/* Detail Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {selectedComplaint.trackingId}</span>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>{selectedComplaint.title}</h2>
                <p style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Department: {selectedComplaint.department}</p>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Time & Spot Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="var(--primary)" /> <span><strong>Date:</strong> {selectedComplaint.incidentDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} color="var(--primary)" /> <span><strong>Time:</strong> {selectedComplaint.incidentTime}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="var(--danger)" /> <span style={{ color: '#fff' }}><strong>Spot Location:</strong> {selectedComplaint.incidentLocation}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description:</h4>
              <p style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--glass-border)', whiteSpace: 'pre-wrap' }}>
                {selectedComplaint.description}
              </p>
            </div>

            {/* Evidence Link */}
            {selectedComplaint.evidenceUrls && selectedComplaint.evidenceUrls.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Attached Evidence:</h4>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {selectedComplaint.evidenceUrls.map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.35rem 0.75rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}
                    >
                      File {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action 1: Update Status (Sends updates to student) */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} color="var(--primary)" /> Update Status & Notify Student
              </h4>
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    value={statusUpdate} 
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    className="form-control"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <textarea 
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                    placeholder="Public message to student tracker (e.g. Action initiated, campus cameras are being audited for the specified timestamp)"
                    className="form-control"
                    style={{ fontSize: '0.85rem', minHeight: '60px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem' }} disabled={actionLoading}>
                  Update Status
                </button>
              </form>
            </div>

            {/* Action 2: Internal Admin Notes (Hidden from Student) */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#ff8a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <PlusCircle size={16} /> Private Internal Notes (Hidden from Student)
              </h4>
              
              {/* Existing Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', maxHeight: '120px', overflowY: 'auto' }}>
                {selectedComplaint.internalNotes && selectedComplaint.internalNotes.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No internal logs added.</p>
                ) : (
                  selectedComplaint.internalNotes && selectedComplaint.internalNotes.map((note, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', borderLeft: '2px solid var(--primary)' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>By: {note.adminName} on {new Date(note.createdAt).toLocaleString()}</p>
                      <p style={{ color: 'var(--text-primary)', marginTop: '0.15rem' }}>{note.note}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddInternalNote} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  placeholder="e.g. Checked CCTV, spotted victim at 14:15 near canteen"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  required
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0 0.75rem' }} disabled={actionLoading}>
                  <Send size={14} />
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
