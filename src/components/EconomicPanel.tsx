'use client';

import { useState } from 'react';

type TabId = 'indicators' | 'oil' | 'currency' | 'central-banks';

interface Indicator {
  name: string;
  value: string;
  change: number;
  country: string;
  lastUpdate: string;
}

const INDICATORS: Indicator[] = [
  { name: 'US GDP Growth', value: '2.8%', change: 0.3, country: '🇺🇸', lastUpdate: 'Q4 2025' },
  { name: 'EU Inflation', value: '2.3%', change: -0.1, country: '🇪🇺', lastUpdate: 'Jan 2026' },
  { name: 'China PMI', value: '51.2', change: 0.8, country: '🇨🇳', lastUpdate: 'Feb 2026' },
  { name: 'US Unemployment', value: '3.9%', change: -0.1, country: '🇺🇸', lastUpdate: 'Feb 2026' },
  { name: 'UK CPI', value: '3.1%', change: 0.2, country: '🇬🇧', lastUpdate: 'Jan 2026' },
  { name: 'JP Core CPI', value: '2.6%', change: 0.1, country: '🇯🇵', lastUpdate: 'Jan 2026' },
  { name: 'Global Trade Vol', value: '+1.4%', change: -0.3, country: '🌍', lastUpdate: 'Q4 2025' },
  { name: 'US Debt/GDP', value: '122%', change: 1.2, country: '🇺🇸', lastUpdate: 'Q4 2025' },
];

const OIL_DATA = [
  { name: 'WTI Crude', price: 72.34, change: -1.2, unit: '$/bbl' },
  { name: 'Brent Crude', price: 75.89, change: -0.9, unit: '$/bbl' },
  { name: 'Natural Gas', price: 2.67, change: 0.14, unit: '$/MMBtu' },
  { name: 'OPEC Basket', price: 74.21, change: -1.05, unit: '$/bbl' },
];

const CURRENCIES = [
  { pair: 'EUR/USD', rate: 1.0847, change: 0.0023 },
  { pair: 'USD/JPY', rate: 149.82, change: -0.34 },
  { pair: 'GBP/USD', rate: 1.2634, change: -0.0018 },
  { pair: 'USD/CNY', rate: 7.2431, change: 0.012 },
  { pair: 'USD/CHF', rate: 0.8912, change: -0.003 },
  { pair: 'AUD/USD', rate: 0.6321, change: 0.0041 },
];

const CENTRAL_BANKS = [
  { name: 'Federal Reserve', rate: '5.25-5.50%', stance: 'HOLD', next: 'Mar 2026', flag: '🇺🇸' },
  { name: 'ECB', rate: '4.50%', stance: 'CUT', next: 'Mar 2026', flag: '🇪🇺' },
  { name: 'Bank of England', rate: '5.25%', stance: 'HOLD', next: 'Mar 2026', flag: '🇬🇧' },
  { name: 'Bank of Japan', rate: '0.25%', stance: 'HIKE', next: 'Apr 2026', flag: '🇯🇵' },
  { name: "People's Bank", rate: '3.35%', stance: 'CUT', next: 'Q2 2026', flag: '🇨🇳' },
];

export default function EconomicPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('indicators');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'indicators', label: 'Indicators', icon: '📊' },
    { id: 'oil', label: 'Oil & Gas', icon: '🛢️' },
    { id: 'currency', label: 'Currency', icon: '💱' },
    { id: 'central-banks', label: 'Central Banks', icon: '🏦' },
  ];

  const changeColor = (v: number) => v > 0 ? 'text-[#00ff88]' : v < 0 ? 'text-red-400' : 'text-white/40';
  const changePrefix = (v: number) => v > 0 ? '+' : '';
  const stanceColor: Record<string, string> = {
    HOLD: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    CUT: 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10',
    HIKE: 'text-red-400 border-red-400/30 bg-red-400/10',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              activeTab === t.id
                ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30'
                : 'text-white/40 hover:text-white/60 border border-transparent'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'indicators' && (
          <div className="flex flex-col gap-1">
            {INDICATORS.map((ind, i) => (
              <div key={i} className="glass-panel p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{ind.country}</span>
                  <div className="min-w-0">
                    <div className="text-white text-xs font-mono truncate">{ind.name}</div>
                    <div className="text-white/30 text-[10px] font-mono">{ind.lastUpdate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-white font-mono text-sm">{ind.value}</span>
                  <span className={`text-[10px] font-mono ${changeColor(ind.change)}`}>
                    {changePrefix(ind.change)}{ind.change.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'oil' && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider px-1">ENERGY MARKETS</div>
            {OIL_DATA.map((oil, i) => (
              <div key={i} className="glass-panel p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-mono">{oil.name}</span>
                  <span className={`text-[10px] font-mono ${changeColor(oil.change)}`}>
                    {changePrefix(oil.change)}{oil.change.toFixed(2)} {oil.unit}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-[#00ff88] text-xl font-mono font-bold">
                    ${oil.price.toFixed(2)}
                  </span>
                  <span className="text-white/40 text-[10px] font-mono pb-0.5">{oil.unit}</span>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#00ff88]/50 rounded"
                    style={{ width: `${((oil.price - 50) / 60) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'currency' && (
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-white/30 font-mono uppercase tracking-wider px-1 mb-1">FX RATES</div>
            {CURRENCIES.map((fx, i) => (
              <div key={i} className="glass-panel p-2 flex items-center justify-between">
                <span className="text-white text-xs font-mono">{fx.pair}</span>
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono text-sm">{fx.rate.toFixed(4)}</span>
                  <span className={`text-[10px] font-mono min-w-[48px] text-right ${changeColor(fx.change)}`}>
                    {changePrefix(fx.change)}{Math.abs(fx.change).toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'central-banks' && (
          <div className="flex flex-col gap-2">
            {CENTRAL_BANKS.map((cb, i) => (
              <div key={i} className="glass-panel p-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cb.flag}</span>
                  <div>
                    <div className="text-white text-xs font-mono">{cb.name}</div>
                    <div className="text-[#00ff88] text-sm font-mono font-bold mt-0.5">{cb.rate}</div>
                    <div className="text-white/30 text-[10px] font-mono">Next: {cb.next}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${stanceColor[cb.stance]}`}>
                  {cb.stance}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
