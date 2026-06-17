/**
 * 認証テストヘルパー（unit / integration 用）— {{PROJECT_NAME}}
 *
 * 目的: サーバ側の認証ガード（{{AUTH}} の requireAuth / requireRole 等）をモックし、
 * 認可ロジックを含むサービス/アクションを unit・統合テストで回せるようにする。
 * E2E は実ログイン（playwright.global-setup.ts の storageState）を使うのでこれとは別。
 *
 * /tdd-init が検出した認証モジュールのパスと関数名に合わせて適応させること。
 * 下は Vitest + 「src/lib/auth.ts に requireAuth/requireRole がある」例。
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

/**
 * 認証ガードを「ログイン済み」にモックする。各テストの先頭で呼ぶ。
 * 例: mockAuth({ role: "OPERATOR" }) で権限違いの異常系も検証できる。
 */
export function mockAuth(user: Partial<TestUser> = {}) {
  const current = { ...defaultTestUser, ...user };
  vi.mock("@/lib/auth", () => ({
    requireAuth: vi.fn(async () => current),
    requireRole: vi.fn(async (roles: string[]) => {
      if (!roles.includes(current.role)) {
        throw new Error("Forbidden");
      }
      return current;
    }),
    getCurrentUser: vi.fn(async () => current),
  }));
  return current;
}
