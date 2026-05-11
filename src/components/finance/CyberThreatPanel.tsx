'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { PanelHeader } from './PanelHeader';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface KevEntry {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  requiredAction: string;
  knownRansomwareCampaignUse?: string;
}

interface CveItem {
  id: string;
  published: string;
  severity: string;
  score: number | null;
  description: string;
}

function SeverityBadge({ severity, score }: { severity: string; score: number | null }) {
  const color =
    severity === 'CRITICAL'
      ? 'bg-red-900/60 text-red-400 border-red-800/50'
      : severity === 'HIGH'
      ? 'bg-amber-900/60 text-amber-400 border-amber-800/50'
      : severity === 'MEDIUM'
      ? 'bg-yellow-900/60 text-yellow-400 border-yellow-800/50'
      : 'bg-gray-800 text-gray-500 border-gray-700';

  return (
    <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${color}`}>
      {severity !== 'N/A' ? severity : 'LOW'}
      {score ? ` ${score}` : ''}
    </span>
  );
}

function CollapsibleSection({
  title,
  count,
  countColor,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  countColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-mono ${countColor}`}>{count}</span>
          <span className="text-[9px] text-white/30">{open ? '▼' : '▶'}</span>
        </div>
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  );
}

export default function CyberThreatPanel() {
  const { data: kevData, isLoading: kevLoading } = useSWR('/api/cyber/kev', fetcher, { refreshInterval: 300000 });
  const { data: cveData, isLoading: cveLoading } = useSWR('/api/cyber/cve', fetcher, { refreshInterval: 300000 });

  const kevVulns: KevEntry[] = kevData?.vulnerabilities ?? [];
  const cves: CveItem[] = cveData?.cves ?? [];

  return (
    <div className="border border-white/[0.08] bg-[#0f0f14]">
      <PanelHeader title="CYBER THREATS" live={true} accentColor="red" timestamp={kevData?.lastUpdated || cveData?.lastUpdated} />

      {/* CISA KEV */}
      <CollapsibleSection title="CISA KEV" count={kevData?.totalCount ?? 0} countColor="text-red-400">
        {kevLoading && !kevData ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-white/5 rounded w-24 mb-1" />
                <div className="h-2 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : kevVulns.length === 0 ? (
          <div className="text-[10px] text-white/20 font-mono py-2">No KEV data available</div>
        ) : (
          <div className="flex flex-col gap-1">
            {kevVulns.slice(0, 5).map((v) => (
              <div key={v.cveID} className="flex items-start gap-2 py-1 group">
                <span className="text-[9px] font-mono text-red-400 mt-0.5">●</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/80 font-mono truncate">{v.cveID}</span>
                    {v.knownRansomwareCampaignUse && (
                      <span className="text-[8px] font-mono px-1 py-0.5 bg-purple-900/60 text-purple-400 border border-purple-800/50 rounded">
                        RANSOMWARE
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-white/40 font-mono truncate">{v.vendorProject} — {v.product}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* NVD CVE */}
      <CollapsibleSection title="NVD (7d)" count={cveData?.totalResults ?? 0} countColor="text-amber-400" defaultOpen={false}>
        {cveLoading && !cveData ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-white/5 rounded w-20 mb-1" />
                <div className="h-2 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : cves.length === 0 && !cveData?.error ? (
          <div className="text-[10px] text-white/20 font-mono py-2">Loading CVE data...</div>
        ) : cveData?.error ? (
          <div className="text-[10px] text-red-400/60 font-mono py-2">CVE feed unavailable</div>
        ) : (
          <div className="flex flex-col gap-1">
            {cves.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-2 py-1 group">
                <span
                  className={`text-[9px] font-mono mt-0.5 ${
                    c.severity === 'CRITICAL'
                      ? 'text-red-400'
                      : c.severity === 'HIGH'
                      ? 'text-amber-400'
                      : 'text-white/40'
                  }`}
                >
                  ●
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-white/80 font-mono truncate">{c.id}</span>
                    <SeverityBadge severity={c.severity} score={c.score} />
                  </div>
                  <div className="text-[9px] text-white/40 font-mono truncate mt-0.5">{c.description.slice(0, 80)}...</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
