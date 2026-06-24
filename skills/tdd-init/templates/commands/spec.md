---
description: ラフな要望から EARS 形式の構造化仕様を起こす。受け入れ条件を REQ-ID 付きで言語化する思考・コミュニケーションの補助。ゲートではなく /e2e・/tdd への任意入力。
argument-hint: <作りたい機能のラフな説明>
allowed-tools: Read, Write, Edit, Grep, Glob
---

> **位置づけ**: spec は**任意入力**であって**ゲートではない**。acceptance の実体は E2E / integration テスト。spec が無くても `/e2e` → `/tdd` で開発できる。spec は受け入れ条件を REQ 単位で言語化し、`/e2e`・`/tdd` に渡せる構造化された参照を作るためのもの。

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}}
- 仕様テンプレ: `.claude/tdd/spec-template.md`
- 仕様の出力先: `.claude/tdd/specs/<slug>.md`

## Your task

`$ARGUMENTS`（作りたい機能のラフな説明）を EARS 形式の構造化仕様に起こす。

### Step 1: 既存を読む

- `@.claude/rules/spec-conventions.md` — EARS パターン・REQ-ID 規約・守ること
- `.claude/tdd/spec-template.md` — 出力フォーマット
- 関連する既存 spec（`.claude/tdd/specs/*.md`）・既存実装・CLAUDE.md の用語表

### Step 2: EARS 形式で受け入れ条件を書く

`@.claude/rules/spec-conventions.md` の EARS パターン・REQ-ID 規約に従って各要件を書く（パターン選択・REQ-ID・推奨テストレベル付与・異常系必須・スコープ外明記）。

### Step 3: 出力する

`.claude/tdd/spec-template.md` の構成に沿って `.claude/tdd/specs/<slug>.md` に書き出す。`<slug>` は機能を表す英小文字ケバブケース。

### Step 4: 次へ案内する

書き出した spec パスを示し、次を案内する:

- UI を伴う機能: `/e2e .claude/tdd/specs/<slug>.md`
- UI を伴わない機能: `/tdd .claude/tdd/specs/<slug>.md`

## Rules

- **spec はテストの上位権威ではない。** spec と実テストがずれたら**テストを正**として spec を直す。
- ドメイン語彙は CLAUDE.md の用語表に揃える。
- 推測で要件を盛らない。曖昧な点は「未確定」として残し、`/e2e`・`/tdd` での具体化に委ねる。
- UI テキストは {{UI_LANGUAGE}}。
