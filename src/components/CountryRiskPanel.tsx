'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Globe, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Signal } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface CountryRisk {
  code: string;
  name: string;
  flag: string;
  instabilityIndex: number; // 0-100
  trend: 'rising' | 'falling' | 'stable';
  newsCount: number;
  signalCount: number;
  topThreat: string;
  tradeImpact: 'high' | 'medium' | 'low';
}

// Calculate country risk from signals
function calculateCountryRisks(signals: Signal[]): CountryRisk[] {
  const countryData: Record<string, { news: number; signals: number; critical: number; high: number }> = {};
  
  // Country patterns for extraction
  const countryPatterns: Record<string, { name: string; flag: string }> = {
    'russia': { name: 'Russia', flag: '🇷🇺' },
    'ukraine': { name: 'Ukraine', flag: '🇺🇦' },
    'israel': { name: 'Israel', flag: '🇮🇱' },
    'iran': { name: 'Iran', flag: '🇮🇷' },
    'china': { name: 'China', flag: '🇨🇳' },
    'taiwan': { name: 'Taiwan', flag: '🇹🇼' },
    'gaza': { name: 'Palestine', flag: '🇵🇸' },
    'palestine': { name: 'Palestine', flag: '🇵🇸' },
    'lebanon': { name: 'Lebanon', flag: '🇱🇧' },
    'syria': { name: 'Syria', flag: '🇸🇾' },
    'yemen': { name: 'Yemen', flag: '🇾🇪' },
    'sudan': { name: 'Sudan', flag: '🇸🇩' },
    'north korea': { name: 'North Korea', flag: '🇰🇵' },
    'myanmar': { name: 'Myanmar', flag: '🇲🇲' },
    'pakistan': { name: 'Pakistan', flag: '🇵🇰' },
    'india': { name: 'India', flag: '🇮🇳' },
  };

  // Analyze signals
  signals.forEach(signal => {
    const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase();
    
    for (const [key, info] of Object.entries(countryPatterns)) {
      if (text.includes(key)) {
        if (!countryData[key]) {
          countryData[key] = { news: 0, signals: 0, critical: 0, high: 0 };
        }
        countryData[key].news++;
        countryData[key].signals++;
        if (signal.severity === 'CRITICAL') countryData[key].critical++;
        if (signal.severity === 'HIGH') countryData[key].high++;
      }
    }
  });

  // Convert to risks
  const risks: CountryRisk[] = Object.entries(countryData)
    .map(([key, data]) => {
      const info = countryPatterns[key];
      const instability = Math.min(100, data.critical * 25 + data.high * 10 + data.news * 2);
      const trend: 'rising' | 'falling' | 'stable' = data.critical > 0 ? 'rising' : data.high > 2 ? 'stable' : 'falling';
      const tradeImpact: 'high' | 'medium' | 'low' = instability > 70 ? 'high' : instability > 40 ? 'medium' : 'low';
      
      return {
        code: key.toUpperCase().substring(0, 2),
        name: info.name,
        flag: info.flag,
        instabilityIndex: instability,
        trend,
        newsCount: data.news,
        signalCount: data.signals,
        topThreat: data.critical > 0 ? 'Active conflict' : data.high > 0 ? 'Elevated tensions' : 'Monitoring',
        tradeImpact,
      };
    })
    .sort((a, b) => b.instabilityIndex - a.instabilityIndex)
    .slice(0, 10);

  return risks;
}

export default function CountryRiskPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: signalsData } = useSWR<{ signals: Signal[] }>('/api/signals', fetcher, {
    refreshInterval: 60000,
  });

  const signals = signalsData?.signals || [];
  const countryRisks = calculateCountryRisks(signals);

  const getRiskColor = (index: number) => {
    if (index >= 80) return 'bg-accent-red';
    if (index >= 60) return 'bg-accent-orange';
    if (index >= 40) return 'bg-yellow-500';
    return 'bg-accent-green';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <TrendingUp className="w-3 h-3 text-accent-red" />;
    if (trend === 'falling') return <TrendingDown className="w-3 h-3 text-accent-green" />;
    return <Minus className="w-3 h-3 text-text-dim" />;
  };

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-orange" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">COUNTRY INSTABILITY</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Risk List */}
          <div className="max-h-[300px] overflow-y-auto">
            {countryRisks.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-text-muted">
                Analyzing signals...
              </div>
            ) : (
              countryRisks.map((country, i) => (
                <div key={country.code} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-white">{country.name}</span>
                          {getTrendIcon(country.trend)}
                        </div>
                        <div className="text-[9px] text-text-muted">
                          {country.newsCount} news • {country.signalCount} signals
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[12px] font-mono font-bold ${
                        country.instabilityIndex >= 80 ? 'text-accent-red' :
                        country.instabilityIndex >= 60 ? 'text-accent-orange' :
                        country.instabilityIndex >= 40 ? 'text-yellow-500' : 'text-accent-green'
                      }`}>
                        {country.instabilityIndex}
                      </div>
                      <div className={`text-[8px] px-1 py-0.5 rounded ${
                        country.tradeImpact === 'high' ? 'bg-accent-red/20 text-accent-red' :
                        country.tradeImpact === 'medium' ? 'bg-accent-orange/20 text-accent-orange' :
                        'bg-accent-green/20 text-accent-green'
                      }`}>
                        Trade: {country.tradeImpact.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getRiskColor(country.instabilityIndex)} transition-all duration-500`}
                      style={{ width: `${country.instabilityIndex}%` }}
                    />
                  </div>
                  
                  <div className="mt-1 text-[8px] text-text-dim">{country.topThreat}</div>
                </div>
              ))
            )}
          </div>

          {/* Trade Impact Legend */}
          <div className="px-3 py-2 bg-black/30 border-t border-border-subtle">
            <div className="text-[8px] text-text-dim mb-1">Trade TRADE IMPACT</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-red" />
                <span className="text-[8px] text-text-muted">High Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-orange" />
                <span className="text-[8px] text-text-muted">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[8px] text-text-muted">Low</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
