import React, { useMemo } from 'react';
import { useAppData } from '../../../../data/useAppData.js';
import './StatisticsSection.css';

const ROLES = ['student', 'instructor', 'employer', 'admin'];
const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Instructor',
  employer: 'Employer',
  admin: 'Admin',
};
const ROLE_COLORS = {
  student: 'var(--info)',
  instructor: 'var(--warning)',
  employer: '#c4b5fd',
  admin: 'var(--error)',
};

export default function StatisticsSection() {
  const { users, projects, courses, employers, internships } = useAppData();
  const totalUsers = users.length;
  const totalProjects = projects.length;
  const totalCourses = courses.length;
  const totalInternships = internships.length;
  const totalEmployers = employers.length;

  const roleCounts = useMemo(
    () => ROLES.map(role => ({
      role,
      label: ROLE_LABELS[role],
      color: ROLE_COLORS[role],
      count: users.filter(u => u.role === role).length,
    })),
    [users]
  );

  const projectStatus = useMemo(() => {
    const flagged = projects.filter(p => p.flagged).length;
    const active = projects.filter(p => !p.flagged && p.status === 'Active').length;
    const inactive = projects.filter(p => !p.flagged && p.status !== 'Active').length;
    return [
      { label: 'Active',   count: active,   color: 'var(--success)' },
      { label: 'Inactive', count: inactive, color: 'var(--text-secondary)' },
      { label: 'Flagged',  count: flagged,  color: 'var(--warning)' },
    ];
  }, [projects]);

  const employerStatus = useMemo(() => [
    { label: 'Pending',  count: employers.filter(e => e.status === 'pending').length,  color: 'var(--warning)' },
    { label: 'Accepted', count: employers.filter(e => e.status === 'accepted').length, color: 'var(--success)' },
    { label: 'Rejected', count: employers.filter(e => e.status === 'rejected').length, color: 'var(--error)' },
  ], [employers]);

  const internshipStatus = useMemo(() => {
    const open = internships.filter(i => i.status === 'Currently Hiring' && !i.archived).length;
    const closed = internships.filter(i => i.status !== 'Currently Hiring' && !i.archived).length;
    const archived = internships.filter(i => i.archived).length;
    return [
      { label: 'Currently Hiring',     count: open,     color: 'var(--success)' },
      { label: 'Position Filled',   count: closed,   color: 'var(--info)' },
      { label: 'Archived', count: archived, color: 'var(--text-secondary)' },
    ];
  }, [internships]);

  const totalApplicants = useMemo(
    () => internships.reduce((sum, i) => sum + (i.applicants?.length || 0), 0),
    [internships]
  );

  const projectsPerCourse = useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      const key = p.course || 'Unassigned';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const pct = (count, total) =>
    total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`;

  return (
    <div className="ss-root">
      {/* Top KPIs */}
      <section className="ss-group">
        <h3 className="ss-group-title">Platform overview</h3>
        <div className="ss-grid">
          <KpiCard label="Total users"      value={totalUsers}       accent="total" />
          <KpiCard label="Students"         value={roleCounts[0].count} accent="student" />
          <KpiCard label="Instructors"      value={roleCounts[1].count} accent="instructor" />
          <KpiCard label="Employers"        value={totalEmployers}    accent="employer" />
          <KpiCard label="Admins"           value={roleCounts[3].count} accent="admin" />
        </div>
      </section>

      {/* Charts row 1: Users by role + Projects per course */}
      <section className="ss-charts-grid">
        <ChartCard title="Users by role" subtitle={`${totalUsers} total`}>
          <DonutChart
            data={roleCounts.map(r => ({ label: r.label, value: r.count, color: r.color }))}
          />
          <DonutLegend
            data={roleCounts.map(r => ({ label: r.label, value: r.count, color: r.color, total: totalUsers }))}
          />
        </ChartCard>

        <ChartCard title="Projects per course" subtitle={`${totalProjects} total · ${courses.length} courses`}>
          {projectsPerCourse.length === 0 ? (
            <p className="ss-empty">No projects yet.</p>
          ) : (
            <BarChart data={projectsPerCourse} color="var(--info)" />
          )}
        </ChartCard>
      </section>

      {/* Status breakdowns */}
      <section className="ss-charts-grid ss-charts-three">
        <ChartCard title="Project status" subtitle={`${totalProjects} total`}>
          <SegmentedBar segments={projectStatus} />
          <StatusList items={projectStatus} total={totalProjects} pct={pct} />
        </ChartCard>

        <ChartCard title="Employer status" subtitle={`${totalEmployers} total`}>
          <SegmentedBar segments={employerStatus} />
          <StatusList items={employerStatus} total={totalEmployers} pct={pct} />
        </ChartCard>

        <ChartCard title="Internship status" subtitle={`${totalInternships} total · ${totalApplicants} applicants`}>
          <SegmentedBar segments={internshipStatus} />
          <StatusList items={internshipStatus} total={totalInternships} pct={pct} />
        </ChartCard>
      </section>

      {/* Content totals */}
      <section className="ss-group">
        <h3 className="ss-group-title">Content totals</h3>
        <div className="ss-grid ss-grid-content">
          <KpiCard label="Total projects"    value={totalProjects}    accent="projects" />
          <KpiCard label="Total courses"     value={totalCourses}     accent="courses" />
          <KpiCard label="Total internships" value={totalInternships} accent="employer" />
          <KpiCard label="Total applicants"  value={totalApplicants}  accent="instructor" />
        </div>
      </section>

      {/* Role breakdown table */}
      <section className="ss-group">
        <h3 className="ss-group-title">User role breakdown</h3>
        <div className="ss-table-wrapper">
          <table className="ss-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Count</th>
                <th>% of total users</th>
              </tr>
            </thead>
            <tbody>
              {roleCounts.map(r => (
                <tr key={r.role}>
                  <td>
                    <span className={`ss-role-badge ss-role-${r.role}`}>{r.label}</span>
                  </td>
                  <td className="ss-count">{r.count}</td>
                  <td>
                    <div className="ss-pct-cell">
                      <div className="ss-bar-track">
                        <div
                          className={`ss-bar-fill ss-bar-${r.role}`}
                          style={{ width: pct(r.count, totalUsers) }}
                        />
                      </div>
                      <span className="ss-pct-label">{pct(r.count, totalUsers)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="ss-total-label">Total</td>
                <td className="ss-count ss-total-count">{totalUsers}</td>
                <td className="ss-pct-label">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ───── Sub-components ───── */

function KpiCard({ label, value, accent }) {
  return (
    <div className={`ss-card ss-card-${accent}`}>
      <span className="ss-label">{label}</span>
      <span className="ss-number">{value}</span>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="ss-chart-card">
      <header className="ss-chart-head">
        <h4 className="ss-chart-title">{title}</h4>
        {subtitle && <span className="ss-chart-sub">{subtitle}</span>}
      </header>
      <div className="ss-chart-body">{children}</div>
    </div>
  );
}

/* SVG donut chart */
function DonutChart({ data, size = 160, thickness = 24 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ss-donut">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={thickness}
        />
        <text x="50%" y="50%" dy="0.35em" textAnchor="middle" className="ss-donut-empty-text">
          No data
        </text>
      </svg>
    );
  }

  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ss-donut">
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={thickness}
      />
      {data.map((d, idx) => {
        if (d.value === 0) return null;
        const length = (d.value / total) * circumference;
        const dasharray = `${length} ${circumference - length}`;
        const dashoffset = -offset;
        offset += length;
        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      <text x="50%" y="46%" dy="0.35em" textAnchor="middle" className="ss-donut-total">
        {total}
      </text>
      <text x="50%" y="60%" dy="0.35em" textAnchor="middle" className="ss-donut-label">
        total
      </text>
    </svg>
  );
}

function DonutLegend({ data }) {
  return (
    <ul className="ss-legend">
      {data.map(d => (
        <li key={d.label} className="ss-legend-item">
          <span className="ss-legend-dot" style={{ background: d.color }} />
          <span className="ss-legend-label">{d.label}</span>
          <span className="ss-legend-value">
            {d.value} <span className="ss-legend-pct">
              ({d.total === 0 ? 0 : Math.round((d.value / d.total) * 100)}%)
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* SVG bar chart (vertical bars) */
function BarChart({ data, color = 'var(--info)' }) {
  const max = Math.max(1, ...data.map(d => d.count));
  const chartHeight = 160;
  const gap = 12;
  // We use percentage widths so the SVG is responsive.
  return (
    <div className="ss-bar-chart">
      <ul className="ss-bar-list" style={{ height: chartHeight, gap }}>
        {data.map((d, idx) => {
          const heightPct = (d.count / max) * 100;
          return (
            <li key={idx} className="ss-bar-item">
              <span className="ss-bar-value">{d.count}</span>
              <div className="ss-bar-track-v">
                <div
                  className="ss-bar-fill-v"
                  style={{ height: `${heightPct}%`, background: color }}
                />
              </div>
              <span className="ss-bar-label" title={d.label}>{d.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Single segmented bar (proportional) */
function SegmentedBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) {
    return <div className="ss-segbar"><div className="ss-segbar-empty">No data</div></div>;
  }
  return (
    <div className="ss-segbar">
      {segments.map((s, idx) => {
        if (s.count === 0) return null;
        const w = (s.count / total) * 100;
        return (
          <div
            key={idx}
            className="ss-segbar-piece"
            style={{ width: `${w}%`, background: s.color }}
            title={`${s.label}: ${s.count}`}
          />
        );
      })}
    </div>
  );
}

function StatusList({ items, total, pct }) {
  return (
    <ul className="ss-status-list">
      {items.map(s => (
        <li key={s.label}>
          <span className="ss-status-dot" style={{ background: s.color }} />
          <span className="ss-status-label">{s.label}</span>
          <span className="ss-status-value">{s.count}</span>
          <span className="ss-status-pct">{pct(s.count, total)}</span>
        </li>
      ))}
    </ul>
  );
}
