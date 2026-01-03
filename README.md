# Mermaid ER Diagram Editor

Mermaid ER図をビジュアルに編集できるエディターです。Webアプリケーションとして利用することも、VSCode拡張機能としてインストールすることもできます。

## デモ

**Web版**: [https://sean-sunagaku.github.io/mermaid-designer/](https://sean-sunagaku.github.io/mermaid-designer/)

## 特徴

- **ビジュアル編集**: ドラッグ＆ドロップでER図を作成・編集
- **双方向同期**: GUIでの変更がコードに、コードの変更がGUIにリアルタイム反映
- **Mermaid記法対応**: 標準的なMermaid ER図記法をサポート
- **Undo/Redo**: 操作の取り消し・やり直しに対応
- **エクスポート**: PNG/SVG形式での出力に対応
- **多言語対応**: 日本語・英語をサポート

## 使い方

### Webアプリケーション

1. [デモサイト](https://sean-sunagaku.github.io/mermaid-designer/)にアクセス
2. 「新規作成」または「サンプルを開く」を選択
3. 左のキャンバスでエンティティを追加・編集
4. 右のコードエディターでMermaidコードを直接編集

### VSCode拡張機能

詳細は [packages/vscode/README.md](./packages/vscode/README.md) を参照してください。

#### クイックスタート

1. VSCode拡張機能をインストール（後述）
2. `.er.md` または `.erd.mmd` ファイルを作成
3. ファイルを開くとビジュアルエディターが起動

---

## VSCode拡張機能のインストール

VSCode拡張機能は現在Marketplaceに公開されていないため、手動でのインストールが必要です。

### 方法1: プリビルド版をダウンロード

1. [Releases](https://github.com/sean-sunagaku/mermaid-designer/releases)ページから最新の `.vsix` ファイルをダウンロード
2. VSCodeで `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）を押してコマンドパレットを開く
3. `Extensions: Install from VSIX...` を選択
4. ダウンロードした `.vsix` ファイルを選択

### 方法2: ソースからビルド

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

### VSCode拡張機能の使い方

1. 以下のいずれかの拡張子でファイルを作成:
   - `*.er.md` - ER図用マークダウン
   - `*.erd.mmd` - ER図用Mermaidファイル

2. ファイルを開くと自動的にビジュアルエディターが起動

3. コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）から:
   - `Mermaid ER: New ER Diagram` - 新しいER図を作成

---

## 開発

### 必要条件

- Node.js 18以上
- npm 9以上

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/sean-sunagaku/mermaid-designer.git
cd mermaid-designer

# 依存関係をインストール
npm install

# 開発サーバーを起動（ポート1837）
npm run dev
```

### プロジェクト構成

```
packages/
├── core/     # 共通コア（型定義、パーサー、ストア、コンポーネント）
├── web/      # Webアプリケーション（Vite + React）
└── vscode/   # VSCode拡張機能
```

### 主要コマンド

| コマンド                                              | 説明                                        |
| ----------------------------------------------------- | ------------------------------------------- |
| `npm run dev`                                         | 開発サーバーを起動（ポート1837）            |
| `npm run build`                                       | 全パッケージをビルド                        |
| `npm run build:core`                                  | coreパッケージのみビルド                    |
| `npm run build:web`                                   | webパッケージのみビルド                     |
| `npm run build:vscode`                                | VSCode拡張機能をビルド                      |
| `npm run package:vscode`                              | VSCode拡張機能をパッケージング（.vsix生成） |
| `npm run lint`                                        | ESLintを実行                                |
| `npm run test`                                        | ユニットテストを実行                        |
| `npm run test:e2e --workspace=@mermaid-er-editor/web` | E2Eテストを実行                             |

### ローカル動作確認

プッシュ前に以下を実行してください:

```bash
# 1. Lintチェック
npm run lint

# 2. ユニットテスト
npm run test --workspace=@mermaid-er-editor/core

# 3. ビルド
npm run build

# 4. E2Eテスト（Chromiumのみ）
npm run test:e2e --workspace=@mermaid-er-editor/web -- --project=chromium
```

### E2Eテストの事前準備

初回実行時はPlaywrightブラウザをインストール:

```bash
npx playwright install chromium
```

---

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Tailwind CSS
- **状態管理**: Zustand + Zundo（Undo/Redo）
- **ダイアグラム**: React Flow
- **ビルドツール**: Vite
- **テスト**: Vitest, Playwright
- **国際化**: i18next

---

## ライセンス

MIT License

---

## コントリビューション

Issue、Pull Requestは歓迎します。大きな変更を行う場合は、まずIssueで議論してください。
