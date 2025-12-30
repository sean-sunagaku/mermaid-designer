import { v4 as uuidv4 } from 'uuid';
import type { ParseError } from '../types/ast';
import type {
  SequenceParticipant,
  SequenceMessage,
  SequenceNote,
  SequenceActivation,
  SequenceLoop,
  SequenceAlt,
  SequenceOpt,
  SequenceParseResult,
  SequenceParticipantType,
  SequenceMessageType,
  SequenceNotePosition,
} from '../types/sequence';

/** トークンタイプ */
enum SequenceTokenType {
  KEYWORD = 'KEYWORD',
  PARTICIPANT = 'PARTICIPANT',
  ACTOR = 'ACTOR',
  MESSAGE_ARROW = 'MESSAGE_ARROW',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  COLON = 'COLON',
  COMMA = 'COMMA',
  NOTE = 'NOTE',
  OVER = 'OVER',
  LEFT_OF = 'LEFT_OF',
  RIGHT_OF = 'RIGHT_OF',
  LOOP = 'LOOP',
  ALT = 'ALT',
  ELSE = 'ELSE',
  OPT = 'OPT',
  END = 'END',
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  AS = 'AS',
  NEWLINE = 'NEWLINE',
  COMMENT = 'COMMENT',
  EOF = 'EOF',
}

interface SequenceToken {
  type: SequenceTokenType;
  value: string;
  line: number;
  column: number;
  messageType?: SequenceMessageType;
}

/** シーケンス図用トークナイザー */
class SequenceTokenizer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): SequenceToken[] {
    const tokens: SequenceToken[] = [];

    while (this.pos < this.input.length) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push({
      type: SequenceTokenType.EOF,
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

  private nextToken(): SequenceToken | null {
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
        type: SequenceTokenType.NEWLINE,
        value: '\n',
        line: startLine,
        column: startColumn,
      };
    }

    // コメント (%% で始まる)
    if (this.peek() === '%' && this.peek(1) === '%') {
      return this.readComment(startLine, startColumn);
    }

    // コロン
    if (this.peek() === ':') {
      this.advance();
      return {
        type: SequenceTokenType.COLON,
        value: ':',
        line: startLine,
        column: startColumn,
      };
    }

    // カンマ
    if (this.peek() === ',') {
      this.advance();
      return {
        type: SequenceTokenType.COMMA,
        value: ',',
        line: startLine,
        column: startColumn,
      };
    }

    // メッセージ矢印を先にチェック
    const arrowToken = this.tryReadArrow(startLine, startColumn);
    if (arrowToken) {
      return arrowToken;
    }

    // 文字列（ダブルクォート）
    if (this.peek() === '"') {
      return this.readString(startLine, startColumn);
    }

    // 識別子またはキーワード
    if (/[a-zA-Z_]/.test(this.peek())) {
      return this.readIdentifierOrKeyword(startLine, startColumn);
    }

    // その他の文字をスキップ
    this.advance();
    return null;
  }

  private readComment(line: number, column: number): SequenceToken {
    let value = '';
    while (this.pos < this.input.length && this.peek() !== '\n') {
      value += this.advance();
    }
    return {
      type: SequenceTokenType.COMMENT,
      value,
      line,
      column,
    };
  }

  private readString(line: number, column: number): SequenceToken {
    this.advance(); // 開始クォートをスキップ
    let value = '';
    while (this.pos < this.input.length && this.peek() !== '"') {
      if (this.peek() === '\n') break;
      value += this.advance();
    }
    if (this.peek() === '"') {
      this.advance(); // 終了クォートをスキップ
    }
    return {
      type: SequenceTokenType.STRING,
      value,
      line,
      column,
    };
  }

  private tryReadArrow(line: number, column: number): SequenceToken | null {
    const remaining = this.input.slice(this.pos);

    // メッセージ矢印パターン（長いものから順に）
    const arrowPatterns: Array<{ pattern: string; type: SequenceMessageType }> = [
      { pattern: '-->>', type: 'dotted-arrow' },
      { pattern: '--)', type: 'dotted-open' },
      { pattern: '--x', type: 'dotted-cross' },
      { pattern: '->>', type: 'solid-arrow' },
      { pattern: '-)', type: 'solid-open' },
      { pattern: '-x', type: 'solid-cross' },
      { pattern: '-->', type: 'dotted' },
      { pattern: '->', type: 'solid' },
    ];

    for (const { pattern, type } of arrowPatterns) {
      if (remaining.startsWith(pattern)) {
        for (let i = 0; i < pattern.length; i++) {
          this.advance();
        }
        return {
          type: SequenceTokenType.MESSAGE_ARROW,
          value: pattern,
          line,
          column,
          messageType: type,
        };
      }
    }

    return null;
  }

