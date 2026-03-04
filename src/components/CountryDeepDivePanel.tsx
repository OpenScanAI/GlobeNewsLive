'use client';

import { useState } from 'react';

type TabId = 'overview' | 'economy' | 'military' | 'politics' | 'signals';

interface CountryData {
  code: string;
  name: string;
  flag: string;
  riskScore: number;
  stability: 'critical' | 'high' | 'medium' | 'low';
  economy: {
    gdp: string;
    growth: number;
    inflation: string;
    unemployment: string;
    debtGdp: string;
    currency: string;
    currencyChange: number;
  };
  military: {
    budget: string;
    activeTroops: string;
    conflicts: string[];
    alliances: string[];
  };
  politics: {
    government: string;
    leader: string;
    elections: string;
    stability: string;
    sanctions: string[];
  };
  signals: Array<{ text: string; severity: 'critical' | 'high' | 'medium'; time: string }>;
  trends: Array<{ label: string; values: number[] }>;
}

const COUNTRIES: CountryData[] = [
  {
    code: 'US', name: 'United States', flag: '🇺🇸',
    riskScore: 28, stability: 'low',
    economy: { gdp: '$27.36T', growth: 2.8, inflation: '3.2%', unemployment: '3.9%', debtGdp: '122%', currency: 'USD', currencyChange: 0.12 },
    military: { budget: '$858B', activeTroops: '1.39M', conflicts: ['Ukraine (support)', 'Middle East (operations)'], alliances: ['NATO', 'Five Eyes', 'AUKUS'] },
    politics: { government: 'Federal Republic', leader: 'Biden → Trump (2025)', elections: 'Nov 2028', stability: 'Stable', sanctions: ['Russia', 'Iran', 'North Korea'] },
    signals: [
      { text: 'Fed holds rates at 5.25-5.50%', severity: 'medium', time: '2h ago' },
      { text: 'New AI export controls to China', severity: 'high', time: '6h ago' },
    ],
    trends: [{ label: 'Risk', values: [25, 27, 26, 28, 30, 28] }],
  },
  {
    code: 'CN', name: 'China', flag: '🇨🇳',
    riskScore: 52, stability: 'medium',
    economy: { gdp: '$17.7T', growth: 4.9, inflation: '0.3%', unemployment: '5.1%', debtGdp: '83%', currency: 'CNY', currencyChange: -0.08 },
    military: { budget: '$225B', activeTroops: '2.0M', conflicts: ['Taiwan (claims)', 'SCS (disputes)'], alliances: ['SCO', 'BRICS'] },
    politics: { government: "People's Republic", leader: 'Xi Jinping', elections: 'N/A (party rule)', stability: 'Controlled', sanctions: ['US tech restrictions', 'EU trade measures'] },
    signals: [
      { text: 'PLA exercises near Taiwan intensify', severity: 'critical', time: '1h ago' },
      { text: 'Property market stabilization measures', severity: 'medium', time: '4h ago' },
    ],
    trends: [{ label: 'Risk', values: [45, 48, 50, 52, 55, 52] }],
  },
  {
    code: 'RU', name: 'Russia', flag: '🇷🇺',
    riskScore: 78, stability: 'high',
    economy: { gdp: '$2.24T', growth: 2.2, inflation: '7.4%', unemployment: '3.0%', debtGdp: '21%', currency: 'RUB', currencyChange: -1.2 },
    military: { budget: '$109B (official)', activeTroops: '1.15M', conflicts: ['Ukraine War (active)'], alliances: ['CSTO', 'SCO'] },
    politics: { government: 'Federal Semi-Presidential', leader: 'Vladimir Putin', elections: 'Mar 2030', stability: 'Authoritarian', sanctions: ['US', 'EU', 'UK', 'G7'] },
    signals: [
      { text: 'Kyiv struck by ballistic missiles overnight', severity: 'critical', time: '30m ago' },
      { text: 'Ruble at 90/USD amid sanctions pressure', severity: 'high', time: '3h ago' },
    ],
    trends: [{ label: 'Risk', values: [70, 73, 75, 78, 80, 78] }],
  },
];

