import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Lightbulb,
  ListChecks,
  Minus,
  RotateCcw,
  Send,
  Target,
  TrendingUp,
} from "lucide-react";

// Design reminder: quiet, precise study desk. Theory and practice stay visible;
// no story, game economy, animated characters, or decorative game HUD.

type Section = "overview" | "range" | "rounding" | "practice";
type Question = { id: number; tag: string; prompt: string; type: "choice" | "input"; options?: string[]; answer: string; explanation: string; hint: string };

const questions: Question[] = [
  { id: 1, tag: "이상·이하", prompt: "‘120 이상’인 수를 모두 고르세요.", type: "choice", options: ["112", "120", "127", "98"], answer: "120,127", explanation: "‘이상’은 기준 수를 포함하고 그보다 큰 수를 뜻해요. 따라서 120과 127이 해당합니다.", hint: "이상은 기준값을 포함해요." },
  { id: 2, tag: "초과·미만", prompt: "‘85 미만’인 수를 고르세요.", type: "choice", options: ["85", "84", "90", "76"], answer: "84,76", explanation: "‘미만’은 기준 수를 포함하지 않고 그보다 작은 수를 뜻해요. 85는 포함하지 않습니다.", hint: "미만은 기준값을 포함하지 않아요." },
  { id: 3, tag: "수직선", prompt: "수직선에서 ●  표시가 기준값에 있다면, 알맞은 표현은 무엇일까요?", type: "choice", options: ["이상 또는 이하", "초과 또는 미만", "반드시 초과", "어림값"], answer: "이상 또는 이하", explanation: "채워진 점은 기준값을 포함한다는 뜻이에요. 따라서 이상 또는 이하와 연결됩니다.", hint: "채워진 점은 기준값을 포함해요." },
  { id: 4, tag: "올림", prompt: "438을 백의 자리까지 올림한 수를 입력하세요.", type: "input", answer: "500", explanation: "백의 자리까지 올림하면 백의 자리 아래 수를 모두 올려요. 438은 500이 됩니다.", hint: "백의 자리 아래에 38이 남아 있어요." },
  { id: 5, tag: "버림", prompt: "764를 십의 자리까지 버림한 수를 입력하세요.", type: "input", answer: "760", explanation: "십의 자리까지 버림하면 일의 자리 4를 버려요. 764는 760이 됩니다.", hint: "십의 자리 아래인 일의 자리를 버려요." },
  { id: 6, tag: "반올림", prompt: "3,650을 천의 자리까지 반올림한 수를 고르세요.", type: "choice", options: ["3,000", "3,600", "4,000", "3,700"], answer: "4000", explanation: "천의 자리 아래인 백의 자리가 6이므로 올려서 4,000이 됩니다.", hint: "반올림할 자리 바로 아래 숫자를 보세요." },
  { id: 7, tag: "방법 선택", prompt: "사과를 한 상자에 10개씩 담습니다. 83개를 모두 담으려면 상자는 몇 개 필요할까요?", type: "choice", options: ["8개", "9개", "10개", "80개"], answer: "9개", explanation: "모두 담아야 하므로 부족하지 않게 올림합니다. 83은 80보다 크므로 9상자가 필요해요.", hint: "‘모두 담기’는 부족하면 안 되는 상황이에요." },
  { id: 8, tag: "방법 선택", prompt: "학급 학생 287명의 대략적인 인원을 백의 자리까지 나타내려고 합니다. 어떤 방법이 알맞을까요?", type: "choice", options: ["올림", "버림", "반올림", "이상"], answer: "반올림", explanation: "대략적인 인원을 가장 가까운 값으로 나타내므로 반올림이 알맞아요. 287명은 약 300명입니다.", hint: "가장 가까운 값이 필요할 때 사용하는 방법을 생각해요." },
];

const theory = [
  { id: "range", title: "수의 범위", tone: "blue", summary: "기준값을 포함하는지에 따라 범위를 말해요.", body: "이상과 이하는 기준값을 포함하고, 초과와 미만은 기준값을 포함하지 않아요.", examples: ["120 이상 → 120과 같거나 큰 수", "85 이하 → 85와 같거나 작은 수", "20 초과 → 20보다 큰 수", "40 미만 → 40보다 작은 수"] },
  { id: "line", title: "수직선으로 나타내기", tone: "mint", summary: "채워진 점과 빈 점으로 경계값을 구분해요.", body: "기준값을 포함하면 채워진 점(●), 포함하지 않으면 빈 점(○)으로 표시해요.", examples: ["이상·이하 → ● 기준값 포함", "초과·미만 → ○ 기준값 제외"] },
  { id: "round", title: "올림·버림·반올림", tone: "orange", summary: "필요한 자리까지 수를 간단하게 나타내요.", body: "올림은 부족하지 않게, 버림은 완전한 묶음만, 반올림은 가장 가까운 값으로 나타낼 때 사용해요.", examples: ["438을 백의 자리까지 올림 → 500", "764를 십의 자리까지 버림 → 760", "3,650을 천의 자리까지 반올림 → 4,000"] },
];

