import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { Book, AtrafResult, AtrafExtraResult, GroupedMtnResult, NarratorSummary, ServiceText, Annotation } from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';
import { AlphabetBar } from '../search/AlphabetBar';
import { HadithContentRenderer } from '../hadiths/HadithCard';

interface AtrafHubProps {
  onSelectHadith?: (id: number) => void;
  onSelectNarrator?: (id: number) => void;
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
}

type TabType = 'list' | 'comparison' | 'rwah_extra' | 'grouped';

export const AtrafHub: React.FC<AtrafHubProps> = ({ 
  onSelectHadith, 
  onSelectNarrator,
  activeTab: propActiveTab,
  onTabChange
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>('list');
  const activeTab = (propActiveTab as TabType) || localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab 1: Atraf List & Chains state
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [atrafQuery, setAtrafQuery] = useState('');
  const [atrafResults, setAtrafResults] = useState<AtrafResult[]>([]);
  const [searchType, setSearchType] = useState<'text' | 'rawy'>('text');
  const [rawyQuery, setRawyQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Tab 2: Parallel Comparison state
  const [sourceBookId, setSourceBookId] = useState<number>(0);
  const [targetBookId, setTargetBookId] = useState<number>(0);
  const [comparisonResults, setComparisonResults] = useState<AtrafExtraResult[]>([]);

  // Tab 3: Extra Narrators state
  const [extraBookIds, setExtraBookIds] = useState<number[]>([]);
  const [extraQuery, setExtraQuery] = useState('');
  const [extraResults, setExtraResults] = useState<NarratorSummary[]>([]);

  // Tab 4: Grouped/Compound Matns state
  const [groupedQuery, setGroupedQuery] = useState('');
  const [groupedResults, setGroupedResults] = useState<GroupedMtnResult[]>([]);
  const [selectedGroupHadith, setSelectedGroupHadith] = useState<number | null>(null);
  const [groupedHadiths, setGroupedHadiths] = useState<ServiceText[]>([]);

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

  // Load books list
  useEffect(() => {
    api.getBooks().then((res) => {
      setBooks(res.books);
      if (res.books.length > 0) {
        setSelectedBookIds([res.books[0].ID]);
        setSourceBookId(res.books[0].ID);
        if (res.books.length > 1) {
          setTargetBookId(res.books[1].ID);
        }
      }
    }).catch(console.error);
  }, []);

  // Trigger Atraf Search (Tab 1)
  const handleAtrafSearch = async (e?: React.FormEvent, letterOverride?: string | null) => {
    if (e) e.preventDefault();
    if (selectedBookIds.length === 0) return;
    setLoading(true);
    const letterVal = letterOverride !== undefined ? letterOverride : selectedLetter;
    try {
      if (searchType === 'text') {
        const res = await api.getAtrafList(selectedBookIds.join(','), atrafQuery, letterVal || undefined);
        setAtrafResults(res.results);
      } else {
        const res = await api.getAtrafAsaned(selectedBookIds.join(','), rawyQuery, atrafQuery);
        setAtrafResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLetter = (letter: string | null) => {
    setSelectedLetter(letter);
    if (selectedBookIds.length > 0) {
      handleAtrafSearch(undefined, letter);
    }
  };

  // Trigger Comparison Load (Tab 2)
  const handleComparisonLoad = async () => {
    if (!sourceBookId || !targetBookId || sourceBookId === targetBookId) return;
    setLoading(true);
    try {
      const res = await api.getAtrafExtra(sourceBookId, targetBookId);
      setComparisonResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Extra Narrators Search (Tab 3)
  const handleExtraSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (extraBookIds.length === 0) return;
    setLoading(true);
    try {
      const res = await api.getRwahExtra(extraBookIds.join(','), extraQuery);
      setExtraResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Grouped Matns Search (Tab 4)
  const handleGroupedSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.getGroupedMtn(groupedQuery);
      if (res.results) {
        setGroupedResults(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve grouped variants when a Compound Matn is clicked
  const handleGroupedMatnClick = async (hadithMainId: number) => {
    setSelectedGroupHadith(hadithMainId);
    setLoading(true);
    try {
      const res = await api.getGroupedMtn('', hadithMainId);
      if (res.group_hadiths) {
        setGroupedHadiths(res.group_hadiths);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Show detailed content in a local overlay modal
  const showDetailModal = (title: string, bookName: string, num: string | number, part: number | undefined, page: number | undefined, content: string, annotations: Annotation[] | null) => {
    setSelectedHadithDetail({ Title: title, BookName: bookName, HadithNum: num, PartNum: part, PageNum: page, CleanContent: content, Annotations: annotations });
  };

  const handleBookToggle = (bookId: number) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleExtraBookToggle = (bookId: number) => {
    setExtraBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
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
            بوابة الأطراف والمقارنات البينية
          </h1>
          <p className="mt-3 text-base text-slate-350 leading-relaxed">
            استعرض أطراف الأحاديث ومقارنة نصوص المتون جنباً إلى جنب للتعرف على وجوه الاختلاف والزيادة، مع بيان رواة الزوائد والمتون المشتركة لمختلف سلاسل الأسانيد.
          </p>
        </div>
      </div>

      {/* Tabs Nav */}
      <div className="border-b border-slate-800 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
          {(
            [
              { id: 'list', label: 'أطراف الأحاديث والأسانيد' },
              { id: 'comparison', label: 'مقارنة المتون الثنائية' },
              { id: 'rwah_extra', label: 'رواة الزوائد والوفرة' },
              { id: 'grouped', label: 'المتون المشتركة والمجموعات' },
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

      {/* Tab 1: Atraf List & Chains */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">حدد كتب أطراف السنن</h3>
              <div className="atraf-hub-element-16">
                {books.map((book) => (
                  <label key={book.ID} className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(book.ID)}
                      onChange={() => handleBookToggle(book.ID)}
                      className="atraf-hub-text-18"
                    />
                    <span>{book.Title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            {searchType === 'text' && (
              <AlphabetBar
                selectedLetter={selectedLetter}
                onSelectLetter={handleSelectLetter}
              />
            )}
            <div className="atraf-hub-card-30">
              <div className="atraf-hub-element-31">
                <button
                  type="button"
                  onClick={() => setSearchType('text')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${searchType === 'text' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  بحث بمتن الطرف
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('rawy')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${searchType === 'rawy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  بحث بالراوي والطرف
                </button>
              </div>

              <form onSubmit={handleAtrafSearch} className="space-y-4">
                {searchType === 'rawy' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">اسم الراوي (رواة الأسانيد)</label>
                    <input
                      type="text"
                      placeholder="أدخل اسم الراوي في الإسناد..."
                      value={rawyQuery}
                      onChange={(e) => setRawyQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                      dir="rtl"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-slate-400 mb-2">مقطع متن الطرف</label>
                  <div className="atraf-hub-element-14">
                    <input
                      type="text"
                      placeholder="أدخل كلمة أو جملة من أول الحديث (الطرف)..."
                      value={atrafQuery}
                      onChange={(e) => setAtrafQuery(e.target.value)}
                      className="atraf-hub-text-15"
                      dir="rtl"
                    />
                    <button
                      type="submit"
                      disabled={loading || selectedBookIds.length === 0}
                      className="atraf-hub-text-19"
                    >
                      {loading ? 'جاري التحميل...' : 'ابحث الآن'}
                    </button>
                  </div>
                </div>
                {selectedBookIds.length === 0 && (
                  <p className="atraf-hub-text-32">⚠️ الرجاء اختيار كتاب واحد على الأقل من الجانب الأيمن.</p>
                )}
              </form>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">أطراف الأحاديث المكتشفة ({atrafResults.length})</h4>
              {atrafResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  حدد الكتب وخيارات التصفية لعرض قائمة أطراف الأحاديث مع إسنادها وتفاصيل موضعها
                </div>
              ) : (
                <div className="atraf-hub-grid-9">
                  {atrafResults.map((atraf) => (
                    <div
                      key={atraf.MainID}
                      onClick={() => onSelectHadith ? onSelectHadith(atraf.MainID) : showDetailModal(atraf.Text, atraf.BookName, atraf.HadithNum, atraf.PartNum, atraf.PageNum, 'الرجاء النقر على تفاصيل الكتاب لقراءة المتن الكامل.', null)}
                      className="group rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <h5 className="font-extrabold text-slate-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                        {renderHighlighted(atraf.Text, atrafQuery)}
                      </h5>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="atraf-hub-text-34">{atraf.BookName}</span>
                        <span>الحديث رقم: {atraf.HadithNum}</span>
                        {atraf.PartNum !== undefined && <span>الجزء: {atraf.PartNum}</span>}
                        {atraf.PageNum !== undefined && <span>الصفحة: {atraf.PageNum}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="atraf-hub-card-35">
            <h3 className="text-sm font-bold text-slate-200 mb-4">قارن بين كتابين لمعاينة مقارنة المتون وجمل الاختلاف</h3>
            <div className="atraf-hub-grid-36">
              <div>
                <label className="block text-xs text-slate-400 mb-2">الكتاب المصدر الرئيسي (Source)</label>
                <select
                  value={sourceBookId}
                  onChange={(e) => setSourceBookId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  {books.map(b => (
                    <option key={b.ID} value={b.ID}>{b.Title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">الكتاب المقارن به (Target)</label>
                <select
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  {books.map(b => (
                    <option key={b.ID} value={b.ID}>{b.Title}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleComparisonLoad}
              disabled={loading || !sourceBookId || !targetBookId || sourceBookId === targetBookId}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
            >
              {loading ? 'جاري تحميل المقارنة البينية البارزة...' : 'قارن المتون البينية الآن'}
            </button>
            {sourceBookId === targetBookId && (
              <p className="atraf-hub-text-38">⚠️ يجب اختيار كتابين مختلفين للمقارنة.</p>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="atraf-hub-title-5">نصوص المقارنة الجملية البينية ({comparisonResults.length} متناً)</h4>
            {comparisonResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                لم يتم إيجاد متون مقارنة مقابلة بين الكتابين المحددين أو اختر كتابين آخرين
              </div>
            ) : (
              <div className="space-y-6">
                {comparisonResults.map((item) => (
                  <div key={item.MainID} className="atraf-hub-element-39">
                    <div className="atraf-hub-element-40">
                      <span className="atraf-hub-title-20">الحديث الرئيسي: {item.Title}</span>
                    </div>
                    <div className="atraf-hub-grid-41">
                      {/* Source */}
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 block">المصدر الرئيسي الأول:</span>
                        <div className="text-sm text-slate-300 leading-relaxed font-semibold bg-emerald-950/5 p-3 rounded-lg border border-emerald-950/10">
                          <HadithContentRenderer content={item.SrcCleanContent} annotations={item.SrcAnnotations || undefined} />
                        </div>
                      </div>
                      {/* Target */}
                      <div className="p-5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 block">المقارن به الثاني:</span>
                        <div className="atraf-hub-text-43">
                          <HadithContentRenderer content={item.TgtCleanContent} annotations={item.TgtAnnotations || undefined} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Extra Narrators */}
      {activeTab === 'rwah_extra' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="atraf-hub-title-2">حدد المصنف للزوائد</h3>
              <div className="atraf-hub-element-16">
                {books.map((book) => (
                  <label key={book.ID} className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={extraBookIds.includes(book.ID)}
                      onChange={() => handleExtraBookToggle(book.ID)}
                      className="atraf-hub-text-18"
                    />
                    <span>{book.Title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="atraf-hub-card-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث في رواة زوائد الكتاب المحدّد</h3>
              <form onSubmit={handleExtraSearch} className="atraf-hub-element-14">
                <input
                  type="text"
                  placeholder="ابحث باسم الراوي داخل الزوائد..."
                  value={extraQuery}
                  onChange={(e) => setExtraQuery(e.target.value)}
                  className="atraf-hub-text-15"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading || extraBookIds.length === 0}
                  className="atraf-hub-text-19"
                >
                  {loading ? 'جاري التحميل...' : 'اعرض الرواة'}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">رواة الزوائد المكتشفين ({extraResults.length} راوٍ)</h4>
              {extraResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  أدخل خيارات التصفية وانقر عرض الرواة لرؤية رواة الزوائد مع تكرار مروياتهم داخل الكتاب
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extraResults.map((n) => (
                    <div
                      key={n.ID}
                      onClick={() => onSelectNarrator ? onSelectNarrator(n.ID) : null}
                      className="group atraf-hub-card-44"
                    >
                      <h5 className="atraf-hub-text-45">
                        {renderHighlighted(n.Name, extraQuery)}
                      </h5>
                      <div className="atraf-hub-wrapper-21">
                        <span className="text-slate-500">{n.Tabaqa || 'الطبقة غير معروفة'}</span>
                        <span className="atraf-hub-title-46">
                          {n.HadithsCount} مرويات زائدة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Grouped/Compound Matns */}
      {activeTab === 'grouped' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="atraf-hub-card-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4">ابحث في متون ومجموعات المتون المشتركة</h3>
              <form onSubmit={handleGroupedSearch} className="atraf-hub-element-14">
                <input
                  type="text"
                  placeholder="ابحث بكلمة في المتون المشتركة..."
                  value={groupedQuery}
                  onChange={(e) => setGroupedQuery(e.target.value)}
                  className="atraf-hub-text-15"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="atraf-hub-text-47"
                >
                  {loading ? '...' : 'ابحث'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">المجموعات البينية ({groupedResults.length})</h4>
              <div className="atraf-hub-element-48">
                {groupedResults.map((item) => (
                  <div
                    key={item.ID}
                    onClick={() => handleGroupedMatnClick(item.HadithMainID)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedGroupHadith === item.HadithMainID
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-850'
                      : 'bg-slate-900/30 text-slate-350 border-slate-800/80 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="atraf-hub-text-49">
                      <HadithContentRenderer content={item.CleanMatn} annotations={item.MatnAnnotations || undefined} />
                    </div>
                    <div className="mt-2.5 flex justify-between text-[10px] text-slate-500">
                      <span>{item.BookName}</span>
                      <span>حديث رقم: {item.HadithNum}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details & Variants */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-400">المتن المقابل ونسخ المتون المشتركة</h4>
            {selectedGroupHadith === null ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-24 text-center text-slate-500 text-sm">
                اختر متنًا مشتركًا من القائمة اليمنى لعرض كافة نصوص المتون المنسجمة معه من الكتب الأخرى
              </div>
            ) : (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex py-12 justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Compound Matn with highlights */}
                    <div className="atraf-hub-card-51">
                      <span className="atraf-hub-title-52">نص المتن الجامع مع الشواهد والفروق</span>
                      <div className="atraf-hub-title-53">
                        {(() => {
                          const found = groupedResults.find(r => r.HadithMainID === selectedGroupHadith);
                          return found ? (
                            <HadithContentRenderer content={found.CleanMatn} annotations={found.MatnAnnotations || undefined} />
                          ) : null;
                        })()}
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-slate-500">الأحاديث المطابقة والنسخ المشتركة في الكتب الأخرى:</h5>
                    {groupedHadiths.length === 0 ? (
                      <div className="atraf-hub-text-55">لا توجد نسخ خارجية مسجلة في مجموعات الربط البيني لهذا الحديث.</div>
                    ) : (
                      <div className="space-y-4">
                        {groupedHadiths.map((h, i) => (
                          <div key={i} className="atraf-hub-card-56">
                            <div className="atraf-hub-wrapper-21">
                              <span className="atraf-hub-text-57">{h.BookName}</span>
                              <span className="text-slate-500">حديث رقم: {h.HadithNum} (ج {h.PartNum} ص {h.PageNum})</span>
                            </div>
                            <div className="atraf-hub-text-58">
                              <HadithContentRenderer content={h.CleanContent} annotations={h.Annotations || undefined} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                تفاصيل موضع الحديث والطرف
              </h3>
              <button
                onClick={() => setSelectedHadithDetail(null)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              <h4 className="atraf-hub-title-59">
                {selectedHadithDetail.Title}
              </h4>
              <div className="atraf-hub-text-27">
                <span className="font-bold text-slate-300">الكتاب: {selectedHadithDetail.BookName}</span>
                <span>رقم الحديث: {selectedHadithDetail.HadithNum}</span>
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
