# テスト実行基盤 — {{PROJECT_NAME}}

> `/tdd-init` がセットアップした、統合(integration)/E2E を**実際に走らせる**ための基盤。
> これが揃っているので、`/e2e` と `/tdd` は統合 / E2E を「後回し」にせず書ける。基盤を壊したら直してから次へ進む。

## レベル別に必要な基盤

| レベル | 必要なもの | このプロジェクトでの状態 |
|--------|-----------|--------------------------|
| unit | Vitest（+RTL） | {{UNIT_STATUS}} |
| integration（境界モック） | 追加基盤なし。repository/認証/外部 API をモック | {{INTEGRATION_MOCK_STATUS}} |
| integration（実 DB） | テスト DB（Docker）＋マイグレーション＋クリーン | {{INTEGRATION_DB_STATUS}} |
| E2E | アプリ起動＋テスト DB＋ログイン済み storageState | {{E2E_STATUS}} |

## 環境変数の契約（direnv 親子継承 / `.env.test` どちらでも可）

| 変数 | 目的 | 例 |
|------|------|----|
| `TEST_DB_PORT` | テスト DB のホスト側ポート（worktree 並列起動で衝突回避用） | `5433`（既定）/ `5434`（衝突時の上書き） |
| `TEST_DB_NAME` | テスト DB 名（worktree ごとに別名にする） | `testdb_${PWD##*/}` |
| `TEST_DATABASE_URL` | テスト DB への接続 URL（一次ソース） | `postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}?schema=public` |
| `DATABASE_URL` | アプリが見る DB URL。E2E 中は **テスト DB に向ける**（worktree .envrc で `=$TEST_DATABASE_URL`） | `$TEST_DATABASE_URL` と同値 |
| `E2E_BASE_URL` | E2E が叩く URL | `http://localhost:3000` |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | E2E のログインユーザー（テスト DB に seed 済み） | — |

### 親 `.envrc` / `worktree .envrc` の使い分け（direnv 運用）

親（`wt/.envrc` 等）に **共通の既定**を置き、worktree 個別の `.envrc` では `source_env ..` で親を継承して**衝突する値だけ上書き**する。`/tdd-init` は **worktree 直下の `.envrc` を生成しない**（direnv が CWD から最も近い `.envrc` を読むため、親に 1 つあれば自動継承される）。

#### 親 `.envrc`（共通の例）

```sh
# E2E テスト用
export E2E_BASE_URL="http://localhost:3000"
export E2E_TEST_EMAIL="test@example.com"
export E2E_TEST_PASSWORD="password"

# テスト DB（worktree ディレクトリ名で自動的に別 DB に）
export TEST_DB_NAME="testdb_${PWD##*/}"
export TEST_DB_PORT=5433
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}?schema=public"
```

#### worktree 個別 `.envrc`（衝突時だけ作る）

```sh
# 親 .envrc を継承
source_env ..

# 別 worktree が 5433 を使っているのでずらす
export TEST_DB_PORT=5434
export TEST_DB_NAME="testdb_<このworktreeのスラッグ>"
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:${TEST_DB_PORT}/${TEST_DB_NAME}?schema=public"

# E2E 中は dev server もテスト DB に向ける（dev DB を汚さない）
export DATABASE_URL="$TEST_DATABASE_URL"
```

> `direnv allow` を忘れずに。`.envrc` の編集後は毎回 `direnv allow` で承認しないと反映されない。

## テスト DB（実 DB 統合 / E2E 用）

- 定義: `docker-compose.test.yml`
  - **DB 名・ポートは `${TEST_DB_NAME}` / `${TEST_DB_PORT}` を実行時に読む**（build-time 置換ではない）。direnv で env が入っていれば衝突しない。
- 接続: `TEST_DATABASE_URL`（一次ソース）。アプリは `DATABASE_URL` を見るので、E2E 中は `DATABASE_URL=$TEST_DATABASE_URL` の上書きが必要。
- **ローカル専用。本番 / 共有 DB を指さない。**
- 起動 → マイグレーション:
  ```sh
  {{TEST_DB_UP_CMD}}        # 例: docker compose -f docker-compose.test.yml up -d
  {{DB_MIGRATE_CMD}}        # 例: prisma migrate deploy（DATABASE_URL=$TEST_DATABASE_URL を引き継ぐ）
  ```
- 各テストの `beforeEach` で外部キー順に `deleteMany()` してクリーンに保つ。

## 認証

- unit / integration: `auth-test-helpers.ts` の `mockAuth()` でガード（`requireAuth` / `requireRole`）をモック。権限違いの異常系も `mockAuth({ role })` で検証（テストファイル top-level で `vi.mock` + `authMockFactory` を登録しておくのが前提。書き方はヘルパー冒頭の使い方コメント参照）。
- E2E: `e2e/global-setup.ts` がテストユーザーでログイン → `e2e/.auth/state.json` に `storageState` を保存。`playwright.config` の `use.storageState` で全 E2E が認証済みで開始。
- テストユーザーはテスト DB にシード（`{{SEED_CMD}}`）。認証情報は env 契約の `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`。

## 実行（詳細コマンドは commands.md）

```sh
{{TEST_UNIT_ALL_CMD}}     # unit
{{TEST_INTEGRATION_CMD}}  # 実 DB 統合（テスト DB 起動 + TEST_DATABASE_URL 設定済み が前提）
{{TEST_E2E_ALL_CMD}}      # E2E（webServer がテスト DB を読んで自動起動）
```

## メンテナンス

- worktree（ブランチ）を切るたびに **TEST_DB_NAME** を変える（既定で `testdb_${PWD##*/}` にしているため自動）。
- 同時に**起動**する worktree がある場合のみ、**TEST_DB_PORT を上書き**する（worktree 個別 `.envrc` で）。1 つしか起動しないなら親 .envrc の既定で十分。
- `.gitignore`: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`, `e2e/.auth/`, `.env.test` を無視。
