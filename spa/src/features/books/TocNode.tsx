import React, { useState, useEffect, useRef } from 'react';
import type { TocNode as TocNodeType } from '../../types';

interface TocNodeProps {
  node: TocNodeType;
  selectedNodeId: number | null;
  onSelectNode: (node: TocNodeType) => void;
}

const hasSelectedChild = (n: TocNodeType, selectedId: number | null): boolean => {
  if (!selectedId) return false;
  if (!n.children) return false;
  return n.children.some(child => child.MainID === selectedId || hasSelectedChild(child, selectedId));
};

export const TocNode: React.FC<TocNodeProps> = ({ node, selectedNodeId, onSelectNode }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.MainID;
  const hasSelectedDescendant = hasSelectedChild(node, selectedNodeId);

  const [isOpen, setIsOpen] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Automatically expand parent node if a child is selected
  useEffect(() => {
    if (hasSelectedDescendant) {
      setIsOpen(true);
    }
  }, [hasSelectedDescendant]);

  // Scroll selected node into view
  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(node);
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="toc-node-text-1" ref={nodeRef}>
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
          {node.Title || '[مقطع بدون عنوان]'}
        </span>

        {/* Expand/Collapse Chevron */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className={`p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isOpen && (
        <div className="toc-node-element-3">
          {node.children!.map((child) => (
            <TocNode
              key={child.MainID}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
