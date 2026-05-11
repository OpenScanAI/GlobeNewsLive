'use client';

import { CentralBank, RateDecision } from '@/data/economicExtended';

interface CentralBankPanelProps {
  data: CentralBank;
}

export default function CentralBankPanel({ data }: CentralBankPanelProps) {
  const { name, policyRate, previousRate, lastDecision, lastMeeting, nextMeeting, rateTrajectory } = data;

  const decisionIcon = (d: RateDecision) => {
    switch (d) {
      case 'hike': return '▲';
      case 'cut': return '▼';
      case 'hold': return '⏸';
    }
  };

  const decisionColor = (d: RateDecision) => {
    switch (d) {
      case 'hike': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'cut': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'hold': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const rateChange = policyRate !== null && previousRate !== null
    ? policyRate - previousRate
    : null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">🏦</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Central Bank</span>
      </div>

      <div className="mb-4">
        <div className="text-xs text-white/50 font-medium">{name}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-white/90">
            {policyRate !== null ? `${policyRate.toFixed(2)}%` : '—'}
          </span>
          {rateChange !== null && rateChange !== 0 && (
            <span className={`text-xs font-medium ${rateChange > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {rateChange > 0 ? '+' : ''}{rateChange.toFixed(2)}pp
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg bg-white/5 p-2.5">
          <div className="text-xs text-white/30 mb-1">Last Decision</div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${decisionColor(lastDecision)}`}>
            <span>{decisionIcon(lastDecision)}</span>
            <span className="uppercase">{lastDecision}</span>
          </div>
          <div className="text-xs text-white/25 mt-1">{lastMeeting}</div>
        </div>
        <div className="rounded-lg bg-white/5 p-2.5">
          <div className="text-xs text-white/30 mb-1">Next Meeting</div>
          <div className="text-sm text-white/70 font-medium">
            {nextMeeting || 'TBA'}
          </div>
        </div>
      </div>

      {/* Rate trajectory */}
      <div>
        <div className="text-xs text-white/30 mb-2">Last 6 Decisions</div>
        <div className="flex items-center gap-1">
          {rateTrajectory.map((d, i) => (
            <div
              key={i}
              className={`flex-1 h-7 rounded-md flex items-center justify-center border text-sm font-medium ${decisionColor(d)}`}
            >
              {decisionIcon(d)}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {['-5', '-4', '-3', '-2', '-1', 'Latest'].map((label, i) => (
            <div key={i} className="flex-1 text-center text-xs text-white/20">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
