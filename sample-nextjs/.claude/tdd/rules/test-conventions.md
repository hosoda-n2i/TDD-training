# テスト規約 — sample-nextjs

> `/tdd-init` が検出・ドメイン反映した、このプロジェクトのテストの書き方。
> **既存テストが正**。新規テストは既存に合わせる。迷ったら同種の既存テストを1つ開いて真似る。
> 実装/コンポーネント/サービスの配置: src/app（App Router ページ）、src/lib（純粋ロジック）、src/components（共有コンポーネント） ／ ルーティング: App Router

## unit / component（Vitest + React Testing Library）

- **配置**: ソースと同階層の `*.test.ts(x)`（例: `src/lib/formatPrice.test.ts`、`src/app/price/page.test.tsx`）
- **命名**: `*.test.ts` / `*.test.tsx`。テスト名は**振る舞い**を仕様の言葉で記述する。
- **構造**: Arrange → Act → Assert。1テスト = 1つの論理的な振る舞い。
- **コンポーネント**: React Testing Library で**ユーザー視点**（role/label/text）で検証。実装詳細（内部 state・class 名）に依存しない。
- **アサーション**: `expect(x).toBe(y)` / `toEqual` / jest-dom マッチャ（`toBeInTheDocument` 等）。

## E2E（Playwright）

- **配置**: `e2e/*.spec.ts`
- **対象**: 画面をまたぐユーザー操作フロー・受け入れシナリオ。ロジック単体は unit に寄せる。
- セレクタは role / ラベル / `getByTestId` を優先（脆い CSS セレクタを避ける）。

## モック / スタブ

- **外部境界だけモックする**: ネットワーク・時刻・乱数・外部 API・DB。**自分のドメインロジックはモックしない**。
- Next.js 固有: route handler / server actions / `fetch` は境界としてモック対象。server component のデータ取得は境界で差し替える。
- 過剰なモックは「実装をなぞるだけのテスト」を生む。可能な限り本物を使い、必要箇所だけ差し替える。

## 何をテストするか

- **する**: 公開された振る舞い・受け入れ条件・境界値・異常系・回帰（過去のバグ）。
- **しない**: フレームワーク/ライブラリ自体の挙動、private 実装詳細、自明な getter/setter。
- カバレッジは目安であって目的ではない。**受け入れ条件を網羅する**ことを優先。

## このプロジェクト固有のメモ

- 純粋ロジック（整形・計算・バリデーション）は `src/lib/*.ts` に配置し、unit テストを同階層に置く。
- ページコンポーネント（App Router）のテストは `src/app/<path>/page.test.tsx` に配置。
- `"use client"` コンポーネントは RTL でテスト可能。Server Component は E2E で検証。
