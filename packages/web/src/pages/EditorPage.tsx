import React from 'react';
import { Link } from 'react-router-dom';
import { EREditor } from '@mermaid-er-editor/core';

export const EditorPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          ← Home
        </Link>
        <h1 className="font-semibold">Mermaid ER Diagram Editor</h1>
      </header>

      {/* エディター */}
      <div className="flex-1">
        <EREditor />
      </div>
    </div>
  );
};
