import { describe, expect, it } from "vitest";
import { quests } from "./questionBank";
import { studyNotes } from "./studyNotes";

const allQuestions = quests.flatMap((quest) => quest.questions);

describe("unit 1 research-aligned question audit", () => {
  it("keeps all 11 lessons populated with the audited 209-question practice bank", () => {
    expect(quests).toHaveLength(11);
    expect(allQuestions).toHaveLength(209);
    quests.forEach((quest) => expect(quest.questions.length).toBeGreaterThanOrEqual(18));
  });

  it("keeps questions independent and avoids personal performance or age judgments", () => {
    const text = allQuestions.flatMap((question) => [question.prompt, ...question.options, question.explanation, question.hint]).join("\n");
    expect(text).not.toMatch(/제자리멀리뛰기|오래달리기|타자 수|나이가|위의 조건|위의 \d급/);
  });

  it("keeps the key range and approximation rules present in the theory notes", () => {
    const joined = studyNotes.map((note) => `${note.oneLine} ${note.rules.join(" ")} ${note.mistake}`).join(" ");
    expect(joined).toContain("기준값을 포함");
    expect(joined).toContain("기준값을 포함하지");
    expect(joined).toContain("0이 아닌 수");
    expect(joined).toContain("5 이상이면 올리고");
    expect(joined).toContain("완전한 묶음");
  });
});
