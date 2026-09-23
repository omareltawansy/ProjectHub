import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppDataProvider, useAppData } from '../data/useAppData';
import { ToastProvider } from '../components/Toast/Toast';
import Dialog from '../components/Dialog/Dialog';
import { isNotificationRead, withReadState } from '../utils/notifications';
import InstructorDashboard from '../pages/Dashboards/InstructorDashboard/InstructorDashboard';

beforeEach(() => localStorage.clear());

describe('broadcast notifications', () => {
  const users = [
    { email: 'a@x.com', role: 'student' },
    { email: 'b@x.com', role: 'student' },
  ];
  const a = users[0];
  const b = users[1];

  it('tracks read state per user', () => {
    let n = { id: 1, role: 'student', read: false, readBy: [] };
    n = withReadState(n, a, true, users);
    expect(isNotificationRead(n, a)).toBe(true);
    expect(isNotificationRead(n, b)).toBe(false);
  });

  it('migrates a legacy shared "read" flag without losing it for others', () => {
    let n = { id: 1, role: 'student', read: true };
    n = withReadState(n, a, false, users);
    expect(isNotificationRead(n, a)).toBe(false);
    expect(isNotificationRead(n, b)).toBe(true);
  });

  it('keeps targeted notifications on their single flag', () => {
    const n = withReadState({ id: 2, role: 'student', recipientEmail: 'a@x.com', read: false }, a, true, users);
    expect(n.read).toBe(true);
    expect(n.readBy).toBeUndefined();
  });
});

describe('Dialog', () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        {open && (
          <Dialog onClose={() => setOpen(false)}>
            <h2>Edit thing</h2>
            <input aria-label="Name" />
            <button>Save</button>
          </Dialog>
        )}
      </>
    );
  }

  it('is labelled by its heading, focuses the first field, closes on Escape and restores focus', () => {
    render(<Harness />);
    const opener = screen.getByText('Open');
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: 'Edit thing' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByLabelText('Name')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });
});

describe('seed migration', () => {
  it('adds new seed records to older saved data without overwriting user changes', () => {
    localStorage.setItem('appData_storage', JSON.stringify({
      projects: [{ id: 1, title: 'Renamed by user' }],
      projectInvitations: [],
    }));
    let data;
    function Spy() { data = useAppData(); return null; }
    render(<AppDataProvider><Spy /></AppDataProvider>);

    expect(data.projects.find(p => p.id === 1).title).toBe('Renamed by user');
    expect(data.projects.some(p => p.id === 8 && p.course === 'Bachelor')).toBe(true);
    expect(data.projectInvitations.length).toBeGreaterThan(0);
  });
});

describe('instructor invitations', () => {
  it('come from the store and accepting adds the instructor as supervisor', () => {
    const instructor = { id: 5, name: 'Dr. Fatima Ahmed', email: 'instructor1@guc.edu.eg', role: 'instructor' };
    let data;
    function Spy() { data = useAppData(); return null; }
    render(
      <MemoryRouter initialEntries={['/?section=Invitations']}>
        <AppDataProvider>
          <ToastProvider>
            <InstructorDashboard user={instructor} onNavigate={() => {}} />
            <Spy />
          </ToastProvider>
        </AppDataProvider>
      </MemoryRouter>
    );

    // Dr. Fatima has two seeded requests; Dr. Karim's is not shown to her.
    expect(screen.getByText('E-Commerce Platform', { selector: '.id-inv-project' })).toBeInTheDocument();
    expect(screen.queryByText('Real-Time Chat App', { selector: '.id-inv-project' })).toBeNull();

    act(() => { fireEvent.click(screen.getAllByRole('button', { name: /Accept/ })[0]); });

    const project = data.projects.find(p => p.id === 1);
    expect(project.supervisors).toEqual([{ name: instructor.name, email: instructor.email }]);
    expect(data.projectInvitations.some(i => i.id === 1)).toBe(false);
  });
});
