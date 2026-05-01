'use client';

import { useState, useEffect, useRef } from 'react';

interface Headline {
  source: string;
  title: string;
}

interface RSSTickerProps {
  refreshInterval?: number; // ms, default 5 min
}

export default function RSSTicker({ refreshInterval = 300000 }: RSSTickerProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHeadlines = async () => {
    try {
      // Add cache-busting query param
      const res = await fetch('/api/rss-ticker?_=' + Date.now());
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setHeadlines(data.headlines || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadlines();
    const interval = setInterval(fetchHeadlines, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Shuffle headlines to interleave sources for better visual variety
  const shuffled = [...headlines].sort(() => Math.random() - 0.5);
  
  // Duplicate for seamless infinite scroll
  const displayHeadlines = shuffled.length > 0 ? [...shuffled, ...shuffled] : [];

  const sourceColors: Record<string, string> = {
    Reuters: 'text-accent-green',
    BBC: 'text-accent-red',
    'Al Jazeera': 'text-accent-orange',
    Guardian: 'text-accent-blue',
    France24: 'text-accent-gold',
    DW: 'text-accent-green',
  };

  if (loading) {
    return (
      <div className="h-8 bg-elevated border-t border-border-default flex items-center px-4">
        <div className="text-[10px] font-mono text-text-dim animate-pulse">📡 Loading RSS feeds...</div>
      </div>
    );
  }

  if (error || headlines.length === 0) {
    return (
      <div className="h-8 bg-elevated border-t border-border-default flex items-center px-4">
        <div className="text-[10px] font-mono text-text-dim">📡 RSS ticker unavailable</div>
      </div>
    );
  }

  return (
    <div
      className="h-8 bg-elevated border-t border-border-default flex items-center overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Label */}
      <div className="shrink-0 px-3 py-1 bg-void border-r border-border-default z-10">
        <span className="text-[10px] font-mono font-bold text-accent-green">📰 RSS</span>
      </div>

      {/* Scrolling container */}
      <div className="flex-1 overflow-hidden relative" ref={scrollRef}>
        <div
          className={`flex items-center whitespace-nowrap ${paused ? '' : 'animate-ticker-scroll'}`}
          style={{
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {displayHeadlines.map((h, i) => (
            <span key={`${h.source}-${i}`} className="inline-flex items-center mx-6">
              <span className={`text-[9px] font-mono font-bold uppercase mr-2 ${sourceColors[h.source] || 'text-text-dim'}`}>
                {h.source}
              </span>
              <span className="text-[11px] text-white/90">{h.title}</span>
              <span className="text-text-dim mx-4">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pause indicator */}
      {paused && (
        <div className="shrink-0 px-2">
          <span className="text-[9px] font-mono text-text-dim">⏸</span>
        </div>
      )}
    </div>
  );
}
