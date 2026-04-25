'use client';
import RefreshCountdown from '@/components/RefreshCountdown';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThreatLevel } from '@/types';
import LanguageSelector from './LanguageSelector';
import { Language, t } from '@/lib/i18n';

// ─── Theme Toggle Hook ────────────────────────────────────────────────────────
export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('globenews-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove('light-mode');
        localStorage.setItem('globenews-theme', 'dark');
      } else {
        document.documentElement.classList.add('light-mode');
        localStorage.setItem('globenews-theme', 'light');
      }
      return next;
    });
  };

  return { isDark, toggle };
}

// ─── Theme Toggle Button ──────────────────────────────────────────────────────
export function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition-all"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="text-sm">{isDark ? '☀️' : '🌙'}</span>
      <span className="text-[9px] font-mono text-white/50 hidden sm:block">
        {isDark ? 'LIGHT' : 'DARK'}
      </span>
    </button>
  );
}

const THREAT_COLORS: Record<ThreatLevel, string> = {
  LOW: '#00ff88',
  GUARDED: '#00ccff',
  ELEVATED: '#ffaa00',
  HIGH: '#ff6633',
  SEVERE: '#ff2244'
};

interface HeaderProps {
  threatLevel: ThreatLevel;
  breakingNews?: string;
  lastUpdate: Date;
  signalCount: number;
  criticalCount: number;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  isDark?: boolean;
  onThemeToggle?: () => void;
}

export default function Header({ threatLevel, breakingNews, lastUpdate, signalCount, criticalCount, language = 'en', onLanguageChange, isDark = true, onThemeToggle }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [showBreaking, setShowBreaking] = useState(true);
  const [updateAgo, setUpdateAgo] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setUpdateAgo(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  useEffect(() => {
    if (!breakingNews) return;
    const timer = setInterval(() => setShowBreaking(prev => !prev), 500);
    setTimeout(() => { clearInterval(timer); setShowBreaking(true); }, 3000);
    return () => clearInterval(timer);
  }, [breakingNews]);
  
  const utcTime = time.toISOString().substring(11, 19);
  
  return (
    <header className="bg-elevated border-b border-border-default">
      {/* Breaking news banner */}
      {breakingNews && (
        <div 
          className="border-b border-accent-red/30 px-2 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 transition-all duration-200"
          style={{ backgroundColor: showBreaking ? 'rgba(255,34,68,0.15)' : 'rgba(255,34,68,0.08)' }}
        >
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-accent-red animate-pulse">⚠</span>
            <span className="text-accent-red font-mono text-[9px] sm:text-[10px] font-bold tracking-wider">BREAKING</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-white/90 truncate flex-1">{breakingNews}</span>
        </div>
      )}
      
      {/* Main header - Desktop */}
      <div className="hidden sm:flex px-4 py-2 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-accent-green/30 to-accent-blue/20 flex items-center justify-center border border-accent-green/30">
              <span className="text-accent-green text-xl">🌐</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-green rounded-full border-2 border-elevated animate-pulse" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-wider text-accent-green flex items-center gap-2">
                GLOBENEWS
                <span className="px-1.5 py-0.5 bg-accent-red/20 text-[8px] rounded border border-accent-red/30 text-accent-red animate-pulse">LIVE</span>
              </h1>
              <p className="text-[9px] text-text-muted tracking-wide">{signalCount} ACTIVE SIGNALS</p>
            </div>
          </Link>
          
          {/* Pro Link */}
          <Link 
            href="/pro" 
            className="ml-4 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[10px] font-mono text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>PRO</span>
          </Link>
        </div>
        
        {/* Threat Level */}
        <div 
          className="flex items-center gap-3 px-4 py-2 rounded-lg"
          style={{ 
            backgroundColor: `${THREAT_COLORS[threatLevel]}15`,
            border: `1px solid ${THREAT_COLORS[threatLevel]}40`,
            boxShadow: (threatLevel === 'SEVERE' || threatLevel === 'HIGH') ? `0 0 20px ${THREAT_COLORS[threatLevel]}30` : 'none'
          }}
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THREAT_COLORS[threatLevel] }} />
            {(threatLevel === 'SEVERE' || threatLevel === 'HIGH') && (
              <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: THREAT_COLORS[threatLevel], opacity: 0.5 }} />
            )}
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold tracking-wider" style={{ color: THREAT_COLORS[threatLevel] }}>THREAT LEVEL</div>
            <div className="font-mono text-[14px] font-bold tracking-wider" style={{ color: THREAT_COLORS[threatLevel] }}>{threatLevel}</div>
          </div>
          {criticalCount > 0 && (
            <div className="ml-2 px-2 py-1 bg-accent-red/20 rounded text-accent-red font-mono text-[10px] font-bold">{criticalCount} CRITICAL</div>
          )}
        </div>
        
        {/* Time + Language */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {onThemeToggle && (
            <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
          )}

          {/* Language Selector */}
          {onLanguageChange && (
            <LanguageSelector 
              currentLang={language} 
              onLanguageChange={onLanguageChange}
            />
          )}
          
          <div className="text-right">
            <div className="font-mono text-lg text-white tracking-wide">{utcTime}</div>
            <div className="font-mono text-[9px] text-text-muted">UTC</div>
          </div>
          <div className="text-right border-l border-border-subtle pl-4">
            <div className="flex items-center gap-1.5 justify-end">
              <div className={`w-2 h-2 rounded-full ${updateAgo < 120 ? 'bg-accent-green animate-pulse' : 'bg-accent-gold'}`} />
              <span className="font-mono text-[11px] text-white">{updateAgo < 60 ? 'LIVE' : 'SYNCING'}</span>
            </div>
            <div className="font-mono text-[9px] text-text-dim">{updateAgo < 60 ? `${updateAgo}s` : `${Math.floor(updateAgo / 60)}m`} ago</div>
            <RefreshCountdown intervalMs={30000} lastUpdate={lastUpdate} onRefresh={() => {}} />
          </div>
        </div>
      </div>

      {/* Main header - Mobile */}
      <div className="sm:hidden px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green/30 to-accent-blue/20 flex items-center justify-center">
            <span className="text-accent-green text-lg">🌐</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="font-mono text-[11px] font-bold tracking-wider text-accent-green">GLOBENEWS <span className="text-accent-red">LIVE</span></h1>
            <p className="text-[8px] text-text-muted">{signalCount} signals</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Compact threat level */}
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded"
            style={{ backgroundColor: `${THREAT_COLORS[threatLevel]}20` }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: THREAT_COLORS[threatLevel] }} />
            <span className="font-mono text-[9px] font-bold" style={{ color: THREAT_COLORS[threatLevel] }}>{threatLevel}</span>
          </div>
          
          {/* Live indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-elevated rounded">
            <div className={`w-1.5 h-1.5 rounded-full ${updateAgo < 120 ? 'bg-accent-green animate-pulse' : 'bg-accent-gold'}`} />
            <span className="font-mono text-[9px] text-white">{utcTime.substring(0, 5)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
