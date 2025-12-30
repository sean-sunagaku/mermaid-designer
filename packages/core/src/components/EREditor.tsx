import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Toolbar } from './Toolbar';
import { Canvas } from './Canvas';
import { CodeEditor } from './CodeEditor';
import { SidePanel } from '../panels/SidePanel';
import '../styles/index.css';

interface EREditorProps {
  className?: string;
  showCodeEditor?: boolean;
  showSidePanel?: boolean;
}

export const EREditor: React.FC<EREditorProps> = ({
  className = '',
  showCodeEditor = true,
  showSidePanel = true,
}) => {
  const codeEditorWidth = 350;

  return (
    <ReactFlowProvider>
      <div
        className={`er-editor flex flex-col h-full bg-slate-50 ${className}`}
      >
        {/* ツールバー */}
        <Toolbar />

        {/* メインコンテンツ */}
        <div className="er-editor__main flex flex-1 overflow-hidden">
          {/* コードエディター */}
          {showCodeEditor && (
            <div
              className="er-editor__code-panel flex-shrink-0 border-r border-slate-200"
              style={{ width: codeEditorWidth }}
            >
              <CodeEditor />
            </div>
          )}

          {/* キャンバス */}
          <div className="er-editor__canvas flex-1">
            <Canvas />
          </div>

          {/* サイドパネル */}
          {showSidePanel && <SidePanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
};
