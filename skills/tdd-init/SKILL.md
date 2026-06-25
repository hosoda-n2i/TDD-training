---
name: tdd-init
description: TypeScript / Node.js（主に Next.js）プロジェクトを **dual-loop TDD**（外側 E2E ／ 内側 unit-integration）で開発できる状態にするブートストラップスキル。プロジェクトのドメインを読み取り、そのプロジェクト固有の slash commands（`/e2e` `/tdd` `/test` `/fix` `/review` `/db` `/impact`、加えて任意の `/spec`＝EARS 仕様・`/harden`＝VDD・`/adversary`＝独立レビュー）と subagents（`tdd-guide` `e2e-guide` `verifier` `adversary` `spec-check` `impact-analyzer`）、auto-apply rules、テスト実行基盤（Vitest / Playwright / fast-check / Stryker / テスト DB / storageState）まで揃えた上で、CLAUDE.md をドメイン情報入りで書き起こす。テストをまだ書いていないプロジェクトにも適用できる。「TDD をセットアップ」「tdd-init」「dual-loop TDD の準備」等と言われたら使う。一度実行すれば以降は `/e2e` → `/tdd` で開発する。
---

# tdd-init — dual-loop TDD 環境のブートストラップ（ジェネレータ）

このスキルは **ジェネレータ**。実行されたプロジェクトの **ドメイン** を読み取り、そのプロジェクト固有の
**commands・agents・rules** を生成する。スキル自身は汎用のまま、出力物がドメイン特化になる。

## 設計の核

- **acceptance criteria は実行可能なテスト**（仕様書ではなく E2E / integration test）。仕様書 → テストへの翻訳ステップを取り除き、Claude が「仕様の言葉を取りこぼす」失敗を構造的に防ぐ。
- **Dual-loop**: 外側（E2E）を先に書いて RED にし、内側（unit / integration）を 1 受け入れ条件 = 1 サイクルで緑にする。最後に外側の E2E が緑になる = 機能完成。
- **専任 subagent**: `tdd-guide`（内側）と `e2e-guide`（外側）が役割ごとに別プロセスで動き、メインコンテキストを汚さない。
- **SCAFFOLD ステップを必須化**: 型 / interface 定義 + スタブ（`throw new Error('Not implemented')`）を**テストより先に**書き、シグネチャを物理的に確定させる。
- **規約に実コード例を埋め込む**: `rules/testing.md` に検出したスタック（{{DB}}・{{AUTH}}）の実コードを書き込む。Claude が真似るだけで規約を踏める。
- **CLAUDE.md をドメインリファレンス化**: 用語表・実装済み機能・DB スキーマ・配置規則まで載せ、Claude が仕様の言葉とコードを直結できるようにする。

## 前提（技術スタックは固定。汎用化しない）

- **TypeScript + Node.js**、主に **Next.js**。マルチ言語検出はしない。
- **Unit / Integration = Vitest（+ React Testing Library）**、**E2E = Playwright**。無ければ導入する。
- **最重要: 統合(integration)・E2E を“実際に走らせる”実行基盤（テスト用 DB・認証のテスト経路・シード・ログイン済み状態）まで用意する。** ここを後回しにすると、Claude は統合 / E2E を諦めて unit にしか倒れなくなる。基盤が無いことが「unit しか書かない」の根本原因なので、セットアップで**疎通確認まで**やり切る。

## 生成物

### `.claude/commands/`（slash commands — dual-loop の入口）
| パス | 役割 |
|------|------|
| `.claude/commands/spec.md` | `/spec` … EARS 形式の構造化仕様を起こす（**任意入力。ゲートではない**）。`--delta` で追加仕様の変更セット（追加/変更/削除 REQ-ID）も記録 |
| `.claude/commands/e2e.md` | `/e2e` … 外側ループ。E2E spec を先に書く（RED）→ 必要な実装を列挙して inner loop の work item にする |
| `.claude/commands/tdd.md` | `/tdd` … 内側ループ。SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR を `tdd-guide` agent に駆動させる |
| `.claude/commands/impact.md` | `/impact` … 仕様変更の影響範囲を `impact-analyzer` で出す（追加/変更/削除すべきテスト・影響コード・回帰セット） |
| `.claude/commands/test.md` | `/test` … unit / integration テスト実行＋解析 |
| `.claude/commands/fix.md` | `/fix` … lint / format / typecheck の自動修正チェーン |
| `.claude/commands/harden.md` | `/harden` … VDD ハードニング。緑の後に property-based（fast-check）+ mutation（Stryker）を `verifier` agent に駆動させる |
| `.claude/commands/review.md` | `/review` … 10 観点（仕様充足 / 可読性 / ロジック / セキュリティ / パフォーマンス / エラー / テスト / API / DB / FE）の**同一コンテキスト**セルフレビュー |
| `.claude/commands/adversary.md` | `/adversary` … **独立コンテキスト**の `adversary` agent に差分を審査させ、5 次元バイナリ判定（PASS/FAIL）と routeToPhase を返す（ゲートではない） |
| `.claude/commands/db.md` | `/db` … DB 操作（{{DB}} がある場合のみ生成） |

