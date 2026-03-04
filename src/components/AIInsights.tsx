'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Brain, Zap, TrendingUp, Target, Shield, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TheaterPosture {
  name: string;
  region: string;
  threatLevel: 'CRIT' | 'HIGH' | 'MED' | 'LOW';
  airActivity: number;
  seaActivity: number;
  groundActivity: number;
  trend: 'escalating' | 'stable' | 'de-escalating';
  routeImpact: string;
}

interface FocalPoint {
  name: string;
  type: 'conflict' | 'nuclear' | 'cyber' | 'economic';
  priority: number;
  description: string;
}

const THEATERS: TheaterPosture[] = [
  {
    name: 'Iran Theater',
    region: 'Middle East',
    threatLevel: 'CRIT',
    airActivity: 7,
    seaActivity: 5,
    groundActivity: 3,
    trend: 'escalating',
    routeImpact: 'Strait of Hormuz disruption risk',
  },
  {
    name: 'Ukraine Front',
    region: 'Eastern Europe',
    threatLevel: 'HIGH',
    airActivity: 8,
    seaActivity: 2,
    groundActivity: 9,
    trend: 'stable',
    routeImpact: 'Black Sea trade corridor blocked',
  },
  {
    name: 'Taiwan Strait',
    region: 'Asia-Pacific',
    threatLevel: 'MED',
    airActivity: 6,
    seaActivity: 7,
    groundActivity: 1,
    trend: 'stable',
    routeImpact: 'Semiconductor supply chain risk',
  },
  {
    name: 'Red Sea',
    region: 'Middle East',
    threatLevel: 'HIGH',
    airActivity: 4,
    seaActivity: 8,
    groundActivity: 2,
    trend: 'escalating',
    routeImpact: 'Suez rerouting +40% shipping costs',
  },
];

const FOCAL_POINTS: FocalPoint[] = [
  { name: 'Natanz Facility', type: 'nuclear', priority: 1, description: 'IAEA monitoring active' },
  { name: 'Hormuz Transit', type: 'economic', priority: 2, description: '21M bpd oil chokepoint' },
  { name: 'Kharkiv Oblast', type: 'conflict', priority: 3, description: 'Active front line' },
  { name: 'Gaza Crossings', type: 'conflict', priority: 4, description: 'Aid corridor status' },
];

export default function AIInsights() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'posture' | 'focal'>('posture');

  const { data: signalsData } = useSWR('/api/signals', fetcher, { refreshInterval: 60000 });
  const signals = signalsData?.signals || [];

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRIT': return 'bg-accent-red text-white';
      case 'HIGH': return 'bg-accent-orange text-white';
      case 'MED': return 'bg-yellow-500 text-black';
      default: return 'bg-accent-green text-black';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'escalating') return '📈';
    if (trend === 'de-escalating') return '📉';
    return '➡️';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nuclear': return '☢️';
      case 'cyber': return '💻';
      case 'economic': return '💰';
      default: return '⚔️';
    }
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-gradient-to-r from-purple-900/30 to-blue-900/30 flex items-center justify-between hover:from-purple-900/40 hover:to-blue-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">AI STRATEGIC POSTURE</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 animate-pulse">
            LIVE
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="px-2 py-1.5 border-b border-border-subtle flex gap-1">
            <button
              onClick={() => setActiveTab('posture')}
              className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                activeTab === 'posture'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-text-dim hover:text-white'
              }`}
            >
              🎯 THEATERS
            </button>
            <button
              onClick={() => setActiveTab('focal')}
              className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                activeTab === 'focal'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'text-text-dim hover:text-white'
              }`}
            >
              📍 FOCAL POINTS
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[280px] overflow-y-auto">
            {activeTab === 'posture' ? (
              <div className="divide-y divide-border-subtle">
                {THEATERS.map((theater, i) => (
                  <div key={theater.name} className="px-3 py-2 hover:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-white">{theater.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${getThreatColor(theater.threatLevel)}`}>
                            {theater.threatLevel}
                          </span>
                        </div>
                        <div className="text-[9px] text-text-muted">{theater.region}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px]">{getTrendIcon(theater.trend)}</div>
                        <div className="text-[8px] text-text-dim">{theater.trend}</div>
                      </div>
                    </div>

                    {/* Activity Bars */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-text-dim w-8">✈️ Air</span>
                        <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${theater.airActivity * 10}%` }} />
                        </div>
                        <span className="text-[8px] text-text-dim w-4">{theater.airActivity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-text-dim w-8">🚢 Sea</span>
                        <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${theater.seaActivity * 10}%` }} />
                        </div>
                        <span className="text-[8px] text-text-dim w-4">{theater.seaActivity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-text-dim w-8">🎖️ Gnd</span>
                        <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-accent-orange" style={{ width: `${theater.groundActivity * 10}%` }} />
                        </div>
                        <span className="text-[8px] text-text-dim w-4">{theater.groundActivity}</span>
                      </div>
                    </div>

                    {/* Trade Impact */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span className="text-[8px] text-blue-300">{theater.routeImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {FOCAL_POINTS.map((point, i) => (
                  <div key={point.name} className="px-3 py-2 hover:bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(point.type)}</span>
                      <div>
                        <div className="text-[10px] font-medium text-white">{point.name}</div>
                        <div className="text-[9px] text-text-muted">{point.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-text-dim">
                        P{point.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-black/30 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-purple-400" />
                <span className="text-[8px] text-text-dim">AI-powered analysis • 5 min refresh</span>
              </div>
              <a href="#" className="text-[8px] text-purple-400 hover:underline">View on map →</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
