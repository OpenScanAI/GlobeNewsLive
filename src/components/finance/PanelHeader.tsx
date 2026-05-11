'use client';

interface PanelHeaderProps {
  title: string;
  live?: boolean;
  count?: number;
  accentColor?: string;
  timestamp?: string;
}

const COLOR_MAP: Record<string, string> = {
  cyan: 'bg-cyan-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  green: 'bg-emerald-500',
};

export function PanelHeader({ title, live, count, accentColor = 'cyan', timestamp }: PanelHeaderProps) {
  const barClass = COLOR_MAP[accentColor] || 'bg-cyan-500';

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
      <span className="flex items-center gap-2 text-[11px] font-mono font-medium text-gray-300 tracking-wider uppercase">
        <span className={`w-[3px] h-[14px] rounded-full ${barClass}`} />
        {title}
      </span>
      <div className="flex items-center gap-1">
        {timestamp && (
          <span className="text-[8px] font-mono text-white/30 hidden sm:inline">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {live && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-green-900/30 text-green-500 border border-green-800/30 rounded tracking-wider">
            LIVE
          </span>
        )}
        {count !== undefined && (
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-gray-800/80 text-gray-500 rounded">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}
