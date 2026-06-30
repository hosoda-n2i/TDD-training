---
description: 仕様変更の影響範囲を解析する。変更 REQ-ID 群（または git 範囲）を受け取り、`impact-analyzer` に委譲して追加/変更/削除すべきテスト・影響コード・回帰セットを返す。
argument-hint: <変更 REQ-ID 群（例: REQ-003,REQ-005）または git 範囲（例: HEAD~1..HEAD）。省略時は HEAD 差分>
allowed-tools: Bash(git:*), Read, Grep, Glob, Agent
---

## Context — sample-nextjs

- アプリ: TDD トレーニング用 Next.js サンプル。src/lib の純ロジックと App Router ページを dual-loop TDD で実装する。
- 変更概要: !`git diff --stat HEAD 2>&1`
- 現在の git: !`git status --short 2>&1`

## Your task

`$ARGUMENTS`（変更 REQ-ID 群 または git 範囲、省略時は HEAD 差分）を、**`impact-analyzer` サブエージェント**に解析させる。

### Step 1: 解析対象と参照先を集める

- 変更 REQ-ID を確定する（`$ARGUMENTS` が REQ-ID 群なら直接使用、git 範囲・省略時は `git diff --name-only` から変更ソースを取得し、対応する spec がある場合は変更セットを特定）。
- 参照先を洗い出して **impact-analyzer に渡す**:
  - EARS 仕様（`.claude/tdd/specs/*.md`）— 変更セットの特定と照合に使う
  - 既存テスト群のルートパス（`@covers` タグの grep 対象）

### Step 2: impact-analyzer サブエージェントを呼ぶ

**impact-analyzer agent を呼び出し**、Step 1 で集めた変更セットと参照先を渡す（解析規律・証拠要件・出力フォーマットは impact-analyzer agent が自身の rules に従って解析する）。

### Step 3: 結果を報告する

impact-analyzer の返した影響レポートを整理して報告し、次の一手を案内する:

- 影響テスト・コードがある場合: `/tdd <spec>` を差分スコープ（変更 REQ のみ）で実行することを推奨
- 回帰セットがある場合: 実装完了前に全テストスイートを実行して緑維持を確認（回帰ゲート）することを推奨

## Rules

- **ゲートではない。** 自動でブロックしない。解析結果を返し、次手は人間 / メインが決める。
- impact-analyzer は **解析するだけ**でコードを直さない。修正は `/tdd`・`/spec` 側で行う。
