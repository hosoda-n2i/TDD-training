# テスト実行基盤 — sample-nextjs

> `/tdd-init` がセットアップしたテスト実行基盤。**このプロジェクトは DB・認証を持たない**ため、実 DB 統合・storageState 認証といった重い基盤（Phase B）は**構造的に対象外**。下記の最小構成で `/e2e`・`/tdd`・`/harden` が回る。

## レベル別に必要な基盤

| レベル | 必要なもの | このプロジェクトでの状態 |
|--------|-----------|--------------------------|
| unit | Vitest（+RTL） | 利用可能（導入済み） |
| integration（境界モック） | 追加基盤なし。ネットワーク/時刻/乱数/外部 API をモック | 利用可能（純ロジック中心のため出番は少ない） |
| integration（実 DB） | テスト DB（Docker）＋マイグレーション | **対象外（DB なし）** |
| E2E | アプリ起動（認証なし） | Playwright 導入済み（`PORT=4000 npm run dev` を webServer 起動・storageState なし） |
| VDD（property/mutation） | fast-check / Stryker | 導入済み（`npm run mutation`） |

## E2E（認証なし）

- `playwright.config.ts` の `webServer` が `PORT=4000 npm run dev` を起動し、`baseURL=http://localhost:4000` でテストする。
- 認証が無いため `globalSetup` / `storageState` は使わない。テストは素の `@playwright/test` の `test` を使う（`e2e/price.spec.ts` 参照）。

## DB / 認証を導入したら（将来）

`/tdd-init` を再実行し、Phase B（テスト DB の `docker-compose.test.yml`・統合 globalSetup・ログイン→storageState・env 契約）を追加する。手順はジェネレータ側テンプレ（`skills/tdd-init/templates/infra/`）にある。

## 実行（詳細コマンドは commands.md）

```sh
npm test            # unit + property（Vitest）
npm run mutation    # mutation（Stryker）
npm run test:e2e    # E2E（webServer が dev を自動起動）
```

## メンテナンス

- `.gitignore`: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`, `/reports/`（Stryker）を無視。
