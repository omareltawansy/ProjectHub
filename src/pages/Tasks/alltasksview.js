import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, Calendar, User, AlertCircle } from 'lucide-react';
import PrimaryNav from '../../components/PrimaryNav/PrimaryNav.js';
import { useAppData } from '../../data/useAppData.js';
import { isProjectMember } from '../../utils/ownership';
import './alltasksview.css';

export default function AllTasksView({ user, onNavigate, inline = false, onBack }) {
  const navigate = useNavigate();
  const { tasks: allTasks, projects: allProjects, updateTask } = useAppData();
  const projects = allProjects.filter(p => isProjectMember(p, user));
  const myProjectIds = new Set(projects.map(p => p.id));
  const tasks = allTasks.filter(t => myProjectIds.has(t.projectId));

  const toggleTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      status: task.status === 'Completed' ? 'Pending' : 'Completed',
      overdue: task.status === 'Completed' ? task.overdue : false,
    });
  };
  const [filter, setFilter] = useState('All');

  // Unauthenticated users are redirected by the route guards in App.js.
  if (!user) return null;

  const filters = ['All', 'Pending', 'Completed', 'Postponed', 'Overdue'];

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return t.status === 'Pending' && !t.overdue;
    if (filter === 'Completed') return t.status === 'Completed';
    if (filter === 'Postponed') return t.status === 'Postponed';
    if (filter === 'Overdue') return t.overdue;
    return true;
  });

  // Group tasks by project
  const groupedTasks = projects.map(project => ({
    project,
    tasks: filteredTasks.filter(t => t.projectId === project.id),
  })).filter(g => g.tasks.length > 0);

  const totalOpen = tasks.filter(t => t.status !== 'Completed').length;
  const totalOverdue = tasks.filter(t => t.overdue).length;
  const totalDone = tasks.filter(t => t.status === 'Completed').length;

  const content = (
    <div className={`atv-page${inline ? ' inline' : ''}`}>

        {/* Header */}
        <div className="atv-header">
          <button className="atv-back-btn" onClick={() => inline ? onBack?.() : navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="atv-title">All Tasks</h1>
            <p className="atv-sub">Across all your projects</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="atv-stats">
          <div className="atv-stat">
            <div className="atv-stat-value">{tasks.length}</div>
            <div className="atv-stat-label">Total</div>
          </div>
          <div className="atv-stat">
            <div className="atv-stat-value">{totalOpen}</div>
            <div className="atv-stat-label">Open</div>
          </div>
          <div className="atv-stat overdue">
            <div className="atv-stat-value">{totalOverdue}</div>
            <div className="atv-stat-label">Overdue</div>
          </div>
          <div className="atv-stat done">
            <div className="atv-stat-value">{totalDone}</div>
            <div className="atv-stat-label">Completed</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="atv-filters">
          {filters.map(f => (
            <button
              key={f}
              className={`atv-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Tasks grouped by project */}
        <div className="atv-groups">
          {groupedTasks.length === 0 ? (
            <div className="atv-empty">No tasks match this filter.</div>
          ) : (
            groupedTasks.map(({ project, tasks: projectTasks }) => (
              <div key={project.id} className="atv-group">

                {/* Project header */}
                <div className="atv-group-header">
                  <div className="atv-group-icon"><Folder size={16} /></div>
                  <span className="atv-group-title">{project.title}</span>
                  <span className="atv-group-course">{project.course}</span>
                  <button
                    className="atv-group-link"
                    onClick={() => navigate(`/projectviewone/${project.id}`)}
                  >
                    Open project →
                  </button>
                </div>

                {/* Tasks in this project */}
                <div className="atv-tasks">
                  {projectTasks.map(task => (
                    <div key={task.id} className={`atv-task-row ${task.overdue ? 'overdue' : ''} ${task.status === 'Completed' ? 'completed' : ''}`}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.status === 'Completed'}
                        aria-label={`${task.title}: ${task.status === 'Completed' ? 'mark as pending' : 'mark as complete'}`}
                        className={`atv-check ${task.status === 'Completed' ? 'done' : ''}`}
                        onClick={() => toggleTask(task.id)}
                        title={task.status === 'Completed' ? 'Mark as pending' : 'Mark as complete'}
                        style={{ cursor: 'pointer', padding: 0, font: 'inherit' }}
                      >
                        {task.status === 'Completed' && '✓'}
                      </button>
                      <div className="atv-task-info">
                        <div className="atv-task-title">{task.title}</div>
                        <div className="atv-task-desc">{task.description}</div>
                        <div className="atv-task-meta">
                          <span><User size={11} /> {task.assignedTo}</span>
                          <span className={task.overdue ? 'atv-overdue' : ''}>
                            <Calendar size={11} /> {task.dueDate}
                            {task.overdue && <span className="atv-overdue-badge"><AlertCircle size={11} /> Overdue</span>}
                          </span>
                        </div>
                      </div>
                      <span className={`atv-status-badge ${task.status === 'Completed' ? 'completed' : task.status === 'Postponed' ? 'postponed' : task.overdue ? 'overdue' : 'pending'}`}>
                        {task.status === 'Completed' ? 'Completed' : task.status === 'Postponed' ? 'Postponed' : task.overdue ? 'Overdue' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>

    </div>
  );

  if (inline) return content;

  return (
    <div className="atv-page-wrap">
      <PrimaryNav user={user} onNavigate={onNavigate} />
      {content}
    </div>
  );
}