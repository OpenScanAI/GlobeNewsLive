'use client';

import { useState } from 'react';

type TrackingType = 'flights' | 'ships' | 'earthquakes';

interface TrackingPanelProps {
  earthquakes?: Array<{
    id: string;
    magnitude: number;
    place: string;
    lat: number;
    lon: number;
    depth: number;
  }>;
}

export default function TrackingPanel({ earthquakes = [] }: TrackingPanelProps) {
  const [activeTab, setActiveTab] = useState<TrackingType>('earthquakes');
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <div className="glass-panel">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-1">
          {[
            { id: 'earthquakes' as TrackingType, icon: '🌍', label: 'QUAKES' },
            { id: 'flights' as TrackingType, icon: '✈️', label: 'FLIGHTS' },
            { id: 'ships' as TrackingType, icon: '🚢', label: 'SHIPS' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1 rounded text-[9px] font-mono transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-text-dim hover:text-text-muted'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        {(activeTab === 'flights' || activeTab === 'ships') && (
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="text-[9px] text-accent-blue hover:text-accent-green transition-colors"
          >
            {showEmbed ? 'HIDE MAP' : 'SHOW MAP'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        {activeTab === 'earthquakes' && (
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {earthquakes.length === 0 ? (
              <div className="text-center py-4 text-text-muted text-[10px]">
                No significant earthquakes in past 24h
              </div>
            ) : (
              earthquakes.slice(0, 8).map(eq => (
                <div
                  key={eq.id}
                  className="flex items-center justify-between px-2 py-1.5 bg-elevated/50 rounded hover:bg-elevated transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[12px] font-bold px-1.5 py-0.5 rounded ${
                        eq.magnitude >= 6
                          ? 'bg-accent-red/20 text-accent-red'
                          : eq.magnitude >= 5
                          ? 'bg-accent-orange/20 text-accent-orange'
                          : 'bg-accent-gold/20 text-accent-gold'
                      }`}
                    >
                      M{eq.magnitude.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-white truncate max-w-[140px]">
                      {eq.place}
                    </span>
                  </div>
                  <span className="text-[9px] text-text-dim font-mono">
                    {eq.depth.toFixed(0)}km
                  </span>
                </div>
              ))
            )}
            <div className="text-[8px] text-text-dim text-center pt-1">
              Source: USGS • M4.5+ past 24h
            </div>
          </div>
        )}

        {activeTab === 'flights' && (
          <div>
            {showEmbed ? (
              <div className="relative">
                <iframe
                  src="https://globe.adsbexchange.com/?icao=&lat=33&lon=44&zoom=4&hideSidebar&hideButtons&mapDim=0.8"
                  className="w-full h-[250px] rounded border border-border-subtle"
                  title="ADS-B Exchange"
                />
                <div className="absolute bottom-1 left-1 bg-void/90 px-2 py-0.5 rounded text-[8px] text-text-muted">
                  ADS-B Exchange • Military + Civilian
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✈️</div>
                <div className="text-[11px] text-text-muted mb-3">
                  Live military & civilian aircraft tracking
                </div>
                <button
                  onClick={() => setShowEmbed(true)}
                  className="px-3 py-1.5 bg-accent-blue/20 text-accent-blue text-[10px] font-mono rounded hover:bg-accent-blue/30 transition-colors"
                >
                  LOAD ADS-B EXCHANGE
                </button>
                <div className="text-[8px] text-text-dim mt-2">
                  Includes military (no filtering)
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ships' && (
          <div>
            {showEmbed ? (
              <div className="relative">
                <iframe
                  src="https://www.marinetraffic.com/en/ais/embed/zoom:4/centery:26/centerx:56/maptype:1/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:/remember:false"
                  className="w-full h-[250px] rounded border border-border-subtle"
                  title="MarineTraffic"
                />
                <div className="absolute bottom-1 left-1 bg-void/90 px-2 py-0.5 rounded text-[8px] text-text-muted">
                  MarineTraffic • AIS Data
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🚢</div>
                <div className="text-[11px] text-text-muted mb-3">
                  Live vessel tracking via AIS
                </div>
                <button
                  onClick={() => setShowEmbed(true)}
                  className="px-3 py-1.5 bg-accent-blue/20 text-accent-blue text-[10px] font-mono rounded hover:bg-accent-blue/30 transition-colors"
                >
                  LOAD MARINETRAFFIC
                </button>
                <div className="text-[8px] text-text-dim mt-2">
                  Focus: Strait of Hormuz region
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
