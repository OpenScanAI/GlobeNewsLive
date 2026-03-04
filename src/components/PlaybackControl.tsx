'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface PlaybackControlProps {
  onTimeChange?: (timestamp: number) => void;
  startDate?: Date;
  endDate?: Date;
}

type PlaySpeed = 0.5 | 1 | 2 | 5 | 10;

const SPEED_LABELS: Record<PlaySpeed, string> = {
  0.5: '0.5×',
  1: '1×',
  2: '2×',
  5: '5×',
  10: '10×',
};

// Historical events for each time position (for context display)
const HISTORICAL_EVENTS = [
  { dayOffset: 0, event: 'Current — Live Mode', severity: 'live' },
  { dayOffset: -1, event: 'Yemen: Houthi missile attack on Red Sea shipping', severity: 'high' },
  { dayOffset: -2, event: 'Ukraine: Kursk incursion — Ukrainian forces cross border', severity: 'critical' },
  { dayOffset: -3, event: 'Gaza: IDF ground operation resumes in Rafah', severity: 'high' },
  { dayOffset: -4, event: 'Sudan: SAF airstrike on RSF position in Omdurman', severity: 'medium' },
  { dayOffset: -5, event: 'Iran: IRGC naval exercises in Strait of Hormuz', severity: 'medium' },
  { dayOffset: -7, event: 'South China Sea: PLA-N ships enter Taiwan ADIZ', severity: 'high' },
  { dayOffset: -10, event: 'Lebanon: Cross-border artillery exchange', severity: 'high' },
  { dayOffset: -14, event: 'DPRK: Ballistic missile launch over Sea of Japan', severity: 'critical' },
  { dayOffset: -21, event: 'Russia: Massive drone barrage on Ukrainian energy grid', severity: 'critical' },
  { dayOffset: -30, event: 'Somalia: Al-Shabaab attack on Mogadishu hotel', severity: 'medium' },
];

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function PlaybackControl({ onTimeChange, startDate, endDate }: PlaybackControlProps) {
  const now = useRef(Date.now());
  const msRange = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  const [position, setPosition] = useState(100); // 0-100, 100 = now
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaySpeed>(1);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTimestamp = now.current - ((100 - position) / 100) * msRange;
  const currentDate = new Date(currentTimestamp);

  const nearestEvent = HISTORICAL_EVENTS.reduce((best, ev) => {
    const evTs = now.current + ev.dayOffset * 86400000;
    const dist = Math.abs(evTs - currentTimestamp);
    const bestDist = Math.abs((now.current + best.dayOffset * 86400000) - currentTimestamp);
    return dist < bestDist ? ev : best;
  });

  const SEVERITY_COLORS: Record<string, string> = {
    live: '#00ff88',
    critical: '#ff2244',
    high: '#ff6644',
    medium: '#ffaa00',
  };

  const goLive = useCallback(() => {
    setPosition(100);
    setIsLive(true);
    setIsPlaying(false);
    onTimeChange?.(Date.now());
  }, [onTimeChange]);

  const play = useCallback(() => {
    setIsPlaying(true);
    setIsLive(false);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Playback advance
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPosition(prev => {
        const next = prev + (speed * 0.1);
        if (next >= 100) {
          setIsPlaying(false);
          setIsLive(true);
          return 100;
        }
        const ts = now.current - ((100 - next) / 100) * msRange;
        onTimeChange?.(ts);
        return next;
      });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, msRange, onTimeChange]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setPosition(val);
    setIsLive(val >= 99.9);
    setIsPlaying(false);
    const ts = now.current - ((100 - val) / 100) * msRange;
    onTimeChange?.(ts);
  };

  const startTs = new Date(now.current - msRange);

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-lg p-3 w-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱️</span>
          <span className="text-[11px] font-bold text-[#00ff88] uppercase tracking-wider">Historical Playback</span>
        </div>
        {isLive && (
          <span className="flex items-center gap-1 text-[9px] text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-white/40">{formatDate(startTs)}</div>
        <div className="text-center">
          <div className="text-[13px] font-bold text-white">{formatDate(currentDate)}</div>
          <div className="text-[10px] text-white/50">{formatTime(currentDate)} UTC</div>
        </div>
        <div className="text-[10px] text-white/40">NOW</div>
      </div>

      {/* Slider */}
      <div className="relative mb-2">
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={position}
          onChange={handleScrub}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00ff88 ${position}%, rgba(255,255,255,0.1) ${position}%)`,
          }}
        />
        {/* Event markers */}
        {HISTORICAL_EVENTS.filter(e => e.dayOffset < 0).map(ev => {
          const pct = ((msRange + ev.dayOffset * 86400000) / msRange) * 100;
          const color = SEVERITY_COLORS[ev.severity] || '#ffaa00';
          return (
            <div key={ev.dayOffset}
              className="absolute top-0 w-0.5 h-1.5 rounded-full"
              style={{ left: `${pct}%`, backgroundColor: color, transform: 'translateX(-50%)' }}
              title={ev.event}
            />
          );
        })}
      </div>

      {/* Current event context */}
      <div className="mb-2 px-2 py-1.5 rounded bg-white/5 border border-white/5 min-h-[32px]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[nearestEvent.severity] }} />
          <span className="text-[9px] text-white/60 leading-relaxed">{nearestEvent.event}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Play/Pause/Live */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setPosition(0); setIsLive(false); setIsPlaying(false); onTimeChange?.(now.current - msRange); }}
            className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-sm transition-all"
            title="Go to start"
          >⏮</button>
          <button
            onClick={isPlaying ? pause : play}
            className="w-8 h-8 flex items-center justify-center rounded bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] text-base transition-all border border-[#00ff88]/20"
            disabled={isLive}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={goLive}
            className={`px-2 py-1 text-[9px] rounded transition-all border ${
              isLive
                ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30'
                : 'text-white/30 border-white/10 hover:text-[#00ff88] hover:border-[#00ff88]/30'
            }`}
          >
            LIVE
          </button>
        </div>

        {/* Speed controls */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-white/25 mr-1">SPEED</span>
          {([0.5, 1, 2, 5, 10] as PlaySpeed[]).map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-[9px] rounded transition-all ${
                speed === s ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/20 hover:text-white/50'
              }`}>
              {SPEED_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-1.5 text-[8px] text-white/20 text-center">
        Drag slider · Click event markers · Speed up playback
      </div>
    </div>
  );
}
