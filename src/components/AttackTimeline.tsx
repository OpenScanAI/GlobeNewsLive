'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Clock, Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Signal } from '@/types';
import { formatDistanceToNow, format, subHours, subDays } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TimelineEvent {
  id: string;
  timestamp: Date;
  title: string;
  type: 'attack' | 'retaliation' | 'military' | 'diplomatic' | 'cyber';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location?: string;
  actors?: string[];
}

const EVENT_ICONS: Record<string, string> = {
  attack: '💥',
  retaliation: '🔄',
  military: '🎖️',
  diplomatic: '🏛️',
  cyber: '💻',
};

const TIME_RANGES = [
  { id: '1h', label: '1H', hours: 1 },
  { id: '6h', label: '6H', hours: 6 },
  { id: '24h', label: '24H', hours: 24 },
  { id: '48h', label: '48H', hours: 48 },
  { id: '7d', label: '7D', hours: 168 },
];

// Convert signals to timeline events
function signalsToTimeline(signals: Signal[]): TimelineEvent[] {
  return signals
    .filter(s => s.severity === 'CRITICAL' || s.severity === 'HIGH')
    .map(s => {
      const text = s.title.toLowerCase();
      let type: TimelineEvent['type'] = 'military';
      
      if (text.includes('attack') || text.includes('strike') || text.includes('bomb')) type = 'attack';
      else if (text.includes('retaliat') || text.includes('response')) type = 'retaliation';
      else if (text.includes('cyber') || text.includes('hack')) type = 'cyber';
      else if (text.includes('talks') || text.includes('diplomat') || text.includes('sanction')) type = 'diplomatic';
      
      // Extract actors
      const actorPatterns = /(israel|hamas|hezbollah|iran|russia|ukraine|us|nato|china)/gi;
      const matchedActors = (text.match(actorPatterns) || []).map(a => a.toUpperCase());
      const actors = Array.from(new Set(matchedActors));
      
      return {
        id: s.id,
        timestamp: new Date(s.timestamp),
        title: s.title,
        type,
        severity: s.severity as TimelineEvent['severity'],
        location: s.source,
        actors,
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default function AttackTimeline() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(100); // 0-100%

  const { data: signalsData } = useSWR<{ signals: Signal[] }>('/api/signals', fetcher, {
    refreshInterval: 60000,
  });

  const signals = signalsData?.signals || [];
  const events = signalsToTimeline(signals);

  // Filter by time range
  const rangeHours = TIME_RANGES.find(r => r.id === timeRange)?.hours || 24;
  const cutoff = subHours(new Date(), rangeHours);
  const filteredEvents = events.filter(e => e.timestamp >= cutoff);

  // Playback effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackPosition(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const visibleEvents = filteredEvents.slice(0, Math.ceil(filteredEvents.length * (playbackPosition / 100)));

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-red" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">ATTACK TIMELINE</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red">
            {filteredEvents.length} EVENTS
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Controls */}
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            {/* Time Range */}
            <div className="flex items-center gap-1">
              {TIME_RANGES.map(range => (
                <button
                  key={range.id}
                  onClick={() => { setTimeRange(range.id); setPlaybackPosition(100); }}
                  className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                    timeRange === range.id
                      ? 'bg-accent-red/20 text-accent-red'
                      : 'text-text-dim hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPlaybackPosition(0)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <SkipBack className="w-3 h-3 text-text-dim" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 bg-accent-red/20 hover:bg-accent-red/30 rounded"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 text-accent-red" />
                ) : (
                  <Play className="w-3 h-3 text-accent-red" />
                )}
              </button>
              <button
                onClick={() => setPlaybackPosition(100)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <SkipForward className="w-3 h-3 text-text-dim" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-3 py-1.5 bg-elevated/30">
            <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-100"
                style={{ width: `${playbackPosition}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-text-dim">
                {format(cutoff, 'MMM d, HH:mm')}
              </span>
              <span className="text-[8px] text-text-dim">Now</span>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="max-h-[250px] overflow-y-auto">
            {visibleEvents.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-text-muted">
                No significant events in this time range
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border-subtle" />
                
                {visibleEvents.map((event, i) => (
                  <div key={event.id} className="relative py-2 pr-3">
                    {/* Timeline dot */}
                    <div className={`absolute left-1.5 w-3 h-3 rounded-full border-2 border-void ${
                      event.severity === 'CRITICAL' ? 'bg-accent-red' : 'bg-accent-orange'
                    }`} />
                    
                    <div className="ml-4 bg-elevated/30 rounded p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{EVENT_ICONS[event.type]}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${
                            event.severity === 'CRITICAL' ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-orange/20 text-accent-orange'
                          }`}>
                            {event.severity}
                          </span>
                        </div>
                        <span className="text-[8px] text-text-dim whitespace-nowrap">
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[10px] text-white mt-1 leading-snug">
                        {event.title.length > 80 ? event.title.substring(0, 77) + '...' : event.title}
                      </p>
                      {event.actors && event.actors.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {event.actors.slice(0, 3).map(actor => (
                            <span key={actor} className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-text-muted">
                              {actor}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-accent-red" />
                <span className="text-[8px] text-text-dim">
                  {visibleEvents.length}/{filteredEvents.length} events shown
                </span>
              </div>
              <span className="text-[8px] text-accent-red">● LIVE</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
