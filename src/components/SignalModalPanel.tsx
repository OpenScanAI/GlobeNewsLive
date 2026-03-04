'use client';

import { useState } from 'react';

interface Signal {
  id: string;
  type: 'military' | 'economic' | 'political' | 'cyber' | 'humanitarian' | 'environmental';
  title: string;
  summary: string;
  confidence: number;
  sources: Array<{ name: string; tier: 1 | 2 | 3; url?: string; verified: boolean }>;
  relatedSignals: Array<{ id: string; title: string; similarity: number }>;
  location?: string;
  coordinates?: { lat: number; lon: number };
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  analysis: string;
}

const MOCK_SIGNALS: Signal[] = [
  {
    id: 's1',
    type: 'military',
    title: 'PLA Carrier Group Enters Taiwan Strait',
    summary: 'Liaoning carrier strike group detected by satellite imagery and AIS data crossing the Taiwan Strait median line.',
    confidence: 84,
    severity: 'critical',
    location: 'Taiwan Strait',
    coordinates: { lat: 24.5, lon: 122.0 },
    timestamp: new Date(Date.now() - 3600000),
    sources: [
      { name: 'Planet Labs SAR', tier: 1, verified: true },
      { name: 'Reuters Wire', tier: 1, verified: true },
      { name: 'OSINT Twitter', tier: 3, verified: false },
    ],
    relatedSignals: [
      { id: 's3', title: 'ROC Air Force scrambles F-16s', similarity: 0.91 },
      { id: 's5', title: 'US 7th Fleet DEFCON update', similarity: 0.75 },
    ],
    tags: ['china', 'taiwan', 'naval', 'escalation'],
    analysis: 'This represents a significant escalatory action. Combined with recent rhetoric from Beijing, probability of further escalation in next 48h is elevated.',
  },
  {
    id: 's2',
    type: 'economic',
    title: 'Saudi Aramco Cuts Oil Output by 500K BPD',
    summary: 'Unilateral production cut announced amid price war signals from Riyadh.',
    confidence: 96,
    severity: 'high',
    location: 'Riyadh, Saudi Arabia',
    timestamp: new Date(Date.now() - 7200000),
    sources: [
      { name: 'Bloomberg Energy', tier: 1, verified: true },
      { name: 'Saudi Aramco Statement', tier: 1, verified: true },
    ],
    relatedSignals: [
      { id: 's4', title: 'Brent crude spikes 4.2%', similarity: 0.88 },
    ],
    tags: ['energy', 'oil', 'saudi', 'opec'],
    analysis: 'Market impact expected to cascade through energy futures. European energy security implications significant.',
  },
  {
    id: 's3',
    type: 'cyber',
    title: 'APT29 Targeting NATO Energy Infrastructure',
    summary: 'Russia-linked threat group deploying new ICS malware against European grid operators.',
    confidence: 71,
    severity: 'critical',
    location: 'Europe (Multiple Countries)',
    timestamp: new Date(Date.now() - 14400000),
    sources: [
      { name: 'CISA Advisory', tier: 1, verified: true },
      { name: 'Mandiant Report', tier: 1, verified: true },
      { name: 'CERT-EU', tier: 1, verified: true },
    ],
    relatedSignals: [
      { id: 's7', title: 'German grid operator anomaly detected', similarity: 0.82 },
    ],
    tags: ['cyber', 'russia', 'apt29', 'critical-infrastructure'],
    analysis: 'Timing suggests pre-positioning for potential kinetic-cyber hybrid operations. Recommend urgent patching of SCADA systems.',
  },
];

const TYPE_ICONS: Record<string, string> = {
  military: '⚔️',
  economic: '📊',
  political: '🏛️',
  cyber: '💻',
  humanitarian: '🏥',
  environmental: '🌡️',
};

