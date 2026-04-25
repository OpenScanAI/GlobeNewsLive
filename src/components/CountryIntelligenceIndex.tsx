'use client';

import { useState, useEffect } from 'react';

interface CountryScore {
  code: string;
  name: string;
  flag: string;
  score: number;
  level: 'critical' | 'high' | 'elevated' | 'normal' | 'low';
  trend: 'rising' | 'stable' | 'falling';
  change24h: number;
  components: {
    unrest: number;
    conflict: number;
    security: number;
    information: number;
  };
}

const COUNTRIES: CountryScore[] = [
  { code:'IR', name:'Iran', flag:'🇮🇷', score:99, level:'critical', trend:'rising', change24h:+4,
    components:{unrest:95,conflict:100,security:90,information:80} },
  { code:'RU', name:'Russia', flag:'🇷🇺', score:88, level:'critical', trend:'stable', change24h:0,
    components:{unrest:70,conflict:100,security:85,information:80} },
  { code:'UA', name:'Ukraine', flag:'🇺🇦', score:85, level:'critical', trend:'stable', change24h:-1,
    components:{unrest:60,conflict:100,security:75,information:70} },
  { code:'PS', name:'Palestine', flag:'🇵🇸', score:97, level:'critical', trend:'rising', change24h:+2,
    components:{unrest:90,conflict:100,security:95,information:85} },
  { code:'YE', name:'Yemen', flag:'🇾🇪', score:92, level:'critical', trend:'rising', change24h:+3,
    components:{unrest:85,conflict:100,security:90,information:75} },
  { code:'SD', name:'Sudan', flag:'🇸🇩', score:88, level:'critical', trend:'rising', change24h:+5,
    components:{unrest:80,conflict:95,security:85,information:60} },
  { code:'SY', name:'Syria', flag:'🇸🇾', score:82, level:'critical', trend:'stable', change24h:0,
    components:{unrest:75,conflict:90,security:80,information:65} },
  { code:'IQ', name:'Iraq', flag:'🇮🇶', score:75, level:'high', trend:'rising', change24h:+3,
    components:{unrest:70,conflict:80,security:75,information:60} },
  { code:'LB', name:'Lebanon', flag:'🇱🇧', score:72, level:'high', trend:'stable', change24h:0,
    components:{unrest:75,conflict:70,security:65,information:70} },
  { code:'AF', name:'Afghanistan', flag:'🇦🇫', score:78, level:'high', trend:'stable', change24h:-1,
    components:{unrest:70,conflict:85,security:80,information:55} },
  { code:'MM', name:'Myanmar', flag:'🇲🇲', score:70, level:'high', trend:'rising', change24h:+2,
    components:{unrest:75,conflict:80,security:65,information:50} },
  { code:'HT', name:'Haiti', flag:'🇭🇹', score:65, level:'high', trend:'rising', change24h:+4,
    components:{unrest:80,conflict:65,security:70,information:45} },
  { code:'CN', name:'China', flag:'🇨🇳', score:58, level:'elevated', trend:'stable', change24h:0,
    components:{unrest:45,conflict:55,security:65,information:80} },
  { code:'KP', name:'North Korea', flag:'🇰🇵', score:62, level:'elevated', trend:'rising', change24h:+2,
    components:{unrest:30,conflict:70,security:80,information:70} },
  { code:'PK', name:'Pakistan', flag:'🇵🇰', score:60, level:'elevated', trend:'stable', change24h:+1,
    components:{unrest:65,conflict:65,security:55,information:50} },
  { code:'SA', name:'Saudi Arabia', flag:'🇸🇦', score:45, level:'elevated', trend:'stable', change24h:0,
    components:{unrest:35,conflict:45,security:55,information:50} },
  { code:'TR', name:'Turkey', flag:'🇹🇷', score:42, level:'elevated', trend:'stable', change24h:-1,
    components:{unrest:50,conflict:40,security:40,information:45} },
  { code:'IL', name:'Israel', flag:'🇮🇱', score:80, level:'critical', trend:'rising', change24h:+3,
    components:{unrest:65,conflict:95,security:85,information:75} },
];

const LEVEL_COLOR: Record<string, string> = {
  critical: '#ff2244', high: '#ff6633', elevated: '#ffaa00', normal: '#00ccff', low: '#00ff88'
};
const LEVEL_BG: Record<string, string> = {
  critical: 'rgba(255,34,68,0.1)', high: 'rgba(255,102,51,0.1)', elevated: 'rgba(255,170,0,0.1)',
  normal: 'rgba(0,204,255,0.1)', low: 'rgba(0,255,136,0.1)'
};
const TREND_ICON: Record<string, string> = { rising: '↑', stable: '→', falling: '↓' };
const TREND_COLOR: Record<string, string> = { rising: '#ff4444', stable: '#888888', falling: '#44ff88' };

