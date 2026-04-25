'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Signal } from '@/types';

interface Globe3DViewProps { signals?: Signal[]; }

const ALL_LAYERS = ['signals','flights','earthquakes','ships','cyber','fires','military'] as const;
type Layer = typeof ALL_LAYERS[number];

const LAYER_CONFIG: Record<Layer, { label: string; icon: string; color: string }> = {
  signals:    { label: 'Signals',   icon: '💥', color: '#ff2020' },
  flights:    { label: 'Flights',   icon: '✈️', color: '#ff6600' },
  earthquakes:{ label: 'Quakes',   icon: '🌍', color: '#ffcc00' },
  ships:      { label: 'Ships',     icon: '🚢', color: '#00ccff' },
  cyber:      { label: 'Cyber',     icon: '💻', color: '#00ff88' },
  fires:      { label: 'Fires',     icon: '🔥', color: '#ff4400' },
  military:   { label: 'Recon',     icon: '🛩️', color: '#aa88ff' },
};

const TEXTURE_PRESETS = [
  { id: 'topo',   label: 'Topo',  url: '/textures/earth-topo-bathy.jpg' },
  { id: 'day',    label: 'Day',   url: '/textures/earth-day.jpg' },
  { id: 'marble', label: 'Blue',  url: '/textures/earth-blue-marble.jpg' },
];

