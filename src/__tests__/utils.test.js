import { safeUrl } from '../utils/safeUrl';
import { parseLooseDate, nowStamp } from '../utils/time';
import { isProjectMember, isProjectOwner } from '../utils/ownership';
import { involvesUser } from '../utils/messages';
import { studentInternshipView } from '../utils/internships';

describe('safeUrl', () => {
  it('blocks script and data URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,hi')).toBe('');
  });
  it('adds https:// to bare domains instead of producing a relative link', () => {
    expect(safeUrl('github.com/me')).toBe('https://github.com/me');
  });
});

describe('time helpers', () => {
  it('stamps in local time, not UTC', () => {
    expect(nowStamp(new Date(2025, 4, 7, 23, 5))).toBe('2025-05-07 23:05');
  });
  it('parses the app date formats consistently', () => {
    expect(parseLooseDate('2025-05-20')).toBe(new Date(2025, 4, 20).getTime());
    expect(parseLooseDate('May 20, 2025')).toBe(new Date(2025, 4, 20).getTime());
    expect(Number.isNaN(parseLooseDate('someday'))).toBe(true);
  });
});

describe('ownership', () => {
  const owner = { email: 'a@x.com' };
  const collab = { email: 'b@x.com' };
  const stranger = { email: 'c@x.com' };
  const project = {
    studentEmail: 'a@x.com',
    collaborators: [{ email: 'b@x.com', status: 'Accepted' }],
  };
  it('recognizes owners and collaborators only', () => {
    expect(isProjectMember(project, owner)).toBe(true);
    expect(isProjectMember(project, collab)).toBe(true);
    expect(isProjectMember(project, stranger)).toBe(false);
    expect(isProjectOwner(project, collab)).toBe(false);
  });
});

describe('messages', () => {
  const msg = { sender: 'John', senderRole: 'employer', recipient: 'Ahmed', recipientRole: 'student' };
  it('scopes seed messages by person, not just role', () => {
    expect(involvesUser(msg, { name: 'Ahmed', role: 'student' })).toBe(true);
    expect(involvesUser(msg, { name: 'Sara', role: 'student' })).toBe(false);
  });
});

describe('internship view', () => {
  const internship = {
    status: 'Currently Hiring',
    applicants: [{ email: 'a@x.com', status: 'Interview' }],
  };
  it("shows each student their own application status", () => {
    expect(studentInternshipView(internship, { email: 'a@x.com' }).status).toBe('Interview');
    expect(studentInternshipView(internship, { email: 'b@x.com' }).status).toBe('Currently Hiring');
  });
});