export default function CountryIntelligenceIndex() {
  const [filter, setFilter] = useState<'all'|'critical'|'high'|'elevated'>('all');
  const [sortBy, setSortBy] = useState<'score'|'trend'|'name'>('score');
  const [selected, setSelected] = useState<CountryScore|null>(null);
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES
    .filter(c => filter === 'all' || c.level === filter || (filter === 'high' && c.level === 'critical'))
    .filter(c => search === '' || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'trend') return (b.change24h) - (a.change24h);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="flex flex-col h-full bg-panel rounded-lg border border-border-default overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-subtle bg-elevated/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-white">🌍 COUNTRY INSTABILITY INDEX</span>
            <div className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse"/>
          </div>
          <div className="flex items-center gap-1">
            {(['score','trend','name'] as const).map(s=>(
              <button key={s} onClick={()=>setSortBy(s)}
                className={`px-1.5 py-0.5 rounded text-[7px] font-mono border transition-all ${sortBy===s?'bg-white/10 text-white border-white/20':'text-text-dim border-white/10 hover:text-white'}`}>
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {(['all','critical','high','elevated'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-2 py-0.5 rounded text-[8px] font-mono border transition-all ${filter===f?'bg-white/10 text-white border-white/20':'text-text-dim border-white/[0.08] hover:text-white'}`}
              style={filter===f&&f!=='all'?{borderColor:LEVEL_COLOR[f]+'50',color:LEVEL_COLOR[f]}:{}}>
              {f.toUpperCase()}
              {f!=='all'&&<span className="ml-1 opacity-60">({COUNTRIES.filter(c=>c.level===f).length})</span>}
            </button>
          ))}
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search..."
            className="ml-auto bg-white/[0.04] border border-white/[0.08] rounded px-2 py-0.5 text-[8px] font-mono text-white placeholder-text-dim outline-none w-20"/>
        </div>
      </div>

      {/* Country list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filtered.map((country, idx) => (
          <div key={country.code}
            onClick={()=>setSelected(selected?.code===country.code?null:country)}
            className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-all">
            <div className="flex items-center gap-2">
              {/* Rank */}
              <span className="text-[8px] font-mono text-text-dim w-4 flex-shrink-0">{idx+1}</span>
              {/* Flag + name */}
              <span className="text-sm flex-shrink-0">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-white/90">{country.name}</span>
                  <span className="text-[8px] font-mono" style={{color:TREND_COLOR[country.trend]}}>
                    {TREND_ICON[country.trend]}{Math.abs(country.change24h)>0?Math.abs(country.change24h):''}
                  </span>
                </div>
                {/* Score bar */}
                <div className="mt-1 h-1 bg-white/[0.06] rounded-full overflow-hidden w-full">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{width:`${country.score}%`, backgroundColor:LEVEL_COLOR[country.level]}}/>
                </div>
              </div>
              {/* Score */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[12px] font-mono font-bold" style={{color:LEVEL_COLOR[country.level]}}>
                  {country.score}
                </span>
                <span className="text-[7px] px-1 py-0.5 rounded font-mono font-bold"
                  style={{backgroundColor:LEVEL_BG[country.level],color:LEVEL_COLOR[country.level]}}>
                  {country.level.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Expanded details */}
            {selected?.code===country.code && (
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(country.components).map(([key,val])=>(
                    <div key={key} className="text-center">
                      <div className="text-[8px] font-mono text-text-dim uppercase mb-0.5">{key.slice(0,4)}</div>
                      <div className="text-[10px] font-mono font-bold" style={{color:val>=70?LEVEL_COLOR['critical']:val>=50?LEVEL_COLOR['high']:val>=30?LEVEL_COLOR['elevated']:'#00ff88'}}>
                        {val}
                      </div>
                      <div className="mt-0.5 h-0.5 bg-white/[0.06] rounded-full">
                        <div className="h-full rounded-full" style={{width:`${val}%`,backgroundColor:val>=70?LEVEL_COLOR['critical']:val>=50?LEVEL_COLOR['high']:val>=30?LEVEL_COLOR['elevated']:'#00ff88'}}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[8px] font-mono text-text-dim">
                  U: Unrest · C: Conflict · S: Security · I: Information
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[8px] font-mono text-text-dim">{filtered.length} countries · CII v2.6</span>
        <span className="text-[8px] font-mono text-text-dim">Updated live</span>
      </div>
    </div>
  );
}
