import React, { useState, useEffect } from 'react';
import { Search, Home, Bell } from 'lucide-react';
import { useAppData } from '../../data/useAppData.js';
import StudentSettings from '../../pages/Profiles/StudentProfile/StudentSettings';
import InstructorSettings from '../../pages/Profiles/InstructorProfile/InstructorSettings';
import EmployerSettings from '../../pages/Profiles/EmployerProfile/EmployerSettings';
import AdminSettings from '../../pages/Dashboards/AdminDashboard/AdminSettings';
import { notificationsFor, isNotificationRead } from '../../utils/notifications';
import Dialog from '../Dialog/Dialog';
import './PrimaryNav.css';

export default function PrimaryNav({ user, onNavigate, onSectionNavigate }) {
  const { notifications: initialNotifications, notificationsDisabled } = useAppData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifPopup, setShowNotifPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Escape closes whichever popup/modal is open.
  useEffect(() => {
    if (!showProfileMenu && !showNotifPopup) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setShowProfileMenu(false);
      setShowNotifPopup(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showProfileMenu, showNotifPopup]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.location.href = `/${page}`;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onNavigate) {
        onNavigate('search', searchQuery);
      } else {
        window.location.href = '/search';
      }
      setSearchQuery('');
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
    setShowProfileMenu(false);
  };

  const handlePortfolioClick = () => {
    setShowProfileMenu(false);
    handleNavigate('/portfolio');
  };

  // Reads fresh user data from localStorage when opening settings (fixes persistence)
  const freshUser = () => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : user;
    } catch { return user; }
  };

  const notifDisabled = (notificationsDisabled || []).includes(user?.email);
  const relevantNotifications = notifDisabled ? [] : notificationsFor(initialNotifications, user)
    .map((n) => ({ ...n, read: isNotificationRead(n, user) }));
  const unreadNotificationsCount = relevantNotifications.filter((n) => !n.read).length;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <nav className="primary-nav">

        <div className="nav-left">
          <a href="/" className="nav-logo">
            <img src="/logo.png" alt="" className="nav-logo-image" />
            <span className="nav-logo-text">ProjectHub</span>
          </a>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, portfolios, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search"
          />
        </form>

        <div className="nav-right">
          <a href="/" className="nav-icon-btn" title="Home" aria-label="Home">
            <Home size={18} />
          </a>

          <div className="notif-popup-wrapper">
            <button
              className="nav-icon-btn notif-btn"
              title="Notifications"
              aria-label={`Notifications${unreadNotificationsCount ? ` (${unreadNotificationsCount} unread)` : ''}`}
              aria-expanded={showNotifPopup}
              onClick={() => setShowNotifPopup((v) => !v)}
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="notif-badge">{unreadNotificationsCount}</span>
              )}
            </button>

            {showNotifPopup && (
              <>
                <div className="notif-popup-overlay" onClick={() => setShowNotifPopup(false)} />
                <div className="notif-popup">
                  <div className="notif-popup-header">
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="notif-popup-count">{unreadNotificationsCount} unread</span>
                    )}
                  </div>
                  <div className="notif-popup-list">
                    {relevantNotifications.filter((n) => !n.read).slice(0, 5).length === 0 ? (
                      <p className="notif-popup-empty">You're all caught up!</p>
                    ) : (
                      relevantNotifications.filter((n) => !n.read).slice(0, 5).map((n) => (
                        <button
                          key={n.id}
                          className="notif-popup-item"
                          onClick={() => {
                            setShowNotifPopup(false);
                            if (onSectionNavigate) {
                              onSectionNavigate('Notifications');
                            } else {
                              handleNavigate('notifications');
                            }
                          }}
                        >
                          <span className={`notif-popup-dot notif-popup-dot-${n.type}`} />
                          <div className="notif-popup-body">
                            <p className="notif-popup-msg">{n.message}</p>
                            <span className="notif-popup-time">{n.time}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    className="notif-popup-viewall"
                    onClick={() => {
                      setShowNotifPopup(false);
                      if (onSectionNavigate) {
                        onSectionNavigate('Notifications');
                      } else {
                        handleNavigate('notifications');
                      }
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="nav-profile-wrapper">
            <button
              className="nav-avatar-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Account menu"
              aria-expanded={showProfileMenu}
            >
              <span>{initials}</span>
            </button>

            {showProfileMenu && (
              <>
                <div className="profile-overlay" onClick={() => setShowProfileMenu(false)} />
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <div className="menu-avatar">{initials}</div>
                    <div>
                      <p className="menu-name">{user.name}</p>
                      <p className="menu-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="menu-divider" />
                  {user.role === 'student' ? (
                    <button className="menu-item" onClick={handlePortfolioClick}>View Portfolio</button>
                  ) : user.role === 'employer' ? (
                    <button className="menu-item" onClick={() => { setShowProfileMenu(false); handleNavigate('/employer-profile'); }}>View Company Profile</button>
                  ) : (
                    <button className="menu-item" onClick={handleSettingsClick}>Settings</button>
                  )}
                  <div className="menu-divider" />
                  <div className="menu-dark-mode">
                    <label className="dark-mode-label">
                      <span>Dark Mode</span>
                      <input 
                        type="checkbox" 
                        className="dark-mode-toggle"
                        checked={isDarkMode}
                        onChange={() => setIsDarkMode(!isDarkMode)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="menu-divider" />
                  <button className="menu-item menu-logout" onClick={handleLogout}>Log out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {showSettings && (() => {
        const latestUser = freshUser();
        return (
          <div className="settings-modal">
            <div className="settings-modal-overlay" onClick={() => setShowSettings(false)} />
            <Dialog className="settings-modal-content" aria-label="Settings" onClose={() => setShowSettings(false)}>
              {latestUser.role === 'student' && (
                <StudentSettings user={latestUser} onClose={() => setShowSettings(false)} />
              )}
              {latestUser.role === 'instructor' && (
                <InstructorSettings user={latestUser} onClose={() => setShowSettings(false)} />
              )}
              {latestUser.role === 'employer' && (
                <EmployerSettings user={latestUser} onClose={() => setShowSettings(false)} />
              )}
              {latestUser.role === 'admin' && (
                <AdminSettings user={latestUser} onClose={() => setShowSettings(false)} />
              )}
            </Dialog>
          </div>
        );
      })()}
    </>
  );
}

