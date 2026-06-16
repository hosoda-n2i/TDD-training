# 金額整形表示ページ（formatPrice）

## 目的 / 背景
ユーザーが金額（円）の数値を入力すると、¥1,234,567 形式（円記号 + カンマ区切り）に整形して即座に表示する。
金額を人間が読みやすい形式に変換する純粋ロジック + 入力UIページとして実装する。

## スコープ / 非対象
- やること:
  - `formatPrice(yen: number): string` 関数（src/lib/formatPrice.ts）
  - `/price` ページ（src/app/price/page.tsx）: number 入力 → 整形結果を表示
- やらないこと（明示的に除外）:
  - 通貨換算（JPY 以外）
  - サーバーサイドでの保存・永続化
  - 小数点以下の桁数指定（常に四捨五入して整数円）

## ユースケース
- ユーザーが `/price` ページを開き、入力フィールドに数値を入力すると、¥カンマ区切り形式で整形された金額が画面に表示される。

## 受け入れ条件（Given–When–Then）
- [ ] Given yen=1000 When formatPrice(1000) Then "¥1,000" を返す
- [ ] Given yen=0 When formatPrice(0) Then "¥0" を返す
- [ ] Given yen=1234567 When formatPrice(1234567) Then "¥1,234,567" を返す
- [ ] Given yen=1.6（小数） When formatPrice(1.6) Then "¥2"（四捨五入）を返す
- [ ] Given yen=1.4（小数） When formatPrice(1.4) Then "¥1"（四捨五入）を返す
- [ ] Given yen=-1（負数） When formatPrice(-1) Then Error を投げる
- [ ] Given /price ページ When 入力欄に "1000" を入力 Then 画面に "¥1,000" が表示される

## 正常系 / 境界 / 異常系
- 正常:
  - 1000 → "¥1,000"
  - 1234567 → "¥1,234,567"
  - 0 → "¥0"
- 境界:
  - 1.6 → "¥2"（四捨五入）
  - 1.4 → "¥1"（四捨五入）
  - Number.MAX_SAFE_INTEGER (9007199254740991) → "¥9,007,199,254,740,991"（通常の number 範囲上限）
- 異常:
  - -1 → Error を投げる（負数は金額として無効）
  - -0.1 → Error を投げる（四捨五入前でも負数は無効）

## E2E シナリオ候補
1. **金額入力→整形表示**: `/price` ページで入力欄に "1000" を入力 → "¥1,000" がページ上に表示される

## 影響範囲
- 新規: `src/lib/formatPrice.ts`（純粋ロジック）
- 新規: `src/lib/formatPrice.test.ts`（unit テスト）
- 新規: `src/app/price/page.tsx`（App Router ページ、Client Component）
- 新規: `e2e/price.spec.ts`（Playwright E2E）

## 残課題 / 未確定
- なし（境界値はすべて既定で補完済み）
