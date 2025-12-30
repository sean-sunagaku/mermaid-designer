import type { ParseError } from './ast';

/** 参加者タイプ */
export type SequenceParticipantType = 'participant' | 'actor';

/** メッセージタイプ */
export type SequenceMessageType =
  | 'solid' // ->
  | 'dotted' // -->
  | 'solid-arrow' // ->>
  | 'dotted-arrow' // -->>
  | 'solid-cross' // -x
  | 'dotted-cross' // --x
  | 'solid-open' // -)
  | 'dotted-open'; // --)

/** ノート位置 */
export type SequenceNotePosition = 'left of' | 'right of' | 'over';

/** 参加者 */
export interface SequenceParticipant {
  id: string;
  type: SequenceParticipantType;
  name: string;
  alias?: string;
  order: number;
}

/** メッセージ */
export interface SequenceMessage {
  id: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  type: SequenceMessageType;
  label: string;
  order: number;
}

/** ノート */
export interface SequenceNote {
  id: string;
  text: string;
  position: SequenceNotePosition;
  participantIds: string[];
  order: number;
}

/** アクティベーション（ライフライン） */
export interface SequenceActivation {
  id: string;
  participantId: string;
  startOrder: number;
  endOrder: number;
}

/** ループブロック */
export interface SequenceLoop {
  id: string;
  label: string;
  startOrder: number;
  endOrder: number;
}

/** Altブロック（条件分岐） */
export interface SequenceAlt {
  id: string;
  conditions: Array<{
    label: string;
    startOrder: number;
    endOrder: number;
  }>;
}

/** Optブロック（オプション） */
export interface SequenceOpt {
  id: string;
  label: string;
  startOrder: number;
  endOrder: number;
}

/** シーケンス図全体 */
export interface SequenceDiagram {
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  notes: SequenceNote[];
  activations: SequenceActivation[];
  loops: SequenceLoop[];
  alts: SequenceAlt[];
  opts: SequenceOpt[];
}

/** シーケンス図パース結果 */
export interface SequenceParseResult {
  success: boolean;
  diagram?: SequenceDiagram;
  errors?: ParseError[];
}

/** シーケンス図ジェネレーターオプション */
export interface SequenceGeneratorOptions {
  indentSize?: number;
}

/** React Flow用参加者ノードデータ */
export interface SequenceParticipantNodeData {
  participant: SequenceParticipant;
  isSelected: boolean;
}

/** React Flow用メッセージエッジデータ */
export interface SequenceMessageEdgeData {
  message: SequenceMessage;
  isSelected: boolean;
}
