import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import type { ParseError } from '../types/ast';
import type {
  SequenceDiagram,
  SequenceParticipant,
  SequenceMessage,
  SequenceNote,
} from '../types/sequence';
import { parseSequenceDiagram } from '../parser';
import { generateSequenceDiagram } from '../generator';

export interface SequenceState {
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  notes: SequenceNote[];
  selectedParticipantId: string | null;
  selectedMessageId: string | null;
  selectedNoteId: string | null;
  mermaidCode: string;
  parseErrors: ParseError[];
  isDirty: boolean;
}

export interface SequenceActions {
  // 参加者操作
  addParticipant: (participant?: Partial<SequenceParticipant>) => string;
  updateParticipant: (
    id: string,
    updates: Partial<SequenceParticipant>
  ) => void;
  deleteParticipant: (id: string) => void;
  reorderParticipant: (id: string, newOrder: number) => void;

  // メッセージ操作
  addMessage: (message: Partial<SequenceMessage>) => string;
  updateMessage: (id: string, updates: Partial<SequenceMessage>) => void;
  deleteMessage: (id: string) => void;
  reorderMessage: (id: string, newOrder: number) => void;

  // ノート操作
  addNote: (note: Partial<SequenceNote>) => string;
  updateNote: (id: string, updates: Partial<SequenceNote>) => void;
  deleteNote: (id: string) => void;

  // 選択操作
  selectParticipant: (id: string | null) => void;
  selectMessage: (id: string | null) => void;
  selectNote: (id: string | null) => void;
  clearSelection: () => void;

  // コード同期
  updateFromCode: (code: string) => void;
  syncToCode: () => void;

  // インポート/エクスポート
  importDiagram: (diagram: SequenceDiagram) => void;
  exportDiagram: () => SequenceDiagram;
  reset: () => void;
}

export type SequenceStore = SequenceState & SequenceActions;

const initialState: SequenceState = {
  participants: [],
  messages: [],
  notes: [],
  selectedParticipantId: null,
  selectedMessageId: null,
  selectedNoteId: null,
  mermaidCode: 'sequenceDiagram\n',
  parseErrors: [],
  isDirty: false,
};

