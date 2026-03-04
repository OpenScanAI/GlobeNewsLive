'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface FireEvent {
  id: string;
  lat: number;
  lon: number;
  brightness: number; // Kelvin
  frp: number; // Fire Radiative Power (MW)
  confidence: 'low' | 'nominal' | 'high';
  region: string;
  country: string;
  biome: string;
  timestamp: string;
  satellite: 'MODIS' | 'VIIRS' | 'GOES';
  area?: number; // km²
}

// Static fire data (NASA FIRMS would be fetched in production)
const FIRE_DATA: FireEvent[] = [
  { id: 'f1', lat: -14.2, lon: -56.3, brightness: 345, frp: 142, confidence: 'high', region: 'Amazon', country: 'Brazil', biome: 'Tropical Forest', timestamp: '2024-09-15T14:30:00Z', satellite: 'VIIRS', area: 2400 },
  { id: 'f2', lat: -12.8, lon: -55.1, brightness: 312, frp: 98, confidence: 'high', region: 'Amazon', country: 'Brazil', biome: 'Tropical Forest', timestamp: '2024-09-15T15:00:00Z', satellite: 'MODIS', area: 1800 },
  { id: 'f3', lat: 62.3, lon: 130.5, brightness: 298, frp: 210, confidence: 'high', region: 'Siberia', country: 'Russia', biome: 'Boreal Forest', timestamp: '2024-09-15T08:00:00Z', satellite: 'VIIRS', area: 45000 },
  { id: 'f4', lat: 65.1, lon: 125.8, brightness: 320, frp: 185, confidence: 'high', region: 'Siberia', country: 'Russia', biome: 'Boreal Forest', timestamp: '2024-09-15T07:30:00Z', satellite: 'MODIS', area: 38000 },
  { id: 'f5', lat: 38.8, lon: 23.5, brightness: 267, frp: 45, confidence: 'nominal', region: 'Mediterranean', country: 'Greece', biome: 'Mediterranean Scrub', timestamp: '2024-09-15T13:00:00Z', satellite: 'GOES', area: 120 },
  { id: 'f6', lat: -24.5, lon: 26.8, brightness: 289, frp: 76, confidence: 'high', region: 'Southern Africa', country: 'Botswana', biome: 'Savanna', timestamp: '2024-09-15T11:00:00Z', satellite: 'VIIRS', area: 890 },
  { id: 'f7', lat: -20.1, lon: 29.3, brightness: 301, frp: 88, confidence: 'high', region: 'Southern Africa', country: 'Zimbabwe', biome: 'Savanna', timestamp: '2024-09-15T12:00:00Z', satellite: 'MODIS', area: 1200 },
  { id: 'f8', lat: 14.5, lon: -12.3, brightness: 278, frp: 34, confidence: 'nominal', region: 'West Africa', country: 'Guinea', biome: 'Tropical Forest', timestamp: '2024-09-15T14:00:00Z', satellite: 'VIIRS', area: 450 },
  { id: 'f9', lat: 40.2, lon: -3.8, brightness: 255, frp: 18, confidence: 'low', region: 'Iberian Peninsula', country: 'Spain', biome: 'Mediterranean', timestamp: '2024-09-15T16:00:00Z', satellite: 'GOES', area: 85 },
  { id: 'f10', lat: -33.8, lon: 151.1, brightness: 290, frp: 55, confidence: 'nominal', region: 'Australia', country: 'Australia', biome: 'Eucalyptus Forest', timestamp: '2024-09-15T04:00:00Z', satellite: 'MODIS', area: 620 },
  { id: 'f11', lat: -25.3, lon: 148.9, brightness: 315, frp: 112, confidence: 'high', region: 'Australia', country: 'Australia', biome: 'Grassland', timestamp: '2024-09-15T03:00:00Z', satellite: 'VIIRS', area: 2100 },
  { id: 'f12', lat: 36.8, lon: 35.5, brightness: 270, frp: 29, confidence: 'nominal', region: 'Turkey', country: 'Turkey', biome: 'Mixed Forest', timestamp: '2024-09-15T12:30:00Z', satellite: 'GOES', area: 190 },
  { id: 'f13', lat: 55.2, lon: -116.8, brightness: 340, frp: 195, confidence: 'high', region: 'Western Canada', country: 'Canada', biome: 'Boreal Forest', timestamp: '2024-09-15T19:00:00Z', satellite: 'VIIRS', area: 18000 },
  { id: 'f14', lat: 38.5, lon: -119.2, brightness: 325, frp: 168, confidence: 'high', region: 'California', country: 'USA', biome: 'Chaparral', timestamp: '2024-09-15T20:00:00Z', satellite: 'GOES', area: 5400 },
  { id: 'f15', lat: -3.5, lon: 117.8, brightness: 285, frp: 62, confidence: 'nominal', region: 'Borneo', country: 'Indonesia', biome: 'Peatland', timestamp: '2024-09-15T06:00:00Z', satellite: 'MODIS', area: 780 },
];

