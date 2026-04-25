'use client';

import { useState, useCallback } from 'react';
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

const LAYER_GROUPS = [
  {
    group: 'CONFLICT',
    layers: [
      { id: 'conflicts', label: 'Conflict Zones', icon: '⚔️', color: '#ff2244' },
      { id: 'iran', label: 'Iran Attacks', icon: '🇮🇷', color: '#ff4400' },
      { id: 'chokepoints', label: 'Chokepoints', icon: '🚢', color: '#ff8800' },
    ]
  },
  {
    group: 'MILITARY',
    layers: [
      { id: 'military', label: 'Military Bases', icon: '🏛️', color: '#4488ff' },
      { id: 'flights', label: 'Military Flights', icon: '✈️', color: '#ff6600' },
      { id: 'nuclear', label: 'Nuclear Sites', icon: '☢️', color: '#ffcc00' },
      { id: 'spaceports', label: 'Spaceports', icon: '🚀', color: '#aa88ff' },
    ]
  },
  {
    group: 'INTELLIGENCE',
    layers: [
      { id: 'cyber', label: 'Cyber Threats', icon: '💻', color: '#00ff88' },
      { id: 'outages', label: 'Net Outages', icon: '📡', color: '#ff4488' },
      { id: 'gps-jamming', label: 'GPS Jamming', icon: '📍', color: '#ffaa00' },
      { id: 'ai-centers', label: 'AI Data Centers', icon: '🤖', color: '#00ccff' },
    ]
  },
  {
    group: 'ENVIRONMENT',
    layers: [
      { id: 'earthquakes', label: 'Earthquakes', icon: '🌍', color: '#ffaa00' },
      { id: 'fires', label: 'Satellite Fires', icon: '🔥', color: '#ff4400' },
      { id: 'weather', label: 'Weather', icon: '⛈️', color: '#aaccff' },
      { id: 'displacement', label: 'Displacement', icon: '👥', color: '#ffcc88' },
    ]
  },
  {
    group: 'INFRASTRUCTURE',
    layers: [
      { id: 'cables', label: 'Undersea Cables', icon: '🔌', color: '#aa88ff' },
      { id: 'pipelines', label: 'Pipelines', icon: '🛢️', color: '#88aaff' },
      { id: 'routes', label: 'Trade Routes', icon: '🗺️', color: '#88ffcc' },
      { id: 'clusters', label: 'Event Clusters', icon: '📍', color: '#ff88aa' },
    ]
  },
];

const TIME_FILTERS = ['1h', '6h', '24h', '7d', '30d'];
const REGIONS = [
  { id: 'global', label: 'Global', icon: '🌐', lat: 20, lon: 0, zoom: 2 },
  { id: 'mena', label: 'MENA', icon: '🌍', lat: 28, lon: 45, zoom: 4 },
  { id: 'europe', label: 'Europe', icon: '🇪🇺', lat: 54, lon: 15, zoom: 4 },
  { id: 'asia', label: 'Asia', icon: '🌏', lat: 35, lon: 105, zoom: 3 },
  { id: 'americas', label: 'Americas', icon: '🌎', lat: 15, lon: -90, zoom: 3 },
  { id: 'africa', label: 'Africa', icon: '🌍', lat: 5, lon: 20, zoom: 3 },
];

export default function MapFocusView({ signals, conflicts, earthquakes, activeLayers, onLayerToggle, onExit }: MapFocusViewProps) {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [region, setRegion] = useState('global');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const activeCount = LAYER_GROUPS.flatMap(g => g.layers).filter(l => activeLayers.includes(l.id)).length;
  const totalLayers = LAYER_GROUPS.flatMap(g => g.layers).length;

  const filteredGroups = LAYER_GROUPS.map(g => ({
    ...g,
    layers: g.layers.filter(l => search === '' || l.label.toLowerCase().includes(search.toLowerCase()))
  })).filter(g => g.layers.length > 0);

  return (
    <div className="flex flex-col h-full w-full bg-void overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-black/50 border-b border-white/[0.06] backdrop-blur-sm z-20 flex-shrink-0">
        {/* Back button */}
        <button onClick={onExit}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-white/10 text-[9px] font-mono text-text-dim hover:text-white hover:border-white/20 transition-all">
          ← EXIT
        </button>

        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-mono transition-all ${sidebarOpen ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-text-dim hover:text-white'}`}>
          ☰ LAYERS
          <span className="px-1 rounded bg-accent-green/20 text-accent-green text-[8px]">{activeCount}/{totalLayers}</span>
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
        {/* Left sidebar */}
        {sidebarOpen && (
          <div className="w-52 flex-shrink-0 bg-black/40 border-r border-white/[0.06] flex flex-col backdrop-blur-sm overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-white/[0.06]">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search layers..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-[9px] font-mono text-white placeholder-text-dim outline-none focus:border-accent-green/30" />
            </div>

            {/* Layer groups */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {filteredGroups.map(group => (
                <div key={group.group}>
                  <button onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[8px] font-mono text-text-dim hover:text-white/60 transition-colors border-b border-white/[0.04]">
                    <span className="tracking-wider">{group.group}</span>
                    <span>{collapsedGroups.has(group.group) ? '▸' : '▾'}</span>
                  </button>
                  {!collapsedGroups.has(group.group) && group.layers.map(layer => {
                    const active = activeLayers.includes(layer.id);
                    return (
                      <label key={layer.id}
                        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-all hover:bg-white/[0.03] ${active ? 'bg-white/[0.02]' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all`}
                          style={active ? { backgroundColor: layer.color + '25', borderColor: layer.color + '70' } : { borderColor: 'rgba(255,255,255,0.15)' }}>
                          {active && <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke={layer.color} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                        </div>
                        <input type="checkbox" checked={active} onChange={() => onLayerToggle(layer.id)} className="hidden" />
                        <span className="text-[11px]">{layer.icon}</span>
                        <span className={`text-[9px] font-mono flex-1 ${active ? 'text-white/80' : 'text-text-dim'}`}>{layer.label}</span>
                        <div className="w-1.5 h-1.5 rounded-full transition-all flex-shrink-0"
                          style={{ backgroundColor: active ? layer.color : 'transparent', boxShadow: active ? `0 0 4px ${layer.color}` : 'none' }} />
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="p-2 border-t border-white/[0.06] flex-shrink-0">
              <div className="text-[8px] font-mono text-text-dim mb-2 tracking-wider">LEGEND</div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { color: '#ff2244', label: 'High Alert' },
                  { color: '#ff6633', label: 'Elevated' },
                  { color: '#ffcc00', label: 'Monitoring' },
                  { color: '#4488ff', label: 'Military' },
                  { color: '#00ff88', label: 'Secure' },
                  { color: '#aa88ff', label: 'Infrastructure' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="text-[8px] font-mono text-text-dim">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Full map */}
        <div className="flex-1 relative overflow-hidden">
          <WorldMap
            signals={signals}
            activeLayers={activeLayers}
            onLayerToggle={onLayerToggle}
            earthquakes={earthquakes}
          />
          {/* Signal count overlay */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/70 border border-white/10 rounded-lg backdrop-blur-sm">
            <span className="text-[9px] font-mono text-text-dim">{signals.length} signals · {activeCount} layers active · {timeFilter}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
