import React, { useMemo, useState } from 'react';
import { Search, Plus, X, ChevronDown, ChevronUp, GitBranchPlus } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal.js';
import './CoursesSection.css';

const EMPTY_FORM = { name: '', code: '' };
const REQUEST_TABS = ['Pending', 'Resolved', 'All'];

export default function CoursesSection() {
  const { courses: initialCourses, ciLinkRequests: initialRequests, users, updateCourses, updateCILinkRequests } = useAppData();
  const [courses, setCourses] = useState(initialCourses);
  const [requests, setRequests] = useState(initialRequests);

  const [search, setSearch] = useState('');
  const [requestTab, setRequestTab] = useState('Pending');

  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [addInstructorCourseId, setAddInstructorCourseId] = useState(null);

  const toast = useToast();

  const allInstructors = useMemo(
    () => users.filter(u => u.role === 'instructor').map(u => ({ id: u.id, name: u.name })),
    []
  );

  const visibleCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      c.instructors.some(i => (i.name || '').toLowerCase().includes(q))
    );
  }, [courses, search]);

  const visibleRequests = useMemo(() => {
    if (requestTab === 'All') return requests;
    if (requestTab === 'Pending') return requests.filter(r => r.status === 'pending');
    return requests.filter(r => r.status !== 'pending');
  }, [requests, requestTab]);

  const requestTabCount = (tab) => {
    if (tab === 'All') return requests.length;
    if (tab === 'Pending') return requests.filter(r => r.status === 'pending').length;
    return requests.filter(r => r.status !== 'pending').length;
  };

  /* ── Create ── */
  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Both course name and code are required.');
      return;
    }
    const codeExists = courses.some(c => c.code.toLowerCase() === form.code.trim().toLowerCase());
    if (codeExists) {
      setFormError(`Course code "${form.code.trim()}" is already in use.`);
      return;
    }
    const newCourse = {
      id: Date.now(),
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      instructors: [],
    };
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    updateCourses(updatedCourses);
    setForm(EMPTY_FORM);
    toast.success(`Course "${newCourse.code}" added.`);
  };

  /* ── Edit ── */
  const startEdit = (course) => {
    setEditingId(course.id);
    setEditForm({ name: course.name, code: course.code });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError('');
  };

  const saveEdit = (id) => {
    setEditError('');
    if (!editForm.name.trim() || !editForm.code.trim()) {
      setEditError('Both fields are required.');
      return;
    }
    const codeExists = courses.some(
      c => c.code.toLowerCase() === editForm.code.trim().toLowerCase() && c.id !== id
    );
    if (codeExists) {
      setEditError(`Course code "${editForm.code.trim()}" is already in use.`);
      return;
    }
    const updatedCourses = courses.map(c =>
      c.id === id
        ? { ...c, name: editForm.name.trim(), code: editForm.code.trim().toUpperCase() }
        : c
    );
    setCourses(updatedCourses);
    updateCourses(updatedCourses);
    toast.success('Course updated.');
    cancelEdit();
  };

  /* ── Delete ── */
  const performDelete = () => {
    if (confirmDeleteId == null) return;
    const target = courses.find(c => c.id === confirmDeleteId);
    const updatedCourses = courses.filter(c => c.id !== confirmDeleteId);
    setCourses(updatedCourses);
    updateCourses(updatedCourses);
    if (editingId === confirmDeleteId) cancelEdit();
    if (expandedId === confirmDeleteId) setExpandedId(null);
    toast.info(`Course "${target?.code}" deleted.`);
    setConfirmDeleteId(null);
  };

  /* ── Manual instructor management ── */
  const linkedInstructorIds = (course) => course.instructors.map(i => i.id);

  const addInstructor = (courseId, instructorId) => {
    const instructor = allInstructors.find(i => i.id === Number(instructorId));
    if (!instructor) return;
    const updatedCourses = courses.map(c =>
      c.id === courseId && !linkedInstructorIds(c).includes(instructor.id)
        ? { ...c, instructors: [...c.instructors, instructor] }
        : c
    );
    setCourses(updatedCourses);
    updateCourses(updatedCourses);
    toast.success(`Linked ${instructor.name}.`);
    setAddInstructorCourseId(null);
  };

  const removeInstructor = (courseId, instructorId) => {
    const course = courses.find(c => c.id === courseId);
    const instructor = course?.instructors.find(i => i.id === instructorId);
    const updatedCourses = courses.map(c =>
      c.id === courseId
        ? { ...c, instructors: c.instructors.filter(i => i.id !== instructorId) }
        : c
    );
    setCourses(updatedCourses);
    updateCourses(updatedCourses);
    toast.info(`Unlinked ${instructor?.name || 'instructor'}.`);
  };

  /* ── Link Requests ── */
  const updateRequestStatus = (id, newStatus) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    const updatedRequests = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updatedRequests);
    updateCILinkRequests(updatedRequests);

    // If accepted, also reflect link/unlink on the course
    if (newStatus === 'accepted') {
      const updatedCourses = courses.map(c => {
        if (c.id !== req.courseId) return c;
        if (req.type === 'link') {
          if (linkedInstructorIds(c).includes(req.instructorId)) return c;
          return {
            ...c,
            instructors: [...c.instructors, { id: req.instructorId, name: req.instructorName }],
          };
        }
        return { ...c, instructors: c.instructors.filter(i => i.id !== req.instructorId) };
      });
      setCourses(updatedCourses);
      updateCourses(updatedCourses);
    }

    toast.success(`Request ${newStatus}.`);
  };

  const targetForDelete = courses.find(c => c.id === confirmDeleteId);
  const courseBeingExpanded = courses.find(c => c.id === expandedId);

  return (
    <div className="cs-root">

      {/* Add new course */}
      <section className="cs-card">
        <h2 className="cs-card-title">Add new course</h2>
        <form className="cs-form" onSubmit={handleCreate}>
          <div className="cs-form-row">
            <input
              className="cs-input"
              type="text"
              placeholder="Course name"
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
            />
            <input
              className="cs-input cs-input-code"
              type="text"
              placeholder="Course code"
              value={form.code}
              onChange={e => handleFormChange('code', e.target.value)}
            />
            <button className="cs-create-btn" type="submit">
              <Plus size={14} /> Add course
            </button>
          </div>
          {formError && <p className="cs-form-error">{formError}</p>}
        </form>
      </section>

      {/* Courses table */}
      <section className="cs-card">
        <header className="cs-card-head">
          <h2 className="cs-card-title">Courses ({courses.length})</h2>
          <div className="cs-search">
            <Search size={16} className="cs-search-icon" />
            <input
              type="text"
              placeholder="Search courses or instructors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {editError && <p className="cs-form-error cs-edit-error">{editError}</p>}

        <div className="cs-table-wrapper">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Course name</th>
                <th>Course code</th>
                <th>Linked instructors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="cs-empty">
                    {search ? 'No courses match your search.' : 'No courses yet.'}
                  </td>
                </tr>
              ) : (
                visibleCourses.map(course => {
                  const isOpen = expandedId === course.id;
                  return (
                    <React.Fragment key={course.id}>
                      <tr className={isOpen ? 'cs-row-expanded' : ''}>
                        {editingId === course.id ? (
                          <>
                            <td>
                              <input
                                className="cs-inline-input"
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                              />
                            </td>
                            <td>
                              <input
                                className="cs-inline-input cs-inline-input-code"
                                type="text"
                                value={editForm.code}
                                onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))}
                              />
                            </td>
                            <td className="cs-instructors">
                              {course.instructors.length > 0
                                ? course.instructors.map(i => i.name).join(', ')
                                : <span className="cs-none">None</span>}
                            </td>
                            <td>
                              <div className="cs-action-btns">
                                <button className="cs-btn-save" onClick={() => saveEdit(course.id)}>Save</button>
                                <button className="cs-btn-cancel" onClick={cancelEdit}>Cancel</button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="cs-course-name">{course.name}</td>
                            <td><span className="cs-code-badge">{course.code}</span></td>
                            <td className="cs-instructors">
                              {course.instructors.length > 0
                                ? course.instructors.map(i => i.name).join(', ')
                                : <span className="cs-none">None</span>}
                            </td>
                            <td>
                              <div className="cs-action-btns">
                                <button
                                  className={`cs-btn-detail${isOpen ? ' active' : ''}`}
                                  onClick={() => setExpandedId(isOpen ? null : course.id)}
                                >
                                  {isOpen ? <>Hide <ChevronUp size={12} /></> : <>Manage <ChevronDown size={12} /></>}
                                </button>
                                <button
                                  className="cs-btn-edit"
                                  onClick={() => startEdit(course)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="cs-btn-delete"
                                  onClick={() => setConfirmDeleteId(course.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>

                      {isOpen && courseBeingExpanded && (
                        <tr className="cs-detail-row">
                          <td colSpan="4">
                            <div className="cs-detail-panel">
                              <div className="cs-detail-grid">
                                <div className="cs-detail-col">
                                  <h3 className="cs-detail-heading">Course detail</h3>
                                  <div className="cs-detail-fields">
                                    <div className="cs-field">
                                      <span className="cs-field-label">Code</span>
                                      <span className="cs-code-badge">{course.code}</span>
                                    </div>
                                    <div className="cs-field">
                                      <span className="cs-field-label">Name</span>
                                      <span className="cs-field-value">{course.name}</span>
                                    </div>
                                    <div className="cs-field">
                                      <span className="cs-field-label">Linked instructors</span>
                                      <span className="cs-field-value">{course.instructors.length}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="cs-detail-col">
                                  <h3 className="cs-detail-heading">Manage instructors</h3>
                                  {course.instructors.length === 0 ? (
                                    <p className="cs-no-docs">No instructors linked yet.</p>
                                  ) : (
                                    <ul className="cs-instructor-list">
                                      {course.instructors.map(i => (
                                        <li key={i.id} className="cs-instructor-item">
                                          <span>{i.name}</span>
                                          <button
                                            type="button"
                                            className="cs-instructor-remove"
                                            onClick={() => removeInstructor(course.id, i.id)}
                                            aria-label={`Unlink ${i.name}`}
                                          >
                                            <X size={12} /> Unlink
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {addInstructorCourseId === course.id ? (
                                    <div className="cs-add-instructor-row">
                                      <select
                                        className="cs-inline-input"
                                        defaultValue=""
                                        onChange={(e) => {
                                          if (e.target.value) addInstructor(course.id, e.target.value);
                                        }}
                                      >
                                        <option value="" disabled>Select instructor…</option>
                                        {allInstructors
                                          .filter(i => !linkedInstructorIds(course).includes(i.id))
                                          .map(i => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                          ))}
                                      </select>
                                      <button
                                        type="button"
                                        className="cs-btn-cancel"
                                        onClick={() => setAddInstructorCourseId(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="cs-btn-link"
                                      onClick={() => setAddInstructorCourseId(course.id)}
                                      disabled={
                                        allInstructors.filter(i => !linkedInstructorIds(course).includes(i.id)).length === 0
                                      }
                                    >
                                      <GitBranchPlus size={14} /> Link instructor
                                    </button>
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

      {/* CI Link Requests */}
      <section className="cs-card">
        <header className="cs-card-head">
          <h2 className="cs-card-title">
            CI link requests
            {requestTabCount('Pending') > 0 && (
              <span className="cs-pending-badge">{requestTabCount('Pending')} pending</span>
            )}
          </h2>
          <div className="cs-tabs">
            {REQUEST_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`cs-tab${requestTab === tab ? ' active' : ''}`}
                onClick={() => setRequestTab(tab)}
              >
                {tab}
                <span className={`cs-tab-count${requestTab === tab ? ' active' : ''}`}>
                  {requestTabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="cs-table-wrapper">
          <table className="cs-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Course</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="cs-empty">No requests in this view.</td>
                </tr>
              ) : (
                visibleRequests.map(req => (
                  <tr key={req.id}>
                    <td>{req.instructorName}</td>
                    <td>{req.courseName}</td>
                    <td>
                      <span className={`cs-type-badge cs-type-${req.type}`}>
                        {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                      </span>
                    </td>
                    <td className="cs-date">{req.date}</td>
                    <td>
                      <span className={`cs-status-badge cs-status-${req.status}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {req.status === 'pending' ? (
                        <div className="cs-action-btns">
                          <button
                            className="cs-btn-accept"
                            onClick={() => updateRequestStatus(req.id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="cs-btn-reject"
                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="cs-resolved">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmModal
        open={confirmDeleteId != null}
        title="Delete this course?"
        message={`"${targetForDelete?.code} – ${targetForDelete?.name}" will be removed from the catalogue. This cannot be undone.`}
        confirmLabel="Delete course"
        variant="danger"
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={performDelete}
      />
    </div>
  );
}
