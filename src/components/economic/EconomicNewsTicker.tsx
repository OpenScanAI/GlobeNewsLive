'use client';

import { useState, useEffect, useRef } from 'react';

interface NewsItem {
  source: string;
  headline: string;
  time: string;
  priority: 'breaking' | 'high' | 'normal';
}

// Simulated breaking news feed — in production this would fetch from RSS
const MOCK_NEWS: NewsItem[] = [
  { source: 'Reuters', headline: 'Fed signals potential rate pause as inflation cools', time: '2m ago', priority: 'breaking' },
  { source: 'BBC', headline: 'UK GDP contracts 0.3% in Q1, recession fears mount', time: '5m ago', priority: 'high' },
  { source: 'Al Jazeera', headline: 'Oil prices surge above $85 on Middle East tensions', time: '8m ago', priority: 'breaking' },
  { source: 'France24', headline: 'ECB holds rates steady, Lagarde warns on services inflation', time: '12m ago', priority: 'normal' },
  { source: 'Reuters', headline: 'Argentina inflation hits 220%, central bank hikes 600bps', time: '15m ago', priority: 'breaking' },
  { source: 'DW', headline: 'German manufacturing PMI falls to 42.5, contraction deepens', time: '18m ago', priority: 'high' },
  { source: 'BBC', headline: 'Japan yen hits 155 per dollar, intervention risk rises', time: '22m ago', priority: 'high' },
  { source: 'Reuters', headline: 'China exports beat expectations, trade surplus widens', time: '25m ago', priority: 'normal' },
  { source: 'Al Jazeera', headline: 'Turkey central bank maintains tight policy stance', time: '30m ago', priority: 'normal' },
  { source: 'Guardian', headline: 'Global debt hits $315T, emerging markets face refinancing cliff', time: '35m ago', priority: 'breaking' },
  { source: 'France24', headline: 'EU approves €50B Ukraine aid package despite Hungary veto threat', time: '40m ago', priority: 'high' },
  { source: 'Reuters', headline: 'India GDP growth 8.2% in FY24, fastest among major economies', time: '45m ago', priority: 'normal' },
];

const priorityColors = {
  breaking: 'text-red-400 border-red-400/30 bg-red-400/5',
  high: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  normal: 'text-white/60 border-white/10 bg-white/5',
};

const priorityLabels = {
  breaking: 'BREAKING',
  high: 'HIGH',
  normal: 'NEWS',
};

export default function EconomicNewsTicker() {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [scrollIndex, setScrollIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [news.length]);

  // Auto-scroll the container
  useEffect(() => {
    if (containerRef.current) {
      const itemHeight = 48; // approx height per item
      containerRef.current.scrollTo({
        top: scrollIndex * itemHeight,
        behavior: 'smooth',
      });
    }
  }, [scrollIndex]);

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden max-h-[280px] relative">
      <div className="space-y-1">
        {news.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 px-2.5 py-2 rounded-md border ${priorityColors[item.priority]} transition-all duration-300 ${
              i === scrollIndex ? 'opacity-100 scale-[1.02]' : 'opacity-60 scale-100'
            }`}
          >
            <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
              <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded ${
                item.priority === 'breaking' ? 'bg-red-500/20 text-red-400' :
                item.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                'bg-white/10 text-white/40'
              }`}>
                {priorityLabels[item.priority]}
              </span>
              <span className="text-[8px] font-mono text-white/30">{item.time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono text-white/50 mb-0.5">{item.source}</div>
              <div className="text-[11px] text-white/80 leading-tight">{item.headline}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fade overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0d0d14] to-transparent pointer-events-none" />
    </div>
  );
}
