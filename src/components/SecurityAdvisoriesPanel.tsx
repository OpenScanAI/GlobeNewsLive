'use client';

import { useState } from 'react';

type RiskLevel = 'DO NOT TRAVEL' | 'RECONSIDER' | 'EXERCISE INCREASED CAUTION' | 'EXERCISE NORMAL PRECAUTIONS';
type Issuer = 'US' | 'UK' | 'AU' | 'CA';

interface Advisory {
  country: string;
  flag: string;
  region: string;
  levels: Partial<Record<Issuer, RiskLevel>>;
  summary: string;
  lastUpdated: string;
  threats: string[];
}

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; short: string; level: number }> = {
  'DO NOT TRAVEL': { color: '#ff0000', bg: '#ff000022', short: 'DNT', level: 4 },
  'RECONSIDER': { color: '#ff4444', bg: '#ff444422', short: 'RECONSIDER', level: 3 },
  'EXERCISE INCREASED CAUTION': { color: '#ffaa00', bg: '#ffaa0022', short: 'CAUTION', level: 2 },
  'EXERCISE NORMAL PRECAUTIONS': { color: '#00ff88', bg: '#00ff8822', short: 'NORMAL', level: 1 },
};

const ISSUERS: Issuer[] = ['US', 'UK', 'AU', 'CA'];

const ISSUER_FLAGS: Record<Issuer, string> = {
  US: '🇺🇸', UK: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦',
};

const MOCK_ADVISORIES: Advisory[] = [
  {
    country: 'Afghanistan', flag: '🇦🇫', region: 'Central Asia',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Active armed conflict, terrorism, civil unrest, kidnapping risk throughout.',
    lastUpdated: '2024-12-01',
    threats: ['Armed Conflict', 'Terrorism', 'Kidnapping', 'IEDs'],
  },
  {
    country: 'Syria', flag: '🇸🇾', region: 'Middle East',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Active armed conflict across the country. Multiple armed factions operating.',
    lastUpdated: '2024-11-28',
    threats: ['Armed Conflict', 'Chemical Weapons Risk', 'Terrorism', 'Detention'],
  },
  {
    country: 'Libya', flag: '🇱🇾', region: 'North Africa',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'RECONSIDER' },
    summary: 'Ongoing fighting between rival factions. Significant kidnapping risk.',
    lastUpdated: '2024-11-15',
    threats: ['Armed Conflict', 'Kidnapping', 'Terrorism', 'Unexploded Ordnance'],
  },
  {
    country: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Active Russian invasion. Missile strikes on civilian infrastructure.',
    lastUpdated: '2024-12-03',
    threats: ['Armed Conflict', 'Missile Strikes', 'Nuclear Risk', 'Drone Attacks'],
  },
  {
    country: 'Sudan', flag: '🇸🇩', region: 'East Africa',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Civil war ongoing. Mass atrocities reported. Humanitarian crisis.',
    lastUpdated: '2024-11-20',
    threats: ['Civil War', 'Mass Violence', 'Famine', 'Kidnapping'],
  },
  {
    country: 'Yemen', flag: '🇾🇪', region: 'Middle East',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Complex humanitarian emergency. Houthi attacks on international shipping.',
    lastUpdated: '2024-12-01',
    threats: ['Armed Conflict', 'Terrorism', 'Kidnapping', 'Sea Mines'],
  },
  {
    country: 'Russia', flag: '🇷🇺', region: 'Europe/Asia',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Risk of arbitrary detention. Citizens conscripted. Sanctions environment.',
    lastUpdated: '2024-11-25',
    threats: ['Arbitrary Detention', 'Conscription Risk', 'Cyber Threats', 'Espionage'],
  },
  {
    country: 'Iran', flag: '🇮🇷', region: 'Middle East',
    levels: { US: 'DO NOT TRAVEL', UK: 'DO NOT TRAVEL', AU: 'RECONSIDER', CA: 'DO NOT TRAVEL' },
    summary: 'Risk of detention of dual nationals. Hostile environment for Western travelers.',
    lastUpdated: '2024-11-10',
    threats: ['Arbitrary Detention', 'Regional Conflict Risk', 'Protest Violence'],
  },
  {
    country: 'Israel/West Bank', flag: '🇮🇱', region: 'Middle East',
    levels: { US: 'RECONSIDER', UK: 'RECONSIDER', AU: 'RECONSIDER', CA: 'RECONSIDER' },
    summary: 'Ongoing conflict. Rocket attacks. West Bank violence elevated.',
    lastUpdated: '2024-12-03',
    threats: ['Rocket Attacks', 'Terrorism', 'Civil Unrest', 'Border Closures'],
  },
  {
    country: 'Myanmar', flag: '🇲🇲', region: 'Southeast Asia',
    levels: { US: 'RECONSIDER', UK: 'DO NOT TRAVEL', AU: 'DO NOT TRAVEL', CA: 'DO NOT TRAVEL' },
    summary: 'Civil war ongoing. Military checkpoints. Arbitrary detention common.',
    lastUpdated: '2024-11-30',
    threats: ['Civil War', 'Arbitrary Detention', 'Landmines', 'Airstrikes'],
  },
];

