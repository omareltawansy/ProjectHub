const pad = (n) => String(n).padStart(2, '0');

// Local-time stamp in the app's 'YYYY-MM-DD HH:MM' message format.
// (toISOString() is UTC, which shifted every displayed time by the timezone offset.)
export function nowStamp(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Local-time 'YYYY-MM-DD'.
export function todayISO(date = new Date()) {
  return nowStamp(date).slice(0, 10);
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Parse the app's mixed date strings ('2025-05-20', 'May 20', 'May 20, 2025')
// into a timestamp, without relying on engine-specific Date string parsing.
// Returns NaN when the value can't be understood.
export function parseLooseDate(value) {
  if (!value) return NaN;
  const str = String(value).trim();
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]).getTime();
  const md = str.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/);
  if (md) {
    const month = MONTHS.indexOf(md[1].toLowerCase());
    if (month === -1) return NaN;
    const year = md[3] ? +md[3] : new Date().getFullYear();
    return new Date(year, month, +md[2]).getTime();
  }
  return NaN;
}

// Human-readable short date, e.g. 'May 20, 2025'. Falls back to the raw value.
export function formatDate(value) {
  const t = parseLooseDate(value);
  if (Number.isNaN(t)) return value || '';
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
