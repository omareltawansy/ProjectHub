import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit3, Eye, X, UserPlus } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import ConfirmModal from '../../../../components/ConfirmModal/ConfirmModal.js';
import Dialog from '../../../../components/Dialog/Dialog';
import './UsersSection.css';

const TABS = ['All', 'Students', 'Instructors', 'Employers', 'Admins'];
const TAB_ROLE_MAP = {
  All: null,
  Students: 'student',
  Instructors: 'instructor',
  Employers: 'employer',
  Admins: 'admin',
};

const ROLE_OPTIONS = [
  { value: 'student',    label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'employer',   label: 'Employer' },
  { value: 'admin',      label: 'Admin' },
];

const EMPTY_FORM = { name: '', email: '', password: '' };

export default function UsersSection() {
  const { users: initialUsers, updateUsers } = useAppData();
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const toast = useToast();

  const visibleUsers = useMemo(() => {
    const role = TAB_ROLE_MAP[activeTab];
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (role && u.role !== role) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, activeTab, search]);

  const tabCount = (tab) => {
    const role = TAB_ROLE_MAP[tab];
    return role ? users.filter(u => u.role === role).length : users.length;
  };

  const toggleActive = (user) => {
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, active: !u.active } : u);
    setUsers(updatedUsers);
    updateUsers(updatedUsers);
    toast.success(`${user.name} ${user.active ? 'deactivated' : 'activated'}.`);
    setConfirmTarget(null);
  };

  const handleCreateAdmin = (form, setFormError) => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setFormError('Email must contain @.');
      return;
    }
    const newAdmin = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: 'admin',
      active: true,
    };
    const updatedUsers = [...users, newAdmin];
    setUsers(updatedUsers);
    updateUsers(updatedUsers);
    toast.success(`Admin "${newAdmin.name}" created.`);
    setCreateOpen(false);
  };

  const handleSaveEdit = (form, setEditError) => {
    if (!form.name.trim() || !form.email.trim()) {
      setEditError('Name and email are required.');
      return;
    }
    if (!form.email.includes('@')) {
      setEditError('Email must contain @.');
      return;
    }
    const updatedUsers = users.map(u =>
      u.id === editingUser.id
        ? { ...u, name: form.name.trim(), email: form.email.trim(), role: form.role }
        : u
    );
    setUsers(updatedUsers);
    updateUsers(updatedUsers);
    toast.success(`Updated "${form.name.trim()}".`);
    setEditingUser(null);
  };

  return (
    <div className="us-root">
      <section className="us-card">
        <header className="us-card-head">
          <div>
            <h2 className="us-card-title">Manage users</h2>
            <p className="us-card-sub">
              Search, activate, deactivate, edit details, or create admin accounts.
            </p>
          </div>
          <button
            type="button"
            className="us-create-btn"
            onClick={() => setCreateOpen(true)}
          >
            <UserPlus size={14} /> Create admin
          </button>
        </header>

        <div className="us-toolbar">
          <div className="us-search">
            <Search size={16} className="us-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </div>
          <div className="us-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`us-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span className={`us-tab-count${activeTab === tab ? ' active' : ''}`}>
                  {tabCount(tab)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="us-table-wrapper">
          <table className="us-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="us-empty">
                    {search ? 'No users match your search.' : 'No users in this category.'}
                  </td>
                </tr>
              ) : (
                visibleUsers.map(u => (
                  <tr key={u.id}>
                    <td className="us-name">{u.name}</td>
                    <td className="us-email">{u.email}</td>
                    <td><span className={`us-role-badge us-role-${u.role}`}>{u.role}</span></td>
                    <td>
                      <span className={`us-status-badge ${u.active ? 'us-active' : 'us-inactive'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="us-action-btns">
                        <button
                          type="button"
                          className="us-btn-icon"
                          aria-label={`View ${u.name}`}
                          title="View"
                          onClick={() => setViewingUser(u)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="us-btn-icon"
                          aria-label={`Edit ${u.name}`}
                          title="Edit"
                          onClick={() => setEditingUser(u)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          className={`us-toggle-btn ${u.active ? 'us-btn-deactivate' : 'us-btn-activate'}`}
                          onClick={() => setConfirmTarget(u)}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {createOpen && (
        <CreateAdminModal
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreateAdmin}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleSaveEdit}
        />
      )}

      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => { setEditingUser(viewingUser); setViewingUser(null); }}
        />
      )}

      <ConfirmModal
        open={!!confirmTarget}
        title={confirmTarget?.active ? 'Deactivate this account?' : 'Reactivate this account?'}
        message={
          confirmTarget?.active
            ? `${confirmTarget?.name} will lose access to the platform until reactivated.`
            : `${confirmTarget?.name} will regain access to the platform.`
        }
        confirmLabel={confirmTarget?.active ? 'Deactivate' : 'Reactivate'}
        variant={confirmTarget?.active ? 'danger' : 'success'}
        onClose={() => setConfirmTarget(null)}
        onConfirm={() => confirmTarget && toggleActive(confirmTarget)}
      />
    </div>
  );
}

/* ───── Modals ───── */

function CreateAdminModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form, setFormError);
  };

  return (
    <div className="us-modal-backdrop" onClick={onClose}>
      <Dialog className="us-modal" onClose={onClose}>
        <header className="us-modal-header">
          <h3>Create admin</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="us-modal-close">
            <X size={16} />
          </button>
        </header>
        <form onSubmit={submit} className="us-modal-form">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label>
            Temporary password
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </label>
          {formError && <p className="us-form-error">{formError}</p>}
          <div className="us-modal-actions">
            <button type="button" className="us-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="us-btn-submit">
              <Plus size={14} /> Create admin
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function EditUserModal({ user, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'student',
  });
  const [editError, setEditError] = useState('');

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setEditError('');
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form, setEditError);
  };

  return (
    <div className="us-modal-backdrop" onClick={onClose}>
      <Dialog className="us-modal" onClose={onClose}>
        <header className="us-modal-header">
          <h3>Edit user</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="us-modal-close">
            <X size={16} />
          </button>
        </header>
        <form onSubmit={submit} className="us-modal-form">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoFocus
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          {editError && <p className="us-form-error">{editError}</p>}
          <div className="us-modal-actions">
            <button type="button" className="us-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="us-btn-submit">Save changes</button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function ViewUserModal({ user, onClose, onEdit }) {
  return (
    <div className="us-modal-backdrop" onClick={onClose}>
      <Dialog className="us-modal" onClose={onClose}>
        <header className="us-modal-header">
          <h3>User details</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="us-modal-close">
            <X size={16} />
          </button>
        </header>
        <div className="us-view-grid">
          <ViewField label="Name" value={user.name} />
          <ViewField label="Email" value={user.email} />
          <ViewField
            label="Role"
            value={<span className={`us-role-badge us-role-${user.role}`}>{user.role}</span>}
          />
          <ViewField
            label="Status"
            value={
              <span className={`us-status-badge ${user.active ? 'us-active' : 'us-inactive'}`}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            }
          />
          {user.role === 'instructor' && user.courses?.length > 0 && (
            <ViewField
              label="Courses"
              value={
                <div className="us-view-tags">
                  {user.courses.map(c => <span key={c} className="us-view-tag">{c}</span>)}
                </div>
              }
            />
          )}
        </div>
        <div className="us-modal-actions">
          <button type="button" className="us-btn-cancel" onClick={onClose}>Close</button>
          <button type="button" className="us-btn-submit" onClick={onEdit}>
            <Edit3 size={14} /> Edit
          </button>
        </div>
      </Dialog>
    </div>
  );
}

function ViewField({ label, value }) {
  return (
    <div className="us-view-field">
      <span className="us-view-label">{label}</span>
      <div className="us-view-value">{value}</div>
    </div>
  );
}
