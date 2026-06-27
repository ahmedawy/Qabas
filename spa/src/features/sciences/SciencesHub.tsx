import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type {
  ExpressionTreeNode,
  ScholarDefinition,
  HadithJudgmentResult,
  HadithServiceResult,
  SurahIndex,
  VerseIndex,
  IndexCategoryNode,
  IndexItemNode,
  ServiceText,
  Annotation
} from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';
import { HadithContentRenderer } from '../hadiths/HadithCard';

interface SciencesHubProps {
  onSelectHadith?: (id: number) => void;
  onSelectNarrator?: (id: number) => void;
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
}

type TabType = 'terms' | 'judgments' | 'sciences' | 'quran' | 'names' | 'poetry';

export const SciencesHub: React.FC<SciencesHubProps> = ({ 
  onSelectHadith, 
  onSelectNarrator,
  activeTab: propActiveTab,
  onTabChange
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>('terms');
  const activeTab = (propActiveTab as TabType) || localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };
  const [loading, setLoading] = useState(false);

  // Tab 1: Term Definitions & Tree state
  const [termPath, setTermPath] = useState<ExpressionTreeNode[]>([]);
  const [termNodes, setTermNodes] = useState<ExpressionTreeNode[]>([]);
  const [termDefinitions, setTermDefinitions] = useState<ScholarDefinition[]>([]);
  const [termQuery, setTermQuery] = useState('');
  const [termSearchResults, setTermSearchResults] = useState<ExpressionTreeNode[]>([]);

  // Tab 2: Scholarly Judgments state
  const [judgmentQuery, setJudgmentQuery] = useState('');
  const [judgmentResults, setJudgmentResults] = useState<HadithJudgmentResult[]>([]);

  // Tab 3: Hadith Sciences/Opinions state
  const [scienceTypes, setScienceTypes] = useState<Array<{ ID: number; Name: string }>>([]);
  const [selectedScienceTypeId, setSelectedScienceTypeId] = useState<number | string>('all');
  const [scienceQuery, setScienceQuery] = useState('');
  const [scienceResults, setScienceResults] = useState<HadithServiceResult[]>([]);

  // Tab 4: Quran Index state
  const [surahs, setSurahs] = useState<SurahIndex[]>([]);
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [verses, setVerses] = useState<VerseIndex[]>([]);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);
  const [verseHadiths, setVerseHadiths] = useState<ServiceText[]>([]);
  const [quranQuery, setQuranQuery] = useState('');
  const [quranSearchResults, setQuranSearchResults] = useState<VerseIndex[]>([]);

  // Tab 5: Names Index state
  const [nameSubcategories, setNameSubcategories] = useState<IndexCategoryNode[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [nameItems, setNameItems] = useState<IndexItemNode[]>([]);
  const [selectedNameItemId, setSelectedNameItemId] = useState<number | null>(null);
  const [nameHadiths, setNameHadiths] = useState<ServiceText[]>([]);
  const [nameServices, setNameServices] = useState<ServiceText[]>([]);
  const [namesQuery, setNamesQuery] = useState('');

  // Tab 6: Poetry Index state
  const [poetryQuery, setPoetryQuery] = useState('');
  const [poetryItems, setPoetryItems] = useState<IndexItemNode[]>([]);
  const [selectedPoetryItemId, setSelectedPoetryItemId] = useState<number | null>(null);
  const [poetryHadiths, setPoetryHadiths] = useState<ServiceText[]>([]);
  const [poetryServices, setPoetryServices] = useState<ServiceText[]>([]);

  // Local Hadith Detail modal state
  const [selectedHadithDetail, setSelectedHadithDetail] = useState<{
    Title: string;
    BookName: string;
    HadithNum: string | number;
    PartNum?: number;
    PageNum?: number;
    CleanContent: string;
    Annotations: Annotation[] | null;
  } | null>(null);

  // Initialize data
  useEffect(() => {
    loadTermNodes(0);
    loadScienceTypes();
    loadSurahs();
    loadNameCategories();
    loadPoetryItems();
  }, []);

  // Trigger search on query changes for specific tabs
  useEffect(() => {
    if (activeTab === 'judgments') {
      loadJudgments();
    }
  }, [judgmentQuery, activeTab]);

  useEffect(() => {
    if (activeTab === 'sciences') {
      loadScienceResults();
    }
  }, [selectedScienceTypeId, scienceQuery, activeTab]);

  // Tab 1: Load Term Tree Nodes
  const loadTermNodes = async (parentId: number, node?: ExpressionTreeNode) => {
    setLoading(true);
    try {
      const res = await api.getExpressionTree(parentId);
      setTermNodes(res.nodes);
      setTermDefinitions([]);

      if (parentId === 0) {
        setTermPath([]);
      } else if (node) {
        const idx = termPath.findIndex((p) => p.ID === node.ID);
        if (idx !== -1) {
          setTermPath(termPath.slice(0, idx + 1));
        } else {
          const pIdx = termPath.findIndex((p) => p.ID === node.ParentID);
          if (pIdx !== -1) {
            setTermPath([...termPath.slice(0, pIdx + 1), node]);
          } else {
            setTermPath([...termPath, node]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Select Term and load scholar definitions
  const selectTermLeaf = async (node: ExpressionTreeNode) => {
    setLoading(true);
    setTermNodes([]);
    setTermPath([...termPath.filter(p => p.ID !== node.ID), node]);
    try {
      const res = await api.getDefinitions(node.ID);
      setTermDefinitions(res.definitions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Search term tree
  const handleTermSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getExpressionTree(undefined, termQuery);
      setTermSearchResults(res.nodes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Load Judgments
  const loadJudgments = async () => {
    setLoading(true);
    try {
      const res = await api.getScSayHadith(undefined, judgmentQuery);
      if (res.results) {
        setJudgmentResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 3: Load Science Types & Results
  const loadScienceTypes = async () => {
    try {
      const res = await api.getScSayScience(undefined, 'all');
      if (res.types) {
        setScienceTypes(res.types);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadScienceResults = async () => {
    setLoading(true);
    try {
      const tId = selectedScienceTypeId === 'all' ? undefined : Number(selectedScienceTypeId);
      const res = await api.getScSayScience(undefined, tId, scienceQuery);
      if (res.results) {
        setScienceResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 4: Quran Index
  const loadSurahs = async () => {
    try {
      const res = await api.getIndexVerses();
      if (res.surahs) {
        setSurahs(res.surahs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSurahSelect = async (surahId: number) => {
    setSelectedSurahId(surahId);
    setSelectedVerseNum(null);
    setVerseHadiths([]);
    setLoading(true);
    try {
      const res = await api.getIndexVerses(surahId);
      if (res.verses) {
        setVerses(res.verses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerseSelect = async (verseNum: number) => {
    if (!selectedSurahId) return;
    setSelectedVerseNum(verseNum);
    setLoading(true);
    try {
      const res = await api.getIndexVerses(selectedSurahId, verseNum);
      if (res.results) {
        setVerseHadiths(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuranSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quranQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getIndexVerses(undefined, undefined, quranQuery);
      if (res.results) {
        // Results returned inside results or verses
        setQuranSearchResults(res.results as any);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 5: Names Index
  const loadNameCategories = async () => {
    try {
      const res = await api.getIndexNames();
      if (res.subcategories) {
        setNameSubcategories(res.subcategories);
        if (res.subcategories.length > 0) {
          handleNameCategorySelect(res.subcategories[0].ID);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameCategorySelect = async (catId: number) => {
    setSelectedCategoryId(catId);
    setSelectedNameItemId(null);
    setNameHadiths([]);
    setNameServices([]);
    setLoading(true);
    try {
      const res = await api.getIndexNames(catId);
      if (res.items) {
        setNameItems(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameItemSelect = async (itemId: number) => {
    setSelectedNameItemId(itemId);
    setLoading(true);
    try {
      const res = await api.getIndexNames(undefined, itemId);
      if (res.hadiths && res.services) {
        setNameHadiths(res.hadiths);
        setNameServices(res.services);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNamesSearch = async () => {
    if (!namesQuery.trim()) return;
    setLoading(true);
    try {
      const res = await api.getIndexNames(selectedCategoryId || undefined, undefined, namesQuery);
      if (res.items) {
        setNameItems(res.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 6: Poetry Index
  const loadPoetryItems = async () => {
    setLoading(true);
    try {
      const res = await api.getIndexPoetry(undefined, poetryQuery);
      if (res.results) {
        setPoetryItems(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePoetryItemSelect = async (itemId: number) => {
    setSelectedPoetryItemId(itemId);
    setLoading(true);
    try {
      const res = await api.getIndexPoetry(itemId);
      if (res.hadiths && res.services) {
        setPoetryHadiths(res.hadiths);
        setPoetryServices(res.services);
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
        <div className="atraf-hub-grid-11"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-black text-emerald-300 leading-tight">
            بوابة علوم الحديث وفهارس الآيات والأعلام والشعر
          </h1>
          <p className="mt-3 text-base text-slate-350 leading-relaxed">
            استعرض شجرة مصطلحات الحديث النبوي، وتدقيق أحكام المحدثين والنقاد، مع البحث الفهرسي الدقيق في الآيات القرآنية المرتبطة، والأعلام والشخصيات والقصائد الشعرية.
          </p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="border-b border-slate-800 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
          {(
            [
              { id: 'terms', label: 'علوم ومصطلحات الحديث' },
              { id: 'judgments', label: 'أحكام النقاد على الأحاديث' },
              { id: 'sciences', label: 'أقوال المحدثين والعلل' },
              { id: 'quran', label: 'فهرس الآيات القرآنية' },
              { id: 'names', label: 'فهرس أعلام الرواية والأثر' },
              { id: 'poetry', label: 'فهرس الأبيات الشعرية' },
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

      {/* Tab 1: Term Definitions & Tree */}
      {activeTab === 'terms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tree Browser */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">شجرة علوم الحديث ومصطلحاته</h3>
              <form onSubmit={handleTermSearch} className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  placeholder="ابحث عن مصطلح..."
                  value={termQuery}
                  onChange={(e) => setTermQuery(e.target.value)}
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
              {termPath.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <button onClick={() => loadTermNodes(0)} className="sciences-hub-text-2">الرئيسية</button>
                  {termPath.map((node, i) => (
                    <React.Fragment key={node.ID}>
                      <span>←</span>
                      <button
                        onClick={() => loadTermNodes(node.ParentID, node)}
                        className={`${i === termPath.length - 1 ? 'text-slate-200 font-extrabold' : 'text-emerald-450 hover:underline'}`}
                      >
                        {node.Text}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Children List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {termQuery.trim() && termSearchResults.length > 0 ? (
                  termSearchResults.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectTermLeaf(node) : loadTermNodes(node.ID, node)}
                      className="w-full text-right text-xs px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 flex justify-between items-center"
                    >
                      <span>{renderHighlighted(node.Text, termQuery)}</span>
                      <span className="text-[10px] text-slate-500">{node.IsLeaf ? 'تعريف' : 'تفرع'}</span>
                    </button>
                  ))
                ) : (
                  termNodes.map((node) => (
                    <button
                      key={node.ID}
                      onClick={() => node.IsLeaf ? selectTermLeaf(node) : loadTermNodes(node.ID, node)}
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

          {/* Definitions List */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">شروح وأقوال أئمة النقد في دلالة المصطلح</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : termDefinitions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر مصطلحًا فنيّاً (علمياً) بالجانب الأيمن لعرض شروحه اللغوية وتعريفات المحدثين والعلماء النقاد له
              </div>
            ) : (
              <div className="space-y-4">
                {termDefinitions.map((def, i) => (
                  <div
                    key={i}
                    className="sciences-hub-card-10"
                  >
                    <div className="atraf-hub-wrapper-21">
                      <span
                        onClick={() => onSelectNarrator && def.ScholarName ? api.getNarratorsList(def.ScholarName).then(r => r.results.length > 0 && onSelectNarrator(r.results[0].ID)) : null}
                        className="sciences-hub-title-11"
                      >
                        القول للحافظ: {def.ScholarName}
                      </span>
                      {def.BookName && (
                        <span className="sciences-hub-text-12">المصدر: {def.BookName} (ج {def.PartNum} ص {def.PageNum})</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-semibold bg-slate-950/40 rounded-lg p-3.5 border border-slate-850">
                      «{def.Say}»
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Scholarly Judgments */}
      {activeTab === 'judgments' && (
        <div className="space-y-6">
          <div className="atraf-hub-card-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث بأحكام أئمة الحديث ونقاد الأثر</h3>
            <input
              type="text"
              placeholder="ابحث بلفظ الحكم (مثال: حديث صحيح، إسناد ضعيف، منكر الحديث)..."
              value={judgmentQuery}
              onChange={(e) => setJudgmentQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              dir="rtl"
            />
          </div>

          <div className="space-y-4">
            <h4 className="atraf-hub-title-5">الأحكام والمرويات المسجلة ({judgmentResults.length})</h4>
            {loading && judgmentResults.length === 0 ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : judgmentResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                أدخل لفظ الحكم لاستعراض الأحاديث المرتبطة به وأقوال النقاد المسندة
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {judgmentResults.map((item) => (
                  <div
                    key={item.MainID}
                    onClick={() => onSelectHadith ? onSelectHadith(item.MainID) : null}
                    className="group rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="narrator-hub-wrapper-1">
                      <span className="text-xs font-black text-amber-500">{item.BookName} (حقم: {item.HadithNum})</span>
                      <span className="sciences-hub-title-14">
                        {item.JudgmentText}
                      </span>
                    </div>
                    <h5 className="sciences-hub-text-15">
                      {item.Title}
                    </h5>
                    <span className="text-[10px] text-slate-500 block">الناقد الموثق للرتبة: {item.ScholarName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Science Opinions */}
      {activeTab === 'sciences' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">علوم الحديث الفرعية</h3>
              <div className="sciences-hub-element-17">
                <button
                  onClick={() => setSelectedScienceTypeId('all')}
                  className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                    selectedScienceTypeId === 'all'
                      ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                      : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                  }`}
                >
                  جميع العلوم
                </button>
                {scienceTypes.map((type) => (
                  <button
                    key={type.ID}
                    onClick={() => setSelectedScienceTypeId(type.ID)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      selectedScienceTypeId === type.ID
                        ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    {type.Name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="atraf-hub-card-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">تصفية وبحث في مرويات العلوم</h3>
              <input
                type="text"
                placeholder="ابحث بكلمة في دراسات العلم والمرويات..."
                value={scienceQuery}
                onChange={(e) => setScienceQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                dir="rtl"
              />
            </div>

            <div className="space-y-4">
              <h4 className="atraf-hub-title-5">نصوص علوم الحديث المقابلة ({scienceResults.length})</h4>
              {loading && scienceResults.length === 0 ? (
                <div className="flex py-12 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : scienceResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  لم يتم إيجاد دراسات وعلوم مسجلة مطابقة للبحث
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scienceResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectHadith ? onSelectHadith(item.MainID) : null}
                      className="group rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="narrator-hub-wrapper-1">
                        <span className="text-xs font-black text-amber-500">{item.BookName} (حقم: {item.HadithNum})</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-semibold border border-slate-700/60">
                          {item.ServiceTypeName}
                        </span>
                      </div>
                      <h5 className="sciences-hub-text-19">
                        {item.Title}
                      </h5>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Quran Index */}
      {activeTab === 'quran' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Surahs / Verses Selectors */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Verses */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث في الآيات الكريمة</h3>
              <form onSubmit={handleQuranSearch} className="flex gap-2.5 mb-4">
                <input
                  type="text"
                  placeholder="ابحث بكلمة في الآيات..."
                  value={quranQuery}
                  onChange={(e) => setQuranQuery(e.target.value)}
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

              {quranSearchResults.length > 0 && (
                <div>
                  <h4 className="sciences-hub-title-20">نتائج البحث:</h4>
                  <div className="sciences-hub-element-3">
                    {quranSearchResults.map((v) => (
                      <button
                        key={v.ID}
                        onClick={async () => {
                          setSelectedSurahId(v.SoraID);
                          setSelectedVerseNum(v.AyaNum);
                          setLoading(true);
                          try {
                            const res = await api.getIndexVerses(v.SoraID, v.AyaNum);
                            if (res.results) {
                              setVerseHadiths(res.results);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className={`w-full text-right text-[11px] px-3 py-2 rounded-lg transition-all ${
                          selectedSurahId === v.SoraID && selectedVerseNum === v.AyaNum
                            ? 'bg-amber-950/40 text-amber-400 font-extrabold border border-amber-900/40'
                            : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                        }`}
                      >
                        {v.Text} (آية {v.AyaNum})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Surahs selector */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">سور القرآن الكريم</h3>
              <div className="sciences-hub-element-3">
                {surahs.map((s) => (
                  <button
                    key={s.ID}
                    onClick={() => handleSurahSelect(s.ID)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      selectedSurahId === s.ID
                        ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    سورة {s.Name}
                  </button>
                ))}
              </div>
            </div>

            {/* Verses selector */}
            {selectedSurahId !== null && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                <h3 className="atraf-hub-title-2">آيات السورة الكريمة</h3>
                <div className="sciences-hub-element-3">
                  {verses.map((v) => (
                    <button
                      key={v.ID}
                      onClick={() => handleVerseSelect(v.AyaNum)}
                      className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                        selectedVerseNum === v.AyaNum
                          ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                          : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                    >
                      آية {v.AyaNum}: {v.Text.slice(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hadith list */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">مرويات الربط وتفسير الآيات بالحديث</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : verseHadiths.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر السورة والآية الكريمة باليسار لعرض نصوص الأحاديث النبوية وشروح أسباب النزول ومأثور التفسير المقرون بها
              </div>
            ) : (
              <div className="space-y-4">
                {verseHadiths.map((hit) => (
                  <div
                    key={hit.MainID}
                    onClick={() => showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                    className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-amber-500">{hit.BookName}</span>
                      <span className="text-[10px] text-slate-500">حقم: {hit.HadithNum}</span>
                    </div>
                    <h5 className="font-extrabold text-slate-200 leading-relaxed mb-3">
                      {hit.Title}
                    </h5>
                    <div className="sciences-hub-text-8">
                      <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Names Index */}
      {activeTab === 'names' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Subcategories Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">تصنيفات الأعلام</h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 mb-4">
                {nameSubcategories.map((sub) => (
                  <button
                    key={sub.ID}
                    onClick={() => handleNameCategorySelect(sub.ID)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      selectedCategoryId === sub.ID
                        ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    أعلام: {sub.Title}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <h3 className="text-xs font-bold text-slate-500 mb-3 pb-1 border-b border-slate-850">مسرد الأعلام والأشخاص</h3>
              <div className="sciences-hub-element-22">
                <input
                  type="text"
                  placeholder="فلترة الأسماء..."
                  value={namesQuery}
                  onChange={(e) => setNamesQuery(e.target.value)}
                  className="sciences-hub-text-23"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleNamesSearch}
                  className="sciences-hub-title-24"
                >
                  تصفية
                </button>
              </div>
              <div className="sciences-hub-element-3">
                {nameItems.map((item) => (
                  <button
                    key={item.ID}
                    onClick={() => handleNameItemSelect(item.ID)}
                    className={`w-full text-right text-[11px] px-3 py-2 rounded-lg transition-all ${
                      selectedNameItemId === item.ID
                        ? 'bg-amber-950/40 text-amber-400 font-extrabold border border-amber-900/40'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    {item.Title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Names linking hadiths */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">مواضع ومرويات العلم والاسم المحدّد</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : selectedNameItemId === null ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر التصنيف والاسم باليمين لعرض مرويات السيرة أو أطراف الأحاديث التي تذكر هذا العلم أو الشخصية في نصوصها
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="sciences-hub-title-4">مواضع متون الأحاديث (Hadiths):</span>
                  {nameHadiths.length === 0 ? (
                    <div className="sciences-hub-text-5">لا توجد مرويات حديثية مباشرة مسجلة لهذا العلم.</div>
                  ) : (
                    <div className="atraf-hub-grid-9">
                      {nameHadiths.map((hit) => (
                        <div
                          key={hit.MainID}
                          onClick={() => showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                          className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="sciences-hub-wrapper-6">
                            <span className="atraf-hub-title-20">{hit.BookName}</span>
                            <span className="text-[10px] text-slate-500">حقم: {hit.HadithNum}</span>
                          </div>
                          <h5 className="sciences-hub-text-7">
                            {hit.Title}
                          </h5>
                          <div className="sciences-hub-text-9">
                            <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <span className="sciences-hub-title-4">مواضع شروح السيرة والتعليقات (Services):</span>
                  {nameServices.length === 0 ? (
                    <div className="sciences-hub-text-5">لا توجد شروح سيرة أو إيضاحات إضافية مسجلة لهذا العلم.</div>
                  ) : (
                    <div className="atraf-hub-grid-9">
                      {nameServices.map((hit) => (
                        <div
                          key={hit.MainID}
                          onClick={() => showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                          className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="sciences-hub-wrapper-6">
                            <span className="text-xs font-black text-amber-500">{hit.BookName}</span>
                            <span className="text-[10px] text-slate-500">ج {hit.PartNum} ص {hit.PageNum}</span>
                          </div>
                          <h5 className="sciences-hub-text-7">
                            {hit.Title}
                          </h5>
                          <div className="sciences-hub-text-9">
                            <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Poetry Index */}
      {activeTab === 'poetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Poetry Rhymes Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">مسرد القوافي وأشطر الشعر</h3>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="ابحث ببيت الشعر..."
                  value={poetryQuery}
                  onChange={(e) => setPoetryQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-505 focus:border-emerald-500 focus:outline-hidden"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={loadPoetryItems}
                  className="w-full mt-2 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all"
                >
                  فلترة الأشطر
                </button>
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {poetryItems.map((item) => (
                  <button
                    key={item.ID}
                    onClick={() => handlePoetryItemSelect(item.ID)}
                    className={`w-full text-right text-[11px] px-3 py-2 rounded-lg transition-all leading-relaxed ${
                      selectedPoetryItemId === item.ID
                        ? 'bg-amber-950/40 text-amber-400 font-extrabold border border-amber-900/40'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    {item.Title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Poetry linking hadiths */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">مواضع ومرويات البيت الشعري المحدّد</h4>
            {loading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : selectedPoetryItemId === null ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر قافية أو بيت شعر من قائمة الجانب الأيمن لعرض نصوص الأحاديث النبوية وشروح شواهد اللغة التي تستشهد بالبيت في متنها
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="sciences-hub-title-4">مواضع متون الأحاديث (Hadiths):</span>
                  {poetryHadiths.length === 0 ? (
                    <div className="sciences-hub-text-5">لا توجد مرويات حديثية مباشرة تستشهد بهذا البيت.</div>
                  ) : (
                    <div className="atraf-hub-grid-9">
                      {poetryHadiths.map((hit) => (
                        <div
                          key={hit.MainID}
                          onClick={() => showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                          className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="sciences-hub-wrapper-6">
                            <span className="atraf-hub-title-20">{hit.BookName}</span>
                            <span className="text-[10px] text-slate-500">حقم: {hit.HadithNum}</span>
                          </div>
                          <h5 className="sciences-hub-text-7">
                            {hit.Title}
                          </h5>
                          <div className="sciences-hub-text-27">
                            <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <span className="sciences-hub-title-4">مواضع شروح اللغة والشواهد البينية (Services):</span>
                  {poetryServices.length === 0 ? (
                    <div className="sciences-hub-text-5">لا توجد شروح لغوية أو شواهد تفسيرية مسجلة لهذا البيت الشعري.</div>
                  ) : (
                    <div className="atraf-hub-grid-9">
                      {poetryServices.map((hit) => (
                        <div
                          key={hit.MainID}
                          onClick={() => showDetailModal(hit.Title, hit.BookName, hit.HadithNum, hit.PartNum, hit.PageNum, hit.CleanContent, hit.Annotations)}
                          className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="sciences-hub-wrapper-6">
                            <span className="text-xs font-black text-amber-500">{hit.BookName}</span>
                            <span className="text-[10px] text-slate-500">ج {hit.PartNum} ص {hit.PageNum}</span>
                          </div>
                          <h5 className="sciences-hub-text-7">
                            {hit.Title}
                          </h5>
                          <div className="sciences-hub-text-9">
                            <HadithContentRenderer content={hit.CleanContent} annotations={hit.Annotations || undefined} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
              <h3 className="atraf-hub-title-25">
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
              <h4 className="sciences-hub-title-28">
                {selectedHadithDetail.Title}
              </h4>
              <div className="atraf-hub-text-27">
                <span className="font-bold text-slate-300">الكتاب: {selectedHadithDetail.BookName}</span>
                <span>رقم الفقرة: {selectedHadithDetail.HadithNum}</span>
                {selectedHadithDetail.PartNum !== undefined && <span>الجزء: {selectedHadithDetail.PartNum}</span>}
                {selectedHadithDetail.PageNum !== undefined && <span>الصفحة: {selectedHadithDetail.PageNum}</span>}
              </div>
              <div className="text-sm text-slate-300 leading-relaxed font-semibold bg-slate-950/40 rounded-xl p-4.5 border border-slate-850">
                <HadithContentRenderer content={selectedHadithDetail.CleanContent} annotations={selectedHadithDetail.Annotations || undefined} />
              </div>
            </div>
            <div className="atraf-hub-wrapper-29">
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
