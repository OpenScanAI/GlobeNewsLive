'use client';

import { useState } from 'react';

interface DataSource {
  id: string;
  name: string;
  category: 'news' | 'satellite' | 'social' | 'economic' | 'military' | 'cyber';
  coverage: number; // 0-100
  reliability: number; // 0-100
  latency: string;
  status: 'live' | 'delayed' | 'stale' | 'offline';
  gaps: string[];
}

const DATA_SOURCES: DataSource[] = [
  { id: 'gdelt', name: 'GDELT Events', category: 'news', coverage: 92, reliability: 78, latency: '15m', status: 'live', gaps: ['Local language sources', 'Censored regions'] },
  { id: 'sentinel', name: 'Sentinel SAR', category: 'satellite', coverage: 85, reliability: 91, latency: '6h', status: 'live', gaps: ['Cloud-covered areas', 'Nighttime optical'] },
  { id: 'twitter', name: 'Social Signals', category: 'social', coverage: 71, reliability: 55, latency: '5m', status: 'live', gaps: ['Non-English content', 'Verified accounts only'] },
  { id: 'fred', name: 'FRED Economic', category: 'economic', coverage: 96, reliability: 95, latency: '1d', status: 'delayed', gaps: ['Real-time GDP', 'Informal economy'] },
  { id: 'acled', name: 'ACLED Conflicts', category: 'military', coverage: 88, reliability: 89, latency: '3d', status: 'live', gaps: ['Active warzone granularity', 'Cyberwarfare events'] },
  { id: 'sonar', name: 'Cyber Threat Intel', category: 'cyber', coverage: 67, reliability: 72, latency: '1h', status: 'live', gaps: ['Nation-state TTPs', 'Dark web channels'] },
  { id: 'ais', name: 'AIS Ship Tracking', category: 'military', coverage: 94, reliability: 88, latency: '10m', status: 'live', gaps: ['AIS-dark vessels', 'Submarine activity'] },
  { id: 'iaea', name: 'Nuclear Monitoring', category: 'military', coverage: 45, reliability: 82, latency: '7d', status: 'stale', gaps: ['DPRK facilities', 'Unreported sites'] },
];

const CATEGORY_ICONS: Record<string, string> = {
  news: '📰',
  satellite: '🛰️',
  social: '📱',
  economic: '📊',
  military: '⚔️',
  cyber: '💻',
};

export default function IntelligenceGapBadge() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');

  const avgCoverage = Math.round(DATA_SOURCES.reduce((s, d) => s + d.coverage, 0) / DATA_SOURCES.length);
  const avgReliability = Math.round(DATA_SOURCES.reduce((s, d) => s + d.reliability, 0) / DATA_SOURCES.length);
  const offlineCount = DATA_SOURCES.filter(d => d.status === 'offline').length;
  const staleCount = DATA_SOURCES.filter(d => d.status === 'stale').length;

  const categories = ['all', ...Array.from(new Set(DATA_SOURCES.map(d => d.category)))];

  const filtered = DATA_SOURCES.filter(d => filterCat === 'all' || d.category === filterCat);

  const statusColor: Record<string, string> = {
    live: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
    delayed: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    stale: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    offline: 'text-red-400 bg-red-400/10 border-red-400/30',
  };

  const coverageColor = (v: number) => v >= 85 ? '#00ff88' : v >= 65 ? '#ffaa00' : '#ff4444';

  return (
    <div className="h-full flex flex-col">
      {/* Header Summary */}
      <div className="p-3 border-b border-white/5">
        <div className="text-[10px] text-white/40 font-mono uppercase mb-2">INTELLIGENCE COVERAGE REPORT</div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono">COVERAGE</div>
            <div className="font-mono font-bold text-sm" style={{ color: coverageColor(avgCoverage) }}>{avgCoverage}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono">RELIABILITY</div>
            <div className="text-[#00ff88] font-mono font-bold text-sm">{avgReliability}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono">SOURCES</div>
            <div className="text-white font-mono font-bold text-sm">{DATA_SOURCES.length}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-white/30 font-mono">GAPS</div>
            <div className="text-red-400 font-mono font-bold text-sm">{staleCount + offlineCount}</div>
          </div>
        </div>

        {/* Overall Coverage Bar */}
        <div className="mt-2">
          <div className="h-2 bg-white/5 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{
                width: `${avgCoverage}%`,
                background: `linear-gradient(90deg, #ff4444 0%, #ffaa00 50%, #00ff88 100%)`,
                backgroundSize: '100px 100%',
                backgroundPosition: `${avgCoverage}% 0`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
              filterCat === cat
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {cat === 'all' ? '🌐 ALL' : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* Source List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {filtered.map(src => (
          <div key={src.id} className="glass-panel">
            <button
              className="w-full p-2.5 flex items-center gap-3 text-left"
              onClick={() => setExpanded(expanded === src.id ? null : src.id)}
            >
              <span className="text-base">{CATEGORY_ICONS[src.category]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-mono">{src.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${statusColor[src.status]}`}>
                    {src.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/5 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{ width: `${src.coverage}%`, background: coverageColor(src.coverage) }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/40 flex-shrink-0">{src.coverage}%</span>
                  <span className="text-[10px] font-mono text-white/20">⏱{src.latency}</span>
                </div>
              </div>
            </button>

            {expanded === src.id && (
              <div className="px-2.5 pb-2.5 border-t border-white/5 pt-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-[9px] text-white/30 font-mono">RELIABILITY</div>
                    <div className="font-mono font-bold text-xs" style={{ color: coverageColor(src.reliability) }}>
                      {src.reliability}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/30 font-mono">LATENCY</div>
                    <div className="text-white font-mono text-xs">{src.latency}</div>
                  </div>
                </div>
                {src.gaps.length > 0 && (
                  <div>
                    <div className="text-[9px] text-white/30 font-mono mb-1">INTELLIGENCE GAPS</div>
                    {src.gaps.map((gap, i) => (
                      <div key={i} className="text-[10px] font-mono text-red-400/80 flex items-center gap-1 mb-0.5">
                        <span>⚠</span> {gap}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
