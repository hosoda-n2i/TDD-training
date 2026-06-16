# 実行コマンド — sample-nextjs

> `/tdd-init` が検出・設定した実コマンド。ここに無い（「なし」の）ものは存在しない or 未導入。捏造しない。
> パッケージマネージャ: npm

## ユニット（Vitest）
| 目的 | コマンド |
|------|----------|
| 全ユニット実行 | `npm test` |
| ファイル単位 | `npm test -- src/lib/formatPrice.test.ts` |
| テスト名/パターン単位 | `npm test -- --reporter=verbose -t "テスト名"` |
| watch | `npm run test:watch` |
| カバレッジ | `npm run coverage` |

## E2E（Playwright）
| 目的 | コマンド |
|------|----------|
| 全 E2E 実行 | `npm run test:e2e` |
| ファイル単位 | `npx playwright test e2e/price.spec.ts` |
| シナリオ名単位（grep） | `npx playwright test --grep "テスト名"` |
| UI モード | `npm run test:e2e:ui` |

## 静的チェック / ビルド
| 目的 | コマンド |
|------|----------|
| 型チェック | `npm run typecheck` |
| Lint | `npm run lint` |
| ビルド | `npm run build` |
| dev 起動（動作確認用） | `PORT=4000 npm run dev`（port 3000/3001 は別プロジェクトが使用中） |

## 使い分け
- **TDD サイクル中（Red/Green）**: まず**ファイル単位 / 名前単位**で速く回す。
- **回帰確認（フロー step5/6）**: 全ユニット → 対象 E2E の順で通す。
- **コミット前**: 存在するものを順に通す — `npm test` → `npm run typecheck` → `npm run lint`。
- いずれかが落ちている状態でコミットしない。
