import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { HadithJudgment, Chain, TakhreejItem, ShawahedData, CombinedMatn, HadithServiceType, HadithThematicLink, ShawahedItem, ServiceBookItem } from '../../types';
import { HadithContentRenderer } from './HadithCard';
import { NarratorDrawer } from '../narrators/NarratorDrawer';
import { CombinedTransmissionChainGraph } from '../chains/CombinedTransmissionChainGraph';
import { CombinedTakhreejChainGraph } from '../chains/CombinedTakhreejChainGraph';
import { generateLegacyTakhreejText } from '../../utils/takhreejFormatter';

interface NarratorChainViewerProps {
  sanadId: number;
  fallbackIds: string;
  onNarratorClick?: (id: number) => void;
}

const NarratorChainViewer: React.FC<NarratorChainViewerProps> = ({
  sanadId,
  fallbackIds,
  onNarratorClick,
}) => {
  const [narrators, setNarrators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api.getTransmissionChain(sanadId)
      .then((res) => {
        if (active) {
          setNarrators(res.narrators || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [sanadId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-2 font-sans">
        <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>جاري تحميل أسماء الرواة...</span>
      </div>
    );
  }

  if (error || narrators.length === 0) {
    const ids = fallbackIds ? fallbackIds.trim().split(/\s+/).map(Number).filter(id => !isNaN(id)) : [];
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 dir-rtl">
        {ids.map((id, idx) => (
          <React.Fragment key={id}>
            {idx > 0 && <span className="text-slate-400">←</span>}
            <button
              onClick={() => onNarratorClick?.(id)}
              className="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              #{id}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed dir-rtl">
      {narrators.map((n, idx) => (
        <React.Fragment key={n.ID}>
          {idx > 0 && (
            <span className="text-slate-400 dark:text-slate-600 font-bold select-none px-1">
              ←
            </span>
          )}
          <button
            onClick={() => onNarratorClick?.(n.ID)}
            title={`${n.Name} (توفي سنة ${n.DeathYear || 'غير محددة'}) - الطبقة: ${n.Tabaqa || 'غير محددة'}`}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950/40 dark:text-slate-200 dark:hover:text-emerald-300 rounded-xl transition-all border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900/60 cursor-pointer"
          >
            {n.EsmShuhra || n.AbbName || n.Name || `راوٍ #${n.ID}`}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const SANAD_TYPES: Record<string | number, string> = {
  0: 'متصل',
  1: 'معلق',
  2: 'مرسل',
  3: 'معلق ، مرسل',
  4: 'منقطع',
  5: 'معلق منقطع',
  6: 'مرسل ، منقطع',
  7: 'معلق ، مرسل ، منقطع',
  10: 'معضل'
};

interface HadithServiceModalProps {
  hadithId: number;
  serviceType: HadithServiceType;
  onClose: () => void;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onSelectSubjectNode?: (subjectId: number, pathNodeIds: number[]) => void;
}

export const HadithServiceModal: React.FC<HadithServiceModalProps> = ({
  hadithId,
  serviceType,
  onClose,
  onNarratorClick: _onNarratorClick,
  onLexiconClick,
  onSelectSubjectNode,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Header metadata loaded from API
  const [bookName, setBookName] = useState<string>('');
  const [hadithNum, setHadithNum] = useState<number | string>('');

  // Service-specific states
  const [judgments, setJudgments] = useState<HadithJudgment[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [takhreej, setTakhreej] = useState<TakhreejItem[]>([]);
  const [shawahed, setShawahed] = useState<ShawahedData | null>(null);
  const [combinedMatn, setCombinedMatn] = useState<CombinedMatn | null>(null);

  // New service-specific states
  const [commentaries, setCommentaries] = useState<any[]>([]);
  const [selectedCommentaryIdx, setSelectedCommentaryIdx] = useState<number>(0);
  const [thematicNodes, setThematicNodes] = useState<HadithThematicLink[]>([]);
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [occasionsData, setOccasionsData] = useState<any[]>([]);
  const [shawahedList, setShawahedList] = useState<ShawahedItem[]>([]);
  const [serviceBooksList, setServiceBooksList] = useState<Record<string, ServiceBookItem[]>>({});
  const [takhreegTab, setTakhreegTab] = useState<'matn' | 'shawahed' | 'services'>('matn');
  const [takhreegMode, setTakhreegMode] = useState<'general' | 'medium' | 'detailed'>('general');

  const [selectedNarratorId, setSelectedNarratorId] = useState<number | null>(null);
  const [selectedCombinedHadithIds, setSelectedCombinedHadithIds] = useState<number[]>([]);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleLocalNarratorClick = (id: number) => {
    setSelectedNarratorId(id);
  };

  const handleCopyScholarlyText = () => {
    if (!combinedMatn) return;
    const fullTextToCopy = `${combinedMatn.scholarly_matn}\n\n${combinedMatn.scholarly_sources}`;
    navigator.clipboard.writeText(fullTextToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  useEffect(() => {
    // Listen for ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    let active = true;
    setLoading(true);
    setError(null);

    const fetchServiceData = async () => {
      try {
        if (serviceType === 'judgments') {
          const res = await api.getHadithJudgments(hadithId);
          if (active) {
            setJudgments(res.judgments || []);
            setBookName(res.book_name);
            setHadithNum(res.hadith_num);
            setLoading(false);
          }
        } else if (serviceType === 'chains' || serviceType === 'sanad') {
          const res = await api.getHadithChains(hadithId);
          if (active) {
            setChains(res.chains || []);
            setBookName(res.book_name);
            setHadithNum(res.hadith_num);
            setLoading(false);
          }
        } else if (serviceType === 'takhreeg' || serviceType === 'combined' || serviceType === 'compound') {
          const [takhreejRes, shawahedRes, serviceBooksRes] = await Promise.all([
            api.getHadithTakhreej(hadithId),
            api.getHadithShawahedList(hadithId).catch(() => ({ status: 'error', data: [] })),
            api.getHadithServiceBooksList(hadithId).catch(() => ({ status: 'error', data: {} as any }))
          ]);
          if (active) {
            setTakhreej(takhreejRes.takhreej || []);
            setShawahed(takhreejRes.shawahed || null);
            setCombinedMatn(takhreejRes.combined_matn || null);
            setBookName(takhreejRes.book_name);
            setHadithNum(takhreejRes.hadith_num);
            setShawahedList(shawahedRes.data || []);
            setServiceBooksList(serviceBooksRes.data || {});

            // Initialize selectedCombinedHadithIds
            const initialHadithIds = [hadithId];
            if (takhreejRes.takhreej) {
              takhreejRes.takhreej.forEach((bookGroup: any) => {
                if (bookGroup.hadiths) {
                  bookGroup.hadiths.forEach((h: any) => initialHadithIds.push(h.main_id));
                }
              });
            }
            if (takhreejRes.shawahed?.comparisons) {
              takhreejRes.shawahed.comparisons.forEach((c: any) => initialHadithIds.push(c.SlaveMatnID));
            }
            setSelectedCombinedHadithIds(Array.from(new Set(initialHadithIds)));
            setLoading(false);
          }
        } else if (serviceType === 'commentary') {
          const res = await api.getHadithCommentary(hadithId);
          if (active) {
            setCommentaries(res.commentaries || []);
            setLoading(false);
          }
        } else if (serviceType === 'thematic') {
          const res = await api.getHadithThematicLinks(hadithId);
          if (active) {
            setThematicNodes(res.nodes || []);
            setLoading(false);
          }
        } else if (serviceType === 'analysis') {
          const res = await api.getHadithAnalysis(hadithId);
          if (active) {
            setAnalysisData(res.analysis || []);
            setLoading(false);
          }
        } else if (serviceType === 'occasions') {
          const res = await api.getHadithOccasions(hadithId);
          if (active) {
            setOccasionsData(res.occasions || []);
            setLoading(false);
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'فشل تحميل بيانات الخدمة');
          setLoading(false);
        }
      }
    };

    fetchServiceData();

    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hadithId, serviceType, onClose]);

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'judgments': return 'أحكام أهل العلم';
      case 'chains': return 'طرق وأسانيد الرواية';
      case 'sanad': return 'شجرة السند التفاعلية';
      case 'takhreeg': return 'التخريج والزوائد';
      case 'combined': return 'شجرة التخريج المجمعة';
      case 'commentary': return 'شرح الحديث والكتب الخدمية';
      case 'thematic': return 'الربط الموضوعي للحديث';
      case 'analysis': return 'تحليل الحديث وعلوم الحديث';
      case 'occasions': return 'أسباب ورود الحديث وتواريخه';
      case 'compound': return 'المتن المجمع وفوائد الروايات البديلة';
      default: return 'تفاصيل الخدمة';
    }
  };

  if (loading) {
    return (
      <div className="hadith-detail-modal-element-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hadith-detail-modal-element-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full text-center">
          <div className="hadith-detail-modal-text-11 text-red-500 mb-4">
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="hadith-detail-modal-title-12">عذراً، فشل تحميل التفاصيل</h3>
          <p className="books-grid-text-1">{error}</p>
          <div className="hadith-detail-modal-element-13">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCombinedHadithOptions = () => {
    const map = new Map<number, { id: number; label: string }>();
    map.set(hadithId, { id: hadithId, label: `${bookName} (حديث رقم ${hadithNum} - الحالي)` });
    if (takhreej) {
      takhreej.forEach((bookGroup: any) => {
        if (bookGroup.hadiths) {
          bookGroup.hadiths.forEach((h: any) => {
            map.set(h.main_id, { id: h.main_id, label: `${bookGroup.book_name} (حديث رقم ${h.number})` });
          });
        }
      });
    }
    if (shawahed?.comparisons) {
      shawahed.comparisons.forEach((c: any) => {
        map.set(c.SlaveMatnID, { id: c.SlaveMatnID, label: `${c.BookName} (حديث رقم ${c.HadithNum})` });
      });
    }
    return Array.from(map.values());
  };

  return (
    <div className="hadith-detail-modal-element-15">
      <div 
        dir="rtl"
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-h-[85vh] flex flex-col md:flex-row overflow-hidden text-right font-sans animate-in slide-in-from-bottom duration-300 ${
          selectedNarratorId !== null ? 'max-w-7xl' : 'max-w-4xl'
        }`}
      >
        <div className="flex flex-col flex-1 min-w-0 h-full max-h-[85vh]">
          
          {/* Modal Header */}
          <div className="hadith-detail-modal-card-17">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="hadith-detail-modal-stack-19">
              <span className="hadith-detail-modal-text-20">
                {getServiceTitle()}
              </span>
              <h2 className="hadith-detail-modal-title-21">
                {bookName} - حديث رقم {hadithNum}
              </h2>
            </div>
          </div>

          {/* Modal Body / Scroll Content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Judgments View */}
            {serviceType === 'judgments' && (
              <div className="space-y-4">
                {judgments.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لم يتم رصد أحكام نقدية مسجلة لهذا الحديث بعينه.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {judgments.map((j, idx) => (
                      <div
                        key={idx}
                        className="hadith-detail-modal-stack-34"
                      >
                        <div className="hadith-detail-modal-wrapper-35">
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">حكم الناقد:</span>
                          <span className="hadith-detail-modal-title-36">
                            {j.ScientistName}
                          </span>
                        </div>
                        <p className="hadith-detail-modal-text-37">
                          {j.Say}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chains View */}
            {serviceType === 'chains' && (
              <div className="space-y-4">
                {chains.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا توجد مسارات أسانيد تفصيلية مسجلة في قاعدة البيانات لهذا الحديث.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chains.map((c) => (
                      <div
                        key={c.SanadID}
                        className="hadith-detail-modal-stack-38"
                      >
                        <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-mono text-slate-500">
                            نوع السند: {c.SanadType !== undefined ? (SANAD_TYPES[c.SanadType] || c.SanadType) : 'متصل'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500">سلسلة الرواة (ممثلة بالأسماء المتصلة ببطاقاتهم):</h4>
                          <NarratorChainViewer
                            sanadId={c.SanadID}
                            fallbackIds={c.SandRwah}
                            onNarratorClick={handleLocalNarratorClick}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sanad View */}
            {serviceType === 'sanad' && (
              <div className="space-y-4">
                {chains.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا توجد مسارات أسانيد تفصيلية مسجلة في قاعدة البيانات لهذا الحديث.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">رسم بياني تفاعلي لشجرة أسانيد الحديث:</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        يعرض الرسم البياني أدناه مسارات الرواية المتعددة للحديث المتصلة ببعضها وصولاً للصحابي. يمكنك النقر على الرواة لاستعراض بطاقة تراجمهم.
                      </p>
                    </div>

                    <div className="hadith-detail-modal-element-46 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 bg-white dark:bg-slate-950 shadow-inner overflow-x-auto">
                      <CombinedTransmissionChainGraph
                        sanadIds={chains.map(c => c.SanadID)}
                        onSelectNarrator={handleLocalNarratorClick}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Combined View */}
            {serviceType === 'combined' && (
              <div className="space-y-6">
                <div className="relative">
                  <button
                    onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                    className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-2">
                      <span>اختر المصادر والكتب لدمج طرقها وأسانيدها:</span>
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {selectedCombinedHadithIds.length} محدد
                      </span>
                    </span>
                    <span className="text-slate-400">{isSourceDropdownOpen ? '▲' : '▼'}</span>
                  </button>
                  {isSourceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsSourceDropdownOpen(false)}></div>
                      <div className="absolute right-0 left-0 mt-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 max-h-60 overflow-y-auto flex flex-col gap-2 custom-scrollbar animate-in slide-in-from-top-2 duration-150">
                        {getCombinedHadithOptions().map((option) => {
                          const isChecked = selectedCombinedHadithIds.includes(option.id);
                          return (
                            <label
                              key={option.id}
                              className={`flex items-center gap-3 p-2 rounded-xl text-xs font-medium cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                isChecked ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-650 dark:text-slate-350'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCombinedHadithIds([...selectedCombinedHadithIds, option.id]);
                                  } else {
                                    setSelectedCombinedHadithIds(selectedCombinedHadithIds.filter(id => id !== option.id));
                                  }
                                }}
                                className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-transparent"
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <CombinedTakhreejChainGraph
                  hadithIds={selectedCombinedHadithIds}
                  onSelectNarrator={handleLocalNarratorClick}
                />
              </div>
            )}

            {/* Compound Matn View */}
            {serviceType === 'compound' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {!combinedMatn ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا يوجد متن مجمع مسجل لهذا الحديث حالياً.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">المتن المجمع وفوائد الروايات البديلة:</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                        يتم تجميع كافة الروايات والطرق لهذا الحديث وعرض الاختلافات والزيادات اللفظية الواردة فيها بين معقوفتين [وفي رواية: ...] بشكل يسهل مقارنتها.
                      </p>
                    </div>
                    
                    <div className="relative p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm leading-relaxed text-slate-800 dark:text-slate-200 select-text">
                      {/* Floating Copy Button (Icon-Only) */}
                      <button
                        onClick={handleCopyScholarlyText}
                        className="absolute top-4 left-4 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 dark:bg-slate-900/60 dark:hover:bg-emerald-950/40 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-800 transition-all duration-200 flex items-center justify-center w-9 h-9 cursor-pointer shadow-sm"
                        title="نسخ النص المجمع الأكاديمي مع قائمة المصادر"
                      >
                        {copySuccess ? (
                          <svg className="w-4.5 h-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>

                      {/* Interactive Matn Segments */}
                      <div className="text-slate-850 dark:text-slate-100 font-arabic text-xl leading-[2.2] text-right font-medium whitespace-pre-wrap pl-12 dir-rtl">
                        {combinedMatn.scholarly_segments && combinedMatn.scholarly_segments.length > 0 ? (
                          combinedMatn.scholarly_segments.map((seg, idx) => {
                            if (seg.type === 'text') {
                              return <span key={idx}>{seg.text}</span>;
                            }
                            return (
                              <span key={idx} className="relative group inline cursor-help">
                                {seg.leadSpace}
                                <span className="border-b-2 border-dotted border-emerald-500/80 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-0.5 rounded transition-all duration-200 text-emerald-700 dark:text-emerald-400 font-bold">
                                  [{seg.text}]
                                </span>
                                {seg.trailSpace}
                                
                                {/* Hover Tooltip */}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 flex flex-col w-72 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs rounded-xl p-3.5 shadow-xl border border-slate-700/40 dark:border-slate-800/80 z-50 pointer-events-none dir-rtl text-right font-sans font-normal normal-case">
                                  <span className="font-bold text-emerald-400 mb-1 text-[11px] block">
                                    مصادر اللفظ البديل:
                                  </span>
                                  <span className="whitespace-pre-line leading-relaxed text-slate-200 text-[11px]">
                                    {seg.sources}
                                  </span>
                                  {/* Arrow */}
                                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-950/95"></span>
                                </span>
                              </span>
                            );
                          })
                        ) : (
                          combinedMatn.scholarly_matn || combinedMatn.clean_matn
                        )}
                      </div>
                    </div>

                    {combinedMatn.asaned_comp && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          مقارنة الأسانيد والشواهد:
                        </h4>
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                          {combinedMatn.asaned_comp}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Takhreeg View */}
            {serviceType === 'takhreeg' && (
              <div className="space-y-6">
                {/* 3 Main Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setTakhreegTab('matn')}
                    className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 ${
                      takhreegTab === 'matn'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    تخريج من كتب المتون
                  </button>
                  <button
                    onClick={() => setTakhreegTab('shawahed')}
                    className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 ${
                      takhreegTab === 'shawahed'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    شواهد ومتابعات
                  </button>
                  <button
                    onClick={() => setTakhreegTab('services')}
                    className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 ${
                      takhreegTab === 'services'
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    كتب العلل
                  </button>
                </div>

                {takhreegTab === 'matn' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">مستوى عرض التخريج:</span>
                        <div className="flex gap-1">
                          {(['general', 'medium', 'detailed'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setTakhreegMode(m)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                takhreegMode === m
                                  ? 'bg-emerald-500 text-white shadow'
                                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 font-sans'
                              }`}
                            >
                              {m === 'general' ? 'إجمالي' : m === 'medium' ? 'متوسط' : 'تفصيلي'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const text = generateLegacyTakhreejText(takhreegMode, takhreej, shawahedList, serviceBooksList);
                          navigator.clipboard.writeText(text).then(() => {
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                          });
                        }}
                        title={copySuccess ? 'تم النسخ' : 'نسخ التخريج بالنسق المرجعي'}
                        className="p-2 rounded-lg text-sm bg-emerald-100 hover:bg-emerald-250 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-all select-none cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
                      >
                        {copySuccess ? '✔' : '📋'}
                      </button>
                    </div>

                    {/* Takhreej References */}
                    <div className="space-y-6">
                      {(!takhreej || takhreej.length === 0) ? (
                        <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                          لا توجد مواضع تخريج مسجلة لهذا الحديث.
                        </div>
                      ) : (
                        takhreej.map((bookGroup: any, bIdx: number) => (
                          <div key={bIdx} className="space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 border-r-4 border-emerald-500 pr-2">
                              أخرجه في {bookGroup.book_name}
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                              {bookGroup.hadiths && bookGroup.hadiths.map((h: any, hIdx: number) => (
                                <a
                                  key={hIdx}
                                  href={h.number ? `?view=library&book=${bookGroup.book_id}&hadith=${h.number}&tarqeem=TarqeemMatboa1` : `?view=library&book=${bookGroup.book_id}&page=${h.page || 1}&part=${h.volume || 1}`}
                                  className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all flex flex-col gap-2 text-inherit decoration-none cursor-pointer"
                                >
                                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span>
                                      جزء {h.volume || 1}، صفحة {h.page || 1}
                                    </span>
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                                      حديث رقم: {h.number}
                                    </span>
                                  </div>
                                  
                                  {/* Chapter Path (Medium / Detailed) */}
                                  {takhreegMode !== 'general' && h.chapter_path && h.chapter_path.length > 0 && (
                                    <div className="text-xs text-emerald-600/90 dark:text-emerald-400/90 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10 flex flex-wrap gap-1 items-center">
                                      <span className="font-semibold text-[10px] text-emerald-500">الباب:</span>
                                      {h.chapter_path.map((ch: string, idx: number) => (
                                        <React.Fragment key={idx}>
                                          {idx > 0 && <span className="text-[10px] text-slate-400">◀</span>}
                                          <span>{ch}</span>
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}

                                  {/* Comparison Wording (Detailed) */}
                                  {takhreegMode === 'detailed' && h.comparison_comment && (
                                    <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-500/10">
                                      <span className="font-semibold">لفظ الحديث مقارنة بالأصل:</span> {h.comparison_comment}
                                    </div>
                                  )}
                                  </a>
                                ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Shawahed */}
                {takhreegTab === 'shawahed' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {shawahedList.length === 0 ? (
                      <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        لا توجد شواهد أو متابعات مسجلة لهذا الحديث.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {shawahedList.map((item, idx) => (
                           <a
                             key={idx}
                             href={item.tarqeem ? `?view=library&book=${item.book_id}&hadith=${item.tarqeem}&tarqeem=TarqeemMatboa1` : `?view=library&book=${item.book_id}&page=${item.page || 1}&part=${item.part || 1}`}
                             className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all flex flex-col gap-2 text-inherit decoration-none cursor-pointer"
                           >
                             <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                               وله شاهد من حديث {item.companion_name || 'صحابي غير محدد'}
                             </div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                               أخرجه {item.book_name} ({item.part} / {item.page}) برقم: ({item.tarqeem})
                             </div>

                           </a>
                         ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Service Books */}
                {takhreegTab === 'services' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {Object.keys(serviceBooksList).length === 0 ? (
                      <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                        لا توجد كتب علل مسجلة لهذا الحديث.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.values(serviceBooksList).flat().map((b, idx) => (
                          <a
                            key={idx}
                            href={`?view=library&book=${b.service_id}&page=${b.page || 1}&part=${b.part || 1}`}
                            className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all flex justify-between items-center gap-2 text-inherit decoration-none cursor-pointer w-full"
                          >
                            <div className="text-xs text-slate-650 dark:text-slate-400">
                              <span className="font-semibold block text-slate-800 dark:text-slate-200 mb-1">{b.book_name}</span>
                              ({b.part} / {b.page})
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Commentary View */}
            {serviceType === 'commentary' && (
              <div className="space-y-4">
                {commentaries.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لم يتم العثور على شروح مسجلة لهذا الحديث.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">اختر كتاب الشرح:</label>
                      <select
                        value={selectedCommentaryIdx}
                        onChange={(e) => setSelectedCommentaryIdx(Number(e.target.value))}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                      >
                        {commentaries.map((c, idx) => (
                          <option key={idx} value={idx}>{c.book_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-250 dark:border-slate-800/80 bg-white dark:bg-slate-950 shadow-inner leading-relaxed text-slate-800 dark:text-slate-200">
                      <HadithContentRenderer
                        content={commentaries[selectedCommentaryIdx]?.content || ''}
                        onNarratorClick={handleLocalNarratorClick}
                        onLexiconClick={onLexiconClick}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Thematic View */}
            {serviceType === 'thematic' && (
              <div className="space-y-4">
                {thematicNodes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا توجد فهارس موضوعية مسجلة لهذا الحديث حالياً.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500">المباحث والروابط الموضوعية للحديث (انقر للانتقال للشجرة):</h3>
                    <div className="space-y-2">
                      {thematicNodes.map((node, idx) => (
                        <div
                          key={idx}
                          onClick={() => onSelectSubjectNode?.(node.ID, node.path ? node.path.slice(0, -1).map(p => p.ID) : [])}
                          className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-900/40 text-xs font-medium text-slate-700 dark:text-slate-350 transition-all cursor-pointer flex flex-wrap items-center gap-1"
                        >
                          {node.path ? (
                            node.path.map((pathNode, pathIdx) => (
                              <React.Fragment key={pathNode.ID}>
                                {pathIdx > 0 && <span className="text-slate-400 dark:text-slate-650 mx-1">➔</span>}
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const ancestorIds = node.path.slice(0, pathIdx).map(p => p.ID);
                                    onSelectSubjectNode?.(pathNode.ID, ancestorIds);
                                  }}
                                  className="hover:underline text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold"
                                >
                                  {pathNode.Title}
                                </span>
                              </React.Fragment>
                            ))
                          ) : (
                            node.Text || `موضوع #${node.ID}`
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analysis View */}
            {serviceType === 'analysis' && (
              <div className="space-y-4">
                {analysisData.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا توجد تحليلات علمية أو تطبيقات اصطلاحية مسجلة لهذا الحديث.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500">التحليل العلمي والتعليقات الحديثية:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {analysisData.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-xs flex flex-col gap-1.5"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-300">{item.Title || 'تحليل علمي'}</span>
                          <p className="text-slate-555 dark:text-slate-400 leading-relaxed">{item.Content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Occasions View */}
            {serviceType === 'occasions' && (
              <div className="space-y-4">
                {occasionsData.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    لا تتوفر أسباب ورود أو أحداث تاريخية مسجلة لهذا الحديث.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500">أسباب الورود والسياق التاريخي:</h3>
                    <div className="space-y-3">
                      {occasionsData.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 text-xs flex flex-col gap-1.5"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-1.5 mb-1.5">
                            <span className="font-bold text-slate-750 dark:text-slate-300">{item.event_name || 'سياق تاريخي'}</span>
                            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-mono">{item.date}</span>
                          </div>
                          <p className="text-slate-555 dark:text-slate-400 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="hadith-detail-modal-card-60">
            <button
              onClick={onClose}
              className="hadith-detail-modal-title-62"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* LEFT SIDE: Narrator details panel */}
        {selectedNarratorId !== null && (
          <div className="w-full md:w-[420px] shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-900 text-slate-100 animate-in slide-in-from-left duration-300">
            <NarratorDrawer
              narratorId={selectedNarratorId}
              onClose={() => setSelectedNarratorId(null)}
              inline={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
