'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface CyberThreat {
  id: string;
  type: 'ransomware' | 'ddos' | 'apt' | 'data_breach' | 'supply_chain' | 'zero_day' | 'phishing' | 'malware';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  target: string;
  targetType: 'government' | 'infrastructure' | 'financial' | 'healthcare' | 'tech' | 'energy' | 'defense';
  country: string;
  lat: number;
  lon: number;
  attribution?: string;
  timestamp: string;
  status: 'ongoing' | 'contained' | 'investigating';
  description: string;
  source: string;
  iocs?: string[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const TYPE_ICONS: Record<string, string> = {
  ransomware: '🔐',
  ddos: '🌊',
  apt: '🕵️',
  data_breach: '💾',
  supply_chain: '🔗',
  zero_day: '💥',
  phishing: '🎣',
  malware: '🦠',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0000',
  high: '#ff4444',
  medium: '#ffaa00',
  low: '#00ff88',
};

const TARGET_COLORS: Record<string, string> = {
  government: '#ff4444',
  infrastructure: '#ff8800',
  financial: '#ffaa00',
  healthcare: '#ff66aa',
  tech: '#00aaff',
  energy: '#ffcc00',
  defense: '#ff0000',
};

export default function CyberFeed() {
  const [filter, setFilter] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading } = useSWR<{ threats: CyberThreat[] }>(
    '/api/cyber?type=threats',
    fetcher,
    { refreshInterval: 120000 }
  );

  const threats = data?.threats || [];
  const filteredThreats = filter === 'all' 
    ? threats 
    : threats.filter(t => t.severity === filter || t.type === filter);

  const criticalCount = threats.filter(t => t.severity === 'critical').length;
  const ongoingCount = threats.filter(t => t.status === 'ongoing').length;

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">💻</span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">
            CYBER THREATS
          </span>
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-400 animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-dim font-mono">
            {ongoingCount} ongoing
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-text-muted hover:text-white"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-subtle overflow-x-auto">
        {['all', 'critical', 'high', 'apt', 'ransomware', 'zero_day'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-accent-cyan/20 text-accent-cyan' 
                : 'text-text-dim hover:text-text-muted'
            }`}
          >
            {f === 'all' ? 'ALL' : f.toUpperCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-1 px-2 py-1.5 border-b border-border-subtle bg-black/20">
        <div className="text-center">
          <div className="text-[10px] font-mono text-red-400">{threats.filter(t => t.severity === 'critical').length}</div>
          <div className="text-[8px] text-text-dim">CRIT</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono text-orange-400">{threats.filter(t => t.severity === 'high').length}</div>
          <div className="text-[8px] text-text-dim">HIGH</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono text-cyan-400">{threats.filter(t => t.type === 'apt').length}</div>
          <div className="text-[8px] text-text-dim">APT</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-mono text-yellow-400">{threats.filter(t => t.status === 'ongoing').length}</div>
          <div className="text-[8px] text-text-dim">ACTIVE</div>
        </div>
      </div>

      {/* Threat list */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin ${isExpanded ? 'max-h-[400px]' : 'max-h-[200px]'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-accent-cyan animate-pulse text-sm">Loading threats...</span>
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-dim text-sm">
            No threats match filter
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filteredThreats.map(threat => (
              <div 
                key={threat.id}
                className="p-2 hover:bg-white/5 cursor-pointer transition-colors group"
                style={{ borderLeft: `3px solid ${SEVERITY_COLORS[threat.severity]}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm">{TYPE_ICONS[threat.type] || '⚠️'}</span>
                    <span className="font-mono text-[10px] text-white truncate">
                      {threat.title}
                    </span>
                  </div>
                  <span 
                    className="text-[8px] font-mono px-1 rounded shrink-0"
                    style={{ 
                      backgroundColor: `${SEVERITY_COLORS[threat.severity]}22`,
                      color: SEVERITY_COLORS[threat.severity]
                    }}
                  >
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-[9px] text-text-dim">
                  <span 
                    className="px-1 rounded"
                    style={{ 
                      backgroundColor: `${TARGET_COLORS[threat.targetType]}22`,
                      color: TARGET_COLORS[threat.targetType]
                    }}
                  >
                    {threat.targetType}
                  </span>
                  <span>{threat.country}</span>
                  <span className="text-text-dim">•</span>
                  <span>{timeAgo(threat.timestamp)}</span>
                  {threat.status === 'ongoing' && (
                    <span className="text-red-400 animate-pulse">● ACTIVE</span>
                  )}
                </div>
                
                {threat.attribution && (
                  <div className="text-[9px] text-yellow-500 mt-1 font-mono">
                    ⚠ {threat.attribution}
                  </div>
                )}
                
                <p className="text-[9px] text-text-muted mt-1 line-clamp-2 group-hover:line-clamp-none">
                  {threat.description}
                </p>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] text-text-dim">via {threat.source}</span>
                  {threat.iocs && threat.iocs.length > 0 && (
                    <span className="text-[8px] text-cyan-400">
                      📎 {threat.iocs.length} IOCs
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-border-subtle bg-black/20 flex items-center justify-between">
        <span className="text-[8px] text-text-dim font-mono">
          Sources: CISA • ENISA • FBI • Vendor Advisories
        </span>
        <span className="text-[8px] text-text-dim">
          Updated every 2min
        </span>
      </div>
    </div>
  );
}
