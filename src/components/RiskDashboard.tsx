'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, Target, Shield, Zap } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// Risk scoring algorithm (0-10)
interface RiskScore {
  id: string;
  name: string;
  region: string;
  score: number; // 0-10
  change: number; // -10 to +10 (delta from yesterday)
  probability: number; // 0-100% escalation probability
  factors: string[];
  trend: 'escalating' | 'stable' | 'de-escalating';
  icon: string;
}

// Calculate risk scores from signals and base data
function calculateRiskScores(signals: any[]): RiskScore[] {
  const baseRisks: RiskScore[] = [
    {
      id: 'iran',
      name: 'Iran Theater',
      region: 'Middle East',
      score: 9.2,
      change: +1.8,
      probability: 78,
      factors: ['Active strikes', 'Hormuz closure', 'Nuclear escalation'],
      trend: 'escalating',
      icon: '🔥'
    },
    {
      id: 'ukraine',
      name: 'Ukraine Front',
      region: 'Eastern Europe',
      score: 8.1,
      change: -0.3,
      probability: 45,
      factors: ['Frontline stable', 'Drone warfare', 'Winter offensive'],
      trend: 'stable',
      icon: '🇺🇦'
    },
    {
      id: 'redsea',
      name: 'Red Sea',
      region: 'Yemen/Houthi',
      score: 7.4,
      change: +0.5,
      probability: 62,
      factors: ['Shipping attacks', 'Naval deployments', 'Insurance costs'],
      trend: 'escalating',
      icon: '⚓'
    },
    {
      id: 'taiwan',
      name: 'Taiwan Strait',
      region: 'Asia-Pacific',
      score: 5.8,
      change: +0.2,
      probability: 28,
      factors: ['ADIZ incursions', 'Naval exercises', 'Chip supply'],
      trend: 'stable',
      icon: '🌏'
    },
    {
      id: 'gaza',
      name: 'Gaza',
      region: 'Palestine',
      score: 8.7,
      change: +0.1,
      probability: 55,
      factors: ['Ground ops', 'Aid crisis', 'Hostage situation'],
      trend: 'stable',
      icon: '🏥'
    },
    {
      id: 'sudan',
      name: 'Sudan',
      region: 'Africa',
      score: 7.9,
      change: -0.2,
      probability: 40,
      factors: ['RSF advances', 'Famine risk', 'Displacement'],
      trend: 'de-escalating',
      icon: '🌍'
    }
  ];

  // Adjust scores based on recent signals
  const iranSignals = signals.filter(s => 
    s.title?.toLowerCase().includes('iran') || 
    s.title?.toLowerCase().includes('tehran') ||
    s.title?.toLowerCase().includes('hormuz')
  ).length;
  
  if (iranSignals > 5) {
    baseRisks[0].score = Math.min(10, baseRisks[0].score + 0.3);
    baseRisks[0].probability = Math.min(95, baseRisks[0].probability + 5);
  }

  return baseRisks.sort((a, b) => b.score - a.score);
}

// Probability meter component
function ProbabilityMeter({ probability, label }: { probability: number; label: string }) {
  const getColor = (p: number) => {
    if (p >= 70) return 'from-red-500 to-red-600';
    if (p >= 50) return 'from-orange-500 to-orange-600';
    if (p >= 30) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono font-bold text-white">{probability}%</span>
      </div>
      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getColor(probability)} transition-all duration-1000`}
          style={{ width: `${probability}%` }}
        />
      </div>
    </div>
  );
}

// Risk score badge
function RiskBadge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 8) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (s >= 6) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (s >= 4) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-green-500/20 text-green-400 border-green-500/40';
  };

  return (
    <div className={`px-2 py-1 rounded border ${getColor(score)} font-mono text-sm font-bold`}>
      {score.toFixed(1)}
    </div>
  );
}

// Change indicator
function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <div className="flex items-center gap-0.5 text-red-400 text-[10px]">
        <TrendingUp className="w-3 h-3" />
        <span>+{change.toFixed(1)}</span>
      </div>
    );
  }
  if (change < 0) {
    return (
      <div className="flex items-center gap-0.5 text-green-400 text-[10px]">
        <TrendingDown className="w-3 h-3" />
        <span>{change.toFixed(1)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 text-gray-400 text-[10px]">
      <Minus className="w-3 h-3" />
      <span>0.0</span>
    </div>
  );
}

export default function RiskDashboard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  
  const { data: signalsData } = useSWR('/api/signals', fetcher, { refreshInterval: 60000 });
  const signals = signalsData?.signals || [];
  
  const risks = calculateRiskScores(signals);
  const globalRiskScore = (risks.reduce((acc, r) => acc + r.score, 0) / risks.length).toFixed(1);
  const highRiskCount = risks.filter(r => r.score >= 7).length;

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-gradient-to-r from-red-500/10 to-orange-500/10 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-red" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">RISK SCORES</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-mono font-bold">
              GLOBAL: {globalRiskScore}
            </span>
            {highRiskCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[9px] font-mono">
                {highRiskCount} HIGH
              </span>
            )}
          </div>
        </div>
        <Activity className="w-4 h-4 text-gray-400" />
      </button>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Global Escalation Probability */}
          <div className="p-2 bg-black/20 rounded border border-red-500/20">
            <ProbabilityMeter 
              probability={Math.round(risks.reduce((acc, r) => acc + r.probability, 0) / risks.length)} 
              label="Global Escalation Probability"
            />
          </div>

          {/* Risk Cards */}
          <div className="space-y-1">
            {risks.map(risk => (
              <div 
                key={risk.id}
                className={`p-2 bg-elevated/50 rounded border transition-all cursor-pointer ${
                  selectedRisk === risk.id 
                    ? 'border-white/30 bg-elevated' 
                    : 'border-border-subtle hover:border-white/20'
                }`}
                onClick={() => setSelectedRisk(selectedRisk === risk.id ? null : risk.id)}
              >
                {/* Main Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{risk.icon}</span>
                    <div>
                      <div className="text-[11px] font-bold text-white">{risk.name}</div>
                      <div className="text-[9px] text-gray-400">{risk.region}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChangeIndicator change={risk.change} />
                    <RiskBadge score={risk.score} />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedRisk === risk.id && (
                  <div className="mt-2 pt-2 border-t border-border-subtle space-y-2">
                    {/* Probability Meter */}
                    <ProbabilityMeter 
                      probability={risk.probability} 
                      label="Escalation Probability (24h)"
                    />
                    
                    {/* Risk Factors */}
                    <div className="flex flex-wrap gap-1">
                      {risk.factors.map((factor, i) => (
                        <span 
                          key={i}
                          className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-gray-400"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>

                    {/* Trend */}
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-gray-500">Trend:</span>
                      <span className={`font-bold ${
                        risk.trend === 'escalating' ? 'text-red-400' :
                        risk.trend === 'de-escalating' ? 'text-green-400' :
                        'text-yellow-400'
                      }`}>
                        {risk.trend === 'escalating' && '📈 ESCALATING'}
                        {risk.trend === 'de-escalating' && '📉 DE-ESCALATING'}
                        {risk.trend === 'stable' && '➡️ STABLE'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-border-subtle">
            <div className="flex items-center gap-1 text-[8px]">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-500">8-10 Critical</span>
            </div>
            <div className="flex items-center gap-1 text-[8px]">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-500">6-8 High</span>
            </div>
            <div className="flex items-center gap-1 text-[8px]">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-500">4-6 Medium</span>
            </div>
            <div className="flex items-center gap-1 text-[8px]">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-500">0-4 Low</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
