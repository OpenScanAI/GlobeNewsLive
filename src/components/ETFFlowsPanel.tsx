'use client';

import { useState } from 'react';

interface ETFFlow {
  ticker: string;
  name: string;
  type: string;
  aum: string;
  flow7d: number;
  flowPct: number;
  direction: 'inflow' | 'outflow';
  price: number;
  change: number;
}

const ETF_DATA: ETFFlow[] = [
  { ticker: 'SPY', name: 'SPDR S&P 500', type: 'Equity', aum: '$504B', flow7d: 4.2, flowPct: 0.83, direction: 'inflow', price: 486.32, change: 0.47 },
  { ticker: 'QQQ', name: 'Invesco Nasdaq-100', type: 'Tech', aum: '$247B', flow7d: 2.1, flowPct: 0.85, direction: 'inflow', price: 419.18, change: 0.62 },
  { ticker: 'GLD', name: 'SPDR Gold Shares', type: 'Commodity', aum: '$63B', flow7d: 1.8, flowPct: 2.86, direction: 'inflow', price: 189.54, change: 0.89 },
  { ticker: 'IEF', name: 'iShares 7-10Y Treasury', type: 'Bond', aum: '$32B', flow7d: -0.9, flowPct: -2.81, direction: 'outflow', price: 92.14, change: -0.23 },
  { ticker: 'EEM', name: 'iShares MSCI EM', type: 'EM Equity', aum: '$21B', flow7d: -1.4, flowPct: -6.67, direction: 'outflow', price: 38.72, change: -0.31 },
  { ticker: 'TLT', name: 'iShares 20+Y Treasury', type: 'Bond', aum: '$56B', flow7d: -2.3, flowPct: -4.11, direction: 'outflow', price: 89.45, change: -0.52 },
  { ticker: 'BTC', name: 'iShares Bitcoin Trust', type: 'Crypto', aum: '$22B', flow7d: 0.7, flowPct: 3.18, direction: 'inflow', price: 42180, change: 1.24 },
  { ticker: 'VNQ', name: 'Vanguard Real Estate', type: 'Real Estate', aum: '$31B', flow7d: -0.3, flowPct: -0.97, direction: 'outflow', price: 82.30, change: -0.14 },
];

const TYPE_COLORS: Record<string, string> = {
  Equity: '#00ff88',
  Tech: '#64b4ff',
  Commodity: '#ffaa00',
  Bond: '#b478ff',
  'EM Equity': '#ff8844',
  Crypto: '#f7931a',
  'Real Estate': '#44ddff',
};

export default function ETFFlowsPanel() {
  const [sortBy, setSortBy] = useState<'flow' | 'aum' | 'change'>('flow');
  const [filter, setFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const sorted = [...ETF_DATA]
    .filter(e => filter === 'all' || e.direction === filter)
    .sort((a, b) => {
      if (sortBy === 'flow') return Math.abs(b.flow7d) - Math.abs(a.flow7d);
      if (sortBy === 'change') return Math.abs(b.change) - Math.abs(a.change);
      return 0;
    });

  const totalInflows = ETF_DATA.filter(e => e.direction === 'inflow').reduce((s, e) => s + e.flow7d, 0);
  const totalOutflows = ETF_DATA.filter(e => e.direction === 'outflow').reduce((s, e) => s + e.flow7d, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 p-2 border-b border-white/5">
        <div className="glass-panel p-2 text-center">
          <div className="text-[10px] text-white/30 font-mono">7D INFLOWS</div>
          <div className="text-[#00ff88] font-mono font-bold text-sm">+${totalInflows.toFixed(1)}B</div>
        </div>
        <div className="glass-panel p-2 text-center">
          <div className="text-[10px] text-white/30 font-mono">7D OUTFLOWS</div>
          <div className="text-red-400 font-mono font-bold text-sm">${totalOutflows.toFixed(1)}B</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 p-2 border-b border-white/5">
        <div className="flex gap-1">
          {(['all', 'inflow', 'outflow'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                filter === f
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                  : 'text-white/40 border-white/10'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {(['flow', 'change'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                sortBy === s
                  ? 'bg-white/10 text-white border-white/20'
                  : 'text-white/30 border-white/10'
              }`}
            >
              {s === 'flow' ? '↕ FLOW' : '% CHG'}
            </button>
          ))}
        </div>
      </div>

      {/* ETF List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {sorted.map((etf, i) => (
          <div key={i} className="glass-panel p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-white font-mono font-bold text-xs">{etf.ticker}</span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: TYPE_COLORS[etf.type] || '#fff', background: `${TYPE_COLORS[etf.type] || '#fff'}15` }}
                >
                  {etf.type}
                </span>
              </div>
              <span className="text-white/30 text-[10px] font-mono">{etf.aum} AUM</span>
            </div>

            <div className="text-white/60 text-[10px] font-mono mb-1.5 truncate">{etf.name}</div>

            <div className="flex items-center gap-3">
              {/* Flow bar */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-mono text-white/30">7D FLOW</span>
                  <span className={`text-[10px] font-mono font-bold ${etf.direction === 'inflow' ? 'text-[#00ff88]' : 'text-red-400'}`}>
                    {etf.direction === 'inflow' ? '+' : ''}{etf.flow7d.toFixed(1)}B
                  </span>
                </div>
                <div className="h-1 bg-white/5 rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${Math.min((Math.abs(etf.flow7d) / 5) * 100, 100)}%`,
                      background: etf.direction === 'inflow' ? '#00ff88' : '#ff4444',
                    }}
                  />
                </div>
              </div>

              <div className={`text-[10px] font-mono font-bold flex-shrink-0 ${etf.change >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {etf.change >= 0 ? '+' : ''}{etf.change.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
