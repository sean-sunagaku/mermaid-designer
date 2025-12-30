import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { SequenceToolbar } from './SequenceToolbar';
import { SequenceCanvas } from './SequenceCanvas';
import { SequenceCodeEditor } from './SequenceCodeEditor';
import { SequenceSidePanel } from '../../panels/sequence';
import '../../styles/index.css';

interface SequenceEditorProps {
  className?: string;
  showCodeEditor?: boolean;
  showSidePanel?: boolean;
}

export const SequenceEditor: React.FC<SequenceEditorProps> = ({
  className = '',
  showCodeEditor = true,
  showSidePanel = true,
}) => {
  const codeEditorWidth = 350;

  return (
    <ReactFlowProvider>
      <div
        className={`sequence-editor flex flex-col h-full bg-slate-50 ${className}`}
      >
        {/* ツールバー */}
        <SequenceToolbar />

        {/* メインコンテンツ */}
        <div className="sequence-editor__main flex flex-1 overflow-hidden">
          {/* コードエディター */}
          {showCodeEditor && (
            <div
              className="sequence-editor__code-panel flex-shrink-0 border-r border-slate-200"
              style={{ width: codeEditorWidth }}
            >
              <SequenceCodeEditor />
            </div>
          )}

          {/* キャンバス */}
          <div className="sequence-editor__canvas flex-1">
            <SequenceCanvas />
          </div>

          {/* サイドパネル */}
          {showSidePanel && <SequenceSidePanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
};
