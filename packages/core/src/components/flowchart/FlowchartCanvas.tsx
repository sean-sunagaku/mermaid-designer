import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFlowchartStore, useFlowchartUndoRedo } from '../../store';
import { FlowchartNode } from '../../nodes';
import { FlowEdge } from '../../edges';
import type { FlowchartNodeData, FlowchartEdgeData } from '../../types/flowchart';

const nodeTypes = {
  flowchart: FlowchartNode,
};

const edgeTypes = {
  flow: FlowEdge,
};

export const FlowchartCanvas = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    moveNode,
    addEdge,
    deleteNode,
    deleteEdge,
    selectNode,
    selectEdge,
    clearSelection,
  } = useFlowchartStore();

  const { undo, redo, canUndo, canRedo } = useFlowchartUndoRedo();

  // キーボードイベント
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合は無視
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        if (canUndo()) {
          undo();
          event.preventDefault();
        }
        return;
      }

      // Ctrl/Cmd + Shift + Z または Ctrl/Cmd + Y: Redo
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        if (canRedo()) {
          redo();
          event.preventDefault();
        }
        return;
      }

      // Delete/Backspace: 削除
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
          event.preventDefault();
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, deleteNode, deleteEdge, undo, redo, canUndo, canRedo]);

  // ローカル位置管理: ストアとは独立して位置を管理
  // ストアにはドラッグ終了時にのみ保存し、undo/redo時にはストアから同期
  const [localPositions, setLocalPositions] = useState<Map<string, { x: number; y: number }>>(
    () => new Map(nodes.map((n) => [n.id, n.position]))
  );

  // ドラッグ中かどうかを追跡（undo/redo時の同期制御用）
  const isDraggingRef = useRef(false);

  // 前回のノードIDセットを追跡（追加/削除検出用）
  const prevNodeIdsRef = useRef<Set<string>>(new Set(nodes.map((n) => n.id)));

  // ストアのノード変更を監視して、ローカル位置を同期
  useEffect(() => {
    const currentIds = new Set(nodes.map((n) => n.id));
    const prevIds = prevNodeIdsRef.current;

    // ノードの追加/削除を検出
    const added = [...currentIds].filter((id) => !prevIds.has(id));
    const removed = [...prevIds].filter((id) => !currentIds.has(id));

    if (added.length > 0 || removed.length > 0) {
      // ノードが追加/削除された場合
      setLocalPositions((prev) => {
        const newMap = new Map(prev);
        // 追加されたノードの位置を設定
        added.forEach((id) => {
          const node = nodes.find((n) => n.id === id);
          if (node) newMap.set(id, node.position);
        });
        // 削除されたノードの位置を削除
        removed.forEach((id) => newMap.delete(id));
        return newMap;
      });
    } else if (!isDraggingRef.current) {
      // ノードの追加/削除がなく、ドラッグ中でない場合
      // → undo/redo による位置変更の可能性があるので、ストアから位置を同期
      const storePositionsChanged = nodes.some((node) => {
        const localPos = localPositions.get(node.id);
        return localPos && (localPos.x !== node.position.x || localPos.y !== node.position.y);
      });

      if (storePositionsChanged) {
        setLocalPositions(new Map(nodes.map((n) => [n.id, n.position])));
      }
    }

    prevNodeIdsRef.current = currentIds;
  }, [nodes, localPositions]);

  // React Flow用のノードに変換（ローカル位置を使用）
  const flowNodes: Node<FlowchartNodeData>[] = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: 'flowchart',
        position: localPositions.get(node.id) || node.position,
        data: {
          node,
          isSelected: node.id === selectedNodeId,
        },
        selected: node.id === selectedNodeId,
      })),
    [nodes, selectedNodeId, localPositions]
  );

  // React Flow用のエッジに変換
  const flowEdges: Edge<FlowchartEdgeData>[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: 'flow',
        data: {
          edge,
          isSelected: edge.id === selectedEdgeId,
        },
        selected: edge.id === selectedEdgeId,
      })),
    [edges, selectedEdgeId]
  );

  // ノード変更ハンドラー
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position') {
          if (change.dragging) {
            // ドラッグ中
            isDraggingRef.current = true;
            if (change.position) {
              setLocalPositions((prev) => {
                const newMap = new Map(prev);
                newMap.set(change.id, change.position!);
                return newMap;
              });
            }
          } else {
            // ドラッグ終了
            isDraggingRef.current = false;
            // ローカル位置からストアに保存
            setLocalPositions((prev) => {
              const pos = change.position || prev.get(change.id);
              if (pos) {
                moveNode(change.id, pos);
              }
              return prev;
            });
          }
        }
      }
    },
    [moveNode]
  );

  // エッジ変更ハンドラー
  const onEdgesChange = useCallback((_changes: EdgeChange[]) => {
    // エッジの変更は現時点では無視
  }, []);

  // 接続ハンドラー
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // 重複チェック
      const isDuplicate = edges.some(
        (e) =>
          e.sourceNodeId === connection.source &&
          e.targetNodeId === connection.target
      );
      if (isDuplicate) return;

      addEdge({
        sourceNodeId: connection.source,
        targetNodeId: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
      });
    },
    [edges, addEdge]
  );

  // ノードクリックハンドラー
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // エッジクリックハンドラー
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  // ペインクリックハンドラー
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="flowchart-canvas w-full h-full [&_.react-flow__edges]:!z-[1000]">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{ type: 'flow' }}
        fitView
      >
        <Background gap={15} />
        <Controls />
        <MiniMap
          nodeColor={(node) =>
            node.selected ? '#3b82f6' : '#94a3b8'
          }
          maskColor="rgb(248, 250, 252, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
