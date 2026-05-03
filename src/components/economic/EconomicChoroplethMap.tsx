'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CountryRisk {
  code: string;
  name: string;
  risk: number;
  gdpGrowth: number | null;
  inflation: number | null;
  debtToGdp: number | null;
  flag: string;
}

interface EconomicChoroplethMapProps {
  countries: Record<string, CountryRisk>;
  height?: number;
  onCountryClick?: (code: string) => void;
  selectedCode?: string;
}

// ISO3 to our code mapping
const ISO3_TO_CODE: Record<string, string> = {
  'USA': 'us', 'CHN': 'cn', 'DEU': 'de', 'JPN': 'jp', 'IND': 'in',
  'GBR': 'gb', 'FRA': 'fr', 'BRA': 'br', 'ITA': 'it', 'CAN': 'ca',
  'RUS': 'ru', 'KOR': 'kr', 'MEX': 'mx', 'AUS': 'au', 'ESP': 'es',
  'IDN': 'id', 'SAU': 'sa', 'TUR': 'tr', 'TWN': 'tw', 'ARG': 'ar',
  'ZAF': 'za', 'UKR': 'ua', 'ISR': 'il', 'IRN': 'ir', 'ARE': 'ae',
  'EGY': 'eg', 'VNM': 'vn', 'POL': 'pl', 'NGA': 'ng', 'PAK': 'pk',
  'BGD': 'bd',
};

const CODE_TO_ISO3: Record<string, string> = Object.fromEntries(
  Object.entries(ISO3_TO_CODE).map(([k, v]) => [v, k])
);

function riskColor(score: number): string {
  if (score >= 70) return '#ef4444'; // red-500
  if (score >= 50) return '#f97316'; // orange-500
  if (score >= 30) return '#eab308'; // yellow-500
  return '#22c55e'; // green-500
}

