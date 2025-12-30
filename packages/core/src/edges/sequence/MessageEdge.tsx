import { memo } from 'react';
import { EdgeProps, EdgeLabelRenderer } from 'reactflow';
import type {
  SequenceMessageEdgeData,
  SequenceMessageType,
} from '../../types/sequence';

/** メッセージタイプに応じたスタイルを取得 */
const getMessageStyle = (
  type: SequenceMessageType,
  selected: boolean
): {
  strokeDasharray?: string;
  strokeWidth: number;
  stroke: string;
  markerEnd: string;
} => {
  const baseStroke = selected ? '#3b82f6' : '#64748b';
  const baseWidth = selected ? 2 : 1.5;

  const isDotted = type.startsWith('dotted');
  const markerSuffix = selected ? 'selected' : 'default';

  let markerType = 'arrow';
  if (type.includes('cross')) {
    markerType = 'cross';
  } else if (type.includes('open')) {
    markerType = 'open';
  }

  return {
    strokeDasharray: isDotted ? '5,5' : undefined,
    strokeWidth: baseWidth,
    stroke: baseStroke,
    markerEnd: `url(#sequence-${markerType}-${markerSuffix})`,
  };
};

export const MessageEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    data,
    selected,
  }: EdgeProps<SequenceMessageEdgeData>) => {
    const message = data?.message;
    const type = message?.type ?? 'solid-arrow';
    const style = getMessageStyle(type, selected ?? false);

    // シーケンス図は水平線で描画
    const midY = sourceY;
    const labelX = (sourceX + targetX) / 2;
    const labelY = midY - 15;

    // 直線パスを生成
    const edgePath = `M ${sourceX} ${midY} L ${targetX} ${midY}`;

    return (
      <>
        {/* マーカー定義 */}
        <defs>
          {/* 矢印マーカー */}
          <marker
            id="sequence-arrow-default"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
          <marker
            id="sequence-arrow-selected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>

          {/* オープン矢印マーカー */}
          <marker
            id="sequence-open-default"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
            />
          </marker>
          <marker
            id="sequence-open-selected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
          </marker>

          {/* クロスマーカー */}
          <marker
            id="sequence-cross-default"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path
              d="M 2 2 L 8 8 M 8 2 L 2 8"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
            />
          </marker>
          <marker
            id="sequence-cross-selected"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path
              d="M 2 2 L 8 8 M 8 2 L 2 8"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </marker>
        </defs>

        <path
          id={id}
          className="react-flow__edge-path"
          d={edgePath}
          strokeWidth={style.strokeWidth}
          stroke={style.stroke}
          strokeDasharray={style.strokeDasharray}
          fill="none"
          markerEnd={style.markerEnd}
        />

        {/* ラベル */}
        {message?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={`px-2 py-0.5 bg-white text-xs ${
                selected ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              {message.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

MessageEdge.displayName = 'MessageEdge';
