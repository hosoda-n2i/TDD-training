---
name: tdd-init
description: TypeScript / Node.js（主に Next.js）プロジェクトを「仕様駆動 TDD」で開発できる状態にするブートストラップスキル。プロジェクトのドメインを読み取り、そのプロジェクト固有の rules と skills（/spec・/tdd）を .claude/ 配下に生成し、テスト基盤（Vitest / Playwright）に加えて統合/E2E を実際に走らせるための実行基盤（テスト用 DB・認証・シード）まで用意する。テストをまだ書いていないプロジェクトにも適用できる。「TDD をセットアップ」「tdd-init」「仕様駆動TDDの準備」等と言われたら使う。一度実行すれば以降は /spec と /tdd で開発する。
---

# tdd-init — 仕様駆動 TDD 環境のブートストラップ（ジェネレータ）

このスキルは **ジェネレータ**。実行されたプロジェクトの **ドメイン** を読み取り、そのプロジェクト固有の
**rules（常時効く規律）** と **skills（叩いて使う手順）** を生成する。スキル自身は汎用のまま、出力物がドメイン特化になる。

## 前提（技術スタックは固定。汎用化しない）

- **TypeScript + Node.js**、主に **Next.js**。マルチ言語検出はしない。
- **ユニット = Vitest（+ React Testing Library）**、**E2E = Playwright**。これらが無ければ導入する。
- 「テストランナーが有るか」を見て終わりにしない。**無ければ立ち上げる**のがこのスキルの役割。
- **最重要: 統合(integration)・E2E を“実際に走らせる”実行基盤（テスト用 DB・認証のテスト経路・シード・ログイン済み状態）まで用意する。** ここを後回しにすると、`/tdd` は統合/E2E を諦めて unit にしか倒れなくなる。基盤が無いことが「unit しか書かない」の根本原因なので、セットアップで**疎通確認まで**やり切る（「未実装・必要時に」で終わらせない）。

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
| `.claude/tdd/test-infra.md` | **統合/E2E の実行基盤**（テスト DB・認証・シード・storageState）の構成と起動手順 |
| `.claude/tdd/progress.md` | 仕様ごとの進捗ログ |
| `.claude/tdd/specs/` | `/spec` が生成する仕様書の置き場（ディレクトリだけ作る） |

### 実行基盤（プロジェクトルート。DB/認証を検出したら用意）
| パス | 役割 |
|------|------|
| `docker-compose.test.yml` | ブランチ別のテスト用 DB（実 DB 統合・E2E 用） |
| `.env.test`（example） | テスト DB 接続・認証バイパス等のテスト環境変数 |
| 統合 globalSetup（Vitest） | テスト DB のマイグレーション適用 + データクリーン |
| `e2e/global-setup.ts`（Playwright） | テストユーザーでログイン → `storageState` 保存（認証済み E2E のため） |
| 認証テストヘルパー | `requireAuth`/`requireRole` 等のモック（unit/統合）・テストユーザーのシード |

> テンプレートはこの SKILL.md と同階層の `templates/` にある（`skills/`・`rules/`・`docs/`・`infra/`・`spec-template.md`）。
> 生成時は **テンプレを読み、`{{...}}` を検出・ドメイン情報で置換** して書き出す。**実行基盤テンプレは検出した DB/認証に合わせて適応**させる（Prisma/Postgres・Firebase 等）。

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
- **データ層**（統合/E2E の基盤判断に必須）:
  - `{{DB}}` … Prisma（`prisma/schema.prisma`）/ Drizzle / その他 / 無し。DB 種別（Postgres など）、マイグレーションコマンド（`prisma migrate deploy` 等）、接続 env 名（`DATABASE_URL` 等）。
  - `{{REPO_PATTERN}}` … データアクセスの形（例: repository 層をモックする規約か、実 DB か）。既存 rules / 既存テストから読む。
- **認証**（E2E のログイン基盤に必須）:
  - `{{AUTH}}` … Firebase / NextAuth / Clerk / 独自 / 無し。サーバ側のガード関数（`requireAuth` / `requireRole` 等）とセッションの持ち方（cookie 等）。
- 上記が「無し」なら該当基盤はスキップしてよい（純ロジックの lib 等）。**あるのに飛ばすのは禁止**。

