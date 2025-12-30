import { useSequenceStore } from '../../store';
import type { SequenceParticipantType } from '../../types/sequence';

const PARTICIPANT_TYPES: Array<{ value: SequenceParticipantType; label: string }> = [
  { value: 'participant', label: '参加者' },
  { value: 'actor', label: 'アクター' },
];

export const ParticipantPanel = () => {
  const { participants, selectedParticipantId, updateParticipant, deleteParticipant } =
    useSequenceStore();

  const selectedParticipant = participants.find(
    (p) => p.id === selectedParticipantId
  );

  if (!selectedParticipant) {
    return null;
  }

  return (
    <div className="participant-panel p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
        参加者編集
      </h3>

      {/* タイプ */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">タイプ</label>
        <select
          value={selectedParticipant.type}
          onChange={(e) =>
            updateParticipant(selectedParticipant.id, {
              type: e.target.value as SequenceParticipantType,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PARTICIPANT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 名前 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">名前</label>
        <input
          type="text"
          value={selectedParticipant.name}
          onChange={(e) =>
            updateParticipant(selectedParticipant.id, { name: e.target.value })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* エイリアス */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          エイリアス（オプション）
        </label>
        <input
          type="text"
          value={selectedParticipant.alias ?? ''}
          onChange={(e) =>
            updateParticipant(selectedParticipant.id, {
              alias: e.target.value || undefined,
            })
          }
          placeholder="短い識別子"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => deleteParticipant(selectedParticipant.id)}
        className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
      >
        参加者を削除
      </button>
    </div>
  );
};
