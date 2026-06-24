---
description: VDD ハードニング。機能が緑になった後に property-based（fast-check）と mutation（Stryker）でテストの広さ・深さを強化する。生存ミュータントをテスト追加で潰し、最後に mutation score を報告する。
argument-hint: <対象ファイル / 機能（省略時は直近の変更）>
allowed-tools: Read, Write, Edit, Bash({{PKG_MANAGER}}:*), Bash(npx:*), Grep, Glob, Agent
---

> **dual-loop のどこか**: GREEN / REFACTOR 後、「完了」と言う**前**の検証強化ステップ（詳細は `@.claude/rules/tdd-flow.md` の「完了前に通すこと」）。

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}}
- 単体テスト: Vitest（`{{TEST_UNIT_FILE_CMD}}` / `{{TEST_UNIT_ALL_CMD}}`）
- mutation: Stryker（`{{MUTATION_CMD}}`）

## Your task

`$ARGUMENTS`（省略時は直近の変更）を対象に、**`verifier` サブエージェント**を呼んでハードニングする。

1. **前提確認** — 対象の example-based テストが**緑**であることを確認する（赤なら `/tdd` で緑にしてから戻る）。
2. **property-based（fast-check）** — verifier に不変条件の property test を書かせ実行させる（`@.claude/rules/testing.md` の property-based 節参照）。反例が出たら実装かテストのどちらが正しいか判断して修正させる。
3. **mutation（Stryker）** — verifier に `{{MUTATION_CMD}}` を実行させ、生存ミュータントを kill するテストを追加させる（`@.claude/rules/testing.md` の mutation 節参照）。
4. **報告** — 追加 / 強化したテスト、見つかったバグ、**mutation score（before → after）**、残った生存ミュータント（kill しなかった理由）。

## Rules

- これは緑の後の**上乗せ**。既存の example-based テストを消さない・歪めない。
- mutation は重い。対象を絞って回す（ファイル / 機能単位）。全体実行は仕上げに 1 回。
- モック方針は `@.claude/rules/testing.md` に従う（外部境界だけモック。DB・ドメインロジックはモックしない）。
- **必須ゲートではない**（推奨ステップ）。ただし「完了」と言う前に通すこと。
- コマンドは `.claude/tdd/commands.md` のものだけを使う。
