# 金額整形表示（formatPrice / /price）

- **REQ プレフィックス**: `REQ`（この仕様内で一意）
- **状態**: 確定
- **関連**: `src/lib/formatPrice.ts`, `src/app/price/page.tsx`, `e2e/price.spec.ts`

## 概要

ユーザーが円の数値を入力すると、`¥1,234,567` 形式（円記号 + カンマ区切り）に整形して即時表示する。整形そのものは純ロジック `formatPrice(yen: number): string`、入力 UI は `/price` ページ（Client Component）。

## アクター

| アクター | 説明 |
|----------|------|
| 利用者 | `/price` を開いて金額を入力する一般ユーザー（認証なし） |

## 受け入れ条件（EARS）

| ID | パターン | 要件 | 推奨レベル |
|----|----------|------|-----------|
| REQ-001 | Event-driven | WHEN 0 以上の有限な数値 `yen` が渡される THE SYSTEM SHALL `¥` + 3桁カンマ区切り文字列を返す（例: 1000 → `¥1,000`、1234567 → `¥1,234,567`） | unit |
| REQ-002 | Ubiquitous | THE SYSTEM SHALL 入力 `0` に対して `¥0` を返す | unit |
| REQ-003 | Event-driven | WHEN 小数の `yen` が渡される THE SYSTEM SHALL 四捨五入した整数円で整形する（1.6 → `¥2`、1.4 → `¥1`） | unit |
| REQ-004 | Unwanted | IF `yen` が負数 THEN THE SYSTEM SHALL Error を投げる（負数は金額として無効） | unit |
| REQ-005 | Event-driven | WHEN 利用者が `/price` の入力欄に数値を入力する THE SYSTEM SHALL 画面に整形済み金額を表示する。IF 入力が無効（負数等）THEN エラーメッセージを表示する | E2E |
| REQ-006 | Unwanted | IF `yen` が非有限値（NaN / ±Infinity）THEN THE SYSTEM SHALL Error を投げる（金額として無効） | unit |

## スコープ外（やらないこと）

- 通貨換算（JPY 以外）
- サーバーサイドでの保存・永続化（DB なし）
- 小数点以下の桁数指定（常に四捨五入して整数円）
- 認証・認可（公開ページ）

## 未確定（決め切らない点）

- なし（`/adversary` の指摘を受け、NaN / ±Infinity の扱いを REQ-006 として明文化済み）

---

## 次の一歩

- UI を伴う条件（REQ-005）: `/e2e .claude/tdd/specs/price-format.md`
- 純ロジック（REQ-001〜004）: `/tdd .claude/tdd/specs/price-format.md`
