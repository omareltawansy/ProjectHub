import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import FloatingMessages from '../../../components/FloatingMessages/FloatingMessages.js';
import MessagesSection from '../AdminDashboard/sections/MessagesSection.js';
import { useAppData } from '../../../data/useAppData';
import { useSectionParam } from '../../../hooks/useSectionParam';
import { notificationsFor, isNotificationRead } from '../../../utils/notifications';
import './EmployerDashboard.css';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'Overview',    icon: LayoutDashboard },
  { key: 'Internships', icon: Briefcase },
];

// ─── Overview section ─────────────────────────────────────────────────────────
function OverviewSection({ user, myInternships, navigate }) {
  const firstName = user.name?.split(' ')[0] || 'Employer';
  const totalApplicants = myInternships.reduce((sum, i) => sum + (i.applicants?.length ?? 0), 0);
  const openCount = myInternships.filter(i => i.status === 'Open').length;

  return (
    <div>
      {/* Welcome */}
      <div className="ed-welcome">
        <div>
          <h1 className="ed-welcome-title">Welcome back, {firstName}</h1>
          <p className="ed-welcome-sub">{user.name} · Employer account</p>
        </div>
        <button className="ed-manage-btn" onClick={() => navigate('/employer/internships')}>
          Manage Internships
        </button>
      </div>

      {/* Stats */}
      <div className="ed-stats">
        <div className="ed-stat">
          <div className="ed-stat-label">Active postings</div>
          <div className="ed-stat-value">{openCount}</div>
          <div className="ed-stat-sub">Currently open</div>
        </div>
        <div className="ed-stat">
          <div className="ed-stat-label">Total applicants</div>
          <div className="ed-stat-value">{totalApplicants}</div>
          <div className="ed-stat-sub">Across all listings</div>
        </div>
        <div className="ed-stat">
          <div className="ed-stat-label">Total listings</div>
          <div className="ed-stat-value">{myInternships.length}</div>
          <div className="ed-stat-sub">Posted by you</div>
        </div>
      </div>

      {/* My Internships preview */}
      <div className="ed-internships-header">
        <span className="ed-card-title">My internships</span>
        <button className="ed-see-all" onClick={() => navigate('/employer/internships')}>
          View all <ArrowRight size={12} />
        </button>
      </div>

      {myInternships.length === 0 ? (
        <div className="ed-empty">
          <p>No active internships yet.</p>
          <button className="ed-empty-btn" onClick={() => navigate('/employer/internships')}>
            Post your first internship
          </button>
        </div>
      ) : (
        <div className="ed-internships-grid">
          {myInternships.slice(0, 3).map((intern) => (
            <div key={intern.id} className="ed-internship-card">
              <div className="ed-intern-header">
                <div>
                  <div className="ed-intern-company">{intern.company}</div>
                  <div className="ed-intern-title">{intern.title}</div>
                </div>
                <span className={`ed-badge ed-badge-${intern.status.toLowerCase()}`}>
                  {intern.status}
                </span>
              </div>
              <div className="ed-intern-skills">
                {intern.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="ed-skill-tag">{skill}</span>
                ))}
                <span className="ed-skill-tag">{intern.type}</span>
              </div>
              <div className="ed-intern-footer">
                <span>{intern.location} · {intern.duration}</span>
                {intern.deadline && <span className="ed-intern-deadline">Deadline: {intern.deadline}</span>}
                <span className="ed-intern-applicants">
                  {intern.applicants?.length ?? 0} applicant{intern.applicants?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="ed-intern-btn" onClick={() => navigate('/employer/internships')}>
                Manage
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Internships section ──────────────────────────────────────────────────────
function InternshipsSection({ myInternships, navigate }) {
  return (
    <div>
      <div className="ed-internships-header" style={{ marginTop: 0 }}>
        <span className="ed-card-title">All my internships</span>
        <button className="ed-see-all" onClick={() => navigate('/employer/internships')}>
          Full management view <ArrowRight size={12} />
        </button>
      </div>
      {myInternships.length === 0 ? (
        <div className="ed-empty">
          <p>No internships posted yet.</p>
          <button className="ed-empty-btn" onClick={() => navigate('/employer/internships')}>
            Post your first internship
          </button>
        </div>
      ) : (
        <div className="ed-internships-grid">
          {myInternships.map((intern) => (
            <div key={intern.id} className="ed-internship-card">
              <div className="ed-intern-header">
                <div>
                  <div className="ed-intern-company">{intern.company}</div>
                  <div className="ed-intern-title">{intern.title}</div>
                </div>
                <span className={`ed-badge ed-badge-${intern.status.toLowerCase()}`}>
                  {intern.status}
                </span>
              </div>
              <div className="ed-intern-skills">
                {intern.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="ed-skill-tag">{skill}</span>
                ))}
                <span className="ed-skill-tag">{intern.type}</span>
              </div>
              <div className="ed-intern-footer">
                <span>{intern.location} · {intern.duration}</span>
                {intern.deadline && <span className="ed-intern-deadline">Deadline: {intern.deadline}</span>}
                <span className="ed-intern-applicants">
                  {intern.applicants?.length ?? 0} applicant{intern.applicants?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button className="ed-intern-btn" onClick={() => navigate('/employer/internships')}>
                Manage
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications section ────────────────────────────────────────────────────
function NotificationsSection({ user }) {
  const { notifications: notificationsSource } = useAppData();
  const relevant = notificationsFor(notificationsSource, user)
    .map((n) => ({ ...n, read: isNotificationRead(n, user) }));
  const unread = relevant.filter((n) => !n.read).length;

  return (
    <div className="ed-notif-section">
      <div className="ed-notif-header">
        <span className="ed-card-title">Notifications</span>
        {unread > 0 && <span className="ed-notif-badge">{unread} unread</span>}
      </div>
      {relevant.length === 0 ? (
        <p className="ed-empty-text">No notifications yet.</p>
      ) : (
        <ul className="ed-notif-list">
          {relevant.map((n) => (
            <li key={n.id} className={`ed-notif-item${n.read ? ' read' : ''}`}>
              <span className={`ed-notif-dot ed-notif-dot-${n.type}`} />
              <div className="ed-notif-body">
                <p className="ed-notif-message">{n.message}</p>
                <span className="ed-notif-time">{n.time}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EmployerDashboard({ user, onNavigate }) {
  const { internships: internshipSource } = useAppData();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useSectionParam('Overview');
  const [messagesOpen, setMessagesOpen] = useState(false);

  // Unauthenticated users are redirected by the route guards in App.js.
  if (!user) return null;

  const myInternships = internshipSource.filter(
    (i) => i.employerId === user.id && !i.archived
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'Overview':
        return <OverviewSection user={user} myInternships={myInternships} navigate={navigate} />;
      case 'Internships':
        return <InternshipsSection myInternships={myInternships} navigate={navigate} />;
      case 'Notifications':
        return <NotificationsSection user={user} />;
      case 'Messages':
        return <MessagesSection user={user} />;
      default:
        return <OverviewSection user={user} myInternships={myInternships} navigate={navigate} />;
    }
  };

  return (
    <div className="employer-dashboard">
      <PrimaryNav user={user} onNavigate={onNavigate} onSectionNavigate={setActiveSection} />

      <div className="ad-shell">
        <header className="ad-page-header">
          <div>
            <p className="ad-eyebrow">Employer panel</p>
            <h1 className="ad-page-title">
              {activeSection === 'Overview' ? 'Dashboard' : activeSection}
            </h1>
          </div>
        </header>

        <nav className="ad-tabs" aria-label="Employer sections">
          {NAV_ITEMS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`ad-tab${activeSection === key ? ' active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <Icon size={15} />
              <span>{key}</span>
            </button>
          ))}
        </nav>

        <main className="ad-main">
          {renderSection()}
        </main>
      </div>

      <FloatingMessages
        isOpen={messagesOpen}
        onToggle={setMessagesOpen}
        onOpenFullMessages={() => setActiveSection('Messages')}
        currentUser={user}
      />
    </div>
  );
}