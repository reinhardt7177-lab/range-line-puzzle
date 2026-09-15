export function canOpenQuest(id: number, total: number, records: Record<number, { completed?: boolean }>, review = false) {
  if (id < 1 || id > total) return false;
  return review || id < total || Array.from({ length: total - 1 }, (_, i) => i + 1).every(key => records[key]?.completed);
}
