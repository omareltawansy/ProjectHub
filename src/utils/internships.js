// Internship `status` is the *listing's* state (e.g. 'Currently Hiring', 'Position Filled').
// A student's application lives in `applicants`. This merges the two into what
// a given student should see, without ever writing the merged shape back.
export function findApplication(internship, user) {
  if (!user?.email) return null;
  const email = user.email.toLowerCase();
  return (internship.applicants || []).find(a => (a.email || '').toLowerCase() === email) || null;
}

export function studentInternshipView(internship, user) {
  const application = findApplication(internship, user);
  if (!application) {
    return { ...internship, listingStatus: internship.status, appliedDate: undefined, interviewDate: undefined };
  }
  return {
    ...internship,
    listingStatus: internship.status,
    status: application.status || 'Applied',
    appliedDate: application.appliedDate,
    interviewDate: application.interviewDate,
  };
}
