'use client';

import { useState, useEffect } from 'react';
import { Signal } from '@/types';

interface MobileNavProps {
  activeView: 'feed' | 'map' | 'markets' | 'tracking' | 'alerts' | 'economic';
  onViewChange: (view: 'feed' | 'map' | 'markets' | 'tracking' | 'alerts' | 'economic') => void;
  criticalCount: number;
}

export default function MobileNav({ activeView, onViewChange, criticalCount }: MobileNavProps) {
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [unreadAlerts, setUnreadAlerts] = useState(criticalCount);

  // Update unread count when criticalCount changes
  useEffect(() => {
    if (criticalCount > unreadAlerts) {
      setUnreadAlerts(criticalCount);
    }
  }, [criticalCount, unreadAlerts]);

  // Mark alerts as read when viewing alerts tab
  useEffect(() => {
    if (activeView === 'alerts') {
      setUnreadAlerts(0);
    }
  }, [activeView]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStart === null) return;
    
    const swipeEnd = e.changedTouches[0].clientX;
    const diff = swipeStart - swipeEnd;
    const minSwipeDistance = 50;

    const views: ('feed' | 'map' | 'markets' | 'tracking' | 'alerts' | 'economic')[] = ['feed', 'map', 'markets', 'tracking', 'alerts', 'economic'];
    const currentIndex = views.indexOf(activeView);

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && currentIndex < views.length - 1) {
        // Swipe left - next view
        onViewChange(views[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous view
        onViewChange(views[currentIndex - 1]);
      }
    }
    
    setSwipeStart(null);
  };

  const navItems = [
    { id: 'feed' as const, label: 'Feed', icon: '📰', badge: null },
    { id: 'map' as const, label: 'Map', icon: '🗺️', badge: null },
    { id: 'markets' as const, label: 'Markets', icon: '📈', badge: null },
    { id: 'tracking' as const, label: 'Track', icon: '✈️', badge: null },
    { id: 'alerts' as const, label: 'Alerts', icon: '🚨', badge: unreadAlerts },
    { id: 'economic' as const, label: 'Econ', icon: '🏛️', badge: null },
  ];

  return (
    <>
      {/* Swipe indicator */}
      <div className="lg:hidden fixed top-[80px] left-0 right-0 z-40 pointer-events-none">
        <div className="flex justify-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                activeView === item.id ? 'bg-accent-green' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-elevated/95 backdrop-blur-lg border-t border-border-default safe-area-pb"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 min-w-[56px] ${
                activeView === item.id 
                  ? 'bg-accent-green/20 text-accent-green' 
                  : 'text-text-dim hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-mono font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {activeView === item.id && (
                <div className="absolute -bottom-2 w-1 h-1 bg-accent-green rounded-full" />
              )}
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-red rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse border-2 border-elevated">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Swipe hint */}
        <div className="absolute top-0 left-0 right-0 -translate-y-full flex justify-center">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] text-text-dim font-mono">
            👆 Swipe to switch tabs
          </div>
        </div>
      </nav>

      {/* Pull-to-refresh hint */}
      <div className="lg:hidden fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none opacity-0 animate-fade-in-out">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] text-white font-mono flex items-center gap-2">
          <span>↓</span>
          <span>Pull to refresh</span>
        </div>
      </div>
    </>
  );
}
