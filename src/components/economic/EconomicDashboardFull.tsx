'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  COUNTRIES, COUNTRY_CODES,
  MacroData, RiskScore, EconomicAlert,
} from '@/data/economicCountries';
import {
  SECTOR_DATA, TRADE_PARTNERS, HISTORICAL_DATA,
  CENTRAL_BANK_DATA, FOREX_DATA, COMMODITY_DATA, CALENDAR_DATA,
} from '@/data/economicExtended';
import EconomicVideoWall from './EconomicVideoWall';
import EconomicChoroplethMap from './EconomicChoroplethMap';
import SectorBreakdownPanel from './SectorBreakdownPanel';
import TradePartnersPanel from './TradePartnersPanel';
import HistoricalTrendPanel from './HistoricalTrendPanel';
import ComparativePanel from './ComparativePanel';
import ForexPanel from './ForexPanel';
import CentralBankPanel from './CentralBankPanel';
import CommodityPanel from './CommodityPanel';
import EconomicCalendarPanel from './EconomicCalendarPanel';
import type { FinanceData } from '@/types/finance';

const fetcher = (url: string) => fetch(url).then(r => r.json());

/* ─── helpers ─── */
const fmt = (n: number | null, digits = 1, suffix = '') =>
  n !== null ? `${n.toFixed(digits)}${suffix}` : '—';

const riskColor = (score: number) => {
  if (score >= 70) return 'text-rose-400';
  if (score >= 50) return 'text-amber-400';
  if (score >= 30) return 'text-yellow-400';
  return 'text-emerald-400';
};

const riskBg = (score: number) => {
  if (score >= 70) return 'bg-rose-500/10 border-rose-500/20';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
  if (score >= 30) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-emerald-500/10 border-emerald-500/20';
};

const severityIcon = (s: string) => {
  switch (s) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    default: return '⚪';
  }
};

/* ─── sparkline ─── */
function Sparkline({ values, color = '#378ADD', height = 30 }: { values: number[]; color?: string; height?: number }) {
  if (values.length < 2) return <div className="w-16 h-8 bg-white/5 rounded" />;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const w = 60, h = height;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-16 h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── KPI Card ─── */
function KPICard({ label, value, delta, unit = '', spark }: {
  label: string; value: string; delta?: string; unit?: string; spark?: number[];
}) {
  const deltaColor = delta?.startsWith('+') ? 'text-emerald-400' : delta?.startsWith('-') ? 'text-rose-400' : 'text-white/30';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-3 sm:p-4 hover:border-white/15 hover:bg-[#11111a] transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs text-white/30 tracking-wide uppercase">{label}</div>
          <div className="text-lg sm:text-xl font-bold text-white/90 mt-1.5 sm:mt-2 tracking-tight">{value}<span className="text-xs sm:text-sm text-white/40 ml-1 font-normal">{unit}</span></div>
          {delta && <div className={`text-[10px] sm:text-xs mt-1 ${deltaColor}`}>{delta}</div>}
        </div>
        {spark && <Sparkline values={spark} />}
      </div>
    </div>
  );
}

/* ─── Risk Gauge ─── */
function RiskGauge({ label, score }: { label: string; score: number }) {
  const color = score >= 70 ? '#f87171' : score >= 50 ? '#fbbf24' : score >= 30 ? '#facc15' : '#34d399';
  const pct = score;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={`text-sm font-bold w-8 text-right tabular-nums ${riskColor(score)}`}>{score}</span>
    </div>
  );
}

/* ─── Country Row (table) ─── */
function CountryRow({ code, profile, selected, onClick }: {
  code: string;
  profile: { meta: typeof COUNTRIES[string]; macro: MacroData; risk: RiskScore; alerts: EconomicAlert[] };
  selected: boolean;
  onClick: () => void;
}) {
  const alertCount = profile.alerts.length;
  const criticalCount = profile.alerts.filter(a => a.severity === 'critical').length;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150 ${
        selected ? 'bg-[#378ADD]/8 border-l-2 border-[#378ADD]' : 'hover:bg-white/[0.03] border-l-2 border-transparent'
      }`}
    >
      <span className="text-lg leading-none">{profile.meta.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-white/90 truncate">{profile.meta.name}</span>
          {criticalCount > 0 && <span className="text-xs leading-none">🔴{criticalCount}</span>}
          {alertCount > 0 && criticalCount === 0 && <span className="text-xs leading-none">🟠{alertCount}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-bold ${riskColor(profile.risk.overall)}`}>R{profile.risk.overall}</span>
          <span className="text-xs text-white/30">GDP {fmt(profile.macro.gdpGrowth, 1, '%')}</span>
          <span className="text-xs text-white/30">Inf {fmt(profile.macro.inflation, 1, '%')}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Alert Banner ─── */
