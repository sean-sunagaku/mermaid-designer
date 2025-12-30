import { v4 as uuidv4 } from 'uuid';
import type { ParseError } from '../types/ast';
import type {
  FlowchartNode,
  FlowchartEdge,
  FlowchartSubgraph,
  FlowchartParseResult,
  FlowchartNodeShape,
  FlowchartLinkType,
  FlowchartDirection,
} from '../types/flowchart';

/** トークンタイプ */
enum FlowchartTokenType {
  KEYWORD = 'KEYWORD',
  DIRECTION = 'DIRECTION',
  IDENTIFIER = 'IDENTIFIER',
  LINK = 'LINK',
  LINK_TEXT = 'LINK_TEXT',
  NODE_TEXT = 'NODE_TEXT',
  SUBGRAPH = 'SUBGRAPH',
  END = 'END',
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT',
  EOF = 'EOF',
}

interface FlowchartToken {
  type: FlowchartTokenType;
  value: string;
  line: number;
  column: number;
  // ノード用追加情報
  nodeShape?: FlowchartNodeShape;
  nodeLabel?: string;
  // リンク用追加情報
  linkType?: FlowchartLinkType;
  linkLabel?: string;
}

/** フローチャート用トークナイザー */
class FlowchartTokenizer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): FlowchartToken[] {
    const tokens: FlowchartToken[] = [];

    while (this.pos < this.input.length) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push({
      type: FlowchartTokenType.EOF,
      value: '',
      line: this.line,
      column: this.column,
    });

