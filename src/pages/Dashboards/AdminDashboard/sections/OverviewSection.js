import React from 'react';
import {
  Users as UsersIcon,
  Building2,
  BookOpen,
  FolderKanban,
  Briefcase,
  Bell,
  ArrowRight,
  Flag,
  AlertCircle,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import { useAppData } from '../../../../data/useAppData.js';
import './OverviewSection.css';

export default function OverviewSection({ onJump }) {
  const { users, employers, courses, projects, internships, notifications, ciLinkRequests } = useAppData();
  const totalUsers = users.length;
  const totalProjects = projects.length;
  const totalCourses = courses.length;
  const totalInternships = internships.length;
  const totalEmployers = employers.length;

  const pendingEmployers = employers.filter(e => e.status === 'pending').length;
  const flaggedProjects = projects.filter(p => p.flagged).length;
  const pendingAppeals = projects.filter(p => p.flagged && p.appeal).length;
  const pendingCiRequests = ciLinkRequests.filter(r => r.status === 'pending').length;

  const adminNotifications = notifications.filter(
    n => n.role === 'admin' || n.role === 'multi'
  );
  const recentNotifications = [...adminNotifications].slice(0, 5);

  const stats = [
    { key: 'users',      label: 'Total users',    value: totalUsers,       icon: UsersIcon,      jump: 'Users' },
    { key: 'projects',   label: 'Projects',       value: totalProjects,    icon: FolderKanban,   jump: 'Projects' },
    { key: 'courses',    label: 'Courses',        value: totalCourses,     icon: BookOpen,       jump: 'Courses' },
    { key: 'employers',  label: 'Employers',      value: totalEmployers,   icon: Building2,      jump: 'Employers' },
    { key: 'internships', label: 'Internships',   value: totalInternships, icon: Briefcase,      jump: 'Internships' },
  ];

  const queues = [
    {
      key: 'pendingEmployers',
      label: 'Pending employer approvals',
      value: pendingEmployers,
      icon: ShieldCheck,
      jump: 'Employers',
    },
    {
      key: 'pendingCi',
      label: 'Pending course link requests',
      value: pendingCiRequests,
      icon: GitBranch,
      jump: 'Courses',
    },
    {
      key: 'flagged',
      label: 'Flagged projects',
      value: flaggedProjects,
      icon: Flag,
      jump: 'Projects',
    },
    {
      key: 'appeals',
      label: 'Pending appeals',
      value: pendingAppeals,
      icon: AlertCircle,
      jump: 'Projects',
    },
  ];

  return (
    <div className="ov-root">
      {/* Stat tiles */}
      <section className="ov-stats">
        {stats.map(({ key, label, value, icon: Icon, jump }) => (
          <button
            key={key}
            type="button"
            className="ov-stat-card"
            onClick={() => onJump?.(jump)}
          >
            <div className="ov-stat-icon">
              <Icon size={18} />
            </div>
            <div className="ov-stat-body">
              <span className="ov-stat-label">{label}</span>
              <span className="ov-stat-value">{value}</span>
            </div>
            <ArrowRight size={14} className="ov-stat-arrow" />
          </button>
        ))}
      </section>

      {/* Two-column queues + activity */}
      <div className="ov-grid">
        <section className="ov-card">
          <header className="ov-card-header">
            <h2 className="ov-card-title">Action queues</h2>
            <span className="ov-card-sub">Items waiting on your review</span>
          </header>
          <ul className="ov-queue-list">
            {queues.map(({ key, label, value, icon: Icon, jump }) => (
              <li key={key} className="ov-queue-item">
                <div className="ov-queue-icon">
                  <Icon size={16} />
                </div>
                <div className="ov-queue-info">
                  <span className="ov-queue-label">{label}</span>
                  <span className="ov-queue-meta">
                    {value === 0
                      ? 'Nothing pending right now.'
                      : `${value} item${value === 1 ? '' : 's'} waiting`}
                  </span>
                </div>
                <span className={`ov-queue-count${value > 0 ? ' active' : ''}`}>
                  {value}
                </span>
                <button
                  type="button"
                  className="ov-queue-cta"
                  onClick={() => onJump?.(jump)}
                >
                  Review <ArrowRight size={12} />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="ov-card">
          <header className="ov-card-header">
            <h2 className="ov-card-title">Recent activity</h2>
            <button
              type="button"
              className="ov-card-link"
              onClick={() => onJump?.('Notifications')}
            >
              View all <ArrowRight size={12} />
            </button>
          </header>
          {recentNotifications.length === 0 ? (
            <p className="ov-empty">No recent activity.</p>
          ) : (
            <ul className="ov-activity-list">
              {recentNotifications.map(n => (
                <li key={n.id} className={`ov-activity-item${n.read ? '' : ' unread'}`}>
                  <span className={`ov-activity-dot ov-dot-${n.type}`} />
                  <div className="ov-activity-body">
                    <p className="ov-activity-message">{n.message}</p>
                    <span className="ov-activity-time">
                      <Bell size={11} /> {n.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
