import { useFlowchartStore } from '../../store';
import type { FlowchartNodeShape } from '../../types/flowchart';

const NODE_SHAPES: Array<{ value: FlowchartNodeShape; label: string }> = [
  { value: 'rectangle', label: '四角形' },
  { value: 'rounded', label: '角丸四角形' },
  { value: 'stadium', label: 'スタジアム型' },
  { value: 'rhombus', label: 'ひし形' },
  { value: 'circle', label: '円形' },
  { value: 'double-circle', label: '二重円' },
  { value: 'hexagon', label: '六角形' },
  { value: 'cylinder', label: 'シリンダー' },
  { value: 'subroutine', label: 'サブルーチン' },
  { value: 'parallelogram', label: '平行四辺形' },
  { value: 'trapezoid', label: '台形' },
  { value: 'asymmetric', label: '非対称' },
];

export const FlowchartNodePanel = () => {
  const { nodes, selectedNodeId, updateNode, deleteNode } = useFlowchartStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="flowchart-node-panel p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
        ノード編集
      </h3>

      {/* ラベル */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">ラベル</label>
        <input
          type="text"
          value={selectedNode.label}
          onChange={(e) =>
            updateNode(selectedNode.id, { label: e.target.value })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 形状 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">形状</label>
        <select
          value={selectedNode.shape}
          onChange={(e) =>
            updateNode(selectedNode.id, {
              shape: e.target.value as FlowchartNodeShape,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {NODE_SHAPES.map((shape) => (
            <option key={shape.value} value={shape.value}>
              {shape.label}
            </option>
          ))}
        </select>
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => deleteNode(selectedNode.id)}
        className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
      >
        ノードを削除
      </button>
    </div>
  );
};
