import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Crosshair,
  Flame,
  Gamepad2,
  Heart,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

// Design reminder: 숫자 아케이드 관제실 — this is a game first, with math as
// the combat rule. Cobalt arena, tangerine threats, mint correct hits,
// moving enemies, short rounds, and tactile controls.

type Operator = "이상" | "이하";
type Phase = "playing" | "paused" | "cleared" | "gameover";

type Round = {
  bound: number;
  operator: Operator;
  numbers: number[];
  title: string;
  color: string;
};

type Enemy = {
  id: number;
  value: number;
  left: number;
  y: number;
  speed: number;
};

const rounds: Round[] = [
  { bound: 120, operator: "이상", numbers: [112, 120, 127, 138], title: "GATE 01 / 기준값 이상", color: "mint" },
  { bound: 85, operator: "이하", numbers: [72, 84, 85, 93], title: "GATE 02 / 기준값 이하", color: "orange" },
  { bound: 300, operator: "이상", numbers: [264, 299, 300, 318], title: "GATE 03 / 기준값 이상", color: "mint" },
  { bound: 45, operator: "이하", numbers: [39, 45, 47, 52], title: "GATE 04 / 기준값 이하", color: "orange" },
];

function RangeMark() {
  return <span className="range-mark" aria-hidden="true"><i /><b /><i /></span>;
}

function ArenaArt() {
  return (
    <svg className="arena-art" viewBox="0 0 720 390" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#162e69" /><stop offset="1" stopColor="#081331" /></linearGradient>
        <linearGradient id="beam" x1="0" x2="1"><stop offset="0" stopColor="#53d6b0" stopOpacity="0" /><stop offset="0.5" stopColor="#53d6b0" stopOpacity="0.85" /><stop offset="1" stopColor="#53d6b0" stopOpacity="0" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="720" height="390" fill="url(#sky)" />
      <path d="M0 292 L112 246 L201 284 L314 224 L422 267 L536 206 L720 261 V390 H0Z" fill="#0b1b43" opacity=".9" />
      <path d="M0 331 L125 290 L218 320 L360 271 L470 316 L591 256 L720 295 V390 H0Z" fill="#07132f" />
      <path d="M75 114 H640" stroke="url(#beam)" strokeWidth="2" filter="url(#glow)" opacity=".55" />
      <path d="M22 93 L121 93 M586 93 L698 93" stroke="#5578d8" strokeWidth="1" opacity=".6" />
      <path d="M22 100 L71 100 M639 100 L698 100" stroke="#ff9e4a" strokeWidth="2" opacity=".75" />
      <g fill="#9cb4fb" opacity=".8"><circle cx="94" cy="53" r="1.5" /><circle cx="157" cy="142" r="1.5" /><circle cx="244" cy="82" r="1" /><circle cx="353" cy="42" r="1.5" /><circle cx="468" cy="117" r="1" /><circle cx="602" cy="55" r="1.5" /><circle cx="662" cy="151" r="1" /></g>
      <g fill="#ff9e4a" opacity=".85"><path d="M32 174h3v3h-3z" /><path d="M681 181h3v3h-3z" /><path d="M508 67h3v3h-3z" /></g>
      <g transform="translate(290 306)" filter="url(#glow)"><path d="M70 0 L108 72 L70 59 L32 72Z" fill="#3156d8" stroke="#9db6ff" strokeWidth="2" /><path d="M70 8 L80 42 L70 37 L60 42Z" fill="#ff9e4a" /><path d="M35 58 L10 86 L52 70Z" fill="#1b3988" stroke="#718fe8" strokeWidth="2" /><path d="M105 58 L130 86 L88 70Z" fill="#1b3988" stroke="#718fe8" strokeWidth="2" /></g>
      <path d="M0 351 Q180 329 360 351 T720 351" fill="none" stroke="#3156d8" strokeWidth="2" opacity=".55" />
    </svg>
  );
}

function EnemyBot({ enemy, onFire, hitFlash }: { enemy: Enemy; onFire: () => void; hitFlash: boolean }) {
  return (
    <button type="button" className={`enemy-bot ${hitFlash ? "enemy-bot--flash" : ""}`} style={{ left: `${enemy.left}%`, top: `${enemy.y}%` }} onClick={onFire} aria-label={`${enemy.value} 숫자 적 공격`}>
      <span className="enemy-bot__antenna" />
      <span className="enemy-bot__body"><i /><strong>{enemy.value}</strong><i /></span>
      <span className="enemy-bot__shadow" />
    </button>
  );
}

