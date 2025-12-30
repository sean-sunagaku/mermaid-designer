import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeChange,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useERStore } from '../store';
import { EntityNode } from '../nodes/EntityNode';
import { RelationEdge } from '../edges/RelationEdge';
import { EntityNodeData } from '../types/flow';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
};

const edgeTypes: EdgeTypes = {
  relation: RelationEdge,
};

export const Canvas: React.FC = () => {
  const {
    entities,
    relations,
    selectedEntityId,
    selectedRelationId,
    moveEntity,
    selectEntity,
    selectRelation,
    clearSelection,
    addRelation,
  } = useERStore();

  // エンティティをReact Flowノードに変換
  const nodes: Node<EntityNodeData>[] = useMemo(() => {
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entity',
      position: entity.position,
      data: {
        entity,
        isSelected: entity.id === selectedEntityId,
      },
      selected: entity.id === selectedEntityId,
    }));
  }, [entities, selectedEntityId]);

  // リレーションをReact Flowエッジに変換
  const edges: Edge[] = useMemo(() => {
    return relations.map((relation) => ({
      id: relation.id,
      source: relation.sourceEntityId,
      target: relation.targetEntityId,
      sourceHandle: relation.sourceHandle,
      targetHandle: relation.targetHandle,
      type: 'relation',
      data: {
        relation,
        isSelected: relation.id === selectedRelationId,
      },
      selected: relation.id === selectedRelationId,
    }));
  }, [relations, selectedRelationId]);

  // ノードの変更（移動など）
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          moveEntity(change.id, change.position);
        }
      });
    },
    [moveEntity]
  );

  // エッジの変更
  const onEdgesChange = useCallback(() => {
    // エッジの変更はストアで管理
  }, []);

  // 新しい接続
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // 同じエンティティ間に既に接続がある場合は追加しない
        const existingRelation = relations.find(
          (r) =>
            (r.sourceEntityId === connection.source && r.targetEntityId === connection.target) ||
            (r.sourceEntityId === connection.target && r.targetEntityId === connection.source)
        );
        if (existingRelation) {
          return; // 既に接続済み
        }

        addRelation({
          sourceEntityId: connection.source,
          targetEntityId: connection.target,
          sourceHandle: connection.sourceHandle || undefined,
          targetHandle: connection.targetHandle || undefined,
        });
      }
    },
    [addRelation, relations]
  );

  // ノードのクリック
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectEntity(node.id);
    },
    [selectEntity]
  );

  // エッジのクリック
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectRelation(edge.id);
    },
    [selectRelation]
  );

  // 背景のクリック
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="canvas flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'relation',
        }}
      >
        <Background color="#e2e8f0" gap={15} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return node.selected ? '#3b82f6' : '#94a3b8';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
