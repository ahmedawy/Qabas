import React, { useState } from 'react';
import type { Annotation, HadithServiceType } from '../../types';
import { getHadithAST } from '../../utils/hadithParser';
import type { ASTNode } from '../../utils/hadithParser';
import { buildASTFromAnnotations } from '../../utils/annotationRenderer';
import { isServiceAvailable } from '../../utils/serviceFlags';

	export interface BaseHadithData {
  MainID?: number;
  ID?: number;
  BookName?: string;
  HadithNum?: number | string;
  PartNum?: number;
  PageNum?: number;
  CleanContent: string;
  Annotations?: Annotation[] | string | null;
  Title?: string;
  ServiceFlags?: number;
}

export interface HadithCardProps {
  hadith: BaseHadithData;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onServiceClick?: (hadith: BaseHadithData, serviceType: HadithServiceType) => void;
  onHighlightClick?: (hadith: BaseHadithData, type: string, linkId: number | null, text: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (hadith: BaseHadithData) => void;
  onClick?: () => void;
  extraHeaderContent?: React.ReactNode;
}

const decodeHtmlEntities = (text: string): string => {
  if (!text || !text.includes('&')) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const HadithContentRenderer: React.FC<{
  content: string;
  annotations?: Annotation[] | string;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onHighlightClick?: (type: string, linkId: number | null, text: string) => void;
}> = ({ content, annotations, onNarratorClick, onLexiconClick, onHighlightClick }) => {
  if (!content) {
    return null;
  }
  // Simple recursive React component mapping AST nodes
  const renderASTNode = (node: ASTNode, index: number): React.ReactNode => {
    if (node.type === 'text') {
      return decodeHtmlEntities(node.text);
    }

    const { tag, attrs, children } = node;
    const rawId = attrs['ربط'] || attrs['رقم'] || '';
    const cleanId = parseInt(rawId.trim(), 10);

    const reactChildren = children.map((child, idx) =>
      renderASTNode(child, idx)
    );

    switch (tag) {
      case 'راوي':
        return (
          <span
            key={index}
            onClick={() => !isNaN(cleanId) && onNarratorClick?.(cleanId)}
            className="hadith-card-text-1"
            title="انقر لعرض ترجمة الراوي"
          >
            {reactChildren}
          </span>
        );
      case 'غريب':
        return (
          <span
            key={index}
            onClick={() => !isNaN(cleanId) && onLexiconClick?.(cleanId)}
            className="hadith-card-text-2"
            title="انقر لعرض معنى الكلمة الغريبة"
          >
            {reactChildren}
          </span>
        );
      case 'علم_نساء':
        return (
          <span
            key={index}
            className="text-pink-600 dark:text-pink-400 font-semibold text-[0.95em]"
          >
            {reactChildren}
          </span>
        );
      case 'علم_مكان':
        return (
          <span key={index} className="hadith-card-text-3">
            {reactChildren}
          </span>
        );
      case 'علم_رجل':
        return (
          <span
            key={index}
            className="text-teal-600 dark:text-teal-400 font-semibold text-[0.95em]"
          >
            {reactChildren}
          </span>
        );
      case 'علم_نبي':
        return (
          <span key={index} className="hadith-card-text-4">
            {reactChildren}
          </span>
        );
      case 'علم_ملائكة':
        return (
          <span key={index} className="hadith-card-text-5">
            {reactChildren}
          </span>
        );
      case 'علم_جماعة':
        return (
          <span key={index} className="text-slate-500 dark:text-slate-400 font-semibold text-[0.95em]">
            {reactChildren}
          </span>
        );
      case 'إدراج':
      case 'أصل':
      case 'مخالف': {
        const textContent = node.children.map(c => {
          if (c.type === 'text') return c.text;
          return '';
        }).join('');
        
        let highlightClass = "text-amber-600 dark:text-amber-400 font-medium cursor-pointer border-b border-dotted border-amber-500 hover:text-amber-800 dark:hover:text-amber-300";
        if (tag === 'إدراج') {
          highlightClass = "text-slate-500 dark:text-slate-400 italic font-medium cursor-pointer border-b border-dotted border-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400";
        } else if (tag === 'أصل') {
          highlightClass = "text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer border-b border-dotted border-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-300";
        }

        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onHighlightClick?.(tag, isNaN(cleanId) ? null : cleanId, textContent);
            }}
            className={highlightClass}
            title={`انقر لعرض تفاصيل ال${tag}`}
          >
            {tag === 'إدراج' ? `[${reactChildren}]` : reactChildren}
          </span>
        );
      }
      case 'رقم_حديث':
      case 'رقم_حديث_للعرض':
        if (attrs['نوع'] === 'مطبوع') {
          return (
            <span key={index} className="hadith-num-printed font-bold text-slate-500 mx-1">
              {reactChildren}
            </span>
          );
        }
        return null;
      case 'الصفحات':
        return (
          <span key={index} className="text-slate-400 dark:text-slate-500 text-xs font-mono mx-1" title="الجزء / الصفحة">
            [{attrs['جزء'] || ''}/{attrs['صفحة'] || ''}]
          </span>
        );
      case 'سند_مخفي':
      case 'نص_مخفي':
        return null;
      case 'قرآن':
        return (
          <span key={index} className="hadith-card-text-10">
            {reactChildren}
          </span>
        );
      case 'آية':
        return (
          <span key={index} className="hadith-card-text-11">
            ﴿ {reactChildren} ﴾
          </span>
        );
      case 'MMHit':
        return (
          <span
            key={index}
            className="hadith-card-text-12"
            title={attrs['MMSText'] || 'رواية بديلة'}
          >
            {reactChildren}
          </span>
        );
      case 'نه':
        return <br key={index} />;
      default:
        return <span key={index}>{reactChildren}</span>;
    }
  };

  let parsedAnnotations: Annotation[] | undefined = undefined;
  if (annotations) {
    if (Array.isArray(annotations)) {
      parsedAnnotations = annotations;
    } else if (typeof annotations === 'string') {
      try {
        parsedAnnotations = JSON.parse(annotations);
      } catch (e) {
        console.error('Failed to parse annotations JSON string', e);
      }
    }
  }

  const ast = parsedAnnotations && parsedAnnotations.length > 0
    ? buildASTFromAnnotations(content, parsedAnnotations)
    : getHadithAST(content);

  return (
    <span className="hadith-card-element-13">
      {ast.map((node, idx) => renderASTNode(node, idx))}
    </span>
  );
};

