'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MarketIndex {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  value: number;
  change: number;
  changePercent: number;
  currency: string;
  color: string;
}

interface OilPrice {
  name: string;
  icon: string;
  price: number;
  change: number;
  changePercent: number;
  color: string;
}

interface GCCCurrency {
  code: string;
  name: string;
  flag: string;
  usdRate: number; // how many USD per 1 local currency
  change: number;
  fixed: boolean; // pegged to USD?
}

// Static GCC data (would be fetched in production)
const GCC_INDICES: MarketIndex[] = [
  { id: 'tadawul', name: 'Saudi Stock Exchange', shortName: 'Tadawul', country: 'Saudi Arabia', flag: '🇸🇦', value: 11840.5, change: +125.3, changePercent: +1.07, currency: 'SAR', color: '#00d4aa' },
  { id: 'dfm', name: 'Dubai Financial Market', shortName: 'DFM', country: 'UAE (Dubai)', flag: '🇦🇪', value: 4420.8, change: -22.1, changePercent: -0.50, currency: 'AED', color: '#00aaff' },
  { id: 'adx', name: 'Abu Dhabi Securities', shortName: 'ADX', country: 'UAE (Abu Dhabi)', flag: '🇦🇪', value: 9620.3, change: +88.7, changePercent: +0.93, currency: 'AED', color: '#4488ff' },
  { id: 'qse', name: 'Qatar Stock Exchange', shortName: 'QSE', country: 'Qatar', flag: '🇶🇦', value: 9875.2, change: -45.6, changePercent: -0.46, currency: 'QAR', color: '#aa44ff' },
  { id: 'bse', name: 'Bahrain Bourse', shortName: 'BSE', country: 'Bahrain', flag: '🇧🇭', value: 1880.4, change: +12.3, changePercent: +0.66, currency: 'BHD', color: '#ff4488' },
  { id: 'msm', name: 'Muscat Securities Market', shortName: 'MSM', country: 'Oman', flag: '🇴🇲', value: 4510.7, change: +34.2, changePercent: +0.76, currency: 'OMR', color: '#ffaa00' },
  { id: 'kwse', name: 'Boursa Kuwait', shortName: 'KWSE', country: 'Kuwait', flag: '🇰🇼', value: 7220.1, change: -15.8, changePercent: -0.22, currency: 'KWD', color: '#ff6622' },
];

const OIL_PRICES: OilPrice[] = [
  { name: 'WTI Crude', icon: '🛢️', price: 78.45, change: +1.23, changePercent: +1.59, color: '#ff8800' },
  { name: 'Brent Crude', icon: '⚫', price: 82.30, change: +1.10, changePercent: +1.36, color: '#ffcc00' },
  { name: 'Arab Light', icon: '🟡', price: 83.15, change: +0.95, changePercent: +1.15, color: '#ffaa44' },
  { name: 'Natural Gas', icon: '🔵', price: 2.84, change: -0.08, changePercent: -2.74, color: '#44aaff' },
];

const GCC_CURRENCIES: GCCCurrency[] = [
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', usdRate: 0.2667, change: 0.00, fixed: true },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', usdRate: 0.2723, change: 0.00, fixed: true },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', usdRate: 0.2747, change: 0.00, fixed: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', usdRate: 3.2485, change: +0.0012, fixed: false },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', usdRate: 2.6520, change: 0.00, fixed: true },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', usdRate: 2.5974, change: 0.00, fixed: true },
];