export default function Home() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [boundary, setBoundary] = useState(rounds[0].bound);
  const [phase, setPhase] = useState<Phase>("playing");
  const [timeLeft, setTimeLeft] = useState(45);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, value: 112, left: 17, y: 14, speed: 0.32 },
    { id: 2, value: 120, left: 43, y: 31, speed: 0.27 },
    { id: 3, value: 138, left: 76, y: 7, speed: 0.23 },
  ]);
  const [message, setMessage] = useState("적 숫자를 클릭해서 안전 구역으로 돌려보내!");
  const [hitFlash, setHitFlash] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const enemyId = useRef(4);
  const spawnCount = useRef(0);
  const round = rounds[roundIndex];
  const isCorrectBoundary = boundary === round.bound;
  const correctValues = useMemo(() => round.numbers.filter((value) => round.operator === "이상" ? value >= round.bound : value <= round.bound), [round]);
  const timerPercent = (timeLeft / 45) * 100;
  const boundaryPercent = Math.min(92, Math.max(8, ((boundary - 40) / 280) * 100));
  const boundaryChoices = useMemo(() => Array.from(new Set([round.bound - 80, round.bound - 40, round.bound, round.bound + 40, round.bound + 80].filter((value) => value >= 40 && value <= 320))), [round]);

  const setBoundaryValue = (value: number) => {
    setBoundary(Math.max(40, Math.min(320, value)));
    setMessage(value === round.bound ? "경계가 정확해! 이제 안전 숫자만 클릭해." : "좋아. 숫자 버튼으로 경계를 빠르게 조절할 수 있어.");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    const movement = window.setInterval(() => {
      setEnemies((current) => {
        const next = current.map((enemy) => ({ ...enemy, y: enemy.y + enemy.speed + wave * 0.015 }));
        const reached = next.filter((enemy) => enemy.y >= 82);
        if (reached.length) {
          setLives((value) => Math.max(0, value - reached.length));
          setCombo(0);
          setMessage(`${reached.length}개의 숫자가 방어선을 통과했어. 다시 범위를 확인해!`);
        }
        return next.filter((enemy) => enemy.y < 82);
      });
    }, 360);
    const spawner = window.setInterval(() => {
      const value = round.numbers[spawnCount.current % round.numbers.length];
      spawnCount.current += 1;
      setEnemies((current) => current.length > 5 ? current : [...current, { id: enemyId.current++, value, left: 8 + ((spawnCount.current * 29) % 82), y: -8, speed: 0.2 + (spawnCount.current % 3) * 0.05 }]);
    }, 1350);
    return () => { window.clearInterval(movement); window.clearInterval(spawner); };
  }, [phase, round, wave]);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setTimeLeft((value) => {
      if (value <= 1) { setPhase("cleared"); setMessage("시간 안에 방어선을 지켰어! 다음 게이트가 열려."); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (lives <= 0 && phase === "playing") { setPhase("gameover"); setMessage("방어선이 무너졌어. 범위를 다시 잠그고 재도전하자."); }
  }, [lives, phase]);

  const resetMission = () => {
    setBoundary(round.bound); setPhase("playing"); setTimeLeft(45); setLives(3); setScore(0); setCombo(0); setWave(1); setHintOpen(false); setMessage("적 숫자를 클릭해서 안전 구역으로 돌려보내!");
    setEnemies([{ id: enemyId.current++, value: round.numbers[0], left: 17, y: 14, speed: 0.32 }, { id: enemyId.current++, value: round.numbers[1], left: 43, y: 31, speed: 0.27 }, { id: enemyId.current++, value: round.numbers[2], left: 76, y: 7, speed: 0.23 }]);
  };

  const nextGate = () => {
    const nextIndex = (roundIndex + 1) % rounds.length;
    setRoundIndex(nextIndex); setBoundary(rounds[nextIndex].bound); setPhase("playing"); setTimeLeft(45); setLives(3); setCombo(0); setWave((value) => Math.min(3, value + 1)); setMessage("새 게이트의 기준값을 잠가!");
    setEnemies([{ id: enemyId.current++, value: rounds[nextIndex].numbers[0], left: 20, y: 14, speed: 0.32 }, { id: enemyId.current++, value: rounds[nextIndex].numbers[2], left: 64, y: 28, speed: 0.25 }]);
  };

  const fireAtEnemy = (enemy: Enemy) => {
    if (phase !== "playing") return;
    if (!isCorrectBoundary) {
      setLives((value) => Math.max(0, value - 1)); setCombo(0); setMessage(`먼저 경계를 ${round.bound}에 잠가야 해. 지금은 ${boundary}야.`); setHitFlash(enemy.id); window.setTimeout(() => setHitFlash(null), 240); return;
    }
    const isValid = correctValues.includes(enemy.value);
    if (isValid) {
      setEnemies((current) => current.filter((item) => item.id !== enemy.id)); setCombo((value) => value + 1); setScore((value) => value + 100 + combo * 25); setHitFlash(enemy.id); setMessage(`${enemy.value} 격추 성공! ${round.bound}${round.operator === "이상" ? " 이상" : " 이하"} 구역에 들어왔어.`); window.setTimeout(() => setHitFlash(null), 240);
      if ((combo + 1) % 5 === 0) { setWave((value) => Math.min(3, value + 1)); setMessage("콤보 보너스! 적 웨이브가 빨라졌어."); }
    } else {
      setLives((value) => Math.max(0, value - 1)); setCombo(0); setMessage(`${enemy.value}는 안전 구역 숫자가 아니야. 경계값을 다시 확인해!`); setHitFlash(enemy.id); window.setTimeout(() => setHitFlash(null), 240);
    }
  };

  return (
    <main className="arcade-app">
      <header className="arcade-topbar">
        <div className="brand-lockup"><div className="brand-symbol"><RangeMark /></div><div><p className="brand-kicker">RANGE//LINE ARCADE</p><p className="brand-name">BOUNDARY<span>BREAK</span></p></div></div>
        <div className="topbar-center"><span className="mini-status"><i /> SERVER ONLINE</span><span className="topbar-stage">UNIT 01 / LESSON 02</span></div>
        <div className="topbar-stats"><div><span>SCORE</span><strong>{score.toString().padStart(5, "0")}</strong></div><div className="combo-readout"><Flame size={15} /><span>{combo}x</span></div><button type="button" className="profile-chip">J</button></div>
      </header>

      <div className="arcade-layout">
        <aside className="control-rail">
          <div className="rail-label"><span>MISSION</span><span>02 / 11</span></div>
          <div className="mission-title"><span className="mission-index">LEVEL 02</span><h1>경계선<br /><em>브레이크</em></h1><p>범위 안 숫자만 골라서 방어선을 지켜.</p></div>
          <div className="rule-card"><div className="rule-card__top"><Shield size={18} /><span>RULE CORE</span></div><strong>{round.bound} {round.operator}</strong><p>{round.operator === "이상" ? "같거나 큰 숫자" : "같거나 작은 숫자"}가 안전 구역이야.</p></div>
          <div className="health-block"><div className="health-label"><span>SHIELD</span><span>{lives} / 3</span></div><div className="hearts">{[0, 1, 2].map((index) => <Heart key={index} size={20} fill={index < lives ? "#ff6e72" : "transparent"} color={index < lives ? "#ff6e72" : "#5d6f9f"} />)}</div></div>
          <div className="progress-block"><div className="health-label"><span>GATE PROGRESS</span><span>GATE {roundIndex + 1} / 04</span></div><div className="gate-progress"><i style={{ width: `${((roundIndex + (phase === "cleared" ? 1 : 0)) / rounds.length) * 100}%` }} /></div></div>
          <div className="tip-card"><Lightbulb size={16} /><p><strong>작전 힌트</strong><br />경계값을 먼저 맞춘 뒤, 안전한 숫자 적만 클릭해.</p></div>
        </aside>

        <section className="play-zone">
          <div className="play-header"><div><p className="eyebrow">LIVE DEFENSE / {round.title}</p><h2>{message}</h2></div><div className="play-actions"><button type="button" className="icon-action" onClick={() => setPhase((value) => value === "playing" ? "paused" : "playing")} aria-label="일시정지">{phase === "playing" ? <Pause size={17} /> : <Play size={17} />}</button><button type="button" className="icon-action" onClick={resetMission} aria-label="재시작"><RotateCcw size={17} /></button></div></div>

          <div className="battle-arena">
            <ArenaArt />
            <div className="arena-label arena-label--left"><Crosshair size={15} /> CLICK TO BLAST / SAFE NUMBERS ONLY</div><div className="arena-label arena-label--right">WAVE 0{wave} <span className="wave-dot" /></div>
            <div className="timer-box"><span>TIME</span><strong>{String(timeLeft).padStart(2, "0")}</strong><i style={{ width: `${timerPercent}%` }} /></div>
            <div className="danger-meter"><span>DANGER</span><div>{[0, 1, 2, 3, 4].map((index) => <i key={index} className={index < Math.min(5, Math.ceil(enemies.length / 2)) ? "danger-on" : ""} />)}</div></div>
            <div className="enemy-layer">{enemies.map((enemy) => <EnemyBot key={enemy.id} enemy={enemy} hitFlash={hitFlash === enemy.id} onFire={() => fireAtEnemy(enemy)} />)}</div>
            <div className="shield-line"><span>SHIELD LINE</span><i /></div>
            <div className="pilot-ship"><div className="pilot-ship__core" /><div className="pilot-ship__wing pilot-ship__wing--left" /><div className="pilot-ship__wing pilot-ship__wing--right" /><span>YOU</span></div>
            {phase !== "playing" && <div className="phase-overlay"><div className="overlay-badge">{phase === "cleared" ? <Trophy size={22} /> : phase === "gameover" ? <AlertTriangle size={22} /> : <Pause size={22} />}</div><p className="overlay-kicker">{phase === "cleared" ? "GATE CLEARED" : phase === "gameover" ? "SHIELD DOWN" : "PAUSED"}</p><h3>{phase === "cleared" ? "좋아, 다음 게이트로." : phase === "gameover" ? "한 번 더 잠가 보자." : "잠깐 멈춤"}</h3><p>{phase === "cleared" ? "범위 판단이 정확했어. 더 빠른 웨이브가 기다려." : phase === "gameover" ? "경계값을 정확히 놓고 안전 숫자만 골라야 해." : "작전을 정리하고 다시 시작할 준비가 되면 눌러."}</p><button type="button" className="overlay-action" onClick={phase === "cleared" ? nextGate : resetMission}>{phase === "cleared" ? "NEXT GATE" : phase === "gameover" ? "RETRY RUN" : "RESUME"} <ArrowRight size={16} /></button></div>}
          </div>

          <div className="command-deck">
            <div className="command-copy"><p className="eyebrow">COMMAND DECK</p><h3>경계를 잠그면 공격이 가능해.</h3><p>{isCorrectBoundary ? "좋아. 이제 안전 구역 숫자를 클릭해서 격추해." : `슬라이더를 ${round.bound}에 맞추면 공격 시스템이 열려.`}</p></div>
            <div className="boundary-control"><div className="boundary-control__label"><span>BOUNDARY NODE</span><strong>{boundary}</strong></div><div className="boundary-line"><div className={`boundary-safe boundary-safe--${round.operator === "이상" ? "right" : "left"}`} style={round.operator === "이상" ? { left: `${boundaryPercent}%`, right: 0 } : { left: 0, right: `${100 - boundaryPercent}%` }} /><div className="boundary-track" /><div className="boundary-handle" style={{ left: `${boundaryPercent}%` }}><span>{boundary}</span><i /></div></div><input type="range" min="40" max="320" step="5" value={boundary} onChange={(event) => setBoundaryValue(Number(event.target.value))} aria-label="경계 노드" /><div className="boundary-scale"><span>40</span><span>120</span><span>200</span><span>320</span></div><div className="boundary-quick-row">{boundaryChoices.map((value) => <button type="button" key={value} className={value === boundary ? "boundary-quick boundary-quick--active" : "boundary-quick"} onClick={() => setBoundaryValue(value)}>{value}{value === round.bound && <small>정답</small>}</button>)}<label className="boundary-input"><span>직접입력</span><input type="number" min="40" max="320" step="1" value={boundary} onChange={(event) => setBoundaryValue(Number(event.target.value))} /></label></div><button type="button" className="snap-button" onClick={() => setBoundaryValue(round.bound)}><Target size={14} /> 기준값 {round.bound}에 바로 맞추기</button></div>
            <div className="command-rule"><div className={`operator-chip operator-chip--${round.operator === "이상" ? "mint" : "orange"}`}>{round.operator}</div><span>{round.bound} 포함</span></div>
          </div>

          <div className="learning-strip"><div className="learning-card"><div className="learning-visual learning-visual--one"><span>1</span><i /></div><div><strong>기준값 찾기</strong><p>미션의 숫자를 먼저 확인해.</p></div></div><div className="learning-card"><div className="learning-visual learning-visual--two"><i /><b /></div><div><strong>경계값 포함</strong><p>이상·이하는 기준값도 포함!</p></div></div><div className="learning-card"><div className="learning-visual learning-visual--three"><span>127</span><Check size={13} /></div><div><strong>안전 숫자 클릭</strong><p>구간 안의 적만 격추해.</p></div></div></div>

          {hintOpen && <div className="hint-strip"><Lightbulb size={16} /><span><strong>힌트:</strong> {round.operator === "이상" ? "이상은 기준값을 포함해. 120도 안전 숫자야." : "이하는 기준값을 포함해. 85도 안전 숫자야."}</span></div>}
        </section>
      </div>

      <footer className="arcade-footer"><span><i className="online-dot" /> TRAINING RUN</span><span>RANGE//LINE ENGINE 0.2</span><button type="button" onClick={() => setHintOpen((value) => !value)}><Sparkles size={14} /> {hintOpen ? "HINT ON" : "NEED A HINT?"}</button><span className="footer-right"><Gamepad2 size={14} /> KEYBOARD + TOUCH READY</span></footer>
    </main>
  );
}
