'use client';

import { ForexDetail } from '@/data/economicExtended';

interface ForexPanelProps {
  data: ForexDetail;
}

export default function ForexPanel({ data }: ForexPanelProps) {
  const { rate, vsUSD, change24h, change1w, change1m, currencyCode, currencyName } = data;

  const changeColor = (val: number | null) => {
    if (val === null) return 'text-white/30';
    return val >= 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  const changeSign = (val: number | null) => {
    if (val === null) return '';
    return val >= 0 ? '+' : '';
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">💱</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Forex & Reserves</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          <span className="text-sm font-bold text-white/60">{currencyCode}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white/80">{currencyName}</div>
          <div className="text-xs text-white/40">1 USD = {rate?.toFixed(2) || '—'} {currencyCode}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/5 p-2.5 text-center">
          <div className="text-xs text-white/30 mb-1">24H</div>
          <div className={`text-sm font-bold ${changeColor(change24h)}`}>
            {change24h !== null ? `${changeSign(change24h)}${change24h.toFixed(2)}%` : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-2.5 text-center">
          <div className="text-xs text-white/30 mb-1">1W</div>
          <div className={`text-sm font-bold ${changeColor(change1w)}`}>
            {change1w !== null ? `${changeSign(change1w)}${change1w.toFixed(2)}%` : '—'}
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-2.5 text-center">
          <div className="text-xs text-white/30 mb-1">1M</div>
          <div className={`text-sm font-bold ${changeColor(change1m)}`}>
            {change1m !== null ? `${changeSign(change1m)}${change1m.toFixed(2)}%` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
