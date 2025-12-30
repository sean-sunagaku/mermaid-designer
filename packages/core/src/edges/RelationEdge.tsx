import { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { RelationEdgeData } from '../types/flow';
import { Cardinality } from '../types/ast';

const getCardinalitySymbol = (cardinality: Cardinality): string => {
  switch (cardinality) {
    case 'EXACTLY_ONE':
      return '||';
    case 'ZERO_OR_ONE':
      return 'o|';
    case 'ONE_OR_MORE':
      return '}|';
    case 'ZERO_OR_MORE':
      return '}o';
    default:
      return '||';
  }
};

const CardinalityMarker = ({
  x,
  y,
  cardinality,
}: {
  x: number;
  y: number;
  cardinality: Cardinality;
}) => {
  const symbol = getCardinalitySymbol(cardinality);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-600 text-xs font-mono"
        style={{ fontSize: '10px' }}
      >
        {symbol}
      </text>
    </g>
  );
};

export const RelationEdge = memo(
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
    style,
  }: EdgeProps<RelationEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const relation = data?.relation;
    const identifying = relation?.identifying ?? true;

    // カーディナリティマーカーの位置を計算
    const markerOffset = 25;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const len = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / len;
    const unitY = dy / len;

    const sourceMarkerX = sourceX + unitX * markerOffset;
    const sourceMarkerY = sourceY + unitY * markerOffset;
    const targetMarkerX = targetX - unitX * markerOffset;
    const targetMarkerY = targetY - unitY * markerOffset;

    return (
      <>
        <path
          id={id}
          className={`react-flow__edge-path ${selected ? 'stroke-blue-500' : 'stroke-slate-400'}`}
          d={edgePath}
          strokeWidth={selected ? 3 : 2}
          strokeDasharray={identifying ? undefined : '5,5'}
          fill="none"
          style={style}
        />

        {/* ラベル */}
        {relation?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600 shadow-sm"
            >
              {relation.label}
            </div>
          </EdgeLabelRenderer>
        )}

        {/* カーディナリティマーカー */}
        {relation && (
          <>
            <CardinalityMarker
              x={sourceMarkerX}
              y={sourceMarkerY - 12}
              cardinality={relation.sourceCardinality}
            />
            <CardinalityMarker
              x={targetMarkerX}
              y={targetMarkerY + 14}
              cardinality={relation.targetCardinality}
            />
          </>
        )}
      </>
    );
  }
);

RelationEdge.displayName = 'RelationEdge';
