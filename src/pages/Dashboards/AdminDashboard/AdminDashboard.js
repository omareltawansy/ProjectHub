import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users as UsersIcon,
  Building2,
  BookOpen,
  FolderKanban,
  Briefcase,
  BarChart3,
  Layout,
} from 'lucide-react';
import PrimaryNav from '../../../components/PrimaryNav/PrimaryNav.js';
import OverviewSection from './sections/OverviewSection.js';
import UsersSection from './sections/UsersSection.js';
import EmployersSection from './sections/EmployersSection.js';
import CoursesSection from './sections/CoursesSection.js';
import ProjectsSection from './sections/ProjectsSection.js';
import InternshipsSection from './sections/InternshipsSection.js';
import StatisticsSection from './sections/StatisticsSection.js';
import PortfoliosSection from './sections/PortfoliosSection.js';
import MessagesSection from './sections/MessagesSection.js';
import NotificationsSection from './sections/NotificationsSection.js';
import FloatingMessages from '../../../components/FloatingMessages/FloatingMessages.js';
import './AdminDashboard.css';

const NAV_ITEMS = [
  { key: 'Overview',      icon: LayoutDashboard },
  { key: 'Users',         icon: UsersIcon },
  { key: 'Employers',     icon: Building2 },
  { key: 'Courses',       icon: BookOpen },
  { key: 'Projects',      icon: FolderKanban },
  { key: 'Portfolios',    icon: Layout },
  { key: 'Internships',   icon: Briefcase },
  { key: 'Statistics',    icon: BarChart3 },
];

function renderSection(section, onJump, user) {
  switch (section) {
    case 'Overview':      return <OverviewSection onJump={onJump} />;
    case 'Users':         return <UsersSection />;
    case 'Employers':     return <EmployersSection />;
    case 'Courses':       return <CoursesSection />;
    case 'Projects':      return <ProjectsSection />;
    case 'Portfolios':    return <PortfoliosSection />;
    case 'Internships':   return <InternshipsSection />;
    case 'Statistics':    return <StatisticsSection />;
    case 'Messages':      return <MessagesSection user={user} />;
    case 'Notifications': return <NotificationsSection />;
    default:              return <OverviewSection onJump={onJump} />;
  }
}

export default function AdminDashboard({ user, onNavigate }) {
  const [activeSection, setActiveSection] = useState('Overview');
  const [messagesOpen, setMessagesOpen] = useState(false);

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="admin-dashboard">
      <PrimaryNav
        user={user}
        onNavigate={onNavigate}
        onSectionNavigate={setActiveSection}
      />

      <div className="ad-shell">
        <header className="ad-page-header">
          <div>
            <p className="ad-eyebrow">Admin panel</p>
            <h1 className="ad-page-title">{activeSection === 'Overview' ? 'Dashboard' : activeSection}</h1>
          </div>
        </header>

        <nav className="ad-tabs" aria-label="Admin sections">
          {NAV_ITEMS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`ad-tab${activeSection === key ? ' active' : ''}`}
              onClick={() => setActiveSection(key)}
            >
              <Icon size={15} />
              <span>{key}</span>
            </button>
          ))}
        </nav>

        <main className="ad-main">
          {renderSection(activeSection, setActiveSection, user)}
        </main>
      </div>

      <FloatingMessages
        isOpen={messagesOpen}
        onToggle={setMessagesOpen}
        onOpenFullMessages={() => setActiveSection('Messages')}
        currentUser={user}
      />
    </div>
  );
}
