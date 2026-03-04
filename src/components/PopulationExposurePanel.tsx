'use client';

import { useState } from 'react';

interface ConflictZone {
  id: string;
  country: string;
  flag: string;
  region: string;
  totalExposed: number;
  displaced: number;
  displaced2023: number;
  civilianCasualties30d: number;
  evacuationStatus: 'ONGOING' | 'PARTIAL' | 'BLOCKED' | 'NONE';
  humanitarianAccess: 'OPEN' | 'LIMITED' | 'DENIED';
  aidOrganizations: string[];
  criticalNeeds: string[];
  severity: 'CATASTROPHIC' | 'CRITICAL' | 'SERIOUS' | 'ELEVATED';
}

const EVAC_CONFIG: Record<string, { color: string }> = {
  ONGOING: { color: '#00ff88' },
  PARTIAL: { color: '#ffaa00' },
  BLOCKED: { color: '#ff4444' },
  NONE: { color: '#888888' },
};

const ACCESS_CONFIG: Record<string, { color: string }> = {
  OPEN: { color: '#00ff88' },
  LIMITED: { color: '#ffaa00' },
  DENIED: { color: '#ff4444' },
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  CATASTROPHIC: { color: '#ff0000', bg: '#ff000022' },
  CRITICAL: { color: '#ff4444', bg: '#ff444422' },
  SERIOUS: { color: '#ff8800', bg: '#ff880022' },
  ELEVATED: { color: '#ffaa00', bg: '#ffaa0022' },
};

const ZONES: ConflictZone[] = [
  {
    id: 'gaza', country: 'Gaza Strip', flag: '🇵🇸', region: 'Middle East',
    totalExposed: 2300000, displaced: 1900000, displaced2023: 500000,
    civilianCasualties30d: 1240,
    evacuationStatus: 'PARTIAL', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['UNRWA', 'ICRC', 'MSF'],
    criticalNeeds: ['Food', 'Water', 'Medical', 'Fuel'],
    severity: 'CATASTROPHIC',
  },
  {
    id: 'sudan', country: 'Sudan', flag: '🇸🇩', region: 'East Africa',
    totalExposed: 18000000, displaced: 8800000, displaced2023: 3200000,
    civilianCasualties30d: 890,
    evacuationStatus: 'PARTIAL', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['UNHCR', 'WFP', 'OCHA'],
    criticalNeeds: ['Food', 'Shelter', 'Medical'],
    severity: 'CATASTROPHIC',
  },
  {
    id: 'ukraine', country: 'Ukraine', flag: '🇺🇦', region: 'Eastern Europe',
    totalExposed: 14000000, displaced: 6500000, displaced2023: 5800000,
    civilianCasualties30d: 380,
    evacuationStatus: 'ONGOING', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['UNHCR', 'ICRC', 'EU Civil Protection'],
    criticalNeeds: ['Energy', 'Shelter', 'Medical'],
    severity: 'CRITICAL',
  },
  {
    id: 'drc', country: 'DR Congo', flag: '🇨🇩', region: 'Central Africa',
    totalExposed: 7200000, displaced: 6900000, displaced2023: 5500000,
    civilianCasualties30d: 420,
    evacuationStatus: 'PARTIAL', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['MONUSCO', 'MSF', 'WFP'],
    criticalNeeds: ['Food', 'Medical', 'Protection'],
    severity: 'CRITICAL',
  },
  {
    id: 'myanmar', country: 'Myanmar', flag: '🇲🇲', region: 'Southeast Asia',
    totalExposed: 18500000, displaced: 2800000, displaced2023: 1800000,
    civilianCasualties30d: 310,
    evacuationStatus: 'BLOCKED', humanitarianAccess: 'DENIED',
    aidOrganizations: ['UNHCR', 'ICRC'],
    criticalNeeds: ['Medical', 'Food', 'Protection'],
    severity: 'CRITICAL',
  },
  {
    id: 'yemen', country: 'Yemen', flag: '🇾🇪', region: 'Middle East',
    totalExposed: 21000000, displaced: 4500000, displaced2023: 4200000,
    civilianCasualties30d: 180,
    evacuationStatus: 'PARTIAL', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['UNHCR', 'WFP', 'OCHA', 'ICRC'],
    criticalNeeds: ['Food', 'Water', 'Medical'],
    severity: 'SERIOUS',
  },
  {
    id: 'afghanistan', country: 'Afghanistan', flag: '🇦🇫', region: 'Central Asia',
    totalExposed: 29000000, displaced: 4000000, displaced2023: 3600000,
    civilianCasualties30d: 95,
    evacuationStatus: 'NONE', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['OCHA', 'WFP', 'UNHCR'],
    criticalNeeds: ['Food', 'Economic Support', 'Medical'],
    severity: 'SERIOUS',
  },
  {
    id: 'somalia', country: 'Somalia', flag: '🇸🇴', region: 'East Africa',
    totalExposed: 7800000, displaced: 3800000, displaced2023: 3600000,
    civilianCasualties30d: 85,
    evacuationStatus: 'PARTIAL', humanitarianAccess: 'LIMITED',
    aidOrganizations: ['AMISOM', 'UNHCR', 'WFP'],
    criticalNeeds: ['Food', 'Water', 'Medical'],
    severity: 'SERIOUS',
  },
];

