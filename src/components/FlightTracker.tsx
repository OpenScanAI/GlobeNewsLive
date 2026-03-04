'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { ChevronDown, ChevronUp, Plane, Radio, Target, Crosshair, Fuel, Zap } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Aircraft {
  id: string;
  callsign: string;
  country: string;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  heading: number;
  verticalRate: number;
  squawk: string | null;
  type: 'military' | 'surveillance' | 'tanker' | 'transport' | 'fighter' | 'drone' | 'civilian';
  category: string;
  isMilitary: boolean;
}

const REGIONS = [
  { id: 'global', name: 'GLOBAL', icon: '🌍' },
  { id: 'middleeast', name: 'MIDDLE EAST', icon: '🕌' },
  { id: 'ukraine', name: 'UKRAINE', icon: '🇺🇦' },
  { id: 'europe', name: 'EUROPE', icon: '🇪🇺' },
  { id: 'taiwan', name: 'TAIWAN', icon: '🇹🇼' },
  { id: 'iran', name: 'IRAN', icon: '🇮🇷' },
  { id: 'redsea', name: 'RED SEA', icon: '🚢' },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  surveillance: { icon: '🔍', color: 'text-purple-400' },
  tanker: { icon: '⛽', color: 'text-blue-400' },
  transport: { icon: '🚀', color: 'text-cyan-400' },
  fighter: { icon: '✈️', color: 'text-red-400' },
  drone: { icon: '🤖', color: 'text-yellow-400' },
  military: { icon: '🎖️', color: 'text-orange-400' },
  civilian: { icon: '✈️', color: 'text-gray-400' },
};

const CRITICAL_CALLSIGNS = ['FORTE', 'HOMER', 'GORDO', 'NCHO', 'DOOM', 'DEATH', 'GHOST', 'REAPER', 'PRED'];

