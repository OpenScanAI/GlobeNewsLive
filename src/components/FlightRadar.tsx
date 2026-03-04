'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Plane, ChevronDown, ChevronUp, Radio, Target, Crosshair, AlertTriangle, Map, List, RefreshCw, Filter } from 'lucide-react';

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
  { id: 'global', name: 'GLOBAL', icon: '🌍', bounds: 'All regions' },
  { id: 'middleeast', name: 'MIDDLE EAST', icon: '🕌', bounds: 'Iran, Israel, Gulf' },
  { id: 'ukraine', name: 'UKRAINE', icon: '🇺🇦', bounds: 'Eastern Europe' },
  { id: 'europe', name: 'EUROPE', icon: '🇪🇺', bounds: 'NATO airspace' },
  { id: 'taiwan', name: 'TAIWAN', icon: '🇹🇼', bounds: 'Taiwan Strait' },
  { id: 'iran', name: 'IRAN', icon: '🇮🇷', bounds: 'Persian Gulf' },
  { id: 'redsea', name: 'RED SEA', icon: '🚢', bounds: 'Bab-el-Mandeb' },
  { id: 'korea', name: 'KOREA', icon: '🇰🇷', bounds: 'Korean Peninsula' },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string; priority: number }> = {
  surveillance: { icon: '🔍', color: 'text-purple-400 bg-purple-500/20', label: 'ISR/SIGINT', priority: 1 },
  drone: { icon: '🤖', color: 'text-yellow-400 bg-yellow-500/20', label: 'UAV', priority: 2 },
  tanker: { icon: '⛽', color: 'text-blue-400 bg-blue-500/20', label: 'Tanker', priority: 3 },
  fighter: { icon: '✈️', color: 'text-red-400 bg-red-500/20', label: 'Fighter', priority: 4 },
  transport: { icon: '🚀', color: 'text-cyan-400 bg-cyan-500/20', label: 'Transport', priority: 5 },
  military: { icon: '🎖️', color: 'text-orange-400 bg-orange-500/20', label: 'Military', priority: 6 },
  civilian: { icon: '✈️', color: 'text-gray-400 bg-gray-500/20', label: 'Civil', priority: 7 },
};

const CRITICAL_CALLSIGNS = ['FORTE', 'HOMER', 'GORDO', 'OLIVE', 'NCHO', 'DOOM', 'DEATH', 'GHOST', 'REAPER', 'BALL'];
const EMERGENCY_SQUAWKS = ['7500', '7600', '7700'];