### 4. テスト基盤と「実行基盤」を用意する（無ければ導入し、疎通確認まで）

`templates/infra/*` を、検出した DB/認証に合わせて適応させて書き出す。重い手順（Docker・ブラウザ DL・依存追加）に入る前に**まとめて1回だけ導入可否を確認**する。

#### (a) ユニット（Vitest）— 常に整える
- 既存があれば再利用、無ければ導入。devDeps: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @vitest/coverage-v8`
- `vitest.config.mts`（jsdom 環境・`@/` エイリアス・setup ファイル）、`vitest.setup.ts`、`package.json` に `test` / `test:watch` / `coverage` / `typecheck` を追加。

#### (b) 統合(integration) の実行基盤
- **サービス層の統合（境界をモック）**: 追加基盤は不要。`test-conventions.md` のモック方針（repository / 認証 / 外部 API を差し替え）で書ける状態にする。
- **実 DB を使う統合（repository 層など、`{{DB}}` がある場合）**: `templates/infra/docker-compose.test.yml` を**ブランチ別 DB 名/ポート**で生成し、`.env.test` と Vitest の**統合用 globalSetup**（マイグレーション適用＋`beforeEach` クリーン）を用意。「未実装・必要時に」で**終わらせない**。

#### (c) E2E（Playwright）— Web アプリで、`{{DB}}`/`{{AUTH}}` も込みで“走る”状態にする
- Playwright 未導入なら導入（`e2e/` 構成）。`.gitignore` に生成物を追加: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`。
- **認証（`{{AUTH}}` がある場合）**: `templates/infra/playwright.global-setup.ts` を適応させ、**テストユーザーでログイン→`storageState` 保存**。`playwright.config` で `storageState` と `webServer`（テスト DB の `.env.test` を読んで dev/build 起動）を設定。
- **DB（`{{DB}}` がある場合）**: `webServer` と globalSetup をテスト DB に向け、シードを投入。
- 認証ガードの**モックヘルパー**（`requireAuth`/`requireRole` 等）を共有フィクスチャとして用意（unit/統合で使う）。

#### (d) 疎通確認（最重要・ここを省かない）
セットアップの締めに、**各レベルが実際に緑になることを確認**する。確認用のスモークは確認後に削除:
- unit: 簡単な 1 テスト。
- 統合（実 DB を使う場合）: テスト DB に接続して 1 件 CRUD する最小テスト。
- E2E: ログイン状態でトップ等を開く最小シナリオ 1 本（`storageState` が効くか）。
- ここで通らなければ、`test-strategy.md` に「対象外」と書いて逃げず、**通るところまで直す**（または本当に対象外なら理由を明記）。

> 導入はローカル操作。**push やリモート接続・本番/共有 DB への接続は伴わない**（テスト DB は Docker のローカル専用）。Docker・ブラウザ DL は重いので (a)〜(c) の導入可否は冒頭で1回確認する。

### 5. skills を生成する
`templates/skills/spec.md` → `.claude/skills/spec/SKILL.md`、`templates/skills/tdd.md` → `.claude/skills/tdd/SKILL.md`。
`{{...}}` を 2〜4 の結果で置換。ドメイン語彙・配置を本文に織り込む。

### 6. rules と docs を生成する
- `templates/rules/*` → `.claude/tdd/rules/*`
- `templates/docs/*` → `.claude/tdd/*`、`templates/spec-template.md` → `.claude/tdd/spec-template.md`、`.claude/tdd/specs/` を作成
- `test-conventions.md` には検出した `{{SRC_LAYOUT}}` とドメインを反映（一般論で埋めない）。
- `commands.md` は **実在するコマンドだけ**。無いものは「なし」と書く（捏造しない）。**統合（実 DB）・E2E を導入したら、その起動・テスト DB 立ち上げ・シードのコマンドも `commands.md` に必ず載せる**。
- **`test-infra.md`** に、step4 で用意した実行基盤（テスト DB・認証・storageState・シード）の構成と起動手順を書く。`test-strategy.md` は **実際に用意した状態**に合わせて書き（「未実装・必要時に」で逃げない）、各受け入れ条件をどのレベルに割り当てるかの基準を明示する。

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
