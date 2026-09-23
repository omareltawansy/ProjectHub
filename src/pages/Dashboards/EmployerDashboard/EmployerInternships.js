import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../data/useAppData';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal.js';
import { useToast } from '../../../components/Toast/Toast';
import './EmployerInternships.css';

const internshipSortOptions = [
  { value: 'latest', label: 'Newest' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

const applicantSortOptions = [
  { value: 'matchScore', label: 'Best match' },
  { value: 'topContributors', label: 'Top contributors' },
  { value: 'status', label: 'Status' },
  { value: 'name', label: 'Name' },
];

const initialFormValues = {
  company: '',
  title: '',
  type: '',
  location: '',
  duration: '',
  deadline: '',
  skills: '',
  description: '',
};

export default function EmployerInternships({ user, onNavigate }) {
  const { internships: internshipSource } = useAppData();
  const navigate = useNavigate();
  const employerInternships = internshipSource.filter((item) => item.employerId === user.id);

  const [internshipData, setInternshipData] = useState(employerInternships);
  const [selectedInternship, setSelectedInternship] = useState(employerInternships[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [sortBy, setSortBy] = useState('latest');
  const [applicantSort, setApplicantSort] = useState('matchScore');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('new');
  const [formValues, setFormValues] = useState(initialFormValues);
  const [pendingArchive, setPendingArchive] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingApplicant, setPendingApplicant] = useState(null);
  const [pendingFormSave, setPendingFormSave] = useState(null);
  const toast = useToast();

  useEffect(() => {
    setInternshipData(employerInternships);
    setSelectedInternship(employerInternships[0] || null);
  // Intentionally only on user change: resyncing on every data change would reset the selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const goBack = () => {
    if (onNavigate) {
      onNavigate('employer-dashboard');
    } else {
      navigate('/employer-dashboard');
    }
  };

  const filteredInternships = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return internshipData
      .filter((item) => {
        if (statusFilter === 'Active') {
          return !item.archived;
        }
        if (statusFilter === 'Archived') {
          return item.archived;
        }
        return true;
      })
      .filter((item) => {
        if (!query) {
          return true;
        }
        return [item.company, item.title, item.type, item.location]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return new Date(b.postedDate) - new Date(a.postedDate);
      });
  }, [internshipData, searchTerm, statusFilter, sortBy]);

  const sortedApplicants = useMemo(() => {
    if (!selectedInternship) {
      return [];
    }
    const applicants = [...(selectedInternship.applicants || [])];
    if (applicantSort === 'name') {
      return applicants.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (applicantSort === 'status') {
      return applicants.sort((a, b) => a.status.localeCompare(b.status));
    }
    if (applicantSort === 'topContributors') {
      // Hired/active contributors first, then by skills matched descending
      const statusOrder = { Hired: 0, Interview: 1, Applied: 2, Rejected: 3 };
      return applicants.sort((a, b) => {
        const sPriority = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
        if (sPriority !== 0) return sPriority;
        return (b.skillsMatched ?? 0) - (a.skillsMatched ?? 0);
      });
    }
    return applicants.sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedInternship, applicantSort]);

  const topApplicants = useMemo(() => sortedApplicants.slice(0, 2), [sortedApplicants]);

  const handleSelectInternship = (internship) => {
    setSelectedInternship(internship);
    if (isFormOpen) {
      setIsFormOpen(false);
    }
  };

  const updateInternship = (updatedInternship) => {
    const updatedList = internshipData.map((item) =>
      item.id === updatedInternship.id ? updatedInternship : item
    );
    setInternshipData(updatedList);
    if (selectedInternship?.id === updatedInternship.id) {
      setSelectedInternship(updatedInternship);
    }
  };

  const confirmArchive = () => {
    const internship = pendingArchive;
    const updated = {
      ...internship,
      archived: !internship.archived,
      status: internship.archived ? 'Currently Hiring' : 'Archived',
    };
    updateInternship(updated);
    setPendingArchive(null);
    toast.success(internship.archived ? `"${internship.title}" restored.` : `"${internship.title}" archived.`);
  };

  const confirmStatusChange = () => {
    const { internship, status } = pendingStatus;
    const updated = { ...internship, status, archived: status === 'Archived' };
    updateInternship(updated);
    setPendingStatus(null);
    toast.success(`Status updated to ${status}.`);
  };

  const confirmApplicantChange = () => {
    const { applicantId, name, status } = pendingApplicant;
    const updatedApplicants = selectedInternship.applicants.map((a) =>
      a.id === applicantId ? { ...a, status } : a
    );
    updateInternship({ ...selectedInternship, applicants: updatedApplicants });
    setPendingApplicant(null);
    toast.success(`${name} moved to ${status}.`);
  };

  const openNewInternshipForm = () => {
    setFormMode('new');
    setFormValues({ ...initialFormValues, company: user.name });
    setIsFormOpen(true);
  };

  const openEditInternshipForm = () => {
    if (!selectedInternship) {
      return;
    }
    setFormMode('edit');
    setFormValues({
      company: selectedInternship.company,
      title: selectedInternship.title,
      type: selectedInternship.type,
      location: selectedInternship.location,
      duration: selectedInternship.duration,
      deadline: selectedInternship.deadline || '',
      skills: selectedInternship.skills.join(', '),
      description: selectedInternship.description,
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const handleSaveInternship = (e) => {
    e.preventDefault();
    const skills = formValues.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!formValues.title || !formValues.company || !formValues.type) {
      return;
    }

    setPendingFormSave({ skills, mode: formMode });
  };

  const commitSaveInternship = () => {
    const { skills, mode } = pendingFormSave;

    if (mode === 'new') {
      const nextId = internshipData.length > 0 ? Math.max(...internshipData.map((item) => item.id)) + 1 : 1;
      const newInternship = {
        id: nextId,
        employerId: user.id,
        company: formValues.company,
        title: formValues.title,
        type: formValues.type,
        location: formValues.location,
        duration: formValues.duration,
        deadline: formValues.deadline,
        skills,
        description: formValues.description,
        postedDate: new Date().toISOString().split('T')[0],
        status: 'Currently Hiring',
        applicants: [],
        archived: false,
      };
      const updatedList = [newInternship, ...internshipData];
      setInternshipData(updatedList);
      setSelectedInternship(newInternship);
      toast.success(`"${newInternship.title}" posted successfully!`);
    } else if (selectedInternship) {
      const updated = {
        ...selectedInternship,
        company: formValues.company,
        title: formValues.title,
        type: formValues.type,
        location: formValues.location,
        duration: formValues.duration,
        deadline: formValues.deadline,
        skills,
        description: formValues.description,
      };
      updateInternship(updated);
      toast.success(`"${updated.title}" updated successfully!`);
    }

    setPendingFormSave(null);
    setIsFormOpen(false);
  };

  return (
    <>
    <div className="employer-internships-page">
      <PrimaryNav user={user} onNavigate={onNavigate} />

      <div className="employer-internships-container">
        <div className="employer-internships-header">
          <div>
            <h1>Manage internships</h1>
            <p>View your postings, track applicants, and update internship status.</p>
          </div>
          <div className="employer-internships-actions">
            <button className="primary-button" type="button" onClick={goBack}>
              Back to dashboard
            </button>
            <button className="primary-button secondary" type="button" onClick={openNewInternshipForm}>
              New internship
            </button>
          </div>
        </div>

        <div className="employer-internships-controls">
          <div className="employer-internships-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search internships by title, company, or location"
            />
          </div>
          <div className="employer-internships-filter-row">
            <label>
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
                <option value="All">All</option>
              </select>
            </label>
            <label>
              Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {internshipSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="employer-internships-layout">
          <div className="employer-internships-list">
            {filteredInternships.length === 0 ? (
              <div className="employer-empty">No internships match your filters.</div>
            ) : (
              filteredInternships.map((internship) => (
                <button
                  key={internship.id}
                  type="button"
                  className={`employer-internship-card ${selectedInternship?.id === internship.id ? 'selected' : ''}`}
                  onClick={() => handleSelectInternship(internship)}
                >
                  <div className="employer-internship-card-top">
                    <div>
                      <div className="employer-internship-company">{internship.company}</div>
                      <div className="employer-internship-title">{internship.title}</div>
                    </div>
                    <span className={`employer-internship-status employer-internship-status-${internship.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {internship.status}
                    </span>
                  </div>
                  <div className="employer-internship-meta-row">
                    <span>{internship.type}</span>
                    <span>{internship.location}</span>
                    <span>{internship.duration}</span>
                  </div>
                  <div className="employer-internship-meta-row">
                    {internship.deadline && <span>Deadline: {internship.deadline}</span>}
                    <span>Applicants: {internship.applicants.length}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          <aside className="employer-internship-panel">
            <div className="employer-internship-panel-card">
              {selectedInternship ? (
                <>
                  <div className="employer-panel-top-row">
                    <div>
                      <p className="employer-internship-type">{selectedInternship.type}</p>
                      <h2>{selectedInternship.title}</h2>
                      <p className="employer-internship-company">{selectedInternship.company} · {selectedInternship.location}</p>
                    </div>
                    <div className="employer-panel-actions">
                      <button className="secondary-button" type="button" onClick={openEditInternshipForm}>
                        Edit
                      </button>
                      <button
                        className="secondary-button danger"
                        type="button"
                        onClick={() => setPendingArchive(selectedInternship)}
                      >
                        {selectedInternship.archived ? 'Restore' : 'Archive'}
                      </button>
                    </div>
                  </div>

                  <div className="employer-internship-status-row">
                    <div>
                      <strong>Status:</strong> {selectedInternship.status}
                    </div>
                    <label>
                      Update status
                      <select
                        value={selectedInternship.status}
                        onChange={(e) => setPendingStatus({ internship: selectedInternship, status: e.target.value })}
                      >
                        <option value="Currently Hiring">Currently Hiring</option>
                        <option value="Position Filled">Position Filled</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </label>
                  </div>

                  <div className="employer-internship-panel-meta">
                    <span>Posted: {selectedInternship.postedDate}</span>
                    <span>Duration: {selectedInternship.duration}</span>
                    {selectedInternship.deadline && <span>Deadline: {selectedInternship.deadline}</span>}
                  </div>

                  <p className="employer-internship-description">{selectedInternship.description}</p>

                  <div className="employer-suggested-section">
                    <div className="employer-section-title">Top suggested applicants</div>
                    {topApplicants.length === 0 ? (
                      <div className="employer-empty">No applicants yet.</div>
                    ) : (
                      topApplicants.map((applicant) => (
                        <div key={applicant.id} className="employer-suggested-card">
                          <div>
                            <div className="employer-applicant-name">{applicant.name}</div>
                            <div className="employer-applicant-detail">{applicant.major}</div>
                          </div>
                          <div className="employer-match-score">{applicant.matchScore}%</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="employer-applicant-section">
                    <div className="employer-applicant-header">
                      <div className="employer-section-title">Applicants</div>
                      <label>
                        Sort by
                        <select value={applicantSort} onChange={(e) => setApplicantSort(e.target.value)}>
                          {applicantSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {sortedApplicants.length === 0 ? (
                      <div className="employer-empty">No applicants yet.</div>
                    ) : (
                      sortedApplicants.map((applicant) => (
                        <div key={applicant.id} className="employer-applicant-card">
                          <div>
                            <div className="employer-applicant-name">{applicant.name}</div>
                            <div className="employer-applicant-detail">{applicant.major} · {applicant.email}</div>
                            <div className="employer-applicant-detail">Skills matched: {applicant.skillsMatched}</div>
                          </div>
                          <div className="employer-applicant-actions">
                            <span className={`applicant-status applicant-status-${applicant.status.toLowerCase()}`}>
                              {applicant.status}
                            </span>
                            <select
                              value={applicant.status}
                              onChange={(e) => setPendingApplicant({ applicantId: applicant.id, name: applicant.name, status: e.target.value })}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interview">Interview</option>
                              <option value="Hired">Hired</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="employer-empty-panel">
                  <h2>Select an internship</h2>
                  <p>Choose a posting to review applicants and manage status.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {isFormOpen && (
          <div className="employer-internship-form-modal">
            <div className="employer-internship-form-card">
              <div className="employer-form-header">
                <h2>{formMode === 'new' ? 'Create internship' : 'Edit internship'}</h2>
                <button type="button" onClick={() => setIsFormOpen(false)}>
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveInternship} className="employer-internship-form">
                <label>
                  Company
                  <input
                    value={formValues.company}
                    onChange={(e) => handleFormChange('company', e.target.value)}
                  />
                </label>
                <label>
                  Role title
                  <input
                    value={formValues.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                  />
                </label>
                <label>
                  Type
                  <input
                    value={formValues.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                  />
                </label>
                <label>
                  Location
                  <input
                    value={formValues.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                  />
                </label>
                <label>
                  Duration
                  <input
                    value={formValues.duration}
                    onChange={(e) => handleFormChange('duration', e.target.value)}
                  />
                </label>
                <label>
                  Deadline
                  <input
                    value={formValues.deadline}
                    onChange={(e) => handleFormChange('deadline', e.target.value)}
                  />
                </label>
                <label>
                  Skills
                  <input
                    value={formValues.skills}
                    onChange={(e) => handleFormChange('skills', e.target.value)}
                    placeholder="Comma-separated list"
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={formValues.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={4}
                  />
                </label>
                <div className="employer-form-footer">
                  <button className="primary-button" type="submit">
                    Save
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>

      <ConfirmModal
        open={!!pendingArchive}
        title={pendingArchive?.archived ? 'Restore this internship?' : 'Archive this internship?'}
        message={pendingArchive?.archived
          ? `"${pendingArchive?.title}" will become active and visible to applicants again.`
          : `"${pendingArchive?.title}" will be hidden from applicants. You can restore it later.`}
        confirmLabel={pendingArchive?.archived ? 'Yes, restore' : 'Yes, archive'}
        variant={pendingArchive?.archived ? 'primary' : 'danger'}
        onConfirm={confirmArchive}
        onClose={() => setPendingArchive(null)}
      />

      <ConfirmModal
        open={!!pendingStatus}
        title={`Change status to "${pendingStatus?.status}"?`}
        message={`This will update "${pendingStatus?.internship.title}" status from ${pendingStatus?.internship.status} to ${pendingStatus?.status}.`}
        confirmLabel="Yes, update"
        variant="primary"
        onConfirm={confirmStatusChange}
        onClose={() => setPendingStatus(null)}
      />

      <ConfirmModal
        open={!!pendingApplicant}
        title={`Move ${pendingApplicant?.name} to "${pendingApplicant?.status}"?`}
        message="This will update their application status for this internship."
        confirmLabel="Yes, update"
        variant="primary"
        onConfirm={confirmApplicantChange}
        onClose={() => setPendingApplicant(null)}
      />

      <ConfirmModal
        open={!!pendingFormSave}
        title={pendingFormSave?.mode === 'new' ? 'Post this internship?' : 'Save changes?'}
        message={pendingFormSave?.mode === 'new'
          ? `"${formValues.title}" at ${formValues.company} will be posted and visible to applicants.`
          : `Your changes to "${formValues.title}" will be saved immediately.`}
        confirmLabel={pendingFormSave?.mode === 'new' ? 'Yes, post it' : 'Yes, save'}
        variant="primary"
        onConfirm={commitSaveInternship}
        onClose={() => setPendingFormSave(null)}
      />
    </>
  );
}
