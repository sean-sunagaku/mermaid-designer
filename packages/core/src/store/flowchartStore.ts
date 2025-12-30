import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import type { Position, ParseError } from '../types/ast';
import type {
  FlowchartDiagram,
  FlowchartNode,
  FlowchartEdge,
  FlowchartSubgraph,
  FlowchartDirection,
} from '../types/flowchart';
import { parseFlowchart } from '../parser';
import { generateFlowchart } from '../generator';

export interface FlowchartState {
  direction: FlowchartDirection;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  subgraphs: FlowchartSubgraph[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  mermaidCode: string;
  parseErrors: ParseError[];
  isDirty: boolean;
}

export interface FlowchartActions {
  // 方向操作
  setDirection: (direction: FlowchartDirection) => void;

  // ノード操作
  addNode: (node?: Partial<FlowchartNode>) => string;
  updateNode: (id: string, updates: Partial<FlowchartNode>) => void;
  deleteNode: (id: string) => void;
  moveNode: (id: string, position: Position) => void;

  // エッジ操作
  addEdge: (edge: Partial<FlowchartEdge>) => string;
  updateEdge: (id: string, updates: Partial<FlowchartEdge>) => void;
  deleteEdge: (id: string) => void;

  // サブグラフ操作
  addSubgraph: (subgraph?: Partial<FlowchartSubgraph>) => string;
  updateSubgraph: (id: string, updates: Partial<FlowchartSubgraph>) => void;
  deleteSubgraph: (id: string) => void;
  addNodeToSubgraph: (subgraphId: string, nodeId: string) => void;
  removeNodeFromSubgraph: (subgraphId: string, nodeId: string) => void;

  // 選択操作
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  clearSelection: () => void;

  // コード同期
  updateFromCode: (code: string) => void;
  syncToCode: () => void;

