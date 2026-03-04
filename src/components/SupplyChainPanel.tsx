'use client';

import { useState, useEffect } from 'react';

type TabId = 'chokepoints' | 'shipping' | 'minerals';

interface Chokepoint {
  id: string;
  name: string;
  status: 'DISRUPTED' | 'AT RISK' | 'ELEVATED' | 'NORMAL';
  throughput: number; // % of normal
  threat: string;
  traffic: string;
  dailyValue: string;
}

interface ShippingRoute {
  id: string;
  route: string;
  index: number;
  change7d: number;
  delay: string;
  congestion: 'HIGH' | 'MODERATE' | 'LOW';
  note: string;
}

interface CriticalMineral {
  commodity: string;
  icon: string;
  price: number;
  unit: string;
  change30d: number;
  supplyRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  topProducers: string[];
  useCase: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  DISRUPTED: { color: '#ff0000', bg: '#ff000022' },
  'AT RISK': { color: '#ff4444', bg: '#ff444422' },
  ELEVATED: { color: '#ffaa00', bg: '#ffaa0022' },
  NORMAL: { color: '#00ff88', bg: '#00ff8822' },
};

const CHOKEPOINTS: Chokepoint[] = [
  { id: 'hormuz', name: 'Strait of Hormuz', status: 'AT RISK', throughput: 85, threat: 'Iranian naval harassment, mining threat', traffic: '21M bbl/day oil', dailyValue: '$1.2B+' },
  { id: 'mandeb', name: 'Bab-el-Mandeb', status: 'DISRUPTED', throughput: 40, threat: 'Houthi missile/drone attacks on shipping', traffic: '8.8M bbl/day', dailyValue: '$700M+' },
  { id: 'suez', name: 'Suez Canal', status: 'ELEVATED', throughput: 65, threat: 'Rerouting due to Red Sea attacks', traffic: '15% global trade', dailyValue: '$9.6B' },
  { id: 'malacca', name: 'Strait of Malacca', status: 'NORMAL', throughput: 98, threat: 'Piracy, territorial disputes', traffic: '80K vessels/yr', dailyValue: '$3.4B' },
  { id: 'panama', name: 'Panama Canal', status: 'ELEVATED', throughput: 72, threat: 'Drought reducing water levels, vessel queue', traffic: '3% world trade', dailyValue: '$270M' },
  { id: 'taiwan', name: 'Taiwan Strait', status: 'AT RISK', throughput: 90, threat: 'PLA military exercises, tension escalation', traffic: '50% of container traffic', dailyValue: '$2.1B' },
];

const SHIPPING_ROUTES: ShippingRoute[] = [
  { id: 'sr1', route: 'Asia → Europe (via Cape)', index: 3840, change7d: 12, delay: '+18 days', congestion: 'HIGH', note: 'Suez avoidance adds 12-14 days, extra $1M fuel' },
  { id: 'sr2', route: 'Transpacific (USWC)', index: 2180, change7d: -5, delay: '+3 days', congestion: 'MODERATE', note: 'Congestion at LA/Long Beach easing' },
  { id: 'sr3', route: 'Asia → US East Coast', index: 3250, change7d: 8, delay: '+7 days', congestion: 'HIGH', note: 'Panama Canal drought routing via Suez/Cape' },
  { id: 'sr4', route: 'Europe → USA', index: 1450, change7d: 2, delay: '+1 day', congestion: 'LOW', note: 'Atlantic route unaffected' },
  { id: 'sr5', route: 'Middle East → Asia', index: 2600, change7d: 15, delay: '+12 days', congestion: 'HIGH', note: 'Persian Gulf escorts required, insurance surge' },
];

const MINERALS: CriticalMineral[] = [
  { commodity: 'Lithium', icon: '⚡', price: 24800, unit: '/t', change30d: -8, supplyRisk: 'HIGH', topProducers: ['Chile', 'Australia', 'China'], useCase: 'EV Batteries' },
  { commodity: 'Cobalt', icon: '🔋', price: 26400, unit: '/t', change30d: -15, supplyRisk: 'CRITICAL', topProducers: ['DRC 70%', 'Russia', 'Australia'], useCase: 'Battery Cathodes' },
  { commodity: 'Rare Earths', icon: '🧲', price: 850, unit: '/kg Nd', change30d: 5, supplyRisk: 'CRITICAL', topProducers: ['China 85%', 'USA', 'Myanmar'], useCase: 'Defense/EV Motors' },
  { commodity: 'Nickel', icon: '⚙️', price: 15800, unit: '/t', change30d: -3, supplyRisk: 'HIGH', topProducers: ['Indonesia', 'Philippines', 'Russia'], useCase: 'Steel/Batteries' },
  { commodity: 'Palladium', icon: '💎', price: 1180, unit: '/oz', change30d: -10, supplyRisk: 'HIGH', topProducers: ['Russia 40%', 'South Africa', 'Canada'], useCase: 'Catalytic Converters' },
  { commodity: 'Gallium', icon: '💡', price: 290, unit: '/kg', change30d: 22, supplyRisk: 'CRITICAL', topProducers: ['China 98%', 'Russia', 'Ukraine'], useCase: 'Semiconductors' },
  { commodity: 'Germanium', icon: '💻', price: 1650, unit: '/kg', change30d: 18, supplyRisk: 'CRITICAL', topProducers: ['China 60%', 'Russia', 'Canada'], useCase: 'Fiber Optics/IR' },
  { commodity: 'Uranium', icon: '☢️', price: 98, unit: '/lb U3O8', change30d: 4, supplyRisk: 'MODERATE', topProducers: ['Kazakhstan', 'Canada', 'Namibia'], useCase: 'Nuclear Fuel' },
];

