import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../api/client';
import type { MatnComparisonResponse } from '../../types';

interface MatnComparisonModalProps {
  hadithId: number;
  onClose: () => void;
}

export const MatnComparisonModal: React.FC<MatnComparisonModalProps> = ({
  hadithId,
  onClose,
}) => {
  const [data, setData] = useState<MatnComparisonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlaveId, setSelectedSlaveId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'authenticity' | 'closeness' | 'longest'>('authenticity');

  useEffect(() => {
    // Listen for ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    let active = true;
    setLoading(true);
    setError(null);

    api.getMatnComparison(hadithId)
      .then((res) => {
        if (active) {
          setData(res);
          if (res.slaves && res.slaves.length > 0) {
            // Sort initial list to set the first selected slave
            const initialSorted = [...res.slaves].sort((a, b) => a.tarteeb - b.tarteeb);
            setSelectedSlaveId(initialSorted[0].main_id);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'حدث خطأ أثناء تحميل مقارنة المتون');
          setLoading(false);
        }
      });

    return () => {
      active = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hadithId, onClose]);

  // Memoized sorted slaves list
  const sortedSlaves = useMemo(() => {
    if (!data || !data.slaves) return [];
    return [...data.slaves].sort((a, b) => {
      if (sortBy === 'authenticity') {
        return a.tarteeb - b.tarteeb;
      }
      if (sortBy === 'closeness') {
        return a.match_sort - b.match_sort;
      }
      if (sortBy === 'longest') {
        return b.content_length - a.content_length;
      }
      return 0;
    });
  }, [data, sortBy]);

  const selectedSlave = useMemo(() => {
    if (!data || !data.slaves) return null;
    return data.slaves.find((s) => s.main_id === selectedSlaveId) || null;
  }, [data, selectedSlaveId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400 font-sans text-sm font-medium">جاري تحميل مقارنة المتون...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">حدث خطأ</h3>
          <p className="text-slate-600 dark:text-slate-400 font-sans text-sm">{error || 'لم يتم العثور على بيانات المقارنة'}</p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col dir-rtl overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">مقارنة المتون</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              مقارنة الحديث الحالي مع أحاديث تخريجه وتحديد أوجه التطابق والاختلاف
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
          title="إغلاق (Esc)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden bg-slate-100/40 dark:bg-slate-900/20">
        
        {/* Right Pane: Master Hadith */}
        <section className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 ml-2">
              الحديث الرئيسي
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
              {data.master.book_name} - رقم {data.master.hadith_num}
            </span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto leading-loose text-lg font-medium text-slate-800 dark:text-slate-200 select-text whitespace-pre-wrap font-serif">
            {data.master.clean_content}
          </div>
        </section>

        {/* Left Pane: Selected Slave Hadith */}
        <section className="flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 ml-2">
              حديث التخريج المقارن
            </span>
            {selectedSlave ? (
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans">
                {selectedSlave.book_name} - رقم {selectedSlave.hadith_num}
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 font-sans">
                لم يتم اختيار حديث بعد
              </span>
            )}
          </div>
          <div className="flex-1 p-6 overflow-y-auto leading-loose text-lg font-medium text-slate-800 dark:text-slate-200 select-text whitespace-pre-wrap font-serif">
            {selectedSlave ? selectedSlave.clean_content : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm font-sans">الرجاء اختيار حديث من القائمة بالأسفل للمقارنة</p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Bottom Panes */}
      <footer className="border-t border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 p-4 shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Bottom Left: Comparison Summary */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col h-48 justify-between">
          <div className="shrink-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              وصف (التطابق/الاختلاف) بين المتون :
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto mt-2 leading-relaxed text-sm text-slate-700 dark:text-slate-300 font-sans select-text">
            {selectedSlave?.comparison_comment ? (
              <p className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-3 rounded-lg">
                {selectedSlave.comparison_comment}
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 italic p-3 text-center">لا توجد ملاحظات مقارنة مسجلة لهذا المتن.</p>
            )}
          </div>
        </section>

        {/* Bottom Right: Slaves List & Sorting */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4 flex flex-col h-48">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">أحاديث التخريج ({sortedSlaves.length})</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="matn-sort" className="text-xs text-slate-500 dark:text-slate-400 font-sans">ترتيب حسب:</label>
              <select
                id="matn-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="authenticity">أصحية الكتب</option>
                <option value="closeness">المطابقة</option>
                <option value="longest">المطولة</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto mt-2 min-h-0">
            <div className="overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 font-sans border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-1.5 font-semibold w-8 pr-1">م</th>
                    <th className="pb-1.5 font-semibold">الكتاب</th>
                    <th className="pb-1.5 font-semibold">رقم الحديث</th>
                    <th className="pb-1.5 font-semibold text-left">المطابقة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {sortedSlaves.map((slave, index) => (
                    <tr
                      key={slave.main_id}
                      onClick={() => setSelectedSlaveId(slave.main_id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all ${
                        selectedSlaveId === slave.main_id ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-700 dark:text-slate-350'
                      }`}
                    >
                      <td className="py-2.5 text-slate-400 font-mono text-[10px] pr-1">{index + 1}</td>
                      <td className="py-2.5">{slave.book_name}</td>
                      <td className="py-2.5">{slave.hadith_num}</td>
                      <td className="py-2.5 text-left pl-1">
                        {slave.match_sort === 9999 ? '-' : `${slave.match_sort}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </footer>
    </div>
  );
};