export default function Globe3DView({ signals = [] }: Globe3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<Layer>>(new Set(['signals','flights','earthquakes','ships']));
  const [flights, setFlights] = useState<any[]>([]);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [cyberThreats, setCyberThreats] = useState<any[]>([]);
  const [fires, setFires] = useState<any[]>([]);
  const [militaryAircraft, setMilitaryAircraft] = useState<any[]>([]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [texture, setTexture] = useState(TEXTURE_PRESETS[0]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [counts, setCounts] = useState<Record<Layer, number>>({
    signals: 0, flights: 0, earthquakes: 0, ships: 0, cyber: 0, fires: 0, military: 0
  });

  const toggleLayer = (layer: Layer) => setActiveLayers(prev => {
    const next = new Set(prev);
    next.has(layer) ? next.delete(layer) : next.add(layer);
    return next;
  });

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      const [f, e, s, c, fi, m] = await Promise.allSettled([
        fetch('/api/flights').then(r=>r.json()),
        fetch('/api/earthquakes').then(r=>r.json()),
        fetch('/api/ships').then(r=>r.json()),
        fetch('/api/cyber').then(r=>r.json()),
        fetch('/api/fires').then(r=>r.json()),
        fetch('/api/military-aircraft').then(r=>r.json()),
      ]);
      const fl = f.status==='fulfilled' ? f.value.flights||[] : [];
      const eq = e.status==='fulfilled' ? e.value.earthquakes||[] : [];
      const sh = s.status==='fulfilled' ? s.value.ships||[] : [];
      const cy = c.status==='fulfilled' ? c.value.threats||[] : [];
      const fi2 = fi.status==='fulfilled' ? fi.value.fires||[] : [];
      const mil = m.status==='fulfilled' ? m.value.aircraft||[] : [];
      setFlights(fl); setEarthquakes(eq); setShips(sh);
      setCyberThreats(cy); setFires(fi2); setMilitaryAircraft(mil);
      setCounts({
        signals: signals.filter(s=>s.lat&&s.lon).length || 10,
        flights: fl.length, earthquakes: eq.length,
        ships: sh.length, cyber: cy.length,
        fires: fi2.length, military: mil.length,
      });
    };
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCounts(prev => ({ ...prev, signals: signals.filter(s=>s.lat&&s.lon).length || 10 }));
  }, [signals]);

  const getHtmlMarkers = useCallback(() => {
    const markers: any[] = [];

    if (activeLayers.has('signals')) {
      const hotspots = [
        { lat:32.0, lng:35.0, label:'Middle East Theater', icon:'💥', color:'#ff2020', kind:'signal' },
        { lat:50.0, lng:30.0, label:'Ukraine Conflict Zone', icon:'⚔️', color:'#ff8800', kind:'signal' },
        { lat:35.7, lng:51.4, label:'Iran', icon:'☢️', color:'#ff8800', kind:'signal' },
        { lat:14.5, lng:44.2, label:'Yemen', icon:'💥', color:'#ff2020', kind:'signal' },
        { lat:26.8, lng:57.0, label:'Strait of Hormuz', icon:'🚢', color:'#ff2020', kind:'signal' },
        { lat:12.4, lng:43.1, label:'Red Sea / Bab-el-Mandeb', icon:'⚠️', color:'#ff2020', kind:'signal' },
        { lat:55.7, lng:37.6, label:'Moscow', icon:'⚠️', color:'#ff8800', kind:'signal' },
        { lat:15.5, lng:32.5, label:'Sudan Conflict', icon:'⚔️', color:'#ff8800', kind:'signal' },
        { lat:33.9, lng:67.7, label:'Afghanistan', icon:'⚠️', color:'#ff8800', kind:'signal' },
        { lat:23.7, lng:90.4, label:'South Asia', icon:'⚠️', color:'#ffcc00', kind:'signal' },
      ];
      const sigMarkers = signals.filter(s=>s.lat&&s.lon).map(s=>({
        lat:s.lat!, lng:s.lon!, label:s.title, kind:'signal',
        icon: s.severity==='CRITICAL'?'💥':s.severity==='HIGH'?'⚠️':'📍',
        color: s.severity==='CRITICAL'?'#ff2020':s.severity==='HIGH'?'#ff8800':'#ffcc00',
      }));
      markers.push(...(sigMarkers.length>3?sigMarkers:hotspots));
    }

    if (activeLayers.has('flights')) {
      flights.slice(0,80).filter(f=>f.lat&&f.lon).forEach(f=>{
        markers.push({
          lat:f.lat, lng:f.lon, kind:'flight',
          label:`✈ ${f.callsign||'Unknown'}\n${f.country}\nAlt: ${Math.round(f.altitude||0)}m`,
          icon:'✈️', color:'#ff6600',
        });
      });
    }

    if (activeLayers.has('earthquakes')) {
      earthquakes.slice(0,50).filter(e=>e.lat&&e.lon).forEach(e=>{
        markers.push({
          lat:e.lat, lng:e.lon, kind:'quake',
          label:`🌍 M${e.magnitude}\n${e.place}\nDepth: ${e.depth}km`,
          icon: e.magnitude>=6?'🔴':e.magnitude>=5?'🟠':'🟡',
          color: e.magnitude>=6?'#ff2020':e.magnitude>=5?'#ff8800':'#ffcc00',
        });
      });
    }

    if (activeLayers.has('ships')) {
      ships.slice(0,30).filter(s=>s.lat&&s.lon).forEach(s=>{
        markers.push({
          lat:s.lat, lng:s.lon, kind:'ship',
          label:`🚢 ${s.name||'Unknown'}\n${s.type||'vessel'} · ${s.flag||''}\nDest: ${s.destination||'Unknown'}`,
          icon:'🚢', color:'#00ccff',
        });
      });
    }

    if (activeLayers.has('cyber')) {
      cyberThreats.filter(c=>c.lat&&c.lon).forEach(c=>{
        markers.push({
          lat:c.lat, lng:c.lon, kind:'cyber',
          label:`💻 ${c.title}\n${c.attribution||'Unknown'}\nTarget: ${c.target}`,
          icon:'💻', color:'#00ff88',
        });
      });
    }

    if (activeLayers.has('fires')) {
      fires.slice(0,40).filter(f=>f.lat&&f.lon).forEach(f=>{
        markers.push({
          lat:f.lat, lng:f.lon, kind:'fire',
          label:`🔥 Satellite Fire\n${f.country||'Unknown'}\nBrightness: ${f.brightness}K`,
          icon:'🔥', color:'#ff4400',
        });
      });
    }

    if (activeLayers.has('military')) {
      militaryAircraft.filter(a=>a.lat&&a.lon).forEach(a=>{
        markers.push({
          lat:a.lat, lng:a.lon, kind:'military',
          label:`🛩️ ${a.callsign}\n${a.type||'Military'} · ${a.country}\nAlt: ${Math.round(a.altitude||0)}ft`,
          icon:'🛩️', color:'#aa88ff',
        });
      });
    }

    return markers;
  }, [activeLayers, signals, flights, earthquakes, ships, cyberThreats, fires, militaryAircraft]);

  const getArcs = useCallback(() => {
    const arcs: any[] = [
      {startLat:32,startLng:35,endLat:26.8,endLng:57,color:'#ff2020cc'},
      {startLat:14.5,startLng:44.2,endLat:12.4,endLng:43.1,color:'#ff8800cc'},
      {startLat:50,startLng:30,endLat:55.7,endLng:37.6,color:'#ff6600cc'},
      {startLat:38.9,startLng:-77,endLat:51.5,endLng:-0.1,color:'#4488ffcc'},
      {startLat:35.7,startLng:51.4,endLat:26.8,endLng:57,color:'#ff4400cc'},
    ];
    if (activeLayers.has('cyber')) {
      cyberThreats.slice(0,5).filter(c=>c.lat&&c.lon).forEach(c=>{
        arcs.push({startLat:c.lat,startLng:c.lon,endLat:48.8,endLng:2.3,color:'#00ff8880'});
      });
    }
    return arcs;
  }, [activeLayers, cyberThreats]);

  const makeEl = useCallback((marker: any) => {
    const el = document.createElement('div');
    el.style.cssText = 'cursor:pointer;user-select:none;transform:translate(-50%,-50%);position:relative;';
    const size = marker.kind==='fire'?'13px':marker.kind==='flight'||marker.kind==='military'?'14px':'18px';
    el.innerHTML = `<div 
      title="${marker.label.replace(/\n/g,' · ')}" 
      style="font-size:${size};filter:drop-shadow(0 0 5px ${marker.color});transition:transform 0.15s,filter 0.15s"
      onmouseover="this.style.transform='scale(1.8)';this.style.filter='drop-shadow(0 0 8px ${marker.color})'"
      onmouseout="this.style.transform='scale(1)';this.style.filter='drop-shadow(0 0 5px ${marker.color})'">
      ${marker.icon}
    </div>`;
    el.onclick = () => setSelectedMarker(marker);
    return el;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    const initGlobe = async () => {
      try {
        const GlobeModule = await import('globe.gl');
        const GlobeCtor = GlobeModule.default as any;
        if (destroyed || !containerRef.current) return;
        const el = containerRef.current;
        const globe = new GlobeCtor(el);
        globe
          .width(el.clientWidth||600).height(el.clientHeight||500)
          .backgroundColor('rgba(0,0,0,0)')
          .globeImageUrl(texture.url)
          .bumpImageUrl('/textures/earth-water.png')
          .backgroundImageUrl('/textures/night-sky.png')
          .atmosphereColor('#4466cc')
          .atmosphereAltitude(0.15)
          .htmlElementsData([])
          .htmlLat((d:any)=>d.lat)
          .htmlLng((d:any)=>d.lng)
          .htmlAltitude(0.01)
          .htmlElement((d:any)=>makeEl(d))
          .arcsData([])
          .arcStartLat((d:any)=>d.startLat).arcStartLng((d:any)=>d.startLng)
          .arcEndLat((d:any)=>d.endLat).arcEndLng((d:any)=>d.endLng)
          .arcColor((d:any)=>d.color)
          .arcDashLength(0.4).arcDashGap(0.2).arcDashAnimateTime(2000)
          .arcStroke(0.6).arcAltitudeAutoScale(0.35)
          // Country polygons for subtle borders
          .polygonsData([])
          .polygonCapColor(()=>'rgba(0,0,0,0)')
          .polygonSideColor(()=>'rgba(255,255,255,0.02)')
          .polygonStrokeColor(()=>'rgba(255,255,255,0.05)');

        globe.controls().autoRotate = autoRotate;
        globe.controls().autoRotateSpeed = 0.3;
        globe.controls().enableZoom = true;
        globe.pointOfView({lat:30,lng:45,altitude:2.2},1000);
        globeRef.current = globe;
        setIsLoaded(true);

        const obs = new ResizeObserver(e=>{
          globe.width(e[0].contentRect.width).height(e[0].contentRect.height);
        });
        obs.observe(el);
      } catch(err) { setError('Failed to load 3D globe'); }
    };
    initGlobe();
    return ()=>{ destroyed=true; };
  }, []);

  // Update markers when data or layers change
  useEffect(() => {
    if (!globeRef.current||!isLoaded) return;
    globeRef.current.htmlElementsData(getHtmlMarkers()).arcsData(getArcs());
  }, [getHtmlMarkers, getArcs, isLoaded]);

  // Update texture
  useEffect(() => {
    if (!globeRef.current||!isLoaded) return;
    globeRef.current.globeImageUrl(texture.url);
  }, [texture, isLoaded]);

  // Toggle auto-rotate
  useEffect(() => {
    if (!globeRef.current||!isLoaded) return;
    globeRef.current.controls().autoRotate = autoRotate;
  }, [autoRotate, isLoaded]);

  const totalMarkers = getHtmlMarkers().length;

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 border-b border-white/10 backdrop-blur-sm">
        {/* Top row */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-accent-green">🌐 3D GLOBE</span>
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
            <span className="text-[8px] font-mono text-text-dim">{totalMarkers} markers</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Texture switcher */}
            {TEXTURE_PRESETS.map(t=>(
              <button key={t.id} onClick={()=>setTexture(t)}
                className={`px-1.5 py-0.5 rounded text-[7px] font-mono border transition-all ${texture.id===t.id?'bg-accent-green/20 text-accent-green border-accent-green/30':'text-white/30 border-white/10 hover:text-white/60'}`}>
                {t.label}
              </button>
            ))}
            <div className="w-px h-3 bg-white/10" />
            {/* Auto-rotate toggle */}
            <button onClick={()=>setAutoRotate(p=>!p)}
              className={`px-2 py-0.5 rounded text-[7px] font-mono border transition-all ${autoRotate?'bg-accent-blue/20 text-accent-blue border-accent-blue/30':'text-white/30 border-white/10'}`}>
              {autoRotate?'⟳ AUTO':'⏸ PAUSE'}
            </button>
          </div>
        </div>
        {/* Layer toggles */}
        <div className="flex items-center gap-1 px-3 pb-1.5 overflow-x-auto scrollbar-none">
          {ALL_LAYERS.map(layer => {
            const cfg = LAYER_CONFIG[layer];
            const active = activeLayers.has(layer);
            const count = counts[layer];
            return (
              <button key={layer} onClick={()=>toggleLayer(layer)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono border transition-all flex-shrink-0 ${active?'bg-white/10 text-white border-white/20':'text-white/25 border-white/[0.08] hover:text-white/50'}`}
                style={active?{borderColor:cfg.color+'50',color:cfg.color}:{}}>
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                {count>0&&<span className="opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Globe */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Selected marker popup */}
      {selectedMarker && (
        <div className="absolute top-24 right-3 z-20 bg-black/90 border border-white/20 rounded-lg p-3 max-w-xs backdrop-blur-sm"
          style={{borderColor: selectedMarker.color+'40'}}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-lg">{selectedMarker.icon}</span>
                <span className="text-[9px] font-mono font-bold text-white/80 uppercase">{selectedMarker.kind}</span>
              </div>
              <div className="text-[9px] font-mono text-white/70 whitespace-pre-line leading-relaxed">
                {selectedMarker.label}
              </div>
            </div>
            <button onClick={()=>setSelectedMarker(null)} className="text-white/30 hover:text-white text-xs flex-shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Loading */}
      {!isLoaded&&!error&&(
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
          <div className="w-10 h-10 border-2 border-accent-green border-t-transparent rounded-full animate-spin mb-3"/>
          <span className="text-[11px] font-mono text-accent-green animate-pulse">Initializing 3D Globe...</span>
          <span className="text-[9px] font-mono text-text-dim mt-1">Loading {ALL_LAYERS.length} data layers</span>
        </div>
      )}
      {error&&(
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <span className="text-[11px] font-mono text-accent-red">{error}</span>
        </div>
      )}

      {/* Bottom info bar */}
      {isLoaded&&(
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="px-2 py-1 bg-black/70 border border-white/10 rounded text-[8px] font-mono text-text-dim backdrop-blur-sm">
            Drag to rotate · Scroll to zoom · Click marker for details
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/70 border border-white/10 rounded backdrop-blur-sm">
            {Array.from(activeLayers).map(l=>(
              <div key={l} className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:LAYER_CONFIG[l].color}} title={LAYER_CONFIG[l].label}/>
            ))}
            <span className="text-[8px] font-mono text-text-dim ml-1">{activeLayers.size} active</span>
          </div>
        </div>
      )}
    </div>
  );
}
