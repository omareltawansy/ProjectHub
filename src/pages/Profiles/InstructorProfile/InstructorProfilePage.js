import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FolderKanban, Mail, User } from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import { useAppData } from '../../../data/useAppData.js';
import './InstructorProfilePage.css';

export default function InstructorProfilePage({ user, onNavigate }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { users, courses, projects } = useAppData();

  if (!user) { window.location.href = '/login'; return null; }

  const instructor = users.find(u => String(u.id) === String(userId) && u.role === 'instructor');

  if (!instructor) {
    return (
      <div className="ip-root">
        <PrimaryNav user={user} onNavigate={onNavigate} />
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Instructor not found.
        </div>
      </div>
    );
  }

  const initials = (instructor.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Courses this instructor teaches
  const myCourses = courses.filter(c =>
    c.instructors.some(i => i.name === instructor.name)
  );

  // Projects in those courses
  const courseNames = myCourses.map(c => c.name);
  const relatedProjects = projects.filter(p => courseNames.includes(p.course));

  return (
    <div className="ip-root">
      <PrimaryNav user={user} onNavigate={onNavigate} />
      <div className="ip-page">
        <div className="ip-header">
          <button className="ip-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>

          <div className="ip-profile-row">
            <div className="ip-avatar">{initials}</div>
            <div className="ip-info">
              <h1 className="ip-name">{instructor.name}</h1>
              <p className="ip-role">Course Instructor</p>
              <a href={`mailto:${instructor.email}`} className="ip-email">
                <Mail size={13} /> {instructor.email}
              </a>
            </div>
          </div>
        </div>

        <div className="ip-grid">
          {/* Courses */}
          <div className="ip-card">
            <div className="ip-card-header">
              <BookOpen size={15} style={{ marginRight: 6 }} />
              <h2>Courses taught</h2>
            </div>
            {myCourses.length === 0 ? (
              <p className="ip-empty">No courses linked yet.</p>
            ) : (
              <div className="ip-courses-list">
                {myCourses.map(c => (
                  <div key={c.id} className="ip-course-row">
                    <div className="ip-course-icon"><BookOpen size={14} /></div>
                    <div>
                      <div className="ip-course-name">{c.name}</div>
                      <div className="ip-course-code">{c.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="ip-card">
            <div className="ip-card-header">
              <User size={15} style={{ marginRight: 6 }} />
              <h2>Statistics</h2>
            </div>
            <div className="ip-stats-grid">
              <div className="ip-stat">
                <div className="ip-stat-val">{myCourses.length}</div>
                <div className="ip-stat-label">Courses</div>
              </div>
              <div className="ip-stat">
                <div className="ip-stat-val">{relatedProjects.length}</div>
                <div className="ip-stat-label">Student projects</div>
              </div>
              <div className="ip-stat">
                <div className="ip-stat-val">{relatedProjects.filter(p => p.flagged).length}</div>
                <div className="ip-stat-label">Flagged projects</div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="ip-card ip-card-wide">
            <div className="ip-card-header">
              <FolderKanban size={15} style={{ marginRight: 6 }} />
              <h2>Recent student projects</h2>
            </div>
            {relatedProjects.length === 0 ? (
              <p className="ip-empty">No projects in these courses yet.</p>
            ) : (
              <div className="ip-project-list">
                {relatedProjects.slice(0, 8).map(p => (
                  <div key={p.id} className="ip-project-row">
                    <div>
                      <div className="ip-project-title">{p.title}</div>
                      <div className="ip-project-meta">{p.studentName} · {p.course}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {p.flagged && <span className="ip-badge-flagged">Flagged</span>}
                      {p.rating && <span className="ip-rating">⭐ {p.rating}</span>}
                      <span className={`ip-badge ip-badge-${(p.status || 'active').toLowerCase()}`}>
                        {p.status || 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
