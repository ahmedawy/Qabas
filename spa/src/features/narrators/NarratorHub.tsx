import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { Book, NarratorSummary, CritiqueTerm, ScholarOpinion } from '../../types';
import { highlightArabicText } from '../../utils/arabicHighlighter';

interface NarratorHubProps {
  onSelectNarrator: (id: number) => void;
  activeTab?: string | null;
  onTabChange?: (tab: string) => void;
}

type TabType = 'search' | 'books' | 'classification' | 'garh' | 'opinions';

export const NarratorHub: React.FC<NarratorHubProps> = ({ 
  onSelectNarrator,
  activeTab: propActiveTab,
  onTabChange
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<TabType>('search');
  const activeTab = (propActiveTab as TabType) || localActiveTab;
  const setActiveTab = (tab: TabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };
  const [books, setBooks] = useState<Book[]>([]);

  // Tab 1: General Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>(['Name']);
  const [searchResults, setSearchResults] = useState<NarratorSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Tab 2: Narrators by Book state
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState<NarratorSummary[]>([]);
  const [bookLoading, setBookLoading] = useState(false);

  // Tab 3: Classifications state
  const [tabaqat, setTabaqat] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [classCategory, setClassCategory] = useState<'Tabaqa' | 'LivingCity'>('Tabaqa');
  const [classValue, setClassValue] = useState('');
  const [classResults, setClassResults] = useState<Array<{ ID: number; Name: string; DeathYear: string; Tabaqa: string; City: string }>>([]);
  const [classLoading, setClassLoading] = useState(false);

  // Tab 4: Lexicon state
  const [lexiconQuery, setLexiconQuery] = useState('');
  const [lexiconResults, setLexiconResults] = useState<CritiqueTerm[]>([]);
  const [lexiconLoading, setLexiconLoading] = useState(false);

  // Tab 5: Scholar Opinions state
  const [scientists, setScientists] = useState<Array<{ ID: number; Name: string }>>([]);
  const [selectedSciId, setSelectedSciId] = useState<number>(0);
  const [opinionQuery, setOpinionQuery] = useState('');
  const [opinionResults, setOpinionResults] = useState<ScholarOpinion[]>([]);
  const [opinionLoading, setOpinionLoading] = useState(false);

  // Load books and scientists initial data
  useEffect(() => {
    api.getBooks().then((res) => {
      // Filter for books likely containing narrators (IDs >= 34/Reference)
      setBooks(res.books);
    }).catch(console.error);

    api.getNarratorClassifications().then((res) => {
      setTabaqat(res.tabaqat);
      setCities(res.cities);
    }).catch(console.error);
  }, []);

  // Trigger search for Tab 1
  const handleGeneralSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await api.getNarratorsList(searchQuery, searchFields);
      setSearchResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger search for Tab 2 (Books)
  const handleBookSearch = async () => {
    if (selectedBookIds.length === 0) return;
    setBookLoading(true);
    try {
      const res = await api.getNarratorsByBook(selectedBookIds.join(','), bookQuery);
      setBookResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setBookLoading(false);
    }
  };

  // Trigger classification load
  useEffect(() => {
    if (!classValue) return;
    setClassLoading(true);
    api.getNarratorClassifications(classCategory, classValue)
      .then((res) => {
        setClassResults(res.results);
      })
      .catch(console.error)
      .finally(() => setClassLoading(false));
  }, [classCategory, classValue]);

  // Trigger lexicon search
  useEffect(() => {
    const delay = setTimeout(() => {
      setLexiconLoading(true);
      api.getCritiqueTerms(lexiconQuery)
        .then((res) => setLexiconResults(res.results))
        .catch(console.error)
        .finally(() => setLexiconLoading(false));
    }, 300);
    return () => clearTimeout(delay);
  }, [lexiconQuery]);

  // Fetch scientists & opinions
  useEffect(() => {
    if (scientists.length === 0) {
      api.getScholarOpinions(0, '').then((res) => {
        setScientists(res.scientists);
        if (res.scientists.length > 0) {
          setSelectedSciId(res.scientists[0].ID);
        }
      }).catch(console.error);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedSciId <= 0) return;
    setOpinionLoading(true);
    api.getScholarOpinions(selectedSciId, opinionQuery)
      .then((res) => setOpinionResults(res.results))
      .catch(console.error)
      .finally(() => setOpinionLoading(false));
  }, [selectedSciId, opinionQuery]);

  const toggleSearchField = (field: string) => {
    setSearchFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleBookCheckboxChange = (bookId: number) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  // Render Highlight Helper
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
            المستودع الجامع للرواة والجرح والتعديل
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            استكشف تراجم رواة الحديث النبوي الشريف، طبقاتهم، بلدانهم، شيوخهم وتلاميذهم، وأقوال أئمة الجرح والتعديل والعلماء النقاد في أحوالهم وضبطهم، مع محرك بحث متقدم وخرائط ربط ذكية.
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-800 mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
          {(
            [
              { id: 'search', label: 'بحث الرواة المتقدم' },
              { id: 'books', label: 'رواة المصنفات والكتب' },
              { id: 'classification', label: 'تصنيفات الرواة (الطبقات والبلدان)' },
              { id: 'garh', label: 'ألفاظ الجرح والتعديل' },
              { id: 'opinions', label: 'أقوال علماء النقد والرجال' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition-all duration-200
                ${
                  activeTab === tab.id
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

      {/* Tab 1 Content: Muti-Field Advanced Search */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-xs">
            <h3 className="text-base font-bold text-slate-200 mb-4">خيارات البحث المتقدم</h3>
            <form onSubmit={handleGeneralSearch} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="ابحث عن راوٍ بالاسم، الكنية، اللقب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  dir="rtl"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50"
                >
                  {searchLoading ? 'جاري البحث...' : 'ابحث الآن'}
                </button>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-500 self-center">حقول البحث:</span>
                {[
                  { field: 'Name', label: 'الاسم الكامل' },
                  { field: 'Kunia', label: 'الكنية' },
                  { field: 'Laqab', label: 'اللقب' },
                  { field: 'Nasab', label: 'النسب' },
                  { field: 'EsmShuhra', label: 'اسم الشهرة' },
                ].map((item) => (
                  <label key={item.field} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchFields.includes(item.field)}
                      onChange={() => toggleSearchField(item.field)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </form>
          </div>

          {/* Results grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 mb-4">
              نتائج البحث ({searchResults.length} رواة)
            </h4>
            {searchResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                أدخل كلمة البحث واضغط على زر البحث لاستعراض الرواة
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((n) => (
                  <div
                    key={n.ID}
                    onClick={() => onSelectNarrator(n.ID)}
                    className="group rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-emerald-800/60 hover:bg-slate-900/70 transition-all duration-300 shadow-xs hover:shadow-emerald-950/20 hover:shadow-lg cursor-pointer"
                  >
                    <h5 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                      {renderHighlighted(n.Name, searchQuery)}
                    </h5>
                    <div className="mt-3.5 flex flex-wrap gap-2 text-xs text-slate-400">
                      {n.Tabaqa && <span className="bg-slate-850 px-2 py-1 rounded border border-slate-800">{n.Tabaqa}</span>}
                      {n.DeathYear && <span className="bg-slate-850 px-2 py-1 rounded border border-slate-800">ت: {n.DeathYear}</span>}
                      <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 px-2.5 py-1 rounded font-semibold mr-auto">
                        {n.HadithsCount} حديثاً
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2 Content: Narrators by Book */}
      {activeTab === 'books' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Book Select */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-850">اختر المصنّفات والكتب</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {books.filter(b => b.ID <= 33).map((book) => (
                  <label key={book.ID} className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(book.ID)}
                      onChange={() => handleBookCheckboxChange(book.ID)}
                      className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                    />
                    <span>{book.Title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">تصفية رواة الكتب</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="ابحث باسم الراوي داخل الكتب المحددة..."
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                  dir="rtl"
                />
                <button
                  onClick={handleBookSearch}
                  disabled={bookLoading || selectedBookIds.length === 0}
                  className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40"
                >
                  {bookLoading ? 'جاري التحميل...' : 'عرض الرواة'}
                </button>
              </div>
              {selectedBookIds.length === 0 && (
                <p className="mt-2 text-xs text-amber-500/80">⚠️ الرجاء اختيار كتاب واحد على الأقل من القائمة الجانبية.</p>
              )}
            </div>

            {/* Book Results Grid */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400">قائمة رواة الأسانيد ({bookResults.length} راوٍ)</h4>
              {bookResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  اختر الكتب واضغط على زر العرض لرؤية رواة الأسانيد مع تفاصيل شيوخهم وتلاميذهم
                </div>
              ) : (
                <div className="space-y-4">
                  {bookResults.map((n) => (
                    <div
                      key={n.ID}
                      onClick={() => onSelectNarrator(n.ID)}
                      className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 transition-all duration-300 shadow-xs cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h5 className="font-extrabold text-slate-200 text-sm sm:text-base leading-relaxed">
                          {renderHighlighted(n.Name, bookQuery)}
                        </h5>
                        <div className="flex gap-2 text-xs mr-auto sm:mr-0">
                          {n.Tabaqa && <span className="bg-slate-850 px-2 py-0.5 rounded text-slate-400">{n.Tabaqa}</span>}
                          <span className="bg-amber-950/20 text-amber-400 px-2.5 py-0.5 rounded border border-amber-900/30 font-bold">
                            {n.HadithsCount} مرويات
                          </span>
                        </div>
                      </div>

                      {/* Summary of teachers / students */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                        <div className="text-xs">
                          <span className="font-bold text-slate-500 block mb-1">أبرز الشيوخ:</span>
                          <p className="text-emerald-400 line-clamp-1 leading-relaxed">{n.sheikhs || 'غير محدد'}</p>
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-slate-500 block mb-1">أبرز التلاميذ:</span>
                          <p className="text-amber-400 line-clamp-1 leading-relaxed">{n.talamidh || 'غير محدد'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3 Content: Classifications */}
      {activeTab === 'classification' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Classification Values Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <div className="flex rounded-md bg-slate-950 p-1 mb-4">
                <button
                  onClick={() => { setClassCategory('Tabaqa'); setClassValue(''); }}
                  className={`flex-1 rounded-sm py-1.5 text-xs font-bold transition-all ${classCategory === 'Tabaqa' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  الطبقة
                </button>
                <button
                  onClick={() => { setClassCategory('LivingCity'); setClassValue(''); }}
                  className={`flex-1 rounded-sm py-1.5 text-xs font-bold transition-all ${classCategory === 'LivingCity' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  بلد الإقامة
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {(classCategory === 'Tabaqa' ? tabaqat : cities).map((item) => (
                  <button
                    key={item}
                    onClick={() => setClassValue(item)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      classValue === item
                        ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Classification Main List */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-sm font-bold text-slate-450">
              قائمة الرواة المصنفين تحت {classCategory === 'Tabaqa' ? 'الطبقة' : 'البلد'}: <span className="text-emerald-400 font-extrabold">{classValue || 'لم يتم الاختيار'}</span>
            </h4>

            {classLoading ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : classResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                اختر قيمة تصنيفية من الجانب الأيمن لاستعراض رواة الطبقة أو البلد المحدد
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classResults.map((n) => (
                  <div
                    key={n.ID}
                    onClick={() => onSelectNarrator(n.ID)}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 p-4.5 hover:border-emerald-800/60 hover:bg-slate-900/60 transition-all cursor-pointer"
                  >
                    <h5 className="font-extrabold text-slate-200 text-sm mb-3.5 leading-relaxed">{n.Name}</h5>
                    <dl className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">سنة الوفاة:</span> {n.DeathYear || '-'}
                      </div>
                      <div>
                        <span className="text-slate-500">بلد الإقامة:</span> {n.City || '-'}
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">الطبقة:</span> {n.Tabaqa || '-'}
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4 Content: Garh wa Ta'dil Lexicon */}
      {activeTab === 'garh' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4">معجم مصطلحات وألفاظ التجريح والتعديل</h3>
            <input
              type="text"
              placeholder="ابحث عن لفظ (مثال: ثقة، صدوق، ضعيف، كذاب)..."
              value={lexiconQuery}
              onChange={(e) => setLexiconQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              dir="rtl"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-450">مسرد المصطلحات ({lexiconResults.length} مصطلحاً)</h4>
            {lexiconLoading && lexiconResults.length === 0 ? (
              <div className="flex py-12 justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : lexiconResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                لم يتم العثور على مصطلحات مطابقة للبحث
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lexiconResults.map((item) => (
                  <div
                    key={item.ID}
                    onClick={() => {
                      // Click term to trigger search
                      setActiveTab('search');
                      setSearchQuery(item.Term);
                      setSearchFields(['Name']);
                      api.getNarratorsList(item.Term).then(res => setSearchResults(res.results)).catch(console.error);
                    }}
                    className="group rounded-xl border border-slate-800 bg-slate-900/30 p-4 hover:border-amber-800/60 hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {renderHighlighted(item.Term, lexiconQuery)}
                      </span>
                      <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs text-amber-500 border border-amber-900/20 font-semibold group-hover:bg-amber-950/20 transition-all">
                        {item.RwahCount} راوٍ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5 Content: Scholar Opinions */}
      {activeTab === 'opinions' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Scholars Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 pb-2 border-b border-slate-850">علماء النقد والجرح والتعديل</h3>
              <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                {scientists.map((sci) => (
                  <button
                    key={sci.ID}
                    onClick={() => setSelectedSciId(sci.ID)}
                    className={`w-full text-right text-xs px-3 py-2 rounded-lg transition-all ${
                      selectedSciId === sci.ID
                        ? 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-900/60'
                        : 'text-slate-350 hover:bg-slate-800/40 hover:text-slate-100'
                    }`}
                  >
                    {sci.Name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Opinions Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4">أقوال ومرويات عالم الجرح والتعديل</h3>
              <input
                type="text"
                placeholder="ابحث باسم الراوي المكتوب عنه القول..."
                value={opinionQuery}
                onChange={(e) => setOpinionQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
                dir="rtl"
              />
            </div>

            {/* Results cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-450">أقوال الحافظ الناقد ({opinionResults.length} قولاً)</h4>
              {opinionLoading && opinionResults.length === 0 ? (
                <div className="flex py-12 justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : opinionResults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
                  لم يتم العثور على أقوال مسجلة مطابقة للبحث
                </div>
              ) : (
                <div className="space-y-4">
                  {opinionResults.map((op, idx) => (
                    <div
                      key={`${op.RawyID}-${idx}`}
                      onClick={() => onSelectNarrator(op.RawyID)}
                      className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 hover:border-emerald-800/60 hover:bg-slate-900/50 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-extrabold text-slate-200 text-sm leading-relaxed">
                          الراوي: {renderHighlighted(op.RawyName || '', opinionQuery)}
                        </span>
                        {op.SaySort > 0 && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-850 px-2 py-0.5 rounded">
                            ترتيب: {op.SaySort}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-350 bg-slate-950/40 rounded-lg p-3 border border-slate-800/50 leading-relaxed font-medium">
                        «{op.Say}»
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
