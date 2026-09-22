// Only allow http(s) links to be rendered as href — blocks javascript:/data: URI injection
// from free-text link fields (GitHub link, report link, employer website, etc).
export function safeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    return '';
  }
  return '';
}
