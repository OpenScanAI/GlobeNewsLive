'use client';

import { useEffect, useRef, useState } from 'react';

interface TradingChartProps {
  symbol?: string;
  height?: number;
}

const SYMBOLS = [
  { id: 'XAUUSD', name: 'Gold', icon: '🥇' },
  { id: 'XAGUSD', name: 'Silver', icon: '🥈' },
  { id: 'BTCUSD', name: 'Bitcoin', icon: '₿' },
  { id: 'OILUSD', name: 'Oil (WTI)', icon: '🛢️' },
  { id: 'SPX500USD', name: 'S&P 500', icon: '📈' },
];

export default function TradingChart({ symbol = 'XAUUSD', height = 300 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSymbol, setActiveSymbol] = useState(symbol);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget
    containerRef.current.innerHTML = '';
    setLoaded(false);

    // Create TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `OANDA:${activeSymbol}`,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: 'rgba(6, 8, 16, 1)',
      gridColor: 'rgba(42, 58, 74, 0.2)',
      hide_top_toolbar: true,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);
    
    // Mark as loaded after a delay
    setTimeout(() => setLoaded(true), 1500);
  }, [activeSymbol]);

  return (
    <div className="glass-panel">
      {/* Header with symbol selector */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-accent-gold">
            LIVE CHART
          </span>
        </div>
        <div className="flex items-center gap-1">
          {SYMBOLS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSymbol(s.id)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-all ${
                activeSymbol === s.id
                  ? 'bg-accent-gold/20 text-accent-gold'
                  : 'text-text-dim hover:text-text-muted'
              }`}
              title={s.name}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative" style={{ height }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/80 z-10">
            <div className="text-center">
              <div className="text-2xl animate-pulse mb-2">📊</div>
              <div className="text-[10px] text-text-muted font-mono">Loading chart...</div>
            </div>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="tradingview-widget-container"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-border-subtle bg-panel/30">
        <div className="flex items-center justify-between text-[8px] text-text-dim">
          <span>TradingView • 15min candles</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
}
