import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import StudentDashboard from './pages/Dashboards/StudentDashboard/StudentDashboard';
import InstructorDashboard from './pages/Dashboards/InstructorDashboard/InstructorDashboard';
import EmployerDashboard from './pages/Dashboards/EmployerDashboard/EmployerDashboard';
import EmployerInternships from './pages/Dashboards/EmployerDashboard/EmployerInternships';
import AdminDashboard from './pages/Dashboards/AdminDashboard/AdminDashboard';
import SearchResults from './pages/SearchResults/SearchResults';
import Internships from './pages/Internships/Internships';
import Notifications from './pages/Notifications/Notifications';
import Messages from './pages/Messages/Messages';
import ProjectView from './pages/Projects/projectview';
import ProjectViewOne from './pages/Projects/projectviewone';
import Portfolio from './pages/Portfolio/portfolio';
import PublicPortfolioPage from './pages/Portfolio/PublicPortfolioPage';
import AllTasksView from './pages/Tasks/alltasksview';
import ProjectsBrowse from './pages/Browse/ProjectsBrowse';
import PortfoliosBrowse from './pages/Browse/PortfoliosBrowse';
import EmployerPublicProfile from './pages/Profiles/EmployerProfile/EmployerPublicProfile';
import InstructorProfilePage from './pages/Profiles/InstructorProfile/InstructorProfilePage';
import { useAppData } from './data/useAppData';
import './styles/global.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { users } = useAppData();

  const navigateTo = (page, query = '') => {
    const paths = {
      'login': '/login',
      'register': '/register',
      'forgot-password': '/forgot-password',
      'search': '/search',
      'notifications': '/notifications',
      'messages': '/messages',
    };
    const nextPath = paths[page] || page;

    if (page === 'search') {
      setSearchQuery(query);
    }

    navigate(nextPath);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, []);

  // End the session if an admin deactivates the signed-in account.
  useEffect(() => {
    if (!currentUser) return;
    const record = users.find(u => u.id === currentUser.id);
    if (record && record.active === false) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  }, [users, currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (currentUser?.role) {
      case 'student':
        return <StudentDashboard user={currentUser} onNavigate={navigateTo} />;
      case 'instructor':
        return <InstructorDashboard user={currentUser} onNavigate={navigateTo} />;
      case 'employer':
        return <EmployerDashboard user={currentUser} onNavigate={navigateTo} />;
      case 'admin':
        return <AdminDashboard user={currentUser} onNavigate={navigateTo} />;
      default:
        return <Login navigateTo={navigateTo} />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login navigateTo={navigateTo} />} />
      <Route path="/register" element={<Register navigateTo={navigateTo} />} />
      <Route path="/forgot-password" element={<ForgotPassword navigateTo={navigateTo} />} />
      <Route
        path="/search"
        element={
          currentUser ? (
            <SearchResults user={currentUser} onNavigate={navigateTo} initialQuery={searchQuery} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/internships"
        element={
          currentUser?.role === 'student' ? (
            <Internships user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to={currentUser ? '/' : '/login'} replace />
          )
        }
      />
      <Route
        path="/student-dashboard"
        element={
          currentUser?.role === 'student' ? (
            <StudentDashboard user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/instructor-dashboard"
        element={
          currentUser?.role === 'instructor' ? (
            <InstructorDashboard user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employer-dashboard"
        element={
          currentUser?.role === 'employer' ? (
            <EmployerDashboard user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employer/internships"
        element={
          currentUser?.role === 'employer' ? (
            <EmployerInternships user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          currentUser ? (
            <Notifications user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/messages"
        element={
          currentUser ? (
            <Messages user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projectview"
        element={
          currentUser?.role === 'student' ? (
            <ProjectView user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/projectviewone/:projectId"
        element={
          currentUser?.role === 'student' ? (
            <ProjectViewOne user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/portfolio"
        element={
          currentUser?.role === 'student' ? (
            <Portfolio user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/portfolio/view/:portfolioId"
        element={
          currentUser ? (
            <PublicPortfolioPage user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/alltasks"
        element={
          currentUser?.role === 'student' ? (
            <AllTasksView user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/browse/projects"
        element={
          currentUser ? (
            <ProjectsBrowse user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/browse/portfolios"
        element={
          currentUser ? (
            <PortfoliosBrowse user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/instructor-profile/:userId"
        element={
          currentUser ? (
            <InstructorProfilePage user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employer-profile"
        element={
          currentUser ? (
            <EmployerPublicProfile user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employer-profile/:employerId"
        element={
          currentUser ? (
            <EmployerPublicProfile user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          currentUser?.role === 'admin' ? (
            <AdminDashboard user={currentUser} onNavigate={navigateTo} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/"
        element={currentUser ? renderDashboard() : <Navigate to="/login" replace />}
      />
      <Route path="*" element={currentUser ? renderDashboard() : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;