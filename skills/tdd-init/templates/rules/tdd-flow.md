---
description: Dual-loop TDD の規律（外側 E2E / 内側 unit-integration）。常時適用。
---

# Dual-loop TDD の規律 — {{PROJECT_NAME}}

> `/tdd-init` が生成した常時適用ルール。このプロジェクトは **dual-loop TDD**（外側 E2E / 内側 unit-integration）で開発する。
> アプリの責務: {{DOMAIN_SUMMARY}}

## 基本姿勢

- **acceptance（E2E もしくは integration test）→ 内部実装**の順に組む。実装から書き始めない。
- 新機能 / バグ修正 / リファクタは、**実行可能な acceptance** が無い状態では着手しない。仕様書ではなく**テストが acceptance の実体**。
- **任意**で `/spec` により EARS 形式の構造化仕様を書ける。ただし **spec はゲートではなく、テストが acceptance の実体**。spec は思考・コミュニケーションの補助で、無くても `/e2e` → `/tdd` で開発できる。spec と実テストがずれたらテストを正とする。
- テストを先に書き、**期待どおり赤**を確認してから実装する。
- **緑でない状態でコミットしない。** 実装はテストを通すためだけに書き、テストを実装に合わせて歪めない。
- **テストを書かずに feature を実装しない。**「とりあえず実装」で TDD フローを飛ばさない。

## Dual-loop の構造

```
┌─ Outer loop (E2E / Playwright) ─────────────────────────────┐
│  1. RED:   ユーザー操作フローを E2E spec として書く            │
│            実装が無いので失敗する（page/要素/応答が無い）       │
│                                                             │
│  ┌─ Inner loop (unit / integration / Vitest) ────────────┐  │
│  │  2. SCAFFOLD: 型 / interface 定義 + スタブ              │  │
│  │  3. RED:        受け入れ条件 1 つにテストを 1 本書く    │  │
│  │  4. SPEC-CHECK: 仕様↔テスト整合（spec なければスキップ）│  │
│  │  5. GREEN:      最小実装でテストを通す                  │  │
│  │  6. REFACTOR:   緑のまま整える                          │  │
│  │  → 受け入れ条件ごとに繰り返す                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  7. GREEN:    内部が組み上がり、E2E が緑になる                │
│  8. REFACTOR: コンポーネント分割・共通化（緑を維持）           │
└─────────────────────────────────────────────────────────────┘
```

### Outer loop（`/e2e <機能名>`）

- ユーザー操作フローを Playwright spec として**先に**書く（RED）
- spec を緑にするために必要な実装（page / Server Action / component / schema）を**列挙**する
- 列挙は inner loop の work item になる

### Inner loop（`/tdd <e2e spec のパス もしくは 機能説明>`）

- **SCAFFOLD**: 型 / interface を先に書き、対象関数は `throw new Error('Not implemented')` でスタブ。テストが import するシグネチャを確定させる。
- **RED**: 1 受け入れ条件 = 1 テスト（Arrange–Act–Assert）。実行して失敗確認 — 構文エラーは壊れたテスト（直す）、`Not implemented` で落ちれば正しい RED、緑になるなら何も検証していない（見直す）。
- **SPEC-CHECK（RED→GREEN 間 / 緑化前）**: **spec-check** エージェントが仕様↔テスト整合を判定（詳細観点は `agents/spec-check.md`）。spec がなければスキップ。FAIL なら指されたフェーズに戻る。
  - **追加仕様時は DIFF-CHECK として使う**: 変更 REQ ↔ テスト変更が 1:1 か・orphan が無いか（双方向）を spec-check に判定させる。`/impact` の変更セットを `reference` に渡す。
- **GREEN**: 最小実装でテストを通す。早すぎる抽象化をしない（重複は REFACTOR で消す）。
- **REFACTOR**: 重複除去・命名整理・定数抽出。1 変更ごとにテストを走らせ緑を維持。崩れたら即巻き戻す。
- **COVERAGE**: `{{COVERAGE_CMD}}` で 80%+ を確認。届かなければ未カバーの分岐 / 異常系を追加。
- 全受け入れ条件が緑になったら **外側ループの E2E を実行**して acceptance を確認する。

