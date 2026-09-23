const same = (a, b) => (a || '').toLowerCase() === (b || '').toLowerCase();

// Messages are addressed to a specific person. Newer messages carry emails;
// seed data only has name + role, so fall back to matching both.
export function isSender(m, user) {
  if (!user) return false;
  return m.senderEmail ? same(m.senderEmail, user.email) : (m.sender === user.name && m.senderRole === user.role);
}

export function isRecipient(m, user) {
  if (!user) return false;
  return m.recipientEmail ? same(m.recipientEmail, user.email) : (m.recipient === user.name && m.recipientRole === user.role);
}

export function involvesUser(m, user) {
  return isSender(m, user) || isRecipient(m, user);
}
