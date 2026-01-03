import * as vscode from 'vscode';
import { MermaidBlock, MermaidBlockType } from '../codelens';
import { BlockTracker } from './blockTracker';

/**
 * ランダムなnonceを生成（CSP用）
 */
function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

/**
 * 図タイプの表示名
 */
const DIAGRAM_TYPE_NAMES: Record<MermaidBlockType, string> = {
  erDiagram: 'ER Diagram',
  flowchart: 'Flowchart',
  sequenceDiagram: 'Sequence Diagram',
  unknown: 'Diagram',
};

/**
 * Mermaidブロック編集用のWebviewパネルマネージャー
 */
export class MermaidBlockEditorPanel {
  /** 開いているパネルのマップ（キー: documentUri-startLine） */
  public static currentPanels: Map<string, MermaidBlockEditorPanel> = new Map();

  private readonly panel: vscode.WebviewPanel;
  private readonly documentUri: vscode.Uri;
  private readonly extensionUri: vscode.Uri;
  private readonly diagramType: MermaidBlockType;
  private blockTracker: BlockTracker;
  private disposables: vscode.Disposable[] = [];
  private isUpdatingFromWebview = false;

  private constructor(
    panel: vscode.WebviewPanel,
    documentUri: vscode.Uri,
    extensionUri: vscode.Uri,
    block: MermaidBlock
  ) {
    this.panel = panel;
    this.documentUri = documentUri;
    this.extensionUri = extensionUri;
    this.diagramType = block.type;

    // BlockTrackerを初期化
    this.blockTracker = new BlockTracker(documentUri, block, (updatedBlock) =>
      this.onBlockPositionChanged(updatedBlock)
    );

    // Webviewコンテンツを設定
    this.panel.webview.html = this.getHtmlForWebview();

    // Webviewからのメッセージを処理
    this.panel.webview.onDidReceiveMessage(
      this.handleWebviewMessage.bind(this),
      null,
      this.disposables
    );

    // パネルが閉じられたときの処理
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // 外部からのドキュメント変更を監視
    vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (
          e.document.uri.toString() === documentUri.toString() &&
          !this.isUpdatingFromWebview
        ) {
          this.syncFromDocument();
        }
      },
      null,
      this.disposables
    );

    // 初期コンテンツを送信
    this.syncFromDocument();
  }

  /**
   * パネルを作成または既存のパネルを表示
   */
  public static createOrShow(
    extensionUri: vscode.Uri,
    documentUri: vscode.Uri,
    block: MermaidBlock
  ): MermaidBlockEditorPanel {
    const panelKey = `${documentUri.toString()}-${block.startLine}`;

    // 既存のパネルがあれば表示
    const existingPanel = MermaidBlockEditorPanel.currentPanels.get(panelKey);
    if (existingPanel) {
      existingPanel.panel.reveal(vscode.ViewColumn.Beside);
      return existingPanel;
    }

    // 新しいパネルを作成
    const typeName = DIAGRAM_TYPE_NAMES[block.type];
    const panel = vscode.window.createWebviewPanel(
      'mermaidDiagramEditor',
      `${typeName} (Line ${block.startLine + 1})`,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist'),
          vscode.Uri.joinPath(extensionUri, 'webview-dist'),
        ],
      }
    );

    const editorPanel = new MermaidBlockEditorPanel(
      panel,
      documentUri,
      extensionUri,
      block
    );

    MermaidBlockEditorPanel.currentPanels.set(panelKey, editorPanel);

    return editorPanel;
  }

  /**
   * すべてのパネルを破棄
   */
  public static disposeAll(): void {
    MermaidBlockEditorPanel.currentPanels.forEach((panel) => panel.dispose());
    MermaidBlockEditorPanel.currentPanels.clear();
  }

  /**
   * Webviewからのメッセージを処理
   */
  private async handleWebviewMessage(message: {
    type: string;
    content?: string;
    message?: string;
  }): Promise<void> {
    switch (message.type) {
      case 'ready':
        this.syncFromDocument();
        break;

      case 'update':
        if (message.content) {
          await this.updateDocumentBlock(message.content);
        }
        break;

      case 'error':
        vscode.window.showErrorMessage(
          `Mermaid Editor Error: ${message.message || 'Unknown error'}`
        );
        break;
    }
  }

  /**
   * ドキュメント内のブロックを更新
   */
  private async updateDocumentBlock(newContent: string): Promise<void> {
    const block = this.blockTracker.getCurrentBlock();
    if (!block) {
      vscode.window.showWarningMessage(
        'Mermaidブロックが見つかりません。更新できませんでした。'
      );
      return;
    }

    // ドキュメントを開いて編集可能な状態にする
    await vscode.workspace.openTextDocument(this.documentUri);
    const edit = new vscode.WorkspaceEdit();

    // ブロック内のコンテンツのみを置換（```mermaid と ``` は保持）
    const range = new vscode.Range(
      new vscode.Position(block.contentStartLine, 0),
      new vscode.Position(block.contentEndLine + 1, 0)
    );

    // 改行で終わるようにする
    const contentToInsert = newContent.endsWith('\n')
      ? newContent
      : newContent + '\n';

    this.isUpdatingFromWebview = true;
    edit.replace(this.documentUri, range, contentToInsert);
    await vscode.workspace.applyEdit(edit);
    this.isUpdatingFromWebview = false;
  }

  /**
   * ドキュメントからWebviewにコンテンツを同期
   */
  private syncFromDocument(): void {
    const block = this.blockTracker.getCurrentBlock();
    if (!block) return;

    this.panel.webview.postMessage({
      type: 'load',
      content: block.content,
      diagramType: this.diagramType,
    });
  }

  /**
   * ブロック位置が変更されたときの処理
   */
  private onBlockPositionChanged(block: MermaidBlock | null): void {
    if (!block) {
      // ブロックが削除された - パネルを閉じる
      vscode.window.showWarningMessage(
        '編集中のMermaidブロックが削除されました'
      );
      this.dispose();
      return;
    }

    // パネルタイトルを更新
    const typeName = DIAGRAM_TYPE_NAMES[this.diagramType];
    this.panel.title = `${typeName} (Line ${block.startLine + 1})`;
  }

  /**
   * Webview用のHTMLを生成
   */
  private getHtmlForWebview(): string {
    const webview = this.panel.webview;

    // バンドルされたReactアプリのURI
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-dist', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'webview-dist', 'webview.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'none';
      style-src ${webview.cspSource} 'unsafe-inline';
      script-src 'nonce-${nonce}';
      font-src ${webview.cspSource};
      img-src ${webview.cspSource} data:;
    ">
    <link href="${styleUri}" rel="stylesheet">
    <title>Mermaid Diagram Editor</title>
    <style>
      html, body, #root {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    </style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * リソースの解放
   */
  private dispose(): void {
    const block = this.blockTracker.getCurrentBlock();
    const panelKey = `${this.documentUri.toString()}-${block?.startLine ?? 0}`;
    MermaidBlockEditorPanel.currentPanels.delete(panelKey);

    this.blockTracker.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.panel.dispose();
  }
}