  private readIdentifierOrKeyword(line: number, column: number): SequenceToken {
    let value = '';
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }

    // キーワードチェック
    const keywordMap: Record<string, SequenceTokenType> = {
      sequenceDiagram: SequenceTokenType.KEYWORD,
      participant: SequenceTokenType.PARTICIPANT,
      actor: SequenceTokenType.ACTOR,
      Note: SequenceTokenType.NOTE,
      over: SequenceTokenType.OVER,
      left: SequenceTokenType.LEFT_OF,
      right: SequenceTokenType.RIGHT_OF,
      of: SequenceTokenType.IDENTIFIER, // "of" は "left of" / "right of" の一部
      loop: SequenceTokenType.LOOP,
      alt: SequenceTokenType.ALT,
      else: SequenceTokenType.ELSE,
      opt: SequenceTokenType.OPT,
      end: SequenceTokenType.END,
      activate: SequenceTokenType.ACTIVATE,
      deactivate: SequenceTokenType.DEACTIVATE,
      as: SequenceTokenType.AS,
    };

    const tokenType = keywordMap[value] ?? SequenceTokenType.IDENTIFIER;

    return {
      type: tokenType,
      value,
      line,
      column,
    };
  }
}

/** シーケンス図パーサー */
export class SequenceParser {
  private tokens: SequenceToken[] = [];
  private pos: number = 0;
  private errors: ParseError[] = [];
  private participants: Map<string, SequenceParticipant> = new Map();
  private messages: SequenceMessage[] = [];
  private notes: SequenceNote[] = [];
  private activations: SequenceActivation[] = [];
  private loops: SequenceLoop[] = [];
  private alts: SequenceAlt[] = [];
  private opts: SequenceOpt[] = [];
  private orderCounter: number = 0;

  parse(code: string): SequenceParseResult {
    this.reset();

    const tokenizer = new SequenceTokenizer(code);
    this.tokens = tokenizer.tokenize();

    try {
      this.parseSequenceDiagram();

      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
        };
      }