export default function SecurityAdvisoriesPanel() {
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [selectedIssuer, setSelectedIssuer] = useState<Issuer>('US');
  const [expanded, setExpanded] = useState<string | null>(null);

  const getHighestLevel = (advisory: Advisory): RiskLevel => {
    const levels = Object.values(advisory.levels).filter(Boolean) as RiskLevel[];
    if (levels.length === 0) return 'EXERCISE NORMAL PRECAUTIONS';
    return levels.sort((a, b) => RISK_CONFIG[b].level - RISK_CONFIG[a].level)[0]!;
  };

  const filtered = MOCK_ADVISORIES.filter(a => {
    if (filter === 'all') return true;
    const level = a.levels[selectedIssuer] || getHighestLevel(a);
    return level === filter;
  }).sort((a, b) => RISK_CONFIG[getHighestLevel(b)].level - RISK_CONFIG[getHighestLevel(a)].level);

  const dntCount = MOCK_ADVISORIES.filter(a => getHighestLevel(a) === 'DO NOT TRAVEL').length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <div className="text-[#ff8800] text-sm font-bold font-mono">SECURITY ADVISORIES</div>
            <div className="text-white/40 text-[10px]">Government Travel Warnings</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#ff4444] text-sm font-bold font-mono">{dntCount}</div>
          <div className="text-[9px] text-white/30 font-mono">DNT countries</div>
        </div>
      </div>

      {/* Issuer Selector */}
      <div className="flex border-b border-white/5">
        {ISSUERS.map(issuer => (
          <button
            key={issuer}
            onClick={() => setSelectedIssuer(issuer)}
            className={`flex-1 py-1.5 text-[10px] font-mono transition-colors flex items-center justify-center gap-1 ${
              selectedIssuer === issuer ? 'text-[#00ff88] border-b-2 border-[#00ff88] bg-[#00ff88]/5' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span>{ISSUER_FLAGS[issuer]}</span>
            <span>{issuer}</span>
          </button>
        ))}
      </div>

      {/* Risk Filter */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-white/5 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 text-[9px] font-mono rounded border whitespace-nowrap transition-colors ${
            filter === 'all' ? 'border-white/40 text-white' : 'border-white/10 text-white/40'
          }`}
        >
          ALL
        </button>
        {(['DO NOT TRAVEL', 'RECONSIDER', 'EXERCISE INCREASED CAUTION'] as const).map(level => {
          const cfg = RISK_CONFIG[level];
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded border whitespace-nowrap transition-colors`}
              style={{
                borderColor: filter === level ? cfg.color : cfg.color + '44',
                color: filter === level ? cfg.color : cfg.color + 'aa',
                backgroundColor: filter === level ? cfg.bg : 'transparent',
              }}
            >
              {cfg.short}
            </button>
          );
        })}
      </div>

      {/* Advisory List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(advisory => {
          const level = advisory.levels[selectedIssuer] || getHighestLevel(advisory);
          const cfg = RISK_CONFIG[level] || RISK_CONFIG['EXERCISE NORMAL PRECAUTIONS'];
          const isOpen = expanded === advisory.country;
          return (
            <div key={advisory.country} className="border-b border-white/5">
              <button
                className="w-full px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : advisory.country)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{advisory.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{advisory.country}</div>
                    <div className="text-[9px] text-white/40">{advisory.region}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                      {cfg.short}
                    </div>
                    <div className="text-[9px] text-white/30 mt-0.5 font-mono">{advisory.lastUpdated}</div>
                  </div>
                  <span className="text-white/20 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 bg-white/2 border-t border-white/5">
                  <p className="text-[9px] text-white/60 mt-2 leading-relaxed">{advisory.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {advisory.threats.map(t => (
                      <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded border" style={{ color: cfg.color, borderColor: cfg.color + '44' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {ISSUERS.map(issuer => {
                      const iLevel = advisory.levels[issuer];
                      if (!iLevel) return null;
                      const iCfg = RISK_CONFIG[iLevel];
                      return (
                        <div key={issuer} className="text-center bg-white/5 rounded p-1">
                          <div className="text-base">{ISSUER_FLAGS[issuer]}</div>
                          <div className="text-[8px] font-mono" style={{ color: iCfg.color }}>{iCfg.short}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
