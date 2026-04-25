'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface RefreshCountdownProps {
  intervalMs: number;
  lastUpdate: Date;
  onRefresh?: () => void;
}

export default function RefreshCountdown({ intervalMs, lastUpdate, onRefresh }: RefreshCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(intervalMs);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - lastUpdate.getTime();
      const remaining = Math.max(0, intervalMs - elapsed);
      setTimeLeft(remaining);
      setProgress((remaining / intervalMs) * 100);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [intervalMs, lastUpdate]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getColor = () => {
    if (progress > 50) return 'bg-accent-green';
    if (progress > 25) return 'bg-accent-gold';
    return 'bg-accent-red';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-[9px] text-text-dim">
        <RefreshCw className="w-3 h-3" />
        <span>Next refresh:</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-16 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor()} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-white w-8 text-right">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}
