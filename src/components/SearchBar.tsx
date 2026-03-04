'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Clock, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'signal' | 'flight' | 'conflict' | 'location' | 'channel';
  title: string;
  subtitle: string;
  icon: string;
  severity?: string;
  url?: string;
}

interface SearchBarProps {
  signals?: any[];
  onResultClick?: (result: SearchResult) => void;
}

const QUICK_SEARCHES = [
  { query: 'Iran', icon: '🇮🇷' },
  { query: 'Israel', icon: '🇮🇱' },
  { query: 'Strait of Hormuz', icon: '🚢' },
  { query: 'FORTE', icon: '✈️' },
  { query: 'Nuclear', icon: '☢️' },
  { query: 'Missile', icon: '🚀' },
];

const TRENDING = [
  'Iran strikes',
  'Hormuz shipping',
  'Oil prices',
  'Hezbollah',
  'Red Sea',
];

export default function SearchBar({ signals = [], onResultClick }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search signals
    signals.forEach(signal => {
      if (signal.title.toLowerCase().includes(q) || 
          signal.source?.toLowerCase().includes(q) ||
          signal.category?.toLowerCase().includes(q)) {
        searchResults.push({
          id: signal.id,
          type: 'signal',
          title: signal.title.substring(0, 80),
          subtitle: `${signal.source} • ${signal.severity}`,
          icon: signal.severity === 'CRITICAL' ? '🔴' : signal.severity === 'HIGH' ? '🟠' : '📰',
          severity: signal.severity,
        });
      }
    });

    // Static location searches
    const locations = [
      { name: 'Tehran', icon: '🇮🇷', type: 'Iran' },
      { name: 'Tel Aviv', icon: '🇮🇱', type: 'Israel' },
      { name: 'Strait of Hormuz', icon: '🚢', type: 'Chokepoint' },
      { name: 'Red Sea', icon: '🌊', type: 'Region' },
      { name: 'Gaza', icon: '🏚️', type: 'Conflict Zone' },
      { name: 'Beirut', icon: '🇱🇧', type: 'Lebanon' },
      { name: 'Damascus', icon: '🇸🇾', type: 'Syria' },
      { name: 'Baghdad', icon: '🇮🇶', type: 'Iraq' },
      { name: 'Kyiv', icon: '🇺🇦', type: 'Ukraine' },
      { name: 'Moscow', icon: '🇷🇺', type: 'Russia' },
    ];

    locations.forEach(loc => {
      if (loc.name.toLowerCase().includes(q)) {
        searchResults.push({
          id: `loc-${loc.name}`,
          type: 'location',
          title: loc.name,
          subtitle: loc.type,
          icon: loc.icon,
        });
      }
    });

    // Flight callsigns
    const flights = ['FORTE11', 'HOMER77', 'LAGR221', 'RCH871', 'DOOM51'];
    flights.forEach(f => {
      if (f.toLowerCase().includes(q)) {
        searchResults.push({
          id: `flight-${f}`,
          type: 'flight',
          title: f,
          subtitle: 'Military Aircraft',
          icon: '✈️',
        });
      }
    });

    setResults(searchResults.slice(0, 10));
  }, [query, signals]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    // Save to recent
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    handleSearch(result.title);
    onResultClick?.(result);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Trigger */}
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="flex items-center gap-2 px-3 py-1.5 bg-elevated/50 hover:bg-elevated border border-border-subtle rounded-lg text-[11px] text-text-muted hover:text-white transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search signals, locations...</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 bg-black/30 rounded text-[9px] text-text-dim">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 w-[400px] max-w-[90vw] bg-void border border-border-subtle rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search signals, flights, locations..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-text-dim"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-text-dim hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query ? (
              results.length > 0 ? (
                <div className="p-2">
                  <div className="text-[9px] text-text-dim px-2 py-1 font-mono">RESULTS ({results.length})</div>
                  {results.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-lg">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-white truncate">{result.title}</div>
                        <div className="text-[9px] text-text-muted">{result.subtitle}</div>
                      </div>
                      <span className="text-[8px] text-text-dim uppercase">{result.type}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[11px] text-text-muted">
                  No results for "{query}"
                </div>
              )
            ) : (
              <>
                {/* Quick Searches */}
                <div className="p-2">
                  <div className="text-[9px] text-text-dim px-2 py-1 font-mono flex items-center gap-1">
                    <Filter className="w-3 h-3" /> QUICK FILTERS
                  </div>
                  <div className="flex flex-wrap gap-1 px-2 py-1">
                    {QUICK_SEARCHES.map(qs => (
                      <button
                        key={qs.query}
                        onClick={() => handleSearch(qs.query)}
                        className="px-2 py-1 bg-elevated rounded text-[10px] text-white hover:bg-white/10 transition-colors"
                      >
                        {qs.icon} {qs.query}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending */}
                <div className="p-2 border-t border-border-subtle">
                  <div className="text-[9px] text-text-dim px-2 py-1 font-mono flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> TRENDING
                  </div>
                  {TRENDING.map(t => (
                    <button
                      key={t}
                      onClick={() => handleSearch(t)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5 text-left"
                    >
                      <span className="text-[10px] text-text-muted">🔥</span>
                      <span className="text-[11px] text-white">{t}</span>
                    </button>
                  ))}
                </div>

                {/* Recent */}
                {recentSearches.length > 0 && (
                  <div className="p-2 border-t border-border-subtle">
                    <div className="text-[9px] text-text-dim px-2 py-1 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> RECENT
                    </div>
                    {recentSearches.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSearch(s)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white/5 text-left"
                      >
                        <Clock className="w-3 h-3 text-text-dim" />
                        <span className="text-[11px] text-text-muted">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border-subtle bg-black/30 flex items-center justify-between text-[9px] text-text-dim">
            <span>↑↓ Navigate • Enter Select • Esc Close</span>
            <span>⌘K to search anywhere</span>
          </div>
        </div>
      )}
    </div>
  );
}
