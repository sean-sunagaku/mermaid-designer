import * as vscode from 'vscode';
import { MermaidBlock, MermaidBlockParser } from '../codelens';

/**
 * ドキュメント変更時にMermaidブロックの位置を追跡するクラス
 */
export class BlockTracker implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private currentBlock: MermaidBlock | null = null;
  private blockIndex: number = 0;

  constructor(
    private readonly documentUri: vscode.Uri,
    initialBlock: MermaidBlock,
    private readonly onBlockChanged: (block: MermaidBlock | null) => void
  ) {
    this.currentBlock = initialBlock;
    this.blockIndex = this.findBlockIndex(initialBlock);

    // ドキュメント変更を監視
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.toString() === this.documentUri.toString()) {
          this.updateBlockPosition(e.document);
        }
      })
    );
  }

  /**
   * ブロックのインデックスを検索
   */
  private findBlockIndex(block: MermaidBlock): number {
    const document = vscode.workspace.textDocuments.find(
      (d) => d.uri.toString() === this.documentUri.toString()
    );
    if (!document) return 0;

    const blocks = MermaidBlockParser.findERBlocks(document.getText());
    return blocks.findIndex(
      (b) => b.startLine === block.startLine && b.content === block.content
    );
  }

  /**
   * ドキュメント変更後にブロック位置を更新
   */
  private updateBlockPosition(document: vscode.TextDocument): void {
    const blocks = MermaidBlockParser.findERBlocks(document.getText());

    if (blocks.length === 0) {
      // すべてのブロックが削除された
      this.currentBlock = null;
      this.onBlockChanged(null);
      return;
    }

    // インデックスでブロックを探す
    if (this.blockIndex >= 0 && this.blockIndex < blocks.length) {
      this.currentBlock = blocks[this.blockIndex];
    } else if (blocks.length > 0) {
      // ブロックが削除された可能性があるため、最後のブロックを使用
      this.currentBlock = blocks[blocks.length - 1];
      this.blockIndex = blocks.length - 1;
    } else {
      this.currentBlock = null;
    }

    this.onBlockChanged(this.currentBlock);
  }

  /**
   * 現在のブロックを取得
   */
  getCurrentBlock(): MermaidBlock | null {
    return this.currentBlock;
  }

  /**
   * ブロックインデックスを更新（外部から内容が変更された場合）
   */
  updateBlockIndex(newIndex: number): void {
    this.blockIndex = newIndex;
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
