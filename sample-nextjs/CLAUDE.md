@AGENTS.md

# sample-nextjs

TDD トレーニング用 Next.js サンプル。`src/lib` の純ロジック（金額整形など）と App Router ページを組み合わせ、**dual-loop TDD**（外側 E2E / 内側 unit-integration）と VDD（property + mutation）・独立レビューの加算で開発する。`tdd-init`（vsdd-selective 版）の適用サンプル。

## Terminology

| コード内 | UI 表示 | 説明 |
|---------|--------|------|
| `formatPrice` | 金額整形 | 円の数値を `¥1,234,567` 形式（円記号 + カンマ区切り、四捨五入して整数円）に整形する純ロジック |
| `/price` | 金額整形ページ | 数値を入力すると整形結果を即時表示する Client Component |

## Tech Stack

- Runtime / フレームワーク: Node.js / Next.js（App Router）
- 言語: TypeScript
- DB: **なし**（対象外）
- 認証: **なし**（対象外）
- Test: unit/integration = Vitest（+ React Testing Library）、E2E = Playwright、VDD = fast-check（property）/ Stryker（mutation）

## Implemented Features

| 機能 | 状態 | 概要 |
|------|------|------|
| 金額整形（formatPrice / /price） | 実装済み | 数値 → `¥` カンマ区切り。負数は Error。小数は四捨五入。 |

## DB Schema Overview

なし（このサンプルは DB を持たない）。

## Commands

実コマンドの一覧は `./.claude/tdd/commands.md`。要点:

- unit: `npm test`（ファイル単位 `npm test -- <file>`）/ カバレッジ `npm run coverage`
- mutation: `npm run mutation`（Stryker）
- E2E: `npm run test:e2e`
- 静的: `npm run typecheck` / `npm run lint` / `npm run build`

## Project Structure

- `src/app` … App Router ページ（例: `src/app/price/page.tsx`）
- `src/lib` … 純ロジック（例: `src/lib/formatPrice.ts`）。unit テストは同階層に colocate（`*.test.ts`）。
- `src/components` … 共有コンポーネント
- `e2e/` … Playwright spec をフラット配置（`e2e/price.spec.ts`）

## Development Workflow

dual-loop TDD（外側 E2E / 内側 unit-integration）で開発する:

0. （任意）`/spec <ラフな要望>` で EARS 形式の仕様を起こす。**ゲートではなく任意入力**で、acceptance の実体はテスト。
1. `/e2e <機能名 or spec パス>` で外側ループの E2E spec を書く（RED）
2. `/tdd <e2e spec パス or spec パス>` で内側ループを回す（SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR）
3. 全受け入れ条件が緑 → 外側 E2E が緑 → 機能完成
4. （推奨・完了前）`/harden` で VDD（property-based + mutation）、`/adversary` で独立バイナリ判定を通す。**必須ゲートではない**（フックで強制しない）。FAIL なら指されたフェーズに戻る。

UI を伴わない純ロジックは `/tdd <機能説明>` で直接 inner loop に入る（integration / unit を acceptance にする）。

詳細な規律・規約は以下を参照（常時適用）:

@.claude/rules/tdd/tdd-flow.md
