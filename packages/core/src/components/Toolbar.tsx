import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useERStore, useUndoRedo } from '../store';

export const Toolbar: React.FC = () => {
  const { t } = useTranslation();
  const { addEntity, reset } = useERStore();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

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

      <button
        onClick={handleReset}
        className="toolbar__button px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        {t('toolbar.reset')}
      </button>
    </div>
  );
};
