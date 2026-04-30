'use client';

import { X, Moon, Sun, Bell, BellOff, RefreshCw, Globe } from 'lucide-react';

export interface DashboardSettings {
  theme: 'dark' | 'light';
  refreshInterval: 15 | 30 | 60;
  soundEnabled: boolean;
  trackedRegions: string[];
  notificationLevel: 'all' | 'critical';
}

export const DEFAULT_SETTINGS: DashboardSettings = {
  theme: 'dark',
  refreshInterval: 30,
  soundEnabled: false,
  trackedRegions: ['Middle East', 'Ukraine', 'Taiwan', 'Korea'],
  notificationLevel: 'critical',
};

const AVAILABLE_REGIONS = [
  'Middle East', 'Ukraine', 'Taiwan', 'Korea',
  'Africa', 'South Asia', 'Eastern Europe',
  'Southeast Asia', 'Latin America', 'Caucasus',
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onSettingsChange: (settings: DashboardSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  if (!isOpen) return null;

  const update = (partial: Partial<DashboardSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const toggleRegion = (region: string) => {
    const regions = settings.trackedRegions.includes(region)
      ? settings.trackedRegions.filter(r => r !== region)
      : [...settings.trackedRegions, region];
    update({ trackedRegions: regions });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-[480px] max-h-[85vh] overflow-y-auto bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="font-mono text-sm font-bold text-[#00ff88] tracking-wider">⚙️ DASHBOARD SETTINGS</h2>
            <p className="text-[9px] text-white/30 mt-0.5">Customize your intelligence terminal</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Display Theme
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ theme: 'dark' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <Moon size={12} /> Dark Terminal
              </button>
              <button
                onClick={() => update({ theme: 'light' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <Sun size={12} /> Light Mode
              </button>
            </div>
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Data Refresh Interval
            </label>
            <div className="flex gap-2">
              {([15, 30, 60] as const).map(interval => (
                <button
                  key={interval}
                  onClick={() => update({ refreshInterval: interval })}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                    settings.refreshInterval === interval
                      ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]'
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  <RefreshCw size={10} />
                  {interval}s
                </button>
              ))}
            </div>
          </div>

          {/* Sound Alerts */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Alert Sounds (Critical Events)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ soundEnabled: true })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  settings.soundEnabled
                    ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <Bell size={12} /> Enabled
              </button>
              <button
                onClick={() => update({ soundEnabled: false })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  !settings.soundEnabled
                    ? 'bg-[#ff2244]/15 border-[#ff2244]/40 text-[#ff2244]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <BellOff size={12} /> Disabled
              </button>
            </div>
          </div>

          {/* Push Notification Level */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Push Notifications
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ notificationLevel: 'critical' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  settings.notificationLevel === 'critical'
                    ? 'bg-[#ff2244]/15 border-[#ff2244]/40 text-[#ff2244]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <Bell size={12} /> Only Critical
              </button>
              <button
                onClick={() => update({ notificationLevel: 'all' })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-mono border transition-all ${
                  settings.notificationLevel === 'all'
                    ? 'bg-[#00ccff]/15 border-[#00ccff]/40 text-[#00ccff]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <Bell size={12} /> All Updates
              </button>
            </div>
            <p className="text-[9px] text-white/30 mt-1.5 font-mono">
              {settings.notificationLevel === 'critical'
                ? 'Only CRITICAL severity alerts will trigger banners and sounds.'
                : 'Both CRITICAL and HIGH severity alerts will trigger banners and sounds.'}
            </p>
          </div>

          {/* Tracked Regions */}
          <div>
            <label className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
              Tracked Regions
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                    settings.trackedRegions.includes(region)
                      ? 'bg-[#00ccff]/15 border-[#00ccff]/40 text-[#00ccff]'
                      : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
                  }`}
                >
                  <Globe size={9} />
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] font-mono text-[11px] tracking-widest rounded-lg hover:bg-[#00ff88]/20 transition-all"
          >
            ✓ SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
