'use client';

import { useState } from 'react';

type TabId = 'restrictions' | 'tariffs' | 'flows' | 'sanctions';

interface TradeRestriction {
  id: string;
  type: 'export-ban' | 'import-quota' | 'embargo' | 'license-required';
  country: string;
  flag: string;
  product: string;
  imposedBy: string;
  date: string;
  status: 'active' | 'pending' | 'lifted';
}

interface TariffTrend {
  country: string;
  flag: string;
  sector: string;
  currentRate: string;
  previousRate: string;
  direction: 'up' | 'down' | 'unchanged';
  effectiveDate: string;
}

interface TradeFlow {
  route: string;
  volume: string;
  change: number;
  commodity: string;
  risk: 'high' | 'medium' | 'low';
}

interface Sanction {
  target: string;
  flag: string;
  imposedBy: string;
  reason: string;
  severity: 'comprehensive' | 'sectoral' | 'targeted';
  date: string;
}

const RESTRICTIONS: TradeRestriction[] = [
  { id: '1', type: 'export-ban', country: 'United States', flag: '🇺🇸', product: 'Advanced AI Chips (H100+)', imposedBy: 'US BIS', date: 'Oct 2023', status: 'active' },
  { id: '2', type: 'import-quota', country: 'European Union', flag: '🇪🇺', product: 'Chinese Steel & Aluminium', imposedBy: 'EU Commission', date: 'Jan 2024', status: 'active' },
  { id: '3', type: 'embargo', country: 'Russia', flag: '🇷🇺', product: 'Dual-use technology', imposedBy: 'G7 Coalition', date: 'Mar 2022', status: 'active' },
  { id: '4', type: 'license-required', country: 'China', flag: '🇨🇳', product: 'Semiconductor equipment', imposedBy: 'Netherlands (ASML)', date: 'Sep 2023', status: 'active' },
];

const TARIFFS: TariffTrend[] = [
  { country: 'US → China', flag: '🇺🇸→🇨🇳', sector: 'EVs & Solar', currentRate: '100%', previousRate: '25%', direction: 'up', effectiveDate: 'Aug 2024' },
  { country: 'China → EU', flag: '🇨🇳→🇪🇺', sector: 'Wine & Dairy', currentRate: '34.9%', previousRate: '0%', direction: 'up', effectiveDate: 'Oct 2024' },
  { country: 'EU → Russia', flag: '🇪🇺→🇷🇺', sector: 'Luxury goods', currentRate: 'Banned', previousRate: '0%', direction: 'up', effectiveDate: 'Mar 2022' },
  { country: 'India → US', flag: '🇮🇳→🇺🇸', sector: 'Steel products', currentRate: '7.5%', previousRate: '25%', direction: 'down', effectiveDate: 'Nov 2023' },
];

const FLOWS: TradeFlow[] = [
  { route: 'US ↔ China', volume: '$582B/yr', change: -12.3, commodity: 'Consumer/Tech goods', risk: 'high' },
  { route: 'EU ↔ Russia', volume: '$28B/yr', change: -67.4, commodity: 'Energy/Materials', risk: 'high' },
  { route: 'US ↔ EU', volume: '$1.1T/yr', change: 3.2, commodity: 'Machinery/Pharma', risk: 'low' },
  { route: 'China ↔ ASEAN', volume: '$975B/yr', change: 8.7, commodity: 'Electronics/Components', risk: 'medium' },
  { route: 'Red Sea corridor', volume: '$250B/yr', change: -31.0, commodity: 'Container shipping', risk: 'high' },
];

