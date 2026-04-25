'use client';

import { MarketData } from '@/types';

interface MarketTickerProps {
  markets: MarketData[];
  loading?: boolean;
}

function MarketItem({ market }: { market: MarketData }) {
  const isUp = market.direction === 'up';
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(156,116,245,0.08)] hover:bg-[#1a1a2a] transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isUp ? '#00c896' : '#ff4d6a' }} />
        <div>
          <span className="text-[11px] font-mono font-bold text-[#9c74f5] tracking-wider">{market.symbol}</span>
          <span className="text-[10px] text-[#5c5a72] ml-2">{market.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-mono font-medium text-[#e8e6f0] tabular-nums">{market.value}</span>
        <span className={`text-[10px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded ${isUp ? 'text-[#00c896] bg-[rgba(0,200,150,0.1)]' : 'text-[#ff4d6a] bg-[rgba(255,77,106,0.1)]'}`}>
          {isUp ? '▲' : '▼'} {market.change}
        </span>
      </div>
    </div>
  );
}

export default function MarketTicker({ markets, loading }: MarketTickerProps) {
  return (
    <div style={{ background: '#12121c', border: '0.5px solid rgba(156,116,245,0.15)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ borderBottom: '0.5px solid rgba(156,116,245,0.08)', padding: '8px 12px', background: '#0d0d14' }} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c74f5', letterSpacing: '0.08em' }}>
            ▪ MARKETS
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(156,116,245,0.1)', color: '#9c74f5', border: '0.5px solid rgba(156,116,245,0.2)' }}>
            LIVE
          </span>
        </div>
        {loading && <span className="text-[10px] animate-pulse" style={{ color: '#9c74f5' }}>⟳</span>}
      </div>
      <div>
        {markets.length === 0 ? (
          <div className="p-3 space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse flex justify-between px-3 py-2">
                <div className="h-2 rounded w-16" style={{ background: 'rgba(156,116,245,0.1)' }} />
                <div className="h-2 rounded w-20" style={{ background: 'rgba(156,116,245,0.1)' }} />
              </div>
            ))}
          </div>
        ) : (
          markets.map((market) => <MarketItem key={market.symbol} market={market} />)
        )}
      </div>
    </div>
  );
}
