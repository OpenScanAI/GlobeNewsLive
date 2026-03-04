'use client';

import { useEffect, useState } from 'react';

interface LiveIndicatorProps {
  lastUpdate: Date;
  refreshInterval: number; // in seconds
}

export default function LiveIndicator({ lastUpdate, refreshInterval }: LiveIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [nextRefresh, setNextRefresh] = useState(refreshInterval);

  useEffect(() => {
    const timer = setInterval(() => {
      const ago = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      setSecondsAgo(ago);
      setNextRefresh(Math.max(0, refreshInterval - (ago % refreshInterval)));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate, refreshInterval]);

  const isStale = secondsAgo > refreshInterval * 2;
  const color = isStale ? '#ff6633' : '#00ff88';

  return (
    <div className="flex items-center gap-2">
      {/* Pulsing live dot */}
      <div className="relative">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div 
          className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
      </div>
      
      {/* Status text */}
      <div className="font-mono text-[9px]">
        <span style={{ color }} className="font-bold">LIVE</span>
        <span className="text-text-dim ml-1.5">
          {secondsAgo < 60 ? `${secondsAgo}s` : `${Math.floor(secondsAgo / 60)}m`} ago
        </span>
        <span className="text-text-dim ml-1.5">
          • refresh in {nextRefresh}s
        </span>
      </div>
    </div>
  );
}
