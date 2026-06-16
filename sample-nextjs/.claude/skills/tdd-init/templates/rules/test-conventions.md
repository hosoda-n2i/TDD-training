# テスト規約 — {{PROJECT_NAME}}

> `/tdd-init` が検出・ドメイン反映した、このプロジェクトのテストの書き方。
> **既存テストが正**。新規テストは既存に合わせる。迷ったら同種の既存テストを1つ開いて真似る。
> 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}} ／ ルーティング: {{NEXT_ROUTER}}

## unit / component（Vitest + React Testing Library）

- **配置**: {{UNIT_TEST_LOCATION}}（既存に準拠。例: ソースと同階層の `*.test.ts(x)`）
- **命名**: `*.test.ts` / `*.test.tsx`。テスト名は**振る舞い**を仕様の言葉で記述する。
- **構造**: Arrange → Act → Assert。1テスト = 1つの論理的な振る舞い。
- **コンポーネント**: React Testing Library で**ユーザー視点**（role/label/text）で検証。実装詳細（内部 state・class 名）に依存しない。
- **アサーション**: `expect(x).toBe(y)` / `toEqual` / jest-dom マッチャ（`toBeInTheDocument` 等）。

## E2E（Playwright）

- **配置**: {{E2E_TEST_LOCATION}}（例: `e2e/*.spec.ts`）
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

<!-- 既存 CLAUDE.md / AGENTS.md / 既存テストから読み取った固有規約をここに転記する。
     例: テスト用 DB の扱い、認証のモック方法、共通フィクスチャの場所、ドメイン特有の前提など。 -->
