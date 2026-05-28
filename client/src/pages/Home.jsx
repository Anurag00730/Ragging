import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Search, Info, HelpCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <section className="hero">
        <h1>
          Anonymous <span>Anti-Ragging</span> & Campus Helpdesk
        </h1>
        <p>
          Students is portal par anonymously (bina apna naam bataye) ragging, harassment ya campus ki kisi bhi problem ko report kar sakte hain. Aapki identity 100% hidden rahegi.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/submit" className="btn btn-danger" style={{ fontSize: '1.1rem', padding: '0.8rem 1.8rem' }}>
            <ShieldAlert size={20} /> Anonymous Report File Karein
          </Link>
          <Link to="/track" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '0.8rem 1.8rem' }}>
            <Search size={20} /> Complaint Status Track Karein
          </Link>
        </div>
      </section>

      <div className="options-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
              <ShieldAlert size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem' }}>100% Secure & Anonymous</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Hum aapka IP address, device information ya koi bhi personal account link save nahi karte hain. Aap safe hokar college ki kisi bhi pareshani ko report kar sakte hain.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
              <Search size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem' }}>Incident Tracking ID</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Submission ke baad aapko ek unique **Tracking ID** milegi. Us ID ka use karke aap HOD ke updates, status changes, aur timeline check kar sakte hain bina log-in kiye.
          </p>
        </div>
      </div>

      <section className="info-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={20} color="var(--primary)" /> Emergency Helplines & Guidelines
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>National Anti-Ragging Helpline</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Toll Free Number: <strong>1800-180-5522</strong> (24x7 available)</p>
            <p style={{ color: 'var(--text-secondary)' }}>Email: helpline@antiragging.in</p>
          </div>
          <div className="card" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>College Discipline Rules</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              UGC regulations ke according ragging ek punishable offense hai. Kisi bhi tarah ka physical abuse, verbal abuse, threat ya bullying direct suspension aur police inquiry ka subect banega.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
