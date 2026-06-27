export interface TreeNodeData<T = any> {
  id: number;
  parentId: number | null;
  title: string;
  isLeaf: boolean;
  children?: TreeNodeData<T>[];
  raw: T;
}
