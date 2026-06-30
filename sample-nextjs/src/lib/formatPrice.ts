export function formatPrice(yen: number): string {
  // 非有限値（NaN / ±Infinity）と負数は金額として無効（REQ-004 / REQ-006）。
  if (!Number.isFinite(yen) || yen < 0) {
    throw new Error("金額は0以上の有限な数値を指定してください");
  }
  const rounded = Math.round(yen);
  return "¥" + rounded.toLocaleString("ja-JP");
}
