import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { SequenceParticipantNodeData } from '../../types/sequence';

export const ParticipantNode = memo(
  ({ data, selected }: NodeProps<SequenceParticipantNodeData>) => {
    const { participant } = data;
    const isActor = participant.type === 'actor';

    return (
      <div
        className={`participant-node flex flex-col items-center transition-all ${
          selected ? 'scale-105' : ''
        }`}
      >
        {/* アクターアイコンまたはボックス */}
        {isActor ? (
          <div className="flex flex-col items-center">
            {/* 頭 */}
            <div
              className={`w-8 h-8 rounded-full border-2 ${
                selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-400 bg-white'
              }`}
            />
            {/* 体 */}
            <div
              className={`w-0.5 h-6 ${selected ? 'bg-blue-500' : 'bg-slate-400'}`}
            />
            {/* 腕 */}
            <div
              className={`w-8 h-0.5 -mt-4 ${selected ? 'bg-blue-500' : 'bg-slate-400'}`}
            />
            {/* 足 */}
            <div className="flex gap-2 mt-2">
              <div
                className={`w-0.5 h-6 -rotate-12 ${selected ? 'bg-blue-500' : 'bg-slate-400'}`}
              />
              <div
                className={`w-0.5 h-6 rotate-12 ${selected ? 'bg-blue-500' : 'bg-slate-400'}`}
              />
            </div>
          </div>
        ) : (
          <div
            className={`px-4 py-2 rounded-md border-2 bg-white shadow-sm ${
              selected ? 'border-blue-500 shadow-lg' : 'border-slate-300'
            }`}
          >
            <span className="text-sm font-medium text-slate-700">
              {participant.name}
            </span>
          </div>
        )}

        {/* 名前ラベル（アクターの場合のみ下に表示） */}
        {isActor && (
          <div className="mt-2 text-sm font-medium text-slate-700">
            {participant.name}
          </div>
        )}

        {/* ライフライン（下方向へ伸びる点線） */}
        <div
          className={`w-0.5 h-[300px] border-l-2 border-dashed mt-2 ${
            selected ? 'border-blue-300' : 'border-slate-300'
          }`}
        />

        {/* 接続ハンドル（左右のみ） */}
        <Handle
          type="source"
          position={Position.Left}
          id="left"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !top-[50px]"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !top-[50px]"
        />
      </div>
    );
  }
);

ParticipantNode.displayName = 'ParticipantNode';
