import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useERStore } from '../store';

interface CodeEditorProps {
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ className = '' }) => {
  const { mermaidCode, parseErrors, updateFromCode } = useERStore();
  const [localCode, setLocalCode] = useState(mermaidCode);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromStore = useRef(false);

  // ストアからコードが更新されたら反映
  useEffect(() => {
    if (!isUpdatingFromStore.current) {
      setLocalCode(mermaidCode);
    }
    isUpdatingFromStore.current = false;
  }, [mermaidCode]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      setLocalCode(newCode);

      // デバウンス付きでストアを更新
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        isUpdatingFromStore.current = true;
        updateFromCode(newCode);
      }, 500);
    },
    [updateFromCode]
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`code-editor flex flex-col h-full ${className}`}>
      <div className="code-editor__header px-3 py-2 bg-slate-800 text-slate-300 text-sm font-medium border-b border-slate-700">
        Mermaid Code
      </div>

      <div className="relative flex-1">
        <textarea
          value={localCode}
          onChange={handleChange}
          className="code-editor__textarea w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
          placeholder="erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER {
        int id PK
        string name
    }"
        />
      </div>

      {/* エラー表示 */}
      {parseErrors.length > 0 && (
        <div className="code-editor__errors px-3 py-2 bg-red-900/50 border-t border-red-800">
          {parseErrors.map((error, index) => (
            <div key={index} className="code-editor__error text-red-400 text-xs">
              Line {error.line}: {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
