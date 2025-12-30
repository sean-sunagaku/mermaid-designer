import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EREditor, LanguageSwitcher } from '@mermaid-er-editor/core';

export const EditorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-slate-800 text-white px-4 py-2 flex items-center gap-4">
        <Link
          to="/"
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← {t('editorPage.backToHome')}
        </Link>
        <h1 className="font-semibold">{t('editorPage.title')}</h1>
        <div className="flex-1" />
        <LanguageSwitcher />
      </header>

      {/* エディター */}
      <div className="flex-1">
        <EREditor />
      </div>
    </div>
  );
};
