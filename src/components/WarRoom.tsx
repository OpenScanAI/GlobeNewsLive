'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Signal } from '@/types';
import { ACTIVE_CONFLICTS } from '@/lib/feeds';

interface ConflictEvent {
  id: string;
  event_date: string;
  event_type: string;
  actor1: string;
  actor2?: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  notes: string;
  source: string;
}

interface WarRoomProps {
  signals: Signal[];
  conflicts?: ConflictEvent[];
}

const THEATERS = [
  { id: 'global',     name: 'GLOBAL',      icon: '🌍', lat: 20,  lon: 20,  alt: 2.2 },
  { id: 'ukraine',    name: 'UKRAINE',     icon: '🇺🇦', lat: 48.5, lon: 37.5, alt: 0.8 },
  { id: 'middleeast', name: 'MID EAST',    icon: '🕌', lat: 31,  lon: 40,  alt: 0.9 },
  { id: 'africa',     name: 'SAHEL',       icon: '🌍', lat: 12,  lon: 20,  alt: 1.2 },
  { id: 'asia',       name: 'ASIA-PAC',    icon: '🌏', lat: 20,  lon: 115, alt: 1.5 },
];

const FILTER_TYPES = [
  { id: 'all',      label: 'ALL',      icon: '🌐', color: '#ffffff' },
  { id: 'conflict', label: 'CONFLICT', icon: '⚔️', color: '#ff2244' },
  { id: 'military', label: 'MILITARY', icon: '✈️', color: '#ff6600' },
  { id: 'cyber',    label: 'CYBER',    icon: '💻', color: '#00ff88' },
  { id: 'nuclear',  label: 'NUCLEAR',  icon: '☢️', color: '#ffcc00' },
];

const HOTSPOT_MARKERS = [
  { lat:32.0,  lng:35.0,  label:'Middle East Theater',     icon:'💥', color:'#ff2020', type:'conflict', pulse:true  },
  { lat:50.0,  lng:30.0,  label:'Ukraine Front Line',      icon:'⚔️', color:'#ff8800', type:'conflict', pulse:true  },
  { lat:35.7,  lng:51.4,  label:'Iran — Nuclear Program',  icon:'☢️', color:'#ffcc00', type:'nuclear',  pulse:true  },
  { lat:14.5,  lng:44.2,  label:'Yemen — Houthi Ops',      icon:'🚀', color:'#ff2020', type:'conflict', pulse:true  },
  { lat:26.8,  lng:57.0,  label:'Strait of Hormuz',        icon:'🚢', color:'#ff4400', type:'conflict', pulse:false },
  { lat:12.4,  lng:43.1,  label:'Red Sea / Bab-el-Mandeb', icon:'⚠️', color:'#ff6600', type:'conflict', pulse:false },
  { lat:55.7,  lng:37.6,  label:'Moscow — HQ',             icon:'🎯', color:'#ff8800', type:'military', pulse:false },
  { lat:15.5,  lng:32.5,  label:'Sudan Civil War',         icon:'⚔️', color:'#ff8800', type:'conflict', pulse:true  },
  { lat:33.9,  lng:67.7,  label:'Afghanistan',             icon:'⚠️', color:'#ff8800', type:'conflict', pulse:false },
  { lat:50.85, lng:4.35,  label:'APT29 — EU Networks',     icon:'💻', color:'#00ff88', type:'cyber',    pulse:true  },
  { lat:38.9,  lng:-77.0, label:'Pentagon / CENTCOM',      icon:'🏛️', color:'#4488ff', type:'military', pulse:false },
  { lat:22.3,  lng:114.2, label:'Hong Kong — PLA Activity',icon:'🎖️', color:'#aa88ff', type:'military', pulse:false },
  { lat:39.0,  lng:125.8, label:'North Korea — ICBM Site', icon:'🚀', color:'#ffcc00', type:'nuclear',  pulse:true  },
  { lat:23.5,  lng:58.5,  label:'Oman — Naval Watch',      icon:'🚢', color:'#00ccff', type:'military', pulse:false },
];

