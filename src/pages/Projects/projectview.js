import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, Plus, ArrowLeft, Folder, Lock, Globe, Check, BookmarkPlus, BookmarkX, AlertCircle, X } from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav.js';
import { useAppData } from '../../data/useAppData.js';
import './projectview.css';

export default function ProjectView({ user, onNavigate, inline = false, onBack, onViewProject }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects: initialProjects, courseOptions, programmingLanguages, updateProjects } = useAppData();
  const normalizeProject = ({ studentName, studentEmail, status, flagged, flagReason, appeal, rating, comments, techStack, createdAt, ...rest }) => ({
    ...rest,
    languages: rest.languages || techStack || [],
    onPortfolio: rest.onPortfolio ?? false,
    createdDate: rest.createdDate || createdAt || '',
  });

  const [projects, setProjects] = useState(initialProjects.map(normalizeProject));

  // Sync local state with hook data when initialProjects changes
  useEffect(() => {
    setProjects(initialProjects.map(normalizeProject));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjects]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showPortfolioConfirm, setShowPortfolioConfirm] = useState(false);
  const [showPrivateWarning, setShowPrivateWarning] = useState(false);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const [showBachelorError, setShowBachelorError] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [portfolioAction, setPortfolioAction] = useState(null);
  const [portfolioProjectId, setPortfolioProjectId] = useState(null);
  const [pendingPortfolioProjects, setPendingPortfolioProjects] = useState([]);
  const [languageInput, setLanguageInput] = useState('');
  const [visibilityProjectId, setVisibilityProjectId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    visibility: 'public',
    description: '',
    github: '',
    report: '',
    languages: [],
    demoVideo: '',
  });

  // Auto-open modal if navigated with ?new=true
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setShowModal(true);
    }
  }, [location.search]);

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const hasBachelorProject = projects.some(p => p.course === 'Bachelor');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addLanguage = (language) => {
    if (language.trim() && !formData.languages.includes(language.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, language.trim()]
      }));
      setLanguageInput('');
    }
  };

  const removeLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.course) return;

    // Block second Bachelor project
    if (formData.course === 'Bachelor' && hasBachelorProject) {
      setShowBachelorError(true);
      return;
    }

    const newProject = {
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      title: formData.title,
      course: formData.course,
      visibility: formData.visibility,
      createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      onPortfolio: false,
      github: formData.github,
      report: formData.report,
      languages: formData.languages,
      demoVideo: formData.demoVideo,
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    updateProjects(updated);
    setFormData({
      title: '',
      course: '',
      visibility: 'public',
      description: '',
      github: '',
      report: '',
      languages: [],
      demoVideo: '',
    });
    setLanguageInput('');
    setShowModal(false);
  };

  const toggleProjectSelection = (id) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProjects(newSelected);
  };

  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      const updated = projects.filter(p => p.id !== projectToDelete);
      setProjects(updated);
      updateProjects(updated);
      setSelectedProjects(prev => { const next = new Set(prev); next.delete(projectToDelete); return next; });
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleMassDelete = () => {
    if (selectedProjects.size === 0) return;
    setProjectToDelete('mass');
    setShowDeleteModal(true);
  };

  const confirmMassDelete = () => {
    const updated = projects.filter(p => !selectedProjects.has(p.id));
    setProjects(updated);
    updateProjects(updated);
    setSelectedProjects(new Set());
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleTogglePortfolio = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const action = project.onPortfolio ? 'remove' : 'add';
      
      if (action === 'add' && project.visibility === 'private') {
        setPendingPortfolioProjects([project]);
        setPortfolioAction('add');
        setShowPrivateWarning(true);
        return;
      }
      
      setPortfolioAction(action);
      setPortfolioProjectId(id);
      setShowPortfolioConfirm(true);
    }
  };

  const confirmTogglePortfolio = () => {
    if (portfolioProjectId) {
      const updated = projects.map(p =>
        p.id === portfolioProjectId ? { ...p, onPortfolio: !p.onPortfolio } : p
      );
      setProjects(updated);
      updateProjects(updated);
      setShowPortfolioConfirm(false);
      setPortfolioAction(null);
      setPortfolioProjectId(null);
    }
  };

  const cancelTogglePortfolio = () => {
    setShowPortfolioConfirm(false);
    setPortfolioAction(null);
    setPortfolioProjectId(null);
  };

  const getSelectedPortfolioStatus = () => {
    if (selectedProjects.size === 0) return null;
    const selectedProjectsList = Array.from(selectedProjects)
      .map(id => projects.find(p => p.id === id))
      .filter(Boolean);
    if (selectedProjectsList.length === 0) return null;
    const allOnPortfolio = selectedProjectsList.every(p => p.onPortfolio);
    const allOffPortfolio = selectedProjectsList.every(p => !p.onPortfolio);
    
    if (allOnPortfolio) return 'all-on';
    if (allOffPortfolio) return 'all-off';
    return 'mixed';
  };

  const handleMassPortfolioAction = () => {
    const status = getSelectedPortfolioStatus();
    
    if (status === 'all-off') {
      const selectedProjectsList = Array.from(selectedProjects).map(id => projects.find(p => p.id === id));
      const privateProjects = selectedProjectsList.filter(p => p.visibility === 'private');
      
      if (privateProjects.length > 0) {
        setPendingPortfolioProjects(privateProjects);
        setPortfolioAction('add');
        setShowPrivateWarning(true);
        return;
      }
    }
    
    setPortfolioAction(status === 'all-on' ? 'remove' : 'add');
    setShowPortfolioModal(true);
  };

  const confirmPrivateWarning = () => {
    const updated = projects.map(p => {
      if (pendingPortfolioProjects.find(pp => pp.id === p.id)) {
        return { ...p, onPortfolio: true, visibility: 'public' };
      }
      return p;
    });
    setProjects(updated);
    updateProjects(updated);

    setShowPrivateWarning(false);
    setPendingPortfolioProjects([]);
    setPortfolioAction(null);
    
    if (pendingPortfolioProjects.length === 1) {
      setShowPortfolioConfirm(false);
      setPortfolioProjectId(null);
    } else {
      setSelectedProjects(new Set());
      setShowPortfolioModal(false);
    }
  };

  const cancelPrivateWarning = () => {
    setShowPrivateWarning(false);
    setPendingPortfolioProjects([]);
    setPortfolioAction(null);
  };

  const confirmMassPortfolioAction = () => {
    const status = getSelectedPortfolioStatus();
    const newOnPortfolioValue = status === 'all-off';

    const updated = projects.map(p =>
      selectedProjects.has(p.id) ? { ...p, onPortfolio: newOnPortfolioValue } : p
    );
    setProjects(updated);
    updateProjects(updated);

    setSelectedProjects(new Set());
    setShowPortfolioModal(false);
    setPortfolioAction(null);
  };

  const cancelMassPortfolioModal = () => {
    setShowPortfolioModal(false);
    setPortfolioAction(null);
  };

  const handleVisibilityToggle = (id) => {
    const project = projects.find(p => p.id === id);
    if (project && project.visibility === 'private') {
      setVisibilityProjectId(id);
      setShowVisibilityWarning(true);
    } else if (project) {
      const updated = projects.map(p =>
        p.id === id ? { ...p, visibility: 'private' } : p
      );
      setProjects(updated);
      updateProjects(updated);
    }
  };

  const confirmVisibilityChange = () => {
    if (visibilityProjectId) {
      const updated = projects.map(p =>
        p.id === visibilityProjectId ? { ...p, visibility: 'public' } : p
      );
      setProjects(updated);
      updateProjects(updated);
      setShowVisibilityWarning(false);
      setVisibilityProjectId(null);
    }
  };

  const cancelVisibilityChange = () => {
    setShowVisibilityWarning(false);
    setVisibilityProjectId(null);
  };

  const selectedStatus = getSelectedPortfolioStatus();
  const shouldShowMassPortfolioBtn = selectedStatus === 'all-on' || selectedStatus === 'all-off';

  const content = (
    <>
    <div className={`pv-page${inline ? ' pv-page-inline' : ''}`}>
        {/* Header */}
        <div className="pv-header">
          <div className="pv-header-top">
            {!inline && (
              <button className="pv-back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="pv-title">My Projects</h1>
          </div>
          <p className="pv-subtitle">Manage and create your projects</p>
        </div>

        {/* Stats */}
        <div className="pv-stats">
          <div className="pv-stat-card">
            <div className="pv-stat-label">Total Projects</div>
            <div className="pv-stat-value">{projects.length}</div>
          </div>
          <div className="pv-stat-card">
            <div className="pv-stat-label">Public</div>
            <div className="pv-stat-value">{projects.filter(p => p.visibility === 'public').length}</div>
          </div>
          <div className="pv-stat-card">
            <div className="pv-stat-label">On Portfolio</div>
            <div className="pv-stat-value">{projects.filter(p => p.onPortfolio).length}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pv-action-buttons">
          <button className="pv-create-btn" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Create New Project
          </button>
        </div>

        {/* Mass Action Buttons */}
        {selectedProjects.size > 0 && (
          <div className="pv-mass-actions">
            <span className="pv-selected-count">{selectedProjects.size} selected</span>
            <div className="pv-mass-buttons">
              {shouldShowMassPortfolioBtn && (
                <button 
                  className={`pv-mass-portfolio-btn ${selectedStatus === 'all-on' ? 'remove' : 'add'}`}
                  onClick={handleMassPortfolioAction}
                >
                  {selectedStatus === 'all-on' ? (
                    <><BookmarkX size={18} /> Remove from Portfolio</>
                  ) : (
                    <><BookmarkPlus size={18} /> Add to Portfolio</>
                  )}
                </button>
              )}
              {selectedStatus === 'mixed' && (
                <div className="pv-mixed-warning">Select projects with same portfolio status</div>
              )}
              <button className="pv-mass-delete-btn" onClick={handleMassDelete}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="pv-projects-container">
          {projects.length === 0 ? (
            <div className="pv-empty-state">
              <Folder size={48} strokeWidth={1.5} />
              <h2>No projects yet</h2>
              <p>Create your first project to get started</p>
              <button className="pv-empty-btn" onClick={() => setShowModal(true)}>
                Create Project
              </button>
            </div>
          ) : (
            <div className="pv-projects-grid">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className={`pv-project-card ${selectedProjects.has(project.id) ? 'selected' : ''}`}
                >
                  <div className="pv-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id={`project-${project.id}`}
                      checked={selectedProjects.has(project.id)}
                      onChange={() => toggleProjectSelection(project.id)}
                      className="pv-checkbox"
                    />
                    <label htmlFor={`project-${project.id}`} className="pv-checkbox-label">
                      <Check size={16} />
                    </label>
                  </div>

                  <div className="pv-card-top">
                    <div className="pv-card-icon">
                      <Folder size={24} />
                    </div>
                    <div className="pv-card-actions">
                      <button 
                        className={`pv-action-icon ${project.onPortfolio ? 'active' : ''}`}
                        onClick={() => handleTogglePortfolio(project.id)}
                        title={project.onPortfolio ? 'Remove from portfolio' : 'Add to portfolio'}
                      >
                        {project.onPortfolio ? <BookmarkX size={18} /> : <BookmarkPlus size={18} />}
                      </button>
                      <button 
                        className="pv-delete-btn" 
                        onClick={() => handleDeleteClick(project.id)}
                        title="Delete project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="pv-card-content">
                    <h3 className="pv-card-title">{project.title}</h3>
                    <p className={`pv-card-course ${project.course === 'Bachelor' ? 'bachelor' : ''}`}>
                      {project.course}
                    </p>
                    {project.languages.length > 0 && (
                      <div className="pv-card-languages">
                        {project.languages.slice(0, 3).map(lang => (
                          <span key={lang} className="pv-language-tag">{lang}</span>
                        ))}
                        {project.languages.length > 3 && (
                          <span className="pv-language-more">+{project.languages.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pv-card-footer">
                    <button
                      className="pv-visibility-btn"
                      onClick={() => handleVisibilityToggle(project.id)}
                      title={project.visibility === 'public' ? 'Switch to Private' : 'Switch to Public'}
                    >
                      {project.visibility === 'public' ? (
                        <><Globe size={14} /><span>Public</span></>
                      ) : (
                        <><Lock size={14} /><span>Private</span></>
                      )}
                    </button>
                    <span className="pv-created-date">{project.createdDate}</span>
                  </div>

                  {project.onPortfolio && (
                    <div className="pv-portfolio-badge">
                      <Check size={14} /> On Portfolio
                    </div>
                  )}

                  <button
                    className="pv-card-action"
                    onClick={() => inline && onViewProject ? onViewProject(project.id) : navigate(`/projectviewone/${project.id}`)}
                  >
                    View Project →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="pv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pv-modal pv-create-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-modal-header">
              <h2>Create New Project</h2>
              <button className="pv-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="pv-form">
              <div className="pv-form-group">
                <label htmlFor="title">Project Title <span className="pv-required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., E-Commerce Website"
                  required
                />
              </div>

              <div className="pv-form-group">
                <label htmlFor="course">Course / Subject <span className="pv-required">*</span></label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a course</option>
                  {courseOptions.map(course => (
                    <option
                      key={course}
                      value={course}
                      disabled={course === 'Bachelor' && hasBachelorProject}
                    >
                      {course}{course === 'Bachelor' && hasBachelorProject ? ' (already have one)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bachelor info — first time */}
              {formData.course === 'Bachelor' && !hasBachelorProject && (
                <div className="pv-bachelor-highlight">
                  <AlertCircle size={16} />
                  <span>Bachelor project detected — this will be highlighted in your portfolio</span>
                </div>
              )}

              {/* Bachelor error — already have one */}
              {formData.course === 'Bachelor' && hasBachelorProject && (
                <div className="pv-bachelor-error">
                  <AlertCircle size={16} />
                  <span>You already have a Bachelor project. Only one is allowed.</span>
                </div>
              )}

              <div className="pv-form-group">
                <label htmlFor="github">GitHub Repository Link</label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="pv-form-group">
                <label>Programming Languages & Technologies</label>
                <div className="pv-language-input-group">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLanguage(languageInput);
                      }
                    }}
                    placeholder="Type and press Enter to add"
                    list="languages-list"
                  />
                  <datalist id="languages-list">
                    {programmingLanguages.map(lang => (
                      <option key={lang} value={lang} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    className="pv-add-language-btn"
                    onClick={() => addLanguage(languageInput)}
                  >
                    Add
                  </button>
                </div>
                {formData.languages.length > 0 && (
                  <div className="pv-languages-list">
                    {formData.languages.map(lang => (
                      <div key={lang} className="pv-language-item">
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="pv-remove-language"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pv-form-group">
                <label htmlFor="report">Project Report Link or PDF</label>
                <input
                  type="url"
                  id="report"
                  name="report"
                  value={formData.report}
                  onChange={handleInputChange}
                  placeholder="https://drive.google.com/... or file URL"
                />
              </div>

              <div className="pv-form-group">
                <label htmlFor="demoVideo">Demo Video (YouTube Link)</label>
                <input
                  type="url"
                  id="demoVideo"
                  name="demoVideo"
                  value={formData.demoVideo}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="pv-form-group">
                <label htmlFor="visibility">Visibility</label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                >
                  <option value="public">Public - Anyone can view</option>
                  <option value="private">Private - Only you can view</option>
                </select>
              </div>

              <div className="pv-form-actions">
                <button type="button" className="pv-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pv-btn-submit"
                  disabled={formData.course === 'Bachelor' && hasBachelorProject}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bachelor Already Exists Error Modal */}
      {showBachelorError && (
        <div className="pv-modal-overlay" onClick={() => setShowBachelorError(false)}>
          <div className="pv-modal pv-warning-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-warning-content">
              <div className="pv-warning-icon">
                <AlertCircle size={32} />
              </div>
              <h2>Bachelor Project Already Exists</h2>
              <p className="pv-warning-text">
                You can only have one Bachelor project. Please select a different course.
              </p>
            </div>
            <div className="pv-warning-actions">
              <button className="pv-warning-proceed" onClick={() => setShowBachelorError(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Private Project Warning Modal */}
      {showPrivateWarning && (
        <div className="pv-modal-overlay" onClick={cancelPrivateWarning}>
          <div className="pv-modal pv-warning-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-warning-content">
              <div className="pv-warning-icon">
                <AlertCircle size={32} />
              </div>
              <h2>Private Project Warning</h2>
              <p className="pv-warning-text">
                The following {pendingPortfolioProjects.length === 1 ? 'project is' : 'projects are'} currently <strong>private</strong>. Adding {pendingPortfolioProjects.length === 1 ? 'it' : 'them'} to your portfolio will automatically change the visibility to <strong>public</strong>.
              </p>
              <div className="pv-warning-projects">
                {pendingPortfolioProjects.map(project => (
                  <div key={project.id} className="pv-warning-project-item">
                    <Lock size={16} />
                    <span>{project.title}</span>
                  </div>
                ))}
              </div>
              <p className="pv-warning-question">Are you sure you want to proceed?</p>
            </div>
            <div className="pv-warning-actions">
              <button className="pv-warning-cancel" onClick={cancelPrivateWarning}>Cancel</button>
              <button className="pv-warning-proceed" onClick={confirmPrivateWarning}>Yes, Make Public & Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Toggle Confirmation Modal */}
      {showPortfolioConfirm && (
        <div className="pv-modal-overlay" onClick={cancelTogglePortfolio}>
          <div className="pv-modal pv-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-confirm-content">
              <div className={`pv-confirm-icon ${portfolioAction}`}>
                {portfolioAction === 'add' ? <BookmarkPlus size={32} /> : <BookmarkX size={32} />}
              </div>
              <h2>{portfolioAction === 'add' ? 'Add to Portfolio?' : 'Remove from Portfolio?'}</h2>
              <p>
                {portfolioAction === 'add'
                  ? 'This project will be added to your portfolio and visible to others.'
                  : 'This project will be removed from your portfolio.'
                }
              </p>
            </div>
            <div className="pv-confirm-actions">
              <button className="pv-confirm-cancel" onClick={cancelTogglePortfolio}>Cancel</button>
              <button className={`pv-confirm-btn ${portfolioAction}`} onClick={confirmTogglePortfolio}>
                {portfolioAction === 'add' ? 'Add to Portfolio' : 'Remove from Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mass Portfolio Action Confirmation Modal */}
      {showPortfolioModal && (
        <div className="pv-modal-overlay" onClick={cancelMassPortfolioModal}>
          <div className="pv-modal pv-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-confirm-content">
              <div className={`pv-confirm-icon ${portfolioAction}`}>
                {portfolioAction === 'add' ? <BookmarkPlus size={32} /> : <BookmarkX size={32} />}
              </div>
              <h2>
                {portfolioAction === 'add'
                  ? `Add ${selectedProjects.size} project(s) to Portfolio?`
                  : `Remove ${selectedProjects.size} project(s) from Portfolio?`
                }
              </h2>
              <p>
                {portfolioAction === 'add'
                  ? 'These projects will be added to your portfolio and visible to others.'
                  : 'These projects will be removed from your portfolio.'
                }
              </p>
            </div>
            <div className="pv-confirm-actions">
              <button className="pv-confirm-cancel" onClick={cancelMassPortfolioModal}>Cancel</button>
              <button className={`pv-confirm-btn ${portfolioAction}`} onClick={confirmMassPortfolioAction}>
                {portfolioAction === 'add' ? 'Add to Portfolio' : 'Remove from Portfolio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="pv-modal-overlay" onClick={cancelDelete}>
          <div className="pv-modal pv-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-delete-content">
              <div className="pv-delete-icon">
                <Trash2 size={32} />
              </div>
              <h2>{projectToDelete === 'mass' ? 'Delete Projects?' : 'Delete Project?'}</h2>
              <p>
                {projectToDelete === 'mass' 
                  ? `Are you sure you want to delete ${selectedProjects.size} project(s)? This action cannot be undone.`
                  : 'Are you sure you want to delete this project? This action cannot be undone.'
                }
              </p>
            </div>
            <div className="pv-delete-actions">
              <button className="pv-delete-cancel" onClick={cancelDelete}>Cancel</button>
              <button 
                className="pv-delete-confirm" 
                onClick={projectToDelete === 'mass' ? confirmMassDelete : confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Change Warning Modal */}
      {showVisibilityWarning && (
        <div className="pv-modal-overlay" onClick={cancelVisibilityChange}>
          <div className="pv-modal pv-warning-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pv-warning-content">
              <div className="pv-warning-icon visibility">
                <AlertCircle size={32} />
              </div>
              <h2>Make Project Public?</h2>
              <p className="pv-warning-text">
                This project is currently <strong>private</strong>. Making it <strong>public</strong> will allow anyone to see this project.
              </p>
              {visibilityProjectId && (
                <div className="pv-warning-projects">
                  <div className="pv-warning-project-item">
                    <Lock size={16} />
                    <span>{projects.find(p => p.id === visibilityProjectId)?.title}</span>
                  </div>
                </div>
              )}
              <p className="pv-warning-question">Are you sure you want to make this project public?</p>
            </div>
            <div className="pv-warning-actions">
              <button className="pv-warning-cancel" onClick={cancelVisibilityChange}>Keep Private</button>
              <button className="pv-warning-proceed" onClick={confirmVisibilityChange}>Yes, Set as Public</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (inline) return content;

  return (
    <div className="project-view">
      <PrimaryNav user={user} onNavigate={onNavigate} />
      {content}
    </div>
  );
}
