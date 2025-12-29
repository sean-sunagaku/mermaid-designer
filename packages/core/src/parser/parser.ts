import { v4 as uuidv4 } from 'uuid';
import {
  EREntity,
  ERRelation,
  ERAttribute,
  Cardinality,
  ParseResult,
  ParseError,
} from '../types/ast';
import { Tokenizer, Token, TokenType } from './tokenizer';

/** カーディナリティ記号からCardinality型への変換 */
function parseCardinality(symbol: string): Cardinality {
  switch (symbol) {
    case '||':
      return 'EXACTLY_ONE';
    case '|o':
    case 'o|':
      return 'ZERO_OR_ONE';
    case '|{':
    case '}|':
      return 'ONE_OR_MORE';
    case 'o{':
    case '}o':
      return 'ZERO_OR_MORE';
    default:
      return 'EXACTLY_ONE';
  }
}

/** リレーション文字列をパース */
function parseRelationSymbol(relation: string): {
  sourceCardinality: Cardinality;
  targetCardinality: Cardinality;
  identifying: boolean;
} {
  // 形式: [左カーディナリティ][線][右カーディナリティ]
  // 例: ||--o{, }|..|{

  const lineMatch = relation.match(/(--|\.\.)/);
  if (!lineMatch) {
    return {
      sourceCardinality: 'EXACTLY_ONE',
      targetCardinality: 'EXACTLY_ONE',
      identifying: true,
    };
  }

  const lineIndex = lineMatch.index!;
  const lineType = lineMatch[1];
  const leftPart = relation.slice(0, lineIndex);
  const rightPart = relation.slice(lineIndex + 2);

  return {
    sourceCardinality: parseCardinality(leftPart),
    targetCardinality: parseCardinality(rightPart),
    identifying: lineType === '--',
  };
}

/** 構文解析器 */
export class Parser {
  private tokens: Token[] = [];
  private pos: number = 0;
  private errors: ParseError[] = [];
  private entities: Map<string, EREntity> = new Map();
  private relations: ERRelation[] = [];

  /** Mermaid ER Diagramをパース */
  parse(code: string): ParseResult {
    this.reset();

    const tokenizer = new Tokenizer(code);
    this.tokens = tokenizer.tokenize();

    try {
      this.parseERDiagram();

      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
        };
      }

      // エンティティに初期位置を割り当て
      const entitiesArray = Array.from(this.entities.values());
      this.assignInitialPositions(entitiesArray);

