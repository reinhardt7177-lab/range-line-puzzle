import { describe, expect, it } from "vitest";
import pageSource from "./Home.tsx?raw";

describe("문제 집중형 UI", () => {
  it("30초 진단은 대형 히어로 대신 질문·선택지·제출 순서를 사용한다", () => {
    expect(pageSource).toContain('className="diagnostic-card__top"');
    expect(pageSource).toContain("관문 {String(quest.id).padStart(2, \"0\")} · 30초 진단");
    expect(pageSource).toContain('<div className="diagnostic-question"><span>빠른 진단</span><h1>{item.prompt}</h1>');
    expect(pageSource).toContain("진단 확인");
    expect(pageSource).not.toContain("준비됐나요?");
    expect(pageSource).not.toContain("diagnostic-card__seal");
  });

  it("일반 문제와 미니 복습전은 현재 문항의 상태만 짧게 표시한다", () => {
    expect(pageSource).not.toContain("관문을 하나씩 통과하세요.");
    expect(pageSource).not.toContain("다시 단단하게.");
    expect(pageSource).not.toContain("가장 많이 막힌 개념을 골라");
    expect(pageSource).toContain('className="mini-review-header__meta"');
    expect(pageSource).toContain('hidden={question.category !== "오개념 교정"');
  });

  it("진단 후 피드백은 제출 뒤에만 열리고 다음 행동이 하나로 유지된다", () => {
    expect(pageSource).toContain('{submitted && <div className={correct ? "quest-feedback quest-feedback--success"');
    expect(pageSource).toContain('{!submitted ? <button type="button" className="answer-action" disabled={!selected} onClick={onSubmit}>진단 확인');
    expect(pageSource).toContain('<button type="button" className="next-quest" onClick={onStart}>본 학습 시작');
  });
});
