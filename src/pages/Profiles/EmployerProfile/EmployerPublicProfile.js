import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Globe, Phone, Mail, Edit2, Briefcase, BarChart2 } from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import EmployerSettings from './EmployerSettings.js';
import { useAppData } from '../../../data/useAppData.js';
import { safeUrl } from '../../../utils/safeUrl.js';
import Dialog from '../../../components/Dialog/Dialog';
import './EmployerPublicProfile.css';

export default function EmployerPublicProfile({ user, onNavigate }) {
  const navigate = useNavigate();
  const { employerId } = useParams();
  const { employers, internships } = useAppData();

  // All hooks must be before early returns
  const [showEdit, setShowEdit] = useState(false);

  if (!user) return null; // App.js route guards handle the redirect

  // Resolve which employer to show: by URL param, or the current user's own profile
  let employer = null;
  if (employerId) {
    employer = employers.find(e => String(e.id) === String(employerId));
  } else {
    // Own profile — match by email
    employer = employers.find(e => e.email === user.email);
    if (!employer) {
      // scaffold from user object
      employer = {
        id: null, companyName: user.companyName || user.name,
        contactName: user.name, email: user.email,
        industry: user.industry || '', bio: user.companyInfo || '',
        address: user.mapsLocation || '', phone: user.phone || '',
        website: user.website || '', contactEmail: user.contactEmail || user.email,
        status: 'pending', taxDocs: [], flagged: false,
      };
    }
  }

  if (!employer) {
    return (
      <div className="epro-page">
        <PrimaryNav user={user} onNavigate={onNavigate} />
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Employer profile not found.
        </div>
      </div>
    );
  }

  const isOwner = !employerId && user.role === 'employer' && (
    employer.email === user.email || employer.companyName === user.companyName
  );

  // Get this employer's internships
  const myInternships = internships.filter(i => i.company === employer.companyName);
  const totalApplicants = myInternships.reduce((s, i) => s + (i.applicants?.length || 0), 0);
  const hiredCount = myInternships.reduce(
    (s, i) => s + (i.applicants || []).filter(a => a.status === 'Hired').length, 0
  );
  const initials = (employer.companyName || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="epro-root">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="epro-page">
        {/* Header */}
        <div className="epro-header">
          <button className="epro-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div className="epro-header-content">
            <div className="epro-company-row">
              <div className="epro-avatar">{initials}</div>
              <div className="epro-company-info">
                <h1 className="epro-company-name">{employer.companyName}</h1>
                <p className="epro-company-sub">
                  {[employer.industry, employer.address].filter(Boolean).join(' · ')}
                </p>
                <span className={`epro-status-badge epro-status-${employer.status}`}>
                  {employer.status.charAt(0).toUpperCase() + employer.status.slice(1)}
                </span>
              </div>
            </div>
            {isOwner && (
              <button className="epro-edit-btn" onClick={() => setShowEdit(true)}>
                <Edit2 size={15} /> Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="epro-stats-row">
          <div className="epro-stat">
            <div className="epro-stat-val">{myInternships.length}</div>
            <div className="epro-stat-label">Internships posted</div>
          </div>
          <div className="epro-stat">
            <div className="epro-stat-val">{totalApplicants}</div>
            <div className="epro-stat-label">Total applicants</div>
          </div>
          <div className="epro-stat">
            <div className="epro-stat-val">{hiredCount}</div>
            <div className="epro-stat-label">Students hired</div>
          </div>
        </div>

        <div className="epro-grid">
          {/* About */}
          <div className="epro-card epro-card-wide">
            <div className="epro-card-header"><h2>About</h2></div>
            {employer.bio
              ? <p className="epro-bio">{employer.bio}</p>
              : <p className="epro-empty">No description added yet.</p>
            }
          </div>

          {/* Contact Information */}
          <div className="epro-card">
            <div className="epro-card-header"><h2>Contact information</h2></div>
            <div className="epro-contact-list">
              {employer.phone && (
                <div className="epro-contact-row">
                  <Phone size={15} className="epro-contact-icon" />
                  <span>{employer.phone}</span>
                </div>
              )}
              {(employer.contactEmail || employer.email) && (
                <div className="epro-contact-row">
                  <Mail size={15} className="epro-contact-icon" />
                  <a href={`mailto:${employer.contactEmail || employer.email}`} className="epro-link">
                    {employer.contactEmail || employer.email}
                  </a>
                </div>
              )}
              {employer.website && (
                <div className="epro-contact-row">
                  <Globe size={15} className="epro-contact-icon" />
                  <a href={safeUrl(employer.website)} target="_blank" rel="noopener noreferrer" className="epro-link">
                    {employer.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {employer.address && (
                <div className="epro-contact-row">
                  <MapPin size={15} className="epro-contact-icon" />
                  <span>{employer.address}</span>
                </div>
              )}
              {!employer.phone && !employer.website && !employer.address && (
                <p className="epro-empty">No contact info added yet.</p>
              )}
            </div>
          </div>

          {/* Location map */}
          {(employer.address || employer.mapsLocation) && (
            <div className="epro-card">
              <div className="epro-card-header">
                <h2><MapPin size={15} style={{ marginRight: 6 }} />Location</h2>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(employer.address || employer.mapsLocation)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="epro-maps-link"
                >
                  Open in Maps ↗
                </a>
              </div>
              <iframe
                title="Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(employer.address || employer.mapsLocation)}&output=embed`}
                width="100%" height="180"
                style={{ border: 0, borderRadius: 8 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {/* Active internships */}
          <div className="epro-card epro-card-wide">
            <div className="epro-card-header">
              <h2><Briefcase size={15} style={{ marginRight: 6 }} />Active internships</h2>
            </div>
            {myInternships.length === 0 ? (
              <p className="epro-empty">No internships posted yet.</p>
            ) : (
              <div className="epro-intern-list">
                {myInternships.map(i => (
                  <div key={i.id} className="epro-intern-row">
                    <div>
                      <div className="epro-intern-title">{i.title}</div>
                      <div className="epro-intern-meta">
                        {i.duration} · {i.location} · {(i.skills || []).join(', ')}
                      </div>
                    </div>
                    <span className={`epro-intern-badge epro-intern-${(i.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student statistics (only shown to owner or admin) */}
          {(isOwner || user.role === 'admin') && (
            <div className="epro-card epro-card-wide">
              <div className="epro-card-header">
                <h2><BarChart2 size={15} style={{ marginRight: 6 }} />Student statistics</h2>
              </div>
              <div className="epro-students-grid">
                {myInternships.flatMap(i => (i.applicants || []).map(a => ({ ...a, internshipTitle: i.title }))).length === 0 ? (
                  <p className="epro-empty">No applicants yet.</p>
                ) : (
                  myInternships.map(i => (
                    (i.applicants || []).map(a => (
                      <div key={`${i.id}-${a.id}`} className="epro-student-row">
                        <div className="epro-student-avatar">
                          {(a.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="epro-student-name">{a.name}</div>
                          <div className="epro-student-meta">{i.title} · {a.major}</div>
                        </div>
                        <span className={`epro-student-status epro-app-${(a.status || '').toLowerCase()}`}>
                          {a.status}
                        </span>
                      </div>
                    ))
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal (settings reused) */}
      {showEdit && isOwner && (
        <div className="epro-modal-overlay" onClick={() => setShowEdit(false)}>
          <Dialog className="epro-modal-box" onClose={() => setShowEdit(false)}>
            <EmployerSettings
              user={{ ...user, ...employer }}
              onClose={() => setShowEdit(false)}
            />
          </Dialog>
        </div>
      )}
    </div>
  );
}
