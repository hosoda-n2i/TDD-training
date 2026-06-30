# 実行コマンド — sample-nextjs

> `/tdd-init` が検出・設定した実コマンド。ここに無い（「なし」の）ものは存在しない or 未導入。捏造しない。
> パッケージマネージャ: npm

## ユニット（Vitest）
| 目的 | コマンド |
|------|----------|
| 全ユニット実行 | `npm test` |
| ファイル単位 | `npm test --` |
| テスト名/パターン単位 | `npm test -- -t` |
| watch | `npm run test:watch` |
| カバレッジ | `npm run coverage` |

## VDD ハードニング（property / mutation）
| 目的 | コマンド |
|------|----------|
| property-based（fast-check） | unit と同じ Vitest で実行（`npm test --`） |
| mutation（Stryker） | `npm run mutation` |

> property-based は専用コマンドではなく Vitest 上で回す（テストファイルに `fast-check` を import）。mutation は `/harden` で緑の後に対象を絞って実行する。

## E2E（Playwright）
| 目的 | コマンド |
|------|----------|
| 全 E2E 実行 | `npm run test:e2e` |
| ファイル単位 | `npm run test:e2e --` |
| シナリオ名単位（grep） | `npm run test:e2e -- -g` |
| UI モード | `npm run test:e2e:ui` |

## テスト DB / 統合（実 DB）— 対象外

このプロジェクトは DB を持たないため、テスト DB 起動 / マイグレーション / シード / 実 DB 統合テストは**対象外**（コマンドなし）。DB を導入したら `/tdd-init` 再実行で Phase B を追加する。

## 静的チェック / ビルド
| 目的 | コマンド |
|------|----------|
| 型チェック | `npm run typecheck` |
| Lint | `npm run lint` |
| ビルド | `npm run build` |
| dev 起動（動作確認用） | `npm run dev` |

## 使い分け
- **Inner loop の RED / GREEN 中**: まず**ファイル単位 / 名前単位**で速く回す（`npm test --`）。
- **Inner loop の REFACTOR 中**: 1 変更ごとにファイル単位で走らせて緑を維持する。
- **Outer loop（E2E）の確認**: 対象 E2E を `npm run test:e2e --` で実行。緑になれば機能完成。
- **コミット前**: 存在するものを順に通す — `npm test` → `npm run typecheck` → `npm run lint`。
- いずれかが落ちている状態でコミットしない。
