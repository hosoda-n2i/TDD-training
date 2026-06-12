# TDD-training

**1 つの汎用 Claude 指示書（スキル）から、各プロジェクト固有の TDD 開発ファイルを生成する** ための仕組み。

新しいプロジェクトで `/tdd-init` を実行すると、Claude がそのプロジェクトのスタック（言語・テストランナー・既存テスト規約）を自動検出し、プロジェクト固有の TDD ファイル一式を `.claude/` 配下に生成する。以降の開発は、生成された `/tdd` で Red→Green→Refactor を回す。

```
┌─────────────────────┐   /tdd-init    ┌──────────────────────────────┐
│ 汎用スキル(この repo) │ ─────────────> │ プロジェクト固有の TDD ファイル群 │
│ tdd-init (1 つ)      │  検出して生成   │ <project>/.claude/ 配下         │
└─────────────────────┘                └──────────────────────────────┘
                                                      │ /tdd <振る舞い>
                                                      ▼
                                          Red → Green → Refactor を 1 サイクル
```

## このリポジトリの構成

```
TDD-training/
├── README.md
└── skills/
    └── tdd-init/
        ├── SKILL.md                # 汎用ブートストラップスキル本体
        └── templates/              # 生成元テンプレート（{{...}} を検出結果で置換）
            ├── workflow.md         # → 対象の .claude/tdd/workflow.md
            ├── conventions.md      # → 対象の .claude/tdd/conventions.md
            ├── commands.md         # → 対象の .claude/tdd/commands.md
            ├── progress.md         # → 対象の .claude/tdd/progress.md
            └── driver-skill.md     # → 対象の .claude/skills/tdd/SKILL.md（/tdd）
```

## 使い方

スキルはグローバル（`~/.claude`）には登録しない。**使いたいプロジェクトにだけ手でコピーする。**

1. **対象プロジェクトにスキルをコピーする。** このリポジトリの `skills/tdd-init` を、TDD を始めたいプロジェクトの `.claude/skills/` 配下に置く。

   ```sh
   cp -R /path/to/TDD-training/skills/tdd-init <project>/.claude/skills/tdd-init
   ```

   これで対象プロジェクトで `/tdd-init` が呼べるようになる（反映されない場合はセッションを開き直す）。

2. **対象プロジェクトのルートで** `/tdd-init` を実行する。
   - Claude がスタックを検出し、検出結果を提示する（曖昧なときだけ 1 度確認される）。
   - `.claude/tdd/{workflow,conventions,commands,progress}.md` と `.claude/skills/tdd/SKILL.md` が生成される。
   - プロジェクトの `CLAUDE.md` に TDD への短いポインタが追記される。
3. 以降の開発は `/tdd <作りたい振る舞い>` を実行する。
   - 生成済みの規約・実コマンドに従って Red→Green→Refactor を 1 サイクル回し、`progress.md` に記録、サイクル単位でコミットする。
4. スタックや規約が大きく変わったら、対象プロジェクトで `/tdd-init` を再実行して更新する（`progress.md` は保持される）。

## 設計方針

- **検出 > 一般論**: テンプレの一般論より、プロジェクトの実物（既存テスト・設定ファイル・既存規約）を常に優先する。
- **実在するコマンドだけ**: `package.json` の scripts などから実コマンドを採用し、無いものは「なし」と書く（捏造しない）。
- **責務分離**: `tdd-init` はセットアップ専用。日々の TDD は生成された `/tdd` が担う。
- **生成先は `.claude/` 配下**: Claude の指示書なので、対象プロジェクトの `.claude/` にまとめて置く。
