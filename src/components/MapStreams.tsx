'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tv, X, Maximize2, Minimize2, Volume2, VolumeX, ExternalLink, Grid2X2, LayoutGrid, ChevronDown, ChevronUp, Play } from 'lucide-react';

// Hotspot regions with priority news sources
const STREAMS = [
  {
    id: 'mideast',
    name: 'MIDDLE EAST',
    region: 'Iran • Israel',
    icon: '🔥',
    color: '#ff2244',
    position: 'bottom-left',
    embedId: 'KyG6amQVSco',
    directUrl: 'https://www.aljazeera.com/live/',
    source: 'Al Jazeera'
  },
  {
    id: 'ukraine',
    name: 'UKRAINE',
    region: 'Eastern Front',
    icon: '🇺🇦',
    color: '#0057b7',
    position: 'bottom-right',
    embedId: 'NygUCOEHrF8',
    directUrl: 'https://news.sky.com/watch-live',
    source: 'Sky News'
  },
  {
    id: 'asia',
    name: 'ASIA',
    region: 'Taiwan • Korea',
    icon: '🌏',
    color: '#00aaff',
    position: 'top-right',
    embedId: 'f0lYkdA-Gtw',
    directUrl: 'https://www3.nhk.or.jp/nhkworld/en/live/',
    source: 'NHK World'
  },
  {
    id: 'global',
    name: 'GLOBAL',
    region: 'World News',
    icon: '🌍',
    color: '#00ff88',
    position: 'top-left',
    embedId: 'u9foWyMSrrQ',
    directUrl: 'https://www.france24.com/en/live',
    source: 'France 24'
  }
];

type ViewMode = 'hidden' | 'compact' | 'overlay' | 'fullscreen';
type ToggleMode = 'hidden' | 'compact';

interface StreamCardProps {
  stream: typeof STREAMS[0];
  isMuted: boolean;
  size: 'small' | 'medium' | 'large';
  onClose?: () => void;
  onExpand?: () => void;
}

