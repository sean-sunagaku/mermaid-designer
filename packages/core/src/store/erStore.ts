import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import {
  EREntity,
  ERRelation,
  ERAttribute,
  ERDiagram,
  Position,
  ParseError,
} from '../types/ast';
import { parseERDiagram } from '../parser';
import { generateERDiagram } from '../generator';

export interface ERState {
  entities: EREntity[];
  relations: ERRelation[];
  selectedEntityId: string | null;
  selectedRelationId: string | null;
  mermaidCode: string;
  parseErrors: ParseError[];
  isDirty: boolean;
}

export interface ERActions {
  // エンティティ操作
  addEntity: (entity?: Partial<EREntity>) => string;
  updateEntity: (id: string, updates: Partial<EREntity>) => void;
  deleteEntity: (id: string) => void;
  moveEntity: (id: string, position: Position) => void;

  // 属性操作
  addAttribute: (entityId: string, attribute?: Partial<ERAttribute>) => void;
  updateAttribute: (entityId: string, attrId: string, updates: Partial<ERAttribute>) => void;
  deleteAttribute: (entityId: string, attrId: string) => void;
  reorderAttributes: (entityId: string, fromIndex: number, toIndex: number) => void;

  // リレーション操作
  addRelation: (relation: Partial<ERRelation>) => string;
  updateRelation: (id: string, updates: Partial<ERRelation>) => void;
  deleteRelation: (id: string) => void;

  // 選択操作
  selectEntity: (id: string | null) => void;
  selectRelation: (id: string | null) => void;
  clearSelection: () => void;

  // コード同期
  updateFromCode: (code: string) => void;
  syncToCode: () => void;

  // インポート/エクスポート
  importDiagram: (diagram: ERDiagram) => void;
  exportDiagram: () => ERDiagram;
  reset: () => void;
}

export type ERStore = ERState & ERActions;

const initialState: ERState = {
  entities: [],
  relations: [],
  selectedEntityId: null,
  selectedRelationId: null,
  mermaidCode: 'erDiagram\n',
  parseErrors: [],
  isDirty: false,
};

