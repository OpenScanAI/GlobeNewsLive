'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, X, Trash2 } from 'lucide-react';
import { Signal } from '@/types';

const STORAGE_KEY = 'globenews-bookmarks';

export function useSignalBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save bookmarks when changed
  const saveBookmarks = useCallback((newBookmarks: string[]) => {
    setBookmarks(newBookmarks);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      } catch (e) {
        console.error('Failed to save bookmarks:', e);
      }
    }
  }, []);

  const toggleBookmark = useCallback((signalId: string) => {
    setBookmarks(prev => {
      const newBookmarks = prev.includes(signalId)
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
      }
      return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((signalId: string) => {
    return bookmarks.includes(signalId);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    clearBookmarks,
    bookmarkCount: bookmarks.length,
    isLoaded
  };
}

interface BookmarkButtonProps {
  signalId: string;
  isBookmarked: boolean;
  onToggle: () => void;
}

export function BookmarkButton({ signalId, isBookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`p-1.5 rounded transition-all ${
        isBookmarked 
          ? 'text-accent-gold hover:text-accent-gold/70' 
          : 'text-text-dim hover:text-white'
      }`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this signal'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </button>
  );
}

interface BookmarkManagerProps {
  signals: Signal[];
  bookmarks: string[];
  onClear: () => void;
  onToggle: (id: string) => void;
}

export default function BookmarkManager({ signals, bookmarks, onClear, onToggle }: BookmarkManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const bookmarkedSignals = signals.filter(s => bookmarks.includes(s.id));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-mono transition-colors ${
          bookmarks.length > 0 
            ? 'text-accent-gold bg-accent-gold/10 hover:bg-accent-gold/20' 
            : 'text-text-dim hover:text-white hover:bg-white/5'
        }`}
        title="Manage bookmarks"
      >
        {bookmarks.length > 0 ? (
          <BookmarkCheck className="w-3.5 h-3.5" />
        ) : (
          <Bookmark className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">
          {bookmarks.length > 0 ? `${bookmarks.length} Saved` : 'Bookmarks'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-elevated border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-accent-gold" />
              <span className="text-[11px] font-bold text-white">Bookmarked Signals</span>
              <span className="text-[10px] text-text-dim">({bookmarks.length})</span>
            </div>
            <div className="flex items-center gap-1">
              {bookmarks.length > 0 && (
                <button
                  onClick={onClear}
                  className="p-1 text-text-dim hover:text-accent-red transition-colors"
                  title="Clear all bookmarks"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-dim hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {bookmarkedSignals.length === 0 ? (
              <div className="px-4 py-6 text-center text-[11px] text-text-dim">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No bookmarks yet</p>
                <p className="text-[9px] mt-1">Click the bookmark icon on any signal to save it</p>
              </div>
            ) : (
              bookmarkedSignals.map(signal => (
                <div
                  key={signal.id}
                  className="px-3 py-2 border-b border-border-subtle last:border-b-0 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs mt-0.5 ${
                      signal.severity === 'CRITICAL' ? 'text-accent-red' :
                      signal.severity === 'HIGH' ? 'text-accent-orange' :
                      signal.severity === 'MEDIUM' ? 'text-accent-gold' :
                      'text-accent-green'
                    }`}>●</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={signal.sourceUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-white truncate hover:text-accent-blue hover:underline block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {signal.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-text-dim">{signal.source}</span>
                        <span className="text-[9px] text-text-dim">•</span>
                        <span className="text-[9px] text-text-dim">{signal.timeAgo}</span>
                        {signal.sourceUrl && (
                          <a
                            href={signal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-accent-blue hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onToggle(signal.id)}
                      className="p-1 text-text-dim hover:text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
