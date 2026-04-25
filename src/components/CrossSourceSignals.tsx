'use client';

import { useState, useEffect } from 'react';

interface CrossSignal {
  id: string;
  type: string;
  theater: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detectedAt: number;
  sources: string[];
  signalCount: number;
}

const TYPE_LABEL: Record<string, string> = {
  'COMPOSITE_ESCALATION': 'COMPOSITE',
  'THERMAL_SPIKE': 'THERMAL',
  'GPS_JAMMING': 'GPS JAM',
  'MIL_FLIGHT_SURGE': 'MIL FLTX',
  'UNREST_SURGE': 'UNREST',
  'OREF_CLUSTER': 'ADVISORY',
  'VIX_SPIKE': 'VIX',
  'CYBER_CLUSTER': 'CYBER',
  'MARITIME_ANOMALY': 'MARITIME',
  'SIGNAL_CONVERGENCE': 'CONVERGENCE',
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ff2244', HIGH: '#ff8c8c', MEDIUM: '#ffcc00', LOW: '#888888'
};

const MOCK_SIGNALS: CrossSignal[] = [
  { id:'cs-1', type:'MIL_FLIGHT_SURGE', theater:'Iran Theater', severity:'CRITICAL',
    summary:'Simultaneous surge in military flights across Iran-Iraq-Israel corridor. 23 sorties detected in 2hr window.',
    detectedAt: Date.now()-15*60000, sources:['Military ADS-B','Telegram Intel','OSINT Feed'], signalCount:7 },
  { id:'cs-2', type:'MARITIME_ANOMALY', theater:'Strait of Hormuz', severity:'HIGH',
    summary:'3 tankers went dark (AIS off) near Hormuz. Coincides with Iranian naval exercise reports.',
    detectedAt: Date.now()-32*60000, sources:['AIS Tracker','Ship Feed','Reuters'], signalCount:5 },
  { id:'cs-3', type:'CYBER_CLUSTER', theater:'NATO Eastern Flank', severity:'HIGH',
    summary:'APT29 activity detected targeting 4 EU diplomatic networks simultaneously.',
    detectedAt: Date.now()-45*60000, sources:['Cyber Feed','CERT-EU','OSINT'], signalCount:4 },
  { id:'cs-4', type:'COMPOSITE_ESCALATION', theater:'Red Sea', severity:'CRITICAL',
    summary:'Houthi missile + drone + naval convergence detected. Multi-vector attack posture.',
    detectedAt: Date.now()-8*60000, sources:['OREF Sirens','Military Feed','Al Arabiya'], signalCount:9 },
  { id:'cs-5', type:'GPS_JAMMING', theater:'Eastern Mediterranean', severity:'MEDIUM',
    summary:'GPS jamming affecting 40+ aircraft over Cyprus-Lebanon corridor.',
    detectedAt: Date.now()-67*60000, sources:['Aviation Feed','GPS Monitor'], signalCount:3 },
  { id:'cs-6', type:'UNREST_SURGE', theater:'Iran Domestic', severity:'HIGH',
    summary:'Social media velocity spike + Telegram channel activity surge in Tehran, Isfahan.',
    detectedAt: Date.now()-90*60000, sources:['Social Velocity','Telegram Intel','Twitter'], signalCount:6 },
];

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff/60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m/60)}h ago`;
}

export default function CrossSourceSignals() {
  const [signals, setSignals] = useState<CrossSignal[]>(MOCK_SIGNALS);
  const [filter, setFilter] = useState<'all'|'CRITICAL'|'HIGH'|'MEDIUM'>('all');
  const [expanded, setExpanded] = useState<string|null>(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(s => ({...s, detectedAt: s.detectedAt})));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = signals.filter(s => filter === 'all' || s.severity === filter)
    .sort((a,b) => b.detectedAt - a.detectedAt);

  const critCount = signals.filter(s=>s.severity==='CRITICAL').length;

  return (
    <div className="flex flex-col h-full bg-panel rounded-lg border border-border-default overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-subtle bg-elevated/50">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-white">⚡ CROSS-SOURCE SIGNALS</span>
            {critCount>0&&(
              <span className="px-1.5 py-0.5 bg-accent-red/20 text-accent-red text-[8px] font-mono rounded border border-accent-red/30 animate-pulse">
                {critCount} CRITICAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[8px] font-mono text-text-dim">
            <div className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse"/>
            LIVE · {signals.length}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(['all','CRITICAL','HIGH','MEDIUM'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-2 py-0.5 rounded text-[7px] font-mono border transition-all ${filter===f?'bg-white/10 text-white border-white/20':'text-text-dim border-white/[0.08] hover:text-white'}`}
              style={filter===f&&f!=='all'?{borderColor:SEV_COLOR[f]+'50',color:SEV_COLOR[f]}:{}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filtered.map(sig=>(
          <div key={sig.id}
            onClick={()=>setExpanded(expanded===sig.id?null:sig.id)}
            className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02] cursor-pointer transition-all"
            style={{borderLeft:`2px solid ${SEV_COLOR[sig.severity]}`}}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {/* Type badge + theater */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-1 py-0.5 rounded text-[7px] font-mono font-bold"
                    style={{backgroundColor:SEV_COLOR[sig.severity]+'20',color:SEV_COLOR[sig.severity],border:`1px solid ${SEV_COLOR[sig.severity]}40`}}>
                    {TYPE_LABEL[sig.type]||sig.type}
                  </span>
                  <span className="text-[8px] font-mono text-accent-red font-bold">{sig.severity}</span>
                  <span className="text-[8px] font-mono text-text-dim">{sig.theater}</span>
                </div>
                {/* Summary */}
                <p className="text-[9px] font-mono text-white/70 leading-relaxed line-clamp-2">
                  {sig.summary}
                </p>
                {/* Expanded */}
                {expanded===sig.id&&(
                  <div className="mt-2 pt-2 border-t border-white/[0.06]">
                    <div className="text-[8px] font-mono text-text-dim mb-1">CONTRIBUTING SOURCES:</div>
                    <div className="flex flex-wrap gap-1">
                      {sig.sources.map(src=>(
                        <span key={src} className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.08] rounded text-[7px] font-mono text-white/60">
                          {src}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1.5 text-[8px] font-mono text-text-dim">
                      {sig.signalCount} signals correlated · Confidence: HIGH
                    </div>
                  </div>
                )}
              </div>
              {/* Right side */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[8px] font-mono text-text-dim">{relativeTime(sig.detectedAt)}</span>
                <span className="px-1 py-0.5 bg-white/[0.04] rounded text-[7px] font-mono text-text-dim">
                  ×{sig.signalCount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[8px] font-mono text-text-dim">{filtered.length} signals · Multi-source correlation</span>
        <span className="text-[8px] font-mono text-accent-green">● LIVE</span>
      </div>
    </div>
  );
}
