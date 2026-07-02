/**
 * 認証テストヘルパー（unit / integration 用）— {{PROJECT_NAME}}
 *
 * 目的: サーバ側の認証ガード（{{AUTH}} の requireAuth / requireRole 等）をモックし、
 * 認可ロジックを含むサービス/アクションを unit・統合テストで回せるようにする。
 * E2E は実ログイン（playwright.global-setup.ts の storageState）を使うのでこれとは別。
 *
 * /tdd-init が検出した認証モジュールのパスと関数名に合わせて適応させること。
 * 下は Vitest + 「src/lib/auth.ts に requireAuth/requireRole がある」例。
 *
 * 使い方（2 点セット。テストファイル側の vi.mock 登録が必須）:
 *
 *   // 1) テストファイルの top-level で 1 回登録する（パスは生成先に合わせる）
 *   import { vi } from "vitest";
 *   import { mockAuth } from "@/lib/test-utils/auth-mock";
 *   vi.mock("@/lib/auth", async () => (await import("@/lib/test-utils/auth-mock")).authMockFactory());
 *
 *   // 2) beforeEach で mockAuth() を呼んでリセットし、各テストの先頭でロールを切り替える
 *   beforeEach(() => { mockAuth(); });
 *   it("...", async () => { mockAuth({ role: "OPERATOR" }); ... });
 *
 * 注意: vi.mock() をこのヘルパーの関数内から呼ぶ形にしないこと。vi.mock はネストしていても
 * ファイル top-level に hoist されるため、factory が関数ローカル変数を参照すると
 * ReferenceError になる（Vitest 4 で確認済み。ネストした vi.mock は将来エラー化予告あり）。
 */
import { vi } from "vitest";

export type TestUser = {
  uid: string;
  role: "ADMIN" | "OPERATOR" | string;
  email?: string;
};

export const defaultTestUser: TestUser = {
  uid: "test-user-1",
  role: "ADMIN",
  email: "test@example.com",
};

// 現在のテストユーザー（モジュールシングルトン）。mockAuth() で差し替える。
let current: TestUser = { ...defaultTestUser };

/**
 * 認証ガードの返すユーザーを切り替える。beforeEach でリセットし、各テストの先頭で呼ぶ。
 * 例: mockAuth({ role: "OPERATOR" }) で権限違いの異常系も検証できる。
 * （テストファイル側で vi.mock + authMockFactory の登録が済んでいることが前提）
 */
export function mockAuth(user: Partial<TestUser> = {}): TestUser {
  current = { ...defaultTestUser, ...user };
  return current;
}

/**
 * vi.mock 用の factory。テストファイルの top-level で登録する:
 *   vi.mock("@/lib/auth", async () => (await import("<このファイル>")).authMockFactory());
 * モック実装は呼び出し時点の current を読むので、mockAuth() によるテストごとの切り替えが効く。
 */
export function authMockFactory() {
  return {
    requireAuth: vi.fn(async () => current),
    requireRole: vi.fn(async (roles: string[]) => {
      if (!roles.includes(current.role)) {
        throw new Error("Forbidden");
      }
      return current;
    }),
    getCurrentUser: vi.fn(async () => current),
  };
}