export default function EconomicChoroplethMap({
  countries,
  height = 400,
  onCountryClick,
  selectedCode,
}: EconomicChoroplethMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [geojsonData, setGeojsonData] = useState<any>(null);

  // Load GeoJSON
  useEffect(() => {
    fetch('/countries.geojson')
      .then(r => r.json())
      .then(data => {
        setGeojsonData(data);
      })
      .catch(err => {
        console.error('Failed to load GeoJSON:', err);
        setMapError('Failed to load country boundaries');
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !geojsonData) return;

    const container = mapContainer.current;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      container.style.width = '100%';
      container.style.height = '100%';
    }

    map.current = new maplibregl.Map({
      container: container,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [20, 25],
      zoom: 1.2,
      minZoom: 1,
      maxZoom: 6,
      attributionControl: false,
      preserveDrawingBuffer: false,
      renderWorldCopies: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    const loadTimeout = setTimeout(() => {
      if (!loaded) {
        setMapError('Map style failed to load');
        setLoaded(true);
      }
    }, 10000);

    map.current.on('error', (e) => {
      console.error('Map error:', e);
      setMapError('Failed to load map tiles');
      clearTimeout(loadTimeout);
      setLoaded(true);
    });

    map.current.on('load', () => {
      clearTimeout(loadTimeout);
      setTimeout(() => {
        map.current?.resize();
      }, 100);
      setLoaded(true);
    });

    return () => {
      clearTimeout(loadTimeout);
      map.current?.remove();
      map.current = null;
    };
  }, [geojsonData]);

  // Update choropleth layers when data changes
  useEffect(() => {
    if (!map.current || !loaded || !geojsonData) return;

    const m = map.current;

    // Build a lookup of our country data by ISO3
    const countryByIso3: Record<string, CountryRisk> = {};
    Object.entries(countries).forEach(([code, data]) => {
      const iso3 = CODE_TO_ISO3[code];
      if (iso3) countryByIso3[iso3] = data;
    });

    // Enrich GeoJSON features with our risk data
    const enrichedFeatures = geojsonData.features.map((feature: any) => {
      const iso3 = feature.properties?.adm0_a3;
      const ourData = countryByIso3[iso3];
      
      if (ourData) {
        return {
          ...feature,
          properties: {
            ...feature.properties,
            hasData: true,
            code: ourData.code,
            name: ourData.name,
            risk: ourData.risk,
            flag: ourData.flag,
            gdpGrowth: ourData.gdpGrowth,
            inflation: ourData.inflation,
            debtToGdp: ourData.debtToGdp,
            selected: selectedCode === ourData.code,
          },
        };
      }
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          hasData: false,
          risk: 0,
        },
      };
    });

    const enrichedGeojson = {
      type: 'FeatureCollection',
      features: enrichedFeatures,
    };

    // Remove existing source/layers
    if (m.getSource('country-risks')) {
      if (m.getLayer('country-risk-fill')) m.removeLayer('country-risk-fill');
      if (m.getLayer('country-risk-outline')) m.removeLayer('country-risk-outline');
      if (m.getLayer('country-risk-selected')) m.removeLayer('country-risk-selected');
      if (m.getLayer('country-risk-label')) m.removeLayer('country-risk-label');
      m.removeSource('country-risks');
    }

    m.addSource('country-risks', {
      type: 'geojson',
      data: enrichedGeojson as any,
    });

    // Fill layer — only for countries with data
    m.addLayer({
      id: 'country-risk-fill',
      type: 'fill',
      source: 'country-risks',
      filter: ['==', ['get', 'hasData'], true],
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'risk'],
          0, 'rgba(34,197,94,0.4)',
          30, 'rgba(234,179,8,0.4)',
          50, 'rgba(249,115,22,0.45)',
          70, 'rgba(239,68,68,0.5)',
          100, 'rgba(220,38,38,0.55)',
        ],
        'fill-opacity': 0.9,
      },
    });

    // Outline layer
    m.addLayer({
      id: 'country-risk-outline',
      type: 'line',
      source: 'country-risks',
      filter: ['==', ['get', 'hasData'], true],
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'selected'], true],
          '#3b82f6',
          'rgba(255,255,255,0.2)',
        ],
        'line-width': [
          'case',
          ['==', ['get', 'selected'], true],
          2.5,
          0.5,
        ],
      },
    });

    // Selected highlight
    m.addLayer({
      id: 'country-risk-selected',
      type: 'fill',
      source: 'country-risks',
      filter: ['all', ['==', ['get', 'hasData'], true], ['==', ['get', 'selected'], true]],
      paint: {
        'fill-color': 'rgba(59,130,246,0.2)',
        'fill-opacity': 0.8,
      },
    });

    // Labels for countries with data
    m.addLayer({
      id: 'country-risk-label',
      type: 'symbol',
      source: 'country-risks',
      filter: ['==', ['get', 'hasData'], true],
      layout: {
        'text-field': ['concat', ['get', 'flag'], ' ', ['get', 'name']],
        'text-font': ['Open Sans Regular'],
        'text-size': 11,
        'text-anchor': 'center',
        'text-allow-overlap': false,
        'text-ignore-placement': false,
      },
      paint: {
        'text-color': 'rgba(255,255,255,0.85)',
        'text-halo-color': 'rgba(0,0,0,0.9)',
        'text-halo-width': 2,
      },
    });

    // Click handler
    m.on('click', 'country-risk-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const code = e.features[0].properties?.code;
        if (code && onCountryClick) {
          onCountryClick(code);
        }
      }
    });

    // Hover cursor
    m.on('mouseenter', 'country-risk-fill', () => {
      m.getCanvas().style.cursor = 'pointer';
    });
    m.on('mouseleave', 'country-risk-fill', () => {
      m.getCanvas().style.cursor = '';
    });

    // Popup on hover
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'dark-popup',
    });

    m.on('mousemove', 'country-risk-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;
        const risk = props?.risk || 0;
        const color = riskColor(risk);

        popup
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="text-white min-w-[160px]">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-sm">${props?.flag || ''}</span>
                <strong class="text-sm">${props?.name || ''}</strong>
              </div>
              <div class="text-[10px] space-y-0.5">
                <div class="flex justify-between">
                  <span class="text-white/50">Risk:</span>
                  <span style="color:${color}">${risk}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/50">GDP:</span>
                  <span class="text-white/70">${props?.gdpGrowth !== null ? Number(props.gdpGrowth).toFixed(1) + '%' : '—'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/50">Inflation:</span>
                  <span class="text-white/70">${props?.inflation !== null ? Number(props.inflation).toFixed(1) + '%' : '—'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/50">Debt/GDP:</span>
                  <span class="text-white/70">${props?.debtToGdp !== null ? props.debtToGdp + '%' : '—'}</span>
                </div>
              </div>
            </div>
          `)
          .addTo(m);
      }
    });

    m.on('mouseleave', 'country-risk-fill', () => {
      popup.remove();
    });

  }, [countries, loaded, selectedCode, onCountryClick, geojsonData]);

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] overflow-hidden flex flex-col" style={{ height }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺️</span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-white/80">
            ECONOMIC RISK MAP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400/30 border border-emerald-400/50" />
            Low
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400/30 border border-yellow-400/50" />
            Med
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400/30 border border-orange-400/50" />
            High
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400/30 border border-rose-400/50" />
            Crit
          </span>
        </div>
      </div>
      <div className="flex-1 relative min-h-[300px]">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        {!loaded && !mapError && (
          <div className="absolute inset-0 bg-[#0a1628] flex items-center justify-center z-10">
            <span className="text-[10px] text-white/30 font-mono animate-pulse">Loading map...</span>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 bg-[#0a1628] flex items-center justify-center z-10">
            <span className="text-[10px] text-rose-400 font-mono">{mapError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
