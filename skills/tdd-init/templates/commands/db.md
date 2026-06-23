---
description: DB 操作（マイグレーション生成 / 適用 / スキーマ push / studio / シード）
argument-hint: <generate|migrate|push|studio|seed>
allowed-tools: Bash({{PKG_MANAGER}}:*), Read, Glob
---

## Your task

`$ARGUMENTS` に応じた DB 操作を実行する（{{DB}} を使用）。

**generate** — スキーマ変更からマイグレーションを生成:
!`{{DB_GENERATE_CMD}}`
生成された SQL ファイルの内容を表示する。

**migrate** — 未適用のマイグレーションを反映:
!`{{DB_MIGRATE_CMD}}`

**push** — スキーマを直接 push（dev のみ。本番では使わない）:
!`{{DB_PUSH_CMD}}`

**studio** — DB GUI を開く:
!`{{DB_STUDIO_CMD}}`

**seed** — シードデータ投入:
!`{{SEED_CMD}}`

**引数なし** — 現在のマイグレーション状態と未適用一覧を表示する。

## Rules

- `push` は dev のみ。**本番 / 共有 DB に向けない**。
- スキーマ変更時は migration を必ずコミットする（生成された SQL を git に含める）。
- リモート DB（dev/staging/prod 含む共有環境）への接続を伴う操作は、ユーザーが**明示的に**許可した場合のみ実行する。
