import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Flag, RotateCcw, ExternalLink } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal.js';
import { safeUrl } from '../../../../utils/safeUrl';
import './EmployersSection.css';

const TABS = ['All', 'Pending', 'Accepted', 'Rejected', 'Flagged'];

const TAB_FILTERS = {
  All: () => true,
  Pending: (e) => e.status === 'pending',
  Accepted: (e) => e.status === 'accepted',
  Rejected: (e) => e.status === 'rejected',
  Flagged: (e) => e.flagged,
};

function downloadDoc(doc) {
  const blob = new Blob(['Simulated PDF content'], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EmployersSection() {
  const navigate = useNavigate();
  const { employers: initialEmployers, updateEmployers } = useAppData();
  const [employers, setEmployers] = useState(
    initialEmployers.map(e => ({ ...e, flagged: e.flagged || false }))
  );
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const toast = useToast();

  const visibleEmployers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employers
      .filter(TAB_FILTERS[activeTab])
      .filter(e => {
        if (!q) return true;
        return (
          (e.companyName || '').toLowerCase().includes(q) ||
          (e.contactName || '').toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q) ||
          (e.industry || '').toLowerCase().includes(q)
        );
      });
  }, [employers, activeTab, search]);

  const tabCount = (tab) => employers.filter(TAB_FILTERS[tab]).length;

  const updateStatus = (id, newStatus) => {
    const updatedEmployers = employers.map(e => e.id === id ? { ...e, status: newStatus, flagged: false } : e);
    setEmployers(updatedEmployers);
    updateEmployers(updatedEmployers);
    if (expandedId === id) setExpandedId(null);
  };

  const toggleFlag = (id) => {
    const updatedEmployers = employers.map(e => e.id === id ? { ...e, flagged: !e.flagged } : e);
    setEmployers(updatedEmployers);
    updateEmployers(updatedEmployers);
  };

  const performAction = () => {
    if (!confirmAction) return;
    const { type, employer } = confirmAction;
    if (type === 'accept') {
      updateStatus(employer.id, 'accepted');
      toast.success(`${employer.companyName} approved.`);
    } else if (type === 'reject') {
      updateStatus(employer.id, 'rejected');
      toast.info(`${employer.companyName} rejected.`);
    } else if (type === 're-pend') {
      updateStatus(employer.id, 'pending');
      toast.info(`${employer.companyName} returned to pending review.`);
    } else if (type === 'flag') {
      toggleFlag(employer.id);
      toast.info(`${employer.companyName} ${employer.flagged ? 'unflagged' : 'flagged for review'}.`);
    }
    setConfirmAction(null);
  };

  const toggleExpand = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div className="es-root">
      <section className="es-card">
        <header className="es-card-head">
          <div>
            <h2 className="es-card-title">Employer applications</h2>
            <p className="es-card-sub">
              Review pending registrations, undo decisions, and flag accepted employers for re-review.
            </p>
          </div>
        </header>

        <div className="es-toolbar">
          <div className="es-search">
            <Search size={16} className="es-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, contact, email, or industry"
            />
          </div>
          <div className="es-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`es-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab); setExpandedId(null); }}
              >
                {tab}
                <span className={`es-tab-count${activeTab === tab ? ' active' : ''}`}>
                  {tabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="es-table-wrapper">
          <table className="es-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEmployers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="es-empty">
                    {search ? 'No employers match your search.' : 'No employers in this category.'}
                  </td>
                </tr>
              ) : (
                visibleEmployers.map(employer => (
                  <React.Fragment key={employer.id}>
                    <tr className={expandedId === employer.id ? 'es-row-expanded' : ''}>
                      <td className="es-company-name">{employer.companyName}</td>
                      <td>{employer.contactName}</td>
                      <td className="es-email">{employer.email}</td>
                      <td>{employer.industry}</td>
                      <td>
                        <div className="es-status-stack">
                          <span className={`es-status-badge es-status-${employer.status}`}>
                            {employer.status.charAt(0).toUpperCase() + employer.status.slice(1)}
                          </span>
                          {employer.flagged && (
                            <span className="es-flag-pill">
                              <Flag size={10} /> Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="es-action-btns">
                          <button
                            type="button"
                            className={`es-btn-details${expandedId === employer.id ? ' active' : ''}`}
                            onClick={() => toggleExpand(employer.id)}
                          >
                            {expandedId === employer.id ? 'Hide' : 'Details'}
                          </button>

                          {employer.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="es-btn-accept"
                                onClick={() => setConfirmAction({ type: 'accept', employer })}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                className="es-btn-reject"
                                onClick={() => setConfirmAction({ type: 'reject', employer })}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {employer.status === 'accepted' && (
                            <>
                              <button
                                type="button"
                                className={`es-btn-flag${employer.flagged ? ' active' : ''}`}
                                onClick={() => setConfirmAction({ type: 'flag', employer })}
                              >
                                <Flag size={12} /> {employer.flagged ? 'Unflag' : 'Flag'}
                              </button>
                              <button
                                type="button"
                                className="es-btn-repend"
                                onClick={() => setConfirmAction({ type: 're-pend', employer })}
                              >
                                <RotateCcw size={12} /> Reset
                              </button>
                            </>
                          )}

                          {employer.status === 'rejected' && (
                            <button
                              type="button"
                              className="es-btn-repend"
                              onClick={() => setConfirmAction({ type: 're-pend', employer })}
                            >
                              <RotateCcw size={12} /> Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedId === employer.id && (
                      <tr className="es-details-row">
                        <td colSpan="6">
                          <div className="es-details-panel">
                            <div className="es-details-grid">
                              <div className="es-details-col">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                  <h3 className="es-details-heading" style={{ margin: 0 }}>Company information</h3>
                                  <button
                                    type="button"
                                    className="es-btn-details"
                                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                                    onClick={() => navigate(`/employer-profile/${employer.id}`)}
                                  >
                                    <ExternalLink size={12} /> View Full Profile
                                  </button>
                                </div>
                                <p className="es-details-bio">{employer.bio}</p>
                                <div className="es-details-fields">
                                  <div className="es-field">
                                    <span className="es-field-label">Address</span>
                                    <span className="es-field-value">{employer.address}</span>
                                  </div>
                                  <div className="es-field">
                                    <span className="es-field-label">Phone</span>
                                    <span className="es-field-value">{employer.phone}</span>
                                  </div>
                                  <div className="es-field">
                                    <span className="es-field-label">Website</span>
                                    <a
                                      href={safeUrl(employer.website)}
                                      className="es-field-link"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {employer.website}
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <div className="es-details-col">
                                <h3 className="es-details-heading">Uploaded documents</h3>
                                {employer.taxDocs.length === 0 ? (
                                  <p className="es-no-docs">No documents uploaded.</p>
                                ) : (
                                  <ul className="es-doc-list">
                                    {employer.taxDocs.map(doc => (
                                      <li key={doc.id} className="es-doc-item">
                                        <div className="es-doc-info">
                                          <span className="es-doc-icon"><FileText size={18} /></span>
                                          <div>
                                            <span className="es-doc-name">{doc.name}</span>
                                            <span className="es-doc-size">{doc.size}</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          className="es-btn-download"
                                          onClick={() => downloadDoc(doc)}
                                        >
                                          Download
                                        </button>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmModal
        open={!!confirmAction}
        title={
          confirmAction?.type === 'accept' ? 'Accept this employer?' :
          confirmAction?.type === 'reject' ? 'Reject this employer?' :
          confirmAction?.type === 're-pend' ? 'Reset to pending?' :
          confirmAction?.type === 'flag' ? (confirmAction?.employer?.flagged ? 'Unflag this employer?' : 'Flag this employer?') :
          'Confirm action'
        }
        message={
          confirmAction?.type === 'accept'
            ? `${confirmAction?.employer?.companyName} will gain full employer access immediately.`
          : confirmAction?.type === 'reject'
            ? `${confirmAction?.employer?.companyName} will be denied access. You can reopen this later.`
          : confirmAction?.type === 're-pend'
            ? `${confirmAction?.employer?.companyName} will return to the pending queue for re-review.`
          : confirmAction?.type === 'flag'
            ? (confirmAction?.employer?.flagged
                ? `Remove the review flag from ${confirmAction?.employer?.companyName}.`
                : `Mark ${confirmAction?.employer?.companyName} for re-review. They retain access for now.`)
          : ''
        }
        confirmLabel={
          confirmAction?.type === 'accept' ? 'Accept' :
          confirmAction?.type === 'reject' ? 'Reject' :
          confirmAction?.type === 're-pend' ? 'Reset' :
          confirmAction?.type === 'flag' ? (confirmAction?.employer?.flagged ? 'Unflag' : 'Flag') :
          'Confirm'
        }
        variant={
          confirmAction?.type === 'accept' ? 'success' :
          confirmAction?.type === 'reject' ? 'danger' :
          confirmAction?.type === 'flag' && !confirmAction?.employer?.flagged ? 'warning' :
          'primary'
        }
        onClose={() => setConfirmAction(null)}
        onConfirm={performAction}
      />
    </div>
  );
}
