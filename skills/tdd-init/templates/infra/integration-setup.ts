/**
 * 実 DB を使う統合テストの globalSetup（Vitest）— {{PROJECT_NAME}}
 *
 * /tdd-init が検出した DB / マイグレーションに合わせて適応させること（下記は Prisma + Postgres の例）。
 * 役割: テスト DB にスキーマを適用し、テスト全体の前に整える。
 * 各テストのデータクリーンは各 integration テストの beforeEach で行う（外部キー順に deleteMany 等）。
 *
 * 使い方: vitest.config.mts の test.globalSetup にこのファイルを指定し、
 * 実 DB を使う統合テストだけを対象にする（projects/別 config に分けると安全）。
 *
 * env 契約（direnv 親子継承を前提）:
 *   - TEST_DATABASE_URL … 一次ソース。親 .envrc が `postgresql://.../testdb_*?...` を持つ。
 *   - DATABASE_URL      … fallback。worktree 個別 .envrc で `=$TEST_DATABASE_URL` 上書きしている運用に対応。
 *   どちらの経路でも「URL に 'test' を含む」ことをガードする（本番 / 共有 DB への誤接続防止）。
 */
import { execFileSync } from "node:child_process";

// 検出したマイグレーションコマンドを argv 配列で埋める（shell を介さない）。
// 例: ["pnpm", "prisma", "migrate", "deploy"]
const MIGRATE_ARGV: string[] = {{DB_MIGRATE_ARGV}};

export default async function setup() {
  // TEST_DATABASE_URL を優先、無ければ DATABASE_URL にフォールバック
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
  if (!url) {
    throw new Error(
      `[integration-setup] TEST_DATABASE_URL / DATABASE_URL のどちらも未設定です。\n` +
        `親 .envrc または .env.test で testdb_* を指す URL を export してください。`,
    );
  }
  // テスト DB を指していることを最低限ガード（事故防止）
  if (!/test/i.test(url)) {
    throw new Error(
      `[integration-setup] DATABASE_URL がテスト DB を指していません: ${url}\n` +
        `URL 内に "test" 文字列を含む必要があります（例: testdb_<branch>）。`,
    );
  }
  // マイグレーション実行時に DATABASE_URL がテスト DB を指すよう統一
  process.env.DATABASE_URL = url;

  // マイグレーション適用。shell を使わず execFileSync + 引数配列で実行する。
  const [cmd, ...args] = MIGRATE_ARGV;
  execFileSync(cmd, args, { stdio: "inherit" });
}
