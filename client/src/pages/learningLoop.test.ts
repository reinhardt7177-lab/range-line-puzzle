import { describe, expect, it } from "vitest";
import { diagnosticItems } from "./Home";
import { studyNotes } from "@/lib/studyNotes";

describe("학습 전·중·후 연결", () => {
  it("모든 관문에 한 문항 진단과 핵심 규칙 요약을 제공한다", () => {
    expect(Object.keys(diagnosticItems).map(Number)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
    Object.values(diagnosticItems).forEach((item) => {
      expect(item.options).toContain(item.answer);
      expect(item.rule.length).toBeGreaterThan(8);
    });
    studyNotes.forEach((note) => expect(note.rules.length).toBeGreaterThanOrEqual(3));
  });
});
