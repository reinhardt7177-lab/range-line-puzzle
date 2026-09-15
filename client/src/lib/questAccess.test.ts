import { describe, expect, it } from "vitest";
import { canOpenQuest } from "./questAccess";

describe("quest access", () => {
  it("opens the first ten quests without records", () => {
    for (let id = 1; id <= 10; id++) expect(canOpenQuest(id, 11, {})).toBe(true);
    expect(canOpenQuest(11, 11, {})).toBe(false);
  });
  it("requires every earlier quest, not only quest ten", () => {
    expect(canOpenQuest(11, 11, { 10: { completed: true } })).toBe(false);
    const records = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, { completed: true }]));
    expect(canOpenQuest(11, 11, records)).toBe(true);
    records[4].completed = false;
    expect(canOpenQuest(11, 11, records)).toBe(false);
  });
});
