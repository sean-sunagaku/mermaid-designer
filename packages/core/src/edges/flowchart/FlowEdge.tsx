import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import type {
  FlowchartEdgeData,
  FlowchartLinkType,
} from '../../types/flowchart';

/** リンクタイプに応じたスタイルを取得 */
const getLinkStyle = (
  linkType: FlowchartLinkType,
  selected: boolean
): {
  strokeDasharray?: string;
  strokeWidth: number;
  stroke: string;
  markerEnd?: string;
} => {
  const baseStroke = selected ? '#3b82f6' : '#64748b'; // blue-500 / slate-500
  const baseWidth = selected ? 3 : 2;

  switch (linkType) {
    case 'arrow':
      return {
        strokeWidth: baseWidth,
        stroke: baseStroke,
        markerEnd: `url(#flowchart-arrow-${selected ? 'selected' : 'default'})`,
      };
    case 'open':
      return {
        strokeWidth: baseWidth,
        stroke: baseStroke,
      };
    case 'dotted':
      return {
        strokeDasharray: '5,5',
        strokeWidth: baseWidth,
        stroke: baseStroke,
      };
    case 'dotted-arrow':
      return {
        strokeDasharray: '5,5',
        strokeWidth: baseWidth,
        stroke: baseStroke,
        markerEnd: `url(#flowchart-arrow-${selected ? 'selected' : 'default'})`,
      };
    case 'thick':
      return {
        strokeWidth: baseWidth + 2,
        stroke: baseStroke,
      };
    case 'thick-arrow':
      return {
        strokeWidth: baseWidth + 2,
        stroke: baseStroke,
        markerEnd: `url(#flowchart-arrow-${selected ? 'selected' : 'default'})`,
      };
    case 'invisible':
      return {
        strokeWidth: 0,
        stroke: 'transparent',
      };
    default:
      return {
        strokeWidth: baseWidth,
        stroke: baseStroke,
        markerEnd: `url(#flowchart-arrow-${selected ? 'selected' : 'default'})`,
      };
  }
};

export const FlowEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<FlowchartEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edge = data?.edge;
    const linkType = edge?.linkType ?? 'arrow';
    const style = getLinkStyle(linkType, selected ?? false);

    return (
      <>
        {/* 矢印マーカー定義 */}
        <defs>
          <marker
            id="flowchart-arrow-default"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
          <marker
            id="flowchart-arrow-selected"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
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
        {edge?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className={`px-2 py-0.5 bg-white border rounded text-xs shadow-sm ${
                selected
                  ? 'border-blue-400 text-blue-600'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              {edge.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

FlowEdge.displayName = 'FlowEdge';