    return tokens;
  }

  private peek(offset: number = 0): string {
    return this.input[this.pos + offset] ?? '';
  }

  private advance(): string {
    const char = this.input[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /[ \t]/.test(this.peek())) {
      this.advance();
    }
  }

  private nextToken(): FlowchartToken | null {
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return null;
    }

    const startLine = this.line;
    const startColumn = this.column;

    // 改行
    if (this.peek() === '\n') {
      this.advance();
      return {
        type: FlowchartTokenType.NEWLINE,
        value: '\n',
        line: startLine,
        column: startColumn,
      };
    }

    // コメント (%% で始まる)
    if (this.peek() === '%' && this.peek(1) === '%') {
      return this.readComment(startLine, startColumn);
    }

    // リンク（矢印）を先にチェック - 長いものから順に
    const linkToken = this.tryReadLink(startLine, startColumn);
    if (linkToken) {
      return linkToken;
    }

    // 識別子またはキーワード
    if (/[a-zA-Z_]/.test(this.peek())) {
      return this.readIdentifierOrKeyword(startLine, startColumn);
    }

    // セミコロン（文の区切り）をスキップ
    if (this.peek() === ';') {
      this.advance();
      return null;
    }

    // その他の文字をスキップ
    this.advance();
    return null;
  }

  private readComment(line: number, column: number): FlowchartToken {
    let value = '';
    while (this.pos < this.input.length && this.peek() !== '\n') {
      value += this.advance();
    }
    return {
      type: FlowchartTokenType.COMMENT,
      value,
      line,
      column,
    };
  }

  private tryReadLink(line: number, column: number): FlowchartToken | null {
    const remaining = this.input.slice(this.pos);

    // リンクパターン（長いものから順に）
    const linkPatterns: Array<{ pattern: RegExp; type: FlowchartLinkType }> = [
      // ラベル付きリンク
      { pattern: /^-->\|([^|]*)\|/, type: 'arrow' },
      { pattern: /^---\|([^|]*)\|/, type: 'open' },
      { pattern: /^-\.->\|([^|]*)\|/, type: 'dotted-arrow' },
      { pattern: /^-\.-\|([^|]*)\|/, type: 'dotted' },
      { pattern: /^==>\|([^|]*)\|/, type: 'thick-arrow' },
      { pattern: /^===\|([^|]*)\|/, type: 'thick' },
      // テキスト付きリンク（-- text -->形式）
      { pattern: /^-- ([^-]+) -->/, type: 'arrow' },
      { pattern: /^-- ([^-]+) ---/, type: 'open' },
      { pattern: /^-\. ([^-]+) \.->/, type: 'dotted-arrow' },
      // シンプルリンク
      { pattern: /^-->/, type: 'arrow' },
      { pattern: /^---/, type: 'open' },
      { pattern: /^-\.->/, type: 'dotted-arrow' },
      { pattern: /^-\.-/, type: 'dotted' },
      { pattern: /^==>/, type: 'thick-arrow' },
      { pattern: /^===/, type: 'thick' },
      { pattern: /^~~~/, type: 'invisible' },
    ];

    for (const { pattern, type } of linkPatterns) {
      const match = remaining.match(pattern);
      if (match) {
        const value = match[0];
        const label = match[1]; // キャプチャグループからラベルを取得
        for (let i = 0; i < value.length; i++) {
          this.advance();
        }
        return {
          type: FlowchartTokenType.LINK,
          value,
          line,
          column,
          linkType: type,
          linkLabel: label?.trim(),
        };
      }
    }

    return null;
  }

  private readIdentifierOrKeyword(line: number, column: number): FlowchartToken {
    let value = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }

    // キーワードチェック
    if (value === 'flowchart' || value === 'graph') {
      return {
        type: FlowchartTokenType.KEYWORD,
        value,
        line,
        column,
      };
    }

    if (value === 'subgraph') {
      return {
        type: FlowchartTokenType.SUBGRAPH,
        value,
        line,
        column,
      };
    }

    if (value === 'end') {
      return {
        type: FlowchartTokenType.END,
        value,
        line,
        column,
      };
    }

    // 方向チェック
    if (['TB', 'TD', 'BT', 'LR', 'RL'].includes(value)) {
      return {
        type: FlowchartTokenType.DIRECTION,
        value,
        line,
        column,
      };
    }

    // ノード定義をチェック（ID[text], ID{text}など）
    const nodeToken = this.tryReadNodeDefinition(value, line, column);
    if (nodeToken) {
      return nodeToken;
    }

    // 通常の識別子
    return {
      type: FlowchartTokenType.IDENTIFIER,
      value,
      line,
      column,
    };
  }

  private tryReadNodeDefinition(
    id: string,
    line: number,
    column: number
  ): FlowchartToken | null {
    this.skipWhitespace();

    const remaining = this.input.slice(this.pos);

    // ノード形状パターン（開始記号と対応する形状）
    const shapePatterns: Array<{
      start: string;
      end: string;
      shape: FlowchartNodeShape;
    }> = [
      { start: '([', end: '])', shape: 'stadium' },
      { start: '[[', end: ']]', shape: 'subroutine' },
      { start: '[(', end: ')]', shape: 'cylinder' },
      { start: '((', end: '))', shape: 'circle' },
      { start: '(((', end: ')))', shape: 'double-circle' },
      { start: '{{', end: '}}', shape: 'hexagon' },
      { start: '{', end: '}', shape: 'rhombus' },
      { start: '[/', end: '/]', shape: 'parallelogram' },
      { start: '[\\', end: '\\]', shape: 'parallelogram-alt' },
      { start: '[/', end: '\\]', shape: 'trapezoid' },
      { start: '[\\', end: '/]', shape: 'trapezoid-alt' },
      { start: '>', end: ']', shape: 'asymmetric' },
      { start: '(', end: ')', shape: 'rounded' },
      { start: '[', end: ']', shape: 'rectangle' },
    ];

    for (const { start, end, shape } of shapePatterns) {
      if (remaining.startsWith(start)) {
        // 開始記号をスキップ
        for (let i = 0; i < start.length; i++) {
          this.advance();
        }

        // 終了記号までテキストを読む
        let text = '';
        while (this.pos < this.input.length) {
          const currentRemaining = this.input.slice(this.pos);
          if (currentRemaining.startsWith(end)) {
            // 終了記号をスキップ
            for (let i = 0; i < end.length; i++) {
              this.advance();
            }
            break;
          }
          text += this.advance();
        }

        return {
          type: FlowchartTokenType.NODE_TEXT,
          value: id,
          line,
          column,
          nodeShape: shape,
          nodeLabel: text.trim(),
        };
      }
    }

    return null;
  }
}

