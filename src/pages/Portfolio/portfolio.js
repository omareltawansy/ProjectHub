import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, FileText, Edit2, X, Plus, Check } from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav.js';
import { useAppData } from '../../data/useAppData.js';
import Dialog from '../../components/Dialog/Dialog';
import './portfolio.css';

export default function Portfolio({ user, onNavigate, inline = false, onBack }) {
  const navigate = useNavigate();
  const {
    projects: allProjects,
    portfolios,
    internships,
    updatePortfolio,
    addPortfolio,
  } = useAppData();

  // ── All hooks must be declared before any early return ───────────────────
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    major: '', semester: '', gpa: '', linkedIn: '', bio: '', skills: [],
  });
  const [newSkill, setNewSkill] = useState('');

  // Unauthenticated users are redirected by the route guards in App.js.
  if (!user) return null;

  // ── Find or scaffold this user's portfolio ──────────────────────────────
  const initials = (user.name || '').split(' ').map(n => n[0]).join('').toUpperCase();
  const rawPortfolio =
    portfolios.find(p => p.email === user.email) ||
    portfolios.find(p => p.name === user.name) ||
    null;

  const portfolio = rawPortfolio
    ? { gpa: '', linkedIn: '', semester: '', bio: '', skills: [], ...rawPortfolio }
    : { id: null, name: user.name, email: user.email, major: '', semester: '', gpa: '', linkedIn: '', skills: [], bio: '', image: initials };

  // ── Derived / computed data ──────────────────────────────────────────────
  const myProjects = allProjects.filter(
    p => p.studentEmail === user.email || p.studentName === user.name
  );
  const publicProjects = myProjects.filter(p => p.visibility === 'public');

  // Language breakdown from techStacks
  const langCounts = {};
  myProjects.forEach(p => {
    (p.techStack || p.languages || []).forEach(lang => {
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    });
  });
  const total = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, percentage: Math.round((count / total) * 100) }));

  // Thesis drafts (bachelor projects)
  const thesisDrafts = myProjects
    .filter(p => p.course === 'Bachelor' || p.isBachelor)
    .flatMap(p => p.thesis || []);

  // Completed internships (user is in applicants with Hired status)
  const completedInternships = internships.filter(i =>
    (i.applicants || []).some(a => a.email === user.email && a.status === 'Hired')
  );

  // Top collaborators (unique, across all projects, excluding self)
  const collabMap = {};
  myProjects.forEach(p => {
    (p.collaborators || [])
      .filter(c => c.email !== user.email)
      .forEach(c => {
        if (!collabMap[c.email]) collabMap[c.email] = { ...c, projectTitle: p.title };
      });
  });
  const topCollaborators = Object.values(collabMap).slice(0, 5);

  const statistics = {
    totalProjects: myProjects.length,
    publicProjects: publicProjects.length,
    collaborators: Object.keys(collabMap).length,
  };

  const openEdit = () => {
    setForm({
      major: portfolio.major || '',
      semester: portfolio.semester || '',
      gpa: portfolio.gpa || '',
      linkedIn: portfolio.linkedIn || '',
      bio: portfolio.bio || '',
      skills: [...(portfolio.skills || [])],
    });
    setNewSkill('');
    setShowEdit(true);
  };

  const handleSave = () => {
    const updates = { ...form, name: user.name, email: user.email, image: initials };
    if (portfolio.id) {
      updatePortfolio(portfolio.id, updates);
    } else {
      addPortfolio(updates);
    }
    setShowEdit(false);
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm(f => ({ ...f, skills: [...f.skills, trimmed] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const content = (
    <div className={`portfolio-page${inline ? ' inline' : ''}`}>

      {/* Header banner */}
      <div className="portfolio-header">
        <button className="portfolio-back-btn" onClick={() => inline ? onBack?.() : navigate(-1)}>
          <ArrowLeft size={20} />
        </button>

        <div className="portfolio-header-content">
          <div className="portfolio-profile">
            <div className="portfolio-avatar">{initials}</div>
            <div className="portfolio-info">
              <h1 className="portfolio-name">{user.name}</h1>
              <p className="portfolio-subtitle">
                {[portfolio.major, 'GUC', portfolio.semester].filter(Boolean).join(' · ')}
              </p>
              <div className="portfolio-skills">
                {portfolio.skills.map(skill => (
                  <span key={skill} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="portfolio-links">
            {portfolio.linkedIn && (
              <a
                href={`https://${portfolio.linkedIn.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link-btn"
              >
                <Link size={16} /> LinkedIn / CV
              </a>
            )}
            <button className="portfolio-edit-btn" onClick={openEdit}>
              <Edit2 size={15} /> Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* Basic Info & Statistics */}
      <div className="portfolio-grid-2">
        <div className="portfolio-card">
          <div className="portfolio-card-header">
            <h2>Basic info</h2>
            <button className="pf-edit-icon-btn" onClick={openEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          </div>
          <div className="portfolio-card-content">
            <div className="info-row">
              <span className="info-label">Major</span>
              <span className="info-value">{portfolio.major || <span className="info-placeholder">Not set</span>}</span>
            </div>
            <div className="info-row">
              <span className="info-label">GPA</span>
              <span className="info-value">{portfolio.gpa || <span className="info-placeholder">Not set</span>}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Bio</span>
              <span className="info-value info-bio">{portfolio.bio || <span className="info-placeholder">Not set</span>}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Skills</span>
              <div className="skills-container">
                {portfolio.skills.length > 0
                  ? portfolio.skills.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))
                  : <span className="info-placeholder">No skills added</span>
                }
              </div>
            </div>
            {portfolio.linkedIn && (
              <div className="info-row">
                <span className="info-label">LinkedIn</span>
                <a
                  href={`https://${portfolio.linkedIn.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  {portfolio.linkedIn}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="portfolio-card">
          <div className="portfolio-card-header">
            <h2>Statistics</h2>
          </div>
          <div className="portfolio-stats">
            <div className="stat-box">
              <div className="stat-number">{statistics.totalProjects}</div>
              <div className="stat-label">Total projects</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.publicProjects}</div>
              <div className="stat-label">Public</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{statistics.collaborators}</div>
              <div className="stat-label">Collaborators</div>
            </div>
          </div>

          {languages.length > 0 && (
            <div className="languages-section">
              <h3>Languages used</h3>
              {languages.map(lang => (
                <div key={lang.name} className="language-row">
                  <span className="language-name">{lang.name}</span>
                  <div className="language-bar">
                    <div className="language-fill" style={{ width: `${lang.percentage}%` }} />
                  </div>
                  <span className="language-percent">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects on Portfolio */}
      <div className="portfolio-card portfolio-full">
        <div className="portfolio-card-header">
          <h2>Projects on portfolio</h2>
        </div>
        <div className="portfolio-projects-list">
          {publicProjects.length === 0 ? (
            <p className="portfolio-empty">No public projects yet. Set a project to Public in your project settings.</p>
          ) : (
            publicProjects.map(project => (
              <div key={project.id} className="portfolio-project-row">
                <div className="project-icon"><FileText size={24} /></div>
                <div className="project-details">
                  <h3>{project.title}</h3>
                  <p>{project.course} · Created {project.createdAt || project.createdDate}</p>
                </div>
                <div className="project-meta">
                  {project.rating
                    ? <span className="project-rating">⭐ {project.rating}</span>
                    : <span className="project-rating no-rating">No rating</span>
                  }
                  <span className="project-visibility public">Public</span>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="portfolio-note">Private projects are hidden from this view</p>
      </div>

      {/* Bachelor Thesis Drafts */}
      {thesisDrafts.length > 0 && (
        <div className="portfolio-card portfolio-full">
          <div className="portfolio-card-header">
            <h2>Bachelor thesis drafts</h2>
          </div>
          <div className="portfolio-thesis-list">
            {thesisDrafts.map(thesis => (
              <div key={thesis.id} className="thesis-row">
                <div className="thesis-icon"><FileText size={24} /></div>
                <div className="thesis-details">
                  <h3>{thesis.title}</h3>
                  <p>Uploaded {thesis.uploadDate}</p>
                </div>
                <div className="thesis-status">
                  <span className={`thesis-badge ${thesis.isFinal ? 'final-draft' : 'private'}`}>
                    {thesis.isFinal ? 'Final draft' : 'Private'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="portfolio-note">Once a final draft is selected, all other drafts become private automatically</p>
        </div>
      )}

      {/* Internships & Collaborators */}
      <div className="portfolio-grid-2">
        <div className="portfolio-card">
          <div className="portfolio-card-header">
            <h2>Completed internships</h2>
          </div>
          <div className="internships-list">
            {completedInternships.length === 0 ? (
              <p className="portfolio-empty">No completed internships yet.</p>
            ) : (
              completedInternships.map(i => (
                <div key={i.id} className="internship-row">
                  <div className="internship-icon"><FileText size={20} /></div>
                  <div className="internship-details">
                    <h3>{i.company}</h3>
                    <p>{i.title}</p>
                  </div>
                  <div className="portfolio-internship-meta">
                    <span className="portfolio-internship-status">Completed</span>
                    <span className="portfolio-internship-duration">{i.duration}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="portfolio-note">Added automatically once an internship is completed</p>
        </div>

        <div className="portfolio-card">
          <div className="portfolio-card-header">
            <h2>Top collaborators</h2>
          </div>
          <div className="collaborators-list">
            {topCollaborators.length === 0 ? (
              <p className="portfolio-empty">No collaborators yet.</p>
            ) : (
              topCollaborators.map((c, i) => (
                <div key={c.email || i} className="collaborator-row">
                  <div className="collaborator-avatar">{c.initials}</div>
                  <div className="collaborator-details">
                    <h3>{c.name}</h3>
                    <p>{c.projectTitle}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────────────────── */}
      {showEdit && (
        <div className="pf-modal-overlay" onClick={() => setShowEdit(false)}>
          <Dialog className="pf-modal" onClose={() => setShowEdit(false)}>
            <div className="pf-modal-header">
              <h2>Edit profile</h2>
              <button className="pf-modal-close" onClick={() => setShowEdit(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="pf-modal-body">
              <div className="pf-field">
                <label>Major</label>
                <input
                  type="text"
                  value={form.major}
                  onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="pf-field-row">
                <div className="pf-field">
                  <label>Semester</label>
                  <input
                    type="text"
                    value={form.semester}
                    onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                    placeholder="e.g. Spring 2025"
                  />
                </div>
                <div className="pf-field">
                  <label>GPA</label>
                  <input
                    type="text"
                    value={form.gpa}
                    onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))}
                    placeholder="e.g. 3.7 / 4.0"
                  />
                </div>
              </div>

              <div className="pf-field">
                <label>LinkedIn / CV URL</label>
                <input
                  type="text"
                  value={form.linkedIn}
                  onChange={e => setForm(f => ({ ...f, linkedIn: e.target.value }))}
                  placeholder="linkedin.com/in/yourname"
                />
              </div>

              <div className="pf-field">
                <label>Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Write a short bio about yourself..."
                  rows={3}
                />
              </div>

              <div className="pf-field">
                <label>Skills</label>
                <div className="pf-skills-list">
                  {form.skills.map(skill => (
                    <span key={skill} className="pf-skill-tag">
                      {skill}
                      <button
                        className="pf-skill-remove"
                        onClick={() => removeSkill(skill)}
                        title="Remove skill"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="pf-skill-add-row">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Add a skill and press Enter"
                    className="pf-skill-input"
                  />
                  <button className="pf-skill-add-btn" onClick={addSkill}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="pf-modal-footer">
              <button className="pf-btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="pf-btn-save" onClick={handleSave}>
                <Check size={15} /> Save changes
              </button>
            </div>
          </Dialog>
        </div>
      )}

    </div>
  );

  if (inline) return content;

  return (
    <div className="portfolio">
      <PrimaryNav user={user} onNavigate={onNavigate} />
      {content}
    </div>
  );
}
