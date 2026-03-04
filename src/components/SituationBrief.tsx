'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronDown, ChevronUp, AlertTriangle, Globe, Shield, TrendingUp, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface KeyDevelopment {
  region: string;
  headline: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  actors: string[];
}

interface Brief {
  timestamp: string;
  threatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  headline: string;
  summary: string;
  keyDevelopments: KeyDevelopment[];
  watchList: string[];
  marketImplications: string;
  nextHours: string;
}

const THREAT_COLORS = {
  LOW: { bg: 'bg-accent-green/10', border: 'border-accent-green/30', text: 'text-accent-green', glow: 'shadow-accent-green/20' },
  GUARDED: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  ELEVATED: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' },
  HIGH: { bg: 'bg-accent-orange/10', border: 'border-accent-orange/30', text: 'text-accent-orange', glow: 'shadow-accent-orange/20' },
  SEVERE: { bg: 'bg-accent-red/10', border: 'border-accent-red/30', text: 'text-accent-red', glow: 'shadow-accent-red/20' },
};

const SEVERITY_COLORS = {
  CRITICAL: 'bg-accent-red text-white',
  HIGH: 'bg-accent-orange text-white',
  MEDIUM: 'bg-yellow-500 text-black',
};

export default function SituationBrief() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data, error, isLoading } = useSWR<{ brief: Brief }>('/api/brief', fetcher, {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: false,
  });

  const brief = data?.brief;
  const colors = brief ? THREAT_COLORS[brief.threatLevel] : THREAT_COLORS.LOW;

  if (isLoading) {
    return (
      <div className="glass-panel animate-pulse">
        <div className="px-4 py-3 border-b border-border-subtle bg-panel/50">
          <div className="h-4 bg-white/10 rounded w-32" />
        </div>
        <div className="p-4 space-y-3">
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="glass-panel border-accent-red/30">
        <div className="px-4 py-3 flex items-center gap-2 text-accent-red">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-mono">BRIEF UNAVAILABLE</span>
        </div>
      </div>
    );
  }

  const briefTime = new Date(brief.timestamp);
  const timeStr = briefTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className={`glass-panel ${colors.border} border overflow-hidden`}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.bg} hover:bg-white/5 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center`}>
            <Shield className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-white tracking-wider">SITUATION BRIEF</span>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                {brief.threatLevel}
              </span>
            </div>
            <div className="text-[9px] text-text-muted flex items-center gap-2 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Last updated {timeStr} UTC</span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-dim" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-dim" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="divide-y divide-border-subtle">
          {/* Headline */}
          <div className="px-4 py-3 bg-panel/30">
            <p className="text-[11px] text-white leading-relaxed font-medium">
              {brief.headline}
            </p>
            <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
              {brief.summary}
            </p>
          </div>

          {/* Key Developments */}
          {brief.keyDevelopments.length > 0 && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-text-muted" />
                <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">KEY DEVELOPMENTS</span>
              </div>
              <div className="space-y-2">
                {brief.keyDevelopments.map((dev, i) => (
                  <div key={i} className="bg-elevated/50 rounded-lg p-2.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-[9px] text-accent-green">{dev.region}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${SEVERITY_COLORS[dev.severity]}`}>
                        {dev.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-white leading-snug">{dev.headline}</p>
                    {dev.actors.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {dev.actors.map((actor, j) => (
                          <span key={j} className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-text-muted">
                            {actor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watchlist */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-accent-orange" />
              <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">WATCH LIST</span>
            </div>
            <ul className="space-y-1">
              {brief.watchList.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent-orange text-[10px] mt-0.5">•</span>
                  <span className="text-[10px] text-text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Market Implications */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-accent-green" />
              <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">MARKET IMPLICATIONS</span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">{brief.marketImplications}</p>
          </div>

          {/* Next Hours Forecast */}
          <div className="px-4 py-3 bg-elevated/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              <span className="font-mono text-[9px] font-bold text-text-muted tracking-wider">NEXT 6 HOURS</span>
            </div>
            <p className="text-[10px] text-white">{brief.nextHours}</p>
          </div>

          {/* Classification Footer */}
          <div className="px-4 py-2 bg-black/30 flex items-center justify-between">
            <span className="text-[8px] text-text-dim font-mono">AUTO-GENERATED • ALGORITHMIC ANALYSIS</span>
            <span className="text-[8px] text-text-dim font-mono">REFRESH: 30 MIN</span>
          </div>
        </div>
      )}
    </div>
  );
}
