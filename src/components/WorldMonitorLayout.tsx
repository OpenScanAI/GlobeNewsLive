'use client';

import { useState } from 'react';
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

export default function WorldMonitorLayout({ children, signals, activeLayers, onLayerToggle, defcon = 3, criticalCount = 0 }: WorldMonitorLayoutProps) {
  const [layers, setLayers] = useState<LayerConfig[]>(SIDEBAR_LAYERS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [region, setRegion] = useState('global');
  const [layerSearch, setLayerSearch] = useState('');
  const [view, setView] = useState<'2D' | '3D'>('2D');

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
    onLayerToggle(id);
  };

  const defconColors: Record<number, string> = { 1: '#ff0000', 2: '#ff4400', 3: '#ffcc00', 4: '#00ccff', 5: '#00ff88' };
  const defconNames: Record<number, string> = { 1: 'COCKED PISTOL', 2: 'FAST PACE', 3: 'ROUND HOUSE', 4: 'DOUBLE TAKE', 5: 'FADE OUT' };

  const filteredLayers = layers.filter(l =>
    layerSearch === '' || l.label.toLowerCase().includes(layerSearch.toLowerCase())
  );

  const activeCount = layers.filter(l => l.active).length;

  return (
    <div className="flex flex-col h-full w-full bg-void overflow-hidden">
      {/* WorldMonitor-style sub-nav */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/[0.06] backdrop-blur-sm z-20">
        {/* Left: view + region */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono border transition-all ${sidebarOpen ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-text-dim hover:text-white'}`}>
            <span>☰</span>
            <span className="hidden sm:inline">LAYERS</span>
            <span className="px-1 bg-accent-green/20 text-accent-green rounded text-[8px]">{activeCount}</span>
          </button>

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

        {/* Center: GLOBAL SITUATION */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-white/50 tracking-widest">GLOBAL SITUATION</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border"
            style={{ borderColor: defconColors[defcon] + '40', backgroundColor: defconColors[defcon] + '10' }}>
            <span className="text-[8px] font-mono text-white/50">DEFCON</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: defconColors[defcon] }}>{defcon}</span>
            <span className="text-[8px] font-mono" style={{ color: defconColors[defcon] + 'aa' }}>{defconNames[defcon]}</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-red/10 border border-accent-red/30">
              <div className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
              <span className="text-[9px] font-mono text-accent-red font-bold">{criticalCount} CRITICAL</span>
            </div>
          )}
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

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — layer toggles */}
        {sidebarOpen && (
          <div className="w-52 flex-shrink-0 bg-black/30 border-r border-white/[0.06] flex flex-col backdrop-blur-sm z-10">
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <input
                value={layerSearch}
                onChange={e => setLayerSearch(e.target.value)}
                placeholder="Search layers..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-[9px] font-mono text-white placeholder-text-dim outline-none focus:border-accent-green/30"
              />
            </div>

            {/* Layer list */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-0.5">
              {filteredLayers.map(layer => (
                <label key={layer.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all hover:bg-white/[0.04] group ${layer.active ? 'bg-white/[0.03]' : ''}`}>
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${layer.active ? 'border-transparent' : 'border-white/20'}`}
                    style={layer.active ? { backgroundColor: layer.color + '30', borderColor: layer.color + '60' } : {}}>
                    {layer.active && (
                      <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke={layer.color} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <input type="checkbox" checked={layer.active} onChange={() => toggleLayer(layer.id)} className="hidden" />
                  <span className="text-[10px]">{layer.icon}</span>
                  <span className={`text-[9px] font-mono flex-1 transition-colors ${layer.active ? 'text-white/80' : 'text-text-dim group-hover:text-white/60'}`}>
                    {layer.label}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all"
                    style={{ backgroundColor: layer.active ? layer.color : 'transparent', boxShadow: layer.active ? `0 0 4px ${layer.color}` : 'none' }} />
                </label>
              ))}
            </div>

            {/* Legend */}
            <div className="p-2 border-t border-white/[0.06]">
              <div className="text-[8px] font-mono text-text-dim mb-1.5 tracking-wider">LEGEND</div>
              <div className="space-y-1">
                {[
                  { color: '#ff2244', label: 'High Alert' },
                  { color: '#ff6633', label: 'Elevated' },
                  { color: '#ffcc00', label: 'Monitoring' },
                  { color: '#4488ff', label: 'Base/Asset' },
                  { color: '#00ff88', label: 'Secure' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="text-[8px] font-mono text-text-dim">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main dashboard content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
