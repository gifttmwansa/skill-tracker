import { describeDeadline, getCategoryBreakdown, getStats, getUpcoming, timeAgo } from "../lib/utils.js";

export function OverallProgress({ skills }) {
  const stats = getStats(skills);
  return (
    <section className="card overall-card" aria-labelledby="overall-heading">
      <div className="side-heading">
        <div className="side-icon" aria-hidden="true">◎</div>
        <div>
          <h3 id="overall-heading">Overall progress</h3>
          <p>
            {stats.total === 0
              ? "Add a skill to see your progress."
              : `Average across ${stats.total} ${stats.total === 1 ? "skill" : "skills"}`}
          </p>
        </div>
      </div>

      <div className="progress-summary">
        <div
          className="progress-circle"
          role="img"
          aria-label={`${stats.average}% overall progress`}
          style={{ "--progress": `${stats.average * 3.6}deg` }}
        >
          <div>
            <strong>{stats.average}%</strong>
            <span>overall</span>
          </div>
        </div>

        <div className="legend">
          <div>
            <i className="green-dot" />
            Completed
            <strong>{stats.completed}</strong>
          </div>
          <div>
            <i className="blue-dot" />
            In progress
            <strong>{stats.inProgress}</strong>
          </div>
          <div>
            <i className="gray-dot" />
            Not started
            <strong>{stats.notStarted}</strong>
          </div>
          <div>
            <i className="orange-dot" />
            Overdue
            <strong>{stats.overdue}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Deadlines({ skills }) {
  const upcoming = getUpcoming(skills);
  return (
    <section className="card" aria-labelledby="deadlines-heading">
      <div className="side-heading">
        <div className="side-icon" aria-hidden="true">▣</div>
        <h3 id="deadlines-heading">Next deadlines</h3>
      </div>

      {upcoming.length === 0 ? (
        <p className="side-empty">Skills with a target date will show up here.</p>
      ) : (
        <ul className="deadline-list">
          {upcoming.map((skill) => (
            <li key={skill.id}>
              <div>
                <strong>{skill.name}</strong>
                <small>{skill.progress}% complete</small>
              </div>
              <span className={skill.daysLeft < 0 ? "late" : ""}>
                {describeDeadline(skill.targetDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Categories({ skills }) {
  const groups = getCategoryBreakdown(skills);
  return (
    <section className="card" aria-labelledby="categories-heading">
      <div className="side-heading">
        <div className="side-icon" aria-hidden="true">▥</div>
        <h3 id="categories-heading">By category</h3>
      </div>

      {groups.length === 0 ? (
        <p className="side-empty">Categories appear as you add skills.</p>
      ) : (
        <ul className="category-list">
          {groups.map((g) => (
            <li key={g.category}>
              <div className="category-label">
                <span>{g.category}</span>
                <small>
                  {g.count} {g.count === 1 ? "skill" : "skills"}, {g.average}% avg
                </small>
              </div>
              <div className="progress-bar" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${g.average}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function RecentActivity({ activity, limit = 4, onViewAll }) {
  const items = activity.slice(0, limit);
  return (
    <section className="card activity-card" aria-labelledby="activity-heading">
      <div className="side-heading">
        <div className="side-icon" aria-hidden="true">ϟ</div>
        <h3 id="activity-heading">Recent activity</h3>
        {onViewAll && activity.length > 0 && (
          <button type="button" className="link-button" onClick={onViewAll}>
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="side-empty">Changes you make will be listed here.</p>
      ) : (
        items.map((entry) => (
          <div className="activity" key={entry.id}>
            <span aria-hidden="true" />
            <div>
              <strong>{entry.title}</strong>
              {entry.detail && <small>{entry.detail}</small>}
            </div>
            <time dateTime={new Date(entry.at).toISOString()}>{timeAgo(entry.at)}</time>
          </div>
        ))
      )}
    </section>
  );
}
