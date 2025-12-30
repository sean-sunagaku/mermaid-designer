import type {
  FlowchartDiagram,
  FlowchartNode,
  FlowchartEdge,
  FlowchartSubgraph,
  FlowchartNodeShape,
  FlowchartLinkType,
  FlowchartGeneratorOptions,
} from '../types/flowchart';

/** ノード形状を開始・終了記号に変換 */
function shapeToSymbols(shape: FlowchartNodeShape): { start: string; end: string } {
  const shapeMap: Record<FlowchartNodeShape, { start: string; end: string }> = {
    rectangle: { start: '[', end: ']' },
    rounded: { start: '(', end: ')' },
    stadium: { start: '([', end: '])' },
    subroutine: { start: '[[', end: ']]' },
    cylinder: { start: '[(', end: ')]' },
    circle: { start: '((', end: '))' },
    'double-circle': { start: '(((', end: ')))' },
    asymmetric: { start: '>', end: ']' },
    rhombus: { start: '{', end: '}' },
    hexagon: { start: '{{', end: '}}' },
    parallelogram: { start: '[/', end: '/]' },
    'parallelogram-alt': { start: '[\\', end: '\\]' },
    trapezoid: { start: '[/', end: '\\]' },
    'trapezoid-alt': { start: '[\\', end: '/]' },
  };
  return shapeMap[shape] ?? { start: '[', end: ']' };
}

/** リンクタイプを矢印記号に変換 */
function linkTypeToSymbol(linkType: FlowchartLinkType): string {
  const linkMap: Record<FlowchartLinkType, string> = {
    arrow: '-->',
    open: '---',
    dotted: '-.-',
    'dotted-arrow': '-.->',
    thick: '===',
    'thick-arrow': '==>',
    invisible: '~~~',
  };
  return linkMap[linkType] ?? '-->';
}

/** ノードID からMermaid用のIDを生成 */
function getNodeMermaidId(node: FlowchartNode, nodeIdMap: Map<string, string>): string {
  let mermaidId = nodeIdMap.get(node.id);
  if (!mermaidId) {
    // ラベルからIDを生成（英数字とアンダースコアのみ）
    const baseId = node.label
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20);
    mermaidId = baseId || `node_${nodeIdMap.size}`;

    // 重複チェック
    let suffix = 0;
    let uniqueId = mermaidId;
    while (Array.from(nodeIdMap.values()).includes(uniqueId)) {
      suffix++;
      uniqueId = `${mermaidId}_${suffix}`;
    }
    mermaidId = uniqueId;
    nodeIdMap.set(node.id, mermaidId);
  }
  return mermaidId;
}

/** ノード定義を生成 */
function generateNodeDefinition(
  node: FlowchartNode,
  nodeIdMap: Map<string, string>
): string {
  const mermaidId = getNodeMermaidId(node, nodeIdMap);
  const { start, end } = shapeToSymbols(node.shape);
  return `${mermaidId}${start}${node.label}${end}`;
}

/** エッジを生成 */
function generateEdge(
  edge: FlowchartEdge,
  nodeIdMap: Map<string, string>,
  nodeMap: Map<string, FlowchartNode>
): string | null {
  const sourceNode = nodeMap.get(edge.sourceNodeId);
  const targetNode = nodeMap.get(edge.targetNodeId);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const sourceId = getNodeMermaidId(sourceNode, nodeIdMap);
  const targetId = getNodeMermaidId(targetNode, nodeIdMap);
  const linkSymbol = linkTypeToSymbol(edge.linkType);

  if (edge.label) {
    return `    ${sourceId} ${linkSymbol}|${edge.label}| ${targetId}`;
  }
  return `    ${sourceId} ${linkSymbol} ${targetId}`;
}

/** サブグラフを生成 */
function generateSubgraph(
  subgraph: FlowchartSubgraph,
  nodeIdMap: Map<string, string>,
  nodeMap: Map<string, FlowchartNode>,
  edges: FlowchartEdge[],
  _options: FlowchartGeneratorOptions
): string[] {
  const lines: string[] = [];

  lines.push(`    subgraph ${subgraph.label || subgraph.id}`);

  if (subgraph.direction) {
    lines.push(`        direction ${subgraph.direction}`);
  }

  // サブグラフ内のノード
  const subgraphNodeIds = new Set(subgraph.nodeIds);

  for (const nodeId of subgraph.nodeIds) {
    const node = nodeMap.get(nodeId);
    if (node) {
      const nodeDef = generateNodeDefinition(node, nodeIdMap);
      lines.push(`        ${nodeDef}`);
    }
  }

  // サブグラフ内のエッジ
  for (const edge of edges) {
    if (subgraphNodeIds.has(edge.sourceNodeId) && subgraphNodeIds.has(edge.targetNodeId)) {
      const edgeLine = generateEdge(edge, nodeIdMap, nodeMap);
      if (edgeLine) {
        lines.push(`    ${edgeLine}`);
      }
    }
  }

  lines.push('    end');

  return lines;
}

/** Flowchartを生成 */
export function generateFlowchart(
  diagram: FlowchartDiagram,
  options: FlowchartGeneratorOptions = {}
): string {
  const lines: string[] = [`flowchart ${diagram.direction}`];
  const nodeIdMap = new Map<string, string>();

  // ノードマップを作成
  const nodeMap = new Map<string, FlowchartNode>();
  for (const node of diagram.nodes) {
    nodeMap.set(node.id, node);
  }

  // サブグラフに含まれるノードIDを収集
  const subgraphNodeIds = new Set<string>();
  for (const subgraph of diagram.subgraphs) {
    for (const nodeId of subgraph.nodeIds) {
      subgraphNodeIds.add(nodeId);
    }
  }

  // サブグラフに含まれないノードの定義を最初に出力
  const topLevelNodes = diagram.nodes.filter(n => !subgraphNodeIds.has(n.id));
  for (const node of topLevelNodes) {
    const nodeDef = generateNodeDefinition(node, nodeIdMap);
    lines.push(`    ${nodeDef}`);
  }

  // サブグラフを生成
  for (const subgraph of diagram.subgraphs) {
    const subgraphLines = generateSubgraph(
      subgraph,
      nodeIdMap,
      nodeMap,
      diagram.edges,
      options
    );
    lines.push(...subgraphLines);
  }

  // サブグラフ外のエッジを生成
  const subgraphEdgeIds = new Set<string>();
  for (const subgraph of diagram.subgraphs) {
    const subgraphNodeIdSet = new Set(subgraph.nodeIds);
    for (const edge of diagram.edges) {
      if (subgraphNodeIdSet.has(edge.sourceNodeId) && subgraphNodeIdSet.has(edge.targetNodeId)) {
        subgraphEdgeIds.add(edge.id);
      }
    }
  }

  for (const edge of diagram.edges) {
    if (!subgraphEdgeIds.has(edge.id)) {
      const edgeLine = generateEdge(edge, nodeIdMap, nodeMap);
      if (edgeLine) {
        lines.push(edgeLine);
      }
    }
  }

  return lines.join('\n');
}
