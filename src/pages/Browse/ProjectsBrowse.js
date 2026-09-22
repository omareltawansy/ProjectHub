import React, { useState, useMemo } from 'react';
import { Search, Star, ExternalLink, FolderKanban, Heart } from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import { useAppData } from '../../data/useAppData';
import { safeUrl } from '../../utils/safeUrl';
import './ProjectsBrowse.css';

export default function ProjectsBrowse({ user, onNavigate }) {
  const { projects, courses, favorites, addFavorite, removeFavorite, portfolios } = useAppData();
  
  const publicProjects = projects.filter(p => p.visibility === 'public');
  const courseNames = [...new Set(publicProjects.map(p => p.course))].sort();
  const instructorNames = [
    ...new Set(courses.flatMap(c => c.instructors.map(i => i.name))),
  ].sort();

  function parseDate(str) {
    return str ? new Date(str) : new Date(0);
  }

  function getInstructorsForCourse(courseName) {
    const c = courses.find(c => c.name === courseName);
    return c ? c.instructors.map(i => i.name) : [];
  }

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterInstructor, setFilterInstructor] = useState('');
  const [sortBy,           setSortBy]           = useState('date');
  const [selectedId,       setSelectedId]       = useState(null);
  const [showFavorites,    setShowFavorites]     = useState(false);

  // User's favorited project IDs
  const myFavProjectIds = (favorites || [])
    .filter(f => f.userEmail === user?.email && f.type === 'project')
    .map(f => f.itemId);

  const isFavorited = (id) => myFavProjectIds.includes(id);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    if (isFavorited(id)) {
      removeFavorite(user.email, 'project', id);
    } else {
      addFavorite(user.email, 'project', id);
    }
  };

  // Recommended: public projects with highest rating or same tech stack as user's portfolio
  const userPortfolio = portfolios?.find(p => p.email === user?.email);
  const userSkills = userPortfolio?.skills || [];
  const recommended = useMemo(() => {
    const scored = publicProjects.map(p => {
      let score = p.rating || 0;
      const tech = p.techStack || p.languages || [];
      tech.forEach(t => { if (userSkills.some(s => s.toLowerCase() === t.toLowerCase())) score += 1; });
      return { ...p, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 4);
  }, [publicProjects, userSkills]);

  const filtered = useMemo(() => {
    let list = publicProjects;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q));
    }

    if (filterCourse) {
      list = list.filter(p => p.course === filterCourse);
    }

    if (filterInstructor) {
      const instructorCourses = courses
        .filter(c => c.instructors.some(i => i.name === filterInstructor))
        .map(c => c.name);
      list = list.filter(p => instructorCourses.includes(p.course));
    }

    return [...list].sort((a, b) =>
      sortBy === 'rating'
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : parseDate(b.createdDate) - parseDate(a.createdDate)
    );
  }, [search, filterCourse, filterInstructor, sortBy]);

  const selected = selectedId
    ? publicProjects.find(p => p.id === selectedId)
    : null;

  const instructors = selected ? getInstructorsForCourse(selected.course) : [];

  return (
    <div className="pbr-page">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="pbr-container">
        <div className="pbr-header">
          <div>
            <h1 className="pbr-title">Browse Projects</h1>
            <p className="pbr-sub">Explore public student projects</p>
          </div>
        </div>

        <div className="pbr-controls">
          <div className="pbr-search">
            <Search size={14} className="pbr-search-icon" />
            <input
              placeholder="Search by title..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedId(null); }}
            />
          </div>
          <div className="pbr-filters">
            <label>
              Course
              <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setSelectedId(null); }}>
                <option value="">All courses</option>
                {courseNames.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Instructor
              <select value={filterInstructor} onChange={e => { setFilterInstructor(e.target.value); setSelectedId(null); }}>
                <option value="">All instructors</option>
                {instructorNames.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <label>
              Sort by
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date">Creation date</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>
        </div>

        {/* Recommended section */}
        {!search && !filterCourse && !filterInstructor && recommended.length > 0 && (
          <div className="pbr-recommended">
            <div className="pbr-recommended-header">
              <Star size={14} fill="currentColor" style={{ marginRight: 6, opacity: 0.7 }} />
              Recommended for you
            </div>
            <div className="pbr-recommended-list">
              {recommended.map(p => (
                <button
                  key={p.id}
                  className={`pbr-rec-card${selectedId === p.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <div className="pbr-rec-title">{p.title}</div>
                  <div className="pbr-rec-meta">{p.course}</div>
                  {p.rating != null && (
                    <span className="pbr-rec-rating"><Star size={10} fill="currentColor" /> {p.rating}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pbr-layout">
          {/* List */}
          <div className="pbr-list">
            <div className="pbr-list-head">
              <div className="pbr-list-count">
                {showFavorites ? `${myFavProjectIds.length} favourite${myFavProjectIds.length !== 1 ? 's' : ''}` : `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
              </div>
              <button
                className={`pbr-fav-toggle${showFavorites ? ' active' : ''}`}
                onClick={() => setShowFavorites(f => !f)}
              >
                <Heart size={13} fill={showFavorites ? 'currentColor' : 'none'} /> Favourites
              </button>
            </div>
            {(() => {
              const list = showFavorites
                ? publicProjects.filter(p => myFavProjectIds.includes(p.id))
                : filtered;
              if (list.length === 0) return <div className="pbr-empty">{showFavorites ? 'No favourited projects yet.' : 'No projects match your search.'}</div>;
              return list.map(p => (
                <div
                  key={p.id}
                  className={`pbr-card${selectedId === p.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pbr-card-top">
                    <div className="pbr-card-left">
                      <div className="pbr-card-course">{p.course}</div>
                      <div className="pbr-card-title">{p.title}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {p.rating != null && (
                        <span className="pbr-rating">
                          <Star size={11} fill="currentColor" /> {p.rating}
                        </span>
                      )}
                      <button
                        className={`pbr-heart-btn${isFavorited(p.id) ? ' active' : ''}`}
                        onClick={(e) => toggleFavorite(e, p.id)}
                        title={isFavorited(p.id) ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Heart size={14} fill={isFavorited(p.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <div className="pbr-card-meta">{p.studentName} · {p.createdDate}</div>
                  {(p.languages || p.techStack || []).length > 0 && (
                    <div className="pbr-tags">
                      {(p.languages || p.techStack || []).slice(0, 3).map(l => (
                        <span key={l} className="pbr-tag">{l}</span>
                      ))}
                      {(p.languages || p.techStack || []).length > 3 && (
                        <span className="pbr-tag">+{(p.languages || p.techStack || []).length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Detail panel */}
          <div className="pbr-detail">
            {!selected ? (
              <div className="pbr-detail-empty">
                <FolderKanban size={32} opacity={0.25} />
                <p>Select a project to view details</p>
              </div>
            ) : (
              <>
                <div className="pbr-detail-course-row">
                  <div className="pbr-detail-course">{selected.course}</div>
                  <button
                    className={`pbr-heart-btn${isFavorited(selected.id) ? ' active' : ''}`}
                    onClick={(e) => toggleFavorite(e, selected.id)}
                    title={isFavorited(selected.id) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <Heart size={16} fill={isFavorited(selected.id) ? 'currentColor' : 'none'} />
                    {isFavorited(selected.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
                <h2 className="pbr-detail-title">{selected.title}</h2>
                <div className="pbr-detail-by">By {selected.studentName} · {selected.createdDate}</div>

                {selected.rating != null && (
                  <div className="pbr-detail-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} className={`pbr-star${selected.rating >= n ? ' filled' : ''}`}>★</span>
                    ))}
                    <span className="pbr-detail-rating-val">{selected.rating}/5</span>
                  </div>
                )}

                {instructors.length > 0 && (
                  <div className="pbr-detail-section">
                    <div className="pbr-detail-label">Course instructor{instructors.length > 1 ? 's' : ''}</div>
                    <div className="pbr-detail-instructors">
                      {instructors.map(i => (
                        <span key={i} className="pbr-instructor-chip">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.languages.length > 0 && (
                  <div className="pbr-detail-section">
                    <div className="pbr-detail-label">Technologies</div>
                    <div className="pbr-tags">
                      {selected.languages.map(l => (
                        <span key={l} className="pbr-tag">{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pbr-detail-section">
                  <div className="pbr-detail-label">Links</div>
                  <div className="pbr-links">
                    {selected.github && (
                      <a href={safeUrl(selected.github)} target="_blank" rel="noreferrer" className="pbr-link">
                        <ExternalLink size={13} /> GitHub
                      </a>
                    )}
                    {selected.report && (
                      <a href={safeUrl(selected.report)} target="_blank" rel="noreferrer" className="pbr-link">
                        <ExternalLink size={13} /> Report
                      </a>
                    )}
                    {selected.demoVideo && (
                      <a href={safeUrl(selected.demoVideo)} target="_blank" rel="noreferrer" className="pbr-link">
                        <ExternalLink size={13} /> Demo video
                      </a>
                    )}
                    {!selected.github && !selected.report && !selected.demoVideo && (
                      <span className="pbr-no-links">No links provided</span>
                    )}
                  </div>
                </div>

                {selected.flagged && (
                  <div className="pbr-flagged-notice">This project has been flagged by an instructor.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
