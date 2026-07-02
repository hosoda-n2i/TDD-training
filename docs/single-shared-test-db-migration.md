# 指示書: tdd-init を「単一共有テスト DB（案 X）」モデルへ変更

> 決定: **案 X**（per-worktree DB を撤廃し、全 worktree が 1 つの `testdb` を共有）。
> 並列衝突は「一意データ + スコープ削除 + スコープ検証」で防ぐ（ctc の E2E パターンを全レベルに適用）。
> **全 truncate は禁止**（共有 DB では他 worktree のデータを消すため）。

## 0. 目的 / 背景

現行 tdd-init は **per-worktree 別名 DB**（`testdb_${PWD##*/}`）＋ integration は `beforeEach` 全 truncate。これを **単一共有 DB** に集約する。DB 名・ポートを固定し、per-worktree 命名・ポート上書き・子 `.envrc` を撤廃してインフラを最小化する。

参考: ctc-recruitment の E2E パターン（`uniqueSuffix()` + `afterEach` で自分の行だけ削除 + 自分のデータを検索して検証 + `fullyParallel:true`）。ctc は per-worktree DB を残しているが、本変更ではその DB 内分離技法だけを取り出し、全レベル（unit(DB)/integration/E2E）に適用する。

## 1. 採用する分離モデル

| 軸 | 現行 | 変更後（案 X） |
|----|------|--------|
| DB 名 | `testdb_${PWD##*/}`（worktree ごと） | **`testdb`（固定・共有）** |
| ポート | 5433 + 並列時手動上書き | **`5433` 固定**（上書き不要） |
| コンテナ | worktree ごと起動 | **1 つ常駐**（1 回 up、全 worktree が接続） |
| 子 `.envrc` | 衝突時に手動作成 | **不要**（親 `.envrc` に固定値 1 式） |
| データ一意性 | 規約に明記なし | **各テストで `uniqueSuffix()` 付き seed を必須化** |
| クリーンアップ | `beforeEach cleanupTestDb()` 全 truncate | **`afterEach` で「自分が作った行だけ」スコープ削除**。**全 truncate 禁止** |
| アサーション | 明記なし | **自分のデータを id / 一意名で検索して検証**（全件数依存を禁止） |
| 全体状態依存テスト | — | 原則避ける。必要なら「他 worktree の同時実行をしない」前提の対象外扱い |
| 並列 | — | 一意データ前提で E2E `fullyParallel:true` 可 |
| 誤接続ガード | URL に `test` 必須 | **維持** |

## 2. 受け入れ条件

- REQ-1: `/tdd-init` 生成物が単一固定 DB（名前・ポート固定）を前提にする。per-worktree 命名・ポート上書き・子 `.envrc` 生成/案内を出さない。
- REQ-2: `testing.md` の DB テスト規約が「一意 suffix seed + `afterEach` スコープ削除 + スコープ検証」を実コード例付きで示す。**`cleanupTestDb()`（全 truncate）の指示を撤去**する。
- REQ-3: 全件数依存アサーション（`toHaveLength` 等の「全レコード」前提）を**禁止**と明記。作成データを検索して検証する。
- REQ-4: **スキーマドリフト**（複数ブランチで 1 DB 共有時の migrate 衝突）を test-infra.md に**受け入れ済みリスク**として明記し、緩和（実行前 `migrate deploy` / ブランチ間 schema 互換前提 / 破壊的変更時は DB リセット）を案内。
- REQ-5: 誤接続ガード（URL に `test` 必須）を維持。
- REQ-6: integration は全 truncate をやめ、一意データ + スコープ削除に統一（下記「決定事項」）。

## 3. 決定事項（案 X の帰結）

- **integration の分離 = 一意データ + スコープ削除（旧 (a)）に統一。** 全 truncate は共有 DB で他 worktree のデータを消すため**採用不可**。
  - フォールバック: どうしても全 truncate を残すなら「**worktree をまたいでテストを同時に走らせない**（全体を直列運用する）」前提でのみ可。その場合 `fileParallelism:false`。ただし案 X の並列利点を捨てるので非推奨。

## 4. 変更するファイル（ジェネレータ本体）

1. **`templates/infra/docker-compose.test.yml`**
   - `${TEST_DB_NAME}` 既定を固定名 `testdb` に、`${TEST_DB_PORT}` 固定。
   - コメントを「単一コンテナを 1 回 up して常駐、全 worktree が接続」に（per-worktree 起動記述を削除）。

2. **`templates/docs/test-infra.md`**
   - env 契約表を単一共有 DB 用に: `TEST_DB_NAME=testdb`（固定）、`TEST_DB_PORT=5433`（固定）、`TEST_DATABASE_URL`。
   - **削除**: 「worktree ごとに別名」「並列時ポート上書き」「worktree 個別 `.envrc`」節。
   - **追加**: 「スキーマドリフト」注意（REQ-4）、「全体状態テストの扱い」、「並列は一意データ前提」。

3. **`templates/rules/testing.md`**（中心的変更）
   - DB テスト節を ctc スタイルの実コード例に置換:
     - `uniqueSuffix()`（`${Date.now()}-${Math.random().toString(36).slice(2,10)}`）
     - seed は一意 suffix 付き（`name: \`X-${suffix}\``）
     - `afterEach` で作成 id だけ `deleteMany({ where: { id: { in: createdIds } } })`（FK 順序考慮）
     - アサーションは作成データを検索して検証。**全件数依存を「禁止」と明記**。
   - **`beforeEach cleanupTestDb()`（全 truncate）を撤去。**

4. **`templates/infra/integration-setup.ts`**
   - `test` ガード維持。migrate は共有 DB（`TEST_DATABASE_URL`）に適用。全 truncate 前提コメントを「一意データ + スコープ削除」に更新。

5. **`SKILL.md`**
   - step 4(d-env): env 契約表・direnv 運用を単一共有 DB に（per-worktree 命名・ポート上書き・子 `.envrc` 記述を削除）＋スキーマドリフト注意（REQ-4）。
   - step 4(b)/(c): integration/E2E の cleanup を「一意データ + スコープ削除」に。全 truncate 禁止。E2E `fullyParallel:true` 可の条件（一意データ）を記載。

6. **`templates/docs/test-strategy.md` / `templates/docs/commands.md`**
   - テスト DB コマンド（単一 DB の up/migrate/seed）に整合。per-worktree 表現を除去。

## 5. 受け入れるトレードオフ（合意済み）

- **スキーマドリフト（最大の受容コスト）**: 1 DB を複数ブランチで共有 → 列追加/削除が異なるブランチが同じ DB を触ると migrate が衝突する。緩和: 実行前 `migrate deploy` / ブランチ間 schema 互換前提 / 破壊的変更時は DB リセット。**別ブランチが別 migrate を同時に当てると壊れる点は残る**（案 X の本質的コスト）。
- **全体状態テスト**: 共有 DB では「全件」系に他 worktree のデータが混じる。原則書かない。必要なら「他 worktree 非同時実行」前提の対象外扱い。
- **既存プロジェクトへの当て直し**: 既存が全 truncate 前提なら scoped cleanup への移行が要る（自動では直せない。生成物は新方針で出す）。

## 6. 検証（実装後）

- DB あり・認証ありの小さな Next.js に `/tdd-init` を当て直し、生成物が単一共有 DB 前提か。
- 同一 DB に 2 つのテストファイルを `fullyParallel` で走らせ、一意 suffix + スコープ削除で衝突しないことを確認（前回スキップした Phase B の実 DB 並列実証も兼ねる）。
- 誤接続ガードが効くか（`test` を含まない URL で fail するか）。