const CONFIDENCE_CONFIG = {
  high: { color: '#ff2244', label: 'HIGH' },
  nominal: { color: '#ff8800', label: 'MEDIUM' },
  low: { color: '#ffcc00', label: 'LOW' },
};

const SATELLITE_ICONS: Record<string, string> = { MODIS: '🛰️', VIIRS: '🔭', GOES: '🌐' };

function formatFRP(frp: number) {
  if (frp >= 100) return `${frp.toFixed(0)}MW ⚡`;
  return `${frp.toFixed(0)}MW`;
}

// Heat intensity bar
function IntensityBar({ frp, max }: { frp: number; max: number }) {
  const pct = Math.min((frp / max) * 100, 100);
  const color = frp >= 150 ? '#ff2244' : frp >= 75 ? '#ff8800' : '#ffcc00';
  return (
    <div className="h-1 bg-white/10 rounded overflow-hidden">
      <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function SatelliteFiresPanel() {
  const [filter, setFilter] = useState<'all' | 'high' | 'nominal'>('all');
  const [sortBy, setSortBy] = useState<'frp' | 'time' | 'area'>('frp');
  const [animFrame, setAnimFrame] = useState(0);

  // Animate fire pulse
  useEffect(() => {
    const t = setInterval(() => setAnimFrame(f => (f + 1) % 3), 800);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    let data = filter === 'all' ? FIRE_DATA : FIRE_DATA.filter(f => f.confidence === filter);
    if (sortBy === 'frp') data = [...data].sort((a, b) => b.frp - a.frp);
    else if (sortBy === 'area') data = [...data].sort((a, b) => (b.area || 0) - (a.area || 0));
    else data = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return data;
  }, [filter, sortBy]);

  const maxFRP = Math.max(...FIRE_DATA.map(f => f.frp));
  const totalFRP = FIRE_DATA.reduce((s, f) => s + f.frp, 0);
  const highCount = FIRE_DATA.filter(f => f.confidence === 'high').length;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-base transition-opacity`} style={{ opacity: animFrame === 1 ? 0.6 : 1 }}>🔥</span>
          <span className="text-[11px] font-mono font-bold text-[#ff6644] uppercase tracking-wider">Satellite Fires</span>
          <span className="text-[9px] font-mono px-1 rounded bg-[#ff2244]/15 text-[#ff2244]">
            {highCount} HIGH
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#ff8800]">
          Σ {totalFRP.toFixed(0)}MW FRP
        </span>
      </div>

      {/* Stats row */}
      <div className="px-3 py-1.5 border-b border-white/5 flex gap-4 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">🛰️</span>
          <span className="text-[9px] font-mono text-white/50">MODIS · VIIRS · GOES</span>
        </div>
        <div className="ml-auto text-[9px] font-mono text-white/30">
          {FIRE_DATA.length} DETECTIONS
        </div>
      </div>

      {/* Controls */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex gap-1">
          {(['all', 'high', 'nominal'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all ${
                filter === f ? 'bg-[#ff6644]/20 text-[#ff6644] border border-[#ff6644]/30' : 'text-white/30 hover:text-white/60'
              }`}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['frp', 'area', 'time'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all ${
                sortBy === s ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/50'
              }`}>
              ↕{s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Fire list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(fire => {
          const conf = CONFIDENCE_CONFIG[fire.confidence];
          const hoursAgo = Math.floor((Date.now() - new Date(fire.timestamp).getTime()) / 3600000);
          return (
            <div key={fire.id} className="px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-all">
              <div className="flex items-start gap-2">
                {/* Intensity indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  <span style={{ opacity: animFrame === (parseInt(fire.id.replace('f', '')) % 3) ? 0.5 : 1 }}>
                    {SATELLITE_ICONS[fire.satellite]}
                  </span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold text-white/90 truncate">{fire.region}</span>
                    <span className="text-[9px] font-mono flex-shrink-0 ml-1" style={{ color: conf.color }}>
                      ● {conf.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-white/35 font-mono">{fire.country} · {fire.biome}</span>
                    <span className="text-[9px] text-white/25 font-mono">{hoursAgo}h ago</span>
                  </div>
                  <div className="mt-1">
                    <IntensityBar frp={fire.frp} max={maxFRP} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-mono text-[#ff8800]">{formatFRP(fire.frp)}</span>
                    {fire.area && (
                      <span className="text-[9px] font-mono text-white/40">{fire.area >= 1000 ? `${(fire.area/1000).toFixed(1)}K km²` : `${fire.area} km²`}</span>
                    )}
                    <span className="text-[9px] font-mono text-white/25">{fire.brightness}K</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/25 font-mono">NASA FIRMS</span>
        <span className="text-[9px] text-white/25 font-mono">FRP = Fire Radiative Power</span>
      </div>
    </div>
  );
}
