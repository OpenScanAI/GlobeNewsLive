'use client';

import { useState, useEffect } from 'react';

interface UcdpEvent {
  id: string;
  country: string;
  flag: string;
  region: string;
  type: 'state-based' | 'non-state' | 'one-sided';
  actors: string[];
  deaths: number;
  civDeaths: number;
  date: Date;
  location: string;
  description: string;
}

interface ConflictSummary {
  country: string;
  flag: string;
  totalDeaths2024: number;
  totalDeaths2023: number;
  activeConflicts: number;
  trend: 'escalating' | 'stable' | 'declining';
}

const TYPE_CONFIG = {
  'state-based': { color: '#ff4444', label: 'State-Based', icon: '⚔️' },
  'non-state': { color: '#ff8800', label: 'Non-State', icon: '🔫' },
  'one-sided': { color: '#ffaa00', label: 'One-Sided', icon: '🎯' },
};

const MOCK_EVENTS: UcdpEvent[] = [
  { id: '1', country: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe', type: 'state-based', actors: ['Russia', 'Ukraine'], deaths: 47, civDeaths: 12, date: new Date(Date.now() - 2 * 3600000), location: 'Kharkiv Oblast', description: 'Artillery exchange along frontline. Civilian infrastructure targeted.' },
  { id: '2', country: 'Sudan', flag: '🇸🇩', region: 'East Africa', type: 'state-based', actors: ['SAF', 'RSF'], deaths: 31, civDeaths: 18, date: new Date(Date.now() - 5 * 3600000), location: 'Khartoum', description: 'RSF offensive in Omdurman. Humanitarian corridor blocked.' },
  { id: '3', country: 'Myanmar', flag: '🇲🇲', region: 'Southeast Asia', type: 'state-based', actors: ['Tatmadaw', 'PDF/EAOs'], deaths: 24, civDeaths: 8, date: new Date(Date.now() - 8 * 3600000), location: 'Sagaing Region', description: 'PDF forces seized military outpost. Airstrike followed.' },
  { id: '4', country: 'DR Congo', flag: '🇨🇩', region: 'Central Africa', type: 'non-state', actors: ['M23', 'FARDC'], deaths: 19, civDeaths: 11, date: new Date(Date.now() - 12 * 3600000), location: 'North Kivu', description: 'M23 advance on Goma periphery. Mass displacement ongoing.' },
  { id: '5', country: 'Yemen', flag: '🇾🇪', region: 'Middle East', type: 'state-based', actors: ['Houthis', 'Coalition'], deaths: 15, civDeaths: 5, date: new Date(Date.now() - 18 * 3600000), location: 'Marib Governorate', description: 'Coalition airstrikes on Houthi positions. Drone launched at Red Sea shipping.' },
  { id: '6', country: 'Nigeria', flag: '🇳🇬', region: 'West Africa', type: 'non-state', actors: ['Boko Haram', 'MNJTF'], deaths: 22, civDeaths: 14, date: new Date(Date.now() - 24 * 3600000), location: 'Borno State', description: 'Village attack targeting civilians. Abductions reported.' },
];

const MOCK_SUMMARIES: ConflictSummary[] = [
  { country: 'Ukraine', flag: '🇺🇦', totalDeaths2024: 48200, totalDeaths2023: 43100, activeConflicts: 1, trend: 'escalating' },
  { country: 'Sudan', flag: '🇸🇩', totalDeaths2024: 28500, totalDeaths2023: 12400, activeConflicts: 2, trend: 'escalating' },
  { country: 'Myanmar', flag: '🇲🇲', totalDeaths2024: 18300, totalDeaths2023: 14200, activeConflicts: 4, trend: 'escalating' },
  { country: 'DR Congo', flag: '🇨🇩', totalDeaths2024: 15600, totalDeaths2023: 16800, activeConflicts: 7, trend: 'stable' },
  { country: 'Ethiopia', flag: '🇪🇹', totalDeaths2024: 8900, totalDeaths2023: 22300, activeConflicts: 2, trend: 'declining' },
  { country: 'Somalia', flag: '🇸🇴', totalDeaths2024: 7200, totalDeaths2023: 8100, activeConflicts: 3, trend: 'declining' },
];

function formatDeaths(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function timeSince(d: Date): string {
  const h = Math.floor((Date.now() - d.getTime()) / 3600000);
  if (h < 1) return `${Math.floor((Date.now() - d.getTime()) / 60000)}m ago`;
  return `${h}h ago`;
}

export default function UcdpEventsPanel() {
  const [tab, setTab] = useState<'events' | 'stats'>('events');
  const [typeFilter, setTypeFilter] = useState<'all' | 'state-based' | 'non-state' | 'one-sided'>('all');
  const [events] = useState(MOCK_EVENTS);

  const totalDeaths24h = events.reduce((s, e) => s + e.deaths, 0);
  const totalCivDeaths24h = events.reduce((s, e) => s + e.civDeaths, 0);

  const filtered = events.filter(e => typeFilter === 'all' || e.type === typeFilter);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <div className="text-[#ff8800] text-sm font-bold font-mono">UCDP EVENTS</div>
            <div className="text-white/40 text-[10px]">Uppsala Conflict Data Program</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#ff4444] text-sm font-bold font-mono">{totalDeaths24h}</div>
          <div className="text-[9px] text-white/30 font-mono">deaths 24h</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-0 border-b border-white/5">
        <div className="px-3 py-2 border-r border-white/5">
          <div className="text-[#ff4444] text-sm font-bold font-mono">{totalDeaths24h}</div>
          <div className="text-[9px] text-white/40 font-mono">Combat Deaths</div>
        </div>
        <div className="px-3 py-2 border-r border-white/5">
          <div className="text-[#ffaa00] text-sm font-bold font-mono">{totalCivDeaths24h}</div>
          <div className="text-[9px] text-white/40 font-mono">Civilian Deaths</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[#00aaff] text-sm font-bold font-mono">{events.length}</div>
          <div className="text-[9px] text-white/40 font-mono">Events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['events', 'stats'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[10px] font-mono transition-colors ${
              tab === t ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'events' ? '⚡ LIVE EVENTS' : '📈 STATISTICS'}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <>
          {/* Type Filter */}
          <div className="flex gap-1 px-3 py-1.5 border-b border-white/5 overflow-x-auto">
            {(['all', 'state-based', 'non-state', 'one-sided'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={`px-2 py-0.5 text-[9px] font-mono rounded border whitespace-nowrap transition-colors ${
                  typeFilter === f ? 'border-[#ff8800]/50 bg-[#ff8800]/10 text-[#ff8800]' : 'border-white/10 text-white/40'
                }`}
              >
                {f.toUpperCase().replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Events */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(event => {
              const cfg = TYPE_CONFIG[event.type];
              return (
                <div key={event.id} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5">{event.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{event.country}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.color + '22' }}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">{timeSince(event.date)}</span>
                      </div>
                      <div className="text-[9px] text-white/50 mt-0.5">{event.location}</div>
                      <div className="text-[9px] text-white/60 mt-1 leading-relaxed">{event.description}</div>
                      <div className="flex gap-3 mt-1.5">
                        <span className="text-[9px] font-mono"><span className="text-white/30">Deaths:</span> <span className="text-[#ff4444]">{event.deaths}</span></span>
                        <span className="text-[9px] font-mono"><span className="text-white/30">Civilian:</span> <span className="text-[#ffaa00]">{event.civDeaths}</span></span>
                        <span className="text-[9px] text-white/30 font-mono">{event.actors.join(' vs ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'stats' && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono text-white/40 border-b border-white/5">
            2024 vs 2023 Conflict Fatalities
          </div>
          {MOCK_SUMMARIES.map(s => {
            const change = ((s.totalDeaths2024 - s.totalDeaths2023) / s.totalDeaths2023) * 100;
            const trendColor = s.trend === 'escalating' ? '#ff4444' : s.trend === 'declining' ? '#00ff88' : '#ffaa00';
            const maxDeaths = Math.max(...MOCK_SUMMARIES.map(x => x.totalDeaths2024));
            return (
              <div key={s.country} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{s.flag}</span>
                  <span className="text-xs font-semibold flex-1">{s.country}</span>
                  <span className="text-[9px] font-mono font-bold" style={{ color: trendColor }}>
                    {s.trend === 'escalating' ? '↑' : s.trend === 'declining' ? '↓' : '→'} {Math.abs(change).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff4444] rounded-full" style={{ width: `${(s.totalDeaths2024 / maxDeaths) * 100}%` }} />
                  </div>
                  <span className="text-[9px] font-bold font-mono text-[#ff4444] w-12 text-right">{formatDeaths(s.totalDeaths2024)}</span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] font-mono text-white/30">{s.activeConflicts} active conflicts</span>
                  <span className="text-[9px] font-mono text-white/30">2023: {formatDeaths(s.totalDeaths2023)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
