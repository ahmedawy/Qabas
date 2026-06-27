import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { NarratorDetailResponse } from '../../types';
import { HadithContentRenderer } from '../hadiths/HadithCard';

interface NarratorDrawerProps {
  narratorId: number | null;
  onClose: () => void;
  inline?: boolean;
}

export const NarratorDrawer: React.FC<NarratorDrawerProps> = ({ narratorId, onClose, inline = false }) => {
  const [history, setHistory] = useState<number[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NarratorDetailResponse | null>(null);

  // Tabbed layout states
  const [activeTab, setActiveTab] = useState<'card' | 'teachers' | 'students' | 'opinions' | 'classifications' | 'forms' | 'hadiths' | 'sources'>('card');
  const [opinions, setOpinions] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [hadithsData, setHadithsData] = useState<{ hadiths: any[]; pagination: any } | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);
  const [hadithsPage, setHadithsPage] = useState(1);

  // When the parent changes the requested narrator ID, reset the stack
  useEffect(() => {
    if (narratorId !== null) {
      setCurrentId(narratorId);
      setHistory([]);
    } else {
      setCurrentId(null);
      setData(null);
    }
  }, [narratorId]);

  // Reset tabbed states when currentId changes
  useEffect(() => {
    setActiveTab('card');
    setOpinions([]);
    setClassifications([]);
    setForms([]);
    setSources([]);
    setHadithsData(null);
    setHadithsPage(1);
    setTabError(null);
  }, [currentId]);

  // Fetch narrator detail when currentId changes
  useEffect(() => {
    if (currentId === null) return;

    let active = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getNarratorDetail(currentId);
        if (active) {
          setData(res);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'فشل في تحميل بيانات الراوي');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [currentId]);

  // Fetch lazy-loaded tab data
  useEffect(() => {
    if (currentId === null) return;
    if (['card', 'teachers', 'students'].includes(activeTab)) return;

    // Skip if already loaded (unless page changed on hadiths)
    if (activeTab === 'opinions' && opinions.length > 0) return;
    if (activeTab === 'classifications' && classifications.length > 0) return;
    if (activeTab === 'forms' && forms.length > 0) return;
    if (activeTab === 'sources' && sources.length > 0) return;

    let active = true;
    const fetchTab = async () => {
      setTabLoading(true);
      setTabError(null);
      try {
        const res = await api.getNarratorDetail(currentId, activeTab, activeTab === 'hadiths' ? hadithsPage : undefined);
        if (active) {
          if (activeTab === 'opinions') setOpinions(res.opinions || []);
          if (activeTab === 'classifications') setClassifications(res.classifications || []);
          if (activeTab === 'forms') setForms(res.forms || []);
          if (activeTab === 'sources') setSources(res.sources || []);
          if (activeTab === 'hadiths') setHadithsData({ hadiths: res.hadiths || [], pagination: res.pagination });
        }
      } catch (err: any) {
        if (active) {
          setTabError(err.message || 'فشل تحميل بيانات التبويب');
        }
      } finally {
        if (active) {
          setTabLoading(false);
        }
      }
    };

    fetchTab();
    return () => {
      active = false;
    };
  }, [currentId, activeTab, hadithsPage]);

  if (narratorId === null) return null;

  const handleNarratorClick = (id: number) => {
    if (currentId !== null) {
      setHistory((prev) => [...prev, currentId]);
    }
    setCurrentId(id);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevId = newHistory.pop();
    setHistory(newHistory);
    setCurrentId(prevId ?? null);
  };

  const narrator = data?.narrator;

  const drawerContent = (
    <div className={`flex h-full flex-col overflow-y-scroll border-r border-slate-700 bg-slate-900 text-slate-100 shadow-2xl ${inline ? 'border border-slate-800 rounded-3xl h-full max-h-[75vh] overflow-hidden' : ''}`}>
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-hidden"
                    onClick={onClose}
                  >
                    <span className="sr-only">إغلاق</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {history.length > 0 && (
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-md bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60 hover:text-emerald-300 transition-colors"
                      onClick={handleBack}
                    >
                      <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                      <span>رجوع</span>
                    </button>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-100" id="slide-over-title">
                  بطاقة الراوي التفصيلية
                </h2>
              </div>

              {/* Content body */}
              <div className="relative flex-1 px-6 py-6">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-4 text-sm text-red-400 bg-red-950/20">
                    <p className="font-semibold">حدث خطأ أثناء تحميل البيانات:</p>
                    <p className="mt-1">{error}</p>
                    <button 
                      onClick={() => setCurrentId(currentId)}
                      className="mt-3 rounded-md bg-red-900/40 px-3 py-1 text-xs font-medium text-red-350 border border-red-700/60 hover:bg-red-800/60 cursor-pointer"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}

                {!loading && !error && narrator && (
                  <div className="space-y-6">
                    {/* Narrator primary identity */}
                    <div className="rounded-xl bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-emerald-900/40 p-5 shadow-inner">
                      <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 mb-3">
                        التعريف الرئيسي
                      </span>
                      <h3 className="text-xl font-black text-emerald-300 leading-relaxed">
                        {narrator.Name}
                      </h3>
                      {narrator.AbbName && narrator.AbbName !== narrator.Name && (
                        <p className="mt-1.5 text-sm text-slate-400">
                          <span className="font-bold text-slate-500">الاسم المختصر:</span> {narrator.AbbName}
                        </p>
                      )}
                      {narrator.EsmShuhra && (
                        <p className="mt-1.5 text-sm text-slate-400">
                          <span className="font-bold text-slate-500">اسم الشهرة:</span> {narrator.EsmShuhra}
                        </p>
                      )}
                    </div>

                    {/* Tab Navigation buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
                      {[
                        { id: 'card', name: 'البطاقة' },
                        { id: 'teachers', name: `الشيوخ (${data?.sheikhs?.length || 0})` },
                        { id: 'students', name: `التلاميذ (${data?.talamidh?.length || 0})` },
                        { id: 'opinions', name: 'الجرح والتعديل' },
                        { id: 'classifications', name: 'تصنيفات خاصة' },
                        { id: 'forms', name: 'صور الورود' },
                        { id: 'hadiths', name: 'مروياته' },
                        { id: 'sources', name: 'مصادر الترجمة' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setActiveTab(t.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none cursor-pointer ${
                            activeTab === t.id
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>

                    {/* Lazy-Loading indicator for Tabs */}
                    {tabLoading && (
                      <div className="py-12 flex justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                      </div>
                    )}

                    {tabError && (
                      <div className="rounded-lg bg-red-950/40 border border-red-800/60 p-4 text-xs text-red-450">
                        {tabError}
                      </div>
                    )}

                    {!tabLoading && !tabError && (
                      <div className="space-y-6">
                        {/* TAB 1: CARD */}
                        {activeTab === 'card' && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Personal biography statistics */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="rounded-lg bg-slate-800/40 border border-slate-800 p-3.5">
                                <span className="block text-xs font-medium text-slate-500 mb-1">الطبقة</span>
                                <span className="text-sm font-semibold text-slate-200">
                                  {narrator.Tabaqa || '-'}
                                </span>
                              </div>
                              <div className="rounded-lg bg-slate-800/40 border border-slate-800 p-3.5">
                                <span className="block text-xs font-medium text-slate-500 mb-1">عدد الأحاديث المروية</span>
                                <span className="text-base font-extrabold text-amber-400 font-mono">
                                  {narrator.HadithsCount.toLocaleString('ar-SA')} حديثاً
                                </span>
                              </div>
                            </div>

                            {/* Genealogy details */}
                            <div className="space-y-3.5">
                              <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                                النسب والكنية واللقب
                              </h4>
                              <dl className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4">
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">الكنية</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.Kunia || 'غير متوفر'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">اللقب</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.Laqab || 'غير متوفر'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-xs font-medium text-slate-500">النسب التفصيلي</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300 leading-relaxed">{narrator.Nasab || 'غير متوفر'}</dd>
                                </div>
                              </dl>
                            </div>

                            {/* Scholar assessments */}
                            <div className="space-y-3.5">
                              <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                                رتبة الجرح والتعديل
                              </h4>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-lg bg-slate-900 border border-slate-800/60 p-3">
                                  <span className="block text-xs font-medium text-slate-500 mb-1">الحافظ ابن حجر</span>
                                  <span className="text-sm font-bold text-emerald-400">
                                    {narrator.MartabaIbnHajar || 'غير مصنف'}
                                  </span>
                                </div>
                                <div className="rounded-lg bg-slate-900 border border-slate-800/60 p-3">
                                  <span className="block text-xs font-medium text-slate-500 mb-1">الإمام الذهبي</span>
                                  <span className="text-sm font-bold text-amber-400">
                                    {narrator.MartabaZahabi || 'غير مصنف'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Lifespan geography */}
                            <div className="space-y-3.5">
                              <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                                التواريخ والبلدان
                              </h4>
                              <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">سنة الوفاة</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.DeathYear || 'غير محدد'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">سنة الميلاد</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.BirthYear || 'غير محدد'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">بلد الإقامة</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.LivingCity || 'غير محدد'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-slate-500">بلد الوفاة</dt>
                                  <dd className="mt-0.5 text-sm text-slate-300">{narrator.DeathCity || 'غير محدد'}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: TEACHERS */}
                        {activeTab === 'teachers' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex justify-between items-center">
                              <span>شيوخه (الذين روى عنهم)</span>
                              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
                                {data?.sheikhs?.length || 0} شيخاً
                              </span>
                            </h4>
                            {(!data?.sheikhs || data.sheikhs.length === 0) ? (
                              <p className="text-xs text-slate-500 italic">لا توجد روابط شيوخ مسجلة لهذا الراوي</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                                {data.sheikhs.map((sh: any) => (
                                  <button
                                    key={sh.ID}
                                    onClick={() => handleNarratorClick(sh.ID)}
                                    className="text-right w-full text-xs text-emerald-450 hover:text-emerald-350 bg-slate-800/30 hover:bg-slate-800 border border-slate-850 hover:border-emerald-900/40 rounded-lg p-2.5 transition-all flex justify-between items-center cursor-pointer"
                                  >
                                    <span className="font-semibold">{sh.Name}</span>
                                    {sh.HadithsCount > 0 && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {sh.HadithsCount} حديثاً
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 3: STUDENTS */}
                        {activeTab === 'students' && (
                          <div className="space-y-3 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex justify-between items-center">
                              <span>تلاميذه (الذين رووا عنه)</span>
                              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
                                {data?.talamidh?.length || 0} تلميذاً
                              </span>
                            </h4>
                            {(!data?.talamidh || data.talamidh.length === 0) ? (
                              <p className="text-xs text-slate-500 italic">لا توجد روابط تلاميذ مسجلة لهذا الراوي</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                                {data.talamidh.map((tal: any) => (
                                  <button
                                    key={tal.ID}
                                    onClick={() => handleNarratorClick(tal.ID)}
                                    className="text-right w-full text-xs text-amber-450 hover:text-amber-350 bg-slate-800/30 hover:bg-slate-800 border border-slate-850 hover:border-amber-900/40 rounded-lg p-2.5 transition-all flex justify-between items-center cursor-pointer"
                                  >
                                    <span className="font-semibold">{tal.Name}</span>
                                    {tal.HadithsCount > 0 && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {tal.HadithsCount} حديثاً
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 4: OPINIONS */}
                        {activeTab === 'opinions' && (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                              أقوال علماء الجرح والتعديل
                            </h4>
                            {opinions.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">لا توجد تعليقات جرح وتعديل مسجلة.</p>
                            ) : (
                              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                {opinions.map((o) => (
                                  <div key={o.ID} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40">
                                    <span className="text-xs font-bold text-emerald-450">{o.ScientistName}</span>
                                    <p className="mt-1.5 text-xs text-slate-350 leading-relaxed font-sans select-text">
                                      {o.Say}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 5: CLASSIFICATIONS */}
                        {activeTab === 'classifications' && (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                              التصنيفات الخاصة والفوائد الحديثية
                            </h4>
                            {classifications.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">لا توجد تصنيفات خاصة مسجلة لهذا الراوي.</p>
                            ) : (
                              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                                {classifications.map((c, idx) => (
                                  <div key={idx} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 flex flex-col gap-2">
                                    <div className="flex justify-between text-[11px] font-bold">
                                      <span className="text-indigo-400">{c.RelationTypeName}</span>
                                      {c.ScientistName && <span className="text-slate-400">{c.ScientistName}</span>}
                                    </div>
                                    {c.Say && (
                                      <p className="text-xs text-slate-350 leading-relaxed select-text font-sans">
                                        {c.Say}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 6: FORMS (صور الورود) */}
                        {activeTab === 'forms' && (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                              صور ورود اسم الراوي في أسانيد المتون
                            </h4>
                            {forms.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">لا توجد اختلافات مسجلة لاسم الراوي.</p>
                            ) : (
                              <div className="grid grid-cols-1 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                                {forms.map((f) => (
                                  <div key={f.ID} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/80 flex justify-between items-center text-xs">
                                    <span className="font-medium text-slate-300 font-sans select-text">{f.RawyText}</span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/60">
                                      ورد {f.Frequency} مرة
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 7: HADITHS */}
                        {activeTab === 'hadiths' && (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5 flex justify-between items-center">
                              <span>مروياته في الدواوين</span>
                              {hadithsData && (
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-450 font-mono">
                                  {hadithsData.pagination.total} حديثاً
                                </span>
                              )}
                            </h4>
                            {!hadithsData || hadithsData.hadiths.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">لا توجد مرويات مسجلة.</p>
                            ) : (
                              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {hadithsData.hadiths.map((h) => (
                                  <div key={h.MainID} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[11px] items-center font-bold text-emerald-450">
                                      <span>{h.BookName}</span>
                                      <span className="font-mono text-slate-450">حديث {h.HadithNum}</span>
                                    </div>
                                    <p className="text-slate-350 line-clamp-1 italic">{h.Tarf}</p>
                                    <span className="text-[9px] text-slate-500 font-mono">جزء {h.PartNum}، صفحة {h.PageNum}</span>
                                  </div>
                                ))}
                                
                                {/* Paginated Nav */}
                                {hadithsData.pagination.last_page > 1 && (
                                  <div className="flex justify-between items-center pt-2 text-[11px]">
                                    <button
                                      disabled={hadithsPage >= hadithsData.pagination.last_page}
                                      onClick={() => setHadithsPage(hadithsPage + 1)}
                                      className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:hover:bg-slate-800 cursor-pointer font-bold"
                                    >
                                      التالي ◀
                                    </button>
                                    <span className="text-slate-450 font-mono">صفحة {hadithsPage} من {hadithsData.pagination.last_page}</span>
                                    <button
                                      disabled={hadithsPage <= 1}
                                      onClick={() => setHadithsPage(hadithsPage - 1)}
                                      className="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300 hover:bg-slate-750 disabled:opacity-40 disabled:hover:bg-slate-800 cursor-pointer font-bold"
                                    >
                                      ▶ السابق
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 8: SOURCES */}
                        {activeTab === 'sources' && (
                          <div className="space-y-3.5 animate-in fade-in duration-200">
                            <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-1.5">
                              مصادر الترجمة والترجمة التاريخية
                            </h4>
                            {sources.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">لا توجد مصادر ترجمة مسجلة.</p>
                            ) : (
                              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                                {sources.map((s, idx) => (
                                  <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                                    <span className="text-xs font-bold text-emerald-450">{s.BookName}</span>
                                    <div className="text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/80 pt-3 select-text">
                                      <HadithContentRenderer
                                        content={s.CleanContent}
                                        annotations={s.Annotations || undefined}
                                        onNarratorClick={handleNarratorClick}
                                      />
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
                )}
              </div>
            </div>
  );

  if (inline) {
    return drawerContent;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300" 
          onClick={onClose}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
          <div className="pointer-events-auto w-screen max-w-lg transform transition-transform duration-300 ease-in-out sm:duration-500 translate-x-0">
            {drawerContent}
          </div>
        </div>
      </div>
    </div>
  );
};
