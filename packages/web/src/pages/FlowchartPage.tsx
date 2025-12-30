import React from 'react';
import { Link } from 'react-router-dom';
import { FlowchartEditor, LanguageSwitcher } from '@mermaid-er-editor/core';

export const FlowchartPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-green-700 text-white px-4 py-2 flex items-center gap-4">
        <Link to="/" className="text-green-200 hover:text-white transition-colors">
          ← ホームに戻る
        </Link>
        <h1 className="font-semibold">フローチャートエディター</h1>
        <div className="flex-1" />
        <LanguageSwitcher />
      </header>

      {/* エディター */}
      <div className="flex-1">
        <FlowchartEditor />
      </div>
    </div>
  );
};