function NumberLine({ type }: { type: "included" | "excluded" }) {
  return <div className="theory-line"><span>100</span><div className="theory-line__track"><i className={type === "included" ? "theory-line__safe theory-line__safe--right" : "theory-line__safe theory-line__safe--right theory-line__safe--excluded"} /><b className={type === "included" ? "theory-node theory-node--filled" : "theory-node theory-node--empty"} /></div><span>140</span></div>;
}

export default function Home() {
  const [section, setSection] = useState<Section>("practice");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const question = questions[questionIndex];
  const normalizedAnswer = (value: string) => value.replace(/\s/g, "").split(",").sort().join(",");
  const currentAnswer = question.type === "input" ? input : selected.join(",");
  const isCorrect = submitted && normalizedAnswer(currentAnswer) === normalizedAnswer(question.answer);
  const progress = Math.round((correctCount / questions.length) * 100);
  const topicProgress = useMemo(() => theory.map((item, index) => ({ ...item, done: index === 0 ? correctCount >= 2 : index === 1 ? correctCount >= 4 : correctCount >= 6 })), [correctCount]);

  const resetAnswer = () => { setSelected([]); setInput(""); setSubmitted(false); setShowHint(false); };
  const submit = () => {
    if (!currentAnswer) return;
    const result = normalizedAnswer(currentAnswer) === normalizedAnswer(question.answer);
    setSubmitted(true);
    if (result) setCorrectCount((value) => Math.max(value, questionIndex + 1));
    else setWrongIds((ids) => ids.includes(question.id) ? ids : [...ids, question.id]);
  };
  const next = () => { setQuestionIndex((value) => (value + 1) % questions.length); resetAnswer(); };
  const chooseOption = (option: string) => { if (submitted) return; setSelected((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]); };

  return (
    <main className="study-app">
      <header className="study-header"><div className="study-brand"><div className="study-logo"><BookOpen size={20} /></div><div><p>ICECREAM MATH · 5-2</p><strong>수학 공부방</strong></div></div><div className="study-header__center"><span>1단원</span><ChevronRight size={14} /><strong>수의 범위와 어림하기</strong></div><div className="study-profile"><span>오늘의 학습</span><b>{correctCount} / {questions.length}</b><div className="profile-avatar">J</div></div></header>

      <div className="study-layout"><aside className="study-sidebar"><div className="sidebar-label">UNIT 01 · 학습 목차</div><h1>수의 범위와<br /><em>어림하기</em></h1><p className="sidebar-desc">개념을 읽고, 문제를 풀며<br />나의 수학 실력을 확인해요.</p><nav className="study-nav"><button type="button" className={section === "overview" ? "nav-item nav-item--active" : "nav-item"} onClick={() => setSection("overview")}><span className="nav-icon"><BookOpen size={16} /></span><span><b>단원 한눈에 보기</b><small>핵심 개념 3개</small></span><ChevronRight size={15} /></button><button type="button" className={section === "range" ? "nav-item nav-item--active" : "nav-item"} onClick={() => setSection("range")}><span className="nav-icon nav-icon--mint"><Target size={16} /></span><span><b>수의 범위</b><small>이상·이하·초과·미만</small></span><span className={topicProgress[0].done ? "nav-check nav-check--done" : "nav-check"}>{topicProgress[0].done ? <Check size={13} /> : "1"}</span></button><button type="button" className={section === "rounding" ? "nav-item nav-item--active" : "nav-item"} onClick={() => setSection("rounding")}><span className="nav-icon nav-icon--orange"><TrendingUp size={16} /></span><span><b>어림하기</b><small>올림·버림·반올림</small></span><span className={topicProgress[2].done ? "nav-check nav-check--done" : "nav-check"}>{topicProgress[2].done ? <Check size={13} /> : "2"}</span></button><button type="button" className={section === "practice" ? "nav-item nav-item--active" : "nav-item"} onClick={() => setSection("practice")}><span className="nav-icon nav-icon--purple"><ListChecks size={16} /></span><span><b>연습 문제</b><small>총 8문제 · 현재 {questionIndex + 1}번</small></span><span className="nav-check">{correctCount}</span></button></nav><div className="sidebar-progress"><div className="progress-heading"><span>단원 진행률</span><strong>{progress}%</strong></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><p>{progress >= 75 ? "거의 다 왔어요." : "하나씩 정확하게 풀어 봐요."}</p></div><div className="sidebar-note"><Lightbulb size={17} /><p><strong>공부 팁</strong><br />헷갈린 문제는 해설을 읽고 비슷한 문제를 다시 풀어 보세요.</p></div></aside>

        <section className="study-main">{section === "practice" ? <><div className="content-heading"><div><p className="content-kicker">PRACTICE · 문제 풀이</p><h2>개념을 확인해 볼까요?</h2><p>문제를 읽고 알맞은 답을 선택하세요. 틀려도 괜찮아요.</p></div><div className="question-counter"><span>QUESTION</span><strong>{String(questionIndex + 1).padStart(2, "0")}</strong><small>/ {String(questions.length).padStart(2, "0")}</small></div></div><div className="question-card"><div className="question-card__meta"><span className="tag tag--blue">{question.tag}</span><span className="difficulty"><i /> 기본 확인</span></div><h3>{question.prompt}</h3>{question.type === "choice" ? <div className="option-grid">{question.options?.map((option) => <button type="button" key={option} disabled={submitted} className={`option-button ${selected.includes(option) ? "option-button--selected" : ""} ${submitted && question.answer.split(",").includes(option.replace(/,/g, "")) ? "option-button--answer" : ""}`} onClick={() => chooseOption(option)}><span className="option-letter">{String.fromCharCode(65 + (question.options?.indexOf(option) ?? 0))}</span><strong>{option}</strong>{selected.includes(option) && <Check size={17} />}</button>)}</div> : <div className="answer-input-wrap"><label>답을 숫자로 입력하세요<input value={input} disabled={submitted} onChange={(event) => setInput(event.target.value.replace(/[^0-9,]/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} placeholder="예: 500" inputMode="numeric" /></label><span>쉼표가 있는 수는 쉼표 없이 입력해도 돼요.</span></div>}<div className="question-actions"><button type="button" className="hint-button" onClick={() => setShowHint((value) => !value)}><Lightbulb size={16} /> 힌트 보기</button>{!submitted ? <button type="button" className="submit-button" onClick={submit} disabled={!currentAnswer}>정답 확인 <Send size={16} /></button> : <button type="button" className="next-button" onClick={next}>다음 문제 <ChevronRight size={17} /></button>}</div>{showHint && <div className="hint-box"><Lightbulb size={16} /><span><strong>힌트</strong>{question.hint}</span></div>}{submitted && <div className={isCorrect ? "feedback feedback--correct" : "feedback feedback--wrong"}><div className="feedback-icon">{isCorrect ? <Check size={20} /> : <CircleAlert size={20} />}</div><div><strong>{isCorrect ? "정답이에요!" : "다시 생각해 볼까요?"}</strong><p>{isCorrect ? question.explanation : `정답은 ${question.answer.split(",").join(", ")}이에요. ${question.explanation}`}</p></div>{!isCorrect && <button type="button" onClick={resetAnswer}><RotateCcw size={15} /> 다시 풀기</button>}</div>}</div><div className="practice-footer"><span><ListChecks size={14} /> 한 문제씩 차근차근</span><span>{wrongIds.length > 0 ? `오답 기록 ${wrongIds.length}개` : "아직 오답이 없어요"}</span></div></> : <TheoryView section={section} onPractice={() => setSection("practice")} />}</section>
      </div>
    </main>
  );
}

function TheoryView({ section, onPractice }: { section: Section; onPractice: () => void }) {
  const items = section === "overview" ? theory : section === "range" ? theory.slice(0, 2) : theory.slice(2);
  return <div className="theory-view"><div className="content-heading"><div><p className="content-kicker">THEORY · 개념 정리</p><h2>{section === "overview" ? "이번 단원에서 배워요" : section === "range" ? "수의 범위" : "어림하기"}</h2><p>문제를 풀기 전에 핵심 개념을 간단히 확인해 보세요.</p></div><button type="button" className="practice-link" onClick={onPractice}>연습 문제 풀기 <ChevronRight size={16} /></button></div><div className="theory-stack">{items.map((item) => <article className={`theory-card theory-card--${item.tone}`} key={item.id}><div className="theory-card__header"><div className="theory-number">{item.id === "range" ? "01" : item.id === "line" ? "02" : "03"}</div><div><h3>{item.title}</h3><p>{item.summary}</p></div></div><div className="theory-card__body"><p>{item.body}</p>{item.id === "line" && <div className="line-examples"><div><NumberLine type="included" /><strong>● 기준값 포함</strong><span>이상 · 이하</span></div><div><NumberLine type="excluded" /><strong>○ 기준값 제외</strong><span>초과 · 미만</span></div></div>}{item.id !== "line" && <div className="example-list">{item.examples.map((example) => <div key={example}><Check size={15} /> <span>{example}</span></div>)}</div>}</div></article>)}</div><div className="theory-callout"><CircleAlert size={18} /><div><strong>자주 하는 실수</strong><p>‘이상·이하’는 기준값을 포함하지만, ‘초과·미만’은 기준값을 포함하지 않아요.</p></div></div></div>;
}