function StreamCard({ stream, isMuted, size, onClose, onExpand }: StreamCardProps) {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const dimensions = {
    small: { width: 160, height: 90 },
    medium: { width: 280, height: 158 },
    large: { width: 480, height: 270 }
  }[size];

  const embedUrl = `https://www.youtube.com/embed/${stream.embedId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&controls=0`;

  return (
    <div 
      className="relative bg-black/90 rounded-lg overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{stream.icon}</span>
            <div>
              <div className="text-[10px] font-bold text-white leading-none">{stream.name}</div>
              <div className="text-[8px] text-gray-400">{stream.source}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: stream.color }}
            />
            <span className="text-[8px] text-white font-bold">LIVE</span>
            {onClose && (
              <button onClick={onClose} className="ml-1 p-0.5 hover:bg-white/20 rounded">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video / Placeholder */}
      {!isPlaying ? (
        <button 
          onClick={() => setIsPlaying(true)}
          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black group"
        >
          <div className="text-center">
            <Play className="w-8 h-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all mx-auto" />
            <div className="text-[9px] text-gray-400 mt-1">Click to play</div>
          </div>
        </button>
      ) : hasError ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-[10px] text-gray-400 mb-1">Stream unavailable</div>
            <a 
              href={stream.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-cyan-400 hover:underline flex items-center gap-1 justify-center"
            >
              <ExternalLink className="w-3 h-3" /> Watch on site
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setHasError(true)}
        />
      )}

      {/* Expand button */}
      {onExpand && isPlaying && (
        <button 
          onClick={onExpand}
          className="absolute bottom-2 right-2 z-20 p-1.5 bg-black/60 hover:bg-black/80 rounded transition-colors"
        >
          <Maximize2 className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}

export default function MapStreams() {
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [isMuted, setIsMuted] = useState(true);
  const [activeStreams, setActiveStreams] = useState<string[]>(['mideast', 'ukraine']);
  const [expandedStream, setExpandedStream] = useState<string | null>(null);

  const toggleStream = (id: string) => {
    setActiveStreams(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id].slice(-4)
    );
  };

  // Compact control panel (in sidebar)
  if (viewMode === 'hidden') {
    return (
      <button
        onClick={() => setViewMode('compact')}
        className="glass-panel px-3 py-2 flex items-center justify-between hover:bg-white/5 w-full"
      >
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-accent-red" />
          <span className="font-mono text-[11px] font-bold text-white">LIVE STREAMS</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
    );
  }

  return (
    <>
      {/* Control Panel (sidebar) */}
      <div className="glass-panel overflow-hidden">
        <button
          onClick={() => setViewMode('hidden')}
          className="w-full px-3 py-2 border-b border-border-subtle flex items-center justify-between hover:bg-white/5"
        >
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-accent-red" />
            <span className="font-mono text-[11px] font-bold text-white">HOTSPOT STREAMS</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
              {activeStreams.length} LIVE
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </button>

        <div className="p-2 space-y-2">
          {/* Mode toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('compact')}
              className={`flex-1 px-2 py-1.5 rounded text-[9px] font-mono flex items-center justify-center gap-1 ${viewMode === 'compact' ? 'bg-accent-green/20 text-accent-green' : 'bg-elevated text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-3 h-3" /> Sidebar
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`flex-1 px-2 py-1.5 rounded text-[9px] font-mono flex items-center justify-center gap-1 ${viewMode === 'overlay' ? 'bg-accent-green/20 text-accent-green' : 'bg-elevated text-gray-400 hover:text-white'}`}
            >
              <Grid2X2 className="w-3 h-3" /> Map Overlay
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-2 py-1.5 rounded ${isMuted ? 'bg-elevated text-gray-400' : 'bg-accent-blue/20 text-accent-blue'}`}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>

          {/* Stream selector */}
          <div className="grid grid-cols-2 gap-1">
            {STREAMS.map(stream => (
              <button
                key={stream.id}
                onClick={() => toggleStream(stream.id)}
                className={`px-2 py-1.5 rounded text-[9px] flex items-center gap-1.5 transition-colors ${
                  activeStreams.includes(stream.id) 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-elevated text-gray-500 hover:text-white'
                }`}
              >
                <span>{stream.icon}</span>
                <span className="truncate">{stream.name}</span>
                {activeStreams.includes(stream.id) && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-auto" style={{ backgroundColor: stream.color }} />
                )}
              </button>
            ))}
          </div>

          {/* Compact view streams */}
          {viewMode === 'compact' && activeStreams.length > 0 && (
            <div className="grid grid-cols-2 gap-1">
              {activeStreams.map(id => {
                const stream = STREAMS.find(s => s.id === id)!;
                return (
                  <StreamCard
                    key={stream.id}
                    stream={stream}
                    isMuted={isMuted}
                    size="small"
                    onClose={() => toggleStream(stream.id)}
                    onExpand={() => {
                      setExpandedStream(stream.id);
                      setViewMode('overlay');
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Quick links */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-border-subtle">
            {STREAMS.slice(0, 4).map(s => (
              <a 
                key={s.id}
                href={s.directUrl} 
                target="_blank" 
                className="text-[8px] text-gray-500 hover:text-white transition-colors"
              >
                {s.source.split(' ')[0]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Map Overlay Streams (positioned absolutely over map) */}
      {viewMode === 'overlay' && (
        <div className="fixed inset-0 pointer-events-none z-40" style={{ top: '120px', bottom: '40px', left: '340px', right: '340px' }}>
          {/* Top-left */}
          {activeStreams.includes('global') && (
            <div className="absolute top-4 left-4 pointer-events-auto">
              <StreamCard
                stream={STREAMS.find(s => s.id === 'global')!}
                isMuted={isMuted}
                size={expandedStream === 'global' ? 'large' : 'medium'}
                onClose={() => toggleStream('global')}
                onExpand={() => setExpandedStream(expandedStream === 'global' ? null : 'global')}
              />
            </div>
          )}

          {/* Top-right */}
          {activeStreams.includes('asia') && (
            <div className="absolute top-4 right-4 pointer-events-auto">
              <StreamCard
                stream={STREAMS.find(s => s.id === 'asia')!}
                isMuted={isMuted}
                size={expandedStream === 'asia' ? 'large' : 'medium'}
                onClose={() => toggleStream('asia')}
                onExpand={() => setExpandedStream(expandedStream === 'asia' ? null : 'asia')}
              />
            </div>
          )}

          {/* Bottom-left */}
          {activeStreams.includes('mideast') && (
            <div className="absolute bottom-4 left-4 pointer-events-auto">
              <StreamCard
                stream={STREAMS.find(s => s.id === 'mideast')!}
                isMuted={isMuted}
                size={expandedStream === 'mideast' ? 'large' : 'medium'}
                onClose={() => toggleStream('mideast')}
                onExpand={() => setExpandedStream(expandedStream === 'mideast' ? null : 'mideast')}
              />
            </div>
          )}

          {/* Bottom-right */}
          {activeStreams.includes('ukraine') && (
            <div className="absolute bottom-4 right-4 pointer-events-auto">
              <StreamCard
                stream={STREAMS.find(s => s.id === 'ukraine')!}
                isMuted={isMuted}
                size={expandedStream === 'ukraine' ? 'large' : 'medium'}
                onClose={() => toggleStream('ukraine')}
                onExpand={() => setExpandedStream(expandedStream === 'ukraine' ? null : 'ukraine')}
              />
            </div>
          )}

          {/* Close overlay button */}
          <button
            onClick={() => setViewMode('compact')}
            className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto px-3 py-1.5 bg-black/80 hover:bg-black rounded-full text-[10px] text-white flex items-center gap-1.5 border border-white/20"
          >
            <Minimize2 className="w-3 h-3" /> Back to Sidebar
          </button>
        </div>
      )}
    </>
  );
}
