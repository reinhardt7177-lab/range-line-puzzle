import { useState } from "react";
import { quests } from "@/lib/questionBank";
import "./review-toolbar.css";

export default function ReviewToolbar() {
  const params = new URLSearchParams(window.location.search);
  const enabled = params.get("review") === "1";
  const [questId, setQuestId] = useState(() => {
    const id = Number(params.get("quest"));
    return Number.isInteger(id) && id >= 1 && id <= quests.length ? id : 1;
  });
  const [screen, setScreen] = useState(params.get("screen") ?? "map");
  const [question, setQuestion] = useState(Number(params.get("q")) || 0);
  const quest = quests[questId - 1];
  if (!enabled) return null;
  return <aside className="review-toolbar" aria-label="전체 관문 점검">
    <div className="review-toolbar__heading"><strong>전체 관문 열림</strong><span>점검 기록은 학습 기록과 따로 저장됩니다.</span><a href="/">점검 종료</a></div>
    <form onSubmit={(event) => {
      event.preventDefault();
      window.location.search = new URLSearchParams({ review: "1", quest: String(questId), screen, q: String(question) }).toString();
    }}>
      <label>관문<select value={questId} onChange={(event) => { setQuestId(Number(event.target.value)); setQuestion(0); }}>
        {quests.map((item) => <option key={item.id} value={item.id}>{String(item.id).padStart(2, "0")} · {item.title}</option>)}
      </select></label>
      <label>화면<select value={screen} onChange={(event) => setScreen(event.target.value)}>
        <option value="map">전체 지도</option><option value="brief">관문 소개</option><option value="diagnostic">시작 진단</option><option value="play">문제 풀이</option><option value="study">요점 노트</option><option value="boss-prep">보스 준비</option><option value="boss">보스 문제</option><option value="notes">오답 노트</option><option value="achievements">업적</option>
      </select></label>
      {screen === "play" && <label>문항<select value={question} onChange={(event) => setQuestion(Number(event.target.value))}>
        {quest.questions.map((_, index) => <option key={index} value={index}>{index + 1} / {quest.questions.length}</option>)}
      </select></label>}
      <button type="submit">선택 화면 열기</button>
    </form>
  </aside>;
}
