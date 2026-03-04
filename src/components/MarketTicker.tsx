'use client';

import { MarketData } from '@/types';

interface MarketTickerProps {
  markets: MarketData[];
  loading?: boolean;
}

function MarketItem({ market }: { market: MarketData }) {
  const isUp = market.direction === 'up';
  
  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-elevated/50 rounded">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted font-mono">{market.symbol}</span>
        <span className="text-[11px] text-white">{market.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-white">{market.value}</span>
        <span 
          className={`text-[10px] font-mono font-bold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}
        >
          {isUp ? '▲' : '▼'} {market.change}
        </span>
      </div>
    </div>
  );
}

export default function MarketTicker({ markets, loading }: MarketTickerProps) {
  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-accent-blue">
            MARKETS
          </span>
        </div>
        {loading && (
          <span className="text-accent-gold text-[10px] animate-pulse">⟳</span>
        )}
      </div>
      
      <div className="p-2 space-y-1">
        {markets.length === 0 ? (
          <div className="animate-pulse space-y-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-7 bg-border-default rounded" />
            ))}
          </div>
        ) : (
          markets.map((market) => (
            <MarketItem key={market.symbol} market={market} />
          ))
        )}
      </div>
    </div>
  );
}
