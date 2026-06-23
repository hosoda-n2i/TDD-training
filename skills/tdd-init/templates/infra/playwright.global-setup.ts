/**
 * Playwright globalSetup — テストユーザーでログインし storageState を保存 — {{PROJECT_NAME}}
 *
 * 目的: 認証が要るアプリで E2E を「ログイン済み」状態から始められるようにする。
 * これが無いと E2E は毎回ログインの壁で詰まり、結局 E2E が後回しになる。
 *
 * /tdd-init が検出した認証（{{AUTH}}）に合わせて適応させること。代表パターン:
 *  - フォームログイン: /login でメール/パスワードを入力して送信（下の例）
 *  - テスト用バイパス: .env.test のフラグでテスト用セッション cookie を発行する経路を用意し、それを叩く
 * テストユーザーはテスト DB にシードしておく（test-infra.md 参照）。
 *
 * env 契約（direnv 親子継承を前提に、親 .envrc で以下を export しておく）:
 *   - E2E_BASE_URL       … 例: http://localhost:3000
 *   - E2E_TEST_EMAIL     … テストユーザーのメール（DB に seed 済みであること）
 *   - E2E_TEST_PASSWORD  … テストユーザーのパスワード
 *   - TEST_DATABASE_URL  … webServer が dev/build 起動時に DATABASE_URL として渡す
 *
 * playwright.config.ts 側:
 *   use: { storageState: 'e2e/.auth/state.json', baseURL: process.env.E2E_BASE_URL },
 *   globalSetup: './e2e/global-setup.ts',
 *   webServer: {
 *     command: '<アプリ起動コマンド>',
 *     url: process.env.E2E_BASE_URL,
 *     env: { DATABASE_URL: process.env.TEST_DATABASE_URL ?? '' },
 *     reuseExistingServer: !process.env.CI,
 *   },
 */
import { chromium, type FullConfig } from "@playwright/test";

const STORAGE_STATE = "e2e/.auth/state.json";

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    config.projects[0]?.use?.baseURL ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // --- ここを検出した認証に合わせて適応させる（例: フォームログイン）---
  await page.goto(`${baseURL}/login`);
  await page.getByLabel(/email|メール/i).fill(process.env.E2E_TEST_EMAIL ?? "test@example.com");
  await page.getByLabel(/password|パスワード/i).fill(process.env.E2E_TEST_PASSWORD ?? "password");
  await page.getByRole("button", { name: /log\s?in|ログイン|サインイン/i }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
  // ----------------------------------------------------------------

  await page.context().storageState({ path: STORAGE_STATE });
  await browser.close();
}
