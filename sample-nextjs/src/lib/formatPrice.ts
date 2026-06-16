export function formatPrice(yen: number): string {
  if (yen < 0) {
    throw new Error("金額は0以上の値を指定してください");
  }
  const rounded = Math.round(yen);
  return "¥" + rounded.toLocaleString("ja-JP");
}
