import { ERDiagram, EREntity, ERRelation, Cardinality, GeneratorOptions } from '../types/ast';

/** カーディナリティをMermaid記号に変換 */
function cardinalityToSymbol(cardinality: Cardinality, isLeft: boolean): string {
  // isLeft: true = 左側のエンティティ（ソース）、記号は } や | が線側
  // isLeft: false = 右側のエンティティ（ターゲット）、記号は { や | が線側
  switch (cardinality) {
    case 'EXACTLY_ONE':
      return '||';
    case 'ZERO_OR_ONE':
      return isLeft ? 'o|' : '|o';
    case 'ONE_OR_MORE':
      return isLeft ? '}|' : '|{';
    case 'ZERO_OR_MORE':
      return isLeft ? '}o' : 'o{';
    default:
      return '||';
  }
}

/** リレーション線の種類を取得 */
function getRelationLine(identifying: boolean): string {
  return identifying ? '--' : '..';
}

/** 属性行を生成 */
function generateAttributeLine(
  type: string,
  name: string,
  keys: string[],
  comment?: string
): string {
  let line = `        ${type} ${name}`;
  if (keys.length > 0) {
    line += ` ${keys.join(' ')}`;
  }
  if (comment) {
    line += ` "${comment}"`;
  }
  return line;
}

/** エンティティを生成 */
function generateEntity(entity: EREntity, _options: GeneratorOptions): string {
  const lines: string[] = [];

  // 属性がある場合のみブロックを生成
  if (entity.attributes.length > 0) {
    lines.push(`    ${entity.name} {`);

    for (const attr of entity.attributes) {
      const keys: string[] = [];
      if (attr.isPrimaryKey) keys.push('PK');
      if (attr.isForeignKey) keys.push('FK');
      if (attr.isUnique && !attr.isPrimaryKey) keys.push('UK');

      lines.push(generateAttributeLine(attr.type, attr.name, keys, attr.comment));
    }

    lines.push('    }');
  }

  return lines.join('\n');
}

/** リレーションを生成 */
function generateRelation(
  relation: ERRelation,
  entityMap: Map<string, EREntity>
): string | null {
  const sourceEntity = entityMap.get(relation.sourceEntityId);
  const targetEntity = entityMap.get(relation.targetEntityId);

  if (!sourceEntity || !targetEntity) {
    return null;
  }

  const leftSymbol = cardinalityToSymbol(relation.sourceCardinality, true);
  const rightSymbol = cardinalityToSymbol(relation.targetCardinality, false);
  const line = getRelationLine(relation.identifying);

  let relationStr = `    ${sourceEntity.name} ${leftSymbol}${line}${rightSymbol} ${targetEntity.name}`;

  if (relation.label) {
    relationStr += ` : ${relation.label}`;
  }

  return relationStr;
}

/** ER Diagramを生成 */
export function generateERDiagram(diagram: ERDiagram, options: GeneratorOptions = {}): string {
  const lines: string[] = ['erDiagram'];

  // エンティティをアルファベット順にソート
  const sortedEntities = [...diagram.entities].sort((a, b) => a.name.localeCompare(b.name));

  // エンティティマップを作成
  const entityMap = new Map<string, EREntity>();
  for (const entity of diagram.entities) {
    entityMap.set(entity.id, entity);
  }

  // リレーションを先に生成（Mermaidの慣習）
  for (const relation of diagram.relations) {
    const relationLine = generateRelation(relation, entityMap);
    if (relationLine) {
      lines.push(relationLine);
    }
  }

  // エンティティ定義を生成
  for (const entity of sortedEntities) {
    const entityBlock = generateEntity(entity, options);
    if (entityBlock) {
      lines.push(entityBlock);
    }
  }

  return lines.join('\n');
}
