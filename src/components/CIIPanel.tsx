'use client';

import { useState, useEffect } from 'react';

interface CountryScore {
  code: string;
  name: string;
  flag: string;
  score: number;
  level: 'critical' | 'high' | 'elevated' | 'normal' | 'low';
  trend: 'rising' | 'falling' | 'stable';
  change24h: number;
  components: {
    unrest: number;
    conflict: number;
    security: number;
    information: number;
  };
}

const MOCK_COUNTRIES: CountryScore[] = [
  { code: 'SY', name: 'Syria', flag: '🇸🇾', score: 94, level: 'critical', trend: 'stable', change24h: 0, components: { unrest: 92, conflict: 98, security: 95, information: 91 } },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪', score: 91, level: 'critical', trend: 'rising', change24h: 2, components: { unrest: 88, conflict: 96, security: 90, information: 90 } },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫', score: 89, level: 'critical', trend: 'stable', change24h: 0, components: { unrest: 85, conflict: 94, security: 88, information: 89 } },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸', score: 87, level: 'critical', trend: 'rising', change24h: 3, components: { unrest: 90, conflict: 88, security: 84, information: 86 } },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴', score: 85, level: 'critical', trend: 'stable', change24h: -1, components: { unrest: 84, conflict: 90, security: 82, information: 84 } },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩', score: 82, level: 'high', trend: 'rising', change24h: 4, components: { unrest: 80, conflict: 86, security: 81, information: 81 } },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲', score: 80, level: 'high', trend: 'stable', change24h: 1, components: { unrest: 82, conflict: 84, security: 76, information: 78 } },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩', score: 79, level: 'high', trend: 'rising', change24h: 5, components: { unrest: 81, conflict: 82, security: 75, information: 78 } },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', score: 74, level: 'high', trend: 'falling', change24h: -2, components: { unrest: 70, conflict: 78, security: 74, information: 74 } },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦', score: 72, level: 'high', trend: 'stable', change24h: 0, components: { unrest: 68, conflict: 82, security: 70, information: 68 } },
];

const LEVEL_COLORS: Record<string, string> = {
  critical: '#ff4444',
  high: '#ff8800',
  elevated: '#ffaa00',
  normal: '#00ff88',
  low: '#888888',
};

const LEVEL_LABELS: Record<string, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  elevated: 'ELEVATED',
  normal: 'NORMAL',
  low: 'LOW',
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a2e" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold" fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

export default function CIIPanel() {
  const [data, setData] = useState<CountryScore[]>(MOCK_COUNTRIES);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(c => ({
        ...c,
        score: Math.max(0, Math.min(100, c.score + (Math.random() - 0.5) * 2)),
        change24h: Math.round((Math.random() - 0.5) * 6),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'rising' : 'falling') : 'stable',
      })));
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = data.filter(c => filter === 'all' || c.level === filter);

  const avgScore = Math.round(data.reduce((s, c) => s + c.score, 0) / data.length);
  const criticalCount = data.filter(c => c.level === 'critical').length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-[#ff4444] text-sm font-bold font-mono">CII</span>
          <span className="text-white/40 text-xs">Country Instability Index</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
          <span className="text-[#ff4444]">●</span> LIVE
        </div>
      </div>

      {/* Global Score */}
      <div className="flex items-center gap-4 px-3 py-2 bg-[#ff4444]/5 border-b border-white/5">
        <ScoreRing score={avgScore} color="#ff8800" />
        <div>
          <div className="text-white/40 text-[10px] font-mono uppercase">Global Average</div>
          <div className="text-[#ff8800] text-2xl font-bold font-mono">{avgScore}/100</div>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] text-[#ff4444] font-mono">{criticalCount} CRITICAL</span>
            <span className="text-[10px] text-white/30 font-mono">|</span>
            <span className="text-[10px] text-[#ff8800] font-mono">{data.filter(c => c.level === 'high').length} HIGH</span>
          </div>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono">
          <div className="text-white/40">Unrest</div><div className="text-[#ffaa00]">{Math.round(data.reduce((s,c)=>s+c.components.unrest,0)/data.length)}</div>
          <div className="text-white/40">Conflict</div><div className="text-[#ff4444]">{Math.round(data.reduce((s,c)=>s+c.components.conflict,0)/data.length)}</div>
          <div className="text-white/40">Security</div><div className="text-[#ff8800]">{Math.round(data.reduce((s,c)=>s+c.components.security,0)/data.length)}</div>
          <div className="text-white/40">Info</div><div className="text-[#00aaff]">{Math.round(data.reduce((s,c)=>s+c.components.information,0)/data.length)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-white/5">
        {(['all', 'critical', 'high'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
              filter === f
                ? 'border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88]'
                : 'border-white/10 text-white/40 hover:text-white/60'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-white/30 font-mono self-center">
          {lastUpdate.toLocaleTimeString()}
        </span>
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((country, i) => {
          const color = LEVEL_COLORS[country.level];
          return (
            <div key={country.code} className="px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-white/20 font-mono w-4">{i + 1}</span>
                <span className="text-base">{country.flag}</span>
                <span className="text-xs font-semibold text-white flex-1">{country.name}</span>
                <span className="text-xs font-bold font-mono" style={{ color }}>{Math.round(country.score)}</span>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ color, backgroundColor: color + '22' }}>
                  {LEVEL_LABELS[country.level]}
                </span>
                <span className={`text-[10px] font-mono ${country.trend === 'rising' ? 'text-[#ff4444]' : country.trend === 'falling' ? 'text-[#00ff88]' : 'text-white/30'}`}>
                  {country.trend === 'rising' ? `↑${Math.abs(country.change24h)}` : country.trend === 'falling' ? `↓${Math.abs(country.change24h)}` : '→'}
                </span>
              </div>
              {/* Bar */}
              <div className="ml-6 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${country.score}%`, backgroundColor: color }}
                  />
                </div>
              </div>
              {/* Components */}
              <div className="ml-6 flex gap-3 mt-1">
                <span className="text-[9px] text-white/30 font-mono">U:<span className="text-[#ffaa00]">{country.components.unrest}</span></span>
                <span className="text-[9px] text-white/30 font-mono">C:<span className="text-[#ff4444]">{country.components.conflict}</span></span>
                <span className="text-[9px] text-white/30 font-mono">S:<span className="text-[#ff8800]">{country.components.security}</span></span>
                <span className="text-[9px] text-white/30 font-mono">I:<span className="text-[#00aaff]">{country.components.information}</span></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
