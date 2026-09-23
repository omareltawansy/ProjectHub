const lower = (s) => (s || '').toLowerCase();

// Notifications a user should see: their role (or all roles), and either
// broadcast or addressed to them.
export function notificationsFor(notifications, user) {
  if (!user) return [];
  return (notifications || []).filter(n =>
    (n.role === 'multi' || n.role === user.role) &&
    (!n.recipientEmail || lower(n.recipientEmail) === lower(user.email))
  );
}

// Targeted notifications have one reader, so a single `read` flag is enough.
// Broadcasts track readers individually in `readBy`; older data without it
// falls back to the legacy shared flag.
export function isNotificationRead(n, user) {
  if (n.recipientEmail || !Array.isArray(n.readBy)) return !!n.read;
  return n.readBy.map(lower).includes(lower(user?.email));
}

// Returns the notification with `user`'s read state set to `read`.
// `allUsers` is used to migrate a legacy shared flag into per-user state.
export function withReadState(n, user, read, allUsers = []) {
  if (n.recipientEmail) return { ...n, read };
  const email = lower(user?.email);
  const base = Array.isArray(n.readBy)
    ? n.readBy.map(lower)
    : (n.read
        ? allUsers.filter(u => n.role === 'multi' || u.role === n.role).map(u => lower(u.email))
        : []);
  const readBy = read ? [...new Set([...base, email])] : base.filter(e => e !== email);
  return { ...n, readBy };
}