export const HadithCard: React.FC<HadithCardProps> = ({
  hadith,
  onNarratorClick,
  onLexiconClick,
  onServiceClick,
  onHighlightClick,
  isBookmarked,
  onToggleBookmark,
  onClick,
  extraHeaderContent,
}) => {
  const [tooltipData, setTooltipData] = useState<{
    type: string;
    text: string;
    bookName?: string;
    content?: string;
    part?: number;
    page?: number;
    loading: boolean;
    error?: string;
  } | null>(null);

  const handleHighlightClickLocal = async (type: string, linkId: number | null, text: string) => {
    // Call parent handler if provided
    if (onHighlightClick) {
      onHighlightClick(hadith, type, linkId, text);
    }
    
    if (!linkId) {
      let desc = '';
      if (type === 'إدراج') {
        desc = 'هذا اللفظ مدرج في الحديث الشريف (كلام مضاف من بعض الرواة).';
      } else if (type === 'أصل') {
        desc = 'هذا اللفظ يمثل رواية الأصل للحديث.';
      } else if (type === 'مخالف') {
        desc = 'هذا اللفظ يمثل رواية المخالف للفظ الأصل.';
      }
      setTooltipData({
        type,
        text,
        content: desc,
        loading: false
      });
      return;
    }

    setTooltipData({ type, text, loading: true });

    try {
      const response = await fetch(`/api/v1/service-item/${linkId}`);
      if (!response.ok) {
        throw new Error('فشل تحميل تفاصيل التخريج/الإدراج');
      }
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        setTooltipData({
          type,
          text,
          bookName: json.data.book_name,
          content: json.data.content,
          part: json.data.part,
          page: json.data.page,
          loading: false
        });
      } else {
        throw new Error('لا توجد بيانات مسجلة');
      }
    } catch (err: any) {
      setTooltipData({
        type,
        text,
        loading: false,
        error: err.message || 'حدث خطأ أثناء تحميل البيانات'
      });
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-right flex flex-col gap-4 relative group transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-emerald-500/60 dark:hover:border-emerald-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/50' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
    >
      {extraHeaderContent && (
        <div className="mb-2">
          {extraHeaderContent}
        </div>
      )}
      
      {/* Header Info */}
      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-sans border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(hadith);
              }}
              className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-750'
              }`}
              title={isBookmarked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
          <span className="hadith-card-text-16">
            {hadith.BookName}
          </span>
          <span>•</span>
          <span>الجزء {hadith.PartNum}، الصفحة {hadith.PageNum}</span>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-600 dark:text-slate-300">
          حديث رقم: {hadith.HadithNum}
        </div>
      </div>

      {/* Main Hadith text content */}
      <div className="py-2">
        <HadithContentRenderer
          content={hadith.CleanContent}
          annotations={hadith.Annotations || undefined}
          onNarratorClick={onNarratorClick}
          onLexiconClick={onLexiconClick}
          onHighlightClick={handleHighlightClickLocal}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 gap-4">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          معرّف المتن: #{hadith.MainID}
        </span>
        
        {onServiceClick && (hadith.ServiceFlags ?? 0) > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {isServiceAvailable(hadith.ServiceFlags, 'judgments') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'judgments');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="أحكام أهل العلم"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden sm:inline">أحكام</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'chains') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'chains');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="طرق وأسانيد الرواية"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="hidden sm:inline">أسانيد</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'sanad') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'sanad');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="شجرة السند التفاعلية"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <span className="hidden sm:inline">شجرة السند</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'takhreeg') && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceClick(hadith, 'takhreeg');
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                  title="التخريج والزوائد"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="hidden sm:inline">تخريج</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceClick(hadith, 'matn_comparison');
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                  title="مقارنة المتون"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="hidden sm:inline">مقارنة المتون</span>
                </button>
              </>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'compound') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'compound');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="المتن المجمع وفوائد الروايات"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">المتن المجمع</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'combined') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'combined');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="شجرة التخريج المجمعة"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10a3 3 0 11-6 0 3 3 0 016 0zM6 8a3 3 0 100-6 3 3 0 000 6zm0 8h.01M6 22a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span className="hidden sm:inline">الشجرة المجمعة</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'commentary') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'commentary');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="الشرح والكتب الخدمية"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">الشرح</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'tafseer') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'tafseer');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="تفسير الآيات"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="hidden sm:inline">تفسير</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'seerah') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'seerah');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="السيرة النبوية"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="hidden sm:inline">سيرة</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'fiqh') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'fiqh');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="الاستنباطات الفقهية"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="hidden sm:inline">فقه</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'idraj') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'idraj');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="الألفاظ المدرجة"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="hidden sm:inline">إدراج</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'thematic') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'thematic');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                title="الربط الموضوعي"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="hidden sm:inline">الموضوعات</span>
              </button>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'analysis') && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceClick(hadith, 'analysis');
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                  title="تحليل الحديث وعلوم الحديث"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">التحليل</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onServiceClick(hadith, 'analysis_tree');
                  }}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 cursor-pointer"
                  title="شجرة تحليل الحديث"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3m12 6v-2a4 4 0 014-4h2m-9-3V4m-2 0h4m-8 6h4m8 0h4" />
                  </svg>
                  <span className="hidden sm:inline">شجرة التحليل</span>
                </button>
              </>
            )}

            {isServiceAvailable(hadith.ServiceFlags, 'occasions') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceClick(hadith, 'occasions');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-500 transition-all border border-slate-200 dark:border-slate-850 shadow-sm flex items-center gap-1 cursor-pointer"
                title="أسباب الورود وتواريخ المتون"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">أسباب الورود</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Highlight Tooltip */}
      {tooltipData && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 bottom-16 right-6 left-6 p-4 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs shadow-2xl border border-slate-700/40 dark:border-slate-800/80 transition-all duration-300 dir-rtl text-right font-sans"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-emerald-400">
              تفاصيل ال{tooltipData.type}: <span className="text-white italic">"{tooltipData.text}"</span>
            </span>
            <button 
              onClick={() => setTooltipData(null)}
              className="text-slate-400 hover:text-white cursor-pointer text-sm font-bold px-1"
            >
              ✕
            </button>
          </div>

          {tooltipData.loading ? (
            <div className="flex items-center gap-2 py-2 text-slate-400">
              <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>جاري تحميل التفاصيل...</span>
            </div>
          ) : tooltipData.error ? (
            <div className="text-rose-400 py-1">{tooltipData.error}</div>
          ) : (
            <div className="space-y-2 leading-relaxed whitespace-pre-wrap">
              {tooltipData.bookName && (
                <div className="text-[10px] text-emerald-500 font-bold">
                  المصدر: {tooltipData.bookName} 
                  {((tooltipData.part ?? 0) > 0 || (tooltipData.page ?? 0) > 0) && (
                    <span> (جزء: {tooltipData.part} صفحة: {tooltipData.page})</span>
                  )}
                </div>
              )}
              <div className="text-slate-200 text-xs max-h-48 overflow-y-auto custom-scrollbar">
                {tooltipData.content}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
