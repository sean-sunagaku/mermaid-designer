import React, {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';
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

import { useERStore, useUndoRedo } from '../store';
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
    addEntity,
    deleteEntity,
    deleteRelation,
  } = useERStore();

  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  // 新規作成されたエンティティIDを追跡
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const newlyCreatedIdRef = useRef<string | null>(null);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // E: エンティティ追加
      if (event.key === 'e' || event.key === 'E') {
        if (!event.ctrlKey && !event.metaKey) {
          const id = addEntity();
          selectEntity(id);
          setNewlyCreatedId(id);
          newlyCreatedIdRef.current = id;
          event.preventDefault();
          return;
        }
      }

      // Ctrl/Cmd + Z: Undo
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === 'z' &&
        !event.shiftKey
      ) {
        if (canUndo()) {
          undo();
          event.preventDefault();
        }
        return;
      }

      // Ctrl/Cmd + Shift + Z または Ctrl/Cmd + Y: Redo
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))
      ) {
        if (canRedo()) {
          redo();
          event.preventDefault();
        }
        return;
      }

      // Delete/Backspace: 削除
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedEntityId) {
          deleteEntity(selectedEntityId);
          event.preventDefault();
        } else if (selectedRelationId) {
          deleteRelation(selectedRelationId);
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedEntityId,
    selectedRelationId,
    addEntity,
    deleteEntity,
    deleteRelation,
    selectEntity,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // 新規作成フラグをクリア
  const handleClearNewlyCreated = useCallback(() => {
    setNewlyCreatedId(null);
    newlyCreatedIdRef.current = null;
  }, []);

  // エンティティをReact Flowノードに変換
  const nodes: Node<EntityNodeData>[] = useMemo(() => {
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entity',
      position: entity.position,
      data: {
        entity,
        isSelected: entity.id === selectedEntityId,
        isNewlyCreated: entity.id === newlyCreatedId,
        onClearNewlyCreated: handleClearNewlyCreated,
      },
      selected: entity.id === selectedEntityId,
    }));
  }, [entities, selectedEntityId, newlyCreatedId, handleClearNewlyCreated]);

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
            (r.sourceEntityId === connection.source &&
              r.targetEntityId === connection.target) ||
            (r.sourceEntityId === connection.target &&
              r.targetEntityId === connection.source)
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
        panOnScroll
        panOnScrollSpeed={4}
        panOnDrag
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
