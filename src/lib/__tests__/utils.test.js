import { describe, expect, it } from "vitest";
import {
  addDaysISO,
  daysUntil,
  describeDeadline,
  getCategoryBreakdown,
  getStats,
  getStatus,
  getUpcoming,
} from "../utils.js";

const skill = (over = {}) => ({
  id: "1",
  name: "React",
  category: "Frontend Web",
  currentLevel: "Beginner",
  targetLevel: "Intermediate",
  targetDate: "",
  progress: 0,
  ...over,
});

describe("getStatus", () => {
  const today = "2026-10-04";

  it("is Not Started at 0%", () => {
    expect(getStatus(skill({ progress: 0 }), today)).toBe("Not Started");
  });

  it("is In Progress between 1% and 99%", () => {
    expect(getStatus(skill({ progress: 40 }), today)).toBe("In Progress");
    expect(getStatus(skill({ progress: 99 }), today)).toBe("In Progress");
  });

  it("is Completed at 100%, even if the date has passed", () => {
    expect(getStatus(skill({ progress: 100, targetDate: "2026-01-01" }), today)).toBe(
      "Completed",
    );
  });

  it("is Overdue when the target date passed and it isn't finished", () => {
    expect(getStatus(skill({ progress: 50, targetDate: "2026-10-03" }), today)).toBe("Overdue");
    expect(getStatus(skill({ progress: 0, targetDate: "2026-10-03" }), today)).toBe("Overdue");
  });

  it("is not Overdue on the target date itself", () => {
    expect(getStatus(skill({ progress: 50, targetDate: today }), today)).toBe("In Progress");
  });
});

describe("dates", () => {
  it("counts days between dates", () => {
    expect(daysUntil("2026-10-10", "2026-10-04")).toBe(6);
    expect(daysUntil("2026-10-01", "2026-10-04")).toBe(-3);
  });

  it("describes deadlines in plain words", () => {
    expect(describeDeadline("2026-10-04", "2026-10-04")).toBe("Due today");
    expect(describeDeadline("2026-10-05", "2026-10-04")).toBe("Due tomorrow");
    expect(describeDeadline("2026-10-14", "2026-10-04")).toBe("Due in 10 days");
    expect(describeDeadline("2026-10-03", "2026-10-04")).toBe("1 day overdue");
    expect(describeDeadline("2026-10-01", "2026-10-04")).toBe("3 days overdue");
  });

  it("adds days across a month boundary", () => {
    expect(addDaysISO(10, new Date(2026, 9, 25))).toBe("2026-11-04");
  });
});

describe("getStats", () => {
  it("returns zeros for an empty list", () => {
    expect(getStats([])).toEqual({
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      overdue: 0,
      average: 0,
    });
  });

  it("counts every skill exactly once and averages progress", () => {
    const today = "2026-10-04";
    const stats = getStats(
      [
        skill({ id: "a", progress: 100 }),
        skill({ id: "b", progress: 50 }),
        skill({ id: "c", progress: 0 }),
        skill({ id: "d", progress: 20, targetDate: "2026-09-01" }),
      ],
      today,
    );
    expect(stats).toMatchObject({
      total: 4,
      completed: 1,
      inProgress: 1,
      notStarted: 1,
      overdue: 1,
      average: 43,
    });
    expect(stats.completed + stats.inProgress + stats.notStarted + stats.overdue).toBe(4);
  });
});

describe("summaries", () => {
  it("groups by category with average progress", () => {
    const groups = getCategoryBreakdown([
      skill({ id: "a", category: "Design", progress: 90 }),
      skill({ id: "b", category: "Frontend Web", progress: 70 }),
      skill({ id: "c", category: "Frontend Web", progress: 30 }),
    ]);
    expect(groups).toEqual([
      { category: "Frontend Web", count: 2, average: 50 },
      { category: "Design", count: 1, average: 90 },
    ]);
  });

  it("lists unfinished skills with dates, soonest first", () => {
    const list = getUpcoming(
      [
        skill({ id: "a", targetDate: "2026-12-01" }),
        skill({ id: "b", targetDate: "2026-10-10" }),
        skill({ id: "c", targetDate: "2026-10-05", progress: 100 }),
        skill({ id: "d", targetDate: "" }),
      ],
      3,
      "2026-10-04",
    );
    expect(list.map((s) => s.id)).toEqual(["b", "a"]);
    expect(list[0].daysLeft).toBe(6);
  });
});