function AlertBanner({ alert }: { alert: EconomicAlert }) {
  const border = alert.severity === 'critical' ? 'border-rose-500/30 bg-rose-500/5' :
    alert.severity === 'high' ? 'border-amber-500/30 bg-amber-500/5' : 'border-yellow-500/30 bg-yellow-500/5';
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${border}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm leading-none">{severityIcon(alert.severity)}</span>
        <span className="text-sm text-white/80 leading-snug">{alert.message}</span>
        <span className="text-sm text-white/40 ml-auto shrink-0 font-medium">{alert.value}</span>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function EconomicDashboardFull() {
  const [selectedCode, setSelectedCode] = useState('us');
  const [activeTab, setActiveTab] = useState<'overview' | 'macro' | 'trade' | 'risk'>('overview');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  const { data: riskData, error: riskError, isLoading: riskLoading } = useSWR('/api/economic/risk', fetcher, {
    refreshInterval: 300000, // 5 min
    revalidateOnFocus: true,
  });

  const { data: forexData } = useSWR('/api/economic/forex', fetcher, {
    refreshInterval: 300000,
  });

  const { data: financeData } = useSWR<FinanceData>('/api/finance', fetcher, {
    refreshInterval: 30000,
  });

  const profiles: Record<string, any> = riskData?.profiles || {};
  const alerts: EconomicAlert[] = riskData?.alerts || [];
  const summary = riskData?.summary;

  const selectedProfile = profiles[selectedCode];

  // Filter countries
  const visibleCodes = useMemo(() => {
    if (!showAlertsOnly) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(c => (profiles[c]?.alerts?.length || 0) > 0);
  }, [showAlertsOnly, profiles]);

  // Sort by risk (descending)
  const sortedCodes = useMemo(() => {
    return [...visibleCodes].sort((a, b) =>
      (profiles[b]?.risk?.overall || 0) - (profiles[a]?.risk?.overall || 0)
    );
  }, [visibleCodes, profiles]);

  if (riskLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="font-mono text-accent-green animate-pulse text-sm">Loading economic intelligence...</div>
      </div>
    );
  }

  if (riskError) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="font-mono text-rose-400 text-sm">Failed to load economic data. Retrying...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b border-white/[0.06] px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 bg-[#0a0a0f]/80 backdrop-blur-sm flex-wrap">
        <span className="text-xs sm:text-sm text-[#378ADD] tracking-wider font-bold uppercase">Economic Intelligence</span>
        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Live market ticker strip */}
        {financeData && (
          <div className="hidden lg:flex items-center gap-3 overflow-hidden max-w-md">
            {financeData.indices.slice(0, 3).map((i) => (
              <span key={i.symbol} className="flex items-center gap-1 text-[10px] font-mono whitespace-nowrap">
                <span className="text-white/40">{i.display}</span>
                <span className={i.change !== null && i.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {i.price !== null ? i.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                </span>
                <span className={i.change !== null && i.change >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}>
                  {i.change !== null ? `${i.change >= 0 ? '+' : ''}${i.change.toFixed(1)}%` : ''}
                </span>
              </span>
            ))}
            {financeData.vix?.price !== null && (
              <span className="flex items-center gap-1 text-[10px] font-mono whitespace-nowrap">
                <span className="text-white/40">VIX</span>
                <span className={financeData.vix!.change !== null && financeData.vix!.change! >= 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {financeData.vix!.price?.toFixed(1)}
                </span>
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Summary pills */}
        {summary && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {summary.criticalAlerts > 0 && (
              <span className="text-[10px] sm:text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-rose-500/15">
                🔴 {summary.criticalAlerts}
              </span>
            )}
            {summary.highAlerts > 0 && (
              <span className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-amber-500/15">
                🟠 {summary.highAlerts}
              </span>
            )}
            <span className="text-[10px] sm:text-xs text-white/30 hidden sm:inline">
              {summary.totalCountries} countries
            </span>
          </div>
        )}

        {/* Data freshness */}
        {financeData?.timestamp && (
          <span className="text-[9px] font-mono text-white/20 hidden xl:inline">
            {new Date(financeData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        <div className="flex-1" />

        {/* Tabs */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/[0.02] rounded-lg p-0.5">
          {(['overview', 'macro', 'trade', 'risk'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                activeTab === t
                  ? 'bg-[#378ADD]/15 text-[#378ADD] shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAlertsOnly(!showAlertsOnly)}
          className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border transition-all duration-200 ${
            showAlertsOnly ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'text-white/30 border-white/[0.06] hover:text-white/50 hover:border-white/10'
          }`}
        >
          {showAlertsOnly ? 'All' : 'Alerts'}
        </button>
      </div>

      {/* MAIN BODY: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR — country list */}
        <div className="w-14 sm:w-64 shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-[#0a0a0f]/95 backdrop-blur-sm z-10 px-2 sm:px-3 py-2 sm:py-3 border-b border-white/[0.06]">
            <div className="text-[10px] sm:text-xs text-white/30 tracking-wide uppercase font-medium hidden sm:block">Countries</div>
          </div>
          {sortedCodes.map(code => (
            <CountryRow
              key={code}
              code={code}
              profile={profiles[code] || { meta: COUNTRIES[code], macro: {}, risk: { overall: 0 }, alerts: [] }}
              selected={selectedCode === code}
              onClick={() => setSelectedCode(code)}
            />
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 sm:p-5 min-w-0">
          {!selectedProfile ? (
            <div className="h-full flex items-center justify-center">
              <span className="font-mono text-white/20 text-sm">Select a country</span>
            </div>
          ) : (
            <>
              {/* COUNTRY HEADER */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-4xl leading-none">{selectedProfile.meta.flag}</span>
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-white/90 tracking-tight truncate">{selectedProfile.meta.name}</div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border font-medium ${riskBg(selectedProfile.risk.overall)} ${riskColor(selectedProfile.risk.overall)}`}>
                      Risk {selectedProfile.risk.overall}
                    </span>
                    <span className="text-xs sm:text-sm text-white/40">{selectedProfile.meta.region}</span>
                    {selectedProfile.forex?.rate && (
                      <span className="text-xs sm:text-sm text-white/40">
                        1 USD = {selectedProfile.forex.rate.toFixed(2)} {selectedProfile.meta.iso3 === 'USA' ? '' : '(local)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI ROW — responsive */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-4 sm:mb-5">
                <KPICard label="GDP" value={fmt(selectedProfile.macro.gdpGrowth, 1)} delta={selectedProfile.macro.gdpGrowth !== null ? (selectedProfile.macro.gdpGrowth >= 0 ? '+' : '') + selectedProfile.macro.gdpGrowth.toFixed(1) + '%' : undefined} unit="%" spark={selectedProfile.macro.gdpSparkline} />
                <KPICard label="Inf" value={fmt(selectedProfile.macro.inflation, 1)} unit="%" spark={selectedProfile.macro.inflationSparkline} />
                <KPICard label="Unemp" value={fmt(selectedProfile.macro.unemployment, 1)} unit="%" spark={selectedProfile.macro.unemploymentSparkline} />
                <KPICard label="Debt" value={fmt(selectedProfile.macro.debtToGdp, 0)} unit="%" spark={selectedProfile.macro.debtSparkline} />
                <KPICard label="Res" value={selectedProfile.macro.reserves !== null ? (selectedProfile.macro.reserves / 1e9).toFixed(1) : '—'} unit="B" spark={selectedProfile.macro.reservesSparkline} />
                <KPICard label="Exp" value={selectedProfile.macro.exports !== null ? (selectedProfile.macro.exports / 1e9).toFixed(1) : '—'} unit="B" spark={selectedProfile.macro.exportsSparkline} />
                <KPICard label="Imp" value={selectedProfile.macro.imports !== null ? (selectedProfile.macro.imports / 1e9).toFixed(1) : '—'} unit="B" spark={selectedProfile.macro.importsSparkline} />
                <KPICard label="Bal" value={selectedProfile.macro.tradeBalance !== null ? (selectedProfile.macro.tradeBalance / 1e9).toFixed(1) : '—'} unit="B" spark={selectedProfile.macro.tradeBalanceSparkline} />
              </div>

              {/* PANELS ROW 1: Sector + Trade + Forex + Calendar (4-col) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <SectorBreakdownPanel data={SECTOR_DATA[selectedCode]} />
                <TradePartnersPanel data={TRADE_PARTNERS[selectedCode]} />
                <ForexPanel data={FOREX_DATA[selectedCode]} />
                <EconomicCalendarPanel events={CALENDAR_DATA[selectedCode] || []} />
              </div>

              {/* PANELS ROW 2: Historical + Central Bank + Commodity + Comparative (4-col) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <HistoricalTrendPanel data={HISTORICAL_DATA[selectedCode]} />
                <CentralBankPanel data={CENTRAL_BANK_DATA[selectedCode]} />
                <CommodityPanel data={COMMODITY_DATA[selectedCode]} />
                <ComparativePanel baseCode={selectedCode} />
              </div>

              {/* 2D CHOROPLETH MAP */}
              <div className="mb-4 sm:mb-5">
                <EconomicChoroplethMap
                  countries={Object.fromEntries(
                    Object.entries(profiles).map(([code, p]) => [
                      code,
                      {
                        code,
                        name: p.meta.name,
                        risk: p.risk.overall,
                        gdpGrowth: p.macro.gdpGrowth,
                        inflation: p.macro.inflation,
                        debtToGdp: p.macro.debtToGdp,
                        flag: p.meta.flag,
                      },
                    ])
                  )}
                  height={280}
                  selectedCode={selectedCode}
                  onCountryClick={(code) => setSelectedCode(code)}
                />
              </div>

              {/* RISK BREAKDOWN + ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-3 sm:p-5">
                  <div className="text-xs sm:text-sm text-white/40 tracking-wide uppercase mb-3 sm:mb-5 font-medium">Risk Breakdown</div>
                  <div className="space-y-3 sm:space-y-4">
                    <RiskGauge label="Overall" score={selectedProfile.risk.overall} />
                    <RiskGauge label="Debt" score={selectedProfile.risk.debtStress} />
                    <RiskGauge label="Inflation" score={selectedProfile.risk.inflationRisk} />
                    <RiskGauge label="Reserves" score={selectedProfile.risk.reserveHealth} />
                    <RiskGauge label="Trade" score={selectedProfile.risk.tradeVulnerability} />
                    <RiskGauge label="Growth" score={selectedProfile.risk.growthMomentum} />
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-3 sm:p-5">
                  <div className="text-xs sm:text-sm text-white/40 tracking-wide uppercase mb-3 sm:mb-5 font-medium">
                    Alerts {selectedProfile.alerts.length > 0 && <span className="text-white/60">({selectedProfile.alerts.length})</span>}
                  </div>
                  {selectedProfile.alerts.length === 0 ? (
                    <div className="text-xs sm:text-sm text-white/30 py-6 sm:py-8 text-center">No active alerts</div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {selectedProfile.alerts.map((a: EconomicAlert, i: number) => (
                        <AlertBanner key={i} alert={a} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* GLOBAL ALERTS FEED */}
              {alerts.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-3 sm:p-5 mb-4 sm:mb-5">
                  <div className="text-xs sm:text-sm text-white/40 tracking-wide uppercase mb-3 sm:mb-5 font-medium">
                    Global Alerts — <span className="text-white/60">{alerts.length} total</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 max-h-56 overflow-y-auto">
                    {alerts.slice(0, 10).map((a, i) => (
                      <AlertBanner key={i} alert={a} />
                    ))}
                  </div>
                </div>
              )}

              {/* LIVE NEWS STREAMS — Country-specific */}
              <EconomicVideoWall selectedCode={selectedCode} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
