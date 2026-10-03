import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App.jsx";
import { STORAGE_KEY } from "../lib/constants.js";

const setup = () => ({ user: userEvent.setup(), ...render(<App />) });


function getRow(name) {
  const row = screen
    .getAllByRole("article")
    .find((el) => within(el).queryByText(name, { selector: "strong" }));
  if (!row) throw new Error(`No row for ${name}`);
  return row;
}

async function addSkill(user, { name, current, target, date }) {
  await user.type(screen.getByLabelText(/skill name/i), name);
  if (current) await user.selectOptions(screen.getByLabelText(/current level/i), current);
  if (target) await user.selectOptions(screen.getByLabelText("Target level"), target);
  if (date) await user.type(screen.getByLabelText(/target date/i), date);
  await user.click(screen.getByRole("button", { name: /add skill/i }));
}

describe("Skill Tracker app", () => {
  it("starts with sample skills and a populated dashboard", () => {
    setup();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByRole("img", { name: /overall progress/i })).toBeTruthy();
    expect(screen.getByText(/6 of 6 shown/i)).toBeTruthy();
  });

  it("adds a skill with current and target level and saves it", async () => {
    const { user } = setup();
    await addSkill(user, {
      name: "Docker",
      current: "Beginner",
      target: "Advanced",
      date: "2030-01-15",
    });

    const row = getRow("Docker");
    expect(within(row).getByText("Beginner")).toBeTruthy();
    expect(within(row).getByText("Advanced")).toBeTruthy();
    expect(within(row).getByText("Not Started")).toBeTruthy();
    expect(within(row).getByText(/Jan 15, 2030/)).toBeTruthy();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.skills.find((s) => s.name === "Docker")).toMatchObject({
      currentLevel: "Beginner",
      targetLevel: "Advanced",
      progress: 0,
    });
  });

  it("validates the form", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /add skill/i }));
    expect(screen.getByText(/enter a skill name/i)).toBeTruthy();

    await user.type(screen.getByLabelText(/skill name/i), "react");
    await user.click(screen.getByRole("button", { name: /add skill/i }));
    expect(screen.getByText(/already on your list/i)).toBeTruthy();

    await user.clear(screen.getByLabelText(/skill name/i));
    await user.type(screen.getByLabelText(/skill name/i), "Rust");
    await user.selectOptions(screen.getByLabelText(/current level/i), "Advanced");
    await user.selectOptions(screen.getByLabelText("Target level"), "Beginner");
    await user.click(screen.getByRole("button", { name: /add skill/i }));
    expect(screen.getByText(/can't be lower than your current level/i)).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("updates progress and the dashboard totals follow", async () => {
    const { user } = setup();
    const row = getRow("Cybersecurity Basics");
    expect(within(row).getByText("0%")).toBeTruthy();

    await user.click(within(row).getByRole("button", { name: /increase progress/i }));
    await user.click(within(row).getByRole("button", { name: /increase progress/i }));
    expect(within(getRow("Cybersecurity Basics")).getByText("20%")).toBeTruthy();
    expect(within(getRow("Cybersecurity Basics")).getByText("In Progress")).toBeTruthy();

    for (let i = 0; i < 8; i++) {
      await user.click(
        within(getRow("Cybersecurity Basics")).getByRole("button", { name: /increase progress/i }),
      );
    }
    const done = getRow("Cybersecurity Basics");
    expect(within(done).getByText("100%")).toBeTruthy();
    expect(within(done).getByText("Completed")).toBeTruthy();
    expect(within(done).getByRole("button", { name: /increase progress/i }).disabled).toBe(true);
  });

  it("edits every field of a skill", async () => {
    const { user } = setup();
    await user.click(within(getRow("Python")).getByRole("button", { name: /edit python/i }));

    const dialog = screen.getByRole("dialog");
    const name = within(dialog).getByLabelText(/skill name/i);
    await user.clear(name);
    await user.type(name, "Python 3");
    await user.selectOptions(within(dialog).getByLabelText("Target level"), "Advanced");
    await user.click(within(dialog).getByRole("button", { name: /save changes/i }));

    const row = getRow("Python 3");
    expect(within(row).getByText("Advanced")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before deleting, and deleting removes it from storage", async () => {
    const { user } = setup();
    await user.click(within(getRow("JavaScript")).getByRole("button", { name: /delete javascript/i }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /cancel/i }));
    expect(screen.getAllByRole("article")).toHaveLength(6);

    await user.click(within(getRow("JavaScript")).getByRole("button", { name: /delete javascript/i }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /delete skill/i }));

    expect(screen.getAllByRole("article")).toHaveLength(5);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.skills.some((s) => s.name === "JavaScript")).toBe(false);
  });

  it("keeps data after a reload", async () => {
    const first = setup();
    await addSkill(first.user, { name: "Figma" });
    first.unmount();

    render(<App />);
    expect(getRow("Figma")).toBeTruthy();
  });

  it("filters by status and search", async () => {
    const { user } = setup();
    await user.selectOptions(screen.getByLabelText(/filter by status/i), "Not Started");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(getRow("Cybersecurity Basics")).toBeTruthy();

    await user.selectOptions(screen.getByLabelText(/filter by status/i), "All");
    await user.type(screen.getByLabelText(/search skills/i), "design");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(getRow("UI/UX Design")).toBeTruthy();

    await user.type(screen.getByLabelText(/search skills/i), "zzz");
    expect(screen.getByText(/no skills match/i)).toBeTruthy();
  });

  it("navigates between pages and logs activity", async () => {
    const { user } = setup();
    await addSkill(user, { name: "Kotlin" });

    await user.click(screen.getAllByRole("button", { name: /^activity$/i })[0]);
    expect(screen.getByRole("heading", { name: /activity log/i })).toBeTruthy();
    const log = within(screen.getByRole("list"));
    expect(log.getByText("Added Kotlin")).toBeTruthy();

    await user.click(screen.getAllByRole("button", { name: /^my skills$/i })[0]);
    expect(screen.getByLabelText(/filter by category/i)).toBeTruthy();

    await user.click(screen.getAllByRole("button", { name: /^settings$/i })[0]);
    await user.clear(screen.getByLabelText(/display name/i));
    await user.type(screen.getByLabelText(/display name/i), "Gift");
    await user.click(screen.getByRole("button", { name: /save name/i }));
    expect(screen.getAllByText("Gift").length).toBeGreaterThan(0);
  });

  it("upgrades data saved by the first version of the app", () => {
    localStorage.setItem(
      "skill-tracker-skills",
      JSON.stringify([
        {
          id: 1,
          name: "React",
          category: "Frontend Web",
          level: "Intermediate",
          targetDate: "2030-09-26",
          progress: 70,
          status: "In Progress",
        },
      ]),
    );
    render(<App />);
    const row = getRow("React");
    expect(within(row).getByText("70%")).toBeTruthy();
    expect(within(row).getAllByText(/Intermediate|Advanced/)).toHaveLength(2);
  });

  it("deletes all data from Settings after confirming", async () => {
    const { user } = setup();
    await user.click(screen.getAllByRole("button", { name: /^settings$/i })[0]);
    await user.click(screen.getByRole("button", { name: /delete all data/i }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /delete everything/i }));

    await user.click(screen.getAllByRole("button", { name: /^dashboard$/i })[0]);
    expect(screen.getByText(/no skills yet/i)).toBeTruthy();
  });
});
