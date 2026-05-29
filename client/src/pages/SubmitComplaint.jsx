import React, { useState } from 'react';
import { ShieldAlert, Calendar, Clock, MapPin, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

export default function SubmitComplaint() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Ragging',
    description: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    department: 'Computer Science'
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('incidentDate', formData.incidentDate);
    data.append('incidentTime', formData.incidentTime);
    data.append('incidentLocation', formData.incidentLocation);
    data.append('department', formData.department);

    for (let i = 0; i < files.length; i++) {
      data.append('evidence', files[i]);
    }

    try {
      const response = await fetch('/api/complaints/submit', {
        method: 'POST',
        body: data
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.msg || 'Submission failed');
      }

      setSuccessData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(successData.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (successData) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '600px' }}>
        <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle size={60} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Complaint Submitted Anonymously!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Aapki details successfully store ho gayi hain. HOD/Admin jald hi action lenge.
            </p>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
              Aapka Complaint Tracking ID
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '2px', color: 'var(--primary)' }}>
                {successData.trackingId}
              </span>
              <button 
                onClick={copyToClipboard}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                title="Copy tracking ID"
              >
                <Copy size={20} className={copied ? 'text-success' : ''} />
              </button>
            </div>
            {copied && <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Copied to clipboard!</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
            <p><strong>Note:</strong> Is Tracking ID ko likh kar rakh lein. Iske bina aap status check nahi kar paenge.</p>
            <p>Aapki identity hidden hai, humne aapka koi details save nahi kiya.</p>
          </div>

          <button onClick={() => window.location.href = '/'} className="btn btn-primary">
            Home par wapas jayein
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <ShieldAlert size={36} color="var(--danger)" />
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Anonymous Complaint Submission</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill in details accurately. HOD camera checks ke liye timeline and spot use karenge.</p>
          </div>
        </div>

        {/* Anti-spam notice */}
        <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong style={{ color: '#fff' }}>Anti-Spam Warning:</strong> Faltu ya fake reports na file karein. Ek device se limited report submit kiye jaa sakte hain. Server logs system abuse rokne ke liye design kiya gaya hai.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#ff8a8a', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Complaint Title (Short summary)</label>
            <input 
              type="text" 
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Hostels me 1st year students ko tang krna"
              className="form-control"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select 
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Ragging">Ragging</option>
                <option value="Harassment">Harassment</option>
                <option value="Physical Abuse">Physical Abuse</option>
                <option value="Verbal Abuse">Verbal Abuse</option>
                <option value="Cyber Bullying">Cyber Bullying</option>
                <option value="Academic issue">Academic issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Related Department (HOD route)</label>
              <select 
                name="department"
                id="department"
                value={formData.department}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="General Administration">General Administration / Hostels</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginTop: '0.5rem' }}>
            <div className="form-group">
              <label htmlFor="incidentDate" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} /> Date of Incident (Kab hua)
              </label>
              <input 
                type="date" 
                name="incidentDate"
                id="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="incidentTime" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={16} /> Approximate Time (Kis samay hua)
              </label>
              <input 
                type="time" 
                name="incidentTime"
                id="incidentTime"
                value={formData.incidentTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="incidentLocation" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={16} /> Exact Location of Incident (Kahan hua - so HOD camera check kar sakein)
            </label>
            <input 
              type="text" 
              name="incidentLocation"
              id="incidentLocation"
              value={formData.incidentLocation}
              onChange={handleChange}
              placeholder="e.g. Canteen block back entrance, Hostel-3 room 204 corridor, Main gate park"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description (Incident details)</label>
            <textarea 
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ghabraye nahi, details clearly likhein. Kisi ka naam bataye bina kya hua wo explain karein."
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="evidence">Evidence / proof upload (Optional - Max 5 files, images/docs)</label>
            <input 
              type="file" 
              name="evidence"
              id="evidence"
              multiple
              onChange={handleFileChange}
              className="form-control"
              accept=".jpg,.jpeg,.png,.pdf,.docx,.doc"
              style={{ padding: '0.5rem' }}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Hum in photos ke andar se meta-details (location, phone name) generate and remove kar dete hain to keep you anonymous.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-danger" 
            style={{ width: '100%', marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'Submitting anonymously...' : 'Anonymous Report Submit Karein'}
          </button>
        </form>
      </div>
    </div>
  );
}