const SUPPLY_RISK: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: '#ff4444', bg: '#ff444422' },
  HIGH: { color: '#ff8800', bg: '#ff880022' },
  MODERATE: { color: '#ffaa00', bg: '#ffaa0022' },
  LOW: { color: '#00ff88', bg: '#00ff8822' },
};

export default function SupplyChainPanel() {
  const [tab, setTab] = useState<TabId>('chokepoints');

  const disruptedCount = CHOKEPOINTS.filter(c => c.status === 'DISRUPTED' || c.status === 'AT RISK').length;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚢</span>
          <div>
            <div className="text-[#00aaff] text-sm font-bold font-mono">SUPPLY CHAIN</div>
            <div className="text-white/40 text-[10px]">Global Disruption Monitor</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[#ff4444] text-sm font-bold font-mono">{disruptedCount}</div>
          <div className="text-[9px] text-white/30 font-mono">disrupted routes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['chokepoints', 'shipping', 'minerals'] as TabId[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-[9px] font-mono transition-colors ${
              tab === t ? 'text-[#00aaff] border-b-2 border-[#00aaff] bg-[#00aaff]/5' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {t === 'chokepoints' ? '⚓ CHOKEPOINTS' : t === 'shipping' ? '📦 SHIPPING' : '⛏️ MINERALS'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'chokepoints' && (
          <>
            {CHOKEPOINTS.map(cp => {
              const cfg = STATUS_CONFIG[cp.status];
              return (
                <div key={cp.id} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{cp.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          {cp.status}
                        </span>
                      </div>
                      <div className="text-[9px] text-white/40 mt-0.5">{cp.threat}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold font-mono" style={{ color: cfg.color }}>{cp.throughput}%</div>
                      <div className="text-[8px] text-white/30 font-mono">capacity</div>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${cp.throughput}%`, backgroundColor: cfg.color }} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[8px] text-white/30 font-mono">Traffic: <span className="text-white/50">{cp.traffic}</span></span>
                    <span className="text-[8px] text-white/30 font-mono">Daily: <span className="text-[#00aaff]">{cp.dailyValue}</span></span>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'shipping' && (
          <>
            <div className="px-3 py-1.5 bg-[#ffaa00]/5 border-b border-[#ffaa00]/20">
              <div className="text-[9px] font-mono text-[#ffaa00]">⚠️ Red Sea Crisis: Suez transits down 60% — container ships rerouting via Cape (+$2,800/TEU)</div>
            </div>
            {SHIPPING_ROUTES.map(route => {
              const color = route.congestion === 'HIGH' ? '#ff4444' : route.congestion === 'MODERATE' ? '#ffaa00' : '#00ff88';
              return (
                <div key={route.id} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{route.route}</span>
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ color, backgroundColor: color + '22' }}>
                          {route.congestion}
                        </span>
                      </div>
                      <div className="text-[9px] text-white/40 mt-0.5">{route.note}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-[#00aaff]">${route.index.toLocaleString()}</div>
                      <div className={`text-[9px] font-mono ${route.change7d >= 0 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
                        {route.change7d >= 0 ? '+' : ''}{route.change7d}% 7d
                      </div>
                    </div>
                  </div>
                  <div className="text-[8px] text-white/30 font-mono mt-1">Delay: <span className="text-[#ffaa00]">{route.delay}</span></div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'minerals' && (
          <>
            <div className="px-3 py-1.5 bg-[#ff4444]/5 border-b border-[#ff4444]/20">
              <div className="text-[9px] font-mono text-[#ff4444]">⚠️ China controls 60-85% of critical minerals processing — export controls tightening</div>
            </div>
            {MINERALS.map(m => {
              const cfg = SUPPLY_RISK[m.supplyRisk];
              return (
                <div key={m.commodity} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{m.commodity}</span>
                        <span className="text-[8px] font-mono px-1 py-0.5 rounded" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                          {m.supplyRisk}
                        </span>
                      </div>
                      <div className="text-[9px] text-white/40">{m.useCase}</div>
                      <div className="text-[8px] text-white/30 mt-0.5 font-mono">{m.topProducers.join(' · ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-white">${m.price.toLocaleString()}<span className="text-[8px] text-white/40">{m.unit}</span></div>
                      <div className={`text-[9px] font-mono ${m.change30d >= 0 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>
                        {m.change30d >= 0 ? '+' : ''}{m.change30d}% 30d
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
