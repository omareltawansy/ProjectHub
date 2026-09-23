import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppDataProvider, useAppData } from '../data/useAppData';
import { ToastProvider } from '../components/Toast/Toast';
import Login from '../pages/Auth/Login/Login';
import Internships from '../pages/Internships/Internships';

function wrap(ui) {
  return render(
    <MemoryRouter>
      <AppDataProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AppDataProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('login', () => {
  it('rejects a deactivated account', () => {
    wrap(<Login navigateTo={() => {}} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'student3@guc.edu.eg' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/deactivated/i);
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});

describe('internship applications', () => {
  const student = { id: 4, name: 'Layla Mohamed', email: 'student4@guc.edu.eg', role: 'student' };
  let snapshot;
  function Spy() {
    snapshot = useAppData();
    return null;
  }

  it('opens the confirm dialog and records a per-student application', () => {
    wrap(<><Internships user={student} onNavigate={() => {}} /><Spy /></>);

    const before = snapshot.internships.find(i => i.id === 1);
    expect(before.status).toBe('Currently Hiring');

    // Select the Vodafone listing and apply.
    fireEvent.click(screen.getAllByText('Frontend Developer Intern')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Apply for internship' }));

    // The dialog must actually render now.
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Apply for this internship?');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Yes, apply' }));
    });

    const after = snapshot.internships.find(i => i.id === 1);
    // Listing status is untouched for everyone else...
    expect(after.status).toBe('Currently Hiring');
    // ...and the application is recorded against this student.
    expect(after.applicants.some(a => a.email === student.email && a.status === 'Applied')).toBe(true);
  });
});
