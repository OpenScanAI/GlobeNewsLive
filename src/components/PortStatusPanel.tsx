'use client';

import { useState, useEffect } from 'react';
import { MAJOR_PORTS } from '@/lib/supply-chain';

interface PortStatusData {
  ports: Array<{
    name: string;
    status: 'normal' | 'congested' | 'closed' | 'restricted' | 'unknown';
    waitTime: string;
    vesselsAtAnchor: number;
    lastUpdated: string;
    notes?: string;
  }>;
  chokepoints: Array<{
    name: string;
    status: 'open' | 'delayed' | 'partial' | 'closed';
    delayHours: number;
    incidents: string[];
    affectedRoutes: string[];
  }>;
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedPorts: string[];
    affectedChokepoints: string[];
    relatedConflicts?: string[];
    timestamp: string;
  }>;
  updatedAt: string;
}

export default function PortStatusPanel() {
  const [data, setData] = useState<PortStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'ports' | 'chokepoints' | 'alerts'>('ports');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/supply-chain');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2 * 60 * 60 * 1000); // 2 hours
    return () => clearInterval(interval);
  }, []);

  const statusColors: Record<string, string> = {
    normal: 'text-accent-green',
    congested: 'text-accent-orange',
    restricted: 'text-accent-gold',
    closed: 'text-accent-red',
    unknown: 'text-text-dim',
    open: 'text-accent-green',
    delayed: 'text-accent-red',
    partial: 'text-accent-orange',
  };

  const statusBg: Record<string, string> = {
    normal: 'bg-accent-green/10 border-accent-green/20',
    congested: 'bg-accent-orange/10 border-accent-orange/20',
    restricted: 'bg-accent-gold/10 border-accent-gold/20',
    closed: 'bg-accent-red/10 border-accent-red/20',
    unknown: 'bg-text-dim/10 border-text-dim/20',
    open: 'bg-accent-green/10 border-accent-green/20',
    delayed: 'bg-accent-red/10 border-accent-red/20',
    partial: 'bg-accent-orange/10 border-accent-orange/20',
  };

  if (loading) {
    return (
      <div className="glass-panel">
        <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
          <span className="font-mono text-[11px] font-bold text-accent-blue">🚢 SUPPLY CHAIN</span>
        </div>
        <div className="p-4 text-center">
          <div className="text-[10px] font-mono text-text-dim animate-pulse">Loading supply chain data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-panel">
        <div className="px-3 py-2 border-b border-border-subtle bg-panel/50">
          <span className="font-mono text-[11px] font-bold text-accent-blue">🚢 SUPPLY CHAIN</span>
        </div>
        <div className="p-4 text-center">
          <div className="text-[10px] font-mono text-text-dim">Supply chain data unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-accent-blue">🚢 SUPPLY CHAIN</span>
        <span className="text-[9px] font-mono text-text-dim">{data.alerts.length} alerts</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle">
        {(['ports', 'chokepoints', 'alerts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1.5 text-[9px] font-mono uppercase ${
              activeTab === tab
                ? 'bg-accent-blue/10 text-accent-blue border-b-2 border-accent-blue'
                : 'text-text-dim hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ports Tab */}
      {activeTab === 'ports' && (
        <div className="p-2 space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
          {data.ports.map((port) => (
            <div
              key={port.name}
              className={`p-2 rounded border ${statusBg[port.status]} flex items-center justify-between`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-bold uppercase ${statusColors[port.status]}`}>
                    {port.status}
                  </span>
                  <span className="text-[10px] text-white truncate">{port.name}</span>
                </div>
                <div className="text-[9px] text-text-dim mt-0.5">
                  ⏱ {port.waitTime} • ⚓ {port.vesselsAtAnchor} vessels
                </div>
                {port.notes && (
                  <div className="text-[8px] text-accent-gold mt-0.5">{port.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chokepoints Tab */}
      {activeTab === 'chokepoints' && (
        <div className="p-2 space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
          {data.chokepoints.map((cp) => (
            <div
              key={cp.name}
              className={`p-2 rounded border ${statusBg[cp.status]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white font-medium">{cp.name}</span>
                <span className={`text-[9px] font-mono font-bold uppercase ${statusColors[cp.status]}`}>
                  {cp.status}
                </span>
              </div>
              {cp.delayHours > 0 && (
                <div className="text-[9px] text-text-dim mt-0.5">
                  ⏱ +{cp.delayHours}h delay
                </div>
              )}
              {cp.incidents.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {cp.incidents.map((inc, i) => (
                    <div key={i} className="text-[8px] text-accent-orange">⚠ {inc}</div>
                  ))}
                </div>
              )}
              {cp.affectedRoutes.length > 0 && (
                <div className="text-[8px] text-text-dim mt-1">
                  Routes: {cp.affectedRoutes.slice(0, 2).join(', ')}
                  {cp.affectedRoutes.length > 2 && '...'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="p-2 space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
          {data.alerts.length === 0 && (
            <div className="text-center py-4 text-[10px] text-text-dim">No active supply chain alerts</div>
          )}
          {data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-2 rounded border ${
                alert.severity === 'critical'
                  ? 'bg-accent-red/10 border-accent-red/30'
                  : alert.severity === 'high'
                    ? 'bg-accent-orange/10 border-accent-orange/20'
                    : 'bg-accent-gold/10 border-accent-gold/20'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-[8px] font-mono font-bold uppercase ${
                  alert.severity === 'critical' ? 'text-accent-red' : 
                  alert.severity === 'high' ? 'text-accent-orange' : 'text-accent-gold'
                }`}>
                  {alert.severity}
                </span>
                <span className="text-[10px] text-white font-medium">{alert.title}</span>
              </div>
              <div className="text-[9px] text-text-dim mt-0.5">{alert.description}</div>
              {alert.relatedConflicts && alert.relatedConflicts.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[8px] text-text-dim">Linked conflicts:</span>
                  {alert.relatedConflicts.map((c) => (
                    <span key={c} className="text-[8px] px-1 py-0.5 bg-accent-red/20 text-accent-red rounded">
                      ⚔️ {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-border-subtle bg-panel/30">
        <span className="text-[8px] font-mono text-text-dim">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
