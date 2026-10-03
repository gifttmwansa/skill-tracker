import {
  CATEGORIES,
  DEFAULT_NAME,
  LEGACY_STORAGE_KEY,
  LEVELS,
  MAX_ACTIVITY,
  STORAGE_KEY,
} from "./constants.js";
import { addDaysISO, clamp, levelIndex, uid } from "./utils.js";

const squash = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");

/** Maps "AI/Machine Learning" and similar spellings onto the standard category. */
function canonicalCategory(value) {
  const text = String(value || "").trim();
  if (!text) return CATEGORIES[0];
  return CATEGORIES.find((c) => squash(c) === squash(text)) ?? text;
}

/** Turns any skill-like object (old format, imported file) into a valid skill. */
export function normalizeSkill(raw) {
  if (!raw || typeof raw !== "object") return null;

  const name = String(raw.name ?? "").trim();
  if (!name) return null;

  const currentLevel = LEVELS.includes(raw.currentLevel)
    ? raw.currentLevel
    : LEVELS.includes(raw.level) // v1 stored a single "level"
      ? raw.level
      : LEVELS[0];

  let targetLevel = LEVELS.includes(raw.targetLevel)
    ? raw.targetLevel
    : LEVELS[Math.min(levelIndex(currentLevel) + 1, LEVELS.length - 1)];
  if (levelIndex(targetLevel) < levelIndex(currentLevel)) targetLevel = currentLevel;

  const now = Date.now();
  return {
    id: String(raw.id ?? uid()),
    name,
    category: canonicalCategory(raw.category),
    currentLevel,
    targetLevel,
    targetDate: typeof raw.targetDate === "string" ? raw.targetDate : "",
    progress: clamp(Math.round(Number(raw.progress)) || 0, 0, 100),
    createdAt: Number(raw.createdAt) || now,
    updatedAt: Number(raw.updatedAt) || now,
  };
}

function normalizeSkills(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const skills = [];
  for (const item of list) {
    const skill = normalizeSkill(item);
    if (!skill) continue;
    while (seen.has(skill.id)) skill.id = uid();
    seen.add(skill.id);
    skills.push(skill);
  }
  return skills;
}

function normalizeActivity(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((e) => e && typeof e.title === "string")
    .map((e) => ({
      id: String(e.id ?? uid()),
      title: e.title,
      detail: typeof e.detail === "string" ? e.detail : "",
      at: Number(e.at) || Date.now(),
    }))
    .slice(0, MAX_ACTIVITY);
}

/** Validates the contents of an exported JSON file. Throws on bad input. */
export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const list = Array.isArray(data) ? data : data?.skills;
  if (!Array.isArray(list)) {
    throw new Error("No skills found in that file.");
  }
  const skills = normalizeSkills(list);
  if (skills.length === 0 && list.length > 0) {
    throw new Error("None of the skills in that file could be read.");
  }
  return {
    skills,
    activity: normalizeActivity(data?.activity),
    name: typeof data?.name === "string" && data.name.trim() ? data.name.trim() : null,
  };
}

export function buildExport(state) {
  return JSON.stringify(
    {
      app: "skill-tracker",
      version: 2,
      exportedAt: new Date().toISOString(),
      name: state.name,
      skills: state.skills,
      activity: state.activity,
    },
    null,
    2,
  );
}

/** Example skills with dates relative to today, so they never look overdue. */
export function sampleSkills(now = new Date()) {
  const t = Date.now();
  const make = (name, category, currentLevel, targetLevel, progress, days) => ({
    id: uid(),
    name,
    category,
    currentLevel,
    targetLevel,
    progress,
    targetDate: addDaysISO(days, now),
    createdAt: t,
    updatedAt: t,
  });
  return [
    make("React", "Frontend Web", "Intermediate", "Advanced", 70, 21),
    make("Python", "Backend", "Beginner", "Intermediate", 40, 35),
    make("UI/UX Design", "Design", "Intermediate", "Advanced", 90, 14),
    make("Git & GitHub", "Dev Tools", "Beginner", "Intermediate", 60, 28),
    make("JavaScript", "Frontend Web", "Intermediate", "Advanced", 30, 45),
    make("Cybersecurity Basics", "CyberSecurity", "Beginner", "Intermediate", 0, 60),
  ];
}

export function freshState() {
  return {
    name: DEFAULT_NAME,
    skills: sampleSkills(),
    activity: [
      {
        id: uid(),
        title: "Loaded sample skills",
        detail: "Edit or delete them, or add your own",
        at: Date.now(),
      },
    ],
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        name: typeof data.name === "string" && data.name.trim() ? data.name : DEFAULT_NAME,
        skills: normalizeSkills(data.skills),
        activity: normalizeActivity(data.activity),
      };
    }

    // Upgrade data saved by the first version of the app.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      return {
        name: DEFAULT_NAME,
        skills: normalizeSkills(JSON.parse(legacy)),
        activity: [],
      };
    }
  } catch {
    // Corrupted or blocked storage: fall through to a fresh start.
  }
  return freshState();
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
