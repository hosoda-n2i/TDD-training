---
description: 単体/統合テストを実行して結果を解析する
argument-hint: [ファイル / パターン]
allowed-tools: Bash({{PKG_MANAGER}}:*), Read
---

## Your task

テストを実行して結果を解析する。

**引数が指定されている場合:**

!`{{TEST_UNIT_FILE_CMD}} $ARGUMENTS 2>&1`

**引数が無い場合:**

!`{{TEST_UNIT_ALL_CMD}} 2>&1`

## 解析

- 通過 / 失敗 / スキップの件数を集計
- 失敗があるテストごとに:
  - 失敗の種類（AssertionError / TypeError / Timeout / セットアップ系）
  - 根本原因の推定（実装バグ / テストの誤り / 環境不備）
  - 修正案
- 全部通っていればカバレッジサマリを併記する（`{{COVERAGE_CMD}}` がある場合）

## Rules

- **失敗の根本原因まで踏み込む。** 「失敗しました」で止めず、なぜ落ちたかを切り分ける。
- 落ちたテストを「flaky だから」で flake 扱いしない。必ず原因を特定する。
- 環境起因（テスト DB が起動していない等）が疑われる場合は `.claude/tdd/test-infra.md` の起動手順を確認する。
