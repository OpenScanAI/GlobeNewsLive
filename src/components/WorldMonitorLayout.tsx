'use client';
import { MapViewProvider, useMapView } from '@/contexts/MapViewContext';

import { useState, useEffect } from 'react';
import type { Signal, MarketData } from '@/types';

interface LayerConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  active: boolean;
}

interface WorldMonitorLayoutProps {
  children: React.ReactNode;
  signals: Signal[];
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
  defcon?: number;
  criticalCount?: number;
}

const SIDEBAR_LAYERS: LayerConfig[] = [
  { id: 'conflicts', label: 'Conflict Zones', icon: '⚔️', color: '#ff2244', active: true },
  { id: 'hotspots', label: 'Intel Hotspots', icon: '🔥', color: '#ff6633', active: true },
  { id: 'bases', label: 'Military Bases', icon: '🏛️', color: '#4488ff', active: true },
  { id: 'nuclear', label: 'Nuclear Sites', icon: '☢️', color: '#ffcc00', active: false },
  { id: 'flights', label: 'Military Flights', icon: '✈️', color: '#ff8800', active: true },
  { id: 'ships', label: 'Naval Vessels', icon: '🚢', color: '#00ccff', active: false },
  { id: 'earthquakes', label: 'Earthquakes', icon: '🌍', color: '#ffaa00', active: true },
  { id: 'fires', label: 'Satellite Fires', icon: '🔴', color: '#ff4400', active: false },
  { id: 'cyber', label: 'Cyber Threats', icon: '💻', color: '#00ff88', active: false },
  { id: 'cables', label: 'Undersea Cables', icon: '🔌', color: '#aa88ff', active: false },
  { id: 'weather', label: 'Weather Alerts', icon: '⛈️', color: '#aaccff', active: false },
  { id: 'routes', label: 'Trade Routes', icon: '🗺️', color: '#88ffcc', active: false },
];

const REGION_PRESETS = [
  { id: 'global', label: 'Global', icon: '🌐' },
  { id: 'mena', label: 'MENA', icon: '🌍' },
  { id: 'europe', label: 'Europe', icon: '🇪🇺' },
  { id: 'asia', label: 'Asia', icon: '🌏' },
  { id: 'americas', label: 'Americas', icon: '🌎' },
];

function WorldMonitorLayoutInner({ children, signals, activeLayers, onLayerToggle, defcon = 3, criticalCount = 0 }: WorldMonitorLayoutProps) {
  const [layers, setLayers] = useState<LayerConfig[]>(SIDEBAR_LAYERS);
  const [region, setRegion] = useState('global');
  const { mapView: view, setMapView: setView } = useMapView();

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
    onLayerToggle(id);
  };

  const activeCount = layers.filter(l => l.active).length;

  return (
    <div className="flex flex-col h-full w-full bg-void overflow-hidden">
      {/* WorldMonitor-style sub-nav */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/[0.06] backdrop-blur-sm z-20">
        {/* Left: region presets only (layers tab removed per #43) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {REGION_PRESETS.map(r => (
              <button key={r.id} onClick={() => setRegion(r.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[8px] font-mono transition-all ${region === r.id ? 'bg-white/10 text-white border border-white/20' : 'text-text-dim hover:text-white'}`}>
                <span>{r.icon}</span>
                <span className="hidden md:inline">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: 2D/3D toggle + signal count */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/30 rounded border border-white/10 p-0.5">
            {(['2D', '3D'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${view === v ? 'bg-white/15 text-white' : 'text-text-dim hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent-green/5 border border-accent-green/20">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            <span className="text-[9px] font-mono text-accent-green">LIVE</span>
            <span className="text-[9px] font-mono text-white/50">{signals.length}</span>
          </div>
        </div>
      </div>

      {/* Main content area — sidebar removed per #43 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main dashboard content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function WorldMonitorLayout(props: WorldMonitorLayoutProps) {
  return (
    <MapViewProvider>
      <WorldMonitorLayoutInner {...props} />
    </MapViewProvider>
  );
}
