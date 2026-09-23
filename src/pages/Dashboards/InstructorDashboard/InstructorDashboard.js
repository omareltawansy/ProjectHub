import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Star,
  ArrowRight,
  Link2,
  Unlink2,
  Flag,
  MessageSquare,
  Mail,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.js';
import { useToast } from '../../../components/Toast/Toast';
import FloatingMessages from '../../../components/FloatingMessages/FloatingMessages.js';
import { useAppData } from '../../../data/useAppData.js';
import MessagesSection from '../AdminDashboard/sections/MessagesSection.js';
import { useSectionParam } from '../../../hooks/useSectionParam';
import { notificationsFor, isNotificationRead } from '../../../utils/notifications';
import { activatableProps } from '../../../utils/a11y';
import { nowStamp, todayISO, formatDate } from '../../../utils/time';
import './InstructorDashboard.css';

const BACHELOR_ID = 1;

const NAV_ITEMS = [
  { key: 'Overview',    icon: LayoutDashboard },
  { key: 'Courses',     icon: BookOpen },
  { key: 'Projects',    icon: FolderKanban },
  { key: 'Invitations', icon: Mail },
];


// ─── Star picker ─────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value ?? 0;
  return (
    <div className="id-star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`id-star-btn${display >= n ? ' filled' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} stars`}
        >
          ★
        </button>
      ))}
      {value != null && <span className="id-star-val">{value.toFixed(1)}/5</span>}
    </div>
  );
}

