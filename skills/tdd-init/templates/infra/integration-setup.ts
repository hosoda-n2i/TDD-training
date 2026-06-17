/**
 * 実 DB を使う統合テストの globalSetup（Vitest）— {{PROJECT_NAME}}
 *
 * /tdd-init が検出した DB/マイグレーションに合わせて適応させること（下記は Prisma + Postgres の例）。
 * 役割: テスト DB にスキーマを適用し、テスト全体の前に整える。
 * 各テストのデータクリーンは各 integration テストの beforeEach で行う（外部キー順に deleteMany 等）。
 *
 * 使い方: vitest.config.mts の test.globalSetup にこのファイルを指定し、
 * 実 DB を使う統合テストだけを対象にする（projects/別 config に分けると安全）。
 * DATABASE_URL は .env.test のテスト DB を指すこと（本番/共有 DB を指さない）。
 */
import { execFileSync } from "node:child_process";

// 検出したマイグレーションコマンドを argv 配列で埋める（shell を介さない）。
// 例: ["pnpm", "prisma", "migrate", "deploy"]
const MIGRATE_ARGV: string[] = {{DB_MIGRATE_ARGV}};

export default async function setup() {
  // テスト DB を指していることを最低限ガード（事故防止）
  const url = process.env.DATABASE_URL ?? "";
  if (!/test/i.test(url)) {
    throw new Error(
      `[integration-setup] DATABASE_URL がテスト DB を指していません: ${url}\n` +
        `.env.test を読み込んで testdb_* を指すようにしてください。`,
    );
  }

  // マイグレーション適用。shell を使わず execFileSync + 引数配列で実行する。
  const [cmd, ...args] = MIGRATE_ARGV;
  execFileSync(cmd, args, { stdio: "inherit" });
}
