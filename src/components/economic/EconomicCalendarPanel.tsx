'use client';

import { CalendarEvent } from '@/data/economicExtended';

interface EconomicCalendarPanelProps {
  events: CalendarEvent[];
}

export default function EconomicCalendarPanel({ events }: EconomicCalendarPanelProps) {
  const importanceColor = (imp: string) => {
    switch (imp) {
      case 'high': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      default: return 'text-white/30 border-white/10 bg-white/5';
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'cpi': return 'CPI';
      case 'gdp': return 'GDP';
      case 'employment': return 'JOBS';
      case 'central_bank': return 'CB';
      case 'trade': return 'TRADE';
      case 'pmi': return 'PMI';
      default: return type.toUpperCase();
    }
  };

  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">📅</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Economic Calendar</span>
      </div>

      <div className="space-y-2">
        {sorted.map((event, i) => (
          <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-md border ${importanceColor(event.importance)}`}>
            <div className="shrink-0">
              <div className="text-xs text-white/40 font-medium">{event.date.slice(5)}</div>
              <div className="text-xs text-white/20">{event.date.slice(0, 4)}</div>
            </div>
            <div className="shrink-0 px-1.5 py-0.5 rounded bg-white/5 text-xs text-white/40">
              {typeLabel(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/70 truncate">{event.name}</div>
              <div className="flex items-center gap-2">
                {event.forecast && (
                  <span className="text-xs text-white/30">
                    F: <span className="text-emerald-400/70">{event.forecast}</span>
                  </span>
                )}
                {event.previous && (
                  <span className="text-xs text-white/30">
                    P: <span className="text-white/40">{event.previous}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
