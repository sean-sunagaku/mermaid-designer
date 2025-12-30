import { useSequenceStore, useSequenceUndoRedo } from '../../store';

export const SequenceToolbar = () => {
  const { addParticipant, reset } = useSequenceStore();
  const { undo, redo, canUndo, canRedo } = useSequenceUndoRedo();

  const handleAddParticipant = () => {
    addParticipant({ type: 'participant' });
  };

  const handleAddActor = () => {
    addParticipant({ type: 'actor' });
  };

  return (
    <div className="sequence-toolbar flex items-center gap-4 px-4 py-2 bg-white border-b border-slate-200">
      {/* 参加者追加ボタン */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-slate-600 mr-1">追加:</span>
        <button
          onClick={handleAddParticipant}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          参加者
        </button>
        <button
          onClick={handleAddActor}
          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          アクター
        </button>
      </div>

      {/* スペーサー */}
      <div className="flex-1" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          元に戻す
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          やり直し
        </button>
      </div>

      {/* リセット */}
      <button
        onClick={reset}
        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
      >
        リセット
      </button>
    </div>
  );
};
