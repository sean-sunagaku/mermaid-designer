import type {
  SequenceDiagram,
  SequenceParticipant,
  SequenceMessage,
  SequenceNote,
  SequenceLoop,
  SequenceAlt,
  SequenceOpt,
  SequenceMessageType,
  SequenceGeneratorOptions,
} from '../types/sequence';

/** メッセージタイプを矢印記号に変換 */
function messageTypeToSymbol(type: SequenceMessageType): string {
  const symbolMap: Record<SequenceMessageType, string> = {
    solid: '->',
    dotted: '-->',
    'solid-arrow': '->>',
    'dotted-arrow': '-->>',
    'solid-cross': '-x',
    'dotted-cross': '--x',
    'solid-open': '-)',
    'dotted-open': '--)',
  };
  return symbolMap[type] ?? '->>';
}

/** 参加者IDからMermaid用の名前を取得 */
function getParticipantMermaidName(
  participantId: string,
  participantMap: Map<string, SequenceParticipant>
): string | null {
  const participant = participantMap.get(participantId);
  if (!participant) return null;
  return participant.alias ?? participant.name;
}

/** 参加者定義を生成 */
function generateParticipantDefinition(participant: SequenceParticipant): string {
  const type = participant.type === 'actor' ? 'actor' : 'participant';
  const id = participant.alias ?? participant.name;

  if (participant.alias && participant.name !== participant.alias) {
    return `    ${type} ${id} as ${participant.name}`;
  }
  return `    ${type} ${id}`;
}

/** メッセージを生成 */
function generateMessage(
  message: SequenceMessage,
  participantMap: Map<string, SequenceParticipant>
): string | null {
  const sourceName = getParticipantMermaidName(message.sourceParticipantId, participantMap);
  const targetName = getParticipantMermaidName(message.targetParticipantId, participantMap);

  if (!sourceName || !targetName) return null;

  const arrow = messageTypeToSymbol(message.type);

  if (message.label) {
    return `    ${sourceName}${arrow}${targetName}: ${message.label}`;
  }
  return `    ${sourceName}${arrow}${targetName}`;
}

/** ノートを生成 */
function generateNote(
  note: SequenceNote,
  participantMap: Map<string, SequenceParticipant>
): string | null {
  const participantNames = note.participantIds
    .map(id => getParticipantMermaidName(id, participantMap))
    .filter((name): name is string => name !== null);

  if (participantNames.length === 0) return null;

  const position = note.position;
  const participants = participantNames.join(',');

  return `    Note ${position} ${participants}: ${note.text}`;
}

/** ループを生成 */
function generateLoop(loop: SequenceLoop): { start: string; end: string } {
  return {
    start: `    loop ${loop.label}`,
    end: '    end',
  };
}

/** Altを生成 */
function generateAlt(alt: SequenceAlt): { parts: Array<{ label: string; start: string }>; end: string } {
  const parts = alt.conditions.map((condition, index) => ({
    label: condition.label,
    start: index === 0 ? `    alt ${condition.label}` : `    else ${condition.label}`,
  }));
  return {
    parts,
    end: '    end',
  };
}

/** Optを生成 */
function generateOpt(opt: SequenceOpt): { start: string; end: string } {
  return {
    start: `    opt ${opt.label}`,
    end: '    end',
  };
}

/** 全要素をorderでソートして統合 */
interface OrderedElement {
  type: 'message' | 'note' | 'loop-start' | 'loop-end' | 'alt-start' | 'alt-else' | 'alt-end' | 'opt-start' | 'opt-end';
  order: number;
  content: string;
}

/** Sequence Diagramを生成 */
export function generateSequenceDiagram(
  diagram: SequenceDiagram,
  _options: SequenceGeneratorOptions = {}
): string {
  const lines: string[] = ['sequenceDiagram'];

  // 参加者マップを作成
  const participantMap = new Map<string, SequenceParticipant>();
  for (const participant of diagram.participants) {
    participantMap.set(participant.id, participant);
  }

  // 参加者定義を出力（order順）
  const sortedParticipants = [...diagram.participants].sort((a, b) => a.order - b.order);
  for (const participant of sortedParticipants) {
    lines.push(generateParticipantDefinition(participant));
  }

  // すべての要素をorder順に整理
  const orderedElements: OrderedElement[] = [];

  // メッセージ
  for (const message of diagram.messages) {
    const content = generateMessage(message, participantMap);
    if (content) {
      orderedElements.push({
        type: 'message',
        order: message.order,
        content,
      });
    }
  }

  // ノート
  for (const note of diagram.notes) {
    const content = generateNote(note, participantMap);
    if (content) {
      orderedElements.push({
        type: 'note',
        order: note.order,
        content,
      });
    }
  }

  // ループ
  for (const loop of diagram.loops) {
    const { start, end } = generateLoop(loop);
    orderedElements.push({
      type: 'loop-start',
      order: loop.startOrder,
      content: start,
    });
    orderedElements.push({
      type: 'loop-end',
      order: loop.endOrder,
      content: end,
    });
  }

  // Alt
  for (const alt of diagram.alts) {
    const { parts, end } = generateAlt(alt);
    parts.forEach((part, index) => {
      const condition = alt.conditions[index];
      orderedElements.push({
        type: index === 0 ? 'alt-start' : 'alt-else',
        order: condition.startOrder,
        content: part.start,
      });
    });
    if (alt.conditions.length > 0) {
      orderedElements.push({
        type: 'alt-end',
        order: alt.conditions[alt.conditions.length - 1].endOrder,
        content: end,
      });
    }
  }

  // Opt
  for (const opt of diagram.opts) {
    const { start, end } = generateOpt(opt);
    orderedElements.push({
      type: 'opt-start',
      order: opt.startOrder,
      content: start,
    });
    orderedElements.push({
      type: 'opt-end',
      order: opt.endOrder,
      content: end,
    });
  }

  // order順にソート
  orderedElements.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    // 同じorderの場合、開始は前、終了は後
    const typeOrder: Record<string, number> = {
      'loop-start': 0,
      'alt-start': 0,
      'opt-start': 0,
      'alt-else': 1,
      message: 2,
      note: 2,
      'loop-end': 3,
      'alt-end': 3,
      'opt-end': 3,
    };
    return (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2);
  });

  // 出力
  for (const element of orderedElements) {
    lines.push(element.content);
  }

  return lines.join('\n');
}
