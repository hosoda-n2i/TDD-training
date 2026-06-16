---
name: tdd-init
description: TypeScript / Node.js（主に Next.js）プロジェクトを「仕様駆動 TDD」で開発できる状態にするブートストラップスキル。プロジェクトのドメインを読み取り、そのプロジェクト固有の rules と skills（/spec・/tdd）を .claude/ 配下に生成し、テスト基盤（Vitest / Playwright）が無ければ導入する。テストをまだ書いていないプロジェクトにも適用できる。「TDD をセットアップ」「tdd-init」「仕様駆動TDDの準備」等と言われたら使う。一度実行すれば以降は /spec と /tdd で開発する。
---

# tdd-init — 仕様駆動 TDD 環境のブートストラップ（ジェネレータ）

このスキルは **ジェネレータ**。実行されたプロジェクトの **ドメイン** を読み取り、そのプロジェクト固有の
**rules（常時効く規律）** と **skills（叩いて使う手順）** を生成する。スキル自身は汎用のまま、出力物がドメイン特化になる。

## 前提（技術スタックは固定。汎用化しない）

- **TypeScript + Node.js**、主に **Next.js**。マルチ言語検出はしない。
- **ユニット = Vitest（+ React Testing Library）**、**E2E = Playwright**。これらが無ければ導入する。
- 「テストランナーが有るか」を見て終わりにしない。**無ければ立ち上げる**のがこのスキルの役割。

## 生成物（すべて対象プロジェクトの `.claude/` 配下）

### skills（`.claude/skills/`）
| パス | 役割 |
|------|------|
| `.claude/skills/spec/SKILL.md` | `/spec` … ラフな要望/チケットから**仕様書を起こし、精査**する |
| `.claude/skills/tdd/SKILL.md` | `/tdd` … 精査済み仕様書から**8ステップの仕様駆動TDD**を駆動する |

### rules（`.claude/tdd/rules/`、`CLAUDE.md` から `@import` で常時ロード）
| パス | 役割 |
|------|------|
| `.claude/tdd/rules/tdd-flow.md` | 仕様駆動TDDの規律（`/spec`→`/tdd`、テスト先行、緑を壊さない） |
| `.claude/tdd/rules/test-conventions.md` | **ドメイン反映**のテスト規約（Next.js 前提。unit/E2E の配置・命名・モック方針） |
| `.claude/tdd/rules/spec-conventions.md` | 仕様書のフォーマット（受け入れ条件の書き方） |

### docs（`.claude/tdd/`、skills が読む参照資料）
| パス | 役割 |
|------|------|
| `.claude/tdd/commands.md` | Vitest / Playwright / lint / typecheck の**実コマンド** |
| `.claude/tdd/test-strategy.md` | unit / integration / E2E の使い分け（どの要件をどのレベルで） |
| `.claude/tdd/progress.md` | 仕様ごとの進捗ログ |
| `.claude/tdd/specs/` | `/spec` が生成する仕様書の置き場（ディレクトリだけ作る） |

> テンプレートはこの SKILL.md と同階層の `templates/` にある（`skills/`・`rules/`・`docs/`・`spec-template.md`）。
> 生成時は **テンプレを読み、`{{...}}` を検出・ドメイン情報で置換** して書き出す。

---

## 手順

### 0. 前提確認
- 対象プロジェクトのルートを確認（`git rev-parse --show-toplevel`、無ければ `pwd`）。
- 生成先は **対象プロジェクトの `.claude/`**。このスキル自身のディレクトリには書き込まない。

### 1. 既存の規約を最優先で読む
- ルートの `CLAUDE.md` / `AGENTS.md` / `AGENT.md`（あれば全文。参照先も）、`.cursor/rules/**`, `.claude/rules/**`, `docs/**`。
- 既存テストがあればそのディレクトリ（現状の書き方が答え）。明文化された規約は一般論より優先。

