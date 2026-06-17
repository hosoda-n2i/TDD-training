# TDD-training

**1 つの汎用ジェネレータ（`tdd-init`）から、各プロジェクトのドメインに合わせた「仕様駆動 TDD」環境を生成する**ための仕組み。

対象プロジェクトで `/tdd-init` を実行すると、Claude がそのプロジェクトのドメインを読み取り、固有の **rules（常時効く規律）** と **skills（`/spec`・`/tdd`）** を `.claude/` 配下に生成し、テスト基盤（Vitest / Playwright）が無ければ導入する。以降は **`/spec`（仕様を起こし精査）→ `/tdd`（仕様駆動で実装）** の2コマンドで開発する。テストをまだ書いていないプロジェクトにも適用できる。

```
┌──────────────────────┐  /tdd-init   ┌─────────────────────────────────────┐
│ 汎用ジェネレータ      │ ───────────> │ プロジェクト固有の rules / skills      │
│ tdd-init (1 つ)       │  ドメインに   │ <project>/.claude/ 配下               │
│ ※TS/Node/Next.js 前提 │  合わせ生成   │  skills: /spec, /tdd                  │
└──────────────────────┘              │  rules : tdd-flow / test/spec 規約     │
                                       └─────────────────────────────────────┘
        /spec <ラフな要望>                          /tdd <仕様書パス>
        └→ 仕様書を起こす＋精査                      └→ 仕様駆動 TDD（下記8ステップ）
```

## 思想

- **技術スタックは固定**（TypeScript / Node.js、主に Next.js。unit=Vitest、E2E=Playwright）。ここは汎用化しない。
- **ドメイン（プロジェクト個別性）だけを汎用化**。`tdd-init` はジェネレータのまま、出力物がドメイン特化になる。
- **仕様駆動**: あなたは振る舞いやテストを考えない。**仕様を渡せば、テストを抽出して先に書き、それに準じて実装し、検証まで**回す。
- **統合/E2E を後回しにしない**: `tdd-init` がテスト DB・認証・storageState・シードまで**実行基盤を立てて疎通確認**する。基盤が無いと unit に倒れるため、ここをセットアップでやり切る。
- **レベルを強制**: 受け入れ条件ごとに unit/integration/E2E を必須付与。UI を伴うのに E2E 無し／層またぎなのに integration 無しは「未完了」。

## `/tdd` の8ステップ（仕様駆動フロー）

精査済み仕様書を入口に、次を駆動する:

1. 仕様からテスト洗い出し（E2E シナリオを最初に地図化）
2. 実装計画立案（テストケース ↔ 実装箇所）
3. テスト先行 → **テスト自体をレビュー**
4. 仕様内容の実装（最小実装 → リファクタ）
5. 既存テストの回帰確認
6. E2E / 各種テストの通過確認
7. 一通りの動作確認
8. 実行時不具合のレビュー → 修正 → 再実行

## このリポジトリの構成

```
TDD-training/
├── README.md
└── skills/
    └── tdd-init/
        ├── SKILL.md                  # 汎用ジェネレータ本体（/tdd-init）
        └── templates/                # 生成元（{{...}} を検出・ドメイン情報で置換）
            ├── skills/
            │   ├── spec.md           # → .claude/skills/spec/SKILL.md（/spec）
            │   └── tdd.md            # → .claude/skills/tdd/SKILL.md（/tdd）
            ├── rules/
            │   ├── tdd-flow.md       # → .claude/tdd/rules/tdd-flow.md
            │   ├── test-conventions.md
            │   └── spec-conventions.md
            ├── docs/
            │   ├── commands.md       # → .claude/tdd/commands.md
            │   ├── test-strategy.md  # → .claude/tdd/test-strategy.md
            │   ├── test-infra.md     # → .claude/tdd/test-infra.md（統合/E2E 実行基盤）
            │   └── progress.md       # → .claude/tdd/progress.md
            ├── infra/                # 統合/E2E の実行基盤（検出した DB/認証に適応）
            │   ├── docker-compose.test.yml   # ブランチ別テスト DB
            │   ├── integration-setup.ts      # 実 DB 統合の globalSetup（migrate/clean）
            │   ├── playwright.global-setup.ts # ログイン→storageState 保存
            │   └── auth-test-helpers.ts       # requireAuth/requireRole モック
            └── spec-template.md      # → .claude/tdd/spec-template.md
```

## 使い方

スキルはグローバル（`~/.claude`）には登録しない。**使いたいプロジェクトにだけ手でコピーする。**

1. **対象プロジェクトにスキルをコピーする。**

   ```sh
   cp -R /path/to/TDD-training/skills/tdd-init <project>/.claude/skills/tdd-init
   ```

2. **対象プロジェクトのルートで `/tdd-init` を実行する。**
   - ドメイン・スタック（pkg manager / Next.js router / 既存 Vitest・Playwright / **DB・認証**）を検出。
   - テスト基盤が無ければ導入（unit=Vitest は自動、E2E=Playwright・テスト DB は確認の上）。
   - **統合/E2E の実行基盤**（テスト DB の docker-compose・マイグレーション・認証ログイン→storageState・シード）を用意し、**各レベルが緑になる疎通確認**まで行う。
   - `.claude/skills/{spec,tdd}/` と `.claude/tdd/{rules,docs,…}` を生成、`CLAUDE.md` に rules の `@import` を配線。

3. **`/spec <作りたい機能のラフな説明>`** で仕様を起こし精査する → `.claude/tdd/specs/<slug>.md`。

4. **`/tdd .claude/tdd/specs/<slug>.md`** で仕様駆動 TDD（上記8ステップ）を回す。

5. ドメインやスタックが大きく変わったら、対象プロジェクトで `/tdd-init` を再実行して更新する（`progress.md`・`specs/` は保持）。

## 設計方針

- **検出 > 一般論**: 既存テスト・既存規約・実コマンドを常に優先。
- **実在するコマンドだけ**: `package.json` の scripts 等から採用し、無いものは「なし」と書く（捏造しない）。
- **責務分離**: `tdd-init`=セットアップ、`/spec`=仕様、`/tdd`=実装。
- **生成先は `.claude/` 配下**: Claude の指示書なのでまとめて置く。
