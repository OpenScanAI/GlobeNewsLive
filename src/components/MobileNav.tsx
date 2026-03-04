'use client';

import { useState } from 'react';

type MobileView = 'feed' | 'map' | 'markets' | 'tracking';

interface MobileNavProps {
  activeView: MobileView;
  onViewChange: (view: MobileView) => void;
  criticalCount: number;
}

export default function MobileNav({ activeView, onViewChange, criticalCount }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-elevated border-t border-border-default z-50">
      <div className="flex items-center justify-around py-2">
        {[
          { id: 'feed' as MobileView, icon: '📡', label: 'Feed', badge: criticalCount },
          { id: 'map' as MobileView, icon: '🗺️', label: 'Map', badge: 0 },
          { id: 'markets' as MobileView, icon: '📈', label: 'Markets', badge: 0 },
          { id: 'tracking' as MobileView, icon: '🌍', label: 'Track', badge: 0 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-all relative ${
              activeView === item.id
                ? 'text-accent-green'
                : 'text-text-muted'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-mono">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
