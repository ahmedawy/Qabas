import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { AsanedTreeNode } from '../../types';
import { Tree } from '../../components/ui/tree';
import type { TreeNodeData } from '../../components/ui/tree';

interface AtrafAsanedTabProps {
  onSelectHadith?: (id: number) => void;
}

export const AtrafAsanedTab: React.FC<AtrafAsanedTabProps> = ({ onSelectHadith }) => {
  // Sidebar Sahaba state
  const [sahabaQuery, setSahabaQuery] = useState('');
  const [sanadTypeFilter, setSanadTypeFilter] = useState('');
  const [sahabaList, setSahabaList] = useState<AsanedTreeNode[]>([]);
  const [sahabaPage, setSahabaPage] = useState(1);
  const [sahabaPagination, setSahabaPagination] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [loadingSahaba, setLoadingSahaba] = useState(false);

  // Selected Sahabi & Tree State
  const [selectedSahabi, setSelectedSahabi] = useState<AsanedTreeNode | null>(null);
  const [treeRoots, setTreeRoots] = useState<TreeNodeData<AsanedTreeNode>[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);

  // Selected Chain & Hadiths State
  const [selectedNodeTitle, setSelectedNodeTitle] = useState<string>('');
  const [hadithResults, setHadithResults] = useState<any[]>([]);
  const [hadithPage, setHadithPage] = useState(1);
  const [hadithPagination, setHadithPagination] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [loadingHadiths, setLoadingHadiths] = useState(false);

  // Fetch Sahaba list
  const loadSahaba = async (page: number = 1) => {
    setLoadingSahaba(true);
    try {
      const res = await api.getAsanedRoots(sahabaQuery, sanadTypeFilter, page, 30);
      setSahabaList(res.results || []);
      setSahabaPagination({
        current_page: res.pagination.current_page,
        last_page: res.pagination.last_page,
        total: res.pagination.total,
      });
      setSahabaPage(page);
    } catch (err) {
      console.error('Failed to load Sahaba:', err);
    } finally {
      setLoadingSahaba(false);
    }
  };

  useEffect(() => {
    loadSahaba(1);
  }, [sanadTypeFilter]);

  const handleSahabaSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSahaba(1);
  };

  // Select Sahabi -> Load initial tree children
  const handleSelectSahabi = async (sahabi: AsanedTreeNode) => {
    setSelectedSahabi(sahabi);
    setSelectedNodeId(null);
    setSelectedNodeTitle('');
    setHadithResults([]);
    setHadithPagination(null);
    setLoadingTree(true);

    try {
      const res = await api.getAsanedChildren(sahabi.ID);
      const roots: TreeNodeData<AsanedTreeNode>[] = (res.results || []).map((n) => ({
        id: n.ID,
        title: n.Name,
        parentId: null,
        isLeaf: n.IsLeaf === 1,
        raw: n,
      }));
      setTreeRoots(roots);
    } catch (err) {
      console.error('Failed to load tree:', err);
    } finally {
      setLoadingTree(false);
    }
  };

  // Helper to recursively append dynamic children to tree state
  const appendChildrenToNodes = (
    nodes: TreeNodeData<AsanedTreeNode>[],
    parentId: number,
    children: TreeNodeData<AsanedTreeNode>[]
  ): TreeNodeData<AsanedTreeNode>[] => {
    return nodes.map((n) => {
      if (n.id === parentId) {
        return { ...n, children };
      }
      if (n.children && n.children.length > 0) {
        return { ...n, children: appendChildrenToNodes(n.children, parentId, children) };
      }
      return n;
    });
  };

  // Lazy loading children callback for Tree component
  const handleLoadChildren = async (parentId: number) => {
    try {
      const res = await api.getAsanedChildren(parentId);
      const childNodes: TreeNodeData<AsanedTreeNode>[] = (res.results || []).map((n) => ({
        id: n.ID,
        title: n.Name,
        parentId,
        isLeaf: n.IsLeaf === 1,
        raw: n,
      }));
      setTreeRoots((prev) => appendChildrenToNodes(prev, parentId, childNodes));
    } catch (err) {
      console.error('Failed to load child nodes:', err);
    }
  };

  // Load Hadiths when any tree node (branch or leaf) is clicked
  const handleNodeSelect = async (nodeId: number, nodeTitle: string, page: number = 1) => {
    setSelectedNodeId(nodeId);
    setSelectedNodeTitle(nodeTitle);
    setLoadingHadiths(true);

    try {
      const res = await api.getAsanedHadiths(nodeId, '', page, 20);
      setHadithResults(res.results || []);
      setHadithPagination({
        current_page: res.pagination.current_page,
        last_page: res.pagination.last_page,
        total: res.pagination.total,
      });
      setHadithPage(page);
    } catch (err) {
      console.error('Failed to load Hadiths:', err);
    } finally {
      setLoadingHadiths(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 dir-rtl">
      {/* 1. Right Sidebar: Sahaba List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>👤</span> صاحب المسند (الصحابة)
            </h3>
            {sahabaPagination && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {sahabaPagination.total} صحابي
              </span>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSahabaSearch} className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={sahabaQuery}
                onChange={(e) => setSahabaQuery(e.target.value)}
                placeholder="ابحث باسم الصحابي..."
                className="w-full text-right text-xs py-2 pr-9 pl-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-800 dark:text-slate-200"
              />
              <span className="absolute right-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            {/* Asaned Type Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                تصنيف الأسانيد
              </label>
              <select
                value={sanadTypeFilter}
                onChange={(e) => setSanadTypeFilter(e.target.value)}
                className="w-full text-right text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="">الكل (جميع التصنيفات)</option>
                <option value="marfoa">أحاديث مرفوعة</option>
                <option value="mawkof">أقوال صحابة (موقوف)</option>
                <option value="maktoa">أقوال تابعين (مقطوع)</option>
                <option value="marfoa_hokm">ما له حكم الرفع</option>
              </select>
            </div>
          </form>

          {/* Sahaba Items List */}
          <div className="max-h-96 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {loadingSahaba ? (
              <div className="py-12 text-center text-xs text-slate-400">جاري تحميل قائمة الصحابة...</div>
            ) : sahabaList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">لم يتم العثور على أي نتائج</div>
            ) : (
              sahabaList.map((sahabi) => {
                const isSelected = selectedSahabi?.ID === sahabi.ID;
                return (
                  <button
                    key={sahabi.ID}
                    type="button"
                    onClick={() => handleSelectSahabi(sahabi)}
                    className={`w-full text-right text-xs p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate leading-relaxed">{sahabi.Name}</span>
                    <span className="text-[10px] opacity-70">‹</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Sahaba Pagination */}
          {sahabaPagination && sahabaPagination.last_page > 1 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => loadSahaba(sahabaPage - 1)}
                disabled={sahabaPage <= 1 || loadingSahaba}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                السابق
              </button>
              <span className="text-[11px] text-slate-500 font-mono">
                {sahabaPage} / {sahabaPagination.last_page}
              </span>
              <button
                type="button"
                onClick={() => loadSahaba(sahabaPage + 1)}
                disabled={sahabaPage >= sahabaPagination.last_page || loadingSahaba}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Center Area: Standard Tree Component (Shared with Books) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 min-h-[400px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🌳</span> شجرة أسانيد الصحابي
            </h3>
            {selectedSahabi ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {selectedSahabi.Name}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">اختر صحابياً من القائمة اليمنى لعرض الشجرة</p>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {loadingTree ? (
              <div className="py-16 text-center text-xs text-slate-400">جاري تحميل شجرة الأسانيد...</div>
            ) : !selectedSahabi ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <div className="text-3xl">👈</div>
                <div>الرجاء اختيار صحابي لمطالعة أسانيده الشجرية</div>
              </div>
            ) : treeRoots.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">لا توجد أسانيد مسجلة لهذا الصحابي</div>
            ) : (
              <Tree
                roots={treeRoots}
                selectedId={selectedNodeId}
                onSelect={(node) => handleNodeSelect(node.id, node.title, 1)}
                onLoadChildren={handleLoadChildren}
                emptyMessage="لا توجد أسانيد مسجلة"
                className="space-y-1 pr-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* 3. Left Pane: Hadiths Content Area */}
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 min-h-[400px]">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📖</span> أحاديث السند المختار
              </h3>
              {selectedNodeTitle && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate max-w-[200px]">
                  {selectedNodeTitle}
                </p>
              )}
            </div>
            {hadithPagination && (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                {hadithPagination.total} حديث
              </span>
            )}
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {loadingHadiths ? (
              <div className="py-16 text-center text-xs text-slate-400">جاري تحميل الأحاديث...</div>
            ) : !selectedNodeId ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <div className="text-3xl">🌿</div>
                <div>اضغط على أي فرع أو راوٍ في الشجرة لعرض أحاديثه</div>
              </div>
            ) : hadithResults.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">لا توجد أحاديث مطابقة لهذا السند</div>
            ) : (
              hadithResults.map((h) => (
                <div
                  key={h.MainID}
                  onClick={() => onSelectHadith && onSelectHadith(h.MainID)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 hover:border-emerald-500 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>{h.BookName}</span>
                    <span className="font-mono text-[11px]">رقم: {h.HadithNum}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-semibold line-clamp-3">
                    {h.Text}
                  </p>
                  {h.CleanContent && (
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                      {h.CleanContent}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Hadith Pagination */}
          {hadithPagination && hadithPagination.last_page > 1 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  selectedNodeId &&
                  handleNodeSelect(selectedNodeId, selectedNodeTitle, hadithPage - 1)
                }
                disabled={hadithPage <= 1 || loadingHadiths}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                السابق
              </button>
              <span className="text-[11px] text-slate-500 font-mono">
                {hadithPage} / {hadithPagination.last_page}
              </span>
              <button
                type="button"
                onClick={() =>
                  selectedNodeId &&
                  handleNodeSelect(selectedNodeId, selectedNodeTitle, hadithPage + 1)
                }
                disabled={hadithPage >= hadithPagination.last_page || loadingHadiths}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
