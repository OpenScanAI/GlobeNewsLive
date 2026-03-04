'use client';

import { useState } from 'react';

interface DisplacementFlow {
  id: string;
  country: string;
  region: string;
  refugees: number; // thousands
  idps: number; // thousands (internally displaced)
  asylum: number; // thousands
  trend: 'increasing' | 'stable' | 'decreasing';
  primaryHost?: string;
  cause: string;
  flag: string;
}

interface HostCountry {
  country: string;
  flag: string;
  total: number; // thousands
  mainOrigins: string[];
  capacity: 'over' | 'at' | 'under';
}

const ORIGIN_DATA: DisplacementFlow[] = [
  { id: 'syria', country: 'Syria', region: 'Middle East', refugees: 5500, idps: 6800, asylum: 1200, trend: 'stable', primaryHost: 'Turkey', cause: 'Civil war, airstrikes', flag: '🇸🇾' },
  { id: 'ukraine', country: 'Ukraine', region: 'Europe', refugees: 6200, idps: 3700, asylum: 800, trend: 'decreasing', primaryHost: 'Germany', cause: 'Russian invasion', flag: '🇺🇦' },
  { id: 'afghanistan', country: 'Afghanistan', region: 'Central Asia', refugees: 5400, idps: 4100, asylum: 600, trend: 'increasing', primaryHost: 'Pakistan', cause: 'Taliban rule, drought', flag: '🇦🇫' },
  { id: 'south-sudan', country: 'South Sudan', region: 'Africa', refugees: 2200, idps: 1800, asylum: 200, trend: 'stable', primaryHost: 'Uganda', cause: 'Civil conflict, famine', flag: '🇸🇸' },
  { id: 'myanmar', country: 'Myanmar', region: 'Southeast Asia', refugees: 1300, idps: 2600, asylum: 150, trend: 'increasing', primaryHost: 'Bangladesh', cause: 'Military coup, ethnic cleansing', flag: '🇲🇲' },
  { id: 'congo', country: 'DR Congo', region: 'Africa', refugees: 1000, idps: 6900, asylum: 300, trend: 'increasing', primaryHost: 'Uganda', cause: 'Armed groups, M23', flag: '🇨🇩' },
  { id: 'somalia', country: 'Somalia', region: 'Horn of Africa', refugees: 800, idps: 3000, asylum: 150, trend: 'stable', primaryHost: 'Kenya', cause: 'Al-Shabaab, drought', flag: '🇸🇴' },
  { id: 'sudan', country: 'Sudan', region: 'Africa', refugees: 1900, idps: 8200, asylum: 250, trend: 'increasing', primaryHost: 'Chad', cause: 'SAF/RSF civil war', flag: '🇸🇩' },
  { id: 'venezuela', country: 'Venezuela', region: 'South America', refugees: 7700, idps: 0, asylum: 400, trend: 'stable', primaryHost: 'Colombia', cause: 'Economic collapse, Maduro', flag: '🇻🇪' },
  { id: 'ethiopia', country: 'Ethiopia', region: 'Horn of Africa', refugees: 500, idps: 4200, asylum: 100, trend: 'decreasing', primaryHost: 'Kenya', cause: 'Tigray conflict, drought', flag: '🇪🇹' },
];

const HOST_DATA: HostCountry[] = [
  { country: 'Turkey', flag: '🇹🇷', total: 3600, mainOrigins: ['Syria', 'Afghanistan', 'Iraq'], capacity: 'over' },
  { country: 'Colombia', flag: '🇨🇴', total: 2900, mainOrigins: ['Venezuela'], capacity: 'at' },
  { country: 'Germany', flag: '🇩🇪', total: 2600, mainOrigins: ['Ukraine', 'Syria', 'Afghanistan'], capacity: 'at' },
  { country: 'Pakistan', flag: '🇵🇰', total: 1700, mainOrigins: ['Afghanistan'], capacity: 'over' },
  { country: 'Uganda', flag: '🇺🇬', total: 1600, mainOrigins: ['South Sudan', 'DRC', 'Somalia'], capacity: 'over' },
  { country: 'Iran', flag: '🇮🇷', total: 800, mainOrigins: ['Afghanistan'], capacity: 'over' },
  { country: 'Bangladesh', flag: '🇧🇩', total: 950, mainOrigins: ['Myanmar'], capacity: 'over' },
  { country: 'Kenya', flag: '🇰🇪', total: 580, mainOrigins: ['Somalia', 'DRC', 'Ethiopia'], capacity: 'at' },
  { country: 'Chad', flag: '🇹🇩', total: 1100, mainOrigins: ['Sudan', 'CAR'], capacity: 'over' },
  { country: 'Ethiopia', flag: '🇪🇹', total: 900, mainOrigins: ['South Sudan', 'Eritrea', 'Somalia'], capacity: 'at' },
];

