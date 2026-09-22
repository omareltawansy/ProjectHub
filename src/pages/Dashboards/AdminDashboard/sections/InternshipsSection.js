import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Archive,
  ArchiveRestore,
  Users as UsersIcon,
  Calendar,
  MapPin,
  Building2,
} from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal.js';
import './InternshipsSection.css';

const TABS = ['All', 'Active', 'Archived'];

export default function InternshipsSection() {
  const { internships: initialInternships, updateInternships } = useAppData();
  const [internships, setInternships] = useState(initialInternships);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const toast = useToast();

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return internships.filter(i => {
      if (activeTab === 'Active' && i.archived) return false;
      if (activeTab === 'Archived' && !i.archived) return false;
      if (!q) return true;
      return [i.title, i.company, i.type, i.location]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [internships, activeTab, search]);

  const tabCount = (tab) => {
    if (tab === 'All') return internships.length;
    if (tab === 'Active') return internships.filter(i => !i.archived).length;
    return internships.filter(i => i.archived).length;
  };

  const toggleArchive = (id) => {
    const updatedInternships = internships.map(i => i.id === id ? { ...i, archived: !i.archived } : i);
    setInternships(updatedInternships);
    updateInternships(updatedInternships);
    const target = internships.find(i => i.id === id);
    toast.success(`"${target?.title}" ${target?.archived ? 'restored' : 'archived'}`);
    setConfirmTarget(null);
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="is-root">
      <section className="is-card">
        <header className="is-header">
          <div>
            <h2 className="is-card-title">Internship oversight</h2>
            <p className="is-card-sub">
              Review postings across the platform and take down problematic ones.
            </p>
          </div>
        </header>

        <div className="is-toolbar">
          <div className="is-search">
            <Search size={16} className="is-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, type, or location"
            />
          </div>
          <div className="is-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`is-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab); setExpandedId(null); }}
              >
                {tab}
                <span className={`is-tab-count${activeTab === tab ? ' active' : ''}`}>
                  {tabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="is-table-wrapper">
          <table className="is-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="is-empty">
                    {search || activeTab !== 'All'
                      ? 'No internships match these filters.'
                      : 'No internships posted yet.'}
                  </td>
                </tr>
              ) : (
                visible.map(intern => {
                  const isOpen = expandedId === intern.id;
                  return (
                    <React.Fragment key={intern.id}>
                      <tr>
                        <td className="is-title">{intern.title}</td>
                        <td className="is-company">{intern.company}</td>
                        <td>
                          {intern.archived ? (
                            <span className="is-status-badge is-status-archived">Archived</span>
                          ) : (
                            <span className={`is-status-badge is-status-${(intern.status || 'open').toLowerCase()}`}>
                              {intern.status}
                            </span>
                          )}
                        </td>
                        <td className="is-applicants">
                          <span className="is-applicants-content">
                            <UsersIcon size={12} /> {intern.applicants?.length || 0}
                          </span>
                        </td>
                        <td className="is-date">{intern.postedDate}</td>
                        <td>
                          <div className="is-action-btns">
                            <button
                              type="button"
                              className={`is-btn-details${isOpen ? ' active' : ''}`}
                              onClick={() => setExpandedId(isOpen ? null : intern.id)}
                            >
                              {isOpen ? (
                                <>Hide <ChevronUp size={12} /></>
                              ) : (
                                <>View <ChevronDown size={12} /></>
                              )}
                            </button>
                            {intern.archived ? (
                              <button
                                type="button"
                                className="is-btn-restore"
                                onClick={() => toggleArchive(intern.id)}
                              >
                                <ArchiveRestore size={12} /> Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="is-btn-takedown"
                                onClick={() => setConfirmTarget(intern)}
                              >
                                <Archive size={12} /> Take down
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="is-detail-row">
                          <td colSpan="6">
                            <div className="is-detail-panel">
                              <div className="is-detail-grid">
                                <div className="is-detail-col">
                                  <h3 className="is-detail-heading">Details</h3>
                                  <p className="is-detail-bio">
                                    {intern.description || 'No description provided.'}
                                  </p>
                                  <ul className="is-detail-fields">
                                    <li>
                                      <Building2 size={13} /> <strong>{intern.type}</strong> · {intern.duration}
                                    </li>
                                    {intern.location && (
                                      <li><MapPin size={13} /> {intern.location}</li>
                                    )}
                                    {intern.deadline && (
                                      <li><Calendar size={13} /> Apply by {intern.deadline}</li>
                                    )}
                                  </ul>
                                  {intern.skills?.length > 0 && (
                                    <div className="is-detail-skills">
                                      {intern.skills.map(skill => (
                                        <span key={skill} className="is-skill">{skill}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="is-detail-col">
                                  <h3 className="is-detail-heading">
                                    Applicants ({intern.applicants?.length || 0})
                                  </h3>
                                  {!intern.applicants || intern.applicants.length === 0 ? (
                                    <p className="is-no-applicants">No applicants yet.</p>
                                  ) : (
                                    <ul className="is-applicant-list">
                                      {intern.applicants.map(a => (
                                        <li key={a.id} className="is-applicant">
                                          <div>
                                            <span className="is-applicant-name">{a.name}</span>
                                            <span className="is-applicant-meta">{a.major}</span>
                                          </div>
                                          <span className={`is-applicant-status applicant-status-${(a.status || '').toLowerCase()}`}>
                                            {a.status}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
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
      </section>

      <ConfirmModal
        open={!!confirmTarget}
        title="Take down this internship?"
        message={`"${confirmTarget?.title}" by ${confirmTarget?.company} will be archived and hidden from students.`}
        confirmLabel="Take down"
        variant="danger"
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && toggleArchive(confirmTarget.id)}
      />
    </div>
  );
}
