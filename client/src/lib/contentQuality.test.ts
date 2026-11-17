import { describe, expect, it } from "vitest";
import { bossChallenges, quests } from "./questionBank";
import { parcelFee } from "./curriculumPilot";

const questions = [...quests.flatMap(quest => quest.questions), ...Object.values(bossChallenges).map(boss => boss.question)];
const numeric = (text: string) => Number(text.replaceAll(",", ""));

describe("수학 내용의 독립 검산", () => {
  it("수직선 그림의 구간과 보기에서 고르는 수가 일치한다", () => {
    let checked = 0;
    for (const question of questions) {
      const model = question.numberLine;
      if (!model || !question.options.every(option => /^\d+(?:\.\d+)?$/.test(option))) continue;
      const expected = question.options.filter(option => {
        const value = numeric(option);
        if (model.direction === "left") return model.startIncluded ? value <= model.start : value < model.start;
        if (model.direction === "right") return model.startIncluded ? value >= model.start : value > model.start;
        return (model.startIncluded ? value >= model.start : value > model.start) &&
          (model.endIncluded ? value <= model.end! : value < model.end!);
      });
      expect([...question.answers].sort(), question.prompt).toEqual(expected.sort());
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("직접 그리는 범위의 채점 답이 해당 수직선 모형과 일치한다", () => {
    for (const question of questions) {
      const model = question.interactiveNumberLine;
      if (!model) continue;
      expect(question.answers, question.prompt).toEqual([`${model.start}|${model.startIncluded ? "include" : "exclude"}|${model.direction}`]);
      expect(model.start).toBeGreaterThanOrEqual(model.min);
      expect(model.start).toBeLessThanOrEqual(model.max);
      expect((model.start - model.min) / model.step).toBeCloseTo(Math.round((model.start - model.min) / model.step));
    }
  });

  it("수를 특정 자리까지 어림하는 문항의 수치 답을 다시 계산한다", () => {
    let checked = 0;
    for (const question of questions) {
      if (question.answers.length !== 1 || !/^[\d,.]+(?:명)?$/.test(question.answers[0])) continue;
      const match = question.prompt.match(/([\d,]+(?:\.\d+)?)(?:명)?[을를] (십|백|천|일|백만|소수 첫째|소수 둘째)의? 자리까지 (올림|버림|반올림)/)
        ?? question.prompt.match(/([\d,]+(?:\.\d+)?)[을를] (올림|버림|반올림)하여 (십|백|천|일|백만|소수 첫째|소수 둘째)의? 자리까지/);
      if (!match) continue;
      const reversed = /하여/.test(match[0]);
      const place = match[reversed ? 3 : 2];
      const method = match[reversed ? 2 : 3];
      const unit = { "십": 10, "백": 100, "천": 1000, "일": 1, "백만": 1000000, "소수 첫째": 0.1, "소수 둘째": 0.01 }[place]!;
      const value = numeric(match[1]) / unit;
      const result = (method === "올림" ? Math.ceil(value - 1e-9) : method === "버림" ? Math.floor(value + 1e-9) : Math.round(value + 1e-9)) * unit;
      expect(numeric(question.answers[0].replace("명", "")), question.prompt).toBeCloseTo(result);
      checked++;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it("택배 요금은 유효한 무게와 크기에만 계산한다", () => {
    expect(parcelFee(2, 60)).toBe(6000);
    expect(parcelFee(2.01, 60)).toBe(7000);
    expect(parcelFee(5, 130)).toBe(8000);
    expect(parcelFee(30, 160)).toBe(9000);
    for (const value of [0, -1, NaN, Infinity]) expect(() => parcelFee(value, 60)).toThrow();
  });
});
