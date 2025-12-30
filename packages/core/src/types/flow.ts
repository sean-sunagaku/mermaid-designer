import { Node, Edge } from 'reactflow';
import { EREntity, ERRelation } from './ast';

/** エンティティノードのデータ */
export interface EntityNodeData {
  entity: EREntity;
  isSelected: boolean;
  isNewlyCreated?: boolean;
  onClearNewlyCreated?: () => void;
}

/** エンティティノードの型 */
export type EntityNode = Node<EntityNodeData, 'entity'>;

/** リレーションエッジのデータ */
export interface RelationEdgeData {
  relation: ERRelation;
  isSelected: boolean;
}

/** リレーションエッジの型 */
export type RelationEdge = Edge<RelationEdgeData>;
