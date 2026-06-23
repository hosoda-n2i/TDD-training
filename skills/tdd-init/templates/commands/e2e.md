---
description: 仕様駆動 TDD の外側ループ。引数が機能説明なら E2E spec を先に書く（RED）+ inner loop の work item を返す。引数が E2E ファイルなら実行・解析する。
argument-hint: <機能説明 / e2e spec ファイルパス>
allowed-tools: Read, Write, Edit, Bash({{PKG_MANAGER}}:*), Bash(npx:*), Grep, Glob, Agent
---

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- E2E フレームワーク: Playwright（`{{TEST_E2E_ALL_CMD}}`）
- E2E ディレクトリ: `e2e/`
- ルーティング: {{NEXT_ROUTER}}
- 現在の git: !`git status --short`

## Your task

`$ARGUMENTS` に応じて 2 つのモードで動く。

### モードA: 引数が E2E ファイルパスっぽい（`e2e/.*\.spec\.ts`）

指定された E2E を実行して結果を解析する。

!`{{TEST_E2E_FILE_CMD}} $ARGUMENTS`

報告:
- pass / fail / skip 件数
- 失敗があれば: スクリーンショット / trace の場所、原因、修正案
- 未実装の page / component / action があるなら**列挙**して `/tdd` の work item にする

### モードB: 引数が機能説明（自然文）

**e2e-guide** agent を呼び出して dual-loop TDD の外側ループを駆動する:

1. **RED** — 仕様（ユーザー操作フロー）を Playwright spec として書く。実装が無いので失敗する状態にする。
   - 配置: `e2e/{{E2E_FEATURE_DIR}}/<feature>.spec.ts`
   - セレクタは `getByRole` / `getByLabel` / `getByText` を優先（脆い CSS セレクタ禁止）
   - 認証が必要なフローは `{{E2E_AUTH_FIXTURE}}` のフィクスチャを使う
2. **CONFIRM RED** — `{{TEST_E2E_FILE_CMD}} <作った spec>` を実行し、**期待どおり**赤になることを確認（構文エラーではなく「ページが無い／要素が無い／レスポンスが違う」で落ちているか）。
3. **WORK ITEMS** — この E2E を緑にするために必要なものを列挙する:
   - page / route（`page.tsx`）
   - Server Action（`_actions.ts`）または API route
   - components（`_components/`）
   - DB schema 変更（`{{DB}}` がある場合）
   - 外部サービス連携
4. 列挙したリストは **`/tdd <spec パス>` の入力**として渡せる形にして報告する。

### 引数なし

全 E2E を実行:

!`{{TEST_E2E_ALL_CMD}}`

サマリと失敗の解析を報告する。

## Rules

- E2E は **acceptance criteria の物理的な実体**。仕様の言葉で test 名を書く。
- UI/画面のないバックエンド機能は E2E の対象外。**integration test を acceptance に**して `/tdd` に直接入る。
- 認証・テストデータの扱いは `.claude/rules/testing.md` に従う。
- 1機能あたり主要フロー 1〜数本に絞る。境界・異常系は inner loop（unit/integration）に寄せる。
