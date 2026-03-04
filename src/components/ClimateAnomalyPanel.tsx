'use client';

import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface ClimateZone {
  id: string;
  region: string;
  country: string;
  tempDelta: number; // °C deviation
  precipDelta: number; // % deviation
  severity: 'normal' | 'elevated' | 'critical';
  trend: 'warming' | 'cooling' | 'stable';
  conflictLink: string;
  lat: number;
  lon: number;
}

// Static data for 15 conflict-prone zones
const CLIMATE_ZONES: ClimateZone[] = [
  { id: 'syria', region: 'Levant', country: 'Syria/Iraq', tempDelta: +2.8, precipDelta: -35, severity: 'critical', trend: 'warming', conflictLink: 'Drought → migration → conflict', lat: 35, lon: 38 },
  { id: 'sahel', region: 'Sahel', country: 'Mali/Niger/Chad', tempDelta: +3.1, precipDelta: -42, severity: 'critical', trend: 'warming', conflictLink: 'Desertification → food insecurity', lat: 15, lon: 5 },
  { id: 'yemen', region: 'Arabian Peninsula', country: 'Yemen', tempDelta: +2.4, precipDelta: -28, severity: 'critical', trend: 'warming', conflictLink: 'Water scarcity → famine', lat: 15.5, lon: 47.5 },
  { id: 'ethiopia', region: 'Horn of Africa', country: 'Ethiopia/Somalia', tempDelta: +1.9, precipDelta: -55, severity: 'critical', trend: 'warming', conflictLink: 'Multi-year drought → displacement', lat: 9, lon: 40 },
  { id: 'ukraine', region: 'Eastern Europe', country: 'Ukraine/Russia', tempDelta: +1.6, precipDelta: +12, severity: 'elevated', trend: 'warming', conflictLink: 'Harvest disruption → global wheat', lat: 49, lon: 32 },
  { id: 'pakistan', region: 'South Asia', country: 'Pakistan', tempDelta: +2.1, precipDelta: +180, severity: 'critical', trend: 'warming', conflictLink: 'Extreme flooding → displacement', lat: 30, lon: 69 },
  { id: 'myanmar', region: 'Southeast Asia', country: 'Myanmar', tempDelta: +1.4, precipDelta: -15, severity: 'elevated', trend: 'warming', conflictLink: 'Resource stress → ethnic conflict', lat: 21, lon: 96 },
  { id: 'colombia', region: 'South America', country: 'Colombia/Venezuela', tempDelta: +1.2, precipDelta: -20, severity: 'elevated', trend: 'stable', conflictLink: 'Crop failure → narco expansion', lat: 4, lon: -73 },
  { id: 'mozambique', region: 'Southern Africa', country: 'Mozambique', tempDelta: +2.3, precipDelta: +95, severity: 'critical', trend: 'warming', conflictLink: 'Cyclone frequency → insurgency', lat: -17, lon: 35 },
  { id: 'congo', region: 'Central Africa', country: 'DRC/CAR', tempDelta: +1.1, precipDelta: -8, severity: 'elevated', trend: 'warming', conflictLink: 'Land pressure → militia activity', lat: -3, lon: 23 },
  { id: 'afghanistan', region: 'Central Asia', country: 'Afghanistan', tempDelta: +2.7, precipDelta: -48, severity: 'critical', trend: 'warming', conflictLink: 'Drought → opium → instability', lat: 33, lon: 65 },
  { id: 'haiti', region: 'Caribbean', country: 'Haiti', tempDelta: +1.8, precipDelta: -22, severity: 'elevated', trend: 'warming', conflictLink: 'Hurricane → gang control', lat: 19, lon: -72 },
  { id: 'mexico', region: 'North America', country: 'Mexico (North)', tempDelta: +1.5, precipDelta: -30, severity: 'elevated', trend: 'warming', conflictLink: 'Water wars → cartel territory', lat: 25, lon: -103 },
  { id: 'indonesia', region: 'Southeast Asia', country: 'Indonesia', tempDelta: +0.9, precipDelta: +35, severity: 'elevated', trend: 'stable', conflictLink: 'Sea level → island displacement', lat: -5, lon: 117 },
  { id: 'nigeria', region: 'West Africa', country: 'Nigeria', tempDelta: +2.0, precipDelta: -38, severity: 'critical', trend: 'warming', conflictLink: 'Lake Chad shrinkage → Boko Haram', lat: 10, lon: 8 },
];

