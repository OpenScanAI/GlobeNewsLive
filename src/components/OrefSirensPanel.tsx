'use client';

import { useState, useEffect, useCallback } from 'react';

interface OrefAlert {
  id: string;
  location: string;
  district: string;
  threatType: 'missile' | 'rocket' | 'uav' | 'infiltration' | 'earthquake';
  timestamp: Date;
  instructions: string;
}

interface HistoryWave {
  time: Date;
  locations: string[];
  count: number;
  threatType: string;
}

const THREAT_CONFIG = {
  missile: { icon: '🚀', color: '#ff4444', label: 'Ballistic Missile', shelter: 10 },
  rocket: { icon: '🔴', color: '#ff8800', label: 'Rocket/Mortar', shelter: 15 },
  uav: { icon: '🛸', color: '#ffaa00', label: 'UAV/Drone', shelter: 60 },
  infiltration: { icon: '⚠️', color: '#ff4444', label: 'Hostile Infiltration', shelter: 0 },
  earthquake: { icon: '🌍', color: '#8888ff', label: 'Earthquake', shelter: 0 },
};

const MOCK_HISTORY: HistoryWave[] = [
  { time: new Date(Date.now() - 12 * 60000), locations: ['Tel Aviv', 'Rishon LeZion', 'Holon'], count: 3, threatType: 'Rocket' },
  { time: new Date(Date.now() - 45 * 60000), locations: ['Ashkelon', 'Ashdod'], count: 2, threatType: 'Rocket' },
  { time: new Date(Date.now() - 2 * 3600000), locations: ['Be\'er Sheva', 'Netivot', 'Ofakim'], count: 3, threatType: 'Rocket' },
  { time: new Date(Date.now() - 5 * 3600000), locations: ['Sderot'], count: 1, threatType: 'Mortar' },
  { time: new Date(Date.now() - 8 * 3600000), locations: ['Eilat'], count: 1, threatType: 'UAV' },
];

function timeSince(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function OrefSirensPanel() {
  const [alerts, setAlerts] = useState<OrefAlert[]>([]);
  const [history, setHistory] = useState<HistoryWave[]>(MOCK_HISTORY);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [count24h] = useState(12);
  const [isActive, setIsActive] = useState(false);
  const [tick, setTick] = useState(0);

  // Simulate occasional alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      // ~5% chance of an alert per 10s
      if (Math.random() < 0.05) {
        const locs = ['Ashkelon', 'Ashdod', 'Sderot', 'Tel Aviv', 'Be\'er Sheva', 'Netivot', 'Kiryat Gat'];
        const types: OrefAlert['threatType'][] = ['rocket', 'missile', 'uav'];
        const type = types[Math.floor(Math.random() * types.length)]!;
        const loc = locs[Math.floor(Math.random() * locs.length)]!;
        const newAlert: OrefAlert = {
          id: Date.now().toString(),
          location: loc,
          district: 'Southern District',
          threatType: type,
          timestamp: new Date(),
          instructions: `Proceed to shelter immediately. Stay for ${THREAT_CONFIG[type].shelter} minutes.`,
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
        setIsActive(true);
        setTimeout(() => setIsActive(false), 30000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const clearAlerts = useCallback(() => {
    if (alerts.length > 0) {
      const wave: HistoryWave = {
        time: new Date(),
        locations: alerts.map(a => a.location),
        count: alerts.length,
        threatType: THREAT_CONFIG[alerts[0]!.threatType].label,
      };
      setHistory(prev => [wave, ...prev].slice(0, 20));
    }
    setAlerts([]);
    setIsActive(false);
  }, [alerts]);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b border-white/10 ${isActive ? 'animate-pulse' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-[#ff4444] text-sm font-bold font-mono">OREF SIRENS</div>
            <div className="text-white/40 text-[10px]">Israel Home Front Command</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              soundEnabled ? 'border-[#00ff88]/50 text-[#00ff88] bg-[#00ff88]/10' : 'border-white/20 text-white/40'
            }`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${isActive ? 'bg-[#ff4444]/15 border-[#ff4444]/30' : 'bg-[#00ff88]/5 border-white/5'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#ff4444] animate-ping' : 'bg-[#00ff88]'}`} />
          <span className={`text-sm font-bold font-mono ${isActive ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
            {isActive ? `⚠️ ACTIVE ALERT (${alerts.length})` : '✓ ALL CLEAR'}
          </span>
        </div>
        <div className="text-[10px] text-white/40 font-mono">{count24h} alerts / 24h</div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="border-b border-[#ff4444]/30">
          <div className="flex items-center justify-between px-3 py-1 bg-[#ff4444]/10">
            <span className="text-[10px] font-mono text-[#ff4444] font-bold">⚡ ACTIVE ALERTS</span>
            <button onClick={clearAlerts} className="text-[10px] text-white/40 hover:text-white font-mono">CLEAR</button>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {alerts.map(alert => {
              const cfg = THREAT_CONFIG[alert.threatType];
              return (
                <div key={alert.id} className="px-3 py-2 border-b border-white/5 bg-[#ff4444]/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{alert.location}</span>
                        <span className="text-[9px] font-mono text-white/40">{alert.district}</span>
                      </div>
                      <div className="text-[9px] font-mono" style={{ color: cfg.color }}>{cfg.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-white/40 font-mono">{timeSince(alert.timestamp)}</div>
                      {cfg.shelter > 0 && (
                        <div className="text-[9px] font-mono text-[#ffaa00]">{cfg.shelter}min shelter</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 ml-7 text-[9px] text-white/50">{alert.instructions}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div className="px-3 py-1.5 border-b border-white/5">
        <div className="text-[10px] font-mono text-white/40 uppercase">Recent Waves</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {history.map((wave, i) => (
          <div key={i} className="px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#ff8800] font-mono">{wave.count}x {wave.threatType}</span>
                  <span className="text-[9px] text-white/30 font-mono">{timeSince(wave.time)}</span>
                </div>
                <div className="text-[9px] text-white/50 mt-0.5">
                  {wave.locations.join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="flex items-center justify-center h-20 text-white/20 text-xs font-mono">No recent alerts</div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/5 text-[9px] text-white/20 font-mono">
        Source: Israel Home Front Command (pikud-haoref.org.il) • Auto-refreshing
      </div>
    </div>
  );
}