export default function FlightRadar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [region, setRegion] = useState('middleeast');
  const [showAll, setShowAll] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data, isLoading, error, mutate, isValidating } = useSWR<{
    flights: Aircraft[];
    aircraft: Aircraft[];
    timestamp: number;
    total: number;
    military: number;
    categories: Record<string, number>;
    simulated?: boolean;
  }>(
    `/api/flights?region=${region}&military=${!showAll}`,
    fetcher,
    { 
      refreshInterval: 10000, // 10 second refresh for real-time tracking
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const aircraft = data?.flights || data?.aircraft || [];
  
  // Filter by type
  const filteredAircraft = typeFilter 
    ? aircraft.filter(a => a.type === typeFilter)
    : aircraft;
  
  // Critical aircraft (ISR assets)
  const criticalAircraft = aircraft.filter(a => 
    CRITICAL_CALLSIGNS.some(cs => a.callsign.toUpperCase().startsWith(cs))
  );
  
  // Emergency squawks
  const emergencyAircraft = aircraft.filter(a => 
    a.squawk && EMERGENCY_SQUAWKS.includes(a.squawk)
  );

  // Stats by type
  const typeStats = Object.entries(data?.categories || {})
    .filter(([type, count]) => count > 0 && type !== 'civilian')
    .sort((a, b) => (TYPE_CONFIG[a[0]]?.priority || 99) - (TYPE_CONFIG[b[0]]?.priority || 99));

  const selectedRegion = REGIONS.find(r => r.id === region);

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-gradient-to-r from-cyan-500/10 to-transparent hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-400">
            FLIGHT RADAR
          </span>
          {data && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">
              {data.military} MIL
            </span>
          )}
          {/* Real-time indicator */}
          <span className={`flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded font-mono ${
            isValidating ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isValidating ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            {isValidating ? 'LIVE' : '10s'}
          </span>
          {data?.simulated && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-mono">
              SIM
            </span>
          )}
          {criticalAircraft.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono animate-pulse">
              {criticalAircraft.length} ISR
            </span>
          )}
          {emergencyAircraft.length > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono animate-pulse">
              ⚠️ EMERGENCY
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); mutate(); }}
            className="p-1 rounded hover:bg-white/10 text-text-dim hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-0">
          {/* Region Selector */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border-subtle bg-black/20">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setRegion(r.id)}
                className={`flex-shrink-0 px-3 py-2 text-[9px] font-mono border-b-2 transition-all ${
                  region === r.id
                    ? 'border-cyan-400 text-white bg-cyan-500/10'
                    : 'border-transparent text-text-dim hover:text-white hover:bg-white/5'
                }`}
                title={r.bounds}
              >
                <span className="mr-1">{r.icon}</span>
                <span className="hidden sm:inline">{r.name}</span>
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border-subtle bg-black/20">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAll(!showAll)}
                className={`px-2 py-1 rounded text-[9px] font-mono ${
                  showAll ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'
                }`}
              >
                {showAll ? '🌐 ALL' : '🎖️ MIL'}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}
                className="px-2 py-1 rounded text-[9px] font-mono text-text-dim hover:text-white"
              >
                {viewMode === 'list' ? <List className="w-3 h-3" /> : <Target className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[9px] text-text-dim font-mono">
              {selectedRegion?.icon} {data?.total || 0} aircraft • {data?.military || 0} military
            </div>
          </div>

          {/* Type Filter Pills */}
          {typeStats.length > 0 && (
            <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-border-subtle">
              <button
                onClick={() => setTypeFilter(null)}
                className={`px-2 py-0.5 rounded text-[8px] font-mono ${
                  !typeFilter ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'
                }`}
              >
                ALL
              </button>
              {typeStats.map(([type, count]) => {
                const config = TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    className={`px-2 py-0.5 rounded text-[8px] font-mono flex items-center gap-1 ${
                      typeFilter === type ? config.color : 'text-text-dim hover:text-white'
                    }`}
                  >
                    {config.icon} {count}
                  </button>
                );
              })}
            </div>
          )}

          {/* Critical ISR Alert */}
          {criticalAircraft.length > 0 && (
            <div className="mx-2 my-2 p-2 bg-purple-500/10 rounded border border-purple-500/30">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
                <span className="text-[9px] font-mono text-purple-400 font-bold">CRITICAL ISR ASSETS ACTIVE</span>
              </div>
              <div className="space-y-1">
                {criticalAircraft.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center justify-between text-[9px]">
                    <span className="text-purple-300 font-mono font-bold">{a.callsign}</span>
                    <span className="text-text-dim">
                      FL{Math.round(a.altitude / 100)} • {a.speed}kts • {a.heading}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Alert */}
          {emergencyAircraft.length > 0 && (
            <div className="mx-2 my-2 p-2 bg-red-500/10 rounded border border-red-500/30 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-[9px] font-mono text-red-400 font-bold">
                  EMERGENCY SQUAWK DETECTED
                </span>
              </div>
              {emergencyAircraft.map(a => (
                <div key={a.id} className="text-[9px] text-red-300 mt-1">
                  {a.callsign} — Squawk {a.squawk}
                  {a.squawk === '7700' && ' (MAYDAY)'}
                  {a.squawk === '7600' && ' (RADIO FAILURE)'}
                  {a.squawk === '7500' && ' (HIJACK)'}
                </div>
              ))}
            </div>
          )}

          {/* Aircraft List */}
          {viewMode === 'list' ? (
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading && aircraft.length === 0 ? (
                <div className="text-center py-8">
                  <Plane className="w-8 h-8 text-cyan-400 animate-bounce mx-auto mb-2" />
                  <div className="text-[10px] text-text-muted">Scanning airspace...</div>
                </div>
              ) : filteredAircraft.length === 0 ? (
                <div className="text-center py-8 text-[10px] text-text-muted">
                  No {typeFilter || 'military'} aircraft in {selectedRegion?.name}
                </div>
              ) : (
                filteredAircraft.slice(0, 25).map(a => {
                  const config = TYPE_CONFIG[a.type] || TYPE_CONFIG.military;
                  const isCritical = CRITICAL_CALLSIGNS.some(cs => a.callsign.toUpperCase().startsWith(cs));
                  const isEmergency = a.squawk && EMERGENCY_SQUAWKS.includes(a.squawk);
                  
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAircraft(selectedAircraft === a.id ? null : a.id)}
                      className={`w-full text-left px-3 py-2 border-b border-border-subtle transition-all ${
                        selectedAircraft === a.id 
                          ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                          : isEmergency
                          ? 'bg-red-500/10 hover:bg-red-500/20'
                          : isCritical
                          ? 'bg-purple-500/5 hover:bg-purple-500/10'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${config.color}`}>
                            {config.icon}
                          </span>
                          <span className={`font-mono text-[11px] ${isCritical ? 'text-purple-400 font-bold' : 'text-white'}`}>
                            {a.callsign || 'UNKNOWN'}
                          </span>
                          {isCritical && <Radio className="w-3 h-3 text-purple-400 animate-pulse" />}
                          {isEmergency && <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />}
                        </div>
                        <div className="flex items-center gap-3 text-[9px] text-text-dim font-mono">
                          <span>FL{Math.round(a.altitude / 100).toString().padStart(3, '0')}</span>
                          <span>{a.speed}kts</span>
                          <span style={{ transform: `rotate(${a.heading}deg)` }}>↑</span>
                        </div>
                      </div>
                      
                      {selectedAircraft === a.id && (
                        <div className="mt-2 pt-2 border-t border-border-subtle grid grid-cols-2 gap-2 text-[9px]">
                          <div>
                            <span className="text-text-dim">Country:</span>
                            <span className="text-white ml-1">{a.country}</span>
                          </div>
                          <div>
                            <span className="text-text-dim">Type:</span>
                            <span className={`ml-1 ${config.color.split(' ')[0]}`}>{config.label}</span>
                          </div>
                          <div>
                            <span className="text-text-dim">Altitude:</span>
                            <span className="text-white ml-1">{a.altitude.toLocaleString()} ft</span>
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
                              {a.verticalRate > 0 ? '↑' : a.verticalRate < 0 ? '↓' : '—'} {Math.abs(a.verticalRate)} fpm
                            </span>
                          </div>
                          <div>
                            <span className="text-text-dim">Squawk:</span>
                            <span className={`ml-1 font-mono ${isEmergency ? 'text-red-400 font-bold' : 'text-white'}`}>
                              {a.squawk || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-dim">Position:</span>
                            <span className="text-white ml-1">{a.lat.toFixed(3)}°, {a.lon.toFixed(3)}°</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            /* Stats View */
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {typeStats.map(([type, count]) => {
                  const config = TYPE_CONFIG[type];
                  return (
                    <div key={type} className={`p-2 rounded ${config.color}`}>
                      <div className="text-lg">{config.icon}</div>
                      <div className="text-[18px] font-bold text-white">{count}</div>
                      <div className="text-[9px] text-text-muted">{config.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center text-[9px] text-text-dim">
                Total: {data?.total || 0} aircraft in {selectedRegion?.name}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-1 text-[8px] text-text-dim">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live • 15s refresh
            </div>
            <div className="text-[8px] text-text-dim">
              Data: OpenSky Network
              {data?.simulated && <span className="text-yellow-400 ml-1">• DEMO</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
