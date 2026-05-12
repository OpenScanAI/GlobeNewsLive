'use client';
import Globe3DView from './Globe3DView';
import { useMapView } from '@/contexts/MapViewContext';

import { useState, useEffect } from 'react';
import WorldMap from './WorldMap';
import type { Signal } from '@/types';

interface MapFocusViewProps {
  signals: Signal[];
  conflicts: any[];
  earthquakes: any[];
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
  onExit: () => void;
}

const TIME_FILTERS = ['1h', '6h', '24h', '7d', '30d'];

const REGIONS = [
  { id: 'global', label: 'GLOBAL', icon: '🌍' },
  { id: 'mideast', label: 'MIDDLE EAST', icon: '🔥' },
  { id: 'ukraine', label: 'UKRAINE', icon: '🇺🇦' },
  { id: 'asia', label: 'ASIA', icon: '🌏' },
  { id: 'europe', label: 'EUROPE', icon: '🇪🇺' },
  { id: 'africa', label: 'AFRICA', icon: '🌍' },
];

export default function MapFocusView({ signals, conflicts, earthquakes, activeLayers, onLayerToggle, onExit }: MapFocusViewProps) {
  const { mapView, setMapView } = useMapView();
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [region, setRegion] = useState('global');
  const [search, setSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const activeCount = activeLayers.length;

  return (
    <div className="flex flex-col h-full w-full bg-void overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-black/50 border-b border-white/[0.06] backdrop-blur-sm z-20 flex-shrink-0">
        {/* Back button */}
        <button onClick={onExit}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-text-dim hover:text-white hover:border-white/20 transition-all">
          ← EXIT
        </button>

        {/* Region selector */}
        <div className="flex items-center gap-1">
          {REGIONS.map(r => (
            <button key={r.id} onClick={() => setRegion(r.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-mono transition-all ${region === r.id ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' : 'text-text-dim hover:text-white hover:bg-white/5'}`}>
              <span>{r.icon}</span>
              <span className="hidden xl:inline">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Time filter */}
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono text-text-dim">TIME:</span>
          {TIME_FILTERS.map(f => (
            <button key={f} onClick={() => setTimeFilter(f)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono transition-all ${timeFilter === f ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' : 'text-text-dim hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1">
          <span className="text-text-dim text-[10px]">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search map..."
            className="bg-transparent text-[9px] font-mono text-white placeholder-text-dim outline-none w-32" />
        </div>

        {/* Signal count */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent-green/5 border border-accent-green/20">
          <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
          <span className="text-[9px] font-mono text-accent-green">LIVE</span>
          <span className="text-[9px] font-mono text-white/50">{signals.length}</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Full map with 2D/3D toggle */}
        <div className="flex-1 relative overflow-hidden">

          {/* 2D/3D toggle — top center */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center bg-black/80 border border-white/15 rounded-lg p-1 backdrop-blur-sm shadow-lg">
            <button
              onClick={() => setMapView('2D')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 ${
                mapView === '2D'
                  ? 'bg-accent-blue text-black shadow-[0_0_12px_rgba(0,204,255,0.5)]'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <span>2D</span>
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => setMapView('3D')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 ${
                mapView === '3D'
                  ? 'bg-accent-green text-black shadow-[0_0_12px_rgba(0,255,136,0.5)]'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
              </svg>
              <span>3D</span>
            </button>
          </div>

          {/* 2D Map */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${mapView === '2D' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <WorldMap
              signals={signals}
              activeLayers={activeLayers}
              onLayerToggle={onLayerToggle}
              earthquakes={earthquakes}
            />
          </div>

          {/* 3D Globe */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${mapView === '3D' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            {mounted && <Globe3DView signals={signals} />}
          </div>

          {/* Signal count overlay */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/70 border border-white/10 rounded-lg backdrop-blur-sm">
            <span className="text-[9px] font-mono text-text-dim">{signals.length} signals · {activeCount} layers active · {timeFilter} · {mapView}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
