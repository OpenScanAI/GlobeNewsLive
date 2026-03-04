'use client';

import { useState, useEffect } from 'react';

interface CurrencyPair {
  pair: string;
  rate: number;
  change1d: number;
  change7d: number;
  significance: string;
}

interface BondYield {
  country: string;
  flag: string;
  tenor: string;
  yield: number;
  change1d: number;
  rating: string;
  stress: boolean;
}

interface MacroIndicator {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: number;
  unit: string;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  significance: string;
  alert: boolean;
}

type Tab = 'indicators' | 'currencies' | 'bonds';

const INDICATORS: MacroIndicator[] = [
  { id: 'dxy', label: 'DXY (USD Index)', value: '104.82', numericValue: 104.82, change: 0.34, unit: '', direction: 'UP', significance: 'Dollar strength — pressure on EM', alert: false },
  { id: 'gold', label: 'Gold', value: '$2,374', numericValue: 2374, change: 12.5, unit: '/oz', direction: 'UP', significance: 'Safe haven demand elevated', alert: false },
  { id: 'oil-wti', label: 'WTI Crude', value: '$82.40', numericValue: 82.40, change: 1.8, unit: '/bbl', direction: 'UP', significance: 'Geopolitical risk premium rising', alert: false },
  { id: 'oil-brent', label: 'Brent Crude', value: '$86.20', numericValue: 86.20, change: 2.1, unit: '/bbl', direction: 'UP', significance: 'Red Sea disruption baked in', alert: true },
  { id: 'vix', label: 'VIX (Fear Index)', value: '18.4', numericValue: 18.4, change: 1.2, unit: '', direction: 'UP', significance: 'Elevated but below crisis levels', alert: false },
  { id: 'btc', label: 'Bitcoin', value: '$68,420', numericValue: 68420, change: -2.1, unit: '', direction: 'DOWN', significance: 'Risk-on indicator', alert: false },
  { id: 'wheat', label: 'Wheat (CBOT)', value: '$612', numericValue: 612, change: 8.4, unit: '/bu', direction: 'UP', significance: 'Ukraine conflict supply disruption', alert: true },
  { id: 'copper', label: 'Copper', value: '$4.28', numericValue: 4.28, change: -0.8, unit: '/lb', direction: 'DOWN', significance: 'China demand indicator', alert: false },
];

const CURRENCIES: CurrencyPair[] = [
  { pair: 'USD/RUB', rate: 91.45, change1d: 0.82, change7d: 3.2, significance: 'Russia war economy stress' },
  { pair: 'USD/ILS', rate: 3.72, change1d: 0.04, change7d: 1.8, significance: 'Israel conflict premium' },
  { pair: 'USD/UAH', rate: 38.2, change1d: 0.1, change7d: 0.5, significance: 'Ukraine reconstruction' },
  { pair: 'USD/TRY', rate: 32.4, change1d: 0.15, change7d: 1.2, significance: 'Turkey inflation/geopolitics' },
  { pair: 'USD/IRR', rate: 42150, change1d: 180, change7d: 800, significance: 'Iran sanctions / black market' },
  { pair: 'USD/CNY', rate: 7.24, change1d: 0.02, change7d: 0.08, significance: 'China economic pressure' },
  { pair: 'EUR/USD', rate: 1.084, change1d: -0.003, change7d: -0.012, significance: 'European energy crisis' },
  { pair: 'USD/JPY', rate: 151.8, change1d: 0.4, change7d: 1.8, significance: 'BOJ intervention risk' },
];

const BONDS: BondYield[] = [
  { country: 'USA', flag: '🇺🇸', tenor: '10Y', yield: 4.42, change1d: 0.04, rating: 'AA+', stress: false },
  { country: 'Germany', flag: '🇩🇪', tenor: '10Y', yield: 2.48, change1d: 0.02, rating: 'AAA', stress: false },
  { country: 'UK', flag: '🇬🇧', tenor: '10Y', yield: 4.18, change1d: 0.05, rating: 'AA', stress: false },
  { country: 'Japan', flag: '🇯🇵', tenor: '10Y', yield: 0.91, change1d: 0.03, rating: 'A', stress: false },
  { country: 'Italy', flag: '🇮🇹', tenor: '10Y', yield: 3.88, change1d: 0.06, rating: 'BBB', stress: false },
  { country: 'Ukraine', flag: '🇺🇦', tenor: '10Y', yield: 21.4, change1d: 0.8, rating: 'CC', stress: true },
  { country: 'Turkey', flag: '🇹🇷', tenor: '10Y', yield: 28.6, change1d: 1.2, rating: 'B', stress: true },
  { country: 'Egypt', flag: '🇪🇬', tenor: '10Y', yield: 26.8, change1d: 0.5, rating: 'B-', stress: true },
  { country: 'Pakistan', flag: '🇵🇰', tenor: '10Y', yield: 21.2, change1d: 0.3, rating: 'CCC+', stress: true },
  { country: 'Argentina', flag: '🇦🇷', tenor: '10Y', yield: 18.4, change1d: -0.5, rating: 'CCC', stress: true },
];

