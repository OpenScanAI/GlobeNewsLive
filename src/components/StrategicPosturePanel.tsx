'use client';

import { useState, useEffect } from 'react';

interface TheaterPosture {
  id: string;
  theater: string;
  country: string;
  flag: string;
  readiness: 1 | 2 | 3 | 4 | 5;
  status: 'ELEVATED' | 'GUARDED' | 'NORMAL' | 'HIGH' | 'SEVERE';
  forces: {
    ground: string;
    naval: string;
    air: string;
    cyber: string;
  };
  activity: string;
  lastUpdate: string;
  alert: string | null;
}

const DEFCON_CONFIG: Record<number, { label: string; color: string; bg: string; desc: string }> = {
  1: { label: 'COCKED PISTOL', color: '#ff0000', bg: '#ff000022', desc: 'Maximum readiness' },
  2: { label: 'FAST PACE', color: '#ff4444', bg: '#ff444422', desc: 'Armed forces ready' },
  3: { label: 'ROUND HOUSE', color: '#ff8800', bg: '#ff880022', desc: 'Air force ready in 15min' },
  4: { label: 'DOUBLE TAKE', color: '#ffaa00', bg: '#ffaa0022', desc: 'Above normal readiness' },
  5: { label: 'FADE OUT', color: '#00ff88', bg: '#00ff8822', desc: 'Normal peacetime readiness' },
};

const MOCK_POSTURES: TheaterPosture[] = [
  {
    id: 'us', theater: 'CONUS/Global', country: 'United States', flag: '🇺🇸',
    readiness: 3, status: 'ELEVATED',
    forces: { ground: '485K Active', naval: '11 Carrier Groups', air: 'F-35/B-21 Deployed', cyber: 'CYBERCOM Active' },
    activity: 'Multiple naval deployments in Pacific and Middle East. B-52 presence operations active.',
    lastUpdate: '2h ago', alert: null,
  },
  {
    id: 'ru', theater: 'Eastern Europe/Arctic', country: 'Russia', flag: '🇷🇺',
    readiness: 2, status: 'HIGH',
    forces: { ground: 'VDV + Combined Arms', naval: 'Northern Fleet Active', air: 'Su-35/Tu-95 Patrols', cyber: 'APT28/29 Active' },
    activity: 'Active operations in Ukraine. Strategic nuclear forces at elevated readiness.',
    lastUpdate: '30m ago', alert: '⚡ STRATEGIC FORCES ALERT',
  },
  {
    id: 'cn', theater: 'Indo-Pacific/Taiwan Strait', country: 'China', flag: '🇨🇳',
    readiness: 3, status: 'ELEVATED',
    forces: { ground: 'PLA Ground Force', naval: 'PLAN 3 Carriers', air: 'J-20 Deployments', cyber: 'Unit 61398 Active' },
    activity: 'Increased PLAAF incursions into Taiwan ADIZ. Naval exercises ongoing.',
    lastUpdate: '1h ago', alert: null,
  },
  {
    id: 'il', theater: 'Middle East', country: 'Israel', flag: '🇮🇱',
    readiness: 2, status: 'HIGH',
    forces: { ground: 'IDF Reserve Mobilized', naval: 'INS Deployed', air: 'F-35I Active', cyber: 'Unit 8200 Active' },
    activity: 'Active operations. Iron Dome systems on continuous watch. Northern border elevated.',
    lastUpdate: '15m ago', alert: '⚠️ MULTI-FRONT THREAT',
  },
  {
    id: 'kp', theater: 'Korean Peninsula', country: 'North Korea', flag: '🇰🇵',
    readiness: 3, status: 'ELEVATED',
    forces: { ground: '1.2M KPA', naval: 'Submarine Fleet', air: 'MiG-29 Active', cyber: 'Lazarus Group' },
    activity: 'Ballistic missile testing activity. ICBM capability demonstrated.',
    lastUpdate: '4h ago', alert: null,
  },
  {
    id: 'ir', theater: 'Persian Gulf', country: 'Iran', flag: '🇮🇷',
    readiness: 3, status: 'ELEVATED',
    forces: { ground: 'IRGC + Artesh', naval: 'Strait of Hormuz Active', air: 'UAV Fleet Deployed', cyber: 'APT33/35 Active' },
    activity: 'Proxy network activation across Levant. Naval harassment operations ongoing.',
    lastUpdate: '2h ago', alert: null,
  },
];