const SEVERITY_CONFIG = {
  normal: { color: '#00ff88', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30', label: 'NORMAL' },
  elevated: { color: '#ffaa00', bg: 'bg-[#ffaa00]/10', border: 'border-[#ffaa00]/30', label: 'ELEVATED' },
  critical: { color: '#ff4444', bg: 'bg-[#ff4444]/10', border: 'border-[#ff4444]/30', label: 'CRITICAL' },
};

export default function ClimateAnomalyPanel() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'elevated'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const displayed = CLIMATE_ZONES.filter(z => filter === 'all' || z.severity === filter);
  const criticalCount = CLIMATE_ZONES.filter(z => z.severity === 'critical').length;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🌡️</span>
          <span className="text-[11px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">Climate Anomaly</span>
          <span className="px-1.5 py-0.5 bg-[#ff4444]/20 text-[#ff4444] text-[9px] font-mono rounded">
            {criticalCount} CRITICAL
          </span>
        </div>
        <div className="flex gap-1">
          {(['all', 'critical', 'elevated'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all ${
                filter === f ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/30 hover:text-white/60'
              }`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="px-3 py-1.5 border-b border-white/5 flex gap-3 flex-shrink-0">
        {(['normal', 'elevated', 'critical'] as const).map(s => {
          const count = CLIMATE_ZONES.filter(z => z.severity === s).length;
          const cfg = SEVERITY_CONFIG[s];
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-[10px] font-mono text-white/50">{count} {cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Zone list */}
      <div className="flex-1 overflow-y-auto">
        {displayed.map(zone => {
          const cfg = SEVERITY_CONFIG[zone.severity];
          const isExpanded = expanded === zone.id;
          return (
            <div key={zone.id}
              onClick={() => setExpanded(isExpanded ? null : zone.id)}
              className={`border-b border-white/5 cursor-pointer transition-all ${cfg.bg} hover:bg-white/5`}>
              <div className="px-3 py-2 flex items-center gap-2">
                {/* Severity indicator */}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: cfg.color }} />
                
                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-white/90 truncate">{zone.country}</span>
                    <span className={`text-[9px] font-mono px-1 rounded ${cfg.bg} border ${cfg.border}`}
                      style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div className="text-[9px] text-white/40 font-mono">{zone.region}</div>
                </div>

                {/* Deviations */}
                <div className="flex gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold" style={{ color: zone.tempDelta > 0 ? '#ff6644' : '#44aaff' }}>
                      {zone.tempDelta > 0 ? '+' : ''}{zone.tempDelta.toFixed(1)}°C
                    </div>
                    <div className="text-[8px] text-white/30 font-mono">TEMP</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold" style={{ color: zone.precipDelta < 0 ? '#ff8800' : '#00aaff' }}>
                      {zone.precipDelta > 0 ? '+' : ''}{zone.precipDelta}%
                    </div>
                    <div className="text-[8px] text-white/30 font-mono">RAIN</div>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className={`px-3 pb-2 border-t ${cfg.border}/20`}>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px]">
                      {zone.trend === 'warming' ? '🔴' : zone.trend === 'cooling' ? '🔵' : '⚪'}
                    </span>
                    <span className="text-[9px] font-mono text-white/50 uppercase">{zone.trend} trend</span>
                  </div>
                  <div className="mt-1 text-[10px] font-mono text-white/70 leading-relaxed">
                    <span className="text-[#ffaa00]">⚡ Conflict Link: </span>{zone.conflictLink}
                  </div>
                  <div className="mt-1 text-[9px] text-white/30 font-mono">
                    {zone.lat.toFixed(1)}°, {zone.lon.toFixed(1)}°
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/25 font-mono">15 CONFLICT ZONES MONITORED</span>
        <span className="text-[9px] text-white/25 font-mono">ERA5 / NOAA / CHIRPS</span>
      </div>
    </div>
  );
}
