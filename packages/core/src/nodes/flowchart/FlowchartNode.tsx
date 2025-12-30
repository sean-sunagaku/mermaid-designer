import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type {
  FlowchartNodeData,
  FlowchartNodeShape,
} from '../../types/flowchart';

/** 形状に応じたスタイルクラスを取得 */
const getShapeStyles = (
  shape: FlowchartNodeShape
): { container: string; wrapper: string } => {
  const baseContainer =
    'flowchart-node min-w-[120px] min-h-[40px] flex items-center justify-center text-sm font-medium transition-all';

  switch (shape) {
    case 'rectangle':
      return {
        container: `${baseContainer} bg-white border-2 rounded-md`,
        wrapper: '',
      };
    case 'rounded':
      return {
        container: `${baseContainer} bg-white border-2 rounded-xl`,
        wrapper: '',
      };
    case 'stadium':
      return {
        container: `${baseContainer} bg-white border-2 rounded-full px-6`,
        wrapper: '',
      };
    case 'subroutine':
      return {
        container: `${baseContainer} bg-white border-2 rounded-md border-l-4 border-r-4`,
        wrapper: '',
      };
    case 'cylinder':
      return {
        container: `${baseContainer} bg-white border-2 rounded-t-full rounded-b-md`,
        wrapper: '',
      };
    case 'circle':
      return {
        container: `${baseContainer} bg-white border-2 rounded-full aspect-square`,
        wrapper: '',
      };
    case 'double-circle':
      return {
        container: `${baseContainer} bg-white border-4 border-double rounded-full aspect-square`,
        wrapper: '',
      };
    case 'rhombus':
      return {
        container: `${baseContainer}`,
        wrapper: 'rhombus-shape',
      };
    case 'hexagon':
      return {
        container: `${baseContainer} bg-white border-2`,
        wrapper: 'clip-path-hexagon',
      };
    case 'parallelogram':
      return {
        container: `${baseContainer} bg-white border-2 skew-x-[-12deg]`,
        wrapper: '',
      };
    case 'parallelogram-alt':
      return {
        container: `${baseContainer} bg-white border-2 skew-x-[12deg]`,
        wrapper: '',
      };
    case 'trapezoid':
      return {
        container: `${baseContainer} bg-white border-2`,
        wrapper: 'clip-path-trapezoid',
      };
    case 'trapezoid-alt':
      return {
        container: `${baseContainer} bg-white border-2`,
        wrapper: 'clip-path-trapezoid-alt',
      };
    case 'asymmetric':
      return {
        container: `${baseContainer} bg-white border-2`,
        wrapper: 'clip-path-asymmetric',
      };
    default:
      return {
        container: `${baseContainer} bg-white border-2 rounded-md`,
        wrapper: '',
      };
  }
};

/** 形状に応じた色を取得 */
const getShapeColor = (
  shape: FlowchartNodeShape,
  selected: boolean
): string => {
  const selectedBorder = 'border-blue-500 shadow-lg';
  const defaultBorder = 'border-slate-300';

  switch (shape) {
    case 'rhombus':
      return selected
        ? `${selectedBorder} bg-yellow-50`
        : `${defaultBorder} bg-yellow-50`;
    case 'stadium':
      return selected
        ? `${selectedBorder} bg-green-50`
        : `${defaultBorder} bg-green-50`;
    case 'circle':
    case 'double-circle':
      return selected
        ? `${selectedBorder} bg-purple-50`
        : `${defaultBorder} bg-purple-50`;
    case 'cylinder':
      return selected
        ? `${selectedBorder} bg-blue-50`
        : `${defaultBorder} bg-blue-50`;
    default:
      return selected ? selectedBorder : defaultBorder;
  }
};

export const FlowchartNode = memo(
  ({ data, selected }: NodeProps<FlowchartNodeData>) => {
    const { node } = data;
    const styles = getShapeStyles(node.shape);
    const colorStyles = getShapeColor(node.shape, selected ?? false);

    const isRhombus = node.shape === 'rhombus';

    // 菱形の場合は特別なレンダリング
    if (isRhombus) {
      const borderColor = selected ? 'border-blue-500' : 'border-slate-300';
      const shadowClass = selected ? 'shadow-lg' : '';
      return (
        <div className="relative">
          {/* 菱形の背景 */}
          <div
            className={`w-[60px] h-[60px] bg-yellow-50 border-2 ${borderColor} ${shadowClass} rotate-45`}
          />
          {/* ラベル（回転なし） */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-center px-1">
              {node.label}
            </span>
          </div>

          {/* 接続ハンドル - 菱形の頂点に配置 */}
          <Handle
            type="source"
            position={Position.Top}
            id="top"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            style={{
              bottom: 0,
              left: '50%',
              transform: 'translate(-50%, 50%)',
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        <div className={`${styles.container} ${colorStyles} px-4 py-2`}>
          <span className="text-center">{node.label}</span>
        </div>

        {/* 接続ハンドル */}
        <Handle
          type="source"
          position={Position.Top}
          id="top"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />
      </div>
    );
  }
);

FlowchartNode.displayName = 'FlowchartNode';
