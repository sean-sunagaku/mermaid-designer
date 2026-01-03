import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  EREditor,
  useERStore,
  FlowchartEditor,
  useFlowchartStore,
  SequenceEditor,
  useSequenceStore,
} from '@mermaid-er-editor/core';
import '@mermaid-er-editor/core/styles.css';

// 図タイプの定義
type DiagramType = 'erDiagram' | 'flowchart' | 'sequenceDiagram';

// VSCode API の型定義
interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

// VSCode API を取得
const vscode = acquireVsCodeApi();

/**
 * ER図エディタコンポーネント
 */
const EREditorWrapper: React.FC<{
  onCodeChange: (code: string) => void;
  isLoading: React.MutableRefObject<boolean>;
}> = ({ onCodeChange, isLoading }) => {
  const updateFromCode = useERStore((state) => state.updateFromCode);
  const mermaidCode = useERStore((state) => state.mermaidCode);
  const prevCodeRef = useRef<string>('');

  // メッセージハンドラを登録
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as {
        type: string;
        content?: string;
        diagramType?: DiagramType;
      };
      if (message.type === 'load' && message.diagramType === 'erDiagram') {
        if (message.content) {
          isLoading.current = true;
          updateFromCode(message.content);
          prevCodeRef.current = message.content;
          setTimeout(() => {
            isLoading.current = false;
          }, 100);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateFromCode, isLoading]);

  // コード変更を親に通知
  useEffect(() => {
    if (
      !isLoading.current &&
      mermaidCode !== prevCodeRef.current &&
      prevCodeRef.current !== ''
    ) {
      onCodeChange(mermaidCode);
    }
    prevCodeRef.current = mermaidCode;
  }, [mermaidCode, onCodeChange, isLoading]);

  return <EREditor showCodeEditor={false} showSidePanel={true} />;
};

/**
 * フローチャートエディタコンポーネント
 */
const FlowchartEditorWrapper: React.FC<{
  onCodeChange: (code: string) => void;
  isLoading: React.MutableRefObject<boolean>;
}> = ({ onCodeChange, isLoading }) => {
  const updateFromCode = useFlowchartStore((state) => state.updateFromCode);
  const mermaidCode = useFlowchartStore((state) => state.mermaidCode);
  const prevCodeRef = useRef<string>('');

  // メッセージハンドラを登録
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as {
        type: string;
        content?: string;
        diagramType?: DiagramType;
      };
      if (message.type === 'load' && message.diagramType === 'flowchart') {
        if (message.content) {
          isLoading.current = true;
          updateFromCode(message.content);
          prevCodeRef.current = message.content;
          setTimeout(() => {
            isLoading.current = false;
          }, 100);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateFromCode, isLoading]);

  // コード変更を親に通知
  useEffect(() => {
    if (
      !isLoading.current &&
      mermaidCode !== prevCodeRef.current &&
      prevCodeRef.current !== ''
    ) {
      onCodeChange(mermaidCode);
    }
    prevCodeRef.current = mermaidCode;
  }, [mermaidCode, onCodeChange, isLoading]);

  return <FlowchartEditor showCodeEditor={false} showSidePanel={true} />;
};

/**
 * シーケンス図エディタコンポーネント
 */
const SequenceEditorWrapper: React.FC<{
  onCodeChange: (code: string) => void;
  isLoading: React.MutableRefObject<boolean>;
}> = ({ onCodeChange, isLoading }) => {
  const updateFromCode = useSequenceStore((state) => state.updateFromCode);
  const mermaidCode = useSequenceStore((state) => state.mermaidCode);
  const prevCodeRef = useRef<string>('');

  // メッセージハンドラを登録
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as {
        type: string;
        content?: string;
        diagramType?: DiagramType;
      };
      if (
        message.type === 'load' &&
        message.diagramType === 'sequenceDiagram'
      ) {
        if (message.content) {
          isLoading.current = true;
          updateFromCode(message.content);
          prevCodeRef.current = message.content;
          setTimeout(() => {
            isLoading.current = false;
          }, 100);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateFromCode, isLoading]);

  // コード変更を親に通知
  useEffect(() => {
    if (
      !isLoading.current &&
      mermaidCode !== prevCodeRef.current &&
      prevCodeRef.current !== ''
    ) {
      onCodeChange(mermaidCode);
    }
    prevCodeRef.current = mermaidCode;
  }, [mermaidCode, onCodeChange, isLoading]);

  return <SequenceEditor showCodeEditor={false} showSidePanel={true} />;
};

/**
 * Webview用Reactアプリケーション
 */
const WebviewApp: React.FC = () => {
  const [diagramType, setDiagramType] = useState<DiagramType | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // コード変更を拡張機能に通知
  const handleCodeChange = useCallback((code: string) => {
    vscode.postMessage({
      type: 'update',
      content: code,
    });
  }, []);

  // 初回メッセージで図タイプを設定
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as {
        type: string;
        diagramType?: DiagramType;
      };
      if (message.type === 'load' && message.diagramType) {
        setDiagramType(message.diagramType);
      }
    };

    window.addEventListener('message', handleMessage);

    // 準備完了を通知
    vscode.postMessage({ type: 'ready' });

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // エラーハンドリング
  const handleError = useCallback((error: Error) => {
    vscode.postMessage({
      type: 'error',
      message: error.message,
    });
  }, []);

  // グローバルエラーハンドラー
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      handleError(new Error(event.message));
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, [handleError]);

  // 図タイプが決まるまでローディング表示
  if (!diagramType) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white">
      {diagramType === 'erDiagram' && (
        <EREditorWrapper
          onCodeChange={handleCodeChange}
          isLoading={isLoadingRef}
        />
      )}
      {diagramType === 'flowchart' && (
        <FlowchartEditorWrapper
          onCodeChange={handleCodeChange}
          isLoading={isLoadingRef}
        />
      )}
      {diagramType === 'sequenceDiagram' && (
        <SequenceEditorWrapper
          onCodeChange={handleCodeChange}
          isLoading={isLoadingRef}
        />
      )}
    </div>
  );
};

// アプリをマウント
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <WebviewApp />
    </React.StrictMode>
  );
}
