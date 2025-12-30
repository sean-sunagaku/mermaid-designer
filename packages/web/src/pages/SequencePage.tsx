import React from 'react';
import { Link } from 'react-router-dom';
import { SequenceEditor, LanguageSwitcher } from '@mermaid-er-editor/core';

export const SequencePage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-purple-700 text-white px-4 py-2 flex items-center gap-4">
        <Link to="/" className="text-purple-200 hover:text-white transition-colors">
          ← ホームに戻る
        </Link>
        <h1 className="font-semibold">シーケンス図エディター</h1>
        <div className="flex-1" />
        <LanguageSwitcher />
      </header>

      {/* エディター */}
      <div className="flex-1">
        <SequenceEditor />
      </div>
    </div>
  );
};
