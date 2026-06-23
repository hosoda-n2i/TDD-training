---
description: 仕様駆動 TDD の内側ループ（SCAFFOLD → RED → GREEN → REFACTOR）を駆動する。受け入れ条件＝対応する E2E spec（または integration test）が緑になるまで内部を組み上げる。
argument-hint: <機能名 / 受け入れ条件 / e2e spec ファイルパス>
allowed-tools: Read, Write, Edit, Bash({{PKG_MANAGER}}:*), Bash(npx:*), Grep, Glob, Agent
---

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}}
- 単体テスト: Vitest（`{{TEST_UNIT_FILE_CMD}}` / `{{TEST_UNIT_ALL_CMD}}`）
- カバレッジ: `{{COVERAGE_CMD}}`
- 現在の git: !`git status --short`

## Your task

`$ARGUMENTS` を **仕様駆動 TDD の内側ループ**で実装する。

これは dual-loop TDD の **inner loop**。`$ARGUMENTS` が E2E spec のファイルパスならそれを **acceptance（外側の RED）** と見なし、その E2E が緑になるまで内部を組み上げるのがゴール。E2E spec が無い純ロジック/サービスなら、対応する integration test を acceptance とする。

**tdd-guide** agent を呼び出して以下のサイクルを回す:

1. **SCAFFOLD** — 型/interface を定義し、対象関数/コンポーネントを `throw new Error('Not implemented')` でスタブする。テストが import するシグネチャを**物理的に確定**する。
2. **RED** — 受け入れ条件1つに対応するテストを1本書く。`{{TEST_UNIT_FILE_CMD}}` を実行し、**期待どおりに**失敗することを確認する（構文エラーではなく、未実装ゆえの AssertionError か）。
3. **GREEN** — テストを通すための**最小実装**を書く。`{{TEST_UNIT_FILE_CMD}}` で緑を確認する。
4. **REFACTOR** — 重複除去・命名整理・定数抽出。**毎回テストを走らせて**緑を維持する。
5. **REPEAT** — 次の受け入れ条件に進んで step 2 へ。
6. **COVERAGE** — `{{COVERAGE_CMD}}` を実行し、**80%+** を確認する。届かなければ未カバーの受け入れ条件を追加する。
7. **OUTER LOOP** — `$ARGUMENTS` が E2E spec なら、最後に `{{TEST_E2E_FILE_CMD}} $ARGUMENTS` を実行して外側ループが緑になったか確認する。赤のままなら何が足りないかを報告し、必要なら次の `/tdd` 対象に分解する。

## Rules

- **テストを先に書く。** 失敗するテストが無い状態で実装に手を入れない。
- **1サイクル = 1テストケース。** 大きく書かない。diff を小さく保つ。
- **テストの意図に準じて実装する。** 実装に合わせてテストを歪めない。
- **緑でない状態でコミットしない。**
- **テストレベルの判断は `.claude/tdd/test-strategy.md` に従う。** UI/画面を伴うのに E2E が無い、層またぎなのに integration が無いまま unit に倒さない。
- コマンドは `.claude/tdd/commands.md` のものだけを使う。
- 確認ステップは最小限。1 受け入れ条件ごとにコミットする（push はユーザー指示時のみ）。

## Output

完了時に以下を報告:
- 追加/変更したテストファイル一覧
- 追加/変更した実装ファイル一覧
- カバレッジ（行/分岐）と未カバー箇所
- 外側ループ（E2E / integration）の状態
- 残課題（仕様の見落とし・未着手の受け入れ条件）
