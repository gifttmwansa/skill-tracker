import { formatDate, getStatus, slugify } from "../lib/utils.js";

const STEP = 10;

export default function SkillRow({ skill, onProgress, onEdit, onDelete }) {
  const status = getStatus(skill);

  return (
    <article className="skill-row">
      <div className="skill-symbol" aria-hidden="true">
        {skill.name.charAt(0).toUpperCase()}
      </div>

      <div className="skill-info">
        <strong title={skill.name}>{skill.name}</strong>
        <div className="skill-meta">
          <span>{skill.category}</span>
          <span className="level-path">
            <i className={`level-badge ${slugify(skill.currentLevel)}`}>
              {skill.currentLevel}
            </i>
            <span aria-label="to">→</span>
            <i className={`level-badge ${slugify(skill.targetLevel)}`}>
              {skill.targetLevel}
            </i>
          </span>
          <span className="target-date">▣ {formatDate(skill.targetDate)}</span>
        </div>
      </div>

      <div className="skill-side">
        <span className={`status-badge ${slugify(status)}`}>{status}</span>
        <div className="skill-actions">
          <button
            type="button"
            aria-label={`Decrease progress for ${skill.name}`}
            title="Decrease progress"
            disabled={skill.progress <= 0}
            onClick={() => onProgress(skill.id, skill.progress - STEP)}
          >
            −
          </button>
          <button
            type="button"
            aria-label={`Increase progress for ${skill.name}`}
            title="Increase progress"
            disabled={skill.progress >= 100}
            onClick={() => onProgress(skill.id, skill.progress + STEP)}
          >
            +
          </button>
          <button
            type="button"
            aria-label={`Edit ${skill.name}`}
            title="Edit skill"
            onClick={() => onEdit(skill.id)}
          >
            ✎
          </button>
          <button
            type="button"
            className="danger"
            aria-label={`Delete ${skill.name}`}
            title="Delete skill"
            onClick={() => onDelete(skill.id)}
          >
            ×
          </button>
        </div>
      </div>

      <div className="progress-container">
        <div
          className="progress-bar"
          role="progressbar"
          aria-label={`${skill.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={skill.progress}
        >
          <div
            className={`progress-fill ${status === "Completed" ? "done" : ""}`}
            style={{ width: `${skill.progress}%` }}
          />
        </div>
        <span>{skill.progress}%</span>
      </div>
    </article>
  );
}