### 2. ドメインを把握する（タイアリングの核）
このプロジェクトが**何をするアプリか**を読み取る。生成物にこのプロジェクト固有の語彙・配置を反映するため。
- README / AGENTS / `package.json` の説明、主要ディレクトリ構成（`src/` 配下の `app`・`components`・`lib`・`services` 等の置き場）
- ドメイン語彙（エンティティ名、主要なユースケース）
- 確定する値:
  - `{{PROJECT_NAME}}` … プロジェクト名
  - `{{DOMAIN_SUMMARY}}` … このアプリの責務（1〜2行）
  - `{{SRC_LAYOUT}}` … 実装/コンポーネント/サービスの配置（例: `src/app`, `src/components`, `src/lib`）
  - `{{NEXT_ROUTER}}` … App Router / Pages Router / （Next.js でなければ「Node ライブラリ」）

### 3. スタック内の構成を検出する（TS/Node/Next.js 前提）
- `{{PKG_MANAGER}}` … `npm` / `pnpm` / `yarn` / `bun`（lockfile で判定）
- 既存の **Vitest** 設定（`vitest.config.*`, devDeps）、**Playwright** 設定（`playwright.config.*`）の有無
- `{{LINT_CMD}}` / `{{TYPECHECK_CMD}}` / `{{BUILD_CMD}}` … `package.json` の scripts から実在分

### 4. テスト基盤を用意する（無ければ導入）
**ユニット（Vitest）は常に整える。** 既存があれば再利用、無ければ導入:
- devDeps: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @vitest/coverage-v8`
- `vitest.config.mts`（jsdom 環境・`@/` エイリアス・setup ファイル）、`vitest.setup.ts`（`@testing-library/jest-dom/vitest`）、`package.json` に `test` / `test:watch` / `coverage` / `typecheck` を追加。

**E2E（Playwright）は、Web アプリ（Next.js）かつユーザー操作フローを扱う場合に、導入してよいかを1度だけ確認**してから:
- `npm create playwright@latest`（または pkg manager 相当）で導入。`e2e/` にシナリオを置く構成。
- Node ライブラリ等で E2E が不要なら導入しない（`test-strategy.md` に「E2E: 対象外」と明記）。

> 導入はローカルのインストール。**push やリモート接続は伴わない**。Playwright のブラウザ DL は重いので確認を挟む。

### 5. skills を生成する
`templates/skills/spec.md` → `.claude/skills/spec/SKILL.md`、`templates/skills/tdd.md` → `.claude/skills/tdd/SKILL.md`。
`{{...}}` を 2〜4 の結果で置換。ドメイン語彙・配置を本文に織り込む。

### 6. rules と docs を生成する
- `templates/rules/*` → `.claude/tdd/rules/*`
- `templates/docs/*` → `.claude/tdd/*`、`templates/spec-template.md` → `.claude/tdd/spec-template.md`、`.claude/tdd/specs/` を作成
- `test-conventions.md` には検出した `{{SRC_LAYOUT}}` とドメインを反映（一般論で埋めない）。
- `commands.md` は **実在するコマンドだけ**。無いものは「なし」と書く（捏造しない）。

### 7. CLAUDE.md を配線する
対象プロジェクトのルート `CLAUDE.md`（無ければ最小作成）に、rules の `@import` と短い TDD セクションを追記する（既にあれば重複させない）:

```markdown
## TDD（仕様駆動）

このプロジェクトは仕様駆動 TDD で開発する。新機能は `/spec` で仕様を起こし精査 → `/tdd` で実装する。
規律・規約・コマンドは以下を参照（常時適用）:

@.claude/tdd/rules/tdd-flow.md
@.claude/tdd/rules/test-conventions.md
@.claude/tdd/rules/spec-conventions.md
```

### 8. 報告する
生成/更新したファイルと、導入したテスト基盤、次の一歩を簡潔に伝える:
> セットアップ完了。`/spec <作りたい機能のラフな説明>` で仕様を起こすところから始められます。

---

## 設計上の約束
- **スタックは TS/Node/Next.js 固定**。ドメイン（プロジェクト個別性）だけを汎用パラメータとして扱う。
- **検出 > 一般論**。既存テスト・既存規約・実コマンドが常に優先。
- **コマンドは実在分だけ**。無いものは「なし」。
- **このスキルはセットアップ専用**。日々は `/spec` と `/tdd` が回す。再セットアップ時だけ `tdd-init` を再実行。
- **生成先は対象プロジェクトの `.claude/` のみ**。このスキルのディレクトリは読み取り専用。
