import { useState, useEffect, useRef, useCallback } from 'react';
import { useFlowchartStore } from '../../store';

export const FlowchartCodeEditor = () => {
  const { mermaidCode, parseErrors, updateFromCode } = useFlowchartStore();

  const [localCode, setLocalCode] = useState(mermaidCode);
  const isUpdatingFromStore = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // ストアからのコード更新を反映
  useEffect(() => {
    if (!isUpdatingFromStore.current) {
      setLocalCode(mermaidCode);
    }
    isUpdatingFromStore.current = false;
  }, [mermaidCode]);

  // デバウンス付きでコードを更新
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setLocalCode(newCode);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        isUpdatingFromStore.current = true;
        updateFromCode(newCode);
      }, 500);
    },
    [updateFromCode]
  );

  return (
    <div className="flowchart-code-editor flex flex-col h-full bg-slate-900">
      {/* ヘッダー */}
      <div className="flex-shrink-0 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300">Mermaid Code</h3>
      </div>

      {/* エディター */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={localCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          placeholder="flowchart TD
    A[開始] --> B{条件}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]"
        />
      </div>

      {/* エラー表示 */}
      {parseErrors.length > 0 && (
        <div className="flex-shrink-0 max-h-32 overflow-y-auto bg-red-950 border-t border-red-800">
          <div className="px-4 py-2">
            <h4 className="text-xs font-medium text-red-400 mb-1">
              パースエラー
            </h4>
            {parseErrors.map((error, index) => (
              <div key={index} className="text-xs text-red-300">
                Line {error.line}: {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
