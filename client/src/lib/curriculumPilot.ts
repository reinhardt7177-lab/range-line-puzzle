import type { Quest, QuestQuestion, QuestionVisual, BossChallenge } from "./questionBank";
const make = (prompt: string, options: string[], answer: string, explanation: string, extra: Partial<QuestQuestion> = {}): QuestQuestion => ({ category: "기본 연습", prompt, options, answers: [answer], explanation, hint: "그림의 기준과 문제에서 구하려는 것을 차례로 확인해 보세요.", ...extra });
export const parcelTable: QuestionVisual = { type: "rate-table", title: "이 문제에서 사용하는 택배 요금표", rows: [
{range:"2kg 이하",size:"60cm 이하",fee:"6,000원"},
{range:"2kg 초과 10kg 이하",size:"60cm 초과 120cm 이하",fee:"7,000원"},
{range:"10kg 초과 20kg 이하",size:"120cm 초과 140cm 이하",fee:"8,000원"},
{range:"20kg 초과 30kg 이하",size:"140cm 초과 160cm 이하",fee:"9,000원"}] };
export function parcelFee(weight: number, size: number) {
 const w = [2,10,20,30].findIndex(n=>weight<=n), s = [60,120,140,160].findIndex(n=>size<=n);
 if (weight<=0 || size<=0 || w<0 || s<0) throw new Error("요금표 범위 밖");
 return 6000 + Math.max(w,s)*1000;
}
export const pilotQuestions: Record<number, QuestQuestion[]> = {
3: [
 make("40보다 작은 수만 고르려면 40도 넣어야 할까요?",["40도 넣어요","40은 빼요"],"40은 빼요","40보다 작은 수에는 40이 들어가지 않아요. 이를 40 미만이라고 해요.",{category:"개념 확인"}),
 make("30 초과인 수는 무엇일까요?",["29.9","30","30.1"],"30.1","초과는 같은 수를 제외해요. 30보다 큰 30.1이 들어가요."),
 make("아래 수직선이 나타내는 수의 범위는 무엇일까요?",["45 미만","45 이하","45 이상","45 초과"],"45 미만","45의 빈 점은 45를 제외한다는 뜻이에요. 왼쪽은 작은 수 쪽이므로 45 미만이에요.",{numberLine:{min:30,max:60,step:5,start:45,startIncluded:false,direction:"left"}}),
 make("아래 수직선이 나타내는 범위를 고르세요.",["30 초과","30 이상","30 미만"],"30 초과","30은 빈 점이므로 제외하고 오른쪽의 큰 수를 나타내요.",{numberLine:{min:10,max:50,step:10,start:30,startIncluded:false,direction:"right"}}),
 make("‘45 미만’을 수직선에 직접 나타내 보세요. 기준점, 점 모양, 방향을 골라요.",[],"45|exclude|left","45에 빈 점을 놓고 왼쪽으로 범위선을 그어요.",{interactiveNumberLine:{min:30,max:60,step:5,start:45,startIncluded:false,direction:"left"},category:"적용"}),
 make("‘10.5 미만’을 수직선에 직접 나타내 보세요.",[],"10.5|exclude|left","10.5는 제외하므로 빈 점, 작은 수 쪽인 왼쪽을 선택해요.",{interactiveNumberLine:{min:10,max:11,step:0.1,start:10.5,startIncluded:false,direction:"left"},category:"적용"}),
 make("친구가 ‘45 미만에는 45도 들어가’라고 말했어요. 바르게 고친 것은?",["미만에는 45가 들어가지 않아요","미만과 이하는 같은 뜻이에요"],"미만에는 45가 들어가지 않아요","45 이하에는 45가 들어가지만 45 미만에는 들어가지 않아요.",{category:"오개념 교정"}),
 make("수 카드 2, 4, 9를 한 번씩 써서 만든 세 자리 수 중 500 미만인 가장 큰 수는?",[],"492","백의 자리는 4로 하고 남은 9, 2를 큰 자리부터 놓으면 492예요.",{input:true,category:"도전"})
],
5: [
 make("쿠키가 243개 필요해요. 10개들이 상자로만 산다면 쿠키를 최소 몇 개 사야 할까요?",["240개","250개","243개"],"250개","240개로는 3개가 부족해요. 다음 10개 묶음까지 준비하면 250개예요.",{category:"개념 확인",visual:{type:"place-value",value:"243",place:"십의 자리",kept:"24",tail:"3"}}),
 make("243을 올림하여 백의 자리까지 나타내세요.",[],"300","백의 자리 아래 부분 43을 100으로 생각해 300으로 나타내요.",{input:true,visual:{type:"place-value",value:"243",place:"백의 자리",kept:"2",tail:"43"}}),
 make("쿠키 243개를 준비하려고 10개들이 상자를 사요. 250개를 사려면 상자는 몇 개일까요?",[],"25","어림한 쿠키 수는 250개이고, 250÷10=25이므로 상자는 25개예요.",{input:true,category:"적용"}),
 make("쿠키 243개를 100개들이 상자로만 사면 최소 몇 상자가 필요할까요?",["2상자","3상자","300상자"],"3상자","쿠키를 300개 사야 하므로 100개들이 상자는 3개예요. 쿠키 수와 상자 수의 단위를 구분해요.",{category:"적용"}),
 make("523을 올림하여 십의 자리까지 나타내세요.",[],"530","십의 자리 아래 3이 남으므로 520이 아니라 530으로 나타내요.",{input:true,visual:{type:"place-value",value:"523",place:"십의 자리",kept:"52",tail:"3"}}),
 make("9.162를 올림하여 소수 첫째 자리까지 나타내세요.",[],"9.2","소수 첫째 자리 아래 0.062가 남아요. 9.1보다 한 단계 큰 9.2로 나타내요.",{input:true,visual:{type:"place-value",value:"9.162",place:"소수 첫째 자리",kept:"9.1",tail:"62"}}),
 make("9.162를 올림하여 소수 둘째 자리까지 나타내세요.",[],"9.17","9.16 아래에 0.002가 남아 있으므로 9.17로 나타내요.",{input:true}),
 make("250을 올림하여 십의 자리까지 나타내면?",["250","260"],"250","일의 자리가 이미 0이므로 그대로 250이에요. 올림한다고 항상 커지는 것은 아니에요.",{category:"오개념 교정"}),
 make("4.01을 올림하여 일의 자리까지 나타내면?",["4","5"],"5","바로 아래 숫자 0만 보면 안 돼요. 아래 부분 전체 0.01이 남아 있으므로 5예요.",{category:"오개념 교정",visual:{type:"place-value",value:"4.01",place:"일의 자리",kept:"4",tail:".01"}}),
 make("21,500원짜리 책을 1,000원짜리 지폐로만 계산해요. 최소 몇 장을 내야 할까요?",[],"22","먼저 21,500원을 천의 자리까지 올림하면 22,000원이에요. 1,000원짜리 지폐는 22장이 필요해요.",{input:true,category:"도전"})
],
9: [
 make("그림의 상자는 가로 40cm, 세로 42cm, 높이 48cm예요. 세 변의 합은 몇 cm인가요?",[],"130","40+42+48=130이므로 상자의 크기는 130cm예요.",{input:true,category:"개념 확인",visual:{type:"parcel",weight:5,dimensions:[40,42,48]}}),
 make("아래 표에서 무게 5kg만 보고 정한 요금은 얼마인가요?",["6,000원","7,000원","8,000원"],"7,000원","5kg은 2kg 초과 10kg 이하이므로 무게 요금은 7,000원이에요. 아직 최종 요금은 아니에요.",{visual:parcelTable}),
 make("아래 표에서 크기 130cm만 보고 정한 요금은 얼마인가요?",["6,000원","7,000원","8,000원"],"8,000원","130cm는 120cm 초과 140cm 이하라서 크기 요금은 8,000원이에요.",{visual:parcelTable}),
 make("무게 5kg, 크기 130cm인 상자의 최종 요금은 얼마인가요?",["7,000원","8,000원","15,000원","접수 불가"],"8,000원","무게 요금 7,000원과 크기 요금 8,000원 중 더 높은 8,000원을 내요. 두 요금을 더하지 않아요.",{visual:parcelTable,category:"적용"}),
 make("무게 12kg, 크기 90cm인 상자는 크기가 작은 구간이므로 7,000원만 내면 될까요?",["네, 7,000원이에요","아니요, 8,000원이에요"],"아니요, 8,000원이에요","무게 요금은 8,000원, 크기 요금은 7,000원이에요. 이번에는 무게에 따른 요금이 더 높아요.",{visual:parcelTable,category:"오개념 교정"}),
 make("A 상자는 5kg·130cm, B 상자는 12kg·90cm예요. 두 상자의 최종 요금을 합하면 몇 원인가요?",[],"16000","A는 8,000원, B도 8,000원이에요. 상자마다 높은 요금을 정한 뒤 8,000+8,000=16,000원으로 더해요.",{input:true,visual:parcelTable,category:"도전"})
]};
export function applyPilot(quests: Quest[], bosses: Record<number, BossChallenge>) {
 for(const id of [3,5,9]) quests[id-1].questions=pilotQuestions[id];
 Object.assign(quests[2],{place:"초과와 미만 알아보기",summary:"같은 수를 빼고 범위를 읽은 뒤 수직선에 직접 나타내요."});
 Object.assign(quests[4],{place:"올림 알아보기",theory:"남길 자리 아래 부분이 0인지 확인해요. 0이 아닌 부분이 남으면 한 단위 올리고, 모두 0이면 그대로 나타내요.",summary:"수를 먼저 올림하고, 어림한 양과 묶음 개수를 구분해요."});
 Object.assign(quests[8],{place:"택배 요금 문제 해결하기",concept:"무게·크기 요금 비교",theory:"크기는 가로·세로·높이를 더해 구해요. 무게 요금과 크기 요금을 각각 찾고 더 높은 요금을 내요.",summary:"상자의 크기를 구하고 두 요금 중 더 높은 요금을 골라요."});
 bosses[9].question=make("무게 2kg, 크기 130cm인 상자의 최종 요금은?",["6,000원","7,000원","8,000원","14,000원"],"8,000원","무게는 6,000원, 크기는 8,000원이므로 더 높은 8,000원을 내요.",{category:"보스전",visual:parcelTable});
 bosses[9].intro="무게와 크기로 구한 요금을 비교해 마지막 배송을 완료하세요.";
}

