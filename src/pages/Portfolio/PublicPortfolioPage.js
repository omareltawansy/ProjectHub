import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import { useAppData } from '../../data/useAppData';
import './portfolio.css';

export default function PublicPortfolioPage({ user, onNavigate }) {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const { portfolios, projects } = useAppData();

  const portfolio = portfolios.find(p => p.id === parseInt(portfolioId));

  if (!portfolio) {
    return (
      <div className="portfolio">
        <PrimaryNav user={user} onNavigate={onNavigate} />
        <div className="portfolio-page" style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-on-surface)' }}>Portfolio not found</h2>
          <button
            className="portfolio-back-btn"
            onClick={() => navigate(-1)}
            style={{ marginTop: '16px' }}
          >
            <ArrowLeft size={20} /> Go back
          </button>
        </div>
      </div>
    );
  }

  // Get the public projects for this portfolio user
  const userProjects = projects.filter(
    p => p.visibility === 'public' &&
      (p.studentName === portfolio.name || p.studentEmail === portfolio.email)
  );

  return (
    <div className="portfolio">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="portfolio-page">
        {/* Header */}
        <div className="portfolio-header">
          <button className="portfolio-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>

          <div className="portfolio-header-content">
            <div className="portfolio-profile">
              <div className="portfolio-avatar">{portfolio.image}</div>
              <div className="portfolio-info">
                <h1 className="portfolio-name">{portfolio.name}</h1>
                <p className="portfolio-subtitle">
                  {portfolio.major} · {portfolio.email}
                </p>
                <div className="portfolio-skills">
                  {portfolio.skills.map(skill => (
                    <span key={skill} className="skill-badge">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info & Stats */}
        <div className="portfolio-grid-2">
          <div className="portfolio-card">
            <div className="portfolio-card-header"><h2>Basic info</h2></div>
            <div className="portfolio-card-content">
              <div className="info-row">
                <span className="info-label">Major</span>
                <span className="info-value">{portfolio.major}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{portfolio.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Skills</span>
                <div className="skills-container">
                  {portfolio.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="portfolio-card">
            <div className="portfolio-card-header"><h2>Statistics</h2></div>
            <div className="portfolio-stats">
              <div className="stat-box">
                <div className="stat-number">{portfolio.projectCount}</div>
                <div className="stat-label">Total projects</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{userProjects.length}</div>
                <div className="stat-label">Public</div>
              </div>
            </div>
            {portfolio.bio && (
              <div style={{ padding: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
                {portfolio.bio}
              </div>
            )}
          </div>
        </div>

        {/* Public Projects */}
        {userProjects.length > 0 && (
          <div className="portfolio-card portfolio-full">
            <div className="portfolio-card-header"><h2>Projects</h2></div>
            <div className="portfolio-projects-list">
              {userProjects.map(project => (
                <div key={project.id} className="portfolio-project-row">
                  <div className="project-icon"><FileText size={24} /></div>
                  <div className="project-details">
                    <h3>{project.title}</h3>
                    <p>{project.course} · {project.createdDate || project.createdAt || ''}</p>
                  </div>
                  <div className="project-meta">
                    {project.rating && <span className="project-rating">{project.rating}</span>}
                    <span className={`project-visibility public`}>Public</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