const TREND_ICON: Record<string, string> = {
  increasing: '📈',
  stable: '➡️',
  decreasing: '📉',
};

const TREND_COLOR: Record<string, string> = {
  increasing: '#ff4444',
  stable: '#ffaa00',
  decreasing: '#00ff88',
};

const CAPACITY_CONFIG = {
  over: { label: 'OVER CAPACITY', color: '#ff4444', bg: 'bg-[#ff4444]/10' },
  at: { label: 'AT CAPACITY', color: '#ffaa00', bg: 'bg-[#ffaa00]/10' },
  under: { label: 'UNDER CAPACITY', color: '#00ff88', bg: 'bg-[#00ff88]/10' },
};

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}M`;
  return `${n}K`;
}

export default function DisplacementPanel() {
  const [view, setView] = useState<'origins' | 'hosts'>('origins');
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalRefugees = ORIGIN_DATA.reduce((s, d) => s + d.refugees, 0);
  const totalIDPs = ORIGIN_DATA.reduce((s, d) => s + d.idps, 0);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🏕️</span>
          <span className="text-[11px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">Displacement</span>
          <span className="text-[9px] font-mono text-white/30 uppercase">UN OCHA</span>
        </div>
        <div className="flex gap-1">
          {(['origins', 'hosts'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all ${
                view === v ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/30 hover:text-white/60'
              }`}>
              {v === 'origins' ? '📤 ORIGINS' : '📥 HOSTS'}
            </button>
          ))}
        </div>
      </div>

      {/* Global stats */}
      <div className="px-3 py-2 border-b border-white/5 grid grid-cols-3 gap-2 flex-shrink-0">
        <div className="text-center">
          <div className="text-[14px] font-mono font-bold text-[#ff4444]">{formatK(totalRefugees)}</div>
          <div className="text-[8px] text-white/30 font-mono uppercase">Refugees</div>
        </div>
        <div className="text-center">
          <div className="text-[14px] font-mono font-bold text-[#ffaa00]">{formatK(totalIDPs)}</div>
          <div className="text-[8px] text-white/30 font-mono uppercase">IDPs</div>
        </div>
        <div className="text-center">
          <div className="text-[14px] font-mono font-bold text-[#00aaff]">117M</div>
          <div className="text-[8px] text-white/30 font-mono uppercase">Total Forced</div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {view === 'origins' && ORIGIN_DATA.map(d => {
          const isExp = expanded === d.id;
          return (
            <div key={d.id}
              onClick={() => setExpanded(isExp ? null : d.id)}
              className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all">
              <div className="px-3 py-2 flex items-center gap-2">
                <span className="text-base flex-shrink-0">{d.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-white/90">{d.country}</span>
                    <span className="text-[9px]">{TREND_ICON[d.trend]}</span>
                  </div>
                  <div className="text-[9px] text-white/35 font-mono">{d.region}</div>
                </div>
                <div className="flex gap-3 flex-shrink-0 text-right">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#ff4444]">{formatK(d.refugees)}</div>
                    <div className="text-[8px] text-white/25 font-mono">REF</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#ffaa00]">{formatK(d.idps)}</div>
                    <div className="text-[8px] text-white/25 font-mono">IDP</div>
                  </div>
                </div>
              </div>
              {isExp && (
                <div className="px-3 pb-2 space-y-1">
                  <div className="text-[10px] font-mono text-white/60">
                    <span className="text-[#00ff88]">Primary host:</span> {d.primaryHost}
                  </div>
                  <div className="text-[10px] font-mono text-white/60">
                    <span className="text-[#ffaa00]">Cause:</span> {d.cause}
                  </div>
                  <div className="text-[10px] font-mono text-white/60">
                    <span className="text-[#00aaff]">Asylum seekers:</span> {formatK(d.asylum)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px]">{TREND_ICON[d.trend]}</span>
                    <span className="text-[9px] font-mono capitalize" style={{ color: TREND_COLOR[d.trend] }}>
                      {d.trend}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {view === 'hosts' && HOST_DATA.map(h => {
          const cfg = CAPACITY_CONFIG[h.capacity];
          return (
            <div key={h.country} className={`border-b border-white/5 px-3 py-2 ${cfg.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-base flex-shrink-0">{h.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-white/90">{h.country}</span>
                    <span className="text-[9px] font-mono px-1 rounded" style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-[9px] text-white/35 font-mono mt-0.5">
                    From: {h.mainOrigins.join(', ')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[13px] font-mono font-bold" style={{ color: cfg.color }}>
                    {formatK(h.total)}
                  </div>
                  <div className="text-[8px] text-white/25 font-mono">HOSTED</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/25 font-mono">UNHCR / IOM DATA</span>
        <span className="text-[9px] text-white/25 font-mono">2024 ESTIMATES</span>
      </div>
    </div>
  );
}
