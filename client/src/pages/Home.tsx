import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Crosshair,
  Flag,
  Gamepad2,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

// Design reminder: 숫자 아케이드 관제실 — gameplay is the math action.
// Use cobalt boundary nodes, tangerine action states, mint success states,
// asymmetric mission rail, short arcade rounds, and paper-like surfaces.

type Operator = "이상" | "이하";

type Round = {
  id: number;
  operator: Operator;
  bound: number;
  numbers: number[];
  label: string;
  scene: string;
};

const rounds: Round[] = [
  {
    id: 1,
    operator: "이상",
    bound: 120,
    numbers: [112, 120, 127, 138],
    label: "입장 조건",
    scene: "첫 번째 게이트",
  },
  {
    id: 2,
    operator: "이하",
    bound: 85,
    numbers: [72, 84, 85, 93],
    label: "안전 구역",
    scene: "두 번째 게이트",
  },
  {
    id: 3,
    operator: "이상",
    bound: 300,
    numbers: [264, 299, 300, 318],
    label: "파워 충전",
    scene: "세 번째 게이트",
  },
  {
    id: 4,
    operator: "이하",
    bound: 45,
    numbers: [39, 45, 47, 52],
    label: "착륙 허가",
    scene: "최종 게이트",
  },
];

function RangeMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "range-mark range-mark--compact" : "range-mark"} aria-hidden="true">
      <span className="range-mark__node range-mark__node--left" />
      <span className="range-mark__line" />
      <span className="range-mark__node range-mark__node--right" />
    </span>
  );
}

