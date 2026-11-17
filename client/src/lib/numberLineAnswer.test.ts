import { describe, expect, it } from "vitest";
import { encodeLineAnswer, isLineAnswerComplete, parseLineAnswer, readableAnswer } from "./numberLineAnswer";
const model = { min: 10, max: 11, step: 0.1, start: 10.5, startIncluded: false, direction: "left" as const };
describe("student number line answer", () => {
  it("does not preselect inclusion or direction, and preserves choices in any order", () => {
    expect(parseLineAnswer("")).toEqual({ point: undefined, included: undefined, direction: undefined });
    const first = parseLineAnswer(encodeLineAnswer({ direction: "left" }));
    const second = parseLineAnswer(encodeLineAnswer({ ...first, included: false }));
    expect(encodeLineAnswer({ ...second, point: 10.5 })).toBe("10.5|exclude|left");
  });
  it("accepts all three choices only on valid decimal ticks", () => {
    for (const partial of ["10.5||left", "10.5|include|", "|exclude|left", "10.55|exclude|left", "12|include|right"]) expect(isLineAnswerComplete(partial, model)).toBe(false);
    expect(isLineAnswerComplete("10.5|exclude|left", model)).toBe(true);
  });
  it("renders readable feedback instead of stored answer syntax", () => {
    expect(readableAnswer("5|include|right")).toBe("5에 점 · ● 포함 · 큰 수 쪽 →");
  });
});