export default function CountryDeepDivePanel() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '🌐' },
    { id: 'economy', label: 'Economy', icon: '📊' },
    { id: 'military', label: 'Military', icon: '⚔️' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'signals', label: 'Signals', icon: '📡' },
  ];

  const stabilityColor: Record<string, string> = {
    critical: 'text-red-400 bg-red-400/10 border-red-400/30',
    high: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    low: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  };

  const severityColor: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Country Selector */}
      <div className="p-2 border-b border-white/5">
        <input
          type="text"
          placeholder="Search country..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-black/30 border border-white/10 text-white text-xs font-mono rounded px-2 py-1.5 focus:outline-none focus:border-[#00ff88]/40 placeholder-white/20 mb-2"
        />
        <div className="flex gap-1 overflow-x-auto">
          {filteredCountries.map(c => (
            <button
              key={c.code}
              onClick={() => { setSelectedCountry(c); setActiveTab('overview'); }}
              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
                selectedCountry.code === c.code
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                  : 'text-white/40 border-white/10 hover:text-white/60'
              }`}
            >
              {c.flag} {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center gap-3">
        <span className="text-3xl">{selectedCountry.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-mono text-sm font-bold">{selectedCountry.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${stabilityColor[selectedCountry.stability]}`}>
              {selectedCountry.stability.toUpperCase()} RISK
            </span>
            <span className="text-white/40 text-[10px] font-mono">Score: {selectedCountry.riskScore}/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/30 text-[10px] font-mono">RISK INDEX</div>
          <div className="text-2xl font-mono font-bold text-red-400">{selectedCountry.riskScore}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-white/5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
              activeTab === t.id
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-2">
            {/* Risk Trend */}
            <div className="glass-panel p-3">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">6-WEEK RISK TREND</div>
              <div className="flex items-end gap-1 h-12">
                {selectedCountry.trends[0].values.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(v / 100) * 48}px`,
                        background: v > 60 ? '#ff4444' : v > 40 ? '#ffaa00' : '#00ff88',
                        opacity: i === selectedCountry.trends[0].values.length - 1 ? 1 : 0.5 + (i * 0.08),
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'GDP', value: selectedCountry.economy.gdp },
                { label: 'Growth', value: `+${selectedCountry.economy.growth}%` },
                { label: 'Military Budget', value: selectedCountry.military.budget },
                { label: 'Active Troops', value: selectedCountry.military.activeTroops },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-2 text-center">
                  <div className="text-white/30 text-[9px] font-mono uppercase">{stat.label}</div>
                  <div className="text-[#00ff88] text-sm font-mono font-bold mt-0.5">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Active Conflicts */}
            {selectedCountry.military.conflicts.length > 0 && (
              <div className="glass-panel p-3">
                <div className="text-[10px] text-white/40 font-mono uppercase mb-2">ACTIVE INVOLVEMENTS</div>
                {selectedCountry.military.conflicts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono mb-1">
                    <span className="text-red-400">⚠</span>
                    <span className="text-white/80">{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'economy' && (
          <div className="flex flex-col gap-2">
            {Object.entries({
              'GDP': selectedCountry.economy.gdp,
              'GDP Growth': `${selectedCountry.economy.growth > 0 ? '+' : ''}${selectedCountry.economy.growth}%`,
              'Inflation': selectedCountry.economy.inflation,
              'Unemployment': selectedCountry.economy.unemployment,
              'Debt/GDP': selectedCountry.economy.debtGdp,
              'Currency': `${selectedCountry.economy.currency} (${selectedCountry.economy.currencyChange > 0 ? '+' : ''}${selectedCountry.economy.currencyChange}%)`,
            }).map(([k, v]) => (
              <div key={k} className="glass-panel p-2 flex items-center justify-between">
                <span className="text-white/50 text-xs font-mono">{k}</span>
                <span className="text-white text-xs font-mono font-bold">{v}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'military' && (
          <div className="flex flex-col gap-2">
            <div className="glass-panel p-3">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">DEFENSE POSTURE</div>
              {[
                { label: 'Annual Budget', value: selectedCountry.military.budget },
                { label: 'Active Troops', value: selectedCountry.military.activeTroops },
              ].map((s, i) => (
                <div key={i} className="flex justify-between mb-1">
                  <span className="text-white/50 text-xs font-mono">{s.label}</span>
                  <span className="text-[#00ff88] text-xs font-mono font-bold">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="glass-panel p-3">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">ALLIANCES</div>
              <div className="flex flex-wrap gap-1">
                {selectedCountry.military.alliances.map((a, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]">
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-panel p-3">
              <div className="text-[10px] text-white/40 font-mono uppercase mb-2">ACTIVE CONFLICTS</div>
              {selectedCountry.military.conflicts.map((c, i) => (
                <div key={i} className="text-xs font-mono text-white/80 mb-1 flex items-center gap-2">
                  <span className="text-red-400">⚔</span> {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'politics' && (
          <div className="flex flex-col gap-2">
            {[
              { label: 'Government Type', value: selectedCountry.politics.government },
              { label: 'Current Leader', value: selectedCountry.politics.leader },
              { label: 'Next Elections', value: selectedCountry.politics.elections },
              { label: 'Stability Index', value: selectedCountry.politics.stability },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-2 flex items-start justify-between gap-4">
                <span className="text-white/50 text-xs font-mono flex-shrink-0">{item.label}</span>
                <span className="text-white text-xs font-mono text-right">{item.value}</span>
              </div>
            ))}
            {selectedCountry.politics.sanctions.length > 0 && (
              <div className="glass-panel p-3">
                <div className="text-[10px] text-white/40 font-mono uppercase mb-2">SANCTIONS IMPOSED</div>
                <div className="flex flex-wrap gap-1">
                  {selectedCountry.politics.sanctions.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded border border-red-400/30 bg-red-400/10 text-red-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="flex flex-col gap-2">
            {selectedCountry.signals.map((sig, i) => (
              <div key={i} className="glass-panel p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${severityColor[sig.severity]}`}>
                    ● {sig.severity.toUpperCase()}
                  </span>
                  <span className="text-white/30 text-[10px] font-mono">{sig.time}</span>
                </div>
                <div className="text-white text-xs font-mono">{sig.text}</div>
              </div>
            ))}
            {selectedCountry.signals.length === 0 && (
              <div className="text-center text-white/20 text-xs font-mono mt-8">No active signals</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
