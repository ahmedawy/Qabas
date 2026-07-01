import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../../types';
import { api, type TarqeemBounds } from '../../api/client';

interface DisplayMethodPanelProps {
  selectedBook: Book;
  hadithNum: string;
  setHadithNum: (val: string) => void;
  tarqeem: string;
  setTarqeem: (val: string) => void;
  partNum: string;
  setPartNum: (val: string) => void;
  pageNum: string;
  setPageNum: (val: string) => void;
  onLoadHadithByNum: (num: string | number, tarqeem: string) => Promise<any>;
  onLoadHadithByPage: (page: number, part?: number) => void;
}

export const DisplayMethodPanel: React.FC<DisplayMethodPanelProps> = ({
  selectedBook,
  hadithNum,
  setHadithNum,
  tarqeem,
  setTarqeem,
  partNum,
  setPartNum,
  pageNum,
  setPageNum,
  onLoadHadithByNum,
  onLoadHadithByPage,
}) => {
  const [availableTarqeems, setAvailableTarqeems] = useState<Record<string, TarqeemBounds>>({
    ID: { available: true }
  });

  const activeBounds = availableTarqeems[tarqeem] || {};

  // Store tarqeem in ref to access inside the useEffect without triggering refetch
  const tarqeemRef = useRef(tarqeem);
  useEffect(() => {
    tarqeemRef.current = tarqeem;
  }, [tarqeem]);

  // Debounced effect to fetch tarqeem bounds when selectedBook or partNum changes
  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
      api.getBookTarqeems(selectedBook.ID, partNum, selectedBook.type)
        .then(data => {
          if (isMounted) {
            setAvailableTarqeems(data);
            
            // Adjust the current values if they are out of the new bounds
            const currentTarqeem = tarqeemRef.current;
            const bounds = data[currentTarqeem];
            if (bounds && bounds.available) {
              const currentPage = parseInt(pageNum, 10);
              if (bounds.min_page !== undefined && bounds.max_page !== undefined) {
                if (isNaN(currentPage) || currentPage < bounds.min_page || currentPage > bounds.max_page) {
                  setPageNum(String(bounds.min_page));
                }
              }
              const currentH = parseInt(hadithNum, 10);
              if (bounds.min_hadith !== undefined && bounds.max_hadith !== undefined) {
                if (isNaN(currentH) || currentH < bounds.min_hadith || currentH > bounds.max_hadith) {
                  setHadithNum(String(bounds.min_hadith));
                }
              }
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching book tarqeems', err);
        });
    }, 250); // 250ms debounce
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedBook.ID, partNum]); // Depend only on book ID and part number

  const handleTarqeemChange = (newTarqeem: string) => {
    setTarqeem(newTarqeem);
    const bounds = availableTarqeems[newTarqeem];
    if (bounds) {
      const currentH = parseInt(hadithNum, 10);
      if (bounds.min_hadith !== undefined && bounds.max_hadith !== undefined) {
        if (isNaN(currentH) || currentH < bounds.min_hadith || currentH > bounds.max_hadith) {
          setHadithNum(String(bounds.min_hadith));
        }
      }
      
      const currentPart = parseInt(partNum, 10);
      if (bounds.min_part !== undefined && bounds.max_part !== undefined) {
        if (isNaN(currentPart) || currentPart < bounds.min_part || currentPart > bounds.max_part) {
          setPartNum(String(bounds.min_part));
        }
      }

      const currentPage = parseInt(pageNum, 10);
      if (bounds.min_page !== undefined && bounds.max_page !== undefined) {
        if (isNaN(currentPage) || currentPage < bounds.min_page || currentPage > bounds.max_page) {
          setPageNum(String(bounds.min_page));
        }
      }
    }
  };

  const handleHadithKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hadithNum.trim() !== '') {
      onLoadHadithByNum(hadithNum, tarqeem).then((hadith) => {
        if (hadith) {
          if (hadith.PartNum !== undefined && hadith.PartNum !== null) {
            setPartNum(String(hadith.PartNum));
          }
          if (hadith.PageNum !== undefined && hadith.PageNum !== null) {
            setPageNum(String(hadith.PageNum));
          }
        }
      });
    }
  };

  const handlePageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageNum, 10);
      const part = parseInt(partNum, 10);
      if (!isNaN(page) && page > 0) {
        onLoadHadithByPage(page, isNaN(part) ? undefined : part);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none text-right">
      <div className="flex flex-row items-center gap-4 flex-wrap w-full">
        {/* 1. Tarqeem Selection */}
        <div className="flex items-center gap-2 min-w-[200px] flex-1">
          <label htmlFor="ddlTarqeemType" className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">الترقيم:</label>
          <select
            id="ddlTarqeemType"
            value={tarqeem}
            onChange={(e) => handleTarqeemChange(e.target.value)}
            className="w-full text-right py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ID">حرف (الافتراضي)</option>
            {availableTarqeems.TarqeemHarf?.available && (
              <option value="TarqeemHarf">حرف الموثق</option>
            )}
            {availableTarqeems.TarqeemMatboa1?.available && (
              <option value="TarqeemMatboa1">دار طوق النجاة</option>
            )}
            {availableTarqeems.TarqeemMatboa2?.available && (
              <option value="TarqeemMatboa2">الطبعة المصورة</option>
            )}
          </select>
        </div>

        {/* 2. Hadith Selection */}
        <div className="flex items-center gap-2 min-w-[150px] flex-1">
          <label htmlFor="txtHadithNumber" className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
            الحديث {activeBounds.min_hadith !== undefined && activeBounds.max_hadith !== undefined && `(${activeBounds.min_hadith}-${activeBounds.max_hadith})`}:
          </label>
          <input
            type="number"
            id="txtHadithNumber"
            value={hadithNum}
            onChange={(e) => setHadithNum(e.target.value)}
            onKeyDown={handleHadithKeyDown}
            className="w-full text-right py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500"
            min={activeBounds.min_hadith ?? 1}
            max={activeBounds.max_hadith}
          />
        </div>

        {/* 3. Part Selection */}
        <div className="flex items-center gap-2 min-w-[100px] flex-1">
          <label htmlFor="txtPartNum" className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
            الجزء {activeBounds.min_part !== undefined && activeBounds.max_part !== undefined && `(${activeBounds.min_part}-${activeBounds.max_part})`}:
          </label>
          <input
            type="number"
            id="txtPartNum"
            value={partNum}
            onChange={(e) => setPartNum(e.target.value)}
            onKeyDown={handlePageKeyDown}
            className="w-full text-right py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500"
            min={activeBounds.min_part ?? 1}
            max={activeBounds.max_part}
          />
        </div>

        {/* 4. Page Selection */}
        <div className="flex items-center gap-2 min-w-[100px] flex-1">
          <label htmlFor="txtPageNum" className="text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
            الصفحة {activeBounds.min_page !== undefined && activeBounds.max_page !== undefined && `(${activeBounds.min_page}-${activeBounds.max_page})`}:
          </label>
          <input
            type="number"
            id="txtPageNum"
            value={pageNum}
            onChange={(e) => setPageNum(e.target.value)}
            onKeyDown={handlePageKeyDown}
            className="w-full text-right py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500"
            min={activeBounds.min_page ?? 1}
            max={activeBounds.max_page}
          />
        </div>
      </div>
    </div>
  );
};
