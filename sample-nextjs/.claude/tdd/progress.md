# TDD 進捗ログ — sample-nextjs

> `/e2e` で外側ループの spec を書き、`/tdd` で内側ループを回し終えるごとに 1 エントリ追記する。
> 「どの機能を、どの E2E / テストで、どう実装 / 検証したか」の履歴。再生成では上書きしない。

## 記録フォーマット

```
### [日付] <機能名 / E2E spec パス>
- 外側ループ (E2E): <追加した e2e spec ファイル・ケース>
- 内側ループ (unit/integration): <追加したテストファイル・ケース>
- 実装: <変更ファイルの要点>
- カバレッジ: 行 XX% / 分岐 XX%
- 結果: E2E ✅ / unit ✅ / integration ✅ / 残課題: <あれば>
- commit: <hash 任意>
```

## ログ

<!-- 新しいエントリを上から追記する -->

### [2026-06-30] 金額整形（formatPrice / /price）
- 外側ループ (E2E): `e2e/price.spec.ts` — `/price` で 1000 入力 → `¥1,000` 表示（REQ-005）
- 内側ループ (unit): `src/lib/formatPrice.test.ts` — example 8 本（REQ-001〜004）＋ property 4 本（fast-check: 出力ドメイン / roundtrip / 四捨五入 / 負数 throw）
- 実装: `src/lib/formatPrice.ts`（負数 throw・四捨五入・`¥` カンマ区切り）、`src/app/price/page.tsx`
- VDD: `/harden` で mutation 88.89% → エラーメッセージの生存ミュータントを kill するテスト追加 → **100%（9/9）**
- カバレッジ: 純ロジック 100% / mutation 100%
- 結果: unit ✅（12 件） / mutation ✅（100%） / typecheck ✅ / lint ✅ / E2E spec 妥当（1 件、ブラウザ実行は未実施）
- 備考: このプロジェクトは DB・認証なし → integration(実 DB) / E2E 認証は構造的に対象外
