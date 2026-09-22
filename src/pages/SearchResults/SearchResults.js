import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowRight, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import { useAppData } from '../../data/useAppData';
import './SearchResults.css';

export default function SearchResults({ user, onNavigate, initialQuery = '' }) {
  const { portfolios, projects, users } = useAppData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('projectCount');
  const [searchType, setSearchType] = useState('portfolios');
  const [favorites, setFavorites] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectComment, setProjectComment] = useState('');
  const [projectComments, setProjectComments] = useState([]);
  const [projectRating, setProjectRating] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Initialize search query when prop changes
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Get unique majors and skills from portfolios
  const allMajors = [...new Set(portfolios.map(p => p.major))];
  const allSkills = [...new Set(portfolios.flatMap(p => p.skills))];

  // Filter and search logic
  const filteredPortfolios = useMemo(() => {
    let results = portfolios.filter(portfolio => {
      const matchesSearch =
        searchQuery === '' ||
        portfolio.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        portfolio.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMajor =
        selectedMajors.length === 0 ||
        selectedMajors.includes(portfolio.major);

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.every(skill => portfolio.skills.includes(skill));

      return matchesSearch && matchesMajor && matchesSkills;
    });

    if (sortBy === 'projectCount') {
      results.sort((a, b) => b.projectCount - a.projectCount);
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [searchQuery, selectedMajors, selectedSkills, sortBy]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstructors = users.filter(user =>
    user.role === 'instructor' &&
    (
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.courses || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleMajorChange = (major) => {
    setSelectedMajors(prev =>
      prev.includes(major)
        ? prev.filter(m => m !== major)
        : [...prev, major]
    );
  };

  const handleSkillChange = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMajors([]);
    setSelectedSkills([]);
    setSortBy('projectCount');
  };

  const toggleFavorite = (project) => {
    const exists = favorites.find(f => f.id === project.id);

    if (exists) {
      setFavorites(favorites.filter(f => f.id !== project.id));
    } else {
      setFavorites([...favorites, project]);
    }
  };

  const addProjectComment = () => {
    if (projectComment.trim()) {
      setProjectComments([...projectComments, projectComment]);
      setProjectComment('');
    }
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedMajors.length > 0 ||
    selectedSkills.length > 0;

  const getResultsSubtitle = () => {
    const parts = [];

    if (searchQuery) {
      parts.push(`matching "${searchQuery}"`);
    }

    if (selectedMajors.length > 0) {
      parts.push(`in ${selectedMajors.join(' or ')}`);
    }

    if (selectedSkills.length > 0) {
      parts.push(`with all of: ${selectedSkills.join(', ')}`);
    }

    if (parts.length === 0) {
      return 'All portfolios';
    }

    return 'Results ' + parts.join(' ');
  };

  return (
    <>
    <div className="search-results-page">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="sr-container">

        {/* Header */}
        <div className="sr-header">
          <h1 className="sr-title">Find Results</h1>
          <p className="sr-subtitle">
            Search portfolios, projects, and instructors
          </p>
        </div>

        <div className="sr-content">

          {/* Sidebar Filters */}
          <aside className="sr-sidebar">

            <div className="sr-filter-section">
              <h3 className="sr-filter-title">Search Type</h3>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="sr-sort-select"
              >
                <option value="portfolios">Portfolios</option>
                <option value="projects">Projects</option>
                <option value="instructors">Course Instructors</option>
              </select>
            </div>

            {searchType === 'portfolios' && (
              <div className="sr-filter-section">
                <h3 className="sr-filter-title">Filters</h3>

                {/* Major Filter */}
                <div className="sr-filter-group">
                  <label className="sr-filter-label">Major</label>

                  <div className="sr-checkbox-group">
                    {allMajors.map(major => (
                      <label key={major} className="sr-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedMajors.includes(major)}
                          onChange={() => handleMajorChange(major)}
                        />
                        <span>{major}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div className="sr-filter-group">
                  <label className="sr-filter-label">Skills</label>

                  <div className="sr-checkbox-group">
                    {allSkills.map(skill => (
                      <label key={skill} className="sr-checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => handleSkillChange(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    className="sr-clear-filters"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="sr-main">

            {/* Search Bar */}
            <div className="sr-search-bar">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sr-search-input"
              />

              <Search size={18} className="sr-search-icon" />
            </div>

            {/* Results Header */}
            <div className="sr-results-header">

              <div className="sr-result-info">
                <div className="sr-result-count">
                  {searchType === 'portfolios' && filteredPortfolios.length}
                  {searchType === 'projects' && filteredProjects.length}
                  {searchType === 'instructors' && filteredInstructors.length}

                  {' '}result
                  {(
                    (searchType === 'portfolios' && filteredPortfolios.length !== 1) ||
                    (searchType === 'projects' && filteredProjects.length !== 1) ||
                    (searchType === 'instructors' && filteredInstructors.length !== 1)
                  ) ? 's' : ''}
                </div>

                <div className="sr-result-subtitle">
                  {searchType === 'portfolios'
                    ? getResultsSubtitle()
                    : `Results matching "${searchQuery}"`}
                </div>
              </div>

              {searchType === 'portfolios' && (
                <div className="sr-sort-control">
                  <label
                    htmlFor="sort-select"
                    className="sr-sort-label"
                  >
                    Sort by:
                  </label>

                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sr-sort-select"
                  >
                    <option value="projectCount">
                      Project Count (High to Low)
                    </option>

                    <option value="name">
                      Name (A to Z)
                    </option>
                  </select>
                </div>
              )}
            </div>

            {/* PORTFOLIOS */}
            {searchType === 'portfolios' && (
              filteredPortfolios.length > 0 ? (
                <div className="sr-grid">
                  {filteredPortfolios.map(portfolio => (
                    <div key={portfolio.id} className="sr-card">

                      <div className="sr-card-header">
                        <div className="sr-avatar">
                          {portfolio.image}
                        </div>

                        <div className="sr-header-info">
                          <h2 className="sr-card-name">
                            {portfolio.name}
                          </h2>

                          <p className="sr-card-email">
                            {portfolio.email}
                          </p>
                        </div>
                      </div>

                      <div className="sr-card-body">
                        <p className="sr-card-bio">
                          {portfolio.bio}
                        </p>

                        <div className="sr-info-row">
                          <span className="sr-info-label">
                            Major:
                          </span>

                          <span className="sr-major-badge">
                            {portfolio.major}
                          </span>
                        </div>

                        <div className="sr-skills-row">
                          <span className="sr-info-label">
                            Skills:
                          </span>

                          <div className="sr-skills-list">
                            {portfolio.skills.map(skill => (
                              <span
                                key={skill}
                                className="sr-skill-tag"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="sr-projects-info">
                          <div className="sr-project-stat">
                            <span className="sr-project-count">
                              {portfolio.projectCount}
                            </span>

                            <span className="sr-project-label">
                              Project{portfolio.projectCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sr-card-footer">
                        <button
                          type="button"
                          className="sr-view-profile-btn"
                          onClick={() => navigate(`/portfolio/view/${portfolio.id}`)}
                        >
                          View Portfolio <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sr-empty-state">
                  <div className="sr-empty-icon">
                    <SearchX size={32} />
                  </div>

                  <h3 className="sr-empty-title">
                    No portfolios found
                  </h3>

                  <p className="sr-empty-message">
                    Try adjusting your search or filters.
                  </p>
                </div>
              )
            )}

            {/* PROJECTS */}
            {searchType === 'projects' && (
              <div className="sr-grid">

                {filteredProjects.map(project => (
                  <div key={project.id} className="sr-card">

                    <div className="sr-card-body">
                      <h2>{project.title}</h2>

                      <p>{project.course}</p>

                      <p>Status: {project.status}</p>

                      <p>Rating: {project.rating}</p>

                      <button
                        onClick={() => setSelectedProject(project)}
                      >
                        View Details
                      </button>

                      {(user?.role === 'student' || user?.role === 'employer') && (
                        <button
                          onClick={() => toggleFavorite(project)}
                        >
                          Favorite
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="sr-card">
                  <h3>Recommended Projects</h3>

                  {projects.slice(0, 2).map(project => (
                    <p key={project.id}>{project.title}</p>
                  ))}
                </div>

                {(user?.role === 'student' || user?.role === 'employer') && (
                  <div className="sr-card">
                    <h3>Favorites</h3>

                    {favorites.map(project => (
                      <p key={project.id}>{project.title}</p>
                    ))}
                  </div>
                )}

                {user?.role === 'student' && (
                  <div className="sr-card">
                    <h3>Statistics</h3>

                    <p>Total Projects: {projects.length}</p>
                  </div>
                )}
              </div>
            )}

            {/* INSTRUCTORS */}
            {searchType === 'instructors' && (
              <div className="sr-grid">
                {filteredInstructors.length === 0 ? (
                  <div className="sr-empty-state">
                    <div className="sr-empty-icon"><SearchX size={32} /></div>
                    <h3 className="sr-empty-title">No instructors found</h3>
                    <p className="sr-empty-message">Try a different search term.</p>
                  </div>
                ) : (
                  filteredInstructors.map(instructor => {
                    const initials = (instructor.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div key={instructor.id} className="sr-card">
                        <div className="sr-card-header">
                          <div className="sr-avatar" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                            {initials}
                          </div>
                          <div className="sr-header-info">
                            <h2 className="sr-card-name">{instructor.name}</h2>
                            <p className="sr-card-email">{instructor.email}</p>
                          </div>
                        </div>
                        <div className="sr-card-body">
                          <div className="sr-skills-row">
                            <span className="sr-info-label">Courses:</span>
                            <div className="sr-skills-list">
                              {(instructor.courses || []).map(c => (
                                <span key={c} className="sr-skill-tag">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="sr-card-footer">
                          <button
                            type="button"
                            className="sr-view-profile-btn"
                            onClick={() => navigate(`/instructor-profile/${instructor.id}`)}
                          >
                            View Profile <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* PROJECT DETAILS */}
            {selectedProject && (
              <div className="sr-card sr-card-detail">
                <h2>{selectedProject.title}</h2>

                <p>{selectedProject.course}</p>

                {user?.role === 'instructor' && (
                  <>
                    <h3>Project / Thesis Comment</h3>

                    <input
                      value={projectComment}
                      onChange={(e) => setProjectComment(e.target.value)}
                      placeholder="Add comment"
                      className="sr-search-input"
                    />

                    <button onClick={addProjectComment}>
                      Add Comment
                    </button>

                    <h3>Task Comment</h3>

                    <button onClick={addProjectComment}>
                      Add Task Comment
                    </button>

                    {projectComments.map((comment, index) => (
                      <p key={index}>{comment}</p>
                    ))}

                    <h3>Rate Project</h3>

                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setProjectRating(n)}
                      >
                        {n}
                      </button>
                    ))}

                    <p>Your Rating: {projectRating}</p>
                  </>
                )}

                <h3>Notifications</h3>

                <button
                  onClick={() =>
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                >
                  {notificationsEnabled
                    ? 'Turn Off Notifications'
                    : 'Turn On Notifications'}
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>

    </>
  );
}