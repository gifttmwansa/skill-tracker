import { MAX_ACTIVITY } from "./constants.js";
import { clamp, uid } from "./utils.js";
import { freshState } from "./storage.js";

function log(activity, title, detail, at) {
  return [{ id: uid(), title, detail, at }, ...activity].slice(0, MAX_ACTIVITY);
}

function describe(skill) {
  return `${skill.category}, ${skill.currentLevel} to ${skill.targetLevel}`;
}

/**
 * All state changes go through here. Timestamps and ids are created by the
 * caller and passed in the action, which keeps the reducer pure and testable.
 */
export function reducer(state, action) {
  switch (action.type) {
    case "skill/add": {
      const { skill } = action;
      return {
        ...state,
        skills: [skill, ...state.skills],
        activity: log(state.activity, `Added ${skill.name}`, describe(skill), skill.createdAt),
      };
    }

    case "skill/update": {
      const prev = state.skills.find((s) => s.id === action.id);
      if (!prev) return state;
      const next = { ...prev, ...action.changes, updatedAt: action.at };
      next.progress = clamp(Math.round(Number(next.progress)) || 0, 0, 100);

      let activity = log(state.activity, `Updated ${next.name}`, describe(next), action.at);
      if (prev.progress < 100 && next.progress === 100) {
        activity = log(activity, `Completed ${next.name}`, `Reached ${next.targetLevel}`, action.at);
      }
      return {
        ...state,
        skills: state.skills.map((s) => (s.id === action.id ? next : s)),
        activity,
      };
    }

    case "skill/progress": {
      const prev = state.skills.find((s) => s.id === action.id);
      if (!prev) return state;
      const progress = clamp(Math.round(action.progress), 0, 100);
      if (progress === prev.progress) return state;

      const title =
        progress === 100 ? `Completed ${prev.name}` : `Progress on ${prev.name}`;
      const detail =
        progress === 100
          ? `Reached ${prev.targetLevel}`
          : `${prev.progress}% to ${progress}%`;
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.id === action.id ? { ...s, progress, updatedAt: action.at } : s,
        ),
        activity: log(state.activity, title, detail, action.at),
      };
    }

    case "skill/delete": {
      const prev = state.skills.find((s) => s.id === action.id);
      if (!prev) return state;
      return {
        ...state,
        skills: state.skills.filter((s) => s.id !== action.id),
        activity: log(state.activity, `Deleted ${prev.name}`, prev.category, action.at),
      };
    }

    case "name/set":
      return { ...state, name: action.name };

    case "activity/clear":
      return { ...state, activity: [] };

    case "data/import":
      return {
        name: action.data.name ?? state.name,
        skills: action.data.skills,
        activity: log(
          action.data.activity,
          "Imported data",
          `${action.data.skills.length} skills`,
          action.at,
        ),
      };

    case "data/sample":
      return freshState();

    case "data/clear":
      return { ...state, skills: [], activity: [] };

    default:
      return state;
  }
}
