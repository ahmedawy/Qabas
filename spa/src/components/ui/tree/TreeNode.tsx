import React, { useState, useEffect, useRef } from 'react';
import type { TreeNodeData } from './types';

interface TreeNodeProps {
  node: TreeNodeData;
  selectedId: number | null;
  expandedIds?: number[];
  onSelect: (node: TreeNodeData) => void;
  onLoadChildren?: (id: number) => Promise<void>;
  level?: number;
}

const hasSelectedChild = (n: TreeNodeData, selectedId: number | null): boolean => {
  if (selectedId === null) return false;
  if (!n.children) return false;
  return n.children.some(child => child.id === selectedId || hasSelectedChild(child, selectedId));
};

export const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedId, expandedIds, onSelect, onLoadChildren, level }) => {
  const [loaded, setLoaded] = useState(node.children ? node.children.length > 0 : false);
  const [isOpen, setIsOpen] = useState(level === 0 || (expandedIds?.includes(node.id) || false));
  const [loading, setLoading] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const hasChildren = onLoadChildren
    ? (!node.isLeaf && (!loaded || (node.children && node.children.length > 0)))
    : (node.children && node.children.length > 0);

  const isSelected = selectedId === node.id;
  const hasSelectedDescendant = hasSelectedChild(node, selectedId);

  // Sync loaded state when children change
  useEffect(() => {
    if (node.children && node.children.length > 0) {
      setLoaded(true);
    }
  }, [node.children]);

  // Automatically expand parent node if a child is selected
  useEffect(() => {
    if (hasSelectedDescendant || (expandedIds && expandedIds.includes(node.id))) {
      setIsOpen(true);
    }
  }, [hasSelectedDescendant, expandedIds, node.id]);

  // Scroll selected node into view of its local container
  useEffect(() => {
    if (isSelected && nodeRef.current) {
      const container = nodeRef.current.closest('.overflow-y-auto') as HTMLElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const nodeRect = nodeRef.current.getBoundingClientRect();
        
        const isFullyVisible =
          nodeRect.top >= containerRect.top &&
          nodeRect.bottom <= containerRect.bottom;

        if (!isFullyVisible) {
          const relativeTopDiff = nodeRect.top - containerRect.top;
          const targetScrollTop = container.scrollTop + relativeTopDiff - (containerRect.height / 2) + (nodeRect.height / 2);
          
          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'auto'
          });
        }
      } else {
        nodeRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [isSelected]);

  // Load children when expanded if they are not already loaded
  useEffect(() => {
    if (isOpen && hasChildren && (!node.children || node.children.length === 0) && onLoadChildren && !loading) {
      setLoading(true);
      onLoadChildren(node.id)
        .then(() => {
          setLoaded(true);
        })
        .catch(err => console.error('Failed to load tree children:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, hasChildren, node.id, node.children, onLoadChildren]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="toc-node-text-1" ref={nodeRef} dir="rtl">
      <div
        onClick={handleClick}
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 gap-2 ${
          isSelected
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-r-2 border-emerald-500'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
        }`}
      >
        {/* Title */}
        <span className="toc-node-text-2">
          {node.title || '[مقطع بدون عنوان]'}
        </span>

        {/* Expand/Collapse Chevron or Spinner */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="toc-node-element-3">
          {node.children && node.children.length > 0 ? (
            node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onLoadChildren={onLoadChildren}
                level={(level ?? 0) + 1}
              />
            ))
          ) : !loading ? (
            <div className="text-right py-1 px-3 text-[10px] text-slate-400 dark:text-slate-500">
              لا توجد عناصر فرعية
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
