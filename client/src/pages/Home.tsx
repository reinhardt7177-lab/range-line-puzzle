import { useMemo, useState } from "react";
import "../lumi-overrides.css";
import { ArrowRight, Check, Heart, Home as HomeIcon, Lock, RotateCcw, Sparkles, Star, Wind, X } from "lucide-react";

// Design reminder: 별빛 구조대 루미 — storybook play, warm emotion, no HUD-first layout.
// Math is the path-building action: choose numbers that satisfy 이상/이하.

type Operator = "이상" | "이하";
type Phase = "story" | "play" | "success" | "mistake" | "complete";

type Scene = {
  title: string;
  story: string;
  bound: number;
  operator: Operator;
  numbers: number[];
  safeMessage: string;
  sky: "forest" | "cloud" | "home";
};

const scenes: Scene[] = [
  { title: "첫 번째 별 조각", story: "폭풍이 지나간 숲에 별 조각이 떨어졌어. 루미가 집으로 갈 길을 밝혀 주자.", bound: 120, operator: "이상", numbers: [82, 120, 137, 96], safeMessage: "120과 137이 길을 밝혔어!", sky: "forest" },
  { title: "구름 사이의 길", story: "바람이 더 세졌어. 낮은 구름길을 찾아야 루미가 무사히 건널 수 있어.", bound: 85, operator: "이하", numbers: [62, 85, 96, 110], safeMessage: "62와 85가 구름길을 만들었어!", sky: "cloud" },
  { title: "집으로 가는 문", story: "마지막 문은 기준값을 꼭 기억하는 별빛 문이야. 루미의 집이 기다리고 있어.", bound: 300, operator: "이상", numbers: [249, 300, 318, 281], safeMessage: "300과 318이 마지막 문을 열었어!", sky: "home" },
];

function StoryArt({ sky, glow = 0 }: { sky: Scene["sky"]; glow?: number }) {
  return (
    <svg className="story-art" viewBox="0 0 720 460" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="lumiSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2767" /><stop offset="0.62" stopColor="#4a4285" /><stop offset="1" stopColor="#f6a873" /></linearGradient>
        <linearGradient id="lumiGround" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#233767" /><stop offset="1" stopColor="#112343" /></linearGradient>
        <filter id="lumiGlow"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="720" height="460" fill="url(#lumiSky)" />
      <circle cx="585" cy="96" r="52" fill="#fff1c7" opacity=".93" filter="url(#lumiGlow)" /><circle cx="603" cy="84" r="52" fill="#554982" />
      <g fill="#fff1c7" opacity=".85"><circle cx="87" cy="67" r="2" /><circle cx="160" cy="117" r="1.5" /><circle cx="267" cy="51" r="2" /><circle cx="389" cy="92" r="1.5" /><circle cx="501" cy="43" r="2" /><circle cx="663" cy="157" r="1.5" /><circle cx="47" cy="188" r="1.2" /></g>
      <path d="M0 304 Q115 251 218 311 T421 287 T720 302 V460 H0Z" fill="#263664" opacity=".92" /><path d="M0 356 Q128 286 236 343 T465 335 T720 345 V460 H0Z" fill="url(#lumiGround)" />
      <g opacity=".38" fill="#172b50"><path d="M45 340 l31-88 29 88z" /><path d="M133 340 l43-117 41 117z" /><path d="M550 341 l42-120 45 120z" /><path d="M633 340 l29-91 27 91z" /></g>
      {sky === "cloud" && <g fill="#f6d3c1" opacity=".9"><path d="M0 228 C80 168 142 216 201 188 C267 157 315 208 375 183 C451 152 493 204 553 179 C620 151 678 193 720 163 V278 H0Z" /><path d="M0 270 C70 236 131 264 201 240 C287 213 346 264 420 236 C486 211 559 259 629 228 C673 209 704 224 720 218 V302 H0Z" opacity=".65" /></g>}
      <g transform="translate(112 286)"><path d="M0 95 L50 22 L103 95Z" fill="#263a68" stroke="#9b9edb" strokeWidth="3" /><path d="M30 95 V62 H72 V95" fill="#ef9a78" /><path d="M41 62 Q51 47 61 62" fill="#ffdfad" /><path d="M29 30 L50 0 L75 30" fill="#f7bd79" /><circle cx="50" cy="26" r="7" fill="#fff1c7" filter="url(#lumiGlow)" /><path d="M50 7 V-18" stroke="#f7bd79" strokeWidth="3" /><circle cx="50" cy="-21" r="5" fill="#f9d67e" /></g>
      <path d="M480 374 Q530 337 592 363 T720 350" fill="none" stroke="#f9d786" strokeWidth="4" opacity={0.22 + glow * .12} filter="url(#lumiGlow)" />
      <g transform="translate(385 314)" filter="url(#lumiGlow)"><path d="M28 0 L36 20 L58 21 L41 35 L47 57 L28 44 L8 57 L14 35 L-3 21 L20 20Z" fill="#ffdf8b" /><circle cx="21" cy="27" r="3" fill="#3a326e" /><circle cx="35" cy="27" r="3" fill="#3a326e" /><path d="M23 35 Q28 41 34 35" fill="none" stroke="#3a326e" strokeWidth="2" strokeLinecap="round" /></g>
      {glow > 0 && <g fill="#fff1ae" opacity={Math.min(0.9, glow * .18)} filter="url(#lumiGlow)"><circle cx="287" cy="303" r="5" /><circle cx="336" cy="337" r="4" /><circle cx="430" cy="286" r="5" /><circle cx="462" cy="328" r="3" /><circle cx="520" cy="307" r="4" /></g>}
    </svg>
  );
}

