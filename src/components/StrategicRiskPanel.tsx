'use client';

import { useState, useEffect } from 'react';

interface RiskItem {
  id: string;
  title: string;
  region: string;
  likelihood: number; // 1-5
  impact: number;     // 1-5
  trend: 'up' | 'down' | 'stable';
  category: 'military' | 'economic' | 'political' | 'cyber' | 'climate';
  mitigation: string;
}

interface Alert {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  message: string;
  timestamp: Date;
  region: string;
}

const RISK_MATRIX: RiskItem[] = [
  { id: '1', title: 'Taiwan Strait Escalation', region: 'Asia-Pacific', likelihood: 3, impact: 5, trend: 'up', category: 'military', mitigation: 'Diplomatic back-channels active' },
  { id: '2', title: 'Russian Energy Leverage', region: 'Europe', likelihood: 4, impact: 4, trend: 'stable', category: 'economic', mitigation: 'LNG diversification underway' },
  { id: '3', title: 'Middle East Oil Disruption', region: 'MENA', likelihood: 3, impact: 4, trend: 'up', category: 'military', mitigation: 'Strategic reserves deployment' },
  { id: '4', title: 'Critical Infrastructure Cyberattack', region: 'Global', likelihood: 4, impact: 3, trend: 'up', category: 'cyber', mitigation: 'CISA coordination in effect' },
  { id: '5', title: 'EM Currency Crisis', region: 'LatAm/Africa', likelihood: 3, impact: 3, trend: 'stable', category: 'economic', mitigation: 'IMF standby arrangements' },
  { id: '6', title: 'North Korea ICBM Test', region: 'Asia-Pacific', likelihood: 2, impact: 4, trend: 'stable', category: 'military', mitigation: 'ROK-US deterrence posture' },
];

const ALERTS: Alert[] = [
  { id: 'a1', priority: 'critical', message: 'PLA naval exercises approaching Taiwan exclusion zone', timestamp: new Date(Date.now() - 18e5), region: 'Taiwan Strait' },
  { id: 'a2', priority: 'high', message: 'Houthi anti-ship missile activity resumed in Red Sea', timestamp: new Date(Date.now() - 72e5), region: 'Red Sea' },
  { id: 'a3', priority: 'high', message: 'Russian cyber group targeting EU energy infrastructure', timestamp: new Date(Date.now() - 144e5), region: 'Europe' },
  { id: 'a4', priority: 'medium', message: 'Colombian border tensions with Venezuela escalating', timestamp: new Date(Date.now() - 36e5), region: 'South America' },
];

const CATEGORY_ICONS: Record<string, string> = {
  military: '⚔️',
  economic: '📉',
  political: '🏛️',
  cyber: '💻',
  climate: '🌡️',
};

const TREND_ICON: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

const TREND_COLOR: Record<string, string> = {
  up: 'text-red-400',
  down: 'text-[#00ff88]',
  stable: 'text-yellow-400',
};

export default function StrategicRiskPanel() {
  const [view, setView] = useState<'matrix' | 'alerts'>('matrix');
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(iv);
  }, []);

  const priorityColor: Record<string, string> = {
    critical: 'text-red-400 border-red-400/30 bg-red-400/10',
    high: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    medium: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  };

  const riskScore = (r: RiskItem) => r.likelihood * r.impact;
  const riskColor = (score: number) =>
    score >= 16 ? 'text-red-400' : score >= 9 ? 'text-orange-400' : score >= 4 ? 'text-yellow-400' : 'text-[#00ff88]';

  const formatAge = (d: Date) => {
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  const overallRisk = Math.round(RISK_MATRIX.reduce((s, r) => s + riskScore(r), 0) / RISK_MATRIX.length);

  return (
    <div className="h-full flex flex-col">
      {/* Risk Gauge */}
      <div className="p-3 border-b border-white/5 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[10px] text-white/40 font-mono uppercase">GLOBAL STRATEGIC RISK</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-white/5 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all"
                style={{
                  width: `${(overallRisk / 25) * 100}%`,
                  background: `linear-gradient(90deg, #00ff88, #ffaa00, #ff4444)`,
                }}
              />
            </div>
            <span className={`text-sm font-mono font-bold ${riskColor(overallRisk)}`}>{overallRisk}/25</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setView('matrix')}
            className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
              view === 'matrix' ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30' : 'text-white/40 border-white/10'
            }`}
          >
            MATRIX
          </button>
          <button
            onClick={() => setView('alerts')}
            className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors relative ${
              view === 'alerts' ? 'bg-red-400/20 text-red-400 border-red-400/30' : 'text-white/40 border-white/10'
            }`}
          >
            ALERTS
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">
              {ALERTS.filter(a => a.priority === 'critical' || a.priority === 'high').length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {view === 'matrix' ? (
          <>
            {selectedRisk ? (
              <div className="glass-panel p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#00ff88] text-xs font-mono">{CATEGORY_ICONS[selectedRisk.category]} {selectedRisk.title}</span>
                  <button onClick={() => setSelectedRisk(null)} className="text-white/40 hover:text-white text-sm">×</button>
                </div>
                <div className="text-white/50 text-[10px] font-mono">{selectedRisk.region}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/20 rounded p-2 text-center">
                    <div className="text-white/40 text-[9px] font-mono">LIKELIHOOD</div>
                    <div className="text-white text-lg font-mono font-bold">{selectedRisk.likelihood}/5</div>
                  </div>
                  <div className="bg-black/20 rounded p-2 text-center">
                    <div className="text-white/40 text-[9px] font-mono">IMPACT</div>
                    <div className="text-white text-lg font-mono font-bold">{selectedRisk.impact}/5</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-[10px] font-mono">TREND:</span>
                  <span className={`text-xs font-mono font-bold ${TREND_COLOR[selectedRisk.trend]}`}>
                    {TREND_ICON[selectedRisk.trend]} {selectedRisk.trend.toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-2">
                  <div className="text-[10px] text-white/40 font-mono mb-1">MITIGATION</div>
                  <div className="text-[#00ff88]/80 text-xs font-mono">{selectedRisk.mitigation}</div>
                </div>
              </div>
            ) : (
              RISK_MATRIX.sort((a, b) => riskScore(b) - riskScore(a)).map(risk => (
                <button
                  key={risk.id}
                  onClick={() => setSelectedRisk(risk)}
                  className="glass-panel p-3 flex items-center gap-3 text-left w-full hover:border-white/20 transition-colors"
                >
                  <span className="text-base">{CATEGORY_ICONS[risk.category]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-mono truncate">{risk.title}</div>
                    <div className="text-white/40 text-[10px] font-mono">{risk.region}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-mono font-bold ${TREND_COLOR[risk.trend]}`}>
                      {TREND_ICON[risk.trend]}
                    </span>
                    <span className={`text-sm font-mono font-bold ${riskColor(riskScore(risk))}`}>
                      {riskScore(risk)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </>
        ) : (
          ALERTS.map(alert => (
            <div key={alert.id} className="glass-panel p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${priorityColor[alert.priority]}`}>
                  {alert.priority.toUpperCase()}
                </span>
                <span className="text-white/30 text-[10px] font-mono ml-auto">{formatAge(alert.timestamp)}</span>
              </div>
              <div className="text-white text-xs font-mono">{alert.message}</div>
              <div className="text-white/40 text-[10px] font-mono">📍 {alert.region}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