export const useSequenceStore = create<SequenceStore>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // 参加者操作
      addParticipant: (participant?: Partial<SequenceParticipant>) => {
        const id = uuidv4();
        const currentMaxOrder = Math.max(
          -1,
          ...get().participants.map((p) => p.order)
        );
        const newParticipant: SequenceParticipant = {
          id,
          type: participant?.type || 'participant',
          name: participant?.name || `Participant_${Date.now().toString(36)}`,
          alias: participant?.alias,
          order: participant?.order ?? currentMaxOrder + 1,
        };

        set((state) => ({
          participants: [...state.participants, newParticipant],
          isDirty: true,
        }));

        get().syncToCode();
        return id;
      },

      updateParticipant: (
        id: string,
        updates: Partial<SequenceParticipant>
      ) => {
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteParticipant: (id: string) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
          messages: state.messages.filter(
            (m) => m.sourceParticipantId !== id && m.targetParticipantId !== id
          ),
          notes: state.notes.filter((n) => !n.participantIds.includes(id)),
          selectedParticipantId:
            state.selectedParticipantId === id
              ? null
              : state.selectedParticipantId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      reorderParticipant: (id: string, newOrder: number) => {
        set((state) => {
          const participants = [...state.participants];
          const participant = participants.find((p) => p.id === id);
          if (!participant) return state;

          const oldOrder = participant.order;

          // 他の参加者のorderを調整
          const updatedParticipants = participants.map((p) => {
            if (p.id === id) {
              return { ...p, order: newOrder };
            }
            if (
              oldOrder < newOrder &&
              p.order > oldOrder &&
              p.order <= newOrder
            ) {
              return { ...p, order: p.order - 1 };
            }
            if (
              oldOrder > newOrder &&
              p.order >= newOrder &&
              p.order < oldOrder
            ) {
              return { ...p, order: p.order + 1 };
            }
            return p;
          });

          return { participants: updatedParticipants, isDirty: true };
        });
        get().syncToCode();
      },

      // メッセージ操作
      addMessage: (message: Partial<SequenceMessage>) => {
        const id = uuidv4();
        const currentMaxOrder = Math.max(
          -1,
          ...get().messages.map((m) => m.order),
          ...get().notes.map((n) => n.order)
        );
        const newMessage: SequenceMessage = {
          id,
          sourceParticipantId: message.sourceParticipantId || '',
          targetParticipantId: message.targetParticipantId || '',
          type: message.type || 'solid-arrow',
          label: message.label || '',
          order: message.order ?? currentMaxOrder + 1,
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
          isDirty: true,
        }));
        get().syncToCode();
        return id;
      },

      updateMessage: (id: string, updates: Partial<SequenceMessage>) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteMessage: (id: string) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
          selectedMessageId:
            state.selectedMessageId === id ? null : state.selectedMessageId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      reorderMessage: (id: string, newOrder: number) => {
        set((state) => {
          const messages = [...state.messages];
          const message = messages.find((m) => m.id === id);
          if (!message) return state;

          const oldOrder = message.order;

          const updatedMessages = messages.map((m) => {
            if (m.id === id) {
              return { ...m, order: newOrder };
            }
            if (
              oldOrder < newOrder &&
              m.order > oldOrder &&
              m.order <= newOrder
            ) {
              return { ...m, order: m.order - 1 };
            }
            if (
              oldOrder > newOrder &&
              m.order >= newOrder &&
              m.order < oldOrder
            ) {
              return { ...m, order: m.order + 1 };
            }
            return m;
          });

          return { messages: updatedMessages, isDirty: true };
        });
        get().syncToCode();
      },

      // ノート操作
      addNote: (note: Partial<SequenceNote>) => {
        const id = uuidv4();
        const currentMaxOrder = Math.max(
          -1,
          ...get().messages.map((m) => m.order),
          ...get().notes.map((n) => n.order)
        );
        const newNote: SequenceNote = {
          id,
          text: note.text || '',
          position: note.position || 'over',
          participantIds: note.participantIds || [],
          order: note.order ?? currentMaxOrder + 1,
        };

        set((state) => ({
          notes: [...state.notes, newNote],
          isDirty: true,
        }));
        get().syncToCode();
        return id;
      },

      updateNote: (id: string, updates: Partial<SequenceNote>) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          selectedNoteId:
            state.selectedNoteId === id ? null : state.selectedNoteId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      // 選択操作
      selectParticipant: (id: string | null) => {
        set({
          selectedParticipantId: id,
          selectedMessageId: null,
          selectedNoteId: null,
        });
      },

      selectMessage: (id: string | null) => {
        set({
          selectedMessageId: id,
          selectedParticipantId: null,
          selectedNoteId: null,
        });
      },

      selectNote: (id: string | null) => {
        set({
          selectedNoteId: id,
          selectedParticipantId: null,
          selectedMessageId: null,
        });
      },

      clearSelection: () => {
        set({
          selectedParticipantId: null,
          selectedMessageId: null,
          selectedNoteId: null,
        });
      },

      // コード同期
      updateFromCode: (code: string) => {
        const result = parseSequenceDiagram(code);

        if (result.success && result.diagram) {
          set({
            participants: result.diagram.participants,
            messages: result.diagram.messages,
            notes: result.diagram.notes,
            mermaidCode: code,
            parseErrors: [],
            isDirty: true,
          });
        } else {
          set({
            mermaidCode: code,
            parseErrors: result.errors || [],
          });
        }
      },

      syncToCode: () => {
        const { participants, messages, notes } = get();
        const code = generateSequenceDiagram({
          participants,
          messages,
          notes,
          activations: [],
          loops: [],
          alts: [],
          opts: [],
        });
        set({ mermaidCode: code });
      },

      // インポート/エクスポート
      importDiagram: (diagram: SequenceDiagram) => {
        set({
          participants: diagram.participants,
          messages: diagram.messages,
          notes: diagram.notes,
          isDirty: false,
        });
        get().syncToCode();
      },

      exportDiagram: () => {
        const { participants, messages, notes } = get();
        return {
          participants,
          messages,
          notes,
          activations: [],
          loops: [],
          alts: [],
          opts: [],
        };
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({
        participants: state.participants,
        messages: state.messages,
        notes: state.notes,
      }),
    }
  )
);

// Undo/Redo hooks
export const useSequenceUndoRedo = () => {
  const store = useSequenceStore;
  return {
    undo: () => store.temporal.getState().undo(),
    redo: () => store.temporal.getState().redo(),
    canUndo: () => store.temporal.getState().pastStates.length > 0,
    canRedo: () => store.temporal.getState().futureStates.length > 0,
  };
};
