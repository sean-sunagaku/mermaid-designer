import * as vscode from 'vscode';

export class EREditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = 'mermaid-er-editor.erDiagram';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new EREditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      EREditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
  }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Webviewの設定
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    // HTMLを設定
    webviewPanel.webview.html = this.getHtmlForWebview(
      webviewPanel.webview,
      document.getText()
    );

    // ドキュメントの変更を監視
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          this.updateWebview(webviewPanel.webview, e.document.getText());
        }
      }
    );

    // Webviewからのメッセージを処理
    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case 'update':
          this.updateDocument(document, message.content);
          break;
        case 'ready':
          this.updateWebview(webviewPanel.webview, document.getText());
          break;
      }
    });

    // クリーンアップ
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });
  }

  private updateWebview(webview: vscode.Webview, content: string) {
    webview.postMessage({
      type: 'load',
      content,
    });
  }

  private async updateDocument(document: vscode.TextDocument, content: string) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      content
    );
    await vscode.workspace.applyEdit(edit);
  }

  private getHtmlForWebview(_webview: vscode.Webview, content: string): string {
    const escapedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid ER Diagram Editor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            padding: 8px 16px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .header h1 {
            font-size: 14px;
            font-weight: 500;
        }
        .main {
            flex: 1;
            display: flex;
            overflow: hidden;
        }
        .code-panel {
            width: 40%;
            border-right: 1px solid var(--vscode-panel-border);
            display: flex;
            flex-direction: column;
        }
        .code-panel-header {
            padding: 8px 12px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            font-size: 12px;
            font-weight: 500;
        }
        .code-editor {
            flex: 1;
            padding: 12px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            border: none;
            resize: none;
            outline: none;
        }
        .preview-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .preview-panel-header {
            padding: 8px 12px;
            background-color: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            font-size: 12px;
            font-weight: 500;
        }
        .preview-content {
            flex: 1;
            padding: 16px;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .preview-placeholder {
            text-align: center;
            color: var(--vscode-descriptionForeground);
        }
        .preview-placeholder p {
            margin-bottom: 8px;
        }
        .status-bar {
            padding: 4px 12px;
            background-color: var(--vscode-statusBar-background);
            color: var(--vscode-statusBar-foreground);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Mermaid ER Diagram Editor</h1>
    </div>
    <div class="main">
        <div class="code-panel">
            <div class="code-panel-header">Mermaid Code</div>
            <textarea class="code-editor" id="codeEditor" spellcheck="false">${escapedContent}</textarea>
        </div>
        <div class="preview-panel">
            <div class="preview-panel-header">Preview</div>
            <div class="preview-content">
                <div class="preview-placeholder">
                    <p>Visual editor is loading...</p>
                    <p>Edit the code on the left to update the diagram.</p>
                </div>
            </div>
        </div>
    </div>
    <div class="status-bar">
        Ready
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const codeEditor = document.getElementById('codeEditor');
        let isUpdating = false;

        // コードエディターの変更を監視
        let debounceTimer;
        codeEditor.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (!isUpdating) {
                    vscode.postMessage({
                        type: 'update',
                        content: codeEditor.value
                    });
                }
            }, 500);
        });

        // VSCodeからのメッセージを処理
        window.addEventListener('message', (event) => {
            const message = event.data;
            switch (message.type) {
                case 'load':
                    isUpdating = true;
                    codeEditor.value = message.content;
                    isUpdating = false;
                    break;
            }
        });

        // 準備完了を通知
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
  }
}
