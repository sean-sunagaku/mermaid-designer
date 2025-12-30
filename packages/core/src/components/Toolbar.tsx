import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useERStore, useUndoRedo } from '../store';

const SHORTCUTS = [
  { key: 'E', action: 'エンティティ追加' },
  { key: 'ダブルクリック', action: '名前を編集' },
  { key: 'Delete', action: '削除' },
  { key: '⌘/Ctrl + Z', action: '元に戻す' },
  { key: '⌘/Ctrl + Shift + Z', action: 'やり直し' },
  { key: '二本指スクロール', action: '画面移動' },
];

export const Toolbar: React.FC = () => {
  const { t } = useTranslation();
  const { addEntity, reset } = useERStore();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleAddEntity = useCallback(() => {
    const id = addEntity();
    // 新しいエンティティを選択
    useERStore.getState().selectEntity(id);
  }, [addEntity]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const handleReset = useCallback(() => {
    if (confirm(t('toolbar.resetConfirm'))) {
      reset();
    }
  }, [reset, t]);

  return (
    <div className="toolbar bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2">
      <button
        onClick={handleAddEntity}
        className="toolbar__button toolbar__button--primary px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        {t('toolbar.addEntity')}
      </button>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className="toolbar__button toolbar__button--secondary px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('toolbar.undoShortcut')}
      >
        {t('toolbar.undo')}
      </button>

      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className="toolbar__button toolbar__button--secondary px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('toolbar.redoShortcut')}
      >
        {t('toolbar.redo')}
      </button>

      <div className="flex-1" />

      {/* ショートカット一覧 */}
      <div className="relative">
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className="px-2 py-1.5 rounded-md text-sm text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-1"
          title="ショートカット一覧"
        >
          <span className="text-base">⌨</span>
          <span className="text-xs">ショートカット</span>
        </button>
        {showShortcuts && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
            <div className="text-xs font-medium text-slate-500 mb-2">
              キーボードショートカット
            </div>
            {SHORTCUTS.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1 text-sm"
              >
                <span className="text-slate-600">{s.action}</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-700">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleReset}
        className="toolbar__button px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        {t('toolbar.reset')}
      </button>
    </div>
  );
};
