import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

interface NarratorNode {
  ID: number;
  Name: string;
  AbbName: string;
  EsmShuhra: string;
  Kunia: string;
  Laqab: string;
  Nasab: string;
  Tabaqa: string;
  DeathYear: string;
  MartabaIbnHajar: string;
}

interface TransmissionChainSvgProps {
  sanadId: number | null;
  onSelectNarrator: (id: number) => void;
}

export const TransmissionChainSvg: React.FC<TransmissionChainSvgProps> = ({
  sanadId,
  onSelectNarrator,
}) => {
  const [narrators, setNarrators] = useState<NarratorNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sanadId === null) {
      setNarrators([]);
      return;
    }

    let active = true;
    const fetchChain = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getTransmissionChain(sanadId);
        if (active) {
          // The narrators array is ordered. We reverse it if we want to show from Sahabi (usually top/first) down to Author.
          // Let's keep the order returned by the API, or offer clean vertical tree layout.
          setNarrators(res.narrators);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'فشل في تحميل سلسلة السند');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchChain();
    return () => {
      active = false;
    };
  }, [sanadId]);

  if (sanadId === null) return null;

  if (loading) {
    return (
      <div className="transmission-chain-svg-card-2">
        <div className="transmission-chain-svg-stack-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="text-xs text-slate-400">جاري رسم شجرة الإسناد...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transmission-chain-svg-text-4">
        <p>فشل رسم شجرة الإسناد: {error}</p>
      </div>
    );
  }

  if (narrators.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 py-12 text-center text-slate-500 text-sm">
        لا توجد معطيات كافية لرسم شجرة الإسناد
      </div>
    );
  }

  // Layout parameters
  const nodeHeight = 75;
  const nodeGap = 45; // vertical gap between nodes
  const totalHeight = narrators.length * (nodeHeight + nodeGap) - nodeGap + 60;
  const svgWidth = 600;
  const centerX = svgWidth / 2;

  return (
    <div className="transmission-chain-svg-stack-5">
      {/* Title info */}
      <div className="w-full border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h4 className="transmission-chain-svg-title-7">
          <span className="transmission-chain-svg-badge-8"></span>
          <span>شجرة اتصال السند التفاعلية</span>
        </h4>
        <span className="transmission-chain-svg-text-9">
          {narrators.length} رواة
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center py-2">
        <svg 
          width={svgWidth} 
          height={totalHeight} 
          className="max-w-full select-none"
        >
          <defs>
            {/* Glow filters and markers for line arrows */}
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="grayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="33"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" />
            </marker>
          </defs>

          {/* Render Narrator Connections (Lines) */}
          {narrators.slice(0, -1).map((_, index) => {
            const startY = 30 + index * (nodeHeight + nodeGap) + nodeHeight;
            const endY = 30 + (index + 1) * (nodeHeight + nodeGap);
            return (
              <g key={`conn-${index}`}>
                <line
                  x1={centerX}
                  y1={startY}
                  x2={centerX}
                  y2={endY}
                  stroke="#1e293b"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1={centerX}
                  y1={startY}
                  x2={centerX}
                  y2={endY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  className="animate-[dash_2s_linear_infinite]"
                  style={{
                    strokeDashoffset: 10,
                  }}
                />
              </g>
            );
          })}

          {/* Render Narrator Nodes */}
          {narrators.map((n, index) => {
            const y = 30 + index * (nodeHeight + nodeGap);
            const isAuthor = index === narrators.length - 1;
            const isUnknown = n.Name.includes('غير معرف');



            return (
              <g
                key={n.ID}
                className="cursor-pointer group"
                onClick={() => onSelectNarrator(n.ID)}
              >
                <foreignObject
                  x={centerX - 230}
                  y={y}
                  width={460}
                  height={nodeHeight}
                >
                  <div className="w-full h-full flex flex-row items-center gap-3.5 bg-slate-900/95 border border-slate-800 rounded-2xl px-4 py-2.5 hover:bg-slate-850 hover:border-emerald-500/80 transition-all duration-300 shadow-md hover:shadow-emerald-500/5 select-none dir-rtl text-right">
                    {/* Circle Indicator on the Right */}
                    <div 
                      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                        isAuthor 
                          ? 'bg-gradient-to-b from-amber-500 to-amber-700 shadow-amber-500/10' 
                          : isUnknown 
                            ? 'bg-gradient-to-b from-slate-500 to-slate-700 shadow-slate-500/10' 
                            : 'bg-gradient-to-b from-emerald-500 to-emerald-700 shadow-emerald-500/10'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Text content in the middle (wraps naturally) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center" title={n.Name}>
                      <div 
                        className={`text-xs font-extrabold leading-snug group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2 ${
                          isUnknown ? 'text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {n.EsmShuhra || n.AbbName || n.Name}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 mt-1">
                        {isUnknown 
                          ? 'رابط مفقود في السلسلة' 
                          : `${n.Tabaqa || 'الطبقة غير محددة'} ${n.DeathYear ? `• ت: ${n.DeathYear}` : ''}`}
                      </div>
                    </div>

                    {/* Assessment Badge on the Left */}
                    {!isUnknown && n.MartabaIbnHajar && (
                      <div 
                        className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                          n.MartabaIbnHajar.includes('ثقة') 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/60 group-hover:bg-emerald-950/50' 
                            : 'bg-slate-950/40 text-slate-400 border-slate-800/80 group-hover:bg-slate-950/60'
                        }`}
                      >
                        {n.MartabaIbnHajar.split(' ').slice(0, 2).join(' ')}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex gap-6 text-xs text-slate-500 font-semibold justify-center">
        <div className="transmission-chain-svg-element-1">
          <span className="transmission-chain-svg-element-14"></span>
          <span>رواة الطبقات والتابعين</span>
        </div>
        <div className="transmission-chain-svg-element-1">
          <span className="transmission-chain-svg-element-15"></span>
          <span>المصنّف / صاحب الكتاب</span>
        </div>
        <div className="transmission-chain-svg-element-1">
          <span className="transmission-chain-svg-element-16"></span>
          <span>راوٍ غير معرّف</span>
        </div>
      </div>
    </div>
  );
};
