import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, BookOpen, FolderKanban } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import './PortfoliosSection.css';

const SORT_OPTIONS = [
  { value: 'name',     label: 'Sort: Name' },
  { value: 'projects', label: 'Sort: Projects' },
];

export default function PortfoliosSection() {
  const { portfolios: initialPortfolios } = useAppData();
  const [search, setSearch]           = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [sortBy, setSortBy]           = useState('name');
  const [expandedId, setExpandedId]   = useState(null);

  /* ── Derived filter lists ── */
  const majors = useMemo(
    () => [...new Set(initialPortfolios.map(p => p.major))].sort(),
    [initialPortfolios]
  );
  const skills = useMemo(
    () => [...new Set(initialPortfolios.flatMap(p => p.skills))].sort(),
    [initialPortfolios]
  );

  /* ── Filtered + sorted portfolios ── */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialPortfolios
      .filter(p => {
        if (majorFilter && p.major !== majorFilter) return false;
        if (skillFilter && !p.skills.includes(skillFilter)) return false;
        if (q) {
          return (
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.skills.some(s => s.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) =>
        sortBy === 'projects'
          ? b.projectCount - a.projectCount
          : a.name.localeCompare(b.name)
      );
  }, [initialPortfolios, search, majorFilter, skillFilter, sortBy]);

  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="pfs-root">
      <section className="pfs-card">
        <header className="pfs-card-head">
          <div>
            <h2 className="pfs-card-title">Student portfolios</h2>
            <p className="pfs-card-sub">
              Search and review student portfolios by name, skill, or major.
            </p>
          </div>
        </header>

        {/* ── Toolbar ── */}
        <div className="pfs-toolbar">
          <div className="pfs-search">
            <Search size={16} className="pfs-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or skill…"
            />
          </div>
          <select
            className="pfs-select"
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
          >
            <option value="">All majors</option>
            {majors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            className="pfs-select"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <option value="">All skills</option>
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="pfs-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <div className="pfs-table-wrapper">
          <table className="pfs-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Major</th>
                <th>Skills</th>
                <th>Projects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="5" className="pfs-empty">
                    {search || majorFilter || skillFilter
                      ? 'No portfolios match your filters.'
                      : 'No portfolios available.'}
                  </td>
                </tr>
              ) : (
                visible.map(portfolio => {
                  const isOpen = expandedId === portfolio.id;
                  return (
                    <React.Fragment key={portfolio.id}>

                      {/* ── Main row ── */}
                      <tr>
                        <td>
                          <div className="pfs-student-row">
                            <div className="pfs-avatar">{portfolio.image}</div>
                            <div>
                              <div className="pfs-name">{portfolio.name}</div>
                              <div className="pfs-email">{portfolio.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="pfs-major">{portfolio.major}</td>
                        <td>
                          <div className="pfs-skills-preview">
                            {portfolio.skills.slice(0, 3).map(s => (
                              <span key={s} className="pfs-skill">{s}</span>
                            ))}
                            {portfolio.skills.length > 3 && (
                              <span className="pfs-skill pfs-skill-more">
                                +{portfolio.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="pfs-count">{portfolio.projectCount}</td>
                        <td>
                          <button
                            type="button"
                            className={`pfs-btn-detail${isOpen ? ' active' : ''}`}
                            onClick={() => toggle(portfolio.id)}
                          >
                            {isOpen
                              ? <><ChevronUp size={12} /> Hide</>
                              : <><ChevronDown size={12} /> View</>
                            }
                          </button>
                        </td>
                      </tr>

                      {/* ── Detail panel ── */}
                      {isOpen && (
                        <tr className="pfs-detail-row">
                          <td colSpan="5">
                            <div className="pfs-detail-panel">
                              <div className="pfs-detail-grid">

                                {/* Left: bio + meta */}
                                <div>
                                  <h3 className="pfs-detail-heading">About</h3>
                                  <p className="pfs-bio">{portfolio.bio || 'No bio provided.'}</p>
                                  <ul className="pfs-detail-fields">
                                    <li>
                                      <Mail size={13} className="pfs-field-icon" />
                                      <a href={`mailto:${portfolio.email}`} className="pfs-field-link">
                                        {portfolio.email}
                                      </a>
                                    </li>
                                    <li>
                                      <BookOpen size={13} className="pfs-field-icon" />
                                      <span className="pfs-field-value">{portfolio.major}</span>
                                    </li>
                                    <li>
                                      <FolderKanban size={13} className="pfs-field-icon" />
                                      <span className="pfs-field-value">
                                        {portfolio.projectCount} project{portfolio.projectCount !== 1 ? 's' : ''}
                                      </span>
                                    </li>
                                  </ul>
                                </div>

                                {/* Right: full skills */}
                                <div>
                                  <h3 className="pfs-detail-heading">Skills</h3>
                                  <div className="pfs-skills-full">
                                    {portfolio.skills.map(s => (
                                      <span key={s} className="pfs-skill pfs-skill-detail">{s}</span>
                                    ))}
                                  </div>
                                </div>

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

        <p className="pfs-footer">
          Showing {visible.length} of {initialPortfolios.length} portfolios
        </p>
      </section>
    </div>
  );
}
