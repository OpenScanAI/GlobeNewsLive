'use client';

import { useState, useMemo } from 'react';

type EventLane = 'protest' | 'conflict' | 'economic' | 'political' | 'natural';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  lane: EventLane;
  label: string;
  description: string;
  severity: Severity;
  country: string;
  flag: string;
}

const LANE_COLORS: Record<EventLane, string> = {
  protest: '#ffaa00',
  conflict: '#ff4444',
  economic: '#64b4ff',
  political: '#b478ff',
  natural: '#44ddff',
};

const LANE_ICONS: Record<EventLane, string> = {
  protest: '✊',
  conflict: '⚔️',
  economic: '📊',
  political: '🏛️',
  natural: '🌪️',
};

const EVENTS: TimelineEvent[] = [
  { id: 'e1', timestamp: new Date(Date.now() - 1 * 3600000), lane: 'conflict', label: 'Kyiv missile strike', description: 'Russian ballistic missile strikes on Ukrainian capital, civilian casualties reported', severity: 'critical', country: 'Ukraine', flag: '🇺🇦' },
  { id: 'e2', timestamp: new Date(Date.now() - 2 * 3600000), lane: 'political', label: 'EU emergency summit', description: 'Emergency EU council session on Ukraine support package', severity: 'high', country: 'Belgium', flag: '🇧🇪' },
  { id: 'e3', timestamp: new Date(Date.now() - 4 * 3600000), lane: 'economic', label: 'Fed rate decision', description: 'Federal Reserve holds rates at 5.25-5.50% amid inflation concerns', severity: 'high', country: 'United States', flag: '🇺🇸' },
  { id: 'e4', timestamp: new Date(Date.now() - 6 * 3600000), lane: 'protest', label: 'Paris protests', description: 'Nationwide transport strike disrupts French rail network, 200K+ protesters', severity: 'medium', country: 'France', flag: '🇫🇷' },
  { id: 'e5', timestamp: new Date(Date.now() - 8 * 3600000), lane: 'conflict', label: 'Gaza ceasefire collapse', description: 'Temporary ceasefire collapses after rocket fire exchange', severity: 'critical', country: 'Gaza', flag: '🇵🇸' },
  { id: 'e6', timestamp: new Date(Date.now() - 12 * 3600000), lane: 'natural', label: 'Philippines typhoon', description: 'Typhoon Mawar makes landfall, 1.2M evacuated', severity: 'high', country: 'Philippines', flag: '🇵🇭' },
  { id: 'e7', timestamp: new Date(Date.now() - 18 * 3600000), lane: 'political', label: 'Iran nuclear talks', description: 'US-Iran back-channel negotiations resume in Oman', severity: 'medium', country: 'Iran', flag: '🇮🇷' },
  { id: 'e8', timestamp: new Date(Date.now() - 24 * 3600000), lane: 'economic', label: 'China PMI beats', description: 'China manufacturing PMI surprises at 51.2, above expansion threshold', severity: 'medium', country: 'China', flag: '🇨🇳' },
  { id: 'e9', timestamp: new Date(Date.now() - 30 * 3600000), lane: 'conflict', label: 'Sahel military clashes', description: 'ECOWAS forces and Mali junta troops exchange fire on border', severity: 'high', country: 'Mali', flag: '🇲🇱' },
  { id: 'e10', timestamp: new Date(Date.now() - 36 * 3600000), lane: 'protest', label: 'Venezuela crackdown', description: 'Security forces arrest opposition leaders ahead of election', severity: 'high', country: 'Venezuela', flag: '🇻🇪' },
  { id: 'e11', timestamp: new Date(Date.now() - 48 * 3600000), lane: 'natural', label: 'Turkey earthquake M5.8', description: 'Moderate earthquake near Ankara, no major damage reported', severity: 'medium', country: 'Turkey', flag: '🇹🇷' },
  { id: 'e12', timestamp: new Date(Date.now() - 60 * 3600000), lane: 'political', label: 'India election results', description: 'BJP wins Maharashtra state by significant majority', severity: 'low', country: 'India', flag: '🇮🇳' },
];

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const LANES: EventLane[] = ['conflict', 'political', 'economic', 'protest', 'natural'];

