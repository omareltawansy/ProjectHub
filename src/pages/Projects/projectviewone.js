import React, { useState } from 'react';
import { useAppData } from '../../data/useAppData.js';
import { safeUrl } from '../../utils/safeUrl.js';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Link, FileText, Play, Edit2, Trash2, Plus,
  Search, X, AlertCircle, Lock, Globe, User, Calendar,
} from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav.js';
import './projectviewone.css';

export default function ProjectViewOne({ user, onNavigate, inline = false, onBack, projectId: propProjectId }) {
  const navigate = useNavigate();
  const params = useParams();
  const projectId = propProjectId || params.projectId;
  const {
    projects: allProjects, updateProjects,
    tasks: allTasks, updateTask, addTask, deleteTask,
    users,
    projectInvitations, addProjectInvitation, deleteProjectInvitation,
    addNotification,
  } = useAppData();

  const foundProject = allProjects.find(p => p.id === parseInt(projectId));

  // Owner = created this project OR matches studentEmail/studentName field
  const isOwner = !foundProject || (
    (foundProject.studentEmail && foundProject.studentEmail === user?.email) ||
    (foundProject.studentName  && foundProject.studentName  === user?.name)  ||
    (!foundProject.studentEmail && !foundProject.studentName) // user-created projects (no studentEmail set)
  );

  const normalizeProject = (p) => ({
    ...p,
    isBachelor: p.course === 'Bachelor',
    languages: p.languages || p.techStack || [],
    github: p.github || p.githubLink || '',
    report: p.report || p.reportLink || '',
    createdDate: p.createdDate || p.createdAt || '',
  });

  const [project, setProject] = useState(
    foundProject
      ? normalizeProject(foundProject)
      : normalizeProject(allProjects[0] || {})
  );

  const [collaborators, setCollaborators] = useState(
    foundProject?.collaborators || []
  );

  // Tasks are sourced from the global store, filtered to this project
  const projectTasks = allTasks.filter(t => t.projectId === project.id);

  const [feedback] = useState([
    { id: 1, author: 'Dr. Fatima', role: 'Project', date: 'May 2', rating: 4.0, text: 'Overall solid project. The architecture is clean but the authentication flow needs improvement before submission.', tags: ['Project'] },
    { id: 2, author: 'Dr. Fatima', role: 'Task: Fix login bug', date: 'May 4', rating: null, text: 'This needs to be resolved urgently. The JWT token expiry is not handled correctly.', tags: ['Task', 'Fix login bug'] },
  ]);

  const [thesis, setThesis] = useState([
    { id: 1, title: 'thesis_v3_final.pdf', uploadDate: 'Feb 12, 2025', size: '4.2 MB', isFinal: true },
    { id: 2, title: 'thesis_v2.pdf', uploadDate: 'Jan 28, 2025', size: '3.8 MB', isFinal: false },
    { id: 3, title: 'thesis_v1.pdf', uploadDate: 'Jan 10, 2025', size: '3.1 MB', isFinal: false },
  ]);

  const [showSearchCollaborators, setShowSearchCollaborators] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [showDeleteTask, setShowDeleteTask] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [editProject, setEditProject] = useState({ ...project });
  const overallRating = 4.0;

  // Collaborator remove/cancel state
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabToRemove, setCollabToRemove] = useState(null);

  // Appeal
  const [appealText, setAppealText] = useState('');
  const [showAppealForm, setShowAppealForm] = useState(false);


  // Local display order for tasks — reorder is visual-only (not persisted)
  const [taskOrderIds, setTaskOrderIds] = useState(() => projectTasks.map(t => t.id));

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const handleVisibilityToggle = () => {
    if (project.visibility === 'private') {
      setShowVisibilityWarning(true);
    } else {
      const updatedProject = { ...project, visibility: 'private' };
      setProject(updatedProject);
      const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
      updateProjects(updatedProjects);
    }
  };

  const confirmVisibilityChange = () => {
    const updatedProject = { ...project, visibility: 'public' };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
    setShowVisibilityWarning(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskForm.title && taskForm.assignedTo) {
      addTask({
        projectId: project.id,
        projectTitle: project.title,
        title: taskForm.title,
        description: taskForm.description,
        status: 'Pending',
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate,
        overdue: false,
      });
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '' });
      setShowAddTask(false);
    }
  };

  const handleDeleteTask = () => {
    deleteTask(deleteTaskId);
    setShowDeleteTask(false);
    setDeleteTaskId(null);
  };

  const handleSaveProject = () => {
    setProject(editProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? editProject : p);
    updateProjects(updatedProjects);
    setShowEditProject(false);
  };

  const handleDeleteProject = () => {
    if (inline) onBack?.();
    else navigate('/projectview');
  };

  const handleSetFinal = (id) => {
    const updatedThesis = thesis.map(d => ({ ...d, isFinal: d.id === id }));
    setThesis(updatedThesis);
    const updatedProject = { ...project, thesis: updatedThesis };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
  };

  const handleDeleteThesis = (id) => {
    const updatedThesis = thesis.filter(d => d.id !== id);
    setThesis(updatedThesis);
    const updatedProject = { ...project, thesis: updatedThesis };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
  };

  const handleThesisUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newDrafts = files.map((f, idx) => ({
      id: Date.now() + idx,
      title: f.name,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      isFinal: false,
    }));
    const updatedThesis = [...thesis, ...newDrafts];
    setThesis(updatedThesis);
    const updatedProject = { ...project, thesis: updatedThesis };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
  };

  const handleSubmitAppeal = () => {
    if (!appealText.trim()) return;
    const appeal = { message: appealText.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    const updatedProject = { ...project, appeal };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
    setAppealText('');
    setShowAppealForm(false);
  };

  // Keep order in sync when new tasks arrive (e.g., after addTask)
  const orderedTasks = [
    ...taskOrderIds.map(id => projectTasks.find(t => t.id === id)).filter(Boolean),
    ...projectTasks.filter(t => !taskOrderIds.includes(t.id)),
  ];

  const moveTask = (index, direction) => {
    const newOrder = [...taskOrderIds.length ? taskOrderIds : projectTasks.map(t => t.id)];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= orderedTasks.length) return;
    const tmp = newOrder[index]; newOrder[index] = newOrder[swapIndex]; newOrder[swapIndex] = tmp;
    setTaskOrderIds(newOrder);
  };

  // Called when X is clicked on a collaborator
  const handleCollabRemoveClick = (collab) => {
    setCollabToRemove(collab);
    setShowCollabModal(true);
  };

  // Confirmed — remove from list
  const confirmCollabRemove = () => {
    const updatedCollaborators = collaborators.filter(c => c.id !== collabToRemove.id);
    setCollaborators(updatedCollaborators);
    // If the invitation is still pending, cancel it globally so the invitee no longer sees it
    if (collabToRemove.status === 'Pending' || collabToRemove.status === 'No reply') {
      const matchingInv = (projectInvitations || []).find(
        inv => inv.projectId === project.id && inv.toUserEmail === collabToRemove.email
      );
      if (matchingInv) deleteProjectInvitation(matchingInv.id);
    }
    const updatedProject = { ...project, collaborators: updatedCollaborators };
    setProject(updatedProject);
    const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
    updateProjects(updatedProjects);
    setShowCollabModal(false);
    setCollabToRemove(null);
  };

  const cancelCollabRemove = () => {
    setShowCollabModal(false);
    setCollabToRemove(null);
  };

  const isPending = collabToRemove?.status === 'Pending' || collabToRemove?.status === 'No reply';

  // Real users — students only, not the owner, not already a collaborator
  const studentSearchResults = (users || [])
    .filter(u =>
      u.role === 'student' &&
      u.email !== user?.email &&
      !collaborators.some(c => c.email === u.email) &&
      searchQuery.trim() !== '' &&
      (
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  const TasksCard = () => (
    <div className="pvo-card">
      <div className="pvo-card-header">
        <h2>Tasks</h2>
        {isOwner && (
          <button className="pvo-btn-icon" onClick={() => setShowAddTask(!showAddTask)} title="Add task">
            <Plus size={18} />
          </button>
        )}
      </div>

      {showAddTask && (
        <form onSubmit={handleAddTask} className="pvo-task-form">
          <div className="pvo-form-group">
            <label>Task Title *</label>
            <input
              type="text"
              placeholder="e.g., Implement login feature"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>
          <div className="pvo-form-group">
            <label>Description</label>
            <textarea
              placeholder="Task details..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="pvo-form-group">
            <label>Assign To *</label>
            <select
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
              required
            >
              <option value="">Select</option>
              {project.isBachelor ? (
                <option value={user.name}>{user.name} (me)</option>
              ) : (
                collaborators.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="pvo-form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <div className="pvo-form-actions">
            <button type="button" onClick={() => setShowAddTask(false)} className="pvo-btn-cancel">Cancel</button>
            <button type="submit" className="pvo-btn-submit">Add Task</button>
          </div>
        </form>
      )}

      <div className="pvo-tasks-list">
        {orderedTasks.map((task, index) => (
          <div key={task.id} className={`pvo-task-row ${(task.status || 'pending').toLowerCase()}`}>
            <div className="pvo-task-status-select">
              <select
                value={task.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  updateTask(task.id, {
                    status: newStatus,
                    overdue: newStatus === 'Completed' ? false : task.overdue,
                  });
                }}
                className={`pvo-status-select pvo-status-${(task.status || 'pending').toLowerCase()}`}
                disabled={!isOwner}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>
            <div className="pvo-task-content">
              <div className="pvo-task-title">{task.title}</div>
              <div className="pvo-task-description">{task.description}</div>
              <div className="pvo-task-meta">
                <span className="pvo-task-assigned"><User size={12} /> {task.assignedTo}</span>
                <span className={`pvo-task-due ${task.overdue ? 'overdue' : ''}`}>
                  <Calendar size={12} /> {task.dueDate}{task.overdue && ' ⚠'}
                </span>
              </div>
            </div>
            <div className="pvo-task-order-btns">
              <button
                className="pvo-btn-order"
                onClick={() => moveTask(index, 'up')}
                disabled={index === 0}
                title="Move up"
              >▲</button>
              <button
                className="pvo-btn-order"
                onClick={() => moveTask(index, 'down')}
                disabled={index === orderedTasks.length - 1}
                title="Move down"
              >▼</button>
            </div>
            {isOwner && (
              <button className="pvo-btn-delete-task" onClick={() => { setDeleteTaskId(task.id); setShowDeleteTask(true); }}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const FeedbackCard = () => (
    <div className="pvo-card">
      <div className="pvo-card-header">
        <h2>CI Feedback & Rating</h2>
      </div>
      <div className="pvo-overall-rating">
        <div className="pvo-rating-label">Overall rating</div>
        <div className="pvo-rating-value">{overallRating.toFixed(1)} / 5</div>
      </div>
      <div className="pvo-feedback-list">
        {feedback.map(fb => (
          <div key={fb.id} className="pvo-feedback-item">
            <div className="pvo-feedback-header">
              <div>
                <div className="pvo-feedback-author">{fb.author}</div>
                <div className="pvo-feedback-role">{fb.role}</div>
              </div>
              <div className="pvo-feedback-date">{fb.date}</div>
            </div>
            {fb.rating && <div className="pvo-feedback-rating">⭐ {fb.rating}</div>}
            <div className="pvo-feedback-text">{fb.text}</div>
            <div className="pvo-feedback-tags">
              {fb.tags.map(tag => <span key={tag} className="pvo-tag">{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const pageContent = (
    <>
    <div className={`pvo-page${inline ? ' pvo-page-inline' : ''}`}>

        <div className="pvo-header">
          <button className="pvo-back-btn" onClick={() => inline ? onBack?.() : navigate('/projectview')}>
            <ArrowLeft size={20} />
          </button>
          <div className="pvo-header-content">
            <h1 className="pvo-title">{project.title}</h1>
            <p className="pvo-meta">
              {project.isBachelor && <span className="pvo-bachelor-tag">Bachelor Project</span>}
              Created {project.createdDate}
            </p>
          </div>
          <div className="pvo-header-actions">
            {isOwner ? (
              <>
                <button className="pvo-visibility-toggle" onClick={handleVisibilityToggle}>
                  {project.visibility === 'public'
                    ? <><Globe size={16} /><span>Public</span></>
                    : <><Lock size={16} /><span>Private</span></>}
                </button>
                <button className="pvo-btn pvo-btn-edit" onClick={() => setShowEditProject(true)}>
                  <Edit2 size={16} /> Edit
                </button>
                <button className="pvo-btn pvo-btn-delete" onClick={() => setShowDeleteProject(true)}>
                  <Trash2 size={16} /> Delete
                </button>
              </>
            ) : (
              <span className="pvo-view-only-badge">
                <User size={14} /> View only
              </span>
            )}
          </div>
        </div>

        {/* Flagged banner + appeal */}
        {project.flagged && (
          <div className="pvo-flagged-banner">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <strong>This project has been flagged.</strong>
              {project.flagReason && <span> Reason: "{project.flagReason}"</span>}
              {project.appeal
                ? <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>Appeal submitted: "{project.appeal.message}" — awaiting review.</div>
                : isOwner && !showAppealForm && (
                  <button className="pvo-appeal-btn" onClick={() => setShowAppealForm(true)}>
                    Submit an appeal
                  </button>
                )
              }
              {isOwner && showAppealForm && !project.appeal && (
                <div className="pvo-appeal-form">
                  <textarea
                    className="pvo-appeal-textarea"
                    placeholder="Explain why this project should be unflagged..."
                    value={appealText}
                    onChange={e => setAppealText(e.target.value)}
                    rows={3}
                  />
                  <div className="pvo-appeal-btns">
                    <button className="pvo-btn pvo-btn-edit" onClick={handleSubmitAppeal} disabled={!appealText.trim()}>
                      Send appeal
                    </button>
                    <button className="pvo-btn" onClick={() => setShowAppealForm(false)} style={{ background: 'none', border: '1px solid var(--border)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pvo-info-bar">
          <div className="pvo-info-item">
            <span className="pvo-info-label">Course:</span>
            <span className="pvo-info-value">{project.course}</span>
          </div>
          <div className="pvo-info-item">
            <span className="pvo-info-label">Technologies:</span>
            <div className="pvo-languages">
              {project.languages.map(lang => (
                <span key={lang} className="pvo-language-badge">{lang}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="pvo-links">
          {project.github && <a href={safeUrl(project.github)} target="_blank" rel="noopener noreferrer" className="pvo-link"><Link size={16} /> GitHub</a>}
          {project.report && <a href={safeUrl(project.report)} target="_blank" rel="noopener noreferrer" className="pvo-link"><FileText size={16} /> Report</a>}
          {project.demoVideo && <a href={safeUrl(project.demoVideo)} target="_blank" rel="noopener noreferrer" className="pvo-link"><Play size={16} /> Demo Video</a>}
        </div>

        {project.isBachelor ? (
          <div className="pvo-bachelor-layout">
            <div className="pvo-card pvo-thesis-card">
              <div className="pvo-card-header">
                <h2>Thesis Drafts</h2>
                {isOwner && (
                  <label className="pvo-btn-icon" title="Upload draft" style={{ cursor: 'pointer' }}>
                    <Plus size={18} />
                    <input type="file" accept=".pdf,.doc,.docx" multiple hidden onChange={handleThesisUpload} />
                  </label>
                )}
              </div>
              <div className="pvo-thesis-list">
                {thesis.map(draft => (
                  <div key={draft.id} className={`pvo-thesis-item ${draft.isFinal ? 'final' : ''}`}>
                    <div className="pvo-thesis-icon">📄</div>
                    <div className="pvo-thesis-info">
                      <div className="pvo-thesis-name">{draft.title}</div>
                      <div className="pvo-thesis-meta">Uploaded {draft.uploadDate} · {draft.size}</div>
                    </div>
                    <div className="pvo-thesis-actions">
                      {draft.isFinal
                        ? <span className="pvo-thesis-status final">Final Draft ✓</span>
                        : <>
                            <span className="pvo-thesis-status private">Private</span>
                            <button className="pvo-btn-set-final" onClick={() => handleSetFinal(draft.id)}>Set as final</button>
                          </>
                      }
                      <button className="pvo-btn-delete-thesis" onClick={() => handleDeleteThesis(draft.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pvo-bachelor-bottom">
              <TasksCard />
              <FeedbackCard />
            </div>
          </div>
        ) : (
          <div className="pvo-grid">
            <div className="pvo-left">
              <div className="pvo-card">
                <div className="pvo-card-header">
                  <h2>Collaborators</h2>
                  {isOwner && (
                    <button className="pvo-btn-icon" onClick={() => setShowSearchCollaborators(!showSearchCollaborators)} title="Add collaborator">
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                {showSearchCollaborators && (
                  <div className="pvo-search-section">
                    <div className="pvo-search-box">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by name or email to invite..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    {searchQuery && (
                      <div className="pvo-search-results">
                        {studentSearchResults.map(student => (
                          <div key={student.id} className="pvo-search-result">
                            <div>
                              <div className="pvo-student-name">{student.name}</div>
                              <div className="pvo-student-email">{student.email}</div>
                            </div>
                            <button
                              className="pvo-btn-invite"
                              onClick={() => {
                                const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase();
                                const newCollab = {
                                  id: Math.max(...collaborators.map(c => c.id), 0) + 1,
                                  name: student.name,
                                  email: student.email,
                                  initials,
                                  status: 'Pending',
                                  role: null,
                                };
                                const updatedCollabs = [...collaborators, newCollab];
                                setCollaborators(updatedCollabs);
                                // Persist invitation globally so invitee sees it after login
                                addProjectInvitation({
                                  projectId: project.id,
                                  projectTitle: project.title,
                                  fromUserName: user.name,
                                  fromUserEmail: user.email,
                                  toUserEmail: student.email,
                                  toUserName: student.name,
                                  course: project.course,
                                  date: new Date().toLocaleDateString(),
                                });
                                // Notify the invitee
                                addNotification({
                                  type: 'invitation',
                                  role: 'student',
                                  recipientEmail: student.email,
                                  message: `${user.name} invited you to join "${project.title}"`,
                                  time: new Date().toISOString(),
                                  read: false,
                                });
                                // Save collaborators list to project in global store
                                const updatedProject = { ...project, collaborators: updatedCollabs };
                                setProject(updatedProject);
                                const updatedProjects = allProjects.map(p => p.id === project.id ? updatedProject : p);
                                updateProjects(updatedProjects);
                                setSearchQuery('');
                                setShowSearchCollaborators(false);
                              }}
                            >
                              Invite
                            </button>
                          </div>
                        ))}
                        {studentSearchResults.length === 0 && (
                          <div className="pvo-no-results">No students found</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="pvo-collaborators-list">
                  {collaborators.map(collab => (
                    <div key={collab.id} className="pvo-collaborator-row">
                      <div className="pvo-collab-avatar">{collab.initials}</div>
                      <div className="pvo-collab-info">
                        <div className="pvo-collab-name">{collab.name}</div>
                        <div className="pvo-collab-email">{collab.email}</div>
                      </div>
                      <div className="pvo-collab-actions">
                        {collab.role && <span className="pvo-collab-role">{collab.role}</span>}
                        <span className={`pvo-collab-status ${collab.status.toLowerCase().replace(' ', '-')}`}>
                          {collab.status}
                        </span>
                        <button
                          className="pvo-btn-remove"
                          title={collab.status === 'Pending' || collab.status === 'No reply' ? 'Cancel invitation' : 'Remove from project'}
                          onClick={() => handleCollabRemoveClick(collab)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <TasksCard />
            </div>

            <div className="pvo-right">
              <FeedbackCard />
            </div>
          </div>
        )}
    </div>

      {/* Collaborator Remove / Cancel Invite Modal */}
      {showCollabModal && collabToRemove && (
        <div className="pvo-modal-overlay" onClick={cancelCollabRemove}>
          <div className="pvo-modal" onClick={e => e.stopPropagation()}>
            <div className="pvo-modal-header">
              <AlertCircle size={24} className="pvo-warning-icon" />
              <h2>{isPending ? 'Cancel Invitation?' : 'Remove Collaborator?'}</h2>
            </div>
            {isPending ? (
              <p>
                Are you sure you want to cancel the invitation sent to <strong>{collabToRemove.name}</strong>?
                They will no longer be able to join this project.
              </p>
            ) : (
              <p>
                Are you sure you want to remove <strong>{collabToRemove.name}</strong> from this project?
                They will lose access to all project tasks and files immediately.
              </p>
            )}
            <div className="pvo-modal-actions">
              <button onClick={cancelCollabRemove} className="pvo-btn-cancel">
                Keep {isPending ? 'Invitation' : 'Member'}
              </button>
              <button onClick={confirmCollabRemove} className="pvo-btn-delete">
                {isPending ? 'Cancel Invitation' : 'Remove from Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Warning Modal */}
      {showVisibilityWarning && (
        <div className="pvo-modal-overlay" onClick={() => setShowVisibilityWarning(false)}>
          <div className="pvo-modal" onClick={e => e.stopPropagation()}>
            <div className="pvo-modal-header"><AlertCircle size={24} className="pvo-warning-icon" /><h2>Make Project Public?</h2></div>
            <p>This project is currently private. Making it public will allow anyone to see it.</p>
            <div className="pvo-modal-actions">
              <button onClick={() => setShowVisibilityWarning(false)} className="pvo-btn-cancel">Keep Private</button>
              <button onClick={confirmVisibilityChange} className="pvo-btn-confirm">Yes, Make Public</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && (
        <div className="pvo-modal-overlay" onClick={() => setShowEditProject(false)}>
          <div className="pvo-modal pvo-modal-large" onClick={e => e.stopPropagation()}>
            <div className="pvo-modal-header">
              <h2>Edit Project</h2>
              <button onClick={() => setShowEditProject(false)} className="pvo-modal-close"><X size={20} /></button>
            </div>
            <form className="pvo-edit-form">
              <div className="pvo-form-group"><label>Project Title</label><input type="text" value={editProject.title} onChange={e => setEditProject({ ...editProject, title: e.target.value })} /></div>
              <div className="pvo-form-group"><label>GitHub Link</label><input type="url" value={editProject.github} onChange={e => setEditProject({ ...editProject, github: e.target.value })} /></div>
              <div className="pvo-form-group"><label>Report Link</label><input type="url" value={editProject.report} onChange={e => setEditProject({ ...editProject, report: e.target.value })} /></div>
              <div className="pvo-form-group"><label>Demo Video Link</label><input type="url" value={editProject.demoVideo} onChange={e => setEditProject({ ...editProject, demoVideo: e.target.value })} /></div>
              <div className="pvo-form-actions">
                <button type="button" onClick={() => setShowEditProject(false)} className="pvo-btn-cancel">Cancel</button>
                <button type="button" onClick={handleSaveProject} className="pvo-btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteProject && (
        <div className="pvo-modal-overlay" onClick={() => setShowDeleteProject(false)}>
          <div className="pvo-modal" onClick={e => e.stopPropagation()}>
            <div className="pvo-modal-header"><AlertCircle size={24} className="pvo-error-icon" /><h2>Delete Project?</h2></div>
            <p>Are you sure you want to delete "{project.title}"? This action cannot be undone.</p>
            <div className="pvo-modal-actions">
              <button onClick={() => setShowDeleteProject(false)} className="pvo-btn-cancel">Cancel</button>
              <button onClick={handleDeleteProject} className="pvo-btn-delete">Delete Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTask && (
        <div className="pvo-modal-overlay" onClick={() => setShowDeleteTask(false)}>
          <div className="pvo-modal" onClick={e => e.stopPropagation()}>
            <div className="pvo-modal-header"><AlertCircle size={24} className="pvo-error-icon" /><h2>Delete Task?</h2></div>
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="pvo-modal-actions">
              <button onClick={() => setShowDeleteTask(false)} className="pvo-btn-cancel">Cancel</button>
              <button onClick={handleDeleteTask} className="pvo-btn-delete">Delete Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (inline) return pageContent;

  return (
    <div className="project-view-one">
      <PrimaryNav user={user} onNavigate={onNavigate} />
      {pageContent}
    </div>
  );
}