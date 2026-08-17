import { describe, expect, it } from "vitest";
import { quests } from "./questionBank";

describe("visual learning aids", () => {
  it("keeps bundle drawings consistent with totals", () => {
    const visualQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.visual?.type === "bundle");
    expect(visualQuestions).toHaveLength(2);
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
    expect(rateQuestions).toHaveLength(2);
    rateQuestions.forEach((question) => {
      if (question.visual?.type !== "rate-table") return;
      expect(question.visual.rows.every((row) => row.range && row.size && row.fee)).toBe(true);
    });
    const numberLineQuestions = quests.flatMap((quest) => quest.questions).filter((question) => question.numberLine || question.interactiveNumberLine);
    expect(numberLineQuestions.length).toBeGreaterThanOrEqual(7);
    numberLineQuestions.forEach((question) => expect(question.prompt).toMatch(/수직선|점|화살표/));
  });
});
