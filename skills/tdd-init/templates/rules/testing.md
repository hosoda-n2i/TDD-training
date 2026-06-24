---
description: テストの書き方・配置・モック方針・実コード例（unit / integration / E2E）。`*.test.ts` / `*.spec.ts` / `e2e/**` / `vitest.config.*` / `playwright.config.*` を編集中なら自動添付。
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/*.spec.tsx"
  - "vitest.config.ts"
  - "vitest.config.mts"
  - "e2e/**"
  - "playwright.config.ts"
---

# Testing Rules — {{PROJECT_NAME}}

> `/tdd-init` が検出した実コード例を埋め込んだ規約。**既存テストが正**。新規テストは既存に合わせる。迷ったら同種の既存テストを 1 本開いて真似る。
> 実装 / コンポーネント / サービスの配置: {{SRC_LAYOUT}} ／ ルーティング: {{NEXT_ROUTER}}

## テスト戦略: dual-loop TDD

E2E を外側ループ、unit / integration を内側ループとして回す（詳細は `.claude/rules/tdd-flow.md`）。

```
外側 (E2E / Playwright)   …… ユーザー操作フロー = acceptance
内側 (Vitest)             …… 1 受け入れ条件 = 1 テスト = 1 サイクル
```

### 使い分け

| | Unit / Integration (Vitest) | E2E (Playwright) |
|--|--|--|
| 対象 | {{INTEGRATION_TARGETS}} | ページ遷移 / フォーム → DB → 画面の一連の流れ |
| 速度 | 速い（msec〜sec）、高頻度で回す | 遅い（sec〜十sec）、機能が繋がった段階で回す |
| DB | {{INTEGRATION_DB_POLICY}} | {{E2E_DB_POLICY}} |
| Auth | {{INTEGRATION_AUTH_POLICY}} | {{E2E_AUTH_POLICY}} |
| 実行 | `{{TEST_UNIT_ALL_CMD}}` | `{{TEST_E2E_ALL_CMD}}` |

## TDD is mandatory

- **テストを先に書く。** RED フェーズを飛ばさない。
- **1 サイクル = 1 テストケース。** 大きく書かない。
- **毎回テストを走らせて緑 / 赤を確認**する。

## テスト構造

- **Arrange → Act → Assert** の 3 段。
- 1 テスト = 1 振る舞いの検証。複数 assert は単一論理の確認時のみ。
- テスト間に共有可変状態を持たない（各テストが独立して通る）。

## 何をテストするか

- **する**: 公開された振る舞い・受け入れ条件・境界値・異常系・回帰（過去のバグ）。
- **しない**: フレームワーク / ライブラリ自体の挙動、private 実装詳細、自明な getter / setter。
- カバレッジは目安であって目的ではない。**受け入れ条件を網羅する**ことを優先する（その上で 80%+ を維持）。

## 配置

- **Unit / Integration**: {{UNIT_TEST_LOCATION}}（既存に準拠。例: ソースと同階層の `*.test.ts(x)`）
- **E2E**: {{E2E_TEST_LOCATION}}（例: `e2e/<feature>/<action>.spec.ts`）

---

## Unit / Integration テスト（Vitest）

### 配置の規約

- ソースと同階層（`Button.tsx` → `Button.test.tsx`）
- テスト名は **振る舞い** を仕様の言葉で記述する（`returns rooms for the given user` 等）
- 対応する REQ があれば `// @covers REQ-NNN` をテスト内に記述する（詳細は `.claude/rules/spec-conventions.md`）
- セマンティックセレクタを使う（`getByRole` / `getByText` / `getByLabel`）。実装詳細（内部 state / class 名）に依存しない

### 基本パターン（Arrange–Act–Assert）

```ts
import { describe, it, expect } from 'vitest'
import { calculateTotal } from './calculate-total'

describe('calculateTotal', () => {
  it('returns the sum of all items', () => {
    // Arrange
    const items = [{ price: 100 }, { price: 200 }]
    // Act
    const result = calculateTotal(items)
    // Assert
    expect(result).toBe(300)
  })
})
```

### コンポーネントテスト（React Testing Library）

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CounterButton } from './counter-button'

describe('CounterButton', () => {
  it('increments count when clicked', async () => {
    const user = userEvent.setup()
    render(<CounterButton />)
    await user.click(screen.getByRole('button', { name: 'カウント' }))
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### DB テスト（{{DB}} がある場合）

**DB はモックせず、テスト DB に実接続する**（モックすると schema 変更で全テストが嘘になる）。

```ts
// src/lib/db/test-utils.ts （tdd-init が生成）
{{DB_TEST_UTILS_SNIPPET}}
```

```ts
// テスト本体
import { describe, it, beforeEach, expect } from 'vitest'
import { testDb, cleanupTestDb } from '@/lib/db/test-utils'
import { schema } from '@/lib/db/schema'
import { getRoomsByUser } from './rooms'

describe('getRoomsByUser', () => {
  beforeEach(async () => {
    await cleanupTestDb()
  })

  it('returns rooms for the given user', async () => {
    // Arrange
    await testDb.insert(schema.rooms).values({
      name: 'Test Room',
      createdBy: 'user-1',
    })
    // Act
    const result = await getRoomsByUser('user-1')
    // Assert
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test Room')
  })

  it('returns empty array when user has no rooms', async () => {
    const result = await getRoomsByUser('user-1')
    expect(result).toEqual([])
  })
})
```

### 外部サービスのモック

DB は本物。**ネットワーク / 時刻 / 乱数 / 外部 API / 認証**は境界としてモック。

```ts
// 認証（{{AUTH}} の例）
{{AUTH_MOCK_SNIPPET}}
```

```ts
// 時刻
import { vi } from 'vitest'
vi.useFakeTimers()
vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
```

### モックの方針

- **モックして良いもの**: ネットワーク・時刻・乱数・外部 API・認証サービス
- **モックしてはいけないもの**: 自分のドメインロジック・DB（テスト DB を使う）
- 過剰なモックは「実装をなぞるだけのテスト」を生む。可能な限り本物を使い、必要箇所だけ差し替える。

---

## VDD ハードニング（緑の後の検証強化）

example-based なテストが緑になった後、`/harden`（`verifier` agent）で次の 2 つを上乗せして「テストの効き」を上げる。**property は「どこまで広く」、mutation は「どこまで深く」テストが効いているか**の検証で、互いを補う。

### property-based testing（fast-check）

個別の入力例ではなく、入力空間全体に対して成り立つべき**不変条件**を検証する。純粋ロジック関数（入出力が閉じ、副作用が無いもの）が主対象。

```ts
import { test, expect } from 'vitest'
import fc from 'fast-check'
import { sortNumbers } from './sort-numbers'

test('sortNumbers は冪等で、要素を保存し、昇順になる', () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (arr) => {
      const sorted = sortNumbers(arr)
      // output is ascending
      for (let i = 1; i < sorted.length; i++) expect(sorted[i - 1] <= sorted[i]).toBe(true)
      // idempotent
      expect(sortNumbers(sorted)).toEqual(sorted)
      // preserved as a multiset
      expect([...sorted].sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b))
    }),
  )
})
```

代表的な不変条件: roundtrip（`decode(encode(x)) === x`）/ 冪等（`f(f(x)) === f(x)`）/ 可換・結合 / 出力域（出力が常に満たす範囲・形）/ 例外条件（不正入力で必ず throw する・しない）。反例が出たら、実装とテスト（不変条件の理解）のどちらが誤りかを判断して直す。

### mutation testing（Stryker）

テストの**「殺傷力」を測る**。実装をわざと書き換えた変異体（mutant）を流し、テストがそれを検出（kill）できるかを見る。**生存ミュータント（survived）＝テストが見逃しているケース**なので、それを kill する最小のテストを足して潰す（既存テストは消さない・上乗せ）。

- 実行は `{{MUTATION_CMD}}`（重いので対象を絞って回し、全体実行は仕上げに 1 回）。
- mutation score の閾値はプロジェクトの `stryker.config.json` の `thresholds` に従う。等価ミュータント（原理的に kill できない変異）は無理に潰さず理由を残す。
- DB / ドメインロジックはモックしない方針はここでも同じ。過剰モックは生存ミュータントを増やす。

---

## E2E テスト（Playwright）

### ファイル構成

```
e2e/
├── fixtures/
│   ├── auth.ts           # 認証済み Page fixture
│   └── db.ts             # テストデータの seed / cleanup
├── {{E2E_FEATURE_DIR_EXAMPLE}}/
│   └── <action>.spec.ts
└── helpers/
    └── ...
```

### 認証（{{AUTH}} がある場合）

`playwright.config.ts` の `globalSetup` でテストユーザーをログインさせ、`storageState` を保存する。テスト本体はその state を読んで認証済み状態で開始する。

```ts
// e2e/fixtures/auth.ts
{{E2E_AUTH_FIXTURE_SNIPPET}}
```

### 基本パターン

```ts
// e2e/{{E2E_FEATURE_DIR_EXAMPLE}}/create.spec.ts
import { test } from '../fixtures/auth'
import { expect } from '@playwright/test'

test.describe('{{機能名の例}}', () => {
  test('creates a new room and redirects to room page', async ({ authenticatedPage: page }) => {
    await page.goto('/rooms')
    await page.getByRole('link', { name: 'ルーム作成' }).click()

    await page.getByLabel('ルーム名').fill('テストルーム')
    await page.getByLabel('顧客企業名').fill('株式会社テスト')
    await page.getByRole('button', { name: '作成' }).click()

    await expect(page).toHaveURL(/\/rooms\/[\w-]+/)
    await expect(page.getByRole('heading', { name: 'テストルーム' })).toBeVisible()
  })
})
```

### セレクタ優先順位

1. **`getByRole` / `getByLabel` / `getByText`** ← 最優先（ユーザー視点）
2. **`getByTestId`** ← 上記で取れない時のみ
3. **CSS / XPath** ← 禁止（脆い）

UI テキストは {{UI_LANGUAGE}} なのでセレクタも {{UI_LANGUAGE}} で書く。

### Playwright config の要点

```ts
// playwright.config.ts
{{PLAYWRIGHT_CONFIG_SNIPPET}}
```

---

## 共通ルール

- **二重ループ**: E2E で acceptance を RED にし、unit / integration で内側を小さく回して実装、最後に E2E を GREEN で確認する。
- DB テストは**実テスト DB に接続**する。モック DB は使わない。
- `beforeEach` で `cleanupTestDb()` を呼び、テストごとにデータをリセットする。
- テストデータは各テスト内で直接 insert する。共有 seed に依存しない。
- 認証は unit / integration ではモック、E2E では実ログイン（storageState 経由）。
- E2E はセマンティックセレクタ優先。`data-testid` は最終手段。
- E2E は `e2e/` に機能ごとのディレクトリで整理する。
- ログメッセージは {{LOG_LANGUAGE}}、コードコメントは英語。

## このプロジェクト固有のメモ

<!-- 既存 CLAUDE.md / AGENTS.md / 既存テストから読み取った固有規約をここに転記する。
     例: テスト用 DB の扱い、認証のモック方法、共通フィクスチャの場所、ドメイン特有の前提など。 -->
