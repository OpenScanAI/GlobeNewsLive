'use client';

import { useEffect, useRef, useState } from 'react';
import { Signal } from '@/types';

interface BreakingNewsBannerProps {
  signals: Signal[];
  onClose?: () => void;
  notificationLevel?: 'all' | 'critical';
}

export default function BreakingNewsBanner({ signals, onClose, notificationLevel = 'critical' }: BreakingNewsBannerProps) {
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const criticals = signals.filter(
    s => (notificationLevel === 'all' ? (s.severity === 'CRITICAL' || s.severity === 'HIGH') : s.severity === 'CRITICAL') && !dismissed.has(s.id)
  );

  useEffect(() => {
    if (criticals.length > 0) {
      setVisible(true);
      // Auto-rotate headlines every 8s
      const interval = setInterval(() => {
        setCurrentIdx(i => (i + 1) % criticals.length);
      }, 8000);
      // Auto-dismiss after 30s
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 30000);
      return () => { clearInterval(interval); };
    } else {
      setVisible(false);
    }
  }, [criticals.length]);

  const handleDismiss = () => {
    if (criticals[currentIdx]) {
      setDismissed(prev => { const next = new Set(prev); next.add(criticals[currentIdx].id); return next; });
    }
    if (criticals.length <= 1) {
      setVisible(false);
      onClose?.();
    }
  };

  const handleClick = () => {
    // Scroll to signal feed
    const el = document.getElementById('signal-feed');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!visible || criticals.length === 0) return null;

  const current = criticals[currentIdx];

  return (
    <div
      className="relative z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, rgba(255,34,68,0.25) 0%, rgba(255,34,68,0.1) 50%, rgba(255,34,68,0.25) 100%)',
        borderBottom: '1px solid rgba(255,34,68,0.4)',
        animation: 'breakingPulse 2s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes breakingPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,34,68,0); }
          50% { box-shadow: 0 0 20px rgba(255,34,68,0.3); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex items-center h-9">
        {/* BREAKING label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full" style={{ borderRight: '1px solid rgba(255,34,68,0.3)', background: 'rgba(255,34,68,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-red-400 whitespace-nowrap">BREAKING</span>
        </div>

        {/* Count badge */}
        {criticals.length > 1 && (
          <div className="flex-shrink-0 px-2 h-full flex items-center" style={{ borderRight: '1px solid rgba(255,34,68,0.2)' }}>
            <span className="font-mono text-[9px] text-red-400/70">{currentIdx + 1}/{criticals.length}</span>
          </div>
        )}

        {/* Scrolling headline */}
        <button
          className="flex-1 px-4 h-full flex items-center overflow-hidden hover:bg-white/5 transition-colors text-left"
          onClick={handleClick}
        >
          <div className="w-full overflow-hidden" ref={tickerRef}>
            <span
              className="font-mono text-[11px] text-white/95 whitespace-nowrap block"
              key={current?.id}
              style={{ animation: 'fadeInRight 0.3s ease-out' }}
            >
              {current?.title}
            </span>
          </div>
        </button>

        {/* Time remaining indicator */}
        <div className="flex-shrink-0 px-3 h-full flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/30">
            {new Date(current?.timestamp || Date.now()).toLocaleTimeString('en-US', { 
              hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' 
            })} UTC
          </span>
        </div>

        {/* Dismiss button */}
        <button
          className="flex-shrink-0 w-9 h-full flex items-center justify-center hover:bg-red-500/20 transition-colors"
          onClick={handleDismiss}
          style={{ borderLeft: '1px solid rgba(255,34,68,0.2)' }}
        >
          <span className="text-white/50 text-sm">×</span>
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-red-500/50"
        style={{ animation: 'progress 30s linear forwards', width: '100%', transformOrigin: 'left' }}
      />
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        @keyframes fadeInRight {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