### `.claude/agents/`（subagents）
| パス | 役割 |
|------|------|
| `.claude/agents/tdd-guide.md` | 内側ループ専任（model: sonnet）。`/tdd` から呼ばれて SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR を厳格に回す。SPEC-CHECK では `spec-check` を入れ子呼びする |
| `.claude/agents/e2e-guide.md` | 外側ループ専任（model: sonnet）。`/e2e` から呼ばれて E2E spec を RED で書き、必要な実装を列挙する（E2E 対象プロジェクトのみ） |
| `.claude/agents/verifier.md` | VDD ハードニング専任（model: sonnet）。`/harden` から呼ばれて property-based + mutation でテストの広さ・深さを強化する |
| `.claude/agents/adversary.md` | 独立レビュー専任（model: opus、Edit/Write なし＝判定のみ）。`/adversary` から呼ばれて 5 次元バイナリ判定で PASS/FAIL を出す |
| `.claude/agents/spec-check.md` | 仕様↔テスト整合判定専任（model: sonnet、Edit/Write なし）。`/tdd` の SPEC-CHECK ステップで tdd-guide から呼ばれる |
| `.claude/agents/impact-analyzer.md` | 影響範囲解析専任（model: sonnet、Edit/Write なし）。`/impact` から呼ばれて変更セットの影響レポートを返す |

### `.claude/rules/tdd/`（auto-apply rules）
| パス | 役割 |
|------|------|
| `.claude/rules/tdd/tdd-flow.md` | dual-loop TDD の規律。常時適用（CLAUDE.md から `@import`）。追加仕様時のインライン manifest 契約（変更セット・DIFF-CHECK・回帰ゲート）を含む |
| `.claude/rules/tdd/testing.md` | テストの書き方・実コード例（unit / integration / E2E）。`*.test.ts(x)` / `*.spec.ts(x)` / `e2e/**` / `vitest.config.*` / `playwright.config.*` を編集中なら**自動添付** |
| `.claude/rules/tdd/typescript.md` | TypeScript 規約。`*.ts` / `*.tsx` を編集中なら自動添付 |
| `.claude/rules/tdd/spec-conventions.md` | EARS 仕様の規約（パターン早見・REQ-ID・異常系必須・スコープ外明記）。`.claude/tdd/specs/**` を編集中なら**自動添付** |

### `.claude/tdd/`（参照ドキュメント）
| パス | 役割 |
|------|------|
| `.claude/tdd/test-strategy.md` | 受け入れ条件のレベル割当（unit / integration / E2E）＋ property / mutation の適用判断 |
| `.claude/tdd/test-infra.md` | 統合 / E2E の実行基盤（テスト DB・認証・storageState・seed）の構成と起動手順 |
| `.claude/tdd/commands.md` | 実コマンド（Vitest / Playwright / mutation / lint / typecheck / DB） |
| `.claude/tdd/spec-template.md` | `/spec` が参照する EARS 仕様の雛形（任意入力） |
| `.claude/tdd/specs/` | `/spec` が書き出す EARS 仕様の出力先（`<slug>.md`。再生成で上書きしない） |
| `.claude/tdd/progress.md` | 機能ごとの進捗ログ（`/tdd` 完了時に追記） |

