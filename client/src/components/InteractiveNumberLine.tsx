import { useLayoutEffect, useRef, useState } from "react";
import type { NumberLineModel } from "@/lib/questionBank";
import { encodeLineAnswer, parseLineAnswer, type LineAnswer } from "@/lib/numberLineAnswer";

export default function InteractiveNumberLine({ model, value, onChange, disabled = false }: { model: NumberLineModel; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const answer = parseLineAnswer(value);
  const { point, included, direction } = answer;
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(540);
  useLayoutEffect(() => {
    const element = trackRef.current;
    if (!element) return;
    const measure = () => setTrackWidth(Math.floor(element.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const values = Array.from({ length: Math.round((model.max - model.min) / model.step) + 1 }, (_, i) => Number((model.min + i * model.step).toFixed(6)));
  const width = Math.max(trackWidth, (values.length - 1) * 46 + 60);
  const x = (n: number) => 30 + (n - model.min) / (model.max - model.min) * (width - 60);
  const arrowTip = direction === "left" ? 12 : width - 12;
  const arrowBase = arrowTip + (direction === "left" ? 14 : -14);
  const update = (patch: Partial<LineAnswer>) => { if (!disabled) onChange(encodeLineAnswer({ ...answer, ...patch })); };
  const status = disabled ? "내가 그린 수직선" : point === undefined ? "눈금을 눌러 기준값에 점을 찍어요." : included === undefined ? `${point}에 점을 찍었어요. 점의 모양을 골라요.` : !direction ? "화살표가 향할 쪽을 골라요." : `${point}에 ${included ? "채운 점" : "빈 점"}을 찍고 ${direction === "left" ? "왼쪽" : "오른쪽"}을 향하게 했어요.`;
  return <section className="number-line-builder" aria-label="수직선 직접 표현">
    <p className="line-instruction" role="status">{status}</p>
    <div ref={trackRef} className="number-line-scroll" tabIndex={width > trackWidth ? 0 : undefined} aria-label="수직선 눈금 영역">
      <svg viewBox={`0 0 ${width} 125`} style={{ width, minWidth: width, height: 125 }} role="group" aria-label="조작할 수 있는 수직선">
        {values.map(n => <rect key={n} className="line-tick-bed" data-selected={point === n} x={x(n) - 22} y="16" width="44" height="86" rx="8" />)}
        <line x1="16" y1="49" x2={width - 16} y2="49" className="number-line__axis" />
        {point !== undefined && direction && <>
          <line x1={x(point)} x2={arrowBase} y1="49" y2="49" className="number-line-builder__range" />
          <polygon points={`${arrowTip},49 ${arrowBase},41 ${arrowBase},57`} fill="#214d87" />
        </>}
        {values.map(n => <g key={n} className="number-line-builder__tick" role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-pressed={point === n} aria-label={`${n}에 점 찍기`} onClick={() => update({ point: n })} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); update({ point: n }); } }}>
          <rect className="line-hit-target" x={x(n) - 22} y="16" width="44" height="86" rx="8" />
          <line x1={x(n)} x2={x(n)} y1="37" y2="62" className="number-line__tick" />
          {point === n && <circle cx={x(n)} cy="49" r="9" className={`number-line__point ${included ? "number-line__point--closed" : ""} ${included === undefined ? "line-point-pending" : ""}`} />}
          <text x={x(n)} y="91" textAnchor="middle" className="number-line__label">{n}</text>
        </g>)}
      </svg>
    </div>
    {width > trackWidth && <p className="line-scroll-hint">눈금이 모두 보이지 않으면 수직선을 좌우로 밀어 보세요.</p>}
    <div className="number-line-builder__controls">
      <fieldset><legend>점의 모양</legend><button type="button" disabled={disabled} aria-pressed={included === true} onClick={() => update({ included: true })}>● 포함</button><button type="button" disabled={disabled} aria-pressed={included === false} onClick={() => update({ included: false })}>○ 제외</button></fieldset>
      <fieldset><legend>화살표 방향</legend><button type="button" disabled={disabled} aria-pressed={direction === "left"} onClick={() => update({ direction: "left" })}>← 작은 수</button><button type="button" disabled={disabled} aria-pressed={direction === "right"} onClick={() => update({ direction: "right" })}>큰 수 →</button></fieldset>
    </div>
  </section>;
}
