'use client';

import { useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Maximize2, X } from 'lucide-react';

interface WebcamFeed {
  id: string;
  name: string;
  location: string;
  region: 'iran' | 'mideast' | 'europe' | 'americas' | 'asia' | 'all';
  embedUrl: string;
  thumbnail?: string;
  live: boolean;
}

// Live webcam feeds from YouTube/EarthCam
const WEBCAM_FEEDS: WebcamFeed[] = [
  // Iran/Middle East Theater
  {
    id: 'wc1',
    name: 'Tehran Skyline',
    location: 'Tehran, Iran',
    region: 'iran',
    embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCOwpXv7voTPsKx4iBNQbFRA',
    live: true,
  },
  {
    id: 'wc2',
    name: 'Tel Aviv Live',
    location: 'Tel Aviv, Israel',
    region: 'mideast',
    embedUrl: 'https://www.youtube.com/embed/Yt5gHGhZqdg',
    live: true,
  },
  {
    id: 'wc3',
    name: 'Jerusalem Old City',
    location: 'Jerusalem, Israel',
    region: 'mideast',
    embedUrl: 'https://www.youtube.com/embed/TDviqfJqH3g',
    live: true,
  },
  {
    id: 'wc4',
    name: 'Dubai Skyline',
    location: 'Dubai, UAE',
    region: 'mideast',
    embedUrl: 'https://www.youtube.com/embed/qyIqfnVGYrM',
    live: true,
  },
  // Europe
  {
    id: 'wc5',
    name: 'Kyiv Live',
    location: 'Kyiv, Ukraine',
    region: 'europe',
    embedUrl: 'https://www.youtube.com/embed/iZebYm-nenY',
    live: true,
  },
  {
    id: 'wc6',
    name: 'London Eye',
    location: 'London, UK',
    region: 'europe',
    embedUrl: 'https://www.youtube.com/embed/hi7LRTI2dDs',
    live: true,
  },
  {
    id: 'wc7',
    name: 'Paris Eiffel Tower',
    location: 'Paris, France',
    region: 'europe',
    embedUrl: 'https://www.youtube.com/embed/vWgq-g_krqI',
    live: true,
  },
  // Asia
  {
    id: 'wc8',
    name: 'Tokyo Shibuya',
    location: 'Tokyo, Japan',
    region: 'asia',
    embedUrl: 'https://www.youtube.com/embed/gFRtAAmiFbE',
    live: true,
  },
  {
    id: 'wc9',
    name: 'Hong Kong Harbor',
    location: 'Hong Kong',
    region: 'asia',
    embedUrl: 'https://www.youtube.com/embed/bYvY98xT5WA',
    live: true,
  },
  {
    id: 'wc10',
    name: 'Taipei 101',
    location: 'Taipei, Taiwan',
    region: 'asia',
    embedUrl: 'https://www.youtube.com/embed/CjBKaS4SZGE',
    live: true,
  },
  // Americas
  {
    id: 'wc11',
    name: 'Times Square',
    location: 'New York, USA',
    region: 'americas',
    embedUrl: 'https://www.youtube.com/embed/AdUw5RdyZxI',
    live: true,
  },
  {
    id: 'wc12',
    name: 'Miami Beach',
    location: 'Miami, USA',
    region: 'americas',
    embedUrl: 'https://www.youtube.com/embed/L8AqvLqEKQw',
    live: true,
  },
];

const REGIONS = [
  { id: 'iran', name: 'IRAN ATTACKS', icon: '🎯' },
  { id: 'all', name: 'ALL', icon: '🌍' },
  { id: 'mideast', name: 'MIDEAST', icon: '🕌' },
  { id: 'europe', name: 'EUROPE', icon: '🏰' },
  { id: 'americas', name: 'AMERICAS', icon: '🗽' },
  { id: 'asia', name: 'ASIA', icon: '🏯' },
];

export default function LiveWebcams() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [fullscreenCam, setFullscreenCam] = useState<WebcamFeed | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFeeds = activeRegion === 'all' 
    ? WEBCAM_FEEDS 
    : WEBCAM_FEEDS.filter(f => f.region === activeRegion || (activeRegion === 'iran' && f.region === 'mideast'));

  return (
    <>
      {/* Fullscreen Modal */}
      {fullscreenCam && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setFullscreenCam(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-5xl aspect-video">
            <iframe
              src={fullscreenCam.embedUrl + '?autoplay=1&mute=1'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="text-lg font-bold">{fullscreenCam.name}</div>
            <div className="text-sm text-gray-400">{fullscreenCam.location}</div>
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-accent-green" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-white">LIVE WEBCAMS</span>
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-accent-green/20 text-accent-green">
              {filteredFeeds.length} LIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'grid' ? 'list' : 'grid'); }}
              className="text-[9px] text-text-dim hover:text-white"
            >
              {viewMode === 'grid' ? '▦' : '☰'}
            </button>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
          </div>
        </button>

        {isExpanded && (
          <>
            {/* Region Tabs */}
            <div className="px-2 py-1.5 border-b border-border-subtle flex gap-1 overflow-x-auto scrollbar-hide">
              {REGIONS.map(region => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
                  className={`px-2 py-1 rounded text-[8px] font-mono whitespace-nowrap transition-colors ${
                    activeRegion === region.id
                      ? region.id === 'iran' 
                        ? 'bg-accent-red/20 text-accent-red'
                        : 'bg-accent-green/20 text-accent-green'
                      : 'text-text-dim hover:text-white hover:bg-white/5'
                  }`}
                >
                  {region.icon} {region.name}
                </button>
              ))}
            </div>

            {/* Webcam Grid */}
            <div className={`p-2 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'space-y-1'} max-h-[250px] overflow-y-auto`}>
              {filteredFeeds.slice(0, 6).map((cam) => (
                <div
                  key={cam.id}
                  className={`relative group cursor-pointer ${viewMode === 'grid' ? 'aspect-video' : 'flex items-center gap-2 p-2'} bg-black rounded overflow-hidden`}
                  onClick={() => setFullscreenCam(cam)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <iframe
                        src={cam.embedUrl + '?autoplay=0&mute=1&controls=0'}
                        className="w-full h-full pointer-events-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-[9px] font-medium text-white truncate">{cam.name}</div>
                        <div className="text-[8px] text-gray-400">{cam.location}</div>
                      </div>
                      <div className="absolute top-1 left-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
                        <span className="text-[7px] text-white font-mono">LIVE</span>
                      </div>
                      <button className="absolute top-1 right-1 p-1 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-10 bg-elevated rounded overflow-hidden flex-shrink-0">
                        <Camera className="w-full h-full p-2 text-text-dim" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-medium text-white truncate">{cam.name}</div>
                        <div className="text-[9px] text-text-muted">{cam.location}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
                        <span className="text-[8px] text-accent-red">LIVE</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-text-dim">Click to expand • Real-time feeds</span>
                <span className="text-[8px] text-accent-green">● {filteredFeeds.length} cameras</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
