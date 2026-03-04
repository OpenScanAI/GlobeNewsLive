'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Signal } from '@/types';
import { ACTIVE_CONFLICTS } from '@/lib/feeds';

// Dynamic import for Globe3D (uses Three.js which needs client-side only)
const Globe3D = dynamic(
  () => import('./Globe3D').catch(() => {
    // Return a fallback component if import fails
    return { 
      default: () => (
        <div className="h-full flex items-center justify-center bg-void">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-[12px] text-white mb-1">3D Globe Unavailable</div>
            <div className="text-[9px] text-gray-400">Could not load 3D components</div>
          </div>
        </div>
      )
    };
  }), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-2">🌍</div>
          <div className="text-[10px] text-text-muted font-mono">Loading 3D Globe...</div>
        </div>
      </div>
    )
  }
);

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

interface WarRoomProps {
  signals: Signal[];
  conflicts?: ConflictEvent[];
}

// Theater selector
const THEATERS = [
  { id: 'global', name: 'GLOBAL', icon: '🌍', lat: 20, lon: 20, zoom: 2 },
  { id: 'ukraine', name: 'UKRAINE', icon: '🇺🇦', lat: 48.5, lon: 37.5, zoom: 6 },
  { id: 'middleeast', name: 'MIDDLE EAST', icon: '🕌', lat: 31, lon: 40, zoom: 5 },
  { id: 'africa', name: 'SAHEL/SUDAN', icon: '🌍', lat: 12, lon: 20, zoom: 4 },
  { id: 'asia', name: 'ASIA-PACIFIC', icon: '🌏', lat: 20, lon: 115, zoom: 4 },
];

export default function WarRoom({ signals, conflicts = [] }: WarRoomProps) {
  const [activeTheater, setActiveTheater] = useState('global');
  const [viewMode, setViewMode] = useState<'globe' | 'tactical'>('globe');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcTime = time.toISOString().substring(11, 19);
  const utcDate = time.toISOString().substring(0, 10);

  // Filter conflicts by theater
  const theaterConflicts = activeTheater === 'global' 
    ? conflicts 
    : conflicts.filter(c => {
        if (activeTheater === 'ukraine') return c.country === 'Ukraine';
        if (activeTheater === 'middleeast') return ['Palestine', 'Lebanon', 'Syria', 'Yemen', 'Iran', 'Israel'].includes(c.country);
        if (activeTheater === 'africa') return ['Sudan', 'Mali', 'Niger', 'Burkina Faso', 'Somalia', 'Ethiopia'].includes(c.country);
        if (activeTheater === 'asia') return ['Myanmar', 'China', 'Taiwan', 'Philippines'].includes(c.country);
        return true;
      });

  return (
    <div className="h-full flex flex-col bg-void">
      {/* War Room Header */}
      <div className="bg-elevated/80 border-b border-accent-red/30 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Title */}
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

          {/* Theater Selector */}
          <div className="flex items-center gap-1">
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

          {/* Time Display */}
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
        {/* Left Panel - Conflict Feed */}
        <aside className="w-[300px] border-r border-border-default overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-accent-red">
                CONFLICT EVENTS
              </span>
              <span className="text-[9px] text-text-dim">{theaterConflicts.length} events</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {theaterConflicts.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-[10px]">
                No events in this theater
              </div>
            ) : (
              theaterConflicts.map(c => (
                <div key={c.id} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      c.event_type.includes('Battles') ? 'bg-accent-red' : 'bg-accent-orange'
                    }`} />
                    <div className="flex-1">
                      <div className="text-[10px] text-white">{c.location}, {c.country}</div>
                      <div className="text-[9px] text-text-muted">{c.event_type}</div>
                      <div className="text-[8px] text-text-dim mt-1">
                        {c.actor1} {c.actor2 ? `vs ${c.actor2}` : ''}
                      </div>
                      <div className="text-[8px] text-text-dim mt-0.5">
                        {c.notes.substring(0, 80)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center - 3D Globe */}
        <section className="flex-1 overflow-hidden">
          <Globe3D signals={signals} autoRotate={activeTheater === 'global'} />
        </section>

        {/* Right Panel - Active Conflicts Summary */}
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
