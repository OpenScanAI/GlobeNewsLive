'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Signal, Severity } from '@/types';
import { getSeverityColor } from '@/lib/classify';
import { BookmarkButton } from '@/components/BookmarkManager';

interface SignalFeedProps {
  isBookmarked?: (id: string) => boolean;
  onBookmark?: (id: string) => void;
  signals: Signal[];
  loading?: boolean;
  onSignalClick?: (signal: Signal) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  conflict: '⚔️',
  military: '🎖️',
  diplomacy: '🤝',
  cyber: '💻',
  disaster: '🌪️',
  economy: '📊',
  politics: '🏛️',
  terrorism: '💥',
  protest: '✊',
  infrastructure: '🏭',
  nuclear: '☢️',
  shipping: '🚢',
};

const REGION_FLAGS: Record<string, string> = {
  israel: '🇮🇱',
  iran: '🇮🇷',
  us: '🇺🇸',
  'us-mil': '🎖️',
  'us-gov': '🏛️',
  uk: '🇬🇧',
  qatar: '🇶🇦',
  saudi: '🇸🇦',
  uae: '🇦🇪',
  germany: '🇩🇪',
  france: '🇫🇷',
  eu: '🇪🇺',
  mena: '🌍',
  syria: '🇸🇾',
  lebanon: '🇱🇧',
  iraq: '🇮🇶',
  yemen: '🇾🇪',
  defense: '🛡️',
  analysis: '📊',
  osint: '🔍',
  shipping: '🚢',
  nuclear: '☢️',
  cyber: '💻',
  commodities: '📈',
  global: '🌐',
};

function SeverityBadge({ severity }: { severity: Severity }) {
  const color = getSeverityColor(severity);
  return (
    <span 
      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider"
      style={{ 
        color,
        backgroundColor: `${color}15`,
      }}
    >
      {severity}
    </span>
  );
}

