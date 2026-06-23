# 実行コマンド — {{PROJECT_NAME}}

> `/tdd-init` が検出・設定した実コマンド。ここに無い（「なし」の）ものは存在しない or 未導入。捏造しない。
> パッケージマネージャ: {{PKG_MANAGER}}

## ユニット（Vitest）
| 目的 | コマンド |
|------|----------|
| 全ユニット実行 | `{{TEST_UNIT_ALL_CMD}}` |
| ファイル単位 | `{{TEST_UNIT_FILE_CMD}}` |
| テスト名/パターン単位 | `{{TEST_UNIT_GREP_CMD}}` |
| watch | `{{TEST_UNIT_WATCH_CMD}}` |
| カバレッジ | `{{COVERAGE_CMD}}` |

## E2E（Playwright）
| 目的 | コマンド |
|------|----------|
| 全 E2E 実行 | `{{TEST_E2E_ALL_CMD}}` |
| ファイル単位 | `{{TEST_E2E_FILE_CMD}}` |
| シナリオ名単位（grep） | `{{TEST_E2E_GREP_CMD}}` |
| UI モード | `{{TEST_E2E_UI_CMD}}` |

## テスト DB / 統合（実 DB。`{{DB}}` がある場合）
| 目的 | コマンド |
|------|----------|
| テスト DB 起動 | `{{TEST_DB_UP_CMD}}` |
| テスト DB 停止 | `{{TEST_DB_DOWN_CMD}}` |
| マイグレーション適用 | `{{DB_MIGRATE_CMD}}` |
| シード投入 | `{{SEED_CMD}}` |
| 実 DB 統合テスト実行 | `{{TEST_INTEGRATION_CMD}}` |

## 静的チェック / ビルド
| 目的 | コマンド |
|------|----------|
| 型チェック | `{{TYPECHECK_CMD}}` |
| Lint | `{{LINT_CMD}}` |
| ビルド | `{{BUILD_CMD}}` |
| dev 起動（動作確認用） | `{{DEV_CMD}}` |

## 使い分け
- **Inner loop の RED / GREEN 中**: まず**ファイル単位 / 名前単位**で速く回す（`{{TEST_UNIT_FILE_CMD}}`）。
- **Inner loop の REFACTOR 中**: 1 変更ごとにファイル単位で走らせて緑を維持する。
- **Outer loop（E2E）の確認**: 対象 E2E を `{{TEST_E2E_FILE_CMD}}` で実行。緑になれば機能完成。
- **コミット前**: 存在するものを順に通す — `{{TEST_UNIT_ALL_CMD}}` → `{{TYPECHECK_CMD}}` → `{{LINT_CMD}}`。
- いずれかが落ちている状態でコミットしない。
