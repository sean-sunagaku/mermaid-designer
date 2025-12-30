import { useFlowchartStore } from '../../store';
import type { FlowchartLinkType } from '../../types/flowchart';

const LINK_TYPES: Array<{ value: FlowchartLinkType; label: string }> = [
  { value: 'arrow', label: '矢印 (-->)' },
  { value: 'open', label: '線 (---)' },
  { value: 'dotted-arrow', label: '点線矢印 (-.->)' },
  { value: 'dotted', label: '点線 (-.-) ' },
  { value: 'thick-arrow', label: '太線矢印 (==>)' },
  { value: 'thick', label: '太線 (===)' },
  { value: 'invisible', label: '非表示 (~~~)' },
];

export const FlowchartEdgePanel = () => {
  const { edges, selectedEdgeId, updateEdge, deleteEdge } = useFlowchartStore();

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  if (!selectedEdge) {
    return null;
  }

  return (
    <div className="flowchart-edge-panel p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
        エッジ編集
      </h3>

      {/* リンクタイプ */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          リンクタイプ
        </label>
        <select
          value={selectedEdge.linkType}
          onChange={(e) =>
            updateEdge(selectedEdge.id, {
              linkType: e.target.value as FlowchartLinkType,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LINK_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* ラベル */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">ラベル</label>
        <input
          type="text"
          value={selectedEdge.label ?? ''}
          onChange={(e) =>
            updateEdge(selectedEdge.id, { label: e.target.value || undefined })
          }
          placeholder="条件など"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => deleteEdge(selectedEdge.id)}
        className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
      >
        エッジを削除
      </button>
    </div>
  );
};
