import { useSequenceStore } from '../../store';
import type { SequenceMessageType } from '../../types/sequence';

const MESSAGE_TYPES: Array<{ value: SequenceMessageType; label: string }> = [
  { value: 'solid-arrow', label: '同期 (->>)' },
  { value: 'dotted-arrow', label: '非同期 (-->>)' },
  { value: 'solid', label: '実線 (->)' },
  { value: 'dotted', label: '点線 (-->)' },
  { value: 'solid-cross', label: '失敗 (-x)' },
  { value: 'dotted-cross', label: '失敗点線 (--x)' },
  { value: 'solid-open', label: 'オープン (-)' },
  { value: 'dotted-open', label: 'オープン点線 (--)' },
];

export const MessagePanel = () => {
  const {
    messages,
    participants,
    selectedMessageId,
    updateMessage,
    deleteMessage,
  } = useSequenceStore();

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  if (!selectedMessage) {
    return null;
  }

  return (
    <div className="message-panel p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 border-b pb-2">
        メッセージ編集
      </h3>

      {/* 送信元 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">送信元</label>
        <select
          value={selectedMessage.sourceParticipantId}
          onChange={(e) =>
            updateMessage(selectedMessage.id, {
              sourceParticipantId: e.target.value,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 送信先 */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">送信先</label>
        <select
          value={selectedMessage.targetParticipantId}
          onChange={(e) =>
            updateMessage(selectedMessage.id, {
              targetParticipantId: e.target.value,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* メッセージタイプ */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">タイプ</label>
        <select
          value={selectedMessage.type}
          onChange={(e) =>
            updateMessage(selectedMessage.id, {
              type: e.target.value as SequenceMessageType,
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MESSAGE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* ラベル */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">ラベル</label>
        <input
          type="text"
          value={selectedMessage.label}
          onChange={(e) =>
            updateMessage(selectedMessage.id, { label: e.target.value })
          }
          placeholder="メッセージ内容"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => deleteMessage(selectedMessage.id)}
        className="w-full px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
      >
        メッセージを削除
      </button>
    </div>
  );
};
