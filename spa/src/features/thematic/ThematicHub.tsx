import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { SubjectTreeNode, ControversialTreeNode, LexiconTreeNode, ServiceText, Annotation } from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';
import { HadithContentRenderer } from '../hadiths/HadithCard';

interface ThematicHubProps {
  onSelectHadith?: (id: number) => void;
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
}

type TabType = 'subject' | 'controversial' | 'ghareeb' | 'places' | 'amthal_dates';

export const ThematicHub: React.FC<ThematicHubProps> = ({ 
  onSelectHadith,
  activeTab: propActiveTab,
  onTabChange
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
  const [subjectPath, setSubjectPath] = useState<SubjectTreeNode[]>([]);
  const [subjectNodes, setSubjectNodes] = useState<SubjectTreeNode[]>([]);
  const [subjectHadiths, setSubjectHadiths] = useState<ServiceText[]>([]);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [subjectSearchResults, setSubjectSearchResults] = useState<SubjectTreeNode[]>([]);

  // Tab 2: Controversial Hadiths state
  const [controPath, setControPath] = useState<ControversialTreeNode[]>([]);
  const [controNodes, setControNodes] = useState<ControversialTreeNode[]>([]);
  const [controExplanations, setControExplanations] = useState<ServiceText[]>([]);
  const [controSearchQuery, setControSearchQuery] = useState('');
  const [controSearchResults, setControSearchResults] = useState<ControversialTreeNode[]>([]);

  // Tab 3: Ghareeb Lexicon state
  const [ghareebPath, setGhareebPath] = useState<LexiconTreeNode[]>([]);
  const [ghareebNodes, setGhareebNodes] = useState<LexiconTreeNode[]>([]);
  const [ghareebDescriptions, setGhareebDescriptions] = useState<ServiceText[]>([]);
  const [ghareebSearchQuery, setGhareebSearchQuery] = useState('');
  const [ghareebSearchResults, setGhareebSearchResults] = useState<LexiconTreeNode[]>([]);

  // Tab 4: Places Lexicon state
  const [placesPath, setPlacesPath] = useState<LexiconTreeNode[]>([]);
  const [placesNodes, setPlacesNodes] = useState<LexiconTreeNode[]>([]);
  const [placesDescriptions, setPlacesDescriptions] = useState<ServiceText[]>([]);
  const [placesSearchQuery, setPlacesSearchQuery] = useState('');
  const [placesSearchResults, setPlacesSearchResults] = useState<LexiconTreeNode[]>([]);

  // Tab 5: Proverbs & Dates state
  const [subTab5, setSubTab5] = useState<'amthal' | 'dates'>('amthal');
  const [tab5Query, setTab5Query] = useState('');
  const [tab5Results, setTab5Results] = useState<{ ID: number; Text: string }[]>([]);

  const [selectedHadithDetail, setSelectedHadithDetail] = useState<{
    Title: string;
    BookName: string;
    HadithNum: string | number;
    PartNum?: number;
    PageNum?: number;
    CleanContent: string;
    Annotations: Annotation[] | null;
  } | null>(null);

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

  // Tab 1: Load Subject Tree Children
  const loadSubjectChildren = async (parentId: number, node?: SubjectTreeNode) => {
    setLoading(true);
    try {
      const res = await api.getSubjectTree(undefined, parentId);
      if (res.nodes) {
        setSubjectNodes(res.nodes);
        setSubjectHadiths([]); // Clear hadiths until leaf selection

        // Update path breadcrumbs
        if (parentId === 0) {
          setSubjectPath([]);
        } else if (node) {
          const idx = subjectPath.findIndex((p) => p.ID === node.ID);
          if (idx !== -1) {
            setSubjectPath(subjectPath.slice(0, idx + 1));
          } else {
            // Find parent index to replace sub-path if needed
            const pIdx = subjectPath.findIndex((p) => p.ID === node.ParentID);
            if (pIdx !== -1) {
              setSubjectPath([...subjectPath.slice(0, pIdx + 1), node]);
            } else {
              setSubjectPath([...subjectPath, node]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Load Hadiths for a Leaf Subject
  const selectSubjectLeaf = async (node: SubjectTreeNode) => {
    setLoading(true);
    setSubjectNodes([]);
    setSubjectPath([...subjectPath.filter(p => p.ID !== node.ID), node]);
    try {
      const res = await api.getSubjectTree(node.ID);
      if (res.hadiths) {
        setSubjectHadiths(res.hadiths);
      }
    } catch (err) {
      console.error(err);
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
  const loadControChildren = async (parentId: number, node?: ControversialTreeNode) => {
    setLoading(true);
    try {
      const res = await api.getControversial(undefined, parentId);
      if (res.nodes) {
        setControNodes(res.nodes);
        setControExplanations([]);

        if (parentId === 0) {
          setControPath([]);
        } else if (node) {
          const idx = controPath.findIndex((p) => p.ID === node.ID);
          if (idx !== -1) {
            setControPath(controPath.slice(0, idx + 1));
          } else {
            const pIdx = controPath.findIndex((p) => p.ID === node.ParentID);
            if (pIdx !== -1) {
              setControPath([...controPath.slice(0, pIdx + 1), node]);
            } else {
              setControPath([...controPath, node]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Load Reconciliations for Controversial Node
  const selectControLeaf = async (node: ControversialTreeNode) => {
    setLoading(true);
    setControNodes([]);
    setControPath([...controPath.filter(p => p.ID !== node.ID), node]);
    try {
      const res = await api.getControversial(node.ID);
      if (res.descriptions) {
        setControExplanations(res.descriptions);
      }
    } catch (err) {
      console.error(err);
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
  const loadGhareebChildren = async (parentId: number, node?: LexiconTreeNode) => {
    setLoading(true);
    try {
      const res = await api.getLexiconGhareeb(undefined, parentId);
      if (res.items) {
        setGhareebNodes(res.items);
        setGhareebDescriptions([]);

        if (parentId === 0) {
          setGhareebPath([]);
        } else if (node) {
          const idx = ghareebPath.findIndex((p) => p.ID === node.ID);
          if (idx !== -1) {
            setGhareebPath(ghareebPath.slice(0, idx + 1));
          } else {
            const pIdx = ghareebPath.findIndex((p) => p.ID === node.ParentID);
            if (pIdx !== -1) {
              setGhareebPath([...ghareebPath.slice(0, pIdx + 1), node]);
            } else {
              setGhareebPath([...ghareebPath, node]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 3: Load Definitions for Ghareeb Word
  const selectGhareebLeaf = async (node: LexiconTreeNode) => {
    setLoading(true);
    setGhareebNodes([]);
    setGhareebPath([...ghareebPath.filter(p => p.ID !== node.ID), node]);
    try {
      const res = await api.getLexiconGhareeb(node.ID);
      if (res.descriptions) {
        setGhareebDescriptions(res.descriptions);
      }
    } catch (err) {
      console.error(err);
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
  const loadPlacesChildren = async (parentId: number, node?: LexiconTreeNode) => {
    setLoading(true);
    try {
      const res = await api.getLexiconPlaces(undefined, parentId);
      if (res.items) {
        setPlacesNodes(res.items);
        setPlacesDescriptions([]);

        if (parentId === 1) {
          setPlacesPath([]);
        } else if (node) {
          const idx = placesPath.findIndex((p) => p.ID === node.ID);
          if (idx !== -1) {
            setPlacesPath(placesPath.slice(0, idx + 1));
          } else {
            const pIdx = placesPath.findIndex((p) => p.ID === node.ParentID);
            if (pIdx !== -1) {
              setPlacesPath([...placesPath.slice(0, pIdx + 1), node]);
            } else {
              setPlacesPath([...placesPath, node]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 4: Load Narrators/Details for Place
  const selectPlacesLeaf = async (node: LexiconTreeNode) => {
    setLoading(true);
    setPlacesNodes([]);
    setPlacesPath([...placesPath.filter(p => p.ID !== node.ID), node]);
    try {
      const res = await api.getLexiconPlaces(node.ID);
      if (res.descriptions) {
        setPlacesDescriptions(res.descriptions);
      }
    } catch (err) {
      console.error(err);
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

  // Show detailed content in modal
  const showDetailModal = (title: string, bookName: string, num: string | number, part: number | undefined, page: number | undefined, content: string, annotations: Annotation[] | null) => {
    setSelectedHadithDetail({ Title: title, BookName: bookName, HadithNum: num, PartNum: part, PageNum: page, CleanContent: content, Annotations: annotations });
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
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث بالمسائل الفقهية</h3>
              <form onSubmit={handleSubjectSearch} className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن موضوع..."
                  value={subjectSearchQuery}
                  onChange={(e) => setSubjectSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
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

              {/* Path Breadcrumbs */}
              {subjectPath.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <button onClick={() => loadSubjectChildren(0)} className="sciences-hub-text-2">الرئيسية</button>
                  {subjectPath.map((node, i) => (
                    <React.Fragment key={node.ID}>
                      <span>←</span>
                      <button
                        onClick={() => loadSubjectChildren(node.ParentID, node)}
                        className={`${i === subjectPath.length - 1 ? 'text-slate-200 font-extrabold' : 'text-emerald-450 hover:underline'}`}
                      >
                        {node.SubjectTitle}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Children List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {subjectSearchQuery.trim() && subjectSearchResults.length > 0 ? (
                  // Search Results View
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-2">نتائج البحث المباشر:</span>
                    {subjectSearchResults.map((node) => (
                      <button
                        key={node.ID}
                        onClick={() => node.IsLeaf ? selectSubjectLeaf(node) : loadSubjectChildren(node.ID, node)}
                        className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                      >
                        <span>{renderHighlighted(node.SubjectTitle, subjectSearchQuery)}</span>
                        <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'ورقة فقهية' : 'تفرع'}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  // Normal Tree Children View
                  subjectNodes.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectSubjectLeaf(node) : loadSubjectChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-350 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span className={node.IsLeaf ? 'font-medium' : 'font-extrabold text-emerald-450'}>
                        {node.SubjectTitle}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {node.IsLeaf ? '•' : '◀'}
                      </span>
                    </button>
                  ))
                )}
              </div>
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
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                تصفح شجرة الموضوعات باليمين وانقر على مسألة (ورقة فقهية) لعرض نصوص الأحاديث النبوية المرتبطة بها
              </div>
            ) : (
              <div className="space-y-4">
                {subjectHadiths.map((hit) => (
                  <div
                    key={hit.MainID}
                    onClick={() => onSelectHadith ? onSelectHadith(hit.MainID) : showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                    className="group rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <h5 className="font-extrabold text-slate-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                      {hit.Title}
                    </h5>
                    <div className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                    </div>
                    <div className="mt-4.5 flex flex-wrap gap-2.5 text-[10px] text-slate-500 border-t border-slate-850 pt-2.5">
                      <span className="bg-emerald-950/20 text-emerald-450 border border-emerald-900/30 px-2 py-0.5 rounded font-bold">{hit.BookName}</span>
                      <span>الحديث رقم: {hit.HadithNum}</span>
                      {hit.PartNum !== undefined && <span>ج: {hit.PartNum}</span>}
                      {hit.PageNum !== undefined && <span>ص: {hit.PageNum}</span>}
                    </div>
                  </div>
                ))}
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
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">تصفح مشكل الحديث ومختلف الآثار</h3>
              <form onSubmit={handleControSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث بالكلمة في العناوين..."
                  value={controSearchQuery}
                  onChange={(e) => setControSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
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

              {/* Breadcrumbs */}
              {controPath.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <button onClick={() => loadControChildren(0)} className="thematic-hub-text-4">الرئيسية</button>
                  {controPath.map((node, i) => (
                    <React.Fragment key={node.ID}>
                      <span>←</span>
                      <button
                        onClick={() => loadControChildren(node.ParentID, node)}
                        className={`${i === controPath.length - 1 ? 'text-slate-200 font-black' : 'text-emerald-455 hover:underline'}`}
                      >
                        {node.Text}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {controSearchQuery.trim() && controSearchResults.length > 0 ? (
                  controSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectControLeaf(node) : loadControChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, controSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'مسألة مشكل' : 'تفرع'}</span>
                    </button>
                  ))
                ) : (
                  controNodes.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectControLeaf(node) : loadControChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-350 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span className={node.IsLeaf ? 'font-medium' : 'font-extrabold text-emerald-455'}>
                        {node.Text}
                      </span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? '•' : '◀'}</span>
                    </button>
                  ))
                )}
              </div>
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
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر مسألة إشكال أو وجه اختلاف من الشجرة اليمنى لعرض نصوص شرح مشكل الآثار وتأويلها ودراستها المقارنة
              </div>
            ) : (
              <div className="space-y-4">
                {controExplanations.map((exp) => (
                  <div
                    key={exp.MainID}
                    onClick={() => showDetailModal(exp.Title, exp.BookName, exp.HadithNum, exp.PartNum, exp.PageNum, exp.CleanContent, exp.Annotations)}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-amber-500">{exp.BookName}</span>
                      <span className="text-[10px] text-slate-500">حقم: {exp.HadithNum}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-200 leading-relaxed mb-3">
                      {exp.Title}
                    </h5>
                    <div className="sciences-hub-text-8">
                      <HadithContentRenderer content={exp.CleanContent} annotations={exp.Annotations || undefined} />
                    </div>
                  </div>
                ))}
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
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث بمعجم غريب ألفاظ الحديث</h3>
              <form onSubmit={handleGhareebSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن كلمة غريبة..."
                  value={ghareebSearchQuery}
                  onChange={(e) => setGhareebSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
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

              {/* Breadcrumbs */}
              {ghareebPath.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <button onClick={() => loadGhareebChildren(0)} className="sciences-hub-text-2">الرئيسية</button>
                  {ghareebPath.map((node, i) => (
                    <React.Fragment key={node.ID}>
                      <span>←</span>
                      <button
                        onClick={() => loadGhareebChildren(node.ParentID, node)}
                        className={`${i === ghareebPath.length - 1 ? 'text-slate-200 font-black' : 'text-emerald-450 hover:underline'}`}
                      >
                        {node.Text}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {ghareebSearchQuery.trim() && ghareebSearchResults.length > 0 ? (
                  ghareebSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectGhareebLeaf(node) : loadGhareebChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, ghareebSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'كلمة معجمية' : 'فرع'}</span>
                    </button>
                  ))
                ) : (
                  ghareebNodes.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectGhareebLeaf(node) : loadGhareebChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-350 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span className={node.IsLeaf ? 'font-medium' : 'font-extrabold text-emerald-450'}>
                        {node.Text}
                      </span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? '•' : '◀'}</span>
                    </button>
                  ))
                )}
              </div>
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
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر الحرف أو المصطلح أو الكلمة الغريبة باليمين لعرض مقتبسات قواميس غريب الحديث وشروح اللغة المقابلة لها
              </div>
            ) : (
              <div className="space-y-4">
                {ghareebDescriptions.map((desc) => (
                  <div
                    key={desc.MainID}
                    onClick={() => showDetailModal(desc.Title, desc.BookName, desc.HadithNum, desc.PartNum, desc.PageNum, desc.CleanContent, desc.Annotations)}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-amber-500">{desc.BookName}</span>
                      <span className="text-[10px] text-slate-500">حقم: {desc.HadithNum}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-200 leading-relaxed mb-3">
                      {desc.Title}
                    </h5>
                    <div className="sciences-hub-text-8">
                      <HadithContentRenderer content={desc.CleanContent} annotations={desc.Annotations || undefined} />
                    </div>
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
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث بمعجم البلدان والقصور والديار</h3>
              <form onSubmit={handlePlacesSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن مكان..."
                  value={placesSearchQuery}
                  onChange={(e) => setPlacesSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
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

              {/* Breadcrumbs */}
              {placesPath.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <button onClick={() => loadPlacesChildren(1)} className="sciences-hub-text-2">الرئيسية</button>
                  {placesPath.map((node, i) => (
                    <React.Fragment key={node.ID}>
                      <span>←</span>
                      <button
                        onClick={() => loadPlacesChildren(node.ParentID, node)}
                        className={`${i === placesPath.length - 1 ? 'text-slate-200 font-black' : 'text-emerald-450 hover:underline'}`}
                      >
                        {node.Text}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {placesSearchQuery.trim() && placesSearchResults.length > 0 ? (
                  placesSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectPlacesLeaf(node) : loadPlacesChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, placesSearchQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'موقع جغرافي' : 'حرف'}</span>
                    </button>
                  ))
                ) : (
                  placesNodes.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectPlacesLeaf(node) : loadPlacesChildren(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-355 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span className={node.IsLeaf ? 'font-medium' : 'font-extrabold text-emerald-450'}>
                        {node.Text}
                      </span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? '•' : '◀'}</span>
                    </button>
                  ))
                )}
              </div>
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
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر بلداً أو دياراً أو قصراً بالجانب الأيمن لاستعراض مرويات موقعه الجغرافي وقائمة الرواة اللذين عاشوا أو رحلوا إليه
              </div>
            ) : (
              <div className="space-y-4">
                {placesDescriptions.map((desc) => (
                  <div
                    key={desc.MainID}
                    onClick={() => showDetailModal(desc.Title, desc.BookName, desc.HadithNum, desc.PartNum, desc.PageNum, desc.CleanContent, desc.Annotations)}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-amber-500">{desc.BookName}</span>
                      <span className="text-[10px] text-slate-500">حقم: {desc.HadithNum}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-200 leading-relaxed mb-3">
                      {desc.Title}
                    </h5>
                    <div className="text-sm text-slate-355 leading-relaxed bg-slate-950/20 p-3 rounded-lg border border-slate-800/50 font-medium">
                      <HadithContentRenderer content={desc.CleanContent} annotations={desc.Annotations || undefined} />
                    </div>
                  </div>
                ))}
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

      {/* Local Hadith Detail Modal */}
      {selectedHadithDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <h3 className="font-black text-slate-200 text-sm md:text-base leading-relaxed">
                تفاصيل موضع الشرح والاستدلال
              </h3>
              <button
                onClick={() => setSelectedHadithDetail(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <h4 className="text-base font-black text-emerald-450 leading-relaxed">
                {selectedHadithDetail.Title}
              </h4>
              <div className="flex flex-wrap gap-3 text-xs text-slate-450 border-y border-slate-800/80 py-3">
                <span className="font-bold text-slate-300">الكتاب: {selectedHadithDetail.BookName}</span>
                <span>رقم الفقرة: {selectedHadithDetail.HadithNum}</span>
                {selectedHadithDetail.PartNum !== undefined && <span>الجزء: {selectedHadithDetail.PartNum}</span>}
                {selectedHadithDetail.PageNum !== undefined && <span>الصفحة: {selectedHadithDetail.PageNum}</span>}
              </div>
              <div className="text-sm text-slate-300 leading-relaxed font-semibold bg-slate-950/40 rounded-xl p-4.5 border border-slate-850">
                <HadithContentRenderer content={selectedHadithDetail.CleanContent} annotations={selectedHadithDetail.Annotations || undefined} />
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setSelectedHadithDetail(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
