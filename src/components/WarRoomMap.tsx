'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MissileEvent {
  id: string;
  type: string;
  origin: string;
  target: string;
  originLat: number;
  originLon: number;
  targetLat: number;
  targetLon: number;
  status: 'active' | 'intercepted' | 'landed';
  timeAgo: string;
  speed: number;
  altitude: number;
}

interface WarRoomMapProps {
  missiles: MissileEvent[];
  view: string;
}

const THEATER_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  global: { center: [30, 25], zoom: 2.5 },
  ukraine: { center: [37.5, 48.5], zoom: 6 },
  middleeast: { center: [40, 31], zoom: 5 },
  asia: { center: [115, 20], zoom: 4 },
};

const MISSILE_COLORS: Record<string, string> = {
  ICBM: '#1F77B4',
  MRBM: '#FF7F0E',
  SRBM: '#2CA02C',
  HYPERSONIC: '#D62728',
  CRUISE: '#9467BD',
  AIRSTRIKE: '#8C564B',
  ARTILLERY: '#E377C2',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#ff2244',
  intercepted: '#00ff88',
  landed: '#666666',
};

export default function WarRoomMap({ missiles, view }: WarRoomMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const linesRef = useRef<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [30, 25],
      zoom: 2.5,
      minZoom: 1.5,
      maxZoom: 12,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setLoaded(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update view when theater changes
  useEffect(() => {
    if (!map.current || !loaded) return;
    const v = THEATER_VIEWS[view] || THEATER_VIEWS.global;
    map.current.flyTo({
      center: v.center,
      zoom: v.zoom,
      duration: 1500,
    });
  }, [view, loaded]);

  // Update missile markers and trajectories
  useEffect(() => {
    if (!map.current || !loaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Clear old lines
    linesRef.current.forEach((id) => {
      try {
        if (map.current?.getLayer(id)) map.current.removeLayer(id);
        if (map.current?.getSource(id)) map.current.removeSource(id);
      } catch (e) {}
    });
    linesRef.current = [];

    missiles.forEach((m, i) => {
      const color = MISSILE_COLORS[m.type] || '#ffaa00';
      const statusColor = STATUS_COLORS[m.status] || '#ffaa00';

      if (!map.current) return;

      // Origin marker (pulsing dot)
      const originEl = document.createElement('div');
      originEl.innerHTML = `
        <div style="
          width: 14px; height: 14px; border-radius: 50%;
          background: ${statusColor}; border: 2px solid #fff;
          box-shadow: 0 0 10px ${statusColor}, 0 0 20px ${statusColor}40;
          animation: pulse 1.5s ease-in-out infinite;
        "></div>
      `;
      originEl.style.cursor = 'pointer';
      const originMarker = new maplibregl.Marker({ element: originEl })
        .setLngLat([m.originLon, m.originLat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div style="color:#fff; min-width:160px; font-family:monospace; font-size:11px;">
              <div style="font-weight:bold; color:${color}; margin-bottom:4px;">${m.type}</div>
              <div>Origin: ${m.origin}</div>
              <div>Target: ${m.target}</div>
              <div>Speed: ${m.speed.toLocaleString()} km/h</div>
              <div>Alt: ${m.altitude} km</div>
              <div style="color:${statusColor}; margin-top:4px;">${m.status.toUpperCase()}</div>
            </div>
          `)
        )
        .addTo(map.current);
      markersRef.current.push(originMarker);

      // Target marker
      const targetEl = document.createElement('div');
      targetEl.innerHTML = `
        <div style="
          width: 10px; height: 10px; border-radius: 50%;
          background: ${m.status === 'intercepted' ? '#00ff88' : color};
          border: 2px solid #fff;
          box-shadow: 0 0 6px ${color}80;
        "></div>
      `;
      targetEl.style.cursor = 'pointer';
      const targetMarker = new maplibregl.Marker({ element: targetEl })
        .setLngLat([m.targetLon, m.targetLat])
        .addTo(map.current);
      markersRef.current.push(targetMarker);

      // Trajectory line (great circle approximation)
      const lineId = `missile-line-${m.id}`;
      linesRef.current.push(lineId);

      const points = interpolateArc(
        [m.originLon, m.originLat],
        [m.targetLon, m.targetLat],
        50
      );

      map.current.addSource(lineId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: points,
          },
        },
      });

      map.current.addLayer({
        id: lineId,
        type: 'line',
        source: lineId,
        paint: {
          'line-color': m.status === 'intercepted' ? '#00ff88' : color,
          'line-width': 2,
          'line-opacity': m.status === 'intercepted' ? 0.3 : 0.7,
          'line-dasharray': m.status === 'active' ? [2, 2] : [1, 0],
        },
      });
    });
  }, [missiles, loaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="text-2xl animate-pulse mb-2">🌍</div>
            <div className="text-[10px] text-text-muted font-mono">Loading map...</div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        .maplibregl-popup-content {
          background: #1a1a2e !important;
          border: 1px solid #333;
          border-radius: 6px;
          padding: 10px;
        }
        .maplibregl-popup-tip {
          border-top-color: #1a1a2e !important;
          border-bottom-color: #1a1a2e !important;
        }
      `}</style>
    </div>
  );
}

// Interpolate an arc between two points (great circle)
function interpolateArc(
  start: [number, number],
  end: [number, number],
  height: number,
  segments: number = 50
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = start[1] + (end[1] - start[1]) * t;
    const lon = start[0] + (end[0] - start[0]) * t;
    // Add arc height in middle
    const arcOffset = Math.sin(t * Math.PI) * (height / 111320); // rough conversion to degrees
    points.push([lon, lat + arcOffset]);
  }
  return points;
}
