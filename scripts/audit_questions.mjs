import { bossChallenges, quests } from "../client/src/lib/questionBank.ts";

const sensitivePattern = /(?<!쿠)키가|(?<!쿠)키\s*\d|(?<!쿠)키\d|(?<!쿠)키·|(?<!쿠)키와|몸무게|체온|사과[^\n]*1kg|1kg[^\n]*사과|비밀번호/;
const regularQuestions = quests.flatMap((quest) => quest.questions.map((question, index) => ({ questId: quest.id, index: index + 1, ...question })));
const bossQuestions = Object.entries(bossChallenges).map(([questId, boss]) => ({ questId: Number(questId), index: "boss", ...boss.question }));
const allQuestions = [...regularQuestions, ...bossQuestions];

const optionErrors = allQuestions.filter((question) => !question.input && !question.interactiveNumberLine && question.answers.some((answer) => !question.options.includes(answer)));
const emptyAnswerErrors = allQuestions.filter((question) => question.answers.length === 0);
const duplicatePrompts = allQuestions.filter((question, index, list) => list.findIndex((item) => item.prompt === question.prompt && JSON.stringify(item.numberLine) === JSON.stringify(question.numberLine)) !== index);
const sensitiveHits = allQuestions.filter((question) => sensitivePattern.test([question.prompt, ...question.options, question.explanation, question.hint].join(" ")));
const visualCount = regularQuestions.filter((question) => question.numberLine).length;
const visualPracticeCount = regularQuestions.filter((question) => question.visual).length;
const interactiveNumberLineCount = regularQuestions.filter((question) => question.interactiveNumberLine).length;

const report = {
  regularQuestionCount: regularQuestions.length,
  bossQuestionCount: bossQuestions.length,
  perQuest: quests.map((quest) => ({ questId: quest.id, count: quest.questions.length })),
  numberLineQuestionCount: visualCount,
  visualPracticeQuestionCount: visualPracticeCount,
  interactiveNumberLineQuestionCount: interactiveNumberLineCount,
  optionErrors: optionErrors.map(({ questId, index, prompt, answers, options }) => ({ questId, index, prompt, answers, options })),
  emptyAnswerErrors: emptyAnswerErrors.length,
  duplicatePrompts: duplicatePrompts.map(({ questId, index, prompt }) => ({ questId, index, prompt })),
  sensitiveContextHits: sensitiveHits.map(({ questId, index, prompt }) => ({ questId, index, prompt }))
};

console.log(JSON.stringify(report, null, 2));
if (optionErrors.length || emptyAnswerErrors.length || duplicatePrompts.length || sensitiveHits.length) process.exitCode = 1;
