import type { NumberLineModel } from "./questionBank";

export type LineAnswer = { point?: number; included?: boolean; direction?: "left" | "right" };

export function parseLineAnswer(value: string): LineAnswer {
  const [point, included, direction] = value.split("|");
  return {
    point: point?.trim() && Number.isFinite(Number(point)) ? Number(point) : undefined,
    included: included === "include" ? true : included === "exclude" ? false : undefined,
    direction: direction === "left" || direction === "right" ? direction : undefined,
  };
}

export function encodeLineAnswer(answer: LineAnswer) {
  return `${answer.point ?? ""}|${answer.included === undefined ? "" : answer.included ? "include" : "exclude"}|${answer.direction ?? ""}`;
}

export function isLineAnswerComplete(value: string, model: NumberLineModel) {
  const { point, included, direction } = parseLineAnswer(value);
  if (point === undefined || included === undefined || !direction || point < model.min || point > model.max) return false;
  const stepIndex = (point - model.min) / model.step;
  return Math.abs(stepIndex - Math.round(stepIndex)) < 0.00001;
}

export function readableAnswer(value: string) {
  if (!value.includes("|")) return value;
  const { point, included, direction } = parseLineAnswer(value);
  return [point !== undefined ? `${point}에 점` : "눈금 미선택", included === undefined ? "점 모양 미선택" : included ? "● 포함" : "○ 제외", direction === "left" ? "← 작은 수 쪽" : direction === "right" ? "큰 수 쪽 →" : "방향 미선택"].join(" · ");
}
