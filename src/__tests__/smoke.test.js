import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AppDataProvider } from '../data/useAppData';
import { ToastProvider } from '../components/Toast/Toast';
import appData from '../data/appData';

// Renders every route for every role through the real App, so a crash anywhere
// (bad data shape, missing prop, render-time exception) fails the suite.
const ROLES = {
  student: 'student1@guc.edu.eg',
  instructor: 'instructor1@guc.edu.eg',
  employer: 'employer1@company.com',
  admin: 'admin@guc.edu.eg',
};

const COMMON = [
  '/', '/search', '/notifications', '/messages', '/browse/projects', '/browse/portfolios',
  '/portfolio/view/1', '/instructor-profile/5', '/employer-profile', '/employer-profile/1',
];
const BY_ROLE = {
  student: ['/student-dashboard', '/internships', '/projectview', '/projectviewone/1', '/projectviewone/8',
    '/portfolio', '/alltasks',
    '/student-dashboard?section=Internships', '/student-dashboard?section=Projects', '/student-dashboard?section=Notifications'],
  instructor: ['/instructor-dashboard', '/instructor-dashboard?section=Invitations',
    '/instructor-dashboard?section=Notifications', '/instructor-dashboard?section=Messages'],
  employer: ['/employer-dashboard', '/employer/internships', '/employer-dashboard?section=Notifications'],
  admin: ['/admin-dashboard', ...['Users', 'Employers', 'Courses', 'Projects', 'Portfolios', 'Internships',
    'Statistics', 'Messages', 'Notifications'].map(s => `/admin-dashboard?section=${s}`)],
};

let errorSpy;
beforeEach(() => {
  localStorage.clear();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errorSpy.mockRestore());

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppDataProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppDataProvider>
    </MemoryRouter>
  );
}

describe.each(Object.entries(ROLES))('%s', (role, email) => {
  const user = appData.users.find(u => u.email === email);
  const { password, ...safeUser } = user;

  it.each([...COMMON, ...BY_ROLE[role]])('renders %s', (path) => {
    localStorage.setItem('currentUser', JSON.stringify(safeUser));
    const { unmount } = renderAt(path);
    // The error boundary's fallback means something threw during render.
    expect(screen.queryByText('Something went wrong')).toBeNull();
    const crashes = errorSpy.mock.calls.filter(args =>
      String(args[0]).includes('Unhandled render error') || String(args[0]).includes('The above error occurred'));
    expect(crashes).toEqual([]);
    unmount();
  });
});

describe('logged out', () => {
  it.each(['/login', '/register', '/forgot-password', '/student-dashboard'])('renders %s', (path) => {
    renderAt(path);
    expect(screen.getByText('ProjectHub')).toBeInTheDocument();
  });
});