### UI が無いバックエンド機能

E2E 対象でない場合（純ロジック / バックエンド API のみ等）は **integration test を outer loop の代わりに**書く。`/e2e` ではなく `/tdd` から直接入る。

## テストレベルの選び方（詳細は `test-strategy.md`）

| レベル | 対象 | ツール |
|--------|------|--------|
| **unit** | 純粋ロジック / 関数 / コンポーネント単体 | Vitest (+ RTL) |
| **integration** | 複数モジュール・route handler・DB / 外部 I/O 境界をまたぐ | Vitest（実 DB / 認証モック） |
| **E2E** | 画面をまたぐユーザー操作フロー・受け入れシナリオ | Playwright |

- **下位レベルで test できるものは下位で**。E2E に寄せ過ぎない（遅く脆い）。
- **逆に全部 unit に倒すのも禁止**。UI を伴うなら E2E、層またぎなら integration を必ず書く。
- 実行基盤は `test-infra.md` に用意済み。無ければ用意してから書く。

## 完了の定義（Definition of Done）

機能は、以下を満たすまで「完了」にしない:

- UI / 画面を伴う機能に **E2E が最低 1 本**あり、緑になっている（無いなら理由が明記）
- API / DB / 複数モジュールをまたぐ機能に **integration がある**（無いなら理由が明記）
- すべての受け入れ条件に、割り当てたレベルのテストが存在し、緑である
- 既存テストが回帰していない（全 unit / integration 緑）— **追加仕様時は `/impact` の回帰セット全テストを実行して緑を確認してから完了とする（回帰ゲート）**
- カバレッジ **80%+**（行 / 分岐）— 届かない場合は理由が明記
- 型チェック / lint が通る

**unit だけで「完了」にしない**。E2E / integration を省いた理由が言語化できないなら書く。

## 完了前に通すこと（推奨・ゲートではない）

DoD を満たして緑になったら、「完了」と言う前に次の 2 つを**通すことを推奨**する。**必須ゲートではなく、フックで強制もしない**（自分で判断して通す）。

- **`/harden`（VDD: property + mutation）** — 純ロジックに property-based（fast-check）で不変条件を、重要箇所に mutation（Stryker）で生存ミュータント潰しを当て、テストの広さ・深さを上げる。
- **`/adversary`（独立バイナリ判定）** — 会話履歴を共有しない `adversary` agent に差分を審査させ、5 次元の PASS/FAIL と戻すべきフェーズ（spec/e2e/tdd/refactor）を得る。`/review`（同一コンテキストの自己点検）とは別の独立した第二の目。

FAIL や生存ミュータントが出たら、指されたフェーズ（`/spec`・`/e2e`・`/tdd`・`/refactor`）に戻って直してから「完了」とする。

## レビュー入力契約（インライン manifest）

レビュー（spec-check / harden / adversary / impact-analyzer）を呼ぶ側は次のフィールドを渡す:

- `target` — 審査対象（テストファイル・差分範囲）
- `reference` — 該当 REQ-ID 群 ＋ 受け入れ条件 / spec パス
- `rubric` — 各エージェントが自身の定義に保持（呼び出し元は渡さない）
- `scope` — 判定の範囲（例: `仕様↔テスト整合`・`property+mutation`・`5次元バイナリ`）
- `output` — `PASS/FAIL ＋ findings(file:line) ＋ routeToPhase`

## 守ること

- コマンドは `.claude/tdd/commands.md` のものだけを使う。
- テストの配置・命名・モック方針は `.claude/rules/tdd/testing.md` に従う。
- 確認ステップは最小限。1 受け入れ条件 = 1 コミット。
- `push` はユーザーが明示したときだけ。
- 「面倒だから」「重いから」を理由に E2E / integration を unit へ落とさない。基盤が無ければ `test-infra.md` で用意する。
