import React, { useMemo, useState } from 'react';
import {
  Search, Flag, FlagOff, ChevronDown, ChevronUp,
  Star, ExternalLink, GitBranch, FileText, Video,
} from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { safeUrl } from '../../../../utils/safeUrl.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal.js';
import { nowStamp } from '../../../../utils/time';
import './ProjectsSection.css';

const TABS = ['All projects', 'Flagged', 'Pending appeals'];

export default function ProjectsSection() {
  const { projects: initialProjects, updateProjects, addNotification } = useAppData();
  const [projects, setProjects] = useState(initialProjects);
  const [activeTab, setActiveTab] = useState('All projects');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Single panel state — only one panel open at a time across all rows
  // type: 'details' | 'flag' | 'appeal'
  const [openPanel, setOpenPanel] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagError, setFlagError] = useState('');

  const [confirmAction, setConfirmAction] = useState(null);
  const toast = useToast();

  /* ── Derived filter lists ── */
  const courses = useMemo(
    () => [...new Set(projects.map(p => p.course))].sort(),
    [projects]
  );
  const students = useMemo(
    () => [...new Set(projects.map(p => p.studentName))].sort(),
    [projects]
  );

  /* ── Tab counts ── */
  const tabCount = (tab) => {
    if (tab === 'Flagged') return projects.filter(p => p.flagged).length;
    if (tab === 'Pending appeals') return projects.filter(p => p.flagged && p.appeal !== null).length;
    return projects.length;
  };

  /* ── Visible rows ── */
  const visibleProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects
      .filter(p => {
        if (activeTab === 'Flagged' && !p.flagged) return false;
        if (activeTab === 'Pending appeals' && !(p.flagged && p.appeal)) return false;
        if (courseFilter && p.course !== courseFilter) return false;
        if (studentFilter && p.studentName !== studentFilter) return false;
        if (q) {
          return (
            p.title.toLowerCase().includes(q) ||
            p.studentName.toLowerCase().includes(q) ||
            p.course.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) =>
        sortBy === 'rating'
          ? b.rating - a.rating
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
  }, [projects, activeTab, search, courseFilter, studentFilter, sortBy]);

  /* ── Panel toggle (mutual exclusion) ── */
  const togglePanel = (id, type) => {
    setOpenPanel(prev => {
      if (prev?.id === id && prev?.type === type) return null;
      if (type === 'flag') { setFlagReason(''); setFlagError(''); }
      return { id, type };
    });
  };

  /* ── Actions ── */
  const toggleStatus = (project) => {
    const next = project.status === 'Active' ? 'Inactive' : 'Active';
    const updatedProjects = projects.map(p => p.id === project.id ? { ...p, status: next } : p);
    setProjects(updatedProjects);
    updateProjects(updatedProjects);
    toast.success(`"${project.title}" set to ${next}.`);
    setConfirmAction(null);
  };

  const confirmFlag = (project) => {
    if (!flagReason.trim()) {
      setFlagError('Please enter a reason before flagging.');
      return;
    }
    const updatedProjects = projects.map(p =>
      p.id === project.id
        ? { ...p, flagged: true, flagReason: flagReason.trim(), status: 'Inactive', appeal: null }
        : p
    );
    setProjects(updatedProjects);
    updateProjects(updatedProjects);
    // Notify the student
    if (project.studentEmail) {
      addNotification({
        type: 'flag',
        role: 'student',
        recipientEmail: project.studentEmail,
        message: `Your project "${project.title}" has been flagged by an admin. Reason: "${flagReason.trim()}". You can submit an appeal from your project page.`,
        time: nowStamp(),
        read: false,
      });
    }
    toast.info(`"${project.title}" flagged.`);
    setOpenPanel(null);
    setFlagReason('');
    setFlagError('');
  };

  const unflag = (project) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id
        ? { ...p, flagged: false, flagReason: null, appeal: null }
        : p
    );
    setProjects(updatedProjects);
    updateProjects(updatedProjects);
    toast.success(`"${project.title}" unflagged.`);
    setOpenPanel(null);
    setConfirmAction(null);
  };

  const acceptAppeal = (project) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id
        ? { ...p, flagged: false, flagReason: null, appeal: null, status: 'Active' }
        : p
    );
    setProjects(updatedProjects);
    updateProjects(updatedProjects);
    toast.success(`Appeal accepted — "${project.title}" restored to Active.`);
    setOpenPanel(null);
    setConfirmAction(null);
  };

  const rejectAppeal = (project) => {
    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, appeal: null } : p
    );
    setProjects(updatedProjects);
    updateProjects(updatedProjects);
    toast.info(`Appeal dismissed. "${project.title}" remains flagged.`);
    setOpenPanel(null);
    setConfirmAction(null);
  };

  const performConfirm = () => {
    if (!confirmAction) return;
    const { type, project } = confirmAction;
    if (type === 'toggle') toggleStatus(project);
    else if (type === 'unflag') unflag(project);
    else if (type === 'accept-appeal') acceptAppeal(project);
    else if (type === 'reject-appeal') rejectAppeal(project);
  };

  /* ── Status badge helpers ── */
  const statusClass = (p) => {
    if (p.flagged) return 'ps-status-flagged';
    return p.status === 'Active' ? 'ps-status-active' : 'ps-status-inactive';
  };
  const statusLabel = (p) => (p.flagged ? 'Flagged' : p.status);

  return (
    <div className="ps-root">
      <section className="ps-card">
        <header className="ps-card-head">
          <div>
            <h2 className="ps-card-title">Projects</h2>
            <p className="ps-card-sub">
              Search, filter, and manage student project submissions. Flag violations and review student appeals.
            </p>
          </div>
        </header>

        {/* ── Toolbar ── */}
        <div className="ps-toolbar">
          <div className="ps-search">
            <Search size={16} className="ps-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, student, or course…"
            />
          </div>
          <select
            className="ps-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="ps-select"
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
          >
            <option value="">All students</option>
            {students.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="ps-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort: Date</option>
            <option value="rating">Sort: Rating</option>
          </select>
        </div>

        {/* ── Tabs ── */}
        <div className="ps-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`ps-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab); setOpenPanel(null); }}
            >
              {tab}
              <span className={`ps-tab-count${activeTab === tab ? ' active' : ''}`}>
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="ps-table-wrapper">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="ps-empty">
                    {search || courseFilter || studentFilter
                      ? 'No projects match your filters.'
                      : 'No projects in this category.'}
                  </td>
                </tr>
              ) : (
                visibleProjects.map(project => {
                  const panelOpen = openPanel?.id === project.id;
                  const detailOpen = panelOpen && openPanel.type === 'details';
                  const flagOpen   = panelOpen && openPanel.type === 'flag';
                  const appealOpen = panelOpen && openPanel.type === 'appeal';

                  return (
                    <React.Fragment key={project.id}>

                      {/* ── Main row ── */}
                      <tr>
                        <td className="ps-project-title">{project.title}</td>
                        <td>
                          <div className="ps-student-name">{project.studentName}</div>
                          <div className="ps-student-email">{project.studentEmail}</div>
                        </td>
                        <td className="ps-course">{project.course}</td>
                        <td>
                          <span className={`ps-status-badge ${statusClass(project)}`}>
                            {project.flagged && <Flag size={10} />}
                            {statusLabel(project)}
                          </span>
                        </td>
                        <td>
                          <div className="ps-action-btns">

                            {/* Details */}
                            <button
                              type="button"
                              className={`ps-btn-detail${detailOpen ? ' active' : ''}`}
                              onClick={() => togglePanel(project.id, 'details')}
                            >
                              {detailOpen
                                ? <><ChevronUp size={12} /> Hide</>
                                : <><ChevronDown size={12} /> Details</>
                              }
                            </button>

                            {/* Activate / Deactivate (unflagged only) */}
                            {!project.flagged && (
                              <button
                                type="button"
                                className={`ps-btn-toggle ${project.status === 'Active' ? 'ps-btn-deactivate' : 'ps-btn-activate'}`}
                                onClick={() => setConfirmAction({ type: 'toggle', project })}
                              >
                                {project.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}

                            {/* Flag (unflagged only) */}
                            {!project.flagged && (
                              <button
                                type="button"
                                className={`ps-btn-flag${flagOpen ? ' active' : ''}`}
                                onClick={() => togglePanel(project.id, 'flag')}
                              >
                                <Flag size={12} /> Flag
                              </button>
                            )}

                            {/* Unflag (flagged only) */}
                            {project.flagged && (
                              <button
                                type="button"
                                className="ps-btn-unflag"
                                onClick={() => setConfirmAction({ type: 'unflag', project })}
                              >
                                <FlagOff size={12} /> Unflag
                              </button>
                            )}

                            {/* View appeal (flagged + has appeal) */}
                            {project.flagged && project.appeal && (
                              <button
                                type="button"
                                className={`ps-btn-view-appeal${appealOpen ? ' active' : ''}`}
                                onClick={() => togglePanel(project.id, 'appeal')}
                              >
                                {appealOpen
                                  ? <><ChevronUp size={12} /> Appeal</>
                                  : <><ChevronDown size={12} /> Appeal</>
                                }
                              </button>
                            )}

                          </div>
                        </td>
                      </tr>

                      {/* ── Details panel ── */}
                      {detailOpen && (
                        <tr className="ps-detail-row">
                          <td colSpan="5">
                            <div className="ps-detail-panel">
                              <div className="ps-detail-grid">

                                {/* ABOUT column */}
                                <div>
                                  <h3 className="ps-detail-heading">About</h3>
                                  <ul className="ps-detail-fields">
                                    <li>
                                      <span className="ps-detail-label">Visibility</span>
                                      <span className="ps-detail-value">
                                        {project.visibility
                                          ? project.visibility.charAt(0).toUpperCase() + project.visibility.slice(1)
                                          : '—'}
                                      </span>
                                    </li>
                                    <li>
                                      <span className="ps-detail-label">Created</span>
                                      <span className="ps-detail-value">{project.createdAt || '—'}</span>
                                    </li>
                                    <li>
                                      <span className="ps-detail-label">Rating</span>
                                      <span className="ps-detail-value">
                                        {project.rating != null
                                          ? <><Star size={12} fill="var(--warning)" color="var(--warning)" /> {project.rating.toFixed(1)}</>
                                          : '—'}
                                      </span>
                                    </li>
                                    {project.flagged && project.flagReason && (
                                      <li>
                                        <span className="ps-detail-label">Flag reason</span>
                                        <span className="ps-detail-value">{project.flagReason}</span>
                                      </li>
                                    )}
                                  </ul>
                                  <h3 className="ps-detail-heading">Tech stack</h3>
                                  <div className="ps-detail-skills">
                                    {project.techStack?.length > 0
                                      ? project.techStack.map(t => (
                                          <span key={t} className="ps-skill">{t}</span>
                                        ))
                                      : <span className="ps-no-links">Not specified</span>
                                    }
                                  </div>
                                </div>

                                {/* LINKS column */}
                                <div>
                                  <h3 className="ps-detail-heading">Links</h3>
                                  {!project.githubLink && !project.reportLink && !project.demoVideo
                                    ? <p className="ps-no-links">No links provided.</p>
                                    : (
                                      <ul className="ps-detail-links">
                                        {project.githubLink && (
                                          <li>
                                            <a href={safeUrl(project.githubLink)} target="_blank" rel="noopener noreferrer">
                                              <GitBranch size={14} />
                                              GitHub repository
                                              <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                            </a>
                                          </li>
                                        )}
                                        {project.reportLink && (
                                          <li>
                                            <a href={safeUrl(project.reportLink)} target="_blank" rel="noopener noreferrer">
                                              <FileText size={14} />
                                              Project report
                                              <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                            </a>
                                          </li>
                                        )}
                                        {project.demoVideo && (
                                          <li>
                                            <a href={safeUrl(project.demoVideo)} target="_blank" rel="noopener noreferrer">
                                              <Video size={14} />
                                              Demo video
                                              <ExternalLink size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                            </a>
                                          </li>
                                        )}
                                      </ul>
                                    )
                                  }
                                </div>

                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* ── Inline flag form ── */}
                      {flagOpen && (
                        <tr className="ps-flag-row">
                          <td colSpan="5">
                            <div className="ps-flag-form">
                              <span className="ps-flag-label">
                                Flag <em>"{project.title}"</em> — provide a reason:
                              </span>
                              <div className="ps-flag-controls">
                                <input
                                  type="text"
                                  className={`ps-flag-input${flagError ? ' ps-flag-input-error' : ''}`}
                                  placeholder="e.g. Contains plagiarised sections from an external repository"
                                  value={flagReason}
                                  autoFocus
                                  onChange={(e) => { setFlagReason(e.target.value); setFlagError(''); }}
                                />
                                <button
                                  type="button"
                                  className="ps-btn-confirm"
                                  onClick={() => confirmFlag(project)}
                                >
                                  Confirm flag
                                </button>
                                <button
                                  type="button"
                                  className="ps-btn-cancel"
                                  onClick={() => setOpenPanel(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                              {flagError && <p className="ps-flag-error">{flagError}</p>}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* ── Appeal panel ── */}
                      {appealOpen && project.appeal && (
                        <tr className="ps-appeal-row">
                          <td colSpan="5">
                            <div className="ps-appeal-panel">
                              <div className="ps-appeal-header">
                                <span className="ps-appeal-tag">Appeal pending</span>
                                <span className="ps-appeal-date">{project.appeal.date}</span>
                              </div>
                              <p className="ps-appeal-message">{project.appeal.message}</p>
                              <div className="ps-appeal-actions">
                                <button
                                  type="button"
                                  className="ps-btn-appeal-accept"
                                  onClick={() => setConfirmAction({ type: 'accept-appeal', project })}
                                >
                                  Accept appeal
                                </button>
                                <button
                                  type="button"
                                  className="ps-btn-appeal-reject"
                                  onClick={() => setConfirmAction({ type: 'reject-appeal', project })}
                                >
                                  Dismiss appeal
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Confirm modal ── */}
      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === 'toggle'
            ? (confirmAction?.project?.status === 'Active' ? 'Deactivate this project?' : 'Activate this project?')
          : confirmAction?.type === 'unflag'
            ? 'Unflag this project?'
          : confirmAction?.type === 'accept-appeal'
            ? 'Accept this appeal?'
          : confirmAction?.type === 'reject-appeal'
            ? 'Dismiss this appeal?'
          : 'Confirm action'
        }
        message={
          confirmAction?.type === 'toggle'
            ? (confirmAction?.project?.status === 'Active'
                ? `"${confirmAction?.project?.title}" will be set to Inactive and hidden from public view.`
                : `"${confirmAction?.project?.title}" will be restored to Active status.`)
          : confirmAction?.type === 'unflag'
            ? `Remove the flag from "${confirmAction?.project?.title}". The project retains its current status.`
          : confirmAction?.type === 'accept-appeal'
            ? `The flag will be lifted and "${confirmAction?.project?.title}" will be restored to Active.`
          : confirmAction?.type === 'reject-appeal'
            ? `The appeal will be dismissed. "${confirmAction?.project?.title}" remains flagged and Inactive.`
          : ''
        }
        confirmLabel={
          confirmAction?.type === 'toggle'
            ? (confirmAction?.project?.status === 'Active' ? 'Deactivate' : 'Activate')
          : confirmAction?.type === 'unflag'       ? 'Unflag'
          : confirmAction?.type === 'accept-appeal' ? 'Accept appeal'
          : confirmAction?.type === 'reject-appeal' ? 'Dismiss'
          : 'Confirm'
        }
        variant={
          confirmAction?.type === 'toggle' && confirmAction?.project?.status === 'Active' ? 'danger'
          : confirmAction?.type === 'reject-appeal' ? 'danger'
          : confirmAction?.type === 'accept-appeal' ? 'success'
          : confirmAction?.type === 'unflag'        ? 'success'
          : 'primary'
        }
        onClose={() => setConfirmAction(null)}
        onConfirm={performConfirm}
      />
    </div>
  );
}
