import { useId, useState } from "react";
import { CATEGORIES, LEVELS } from "../lib/constants.js";
import { levelIndex, todayISO } from "../lib/utils.js";

const DEFAULTS = {
  name: "",
  category: CATEGORIES[0],
  currentLevel: LEVELS[0],
  targetLevel: LEVELS[1],
  targetDate: "",
  progress: 0,
};

/**
 * Used both to add a skill (inline on the dashboard) and to edit one (inside
 * a modal). Passing `initial` switches it to edit mode.
 */
export default function SkillForm({
  initial,
  existingNames = [],
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const id = useId();
  const editing = Boolean(initial);
  const [values, setValues] = useState({ ...DEFAULTS, ...initial });
  const [error, setError] = useState("");

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = values.name.trim();

    if (!name) return setError("Enter a skill name.");
    if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      return setError(`"${name}" is already on your list.`);
    }
    if (levelIndex(values.targetLevel) < levelIndex(values.currentLevel)) {
      return setError("Target level can't be lower than your current level.");
    }

    onSubmit({ ...values, name, progress: Number(values.progress) });
    if (!editing) setValues(DEFAULTS);
  }

  return (
    <form onSubmit={handleSubmit} className="skill-form" noValidate>
      <div className="field">
        <label htmlFor={`${id}-name`}>Skill name</label>
        <div className="input-wrapper">
          <span aria-hidden="true">◇</span>
          <input
            id={`${id}-name`}
            type="text"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. React, Python, UI/UX Design"
            maxLength={60}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-category`}>Category</label>
        <select
          id={`${id}-category`}
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
          {!CATEGORIES.includes(values.category) && <option>{values.category}</option>}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-current`}>Current level</label>
        <select
          id={`${id}-current`}
          value={values.currentLevel}
          onChange={(e) => set("currentLevel", e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-target`}>Target level</label>
        <select
          id={`${id}-target`}
          value={values.targetLevel}
          onChange={(e) => set("targetLevel", e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${id}-date`}>Target date (optional)</label>
        <input
          id={`${id}-date`}
          type="date"
          value={values.targetDate}
          min={editing ? undefined : todayISO()}
          onChange={(e) => set("targetDate", e.target.value)}
        />
      </div>

      {editing ? (
        <div className="field">
          <label htmlFor={`${id}-progress`}>
            Progress to target level: <strong>{values.progress}%</strong>
          </label>
          <input
            id={`${id}-progress`}
            className="range"
            type="range"
            min="0"
            max="100"
            step="5"
            value={values.progress}
            onChange={(e) => set("progress", e.target.value)}
          />
        </div>
      ) : (
        <div className="field form-hint">
          <p>You can update progress once the skill is added.</p>
        </div>
      )}

      <p className="form-error" role="alert">
        {error}
      </p>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="add-button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
