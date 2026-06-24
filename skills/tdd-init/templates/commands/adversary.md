---
description: 現在の差分を独立コンテキストの Adversary（敵対的レビュアー）に審査させ、5 次元バイナリ判定（PASS/FAIL）と戻すべきフェーズを返す。ゲートではなく独立判定を返すだけ。
argument-hint: <差分範囲 or 機能名（省略時は HEAD との差分）>
allowed-tools: Bash(git:*), Read, Grep, Glob, Agent
---

> **`/review` との違い**: `/review` は**同一コンテキストの自己点検**（10 観点・重要度別の助言）。`/adversary` は**独立コンテキストのバイナリ判定**（会話履歴を共有しない `adversary` agent が PASS/FAIL を出し、FAIL なら戻すべきフェーズを指す）。

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 変更概要: !`git diff --stat HEAD 2>&1`
- 現在の git: !`git status --short 2>&1`

## Your task

`$ARGUMENTS`（省略時は `HEAD` との差分）を、**`adversary` サブエージェント**に独立審査させる。

### Step 1: 審査対象と受け入れ条件の在り処を集める

- 審査対象の差分範囲を確定する（`$ARGUMENTS` が機能名なら関連ファイル、差分範囲指定ならその範囲、省略時は `HEAD` との差分）。
- 受け入れ条件の在り処を洗い出して **adversary に渡す**:
  - E2E spec（`e2e/**/*.spec.ts`）
  - integration / unit テスト（`*.test.ts(x)` / `*.spec.ts(x)`）
  - EARS 仕様があれば `.claude/tdd/specs/*.md`（任意入力。spec はテストの上位権威ではなく受け入れ条件の参照）

### Step 2: adversary サブエージェントを呼ぶ

**adversary agent を呼び出し**、Step 1 で集めた差分範囲と受け入れ条件の在り処を渡す（5次元の判定規律・強制否定・出力フォーマットは adversary agent が自身の rules に従って判定する）。

### Step 3: 結果を報告する

adversary の返した内容を、次の形で整理して報告する:

- **総合判定**: PASS / FAIL（5 次元の内訳表）
- **findings**: severity（critical / major / minor）・dimension・`file:line`・証拠・routeToPhase
- **routeToPhase 集計**: FAIL の場合、どのフェーズに何件戻すか
- **次の一手**: FAIL なら「`/spec` か `/e2e` か `/tdd`（または `refactor`）のどこに戻るべきか」を提示する

## Rules

- **ゲートではない。** 自動でブロックしない。独立判定を返し、次手は人間 / メインが決める。
- adversary は **判定するだけ**でコードを直さない。修正は `/tdd`・`/e2e`・`/spec` 側で行う。
- これは `/review`（自己点検）の置き換えではない。**独立した第二の目**として完了前や PR 前に併用する。