export const useERStore = create<ERStore>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // エンティティ操作
      addEntity: (entity?: Partial<EREntity>) => {
        const id = uuidv4();
        const newEntity: EREntity = {
          id,
          name: entity?.name || `Entity_${Date.now().toString(36)}`,
          attributes: entity?.attributes || [],
          position: entity?.position || { x: 100, y: 100 },
          alias: entity?.alias,
        };

        set((state) => ({
          entities: [...state.entities, newEntity],
          isDirty: true,
        }));

        get().syncToCode();
        return id;
      },

      updateEntity: (id: string, updates: Partial<EREntity>) => {
        set((state) => ({
          entities: state.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteEntity: (id: string) => {
        set((state) => ({
          entities: state.entities.filter((e) => e.id !== id),
          relations: state.relations.filter(
            (r) => r.sourceEntityId !== id && r.targetEntityId !== id
          ),
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      moveEntity: (id: string, position: Position) => {
        set((state) => ({
          entities: state.entities.map((e) => (e.id === id ? { ...e, position } : e)),
        }));
        // 位置変更はコードに反映しない（Mermaidは位置情報を持たない）
      },

      // 属性操作
      addAttribute: (entityId: string, attribute?: Partial<ERAttribute>) => {
        const newAttribute: ERAttribute = {
          id: uuidv4(),
          name: attribute?.name || 'new_column',
          type: attribute?.type || 'string',
          isPrimaryKey: attribute?.isPrimaryKey || false,
          isForeignKey: attribute?.isForeignKey || false,
          isUnique: attribute?.isUnique || false,
          isNullable: attribute?.isNullable ?? true,
          comment: attribute?.comment,
        };

        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === entityId ? { ...e, attributes: [...e.attributes, newAttribute] } : e
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      updateAttribute: (entityId: string, attrId: string, updates: Partial<ERAttribute>) => {
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === entityId
              ? {
                  ...e,
                  attributes: e.attributes.map((a) => (a.id === attrId ? { ...a, ...updates } : a)),
                }
              : e
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteAttribute: (entityId: string, attrId: string) => {
        set((state) => ({
          entities: state.entities.map((e) =>
            e.id === entityId
              ? { ...e, attributes: e.attributes.filter((a) => a.id !== attrId) }
              : e
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      reorderAttributes: (entityId: string, fromIndex: number, toIndex: number) => {
        set((state) => ({
          entities: state.entities.map((e) => {
            if (e.id !== entityId) return e;
            const attrs = [...e.attributes];
            const [removed] = attrs.splice(fromIndex, 1);
            attrs.splice(toIndex, 0, removed);
            return { ...e, attributes: attrs };
          }),
          isDirty: true,
        }));
        get().syncToCode();
      },

      // リレーション操作
      addRelation: (relation: Partial<ERRelation>) => {
        const id = uuidv4();
        const newRelation: ERRelation = {
          id,
          sourceEntityId: relation.sourceEntityId || '',
          targetEntityId: relation.targetEntityId || '',
          sourceCardinality: relation.sourceCardinality || 'EXACTLY_ONE',
          targetCardinality: relation.targetCardinality || 'ZERO_OR_MORE',
          label: relation.label,
          identifying: relation.identifying ?? true,
          sourceHandle: relation.sourceHandle,
          targetHandle: relation.targetHandle,
        };

        set((state) => ({
          relations: [...state.relations, newRelation],
          isDirty: true,
        }));
        get().syncToCode();
        return id;
      },

      updateRelation: (id: string, updates: Partial<ERRelation>) => {
        set((state) => ({
          relations: state.relations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteRelation: (id: string) => {
        set((state) => ({
          relations: state.relations.filter((r) => r.id !== id),
          selectedRelationId: state.selectedRelationId === id ? null : state.selectedRelationId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      // 選択操作
      selectEntity: (id: string | null) => {
        set({
          selectedEntityId: id,
          selectedRelationId: null,
        });
      },

      selectRelation: (id: string | null) => {
        set({
          selectedRelationId: id,
          selectedEntityId: null,
        });
      },

      clearSelection: () => {
        set({
          selectedEntityId: null,
          selectedRelationId: null,
        });
      },

      // コード同期
      updateFromCode: (code: string) => {
        const result = parseERDiagram(code);

        if (result.success && result.diagram) {
          // 既存エンティティの位置を保持
          const existingPositions = new Map<string, Position>();
          get().entities.forEach((e) => {
            existingPositions.set(e.name, e.position);
          });

          // 新しいエンティティに既存の位置を適用
          const entitiesWithPositions = result.diagram.entities.map((e) => ({
            ...e,
            position: existingPositions.get(e.name) || e.position,
          }));

          set({
            entities: entitiesWithPositions,
            relations: result.diagram.relations,
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
        const { entities, relations } = get();
        const code = generateERDiagram({ entities, relations });
        set({ mermaidCode: code });
      },

      // インポート/エクスポート
      importDiagram: (diagram: ERDiagram) => {
        set({
          entities: diagram.entities,
          relations: diagram.relations,
          isDirty: false,
        });
        get().syncToCode();
      },

      exportDiagram: () => {
        const { entities, relations } = get();
        return { entities, relations };
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({
        entities: state.entities,
        relations: state.relations,
      }),
      equality: (pastState, currentState) => {
        // エンティティとリレーションが同じなら同一とみなす
        return (
          JSON.stringify(pastState.entities) === JSON.stringify(currentState.entities) &&
          JSON.stringify(pastState.relations) === JSON.stringify(currentState.relations)
        );
      },
    }
  )
);

// Undo/Redo hooks
export const useUndoRedo = () => {
  const store = useERStore;
  return {
    undo: () => store.temporal.getState().undo(),
    redo: () => store.temporal.getState().redo(),
    canUndo: () => store.temporal.getState().pastStates.length > 0,
    canRedo: () => store.temporal.getState().futureStates.length > 0,
  };
};
