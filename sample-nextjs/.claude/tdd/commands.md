# 実行コマンド — sample-nextjs

> `/tdd-init` が検出した、このプロジェクトの実コマンド。
> ここに無い（「なし」の）ものは、このプロジェクトに存在しない or 未検出。捏造しない。

| 目的 | コマンド |
|------|----------|
| 全テスト実行 | `npm test` |
| ファイル単位で実行 | `npx vitest run <path/to/file.test.ts>` |
| テスト名/パターン単位で実行 | `npx vitest run -t "<テスト名>"` |
| watch（変更で自動再実行） | `npm run test:watch` |
| カバレッジ | `npm run coverage` |
| Lint | `npm run lint` |
| 型チェック | `npm run typecheck` |
| ビルド | `npm run build` |

## 使い分け

- **TDD サイクル中（Red / Green）**: まず **ファイル単位** か **テスト名単位** で回して速く回す。
- **Green の確認後 / サイクル終了時**: **全テスト** を実行して回帰がないか確認する。
- watch があれば開発中は watch を常駐させ、保存ごとに赤→緑を見る。

## サイクル終了前のチェック

コミット前に、存在するものは順に通す:

1. `npm test`
2. `npm run typecheck`
3. `npm run lint`

いずれかが落ちている状態でコミットしない。
