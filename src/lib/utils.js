import { LEVELS } from "./constants.js";

export function levelIndex(level) {
  return LEVELS.indexOf(level);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/\s+/g, "-");
}

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDaysISO(days, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return todayISO(d);
}

export function formatDate(date) {
  if (!date) return "No target date";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Whole days from today until `date` (negative when the date has passed). */
export function daysUntil(date, today = todayISO()) {
  const ms = new Date(`${date}T00:00:00`) - new Date(`${today}T00:00:00`);
  return Math.round(ms / 86400000);
}

export function describeDeadline(date, today = todayISO()) {
  const days = daysUntil(date, today);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `Due in ${days} days`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}

export function timeAgo(timestamp, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * A skill's status is always derived from its data, never stored, so it can't
 * drift out of sync with the progress value or the calendar.
 */
export function getStatus(skill, today = todayISO()) {
  if (skill.progress >= 100) return "Completed";
  if (skill.targetDate && skill.targetDate < today) return "Overdue";
  if (skill.progress === 0) return "Not Started";
  return "In Progress";
}

export function getStats(skills, today = todayISO()) {
  const counts = { Completed: 0, "In Progress": 0, "Not Started": 0, Overdue: 0 };
  let total = 0;
  for (const skill of skills) {
    counts[getStatus(skill, today)] += 1;
    total += skill.progress;
  }
  return {
    total: skills.length,
    completed: counts.Completed,
    inProgress: counts["In Progress"],
    notStarted: counts["Not Started"],
    overdue: counts.Overdue,
    average: skills.length ? Math.round(total / skills.length) : 0,
  };
}

export function getCategoryBreakdown(skills) {
  const groups = new Map();
  for (const skill of skills) {
    const g = groups.get(skill.category) ?? { category: skill.category, count: 0, total: 0 };
    g.count += 1;
    g.total += skill.progress;
    groups.set(skill.category, g);
  }
  return [...groups.values()]
    .map((g) => ({ category: g.category, count: g.count, average: Math.round(g.total / g.count) }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getUpcoming(skills, limit = 3, today = todayISO()) {
  return skills
    .filter((s) => s.targetDate && s.progress < 100)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    .slice(0, limit)
    .map((s) => ({ ...s, daysLeft: daysUntil(s.targetDate, today) }));
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