function NumberChip({
  value,
  selected,
  correct,
  onClick,
}: {
  value: number;
  selected: boolean;
  correct?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`number-chip ${selected ? "number-chip--selected" : ""} ${correct === true ? "number-chip--correct" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="number-chip__dot" />
      <strong>{value}</strong>
      {selected && <Check size={16} strokeWidth={3} />}
    </button>
  );
}

export default function Home() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [boundary, setBoundary] = useState(120);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"idle" | "boundary" | "chips" | "success">("idle");
  const [hintOpen, setHintOpen] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stars, setStars] = useState(0);
  const [lockedRounds, setLockedRounds] = useState(0);

  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;
  const correctValues = useMemo(
    () => round.numbers.filter((value) => (round.operator === "이상" ? value >= round.bound : value <= round.bound)),
    [round],
  );
  const boundaryPercent = Math.min(92, Math.max(8, ((boundary - 40) / 280) * 100));
  const progressPercent = ((roundIndex + (feedback === "success" ? 1 : 0)) / rounds.length) * 100;

  const resetRound = () => {
    setBoundary(round.bound);
    setSelected([]);
    setFeedback("idle");
    setHintOpen(false);
  };

  const chooseChip = (value: number) => {
    if (feedback === "success") return;
    setSelected((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
    setFeedback("idle");
  };

  const submit = () => {
    if (boundary !== round.bound) {
      setFeedback("boundary");
      setHintOpen(true);
      return;
    }
    const sortedSelected = [...selected].sort((a, b) => a - b);
    const sortedCorrect = [...correctValues].sort((a, b) => a - b);
    const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    if (!isCorrect) {
      setFeedback("chips");
      return;
    }
    setFeedback("success");
    setCombo((value) => value + 1);
    setStars((value) => value + (hintOpen ? 1 : 2));
    setLockedRounds((value) => Math.max(value, roundIndex + 1));
  };

  const nextRound = () => {
    if (isLastRound) {
      setRoundIndex(0);
      setCombo(0);
      setStars(0);
      setLockedRounds(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    setBoundary(rounds[isLastRound ? 0 : roundIndex + 1].bound);
    setSelected([]);
    setFeedback("idle");
    setHintOpen(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-symbol"><RangeMark compact /></div>
          <div>
            <p className="brand-kicker">MATH ARCADE / 01</p>
            <p className="brand-name">RANGE<span>//</span>LINE</p>
          </div>
        </div>
        <div className="topbar__right">
          <div className="streak-pill"><Zap size={15} fill="currentColor" /> <span>{combo} COMBO</span></div>
          <div className="star-meter"><Sparkles size={16} /> <strong>{stars.toString().padStart(2, "0")}</strong><span>STARS</span></div>
          <button type="button" className="avatar-button" aria-label="학생 프로필">J</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="mission-rail">
          <div className="rail-topline"><span>MISSION LOG</span><span className="live-dot">LIVE</span></div>
          <div className="mission-intro">
            <p className="eyebrow">UNIT 01 / LESSON 02</p>
            <h1>경계선<br /><em>퍼즐</em></h1>
            <p>기준값을 포함하는 안전 구간을 만들고 숫자 칩을 통과시키세요.</p>
          </div>

          <div className="mission-card">
            <div className="mission-card__stamp"><Target size={18} /></div>
            <div>
              <p className="card-label">CURRENT OBJECTIVE</p>
              <p className="mission-card__title">{round.label}</p>
              <p className="mission-card__copy">{round.operator === "이상" ? "기준값과 같거나 큰 수" : "기준값과 같거나 작은 수"}만 통과</p>
            </div>
          </div>

          <div className="lesson-list">
            <div className="lesson-list__heading"><span>LESSON MAP</span><span>02 / 11</span></div>
            <div className="lesson-row lesson-row--done"><span className="lesson-index">01</span><span>숫자 마을 탐험</span><Check size={14} /></div>
            <div className="lesson-row lesson-row--active"><span className="lesson-index">02</span><span>이상과 이하</span><span className="lesson-live">NOW</span></div>
            <div className="lesson-row"><span className="lesson-index">03</span><span>초과와 미만</span><LockKeyhole size={14} /></div>
            <div className="lesson-row"><span className="lesson-index">04</span><span>범위 판정 센터</span><LockKeyhole size={14} /></div>
          </div>

          <div className="rail-tip"><Lightbulb size={17} /><p><strong>플레이 팁</strong><br />이상과 이하는 기준값을 포함해요. 경계 노드를 먼저 맞춰 보세요.</p></div>
        </aside>

        <section className="game-stage">
          <div className="stage-heading">
            <div>
              <div className="breadcrumb"><span>UNIT 01</span><ChevronRight size={13} /><span>LESSON 02</span><ChevronRight size={13} /><strong>{round.scene}</strong></div>
              <h2>{round.operator === "이상" ? "기준값 이상인 칩을" : "기준값 이하인 칩을"} 통과시켜.</h2>
            </div>
            <div className="round-status"><span>ROUND</span><strong>{String(round.id).padStart(2, "0")}</strong><span>/ 04</span></div>
          </div>

          <div className="game-board">
            <div className="board-grid" />
            <div className="board-hud board-hud--left"><span className="hud-icon"><Crosshair size={16} /></span><span>RANGE LOCK</span></div>
            <div className="board-hud board-hud--right"><span>NODE {String(round.id).padStart(2, "0")}</span><span className="hud-live-dot" /></div>

            <div className="board-center">
              <div className="range-visual-label"><span>SAFE ZONE</span><b>{round.operator === "이상" ? `${round.bound} 이상` : `${round.bound} 이하`}</b></div>
              <div className="number-line-wrap">
                <div className="number-line__scale"><span>40</span><span>80</span><span>120</span><span>160</span><span>200</span><span>240</span><span>280</span><span>320</span></div>
                <div className="number-line" aria-label="수직선">
                  <div className={`safe-zone safe-zone--${round.operator === "이상" ? "right" : "left"}`} style={round.operator === "이상" ? { left: `${boundaryPercent}%`, right: "0" } : { left: "0", right: `${100 - boundaryPercent}%` }} />
                  <div className="line-track" />
                  <div className="boundary-node" style={{ left: `${boundaryPercent}%` }}><span>{boundary}</span><i /></div>
                  <div className="number-line__ticks">{Array.from({ length: 15 }).map((_, index) => <i key={index} />)}</div>
                </div>
                <div className="number-line__caption"><span>작은 수</span><strong>경계 노드</strong><span>큰 수</span></div>
              </div>
              <div className="slider-block">
                <div className="slider-label"><span>경계 노드 위치</span><strong>{boundary}</strong></div>
                <input type="range" min="40" max="320" step="1" value={boundary} onChange={(event) => { setBoundary(Number(event.target.value)); setFeedback("idle"); }} aria-label="경계 노드 위치" />
                <div className="slider-scale"><span>40</span><span>320</span></div>
              </div>
            </div>
            <div className="board-corner board-corner--tl">{round.operator === "이상" ? "BOUNDARY INCLUDED" : "BOUNDARY INCLUDED"}</div>
            <div className="board-corner board-corner--br">INPUT / {selected.length} CHIPS</div>
          </div>

          <div className="chip-deck">
            <div className="deck-heading"><div><span className="eyebrow">CHIP FILTER</span><h3>통과시킬 숫자를 골라.</h3></div><span className="deck-count">{selected.length} / {round.numbers.length} SELECTED</span></div>
            <div className="chip-row">{round.numbers.map((number) => <NumberChip key={number} value={number} selected={selected.includes(number)} correct={feedback === "success" ? correctValues.includes(number) : undefined} onClick={() => chooseChip(number)} />)}</div>
          </div>

          {feedback !== "idle" && (
            <div className={`feedback-panel feedback-panel--${feedback}`} role="status">
              <div className="feedback-icon">{feedback === "success" ? <Check size={22} /> : <CircleHelp size={22} />}</div>
              <div><strong>{feedback === "success" ? "RANGE LOCKED — 통과 성공" : feedback === "boundary" ? "경계 노드를 다시 확인해 봐." : "칩의 범위를 다시 살펴봐."}</strong><p>{feedback === "success" ? "좋아. 기준값을 포함한 안전 구간을 정확히 만들었어." : feedback === "boundary" ? `지금은 ${boundary}에 놓여 있어. 미션의 기준값은 ${round.bound}야.` : `${round.operator === "이상" ? "기준값과 같거나 큰" : "기준값과 같거나 작은"} 수만 선택해야 해.`}</p></div>
              {feedback === "success" && <span className="feedback-score">+{hintOpen ? 1 : 2} STARS</span>}
            </div>
          )}

          <div className="action-bar">
            <button type="button" className="secondary-action" onClick={() => setHintOpen((value) => !value)}><Lightbulb size={17} /> HINT <span>{hintOpen ? "ON" : "OFF"}</span></button>
            <div className="action-bar__right"><button type="button" className="reset-action" onClick={resetRound}><RotateCcw size={16} /> RESET</button>{feedback === "success" ? <button type="button" className="primary-action" onClick={nextRound}>{isLastRound ? "PLAY AGAIN" : "NEXT NODE"} <ArrowRight size={18} /></button> : <button type="button" className="primary-action" onClick={submit}>LOCK RANGE <Flag size={17} /></button>}</div>
          </div>

          {hintOpen && feedback !== "success" && <div className="hint-strip"><Lightbulb size={16} /><span><strong>힌트:</strong> {round.operator === "이상" ? "‘이상’은 기준값도 안전 구간 안에 들어가요." : "‘이하’는 기준값도 안전 구간 안에 들어가요."} 경계 노드를 기준 숫자에 맞추고, 그쪽의 칩을 골라 보세요.</span></div>}
        </section>
      </div>

      <footer className="bottom-status"><span><i className="status-pip" /> TRAINING MODE</span><span>LESSON SYNCED</span><span>KEYBOARD READY</span><span className="bottom-status__right"><Gamepad2 size={15} /> RANGE//LINE v0.1</span></footer>
    </main>
  );
}