export default function SignalModalPanel() {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const severityColor: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/30',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    low: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  };

  const tierColor: Record<number, string> = { 1: 'text-[#00ff88]', 2: 'text-yellow-400', 3: 'text-orange-400' };

  const filtered = MOCK_SIGNALS.filter(s => filter === 'all' || s.type === filter);
  const types = ['all', ...Array.from(new Set(MOCK_SIGNALS.map(s => s.type)))];

  const formatAge = (d: Date) => {
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  if (selectedSignal) {
    const sig = selectedSignal;
    return (
      <div className="h-full flex flex-col">
        {/* Back Header */}
        <div className="p-2 border-b border-white/5 flex items-center gap-2">
          <button
            onClick={() => setSelectedSignal(null)}
            className="text-white/40 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
          >
            ← BACK
          </button>
          <span className="text-white/20 text-xs">|</span>
          <span className="text-white/60 text-xs font-mono truncate">{sig.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Signal Header */}
          <div className="glass-panel p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{TYPE_ICONS[sig.type]}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${severityColor[sig.severity]}`}>
                {sig.severity.toUpperCase()}
              </span>
              <span className="text-white/30 text-[10px] font-mono ml-auto">{formatAge(sig.timestamp)}</span>
            </div>
            <div className="text-white font-mono text-sm font-bold">{sig.title}</div>
            <div className="text-white/60 text-xs font-mono">{sig.summary}</div>
            {sig.location && (
              <div className="text-white/40 text-[10px] font-mono">📍 {sig.location}</div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-[10px] font-mono">CONFIDENCE:</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${sig.confidence}%`, background: sig.confidence > 80 ? '#00ff88' : sig.confidence > 60 ? '#ffaa00' : '#ff4444' }}
                />
              </div>
              <span className="text-white font-mono text-xs">{sig.confidence}%</span>
            </div>
          </div>

          {/* Analysis */}
          <div className="glass-panel p-3">
            <div className="text-[10px] text-white/40 font-mono uppercase mb-2">🧠 AI ANALYSIS</div>
            <div className="text-white/80 text-xs font-mono leading-relaxed">{sig.analysis}</div>
          </div>

          {/* Sources */}
          <div className="glass-panel p-3">
            <div className="text-[10px] text-white/40 font-mono uppercase mb-2">VERIFIED SOURCES ({sig.sources.length})</div>
            {sig.sources.map((src, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-mono ${tierColor[src.tier]}`}>T{src.tier}</span>
                <span className="text-white/80 text-xs font-mono flex-1">{src.name}</span>
                <span className={`text-[10px] font-mono ${src.verified ? 'text-[#00ff88]' : 'text-white/20'}`}>
                  {src.verified ? '✓ VERIFIED' : '? UNVERIFIED'}
                </span>
              </div>
            ))}
          </div>

          {/* Related Signals */}
          {sig.relatedSignals.length > 0 && (
            <div className="glass-panel p-3">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">RELATED SIGNALS</div>
              {sig.relatedSignals.map((rel, i) => {
                const related = MOCK_SIGNALS.find(s => s.id === rel.id);
                return (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 text-xs font-mono truncate">{rel.title}</div>
                    </div>
                    <span className="text-[#00ff88] text-[10px] font-mono flex-shrink-0">
                      {Math.round(rel.similarity * 100)}% match
                    </span>
                    {related && (
                      <button
                        onClick={() => setSelectedSignal(related)}
                        className="text-white/40 hover:text-white text-[10px] font-mono flex-shrink-0"
                      >
                        →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {sig.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
              filter === t
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {t === 'all' ? '🌐 ALL' : `${TYPE_ICONS[t]} ${t}`}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {filtered.map(sig => (
          <button
            key={sig.id}
            onClick={() => setSelectedSignal(sig)}
            className="glass-panel p-3 flex flex-col gap-2 text-left w-full hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span>{TYPE_ICONS[sig.type]}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${severityColor[sig.severity]}`}>
                {sig.severity.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="h-1 bg-white/5 rounded overflow-hidden">
                  <div className="h-full bg-[#00ff88]/60 rounded" style={{ width: `${sig.confidence}%` }} />
                </div>
              </div>
              <span className="text-white/30 text-[10px] font-mono flex-shrink-0">{formatAge(sig.timestamp)}</span>
            </div>

            <div className="text-white text-xs font-mono">{sig.title}</div>
            <div className="text-white/50 text-[10px] font-mono line-clamp-2">{sig.summary}</div>

            <div className="flex items-center gap-2">
              {sig.location && (
                <span className="text-white/30 text-[10px] font-mono">📍 {sig.location}</span>
              )}
              <span className="ml-auto text-[#00ff88]/60 text-[10px] font-mono">{sig.sources.length} sources →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
