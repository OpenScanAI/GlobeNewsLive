'use client';

import { TradePartners } from '@/data/economicExtended';

interface TradePartnersPanelProps {
  data: TradePartners;
}

export default function TradePartnersPanel({ data }: TradePartnersPanelProps) {
  const { exports, imports } = data;
  const maxExport = Math.max(...exports.map(e => e.share));
  const maxImport = Math.max(...imports.map(i => i.share));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">🤝</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Trade Partners</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Exports */}
        <div>
          <div className="text-xs text-emerald-400 mb-3 font-medium">Top Export Destinations</div>
          <div className="space-y-2">
            {exports.map((partner, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">{partner.flag}</span>
                <span className="text-sm text-white/60 w-24 truncate">{partner.name}</span>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500/40 transition-all"
                    style={{ width: `${(partner.share / maxExport) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white/80 w-10 text-right font-medium">{partner.share}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Imports */}
        <div>
          <div className="text-xs text-amber-400 mb-3 font-medium">Top Import Sources</div>
          <div className="space-y-2">
            {imports.map((partner, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm">{partner.flag}</span>
                <span className="text-sm text-white/60 w-24 truncate">{partner.name}</span>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500/40 transition-all"
                    style={{ width: `${(partner.share / maxImport) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white/80 w-10 text-right font-medium">{partner.share}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
