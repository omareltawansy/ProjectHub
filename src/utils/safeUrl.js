// Only allow http(s) links to be rendered as href — blocks javascript:/data: URI injection
// from free-text link fields (GitHub link, report link, employer website, etc).
// Bare domains like "github.com/me" get https:// prepended, otherwise the browser
// would treat them as a relative path inside the app.
export function safeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return '';
  }
  return '';
}