### 実行基盤（プロジェクトルート。DB / 認証を検出したら用意）
| パス | 役割 |
|------|------|
| `vitest.config.mts` / `vitest.setup.ts` | Vitest 設定（jsdom / `@/` エイリアス / setup） |
| `playwright.config.ts` | Playwright 設定（storageState / webServer / テスト DB を読む `.env.test`） |
| `docker-compose.test.yml` | ブランチ別のテスト用 DB（実 DB 統合・E2E 用） |
| `.env.test`（example） | テスト DB 接続・認証バイパス等のテスト環境変数 |
| 統合 globalSetup（Vitest） | テスト DB のマイグレーション適用 + データクリーン |
| `e2e/global-setup.ts`（Playwright） | テストユーザーでログイン → `storageState` 保存 |
| 認証テストヘルパー | `requireAuth` / `requireRole` 等のモック（unit / integration）・テストユーザーのシード |

> テンプレートはこの SKILL.md と同階層の `templates/` にある（`commands/`・`agents/`・`rules/`・`docs/`・`infra/`）。
> 生成時は **テンプレを読み、`{{...}}` を検出・ドメイン情報で置換** して書き出す。**実行基盤テンプレは検出した DB / 認証に合わせて適応**させる（Prisma / Drizzle / Postgres・Firebase / NextAuth 等）。

---

## 手順

### 0. 前提確認
- 対象プロジェクトのルートを確認（`git rev-parse --show-toplevel`、無ければ `pwd`）
- 生成先は **対象プロジェクトの `.claude/`** および ルート。このスキル自身のディレクトリには書き込まない。

### 1. 既存の規約を最優先で読む
- ルートの `CLAUDE.md` / `AGENTS.md` / `AGENT.md`（あれば全文。参照先も）、`.cursor/rules/**`、`.claude/rules/**`、`docs/**`
- 既存テストがあればそのディレクトリ（現状の書き方が答え）
- **明文化された規約は一般論より優先**

### 2. ドメインを把握する（テンプレ変数の核）

このプロジェクトが**何をするアプリか**を読み取る。生成物にこのプロジェクト固有の語彙・配置を反映するため。

- README / AGENTS / `package.json` の説明
- 主要ディレクトリ構成（`src/` 配下の `app` / `components` / `lib` / `services` 等の置き場）
- ドメイン語彙（エンティティ名 / 主要なユースケース / UI 言語）
- 確定する値:
  - `{{PROJECT_NAME}}` … プロジェクト名
  - `{{DOMAIN_SUMMARY}}` … このアプリの責務（1〜2 行）
  - `{{SRC_LAYOUT}}` … 実装 / コンポーネント / サービスの配置（例: `src/app`, `src/components`, `src/lib`）
  - `{{NEXT_ROUTER}}` … App Router / Pages Router / （Next.js でなければ「Node ライブラリ」）
  - `{{UI_LANGUAGE}}` … UI テキストの言語（日本語 / 英語 等）
  - `{{LOG_LANGUAGE}}` … ログメッセージの言語
  - `{{COMMIT_LANGUAGE}}` … コミットメッセージの言語
  - 主要エンティティ・主要画面の一覧（CLAUDE.md の用語表 / 機能マトリクスに使う）

### 3. スタック内の構成を検出する（TS / Node / Next.js 前提）

- `{{PKG_MANAGER}}` … `npm` / `pnpm` / `yarn` / `bun`（lockfile で判定）
- 既存の **Vitest** 設定（`vitest.config.*` / devDeps）、**Playwright** 設定（`playwright.config.*`）の有無
- `{{LINT_CMD}}` / `{{LINT_FIX_CMD}}` / `{{FORMAT_CMD}}` / `{{TYPECHECK_CMD}}` / `{{BUILD_CMD}}` / `{{DEV_CMD}}` … `package.json` の scripts から実在分（無いものは「なし」と書く）
- `{{TEST_UNIT_FILE_CMD}}` / `{{TEST_UNIT_ALL_CMD}}` / `{{TEST_UNIT_GREP_CMD}}` / `{{TEST_UNIT_WATCH_CMD}}` / `{{COVERAGE_CMD}}` / `{{TEST_INTEGRATION_CMD}}` … test 系 script（無いものは「なし」と書く）
- **データ層**（統合 / E2E の基盤判断に必須）:
  - `{{DB}}` … Prisma（`prisma/schema.prisma`）/ Drizzle / その他 / 無し。DB 種別（Postgres など）、マイグレーションコマンド、接続 env 名（`DATABASE_URL` 等）
  - `{{DB_GENERATE_CMD}}` / `{{DB_MIGRATE_CMD}}` / `{{DB_PUSH_CMD}}` / `{{DB_STUDIO_CMD}}` / `{{SEED_CMD}}` … 実在分
  - `{{DB_IMAGE}}` / `{{DB_MIGRATE_ARGV}}` … テスト DB の docker イメージ・マイグレーション引数（`docker-compose.test.yml` と `integration-setup.ts` に使う）
  - `{{REPO_PATTERN}}` … データアクセスの形（repository 層をモックする規約か、実 DB か）。既存 rules / 既存テストから読む。
  - `{{DB_TEST_UTILS_SNIPPET}}` … testing.md に埋め込む実コード例（DB / ORM に応じて Drizzle / Prisma のテスト接続スニペットを差し込む）
