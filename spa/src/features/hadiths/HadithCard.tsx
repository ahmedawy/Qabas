import React from 'react';
import type { HadithSummary, Annotation } from '../../types';
import { getHadithAST } from '../../utils/hadithParser';
import type { ASTNode } from '../../utils/hadithParser';
import { buildASTFromAnnotations } from '../../utils/annotationRenderer';

interface HadithCardProps {
  hadith: HadithSummary;
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
  onDetailClick?: (hadith: HadithSummary) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (hadith: HadithSummary) => void;
}

const decodeHtmlEntities = (text: string): string => {
  if (!text || !text.includes('&')) return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

export const HadithContentRenderer: React.FC<{
  content: string;
  annotations?: Annotation[];
  onNarratorClick?: (id: number) => void;
  onLexiconClick?: (wordId: number) => void;
}> = ({ content, annotations, onNarratorClick, onLexiconClick }) => {
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
            onClick={() => !isNaN(cleanId) && onNarratorClick?.(cleanId)}
            className={`text-pink-600 dark:text-pink-400 font-semibold text-[0.95em] ${!isNaN(cleanId) && onNarratorClick ? 'cursor-pointer hover:underline' : ''}`}
            title={!isNaN(cleanId) ? 'انقر لعرض الترجمة' : undefined}
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
            onClick={() => !isNaN(cleanId) && onNarratorClick?.(cleanId)}
            className={`text-teal-600 dark:text-teal-400 font-semibold text-[0.95em] ${!isNaN(cleanId) && onNarratorClick ? 'cursor-pointer hover:underline' : ''}`}
            title={!isNaN(cleanId) ? 'انقر لعرض الترجمة' : undefined}
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
        return (
          <span key={index} className="text-slate-500 dark:text-slate-400 italic font-medium">
            [{reactChildren}]
          </span>
        );
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

  const ast = annotations && annotations.length > 0
    ? buildASTFromAnnotations(content, annotations)
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
  onDetailClick,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-right flex flex-col gap-4 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
      
      {/* Header Info */}
      <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-sans border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          {onToggleBookmark && (
            <button
              onClick={() => onToggleBookmark(hadith)}
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
          annotations={hadith.Annotations}
          onNarratorClick={onNarratorClick}
          onLexiconClick={onLexiconClick}
        />
      </div>

      {/* Footer Actions */}
      <div className="hadith-card-element-18">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          معرّف المتن: #{hadith.MainID}
        </span>
        
        {onDetailClick && (
          <button
            onClick={() => onDetailClick(hadith)}
            className="hadith-card-title-20"
          >
            <span>عرض التخريج والأسانيد</span>
            <svg className="hadith-card-element-21" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
