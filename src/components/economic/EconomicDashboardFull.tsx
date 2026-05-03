'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import {
  COUNTRIES, COUNTRY_CODES,
  MacroData, RiskScore, EconomicAlert,
} from '@/data/economicCountries';
import EconomicChoroplethMap from './EconomicChoroplethMap';
import EconomicVideoWall from './EconomicVideoWall';

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
    <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] text-white/30 tracking-wider">{label}</div>
          <div className="font-mono text-lg font-bold text-white/90 mt-1">{value}<span className="text-xs text-white/40 ml-1">{unit}</span></div>
          {delta && <div className={`font-mono text-[10px] mt-0.5 ${deltaColor}`}>{delta}</div>}
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
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-white/50 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className={`font-mono text-[10px] w-6 text-right ${riskColor(score)}`}>{score}</span>
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
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
        selected ? 'bg-[#378ADD]/10 border-l-2 border-[#378ADD]' : 'hover:bg-white/5 border-l-2 border-transparent'
      }`}
    >
      <span className="text-base">{profile.meta.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-white/80 truncate">{profile.meta.name}</span>
          {criticalCount > 0 && <span className="text-[9px]">🔴{criticalCount}</span>}
          {alertCount > 0 && criticalCount === 0 && <span className="text-[9px]">🟠{alertCount}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`font-mono text-[9px] ${riskColor(profile.risk.overall)}`}>Risk {profile.risk.overall}</span>
          <span className="font-mono text-[9px] text-white/20">GDP {fmt(profile.macro.gdpGrowth, 1, '%')}</span>
          <span className="font-mono text-[9px] text-white/20">Inf {fmt(profile.macro.inflation, 1, '%')}</span>
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
    <div className={`rounded border px-3 py-2 ${border}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs">{severityIcon(alert.severity)}</span>
        <span className="font-mono text-[10px] text-white/70">{alert.message}</span>
        <span className="font-mono text-[10px] text-white/40 ml-auto">{alert.value}</span>
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
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-2 flex items-center gap-3">
        <span className="font-mono text-[10px] text-[#378ADD] tracking-wider">ECONOMIC INTELLIGENCE</span>
        <div className="h-3 w-px bg-white/10" />
        
        {/* Summary pills */}
        {summary && (
          <div className="flex items-center gap-2">
            {summary.criticalAlerts > 0 && (
              <span className="font-mono text-[9px] bg-rose-500/15 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                🔴 {summary.criticalAlerts} critical
              </span>
            )}
            {summary.highAlerts > 0 && (
              <span className="font-mono text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                🟠 {summary.highAlerts} high
              </span>
            )}
            <span className="font-mono text-[9px] text-white/20">
              {summary.totalCountries} countries monitored
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {(['overview', 'macro', 'trade', 'risk'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                activeTab === t
                  ? 'bg-[#378ADD]/20 text-[#378ADD] border border-[#378ADD]/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAlertsOnly(!showAlertsOnly)}
          className={`font-mono text-[9px] px-2 py-1 rounded border transition-colors ${
            showAlertsOnly ? 'bg-rose-500/15 text-rose-400 border-rose-500/25' : 'text-white/30 border-white/10 hover:text-white/50'
          }`}
        >
          {showAlertsOnly ? 'Show All' : 'Alerts Only'}
        </button>
      </div>

      {/* MAIN BODY: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR — country list */}
        <div className="w-56 shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
          <div className="sticky top-0 bg-[#0a0a0f] z-10 px-3 py-2 border-b border-white/[0.06]">
            <div className="font-mono text-[9px] text-white/30 tracking-wider">COUNTRIES</div>
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
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {!selectedProfile ? (
            <div className="h-full flex items-center justify-center">
              <span className="font-mono text-white/20 text-sm">Select a country</span>
            </div>
          ) : (
            <>
              {/* COUNTRY HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{selectedProfile.meta.flag}</span>
                <div>
                  <div className="font-mono text-sm font-bold text-white/90">{selectedProfile.meta.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${riskBg(selectedProfile.risk.overall)} ${riskColor(selectedProfile.risk.overall)}`}>
                      Risk Score: {selectedProfile.risk.overall}
                    </span>
                    <span className="font-mono text-[10px] text-white/30">{selectedProfile.meta.region}</span>
                    {selectedProfile.forex?.rate && (
                      <span className="font-mono text-[10px] text-white/30">
                        1 USD = {selectedProfile.forex.rate.toFixed(2)} {selectedProfile.meta.iso3 === 'USA' ? '' : '(local)'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <KPICard label="GDP Growth" value={fmt(selectedProfile.macro.gdpGrowth, 1)} delta={selectedProfile.macro.gdpGrowth !== null ? (selectedProfile.macro.gdpGrowth >= 0 ? '+' : '') + selectedProfile.macro.gdpGrowth.toFixed(1) + '%' : undefined} unit="%" />
                <KPICard label="Inflation" value={fmt(selectedProfile.macro.inflation, 1)} unit="%" />
                <KPICard label="Unemployment" value={fmt(selectedProfile.macro.unemployment, 1)} unit="%" />
                <KPICard label="Debt/GDP" value={fmt(selectedProfile.macro.debtToGdp, 0)} unit="%" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <KPICard label="Reserves" value={selectedProfile.macro.reserves !== null ? (selectedProfile.macro.reserves / 1e9).toFixed(1) : '—'} unit="B USD" />
                <KPICard label="Exports" value={selectedProfile.macro.exports !== null ? (selectedProfile.macro.exports / 1e9).toFixed(1) : '—'} unit="B USD" />
                <KPICard label="Imports" value={selectedProfile.macro.imports !== null ? (selectedProfile.macro.imports / 1e9).toFixed(1) : '—'} unit="B USD" />
                <KPICard label="Trade Bal" value={selectedProfile.macro.tradeBalance !== null ? (selectedProfile.macro.tradeBalance / 1e9).toFixed(1) : '—'} unit="B USD" />
              </div>

              {/* CHOROPLETH MAP — moved above alerts */}
              <div className="mb-4">
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
                  height={420}
                  selectedCode={selectedCode}
                  onCountryClick={(code) => setSelectedCode(code)}
                />
              </div>

              {/* RISK BREAKDOWN + ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3">
                  <div className="font-mono text-[10px] text-white/30 tracking-wider mb-3">RISK BREAKDOWN</div>
                  <div className="space-y-2">
                    <RiskGauge label="Overall" score={selectedProfile.risk.overall} />
                    <RiskGauge label="Debt Stress" score={selectedProfile.risk.debtStress} />
                    <RiskGauge label="Inflation" score={selectedProfile.risk.inflationRisk} />
                    <RiskGauge label="Reserves" score={selectedProfile.risk.reserveHealth} />
                    <RiskGauge label="Trade Vuln" score={selectedProfile.risk.tradeVulnerability} />
                    <RiskGauge label="Growth" score={selectedProfile.risk.growthMomentum} />
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3">
                  <div className="font-mono text-[10px] text-white/30 tracking-wider mb-3">
                    ACTIVE ALERTS {selectedProfile.alerts.length > 0 && `(${selectedProfile.alerts.length})`}
                  </div>
                  {selectedProfile.alerts.length === 0 ? (
                    <div className="font-mono text-[10px] text-white/20 py-4 text-center">No active alerts</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProfile.alerts.map((a: EconomicAlert, i: number) => (
                        <AlertBanner key={i} alert={a} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* GLOBAL ALERTS FEED */}
              {alerts.length > 0 && (
                <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3 mb-4">
                  <div className="font-mono text-[10px] text-white/30 tracking-wider mb-3">
                    GLOBAL ALERTS — {alerts.length} total
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
