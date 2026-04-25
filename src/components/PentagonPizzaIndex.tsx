'use client';
import { useState, useEffect } from 'react';
const LOCATIONS = [
  { name: "Domino's Pentagon", facility: "Pentagon", baseline: 45 },
  { name: "Pizza Hut Arlington", facility: "Pentagon", baseline: 40 },
  { name: "McDonald's Langley", facility: "CIA HQ", baseline: 35 },
  { name: "Subway NSA Campus", facility: "NSA", baseline: 30 },
  { name: "7-Eleven State Dept", facility: "State Dept", baseline: 38 },
  { name: "Papa John's DIA", facility: "DIA", baseline: 32 },
];
const LEVELS = [
  { level:1, label:"QUIET", color:"#00c896" },
  { level:2, label:"ELEVATED", color:"#60a5fa" },
  { level:3, label:"ACTIVE", color:"#f59e0b" },
  { level:4, label:"HEIGHTENED", color:"#f97316" },
  { level:5, label:"CRITICAL", color:"#ff2d55" },
];
function genActivity(baseline: number) {
  const hour = new Date().getHours();
  const lateBoost = (hour >= 22 || hour <= 4) ? Math.random() * 30 : 0;
  return Math.min(100, Math.max(0, Math.round(baseline + Math.random() * 40 - 10 + lateBoost)));
}
export default function PentagonPizzaIndex() {
  const [locs, setLocs] = useState(() => LOCATIONS.map(l => ({ ...l, activity: genActivity(l.baseline), spiking: false })));
  const [expanded, setExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => {
      setLocs(prev => prev.map(l => { const a = genActivity(l.baseline); return { ...l, activity: a, spiking: a > l.baseline * 1.4 }; }));
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(t);
  }, []);
  const avg = Math.round(locs.reduce((s, l) => s + l.activity, 0) / locs.length);
  const spikes = locs.filter(l => l.spiking).length;
  const lvl = avg >= 80 ? 5 : avg >= 65 ? 4 : avg >= 50 ? 3 : avg >= 35 ? 2 : 1;
  const r = LEVELS[lvl - 1];
  return (
    <div style={{ background:'#12121c', border:'0.5px solid rgba(156,116,245,0.15)', borderRadius:'8px', overflow:'hidden' }}>
      <div style={{ borderBottom:'0.5px solid rgba(156,116,245,0.08)', padding:'8px 12px', background:'#0d0d14', cursor:'pointer' }} className="flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <span>🍕</span>
          <span className="text-[11px] font-bold uppercase" style={{ color:'#9c74f5', letterSpacing:'0.08em' }}>PENTAGON PIZZA INDEX</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color:r.color, background:`${r.color}20`, border:`0.5px solid ${r.color}40` }}>{r.label}</span>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[28px] font-mono font-bold" style={{ color:r.color }}>{avg}%</div>
            <div className="text-[9px] font-mono" style={{ color:'#5c5a72' }}>avg activity vs baseline</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono" style={{ color:'#9d9ab0' }}>{spikes}/{locs.length}</div>
            <div className="text-[9px]" style={{ color:'#5c5a72' }}>locations spiking</div>
          </div>
        </div>
        <div className="h-1.5 rounded-full mb-2" style={{ background:'rgba(156,116,245,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width:`${avg}%`, background:r.color }} />
        </div>
        <div className="flex gap-1 mb-1">
          {LEVELS.map(l => <div key={l.level} className="flex-1 h-1 rounded-sm" style={{ background: l.level <= lvl ? l.color : 'rgba(156,116,245,0.1)' }} />)}
        </div>
        <div className="text-[9px] font-mono" style={{ color:'#5c5a72' }}>updated {lastUpdate.toLocaleTimeString()}</div>
      </div>
      {expanded && (
        <div style={{ borderTop:'0.5px solid rgba(156,116,245,0.08)' }}>
          {locs.map((l, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: i < locs.length-1 ? '0.5px solid rgba(156,116,245,0.06)' : 'none' }}>
              <div>
                <div className="text-[10px]" style={{ color:'#e8e6f0' }}>{l.name}</div>
                <div className="text-[8px]" style={{ color:'#5c5a72' }}>{l.facility}</div>
              </div>
              <div className="flex items-center gap-2">
                {l.spiking && <span className="text-[8px] animate-pulse" style={{ color:'#ff2d55' }}>● SPIKE</span>}
                <span className="text-[11px] font-mono font-bold" style={{ color: l.spiking ? '#ff2d55' : '#9d9ab0' }}>{l.activity}%</span>
              </div>
            </div>
          ))}
          <div className="px-3 py-1 text-[8px] font-mono" style={{ color:'#5c5a72' }}>Simulated OSINT · inspired by worldmonitor.app</div>
        </div>
      )}
    </div>
  );
}
