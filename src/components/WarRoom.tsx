'use client';

import { useState, useEffect } from 'react';
import { Signal } from '@/types';
import { ACTIVE_CONFLICTS } from '@/lib/feeds';
import Globe from '@/components/ui/globe';

interface ConflictEvent {
  id: string;
  event_date: string;
  event_type: string;
  actor1: string;
  actor2?: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  notes: string;
  source: string;
}

interface MissileEvent {
  id: string;
  type: string;
  origin: string;
  target: string;
  originLat: number;
  originLon: number;
  targetLat: number;
  targetLon: number;
  status: 'active' | 'intercepted' | 'landed';
  timeAgo: string;
  speed: number;
  altitude: number;
}

interface AlertEvent {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  region: string;
  timeAgo: string;
  category: string;
}

interface WarRoomProps {
  signals: Signal[];
  conflicts?: ConflictEvent[];
}

// Theater selector
const THEATERS = [
  { id: 'global', name: 'GLOBAL', icon: '🌍' },
  { id: 'ukraine', name: 'UKRAINE', icon: '🇺🇦' },
  { id: 'middleeast', name: 'MIDDLE EAST', icon: '🕌' },
  { id: 'asia', name: 'ASIA-PAC', icon: '🌏' },
];

function generateMockMissiles(): MissileEvent[] {
  const data: MissileEvent[] = [
    {
      id: 'M-001',
      type: 'HYPERSONIC',
      origin: 'Pyongyang, NK',
      target: 'Seoul, SK',
      originLat: 39.04,
      originLon: 125.76,
      targetLat: 37.57,
      targetLon: 126.98,
      status: 'active',
      timeAgo: '2m ago',
      speed: 18000,
      altitude: 45,
    },
    {
      id: 'M-002',
      type: 'ICBM',
      origin: 'Moscow, RU',
      target: 'Kyiv, UA',
      originLat: 55.75,
      originLon: 37.62,
      targetLat: 50.45,
      targetLon: 30.52,
      status: 'active',
      timeAgo: '5m ago',
      speed: 25000,
      altitude: 1200,
    },
    {
      id: 'M-003',
      type: 'SRBM',
      origin: 'Tehran, IR',
      target: 'Tel Aviv, IL',
      originLat: 35.69,
      originLon: 51.39,
      targetLat: 32.09,
      targetLon: 34.78,
      status: 'intercepted',
      timeAgo: '12m ago',
      speed: 8000,
      altitude: 80,
    },
    {
      id: 'M-004',
      type: 'CRUISE',
      origin: 'Sanaa, YE',
      target: 'Riyadh, SA',
      originLat: 15.37,
      originLon: 44.19,
      targetLat: 24.71,
      targetLon: 46.68,
      status: 'active',
      timeAgo: '18m ago',
      speed: 900,
      altitude: 0.05,
    },
    {
      id: 'M-005',
      type: 'MRBM',
      origin: 'Beijing, CN',
      target: 'Taipei, TW',
      originLat: 39.90,
      originLon: 116.41,
      targetLat: 25.03,
      targetLon: 121.56,
      status: 'landed',
      timeAgo: '34m ago',
      speed: 15000,
      altitude: 300,
    },
  ];
  return data;
}

