'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TVModeProps {
  isActive: boolean;
  onExit: () => void;
  interval?: number; // ms between panel cycles, default 45000
  panels?: string[];
}

const DEFAULT_PANELS = [
  { id: 'world-map', label: 'WORLD MAP', icon: '🗺️' },
  { id: 'signal-feed', label: 'LIVE SIGNALS', icon: '📡' },
  { id: 'market-ticker', label: 'MARKET DATA', icon: '📈' },
  { id: 'prediction-panel', label: 'PREDICTIONS', icon: '🎯' },
  { id: 'attack-timeline', label: 'ATTACK TIMELINE', icon: '⚔️' },
  { id: 'country-risk', label: 'COUNTRY RISK', icon: '🌍' },
  { id: 'cyber-feed', label: 'CYBER THREATS', icon: '💻' },
  { id: 'ai-insights', label: 'AI ANALYSIS', icon: '🤖' },
];

export default function TVMode({ isActive, onExit, interval = 45000 }: TVModeProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(interval / 1000);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [customInterval, setCustomInterval] = useState(interval / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scrollToPanel = useCallback((panelId: string) => {
    const el = document.getElementById(panelId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const nextPanel = useCallback(() => {
    setCurrentPanel(p => {
      const next = (p + 1) % DEFAULT_PANELS.length;
      scrollToPanel(DEFAULT_PANELS[next].id);
      return next;
    });
    setTimeLeft(customInterval);
  }, [customInterval, scrollToPanel]);

  const prevPanel = useCallback(() => {
    setCurrentPanel(p => {
      const prev = (p - 1 + DEFAULT_PANELS.length) % DEFAULT_PANELS.length;
      scrollToPanel(DEFAULT_PANELS[prev].id);
      return prev;
    });
    setTimeLeft(customInterval);
  }, [customInterval, scrollToPanel]);

  // Enter fullscreen
  useEffect(() => {
    if (isActive && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    };
  }, [isActive]);

  // Auto-cycle
  useEffect(() => {
    if (!isActive || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    // Countdown timer
    setTimeLeft(customInterval);
    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) return customInterval;
        return t - 1;
      });
    }, 1000);

    // Panel cycle
    intervalRef.current = setInterval(nextPanel, customInterval * 1000);

    // Scroll to first panel
    scrollToPanel(DEFAULT_PANELS[currentPanel].id);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isActive, paused, customInterval, nextPanel, scrollToPanel]);

  // Keyboard handler
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onExit(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPanel();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevPanel();
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
      // Show controls on any key
      setShowControls(true);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, nextPanel, prevPanel, onExit]);

  // Mouse move shows controls
  useEffect(() => {
    if (!isActive) return;
    const handleMove = () => {
      setShowControls(true);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [isActive]);

  if (!isActive) return null;

  const progress = ((customInterval - timeLeft) / customInterval) * 100;

  return (
    <>
      {/* TV Mode overlay indicator */}
      <div
        className="fixed top-4 right-4 z-[200] transition-all duration-500"
        style={{ opacity: showControls ? 1 : 0.3 }}
      >
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,255,136,0.3)' }}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[10px] text-white/70 tracking-widest">TV MODE</span>
        </div>
      </div>

      {/* Bottom control bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] transition-all duration-500"
        style={{ 
          opacity: showControls ? 1 : 0,
          transform: showControls ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: '#00ff88' }}
          />
        </div>

        <div 
          className="flex items-center justify-between px-6 py-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(0,255,136,0.2)' }}
        >
          {/* Panel info */}
          <div className="flex items-center gap-4">
            <span className="text-2xl">{DEFAULT_PANELS[currentPanel].icon}</span>
            <div>
              <div className="font-mono text-xs text-white/80 font-bold tracking-wider">{DEFAULT_PANELS[currentPanel].label}</div>
              <div className="font-mono text-[9px] text-white/30">{currentPanel + 1} / {DEFAULT_PANELS.length}</div>
            </div>
          </div>

          {/* Panel dots */}
          <div className="flex gap-1.5">
            {DEFAULT_PANELS.map((p, i) => (
              <button
                key={p.id}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentPanel ? '20px' : '6px',
                  height: '6px',
                  backgroundColor: i === currentPanel ? '#00ff88' : 'rgba(255,255,255,0.2)',
                }}
                onClick={() => { setCurrentPanel(i); scrollToPanel(p.id); setTimeLeft(customInterval); }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Interval selector */}
            <select
              className="bg-transparent border font-mono text-[10px] rounded px-2 py-1 text-white/60"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              value={customInterval}
              onChange={e => setCustomInterval(Number(e.target.value))}
            >
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>1min</option>
              <option value={90}>90s</option>
              <option value={120}>2min</option>
            </select>

            <div className="font-mono text-[10px] text-white/30 w-6 text-center">{timeLeft}s</div>

            <button onClick={prevPanel} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors text-sm">‹</button>
            <button 
              onClick={() => setPaused(p => !p)} 
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors text-sm"
            >
              {paused ? '▶' : '⏸'}
            </button>
            <button onClick={nextPanel} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors text-sm">›</button>

            <button
              onClick={onExit}
              className="ml-2 px-3 py-1 rounded font-mono text-[10px] text-red-400 hover:bg-red-500/20 transition-colors border"
              style={{ borderColor: 'rgba(255,68,68,0.3)' }}
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
