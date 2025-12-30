import type { Position, ParseError } from './ast';

/** ノード形状 */
export type FlowchartNodeShape =
  | 'rectangle' // [テキスト] - 四角形（プロセス）
  | 'rounded' // (テキスト) - 角丸四角形
  | 'stadium' // ([テキスト]) - スタジアム型
  | 'subroutine' // [[テキスト]] - サブルーチン
  | 'cylinder' // [(テキスト)] - シリンダー（データベース）
  | 'circle' // ((テキスト)) - 円形
  | 'asymmetric' // >テキスト] - 非対称
  | 'rhombus' // {テキスト} - ひし形（条件分岐）
  | 'hexagon' // {{テキスト}} - 六角形
  | 'parallelogram' // [/テキスト/] - 平行四辺形
  | 'parallelogram-alt' // [\テキスト\] - 平行四辺形（逆）
  | 'trapezoid' // [/テキスト\] - 台形
  | 'trapezoid-alt' // [\テキスト/] - 台形（逆）
  | 'double-circle'; // (((テキスト))) - 二重円

/** 矢印/線のタイプ */
export type FlowchartLinkType =
  | 'arrow' // -->
  | 'open' // ---
  | 'dotted' // -.-
  | 'dotted-arrow' // -.->
  | 'thick' // ===
  | 'thick-arrow' // ==>
  | 'invisible'; // ~~~

/** フローチャートの方向 */
export type FlowchartDirection = 'TB' | 'TD' | 'BT' | 'LR' | 'RL';

/** フローチャートノード */
export interface FlowchartNode {
  id: string;
  label: string;
  shape: FlowchartNodeShape;
  position: Position;
}

/** フローチャートエッジ（接続線） */
export interface FlowchartEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  linkType: FlowchartLinkType;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/** サブグラフ */
export interface FlowchartSubgraph {
  id: string;
  label: string;
  nodeIds: string[];
  direction?: FlowchartDirection;
}

/** フローチャート図全体 */
export interface FlowchartDiagram {
  direction: FlowchartDirection;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  subgraphs: FlowchartSubgraph[];
}

/** フローチャートパース結果 */
export interface FlowchartParseResult {
  success: boolean;
  diagram?: FlowchartDiagram;
  errors?: ParseError[];
}

/** フローチャートジェネレーターオプション */
export interface FlowchartGeneratorOptions {
  indentSize?: number;
}

/** React Flow用ノードデータ */
export interface FlowchartNodeData {
  node: FlowchartNode;
  isSelected: boolean;
}

/** React Flow用エッジデータ */
export interface FlowchartEdgeData {
  edge: FlowchartEdge;
  isSelected: boolean;
}