function generateMockAlerts(): AlertEvent[] {
  return [
    { id: 'A-001', severity: 'CRITICAL', title: 'Iran launches ballistic missiles at Israeli targets', region: 'Middle East', timeAgo: '3m ago', category: 'MISSILE' },
    { id: 'A-002', severity: 'CRITICAL', title: 'North Korea fires hypersonic missile toward Sea of Japan', region: 'East Asia', timeAgo: '8m ago', category: 'MISSILE' },
    { id: 'A-003', severity: 'HIGH', title: 'Russian ICBM test detected over Arctic', region: 'Arctic', timeAgo: '15m ago', category: 'TEST' },
    { id: 'A-004', severity: 'HIGH', title: 'Houthi cruise missile intercepted over Red Sea', region: 'Red Sea', timeAgo: '22m ago', category: 'INTERCEPT' },
    { id: 'A-005', severity: 'MEDIUM', title: 'Chinese naval exercise in Taiwan Strait', region: 'Taiwan Strait', timeAgo: '41m ago', category: 'NAVAL' },
    { id: 'A-006', severity: 'CRITICAL', title: 'Multiple explosions reported near Damascus military base', region: 'Syria', timeAgo: '1h ago', category: 'AIRSTRIKE' },
    { id: 'A-007', severity: 'HIGH', title: 'US deploys THAAD batteries to Guam', region: 'Pacific', timeAgo: '1h ago', category: 'DEPLOYMENT' },
    { id: 'A-008', severity: 'MEDIUM', title: 'Ukrainian drone strike on Russian ammo depot', region: 'Ukraine', timeAgo: '2h ago', category: 'DRONE' },
  ];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-accent-red';
    case 'intercepted': return 'bg-green-500';
    case 'landed': return 'bg-gray-500';
    default: return 'bg-accent-orange';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'active': return 'IN FLIGHT';
    case 'intercepted': return 'INTERCEPTED';
    case 'landed': return 'IMPACTED';
    default: return 'UNKNOWN';
  }
}

function getSeverityColor(sev: string) {
  switch (sev) {
    case 'CRITICAL': return 'text-accent-red border-accent-red/40 bg-accent-red/10';
    case 'HIGH': return 'text-accent-orange border-accent-orange/40 bg-accent-orange/10';
    case 'MEDIUM': return 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10';
    default: return 'text-text-dim border-border-subtle bg-elevated/50';
  }
}