function SignalItem({ signal, onClick, isNew, isBookmarked, onBookmark }: { signal: Signal & { iranRelevance?: number; region?: string }; onClick?: () => void; isNew?: boolean; isBookmarked?: boolean; onBookmark?: () => void }) {
  const color = getSeverityColor(signal.severity);
  const isIranRelated = (signal.iranRelevance || 0) > 0;
  
  return (
    <div 
      className={`flex gap-2 py-2 px-1 border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-all duration-300 ${
        isNew ? 'animate-slide-in bg-white/[0.03]' : ''
      } ${isIranRelated ? 'bg-orange-500/5' : ''}`}
      onClick={onClick}
      style={isNew ? { borderLeft: `3px solid ${color}` } : {}}
    >
      {/* Severity indicator bar */}
      <div 
        className="w-1 min-h-[40px] rounded-full flex-shrink-0 transition-all"
        style={{ backgroundColor: color }}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="text-[11px] text-white/90 leading-tight mb-1.5 flex-1">
            {signal.title}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isIranRelated && (
              <span className="px-1 py-0.5 bg-orange-500/20 text-orange-400 text-[7px] font-mono font-bold rounded">
                🇮🇷
              </span>
            )}
            {isNew && (
              <span className="px-1 py-0.5 bg-accent-green/20 text-accent-green text-[7px] font-mono font-bold rounded animate-pulse">
                NEW
              </span>
            )}
            {onBookmark && (
              <BookmarkButton signalId={signal.id} isBookmarked={!!isBookmarked} onToggle={onBookmark} />
            )}          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-[9px]">
          <SeverityBadge severity={signal.severity} />
          
          <span className="text-text-muted">
            {CATEGORY_ICONS[signal.category] || '📰'} {signal.category}
          </span>
          
          <span className="text-text-dim flex items-center gap-1">
            {signal.region && REGION_FLAGS[signal.region] && (
              <span>{REGION_FLAGS[signal.region]}</span>
            )}
            {signal.source}
          </span>
          
          <span className="text-text-dim ml-auto">
            {signal.timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonItem() {
  return (
    <div className="flex gap-2 py-2 px-1 border-b border-border-subtle animate-pulse">
      <div className="w-1 h-12 bg-border-default rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-border-default rounded w-full" />
        <div className="h-3 bg-border-default rounded w-3/4" />
        <div className="h-2 bg-border-default rounded w-1/2" />
      </div>
    </div>
  );
}

type FilterMode = 'all' | 'iran' | 'critical';

export default function SignalFeed({ signals, loading, onSignalClick, isBookmarked, onBookmark }: SignalFeedProps) {
  const [prevSignalIds, setPrevSignalIds] = useState<Set<string>>(new Set());
  const [newSignalIds, setNewSignalIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterMode>('all');
  const listRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 72; // px per signal item
  const OVERSCAN = 3;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    const obs = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height);
    });
    obs.observe(listRef.current);
    setContainerHeight(listRef.current.clientHeight);
    return () => obs.disconnect();
  }, []);

  // Track new signals
  useEffect(() => {
    if (signals.length === 0) return;
    
    const currentIds = new Set(signals.map(s => s.id));
    const newIds = new Set<string>();
    
    currentIds.forEach(id => {
      if (!prevSignalIds.has(id)) {
        newIds.add(id);
      }
    });
    
    if (newIds.size > 0 && prevSignalIds.size > 0) {
      setNewSignalIds(newIds);
      setTimeout(() => setNewSignalIds(new Set()), 10000);
      
      const newCritical = signals.filter(s => newIds.has(s.id) && s.severity === 'CRITICAL');
      if (newCritical.length > 0 && listRef.current) {
        listRef.current.scrollTop = 0;
      }
    }
    
    setPrevSignalIds(currentIds);
  }, [signals]);

  // Filter signals
  const filteredSignals = signals.filter(s => {
    const sig = s as Signal & { iranRelevance?: number };
    if (filter === 'iran') return (sig.iranRelevance || 0) > 0;
    if (filter === 'critical') return s.severity === 'CRITICAL' || s.severity === 'HIGH';
    return true;
  });

  // Counts
  const criticalCount = signals.filter(s => s.severity === 'CRITICAL').length;
  const highCount = signals.filter(s => s.severity === 'HIGH').length;
  const iranCount = signals.filter((s: any) => (s.iranRelevance || 0) > 0).length;

  // Unique sources
  const uniqueSources = new Set(signals.map(s => s.source)).size;

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="text-lg">📡</span>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-wider text-accent-green">
            SIGNAL FEED
          </span>
        </div>
        <div className="flex items-center gap-2">
          {iranCount > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-mono font-bold rounded">
              🇮🇷 {iranCount}
            </span>
          )}
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 bg-accent-red/20 text-accent-red text-[9px] font-mono font-bold rounded">
              {criticalCount} CRIT
            </span>
          )}
          {loading && (
            <span className="text-accent-gold text-[10px] animate-pulse">⟳</span>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-subtle bg-panel/30">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
            filter === 'all' 
              ? 'bg-white/10 text-white' 
              : 'text-text-dim hover:text-white hover:bg-white/5'
          }`}
        >
          ALL ({signals.length})
        </button>
        <button
          onClick={() => setFilter('iran')}
          className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
            filter === 'iran' 
              ? 'bg-orange-500/20 text-orange-400' 
              : 'text-text-dim hover:text-orange-400 hover:bg-orange-500/10'
          }`}
        >
          🇮🇷 IRAN ({iranCount})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
            filter === 'critical' 
              ? 'bg-accent-red/20 text-accent-red' 
              : 'text-text-dim hover:text-accent-red hover:bg-accent-red/10'
          }`}
        >
          ⚠️ HIGH+ ({criticalCount + highCount})
        </button>
      </div>
      
      {/* Signal list — virtual scroll */}
      <div 
        ref={listRef} 
        id="signal-feed"
        className="flex-1 overflow-y-auto px-2" 
        onScroll={handleScroll}
        style={{ willChange: 'transform' }}
      >
        {loading && signals.length === 0 ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-[11px]">
            {filter !== 'all' ? `No ${filter} signals` : 'No signals available'}
          </div>
        ) : (() => {
          const totalHeight = filteredSignals.length * ITEM_HEIGHT;
          const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
          const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + OVERSCAN * 2;
          const endIdx = Math.min(filteredSignals.length, startIdx + visibleCount);
          const visibleSignals = filteredSignals.slice(startIdx, endIdx);
          const offsetTop = startIdx * ITEM_HEIGHT;
          return (
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetTop}px)` }}>
                {visibleSignals.map((signal) => (
                  <SignalItem 
                    key={signal.id} 
                    signal={signal as Signal & { iranRelevance?: number; region?: string }} 
                    onClick={() => onSignalClick?.(signal)}
                    isNew={newSignalIds.has(signal.id)}
                    isBookmarked={isBookmarked?.(signal.id)}
                    onBookmark={() => onBookmark?.(signal.id)}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border-subtle bg-panel/30">
        <div className="flex items-center justify-between text-[9px] text-text-dim">
          <span>{uniqueSources} sources • {signals.length} signals</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            <span>Live • 60s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