// ─── Overview section ─────────────────────────────────────────────────────────
function OverviewSection({ user, myCourses, myProjects, setActiveSection }) {
  const firstName = user.name?.split(' ')[0] || 'Instructor';
  const flaggedCount = myProjects.filter(p => p.flagged).length;
  const appealCount  = myProjects.filter(p => p.appeal).length;

  return (
    <div className="id-overview">
      <div className="id-welcome">
        <div>
          <h1 className="id-welcome-title">Welcome back, {firstName}</h1>
          <p className="id-welcome-sub">{user.name} · Instructor</p>
        </div>
      </div>

      <div className="id-stats">
        <div className="id-stat">
          <div className="id-stat-label">My courses</div>
          <div className="id-stat-value">{myCourses.length}</div>
          <div className="id-stat-sub">Currently teaching</div>
        </div>
        <div className="id-stat">
          <div className="id-stat-label">Student projects</div>
          <div className="id-stat-value">{myProjects.length}</div>
          <div className="id-stat-sub">Across all courses</div>
        </div>
        <div className="id-stat">
          <div className="id-stat-label">Flagged projects</div>
          <div className="id-stat-value">{flaggedCount}</div>
          <div className="id-stat-sub">Need review</div>
        </div>
        <div className="id-stat">
          <div className="id-stat-label">Pending appeals</div>
          <div className="id-stat-value">{appealCount}</div>
          <div className="id-stat-sub">Awaiting response</div>
        </div>
      </div>

      <div className="id-grid">
        <div className="id-card">
          <div className="id-card-header">
            <span className="id-card-title">My courses</span>
            <button className="id-see-all" onClick={() => setActiveSection('Courses')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {myCourses.length === 0 ? (
            <p className="id-empty-text">No courses linked.</p>
          ) : (
            myCourses.map(c => (
              <div key={c.id} className="id-course-row">
                <div className="id-course-icon"><BookOpen size={15} /></div>
                <div>
                  <div className="id-course-name">{c.name}</div>
                  <div className="id-course-code">{c.code}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="id-card">
          <div className="id-card-header">
            <span className="id-card-title">Recent student projects</span>
            <button className="id-see-all" onClick={() => setActiveSection('Projects')}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {myProjects.slice(0, 4).map(p => (
            <div key={p.id} className="id-project-row">
              <div className="id-project-info">
                <div className="id-project-name">{p.title}</div>
                <div className="id-project-meta">{p.studentName} · {p.course}</div>
              </div>
              <div className="id-project-right">
                {p.flagged && <span className="id-badge id-badge-flagged">Flagged</span>}
                {p.appeal && <span className="id-badge id-badge-appeal">Appeal</span>}
                {!p.flagged && !p.appeal && (
                  <span className={`id-badge id-badge-${(p.status || "active").toLowerCase()}`}>{p.status || "Active"}</span>
                )}
                {p.rating && (
                  <span className="id-rating">
                    <Star size={11} fill="currentColor" /> {p.rating}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Courses section ──────────────────────────────────────────────────────────
function CoursesSection({ linkedCourseIds, onLink, onUnlink, courses }) {
  const linked    = courses.filter(c =>  linkedCourseIds.includes(c.id));
  const available = courses.filter(c => !linkedCourseIds.includes(c.id));

  return (
    <div className="id-courses-section">
      <div className="id-section-block">
        <div className="id-section-label">My courses ({linked.length})</div>
        {linked.length === 0 && <p className="id-empty-text">No courses linked yet.</p>}
        {linked.map(c => (
          <div key={c.id} className="id-course-link-row">
            <div className="id-course-icon"><BookOpen size={15} /></div>
            <div className="id-course-link-text">
              <div className="id-course-name">{c.name}</div>
              <div className="id-course-code">{c.code}</div>
            </div>
            {c.id === BACHELOR_ID ? (
              <span className="id-auto-badge">Auto-linked</span>
            ) : (
              <button className="id-unlink-btn" onClick={() => onUnlink(c)}>
                <Unlink2 size={13} /> Unlink
              </button>
            )}
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <div className="id-section-block">
          <div className="id-section-label">Available courses</div>
          {available.map(c => (
            <div key={c.id} className="id-course-link-row">
              <div className="id-course-icon id-course-icon-dim"><BookOpen size={15} /></div>
              <div className="id-course-link-text">
                <div className="id-course-name">{c.name}</div>
                <div className="id-course-code">{c.code}</div>
              </div>
              <button className="id-link-btn" onClick={() => onLink(c)}>
                <Link2 size={13} /> Link
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Projects section ─────────────────────────────────────────────────────────
function ProjectsSection({ myProjects, onRate, onAddComment, onEditComment, onDeleteComment, onFlagProject }) {
  const [filter, setFilter]             = useState('All');
  const [selectedId, setSelectedId]     = useState(null);
  const [newComment, setNewComment]     = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [flagReason, setFlagReason]     = useState('');
  const [showFlagForm, setShowFlagForm] = useState(false);

  const tabs = ['All', 'Flagged', 'Appeal', 'Active'];

  const visible = myProjects.filter(p => {
    if (filter === 'Flagged') return p.flagged;
    if (filter === 'Appeal')  return !!p.appeal;
    if (filter === 'Active')  return p.status === 'Active' && !p.flagged;
    return true;
  });

  const project = selectedId ? myProjects.find(p => p.id === selectedId) : null;

  const handleSelect = (id) => {
    setSelectedId(id);
    setShowFlagForm(false);
    setFlagReason('');
    setNewComment('');
    setEditingComment(null);
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(project.id, newComment.trim());
    setNewComment('');
  };

  const submitEdit = () => {
    if (!editingComment?.text.trim()) return;
    onEditComment(project.id, editingComment.id, editingComment.text.trim());
    setEditingComment(null);
  };

  const submitFlag = () => {
    if (!flagReason.trim()) return;
    onFlagProject(project, flagReason.trim());
    setShowFlagForm(false);
    setFlagReason('');
  };

  return (
    <div className="id-projects-layout">
      {/* Left: list */}
      <div className="id-projects-list-panel">
        <div className="id-card-header">
          <span className="id-card-title">Student Projects</span>
          <span className="id-project-count-chip">{myProjects.length} total</span>
        </div>
        <div className="id-filter-tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`id-filter-tab${filter === t ? ' active' : ''}`}
              onClick={() => setFilter(t)}
            >{t}</button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="id-empty-text">No projects match this filter.</p>
        ) : (
          visible.map(p => (
            <div
              key={p.id}
              className={`id-project-row id-project-list-item${selectedId === p.id ? ' selected' : ''}`}
              {...activatableProps(() => handleSelect(p.id), { selected: selectedId === p.id })}
            >
              <div className="id-project-info">
                <div className="id-project-name">{p.title}</div>
                <div className="id-project-meta">{p.studentName} · {p.course}</div>
              </div>
              <div className="id-project-right">
                {p.flagged && <span className="id-badge id-badge-flagged">Flagged</span>}
                {p.appeal && <span className="id-badge id-badge-appeal">Appeal</span>}
                {!p.flagged && !p.appeal && (
                  <span className={`id-badge id-badge-${(p.status || "active").toLowerCase()}`}>{p.status || "Active"}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: detail panel */}
      <div className="id-project-detail-panel">
        {!project ? (
          <div className="id-detail-empty">
            <FolderKanban size={28} opacity={0.3} />
            <p>Select a project to review</p>
          </div>
        ) : (
          <>
            <div className="id-detail-title">{project.title}</div>
            <div className="id-detail-meta">
              {project.studentName} · {project.course} · {project.createdDate}
              <span className={`id-badge id-badge-${(project.status || 'active').toLowerCase()}`} style={{ marginLeft: 8 }}>
                {project.status || 'Active'}
              </span>
            </div>

            {project.flagReason && (
              <div className="id-detail-flag-notice">
                <Flag size={12} /> {project.flagReason}
              </div>
            )}

            {project.appeal && (
              <div className="id-detail-appeal">
                <strong>Appeal:</strong> "{project.appeal.message}"
              </div>
            )}

            {/* Rating */}
            <div className="id-detail-section">
              <div className="id-detail-section-label">
                <Star size={13} /> Rating
              </div>
              <StarPicker
                value={project.rating}
                onChange={(r) => onRate(project.id, r)}
              />
            </div>

            {/* Comments */}
            <div className="id-detail-section">
              <div className="id-detail-section-label">
                <MessageSquare size={13} /> Comments
              </div>

              {(project.comments || []).length === 0 && (
                <p className="id-no-comments">No comments yet. Be the first to add feedback.</p>
              )}

              {(project.comments || []).map(c => (
                <div key={c.id} className="id-comment">
                  {editingComment?.id === c.id ? (
                    <div className="id-comment-edit-wrap">
                      <textarea
                        className="id-comment-textarea"
                        value={editingComment.text}
                        onChange={e => setEditingComment({ ...editingComment, text: e.target.value })}
                      />
                      <div className="id-comment-edit-btns">
                        <button className="id-comment-save-btn" onClick={submitEdit}>
                          <Check size={12} /> Save
                        </button>
                        <button className="id-comment-cancel-btn" onClick={() => setEditingComment(null)}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="id-comment-body">
                        <div className="id-comment-header">
                          <span className="id-comment-author">{c.author}</span>
                          <span className="id-comment-date">{formatDate(c.date)}</span>
                        </div>
                        <p className="id-comment-text">{c.text}</p>
                      </div>
                      <div className="id-comment-actions">
                        <button
                          className="id-comment-act-btn"
                          onClick={() => setEditingComment({ id: c.id, text: c.text })}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="id-comment-act-btn danger"
                          onClick={() => onDeleteComment(project.id, c.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <div className="id-comment-add">
                <textarea
                  className="id-comment-textarea"
                  placeholder="Add a comment or feedback..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button
                  className="id-comment-submit"
                  onClick={submitComment}
                  disabled={!newComment.trim()}
                >
                  Add comment
                </button>
              </div>
            </div>

            {/* Flag */}
            <div className="id-detail-section">
              {project.flagged ? (
                <div className="id-flagged-notice">
                  <Flag size={13} /> Project is flagged — awaiting student appeal
                </div>
              ) : showFlagForm ? (
                <div className="id-flag-form">
                  <div className="id-detail-section-label">
                    <Flag size={13} /> Flag reason
                  </div>
                  <textarea
                    className="id-comment-textarea"
                    placeholder="Describe the issue clearly..."
                    value={flagReason}
                    onChange={e => setFlagReason(e.target.value)}
                  />
                  <div className="id-flag-form-btns">
                    <button
                      className="id-flag-submit-btn"
                      disabled={!flagReason.trim()}
                      onClick={submitFlag}
                    >
                      Submit flag
                    </button>
                    <button
                      className="id-flag-cancel-btn"
                      onClick={() => { setShowFlagForm(false); setFlagReason(''); }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="id-flag-btn" onClick={() => setShowFlagForm(true)}>
                  <Flag size={13} /> Flag this project
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Invitations section ──────────────────────────────────────────────────────
function InvitationsSection({ invitations, onAccept, onDecline }) {
  return (
    <div className="id-card">
      <div className="id-card-header">
        <span className="id-card-title">Project Invitations</span>
        {invitations.length > 0 && (
          <span className="id-project-count-chip">{invitations.length} pending</span>
        )}
      </div>
      {invitations.length === 0 ? (
        <p className="id-empty-text">No pending invitations.</p>
      ) : (
        invitations.map(inv => (
          <div key={inv.id} className="id-inv-row">
            <div className="id-inv-info">
              <div className="id-inv-project">{inv.projectTitle}</div>
              <div className="id-inv-meta">from {inv.fromUserName} · {inv.course} · {formatDate(inv.date)}</div>
            </div>
            <div className="id-inv-btns">
              <button className="id-inv-accept" onClick={() => onAccept(inv)}>
                <Check size={13} /> Accept
              </button>
              <button className="id-inv-decline" onClick={() => onDecline(inv)}>
                <X size={13} /> Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InstructorDashboard({ user, onNavigate, onSectionNavigate }) {
  const {
    courses, projects, updateProject, addNotification, notifications: notificationsSource,
    projectInvitations, deleteProjectInvitation,
  } = useAppData();
  const toast = useToast();

  const [activeSection, setActiveSection] = useSectionParam('Overview');
  const [messagesOpen,    setMessagesOpen]     = useState(false);
  const [pendingFlag,     setPendingFlag]      = useState(null);

  const [linkedCourseIds, setLinkedCourseIds] = useState(() =>
    courses
      .filter(c => c.instructors.some(i => i.name === user?.name))
      .map(c => c.id)
  );
  const [projectData, setProjectData] = useState(() =>
    projects.map(p => ({ flagged: false, flagReason: null, appeal: null, rating: null, comments: [], status: 'Active', studentName: '', ...p }))
  );
  // Supervision requests addressed to this instructor.
  const invitations = (projectInvitations || []).filter(
    inv => inv.status === 'pending' && (inv.toUserEmail || '').toLowerCase() === (user?.email || '').toLowerCase()
  );

  // Unauthenticated users are redirected by the route guards in App.js.
  if (!user) return null;

  const myCourses     = courses.filter(c => linkedCourseIds.includes(c.id));
  const myCourseNames = myCourses.map(c => c.name);
  const myProjects    = projectData.filter(p => myCourseNames.includes(p.course));

  // ── Course handlers ─────────────────────────────────────────────────────────
  const handleLinkCourse = (course) => {
    setLinkedCourseIds(prev => [...prev, course.id]);
    toast.success(`Linked to ${course.name}`);
  };

  const handleUnlinkCourse = (course) => {
    setLinkedCourseIds(prev => prev.filter(id => id !== course.id));
    toast.info(`Unlinked from ${course.name}`);
  };

  // ── Project handlers ────────────────────────────────────────────────────────
  const handleRateProject = (projectId, rating) => {
    setProjectData(prev => prev.map(p => p.id === projectId ? { ...p, rating } : p));
    updateProject(projectId, { rating });
    toast.success('Rating saved');
  };

  const handleAddComment = (projectId, text) => {
    const comment = { id: Date.now(), author: user.name, text, date: todayISO() };
    setProjectData(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updated = { ...p, comments: [...(p.comments || []), comment] };
        updateProject(projectId, { comments: updated.comments });
        // Notify the project owner (student)
        if (p.studentEmail) {
          addNotification({
            type: 'feedback',
            role: 'student',
            recipientEmail: p.studentEmail,
            message: `${user.name} added a comment on your project "${p.title}": "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`,
            time: nowStamp(),
            read: false,
          });
        }
        return updated;
      })
    );
  };

  const handleEditComment = (projectId, commentId, text) => {
    setProjectData(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const comments = (p.comments || []).map(c => c.id === commentId ? { ...c, text } : c);
        updateProject(projectId, { comments });
        return { ...p, comments };
      })
    );
  };

  const handleDeleteComment = (projectId, commentId) => {
    setProjectData(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const comments = (p.comments || []).filter(c => c.id !== commentId);
        updateProject(projectId, { comments });
        return { ...p, comments };
      })
    );
  };

  const handleFlagProject = (project, reason) => {
    setPendingFlag({ project, reason });
  };

  const confirmFlag = () => {
    const { project, reason } = pendingFlag;
    setProjectData(prev =>
      prev.map(p => p.id === project.id
        ? { ...p, flagged: true, flagReason: reason, status: 'Inactive' }
        : p
      )
    );
    updateProject(project.id, { flagged: true, flagReason: reason, status: 'Inactive', appeal: null });
    // Notify the student
    if (project.studentEmail) {
      addNotification({
        type: 'flag',
        role: 'student',
        recipientEmail: project.studentEmail,
        message: `Your project "${project.title}" has been flagged. Reason: "${reason}". You can submit an appeal from your project page.`,
        time: nowStamp(),
        read: false,
      });
    }
    setPendingFlag(null);
    toast.success(`"${project.title}" has been flagged`);
  };

  // ── Invitation handlers ─────────────────────────────────────────────────────
  const notifyInviter = (inv, accepted) => {
    if (!inv.fromUserEmail) return;
    addNotification({
      type: 'invitation',
      role: 'student',
      recipientEmail: inv.fromUserEmail,
      message: `${user.name} ${accepted ? 'accepted' : 'declined'} your request to supervise "${inv.projectTitle}".`,
      time: nowStamp(),
      read: false,
    });
  };

  const handleAcceptInvitation = (inv) => {
    const project = projects.find(p => p.id === inv.projectId);
    if (project) {
      const supervisors = (project.supervisors || []).filter(s => s.email !== user.email);
      updateProject(project.id, { supervisors: [...supervisors, { name: user.name, email: user.email }] });
    }
    deleteProjectInvitation(inv.id);
    notifyInviter(inv, true);
    toast.success(`Accepted invitation for "${inv.projectTitle}"`);
  };

  const handleDeclineInvitation = (inv) => {
    deleteProjectInvitation(inv.id);
    notifyInviter(inv, false);
    toast.info(`Declined invitation for "${inv.projectTitle}"`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case 'Overview':
        return (
          <OverviewSection
            user={user}
            myCourses={myCourses}
            myProjects={myProjects}
            setActiveSection={setActiveSection}
          />
        );
      case 'Courses':
        return (
          <CoursesSection
            linkedCourseIds={linkedCourseIds}
            onLink={handleLinkCourse}
            onUnlink={handleUnlinkCourse}
            courses={courses}
          />
        );
      case 'Projects':
        return (
          <ProjectsSection
            myProjects={myProjects}
            onRate={handleRateProject}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onFlagProject={handleFlagProject}
          />
        );
      case 'Invitations':
        return (
          <InvitationsSection
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        );
      case 'Messages':
        return <MessagesSection user={user} />;
      case 'Notifications': {
        const relevant = notificationsFor(notificationsSource, user)
          .map(n => ({ ...n, read: isNotificationRead(n, user) }));
        const unread = relevant.filter(n => !n.read).length;
        return (
          <div className="id-card">
            <div className="id-card-header">
              <span className="id-card-title">Notifications</span>
              {unread > 0 && <span className="id-tab-badge">{unread} unread</span>}
            </div>
            {relevant.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '12px 0' }}>No notifications yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {relevant.map(n => (
                  <li key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)', opacity: n.read ? 0.65 : 1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? 'var(--text-secondary)' : 'var(--primary-light)', flexShrink: 0, marginTop: 5 }} />
                    <div>
                      <p style={{ margin: '0 0 3px', fontSize: '13px', color: 'var(--text-on-surface)' }}>{n.message}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      default:
        return (
          <OverviewSection
            user={user}
            myCourses={myCourses}
            myProjects={myProjects}
            setActiveSection={setActiveSection}
          />
        );
    }
  };

  return (
    <>
      <div className="instructor-dashboard">
        <PrimaryNav user={user} onNavigate={onNavigate} onSectionNavigate={setActiveSection} />

        <div className="ad-shell">
          <header className="ad-page-header">
            <div>
              <p className="ad-eyebrow">Instructor panel</p>
              <h1 className="ad-page-title">
                {activeSection === 'Overview' ? 'Dashboard' : activeSection}
              </h1>
            </div>
          </header>

          <nav className="ad-tabs" aria-label="Instructor sections">
            {NAV_ITEMS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className={`ad-tab${activeSection === key ? ' active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                <Icon size={15} />
                <span>{key}</span>
                {key === 'Invitations' && invitations.length > 0 && (
                  <span className="id-tab-badge">{invitations.length}</span>
                )}
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

      <ConfirmModal
        open={!!pendingFlag}
        title="Flag this project?"
        message={`"${pendingFlag?.project.title}" will be flagged and set to Inactive. Reason: ${pendingFlag?.reason}`}
        confirmLabel="Yes, flag it"
        variant="danger"
        onConfirm={confirmFlag}
        onClose={() => setPendingFlag(null)}
      />
    </>
  );
}
