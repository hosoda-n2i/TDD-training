---
description: DB 操作（マイグレーション生成 / 適用 / スキーマ push / studio / シード）
argument-hint: <generate|migrate|push|studio|seed>
allowed-tools: Bash({{PKG_MANAGER}}:*), Bash(npx:*), Read, Glob
---

## Your task

`$ARGUMENTS` に対応する DB 操作を **1 つだけ** Bash ツールで実行する（{{DB}} を使用）。指定されていない操作は実行しない。

| `$ARGUMENTS` | 実行するコマンド | 実行後にすること |
|--------------|------------------|------------------|
| `generate` | `{{DB_GENERATE_CMD}}` | 生成された SQL ファイルの内容を表示する |
| `migrate` | `{{DB_MIGRATE_CMD}}` | 適用されたマイグレーションを報告する |
| `push` | `{{DB_PUSH_CMD}}` | 実行**前**に `DATABASE_URL` がローカル dev DB を指していることを確認する |
| `studio` | `{{DB_STUDIO_CMD}}` | 対話型サーバなので**バックグラウンドで起動**し、URL を案内する |
| `seed` | `{{SEED_CMD}}` | 投入結果を報告する |

**引数なし** — 現在のマイグレーション状態と未適用一覧を表示する（{{DB}} の status 系コマンドがあればそれを使い、無ければマイグレーションディレクトリと DB の状態を突き合わせる）。

## Rules

- `push` は dev のみ。**本番 / 共有 DB に向けない**。
- スキーマ変更時は migration を必ずコミットする（生成された SQL を git に含める）。
- リモート DB（dev/staging/prod 含む共有環境）への接続を伴う操作は、ユーザーが**明示的に**許可した場合のみ実行する。
