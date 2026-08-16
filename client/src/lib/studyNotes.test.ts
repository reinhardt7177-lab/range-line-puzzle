import { describe, expect, it } from "vitest";
import { studyNotes, unitStudyNote } from "./studyNotes";

describe("unit 1 study notes", () => {
  it("contains one worksheet page for each of the 11 quests", () => {
    expect(studyNotes).toHaveLength(11);
    expect(studyNotes.map((note) => note.questId)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
  });

  it("keeps the boundary and estimation rules explicit", () => {
    const text = studyNotes.map((note) => `${note.title} ${note.oneLine} ${note.rules.join(" ")}`).join(" ");
    expect(text).toContain("기준값과 같거나 큰 수");
    expect(text).toContain("기준값보다 큰 수");
    expect(text).toContain("부족하지 않게");
    expect(text).toContain("완전한 묶음");
    expect(text).toContain("가장 가까운 값");
    expect(unitStudyNote.questId).toBe(11);
  });
});
