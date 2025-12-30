import { useFlowchartStore } from '../../store';
import { FlowchartNodePanel } from './FlowchartNodePanel';
import { FlowchartEdgePanel } from './FlowchartEdgePanel';

export const FlowchartSidePanel = () => {
  const { selectedNodeId, selectedEdgeId } = useFlowchartStore();

  if (selectedNodeId) {
    return (
      <div className="flowchart-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
        <FlowchartNodePanel />
      </div>
    );
  }

  if (selectedEdgeId) {
    return (
      <div className="flowchart-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
        <FlowchartEdgePanel />
      </div>
    );
  }

  return (
    <div className="flowchart-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
      <div className="p-4 text-sm text-slate-500 text-center">
        ノードまたはエッジを選択すると編集できます
      </div>
    </div>
  );
};
