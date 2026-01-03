/**
 * Mermaidブロックの型定義
 */
export type MermaidBlockType =
  | 'erDiagram'
  | 'flowchart'
  | 'sequenceDiagram'
  | 'unknown';

/**
 * Mermaidブロックの情報
 */
export interface MermaidBlock {
  /** 図の種類 */
  type: MermaidBlockType;
  /** ブロック内のコンテンツ（```mermaid と ``` を除く） */
  content: string;
  /** 開始行（```mermaid の行、0-indexed） */
  startLine: number;
  /** 終了行（閉じ``` の行、0-indexed） */
  endLine: number;
  /** コンテンツ開始行（0-indexed） */
  contentStartLine: number;
  /** コンテンツ終了行（0-indexed） */
  contentEndLine: number;
}

/**
 * Markdownファイル内のMermaidブロックを検出・解析するクラス
 */
export class MermaidBlockParser {
  /**
   * テキスト内のすべてのMermaidブロックを検出
   * @param text Markdownテキスト
   * @returns 検出されたMermaidブロックの配列
   */
  static findBlocks(text: string): MermaidBlock[] {
    const blocks: MermaidBlock[] = [];
    const lines = text.split('\n');

    let inBlock = false;
    let blockStart = -1;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (!inBlock && /^```mermaid\s*$/i.test(trimmedLine)) {
        // Mermaidブロックの開始
        inBlock = true;
        blockStart = i;
        contentLines = [];
      } else if (inBlock && /^```\s*$/.test(trimmedLine)) {
        // ブロックの終了
        const content = contentLines.join('\n');
        const type = this.detectDiagramType(content);

        blocks.push({
          type,
          content,
          startLine: blockStart,
          endLine: i,
          contentStartLine: blockStart + 1,
          contentEndLine: i - 1,
        });

        inBlock = false;
        blockStart = -1;
        contentLines = [];
      } else if (inBlock) {
        contentLines.push(line);
      }
    }

    return blocks;
  }

  /**
   * Mermaidコードから図の種類を検出
   * @param content Mermaidコード
   * @returns 検出された図の種類
   */
  static detectDiagramType(content: string): MermaidBlockType {
    const trimmed = content.trim();

    if (/^erDiagram/i.test(trimmed)) {
      return 'erDiagram';
    } else if (/^(flowchart|graph)\s/i.test(trimmed)) {
      return 'flowchart';
    } else if (/^sequenceDiagram/i.test(trimmed)) {
      return 'sequenceDiagram';
    }

    return 'unknown';
  }

  /**
   * ER図ブロックのみをフィルタして返す
   * @param text Markdownテキスト
   * @returns ER図ブロックの配列
   */
  static findERBlocks(text: string): MermaidBlock[] {
    return this.findBlocks(text).filter((b) => b.type === 'erDiagram');
  }

  /**
   * 指定した行番号を含むブロックを検索
   * @param text Markdownテキスト
   * @param lineNumber 行番号（0-indexed）
   * @returns ブロック、または見つからない場合はundefined
   */
  static findBlockAtLine(
    text: string,
    lineNumber: number
  ): MermaidBlock | undefined {
    const blocks = this.findBlocks(text);
    return blocks.find(
      (b) => lineNumber >= b.startLine && lineNumber <= b.endLine
    );
  }

  /**
   * ブロックのインデックスを検索（同じ開始行と内容で照合）
   * @param text Markdownテキスト
   * @param block 検索対象のブロック
   * @returns インデックス、または見つからない場合は-1
   */
  static findBlockIndex(text: string, block: MermaidBlock): number {
    const blocks = this.findERBlocks(text);
    return blocks.findIndex(
      (b) => b.startLine === block.startLine && b.content === block.content
    );
  }
}
