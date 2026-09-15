import { describe, expect, it } from "vitest";
import { diagnosticItems } from "./Home";
import { studyNotes } from "@/lib/studyNotes";

describe("학습 전·중·후 연결", () => {
  it("첫 질문은 낯선 용어 대신 말의 뜻을 묻고 구체적인 예로 설명한다", () => {
    const first = diagnosticItems[1];
    expect(first.prompt).toContain("어떤 뜻");
    expect(first.options).not.toContain("분수");
    expect(first.answer).toContain("500명 정도");
    expect(first.rule).toContain("498명");
    expect(first.rule).toContain("어림값");
    Object.values(diagnosticItems).forEach((item) => {
      expect(item.options.filter((option) => option === item.answer)).toHaveLength(1);
      expect(item.rule.length).toBeGreaterThan(65);
    });
  });
  it("모든 관문에 한 문항 진단과 핵심 규칙 요약을 제공한다", () => {
    expect(Object.keys(diagnosticItems).map(Number)).toEqual(Array.from({ length: 11 }, (_, index) => index + 1));
    Object.values(diagnosticItems).forEach((item) => {
      expect(item.options).toContain(item.answer);
      expect(item.rule.length).toBeGreaterThan(8);
    });
    studyNotes.forEach((note) => expect(note.rules.length).toBeGreaterThanOrEqual(3));
  });
});
