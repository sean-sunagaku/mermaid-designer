import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  NodeChange,
  Connection,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useSequenceStore } from '../../store';
import { ParticipantNode } from '../../nodes';
import { MessageEdge } from '../../edges';
import type {
  SequenceParticipantNodeData,
  SequenceMessageEdgeData,
} from '../../types/sequence';

const nodeTypes = {
  participant: ParticipantNode,
};

const edgeTypes = {
  message: MessageEdge,
};

export const SequenceCanvas = () => {
  const {
    participants,
    messages,
    selectedParticipantId,
    selectedMessageId,
    addMessage,
    selectParticipant,
    selectMessage,
    clearSelection,
  } = useSequenceStore();

  // React Flow用のノードに変換
  // 参加者は水平方向に並べる
  const flowNodes: Node<SequenceParticipantNodeData>[] = useMemo(
    () =>
      participants.map((participant, index) => ({
        id: participant.id,
        type: 'participant',
        position: { x: 150 + index * 200, y: 50 },
        data: {
          participant,
          isSelected: participant.id === selectedParticipantId,
        },
        selected: participant.id === selectedParticipantId,
        draggable: false, // 参加者の位置は固定
      })),
    [participants, selectedParticipantId]
  );

  // React Flow用のエッジに変換
  // メッセージはY座標をorderに基づいて計算
  const flowEdges: Edge<SequenceMessageEdgeData>[] = useMemo(
    () =>
      messages.map((message) => ({
        id: message.id,
        source: message.sourceParticipantId,
        target: message.targetParticipantId,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'message',
        data: {
          message,
          isSelected: message.id === selectedMessageId,
        },
        selected: message.id === selectedMessageId,
        // Y座標をorderに基づいて設定（カスタムエッジで処理）
        style: { top: 100 + message.order * 50 },
      })),
    [messages, selectedMessageId]
  );

  // ノード変更ハンドラー（参加者は移動不可）
  const onNodesChange = useCallback((_changes: NodeChange[]) => {
    // 参加者は移動不可なので何もしない
  }, []);

  // 接続ハンドラー
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      addMessage({
        sourceParticipantId: connection.source,
        targetParticipantId: connection.target,
      });
    },
    [addMessage]
  );

  // ノードクリックハンドラー
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectParticipant(node.id);
    },
    [selectParticipant]
  );

  // エッジクリックハンドラー
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectMessage(edge.id);
    },
    [selectMessage]
  );

  // ペインクリックハンドラー
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="sequence-canvas w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ type: 'message' }}
        fitView
        panOnScroll
        panOnScrollSpeed={4}
        panOnDrag
        zoomOnScroll
      >
        <Background gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
