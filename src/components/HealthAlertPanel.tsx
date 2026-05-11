import React from 'react';
import { Signal } from '@/types';

interface HealthAlertPanelProps {
  signals: Signal[];
  maxItems?: number;
}

export default function HealthAlertPanel({ signals, maxItems = 5 }: HealthAlertPanelProps) {
  const healthSignals = signals
    .filter(s => s.category === 'health')
    .slice(0, maxItems);

  if (healthSignals.length === 0) {
    return (
      <div className="glass-panel">
        <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-accent-green">🏥 HEALTH MONITOR</span>
          <span className="text-[9px] text-text-dim font-mono">No active alerts</span>
        </div>
        <div className="p-3 text-center">
          <p className="text-[11px] text-text-dim">No health alerts at this time</p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-accent-red/20 text-accent-red border-accent-red/30';
      case 'HIGH': return 'bg-accent-orange/20 text-accent-orange border-accent-orange/30';
      case 'MEDIUM': return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30';
      default: return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '🔶';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="glass-panel border-accent-red/20">
      <div className="px-3 py-2 border-b border-accent-red/20 bg-accent-red/5 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-accent-red flex items-center gap-1.5">
          🦠 HEALTH ALERTS
          <span className="animate-pulse">●</span>
        </span>
        <span className="text-[10px] text-text-dim font-mono">{healthSignals.length} ACTIVE</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {healthSignals.map(signal => (
          <div 
            key={signal.id} 
            className="px-3 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => signal.sourceUrl && window.open(signal.sourceUrl, '_blank', 'noopener,noreferrer')}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">{getSeverityIcon(signal.severity)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${getSeverityStyle(signal.severity)}`}>
                    {signal.severity}
                  </span>
                  <span className="text-[9px] text-text-dim font-mono">{signal.source}</span>
                  <span className="text-[9px] text-text-dim ml-auto">{signal.timeAgo}</span>
                </div>
                <div className="text-[11px] text-white font-medium leading-tight mb-1">
                  {signal.title}
                </div>
                {signal.summary && (
                  <p className="text-[10px] text-text-dim leading-relaxed line-clamp-2">
                    {signal.summary}
                  </p>
                )}
                {signal.lat && signal.lon && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[8px] text-accent-blue font-mono">📍 {signal.lat.toFixed(2)}, {signal.lon.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
