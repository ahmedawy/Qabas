import React, { useState } from 'react';
import type { TocNode as TocNodeType } from '../../types';

interface TocNodeProps {
  node: TocNodeType;
  selectedNodeId: number | null;
  onSelectNode: (node: TocNodeType) => void;
}

export const TocNode: React.FC<TocNodeProps> = ({ node, selectedNodeId, onSelectNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.MainID;

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
    <div className="select-none text-right font-sans">
      <div
        onClick={handleClick}
        className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 gap-2 ${
          isSelected
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-r-2 border-emerald-500'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
        }`}
      >
        {/* Title */}
        <span className="text-sm truncate flex-grow leading-relaxed">
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
        <div className="mr-4 mt-1 border-r border-slate-200 dark:border-slate-800 pr-2 space-y-1">
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
