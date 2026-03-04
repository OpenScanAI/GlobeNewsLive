'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Shield, ChevronDown, ChevronUp, AlertTriangle, Radiation } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Indicator {
  name: string;
  status: 'normal' | 'elevated' | 'high' | 'critical';
  detail: string;
}

interface DefconData {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  color: string;
  lastUpdated: string;
  indicators: Indicator[];
  doomsdayClock: string;
  nuclearPosture: string;
}

const LEVEL_STYLES = {
  1: { bg: 'bg-white', text: 'text-black', border: 'border-white', glow: 'shadow-white/50' },
  2: { bg: 'bg-accent-red', text: 'text-white', border: 'border-accent-red', glow: 'shadow-accent-red/50' },
  3: { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500', glow: 'shadow-yellow-500/50' },
  4: { bg: 'bg-accent-green', text: 'text-black', border: 'border-accent-green', glow: 'shadow-accent-green/50' },
  5: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500', glow: 'shadow-blue-500/50' },
};

const STATUS_COLORS = {
  normal: 'bg-accent-green',
  elevated: 'bg-yellow-500',
  high: 'bg-accent-orange',
  critical: 'bg-accent-red animate-pulse',
};

export default function DefconIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, error, isLoading } = useSWR<{ defcon: DefconData }>('/api/defcon', fetcher, {
    refreshInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="glass-panel animate-pulse">
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg" />
          <div className="flex-1">
            <div className="h-3 bg-white/10 rounded w-20 mb-1" />
            <div className="h-2 bg-white/10 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.defcon) {
    return null;
  }

  const { defcon } = data;
  const styles = LEVEL_STYLES[defcon.level];

  return (
    <div className={`glass-panel border ${styles.border} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
      >
        <div className={`w-12 h-12 rounded-lg ${styles.bg} flex items-center justify-center shadow-lg ${styles.glow}`}>
          <span className={`text-xl font-bold font-mono ${styles.text}`}>{defcon.level}</span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <Radiation className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-[11px] font-bold text-white tracking-wider">DEFCON {defcon.level}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${styles.bg} ${styles.text}`}>
              {defcon.name}
            </span>
          </div>
          <p className="text-[9px] text-text-muted mt-0.5">{defcon.description}</p>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border-subtle divide-y divide-border-subtle">
          {/* Doomsday Clock */}
          <div className="px-3 py-2 bg-accent-red/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <div>
                <span className="font-mono text-[10px] text-accent-red font-bold">DOOMSDAY CLOCK</span>
                <p className="text-[11px] text-white font-medium">{defcon.doomsdayClock}</p>
              </div>
            </div>
          </div>

          {/* Threat Indicators */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">THREAT INDICATORS</span>
            </div>
            <div className="space-y-1.5">
              {defcon.indicators.map((ind, i) => (
                <div key={i} className="flex items-center justify-between bg-elevated/50 rounded px-2 py-1.5">
                  <span className="text-[10px] text-white">{ind.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] text-text-muted max-w-[120px] truncate">{ind.detail}</span>
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[ind.status]}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nuclear Posture */}
          <div className="px-3 py-2 bg-panel/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">NUCLEAR POSTURE</span>
            </div>
            <p className="text-[10px] text-text-muted">{defcon.nuclearPosture}</p>
          </div>

          {/* Disclaimer */}
          <div className="px-3 py-1.5 bg-black/30">
            <p className="text-[8px] text-text-dim text-center">
              ⚠️ Unofficial estimate based on OSINT. Actual DEFCON level is classified.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