      return {
        success: true,
        diagram: {
          participants: Array.from(this.participants.values()).sort(
            (a, b) => a.order - b.order
          ),
          messages: this.messages,
          notes: this.notes,
          activations: this.activations,
          loops: this.loops,
          alts: this.alts,
          opts: this.opts,
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown parse error';
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
    this.participants = new Map();
    this.messages = [];
    this.notes = [];
    this.activations = [];
    this.loops = [];
    this.alts = [];
    this.opts = [];
    this.orderCounter = 0;
  }

  private currentToken(): SequenceToken | undefined {
    return this.tokens[this.pos];
  }

  private advance(): SequenceToken | undefined {
    return this.tokens[this.pos++];
  }

  private check(type: SequenceTokenType): boolean {
    return this.currentToken()?.type === type;
  }

  private match(...types: SequenceTokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private skipNewlines(): void {
    while (this.match(SequenceTokenType.NEWLINE, SequenceTokenType.COMMENT)) {
      // skip
    }
  }

  private parseSequenceDiagram(): void {
    this.skipNewlines();

    // sequenceDiagram キーワード
    if (
      this.check(SequenceTokenType.KEYWORD) &&
      this.currentToken()?.value === 'sequenceDiagram'
    ) {
      this.advance();
      this.skipNewlines();
    }

    // ステートメントをパース
    while (!this.check(SequenceTokenType.EOF)) {
      this.skipNewlines();
      if (this.check(SequenceTokenType.EOF)) break;

      this.parseStatement();
    }
  }

  private parseStatement(): void {
    // participant 定義
    if (this.check(SequenceTokenType.PARTICIPANT)) {
      this.parseParticipant('participant');
      return;
    }

    // actor 定義
    if (this.check(SequenceTokenType.ACTOR)) {
      this.parseParticipant('actor');
      return;
    }

    // Note
    if (this.check(SequenceTokenType.NOTE)) {
      this.parseNote();
      return;
    }

    // loop
    if (this.check(SequenceTokenType.LOOP)) {
      this.parseLoop();
      return;
    }

    // alt
    if (this.check(SequenceTokenType.ALT)) {
      this.parseAlt();
      return;
    }

    // opt
    if (this.check(SequenceTokenType.OPT)) {
      this.parseOpt();
      return;
    }

    // activate
    if (this.check(SequenceTokenType.ACTIVATE)) {
      this.parseActivate();
      return;
    }

    // deactivate
    if (this.check(SequenceTokenType.DEACTIVATE)) {
      this.parseDeactivate();
      return;
    }

    // end
    if (this.check(SequenceTokenType.END)) {
      this.advance();
      return;
    }

    // メッセージ（識別子で始まる）
    if (this.check(SequenceTokenType.IDENTIFIER)) {
      this.parseMessage();
      return;
    }

    // その他はスキップ
    this.advance();
  }

  private parseParticipant(type: SequenceParticipantType): void {
    this.advance(); // participant/actor をスキップ
    this.skipNewlines();

    if (!this.check(SequenceTokenType.IDENTIFIER)) {
      this.errors.push({
        line: this.currentToken()?.line ?? 1,
        column: this.currentToken()?.column ?? 1,
        message: `Expected identifier after ${type}`,
      });
      return;
    }

    const nameToken = this.advance()!;
    let name = nameToken.value;
    let alias: string | undefined;

    this.skipNewlines();

    // as キーワード
    if (this.check(SequenceTokenType.AS)) {
      this.advance();
      this.skipNewlines();

      if (
        this.check(SequenceTokenType.IDENTIFIER) ||
        this.check(SequenceTokenType.STRING)
      ) {
        alias = name;
        name = this.advance()!.value;
      }
    }

    this.getOrCreateParticipant(alias ?? name, type, name, alias);
  }

  private parseMessage(): void {
    const sourceToken = this.advance()!;
    const source = this.getOrCreateParticipant(sourceToken.value);

    this.skipNewlines();

    if (!this.check(SequenceTokenType.MESSAGE_ARROW)) {
      // メッセージではない - 戻る
      return;
    }

    const arrowToken = this.advance()!;
    const messageType = arrowToken.messageType ?? 'solid';

    this.skipNewlines();

    if (!this.check(SequenceTokenType.IDENTIFIER)) {
      this.errors.push({
        line: arrowToken.line,
        column: arrowToken.column,
        message: 'Expected target participant after arrow',
      });
      return;
    }

    const targetToken = this.advance()!;
    const target = this.getOrCreateParticipant(targetToken.value);

    // ラベル（コロンの後）
    let label = '';
    this.skipNewlines();
    if (this.check(SequenceTokenType.COLON)) {
      this.advance();
      label = this.readRestOfLine();
    }

    this.messages.push({
      id: uuidv4(),
      sourceParticipantId: source.id,
      targetParticipantId: target.id,
      type: messageType,
      label: label.trim(),
      order: this.orderCounter++,
    });
  }

  private parseNote(): void {
    this.advance(); // Note をスキップ
    this.skipNewlines();

    let position: SequenceNotePosition = 'over';
    const participantIds: string[] = [];

    // 位置
    if (this.check(SequenceTokenType.LEFT_OF)) {
      this.advance();
      this.skipNewlines();
      if (
        this.check(SequenceTokenType.IDENTIFIER) &&
        this.currentToken()?.value === 'of'
      ) {
        this.advance();
      }
      position = 'left of';
    } else if (this.check(SequenceTokenType.RIGHT_OF)) {
      this.advance();
      this.skipNewlines();
      if (
        this.check(SequenceTokenType.IDENTIFIER) &&
        this.currentToken()?.value === 'of'
      ) {
        this.advance();
      }
      position = 'right of';
    } else if (this.check(SequenceTokenType.OVER)) {
      this.advance();
      position = 'over';
    }

    this.skipNewlines();

    // 参加者
    while (this.check(SequenceTokenType.IDENTIFIER)) {
      const participantToken = this.advance()!;
      const participant = this.getOrCreateParticipant(participantToken.value);
      participantIds.push(participant.id);

      this.skipNewlines();
      if (this.check(SequenceTokenType.COMMA)) {
        this.advance();
        this.skipNewlines();
      } else {
        break;
      }
    }

    // テキスト（コロンの後）
    let text = '';
    if (this.check(SequenceTokenType.COLON)) {
      this.advance();
      text = this.readRestOfLine();
    }

    this.notes.push({
      id: uuidv4(),
      text: text.trim(),
      position,
      participantIds,
      order: this.orderCounter++,
    });
  }

  private parseLoop(): void {
    this.advance(); // loop をスキップ
    const label = this.readRestOfLine();
    const startOrder = this.orderCounter;

    this.skipNewlines();

    // end まで読む
    let depth = 1;
    while (depth > 0 && !this.check(SequenceTokenType.EOF)) {
      this.skipNewlines();
      if (this.check(SequenceTokenType.EOF)) break;

      if (
        this.check(SequenceTokenType.LOOP) ||
        this.check(SequenceTokenType.ALT) ||
        this.check(SequenceTokenType.OPT)
      ) {
        depth++;
      }
      if (this.check(SequenceTokenType.END)) {
        depth--;
        if (depth === 0) {
          this.advance();
          break;
        }
      }

      this.parseStatement();
    }

    this.loops.push({
      id: uuidv4(),
      label: label.trim(),
      startOrder,
      endOrder: this.orderCounter,
    });
  }

  private parseAlt(): void {
    this.advance(); // alt をスキップ
    const firstLabel = this.readRestOfLine();

    const conditions: Array<{
      label: string;
      startOrder: number;
      endOrder: number;
    }> = [];
    let currentStartOrder = this.orderCounter;

    this.skipNewlines();

    // end まで読む
    let depth = 1;
    while (depth > 0 && !this.check(SequenceTokenType.EOF)) {
      this.skipNewlines();
      if (this.check(SequenceTokenType.EOF)) break;

      if (
        this.check(SequenceTokenType.LOOP) ||
        this.check(SequenceTokenType.ALT) ||
        this.check(SequenceTokenType.OPT)
      ) {
        depth++;
      }

      if (this.check(SequenceTokenType.ELSE) && depth === 1) {
        // 現在の条件を保存
        conditions.push({
          label: firstLabel.trim() || conditions.length === 0 ? firstLabel.trim() : '',
          startOrder: currentStartOrder,
          endOrder: this.orderCounter,
        });

        this.advance(); // else をスキップ
        currentStartOrder = this.orderCounter;
        continue;
      }

      if (this.check(SequenceTokenType.END)) {
        depth--;
        if (depth === 0) {
          // 最後の条件を保存
          conditions.push({
            label: conditions.length === 0 ? firstLabel.trim() : '',
            startOrder: currentStartOrder,
            endOrder: this.orderCounter,
          });
          this.advance();
          break;
        }
      }

      this.parseStatement();
    }

    this.alts.push({
      id: uuidv4(),
      conditions,
    });
  }

  private parseOpt(): void {
    this.advance(); // opt をスキップ
    const label = this.readRestOfLine();
    const startOrder = this.orderCounter;

    this.skipNewlines();

    // end まで読む
    let depth = 1;
    while (depth > 0 && !this.check(SequenceTokenType.EOF)) {
      this.skipNewlines();
      if (this.check(SequenceTokenType.EOF)) break;

      if (
        this.check(SequenceTokenType.LOOP) ||
        this.check(SequenceTokenType.ALT) ||
        this.check(SequenceTokenType.OPT)
      ) {
        depth++;
      }
      if (this.check(SequenceTokenType.END)) {
        depth--;
        if (depth === 0) {
          this.advance();
          break;
        }
      }

      this.parseStatement();
    }

    this.opts.push({
      id: uuidv4(),
      label: label.trim(),
      startOrder,
      endOrder: this.orderCounter,
    });
  }

  private parseActivate(): void {
    this.advance(); // activate をスキップ
    this.skipNewlines();

    if (this.check(SequenceTokenType.IDENTIFIER)) {
      const participantToken = this.advance()!;
      const participant = this.getOrCreateParticipant(participantToken.value);

      this.activations.push({
        id: uuidv4(),
        participantId: participant.id,
        startOrder: this.orderCounter,
        endOrder: -1, // deactivate で設定
      });
    }
  }

  private parseDeactivate(): void {
    this.advance(); // deactivate をスキップ
    this.skipNewlines();

    if (this.check(SequenceTokenType.IDENTIFIER)) {
      const participantToken = this.advance()!;
      const participant = this.getOrCreateParticipant(participantToken.value);

      // 対応する activation を探す
      for (let i = this.activations.length - 1; i >= 0; i--) {
        if (
          this.activations[i].participantId === participant.id &&
          this.activations[i].endOrder === -1
        ) {
          this.activations[i].endOrder = this.orderCounter;
          break;
        }
      }
    }
  }

  private readRestOfLine(): string {
    let text = '';
    while (
      this.pos < this.tokens.length &&
      !this.check(SequenceTokenType.NEWLINE) &&
      !this.check(SequenceTokenType.EOF)
    ) {
      const token = this.advance()!;
      text += token.value + ' ';
    }
    return text.trim();
  }

  private getOrCreateParticipant(
    name: string,
    type: SequenceParticipantType = 'participant',
    displayName?: string,
    alias?: string
  ): SequenceParticipant {
    let participant = this.participants.get(name);

    if (!participant) {
      participant = {
        id: uuidv4(),
        type,
        name: displayName ?? name,
        alias,
        order: this.participants.size,
      };
      this.participants.set(name, participant);
    }

    return participant;
  }
}

/** Mermaid Sequence Diagramをパース（ヘルパー関数） */
export function parseSequenceDiagram(code: string): SequenceParseResult {
  const parser = new SequenceParser();
  return parser.parse(code);
}