/** フローチャートパーサー */
export class FlowchartParser {
  private tokens: FlowchartToken[] = [];
  private pos: number = 0;
  private errors: ParseError[] = [];
  private nodes: Map<string, FlowchartNode> = new Map();
  private edges: FlowchartEdge[] = [];
  private subgraphs: FlowchartSubgraph[] = [];
  private direction: FlowchartDirection = 'TD';

  parse(code: string): FlowchartParseResult {
    this.reset();

    const tokenizer = new FlowchartTokenizer(code);
    this.tokens = tokenizer.tokenize();

    try {
      this.parseFlowchart();

      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
        };
      }

      const nodesArray = Array.from(this.nodes.values());
      this.assignInitialPositions(nodesArray);

      return {
        success: true,
        diagram: {
          direction: this.direction,
          nodes: nodesArray,
          edges: this.edges,
          subgraphs: this.subgraphs,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown parse error';
      this.errors.push({
        line: this.currentToken()?.line ?? 1,
        column: this.currentToken()?.column ?? 1,
        message,
      });
      return {
        success: false,
        errors: this.errors,
      };
    }
  }

  private reset(): void {
    this.tokens = [];
    this.pos = 0;
    this.errors = [];
    this.nodes = new Map();
    this.edges = [];
    this.subgraphs = [];
    this.direction = 'TD';
  }

  private currentToken(): FlowchartToken | undefined {
    return this.tokens[this.pos];
  }

  private advance(): FlowchartToken | undefined {
    return this.tokens[this.pos++];
  }

  private check(type: FlowchartTokenType): boolean {
    return this.currentToken()?.type === type;
  }

