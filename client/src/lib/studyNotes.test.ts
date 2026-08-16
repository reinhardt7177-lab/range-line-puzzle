import { describe, expect, it } from "vitest";
import { studyNotes, unitStudyNote } from "./studyNotes";

describe("unit 1 study notes", () => {
  it("contains one worksheet page for each of the 11 quests", () => {
    expect(studyNotes).toHaveLength(11);
    expect(studyNotes.map((note) => note.questId)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
  });

  it("keeps each visual concept paired with its learning rule", () => {
    const get = (questId: number) => studyNotes.find((note) => note.questId === questId)!;
    expect(get(2).rules.join(" ")).toContain("기준값과 같거나 큰 수");
    expect(get(2).rules.join(" ")).toContain("기준값과 같거나 작은 수");
    expect(get(3).rules.join(" ")).toContain("기준값보다 큰 수");
    expect(get(3).rules.join(" ")).toContain("기준값보다 작은 수");
    expect(get(4).rules.join(" ")).toContain("채워진 점");
    expect(get(4).rules.join(" ")).toContain("빈 점");
    expect(get(5).rules.join(" ")).toContain("부족하지 않게");
    expect(get(6).rules.join(" ")).toContain("완전한 묶음");
    expect(get(7).rules.join(" ")).toContain("가장 가까운 값");
    expect(unitStudyNote.questId).toBe(11);
  });
});