export default function WarRoom({ signals, conflicts = [] }: WarRoomProps) {
  const [activeTheater, setActiveTheater] = useState('global');
  const [time, setTime] = useState(new Date());
  const [missiles, setMissiles] = useState<MissileEvent[]>(generateMockMissiles());
  const [alerts, setAlerts] = useState<AlertEvent[]>(generateMockAlerts());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate mock data every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setMissiles(generateMockMissiles());
      setAlerts(generateMockAlerts());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const utcTime = time.toISOString().substring(11, 19);
  const utcDate = time.toISOString().substring(0, 10);

  const activeCount = missiles.filter(m => m.status === 'active').length;
  const interceptedCount = missiles.filter(m => m.status === 'intercepted').length;

  return (
    <div className="h-full flex flex-col bg-void">
      {/* War Room Header */}
      <div className="bg-elevated/80 border-b border-accent-red/30 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-red/20 flex items-center justify-center border border-accent-red/40">
              <span className="text-2xl">⚔️</span>
            </div>
            <div>
              <h2 className="font-mono text-[13px] font-bold tracking-wider text-accent-red">
                WAR ROOM
              </h2>
              <p className="text-[9px] text-text-muted">
                GLOBAL CONFLICT TRACKING • {conflicts.length} ACTIVE EVENTS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {THEATERS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTheater(t.id)}
                className={`px-3 py-1.5 rounded text-[9px] font-mono transition-all ${
                  activeTheater === t.id
                    ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
                    : 'text-text-dim hover:text-white hover:bg-white/5'
                }`}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-mono text-lg text-white">{utcTime}</div>
              <div className="font-mono text-[9px] text-text-muted">{utcDate} UTC</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-red/10 rounded border border-accent-red/30">
              <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
              <span className="font-mono text-[10px] text-accent-red font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Active Missiles + Alert Feed */}
        <aside className="w-[320px] border-r border-border-default overflow-hidden flex flex-col">
          {/* Active Missiles */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-accent-red">
                🚀 ACTIVE MISSILES
              </span>
              <span className="text-[9px] text-text-dim">{activeCount} IN FLIGHT / {interceptedCount} INTERCEPTED</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {missiles.map(m => (
                <div key={m.id} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 ${getStatusColor(m.status)} ${m.status === 'active' ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white">{m.type}</span>
                        <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${m.status === 'active' ? 'bg-accent-red/20 text-accent-red' : m.status === 'intercepted' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {getStatusText(m.status)}
                        </span>
                      </div>
                      <div className="text-[9px] text-text-muted mt-0.5">
                        {m.origin} → {m.target}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] text-text-dim">{m.speed.toLocaleString()} km/h</span>
                        <span className="text-[8px] text-text-dim">{m.altitude} km alt</span>
                        <span className="text-[8px] text-text-dim">{m.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Feed */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-border-default">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-accent-orange">
                ⚠️ ALERT FEED
              </span>
              <span className="text-[9px] text-text-dim">{alerts.length} ALERTS</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {alerts.map(a => (
                <div key={a.id} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="flex items-start gap-2">
                    <div className={`text-[8px] font-mono px-1 py-0.5 rounded border ${getSeverityColor(a.severity)}`}>
                      {a.severity}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white leading-tight">{a.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-text-dim">{a.region}</span>
                        <span className="text-[8px] text-text-dim">{a.category}</span>
                        <span className="text-[8px] text-text-dim">{a.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - War Room Map */}
        <section className="flex-1 overflow-hidden relative">
          {/* Map Toolbar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="bg-black/70 backdrop-blur rounded border border-white/10 px-2 py-1">
              <span className="text-[10px] font-mono text-white/70">🌍 World Monitor</span>
            </div>
          </div>

          {/* Time filters */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
            {['1h', '6h', '24h', '48h', '7d', 'All'].map(t => (
              <button
                key={t}
                className="px-2 py-1 text-[9px] font-mono bg-black/70 backdrop-blur rounded border border-white/10 text-text-dim hover:text-white hover:bg-white/5 transition-all"
              >
                {t}
              </button>
            ))}
          </div>

          <Globe />
        </section>

        {/* Right Panel - Hotspots + Stats + Signals */}
        <aside className="w-[280px] border-l border-border-default overflow-y-auto p-2 space-y-2">
          {/* Active Hotspots */}
          <div className="glass-panel">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[10px] font-bold text-accent-red">🔥 ACTIVE HOTSPOTS</span>
            </div>
            <div className="p-2 space-y-1">
              {ACTIVE_CONFLICTS.map(c => (
                <div key={c.name} className="flex items-center justify-between px-2 py-1.5 bg-elevated/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.intensity === 'high' ? 'bg-accent-red animate-pulse' : 'bg-accent-orange'}`} />
                    <span className="text-[10px] text-white">{c.name}</span>
                  </div>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${c.intensity === 'high' ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-orange/20 text-accent-orange'}`}>
                    {c.intensity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict Stats */}
          <div className="glass-panel">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[10px] font-bold text-white">📊 CONFLICT STATS</span>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted">Active Wars</span>
                <span className="text-[12px] font-mono text-accent-red font-bold">{ACTIVE_CONFLICTS.filter(c => c.type === 'war' || c.type === 'civil war').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted">Insurgencies</span>
                <span className="text-[12px] font-mono text-accent-orange font-bold">{ACTIVE_CONFLICTS.filter(c => c.type === 'insurgency').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted">High Intensity</span>
                <span className="text-[12px] font-mono text-accent-red font-bold">{ACTIVE_CONFLICTS.filter(c => c.intensity === 'high').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-text-muted">Today's Events</span>
                <span className="text-[12px] font-mono text-white font-bold">{conflicts.length}</span>
              </div>
            </div>
          </div>

          {/* Critical Signals */}
          <div className="glass-panel">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[10px] font-bold text-accent-red">⚠️ CRITICAL SIGNALS</span>
            </div>
            <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
              {signals.filter(s => s.severity === 'CRITICAL' || s.severity === 'HIGH').slice(0, 5).map(s => (
                <div key={s.id} className="px-2 py-1.5 bg-elevated/50 rounded">
                  <div className="text-[9px] text-white leading-tight">{s.title.substring(0, 60)}...</div>
                  <div className="text-[8px] text-text-dim mt-0.5">{s.source} • {s.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
