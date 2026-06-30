import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { TocNode as TocNodeType } from '../../types';
import { Tree, buildTree } from '../../components/ui/tree';
import type { TreeNodeData } from '../../components/ui/tree';

interface TocTreeProps {
  bookId: number;
  bookType: 'hadith' | 'service';
  selectedNodeId: number | null;
  onSelectNode: (node: TocNodeType) => void;
  onTocLoaded: (nodes: TocNodeType[]) => void;
}

export const TocTree: React.FC<TocTreeProps> = ({ bookId, bookType, selectedNodeId, onSelectNode, onTocLoaded }) => {
  const [nodes, setNodes] = useState<TocNodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (bookId <= 0) return;

    let active = true;
    setLoading(true);
    setError(null);

    api.getToc(bookId, bookType)
      .then((data) => {
        if (active) {
          setNodes(data.toc);
          onTocLoaded(data.toc);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'فشل تحميل فهرس الأبواب');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [bookId]);

  if (bookId <= 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
        الرجاء اختيار كتاب لعرض الفهرس الجانبي
      </div>
    );
  }

  if (loading) {
    return (
      <div className="toc-tree-stack-2">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-400 dark:text-slate-500 text-xs">جاري تحميل الفهرس...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="toc-tree-text-4">
        <p className="toc-tree-text-5">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            api.getToc(bookId, bookType).then(data => { setNodes(data.toc); onTocLoaded(data.toc); setLoading(false); }).catch(err => { setError(err.message); setLoading(false); });
          }}
          className="toc-tree-text-6"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Filter nodes matching search query before building the tree (to support searching chapters)
  const filteredNodes = searchQuery.trim() === '' 
    ? nodes 
    : nodes.filter(node => node.Title.toLowerCase().includes(searchQuery.toLowerCase()));

  const treeData: TreeNodeData<TocNodeType>[] = filteredNodes.map(n => ({
    id: n.MainID,
    parentId: n.ParentID,
    title: n.Title,
    isLeaf: n.IsLeaf,
    raw: n
  }));

  const tree = buildTree(treeData);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* TOC Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأبواب..."
          className="w-full text-right py-1.5 pl-3 pr-8 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs"
        />
        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* TOC Node List */}
      <div className="toc-tree-element-10">
        <Tree
          roots={tree}
          selectedId={selectedNodeId}
          onSelect={(node) => onSelectNode(node.raw)}
          emptyMessage="لا توجد أبواب مطابقة"
          className="space-y-1 pr-1 flex-grow overflow-y-auto"
        />
      </div>
    </div>
  );
};
