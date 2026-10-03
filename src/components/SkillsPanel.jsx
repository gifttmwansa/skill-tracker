import { useMemo, useState } from "react";
import { CATEGORIES, STATUSES } from "../lib/constants.js";
import { getStatus } from "../lib/utils.js";
import SkillRow from "./SkillRow.jsx";

const SORTS = {
  newest: "Newest first",
  name: "Name (A to Z)",
  progress: "Progress (high to low)",
  date: "Target date (soonest)",
};

function sortSkills(list, sort) {
  const copy = [...list];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "progress":
      return copy.sort((a, b) => b.progress - a.progress);
    case "date":
      return copy.sort((a, b) => {
        if (!a.targetDate && !b.targetDate) return 0;
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return a.targetDate.localeCompare(b.targetDate);
      });
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * Lists skills with filters. `full` adds category filter and sorting, used on
 * the My Skills page. The dashboard shows the compact version.
 */
export default function SkillsPanel({
  skills,
  query,
  full = false,
  onProgress,
  onEdit,
  onDelete,
}) {
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const usedCategories = useMemo(
    () => [...new Set([...CATEGORIES, ...skills.map((s) => s.category)])],
    [skills],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = skills.filter((skill) => {
      if (status !== "All" && getStatus(skill) !== status) return false;
      if (category !== "All" && skill.category !== category) return false;
      if (q && !`${skill.name} ${skill.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return sortSkills(filtered, sort);
  }, [skills, query, status, category, sort]);

  const filtering = status !== "All" || category !== "All" || query.trim() !== "";

  function clearFilters() {
    setStatus("All");
    setCategory("All");
  }

  return (
    <section className="card skills-card" aria-labelledby="skills-heading">
      <div className="skills-header">
        <div className="section-heading">
          <div className="heading-icon small" aria-hidden="true">▱</div>
          <div>
            <h2 id="skills-heading">Your skills</h2>
            <p>
              {visible.length} of {skills.length} shown
            </p>
          </div>
        </div>

        <div className="skills-controls">
          <select
            className="filter-select"
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {full && (
            <>
              <select
                className="filter-select"
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All categories</option>
                {usedCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                className="filter-select"
                aria-label="Sort skills"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="skill-list">
        {visible.length === 0 ? (
          <div className="empty-state">
            <div aria-hidden="true">✦</div>
            {skills.length === 0 ? (
              <>
                <h3>No skills yet</h3>
                <p>Add your first skill to start tracking your progress.</p>
              </>
            ) : (
              <>
                <h3>No skills match</h3>
                <p>Try a different search or filter.</p>
                {filtering && (
                  <button type="button" className="secondary-button" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          visible.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              onProgress={onProgress}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
