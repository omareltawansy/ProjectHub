import React, { useMemo, useState } from 'react';
import { Megaphone, X, Filter } from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import { useToast } from '../../../../components/Toast/Toast.js';
import './NotificationsSection.css';

const TABS = ['All', 'Unread', 'Read'];

const TYPE_LABELS = {
  ci_link:  'CI Link',
  employer: 'Employer',
  flag:     'Flag',
  appeal:   'Appeal',
  general:  'General',
  message:  'Message',
};

const TYPE_OPTIONS = [
  { value: 'all',      label: 'All Types' },
  { value: 'ci_link',  label: 'CI Link' },
  { value: 'employer', label: 'Employer' },
  { value: 'flag',     label: 'Flag' },
  { value: 'appeal',   label: 'Appeal' },
  { value: 'general',  label: 'General' },
  { value: 'message',  label: 'Message' },
];

const BROADCAST_ROLES = [
  { value: 'multi',      label: 'All roles' },
  { value: 'student',    label: 'Students' },
  { value: 'instructor', label: 'Instructors' },
  { value: 'employer',   label: 'Employers' },
  { value: 'admin',      label: 'Admins' },
];

const nowStamp = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

let nextNotifId = 100000;

export default function NotificationsSection() {
  const { notifications: initialNotifications, updateNotifications } = useAppData();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const toast = useToast();

  const adminNotifications = useMemo(
    () => notifications.filter(n => n.role === 'admin' || n.role === 'multi'),
    [notifications]
  );

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const visible = useMemo(() => {
    return adminNotifications.filter(n => {
      if (activeTab === 'Unread' && n.read) return false;
      if (activeTab === 'Read' && !n.read) return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      return true;
    });
  }, [adminNotifications, activeTab, typeFilter]);

  const toggleRead = (id) => {
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    setNotifications(updatedNotifications);
    updateNotifications(updatedNotifications);
  };

  const markAllRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    updateNotifications(updatedNotifications);
    toast.success('All notifications marked as read.');
  };

  const sendBroadcast = ({ role, type, message }, setError) => {
    if (!message.trim()) {
      setError('Message is required.');
      return;
    }
    if (message.trim().length > 300) {
      setError('Message must be 300 characters or fewer.');
      return;
    }
    if (role === 'multi' && !window.confirm('Send this notification to all roles?')) {
      return;
    }
    nextNotifId += 1;
    const newNotif = {
      id: nextNotifId,
      type,
      role,
      message: message.trim(),
      time: nowStamp(),
      read: false,
    };
    const updatedNotifications = [newNotif, ...notifications];
    setNotifications(updatedNotifications);
    updateNotifications(updatedNotifications);
    toast.success(`Notification sent to ${BROADCAST_ROLES.find(r => r.value === role)?.label || role}.`);
    setBroadcastOpen(false);
  };

  return (
    <div className="ns-root">
      <section className="ns-card">
        <div className="ns-header">
          <div>
            <h2 className="ns-card-title">
              Notifications
              {unreadCount > 0 && (
                <span className="ns-unread-badge">{unreadCount} unread</span>
              )}
            </h2>
            <p className="ns-card-sub">
              Track admin alerts and broadcast announcements to any role.
            </p>
          </div>
          <div className="ns-header-actions">
            <button
              type="button"
              className="ns-broadcast-btn"
              onClick={() => setBroadcastOpen(true)}
            >
              <Megaphone size={14} /> Broadcast
            </button>
            {unreadCount > 0 && (
              <button type="button" className="ns-mark-all-btn" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="ns-toolbar">
          <div className="ns-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`ns-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Unread' && unreadCount > 0 && (
                  <span className="ns-tab-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          <div className="ns-type-filter">
            <Filter size={14} className="ns-filter-icon" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="ns-empty">No notifications match these filters.</p>
        ) : (
          <ul className="ns-list">
            {visible.map(n => (
              <li key={n.id} className={`ns-item${n.read ? ' ns-item-read' : ''}`}>
                <div className="ns-item-left">
                  <span className={`ns-dot ns-dot-${n.type}`} title={TYPE_LABELS[n.type]} />
                  <div className="ns-item-body">
                    <p className="ns-message">{n.message}</p>
                    <span className="ns-meta">
                      <span className="ns-type-label">{TYPE_LABELS[n.type] || n.type}</span>
                      <span className="ns-sep">·</span>
                      <span className="ns-time">{n.time}</span>
                    </span>
                  </div>
                </div>
                <div className="ns-item-right">
                  {!n.read && <span className="ns-unread-dot" />}
                  <button
                    className={`ns-toggle-btn${n.read ? ' ns-btn-unread' : ' ns-btn-read'}`}
                    onClick={() => toggleRead(n.id)}
                  >
                    {n.read ? 'Mark as unread' : 'Mark as read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {broadcastOpen && (
        <BroadcastModal
          onClose={() => setBroadcastOpen(false)}
          onSubmit={sendBroadcast}
        />
      )}
    </div>
  );
}

function BroadcastModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    role: 'multi',
    type: 'general',
    message: '',
  });
  const [error, setError] = useState('');

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form, setError);
  };

  return (
    <div className="ns-modal-backdrop" onClick={onClose}>
      <div className="ns-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ns-modal-header">
          <div className="ns-modal-title">
            <Megaphone size={18} />
            <h3>Broadcast notification</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="ns-modal-close">
            <X size={16} />
          </button>
        </header>
        <form className="ns-modal-form" onSubmit={submit}>
          <label>
            Send to
            <select value={form.role} onChange={(e) => update('role', e.target.value)}>
              {BROADCAST_ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => update('type', e.target.value)}>
              <option value="general">General</option>
              <option value="message">Message</option>
              <option value="ci_link">CI Link</option>
              <option value="employer">Employer</option>
              <option value="flag">Flag</option>
              <option value="appeal">Appeal</option>
            </select>
          </label>
          <label>
            Message
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Write your announcement…"
            />
          </label>
          {error && <p className="ns-form-error">{error}</p>}
          <div className="ns-modal-actions">
            <button type="button" className="ns-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ns-btn-submit">
              <Megaphone size={14} /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
