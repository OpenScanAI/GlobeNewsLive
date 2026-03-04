'use client';

import { useState, useEffect } from 'react';

interface Stablecoin {
  symbol: string;
  name: string;
  price: number;
  marketCap: string;
  volume24h: string;
  pegStatus: 'ON PEG' | 'SLIGHT DEPEG' | 'DEPEG';
  health: 'HEALTHY' | 'CAUTION' | 'WARNING';
  collateral: string;
  change24h: number;
  dominance: number;
}

const STABLECOINS: Stablecoin[] = [
  { symbol: 'USDT', name: 'Tether', price: 0.9997, marketCap: '$97.4B', volume24h: '$48.2B', pegStatus: 'ON PEG', health: 'HEALTHY', collateral: 'Mixed (T-Bills, BTC)', change24h: 0.01, dominance: 68.4 },
  { symbol: 'USDC', name: 'USD Coin', price: 1.0001, marketCap: '$28.1B', volume24h: '$8.4B', pegStatus: 'ON PEG', health: 'HEALTHY', collateral: 'Cash & T-Bills', change24h: -0.01, dominance: 19.8 },
  { symbol: 'DAI', name: 'MakerDAO DAI', price: 1.0003, marketCap: '$5.3B', volume24h: '$0.9B', pegStatus: 'ON PEG', health: 'HEALTHY', collateral: 'Multi-collateral', change24h: 0.02, dominance: 3.7 },
  { symbol: 'FDUSD', name: 'First Digital USD', price: 0.9994, marketCap: '$2.8B', volume24h: '$4.1B', pegStatus: 'SLIGHT DEPEG', health: 'CAUTION', collateral: 'Cash & Equiv.', change24h: -0.06, dominance: 2.0 },
  { symbol: 'TUSD', name: 'TrueUSD', price: 0.9981, marketCap: '$0.5B', volume24h: '$0.2B', pegStatus: 'SLIGHT DEPEG', health: 'CAUTION', collateral: 'Audited Cash', change24h: -0.19, dominance: 0.4 },
  { symbol: 'FRAX', name: 'Frax', price: 1.0002, marketCap: '$0.7B', volume24h: '$0.1B', pegStatus: 'ON PEG', health: 'HEALTHY', collateral: 'Algorithmic+USDC', change24h: 0.02, dominance: 0.5 },
];

const DEPEG_ALERTS = [
  { coin: 'FDUSD', severity: 'medium', message: 'FDUSD trading at $0.9994 - 0.06% below peg', time: '2h ago' },
  { coin: 'TUSD', severity: 'high', message: 'TUSD at $0.9981 - approaching depeg threshold', time: '45m ago' },
];

export default function StablecoinPanel() {
  const [totalMarketCap] = useState('$134.8B');
  const [showAlerts, setShowAlerts] = useState(false);

  const pegColor: Record<string, string> = {
    'ON PEG': 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
    'SLIGHT DEPEG': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    'DEPEG': 'text-red-400 bg-red-400/10 border-red-400/30',
  };

  const healthDot: Record<string, string> = {
    'HEALTHY': 'bg-[#00ff88]',
    'CAUTION': 'bg-yellow-400',
    'WARNING': 'bg-red-400',
  };

  const alertCount = DEPEG_ALERTS.length;

  return (
    <div className="h-full flex flex-col">
      {/* Header Stats */}
      <div className="p-2 border-b border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-panel p-2 text-center">
            <div className="text-[9px] text-white/30 font-mono">TOTAL MCAP</div>
            <div className="text-[#00ff88] font-mono font-bold text-xs">{totalMarketCap}</div>
          </div>
          <div className="glass-panel p-2 text-center">
            <div className="text-[9px] text-white/30 font-mono">STABLECOINS</div>
            <div className="text-white font-mono font-bold text-xs">{STABLECOINS.length}</div>
          </div>
          <button
            onClick={() => setShowAlerts(a => !a)}
            className="glass-panel p-2 text-center relative"
          >
            <div className="text-[9px] text-white/30 font-mono">ALERTS</div>
            <div className="text-red-400 font-mono font-bold text-xs">{alertCount}</div>
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Alert Panel */}
      {showAlerts && (
        <div className="p-2 border-b border-white/5 bg-red-900/10">
          <div className="text-[10px] text-red-400 font-mono uppercase mb-1.5">⚠ DE-PEG ALERTS</div>
          {DEPEG_ALERTS.map((a, i) => (
            <div key={i} className="flex items-start gap-2 mb-1.5">
              <span className="text-yellow-400 text-[10px] font-mono font-bold flex-shrink-0">[{a.coin}]</span>
              <span className="text-white/70 text-[10px] font-mono">{a.message}</span>
              <span className="text-white/30 text-[10px] font-mono flex-shrink-0 ml-auto">{a.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stablecoin List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {STABLECOINS.map((coin, i) => (
          <div key={i} className="glass-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${healthDot[coin.health]}`} />
                <span className="text-white font-mono font-bold text-xs">{coin.symbol}</span>
                <span className="text-white/40 text-[10px] font-mono">{coin.name}</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${pegColor[coin.pegStatus]}`}>
                {coin.pegStatus}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-mono font-bold">${coin.price.toFixed(4)}</span>
              <span className={`text-[10px] font-mono ${coin.change24h >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[9px] text-white/30 font-mono">MCAP</div>
                <div className="text-white/80 text-[10px] font-mono">{coin.marketCap}</div>
              </div>
              <div>
                <div className="text-[9px] text-white/30 font-mono">VOL 24H</div>
                <div className="text-white/80 text-[10px] font-mono">{coin.volume24h}</div>
              </div>
              <div>
                <div className="text-[9px] text-white/30 font-mono">DOMINANCE</div>
                <div className="text-[#00ff88] text-[10px] font-mono">{coin.dominance}%</div>
              </div>
            </div>

            {/* Dominance Bar */}
            <div className="mt-2 h-1 bg-white/5 rounded overflow-hidden">
              <div
                className="h-full bg-[#00ff88]/60 rounded"
                style={{ width: `${coin.dominance}%` }}
              />
            </div>

            <div className="mt-1 text-[9px] text-white/20 font-mono">Collateral: {coin.collateral}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
