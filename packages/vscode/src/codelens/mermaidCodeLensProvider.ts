import * as vscode from 'vscode';
import { MermaidBlockParser, MermaidBlockType } from './mermaidBlockParser';

/**
 * 図タイプごとの表示設定
 */
const DIAGRAM_CONFIG: Record<
  Exclude<MermaidBlockType, 'unknown'>,
  { title: string; tooltip: string }
> = {
  erDiagram: {
    title: '$(edit) Edit ER Diagram',
    tooltip: 'ビジュアルエディタでER図を編集',
  },
  flowchart: {
    title: '$(edit) Edit Flowchart',
    tooltip: 'ビジュアルエディタでフローチャートを編集',
  },
  sequenceDiagram: {
    title: '$(edit) Edit Sequence Diagram',
    tooltip: 'ビジュアルエディタでシーケンス図を編集',
  },
};

/**
 * Markdownファイル内のMermaid図ブロックにCodeLensを表示するプロバイダー
 */
export class MermaidCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  private disposables: vscode.Disposable[] = [];

  constructor() {
    // ドキュメント変更時にCodeLensを更新
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(() => {
        this._onDidChangeCodeLenses.fire();
      })
    );
  }

  /**
   * CodeLensを提供
   */
  provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = [];

    // Markdownファイルのみ対象
    if (document.languageId !== 'markdown') {
      return codeLenses;
    }

    const text = document.getText();
    const blocks = MermaidBlockParser.findBlocks(text);

    for (const block of blocks) {
      // unknownタイプはスキップ
      if (block.type === 'unknown') {
        continue;
      }

      const config = DIAGRAM_CONFIG[block.type];

      // ```mermaid の行にCodeLensを表示
      const range = new vscode.Range(
        new vscode.Position(block.startLine, 0),
        new vscode.Position(block.startLine, 0)
      );

      const codeLens = new vscode.CodeLens(range, {
        title: config.title,
        tooltip: config.tooltip,
        command: 'mermaid-er-editor.editBlock',
        arguments: [document.uri, block],
      });

      codeLenses.push(codeLens);
    }

    return codeLenses;
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this._onDidChangeCodeLenses.dispose();
  }
}
