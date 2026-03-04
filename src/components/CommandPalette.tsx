'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface CommandItem {
  id: string;
  type: 'country' | 'layer' | 'view' | 'action';
  label: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  signals?: Array<{ title: string; country?: string; severity?: string }>;
  onNavigate?: (view: string) => void;
  onToggleLayer?: (layer: string) => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
];

const LAYERS = [
  { id: 'flights', label: 'Flight Tracking', icon: '✈️' },
  { id: 'military', label: 'Military Assets', icon: '🎖️' },
  { id: 'conflicts', label: 'Active Conflicts', icon: '⚔️' },
  { id: 'cyber', label: 'Cyber Attacks', icon: '💻' },
  { id: 'nuclear', label: 'Nuclear Sites', icon: '☢️' },
  { id: 'gps-jamming', label: 'GPS Jamming', icon: '📡' },
  { id: 'earthquakes', label: 'Earthquakes', icon: '🌍' },
  { id: 'fires', label: 'Active Fires', icon: '🔥' },
  { id: 'cables', label: 'Undersea Cables', icon: '🔌' },
  { id: 'pipelines', label: 'Pipelines', icon: '🛢️' },
  { id: 'ports', label: 'Strategic Ports', icon: '⚓' },
  { id: 'trade-routes', label: 'Trade Routes', icon: '🚢' },
];

const VIEWS = [
  { id: 'dashboard', label: 'Main Dashboard', icon: '📊' },
  { id: 'warroom', label: 'War Room', icon: '🎯' },
  { id: 'map', label: 'World Map', icon: '🗺️' },
  { id: 'feed', label: 'Signal Feed', icon: '📡' },
  { id: 'markets', label: 'Markets', icon: '📈' },
];

function fuzzyMatch(str: string, query: string): boolean {
  if (!query) return true;
  const s = str.toLowerCase();
  const q = query.toLowerCase();
  let si = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const idx = s.indexOf(q[qi], si);
    if (idx === -1) return false;
    si = idx + 1;
  }
  return true;
}

const RECENT_KEY = 'globenews_recent_searches';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (!query.trim()) return;
  const recent = getRecentSearches();
  const filtered = recent.filter(r => r !== query).slice(0, 4);
  filtered.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
}

export default function CommandPalette({ isOpen, onClose, signals = [], onNavigate, onToggleLayer }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const buildItems = useCallback((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Views
    VIEWS.forEach(v => {
      items.push({
        id: `view-${v.id}`,
        type: 'view',
        label: v.label,
        subtitle: 'Navigate',
        icon: v.icon,
        action: () => { onNavigate?.(v.id); onClose(); }
      });
    });

    // Countries
    COUNTRIES.forEach(c => {
      items.push({
        id: `country-${c.code}`,
        type: 'country',
        label: c.name,
        subtitle: `Country Brief · ${c.code}`,
        icon: c.flag,
        action: () => { 
          if (typeof window !== 'undefined') {
            window.location.href = `/country/${c.code.toLowerCase()}`;
          }
          onClose(); 
        }
      });
    });

    // Layers
    LAYERS.forEach(l => {
      items.push({
        id: `layer-${l.id}`,
        type: 'layer',
        label: l.label,
        subtitle: 'Toggle map layer',
        icon: l.icon,
        action: () => { onToggleLayer?.(l.id); onClose(); }
      });
    });

    // Recent signals
    signals.slice(0, 10).forEach((s, i) => {
      items.push({
        id: `signal-${i}`,
        type: 'action',
        label: s.title,
        subtitle: `${s.severity || ''} · ${s.country || ''}`,
        icon: '⚡',
        action: () => onClose()
      });
    });

    return items;
  }, [signals, onNavigate, onToggleLayer, onClose]);

  const filteredItems = buildItems().filter(item =>
    !query || fuzzyMatch(item.label, query) || fuzzyMatch(item.subtitle || '', query)
  );

  useEffect(() => { setSelected(0); }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filteredItems.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selected]) {
          addRecentSearch(query);
          filteredItems[selected].action();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filteredItems, selected, query, onClose]);

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!isOpen) return null;

  const typeColors: Record<string, string> = {
    country: '#00ccff',
    layer: '#ffaa00',
    view: '#00ff88',
    action: '#ff6633',
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-xl border overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#0d0d14', borderColor: '#00ff8840', boxShadow: '0 0 60px rgba(0,255,136,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#00ff8820' }}>
          <span className="text-[#00ff88] text-lg">⌘</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder-white/30"
            placeholder="Search countries, layers, news..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="font-mono text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">ESC</span>
        </div>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div className="px-4 py-2 border-b" style={{ borderColor: '#00ff8810' }}>
            <div className="text-[9px] font-mono text-white/30 mb-1.5 tracking-wider">RECENT</div>
            <div className="flex gap-2 flex-wrap">
              {recentSearches.map(r => (
                <button
                  key={r}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border text-white/50 hover:text-white/80 transition-colors"
                  style={{ borderColor: '#ffffff15', backgroundColor: '#ffffff05' }}
                  onClick={() => setQuery(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '400px' }}>
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center font-mono text-sm text-white/30">No results for "{query}"</div>
          ) : (
            filteredItems.slice(0, 30).map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: i === selected ? 'rgba(0,255,136,0.07)' : 'transparent',
                  borderLeft: i === selected ? '2px solid #00ff88' : '2px solid transparent'
                }}
                onMouseEnter={() => setSelected(i)}
                onClick={() => { addRecentSearch(query); item.action(); }}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-white/90 truncate">{item.label}</div>
                  {item.subtitle && (
                    <div className="font-mono text-[10px] text-white/40 truncate">{item.subtitle}</div>
                  )}
                </div>
                <span 
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ color: typeColors[item.type], backgroundColor: `${typeColors[item.type]}15` }}
                >
                  {item.type}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t flex items-center gap-4 text-[9px] font-mono text-white/20" style={{ borderColor: '#00ff8810' }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
          <span className="ml-auto">{filteredItems.length} results</span>
        </div>
      </div>
    </div>
  );
}