const SANCTIONS: Sanction[] = [
  { target: 'Russia', flag: '🇷🇺', imposedBy: 'US/EU/UK/G7', reason: 'Ukraine invasion', severity: 'comprehensive', date: 'Feb 2022' },
  { target: 'Iran', flag: '🇮🇷', imposedBy: 'US/EU', reason: 'Nuclear program + terrorism', severity: 'comprehensive', date: 'Ongoing' },
  { target: 'North Korea', flag: '🇰🇵', imposedBy: 'UN/US/EU', reason: 'Nuclear/missile programs', severity: 'comprehensive', date: 'Ongoing' },
  { target: 'Myanmar', flag: '🇲🇲', imposedBy: 'US/EU/UK', reason: 'Military coup', severity: 'targeted', date: 'Feb 2021' },
  { target: 'Venezuela', flag: '🇻🇪', imposedBy: 'US', reason: 'Maduro regime', severity: 'sectoral', date: '2018' },
];

export default function TradePolicyPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('restrictions');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'restrictions', label: 'Restrictions', icon: '🚫' },
    { id: 'tariffs', label: 'Tariffs', icon: '📈' },
    { id: 'flows', label: 'Trade Flows', icon: '🔄' },
    { id: 'sanctions', label: 'Sanctions', icon: '⚖️' },
  ];

  const typeLabel: Record<string, string> = {
    'export-ban': 'EXPORT BAN',
    'import-quota': 'IMPORT QUOTA',
    'embargo': 'EMBARGO',
    'license-required': 'LICENSE REQ',
  };

  const statusColor: Record<string, string> = {
    active: 'text-red-400 border-red-400/30 bg-red-400/10',
    pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    lifted: 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10',
  };

  const severityColor: Record<string, string> = {
    comprehensive: 'text-red-400 border-red-400/30 bg-red-400/10',
    sectoral: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    targeted: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  };

  const riskColor: Record<string, string> = {
    high: 'text-red-400',
    medium: 'text-yellow-400',
    low: 'text-[#00ff88]',
  };

  return (
    <div className="h-full flex flex-col">
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

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        {activeTab === 'restrictions' && RESTRICTIONS.map((r, i) => (
          <div key={i} className="glass-panel p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{r.flag}</span>
                <span className="text-[10px] font-mono text-white/50 border border-white/10 px-1.5 py-0.5 rounded">
                  {typeLabel[r.type]}
                </span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${statusColor[r.status]}`}>
                {r.status.toUpperCase()}
              </span>
            </div>
            <div className="text-white text-xs font-mono">{r.product}</div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>By: {r.imposedBy}</span>
              <span>{r.date}</span>
            </div>
          </div>
        ))}

        {activeTab === 'tariffs' && TARIFFS.map((t, i) => (
          <div key={i} className="glass-panel p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-mono">{t.flag} {t.country}</span>
              <span className={`text-xs font-mono font-bold ${t.direction === 'up' ? 'text-red-400' : t.direction === 'down' ? 'text-[#00ff88]' : 'text-white/40'}`}>
                {t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '→'} {t.currentRate}
              </span>
            </div>
            <div className="text-white/60 text-[10px] font-mono">{t.sector}</div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
              <span>Was: {t.previousRate}</span>
              <span>Eff: {t.effectiveDate}</span>
            </div>
          </div>
        ))}

        {activeTab === 'flows' && FLOWS.map((f, i) => (
          <div key={i} className="glass-panel p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-mono">{f.route}</span>
              <span className={`text-[10px] font-mono ${riskColor[f.risk]}`}>● {f.risk.toUpperCase()}</span>
            </div>
            <div className="text-[#00ff88] font-mono font-bold text-sm">{f.volume}</div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-[10px] font-mono">{f.commodity}</span>
              <span className={`text-[10px] font-mono font-bold ${f.change >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {f.change >= 0 ? '+' : ''}{f.change.toFixed(1)}% YoY
              </span>
            </div>
          </div>
        ))}

        {activeTab === 'sanctions' && SANCTIONS.map((s, i) => (
          <div key={i} className="glass-panel p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.flag}</span>
                <span className="text-white font-mono font-bold text-xs">{s.target}</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${severityColor[s.severity]}`}>
                {s.severity.toUpperCase()}
              </span>
            </div>
            <div className="text-white/60 text-[10px] font-mono">{s.reason}</div>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/30">
              <span>By: {s.imposedBy}</span>
              <span>Since: {s.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
