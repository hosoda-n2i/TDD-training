---
description: 仕様駆動 TDD の内側ループ（SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR）を駆動する。受け入れ条件＝対応する E2E spec（または integration test）が緑になるまで内部を組み上げる。
argument-hint: <機能名 / 受け入れ条件 / e2e spec ファイルパス>
allowed-tools: Read, Write, Edit, Bash(npm:*), Bash(npx:*), Grep, Glob, Agent
---

## Context — sample-nextjs

- アプリ: TDD トレーニング用 Next.js サンプル。src/lib の純ロジックと App Router ページを dual-loop TDD で実装する。
- 実装/コンポーネント/サービスの配置: src/app（App Router ページ）, src/lib（純ロジック）, src/components（共有）
- 単体テスト: Vitest（`npm test --` / `npm test`）
- カバレッジ: `npm run coverage`
- 現在の git: !`git status --short`

## Your task

`$ARGUMENTS`（E2E spec ファイルパス / 機能説明 / spec パス）を **仕様駆動 TDD の内側ループ**で実装する。

**tdd-guide** agent を呼び出して `SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR` のサイクルを回す。緑になったら `/harden` → `/adversary` の実施を推奨する。

各ステップの規律は `@.claude/rules/tdd/tdd-flow.md` に従う。

## Output

完了時に報告:
- 追加/変更したテストファイル・実装ファイル一覧
- カバレッジ（行/分岐）と未カバー箇所
- 外側ループ（E2E / integration）の状態
- 残課題（仕様の見落とし・未着手の受け入れ条件）
