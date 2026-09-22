import { useState, useCallback, useEffect } from 'react';
import appData from './appData';

const STORAGE_KEY = 'appData_storage';

/**
 * useAppData Hook - Centralized state management with localStorage persistence
 * 
 * Usage in components:
 * const { users, projects, internships, updateProject, addMessage } = useAppData();
 * 
 * All changes are automatically saved to localStorage and restored on app load
 */
export function useAppData() {
  // Load from localStorage on first mount, otherwise use default appData
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults so newly-added top-level fields (courseOptions, etc.)
        // are always present even if localStorage pre-dates them.
        return { ...appData, ...parsed };
      }
      return appData;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return appData;
    }
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    const stripped = {
      ...state,
      // Strip base64 image blobs — they fill the 5 MB quota almost instantly
      users:     (state.users     || []).map(u => { const { profilePicture, ...r } = u; return r; }),
      employers: (state.employers || []).map(e => { const { profilePicture, ...r } = e; return r; }),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        // Last-resort: clear old data and retry once
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
        } catch (_) { /* silently ignore if still over quota */ }
      }
    }
  }, [state]);

  // ==================== USERS ====================
  const updateUser = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  }, []);

  const updateUsers = useCallback((users) => {
    setState(prev => ({ ...prev, users }));
  }, []);

  const addUser = useCallback((user) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, {
        id: Math.max(...prev.users.map(u => Number(u.id) || 0), 0) + 1,
        active: true,
        ...user,
      }],
    }));
  }, []);

  // ==================== PROJECTS ====================
  const updateProject = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const updateProjects = useCallback((projects) => {
    setState(prev => ({ ...prev, projects }));
  }, []);

  const addProject = useCallback((project) => {
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, { 
        id: Math.max(...prev.projects.map(p => Number(p.id) || 0), 0) + 1, 
        ...project 
      }]
    }));
  }, []);

  // ==================== PORTFOLIOS ====================
  const updatePortfolio = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      portfolios: prev.portfolios.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const updatePortfolios = useCallback((portfolios) => {
    setState(prev => ({ ...prev, portfolios }));
  }, []);

  const addPortfolio = useCallback((portfolio) => {
    setState(prev => ({
      ...prev,
      portfolios: [...prev.portfolios, {
        id: Math.max(...prev.portfolios.map(p => Number(p.id) || 0), 0) + 1,
        ...portfolio,
      }],
    }));
  }, []);

  // ==================== NOTIFICATIONS ====================
  const updateNotification = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  }, []);

  const updateNotifications = useCallback((notifications) => {
    setState(prev => ({ ...prev, notifications }));
  }, []);

  const addNotification = useCallback((notification) => {
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { 
        id: Math.max(...prev.notifications.map(n => Number(n.id) || 0), 0) + 1, 
        ...notification 
      }]
    }));
  }, []);

  const deleteNotification = useCallback((id) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  }, []);

  // ==================== MESSAGES ====================
  const updateMessage = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }, []);

  const updateMessages = useCallback((messages) => {
    setState(prev => ({ ...prev, messages }));
  }, []);

  const addMessage = useCallback((message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { 
        id: Math.max(...prev.messages.map(m => Number(m.id) || 0), 0) + 1, 
        ...message 
      }]
    }));
  }, []);

  // ==================== INTERNSHIPS ====================
  const updateInternship = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      internships: prev.internships.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  }, []);

  const updateInternships = useCallback((internships) => {
    setState(prev => ({ ...prev, internships }));
  }, []);

  const addInternship = useCallback((internship) => {
    setState(prev => ({
      ...prev,
      internships: [...prev.internships, { 
        id: Math.max(...prev.internships.map(i => Number(i.id) || 0), 0) + 1, 
        ...internship 
      }]
    }));
  }, []);

  // Applicant management for internships
  const addApplicantToInternship = useCallback((internshipId, applicant) => {
    setState(prev => ({
      ...prev,
      internships: prev.internships.map(i => 
        i.id === internshipId 
          ? { 
              ...i, 
              applicants: [...i.applicants, { 
                id: Math.max(...i.applicants.map(a => Number(a.id) || 0), 0) + 1, 
                ...applicant 
              }] 
            }
          : i
      )
    }));
  }, []);

  const updateInternshipApplicant = useCallback((internshipId, applicantId, updates) => {
    setState(prev => ({
      ...prev,
      internships: prev.internships.map(i => 
        i.id === internshipId 
          ? { 
              ...i, 
              applicants: i.applicants.map(a => 
                a.id === applicantId ? { ...a, ...updates } : a
              ) 
            }
          : i
      )
    }));
  }, []);

  // ==================== TASKS ====================
  const updateTask = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const updateTasks = useCallback((tasks) => {
    setState(prev => ({ ...prev, tasks }));
  }, []);

  const addTask = useCallback((task) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, {
        id: Math.max(...prev.tasks.map(t => Number(t.id) || 0), 0) + 1,
        ...task
      }]
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  // ==================== EMPLOYERS ====================
  const updateEmployer = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      employers: prev.employers.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const updateEmployers = useCallback((employers) => {
    setState(prev => ({ ...prev, employers }));
  }, []);

  const addEmployer = useCallback((employer) => {
    setState(prev => ({
      ...prev,
      employers: [...prev.employers, { 
        id: Math.max(...prev.employers.map(e => Number(e.id) || 0), 0) + 1, 
        ...employer 
      }]
    }));
  }, []);

  // ==================== COURSES ====================
  const updateCourse = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  }, []);

  const updateCourses = useCallback((courses) => {
    setState(prev => ({ ...prev, courses }));
  }, []);

  // ==================== PROJECT INVITATIONS ====================
  const addProjectInvitation = useCallback((invitation) => {
    setState(prev => ({
      ...prev,
      projectInvitations: [
        ...(prev.projectInvitations || []),
        { id: Date.now(), status: 'pending', ...invitation },
      ],
    }));
  }, []);

  const deleteProjectInvitation = useCallback((id) => {
    setState(prev => ({
      ...prev,
      projectInvitations: (prev.projectInvitations || []).filter(i => i.id !== id),
    }));
  }, []);

  const updateProjectInvitations = useCallback((projectInvitations) => {
    setState(prev => ({ ...prev, projectInvitations }));
  }, []);

  // ==================== FAVORITES ====================
  const addFavorite = useCallback((userEmail, type, itemId) => {
    setState(prev => {
      const existing = (prev.favorites || []).find(
        f => f.userEmail === userEmail && f.type === type && f.itemId === itemId
      );
      if (existing) return prev;
      return { ...prev, favorites: [...(prev.favorites || []), { userEmail, type, itemId }] };
    });
  }, []);

  const removeFavorite = useCallback((userEmail, type, itemId) => {
    setState(prev => ({
      ...prev,
      favorites: (prev.favorites || []).filter(
        f => !(f.userEmail === userEmail && f.type === type && f.itemId === itemId)
      ),
    }));
  }, []);

  // ==================== NOTIFICATIONS DISABLED ====================
  const disableNotifications = useCallback((userEmail) => {
    setState(prev => ({
      ...prev,
      notificationsDisabled: [...new Set([...(prev.notificationsDisabled || []), userEmail])],
    }));
  }, []);

  const enableNotifications = useCallback((userEmail) => {
    setState(prev => ({
      ...prev,
      notificationsDisabled: (prev.notificationsDisabled || []).filter(e => e !== userEmail),
    }));
  }, []);

  // ==================== CI LINK REQUESTS ====================
  const updateCILinkRequest = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      ciLinkRequests: prev.ciLinkRequests.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }, []);

  const updateCILinkRequests = useCallback((ciLinkRequests) => {
    setState(prev => ({ ...prev, ciLinkRequests }));
  }, []);

  const addCILinkRequest = useCallback((request) => {
    setState(prev => ({
      ...prev,
      ciLinkRequests: [...prev.ciLinkRequests, { 
        id: Math.max(...prev.ciLinkRequests.map(r => Number(r.id) || 0), 0) + 1, 
        ...request 
      }]
    }));
  }, []);

  return {
    // Data
    ...state,

    // User methods
    updateUser,
    updateUsers,
    addUser,

    // Project methods
    updateProject,
    updateProjects,
    addProject,

    // Portfolio methods
    updatePortfolio,
    updatePortfolios,
    addPortfolio,

    // Notification methods
    updateNotification,
    updateNotifications,
    addNotification,
    deleteNotification,

    // Message methods
    updateMessage,
    updateMessages,
    addMessage,

    // Internship methods
    updateInternship,
    updateInternships,
    addInternship,
    addApplicantToInternship,
    updateInternshipApplicant,

    // Task methods
    updateTask,
    updateTasks,
    addTask,
    deleteTask,

    // Employer methods
    updateEmployer,
    updateEmployers,
    addEmployer,

    // Course methods
    updateCourse,
    updateCourses,

    // CI Link Request methods
    updateCILinkRequest,
    updateCILinkRequests,
    addCILinkRequest,

    // Project invitation methods
    addProjectInvitation,
    deleteProjectInvitation,
    updateProjectInvitations,

    // Favorites methods
    addFavorite,
    removeFavorite,

    // Notifications enabled/disabled
    disableNotifications,
    enableNotifications,
  };
}
