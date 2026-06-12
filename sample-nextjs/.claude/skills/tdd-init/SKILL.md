---
name: tdd-init
description: プロジェクトのスタック（言語・テストランナー・既存テスト規約）を自動検出し、そのプロジェクト固有の TDD 開発ファイル一式を .claude/ 配下に生成するブートストラップスキル。新しいプロジェクトで TDD を始めるとき、「TDD をセットアップ」「TDD 環境を作って」「tdd-init」「Red-Green-Refactor の準備」等と言われたら使う。一度実行すれば、以降は生成された /tdd でサイクルを回す。
---

# tdd-init — プロジェクト固有の TDD 環境ブートストラップ

このスキルの役割は **「1 つの汎用指示書から、各プロジェクト固有の TDD 詳細ファイルを生成する」** こと。
実行されたカレントプロジェクトを調べ、そのスタックに合わせた TDD ファイルを **対象プロジェクトの `.claude/` 配下** に書き出す。
書き出したあとの日々の開発は、生成した `/tdd` ドライバスキルが担う（このスキルは「セットアップ専用」）。

## 生成物（すべて対象プロジェクトの `.claude/` 配下）

| パス | 役割 |
|------|------|
| `.claude/tdd/workflow.md` | このプロジェクトでの Red-Green-Refactor の具体手順 |
| `.claude/tdd/conventions.md` | テストの配置・命名・アサーション・モック方針（検出結果で具体化） |
| `.claude/tdd/commands.md` | テスト全実行・単体実行・watch・カバレッジ・lint/型チェックの **実コマンド** |
| `.claude/tdd/progress.md` | TDD サイクルの記録ログ（初期はテンプレ。`/tdd` が追記していく） |
| `.claude/skills/tdd/SKILL.md` | 以降の開発で 1 サイクルを回す `/tdd` ドライバスキル |

> このスキル自身のテンプレートは、この SKILL.md と同じ階層の `templates/` にある。
> 生成時は **テンプレートを読み込み、プレースホルダ（`{{...}}`）を検出結果で置換** して対象プロジェクトに書き出す。

---

## 手順

### 0. 前提確認

- カレントディレクトリが対象プロジェクトのルートか確認する（`git rev-parse --show-toplevel` などで確認。git でないなら `pwd` のディレクトリを対象とする）。
- 以降の生成先は **対象プロジェクトの `.claude/`**。このスキル（tdd-init）自身のディレクトリには **書き込まない**。

### 1. 既存の規約を最優先で読む

これを飛ばすと「プロジェクト固有」にならない。必ず先に読む。

- ルートの `CLAUDE.md` / `AGENT.md` / `AGENTS.md`（あれば全文。参照先が指定されていればそれも）
- `.cursor/rules/**`, `.claude/rules/**`, `docs/**` の alwaysApply 系
- 既存テストが置かれているディレクトリ（テストの「現状の書き方」がプロジェクトの答え）

これらに **テスト規約・命名・実行コマンド** が明文化されていれば、検出より優先してそれを採用する。

### 2. スタックを検出する（推測でなく実物を見る）

プロジェクトに実在する設定ファイル・スクリプトを読んで確定する。代表的な手掛かり:

| エコシステム | 検出の手掛かり | テストランナー候補 |
|------|------|------|
| Node / TS | `package.json` の `scripts` / `devDependencies`、`vitest.config.*`, `jest.config.*` | Vitest / Jest / Mocha / AVA / `node --test` |
| Python | `pyproject.toml`, `setup.cfg`, `tox.ini`, `pytest.ini`, `requirements*.txt` | pytest / unittest |
| Go | `go.mod`, `*_test.go` | `go test` |
| Rust | `Cargo.toml`, `tests/`, `#[test]` | `cargo test` / nextest |
| Ruby | `Gemfile`, `spec/`, `.rspec` | RSpec / Minitest |
| Java / Kotlin | `pom.xml`, `build.gradle(.kts)` | JUnit / Kotest |
| PHP | `composer.json`, `phpunit.xml` | PHPUnit / Pest |
| .NET | `*.csproj`, `*.sln` | `dotnet test` (xUnit/NUnit) |
| Elixir | `mix.exs` | ExUnit (`mix test`) |
| フロント E2E | `playwright.config.*`, `cypress.config.*` | Playwright / Cypress |

