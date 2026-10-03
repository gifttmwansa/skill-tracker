import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import "./App.css";
import ActivityPage from "./components/ActivityPage.jsx";
import Modal from "./components/Modal.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import SkillForm from "./components/SkillForm.jsx";
import SkillsPanel from "./components/SkillsPanel.jsx";
import {
  Categories,
  Deadlines,
  OverallProgress,
  RecentActivity,
} from "./components/SummaryCards.jsx";
import { ActivityIcon, HomeIcon, Logo, SettingsIcon, SkillsIcon } from "./components/Icons.jsx";
import { reducer } from "./lib/reducer.js";
import { loadState, saveState } from "./lib/storage.js";
import { getStats, greeting, uid } from "./lib/utils.js";

const PAGES = [
  { id: "Dashboard", Icon: HomeIcon, label: "Dashboard" },
  { id: "My Skills", Icon: SkillsIcon, label: "My Skills" },
  { id: "Activity", Icon: ActivityIcon, label: "Activity" },
  { id: "Settings", Icon: SettingsIcon, label: "Settings" },
];

function pageFromHash() {
  const id = decodeURIComponent(window.location.hash.replace("#/", ""));
  return PAGES.some((p) => p.id === id) ? id : "Dashboard";
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [page, setPage] = useState(pageFromHash);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirm, setConfirm] = useState(null); // "clear-data" | "clear-log" | null
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // Save on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Keep the URL hash and the page in sync so refresh and back/forward work.
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((id) => {
    window.location.hash = `/${encodeURIComponent(id)}`;
    setPage(id);
    window.scrollTo({ top: 0 });
  }, []);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const editing = state.skills.find((s) => s.id === editingId);
  const deleting = state.skills.find((s) => s.id === deletingId);

  function addSkill(values) {
    const now = Date.now();
    dispatch({
      type: "skill/add",
      skill: { ...values, id: uid(), progress: 0, createdAt: now, updatedAt: now },
    });
    notify(`Added ${values.name}`);
  }

  function saveEdit(values) {
    dispatch({ type: "skill/update", id: editingId, changes: values, at: Date.now() });
    setEditingId(null);
    notify(`Saved ${values.name}`);
  }

  function setProgress(id, progress) {
    dispatch({ type: "skill/progress", id, progress, at: Date.now() });
  }

  function confirmDelete() {
    dispatch({ type: "skill/delete", id: deletingId, at: Date.now() });
    notify(`Deleted ${deleting?.name ?? "skill"}`);
    setDeletingId(null);
  }

  function handleSearch(value) {
    setQuery(value);
    if (value && page !== "Dashboard" && page !== "My Skills") go("My Skills");
  }

  const stats = getStats(state.skills);
  const initial = state.name.trim().charAt(0).toUpperCase() || "?";
  const listProps = {
    skills: state.skills,
    query,
    onProgress: setProgress,
    onEdit: setEditingId,
    onDelete: setDeletingId,
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo className="brand-icon" />
          <span>Skill Tracker</span>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {PAGES.map(({ id, Icon, label }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${page === id ? "active" : ""}`}
              aria-current={page === id ? "page" : undefined}
              onClick={() => go(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-summary">
          <span>Overall progress</span>
          <strong>{stats.average}%</strong>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label="Overall progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.average}
          >
            <div className="progress-fill" style={{ width: `${stats.average}%` }} />
          </div>
          <small>
            {stats.completed} of {stats.total} {stats.total === 1 ? "skill" : "skills"} completed
          </small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">Skill Tracker</div>

          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search skills"
              aria-label="Search skills"
            />
          </label>

          <div className="profile">
            <div className="avatar" aria-hidden="true">{initial}</div>
            <strong>{state.name}</strong>
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="hero-section">
              <div>
                <div className="greeting">✦ {greeting()}, {state.name}</div>
                <h1>
                  Skill <span>Tracker</span>
                </h1>
                <p>
                  Set a level you want to reach, then track your progress toward it,
                  one skill at a time.
                </p>
              </div>

              <div className="mountains" aria-hidden="true">
                <div className="sun" />
                <div className="mountain mountain-back" />
                <div className="mountain mountain-front" />
                <div className="flag">⚑</div>
              </div>
            </section>

            <div className="dashboard-layout">
              <div className="dashboard-main">
                <section className="card add-skill-card" aria-labelledby="add-heading">
                  <div className="section-heading">
                    <div className="heading-icon" aria-hidden="true">+</div>
                    <div>
                      <h2 id="add-heading">Add a new skill</h2>
                      <p>Choose where you are now and where you want to get to.</p>
                    </div>
                  </div>
                  <SkillForm
                    existingNames={state.skills.map((s) => s.name)}
                    submitLabel="Add skill"
                    onSubmit={addSkill}
                  />
                </section>

                <SkillsPanel {...listProps} />
              </div>

              <aside className="dashboard-sidebar" aria-label="Summary">
                <OverallProgress skills={state.skills} />
                <Deadlines skills={state.skills} />
                <Categories skills={state.skills} />
                <RecentActivity
                  activity={state.activity}
                  onViewAll={() => go("Activity")}
                />
              </aside>
            </div>
          </>
        )}

        {page === "My Skills" && (
          <>
            <div className="page-title">
              <h1>My skills</h1>
              <p>Search, filter and sort everything you're tracking.</p>
            </div>
            <SkillsPanel {...listProps} full />
          </>
        )}

        {page === "Activity" && (
          <>
            <div className="page-title">
              <h1>Activity</h1>
            </div>
            <ActivityPage
              activity={state.activity}
              onClear={() => setConfirm("clear-log")}
            />
          </>
        )}

        {page === "Settings" && (
          <>
            <div className="page-title">
              <h1>Settings</h1>
            </div>
            <SettingsPage
              state={state}
              dispatch={dispatch}
              notify={notify}
              onRequestClear={() => setConfirm("clear-data")}
            />
          </>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {PAGES.map(({ id, Icon, label }) => (
          <button
            key={id}
            type="button"
            className={page === id ? "active" : ""}
            aria-current={page === id ? "page" : undefined}
            onClick={() => go(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      {editing && (
        <Modal title={`Edit ${editing.name}`} onClose={() => setEditingId(null)}>
          <SkillForm
            initial={editing}
            existingNames={state.skills.filter((s) => s.id !== editing.id).map((s) => s.name)}
            submitLabel="Save changes"
            onSubmit={saveEdit}
            onCancel={() => setEditingId(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete ${deleting.name}?`} onClose={() => setDeletingId(null)}>
          <p className="modal-text">
            This removes the skill and its progress. You can't undo this.
          </p>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setDeletingId(null)}>
              Cancel
            </button>
            <button type="button" className="danger-button" onClick={confirmDelete}>
              Delete skill
            </button>
          </div>
        </Modal>
      )}

      {confirm === "clear-data" && (
        <Modal title="Delete all data?" onClose={() => setConfirm(null)}>
          <p className="modal-text">
            All {state.skills.length} skills and the activity log will be removed from this
            browser. Export a backup first if you might want them back.
          </p>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                dispatch({ type: "data/clear" });
                setConfirm(null);
                notify("All data deleted");
              }}
            >
              Delete everything
            </button>
          </div>
        </Modal>
      )}

      {confirm === "clear-log" && (
        <Modal title="Clear the activity log?" onClose={() => setConfirm(null)}>
          <p className="modal-text">Your skills stay as they are. Only the log is removed.</p>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                dispatch({ type: "activity/clear" });
                setConfirm(null);
              }}
            >
              Clear log
            </button>
          </div>
        </Modal>
      )}

      <div className="toast" role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

export default App;
