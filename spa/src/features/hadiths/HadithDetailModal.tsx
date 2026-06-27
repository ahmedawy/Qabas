import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { HadithDetailResponse } from '../../types';
import { HadithContentRenderer } from './HadithCard';
import { TransmissionChainSvg } from '../chains/TransmissionChainSvg';
import { NarratorDrawer } from '../narrators/NarratorDrawer';


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
            {n.Name || n.AbbName || `راوٍ #${n.ID}`}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};


interface HadithDetailModalProps {
  hadithId: number;
  onClose: () => void;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
}

export const HadithDetailModal: React.FC<HadithDetailModalProps> = ({
  hadithId,
  onClose,
  onNarratorClick: _onNarratorClick,
  onLexiconClick,
}) => {
  const [currentHadithId, setCurrentHadithId] = useState(hadithId);
  const [data, setData] = useState<HadithDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'judgments' | 'chains' | 'takhreeg'>('text');
  const [selectedSanadId, setSelectedSanadId] = useState<number | null>(null);
  const [selectedNarratorId, setSelectedNarratorId] = useState<number | null>(null);

  const handleLocalNarratorClick = (id: number) => {
    setSelectedNarratorId(id);
  };

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
      <div className="hadith-detail-modal-element-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans">جاري تحميل بطاقة الحديث...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="hadith-detail-modal-element-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full text-center">
          <div className="hadith-detail-modal-text-11">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  const { hadith, breadcrumbs, judgments, chains } = data;

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
              بطاقة الحديث التفصيلية
            </span>
            <h2 className="hadith-detail-modal-title-21">
              {hadith.BookName} - حديث رقم {hadith.HadithNum}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hadith-detail-modal-element-22">
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
              <span className="hadith-detail-modal-text-23">
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
              <span className="hadith-detail-modal-text-24">
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
              <span className="hadith-detail-modal-text-25">
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
                <div className="hadith-detail-modal-card-27">
                  <h4 className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2">الموضع والتبويب الفقهي للحديث:</h4>
                  <div className="flex flex-row-reverse flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.MainID}>
                        <span className="hadith-detail-modal-text-30">
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
              <div className="hadith-detail-modal-card-32">
                <HadithContentRenderer
                  content={hadith.CleanContent}
                  annotations={hadith.Annotations}
                  onNarratorClick={handleLocalNarratorClick}
                  onLexiconClick={onLexiconClick}
                />
              </div>

              {/* Layout Page and Part reference cards */}
              <div className="hadith-detail-modal-grid-33">
                <div className="hadith-detail-modal-card-1">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">الجزء</div>
                  <div className="hadith-detail-modal-title-3">{hadith.PartNum}</div>
                </div>
                <div className="hadith-detail-modal-card-1">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">الصفحة</div>
                  <div className="hadith-detail-modal-title-3">{hadith.PageNum}</div>
                </div>
                <div className="hadith-detail-modal-card-1">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">رمز الترقيم</div>
                  <div className="hadith-detail-modal-title-3">{hadith.TarqeemHarf || '-'}</div>
                </div>
                <div className="hadith-detail-modal-card-1">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1">رقم المتن العام</div>
                  <div className="hadith-detail-modal-title-3">#{hadith.MainID}</div>
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
                      className="hadith-detail-modal-stack-38"
                    >
                      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="hadith-detail-modal-title-40">
                          معرّف الإسناد: #{c.SanadID}
                        </span>
                        <span className="font-mono text-slate-500">
                          نوع السند: {c.SanadType || 'متصل'}
                        </span>
                      </div>
                      
                      {/* Narrators name list chain view */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500">سلسلة الرواة (ممثلة بالأسماء المتصلة ببطاقاتهم):</h4>
                        <NarratorChainViewer
                          sanadId={c.SanadID}
                          fallbackIds={c.SandRwah}
                          onNarratorClick={handleLocalNarratorClick}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60 mt-1 pb-1">
                        <span>مرويات السند المماثلة: {c.HadithsCount} أطراف</span>
                        <button
                          onClick={() => {
                            setSelectedSanadId(selectedSanadId === c.SanadID ? null : c.SanadID);
                          }}
                          className="hadith-detail-modal-text-45"
                        >
                          {selectedSanadId === c.SanadID ? 'إغلاق شجرة الإسناد ▲' : 'عرض شجرة الإسناد التفاعلية (SVG) ◀'}
                        </button>
                      </div>
                      
                      {selectedSanadId === c.SanadID && handleLocalNarratorClick && (
                        <div className="hadith-detail-modal-element-46">
                          <TransmissionChainSvg
                            sanadId={c.SanadID}
                            onSelectNarrator={handleLocalNarratorClick}
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
                  <h3 className="hadith-detail-modal-title-47">
                    المتن المجمع وفوائد الروايات البديلة (Combined Matn XML)
                  </h3>
                  <div className="hadith-detail-modal-card-48">
                    <HadithContentRenderer
                      content={data.combined_matn.clean_matn}
                      annotations={data.combined_matn.matn_annotations}
                      onNarratorClick={handleLocalNarratorClick}
                      onLexiconClick={onLexiconClick}
                    />
                  </div>
                </div>
              )}

              {/* Takhreej Cross references grid */}
              <div className="space-y-3">
                <h3 className="hadith-detail-modal-title-6">
                  مواضع تخريج الحديث في دواوين السنة (Takhreej References)
                </h3>
                {(!data.takhreej || data.takhreej.length === 0) ? (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                    لا توجد مواضع تخريج مسجلة لهذا الحديث.
                  </div>
                ) : (
                  <div className="hadith-detail-modal-grid-49">
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
                        <div className="hadith-detail-modal-wrapper-50">
                          <span>{t.BookName}</span>
                          <span className="hadith-detail-modal-text-51">
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
                <h3 className="hadith-detail-modal-title-6">
                  المتابعات والشواهد ومقارنة المتون (Motaba'at Comparisons)
                </h3>
                {(!data.shawahed || !data.shawahed.comparisons || data.shawahed.comparisons.length === 0) ? (
                  <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
                    لا توجد مقارنات متون أو شواهد مسجلة في هذه الطبعة.
                  </div>
                ) : (
                  <div className="hadith-detail-modal-grid-54">
                    {data.shawahed.comparisons.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentHadithId(c.SlaveMatnID)}
                        className="hadith-detail-modal-stack-55"
                      >
                        <div className="hadith-detail-modal-wrapper-56">
                          <span className="text-slate-700 dark:text-slate-300">{c.BookName} (حديث {c.HadithNum})</span>
                          <span className="hadith-detail-modal-text-58">
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
        <div className="hadith-detail-modal-card-60">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            تنبيه: انقر على أسماء الرواة الملونين داخل النص للوصول السريع إلى معاجم التراجم.
          </span>
          <button
            onClick={onClose}
            className="hadith-detail-modal-title-62"
          >
            إغلاق البطاقة
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