function LumiMark({ small = false }: { small?: boolean }) {
  return <span className={small ? "lumi-mark lumi-mark--small" : "lumi-mark"}><span className="lumi-mark__star">★</span><span className="lumi-mark__eye lumi-mark__eye--a" /><span className="lumi-mark__eye lumi-mark__eye--b" /></span>;
}

export default function Home() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("story");
  const [picked, setPicked] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [light, setLight] = useState(0);
  const [mistakeValue, setMistakeValue] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const scene = scenes[sceneIndex];
  const safeNumbers = useMemo(() => scene.numbers.filter((value) => scene.operator === "이상" ? value >= scene.bound : value <= scene.bound), [scene]);
  const progress = ((sceneIndex + (phase === "success" || phase === "complete" ? 1 : 0)) / scenes.length) * 100;

  const beginScene = () => { setPicked([]); setMistakeValue(null); setMessage(""); setPhase("play"); };
  const pickFromStory = (value: number) => {
    const correct = safeNumbers.includes(value);
    setPicked(correct ? [value] : []);
    setMistakeValue(correct ? null : value);
    setLight(correct ? 1 : 0);
    setMessage(correct ? "좋아, 이 별이 루미의 길을 밝혀 줘!" : `${value}은(는) 아직 경계 밖이야.`);
    setPhase(correct ? "play" : "mistake");
  };
  const chooseNumber = (value: number) => {
    if (phase !== "play") return;
    const correct = safeNumbers.includes(value);
    if (!correct) {
      setMistakeValue(value); setLives((current) => Math.max(0, current - 1)); setPhase("mistake"); setMessage(`${value}은(는) ${scene.bound} ${scene.operator === "이상" ? "보다 작아" : "보다 커"}.`); return;
    }
    if (!picked.includes(value)) {
      const next = [...picked, value]; setPicked(next); setLight((current) => Math.min(6, current + 1));
      if (safeNumbers.every((item) => next.includes(item))) { setMessage(scene.safeMessage); setPhase("success"); } else setMessage("좋아! 길이 한 칸 더 빛났어.");
    }
  };
  const nextScene = () => { if (sceneIndex === scenes.length - 1) setPhase("complete"); else { setSceneIndex((current) => current + 1); setPhase("story"); } };
  const restart = () => { setSceneIndex(0); setPhase("story"); setPicked([]); setLives(3); setLight(0); setMistakeValue(null); setMessage(""); };

  return (
    <main className="lumi-app">
      <header className="lumi-header"><div className="lumi-brand"><div className="lumi-logo"><LumiMark small /></div><div><p>STARLIGHT RESCUE</p><strong>루미의 귀가</strong></div></div><div className="chapter-count">밤 {sceneIndex + 1} <span>/</span> 3</div><div className="header-tools"><div className="home-light"><HomeIcon size={15} /><span>집의 빛</span><div>{[0, 1, 2, 3, 4, 5].map((item) => <i key={item} className={item < light ? "on" : ""} />)}</div></div><div className="heart-row">{[0, 1, 2].map((item) => <Heart key={item} size={18} fill={item < lives ? "#ff8f83" : "transparent"} color={item < lives ? "#ff8f83" : "#c5bfd0"} />)}</div></div></header>

      <div className="lumi-progress"><div style={{ width: `${progress}%` }} /></div>

      {phase === "complete" ? <section className="complete-screen"><div className="complete-art"><StoryArt sky="home" glow={6} /><div className="complete-lumi"><LumiMark /></div></div><div className="complete-copy"><p className="overline">STARLIGHT RESTORED</p><h1>루미가<br /><em>집에 도착했어.</em></h1><p>네가 고른 별 조각으로 밤하늘이 다시 빛났어. 루미는 오늘의 길을 오래 기억할 거야.</p><div className="final-reward"><Sparkles size={21} /><div><strong>별빛 구조대 배지 획득</strong><span>기준값을 포함한 범위를 찾았어요.</span></div></div><button type="button" className="lumi-button" onClick={restart}>다시 별빛 모으기 <RotateCcw size={16} /></button></div></section> : <section className="lumi-stage"><div className="stage-scene"><StoryArt sky={scene.sky} glow={light} /><div className="scene-vignette" /><div className="scene-caption"><span className="chapter-tag">밤 {sceneIndex + 1} · {scene.title}</span><h1>{phase === "story" ? "루미의 집에" : "빛나는 길을"}<br /><em>{phase === "story" ? "돌아가는 길" : "만들어 주세요"}</em></h1></div><div className="lumi-speech"><LumiMark small /><span>{phase === "story" ? "별 조각을 찾아서 집에 가고 싶어…" : phase === "mistake" ? "앗, 바람이 불었어. 다른 조각을 골라 보자!" : phase === "success" ? "내 길이 빛나고 있어!" : "어떤 조각이 내 길일까?"}</span></div><div className="scene-shard-preview"><p>루미의 길을 밝혀 줄 별</p><div>{scene.numbers.map((value) => <button type="button" key={value} onClick={() => pickFromStory(value)} className={picked.includes(value) ? "story-shard story-shard--picked" : mistakeValue === value ? "story-shard story-shard--mistake" : "story-shard"}><Star size={17} fill="currentColor" /><strong>{value}</strong></button>)}</div></div><div className="scene-home-label"><HomeIcon size={14} /> LUMI'S HOME</div></div>

          <div className="play-panel">{phase === "story" && <div className="story-card"><p className="overline">루미에게 온 별빛 편지</p><h2>{scene.story}</h2><p className="story-magic-line">{scene.bound}보다 {scene.operator === "이상" ? "크거나 같은" : "작거나 같은"} 별만 루미의 길을 밝혀 줘.</p><div className="rule-preview"><div className="rule-icon"><Star size={18} fill="currentColor" /></div><div><span>오늘 밤의 별빛 규칙</span><strong>{scene.bound} {scene.operator}</strong><small>{scene.operator === "이상" ? "같거나 큰 조각을 찾아요" : "같거나 작은 조각을 찾아요"}</small></div></div><button type="button" className="lumi-button lumi-button--wide" onClick={beginScene}>길을 찾아 출발하기 <ArrowRight size={18} /></button><p className="tiny-note">위 장면의 별을 바로 눌러도 좋아요.</p></div>}
          {(phase === "play" || phase === "mistake" || phase === "success") && <div className="choice-card"><div className="choice-card__top"><div><p className="overline">CHOOSE THE STAR SHARDS</p><h2><strong>{scene.bound} {scene.operator}</strong>인 조각을 골라 줘.</h2></div><div className="choice-rule"><span>기준값</span><b>{scene.bound}</b><i>{scene.operator === "이상" ? "포함" : "포함"}</i></div></div><div className="path-preview"><div className="path-line"><i className="path-light" style={{ width: `${Math.min(93, 23 + picked.length * 24)}%` }} /></div><div className="path-lumi"><LumiMark small /></div><div className="path-home"><HomeIcon size={18} /></div></div><p className="choose-help">{message || "정답 별 조각을 모두 모으면 길이 완성돼요."}</p><div className="shard-grid">{scene.numbers.map((value) => { const isPicked = picked.includes(value); const isMistake = mistakeValue === value; return <button type="button" key={value} className={`shard-button ${isPicked ? "shard-button--picked" : ""} ${isMistake ? "shard-button--mistake" : ""}`} onClick={() => chooseNumber(value)}><span className="shard-crystal"><Star size={20} fill="currentColor" /></span><strong>{value}</strong>{isPicked && <Check size={15} />}{isMistake && <X size={15} />}</button>; })}</div>{phase === "mistake" && <div className="mistake-note"><Wind size={16} /><span><strong>{mistakeValue}</strong>은(는) 경계 밖이에요. {scene.bound} {scene.operator === "이상" ? "이상" : "이하"}를 다시 생각해 보자.</span><button type="button" onClick={() => { setMistakeValue(null); setPhase("play"); }}>다시 고르기</button></div>}{phase === "success" && <div className="success-note"><Sparkles size={17} /><span>{scene.safeMessage} 이제 다음 밤으로 갈 수 있어.</span><button type="button" onClick={nextScene}>{sceneIndex === scenes.length - 1 ? "집 불 켜기" : "다음 장면"} <ArrowRight size={15} /></button></div>}</div>}
          <div className="learning-foot"><span><Lock size={13} /> 수학 미션 {sceneIndex + 1}</span><span>정답 별빛 {picked.length} / {safeNumbers.length}</span></div></div></section>}
    </main>
  );
}