function DefconDial({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  const cfg = DEFCON_CONFIG[level];
  return (
    <div className="flex items-center gap-1.5">
      {[5, 4, 3, 2, 1].map(n => (
        <div
          key={n}
          className="w-3 h-3 rounded-sm border transition-all"
          style={{
            backgroundColor: n <= (6 - level) ? cfg.color : 'transparent',
            borderColor: n <= (6 - level) ? cfg.color : '#333',
            opacity: n <= (6 - level) ? 1 : 0.3,
          }}
        />
      ))}
      <span className="text-[9px] font-mono font-bold ml-1" style={{ color: cfg.color }}>DEF{level}</span>
    </div>
  );
}

export default function StrategicPosturePanel() {
  const [postures, setPostures] = useState<TheaterPosture[]>(MOCK_POSTURES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'elevated' | 'high'>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setPostures(prev => prev.map(p => ({
        ...p,
        lastUpdate: Math.random() < 0.2 ? 'just now' : p.lastUpdate,
      })));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const displayed = postures.filter(p => {
    if (filter === 'elevated') return p.status === 'ELEVATED' || p.status === 'HIGH' || p.status === 'SEVERE';
    if (filter === 'high') return p.status === 'HIGH' || p.status === 'SEVERE';
    return true;
  });

  const alertCount = postures.filter(p => p.alert).length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-[#ff8800] text-sm font-bold font-mono">STRATEGIC POSTURE</div>
            <div className="text-white/40 text-[10px]">Global Military Readiness</div>
          </div>
        </div>
        {alertCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#ff4444] bg-[#ff4444]/10 px-2 py-1 rounded border border-[#ff4444]/30 animate-pulse">
            ⚡ {alertCount} ALERT{alertCount > 1 ? 'S' : ''}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-white/5">
        {(['all', 'elevated', 'high'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
              filter === f ? 'border-[#ff8800]/50 bg-[#ff8800]/10 text-[#ff8800]' : 'border-white/10 text-white/40 hover:text-white/60'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-white/30 font-mono self-center">{displayed.length} theaters</span>
      </div>

      {/* Posture List */}
      <div className="flex-1 overflow-y-auto">
        {displayed.map(p => {
          const cfg = DEFCON_CONFIG[p.readiness];
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className="border-b border-white/5">
              {/* Alert Banner */}
              {p.alert && (
                <div className="px-3 py-1 bg-[#ff4444]/10 border-b border-[#ff4444]/20 text-[9px] font-mono text-[#ff4444] animate-pulse">
                  {p.alert}
                </div>
              )}
              {/* Main row */}
              <button
                className="w-full px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{p.country}</span>
                      <span className="text-[9px] text-white/40">{p.theater}</span>
                    </div>
                    <DefconDial level={p.readiness} />
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                      {p.status}
                    </div>
                    <div className="text-[9px] text-white/30 font-mono mt-0.5">{p.lastUpdate}</div>
                  </div>
                  <span className="text-white/20 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div className="px-3 pb-3 bg-white/2 border-t border-white/5">
                  <div className="text-[9px] text-white/60 mt-2 leading-relaxed">{p.activity}</div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {Object.entries(p.forces).map(([k, v]) => (
                      <div key={k} className="bg-white/5 rounded p-1.5">
                        <div className="text-[8px] text-white/30 font-mono uppercase">{k}</div>
                        <div className="text-[9px] text-white/70 font-mono">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[9px] font-mono">
                    <span className="text-white/30">READINESS: </span>
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-white/30 ml-2">— {cfg.desc}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
