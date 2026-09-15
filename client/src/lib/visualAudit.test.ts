import { describe, expect, it } from "vitest";
import { quests } from "./questionBank";

describe("visual learning aids", () => {
  it("provides a drawing whenever a question asks learners to read a number line", () => {
    quests.flatMap((quest) => quest.questions).filter((question) => /수직선/.test(question.prompt)).forEach((question) => {
      expect(Boolean(question.numberLine || question.interactiveNumberLine || question.visual?.type === "rounding-builder" || question.visual?.type === "rounding-line"), question.prompt).toBe(true);
    });
  });

  it("matches numerical choices to open and closed interval endpoints", () => {
    quests.flatMap((quest) => quest.questions).forEach((question) => {
      const m = question.numberLine;
      if (!m || !question.options.every((option) => /^\d+$/.test(option))) return;
      const includes = (n: number) => {
        if (m.direction === "left") return m.startIncluded ? n <= m.start : n < m.start;
        const above = m.startIncluded ? n >= m.start : n > m.start;
        if (m.direction === "right") return above;
        return above && (m.endIncluded ? n <= m.end! : n < m.end!);
      };
      expect(question.answers.slice().sort()).toEqual(question.options.filter((option) => includes(Number(option))).sort());
    });
  });
  it("keeps bundle drawings consistent with totals", () => {
    const visualQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.visual?.type === "bundle");
    expect(visualQuestions).toHaveLength(1);
    visualQuestions.forEach((question) => {
      if (question.visual?.type !== "bundle") return;
      expect(question.visual.completed * question.visual.groupSize + question.visual.remainder).toBe(question.visual.total);
    });
  });

  it("keeps rounding-line visuals mathematically consistent", () => {
    const roundingQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.visual?.type === "rounding-builder");
    expect(roundingQuestions).toHaveLength(1);
    const visual = roundingQuestions[0].visual;
    if (visual?.type !== "rounding-builder") return;
    expect(visual.value - visual.lower).toBe(visual.upper - visual.value);
    expect(roundingQuestions[0].answers.some((answer) => answer.replace(/,/g, "") === String(visual.rounded))).toBe(true);
  });

  it("keeps rate tables multi-condition and number-line endpoints explicit", () => {
    const rateQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.visual?.type === "rate-table");
    expect(rateQuestions).toHaveLength(5);
    rateQuestions.forEach((question) => {
      if (question.visual?.type !== "rate-table") return;
      expect(question.visual.rows.every((row) => row.range && row.size && row.fee)).toBe(true);
    });
    const numberLineQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.numberLine || question.interactiveNumberLine);
    expect(numberLineQuestions.length).toBeGreaterThanOrEqual(7);
    numberLineQuestions.forEach((question) => {
      expect(question.prompt).toMatch(/수직선|점|화살표/);
      const model = question.numberLine ?? question.interactiveNumberLine;
      if (!model) return;
      expect(model.start).toBeGreaterThanOrEqual(model.min);
      expect(model.start).toBeLessThanOrEqual(model.max);
      if (model.direction === "right") expect(model.start).toBeLessThan(model.max);
      if (model.direction === "left") expect(model.start).toBeGreaterThan(model.min);
      if (model.direction === "between") {
        expect(model.end).toBeDefined();
        expect(model.end).toBeGreaterThan(model.start);
      }
    });
  });
});