- **認証**（E2E のログイン基盤に必須）:
  - `{{AUTH}}` … Firebase Auth / NextAuth / Clerk / 独自 / 無し。サーバ側のガード関数（`requireAuth` / `requireRole` 等）とセッションの持ち方
  - `{{AUTH_MOCK_HELPER}}` / `{{AUTH_MOCK_SNIPPET}}` … testing.md に埋め込む実コード例
  - `{{E2E_AUTH_FIXTURE}}` / `{{E2E_AUTH_FIXTURE_SNIPPET}}` … e2e/fixtures/auth.ts の実コード例
- **Playwright**:
  - `{{TEST_E2E_ALL_CMD}}` / `{{TEST_E2E_FILE_CMD}}` / `{{TEST_E2E_GREP_CMD}}` / `{{TEST_E2E_UI_CMD}}`
  - `{{PLAYWRIGHT_CONFIG_SNIPPET}}` … testing.md に埋め込む config 例
  - `{{E2E_FEATURE_DIR}}` … e2e/ 配下の機能ディレクトリの命名（既存に準拠）

上記が「無し」なら該当基盤はスキップしてよい（純ロジックの lib 等）。**あるのに飛ばすのは禁止**。

### 4. テスト基盤と「実行基盤」を用意する（無ければ導入し、疎通確認まで）

`templates/infra/*` を、検出した DB / 認証に合わせて適応させて書き出す。重い手順（Docker・ブラウザ DL・依存追加）に入る前に**まとめて 1 回だけ導入可否を確認**する。

