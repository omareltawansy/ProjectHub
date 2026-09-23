import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useAppData } from '../../data/useAppData.js';
import { notificationsFor, isNotificationRead } from '../../utils/notifications';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav';
import './Notifications.css';

const TABS = ['All', 'Unread', 'Read'];

const TYPE_LABELS = {
  ci_link: 'CI Link',
  employer: 'Employer',
  flag: 'Flag',
  appeal: 'Appeal',
  feedback: 'Feedback',
  invitation: 'Invitation',
  general: 'General',
};

export default function Notifications({ user, onNavigate }) {
  const {
    notifications, setNotificationsRead,
    notificationsDisabled, disableNotifications, enableNotifications,
  } = useAppData();
  const [activeTab, setActiveTab] = useState('All');

  const isDisabled = (notificationsDisabled || []).includes(user?.email);

  const handleToggleNotifications = () => {
    if (isDisabled) {
      enableNotifications(user.email);
    } else {
      disableNotifications(user.email);
    }
  };

  // `read` here is this user's read state (broadcasts are tracked per user).
  const relevantNotifications = notificationsFor(notifications, user)
    .map((n) => ({ ...n, read: isNotificationRead(n, user) }));

  const visible = relevantNotifications.filter((n) => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Read') return n.read;
    return true;
  });

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  const toggleRead = (id) => {
    const n = relevantNotifications.find((x) => x.id === id);
    if (n) setNotificationsRead(id, user, !n.read);
  };

  const markAllRead = () => {
    setNotificationsRead(relevantNotifications.filter((n) => !n.read).map((n) => n.id), user, true);
  };

  return (
    <>
    <PrimaryNav user={user} onNavigate={onNavigate} />
    <div className="notifications-root">
      <section className="notifications-card">
        <div className="notifications-header">
          <h2 className="notifications-title">
            Notifications
            {unreadCount > 0 && !isDisabled && (
              <span className="notifications-unread-badge">{unreadCount} unread</span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {unreadCount > 0 && !isDisabled && (
              <button className="notifications-mark-all" onClick={markAllRead}>
                Mark all as read
              </button>
            )}
            <button
              className={`notifications-toggle-notifs${isDisabled ? ' disabled' : ''}`}
              onClick={handleToggleNotifications}
              title={isDisabled ? 'Notifications are off — click to enable' : 'Turn off notifications'}
            >
              {isDisabled ? <BellOff size={15} /> : <Bell size={15} />}
              {isDisabled ? 'Notifications off' : 'Notifications on'}
            </button>
          </div>
        </div>

        <div className="notifications-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`notifications-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="notifications-tab-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {isDisabled ? (
          <p className="notifications-empty">
            Notifications are turned off. Toggle them on to see your notifications.
          </p>
        ) : visible.length === 0 ? (
          <p className="notifications-empty">No notifications available.</p>
        ) : (
          <ul className="notifications-list">
            {visible.map((n) => (
              <li key={n.id} className={`notifications-item${n.read ? ' read' : ''}`}>
                <div className="notifications-item-left">
                  <span className={`notifications-dot notifications-dot-${n.type}`} />
                  <div className="notifications-item-body">
                    <p className="notifications-message">{n.message}</p>
                    <span className="notifications-meta">
                      <span className="notifications-type">{TYPE_LABELS[n.type] || 'Update'}</span>
                      <span className="notifications-sep">·</span>
                      <span className="notifications-time">{n.time}</span>
                    </span>
                  </div>
                </div>
                <div className="notifications-item-right">
                  {!n.read && <span className="notifications-unread-dot" />}
                  <button
                    className={`notifications-toggle-btn${n.read ? ' unread' : ' read'}`}
                    onClick={() => toggleRead(n.id)}
                  >
                    {n.read ? 'Mark unread' : 'Mark read'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </>
  );
}