export default function MacroSignalsPanel() {
  const [tab, setTab] = useState<Tab>('indicators');
  const [data, setData] = useState({ indicators: INDICATORS, currencies: CURRENCIES, bonds: BONDS });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        indicators: prev.indicators.map(ind => ({
          ...ind,
          numericValue: ind.numericValue * (1 + (Math.random() - 0.5) * 0.002),
          change: ind.change + (Math.random() - 0.5) * 0.1,
        })),
        currencies: prev.currencies.map(c => ({
          ...c,
          rate: c.rate * (1 + (Math.random() - 0.5) * 0.001),
          change1d: c.change1d + (Math.random() - 0.5) * 0.01,
        })),
      }));
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const alertCount = data.indicators.filter(i => i.alert).length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <div className="text-[#00ff88] text-sm font-bold font-mono">MACRO SIGNALS</div>
            <div className="text-white/40 text-[10px]">Economic & Geopolitical Indicators</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alertCount > 0 && (
            <div className="text-[9px] font-mono text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 py-0.5 rounded border border-[#ffaa00]/30">
              {alertCount} alerts
            </div>
          )}
          <div className="text-[9px] text-white/30 font-mono">{lastUpdate.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['indicators', 'currencies', 'bonds'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[9px] font-mono transition-colors ${
              tab === t ? 'text-[#00ff88] border-b-2 border-[#00ff88] bg-[#00ff88]/5' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'indicators' ? '📈 INDICATORS' : t === 'currencies' ? '💱 FX' : '📋 BONDS'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'indicators' && (
          <>
            {data.indicators.map(ind => (
              <div key={ind.id} className={`px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors ${ind.alert ? 'bg-[#ffaa00]/3' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{ind.label}</span>
                      {ind.alert && <span className="text-[8px] text-[#ffaa00] font-mono">⚠️ ALERT</span>}
                    </div>
                    <div className="text-[9px] text-white/40">{ind.significance}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">{ind.value}</div>
                    <div className={`text-[9px] font-mono ${ind.change >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                      {ind.change >= 0 ? '↑' : '↓'} {Math.abs(ind.change).toFixed(2)}{ind.unit ? '' : '%'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'currencies' && (
          <>
            <div className="px-3 py-1.5 bg-white/3 border-b border-white/5 text-[9px] text-white/30 font-mono">
              War economy & sanctions stress currencies highlighted
            </div>
            {data.currencies.map(c => {
              const isStressed = Math.abs(c.change7d) > 2 || c.pair.includes('IRR') || c.pair.includes('RUB');
              return (
                <div key={c.pair} className={`px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors ${isStressed ? 'bg-[#ff4444]/3' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs font-bold font-mono text-[#00aaff]">{c.pair}</div>
                      <div className="text-[9px] text-white/40">{c.significance}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">{c.rate.toFixed(c.rate > 1000 ? 0 : c.rate > 100 ? 1 : 4)}</div>
                      <div className="flex gap-2">
                        <span className={`text-[9px] font-mono ${c.change1d >= 0 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
                          1d: {c.change1d >= 0 ? '+' : ''}{c.change1d.toFixed(3)}
                        </span>
                        <span className={`text-[9px] font-mono ${c.change7d >= 0 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
                          7d: {c.change7d >= 0 ? '+' : ''}{c.change7d.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'bonds' && (
          <>
            <div className="px-3 py-1.5 bg-white/3 border-b border-white/5 text-[9px] text-white/30 font-mono">
              Stressed countries (yield &gt;15%) flagged as geopolitical risk indicators
            </div>
            {data.bonds.map(b => (
              <div key={`${b.country}-${b.tenor}`} className={`px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors ${b.stress ? 'bg-[#ff4444]/3' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{b.country}</span>
                      <span className="text-[9px] text-white/40 font-mono">{b.tenor}</span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${b.stress ? 'text-[#ff4444] bg-[#ff4444]/10' : 'text-[#00ff88] bg-[#00ff88]/10'}`}>
                        {b.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold font-mono ${b.stress ? 'text-[#ff4444]' : 'text-white'}`}>
                      {b.yield.toFixed(2)}%
                    </div>
                    <div className={`text-[9px] font-mono ${b.change1d >= 0 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
                      {b.change1d >= 0 ? '+' : ''}{b.change1d.toFixed(2)} bps
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
