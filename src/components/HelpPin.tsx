'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, X, Pin, PinOff, Maximize2, Minimize2, Keyboard, Layers, Zap, Globe } from 'lucide-react';

interface HelpPinProps {
  className?: string;
}

const SHORTCUTS = [
  { key: '⌘K / Ctrl+K', action: 'Open Command Palette' },
  { key: 'F', action: 'Toggle Fullscreen' },
  { key: 'H', action: 'Toggle Help Panel' },
  { key: '1-9', action: 'Switch Layout Presets' },
  { key: 'M', action: 'Toggle Map Pin' },
  { key: 'T', action: 'Toggle TV Mode' },
  { key: 'W', action: 'Toggle War Room' },
  { key: 'S', action: 'Toggle Sound Alerts' },
];

const FEATURES = [
  { icon: <Layers size={14} />, title: 'Widget Dashboard', desc: 'Add/remove widgets via the Widgets button. Save custom layouts.' },
  { icon: <Globe size={14} />, title: 'Interactive Map', desc: 'Toggle layers (flights, conflicts, earthquakes) from the layer panel.' },
  { icon: <Zap size={14} />, title: 'Live Signals', desc: 'Real-time intelligence feeds with severity filtering.' },
  { icon: <Maximize2 size={14} />, title: 'Fullscreen Mode', desc: 'Press F or use the fullscreen button to expand any panel.' },
];

export default function HelpPin({ className = '' }: HelpPinProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'features' | 'about'>('shortcuts');
  const [hasSeenHelp, setHasSeenHelp] = useState(false);

  // Load "has seen help" state
  useEffect(() => {
    const seen = localStorage.getItem('globenews-help-seen');
    if (seen) setHasSeenHelp(true);
  }, []);

  // Auto-show help on first visit (after 3 seconds)
  useEffect(() => {
    if (!hasSeenHelp) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('globenews-help-seen', 'true');
        setHasSeenHelp(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenHelp]);

  // Keyboard shortcut: 'H' to toggle help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        // Don't trigger if typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Floating Help Button */}
      <div className={`fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 ${className}`}>
        {/* Help Panel */}
        {isOpen && (
          <div 
            className="mb-2 w-80 rounded-xl border shadow-2xl overflow-hidden"
            style={{ 
              background: '#0f1218', 
              borderColor: 'rgba(255,255,255,0.1)',
              animation: 'slideUp 0.2s ease-out'
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-accent-blue" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">HELP & GUIDE</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1 rounded transition-colors ${isPinned ? 'text-accent-green' : 'text-white/30 hover:text-white/60'}`}
                  title={isPinned ? 'Unpin panel' : 'Pin panel open'}
                >
                  {isPinned ? <Pin size={12} /> : <PinOff size={12} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {(['shortcuts', 'features', 'about'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                    activeTab === tab 
                      ? 'text-accent-green border-b border-accent-green' 
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-3 max-h-64 overflow-y-auto">
              {activeTab === 'shortcuts' && (
                <div className="space-y-1.5">
                  {SHORTCUTS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded bg-white/[0.02]">
                      <span className="text-[10px] text-white/70 font-mono">{s.action}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white/50 font-mono border border-white/10">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-2">
                  {FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded bg-white/[0.02]">
                      <div className="text-accent-blue mt-0.5">{f.icon}</div>
                      <div>
                        <div className="text-[10px] font-mono font-semibold text-white">{f.title}</div>
                        <div className="text-[9px] text-white/40 mt-0.5">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-3 text-center py-2">
                  <div className="text-3xl">🌐</div>
                  <div>
                    <div className="text-xs font-mono font-bold text-accent-green">GLOBENEWS LIVE</div>
                    <div className="text-[9px] text-white/30 mt-1">Real-Time Global Intelligence</div>
                  </div>
                  <div className="text-[9px] text-white/30 leading-relaxed px-2">
                    Aggregating 60+ intelligence sources including military tracking, 
                    financial markets, seismic activity, cyber threats, and geopolitical analysis.
                  </div>
                  <div className="text-[8px] text-white/20 font-mono">
                    v3.5.0 • Open Source
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border ${
            isOpen 
              ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue' 
              : 'bg-[#0f1218] border-white/10 text-white/60 hover:text-white hover:border-white/25'
          }`}
          title="Help & Shortcuts (H)"
        >
          {isOpen ? <X size={20} /> : <HelpCircle size={20} />}
        </button>
      </div>

      {/* Click outside to close (only if not pinned) */}
      {isOpen && !isPinned && (
        <div 
          className="fixed inset-0 z-[99]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
