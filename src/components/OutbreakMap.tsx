'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OutbreakRecord {
  id: string;
  virus: string;
  signal_type: 'confirmed_case' | 'cluster' | 'monitoring' | 'public_health_context';
  severity: 'high' | 'medium' | 'low';
  location: { label: string; lat: number; lng: number; country: string };
  summary: string;
  source: string;
  source_url: string | null;
  reported_date: string;
  case_count: number | null;
  monitoring_count: number | null;
}

const SIGNAL_COLORS: Record<string, { center: string; stroke: string; label: string }> = {
  confirmed_case: { center: '#ff2244', stroke: '#ff2244', label: 'Confirmed case' },
  cluster: { center: '#6644ff', stroke: '#8866ff', label: 'Cluster' },
  monitoring: { center: '#ff8800', stroke: '#ffaa33', label: 'Monitoring' },
  public_health_context: { center: '#00ff88', stroke: '#33ffaa', label: 'Public health context' },
};

const SEVERITY_RADIUS: Record<string, number> = {
  high: 200000,
  medium: 120000,
  low: 60000,
};

function BlobMarkers({
  outbreaks,
  selectedId,
  onSelect,
}: {
  outbreaks: OutbreakRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const map = useMap();
  const layersRef = useRef<L.LayerGroup>(L.layerGroup());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const group = layersRef.current;
    group.addTo(map);
    return () => {
      group.removeFrom(map);
    };
  }, [map]);

  const refresh = useCallback(() => {
    const group = layersRef.current;
    group.clearLayers();

    outbreaks.forEach((o) => {
      const color = SIGNAL_COLORS[o.signal_type] || SIGNAL_COLORS.monitoring;
      const radius = SEVERITY_RADIUS[o.severity] || 100000;
      const isSelected = selectedId === o.id;
      const isHovered = hoveredId === o.id;
      const pulseScale = 1 + Math.sin(Date.now() / 800) * 0.15;
      const effectiveRadius = isSelected ? radius * 1.3 : isHovered ? radius * 1.15 : radius * pulseScale;

      // Main blob circle
      const circle = L.circle([o.location.lat, o.location.lng], {
        radius: effectiveRadius,
        fillColor: color.center,
        fillOpacity: isSelected ? 0.35 : isHovered ? 0.3 : 0.2,
        color: color.stroke,
        weight: isSelected ? 3 : 2,
        opacity: 0.9,
        className: 'outbreak-blob',
      });

      // Inner bright core
      const core = L.circle([o.location.lat, o.location.lng], {
        radius: effectiveRadius * 0.25,
        fillColor: color.center,
        fillOpacity: 0.6,
        color: 'transparent',
        weight: 0,
      });

      // Tooltip
      const tooltipContent = `
        <div style="font-family:sans-serif;min-width:180px;">
          <div style="font-weight:bold;font-size:12px;color:#fff;margin-bottom:4px;">${o.virus}</div>
          <div style="font-size:10px;color:${color.center};margin-bottom:2px;">${o.location.label} • ${o.signal_type.replace(/_/g, ' ')}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.6);margin-bottom:2px;">
            ${o.case_count !== null ? `Cases: ${o.case_count}` : ''}${o.monitoring_count !== null ? `Monitoring: ${o.monitoring_count}` : ''}
          </div>
          <div style="font-size:9px;color:rgba(255,255,255,0.35);">${o.source} • ${o.reported_date}</div>
        </div>
      `;
      circle.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'outbreak-tooltip',
        opacity: 1,
      });

      circle.on('mouseover', () => setHoveredId(o.id));
      circle.on('mouseout', () => setHoveredId(null));
      circle.on('click', () => onSelect(isSelected ? null : o.id));
      core.on('click', () => onSelect(isSelected ? null : o.id));

      group.addLayer(circle);
      group.addLayer(core);
    });
  }, [outbreaks, selectedId, hoveredId, onSelect]);

  // Animation loop
  useEffect(() => {
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      refresh();
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return null;
}

interface OutbreakMapProps {
  outbreaks: OutbreakRecord[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  loading: boolean;
}

export default function OutbreakMap({ outbreaks, selectedId, onSelect, loading }: OutbreakMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0a0a0f]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={1}
        maxZoom={10}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
        />
        <BlobMarkers outbreaks={outbreaks} selectedId={selectedId} onSelect={onSelect} />
      </MapContainer>

      {/* Loading overlay — pulsing placeholder blobs on last known locations */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/60 z-[500] pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent-green animate-ping" />
            <span className="text-[10px] font-mono text-white/40 animate-pulse">REFRESHING OUTBREAK DATA...</span>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm border border-white/[0.08] rounded-lg px-3 py-2 z-[400]">
        <div className="text-[9px] font-mono text-white/30 mb-1.5 tracking-wider">SIGNAL TYPE</div>
        <div className="space-y-1">
          {Object.entries(SIGNAL_COLORS).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.center, boxShadow: `0 0 6px ${cfg.center}` }} />
              <span className="text-[9px] text-white/50">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