export default function CountryTimelinePanel() {
  const [laneFilter, setLaneFilter] = useState<EventLane[]>([...LANES]);
  const [severityFilter, setSeverityFilter] = useState<Severity[]>([...SEVERITIES]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [timeRange, setTimeRange] = useState<24 | 48 | 72>(48);

  const cutoff = useMemo(() => new Date(Date.now() - timeRange * 3600000), [timeRange]);

  const filtered = useMemo(() =>
    EVENTS.filter(e =>
      e.timestamp >= cutoff &&
      laneFilter.includes(e.lane) &&
      severityFilter.includes(e.severity)
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [cutoff, laneFilter, severityFilter]
  );

  const toggleLane = (lane: EventLane) => {
    setLaneFilter(f => f.includes(lane) ? f.filter(x => x !== lane) : [...f, lane]);
  };

  const toggleSeverity = (sev: Severity) => {
    setSeverityFilter(f => f.includes(sev) ? f.filter(x => x !== sev) : [...f, sev]);
  };

  const severityColor: Record<Severity, string> = {
    critical: 'border-red-500 bg-red-500',
    high: 'border-orange-400 bg-orange-400',
    medium: 'border-yellow-400 bg-yellow-400',
    low: 'border-[#00ff88] bg-[#00ff88]',
  };

  const formatTime = (d: Date) => {
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-2 border-b border-white/5 flex flex-col gap-2">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 font-mono">RANGE:</span>
          <div className="flex gap-1">
            {([24, 48, 72] as const).map(h => (
              <button
                key={h}
                onClick={() => setTimeRange(h)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                  timeRange === h
                    ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                    : 'text-white/40 border-white/10'
                }`}
              >
                {h}H
              </button>
            ))}
          </div>
          <span className="ml-auto text-[10px] text-white/30 font-mono">{filtered.length} events</span>
        </div>

        {/* Lane Filter */}
        <div className="flex gap-1 flex-wrap">
          {LANES.map(lane => (
            <button
              key={lane}
              onClick={() => toggleLane(lane)}
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                laneFilter.includes(lane)
                  ? 'text-white border-white/20 bg-white/5'
                  : 'text-white/20 border-white/5'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: laneFilter.includes(lane) ? LANE_COLORS[lane] : '#ffffff20' }}
              />
              {lane}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="p-2 border-b border-white/5">
        <div className="relative h-8">
          {/* Time axis */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          {filtered.slice(0, 20).map((event, i) => {
            const age = Date.now() - event.timestamp.getTime();
            const maxAge = timeRange * 3600000;
            const xPct = 100 - (age / maxAge) * 100;
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                title={event.label}
                className="absolute w-3 h-3 rounded-full border-2 transition-transform hover:scale-125 -translate-x-1/2 -translate-y-1/2 top-1/2"
                style={{
                  left: `${Math.max(2, Math.min(98, xPct))}%`,
                  borderColor: LANE_COLORS[event.lane],
                  background: selectedEvent?.id === event.id ? LANE_COLORS[event.lane] : '#0a0a0f',
                  zIndex: event.severity === 'critical' ? 10 : 5,
                  transform: `translateX(-50%) translateY(-50%) scale(${event.severity === 'critical' ? 1.3 : 1})`,
                }}
              />
            );
          })}
          <div className="absolute left-0 bottom-0 text-[8px] font-mono text-white/20">{timeRange}h ago</div>
          <div className="absolute right-0 bottom-0 text-[8px] font-mono text-white/20">Now</div>
        </div>
      </div>

      {/* Selected Event Detail */}
      {selectedEvent && (
        <div className="p-2 border-b border-white/5 glass-panel mx-2 my-1">
          <div className="flex items-start gap-2">
            <span className="text-lg">{selectedEvent.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-white">{selectedEvent.label}</span>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: LANE_COLORS[selectedEvent.lane] }}
                />
              </div>
              <div className="text-[10px] font-mono text-white/60">{selectedEvent.description}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-white/30">{selectedEvent.country}</span>
                <span className="text-[9px] font-mono text-white/20">{formatTime(selectedEvent.timestamp)}</span>
              </div>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="text-white/30 hover:text-white text-sm flex-shrink-0">×</button>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {filtered.map(event => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
            className={`glass-panel p-2.5 flex items-start gap-3 text-left w-full transition-colors ${
              selectedEvent?.id === event.id ? 'border-white/20' : 'hover:border-white/10'
            }`}
          >
            {/* Severity dot + lane bar */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 ${severityColor[event.severity]}`}
                style={{ borderColor: LANE_COLORS[event.lane], background: LANE_COLORS[event.lane] + '40' }}
              />
              <div className="w-px flex-1 min-h-[12px]" style={{ background: LANE_COLORS[event.lane] + '30' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm">{event.flag}</span>
                <span className="text-white text-xs font-mono">{event.label}</span>
                <span className="ml-auto text-white/20 text-[10px] font-mono flex-shrink-0">{formatTime(event.timestamp)}</span>
              </div>
              <div className="text-white/50 text-[10px] font-mono line-clamp-1">{event.description}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[9px] font-mono px-1 py-0.5 rounded"
                  style={{ color: LANE_COLORS[event.lane], background: LANE_COLORS[event.lane] + '15' }}
                >
                  {LANE_ICONS[event.lane]} {event.lane}
                </span>
                <span className="text-white/20 text-[9px] font-mono">{event.country}</span>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-white/20 text-xs font-mono">
            No events match current filters
          </div>
        )}
      </div>
    </div>
  );
}
