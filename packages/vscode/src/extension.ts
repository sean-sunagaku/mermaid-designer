import * as vscode from 'vscode';
import { EREditorProvider } from './provider';
import { MermaidCodeLensProvider, MermaidBlock } from './codelens';
import { MermaidBlockEditorPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {
  // カスタムエディタプロバイダーを登録
  context.subscriptions.push(EREditorProvider.register(context));

  // CodeLensプロバイダーを登録（Markdownファイル用）
  const codeLensProvider = new MermaidCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: 'markdown', scheme: 'file' },
      codeLensProvider
    )
  );
  context.subscriptions.push(codeLensProvider);

  // Mermaidブロック編集コマンドを登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-er-editor.editBlock',
      (documentUri: vscode.Uri, block: MermaidBlock) => {
        MermaidBlockEditorPanel.createOrShow(
          context.extensionUri,
          documentUri,
          block
        );
      }
    )
  );

  // コマンドを登録
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'mermaid-er-editor.newDiagram',
      async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          vscode.window.showErrorMessage('Please open a workspace first');
          return;
        }

        const fileName = await vscode.window.showInputBox({
          prompt: 'Enter the file name for the new ER diagram',
          value: 'diagram.er.md',
        });

        if (!fileName) return;

        const filePath = vscode.Uri.joinPath(workspaceFolders[0].uri, fileName);

        const defaultContent = `erDiagram
    %% Create your ER diagram here
    ENTITY_NAME {
        int id PK
        string name
    }
`;

        await vscode.workspace.fs.writeFile(
          filePath,
          Buffer.from(defaultContent, 'utf-8')
        );
        await vscode.commands.executeCommand(
          'vscode.openWith',
          filePath,
          'mermaid-er-editor.erDiagram'
        );
      }
    )
  );
}

export function deactivate() {
  // すべてのパネルをクリーンアップ
  MermaidBlockEditorPanel.disposeAll();
}
