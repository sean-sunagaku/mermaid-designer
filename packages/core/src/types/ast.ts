/** カーディナリティ（多重度） */
export type Cardinality =
  | 'ZERO_OR_ONE' // 0..1  (|o / o|)
  | 'EXACTLY_ONE' // 1     (||)
  | 'ZERO_OR_MORE' // 0..*  (o{ / }o)
  | 'ONE_OR_MORE'; // 1..*  (|{ / }|)

/** 位置情報 */
export interface Position {
  x: number;
  y: number;
}

/** 属性（カラム）の定義 */
export interface ERAttribute {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNullable: boolean;
  comment?: string;
}

/** エンティティ（テーブル）の定義 */
export interface EREntity {
  id: string;
  name: string;
  alias?: string;
  attributes: ERAttribute[];
  position: Position;
}

/** リレーション（関係線）の定義 */
export interface ERRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  sourceCardinality: Cardinality;
  targetCardinality: Cardinality;
  label?: string;
  identifying: boolean;
}

/** ER図全体 */
export interface ERDiagram {
  entities: EREntity[];
  relations: ERRelation[];
}

/** パースエラー */
export interface ParseError {
  line: number;
  column: number;
  message: string;
}

/** パース結果 */
export interface ParseResult {
  success: boolean;
  diagram?: ERDiagram;
  errors?: ParseError[];
}

/** ジェネレーターオプション */
export interface GeneratorOptions {
  indentSize?: number;
  attributeAlignment?: boolean;
}
