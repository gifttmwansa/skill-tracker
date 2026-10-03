import { describe, expect, it } from "vitest";
import { reducer } from "../reducer.js";
import { buildExport, normalizeSkill, parseImport } from "../storage.js";

const base = () => ({ name: "Test", skills: [], activity: [] });

const newSkill = (over = {}) => ({
  id: "s1",
  name: "Python",
  category: "Backend",
  currentLevel: "Beginner",
  targetLevel: "Intermediate",
  targetDate: "",
  progress: 0,
  createdAt: 1,
  updatedAt: 1,
  ...over,
});

describe("reducer", () => {
  it("adds a skill and logs it", () => {
    const state = reducer(base(), { type: "skill/add", skill: newSkill() });
    expect(state.skills).toHaveLength(1);
    expect(state.activity[0].title).toBe("Added Python");
  });

  it("updates progress, clamped to 0-100, and logs only real changes", () => {
    let state = reducer(base(), { type: "skill/add", skill: newSkill() });
    state = reducer(state, { type: "skill/progress", id: "s1", progress: 140, at: 2 });
    expect(state.skills[0].progress).toBe(100);
    expect(state.activity[0].title).toBe("Completed Python");

    const unchanged = reducer(state, { type: "skill/progress", id: "s1", progress: 100, at: 3 });
    expect(unchanged).toBe(state);

    state = reducer(state, { type: "skill/progress", id: "s1", progress: -20, at: 4 });
    expect(state.skills[0].progress).toBe(0);
  });

  it("edits a skill's details", () => {
    let state = reducer(base(), { type: "skill/add", skill: newSkill() });
    state = reducer(state, {
      type: "skill/update",
      id: "s1",
      changes: { name: "Python 3", targetLevel: "Advanced", progress: 55 },
      at: 5,
    });
    expect(state.skills[0]).toMatchObject({
      name: "Python 3",
      targetLevel: "Advanced",
      progress: 55,
      updatedAt: 5,
    });
  });

  it("deletes a skill", () => {
    let state = reducer(base(), { type: "skill/add", skill: newSkill() });
    state = reducer(state, { type: "skill/delete", id: "s1", at: 6 });
    expect(state.skills).toHaveLength(0);
    expect(state.activity[0].title).toBe("Deleted Python");
  });

  it("ignores actions for skills that don't exist", () => {
    const state = base();
    expect(reducer(state, { type: "skill/delete", id: "nope", at: 1 })).toBe(state);
    expect(reducer(state, { type: "skill/progress", id: "nope", progress: 10, at: 1 })).toBe(state);
  });

  it("caps the activity log at 100 entries", () => {
    let state = base();
    for (let i = 0; i < 120; i++) {
      state = reducer(state, { type: "skill/add", skill: newSkill({ id: `s${i}`, name: `S${i}` }) });
    }
    expect(state.activity).toHaveLength(100);
  });
});

describe("normalizeSkill", () => {
  it("upgrades a v1 skill that only had one level", () => {
    const skill = normalizeSkill({
      id: 3,
      name: "UI/UX Design",
      category: "Design",
      level: "Intermediate",
      targetDate: "2026-09-20",
      progress: 90,
      status: "On Track",
    });
    expect(skill).toMatchObject({
      id: "3",
      currentLevel: "Intermediate",
      targetLevel: "Advanced",
      progress: 90,
    });
    expect(skill).not.toHaveProperty("status");
  });

  it("treats differently spelled categories as the same one", () => {
    expect(normalizeSkill({ name: "X", category: "AI/Machine Learning" }).category).toBe(
      "AI / Machine Learning",
    );
    expect(normalizeSkill({ name: "X", category: "my own thing" }).category).toBe("my own thing");
    expect(normalizeSkill({ name: "X" }).category).toBe("Frontend Web");
  });

  it("never lets the target level fall below the current level", () => {
    const skill = normalizeSkill({ name: "X", currentLevel: "Advanced", targetLevel: "Beginner" });
    expect(skill.targetLevel).toBe("Advanced");
  });

  it("rejects skills without a name and clamps bad progress", () => {
    expect(normalizeSkill({ name: "   " })).toBeNull();
    expect(normalizeSkill(null)).toBeNull();
    expect(normalizeSkill({ name: "X", progress: 900 }).progress).toBe(100);
    expect(normalizeSkill({ name: "X", progress: "abc" }).progress).toBe(0);
  });
});

describe("export and import", () => {
  it("round-trips through JSON", () => {
    const state = { name: "Gift", skills: [newSkill()], activity: [] };
    const data = parseImport(buildExport(state));
    expect(data.name).toBe("Gift");
    expect(data.skills).toHaveLength(1);
    expect(data.skills[0].name).toBe("Python");
  });

  it("accepts a bare array of skills", () => {
    expect(parseImport(JSON.stringify([newSkill()])).skills).toHaveLength(1);
  });

  it("gives clear errors for bad files", () => {
    expect(() => parseImport("not json")).toThrow(/valid JSON/);
    expect(() => parseImport(JSON.stringify({ hello: 1 }))).toThrow(/No skills/);
    expect(() => parseImport(JSON.stringify([{ foo: 1 }]))).toThrow(/could be read/);
  });
});