確定すべき項目（= テンプレートのプレースホルダ）:

- `{{PROJECT_NAME}}` … ルートディレクトリ名 or package 名
- `{{LANGUAGE}}` … 主要言語（例: TypeScript）
- `{{TEST_FRAMEWORK}}` … テストランナー（例: Vitest）
- `{{TEST_ALL_CMD}}` … 全テスト実行（例: `npm test`）
- `{{TEST_FILE_CMD}}` … ファイル単位実行（例: `npx vitest run path/to/file.test.ts`）
- `{{TEST_SINGLE_CMD}}` … テスト名/パターン単位実行（例: `npx vitest run -t "<name>"`）
- `{{TEST_WATCH_CMD}}` … watch（例: `npx vitest`。無ければ「なし」）
- `{{COVERAGE_CMD}}` … カバレッジ（無ければ「なし」）
- `{{LINT_CMD}}` / `{{TYPECHECK_CMD}}` / `{{BUILD_CMD}}` … あれば。無ければ「なし」
- `{{TEST_FILE_LOCATION}}` … テスト配置（例: ソースと同階層の `*.test.ts` / `tests/` / `__tests__/`）
- `{{TEST_FILE_NAMING}}` … 命名規則（例: `*.test.ts`, `test_*.py`, `*_test.go`）
- `{{ASSERTION_STYLE}}` … アサーションの書き方（例: `expect(x).toBe(y)`）
- `{{MOCK_APPROACH}}` … モック/スタブ手法（例: `vi.mock()` / `unittest.mock` / 手書きフェイク）

**コマンドは推測しない。** `package.json` の `scripts`、`Makefile`、`mix.exs` 等から実在するものを採用する。
存在しない項目は「なし」と明記し、捏造しない（`commit-per-unit` の精神と同じく、無いものを在るように書かない）。

### 3. 検出結果を要約して提示し、必要なら 1 度だけ補正を受ける

検出した内容を箇条書きで提示する（言語 / フレームワーク / 主要コマンド / テスト配置・命名）。
**自明な場合はそのまま進める。** 検出が割れた・複数候補がある・設定ファイルが見つからない場合のみ、ユーザーに 1 度だけ確認する。確認を何度も挟まない。

### 4. テンプレを埋めて生成する

`templates/workflow.md`, `templates/conventions.md`, `templates/commands.md`, `templates/progress.md` を読み、
`{{...}}` を検出結果で置換して、対象プロジェクトの `.claude/tdd/` 配下へ書き出す。

- プロジェクトに既に明文化された規約があれば、テンプレの一般論より **そのプロジェクトの書き方を優先** して本文に反映する。
- `.claude/tdd/` が既に存在する場合は **上書き前に差分を提示**。`progress.md` は既存の記録を残す（テンプレで潰さない）。

### 5. `/tdd` ドライバスキルを生成する

`templates/driver-skill.md` を読み、同様にプレースホルダを埋めて
対象プロジェクトの `.claude/skills/tdd/SKILL.md` へ書き出す。これにより以降 `/tdd` が使えるようになる。

### 6. プロジェクトの CLAUDE.md にポインタを追記する

対象プロジェクトのルート `CLAUDE.md` に、次の短いセクションを追記する（無ければ最小の CLAUDE.md を新規作成）。
既に同等の記述があれば追記しない。

```markdown
## TDD

このプロジェクトは TDD で開発する。手順・規約・コマンドは `.claude/tdd/` を参照。
新しい振る舞いの実装は `/tdd <作りたい振る舞い>` で Red→Green→Refactor を 1 サイクル回す。
```

### 7. 報告する

生成した（または更新した）ファイル一覧と、次の一歩を簡潔に伝える:

> セットアップ完了。`/tdd <作りたい振る舞い>` で最初のサイクルを始められます。

---

## 設計上の約束

- **検出 > テンプレの一般論**。プロジェクトの実物（既存テスト・設定・既存規約）が常に優先。
- **コマンドは実在するものだけ**。無い項目は「なし」と書く。
- **このスキルはセットアップ専用**。日々の TDD は生成した `/tdd` が回す。再セットアップしたいときだけ `tdd-init` を再実行する。
- **生成先は対象プロジェクトの `.claude/` 配下のみ**。このスキルのディレクトリは読み取り専用として扱う。
