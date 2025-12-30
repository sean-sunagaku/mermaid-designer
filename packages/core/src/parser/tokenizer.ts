/** トークンの種類 */
export enum TokenType {
  KEYWORD = 'KEYWORD', // erDiagram
  IDENTIFIER = 'IDENTIFIER', // エンティティ名、属性名
  OPEN_BRACE = 'OPEN_BRACE', // {
  CLOSE_BRACE = 'CLOSE_BRACE', // }
  RELATION = 'RELATION', // ||--o{, }|..|{, etc.
  COLON = 'COLON', // :
  STRING = 'STRING', // "quoted string"
  ATTRIBUTE_KEY = 'ATTRIBUTE_KEY', // PK, FK, UK
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  COMMENT = 'COMMENT', // %% comment
}

/** トークン */
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

/** カーディナリティパターン */
const CARDINALITY_PATTERNS = [
  '||', // exactly one
  '|o', // zero or one (left)
  'o|', // zero or one (right)
  '}|', // one or more (right)
  '|{', // one or more (left)
  '}o', // zero or more (right)
  'o{', // zero or more (left)
];

/** リレーション線のパターン */
const RELATION_LINE_PATTERNS = ['--', '..'];

/** 字句解析器 */
export class Tokenizer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  /** すべてのトークンを取得 */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column,
    });

    return tokens;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.input.length;
  }

  private peek(offset: number = 0): string {
    return this.input[this.pos + offset] || '';
  }

  private advance(): string {
    const char = this.input[this.pos];
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\t' || char === '\r') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private nextToken(): Token | null {
    const startLine = this.line;
    const startColumn = this.column;

    // コメント
    if (this.peek() === '%' && this.peek(1) === '%') {
      return this.readComment(startLine, startColumn);
    }

    // 改行
    if (this.peek() === '\n') {
      this.advance();
      return {
        type: TokenType.NEWLINE,
        value: '\n',
        line: startLine,
        column: startColumn,
      };
    }

    // 波括弧
    if (this.peek() === '{') {
      this.advance();
      return {
        type: TokenType.OPEN_BRACE,
        value: '{',
        line: startLine,
        column: startColumn,
      };
    }

    if (this.peek() === '}') {
      // リレーションの一部かもしれない
      const relation = this.tryReadRelation(startLine, startColumn);
      if (relation) return relation;

      this.advance();
      return {
        type: TokenType.CLOSE_BRACE,
        value: '}',
        line: startLine,
        column: startColumn,
      };
    }

    // コロン
    if (this.peek() === ':') {
      this.advance();
      return {
        type: TokenType.COLON,
        value: ':',
        line: startLine,
        column: startColumn,
      };
    }

    // クォート文字列
    if (this.peek() === '"') {
      return this.readString(startLine, startColumn);
    }

    // リレーション
    const relation = this.tryReadRelation(startLine, startColumn);
    if (relation) return relation;

    // 識別子またはキーワード
    if (this.isIdentifierStart(this.peek())) {
      return this.readIdentifier(startLine, startColumn);
    }

    // 不明な文字はスキップ
    this.advance();
    return null;
  }

  private readComment(startLine: number, startColumn: number): Token {
    let value = '';
    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance();
    }
    return {
      type: TokenType.COMMENT,
      value,
      line: startLine,
      column: startColumn,
    };
  }

  private readString(startLine: number, startColumn: number): Token {
    this.advance(); // skip opening quote
    let value = '';
    while (!this.isAtEnd() && this.peek() !== '"' && this.peek() !== '\n') {
      value += this.advance();
    }
    if (this.peek() === '"') {
      this.advance(); // skip closing quote
    }
    return {
      type: TokenType.STRING,
      value,
      line: startLine,
      column: startColumn,
    };
  }

  private tryReadRelation(
    startLine: number,
    startColumn: number
  ): Token | null {
    // リレーションパターンを探す
    // 形式: [左カーディナリティ][線][右カーディナリティ]
    // 例: ||--o{, }|..|{, |o--||

    const remaining = this.input.slice(this.pos);

    // パターンマッチング
    for (const leftCard of CARDINALITY_PATTERNS) {
      for (const line of RELATION_LINE_PATTERNS) {
        for (const rightCard of CARDINALITY_PATTERNS) {
          const pattern = leftCard + line + rightCard;
          if (remaining.startsWith(pattern)) {
            for (let i = 0; i < pattern.length; i++) {
              this.advance();
            }
            return {
              type: TokenType.RELATION,
              value: pattern,
              line: startLine,
              column: startColumn,
            };
          }
        }
      }
    }

    return null;
  }

  private readIdentifier(startLine: number, startColumn: number): Token {
    let value = '';
    while (!this.isAtEnd() && this.isIdentifierChar(this.peek())) {
      value += this.advance();
    }

    // キーワードチェック
    if (value === 'erDiagram') {
      return {
        type: TokenType.KEYWORD,
        value,
        line: startLine,
        column: startColumn,
      };
    }

    // 属性キーチェック
    if (['PK', 'FK', 'UK'].includes(value.toUpperCase())) {
      return {
        type: TokenType.ATTRIBUTE_KEY,
        value: value.toUpperCase(),
        line: startLine,
        column: startColumn,
      };
    }

    return {
      type: TokenType.IDENTIFIER,
      value,
      line: startLine,
      column: startColumn,
    };
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }
}