export default function FlightTracker() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [region, setRegion] = useState('middleeast');
  const [showAll, setShowAll] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);

  const { data, isLoading, error } = useSWR<{
    aircraft: Aircraft[];
    timestamp: number;
    total: number;
    military: number;
    categories: Record<string, number>;
    simulated?: boolean;
  }>(
    `/api/flights?region=${region}&military=${!showAll}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const aircraft = data?.aircraft || [];
  const criticalAircraft = aircraft.filter(a => 
    CRITICAL_CALLSIGNS.some(cs => a.callsign.toUpperCase().startsWith(cs))
  );

  return (
    <div className="glass-panel">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✈️</span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-400">
            FLIGHT RADAR
          </span>
          {data && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
              {data.military} MIL
            </span>
          )}
          {criticalAircraft.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono animate-pulse">
              {criticalAircraft.length} ISR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {data?.simulated && (
            <span className="text-[8px] text-yellow-400">DEMO</span>
          )}
          {isExpanded ? <ChevronUp size={14} className="text-text-dim" /> : <ChevronDown size={14} className="text-text-dim" />}
        </div>
      </button>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Region Selector */}
          <div className="flex flex-wrap gap-1">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
                  region === r.id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-text-dim hover:text-white hover:bg-white/5'
                }`}
              >
                {r.icon} {r.name}
              </button>
            ))}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-[9px] font-mono px-2 py-1 rounded ${
                showAll ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'
              }`}
            >
              {showAll ? '🌐 ALL TRAFFIC' : '🎖️ MILITARY ONLY'}
            </button>
            <div className="text-[9px] text-text-dim font-mono">
              {data?.total || 0} total • {data?.military || 0} mil
            </div>
          </div>

          {/* Category Stats */}
          {data?.categories && (
            <div className="flex flex-wrap gap-2 text-[8px]">
              {Object.entries(data.categories).map(([type, count]) => {
                if (count === 0 || type === 'civilian') return null;
                const typeInfo = TYPE_ICONS[type] || TYPE_ICONS.military;
                return (
                  <span key={type} className={`${typeInfo.color}`}>
                    {typeInfo.icon} {count}
                  </span>
                );
              })}
            </div>
          )}

          {/* Critical Aircraft Alert */}
          {criticalAircraft.length > 0 && (
            <div className="p-2 bg-red-500/10 rounded border border-red-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Radio size={12} className="text-red-400 animate-pulse" />
                <span className="text-[9px] font-mono text-red-400 font-bold">CRITICAL ISR ACTIVE</span>
              </div>
              {criticalAircraft.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center justify-between text-[9px] text-red-300">
                  <span className="font-mono">{a.callsign}</span>
                  <span className="text-text-dim">{a.altitude.toLocaleString()}ft • {a.speed}kts</span>
                </div>
              ))}
            </div>
          )}

          {/* Aircraft List */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin text-2xl">✈️</div>
              <div className="text-[9px] text-text-muted mt-1">Scanning airspace...</div>
            </div>
          ) : aircraft.length === 0 ? (
            <div className="text-center py-4 text-[10px] text-text-muted">
              No aircraft in region
            </div>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {aircraft.slice(0, 20).map(a => {
                const typeInfo = TYPE_ICONS[a.type] || TYPE_ICONS.civilian;
                const isCritical = CRITICAL_CALLSIGNS.some(cs => a.callsign.toUpperCase().startsWith(cs));
                
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAircraft(selectedAircraft === a.id ? null : a.id)}
                    className={`w-full text-left px-2 py-1.5 rounded transition-all ${
                      selectedAircraft === a.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/40'
                        : isCritical
                        ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20'
                        : 'bg-elevated/50 hover:bg-elevated'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={typeInfo.color}>{typeInfo.icon}</span>
                        <span className={`font-mono text-[10px] ${isCritical ? 'text-red-400 font-bold' : 'text-white'}`}>
                          {a.callsign || 'UNKNOWN'}
                        </span>
                        {isCritical && <Radio size={10} className="text-red-400 animate-pulse" />}
                      </div>
                      <span className="text-[8px] text-text-dim font-mono">
                        {a.altitude.toLocaleString()}ft
                      </span>
                    </div>
                    
                    {selectedAircraft === a.id && (
                      <div className="mt-2 pt-2 border-t border-border-subtle space-y-1">
                        <div className="grid grid-cols-2 gap-2 text-[8px]">
                          <div>
                            <span className="text-text-dim">Country:</span>
                            <span className="text-white ml-1">{a.country}</span>
                          </div>
                          <div>
                            <span className="text-text-dim">Speed:</span>
                            <span className="text-white ml-1">{a.speed} kts</span>
                          </div>
                          <div>
                            <span className="text-text-dim">Heading:</span>
                            <span className="text-white ml-1">{a.heading}°</span>
                          </div>
                          <div>
                            <span className="text-text-dim">V/S:</span>
                            <span className={`ml-1 ${a.verticalRate > 0 ? 'text-green-400' : a.verticalRate < 0 ? 'text-red-400' : 'text-white'}`}>
                              {a.verticalRate > 0 ? '+' : ''}{a.verticalRate} fpm
                            </span>
                          </div>
                          <div>
                            <span className="text-text-dim">Squawk:</span>
                            <span className={`ml-1 font-mono ${a.squawk === '7700' || a.squawk === '7600' || a.squawk === '7500' ? 'text-red-400' : 'text-white'}`}>
                              {a.squawk || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-dim">Type:</span>
                            <span className={`ml-1 ${typeInfo.color}`}>{a.category}</span>
                          </div>
                        </div>
                        <div className="text-[8px] text-text-dim">
                          📍 {a.lat.toFixed(4)}°N, {a.lon.toFixed(4)}°E
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
            {Object.entries(TYPE_ICONS).filter(([k]) => k !== 'civilian').map(([type, info]) => (
              <span key={type} className={`text-[8px] ${info.color}`}>
                {info.icon} {type}
              </span>
            ))}
          </div>

          {/* Data Source */}
          <div className="text-[8px] text-text-dim text-center">
            Data: OpenSky Network • Updated every 30s
          </div>
        </div>
      )}
    </div>
  );
}