      return {
        success: true,
        diagram: {
          entities: entitiesArray,
          relations: this.relations,
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
    this.entities = new Map();
    this.relations = [];
  }

  private currentToken(): Token | undefined {
    return this.tokens[this.pos];
  }

  private advance(): Token | undefined {
    return this.tokens[this.pos++];
  }

  private check(type: TokenType): boolean {
    return this.currentToken()?.type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private skipNewlines(): void {
    while (this.match(TokenType.NEWLINE, TokenType.COMMENT)) {
      // skip
    }
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()!;
    }
    throw new Error(message);
  }

  private parseERDiagram(): void {
    this.skipNewlines();

    // erDiagram キーワードを探す
    if (this.check(TokenType.KEYWORD) && this.currentToken()?.value === 'erDiagram') {
      this.advance();
      this.skipNewlines();
    }

    // ステートメントをパース
    while (!this.check(TokenType.EOF)) {
      this.skipNewlines();
      if (this.check(TokenType.EOF)) break;

      this.parseStatement();
    }
  }

  private parseStatement(): void {
    // エンティティ定義またはリレーション
    if (this.check(TokenType.IDENTIFIER)) {
      const firstIdent = this.currentToken()!;
      this.advance();

      // 次のトークンを確認
      this.skipNewlines();

      if (this.check(TokenType.OPEN_BRACE)) {
        // エンティティ定義
        this.parseEntityDefinition(firstIdent.value);
      } else if (this.check(TokenType.RELATION)) {
        // リレーション
        this.parseRelation(firstIdent.value);
      } else {
        // 空のエンティティとして登録（属性なし）
        this.getOrCreateEntity(firstIdent.value);
      }
    } else {
      // スキップ
      this.advance();
    }
  }

  private parseEntityDefinition(entityName: string): void {
    const entity = this.getOrCreateEntity(entityName);

    this.expect(TokenType.OPEN_BRACE, `Expected '{' after entity name`);
    this.skipNewlines();

    // 属性をパース
    while (!this.check(TokenType.CLOSE_BRACE) && !this.check(TokenType.EOF)) {
      this.skipNewlines();
      if (this.check(TokenType.CLOSE_BRACE)) break;

      const attribute = this.parseAttribute();
      if (attribute) {
        entity.attributes.push(attribute);
      }

      this.skipNewlines();
    }

    this.expect(TokenType.CLOSE_BRACE, `Expected '}' at end of entity definition`);
  }

  private parseAttribute(): ERAttribute | null {
    // 形式: type name [PK|FK|UK] ["comment"]
    if (!this.check(TokenType.IDENTIFIER)) {
      this.advance();
      return null;
    }

    const typeToken = this.advance()!;

    if (!this.check(TokenType.IDENTIFIER)) {
      // 型のみ（名前なし）- エラー
      this.errors.push({
        line: typeToken.line,
        column: typeToken.column,
        message: `Expected attribute name after type '${typeToken.value}'`,
      });
      return null;
    }

    const nameToken = this.advance()!;

    const attribute: ERAttribute = {
      id: uuidv4(),
      name: nameToken.value,
      type: typeToken.value,
      isPrimaryKey: false,
      isForeignKey: false,
      isUnique: false,
      isNullable: true,
    };

    // オプションのキーをパース (PK, FK, UK)
    while (this.check(TokenType.ATTRIBUTE_KEY)) {
      const keyToken = this.advance()!;
      switch (keyToken.value) {
        case 'PK':
          attribute.isPrimaryKey = true;
          attribute.isNullable = false;
          break;
        case 'FK':
          attribute.isForeignKey = true;
          break;
        case 'UK':
          attribute.isUnique = true;
          break;
      }
    }

    // オプションのコメントをパース
    if (this.check(TokenType.STRING)) {
      attribute.comment = this.advance()!.value;
    }

    return attribute;
  }

  private parseRelation(sourceEntity: string): void {
    const relationToken = this.expect(TokenType.RELATION, 'Expected relation symbol');
    const { sourceCardinality, targetCardinality, identifying } = parseRelationSymbol(
      relationToken.value
    );

    this.skipNewlines();

    if (!this.check(TokenType.IDENTIFIER)) {
      this.errors.push({
        line: relationToken.line,
        column: relationToken.column,
        message: 'Expected target entity name after relation',
      });
      return;
    }

    const targetIdent = this.advance()!;
    const targetEntity = targetIdent.value;

    // ラベル（オプション）
    let label: string | undefined;
    this.skipNewlines();
    if (this.match(TokenType.COLON)) {
      this.skipNewlines();
      if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.STRING)) {
        label = this.advance()!.value;
      }
    }

    // エンティティを確保
    const source = this.getOrCreateEntity(sourceEntity);
    const target = this.getOrCreateEntity(targetEntity);

    // リレーションを追加
    this.relations.push({
      id: uuidv4(),
      sourceEntityId: source.id,
      targetEntityId: target.id,
      sourceCardinality,
      targetCardinality,
      label,
      identifying,
    });
  }

  private getOrCreateEntity(name: string): EREntity {
    let entity = this.entities.get(name);
    if (!entity) {
      entity = {
        id: uuidv4(),
        name,
        attributes: [],
        position: { x: 0, y: 0 },
      };
      this.entities.set(name, entity);
    }
    return entity;
  }

  private assignInitialPositions(entities: EREntity[]): void {
    // グリッドレイアウトで初期配置
    const GRID_COLS = 3;
    const X_SPACING = 300;
    const Y_SPACING = 250;
    const X_OFFSET = 50;
    const Y_OFFSET = 50;

    entities.forEach((entity, index) => {
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      entity.position = {
        x: X_OFFSET + col * X_SPACING,
        y: Y_OFFSET + row * Y_SPACING,
      };
    });
  }
}

/** Mermaid ER Diagramをパース（ヘルパー関数） */
export function parseERDiagram(code: string): ParseResult {
  const parser = new Parser();
  return parser.parse(code);
}
