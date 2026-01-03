# Mermaid ER Diagram Editor - VSCode Extension

VSCode内でMermaid ER図をビジュアルに編集できる拡張機能です。

## 特徴

- **ビジュアル編集**: ドラッグ＆ドロップでER図を作成・編集
- **双方向同期**: GUIでの変更がファイルに、ファイルの変更がGUIに自動反映
- **Mermaid記法対応**: 標準的なMermaid ER図記法をサポート
- **Undo/Redo**: VSCode標準のUndo/Redo操作に対応
- **Markdown内編集**: 通常のMarkdownファイル内のMermaidブロックも編集可能

## インストール方法

### 方法1: VSIXファイルからインストール（推奨）

1. [Releases](https://github.com/sean-sunagaku/mermaid-designer/releases)ページから最新の `.vsix` ファイルをダウンロード

2. VSCodeでコマンドパレットを開く
   - Windows/Linux: `Ctrl + Shift + P`
   - Mac: `Cmd + Shift + P`

3. `Extensions: Install from VSIX...` を入力して選択

4. ダウンロードした `.vsix` ファイルを選択

5. インストール完了後、VSCodeを再読み込み

### 方法2: コマンドラインからインストール

```bash
# ダウンロードした .vsix ファイルをインストール
code --install-extension mermaid-er-editor-0.1.0.vsix
```

### 方法3: ソースからビルドしてインストール

```bash
# リポジトリをクローン
git clone https://github.com/sean-sunagaku/mermaid-designer.git
cd mermaid-designer

# 依存関係をインストール
npm install

# VSCode拡張機能をパッケージング
npm run package:vscode

# 生成された .vsix ファイルをインストール
code --install-extension packages/vscode/mermaid-er-editor-0.1.0.vsix
```

## 使い方

### 対応ファイル

以下の拡張子のファイルを開くと、自動的にビジュアルエディターが起動します:

| 拡張子      | 説明                                         |
| ----------- | -------------------------------------------- |
| `*.er.md`   | ER図用マークダウンファイル                   |
| `*.erd.mmd` | ER図用Mermaidファイル                        |
| `*.md`      | 通常のMarkdownファイル（CodeLensで編集可能） |

### Markdown内のMermaidブロック編集

通常のMarkdownファイル（`.md`）内に書かれた`mermaid`ブロックも編集できます：

1. Markdownファイルを開く
2. 図を含む`mermaid`ブロックの上に編集リンクが表示される
   - ER図: 「Edit ER Diagram」
   - フローチャート: 「Edit Flowchart」
   - シーケンス図: 「Edit Sequence Diagram」
3. リンクをクリックするとサイドパネルでビジュアルエディタが開く
4. 編集内容は元のMarkdownファイルの該当ブロックに自動反映

**対応する図の種類:**

| 図タイプ       | Mermaid記法           |
| -------------- | --------------------- |
| ER図           | `erDiagram`           |
| フローチャート | `flowchart` / `graph` |
| シーケンス図   | `sequenceDiagram`     |

### 新規ER図の作成

1. コマンドパレットを開く（`Ctrl+Shift+P` / `Cmd+Shift+P`）
2. `Mermaid ER: New ER Diagram` を選択
3. ファイルの保存先を指定

### エディターの操作

#### エンティティの追加

- ツールバーの「エンティティを追加」ボタンをクリック
- または、キャンバス上でダブルクリック

#### エンティティの編集

- エンティティをクリックして選択
- 右側のプロパティパネルで名前や属性を編集

#### リレーションの作成

- エンティティの接続ポイント（ハンドル）からドラッグ
- 別のエンティティのハンドルにドロップ

#### リレーションの編集

- リレーション（線）をクリックして選択
- プロパティパネルでカーディナリティやラベルを編集

### キーボードショートカット

| ショートカット                 | 操作               |
| ------------------------------ | ------------------ |
| `Ctrl+Z` / `Cmd+Z`             | 元に戻す           |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | やり直し           |
| `Delete` / `Backspace`         | 選択した要素を削除 |

## サンプルファイル

新しいファイル `example.er.md` を作成し、以下の内容を貼り付けてください:

```
erDiagram
    USER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        int user_id FK
        date created_at
    }
    USER ||--o{ ORDER : places
```

## トラブルシューティング

### ビジュアルエディターが開かない

1. ファイルの拡張子が `.er.md` または `.erd.mmd` であることを確認
2. VSCodeを再起動
3. 拡張機能が有効になっているか確認（拡張機能パネルで確認）

### エディターが正しく表示されない

1. VSCodeのバージョンが1.85.0以上であることを確認
2. 他の拡張機能との競合がないか確認
3. 拡張機能を再インストール

## 開発者向け情報

### デバッグ

1. VSCodeでこのリポジトリを開く
2. `F5`キーを押して拡張機能開発ホストを起動
3. 開発ホストで `.er.md` ファイルを開いてテスト

### ビルド

```bash
# 開発用ビルド（監視モード）
npm run watch --workspace=mermaid-er-editor

# プロダクションビルド
npm run build:vscode

# パッケージング
npm run package:vscode
```

## ライセンス

MIT License