export default function WarRoom({ signals, conflicts = [] }: WarRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [isGlobeLoaded, setIsGlobeLoaded] = useState(false);
  const [activeTheater, setActiveTheater] = useState('global');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [time, setTime] = useState(new Date());
  const [flights, setFlights] = useState<any[]>([]);
  const [cyberThreats, setCyberThreats] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/flights').then(r=>r.json()).then(d=>setFlights(d.flights||[])).catch(()=>{});
    fetch('/api/cyber').then(r=>r.json()).then(d=>setCyberThreats(d.threats||[])).catch(()=>{});
  }, []);

  const utcTime = time.toUTCString().substring(17, 25);
  const utcDate = time.toISOString().substring(0, 10);

  const theaterConflicts = activeTheater === 'global' ? conflicts : conflicts.filter(c => {
    if (activeTheater === 'ukraine') return c.country === 'Ukraine';
    if (activeTheater === 'middleeast') return ['Palestine','Lebanon','Syria','Yemen','Iran','Israel','Iraq'].includes(c.country);
    if (activeTheater === 'africa') return ['Sudan','Mali','Niger','Burkina Faso','Somalia','Ethiopia'].includes(c.country);
    if (activeTheater === 'asia') return ['Myanmar','China','Taiwan','Philippines','North Korea'].includes(c.country);
    return true;
  });

  const getMarkers = useCallback(() => {
    let markers = [...HOTSPOT_MARKERS];
    if (activeFilter !== 'all') {
      markers = markers.filter(m => m.type === activeFilter);
    }
    // Add live flight markers
    if (activeFilter === 'all' || activeFilter === 'military') {
      flights.slice(0,40).filter(f=>f.lat&&f.lon&&f.isMilitary).forEach(f=>{
        markers.push({ lat:f.lat, lng:f.lon, label:`${f.callsign||'Unknown'}\n${f.country}\n${f.category||'Military'}`, icon:'✈️', color:'#ff6600', type:'military', pulse:false });
      });
    }
    if (activeFilter === 'all' || activeFilter === 'cyber') {
      cyberThreats.filter(c=>c.lat&&c.lon).forEach(c=>{
        markers.push({ lat:c.lat, lng:c.lon, label:`${c.title}\n${c.attribution||'Unknown'}`, icon:'💻', color:'#00ff88', type:'cyber', pulse:c.severity==='critical' });
      });
    }
    // Add signal markers
    signals.filter(s=>s.lat&&s.lon&&s.severity==='CRITICAL').slice(0,10).forEach(s=>{
      markers.push({ lat:s.lat!, lng:s.lon!, label:s.title, icon:'💥', color:'#ff2020', type:'conflict', pulse:true });
    });
    return markers;
  }, [activeFilter, flights, cyberThreats, signals]);

  const makeEl = useCallback((marker: any) => {
    const el = document.createElement('div');
    el.style.cssText = 'cursor:pointer;user-select:none;transform:translate(-50%,-50%);position:relative;';
    el.innerHTML = `
      <div style="position:relative;display:inline-block">
        ${marker.pulse ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${marker.color}20;animation:warPulse 2s ease-in-out infinite"></div>` : ''}
        <div title="${marker.label.replace(/\n/g,' · ')}"
          style="font-size:16px;filter:drop-shadow(0 0 6px ${marker.color});transition:transform 0.15s,filter 0.15s;position:relative;z-index:1"
          onmouseover="this.style.transform='scale(2)';this.style.filter='drop-shadow(0 0 12px ${marker.color})'"
          onmouseout="this.style.transform='scale(1)';this.style.filter='drop-shadow(0 0 6px ${marker.color})'">
          ${marker.icon}
        </div>
      </div>`;
    el.onclick = () => setSelectedMarker(marker);
    return el;
  }, []);

  // Init globe
  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `@keyframes warPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.8);opacity:0} }`;
    document.head.appendChild(style);

    const initGlobe = async () => {
      try {
        const GlobeModule = await import('globe.gl');
        const GlobeCtor = GlobeModule.default as any;
        if (destroyed || !containerRef.current) return;
        const el = containerRef.current;
        const globe = new GlobeCtor(el);
        globe
          .width(el.clientWidth||800).height(el.clientHeight||600)
          .backgroundColor('rgba(0,0,0,0)')
          .globeImageUrl('/textures/earth-topo-bathy.jpg')
          .bumpImageUrl('/textures/earth-water.png')
          .backgroundImageUrl('/textures/night-sky.png')
          .atmosphereColor('#ff4444')
          .atmosphereAltitude(0.12)
          .htmlElementsData([])
          .htmlLat((d:any)=>d.lat)
          .htmlLng((d:any)=>d.lng)
          .htmlAltitude(0.01)
          .htmlElement((d:any)=>makeEl(d))
          .arcsData([
            {startLat:32,startLng:35,endLat:26.8,endLng:57,color:'#ff2020bb'},
            {startLat:14.5,startLng:44.2,endLat:12.4,endLng:43.1,color:'#ff8800bb'},
            {startLat:50,startLng:30,endLat:55.7,endLng:37.6,color:'#ff6600bb'},
            {startLat:35.7,startLng:51.4,endLat:32,endLng:35,color:'#ffcc00bb'},
            {startLat:38.9,startLng:-77,endLat:51.5,endLng:-0.1,color:'#4488ffbb'},
            {startLat:39,startLng:125.8,endLat:38.9,endLng:-77,color:'#ffcc0088'},
          ])
          .arcStartLat((d:any)=>d.startLat).arcStartLng((d:any)=>d.startLng)
          .arcEndLat((d:any)=>d.endLat).arcEndLng((d:any)=>d.endLng)
          .arcColor((d:any)=>d.color)
          .arcDashLength(0.3).arcDashGap(0.15).arcDashAnimateTime(1500)
          .arcStroke(0.8).arcAltitudeAutoScale(0.4);

        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.2;
        globe.controls().enableZoom = true;
        globe.pointOfView({lat:30,lng:45,altitude:2.2},1000);
        globeRef.current = globe;
        setIsGlobeLoaded(true);

        const obs = new ResizeObserver(e=>{
          globe.width(e[0].contentRect.width).height(e[0].contentRect.height);
        });
        obs.observe(el);
      } catch(err) { console.error('Globe error:', err); }
    };

    initGlobe();
    return () => { destroyed = true; };
  }, []);

  // Update markers
  useEffect(() => {
    if (!globeRef.current || !isGlobeLoaded) return;
    globeRef.current.htmlElementsData(getMarkers());
  }, [getMarkers, isGlobeLoaded]);

  // Focus on theater
  useEffect(() => {
    if (!globeRef.current || !isGlobeLoaded) return;
    const t = THEATERS.find(t=>t.id===activeTheater);
    if (t) {
      globeRef.current.pointOfView({lat:t.lat,lng:t.lon,altitude:t.alt},1200);
      globeRef.current.controls().autoRotate = activeTheater === 'global';
    }
  }, [activeTheater, isGlobeLoaded]);

  const criticalSignals = signals.filter(s=>s.severity==='CRITICAL'||s.severity==='HIGH').slice(0,5);

  return (
    <div className="h-full flex flex-col bg-void">
      {/* Header */}
      <div className="bg-elevated/80 border-b border-accent-red/30 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red/20 flex items-center justify-center border border-accent-red/40">
            <span className="text-lg">⚔️</span>
          </div>
          <div>
            <h2 className="font-mono text-[12px] font-bold tracking-wider text-accent-red">WAR ROOM</h2>
            <p className="text-[8px] text-text-muted font-mono">GLOBAL CONFLICT TRACKING · {conflicts.length} EVENTS · {getMarkers().length} MARKERS</p>
          </div>
        </div>

        {/* Theater selector */}
        <div className="flex items-center gap-1">
          {THEATERS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTheater(t.id)}
              className={`px-2 py-1 rounded text-[8px] font-mono transition-all ${activeTheater===t.id?'bg-accent-red/20 text-accent-red border border-accent-red/40':'text-text-dim hover:text-white hover:bg-white/5'}`}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-mono text-base text-white">{utcTime}</div>
            <div className="font-mono text-[8px] text-text-muted">{utcDate} UTC</div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-accent-red/10 rounded border border-accent-red/30">
            <div className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse"/>
            <span className="font-mono text-[9px] text-accent-red font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — conflict feed */}
        <aside className="w-64 border-r border-border-default flex flex-col flex-shrink-0">
          <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold text-accent-red">CONFLICT EVENTS</span>
            <span className="text-[8px] text-text-dim font-mono">{theaterConflicts.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {theaterConflicts.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-[9px] font-mono">No events in this theater</div>
            ) : theaterConflicts.map(c=>(
              <div key={c.id} className="px-2 py-2 border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                style={{borderLeft:`2px solid ${c.event_type.includes('Battles')?'#ff2244':'#ff6633'}`}}>
                <div className="flex items-start gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${c.event_type.includes('Battles')?'bg-accent-red animate-pulse':'bg-accent-orange'}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-white font-mono">{c.location}, {c.country}</div>
                    <div className="text-[8px] text-text-muted">{c.event_type}</div>
                    <div className="text-[8px] text-text-dim mt-0.5 truncate">{c.actor1}{c.actor2?` vs ${c.actor2}`:''}</div>
                    <div className="text-[8px] text-text-dim mt-0.5 line-clamp-2">{c.notes.substring(0,80)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Critical signals */}
          <div className="border-t border-border-default">
            <div className="px-3 py-1.5 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[9px] font-bold text-accent-red">⚠️ CRITICAL SIGNALS</span>
            </div>
            <div className="overflow-y-auto max-h-40 scrollbar-none">
              {criticalSignals.map(s=>(
                <div key={s.id} className="px-2 py-1.5 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="text-[8px] text-white leading-tight line-clamp-2">{s.title}</div>
                  <div className="text-[7px] text-text-dim mt-0.5 font-mono">{s.source} · {s.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center — Interactive Globe */}
        <section className="flex-1 relative overflow-hidden">
          {/* Filter bar */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-black/70 border border-white/10 rounded-lg px-2 py-1 backdrop-blur-sm">
            {FILTER_TYPES.map(f=>(
              <button key={f.id} onClick={()=>setActiveFilter(f.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono border transition-all ${activeFilter===f.id?'bg-white/10 border-white/20 text-white':'text-white/30 border-transparent hover:text-white/60'}`}
                style={activeFilter===f.id?{borderColor:f.color+'50',color:f.color}:{}}>
                <span>{f.icon}</span><span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Globe */}
          <div ref={containerRef} className="w-full h-full"/>

          {/* Loading */}
          {!isGlobeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div className="w-10 h-10 border-2 border-accent-red border-t-transparent rounded-full animate-spin mb-3"/>
              <span className="text-[11px] font-mono text-accent-red animate-pulse">Initializing War Room Globe...</span>
            </div>
          )}

          {/* Selected marker popup */}
          {selectedMarker && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/90 border rounded-lg px-4 py-3 backdrop-blur-sm min-w-64"
              style={{borderColor:selectedMarker.color+'40'}}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{selectedMarker.icon}</span>
                    <span className="text-[10px] font-mono font-bold text-white/90 uppercase">{selectedMarker.type}</span>
                    {selectedMarker.pulse && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor:selectedMarker.color}}/>}
                  </div>
                  <div className="text-[9px] font-mono text-white/70 whitespace-pre-line leading-relaxed">{selectedMarker.label}</div>
                </div>
                <button onClick={()=>setSelectedMarker(null)} className="text-white/30 hover:text-white text-xs flex-shrink-0">✕</button>
              </div>
            </div>
          )}

          {/* Bottom info */}
          {isGlobeLoaded && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/70 border border-white/10 rounded text-[8px] font-mono text-text-dim backdrop-blur-sm">
              {FILTER_TYPES.filter(f=>f.id!=='all').map(f=>(
                <span key={f.id} className="flex items-center gap-0.5">
                  <span style={{color:f.color}}>{f.icon}</span>
                </span>
              ))}
              <span className="ml-1">{getMarkers().length} active · Click marker for details</span>
            </div>
          )}
        </section>

        {/* Right — hotspots + stats */}
        <aside className="w-56 border-l border-border-default flex flex-col flex-shrink-0 overflow-y-auto scrollbar-none">
          {/* Active hotspots */}
          <div>
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 sticky top-0">
              <span className="font-mono text-[9px] font-bold text-accent-red">🔥 ACTIVE HOTSPOTS</span>
            </div>
            <div className="p-2 space-y-1">
              {ACTIVE_CONFLICTS.map(c=>(
                <div key={c.name} className="flex items-center justify-between px-2 py-1.5 bg-elevated/50 rounded hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${c.intensity==='high'?'bg-accent-red animate-pulse':'bg-accent-orange'}`}/>
                    <span className="text-[9px] text-white font-mono">{c.name}</span>
                  </div>
                  <span className={`text-[7px] font-mono px-1 py-0.5 rounded ${c.intensity==='high'?'bg-accent-red/20 text-accent-red':'bg-accent-orange/20 text-accent-orange'}`}>
                    {c.intensity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-border-default">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[9px] font-bold text-white">📊 CONFLICT STATS</span>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label:'Active Wars', value: ACTIVE_CONFLICTS.filter(c=>c.type==='war'||c.type==='civil war').length, color:'text-accent-red' },
                { label:'Insurgencies', value: ACTIVE_CONFLICTS.filter(c=>c.type==='insurgency').length, color:'text-accent-orange' },
                { label:'High Intensity', value: ACTIVE_CONFLICTS.filter(c=>c.intensity==='high').length, color:'text-accent-red' },
                { label:"Today's Events", value: conflicts.length, color:'text-white' },
                { label:'Critical Signals', value: signals.filter(s=>s.severity==='CRITICAL').length, color:'text-accent-red' },
                { label:'Military Flights', value: flights.length, color:'text-accent-orange' },
              ].map(s=>(
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[9px] text-text-muted font-mono">{s.label}</span>
                  <span className={`text-[11px] font-mono font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layer legend */}
          <div className="border-t border-border-default mt-auto">
            <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
              <span className="font-mono text-[9px] font-bold text-white">LEGEND</span>
            </div>
            <div className="p-2 space-y-1">
              {[
                { color:'#ff2020', label:'Active Conflict', icon:'💥' },
                { color:'#ff6600', label:'Military Asset', icon:'✈️' },
                { color:'#ffcc00', label:'Nuclear Site', icon:'☢️' },
                { color:'#00ff88', label:'Cyber Operation', icon:'💻' },
                { color:'#00ccff', label:'Naval Activity', icon:'🚢' },
              ].map(l=>(
                <div key={l.label} className="flex items-center gap-2">
                  <span className="text-[10px]">{l.icon}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor:l.color}}/>
                  <span className="text-[8px] font-mono text-text-dim">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
