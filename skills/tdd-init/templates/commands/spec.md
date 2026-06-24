---
description: ラフな要望から EARS 形式の構造化仕様を起こす。受け入れ条件を REQ-ID 付きで言語化する思考・コミュニケーションの補助。ゲートではなく /e2e・/tdd への任意入力。
argument-hint: <作りたい機能のラフな説明>
allowed-tools: Read, Write, Edit, Grep, Glob
---

> **位置づけ**: spec は**任意入力**であって**ゲートではない**。acceptance の実体は引き続き **E2E / integration テスト**で、spec はその上位権威ではない。spec が無くても `/e2e` → `/tdd` で開発できる。spec は「何を作るか」を REQ 単位で言語化し、`/e2e`・`/tdd` に渡せる構造化された受け入れ条件の**参照**を作るためのもの。

## Context — {{PROJECT_NAME}}

- アプリ: {{DOMAIN_SUMMARY}}
- 実装/コンポーネント/サービスの配置: {{SRC_LAYOUT}}
- 仕様テンプレ: `.claude/tdd/spec-template.md`
- 仕様の出力先: `.claude/tdd/specs/<slug>.md`

## Your task

`$ARGUMENTS`（作りたい機能のラフな説明）を、EARS 形式の構造化仕様に起こす。

### Step 1: 既存を読む

- `.claude/tdd/spec-template.md`（出力フォーマットの雛形）
- 関連する既存 spec（`.claude/tdd/specs/*.md`）・既存実装・CLAUDE.md の用語表（ドメイン語彙を仕様に揃える）

### Step 2: EARS 形式で受け入れ条件を書く

各要件を、振る舞いに合った EARS パターンで書く:

| パターン | 形 | 使いどころ |
|----------|----|-----------|
| Ubiquitous（常時） | `THE SYSTEM SHALL <応答>` | 常に成り立つ性質 |
| Event-driven（イベント） | `WHEN <トリガー> THE SYSTEM SHALL <応答>` | 何かが起きたとき |
| State-driven（状態） | `WHILE <状態> THE SYSTEM SHALL <応答>` | ある状態の間 |
| Unwanted（異常系） | `IF <条件> THEN THE SYSTEM SHALL <応答>` | エラー / 不正入力 |
| Optional（任意機能） | `WHERE <機能が含まれる> THE SYSTEM SHALL <応答>` | 構成で有無が変わる機能 |

- 各要件に **`REQ-001` 形式の ID** を振る。
- 各 REQ に**推奨テストレベル**（unit / integration / E2E）を付ける（`.claude/tdd/test-strategy.md` の判断基準に従う）。
- **異常系（IF ... THEN）を必ず含める。** happy path だけの仕様にしない。
- スコープ外（やらないこと）を明記する。

### Step 3: 出力する

`.claude/tdd/spec-template.md` の構成に沿って `.claude/tdd/specs/<slug>.md` に書き出す。`<slug>` は機能を表す英小文字ケバブケース。

### Step 4: 次へ案内する

書き出した spec パスを示し、次を案内する:

- UI を伴う機能: `/e2e .claude/tdd/specs/<slug>.md` で外側ループの E2E spec を書く（spec を受け入れ条件の参照として読む）。
- UI を伴わない機能: `/tdd .claude/tdd/specs/<slug>.md` で内側ループに直接入る。

## Rules

- **spec はテストの上位権威ではない。** 受け入れの実体は E2E / integration テスト。spec と実テストがずれたら、**テストを正**として spec を直す（spec に合わせてテストを歪めない）。
- spec は思考とコミュニケーションの補助。**ゲートにしない**（spec が無いことを理由に `/e2e`・`/tdd` を止めない）。
- ドメイン語彙は CLAUDE.md の用語表に揃える。仕様の言葉とコードの言葉を一致させる。
- 推測で要件を盛らない。ラフな説明から確実に言えることを REQ にし、曖昧な点は「未確定」として残し、決め切らずに `/e2e`・`/tdd` での具体化に委ねてよい。
- UI テキストは {{UI_LANGUAGE}}。
