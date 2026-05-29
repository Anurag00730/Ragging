import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, Loader, ShieldAlert, Award } from 'lucide-react';

export default function TrackComplaint() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [complaint, setComplaint] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError(null);
    setComplaint(null);

    try {
      const response = await fetch('/api/complaints/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackingId: trackingId.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'No complaint details found for this tracking ID');
      }

      setComplaint(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Pending') return 'badge-pending';
    if (status === 'Investigating') return 'badge-investigating';
    if (status === 'Spam') return 'badge-spam';
    return 'badge-resolved';
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '750px' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={22} color="var(--primary)" /> Complaint Status Track Karein
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Apna Tracking ID enter karein (e.g. RAG-8F3A22)"
            className="form-control"
            style={{ fontSize: '1.05rem', letterSpacing: '1px' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }} disabled={loading}>
            {loading ? <Loader size={20} className="animate-spin" /> : 'Search'}
          </button>
        </form>
        {error && (
          <p style={{ color: '#ff8a8a', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
        )}
      </div>

      {complaint && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TRACKING ID: {complaint.trackingId}</span>
              <h3 style={{ fontSize: '1.4rem', marginTop: '0.25rem' }}>{complaint.title}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.25rem' }}>Dept: {complaint.department}</p>
            </div>
            <span className={`badge ${getStatusBadgeClass(complaint.status)}`} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              {complaint.status}
            </span>
          </div>

          {/* Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Incident Date</p>
                <p>{complaint.incidentDate}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <Clock size={18} color="var(--primary)" />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Incident Time</p>
                <p>{complaint.incidentTime}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <MapPin size={18} color="var(--danger)" />
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Spot Location</p>
                <p>{complaint.incidentLocation}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Incident Description:</h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              {complaint.description}
            </p>
          </div>

          {/* Evidence if any */}
          {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Submitted Evidence:</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {complaint.evidenceUrls.map((url, idx) => (
                  <a 
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--glass-border)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    View File {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline of Public Updates */}
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              Investigation Timeline & Updates
            </h4>
            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--glass-border)' }}>
              {complaint.publicUpdates && complaint.publicUpdates.map((update, idx) => (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  {/* Timeline dot */}
                  <div style={{ 
                    position: 'absolute', 
                    left: '-1.95rem', 
                    top: '0.25rem', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    background: idx === complaint.publicUpdates.length - 1 ? 'var(--primary)' : 'var(--text-secondary)',
                    boxShadow: idx === complaint.publicUpdates.length - 1 ? '0 0 8px var(--primary)' : 'none'
                  }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(update.updatedAt).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {update.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
