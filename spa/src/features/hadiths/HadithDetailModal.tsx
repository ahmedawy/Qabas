import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { HadithDetailResponse } from '../../types';
import { HadithContentRenderer } from './HadithCard';
import { TransmissionChainSvg } from '../chains/TransmissionChainSvg';


interface HadithDetailModalProps {
  hadithId: number;
  onClose: () => void;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
}

export const HadithDetailModal: React.FC<HadithDetailModalProps> = ({
  hadithId,
  onClose,
  onNarratorClick,
  onLexiconClick,
}) => {
  const [currentHadithId, setCurrentHadithId] = useState(hadithId);
  const [data, setData] = useState<HadithDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'judgments' | 'chains' | 'takhreeg'>('text');
  const [selectedSanadId, setSelectedSanadId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentHadithId(hadithId);
  }, [hadithId]);


  useEffect(() => {
    // Listen for ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    let active = true;
    setLoading(true);
    setError(null);

    api.getHadithDetail(currentHadithId)
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'فشل تحميل بيانات الحديث التفصيلية');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentHadithId, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans">جاري تحميل بطاقة الحديث...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">عذراً، فشل تحميل التفاصيل</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
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

  const { hadith, breadcrumbs, judgments, chains } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 backdrop-blur-md bg-slate-950/60 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-right font-sans animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex flex-col gap-1 items-end">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              بطاقة الحديث التفصيلية
            </span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {hadith.BookName} - حديث رقم {hadith.HadithNum}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/80 px-6 bg-slate-50/20 dark:bg-slate-900/10">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all select-none ${
              activeTab === 'text'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            متن الحديث والتخريج
          </button>
          <button
            onClick={() => setActiveTab('judgments')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all select-none relative ${
              activeTab === 'judgments'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            أحكام أهل العلم
            {judgments.length > 0 && (
              <span className="absolute top-2.5 left-0.5 bg-emerald-500 text-white font-mono text-[9px] px-1 rounded-full scale-90">
                {judgments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('chains')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all select-none relative ${
              activeTab === 'chains'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            طرق وأسانيد الرواية
            {chains.length > 0 && (
              <span className="absolute top-2.5 left-0.5 bg-indigo-500 text-white font-mono text-[9px] px-1 rounded-full scale-90">
                {chains.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('takhreeg')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all select-none relative ${
              activeTab === 'takhreeg'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            التخريج والزوائد
            {((data.takhreej && data.takhreej.length > 0) || (data.shawahed && data.shawahed.comparisons && data.shawahed.comparisons.length > 0)) && (
              <span className="absolute top-2.5 left-0.5 bg-amber-500 text-white font-mono text-[9px] px-1 rounded-full scale-90">
                {(data.takhreej?.length || 0) + (data.shawahed?.comparisons?.length || 0)}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body / Scroll Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* TAB 1: Main Hadith Content and Breadcrumbs */}
          {activeTab === 'text' && (
            <div className="space-y-6">
              {/* Breadcrumbs Path */}
              {breadcrumbs.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2">الموضع والتبويب الفقهي للحديث:</h4>
                  <div className="flex flex-row-reverse flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.MainID}>
                        <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {crumb.Title}
                        </span>
                        {idx < breadcrumbs.length - 1 && (
                          <span className="text-slate-300 dark:text-slate-700">◀</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Hadith Text Box */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                <HadithContentRenderer
                  content={hadith.CleanContent}
                  annotations={hadith.Annotations}
                  onNarratorClick={onNarratorClick}
                  onLexiconClick={onLexiconClick}
                />
              </div>

              {/* Layout Page and Part reference cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">الجزء</div>
                  <div className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{hadith.PartNum}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">الصفحة</div>
                  <div className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{hadith.PageNum}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">رمز الترقيم</div>
                  <div className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">{hadith.TarqeemHarf || '-'}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">رقم المتن العام</div>
                  <div className="text-base font-bold text-slate-700 dark:text-slate-200 font-mono">#{hadith.MainID}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: authenticity judgments */}
          {activeTab === 'judgments' && (
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
                      className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">حكم الناقد:</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {j.ScientistName}
                        </span>
                      </div>
                      <p className="text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans mt-2">
                        {j.Say}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Chains and Transmission */}
          {activeTab === 'chains' && (
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
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                          معرّف الإسناد: #{c.SanadID}
                        </span>
                        <span className="font-mono text-slate-500">
                          نوع السند: {c.SanadType || 'متصل'}
                        </span>
                      </div>
                      
                      {/* Narrators ID list chain view */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500">سلسلة الرواة (ممثلة بالرموز المعرفة):</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 leading-relaxed">
                          {c.SandRwah}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1 pb-1">
                        <span>مرويات السند المماثلة: {c.HadithsCount} أطراف</span>
                        <button
                          onClick={() => {
                            setSelectedSanadId(selectedSanadId === c.SanadID ? null : c.SanadID);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer"
                        >
                          {selectedSanadId === c.SanadID ? 'إغلاق شجرة الإسناد ▲' : 'عرض شجرة الإسناد التفاعلية (SVG) ◀'}
                        </button>
                      </div>
                      
                      {selectedSanadId === c.SanadID && onNarratorClick && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <TransmissionChainSvg
                            sanadId={c.SanadID}
                            onSelectNarrator={onNarratorClick}
                          />
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Takhreej, Comparisons, Combined Matns */}
          {activeTab === 'takhreeg' && (
            <div className="space-y-8">
              {/* Combined Matn Section */}
              {data.combined_matn && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                    المتن المجمع وفوائد الروايات البديلة (Combined Matn XML)
                  </h3>
                  <div className="p-5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/[0.02] border border-indigo-500/10 shadow-inner">
                    <HadithContentRenderer
                      content={data.combined_matn.clean_matn}
                      annotations={data.combined_matn.matn_annotations}
                      onNarratorClick={onNarratorClick}
                      onLexiconClick={onLexiconClick}
                    />
                  </div>
                </div>
              )}

              {/* Takhreej Cross references grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  مواضع تخريج الحديث في دواوين السنة (Takhreej References)
                </h3>
                {(!data.takhreej || data.takhreej.length === 0) ? (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                    لا توجد مواضع تخريج مسجلة لهذا الحديث.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.takhreej.map((t) => (
                      <div
                        key={t.HadithMainID}
                        onClick={() => setCurrentHadithId(t.HadithMainID)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          t.HadithMainID === currentHadithId
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between text-xs items-center font-bold">
                          <span>{t.BookName}</span>
                          <span className="font-mono bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                            حديث {t.HadithNum}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                          {t.Tarf}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                          جزء {t.PartNum}، صفحة {t.PageNum}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shawahed Motaba'at Comparison */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  المتابعات والشواهد ومقارنة المتون (Motaba'at Comparisons)
                </h3>
                {(!data.shawahed || !data.shawahed.comparisons || data.shawahed.comparisons.length === 0) ? (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                    لا توجد مقارنات متون أو شواهد مسجلة في هذه الطبعة.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.shawahed.comparisons.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentHadithId(c.SlaveMatnID)}
                        className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">{c.BookName} (حديث {c.HadithNum})</span>
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] rounded font-semibold">
                            {c.Comment} (تطابق {c.MatchSort}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic leading-relaxed">
                          {c.Tarf}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            تنبيه: انقر على أسماء الرواة الملونين داخل النص للوصول السريع إلى معاجم التراجم.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            إغلاق البطاقة
          </button>
        </div>

      </div>
    </div>
  );
};
