import React, { useState } from 'react';
import type { Book } from '../../types';

export type DisplayMethod = 'hadith_num' | 'part_page' | 'toc';

interface DisplayMethodPanelProps {
  selectedBook: Book;
  onLoadHadithByNum: (num: string | number, tarqeem: string) => void;
  onLoadHadithByPage: (page: number, part?: number) => void;
}

export const DisplayMethodPanel: React.FC<DisplayMethodPanelProps> = ({
  selectedBook,
  onLoadHadithByNum,
  onLoadHadithByPage,
}) => {
  const [method, setMethod] = useState<DisplayMethod>('hadith_num');
  const [hadithNum, setHadithNum] = useState<string>('5'); // Default to 5 since we know it exists in Book 1
  const [tarqeem, setTarqeem] = useState<string>('ID');
  const [partNum, setPartNum] = useState<string>('1');
  const [pageNum, setPageNum] = useState<string>('6'); // Default to page 6

  const handleLoadContent = () => {
    if (method === 'hadith_num') {
      if (hadithNum.trim() !== '') {
        onLoadHadithByNum(hadithNum, tarqeem);
      }
    } else if (method === 'part_page') {
      const page = parseInt(pageNum, 10);
      const part = parseInt(partNum, 10);
      if (!isNaN(page) && page > 0) {
        onLoadHadithByPage(page, isNaN(part) ? undefined : part);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none text-right space-y-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        <span>خيارات استعراض الكتاب المحدد: </span>
        <span className="text-emerald-600 dark:text-emerald-400 font-amiri font-bold text-xl">{selectedBook.Title}</span>
      </h3>

      {/* Switcher Radios */}
      <div className="flex flex-row flex-wrap gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 text-sm font-semibold select-none">
          <input
            type="radio"
            name="rblDisplayMethods"
            value="hadith_num"
            checked={method === 'hadith_num'}
            onChange={() => setMethod('hadith_num')}
            className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          عرض برقم الحديث
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 text-sm font-semibold select-none">
          <input
            type="radio"
            name="rblDisplayMethods"
            value="part_page"
            checked={method === 'part_page'}
            onChange={() => setMethod('part_page')}
            className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          الجزء والصفحة
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 text-sm font-semibold select-none">
          <input
            type="radio"
            name="rblDisplayMethods"
            value="toc"
            checked={method === 'toc'}
            onChange={() => setMethod('toc')}
            className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          شجرة التبويب (الفهرس)
        </label>
      </div>

      {/* Conditional Wrappers */}
      <div className="min-h-[60px] flex items-center">
        {method === 'hadith_num' && (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="txtHadithNumber" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">رقم الحديث:</label>
              <input
                type="number"
                id="txtHadithNumber"
                value={hadithNum}
                onChange={(e) => setHadithNum(e.target.value)}
                className="w-full text-right py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:outline-none focus:border-emerald-500"
                min="1"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-[2]">
              <label htmlFor="ddlTarqeemType" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">الترقيم المعتمد:</label>
              <select
                id="ddlTarqeemType"
                value={tarqeem}
                onChange={(e) => setTarqeem(e.target.value)}
                className="w-full text-right py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="ID">ترقيم شركة حرف (الافتراضي)</option>
                <option value="TarqeemHarf">ترقيم شركة حرف الموثق</option>
                <option value="TarqeemMatboa1">ترقيم طبعة: دار طوق النجاة</option>
                <option value="TarqeemMatboa2">ترقيم طبعة: الطبعة المصورة</option>
              </select>
            </div>
          </div>
        )}

        {method === 'part_page' && (
          <div className="flex flex-row gap-4 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="txtPartNum" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">رقم الجزء:</label>
              <input
                type="number"
                id="txtPartNum"
                value={partNum}
                onChange={(e) => setPartNum(e.target.value)}
                className="w-full text-right py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:outline-none focus:border-emerald-500"
                min="1"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="txtPageNum" className="text-xs text-slate-400 dark:text-slate-500 font-semibold">رقم الصفحة:</label>
              <input
                type="number"
                id="txtPageNum"
                value={pageNum}
                onChange={(e) => setPageNum(e.target.value)}
                className="w-full text-right py-2 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:outline-none focus:border-emerald-500"
                min="1"
              />
            </div>
          </div>
        )}

        {method === 'toc' && (
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            تفضل بتصفح شجرة الأبواب الجانبية في الجهة اليمنى للانتقال المباشر بين فصول ومقاطع الكتاب.
          </div>
        )}
      </div>

      {method !== 'toc' && (
        <button
          onClick={handleLoadContent}
          className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>عرض المحتوى</span>
          <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      )}
    </div>
  );
};
