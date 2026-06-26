import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { Book } from '../../types';

interface StatsRwah {
  total: number;
  sahaba: number;
  thiqa: number;
  doafa: number;
}

interface BookStat {
  BookName: string;
  Count: number;
}

export const StatisticsHub: React.FC = () => {
  const [loadingRwah, setLoadingRwah] = useState(false);
  const [loadingAtraf, setLoadingAtraf] = useState(false);
  const [loadingOverlap, setLoadingOverlap] = useState(false);

  // Stats Rwah state
  const [statsRwah, setStatsRwah] = useState<StatsRwah | null>(null);

  // Stats Atraf state
  const [statsAtraf, setStatsAtraf] = useState<BookStat[]>([]);

  // Overlap state
  const [books, setBooks] = useState<Book[]>([]);
  const [book1, setBook1] = useState<number | string>('');
  const [book2, setBook2] = useState<number | string>('');
  const [overlapCount, setOverlapCount] = useState<number | null>(null);

  // Mosannafat agreement stats state
  const [mBook1, setMBook1] = useState<number>(1);
  const [mBook2, setMBook2] = useState<number>(2);
  const [mStats, setMStats] = useState<{
    book1: { id: number; title: string; total: number; additions: number };
    book2: { id: number; title: string; total: number; additions: number };
    agreed: number;
  } | null>(null);
  const [loadingMStats, setLoadingMStats] = useState(false);

  useEffect(() => {
    loadStatsRwah();
    loadStatsAtraf();
    loadBooks();
  }, []);

  const loadStatsRwah = async () => {
    setLoadingRwah(true);
    try {
      const res = await api.getStatsRwah();
      if (res.success) {
        setStatsRwah(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRwah(false);
    }
  };

  const loadStatsAtraf = async () => {
    setLoadingAtraf(true);
    try {
      const res = await api.getStatsAtraf();
      if (res.success && res.stats) {
        setStatsAtraf(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAtraf(false);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await api.getBooks();
      if (res.success) {
        setBooks(res.books.filter(b => b.ID <= 33)); // Focus on primary Hadith books
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateOverlap = async () => {
    if (!book1 || !book2) return;
    setLoadingOverlap(true);
    try {
      const res = await api.getStatsRwahBooks(Number(book1), Number(book2));
      if (res.success) {
        setOverlapCount(res.overlap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOverlap(false);
    }
  };

  const loadMosannafatStats = async (b1: number, b2: number) => {
    setLoadingMStats(true);
    try {
      const res = await api.getMosannafatStats(b1, b2);
      setMStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMStats(false);
    }
  };

  useEffect(() => {
    if (mBook1 && mBook2) {
      loadMosannafatStats(mBook1, mBook2);
    }
  }, [mBook1, mBook2]);

  // Find selected book names for overlap details
  const b1Name = books.find(b => b.ID === Number(book1))?.Title || '';
  const b2Name = books.find(b => b.ID === Number(book2))?.Title || '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-800/40 p-8 mb-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-black text-emerald-300 leading-tight">
            لوحة الإحصائيات والمؤشرات البيانية لمنصة قبس
          </h1>
          <p className="mt-3 text-base text-slate-350 leading-relaxed">
            استعرض التوزيع الرقمي والبياني لمرويات منصة قبس وأعداد الأطراف، مع أداة تحليل تقاطع الرواة المشتركين بين المصنفات والمدارس الحديثية المختلفة.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {loadingRwah ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-900/40 rounded-xl border border-slate-800 p-5 h-28"></div>
          ))
        ) : statsRwah ? (
          <>
            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-800/40 transition-all shadow-md">
              <span className="text-xs text-slate-450 block font-bold">إجمالي رواة منصة قبس</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-400">{statsRwah.total.toLocaleString()}</span>
                <span className="text-xs text-slate-500">راوٍ وراوية</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-800/40 transition-all shadow-md">
              <span className="text-xs text-slate-450 block font-bold">طبقة الصحابة الكرام</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-400">{statsRwah.sahaba.toLocaleString()}</span>
                <span className="text-xs text-slate-500">صحابي ومسند</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-800/40 transition-all shadow-md">
              <span className="text-xs text-slate-450 block font-bold">الرواة الموثقون (الثقات)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-350">{statsRwah.thiqa.toLocaleString()}</span>
                <span className="text-xs text-slate-500">راوٍ ثقة</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-800/40 transition-all shadow-md">
              <span className="text-xs text-slate-450 block font-bold">الرواة المتكلم فيهم (الضعفاء)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-rose-500">{statsRwah.doafa.toLocaleString()}</span>
                <span className="text-xs text-slate-500">راوٍ ضعيف</span>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 rounded-xl border border-slate-800 py-8 text-center text-slate-500">
            فشل تحميل إحصائيات الرواة
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atraf counts chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-6 pb-2 border-b border-slate-850 flex items-center gap-2">
            <span>📊</span> توزيع الأطراف ومرويات الكتب
          </h3>
          {loadingAtraf ? (
            <div className="flex py-12 justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : statsAtraf.length > 0 ? (
            <div className="space-y-4">
              {statsAtraf.map((item, i) => {
                const maxVal = statsAtraf[0]?.Count || 1;
                const pct = (item.Count / maxVal) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{item.BookName}</span>
                      <span className="text-emerald-450">{item.Count.toLocaleString()} طرفاً</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">لا توجد إحصائيات أطراف متاحة.</div>
          )}
        </div>

        {/* Overlap analyzer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-6 pb-2 border-b border-slate-850 flex items-center gap-2">
            <span>🔬</span> محلل تقاطعات الرواة المشتركين
          </h3>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-2">الكتاب الأول</label>
                <select
                  value={book1}
                  onChange={(e) => { setBook1(e.target.value); setOverlapCount(null); }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="">اختر الكتاب الأول...</option>
                  {books.map((b) => (
                    <option key={b.ID} value={b.ID} disabled={b.ID === Number(book2)}>{b.Title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-2">الكتاب الثاني</label>
                <select
                  value={book2}
                  onChange={(e) => { setBook2(e.target.value); setOverlapCount(null); }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden"
                >
                  <option value="">اختر الكتاب الثاني...</option>
                  {books.map((b) => (
                    <option key={b.ID} value={b.ID} disabled={b.ID === Number(book1)}>{b.Title}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateOverlap}
              disabled={loadingOverlap || !book1 || !book2}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all"
            >
              {loadingOverlap ? 'جاري التحليل والمطابقة...' : 'احسب عدد الرواة المشتركين'}
            </button>

            {overlapCount !== null && (
              <div className="rounded-xl bg-slate-950/60 border border-slate-850 p-5 space-y-4 text-center">
                <span className="text-xs text-slate-400 block font-semibold">عدد الرواة المشتركين بين الكتابين:</span>
                <div className="text-4xl font-black text-amber-400">
                  {overlapCount.toLocaleString()}
                </div>
                <p className="text-xs text-slate-450 leading-relaxed max-w-sm mx-auto">
                  يروي مصنفو كتاب «{b1Name}» وكتاب «{b2Name}» عن {overlapCount.toLocaleString()} راوٍ مشترك في طبقات أسانيدهم.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mosannafat Agreement Widget */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-6 pb-2 border-b border-slate-850 flex items-center gap-2">
          <span>📈</span> محلل الزوائد والاتفاق بين المصنفات الحديثية
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">الكتاب الأول</label>
              <select
                value={mBook1}
                onChange={(e) => setMBook1(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {books.filter(b => b.ID <= 6).map((b) => (
                  <option key={b.ID} value={b.ID} disabled={b.ID === mBook2}>{b.Title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">الكتاب الثاني</label>
              <select
                value={mBook2}
                onChange={(e) => setMBook2(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {books.filter(b => b.ID <= 6).map((b) => (
                  <option key={b.ID} value={b.ID} disabled={b.ID === mBook1}>{b.Title}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingMStats ? (
            <div className="flex py-12 justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : mStats ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Book 1 Bar */}
                <div className="flex-grow w-full space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{mStats.book1.title} ({mStats.book1.total.toLocaleString()})</span>
                    <span className="text-amber-500">الزوائد: {mStats.book1.additions.toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-950 rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-amber-500/80 transition-all duration-500"
                      style={{ width: `${(mStats.book1.additions / mStats.book1.total) * 100}%` }}
                      title={`الزوائد: ${mStats.book1.additions}`}
                    ></div>
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(mStats.agreed / mStats.book1.total) * 100}%` }}
                      title={`الاتفاق: ${mStats.agreed}`}
                    ></div>
                  </div>
                </div>

                {/* Agreed Divider */}
                <div className="flex flex-col items-center justify-center bg-emerald-950/20 border border-emerald-900/40 px-5 py-3 rounded-xl shrink-0">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase">الاتفاق والمشترك</span>
                  <span className="text-lg font-black text-emerald-400">{mStats.agreed.toLocaleString()}</span>
                </div>

                {/* Book 2 Bar */}
                <div className="flex-grow w-full space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{mStats.book2.title} ({mStats.book2.total.toLocaleString()})</span>
                    <span className="text-amber-500">الزوائد: {mStats.book2.additions.toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-950 rounded-lg overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(mStats.agreed / mStats.book2.total) * 100}%` }}
                      title={`الاتفاق: ${mStats.agreed}`}
                    ></div>
                    <div
                      className="h-full bg-amber-500/80 transition-all duration-500"
                      style={{ width: `${(mStats.book2.additions / mStats.book2.total) * 100}%` }}
                      title={`الزوائد: ${mStats.book2.additions}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="flex gap-4 justify-center text-xs pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                  المتن المشترك (المتفق عليه)
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 bg-amber-500/80 rounded"></span>
                  الزوائد والانفراءات الخاصة
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">فشل تحميل إحصائيات المقارنة للمصنفات.</div>
          )}
        </div>
      </div>
    </div>
  );
};
