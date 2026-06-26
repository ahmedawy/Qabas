import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';

interface NarratorNode {
  ID: number;
  Name: string;
  AbbName: string;
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
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-900/40 border border-slate-800 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="text-xs text-slate-400">جاري رسم شجرة الإسناد...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/20 border border-red-900/40 p-5 text-center text-sm text-red-400">
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
  const nodeHeight = 70;
  const nodeGap = 50; // vertical gap between nodes
  const totalHeight = narrators.length * (nodeHeight + nodeGap) - nodeGap + 60;
  const svgWidth = 500;
  const centerX = svgWidth / 2;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl backdrop-blur-xs flex flex-col items-center">
      {/* Title info */}
      <div className="w-full border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h4 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>شجرة اتصال السند التفاعلية</span>
        </h4>
        <span className="rounded-full bg-slate-800 border border-slate-700/60 px-3 py-1 text-xs text-emerald-400 font-semibold">
          معرّف الإسناد: #{sanadId} • {narrators.length} رواة
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

            // Choose color scheme
            let gradient = 'url(#emeraldGradient)';
            let glow = 'glow-emerald';
            if (isAuthor) {
              gradient = 'url(#amberGradient)';
              glow = 'glow-amber';
            } else if (isUnknown) {
              gradient = 'url(#grayGradient)';
              glow = 'none';
            }

            return (
              <g
                key={n.ID}
                transform={`translate(0, 0)`}
                className="cursor-pointer group"
                onClick={() => onSelectNarrator(n.ID)}
              >
                {/* Outer interactive capsule node */}
                <rect
                  x={centerX - 170}
                  y={y}
                  width={340}
                  height={nodeHeight}
                  rx="14"
                  fill="#0f172a"
                  stroke={isUnknown ? '#334155' : (isAuthor ? '#b45309' : '#047857')}
                  strokeWidth="1.5"
                  className="group-hover:stroke-emerald-400 group-hover:fill-slate-900 transition-all duration-300 shadow-md"
                />

                {/* Left indicators */}
                <circle
                  cx={centerX - 135}
                  cy={y + nodeHeight / 2}
                  r="18"
                  fill={gradient}
                  filter={glow !== 'none' ? `url(#${glow})` : undefined}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Node order number */}
                <text
                  x={centerX - 135}
                  y={y + nodeHeight / 2 + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10.5"
                  fontWeight="bold"
                >
                  {index + 1}
                </text>

                {/* Narrator Name Text */}
                <text
                  x={centerX - 100}
                  y={y + 30}
                  textAnchor="start"
                  fill={isUnknown ? '#64748b' : '#f1f5f9'}
                  fontSize="13"
                  fontWeight="800"
                  className="group-hover:fill-emerald-400 transition-colors"
                >
                  {n.Name.length > 34 ? `${n.Name.substring(0, 32)}...` : n.Name}
                </text>

                {/* Subtext info */}
                <text
                  x={centerX - 100}
                  y={y + 50}
                  textAnchor="start"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {isUnknown 
                    ? 'رابط مفقود في السلسلة' 
                    : `${n.Tabaqa || 'الطبقة غير محددة'} ${n.DeathYear ? `• ت: ${n.DeathYear}` : ''}`}
                </text>

                {/* Assessment Badge right aligned */}
                {!isUnknown && n.MartabaIbnHajar && (
                  <g transform={`translate(${centerX + 80}, ${y + 25})`}>
                    <rect
                      x="0"
                      y="0"
                      width="75"
                      height="20"
                      rx="6"
                      fill={n.MartabaIbnHajar.includes('ثقة') ? '#022c22' : '#1c1917'}
                      stroke={n.MartabaIbnHajar.includes('ثقة') ? '#064e3b' : '#44403c'}
                      strokeWidth="1"
                    />
                    <text
                      x="37"
                      y="13"
                      textAnchor="middle"
                      fill={n.MartabaIbnHajar.includes('ثقة') ? '#34d399' : '#a8a29e'}
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {n.MartabaIbnHajar.split(' ').slice(0, 2).join(' ')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex gap-6 text-xs text-slate-500 font-semibold justify-center">
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-emerald-600 border border-emerald-500"></span>
          <span>رواة الطبقات والتابعين</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-amber-600 border border-amber-550"></span>
          <span>المصنّف / صاحب الكتاب</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded bg-slate-600 border border-slate-500"></span>
          <span>راوٍ غير معرّف</span>
        </div>
      </div>
    </div>
  );
};
