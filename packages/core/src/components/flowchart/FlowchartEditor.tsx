import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FlowchartToolbar } from './FlowchartToolbar';
import { FlowchartCanvas } from './FlowchartCanvas';
import { FlowchartCodeEditor } from './FlowchartCodeEditor';
import { FlowchartSidePanel } from '../../panels/flowchart';
import '../../styles/index.css';

interface FlowchartEditorProps {
  className?: string;
  showCodeEditor?: boolean;
  showSidePanel?: boolean;
}

export const FlowchartEditor: React.FC<FlowchartEditorProps> = ({
  className = '',
  showCodeEditor = true,
  showSidePanel = true,
}) => {
  const codeEditorWidth = 350;

  return (
    <ReactFlowProvider>
      <div
        className={`flowchart-editor flex flex-col h-full bg-slate-50 ${className}`}
      >
        {/* ツールバー */}
        <FlowchartToolbar />

        {/* メインコンテンツ */}
        <div className="flowchart-editor__main flex flex-1 overflow-hidden">
          {/* コードエディター */}
          {showCodeEditor && (
            <div
              className="flowchart-editor__code-panel flex-shrink-0 border-r border-slate-200"
              style={{ width: codeEditorWidth }}
            >
              <FlowchartCodeEditor />
            </div>
          )}

          {/* キャンバス */}
          <div className="flowchart-editor__canvas flex-1">
            <FlowchartCanvas />
          </div>

          {/* サイドパネル */}
          {showSidePanel && <FlowchartSidePanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
};