function formatPop(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function PopulationExposurePanel() {
  const [sortBy, setSortBy] = useState<'displaced' | 'severity' | 'casualties'>('displaced');
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalExposed = ZONES.reduce((s, z) => s + z.totalExposed, 0);
  const totalDisplaced = ZONES.reduce((s, z) => s + z.displaced, 0);
  const totalCasualties = ZONES.reduce((s, z) => s + z.civilianCasualties30d, 0);

  const sorted = [...ZONES].sort((a, b) => {
    if (sortBy === 'displaced') return b.displaced - a.displaced;
    if (sortBy === 'casualties') return b.civilianCasualties30d - a.civilianCasualties30d;
    const sOrder = { CATASTROPHIC: 4, CRITICAL: 3, SERIOUS: 2, ELEVATED: 1 };
    return sOrder[b.severity] - sOrder[a.severity];
  });

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <div className="text-[#ff8800] text-sm font-bold font-mono">POPULATION EXPOSURE</div>
            <div className="text-white/40 text-[10px]">Civilians in Conflict Zones</div>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-0 border-b border-white/5">
        <div className="px-3 py-2 border-r border-white/5">
          <div className="text-[#ff8800] text-sm font-bold font-mono">{formatPop(totalExposed)}</div>
          <div className="text-[9px] text-white/40 font-mono">Exposed</div>
        </div>
        <div className="px-3 py-2 border-r border-white/5">
          <div className="text-[#ffaa00] text-sm font-bold font-mono">{formatPop(totalDisplaced)}</div>
          <div className="text-[9px] text-white/40 font-mono">Displaced</div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[#ff4444] text-sm font-bold font-mono">{totalCasualties.toLocaleString()}</div>
          <div className="text-[9px] text-white/40 font-mono">Casualties/30d</div>
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-white/5">
        <span className="text-[9px] text-white/30 font-mono self-center mr-1">Sort:</span>
        {(['displaced', 'severity', 'casualties'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-colors ${
              sortBy === s ? 'border-[#ff8800]/50 bg-[#ff8800]/10 text-[#ff8800]' : 'border-white/10 text-white/40'
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Zone List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map(zone => {
          const svrCfg = SEVERITY_CONFIG[zone.severity];
          const evacCfg = EVAC_CONFIG[zone.evacuationStatus];
          const accessCfg = ACCESS_CONFIG[zone.humanitarianAccess];
          const isOpen = expanded === zone.id;
          const maxDisplaced = Math.max(...ZONES.map(z => z.displaced));

          return (
            <div key={zone.id} className="border-b border-white/5">
              <button
                className="w-full px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : zone.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{zone.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{zone.country}</span>
                      <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ color: svrCfg.color, backgroundColor: svrCfg.bg }}>
                        {zone.severity}
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff8800] rounded-full" style={{ width: `${(zone.displaced / maxDisplaced) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold font-mono text-[#ffaa00]">{formatPop(zone.displaced)}</div>
                    <div className="text-[8px] text-white/30 font-mono">displaced</div>
                  </div>
                  <span className="text-white/20 text-xs ml-1">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 bg-white/2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-[8px] text-white/30 font-mono">TOTAL EXPOSED</div>
                      <div className="text-sm font-bold font-mono text-[#ff8800]">{formatPop(zone.totalExposed)}</div>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-[8px] text-white/30 font-mono">CASUALTIES/30D</div>
                      <div className="text-sm font-bold font-mono text-[#ff4444]">{zone.civilianCasualties30d.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <div className="text-[8px] text-white/30 font-mono">EVACUATION</div>
                      <div className="text-[10px] font-mono font-bold" style={{ color: evacCfg.color }}>{zone.evacuationStatus}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/30 font-mono">AID ACCESS</div>
                      <div className="text-[10px] font-mono font-bold" style={{ color: accessCfg.color }}>{zone.humanitarianAccess}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[8px] text-white/30 font-mono mb-1">CRITICAL NEEDS</div>
                    <div className="flex flex-wrap gap-1">
                      {zone.criticalNeeds.map(n => (
                        <span key={n} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/20">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[8px] text-white/30 font-mono mb-1">AID ORGANIZATIONS</div>
                    <div className="text-[9px] text-white/50 font-mono">{zone.aidOrganizations.join(' · ')}</div>
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
