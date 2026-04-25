'use client';

import { useState, useEffect } from 'react';

interface StatsBarProps {
  activeConflicts: number;
  militaryAlerts: number;
  highSeverity: number;
  criticalSeverity: number;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

const TIME_FILTERS = ['1h', '6h', '24h', '48h', '7d'];

export default function StatsBar({ activeConflicts, militaryAlerts, highSeverity, criticalSeverity, timeFilter, onTimeFilterChange }: StatsBarProps) {
  const [defcon, setDefcon] = useState<number>(3);
  const [markets, setMarkets] = useState<{name:string;value:string;change:string;direction:string}[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch('/api/defcon').then(r=>r.json()).then(d=>setDefcon(d.defcon?.level||3)).catch(()=>{});
    fetch('/api/markets').then(r=>r.json()).then(d=>setMarkets((d.markets||[]).slice(0,6))).catch(()=>{});
  }, []);

  // Animate market ticker
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const defconColors: Record<number,string> = { 1:'#ff0000', 2:'#ff4400', 3:'#ffcc00', 4:'#00ccff', 5:'#00ff88' };
  const defconNames: Record<number,string> = { 1:'COCKED PISTOL', 2:'FAST PACE', 3:'ROUND HOUSE', 4:'DOUBLE TAKE', 5:'FADE OUT' };

  return (
    <footer className="border-t border-border-default bg-elevated/80 backdrop-blur-sm">
      {/* Market ticker strip */}
      {markets.length > 0 && (
        <div className="border-b border-border-subtle bg-black/30 px-4 py-1 flex items-center gap-6 overflow-x-auto scrollbar-none">
          <span className="text-[8px] font-mono text-text-dim flex-shrink-0">MARKETS</span>
          {markets.map((m,i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-[9px] font-mono text-text-dim">{m.name}</span>
              <span className="text-[9px] font-mono text-white font-bold">{m.value}</span>
              <span className={`text-[8px] font-mono ${m.direction==='up'?'text-accent-green':'text-accent-red'}`}>
                {m.direction==='up'?'▲':'▼'} {m.change}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse"/>
            <span className="text-[8px] font-mono text-text-dim">LIVE</span>
          </div>
        </div>
      )}

      {/* Main stats bar */}
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        {/* Left: conflict stats */}
        <div className="flex items-center gap-1">
          {[
            { icon:'⚔️', label:'ACTIVE CONFLICTS', value: activeConflicts, color:'text-white' },
            { icon:'🎖️', label:'MILITARY', value: militaryAlerts, color:'text-accent-orange' },
            { icon:'🔴', label:'CRITICAL', value: criticalSeverity, color:'text-accent-red' },
            { icon:'🟠', label:'HIGH', value: highSeverity, color:'text-accent-orange' },
          ].map((s,i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[10px]">{s.icon}</span>
              <span className="font-mono text-[8px] text-text-dim hidden lg:block">{s.label}</span>
              <span className={`font-mono text-[11px] font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Center: DEFCON */}
        <div className="flex items-center gap-2 px-3 py-1 rounded border"
          style={{ borderColor: defconColors[defcon]+'40', backgroundColor: defconColors[defcon]+'10' }}>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(l => (
              <div key={l} className="w-2 h-4 rounded-sm transition-all"
                style={{ backgroundColor: l <= defcon ? defconColors[defcon]+'60' : '#ffffff10',
                  ...(l === defcon ? { backgroundColor: defconColors[defcon], boxShadow: `0 0 6px ${defconColors[defcon]}` } : {}) }} />
            ))}
          </div>
          <div>
            <div className="font-mono text-[7px] text-text-dim">DEFCON</div>
            <div className="font-mono text-[10px] font-bold" style={{ color: defconColors[defcon] }}>
              {defcon} · {defconNames[defcon]}
            </div>
          </div>
        </div>

        {/* Right: time filter + version */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[8px] text-text-dim">TIME:</span>
            {TIME_FILTERS.map(f => (
              <button key={f} onClick={() => onTimeFilterChange(f)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${
                  timeFilter===f ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'text-text-dim hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pl-3 border-l border-border-subtle">
            <a href="https://github.com/madhavikodale/globenews-live" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-text-dim hover:text-white transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-mono text-[8px]">MIT</span>
            </a>
            <span className="font-mono text-[8px] text-text-dim">GlobeNews Live v2.6</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
