import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../data/useAppData';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { useToast } from '../../components/Toast/Toast';
import { studentInternshipView } from '../../utils/internships';
import { parseLooseDate, todayISO, formatDate } from '../../utils/time';
import './Internships.css';

const sortOptions = [
  { value: 'latest', label: 'Newest' },
  { value: 'company', label: 'Company' },
  { value: 'status', label: 'Status' },
  { value: 'deadline', label: 'Deadline' },
];

export default function Internships({ user, onNavigate }) {
  const { internships: rawInternships, addApplicantToInternship, updateInternship } = useAppData();
  // Students never see archived listings; status reflects *their* application.
  const internshipSource = useMemo(
    () => rawInternships.filter(i => !i.archived).map(i => studentInternshipView(i, user)),
    [rawInternships, user]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [internshipData, setInternshipData] = useState(internshipSource);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [pendingApply, setPendingApply] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Sync local state with hook data whenever internshipSource changes
  useEffect(() => {
    setInternshipData(internshipSource);
  }, [internshipSource]);

  const goBack = () => {
    if (onNavigate) {
      onNavigate('student-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const filteredInternships = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return internshipData
      .filter((intern) => {
        if (statusFilter !== 'All' && intern.status !== statusFilter) return false;
        if (!query) return true;
        const searchable = [
          intern.company, intern.title, intern.location, intern.type,
          intern.description, ...(intern.skills || []),
        ].join(' ').toLowerCase();
        return searchable.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'company') return a.company.localeCompare(b.company);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'deadline') {
          const da = parseLooseDate(a.deadline);
          const db = parseLooseDate(b.deadline);
          if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;
          if (!Number.isNaN(da)) return -1;
          if (!Number.isNaN(db)) return 1;
          return 0;
        }
        return (parseLooseDate(b.postedDate) || 0) - (parseLooseDate(a.postedDate) || 0);
      });
  }, [internshipData, searchTerm, statusFilter, sortBy]);

  const applyToInternship = (internship) => {
    const appliedDate = todayISO();
    addApplicantToInternship(internship.id, {
      name: user.name,
      email: user.email,
      major: user.major || '',
      status: 'Applied',
      appliedDate,
    });
    if (selectedInternship?.id === internship.id) {
      setSelectedInternship({ ...internship, status: 'Applied', appliedDate, interviewDate: undefined });
    }
    setPendingApply(null);
    toast.success(`Application submitted to ${internship.company}!`);
  };

  const withdrawFromInternship = (internship) => {
    const source = rawInternships.find(i => i.id === internship.id);
    if (source) {
      const email = user.email.toLowerCase();
      updateInternship(internship.id, {
        applicants: (source.applicants || []).filter(a => (a.email || '').toLowerCase() !== email),
      });
    }
    if (selectedInternship?.id === internship.id) {
      setSelectedInternship({ ...internship, status: internship.listingStatus, appliedDate: undefined, interviewDate: undefined });
    }
    setPendingWithdraw(null);
    toast.info('Application withdrawn.');
  };

  const handleSelect = (internship) => {
    setSelectedInternship(internship);
  };

  return (
    <>
      <div className="internships-page">
        <PrimaryNav user={user} onNavigate={onNavigate} />

        <div className="internships-container">
          <div className="internships-header">
            <div>
              <h1>Internship opportunities</h1>
              <p>Search, filter, and apply for internships that match your skills and career goals.</p>
            </div>
            <button type="button" className="internships-back internships-button" onClick={goBack}>
              Back to dashboard
            </button>
          </div>

          <div className="internships-controls">
            <div className="internships-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, title, skills, or location"
              />
            </div>

            <div className="internships-filters">
              <label>
                Status
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Currently Hiring">Currently Hiring</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                </select>
              </label>

              <label>
                Sort by
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="internships-layout">
            <div className="internships-grid">
              {filteredInternships.length === 0 ? (
                <div className="internship-empty">No internships match your search and filters.</div>
              ) : (
                filteredInternships.map((intern) => (
                  <button
                    key={intern.id}
                    type="button"
                    className={`internship-card ${selectedInternship?.id === intern.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(intern)}
                  >
                    <div className="internship-top">
                      <div>
                        <div className="internship-company">{intern.company}</div>
                        <div className="internship-title">{intern.title}</div>
                      </div>
                      <span className={`internship-status internship-status-${intern.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {intern.status}
                      </span>
                    </div>

                    <div className="internship-detail-row">
                      <span>{intern.type}</span>
                      <span>{intern.location}</span>
                    </div>

                    <div className="internship-skills">
                      {intern.skills.map((skill) => (
                        <span key={skill} className="internship-skill">{skill}</span>
                      ))}
                      <span className="internship-skill internship-duration">{intern.duration}</span>
                    </div>

                    <div className="internship-meta">
                      {intern.deadline && <span className="internship-meta-item">Deadline: {formatDate(intern.deadline)}</span>}
                      {intern.appliedDate && <span className="internship-meta-item">Applied: {formatDate(intern.appliedDate)}</span>}
                      {intern.interviewDate && <span className="internship-meta-item">Interview: {formatDate(intern.interviewDate)}</span>}
                    </div>
                  </button>
                ))
              )}
            </div>

            <aside className="internship-panel">
              <div className="internship-panel-card">
                {selectedInternship ? (
                  <>
                    <div className="internship-panel-top">
                      <div>
                        <p className="internship-panel-type">{selectedInternship.type}</p>
                        <h2>{selectedInternship.title}</h2>
                        <p className="internship-panel-company">{selectedInternship.company} · {selectedInternship.location}</p>
                      </div>
                      <span className={`internship-status internship-status-${selectedInternship.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedInternship.status}
                      </span>
                    </div>

                    <div className="internship-panel-meta">
                      {selectedInternship.postedDate && <span>Posted: {selectedInternship.postedDate}</span>}
                      {selectedInternship.duration && <span>Duration: {selectedInternship.duration}</span>}
                      {selectedInternship.deadline && <span>Deadline: {formatDate(selectedInternship.deadline)}</span>}
                    </div>

                    <p className="internship-panel-description">{selectedInternship.description}</p>

                    <div className="internship-panel-skills">
                      {selectedInternship.skills.map((skill) => (
                        <span key={skill} className="internship-skill">{skill}</span>
                      ))}
                    </div>

                    {selectedInternship.status === 'Currently Hiring' && (
                      <button
                        type="button"
                        className="internship-action internship-panel-action internships-button"
                        onClick={() => setPendingApply(selectedInternship)}
                      >
                        Apply for internship
                      </button>
                    )}
                    {selectedInternship.status === 'Applied' && (
                      <button
                        type="button"
                        className="internship-action internship-panel-action internships-button internships-button-withdraw"
                        onClick={() => setPendingWithdraw(selectedInternship)}
                      >
                        Withdraw application
                      </button>
                    )}
                    {selectedInternship.status !== 'Currently Hiring' && selectedInternship.status !== 'Applied' && (
                      <button
                        type="button"
                        className="internship-action internship-panel-action internships-button"
                        disabled
                      >
                        View application status
                      </button>
                    )}
                  </>
                ) : (
                  <div className="internship-empty-panel">
                    <h2>Select an internship</h2>
                    <p>Click any card on the left to view full details and apply.</p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {pendingApply && (
        <ConfirmModal
          open
          variant="success"
          title="Apply for this internship?"
          message={`You are about to apply to ${pendingApply.title} at ${pendingApply.company}. This will submit your application immediately.`}
          confirmLabel="Yes, apply"
          onConfirm={() => applyToInternship(pendingApply)}
          onClose={() => setPendingApply(null)}
        />
      )}

      {pendingWithdraw && (
        <ConfirmModal
          open
          title="Withdraw your application?"
          message={`This will remove your application for ${pendingWithdraw.title} at ${pendingWithdraw.company}. You can re-apply later.`}
          confirmLabel="Yes, withdraw"
          onConfirm={() => withdrawFromInternship(pendingWithdraw)}
          onClose={() => setPendingWithdraw(null)}
        />
      )}
    </>
  );
}