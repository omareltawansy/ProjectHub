import React, { useState, useMemo } from 'react';
import { Search, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import { useAppData } from '../../data/useAppData';
import './PortfoliosBrowse.css';

export default function PortfoliosBrowse({ user, onNavigate }) {
  const { portfolios, favorites, addFavorite, removeFavorite } = useAppData();
  const navigate = useNavigate();
  
  const majors = [...new Set(portfolios.map(p => p.major))].sort();
  const allSkills = [...new Set(portfolios.flatMap(p => p.skills))].sort();
  
  const [search, setSearch] = useState('');
  const [filterMajor, setFilterMajor] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [sortBy, setSortBy] = useState('projects');
  const [selectedId, setSelectedId] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const myFavPortfolioIds = (favorites || [])
    .filter(f => f.userEmail === user?.email && f.type === 'portfolio')
    .map(f => f.itemId);

  const isFavorited = (id) => myFavPortfolioIds.includes(id);
  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    if (isFavorited(id)) removeFavorite(user.email, 'portfolio', id);
    else addFavorite(user.email, 'portfolio', id);
  };

  const filtered = useMemo(() => {
    let list = portfolios;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }

    if (filterMajor) {
      list = list.filter(p => p.major === filterMajor);
    }

    if (filterSkill) {
      list = list.filter(p => p.skills.includes(filterSkill));
    }

    return [...list].sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : b.projectCount - a.projectCount
    );
  }, [search, filterMajor, filterSkill, sortBy]);

  const selected = selectedId ? portfolios.find(p => p.id === selectedId) : null;

  return (
    <div className="pfb-page">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="pfb-container">
        <div className="pfb-header">
          <div>
            <h1 className="pfb-title">Browse Portfolios</h1>
            <p className="pfb-sub">Explore student portfolios by major or skill</p>
          </div>
        </div>

        <div className="pfb-controls">
          <div className="pfb-search">
            <Search size={14} className="pfb-search-icon" />
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedId(null); }}
            />
          </div>
          <div className="pfb-filters">
            <label>
              Major
              <select value={filterMajor} onChange={e => { setFilterMajor(e.target.value); setSelectedId(null); }}>
                <option value="">All majors</option>
                {majors.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label>
              Skill
              <select value={filterSkill} onChange={e => { setFilterSkill(e.target.value); setSelectedId(null); }}>
                <option value="">All skills</option>
                {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              Sort by
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="projects">Most projects</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>
        </div>

        <div className="pfb-layout">
          {/* List */}
          <div className="pfb-list">
            <div className="pfb-list-head">
              <div className="pfb-list-count">
                {showFavorites
                  ? `${myFavPortfolioIds.length} favourite${myFavPortfolioIds.length !== 1 ? 's' : ''}`
                  : `${filtered.length} portfolio${filtered.length !== 1 ? 's' : ''}`}
              </div>
              <button
                className={`pfb-fav-toggle${showFavorites ? ' active' : ''}`}
                onClick={() => setShowFavorites(f => !f)}
              >
                <Heart size={13} fill={showFavorites ? 'currentColor' : 'none'} /> Favourites
              </button>
            </div>
            {(() => {
              const list = showFavorites
                ? portfolios.filter(p => myFavPortfolioIds.includes(p.id))
                : filtered;
              if (list.length === 0) return <div className="pfb-empty">{showFavorites ? 'No favourited portfolios yet.' : 'No portfolios match your search.'}</div>;
              return list.map(p => (
                <div
                  key={p.id}
                  className={`pfb-card${selectedId === p.id ? ' selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pfb-card-top">
                    <div className="pfb-avatar">{p.image}</div>
                    <div className="pfb-card-info">
                      <div className="pfb-card-name">{p.name}</div>
                      <div className="pfb-card-major">{p.major}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="pfb-project-count">{p.projectCount} projects</span>
                      <button
                        className={`pfb-heart-btn${isFavorited(p.id) ? ' active' : ''}`}
                        onClick={(e) => toggleFavorite(e, p.id)}
                        title={isFavorited(p.id) ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Heart size={13} fill={isFavorited(p.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <div className="pfb-tags">
                    {(p.skills || []).slice(0, 3).map(s => (
                      <span key={s} className="pfb-tag">{s}</span>
                    ))}
                    {(p.skills || []).length > 3 && (
                      <span className="pfb-tag">+{(p.skills || []).length - 3}</span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Detail panel */}
          <div className="pfb-detail">
            {!selected ? (
              <div className="pfb-detail-empty">
                <User size={32} opacity={0.25} />
                <p>Select a portfolio to view details</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    className={`pfb-heart-btn pfb-heart-lg${isFavorited(selected.id) ? ' active' : ''}`}
                    onClick={(e) => toggleFavorite(e, selected.id)}
                  >
                    <Heart size={15} fill={isFavorited(selected.id) ? 'currentColor' : 'none'} />
                    {isFavorited(selected.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
                <div className="pfb-detail-avatar">{selected.image}</div>
                <h2 className="pfb-detail-name">{selected.name}</h2>
                <div className="pfb-detail-meta">{selected.major}</div>
                <div className="pfb-detail-email">{selected.email}</div>

                {selected.bio && (
                  <p className="pfb-detail-bio">{selected.bio}</p>
                )}

                <div className="pfb-detail-section">
                  <div className="pfb-detail-label">Skills</div>
                  <div className="pfb-tags">
                    {selected.skills.map(s => (
                      <span key={s} className="pfb-tag">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="pfb-detail-section">
                  <div className="pfb-detail-label">Projects</div>
                  <div className="pfb-detail-project-count">
                    {selected.projectCount} public project{selected.projectCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
