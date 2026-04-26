'use client';

import { useState, useEffect } from 'react';
import WorldMap from './WorldMap';
import Globe3DView from './Globe3DView';
import type { Signal } from '@/types';
import { useMapView } from '@/contexts/MapViewContext';

interface MapToggleViewProps {
  signals: Signal[];
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
  earthquakes: any[];
}

export default function MapToggleView({ signals, activeLayers, onLayerToggle, earthquakes }: MapToggleViewProps) {
  const { mapView, setMapView } = useMapView();
  const view = mapView.toLowerCase() as '2d' | '3d';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const switchView = (v: '2d' | '3d') => {
    setMapView(v.toUpperCase() as '2D' | '3D');
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Toggle buttons — top center, prominent */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0 bg-black/80 border border-white/15 rounded-lg p-1 backdrop-blur-sm shadow-lg">
        <button
          onClick={() => switchView('2d')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 ${
            view === '2d'
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
          onClick={() => switchView('3d')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 ${
            view === '3d'
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

      {/* Views — both mounted, only one visible */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${view === '2d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        <WorldMap
          signals={signals}
          activeLayers={activeLayers}
          onLayerToggle={onLayerToggle}
          earthquakes={earthquakes}
        />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${view === '3d' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
        {mounted && <Globe3DView signals={signals} />}
      </div>
    </div>
  );
}