  private match(...types: FlowchartTokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private skipNewlines(): void {
    while (this.match(FlowchartTokenType.NEWLINE, FlowchartTokenType.COMMENT)) {
      // skip
    }
  }

  private parseFlowchart(): void {
    this.skipNewlines();

    // flowchart または graph キーワード
    if (
      this.check(FlowchartTokenType.KEYWORD) &&
      (this.currentToken()?.value === 'flowchart' ||
        this.currentToken()?.value === 'graph')
    ) {
      this.advance();
      this.skipNewlines();

      // 方向を読む
      if (this.check(FlowchartTokenType.DIRECTION)) {
        this.direction = this.currentToken()!.value as FlowchartDirection;
        this.advance();
      }

      this.skipNewlines();
    }

    // ステートメントをパース
    while (!this.check(FlowchartTokenType.EOF)) {
      this.skipNewlines();
      if (this.check(FlowchartTokenType.EOF)) break;

      this.parseStatement();
    }
  }

  private parseStatement(): void {
    // サブグラフ
    if (this.check(FlowchartTokenType.SUBGRAPH)) {
      this.parseSubgraph();
      return;
    }

    // end キーワードはスキップ（サブグラフの終了として既に処理される）
    if (this.check(FlowchartTokenType.END)) {
      this.advance();
      return;
    }

    // ノード定義またはエッジ
    if (
      this.check(FlowchartTokenType.NODE_TEXT) ||
      this.check(FlowchartTokenType.IDENTIFIER)
    ) {
      this.parseNodeOrEdge();
      return;
    }

    // その他はスキップ
    this.advance();
  }

  private parseNodeOrEdge(): void {
    // 最初のノードを取得/作成
    const firstToken = this.currentToken()!;
    const firstNode = this.getOrCreateNode(firstToken);
    this.advance();

    this.skipNewlines();

    // リンクがあればエッジとして処理
    while (this.check(FlowchartTokenType.LINK)) {
      const linkToken = this.advance()!;

      this.skipNewlines();

      // ターゲットノード
      if (
        !this.check(FlowchartTokenType.NODE_TEXT) &&
        !this.check(FlowchartTokenType.IDENTIFIER)
      ) {
        this.errors.push({
          line: linkToken.line,
          column: linkToken.column,
          message: 'Expected node after link',
        });
        return;
      }

      const targetToken = this.currentToken()!;
      const targetNode = this.getOrCreateNode(targetToken);
      this.advance();

      // エッジを追加
      this.edges.push({
        id: uuidv4(),
        sourceNodeId: firstNode.id,
        targetNodeId: targetNode.id,
        linkType: linkToken.linkType ?? 'arrow',
        label: linkToken.linkLabel,
      });

      this.skipNewlines();
    }
  }

  private parseSubgraph(): void {
    this.advance(); // subgraph をスキップ
    this.skipNewlines();

    // サブグラフのラベルを読む
    let label = '';
    if (this.check(FlowchartTokenType.IDENTIFIER)) {
      label = this.currentToken()!.value;
      this.advance();
    }

    const subgraph: FlowchartSubgraph = {
      id: uuidv4(),
      label,
      nodeIds: [],
    };

    this.skipNewlines();

    // 方向（オプション）
    if (
      this.check(FlowchartTokenType.KEYWORD) &&
      this.currentToken()?.value === 'direction'
    ) {
      this.advance();
      this.skipNewlines();
      if (this.check(FlowchartTokenType.DIRECTION)) {
        subgraph.direction = this.currentToken()!.value as FlowchartDirection;
        this.advance();
      }
    }

    this.skipNewlines();

    // end まで読む
    while (
      !this.check(FlowchartTokenType.END) &&
      !this.check(FlowchartTokenType.EOF)
    ) {
      this.skipNewlines();
      if (
        this.check(FlowchartTokenType.END) ||
        this.check(FlowchartTokenType.EOF)
      ) {
        break;
      }

      // ノードまたはエッジを処理
      if (
        this.check(FlowchartTokenType.NODE_TEXT) ||
        this.check(FlowchartTokenType.IDENTIFIER)
      ) {
        const nodeToken = this.currentToken()!;
        const node = this.getOrCreateNode(nodeToken);
        subgraph.nodeIds.push(node.id);
        this.parseNodeOrEdge();
      } else {
        this.advance();
      }
    }

    // end をスキップ
    if (this.check(FlowchartTokenType.END)) {
      this.advance();
    }

    this.subgraphs.push(subgraph);
  }

  private getOrCreateNode(token: FlowchartToken): FlowchartNode {
    const id = token.value;
    let node = this.nodes.get(id);

    if (!node) {
      node = {
        id: uuidv4(),
        label:
          token.type === FlowchartTokenType.NODE_TEXT
            ? token.nodeLabel ?? id
            : id,
        shape:
          token.type === FlowchartTokenType.NODE_TEXT
            ? token.nodeShape ?? 'rectangle'
            : 'rectangle',
        position: { x: 0, y: 0 },
      };
      this.nodes.set(id, node);
    } else if (token.type === FlowchartTokenType.NODE_TEXT) {
      // ノードの定義があれば更新
      node.label = token.nodeLabel ?? node.label;
      node.shape = token.nodeShape ?? node.shape;
    }

    return node;
  }

  private assignInitialPositions(nodes: FlowchartNode[]): void {
    const isVertical = this.direction === 'TB' || this.direction === 'TD';
    const GRID_COLS = isVertical ? 3 : 5;
    const X_SPACING = isVertical ? 200 : 180;
    const Y_SPACING = isVertical ? 120 : 150;
    const X_OFFSET = 50;
    const Y_OFFSET = 50;

    nodes.forEach((node, index) => {
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      node.position = {
        x: X_OFFSET + col * X_SPACING,
        y: Y_OFFSET + row * Y_SPACING,
      };
    });
  }
}

/** Mermaid Flowchartをパース（ヘルパー関数） */
export function parseFlowchart(code: string): FlowchartParseResult {
  const parser = new FlowchartParser();
  return parser.parse(code);
}
