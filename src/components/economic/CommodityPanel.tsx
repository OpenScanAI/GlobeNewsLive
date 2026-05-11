'use client';

import { CommodityDependency } from '@/data/economicExtended';

interface CommodityPanelProps {
  data: CommodityDependency;
}

export default function CommodityPanel({ data }: CommodityPanelProps) {
  const { oil, gas, food, critical } = data;

  const barColor = (val: number | null) => {
    if (val === null) return 'bg-white/5';
    if (val >= 30) return 'bg-rose-500/40';
    if (val >= 15) return 'bg-amber-500/40';
    return 'bg-emerald-500/40';
  };

  const commodities = [
    { key: 'oil', label: 'Oil & Petroleum', value: oil, icon: '🛢️' },
    { key: 'gas', label: 'Natural Gas', value: gas, icon: '🔥' },
    { key: 'food', label: 'Food & Agriculture', value: food, icon: '🌾' },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛢️</span>
          <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Commodity Dependency</span>
        </div>
        {critical && (
          <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-1 rounded-md border border-rose-500/15 font-medium">
            ⚠ Critical
          </span>
        )}
      </div>

      <div className="space-y-3.5">
        {commodities.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{c.icon}</span>
                <span className="text-sm text-white/50 font-medium">{c.label}</span>
              </div>
              <span className="text-sm text-white/70 font-medium">
                {c.value !== null ? `${c.value}% of imports` : '—'}
              </span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor(c.value)}`}
                style={{ width: `${Math.min(c.value || 0, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        <div className="text-xs text-white/25 leading-relaxed">
          {critical
            ? '⚠️ High commodity import dependency creates vulnerability to price shocks and supply disruptions.'
            : '✓ Moderate dependency levels indicate relative resilience to commodity price volatility.'}
        </div>
      </div>
    </div>
  );
}
