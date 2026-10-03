export const CATEGORIES = [
  "Frontend Web",
  "Backend",
  "Mobile Development",
  "AI / Machine Learning",
  "CyberSecurity",
  "QA",
  "Product Management",
  "IoT",
  "Design",
  "Dev Tools",
];

// Ordered from lowest to highest. The order matters: it is used to make sure
// a target level is never lower than the current level.
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const STATUSES = ["In Progress", "Not Started", "Completed", "Overdue"];

export const STORAGE_KEY = "skill-tracker:v2";
export const LEGACY_STORAGE_KEY = "skill-tracker-skills";

// Shown until the user sets their own name in Settings.
export const DEFAULT_NAME = "Learner";

export const MAX_ACTIVITY = 100;
