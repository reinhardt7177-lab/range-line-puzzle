import { describe, it, expect } from "vitest";
import { parcelFee, pilotQuestions } from "./curriculumPilot";
import { quests, bossChallenges } from "./questionBank";
describe("교과서 대표 관문", () => {
  it("무게와 크기 중 높은 요금을 선택하며 경계값을 포함한다", () => {
    expect(parcelFee(5,130)).toBe(8000);
    expect(parcelFee(12,90)).toBe(8000);
    expect(parcelFee(2,60)).toBe(6000);
    expect(parcelFee(10,120)).toBe(7000);
    expect(parcelFee(20,140)).toBe(8000);
    expect(()=>parcelFee(31,100)).toThrow();
    expect(bossChallenges[9].question.visual?.type).toBe("rate-table");
  });
  it("소수 경계를 직접 그리며 양과 묶음 개수를 분리한다", () => {
    expect(pilotQuestions[3].filter(q=>q.interactiveNumberLine)).toHaveLength(2);
    expect(pilotQuestions[3][5].answers).toEqual(["10.5|exclude|left"]);
    expect(pilotQuestions[5][0].answers).toEqual(["250개"]);
    expect(pilotQuestions[5][2].answers).toEqual(["25"]);
    expect(pilotQuestions[5][7].answers).toEqual(["250"]);
    expect(pilotQuestions[5][8].answers).toEqual(["5"]);
    for(const id of [3,5,9]) expect(quests[id-1].questions).toBe(pilotQuestions[id]);
  });
});