  // インポート/エクスポート
  importDiagram: (diagram: FlowchartDiagram) => void;
  exportDiagram: () => FlowchartDiagram;
  reset: () => void;
}

export type FlowchartStore = FlowchartState & FlowchartActions;

const initialState: FlowchartState = {
  direction: 'TD',
  nodes: [],
  edges: [],
  subgraphs: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  mermaidCode: 'flowchart TD\n',
  parseErrors: [],
  isDirty: false,
};

export const useFlowchartStore = create<FlowchartStore>()(
  temporal(
    (set, get) => ({
      ...initialState,

      // 方向操作
      setDirection: (direction: FlowchartDirection) => {
        set({ direction, isDirty: true });
        get().syncToCode();
      },

      // ノード操作
      addNode: (node?: Partial<FlowchartNode>) => {
        const id = uuidv4();
        const newNode: FlowchartNode = {
          id,
          label: node?.label || `Node_${Date.now().toString(36)}`,
          shape: node?.shape || 'rectangle',
          position: node?.position || { x: 100, y: 100 },
        };

        set((state) => ({
          nodes: [...state.nodes, newNode],
          isDirty: true,
        }));

        get().syncToCode();
        return id;
      },

      updateNode: (id: string, updates: Partial<FlowchartNode>) => {
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteNode: (id: string) => {
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter(
            (e) => e.sourceNodeId !== id && e.targetNodeId !== id
          ),
          subgraphs: state.subgraphs.map((sg) => ({
            ...sg,
            nodeIds: sg.nodeIds.filter((nid) => nid !== id),
          })),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      moveNode: (id: string, position: Position) => {
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
        }));
        // 位置変更はコードに反映しない（Mermaidは位置情報を持たない）
      },

      // エッジ操作
      addEdge: (edge: Partial<FlowchartEdge>) => {
        const id = uuidv4();
        const newEdge: FlowchartEdge = {
          id,
          sourceNodeId: edge.sourceNodeId || '',
          targetNodeId: edge.targetNodeId || '',
          linkType: edge.linkType || 'arrow',
          label: edge.label,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        };

        set((state) => ({
          edges: [...state.edges, newEdge],
          isDirty: true,
        }));
        get().syncToCode();
        return id;
      },

      updateEdge: (id: string, updates: Partial<FlowchartEdge>) => {
        set((state) => ({
          edges: state.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteEdge: (id: string) => {
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
          selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
          isDirty: true,
        }));
        get().syncToCode();
      },

      // サブグラフ操作
      addSubgraph: (subgraph?: Partial<FlowchartSubgraph>) => {
        const id = uuidv4();
        const newSubgraph: FlowchartSubgraph = {
          id,
          label: subgraph?.label || `Subgraph_${Date.now().toString(36)}`,
          nodeIds: subgraph?.nodeIds || [],
          direction: subgraph?.direction,
        };

        set((state) => ({
          subgraphs: [...state.subgraphs, newSubgraph],
          isDirty: true,
        }));
        get().syncToCode();
        return id;
      },

      updateSubgraph: (id: string, updates: Partial<FlowchartSubgraph>) => {
        set((state) => ({
          subgraphs: state.subgraphs.map((sg) =>
            sg.id === id ? { ...sg, ...updates } : sg
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      deleteSubgraph: (id: string) => {
        set((state) => ({
          subgraphs: state.subgraphs.filter((sg) => sg.id !== id),
          isDirty: true,
        }));
        get().syncToCode();
      },

      addNodeToSubgraph: (subgraphId: string, nodeId: string) => {
        set((state) => ({
          subgraphs: state.subgraphs.map((sg) =>
            sg.id === subgraphId
              ? { ...sg, nodeIds: [...sg.nodeIds, nodeId] }
              : sg
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      removeNodeFromSubgraph: (subgraphId: string, nodeId: string) => {
        set((state) => ({
          subgraphs: state.subgraphs.map((sg) =>
            sg.id === subgraphId
              ? { ...sg, nodeIds: sg.nodeIds.filter((id) => id !== nodeId) }
              : sg
          ),
          isDirty: true,
        }));
        get().syncToCode();
      },

      // 選択操作
      selectNode: (id: string | null) => {
        set({
          selectedNodeId: id,
          selectedEdgeId: null,
        });
      },

      selectEdge: (id: string | null) => {
        set({
          selectedEdgeId: id,
          selectedNodeId: null,
        });
      },

      clearSelection: () => {
        set({
          selectedNodeId: null,
          selectedEdgeId: null,
        });
      },

      // コード同期
      updateFromCode: (code: string) => {
        const result = parseFlowchart(code);

        if (result.success && result.diagram) {
          // 既存ノードの位置を保持
          const existingPositions = new Map<string, Position>();
          get().nodes.forEach((n) => {
            existingPositions.set(n.label, n.position);
          });

          // 新しいノードに既存の位置を適用
          const nodesWithPositions = result.diagram.nodes.map((n) => ({
            ...n,
            position: existingPositions.get(n.label) || n.position,
          }));

          set({
            direction: result.diagram.direction,
            nodes: nodesWithPositions,
            edges: result.diagram.edges,
            subgraphs: result.diagram.subgraphs,
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
        const { direction, nodes, edges, subgraphs } = get();
        const code = generateFlowchart({ direction, nodes, edges, subgraphs });
        set({ mermaidCode: code });
      },

      // インポート/エクスポート
      importDiagram: (diagram: FlowchartDiagram) => {
        set({
          direction: diagram.direction,
          nodes: diagram.nodes,
          edges: diagram.edges,
          subgraphs: diagram.subgraphs,
          isDirty: false,
        });
        get().syncToCode();
      },

      exportDiagram: () => {
        const { direction, nodes, edges, subgraphs } = get();
        return { direction, nodes, edges, subgraphs };
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      limit: 50,
      partialize: (state) => ({
        direction: state.direction,
        nodes: state.nodes,
        edges: state.edges,
        subgraphs: state.subgraphs,
      }),
    }
  )
);

// Undo/Redo hooks
export const useFlowchartUndoRedo = () => {
  const store = useFlowchartStore;
  return {
    undo: () => store.temporal.getState().undo(),
    redo: () => store.temporal.getState().redo(),
    canUndo: () => store.temporal.getState().pastStates.length > 0,
    canRedo: () => store.temporal.getState().futureStates.length > 0,
  };
};
