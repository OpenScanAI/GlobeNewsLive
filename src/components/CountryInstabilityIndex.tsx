'use client';
import { useState } from 'react';
import { Signal } from '@/types';
const BASE = [
  { country:"Iran", flag:"🇮🇷", score:94, trend:"up", category:"critical" },
  { country:"Russia", flag:"🇷🇺", score:89, trend:"stable", category:"critical" },
  { country:"Ukraine", flag:"🇺🇦", score:87, trend:"down", category:"critical" },
  { country:"Israel", flag:"🇮🇱", score:85, trend:"up", category:"critical" },
  { country:"Sudan", flag:"🇸🇩", score:82, trend:"up", category:"high" },
  { country:"Myanmar", flag:"🇲🇲", score:78, trend:"stable", category:"high" },
  { country:"Yemen", flag:"🇾🇪", score:76, trend:"down", category:"high" },
  { country:"Syria", flag:"🇸🇾", score:74, trend:"stable", category:"high" },
  { country:"Pakistan", flag:"🇵🇰", score:65, trend:"up", category:"elevated" },
  { country:"Lebanon", flag:"🇱🇧", score:63, trend:"up", category:"elevated" },
];
function catStyle(cat: string) {
  return cat === 'critical' ? { color:'#ff2d55', bar:'#ff2d55' } : cat === 'high' ? { color:'#f97316', bar:'#f97316' } : { color:'#f59e0b', bar:'#f59e0b' };
}
export default function CountryInstabilityIndex({ signals = [] }: { signals?: Signal[] }) {
  const [sortBy, setSortBy] = useState<'score'|'signals'>('score');
  const scores = BASE.map(c => {
    const sigs = signals.filter(s => s.title.toLowerCase().includes(c.country.toLowerCase())).length;
    return { ...c, score: Math.min(100, c.score + Math.min(10, sigs * 2)), signals: sigs };
  }).sort((a, b) => sortBy === 'score' ? b.score - a.score : b.signals - a.signals);
  return (
    <div style={{ background:'#12121c', border:'0.5px solid rgba(156,116,245,0.15)', borderRadius:'8px', overflow:'hidden' }}>
      <div style={{ borderBottom:'0.5px solid rgba(156,116,245,0.08)', padding:'8px 12px', background:'#0d0d14' }} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🌡️</span>
          <span className="text-[11px] font-bold uppercase" style={{ color:'#9c74f5', letterSpacing:'0.08em' }}>INSTABILITY INDEX</span>
        </div>
        <div className="flex gap-1">
          {(['score','signals'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: sortBy===s ? 'rgba(156,116,245,0.2)' : 'transparent', color: sortBy===s ? '#9c74f5' : '#5c5a72', border:`0.5px solid ${sortBy===s ? 'rgba(156,116,245,0.3)' : 'transparent'}` }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {scores.map((c, i) => {
        const s = catStyle(c.category);
        return (
          <div key={c.country} className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: i < scores.length-1 ? '0.5px solid rgba(156,116,245,0.06)' : 'none' }}>
            <span className="text-[10px] w-4 font-mono text-center" style={{ color:'#5c5a72' }}>{i+1}</span>
            <span className="text-sm">{c.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px]" style={{ color:'#e8e6f0' }}>{c.country}</span>
                <div className="flex items-center gap-1.5">
                  {c.signals > 0 && <span className="text-[8px] font-mono" style={{ color:'#9c74f5' }}>{c.signals}▲</span>}
                  <span className="text-[8px]" style={{ color: c.trend==='up' ? '#ff2d55' : c.trend==='down' ? '#00c896' : '#9d9ab0' }}>{c.trend==='up'?'↑':c.trend==='down'?'↓':'→'}</span>
                  <span className="text-[11px] font-mono font-bold" style={{ color:s.color }}>{c.score}</span>
                </div>
              </div>
              <div className="h-1 rounded-full" style={{ background:'rgba(156,116,245,0.08)' }}>
                <div className="h-full rounded-full" style={{ width:`${c.score}%`, background:s.bar }} />
              </div>
            </div>
          </div>
        );
      })}
      <div className="px-3 py-1 text-[8px] font-mono" style={{ color:'#5c5a72', borderTop:'0.5px solid rgba(156,116,245,0.06)' }}>CII · signal-weighted · live</div>
    </div>
  );
}
