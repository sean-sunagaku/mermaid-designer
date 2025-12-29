import React, { useCallback } from 'react';
import { useERStore, useUndoRedo } from '../store';

export const Toolbar: React.FC = () => {
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
    if (confirm('Reset the diagram? This will clear all entities and relations.')) {
      reset();
    }
  }, [reset]);

  return (
    <div className="toolbar bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2">
      <button
        onClick={handleAddEntity}
        className="toolbar__button toolbar__button--primary px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        + Add Entity
      </button>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className="toolbar__button toolbar__button--secondary px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>

      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className="toolbar__button toolbar__button--secondary px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>

      <div className="flex-1" />

      <button
        onClick={handleReset}
        className="toolbar__button px-3 py-1.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};
