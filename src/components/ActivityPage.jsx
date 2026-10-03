import { timeAgo } from "../lib/utils.js";

export default function ActivityPage({ activity, onClear }) {
  return (
    <section className="card page-card" aria-labelledby="activity-page-heading">
      <div className="page-card-header">
        <div>
          <h2 id="activity-page-heading">Activity log</h2>
          <p>Everything you've added, updated and completed, newest first.</p>
        </div>
        {activity.length > 0 && (
          <button type="button" className="secondary-button" onClick={onClear}>
            Clear log
          </button>
        )}
      </div>

      {activity.length === 0 ? (
        <div className="empty-state">
          <div aria-hidden="true">ϟ</div>
          <h3>Nothing here yet</h3>
          <p>Add or update a skill and it will be logged here.</p>
        </div>
      ) : (
        <ol className="activity-full">
          {activity.map((entry) => (
            <li key={entry.id}>
              <span aria-hidden="true" />
              <div>
                <strong>{entry.title}</strong>
                {entry.detail && <small>{entry.detail}</small>}
              </div>
              <time dateTime={new Date(entry.at).toISOString()}>
                {timeAgo(entry.at)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
