import { useSequenceStore } from '../../store';
import { ParticipantPanel } from './ParticipantPanel';
import { MessagePanel } from './MessagePanel';

export const SequenceSidePanel = () => {
  const { selectedParticipantId, selectedMessageId } = useSequenceStore();

  if (selectedParticipantId) {
    return (
      <div className="sequence-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
        <ParticipantPanel />
      </div>
    );
  }

  if (selectedMessageId) {
    return (
      <div className="sequence-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
        <MessagePanel />
      </div>
    );
  }

  return (
    <div className="sequence-side-panel w-[280px] bg-white border-l border-slate-200 overflow-y-auto">
      <div className="p-4 text-sm text-slate-500 text-center">
        参加者またはメッセージを選択すると編集できます
      </div>
    </div>
  );
};
