---
description: EARS 仕様の規約（パターン早見・REQ-ID・異常系必須・スコープ外明記）。`.claude/tdd/specs/**` を編集中なら自動添付。
paths:
  - ".claude/tdd/specs/**"
  - "**/tdd/specs/**"
---

# Spec Conventions — {{PROJECT_NAME}}

> この spec はゲートではない。acceptance の実体は E2E / integration テスト。spec とテストがずれたら**テストを正**として spec を直す（spec に合わせてテストを歪めない）。spec が無くても `/e2e` → `/tdd` で開発できる。

## EARS パターン早見

| パターン | 構文 | 使いどころ |
|----------|------|-----------|
| **Ubiquitous（常時）** | `THE SYSTEM SHALL <応答>` | 常に成り立つ性質 |
| **Event-driven（イベント）** | `WHEN <トリガー> THE SYSTEM SHALL <応答>` | 何かが起きたとき |
| **State-driven（状態）** | `WHILE <状態> THE SYSTEM SHALL <応答>` | ある状態の間 |
| **Unwanted（異常系）** | `IF <条件> THEN THE SYSTEM SHALL <応答>` | エラー / 不正入力 |
| **Optional（任意機能）** | `WHERE <機能が含まれる> THE SYSTEM SHALL <応答>` | 構成で有無が変わる機能 |

振る舞いに合ったパターンを 1 つ選ぶ。複数パターンを 1 文に混ぜない。

## REQ-ID 規約

- `REQ-001` 形式の連番。この spec ファイル内で一意にする。
- 各 REQ に**推奨テストレベル**（unit / integration / E2E）を付ける。
  - 入出力で閉じる純ロジック → **unit**
  - 層またぎ / DB / 外部 I/O → **integration**
  - 画面をまたぐユーザー操作フロー → **E2E**
- 詳細な判断基準は `.claude/tdd/test-strategy.md` に従う。
- **テストは検証する REQ をタグ付けする**: テスト名先頭か `// @covers REQ-003` をテスト内に記述。影響範囲の grep と spec-check の結合キーになる。spec を使わない場合はタグ不要。

## 守ること

- **異常系（IF…THEN）を最低 1 つ含める。** happy path だけの仕様にしない。
- **推測で要件を盛らない。** ラフな説明から確実に言えることだけ REQ にする。曖昧な点は「未確定」として残し、`/e2e`・`/tdd` での具体化に委ねる（決めで埋めない）。
- **スコープ外（やらないこと）を明記する。** スコープ外を書くとスコープ外実装の混入を防げる。
- **ドメイン語彙は CLAUDE.md の用語表に揃える。** 仕様の言葉とコードの言葉を一致させる。
- UI テキストは {{UI_LANGUAGE}}。

## 変更セット（delta spec）

`/spec --delta` が出力する変更セットは spec ファイル末尾の `## 変更セット` セクションに記録する。`/impact` がこの変更セットを入力として使う:

```
追加: REQ-006, REQ-007
変更: REQ-003
削除: REQ-004
```

## このプロジェクト固有のメモ

<!-- tdd-init が読み取った用語表・ドメイン語彙等をここに転記。仕様ファイルと実装の語彙を直結する。 -->
