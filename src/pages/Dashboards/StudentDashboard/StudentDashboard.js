import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Bell,
  Folder,
  Check,
  ArrowRight,
} from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import { useToast } from '../../../components/Toast/Toast';
import FloatingMessages from '../../../components/FloatingMessages/FloatingMessages.js';
import { useAppData } from '../../../data/useAppData';
import { isProjectMember } from '../../../utils/ownership';
import { studentInternshipView } from '../../../utils/internships';
import { todayISO, formatDate } from '../../../utils/time';
import { notificationsFor as visibleNotifications, isNotificationRead } from '../../../utils/notifications';
import { useSectionParam } from '../../../hooks/useSectionParam';
import './StudentDashboard.css';

const NAV_ITEMS = [
  { key: 'Overview',      icon: LayoutDashboard },
  { key: 'Internships',   icon: Briefcase },
  { key: 'Projects',      icon: FolderKanban },
  { key: 'Notifications', icon: Bell },
];

const initialsOf = (name) => (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// Badge class for internship / application status, e.g. 'Currently Hiring' -> 'intern-currently-hiring'.
const internBadgeClass = (status) => `intern-${(status || '').toLowerCase().replace(/\s+/g, '-')}`;

// This user's notifications, with `read` resolved per user.
const notificationsFor = (notifications, user) =>
  visibleNotifications(notifications, user).map(n => ({ ...n, read: isNotificationRead(n, user) }));

function getDashboardData(user, internships, projects, notifications, tasks) {
  const myNotifications = notificationsFor(notifications, user);
  const stats = [
    {
      label: 'Active projects',
      value: projects.filter(p => p.status === 'Active').length,
      sub: `${projects.filter(p => p.flagged).length} flagged`,
    },
    {
      label: 'Internships',
      value: internships.filter(i => i.listingStatus === 'Currently Hiring').length,
      sub: `${internships.filter(i => i.status === 'Interview').length} interview`,
    },
    {
      label: 'Tasks',
      value: tasks.filter(t => t.status === 'Pending').length,
      sub: `${tasks.filter(t => t.overdue && t.status !== 'Completed').length} overdue`,
    },
    {
      label: 'Notifications',
      value: myNotifications.length,
      sub: `${myNotifications.filter(n => !n.read).length} unread`,
    },
  ];

  const projectRows = projects.map(p => ({
    id: p.id,
    title: p.title,
    course: p.course,
    visibility: p.visibility,
  }));

  const taskRows = tasks.map(t => ({
    id: t.id,
    title: t.title,
    projectTitle: t.projectTitle,
    projectId: t.projectId,
    done: t.status === 'Completed',
    due: t.dueDate,
    late: t.overdue,
  }));

  // Everyone you share a project with, de-duplicated.
  const collaboratorMap = new Map();
  projects.forEach(p => (p.collaborators || []).forEach(c => {
    if (c.email && c.email !== user.email && !collaboratorMap.has(c.email)) {
      collaboratorMap.set(c.email, {
        id: c.email,
        name: c.name,
        initials: c.initials || initialsOf(c.name),
        status: (c.status || 'Accepted').toLowerCase() === 'accepted' ? 'accepted' : 'pending',
      });
    }
  }));

  return { stats, projectRows, taskRows, collaborators: [...collaboratorMap.values()], myNotifications };
}

function OverviewSection({ user, firstName, userEmail, internshipData, setPendingApply, navigate, invitations, onAccept, onDecline }) {
  const { projects: allProjects, notifications, tasks: allTasks, updateTask, setNotificationsRead } = useAppData();
  const projects = allProjects.filter(p => isProjectMember(p, user));
  const myProjectIds = new Set(projects.map(p => p.id));
  const tasks = allTasks.filter(t => myProjectIds.has(t.projectId));

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      status: task.status === 'Completed' ? 'Pending' : 'Completed',
      overdue: task.status === 'Completed' ? task.overdue : false,
    });
  };
  const {
    stats, projectRows, taskRows,
    collaborators, myNotifications,
  } = getDashboardData(user, internshipData, projects, notifications, tasks);
  const notificationRows = myNotifications
    .slice(0, 3)
    .map(n => ({ id: n.id, text: n.message, time: n.time, read: n.read }));
  const markAllRead = () => setNotificationsRead(myNotifications.filter(n => !n.read).map(n => n.id), user, true);

  return (
    <>
      {/* Welcome bar */}
      <div className="sd-welcome">
        <div>
          <h1 className="sd-welcome-title">Welcome back, {firstName}</h1>
          <p className="sd-welcome-sub">{user.major || user.email}</p>
        </div>
        <button className="sd-portfolio-btn" onClick={() => navigate('/portfolio')}>
          View Portfolio
        </button>
      </div>

      {/* Stats row */}
      <div className="sd-stats">
        {stats.map(s => (
          <div key={s.label} className="sd-stat">
            <div className="sd-stat-label">{s.label}</div>
            <div className="sd-stat-value">{s.value}</div>
            <div className="sd-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="sd-grid-top">

        {/* Projects card */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">My projects</span>
            <button className="sd-see-all" onClick={() => navigate('/projectview')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {projectRows.map(p => (
            <div key={p.id} className="sd-row">
              <div className="sd-row-icon"><Folder size={16} /></div>
              <div className="sd-row-text">
                <div className="sd-row-name">{p.title}</div>
                <div className="sd-row-sub">{p.course}</div>
              </div>
              <span className={`sd-badge ${p.visibility}`}>
                {p.visibility === 'public' ? 'Public' : 'Private'}
              </span>
            </div>
          ))}
          <button className="sd-add-btn" onClick={() => navigate('/projectview?new=true')}>+ New project</button>
        </div>

        {/* Tasks card */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Tasks</span>
            <button className="sd-see-all" onClick={() => navigate('/alltasks')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {taskRows.map(t => (
            <div key={t.id} className="sd-task-row">
              <button
                type="button"
                role="checkbox"
                aria-checked={t.done}
                aria-label={`${t.title}: ${t.done ? 'mark as pending' : 'mark as complete'}`}
                className={`sd-check ${t.done ? 'done' : ''}`}
                onClick={() => toggleTask(t.id)}
                style={{ cursor: 'pointer', padding: 0 }}
                title={t.done ? 'Mark as pending' : 'Mark as complete'}
              >
                {t.done && <Check size={12} strokeWidth={3} />}
              </button>
              <div style={{ flex: 1 }}>
                <span className={`sd-task-name ${t.done ? 'done' : ''}`}>{t.title}</span>
                {t.projectTitle && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t.projectTitle}
                  </div>
                )}
              </div>
              {t.due && (
                <span className={`sd-task-due ${t.late ? 'late' : ''}`}>
                  {t.due}{t.late ? ' !' : ''}
                </span>
              )}
              {t.done && <span className="sd-task-due">done</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="sd-grid-bottom">

        {/* Notifications + Collaborators */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Recent notifications</span>
            <button type="button" className="sd-see-all" onClick={markAllRead}>Mark all read</button>
          </div>
          {notificationRows.map(n => (
            <div key={n.id} className="sd-notif-row">
              <div className={`sd-notif-dot ${n.read ? 'read' : ''}`} />
              <div>
                <div className="sd-notif-text">{n.text}</div>
                <div className="sd-notif-time">{n.time}</div>
              </div>
            </div>
          ))}

          <div className="sd-card-header" style={{ marginTop: '16px' }}>
            <span className="sd-card-title">Collaborators</span>
          </div>
          {collaborators.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0' }}>No collaborators yet</div>
          )}
          {collaborators.map(c => (
            <div key={c.id} className="sd-collab-row">
              <div className="sd-collab-avatar">{c.initials}</div>
              <span className="sd-collab-name">{c.name}</span>
              <span className={`sd-badge ${c.status}`}>
                {c.status === 'accepted' ? 'Accepted' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Invitations */}
        <div className="sd-card">
          <div className="sd-card-header">
            <span className="sd-card-title">Invitations</span>
          </div>
          {invitations.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0' }}>No pending invitations</div>
          )}
          {invitations.map(inv => (
            <div key={inv.id} className="sd-inv-row">
              <div className="sd-inv-project">{inv.projectTitle}</div>
              <div className="sd-inv-from">from {inv.fromUserName}</div>
              <div className="sd-inv-btns">
                <button className="sd-btn-accept" onClick={() => onAccept(inv.id)}>Accept</button>
                <button className="sd-btn-decline" onClick={() => onDecline(inv.id)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internships preview */}
      <div className="sd-internships-header">
        <span className="sd-card-title">Internship opportunities</span>
        <button className="sd-see-all" onClick={() => navigate('/internships')}>
          View all <ArrowRight size={12} />
        </button>
      </div>

      <div className="sd-internships-grid">
        {internshipData.slice(0, 3).map(intern => (
          <div key={intern.id} className="sd-internship-card">
            <div className="sd-intern-header">
              <div>
                <div className="sd-intern-company">{intern.company}</div>
                <div className="sd-intern-title">{intern.title}</div>
              </div>
              <span className={`sd-badge ${internBadgeClass(intern.status)}`}>{intern.status}</span>
            </div>
            <div className="sd-intern-skills">
              {intern.skills.map(skill => (
                <span key={skill} className="sd-skill-tag">{skill}</span>
              ))}
              <span className="sd-skill-tag">{intern.duration}</span>
            </div>
            <div className="sd-intern-footer">
              {intern.deadline && <span className="sd-intern-deadline">Deadline: {formatDate(intern.deadline)}</span>}
              {intern.appliedDate && <span className="sd-intern-info">Applied {formatDate(intern.appliedDate)}</span>}
              {intern.interviewDate && <span className="sd-intern-info">Interview: {formatDate(intern.interviewDate)}</span>}
            </div>
            {intern.status === 'Currently Hiring' ? (
              <button className="sd-intern-btn" onClick={() => setPendingApply(intern)}>Apply</button>
            ) : (
              <button className="sd-intern-btn sd-intern-btn-view" onClick={() => navigate(`/internships?id=${intern.id}`)}>View</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function InternshipsSection({ internshipData, setPendingApply, navigate }) {
  return (
    <div>
      <div className="sd-internships-header" style={{ marginTop: 0 }}>
        <span className="sd-card-title">All internship opportunities</span>
        <button className="sd-see-all" onClick={() => navigate('/internships')}>
          Full view <ArrowRight size={12} />
        </button>
      </div>
      <div className="sd-internships-grid">
        {internshipData.map(intern => (
          <div key={intern.id} className="sd-internship-card">
            <div className="sd-intern-header">
              <div>
                <div className="sd-intern-company">{intern.company}</div>
                <div className="sd-intern-title">{intern.title}</div>
              </div>
              <span className={`sd-badge ${internBadgeClass(intern.status)}`}>{intern.status}</span>
            </div>
            <div className="sd-intern-skills">
              {intern.skills.map(skill => (
                <span key={skill} className="sd-skill-tag">{skill}</span>
              ))}
              <span className="sd-skill-tag">{intern.duration}</span>
            </div>
            <div className="sd-intern-footer">
              {intern.deadline && <span className="sd-intern-deadline">Deadline: {formatDate(intern.deadline)}</span>}
              {intern.appliedDate && <span className="sd-intern-info">Applied {formatDate(intern.appliedDate)}</span>}
              {intern.interviewDate && <span className="sd-intern-info">Interview: {formatDate(intern.interviewDate)}</span>}
            </div>
            {intern.status === 'Currently Hiring' ? (
              <button className="sd-intern-btn" onClick={() => setPendingApply(intern)}>Apply</button>
            ) : (
              <button className="sd-intern-btn sd-intern-btn-view" onClick={() => navigate(`/internships?id=${intern.id}`)}>View</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection({ user, navigate }) {
  const { projects } = useAppData();
  const { projectRows } = getDashboardData(user, [], projects.filter(p => isProjectMember(p, user)), [], []);
  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <span className="sd-card-title">My projects</span>
        <button className="sd-see-all" onClick={() => navigate('/projectview')}>
          Full view <ArrowRight size={12} />
        </button>
      </div>
      {projectRows.map(p => (
        <div key={p.id} className="sd-row">
          <div className="sd-row-icon"><Folder size={16} /></div>
          <div className="sd-row-text">
            <div className="sd-row-name">{p.title}</div>
            <div className="sd-row-sub">{p.course}</div>
          </div>
          <span className={`sd-badge ${p.visibility}`}>
            {p.visibility === 'public' ? 'Public' : 'Private'}
          </span>
        </div>
      ))}
      <button className="sd-add-btn" onClick={() => navigate('/projectview?new=true')}>+ New project</button>
    </div>
  );
}

function NotificationsSection({ user }) {
  const { notifications, setNotificationsRead } = useAppData();
  const mine = notificationsFor(notifications, user);
  const notificationRows = mine.map(n => ({ id: n.id, text: n.message, time: n.time, read: n.read }));
  const markAllRead = () => setNotificationsRead(mine.filter(n => !n.read).map(n => n.id), user, true);
  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <span className="sd-card-title">Notifications</span>
        <button type="button" className="sd-see-all" onClick={markAllRead}>Mark all read</button>
      </div>
      {notificationRows.map(n => (
        <div key={n.id} className="sd-notif-row">
          <div className={`sd-notif-dot ${n.read ? 'read' : ''}`} />
          <div>
            <div className="sd-notif-text">{n.text}</div>
            <div className="sd-notif-time">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard({ user, onNavigate }) {
  const {
    internships: rawInternships, projects,
    addApplicantToInternship, updateProject,
    projectInvitations, deleteProjectInvitation,
  } = useAppData();
  const navigate = useNavigate();
  const toast = useToast();
  const [pendingApply, setPendingApply] = useState(null);
  const [activeSection, setActiveSection] = useSectionParam('Overview');
  const [messagesOpen, setMessagesOpen] = useState(false);
  
  // Read real invitations for this user from the global persistent store
  const [invitations, setInvitations] = useState(() =>
    (projectInvitations || []).filter(
      inv => inv.toUserEmail === user?.email && inv.status === 'pending'
    )
  );

  // Listing status + this student's own application status (never written back).
  const internshipData = rawInternships
    .filter(i => !i.archived)
    .map(i => studentInternshipView(i, user));

  // NOTE: invitations are NOT re-derived from projects on change —
  // that would resurrect accepted/declined ones.
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Unauthenticated users are redirected by the route guards in App.js.
  if (!user) return null;

  const firstName = user.name?.split(' ')[0] || 'Student';

  const applyToInternship = (intern) => {
    addApplicantToInternship(intern.id, {
      name: user.name,
      email: user.email,
      major: user.major || '',
      status: 'Applied',
      appliedDate: todayISO(),
    });
    setPendingApply(null);
    toast.success(`Application submitted to ${intern.company}!`);
  };

  const handleAcceptInvitation = (invitationId) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      const invitedProject = projects.find(p => p.id === invitation.projectId);
      if (invitedProject) {
        // Mark accepting user as an Accepted collaborator on the project
        const initials = (user.name || '').split(' ').map(n => n[0]).join('').toUpperCase();
        const existingCollabs = invitedProject.collaborators || [];
        const updatedCollabs = [
          ...existingCollabs.filter(c => c.email !== user.email),
          { id: Date.now(), name: user.name, email: user.email, initials, status: 'Accepted', role: null },
        ];
        updateProject(invitation.projectId, { collaborators: updatedCollabs });
        toast.success(`You joined "${invitation.projectTitle}"!`);
      }
      // Remove invitation from global store
      deleteProjectInvitation(invitationId);
    }
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  const handleDeclineInvitation = (id) => {
    deleteProjectInvitation(id);
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    toast.info('Invitation declined.');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Overview':
        return (
          <OverviewSection
            user={user}
            firstName={firstName}
            userEmail={user.email}
            internshipData={internshipData}
            setPendingApply={setPendingApply}
            navigate={navigate}
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        );
      case 'Internships':
        return (
          <InternshipsSection
            internshipData={internshipData}
            setPendingApply={setPendingApply}
            navigate={navigate}
          />
        );
      case 'Projects':
        return <ProjectsSection user={user} navigate={navigate} />;
      case 'Notifications':
        return <NotificationsSection user={user} />;
      default:
        return (
          <OverviewSection
            user={user}
            firstName={firstName}
            userEmail={user.email}
            internshipData={internshipData}
            setPendingApply={setPendingApply}
            navigate={navigate}
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        );
    }
  };

  return (
    <div className="student-dashboard">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="ad-shell">
        <header className="ad-page-header">
          <div>
            <p className="ad-eyebrow">Student panel</p>
            <h1 className="ad-page-title">
              {activeSection === 'Overview' ? `Welcome, ${firstName}` : activeSection}
            </h1>
          </div>
        </header>

        <nav className="ad-tabs" aria-label="Student sections">
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

      {pendingApply && (
        <ConfirmModal
          open
          variant="success"
          title="Apply for this internship?"
          message={`You are about to apply to ${pendingApply.title} at ${pendingApply.company}.`}
          confirmLabel="Yes, apply"
          onConfirm={() => applyToInternship(pendingApply)}
          onClose={() => setPendingApply(null)}
        />
      )}

      <FloatingMessages
        isOpen={messagesOpen}
        onToggle={setMessagesOpen}
        onOpenFullMessages={() => onNavigate('messages')}
        currentUser={user}
      />
    </div>
  );
}