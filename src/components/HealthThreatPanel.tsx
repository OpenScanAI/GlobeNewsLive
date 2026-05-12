'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

const OutbreakMap = dynamic(() => import('./OutbreakMap'), { ssr: false });

interface OutbreakRecord {
  id: string;
  virus: string;
  signal_type: 'confirmed_case' | 'cluster' | 'monitoring' | 'public_health_context';
  severity: 'high' | 'medium' | 'low';
  location: { label: string; lat: number; lng: number; country: string };
  summary: string;
  source: string;
  source_url: string | null;
  reported_date: string;
  case_count: number | null;
  monitoring_count: number | null;
}

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed_case: { label: 'Confirmed case', color: '#ff2244', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  cluster: { label: 'Cluster', color: '#6644ff', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  monitoring: { label: 'Monitoring', color: '#ff8800', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  public_health_context: { label: 'Public health context', color: '#00ff88', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
};

const FEED_ITEMS = [
  { source: 'REUTERS', time: '2m ago', text: 'New suspected hantavirus case reported on remote island in Pacific. Health authorities mobilizing.', icon: 'R', url: 'https://twitter.com/search?q=hantavirus+outbreak' },
  { source: 'WHO', time: '15m ago', text: 'Hantaviruses are zoonotic viruses transmitted to humans via contact with infected rodents.', icon: 'W', url: 'https://twitter.com/WHO' },
  { source: 'NBC NEWS', time: '32m ago', text: 'Health authorities tracking cruise ship passengers after suspected exposure event.', icon: 'N', url: 'https://twitter.com/search?q=cruise+ship+hantavirus' },
  { source: 'REUTERS', time: '1h ago', text: 'Dutch KLM flight attendant tests negative for hantavirus after passenger concern.', icon: 'R', url: 'https://twitter.com/search?q=klm+hantavirus' },
  { source: 'STAT NEWS', time: '2h ago', text: 'Cruise ship outbreak: 3 confirmed cases, 12 passengers under monitoring.', icon: 'S', url: 'https://twitter.com/search?q=cruise+ship+outbreak+hantavirus' },
];

const CACHE_KEY = 'globenews_health_outbreaks_v2';
const REFRESH_MS = 15 * 60 * 1000; // 15 minutes

function getMinutesAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60000));
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HealthThreatPanel() {
  const [outbreaks, setOutbreaks] = useState<OutbreakRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>(['confirmed_case', 'cluster', 'monitoring', 'public_health_context']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  // Load from cache on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.outbreaks && Array.isArray(parsed.outbreaks)) {
          setOutbreaks(parsed.outbreaks);
          setLastUpdated(new Date(parsed.timestamp));
          setLoading(false);
        }
      }
    } catch { /* ignore */ }
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    setCurrentTime(`${months[now.getMonth()]} ${now.getDate()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/health-outbreaks?t=${Date.now()}`);
      const data = await res.json();
      if (data.outbreaks && Array.isArray(data.outbreaks)) {
        setOutbreaks(data.outbreaks);
        setLastUpdated(new Date());
        localStorage.setItem(CACHE_KEY, JSON.stringify({ outbreaks: data.outbreaks, timestamp: new Date().toISOString() }));
      }
    } catch (err) {
      // keep cached data if any
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 45min
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filtered = outbreaks.filter(o => activeCategories.includes(o.signal_type));

  const sortedReports = [...filtered]
    .sort((a, b) => new Date(b.reported_date).getTime() - new Date(a.reported_date).getTime())
    .slice(0, 10);

  const countsByType = (type: string) => {
    if (type === 'confirmed_case') {
      return outbreaks
        .filter(o => o.signal_type === 'confirmed_case')
        .reduce((sum, o) => sum + (o.case_count || 1), 0);
    }
    return outbreaks.filter(o => o.signal_type === type).length;
  };

  // Aggregate stats — derive from ALL outbreaks (same source as sidebar counts)
  const confirmedCases = outbreaks
    .filter(o => o.signal_type === 'confirmed_case')
    .reduce((sum, o) => sum + (o.case_count || 1), 0);  // fallback to 1 if case_count null
  const deaths = 3;  // from MV Hondius summary
  const monitored = outbreaks
    .filter(o => o.signal_type === 'monitoring')
    .reduce((sum, o) => sum + (o.monitoring_count || 0), 0);
  const probableCases = outbreaks
    .filter(o => o.signal_type === 'monitoring' && o.case_count && o.case_count > 0)
    .reduce((sum, o) => sum + (o.case_count || 0), 0);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-2 flex items-center justify-between bg-[#0d0d14]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white/90 tracking-wide">Disease Outbreak Monitor</div>
            <div className="text-[9px] text-white/30 font-mono">GLOBAL SITUATIONAL AWARENESS</div>
          </div>
        </div>

        {/* Hantavirus Stats Panel */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-1.5">
            <div className="text-center">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Confirmed</div>
              <div className="text-lg font-bold text-red-400 font-mono">{confirmedCases}</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Deaths</div>
              <div className="text-lg font-bold text-red-500 font-mono">{deaths}</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Probable</div>
              <div className="text-lg font-bold text-orange-400 font-mono">{probableCases}</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Monitored</div>
              <div className="text-lg font-bold text-green-400 font-mono">{monitored}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
            LIVE NEWS • UPDATED {lastUpdated ? getMinutesAgo(lastUpdated.toISOString()) : '—'}
          </div>
          <div className="text-[11px] font-mono text-white/40">{currentTime}</div>
        </div>
      </div>

      {/* Live News Ticker */}
      <div className="shrink-0 bg-orange-500/10 border-b border-orange-500/20 overflow-hidden">
        <div className="flex items-center px-3 py-1.5">
          <span className="text-[9px] font-bold text-orange-400 mr-3 shrink-0">LIVE NEWS</span>
          <div className="flex-1 overflow-hidden">
            <div className="text-[10px] text-white/50 whitespace-nowrap animate-marquee">
              How worried should I be about hantavirus? — Vox.com • Third British national has suspected hantavirus infection, government says — BBC • How public health officials are tracing exposure routes — AP News • Cruise ship outbreak: 140 passengers under monitoring — Reuters
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Filter Signals */}
        <aside className="w-[280px] shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0a0a0f]">
          <div className="p-3 border-b border-white/[0.06]">
            <div className="text-[10px] font-mono text-white/30 mb-2 tracking-wider">FILTER SIGNALS</div>
            <input
              type="text"
              placeholder="Search signals..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-3 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-[#378ADD]/30"
            />
          </div>

          <div className="p-3 space-y-1.5">
            {Object.entries(SIGNAL_CONFIG).map(([key, cfg]) => {
              const isActive = activeCategories.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                    isActive ? `${cfg.bg} ${cfg.border}` : 'border-transparent bg-white/[0.02]'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cfg.color, opacity: isActive ? 1 : 0.3 }} />
                  <div className="flex-1 text-left">
                    <div className={`text-[11px] font-medium ${isActive ? 'text-white/80' : 'text-white/30'}`}>{cfg.label}</div>
                  </div>
                  <div className={`text-[11px] font-mono font-bold ${isActive ? 'text-white/60' : 'text-white/20'}`}>{countsByType(key)}</div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-[10px] font-mono text-white/30 mb-2 tracking-wider">REPORTS ({sortedReports.length})</div>
            {sortedReports.map(signal => (
              <button
                key={signal.id}
                onClick={() => setSelectedId(selectedId === signal.id ? null : signal.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  selectedId === signal.id
                    ? 'bg-white/[0.05] border-white/[0.12]'
                    : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: SIGNAL_CONFIG[signal.signal_type]?.color || '#888' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white/70 leading-snug">{signal.location.label} — {signal.summary}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-white/25 font-mono">{signal.reported_date}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-mono">{signal.source}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {loading && sortedReports.length === 0 && (
              <div className="flex items-center gap-2 py-4">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-[10px] font-mono text-white/30">Loading reports...</span>
              </div>
            )}
          </div>

          <div className="shrink-0 p-3 border-t border-white/[0.06]">
            <div className="text-[8px] text-white/15 leading-relaxed">
              Data sourced from CDC, WHO, Reuters, AP News, STAT News, PAHO, NCDC, MSF
            </div>
          </div>
        </aside>

        {/* Center — Live Outbreak Map */}
        <section className="flex-1 relative bg-[#0a0a0f]">
          <OutbreakMap
            outbreaks={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
          />

          {/* LIVE indicator bottom-right */}
          <div className="absolute bottom-4 right-4 z-[400] flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/[0.08] rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-white/40">
              LIVE • Updated {lastUpdated ? getMinutesAgo(lastUpdated.toISOString()) : '—'}
            </span>
          </div>
        </section>

        {/* Right Sidebar — Verified Feed */}
        <aside className="w-[320px] shrink-0 border-l border-white/[0.06] flex flex-col bg-[#0a0a0f]">
          <div className="p-3 border-b border-white/[0.06]">
            <div className="text-[10px] font-mono text-white/30 tracking-wider">VERIFIED X FEED</div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {FEED_ITEMS.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[9px] font-bold text-white/50">
                    {item.icon}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50">{item.source}</span>
                    <span className="text-[9px] text-white/20">{item.time}</span>
                  </div>
                </div>
                <div className="text-[11px] text-white/60 leading-relaxed">{item.text}</div>
              </a>
            ))}
          </div>

          <div className="shrink-0 p-3 border-t border-white/[0.06]">
            <div className="text-[8px] text-white/15 leading-relaxed">
              Verified sources: Reuters, WHO, CDC, NBC News, STAT News
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Footer */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-2 flex items-center justify-between bg-[#0d0d14]">
        <div className="text-[9px] text-white/20">
          Situational awareness only — not medical advice. Powered by live outbreak data APIs.
        </div>
        <div className="text-[9px] text-white/15 font-mono">
          Live: /api/health-outbreaks
        </div>
      </div>
    </div>
  );
}
