export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    throw new Error(`日期必须是 YYYY-MM-DD：${iso}`);
  }
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}
