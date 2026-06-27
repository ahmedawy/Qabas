import type { TreeNodeData } from './types';

export function buildTree<T>(nodes: TreeNodeData<T>[]): TreeNodeData<T>[] {
  const map: { [key: number]: TreeNodeData<T> } = {};
  const roots: TreeNodeData<T>[] = [];

  // First pass: map nodes and ensure they have a children array initialized if not present
  nodes.forEach(node => {
    map[node.id] = { ...node, children: node.children || [] };
  });

  // Second pass: associate children with their parents
  nodes.forEach(node => {
    const mapped = map[node.id];
    const parentId = node.parentId;
    
    if (parentId !== null && parentId !== 0 && map[parentId]) {
      if (!map[parentId].children) {
        map[parentId].children = [];
      }
      if (!map[parentId].children!.some(c => c.id === mapped.id)) {
        map[parentId].children!.push(mapped);
      }
    } else {
      roots.push(mapped);
    }
  });

  return roots;
}