#### (a) ユニット（Vitest）— 常に整える
- 既存があれば再利用、無ければ導入。devDeps: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @vitest/coverage-v8`
- `vitest.config.mts`（jsdom 環境・`@/` エイリアス・setup ファイル）、`vitest.setup.ts`、`package.json` に `test` / `test:watch` / `test:coverage` / `typecheck` を追加。

#### (a-vdd) VDD ツール（property-based + mutation）— `/harden` 用に整える

緑の後の検証強化（`/harden`・`verifier` agent）で使う 2 ツールを導入する。Vitest の上に乗るので (a) の後に入れる。

- devDeps を追加: `fast-check`（property-based）, `@stryker-mutator/core` + `@stryker-mutator/vitest-runner`（mutation。runner が Vitest を testRunner にする。`@stryker-mutator/vitest-runner` の peer に `vitest >=2.0.0` が要る）。
  - **パッケージ名は実在を確認してから書く**（`{{PKG_MANAGER}}` の `view`/`info` 等）。捏造しない。
- **Stryker 設定ファイルを生成**: プロジェクトルートに `stryker.config.json`（無ければ）。`testRunner` を `vitest` にし、`mutate` の対象を**純ロジック中心**に絞る（コンポーネント全体に広げない）。例:
  ```json
  {
    "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
    "testRunner": "vitest",
    "reporters": ["html", "clear-text", "progress"],
    "mutate": ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.spec.ts"],
    "coverageAnalysis": "perTest",
    "thresholds": { "high": 80, "low": 60, "break": null }
  }
  ```
  - `mutate` のパスは検出した `{{SRC_LAYOUT}}` に合わせる。`thresholds.break` は導入初期は `null`（落とさない）にしておき、ゲート化しない。
- `package.json` に `mutation` script（例: `"mutation": "stryker run"`）を追加し、`{{MUTATION_CMD}}` をそれにする（script が無ければ `npx stryker run`）。

#### (b) 統合(integration) の実行基盤
- **境界モック**: 追加基盤は不要。`rules/testing.md` のモック方針（repository / 認証 / 外部 API を差し替え）で書ける状態にする。
- **実 DB を使う統合**（`{{DB}}` がある場合）: `templates/infra/docker-compose.test.yml` を生成し、Vitest の**統合用 globalSetup**（マイグレーション適用＋`beforeEach` クリーン）を用意。**ポート・DB 名は env 変数（`$TEST_DB_PORT` / `$TEST_DB_NAME`）で実行時に解決**するテンプレを使う。「未実装・必要時に」で**終わらせない**。`{{TEST_DB_UP_CMD}}` / `{{TEST_DB_DOWN_CMD}}`（`docker compose -f docker-compose.test.yml up/down` 由来）を `commands.md` に載せる。

#### (c) E2E（Playwright）— Web アプリで、`{{DB}}` / `{{AUTH}}` も込みで“走る”状態にする
- Playwright 未導入なら導入（`e2e/` 構成）。`.gitignore` に生成物を追加: `/test-results/`, `/playwright-report/`, `/blob-report/`, `/playwright/.cache/`, `e2e/.auth/`
- **認証**（`{{AUTH}}` がある場合）: `templates/infra/playwright.global-setup.ts` を適応させ、**テストユーザーでログイン → `storageState` 保存**。`playwright.config` で `storageState` と `webServer`（`process.env.TEST_DATABASE_URL` を `DATABASE_URL` として渡して dev / build 起動）を設定。
- **DB**（`{{DB}}` がある場合）: `webServer` と globalSetup をテスト DB に向け、シードを投入。
- 認証ガードの**モックヘルパー**（`requireAuth` / `requireRole` 等）を共有フィクスチャとして用意（unit / integration で使う）。

#### (d-env) 環境変数の契約と direnv 運用

テスト DB / E2E は以下の env 変数で動く前提でテンプレを生成する。**`/tdd-init` はこれらを env で受けるテンプレを書き出すだけで、値そのものを生成物に焼かない**（ハードコードしない）:

| 変数 | 役割 |
|------|------|
| `TEST_DB_PORT` | テスト DB のホスト側ポート（worktree 並列起動で衝突回避） |
| `TEST_DB_NAME` | テスト DB 名（worktree ごとに別名。例: `testdb_${PWD##*/}`） |
| `TEST_DATABASE_URL` | テスト DB 接続 URL の一次ソース |
| `DATABASE_URL` | アプリが見る URL。E2E 中は `=$TEST_DATABASE_URL` で上書き運用 |
| `E2E_BASE_URL` | E2E が叩く URL |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | E2E のログインユーザー |

**direnv 親子継承運用が検出できる場合**（プロジェクトの親ディレクトリに `.envrc` がある、または既存 `.envrc` で `source_env ..` を使っている等）:

- 既定値の置き場は**親 `.envrc`**。`/tdd-init` は**親 .envrc を書き換えない**（環境はユーザー所有）。
- worktree 直下の `.envrc` も `/tdd-init` は**生成しない**（direnv が CWD から最も近い `.envrc` を読むため、親に 1 つあれば自動継承される。並列 worktree のポート衝突時のみユーザーが手動で作る）。
- 代わりに `.env.test.example` を**プロジェクト直下に生成**し、必要な env 変数の一覧とサンプル値を載せる（ユーザーが親 .envrc に転記して使う）。
- `test-infra.md` の「環境変数の契約」セクションで親 / 子 .envrc の例と注意点を明示する。

**direnv 親子継承運用ではない場合**: `.env.test` を生成して dotenv 経由で読ませる。env 変数の契約自体は同じ。

#### (d) 疎通確認（最重要・ここを省かない）

セットアップの締めに、**各レベルが実際に緑になることを確認**する。確認用のスモークは確認後に削除:
- **unit**: 簡単な 1 テスト（例: `expect(1 + 1).toBe(2)`）
- **integration（実 DB を使う場合）**: テスト DB に接続して 1 件 CRUD する最小テスト
- **E2E**: ログイン状態でトップ等を開く最小シナリオ 1 本（`storageState` が効くか）
- **VDD（任意の追加スモーク）**: `fast-check` を import した property test 1 本が緑になる／`{{MUTATION_CMD}}`（`stryker run`）が起動して結果を出す、を**軽く**確認する。重いので必須化しない（導入可否は (a-vdd) を含めて step 4 冒頭のまとめ確認に含める）。

ここで通らなければ、`test-strategy.md` に「対象外」と書いて逃げず、**通るところまで直す**（または本当に対象外なら理由を明記）。

> 導入はローカル操作。**push やリモート接続・本番 / 共有 DB への接続は伴わない**（テスト DB は Docker のローカル専用）。Docker・ブラウザ DL は重いので (a)〜(c) の導入可否は冒頭で 1 回確認する。

### 5. commands / agents を生成する

- `templates/commands/*` → `.claude/commands/*`（`spec` / `e2e` / `tdd` / `test` / `fix` / `harden` / `review` / `adversary` / `db` / `impact`）
- `templates/agents/*` → `.claude/agents/*`（`tdd-guide`・`e2e-guide`・`verifier`・`spec-check`・`impact-analyzer`＝model: sonnet／`adversary`＝model: opus。frontmatter の `model` はテンプレのまま維持する。`tdd-guide` は SPEC-CHECK ステップで `spec-check` を入れ子呼びする）
- `{{...}}` を 2〜4 の結果で置換（新規変数 `{{MUTATION_CMD}}` を忘れない）
- 「対象外」のものはスキップ:
  - E2E 対象でない（純ライブラリ等）→ `e2e.md` / `e2e-guide.md` をスキップ
  - DB が無い → `db.md` をスキップ
  - VDD ツール（step 4 (a-vdd)）を導入しなかった → `harden.md` / `verifier.md` をスキップ（`{{MUTATION_CMD}}` が無いため）
- `spec.md`（`/spec`）と `adversary.md`（`/adversary`）は**任意機能だが常に生成**する（spec はゲートではない／adversary は判定専任で副作用が無い）。

### 6. rules と docs を生成する

- `templates/rules/*` → `.claude/rules/tdd/*`（`.claude/rules/` は再帰探索されるのでサブフォルダでも `paths:` auto-apply が効く。汎用名の衝突回避のため `tdd/` に分離）
- `templates/docs/*` → `.claude/tdd/*`（`spec-template.md` を含む。`/spec` の出力先 `.claude/tdd/specs/` も用意する＝空ディレクトリ or `.gitkeep`）
- `testing.md` は `*.test.ts(x)` / `*.spec.ts(x)` / `e2e/**` 編集中に自動添付、`spec-conventions.md` は `.claude/tdd/specs/**` 編集中に自動添付（`paths:` ベースの auto-apply）。
- **`rules/testing.md` は実コードスニペットを埋め込む**: 検出した DB / 認証に応じて `{{DB_TEST_UTILS_SNIPPET}}` / `{{AUTH_MOCK_SNIPPET}}` / `{{E2E_AUTH_FIXTURE_SNIPPET}}` / `{{PLAYWRIGHT_CONFIG_SNIPPET}}` をテンプレ実コードに展開する。Claude が真似るだけで規約を踏める形にする。property-based / mutation の節は汎用の実コード例（`fast-check`）が既に入っているのでそのまま使う。
- `commands.md` は **実在するコマンドだけ**。無いものは「なし」と書く（捏造しない）。**統合（実 DB）・E2E を導入したら、その起動・テスト DB 立ち上げ・シードのコマンドも必ず載せる**。VDD を導入したら `{{MUTATION_CMD}}` を載せ、未導入なら mutation 行は「なし」にする。
- **`test-infra.md`** に、step 4 で用意した実行基盤（テスト DB・認証・storageState・seed）の構成と起動手順を書く。`test-strategy.md` は **実際に用意した状態**に合わせて書く（「未実装・必要時に」で逃げない）。
- `{{UNIT_TEST_LOCATION}}` / `{{E2E_TEST_LOCATION}}` / `{{*_POLICY}}` / `{{INTEGRATION_TARGETS}}` / `{{INTEGRATION_BOUNDARIES}}` / `{{E2E_FEATURE_DIR_EXAMPLE}}` / `{{機能名の例}}` 等は検出値ではなく**文脈で埋める placeholder** — step 2〜4 で把握した情報から補う。

### 7. CLAUDE.md をドメインリファレンス化する

対象プロジェクトのルート `CLAUDE.md`（無ければ最小作成）を**ドメイン情報入りで書き起こす**。**`@import` 行を足すだけで終えない**。

CLAUDE.md に含めるセクション（既存にあれば尊重し、無ければ追記）:

```markdown
# {{PROJECT_NAME}}

{{DOMAIN_SUMMARY}}

## Terminology

| コード内 | UI 表示 | 説明 |
|---------|--------|------|
| <entity> | <表示名> | <役割> |
...

## Tech Stack

- Runtime / フレームワーク / DB / Auth / Test ...

## Implemented Features

| 機能 | 状態 | 概要 |
|------|------|------|
...

## DB Schema Overview

<ER 図 or キーテーブル一覧>

## Commands

(./.claude/tdd/commands.md と同期させた最小サマリ)

## Project Structure

{{SRC_LAYOUT}} の配置規則 / colocation 規約

## Development Workflow

dual-loop TDD（外側 E2E / 内側 unit-integration）で開発する:
0. （任意）`/spec <ラフな要望>` で EARS 形式の仕様を起こす。**ゲートではなく任意入力**で、acceptance の実体はテスト。
1. `/e2e <機能名 or spec パス>` で外側ループの E2E spec を書く（RED）
2. `/tdd <e2e spec パス or spec パス>` で内側ループを回す（SCAFFOLD → RED → SPEC-CHECK → GREEN → REFACTOR）
3. 全受け入れ条件が緑 → 外側 E2E が緑 → 機能完成
4. （推奨・完了前）`/harden` で VDD（property-based + mutation）、`/adversary` で独立バイナリ判定を通す。**必須ゲートではない**（フックで強制しない）。FAIL なら指されたフェーズに戻る。

詳細な規律・規約は以下を参照（常時適用）:

@.claude/rules/tdd/tdd-flow.md
```

- **VDD ツール（step 4 (a-vdd)）を導入しなかった場合は、上記 step 4 から `/harden` を除く**（`harden.md` を生成していないため）。`/adversary` は常に生成するので残してよい。
- 用語表・実装済み機能マトリクス・DB スキーマ概要は、ドメイン把握（step 2）で得た情報を**省略せず**書き出す。Claude が仕様の言葉とコードを直結できるかはここに掛かっている。
- `testing.md` / `typescript.md` は `paths:` ベースで auto-apply されるので CLAUDE.md からの `@import` は不要。`tdd-flow.md` のみ常時 `@import`。

### 8. 報告する

生成 / 更新したファイルと、導入したテスト基盤、次の一歩を簡潔に伝える:

> セットアップ完了。`/e2e <作りたい機能のラフな説明>` で外側ループの E2E spec を書くところから始められます。UI を伴わない機能なら `/tdd <機能説明>` で直接 inner loop に入れます。必要なら先に `/spec <ラフな要望>`（任意の EARS 仕様）で受け入れ条件を整理できます。完了前には `/harden`（VDD）と `/adversary`（独立判定）を通すと安心です。

---

## 設計上の約束

- **スタックは TS / Node / Next.js 固定**。ドメイン（プロジェクト個別性）だけを汎用パラメータとして扱う。
- **検出 > 一般論**。既存テスト・既存規約・実コマンドが常に優先。
- **コマンドは実在分だけ**。無いものは「なし」。捏造しない。
- **このスキルはセットアップ専用**。日々の開発は `/e2e` と `/tdd` が回す。再セットアップ時だけ `tdd-init` を再実行。
- **生成先は対象プロジェクトの `.claude/` と ルート**。このスキルのディレクトリは読み取り専用。
- **インフラ・配布の仕組み（install.sh / グローバル登録 / CI 設定）を勝手に作らない**。スキルはセットアップだけに留める。

### 取り込まない物（dual-loop の軽さを壊さない / 再実行で full VSDD に流れない）

このジェネレータは dual-loop TDD を土台に、Adversary レビュー・VDD（property + mutation）・EARS 仕様を**選択的に・加算的に**取り込んだもの。次の重量級機構は **作らない**（将来の再実行でも持ち込まない）:

- **フェーズ強制フック**（PreToolUse 等で「テスト前にソースを書けない」と機械的にブロックする仕組み）。`/harden`・`/adversary` は**推奨であってゲートではない**。フックで強制しない。
- **`.vsdd/` のような状態機械・`state.json`・`history.jsonl` 監査ログ**。フェーズ遷移を状態として永続化しない。
- **Beads 等のトレーサビリティ ID 連鎖**（REQ→PROP→TEST→IMPL→FIND→PROOF）。spec の REQ-ID は人間の参照用で、ツールで連鎖を強制しない。
- **install.sh / グローバル登録 / CI 設定**などの配布・インフラ（上記の最後の項目と同旨）。

迷ったら「dual-loop の軽量さ・スキルベース構成を壊さない範囲で加算する」を基準に判断する。
