# 仕様テンプレ（EARS） — {{PROJECT_NAME}}

> `/spec` がこの雛形に沿って `.claude/tdd/specs/<slug>.md` を書き起こす。
> アプリの責務: {{DOMAIN_SUMMARY}}
>
> **この仕様はゲートではなく任意入力。** 受け入れの実体は E2E / integration テスト。
> spec とテストがずれたら**テストを正**とし、spec を直す。spec が無くても `/e2e` → `/tdd` で開発できる。

---

# <機能名>

- **REQ プレフィックス**: `REQ`（この仕様内で一意）
- **状態**: ドラフト / 確定
- **関連**: <関連する既存 spec / 機能 / 画面があれば>

## 概要

<この機能が「誰の」「どんな課題を」「どう解決するか」を 1〜3 行で。>

## アクター

| アクター | 説明 |
|----------|------|
| <例: ログイン済みユーザー> | <役割・権限> |

## 受け入れ条件（EARS）

各要件は EARS パターンで書き、`REQ-XXX` の ID と推奨テストレベルを付ける。

| ID | パターン | 要件 | 推奨レベル |
|----|----------|------|-----------|
| REQ-001 | Event-driven | WHEN <トリガー> THE SYSTEM SHALL <応答> | E2E |
| REQ-002 | Ubiquitous | THE SYSTEM SHALL <常に成り立つ応答> | unit |
| REQ-003 | State-driven | WHILE <状態> THE SYSTEM SHALL <応答> | integration |
| REQ-004 | Unwanted | IF <異常条件> THEN THE SYSTEM SHALL <応答> | integration |
| REQ-005 | Optional | WHERE <機能が含まれる> THE SYSTEM SHALL <応答> | unit |

EARS パターンの早見:

- **Ubiquitous（常時）**: `THE SYSTEM SHALL ...`
- **Event-driven（イベント）**: `WHEN <trigger> THE SYSTEM SHALL <response>`
- **State-driven（状態）**: `WHILE <state> THE SYSTEM SHALL <response>`
- **Unwanted（異常系）**: `IF <condition> THEN THE SYSTEM SHALL <response>`
- **Optional（任意機能）**: `WHERE <feature included> THE SYSTEM SHALL <response>`

> **異常系（IF ... THEN）を必ず 1 つ以上含める。** happy path だけの仕様にしない。
> 推奨レベルの判断は `.claude/tdd/test-strategy.md` に従う（入出力で閉じる→unit / 層またぎ→integration / 画面操作フロー→E2E）。

## スコープ外（やらないこと）

- <この機能では扱わない範囲を列挙。スコープ外を明示するとスコープ外実装の混入を防げる。>

## 未確定（決め切らない点）

- <ラフな説明から確定できなかった点。`/e2e`・`/tdd` での具体化に委ねる。決めで埋めない。>

---

## 次の一歩

- UI を伴う機能: `/e2e .claude/tdd/specs/<slug>.md`（この spec を受け入れ条件の参照として外側 E2E を書く）
- UI を伴わない機能: `/tdd .claude/tdd/specs/<slug>.md`（内側ループに直接入る）
