import { useId, useRef, useState } from "react";
import { buildExport, parseImport } from "../lib/storage.js";

export default function SettingsPage({ state, dispatch, notify, onRequestClear }) {
  const nameId = useId();
  const fileRef = useRef(null);
  const [name, setName] = useState(state.name);
  const [importError, setImportError] = useState("");

  function saveName(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: "name/set", name: trimmed });
    notify("Name saved");
  }

  function exportData() {
    const blob = new Blob([buildExport(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skill-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Data exported");
  }

  async function importData(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = parseImport(await file.text());
      dispatch({ type: "data/import", data, at: Date.now() });
      setImportError("");
      notify(`Imported ${data.skills.length} skills`);
    } catch (err) {
      setImportError(err.message);
    }
  }

  return (
    <div className="settings">
      <section className="card page-card">
        <h2>Profile</h2>
        <p>The name shown in your greeting and avatar.</p>
        <form className="inline-form" onSubmit={saveName}>
          <div className="field">
            <label htmlFor={nameId}>Display name</label>
            <input
              id={nameId}
              type="text"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button className="add-button" type="submit" disabled={!name.trim()}>
            Save name
          </button>
        </form>
      </section>

      <section className="card page-card">
        <h2>Your data</h2>
        <p>
          Skills are saved in this browser only. Export a backup to move them to another
          device or keep a copy.
        </p>
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={exportData}>
            Export as JSON
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => fileRef.current?.click()}
          >
            Import from JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={importData}
          />
        </div>
        <p className="form-error" role="alert">
          {importError}
        </p>
      </section>

      <section className="card page-card">
        <h2>Reset</h2>
        <p>Importing, loading the examples or deleting everything replaces your current skills.</p>
        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              dispatch({ type: "data/sample" });
              notify("Sample skills loaded");
            }}
          >
            Load sample skills
          </button>
          <button type="button" className="danger-button" onClick={onRequestClear}>
            Delete all data
          </button>
        </div>
      </section>
    </div>
  );
}
