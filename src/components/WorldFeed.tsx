'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Signal } from '@/types';

type FeedFilter = 'all' | 'critical' | 'military' | 'economic' | 'cyber' | 'disaster';

interface FeedItem {
  id: string;
  handle: string;
  name: string;
  icon: string;
  verified: boolean;
  category: FeedFilter;
  text: string;
  timestamp: Date;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  region: string;
  isNew?: boolean;
  source?: string;
  sourceUrl?: string;
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical:  { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    label: 'CRITICAL' },
  military:  { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'MILITARY' },
  economic:  { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',   label: 'ECONOMIC' },
  cyber:     { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', label: 'CYBER' },
  disaster:  { color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30',  label: 'DISASTER' },
  all:       { color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',  label: 'ALL' },
};

const SEVERITY_DOT: Record<string, string> = {
  CRITICAL: 'bg-red-500 animate-pulse',
  HIGH:     'bg-orange-500',
  MEDIUM:   'bg-yellow-500',
  LOW:      'bg-blue-400',
  INFO:     'bg-gray-400',
};

const OSINT_SOURCES = [
  { handle: 'AuroraIntel',    name: 'Aurora Intel',     icon: '🌐', verified: true },
  { handle: 'OSINTdefender',  name: 'OSINT Defender',   icon: '🛡️', verified: true },
  { handle: 'IntelCrab',      name: 'Intel Crab',       icon: '🦀', verified: true },
  { handle: 'GeoConfirmed',   name: 'GeoConfirmed',     icon: '📍', verified: true },
  { handle: 'CovertShores',   name: 'Covert Shores',    icon: '⚓', verified: true },
  { handle: 'Militarylandmap',name: 'Military Land Map', icon: '🗺️', verified: false },
];

function signalToFeedItem(signal: Signal, isNew = false): FeedItem {
  const source = OSINT_SOURCES[Math.floor(Math.random() * OSINT_SOURCES.length)];
  let category: FeedFilter = 'all';
  if (signal.severity === 'CRITICAL') category = 'critical';
  else if (signal.category === 'military') category = 'military';
  else if (signal.category === 'economy') category = 'economic';
  else if (signal.category === 'cyber') category = 'cyber';
  else if (signal.category === 'disaster') category = 'disaster';
  return {
    id: signal.id,
    handle: source.handle,
    name: source.name,
    icon: source.icon,
    verified: source.verified,
    category,
    text: signal.title,
    timestamp: new Date(signal.timestamp),
    severity: signal.severity,
    region: signal.region || 'global',
    isNew,
    source: signal.source,
    sourceUrl: signal.sourceUrl,
  };
}

interface WorldFeedProps {
  signals: Signal[];
  loading?: boolean;
  maxHeight?: string;
}

export default function WorldFeed({ signals, loading = false, maxHeight = '100%' }: WorldFeedProps) {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [paused, setPaused] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [prevSignalIds, setPrevSignalIds] = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!signals.length) return;
    const newIds = new Set(signals.map(s => s.id));
    const addedIds = [...newIds].filter(id => !prevSignalIds.has(id));
    const feedItems = signals.map(s => signalToFeedItem(s, addedIds.includes(s.id)));
    if (prevSignalIds.size > 0 && addedIds.length > 0) setNewCount(c => c + addedIds.length);
    setItems(feedItems);
    setPrevSignalIds(newIds);
  }, [signals]);

  useEffect(() => {
    if (autoScroll && feedRef.current && !paused) feedRef.current.scrollTop = 0;
  }, [items, autoScroll, paused]);

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);
  const filters: FeedFilter[] = ['all', 'critical', 'military', 'economic', 'cyber', 'disaster'];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a1a2e] bg-[#0d0d1a] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">WORLD FEED</span>
          <span className="text-[9px] text-gray-500 font-mono">{filtered.length} signals</span>
        </div>
        <button onClick={() => setPaused(p => !p)} className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${paused ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {paused ? '⏸ PAUSED' : '▶ LIVE'}
        </button>
      </div>
      <div className="px-2 py-1.5 border-b border-[#1a1a2e] flex gap-1 flex-wrap flex-shrink-0">
        {filters.map(f => {
          const cfg = CATEGORY_CONFIG[f];
          return (
            <button key={f} onClick={() => setFilter(f)} className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${filter === f ? `${cfg.bg} ${cfg.color} border-current` : 'bg-transparent text-gray-500 border-gray-700 hover:text-gray-300'}`}>
              {f.toUpperCase()}
            </button>
          );
        })}
      </div>
      {newCount > 0 && (
        <button onClick={() => { feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); setNewCount(0); }} className="mx-2 mt-1 py-1 text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded flex items-center justify-center gap-1 hover:bg-green-500/20 transition-colors flex-shrink-0">
          ↑ {newCount} new signal{newCount > 1 ? 's' : ''}
        </button>
      )}
      <div ref={feedRef} className="flex-1 overflow-y-auto" onScroll={e => { const el = e.currentTarget; setAutoScroll(el.scrollTop < 100); if (el.scrollTop === 0) setNewCount(0); }}>
        {loading && items.length === 0 ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => (<div key={i} className="animate-pulse flex gap-2"><div className="w-7 h-7 rounded-full bg-white/5 flex-shrink-0" /><div className="flex-1 space-y-1.5"><div className="h-2 bg-white/5 rounded w-1/3" /><div className="h-2 bg-white/5 rounded w-full" /><div className="h-2 bg-white/5 rounded w-3/4" /></div></div>))}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[11px] text-gray-600 font-mono">No signals in this category</div>
        ) : (
          <div className="divide-y divide-[#1a1a2e]">
            {filtered.map(item => <FeedCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 border-t border-[#1a1a2e] bg-[#0d0d1a] flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-gray-600 font-mono">{signals.length} total · 30s refresh</span>
        <span className="text-[9px] text-green-500/40 font-mono">worldmonitor style</span>
      </div>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.all;
  const dot = SEVERITY_DOT[item.severity] || SEVERITY_DOT.INFO;
  return (
    <div className={`px-3 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer group ${item.isNew ? 'bg-green-500/[0.03]' : ''}`}>
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold text-white">{item.name}</span>
            {item.verified && <span className="text-blue-400 text-[9px]">✓</span>}
            <span className="text-[9px] text-gray-600">@{item.handle}</span>
            <span className="text-[9px] text-gray-700">·</span>
            <span className="text-[9px] text-gray-600">{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
            {item.isNew && <span className="text-[8px] bg-green-500/20 text-green-400 px-1 rounded font-mono">NEW</span>}
          </div>
          <p className="text-[11px] text-gray-200 leading-relaxed mb-1.5">{item.text}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
            <div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${dot}`} /><span className="text-[8px] font-mono text-gray-600">{item.severity}</span></div>
            {item.region && <span className="text-[8px] text-gray-600 font-mono uppercase">{item.region}</span>}
            {item.source && <span className="text-[8px] text-gray-700">via {item.source}</span>}
          </div>
        </div>
        {item.sourceUrl && (
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-gray-300 flex-shrink-0 mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}
