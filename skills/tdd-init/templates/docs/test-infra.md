# テスト実行基盤 — {{PROJECT_NAME}}

> `/tdd-init` がセットアップした、統合(integration)/E2E を**実際に走らせる**ための基盤。
> これが揃っているので、`/tdd` は統合/E2E を「後回し」にせず書ける。基盤を壊したら直してから次へ進む。

## レベル別に必要な基盤

| レベル | 必要なもの | このプロジェクトでの状態 |
|--------|-----------|--------------------------|
| unit | Vitest（+RTL） | {{UNIT_STATUS}} |
| integration（境界モック） | 追加基盤なし。repository/認証/外部 API をモック | {{INTEGRATION_MOCK_STATUS}} |
| integration（実 DB） | テスト DB（Docker）＋マイグレーション＋クリーン | {{INTEGRATION_DB_STATUS}} |
| E2E | アプリ起動＋テスト DB＋ログイン済み storageState | {{E2E_STATUS}} |

## テスト DB（実 DB 統合 / E2E 用）

- 定義: `docker-compose.test.yml`（ブランチ別 DB 名・ポート: `testdb_{{BRANCH_SLUG}}` / `{{TEST_DB_PORT}}`）
- 接続: `.env.test` の `DATABASE_URL`（**ローカル専用。本番/共有 DB を指さない**）
- 起動 → マイグレーション:
  ```sh
  {{TEST_DB_UP_CMD}}        # 例: docker compose -f docker-compose.test.yml up -d
  {{DB_MIGRATE_CMD}}        # 例: dotenv -e .env.test -- pnpm prisma migrate deploy
  ```
- 各テストの `beforeEach` で外部キー順に `deleteMany()` してクリーンに保つ。

## 認証

- unit / integration: `auth-test-helpers.ts` の `mockAuth()` でガード（`requireAuth`/`requireRole`）をモック。権限違いの異常系も `mockAuth({ role })` で検証。
- E2E: `e2e/global-setup.ts` がテストユーザーでログイン → `e2e/.auth/state.json` に `storageState` を保存。`playwright.config` の `use.storageState` で全 E2E が認証済みで開始。
- テストユーザーはテスト DB にシード（`{{SEED_CMD}}`）。認証情報は `.env.test` の `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`。

## 実行（詳細コマンドは commands.md）

```sh
{{TEST_UNIT_ALL_CMD}}     # unit
{{TEST_INTEGRATION_CMD}}  # 実 DB 統合（テスト DB 起動が前提）
{{TEST_E2E_ALL_CMD}}      # E2E（webServer がテスト DB を読んで自動起動）
```

## メンテナンス

- worktree（ブランチ）を切るたびにテスト DB 名・ポートを変える（衝突回避）。
- `.gitignore`: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`, `e2e/.auth/`, `.env.test` を無視。
