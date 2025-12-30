import { useFlowchartStore, useFlowchartUndoRedo } from '../../store';
import type { FlowchartDirection, FlowchartNodeShape } from '../../types/flowchart';

const DIRECTIONS: Array<{ value: FlowchartDirection; label: string }> = [
  { value: 'TD', label: '上→下' },
  { value: 'TB', label: '上→下' },
  { value: 'BT', label: '下→上' },
  { value: 'LR', label: '左→右' },
  { value: 'RL', label: '右→左' },
];

const NODE_SHAPES: Array<{ value: FlowchartNodeShape; label: string }> = [
  { value: 'rectangle', label: '四角形' },
  { value: 'rounded', label: '角丸' },
  { value: 'rhombus', label: 'ひし形' },
  { value: 'stadium', label: 'スタジアム' },
  { value: 'circle', label: '円形' },
];

export const FlowchartToolbar = () => {
  const { direction, setDirection, addNode, reset } = useFlowchartStore();
  const { undo, redo, canUndo, canRedo } = useFlowchartUndoRedo();

  const handleAddNode = (shape: FlowchartNodeShape) => {
    addNode({ shape });
  };

  return (
    <div className="flowchart-toolbar flex items-center gap-4 px-4 py-2 bg-white border-b border-slate-200">
      {/* 方向選択 */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600">方向:</label>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as FlowchartDirection)}
          className="px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DIRECTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* ノード追加ボタン */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-600 mr-1">追加:</span>
        {NODE_SHAPES.map((shape) => (
          <button
            key={shape.value}
            onClick={() => handleAddNode(shape.value)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            title={shape.label}
          >
            {shape.label}
          </button>
        ))}
      </div>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          元に戻す
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          やり直し
        </button>
      </div>

      {/* リセット */}
      <button
        onClick={reset}
        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
      >
        リセット
      </button>
    </div>
  );
};
