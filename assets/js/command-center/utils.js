export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function round(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date = new Date()) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

export function startOfWeek(date = new Date()) {
  const clone = startOfDay(date);
  const day = clone.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  return clone;
}

export function getIsoWeekKey(date = new Date()) {
  const clone = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = clone.getUTCDay() || 7;
  clone.setUTCDate(clone.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(clone.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((clone - yearStart) / 86400000) + 1) / 7);
  return `${clone.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function hashString(input) {
  return Array.from(input).reduce((hash, char) => {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    return hash | 0;
  }, 0);
}

export function seededSelection(items, count, seed) {
  const pool = [...items];
  const selected = [];
  let cursor = Math.abs(hashString(seed));

  while (pool.length > 0 && selected.length < count) {
    const index = cursor % pool.length;
    selected.push(pool.splice(index, 1)[0]);
    cursor = Math.floor(cursor / 3) + 17;
  }

  return selected;
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function daysBetween(start, end) {
  const ms = startOfDay(end) - startOfDay(start);
  return Math.round(ms / 86400000);
}
