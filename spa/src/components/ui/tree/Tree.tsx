import React from 'react';
import type { TreeNodeData } from './types';
import { TreeNode } from './TreeNode';

interface TreeProps {
  roots: TreeNodeData[];
  selectedId: number | null;
  onSelect: (node: TreeNodeData) => void;
  onLoadChildren?: (id: number) => Promise<void>;
  emptyMessage?: string;
}

export const Tree: React.FC<TreeProps> = ({
  roots,
  selectedId,
  onSelect,
  onLoadChildren,
  emptyMessage = 'لا توجد عناصر لعرضها'
}) => {
  if (roots.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-1 pr-1 max-h-96 overflow-y-auto">
      {roots.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onLoadChildren={onLoadChildren}
          level={0}
        />
      ))}
    </div>
  );
};
export type { TreeNodeData };
