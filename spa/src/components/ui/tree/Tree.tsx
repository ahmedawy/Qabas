import React from 'react';
import type { TreeNodeData } from './types';
import { TreeNode } from './TreeNode';

interface TreeProps {
  roots: TreeNodeData[];
  selectedId: number | null;
  expandedIds?: number[];
  onSelect: (node: TreeNodeData) => void;
  onLoadChildren?: (id: number) => Promise<void>;
  emptyMessage?: string;
  className?: string;
}

export const Tree: React.FC<TreeProps> = ({
  roots,
  selectedId,
  expandedIds,
  onSelect,
  onLoadChildren,
  emptyMessage = 'لا توجد عناصر لعرضها',
  className = "space-y-1 pr-1 max-h-96 overflow-y-auto"
}) => {
  if (roots.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {roots.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onLoadChildren={onLoadChildren}
          level={0}
        />
      ))}
    </div>
  );
};
export type { TreeNodeData };