export default function GulfEconomiesPanel() {
  const [tab, setTab] = useState<'indices' | 'oil' | 'currencies'>('indices');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live updates with small random fluctuations
  const [indices, setIndices] = useState<MarketIndex[]>(GCC_INDICES);
  const [oils, setOils] = useState<OilPrice[]>(OIL_PRICES);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => {
        const delta = (Math.random() - 0.5) * idx.value * 0.001;
        const newValue = idx.value + delta;
        return {
          ...idx,
          value: parseFloat(newValue.toFixed(1)),
          change: parseFloat((idx.change + delta).toFixed(1)),
          changePercent: parseFloat(((idx.change + delta) / idx.value * 100).toFixed(2)),
        };
      }));
      setOils(prev => prev.map(oil => {
        const delta = (Math.random() - 0.48) * 0.05;
        return { ...oil, price: parseFloat((oil.price + delta).toFixed(2)), change: parseFloat((oil.change + delta).toFixed(2)) };
      }));
      setLastUpdate(new Date());
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const positiveIndices = indices.filter(i => i.changePercent >= 0).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🏦</span>
          <span className="text-[11px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">Gulf Economies</span>
          <span className="px-1 py-0.5 text-[8px] font-mono bg-[#ffaa00]/10 text-[#ffaa00] rounded">
            {positiveIndices}/{indices.length} ↑
          </span>
        </div>
        <span className="text-[8px] font-mono text-white/20">
          {lastUpdate.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        {(['indices', 'oil', 'currencies'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[9px] font-mono uppercase transition-all ${
              tab === t
                ? 'text-[#00ff88] border-b border-[#00ff88]'
                : 'text-white/30 hover:text-white/60'
            }`}>
            {t === 'indices' ? '📊 Markets' : t === 'oil' ? '🛢️ Oil' : '💱 FX'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'indices' && indices.map(idx => (
          <div key={idx.id} className="px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-all">
            <div className="flex items-center gap-2">
              <span className="text-sm flex-shrink-0">{idx.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold" style={{ color: idx.color }}>{idx.shortName}</span>
                  <span className="text-[11px] font-mono font-bold text-white">{idx.value.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] text-white/35 font-mono">{idx.country}</span>
                  <span className={`text-[10px] font-mono font-semibold ${idx.changePercent >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                    {idx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tab === 'oil' && (
          <div>
            {/* Oil price trend bar */}
            <div className="px-3 py-2 bg-[#ff8800]/5 border-b border-[#ff8800]/20">
              <div className="text-[9px] font-mono text-[#ff8800]/70 mb-2 uppercase tracking-wider">Energy Markets</div>
              {oils.map(oil => (
                <div key={oil.name} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{oil.icon}</span>
                    <span className="text-[11px] font-mono text-white/80">{oil.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-mono font-bold" style={{ color: oil.color }}>
                      ${oil.price.toFixed(2)}
                    </div>
                    <div className={`text-[9px] font-mono ${oil.changePercent >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                      {oil.changePercent >= 0 ? '+' : ''}{oil.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* OPEC context */}
            <div className="px-3 py-2 bg-[#0f0f1a]">
              <div className="text-[9px] font-mono text-white/40 mb-1 uppercase">OPEC+ Context</div>
              <div className="text-[10px] font-mono text-white/60 leading-relaxed">
                Saudi Arabia production cut: <span className="text-[#ffaa00]">-1M bpd</span><br/>
                OPEC+ total cut: <span className="text-[#ff8800]">-3.66M bpd</span><br/>
                UAE quota: <span className="text-[#00aaff]">3.22M bpd</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'currencies' && (
          <div>
            {GCC_CURRENCIES.map(cur => (
              <div key={cur.code} className="px-3 py-2 border-b border-white/5 hover:bg-white/3">
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{cur.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-white">{cur.code}</span>
                        {cur.fixed && (
                          <span className="ml-1.5 text-[8px] font-mono px-1 rounded bg-[#00ff88]/10 text-[#00ff88]">PEGGED</span>
                        )}
                      </div>
                      <span className="text-[12px] font-mono font-bold text-[#ffaa00]">
                        ${cur.usdRate.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9px] text-white/35 font-mono">{cur.name}</span>
                      <span className={`text-[9px] font-mono ${
                        cur.change === 0 ? 'text-white/25' : cur.change > 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'
                      }`}>
                        {cur.change === 0 ? '— FIXED' : cur.change > 0 ? `+${cur.change.toFixed(4)}` : cur.change.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-3 py-2 bg-[#0f0f1a] text-[9px] font-mono text-white/30 leading-relaxed">
              Most GCC currencies pegged to USD.<br/>
              Kuwait Dinar pegged to currency basket.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/25 font-mono">GCC MARKETS</span>
        <span className="text-[9px] text-white/25 font-mono">SIMULATED • LIVE COMING</span>
      </div>
    </div>
  );
}
