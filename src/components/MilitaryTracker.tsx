'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plane, ChevronDown, ChevronUp, Radio, Eye } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface MilitaryAircraft {
  id: string;
  callsign: string;
  type: string;
  country: string;
  altitude: number;
  speed: number;
  heading: number;
  lat: number;
  lon: number;
  category: 'recon' | 'tanker' | 'transport' | 'fighter' | 'bomber' | 'awacs' | 'drone' | 'other';
  lastSeen: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  recon: '🛰️',
  tanker: '⛽',
  transport: '📦',
  fighter: '✈️',
  bomber: '💣',
  awacs: '📡',
  drone: '🔴',
  other: '✈️',
};

const CATEGORY_COLORS: Record<string, string> = {
  recon: 'text-purple-400 bg-purple-500/20',
  tanker: 'text-blue-400 bg-blue-500/20',
  transport: 'text-gray-400 bg-gray-500/20',
  fighter: 'text-accent-red bg-accent-red/20',
  bomber: 'text-accent-red bg-accent-red/20',
  awacs: 'text-cyan-400 bg-cyan-500/20',
  drone: 'text-accent-orange bg-accent-orange/20',
  other: 'text-white bg-white/20',
};

export default function MilitaryTracker() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  const { data, error, isLoading } = useSWR<{ aircraft: MilitaryAircraft[] }>('/api/military-aircraft', fetcher, {
    refreshInterval: 60000, // 1 minute
  });

  const aircraft = data?.aircraft || [];
  const filteredAircraft = filter === 'all' ? aircraft : aircraft.filter(a => a.category === filter);

  const categories = ['all', 'recon', 'awacs', 'tanker', 'drone', 'transport'];

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-accent-green" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">MILITARY AIRCRAFT</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">{aircraft.length} ACTIVE</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Filter Tabs */}
          <div className="px-2 py-1.5 border-b border-border-subtle flex gap-1 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'text-text-dim hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? '📡 ALL' : `${CATEGORY_ICONS[cat]} ${cat.toUpperCase()}`}
              </button>
            ))}
          </div>

          {/* Aircraft List */}
          <div className="max-h-[250px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <Radio className="w-5 h-5 text-accent-green animate-pulse mx-auto mb-2" />
                <div className="text-[10px] text-text-muted">Scanning frequencies...</div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-[10px] text-accent-red">Tracking unavailable</div>
              </div>
            ) : filteredAircraft.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-[10px] text-text-muted">No aircraft in this category</div>
              </div>
            ) : (
              filteredAircraft.map((ac) => (
                <div key={ac.id} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[ac.category]}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-white">{ac.callsign}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${CATEGORY_COLORS[ac.category]}`}>
                            {ac.category.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[9px] text-text-muted">{ac.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-text-dim">🇺🇸 {ac.country}</div>
                    </div>
                  </div>
                  
                  {/* Flight Data */}
                  <div className="mt-1.5 flex items-center gap-3 text-[8px] text-text-dim">
                    <span>ALT: {(ac.altitude / 1000).toFixed(1)}k ft</span>
                    <span>SPD: {ac.speed} kts</span>
                    <span>HDG: {ac.heading}°</span>
                    <span>📍 {ac.lat.toFixed(2)}, {ac.lon.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-text-dim" />
                <span className="text-[8px] text-text-dim">ADS-B Exchange • 1 min refresh</span>
              </div>
              <span className="text-[8px] text-accent-green">● LIVE</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
