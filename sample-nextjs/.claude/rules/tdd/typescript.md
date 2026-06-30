---
description: TypeScript の規約（型 / バリデーション / エラー処理 / 不変性）。TS / TSX を編集中なら自動添付。
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Rules — sample-nextjs

## 型

- export する関数 / コンポーネント props / 共有モデルには**明示的な型**を付ける
- ローカル変数の自明な型は推論に任せる
- 拡張される可能性のあるオブジェクト形状は `interface`、union / intersection / utility 型は `type`
- `enum` より string literal union を優先する
- **`any` 禁止**。`unknown` で受けて narrow する
- `React.FC` は使わない

## バリデーション

- システム境界（API 入力 / フォーム入力 / 外部データ）では **Zod** で検証する
- Zod スキーマから `z.infer<typeof schema>` で TypeScript の型を導く

## エラー処理

- catch 句の変数は `unknown`: `catch (error: unknown)`
- `instanceof Error` で narrow してからプロパティにアクセスする

## 不変性

- mutation より spread / map / filter を優先する
- リテラル定数には `as const`

## このプロジェクト固有のメモ

<!-- 既存規約があればここに転記（例: Server Action の Result 型、特定の型 alias、ドメイン特有の typing パターン等） -->
