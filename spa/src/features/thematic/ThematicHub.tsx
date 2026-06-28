import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { SubjectTreeNode, ControversialTreeNode, LexiconTreeNode, ServiceText } from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';
import { HadithCard } from '../hadiths/HadithCard';
import { Tree, buildTree } from '../../components/ui/tree';
import type { TreeNodeData } from '../../components/ui/tree';

interface ThematicHubProps {
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
  initialSelectedSubjectId?: number | null;
  initialSubjectPathIds?: number[];
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onServiceClick?: (hadith: any, serviceType: any) => void;
  bookmarkedIds?: Set<number>;
  onToggleBookmark?: (hadith: any) => void;
}

type TabType = 'subject' | 'controversial' | 'ghareeb' | 'places' | 'amthal_dates';

export const ThematicHub: React.FC<ThematicHubProps> = ({ 
  activeTab: propActiveTab,
  onTabChange,
  initialSelectedSubjectId,
  initialSubjectPathIds,
  onNarratorClick,
  onLexiconClick,
  onServiceClick,
  bookmarkedIds,
  onToggleBookmark,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>('subject');
  const activeTab = (propActiveTab as TabType) || localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };
  const [loading, setLoading] = useState(false);

  // Tab 1: Subject Tree state
  const [allSubjectNodes, setAllSubjectNodes] = useState<SubjectTreeNode[]>([]);
  const [subjectHadiths, setSubjectHadiths] = useState<ServiceText[]>([]);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [subjectSearchResults, setSubjectSearchResults] = useState<SubjectTreeNode[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [subjectVisibleCount, setSubjectVisibleCount] = useState(20);

  // Tab 2: Controversial Hadiths state
  const [allControNodes, setAllControNodes] = useState<ControversialTreeNode[]>([]);
  const [controExplanations, setControExplanations] = useState<ServiceText[]>([]);
  const [controSearchQuery, setControSearchQuery] = useState('');
  const [controSearchResults, setControSearchResults] = useState<ControversialTreeNode[]>([]);
  const [selectedControId, setSelectedControId] = useState<number | null>(null);
  const [controVisibleCount, setControVisibleCount] = useState(20);

  // Tab 3: Ghareeb Lexicon state
  const [allGhareebNodes, setAllGhareebNodes] = useState<LexiconTreeNode[]>([]);
  const [ghareebDescriptions, setGhareebDescriptions] = useState<ServiceText[]>([]);
  const [ghareebSearchQuery, setGhareebSearchQuery] = useState('');
  const [ghareebSearchResults, setGhareebSearchResults] = useState<LexiconTreeNode[]>([]);
  const [selectedGhareebId, setSelectedGhareebId] = useState<number | null>(null);

  // Tab 4: Places Lexicon state
  const [allPlacesNodes, setAllPlacesNodes] = useState<LexiconTreeNode[]>([]);
  const [placesDescriptions, setPlacesDescriptions] = useState<ServiceText[]>([]);
  const [placesSearchQuery, setPlacesSearchQuery] = useState('');
  const [placesSearchResults, setPlacesSearchResults] = useState<LexiconTreeNode[]>([]);
  const [selectedPlacesId, setSelectedPlacesId] = useState<number | null>(null);
  const [placesVisibleCount, setPlacesVisibleCount] = useState(20);

  // Tab 5: Proverbs & Dates state
  const [subTab5, setSubTab5] = useState<'amthal' | 'dates'>('amthal');
  const [tab5Query, setTab5Query] = useState('');
  const [tab5Results, setTab5Results] = useState<{ ID: number; Text: string }[]>([]);



  // Initialize all trees
  useEffect(() => {
    loadSubjectChildren(0);
    loadControChildren(0);
    loadGhareebChildren(0);
    loadPlacesChildren(1); // Default parent_id to 1 for Places
    loadTab5Data();
  }, []);

  // Watch Tab 5 changes
  useEffect(() => {
    loadTab5Data();
  }, [subTab5, tab5Query]);

  // Load ancestors and select initial thematic node
  useEffect(() => {
    if (initialSelectedSubjectId) {
      setSelectedSubjectId(initialSelectedSubjectId);

      const loadPathNodes = async () => {
        if (initialSubjectPathIds && initialSubjectPathIds.length > 0) {
          for (const parentId of initialSubjectPathIds) {
            await loadSubjectChildren(parentId);
          }
        }
        try {
          const res = await api.getSubjectTree(initialSelectedSubjectId);
          setSubjectHadiths(res.hadiths || []);
        } catch (err) {
          console.error(err);
          setSubjectHadiths([]);
        }
      };
      
      loadPathNodes();
    }
  }, [initialSelectedSubjectId, initialSubjectPathIds]);

  // Tab 1: Load Subject Tree Children
  const loadSubjectChildren = async (parentId: number) => {
    try {
      const res = await api.getSubjectTree(undefined, parentId);
      if (res.nodes) {
        setAllSubjectNodes(prev => {
          const newNodes = res.nodes!.filter(n => !prev.some(p => p.ID === n.ID));
          return [...prev, ...newNodes];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tab 1: Load Hadiths for a Leaf Subject
  const selectSubjectLeaf = async (node: SubjectTreeNode) => {
    setLoading(true);
    setSubjectHadiths([]);
    setSubjectVisibleCount(20);
    try {
      const res = await api.getSubjectTree(node.ID);
      setSubjectHadiths(res.hadiths || []);
    } catch (err) {
      console.error(err);
      setSubjectHadiths([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Search Subject Tree
  const handleSubjectSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectSearchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getSubjectTree(undefined, undefined, subjectSearchQuery);
      if (res.subjects) {
        setSubjectSearchResults(res.subjects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Load Controversial Tree Children
  const loadControChildren = async (parentId: number) => {
    try {
      const res = await api.getControversial(undefined, parentId);
      if (res.nodes) {
        setAllControNodes(prev => {
          const newNodes = res.nodes!.filter(n => !prev.some(p => p.ID === n.ID));
          return [...prev, ...newNodes];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tab 2: Load Reconciliations for Controversial Node
  const selectControLeaf = async (node: ControversialTreeNode) => {
    setLoading(true);
    setControExplanations([]);
    setControVisibleCount(20);
    try {
      const res = await api.getControversial(node.ID);
      setControExplanations(res.descriptions || []);
    } catch (err) {
      console.error(err);
      setControExplanations([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Search Controversial Tree
  const handleControSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!controSearchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getControversial(undefined, undefined, controSearchQuery);
      if (res.nodes) {
        setControSearchResults(res.nodes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 3: Load Ghareeb Lexicon Children
  const loadGhareebChildren = async (parentId: number) => {
    try {
      const res = await api.getLexiconGhareeb(undefined, parentId);
      if (res.items) {
        setAllGhareebNodes(prev => {
          const newNodes = res.items!.filter(n => !prev.some(p => p.ID === n.ID));
          return [...prev, ...newNodes];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tab 3: Load Definitions for Ghareeb Word
  const selectGhareebLeaf = async (node: LexiconTreeNode) => {
    setLoading(true);
    setGhareebDescriptions([]);
    try {
      const res = await api.getLexiconGhareeb(node.ID);
      setGhareebDescriptions(res.descriptions || []);
    } catch (err) {
      console.error(err);
      setGhareebDescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab 3: Search Ghareeb Lexicon
  const handleGhareebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghareebSearchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getLexiconGhareeb(undefined, undefined, ghareebSearchQuery);
      if (res.items) {
        setGhareebSearchResults(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 4: Load Places Lexicon Children
  const loadPlacesChildren = async (parentId: number) => {
    try {
      const res = await api.getLexiconPlaces(undefined, parentId);
      if (res.items) {
        setAllPlacesNodes(prev => {
          const newNodes = res.items!.filter(n => !prev.some(p => p.ID === n.ID));
          return [...prev, ...newNodes];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tab 4: Load Narrators/Details for Place
  const selectPlacesLeaf = async (node: LexiconTreeNode) => {
    setLoading(true);
    setPlacesDescriptions([]);
    setPlacesVisibleCount(20);
    try {
      const res = await api.getLexiconPlaces(node.ID);
      setPlacesDescriptions(res.descriptions || []);
    } catch (err) {
      console.error(err);
      setPlacesDescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab 4: Search Places Lexicon
  const handlePlacesSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placesSearchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getLexiconPlaces(undefined, undefined, placesSearchQuery);
      if (res.items) {
        setPlacesSearchResults(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 5: Load Proverbs or Dates
  const loadTab5Data = async () => {
    setLoading(true);
    try {
      if (subTab5 === 'amthal') {
        const res = await api.getAmthal(tab5Query);
        setTab5Results(res.results);
      } else {
        const res = await api.getDates(tab5Query);
        setTab5Results(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  const renderHighlighted = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const segments = highlightArabicText(text, query);
    return (
      <>
        {segments.map((seg, i) => (
          <span
            key={i}
            className={seg.isHighlighted ? 'bg-amber-400/30 text-amber-300 px-0.5 rounded font-black' : ''}
          >
            {seg.text}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-800/40 p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-black text-emerald-300 leading-tight">
            شجرة الموضوعات والربط الموضوعي والمعاجم
          </h1>
          <p className="mt-3 text-base text-slate-350 leading-relaxed">
            تصفح أطراف ونصوص الأحاديث من خلال الفهرسة الموضوعية الشاملة، أو مراجعة مشكل ومختلف الحديث، بالإضافة لمعاجم الغريب والأماكن وأمثال الحديث والتوثيق الزمني للمتون.
          </p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="border-b border-slate-800 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
          {(
            [
              { id: 'subject', label: 'التصنيف الموضوعي الفقهي' },
              { id: 'controversial', label: 'مشكل ومختلف الحديث' },
              { id: 'ghareeb', label: 'معجم الكلمات الغريبة' },
              { id: 'places', label: 'معجم البلدان والبلدان والديار' },
              { id: 'amthal_dates', label: 'أمثال الحديث والتاريخ الزمني' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Subject Tree */}
      {activeTab === 'subject' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Browser */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">ابحث بالمسائل الفقهية</h3>
              <form onSubmit={handleSubjectSearch} className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن موضوع..."
                  value={subjectSearchQuery}
                  onChange={(e) => setSubjectSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  dir="rtl"
                />
                                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  ابحث
                </button>
              </form>

              {/* Tree View */}
              {!subjectSearchQuery.trim() ? (
                (() => {
                  const subjectTreeData: TreeNodeData<SubjectTreeNode>[] = allSubjectNodes.map(n => ({
                    id: n.ID,
                    parentId: n.ParentID,
                    title: n.SubjectTitle,
                    isLeaf: n.IsLeaf,
                    raw: n
                  }));
                  const subjectRoots = buildTree(subjectTreeData);
                  return (
                    <Tree
                      roots={subjectRoots}
                      selectedId={selectedSubjectId}
                      expandedIds={initialSubjectPathIds}
                      onSelect={(node) => {
                        setSelectedSubjectId(node.id);
                        if (node.isLeaf) {
                          selectSubjectLeaf(node.raw);
                        }
                      }}
                      onLoadChildren={loadSubjectChildren}
                      emptyMessage="جاري تحميل شجرة الموضوعات..."
                    />
                  );
                })()
              ) : subjectSearchResults.length > 0 ? (
                // Search Results View
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  <span className="text-[10px] text-slate-500 block mb-2">نتائج البحث المباشر:</span>
                  {subjectSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => {
                        setSelectedSubjectId(node.ID);
                        if (node.IsLeaf) {
                          selectSubjectLeaf(node);
                        } else {
                          loadSubjectChildren(node.ID);
                        }
                      }}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.SubjectTitle, subjectSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'ورقة فقهية' : 'تفرع'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </div>

          {/* Hadith Hits list */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">مرويات المسألة والربط الفقهي</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : subjectHadiths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 py-24 text-center text-slate-500 text-sm bg-white dark:bg-slate-900/20">
                {selectedSubjectId 
                  ? 'لا توجد نصوص مسجلة لهذه المسألة حالياً'
                  : 'تصفح شجرة الموضوعات باليمين وانقر على مسألة (ورقة فقهية) لعرض نصوص الأحاديث النبوية المرتبطة بها'}
              </div>
            ) : (
              <div className="space-y-4">
                {subjectHadiths.slice(0, subjectVisibleCount).map((hit) => (
                  <div key={hit.MainID} className="mb-4">
                    <HadithCard
                      hadith={hit}
                      onNarratorClick={onNarratorClick}
                      onLexiconClick={onLexiconClick}
                      onServiceClick={onServiceClick}
                      isBookmarked={bookmarkedIds?.has(hit.MainID)}
                      onToggleBookmark={onToggleBookmark}
                      extraHeaderContent={
                        <h5 className="font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                          {hit.Title}
                        </h5>
                      }
                    />
                  </div>
                ))}
                
                {subjectHadiths.length > subjectVisibleCount && (
                  <div className="flex justify-center mt-6 mb-12">
                    <button
                      onClick={() => setSubjectVisibleCount(prev => prev + 20)}
                      className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-xl transition-all duration-300"
                    >
                      <span className="font-bold text-sm">عرض المزيد</span>
                      <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Controversial Hadiths */}
      {activeTab === 'controversial' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Browser */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">تصفح مشكل الحديث ومختلف الآثار</h3>
              <form onSubmit={handleControSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث بالكلمة في العناوين..."
                  value={controSearchQuery}
                  onChange={(e) => setControSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  ابحث
                </button>
              </form>

              {/* Tree View */}
              {!controSearchQuery.trim() ? (
                (() => {
                  const controTreeData: TreeNodeData<ControversialTreeNode>[] = allControNodes.map(n => ({
                    id: n.ID,
                    parentId: n.ParentID,
                    title: n.Text,
                    isLeaf: n.IsLeaf,
                    raw: n
                  }));
                  const controRoots = buildTree(controTreeData);
                  return (
                    <Tree
                      roots={controRoots}
                      selectedId={selectedControId}
                      onSelect={(node) => {
                        setSelectedControId(node.id);
                        if (node.isLeaf) {
                          selectControLeaf(node.raw);
                        }
                      }}
                      onLoadChildren={loadControChildren}
                      emptyMessage="جاري تحميل الشجرة..."
                    />
                  );
                })()
              ) : controSearchResults.length > 0 ? (
                // Search Results View
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  <span className="text-[10px] text-slate-500 block mb-2">نتائج البحث المباشر:</span>
                  {controSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => {
                        setSelectedControId(node.ID);
                        if (node.IsLeaf) {
                          selectControLeaf(node);
                        } else {
                          loadControChildren(node.ID);
                        }
                      }}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, controSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'مسألة مشكل' : 'تفرع'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </div>

          {/* Explanations Area */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">توجيه وإزالة إشكال الحديث</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : controExplanations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 py-24 text-center text-slate-500 text-sm bg-white dark:bg-slate-900/20">
                {selectedControId
                  ? 'لا توجد دراسات أو شروح مسجلة لهذه المسألة حالياً'
                  : 'اختر مسألة إشكال أو وجه اختلاف من الشجرة اليمنى لعرض نصوص شرح مشكل الآثار وتأويلها ودراستها المقارنة'}
              </div>
            ) : (
              <div className="space-y-4">
                {controExplanations.slice(0, controVisibleCount).map((exp) => (
                  <div key={exp.MainID} className="mb-4">
                    <HadithCard
                      hadith={exp as any}
                      onNarratorClick={onNarratorClick}
                      onLexiconClick={onLexiconClick}
                      onServiceClick={onServiceClick}
                      isBookmarked={bookmarkedIds?.has(exp.MainID)}
                      onToggleBookmark={onToggleBookmark}
                      extraHeaderContent={
                        <h5 className="font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                          {exp.Title}
                        </h5>
                      }
                    />
                  </div>
                ))}
                
                {controExplanations.length > controVisibleCount && (
                  <div className="flex justify-center mt-6 mb-12">
                    <button
                      onClick={() => setControVisibleCount(prev => prev + 20)}
                      className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-xl transition-all duration-300"
                    >
                      <span className="font-bold text-sm">عرض المزيد</span>
                      <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Ghareeb Lexicon */}
      {activeTab === 'ghareeb' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Browser */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">ابحث بمعجم غريب ألفاظ الحديث</h3>
              <form onSubmit={handleGhareebSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن كلمة غريبة..."
                  value={ghareebSearchQuery}
                  onChange={(e) => setGhareebSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  ابحث
                </button>
              </form>

              {/* Tree View */}
              {!ghareebSearchQuery.trim() ? (
                (() => {
                  const ghareebTreeData: TreeNodeData<LexiconTreeNode>[] = allGhareebNodes.map(n => ({
                    id: n.ID,
                    parentId: n.ParentID,
                    title: n.Text,
                    isLeaf: n.IsLeaf,
                    raw: n
                  }));
                  const ghareebRoots = buildTree(ghareebTreeData);
                  return (
                    <Tree
                      roots={ghareebRoots}
                      selectedId={selectedGhareebId}
                      onSelect={(node) => {
                        setSelectedGhareebId(node.id);
                        if (node.isLeaf) {
                          selectGhareebLeaf(node.raw);
                        }
                      }}
                      onLoadChildren={loadGhareebChildren}
                      emptyMessage="جاري تحميل معجم الغريب..."
                    />
                  );
                })()
              ) : ghareebSearchResults.length > 0 ? (
                // Search Results View
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  <span className="text-[10px] text-slate-500 block mb-2">نتائج البحث المباشر:</span>
                  {ghareebSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => {
                        setSelectedGhareebId(node.ID);
                        if (node.IsLeaf) {
                          selectGhareebLeaf(node);
                        } else {
                          loadGhareebChildren(node.ID);
                        }
                      }}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, ghareebSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'كلمة معجمية' : 'فرع'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </div>

          {/* Definitions Area */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">تفسير ودلالة الألفاظ الغريبة</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : ghareebDescriptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 py-24 text-center text-slate-500 text-sm bg-white dark:bg-slate-900/20">
                {selectedGhareebId
                  ? 'لا توجد تفسيرات لغوية مسجلة لهذا المصطلح حالياً'
                  : 'اختر الحرف أو المصطلح أو الكلمة الغريبة باليمين لعرض مقتبسات قواميس غريب الحديث وشروح اللغة المقابلة لها'}
              </div>
            ) : (
              <div className="space-y-4">
                {ghareebDescriptions.map((desc) => (
                  <div key={desc.MainID} className="mb-4">
                    <HadithCard
                      hadith={desc}
                      onNarratorClick={onNarratorClick}
                      onLexiconClick={onLexiconClick}
                      onServiceClick={onServiceClick}
                      isBookmarked={bookmarkedIds?.has(desc.MainID)}
                      onToggleBookmark={onToggleBookmark}
                      extraHeaderContent={
                        <h5 className="font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                          {desc.Title}
                        </h5>
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Places Lexicon */}
      {activeTab === 'places' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Browser */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">ابحث بمعجم البلدان والقصور والديار</h3>
              <form onSubmit={handlePlacesSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن مكان..."
                  value={placesSearchQuery}
                  onChange={(e) => setPlacesSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  ابحث
                </button>
              </form>

              {/* Tree View */}
              {!placesSearchQuery.trim() ? (
                (() => {
                  const placesTreeData: TreeNodeData<LexiconTreeNode>[] = allPlacesNodes.map(n => ({
                    id: n.ID,
                    parentId: n.ParentID,
                    title: n.Text,
                    isLeaf: n.IsLeaf,
                    raw: n
                  }));
                  const placesRoots = buildTree(placesTreeData);
                  return (
                    <Tree
                      roots={placesRoots}
                      selectedId={selectedPlacesId}
                      onSelect={(node) => {
                        setSelectedPlacesId(node.id);
                        if (node.isLeaf) {
                          selectPlacesLeaf(node.raw);
                        }
                      }}
                      onLoadChildren={loadPlacesChildren}
                      emptyMessage="جاري تحميل معجم البلدان..."
                    />
                  );
                })()
              ) : placesSearchResults.length > 0 ? (
                // Search Results View
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  <span className="text-[10px] text-slate-500 block mb-2">نتائج البحث المباشر:</span>
                  {placesSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => {
                        setSelectedPlacesId(node.ID);
                        if (node.IsLeaf) {
                          selectPlacesLeaf(node);
                        } else {
                          loadPlacesChildren(node.ID);
                        }
                      }}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, placesSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'موقع جغرافي' : 'حرف'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </div>

          {/* Place descriptions / narrators */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">تعريف موضع البلد وما ذكر عنه في المرويات</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : placesDescriptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 py-24 text-center text-slate-500 text-sm bg-white dark:bg-slate-900/20">
                {selectedPlacesId
                  ? 'لا توجد شروح أو مرويات مرتبطة بهذا الموقع الجغرافي حالياً'
                  : 'اختر بلداً أو دياراً أو قصراً بالجانب الأيمن لاستعراض مرويات موقعه الجغرافي وقائمة الرواة اللذين عاشوا أو رحلوا إليه'}
              </div>
            ) : (
              <div className="space-y-4">
                {placesDescriptions.slice(0, placesVisibleCount).map((desc) => (
                  <div key={desc.MainID} className="mb-4">
                    <HadithCard
                      hadith={desc}
                      onNarratorClick={onNarratorClick}
                      onLexiconClick={onLexiconClick}
                      onServiceClick={onServiceClick}
                      isBookmarked={bookmarkedIds?.has(desc.MainID)}
                      onToggleBookmark={onToggleBookmark}
                      extraHeaderContent={
                        <h5 className="font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-relaxed">
                          {desc.Title}
                        </h5>
                      }
                    />
                  </div>
                ))}
                
                {placesDescriptions.length > placesVisibleCount && (
                  <div className="flex justify-center mt-6 mb-12">
                    <button
                      onClick={() => setPlacesVisibleCount(prev => prev + 20)}
                      className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800/50 rounded-xl transition-all duration-300"
                    >
                      <span className="font-bold text-sm">عرض المزيد</span>
                      <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Proverbs & Dates */}
      {activeTab === 'amthal_dates' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
            <div className="flex rounded-md bg-slate-950 p-1 mb-4 max-w-md mx-auto">
              <button
                onClick={() => { setSubTab5('amthal'); setTab5Query(''); }}
                className={`flex-1 rounded-sm py-1.5 text-xs font-bold transition-all ${subTab5 === 'amthal' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                أمثال الحديث
              </button>
              <button
                onClick={() => { setSubTab5('dates'); setTab5Query(''); }}
                className={`flex-1 rounded-sm py-1.5 text-xs font-bold transition-all ${subTab5 === 'dates' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                التاريخ الزمني للمتون
              </button>
            </div>

            <input
              type="text"
              placeholder={subTab5 === 'amthal' ? 'ابحث بمتن المثل النبوي...' : 'ابحث بالفترة الزمنية أو الحدث التاريخي...'}
              value={tab5Query}
              onChange={(e) => setTab5Query(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              dir="rtl"
            />
          </div>

          <div className="space-y-4">
            <h4 className="atraf-hub-title-5">مسرد النتائج ({tab5Results.length})</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : tab5Results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                لم يتم إيجاد مقتبسات مطابقة للبحث
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tab5Results.map((item) => (
                  <div
                    key={item.ID}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-sm text-slate-250 leading-relaxed font-semibold">
                      {renderHighlighted(item.Text, tab5Query)}
                    </p>
                    <div className="mt-3.5 flex justify-end">
                      <span className="text-[10px] font-bold text-slate-550">المعرف: {item.ID}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};
