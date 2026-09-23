// A user "has" a project if they own it or are an accepted collaborator on it.
export function isProjectMember(project, user) {
  if (!project || !user?.email) return false;
  const email = user.email.toLowerCase();
  if ((project.studentEmail || '').toLowerCase() === email) return true;
  return (project.collaborators || []).some(
    c => (c.email || '').toLowerCase() === email && (c.status || 'Accepted') === 'Accepted'
  );
}

export function isProjectOwner(project, user) {
  if (!project || !user?.email) return false;
  return (project.studentEmail || '').toLowerCase() === user.email.toLowerCase();
}
