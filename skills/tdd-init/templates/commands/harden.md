---
description: VDD ハードニング。機能が緑になった後に property-based（fast-check）と mutation（Stryker）でテストの広さ・深さを強化する。生存ミュータントをテスト追加で潰し、最後に mutation score を報告する。
argument-hint: <対象ファイル / 機能（省略時は直近の変更）>
allowed-tools: Read, Write, Edit, Bash({{PKG_MANAGER}}:*), Bash(npx:*), Grep, Glob, Agent
---

> **dual-loop のどこか**: GREEN / REFACTOR が一通り終わり「完了」と言う**前**の検証強化ステップ。example-based なテストが緑である状態を入口に、property-based と mutation でテストの効きを上げる。

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}}
- 単体テスト: Vitest（`{{TEST_UNIT_FILE_CMD}}` / `{{TEST_UNIT_ALL_CMD}}`）
- mutation: Stryker（`{{MUTATION_CMD}}`）
- 現在の git: !`git status --short 2>&1`

## Your task

`$ARGUMENTS`（省略時は直近の変更）を対象に、**`verifier` サブエージェント**を呼んでハードニングする。

1. **前提確認** — 対象の example-based テストが**緑**であることを確認する（緑でないなら、まず `/tdd` で緑にしてから戻る。RED のまま hardening に入らない）。
2. **property-based（fast-check）** — verifier に、対象の純粋ロジック関数の**不変条件**（roundtrip / 冪等 / 可換 / 出力域 / 例外条件）を property test として書かせ、`{{TEST_UNIT_FILE_CMD}}` で回す。反例が出たら実装かテストのどちらが正しいか判断して修正させる。
3. **mutation（Stryker）** — verifier に `{{MUTATION_CMD}}` を実行させ、**生存ミュータント**を列挙。各生存ミュータントを kill するテストケースを追加させる。
4. **報告** — 追加 / 強化したテスト、見つかったバグ、**mutation score（before → after）**、残った生存ミュータント（kill しなかった理由）。

## Rules

- これは緑の後の**上乗せ**。既存の example-based テストを消さない・歪めない。
- mutation は重い。**対象を絞って**回す（ファイル / 機能単位）。全体実行は仕上げに 1 回。
- 外部境界だけモック（ネットワーク / 時刻 / 乱数 / 外部 API / 認証）。ドメインロジック・DB はモックしない。
- **必須ゲートではない**（推奨ステップ）。フックで強制しない。ただし「完了」と言う前に通すこと。
- コマンドは `.claude/tdd/commands.md` のものだけを使う。
