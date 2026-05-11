'use client';

import useSWR from 'swr';
import { PanelHeader } from './PanelHeader';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MacroStress() {
  const { data: vixData } = useSWR('/api/finance', fetcher, { refreshInterval: 30000 });
  const vix = vixData?.vix;
  const yields = vixData?.treasuryYields ?? [];

  // Derive stress score from VIX if available, else algorithmic fallback
  const vixVal = vix?.price ?? 18.5;
  let score = Math.min(100, Math.max(0, (vixVal / 40) * 100));
  if (!vix) score = 35; // fallback steady state

  let label = 'Steady';
  let sub = 'Macro conditions are stable';
  let color = 'text-emerald-400';
  let needleColor = '#34d399';

  if (score > 70) {
    label = 'Critical';
    sub = 'Elevated systemic risk detected';
    color = 'text-red-400';
    needleColor = '#f87171';
  } else if (score > 45) {
    label = 'Elevated';
    sub = 'Macro pressure building';
    color = 'text-amber-400';
    needleColor = '#fbbf24';
  }

  const angle = -90 + (score / 100) * 180;
  const cx = 50;
  const cy = 50;
  const r = 35;
  const nx = cx + r * Math.cos((angle * Math.PI) / 180);
  const ny = cy + r * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="border border-white/[0.08] bg-[#0f0f14]">
      <PanelHeader title="MACRO STRESS" accentColor="amber" />
      <div className="p-3 flex flex-col items-center">
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 15 50 A 35 35 0 0 1 37 21" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
          <path d="M 37 21 A 35 35 0 0 1 63 21" fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
          <path d="M 63 21 A 35 35 0 0 1 85 50" fill="none" stroke="#f87171" strokeWidth="6" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={needleColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="3" fill={needleColor} />
        </svg>
        <div className="text-center mt-1">
          <span className={`text-lg font-mono font-bold ${color}`}>{Math.round(score)}</span>
          <span className={`block text-[10px] font-mono ${color}`}>{label} — {sub}</span>
        </div>
        {/* Treasury Yields row */}
        {yields.length > 0 && (
          <div className="flex gap-2 mt-2">
            {yields.map((y: { display: string; price: number | null; change: number | null }) => (
              <div key={y.display} className="text-center">
                <div className="text-[9px] font-mono text-white/40">{y.display}</div>
                <div className={`text-[11px] font-mono ${(y.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {y.price?.toFixed(2) ?? '--'}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
