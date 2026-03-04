'use client';

import { useState } from 'react';
import { Video, ExternalLink, ChevronDown, ChevronUp, Radio, Tv } from 'lucide-react';

interface VideoStream {
  id: string;
  name: string;
  channel: string;
  url: string;
  embedUrl?: string;
  type: 'youtube' | 'twitch' | 'embed' | 'link';
  category: 'news' | 'osint' | 'military' | 'weather';
  live: boolean;
  region?: string;
}

// Live news and OSINT video streams
const VIDEO_STREAMS: VideoStream[] = [
  // 24/7 News Channels
  {
    id: 'v1',
    name: 'Al Jazeera English',
    channel: 'Al Jazeera',
    url: 'https://www.youtube.com/watch?v=F-POY4Q0QSI',
    embedUrl: 'https://www.youtube.com/embed/F-POY4Q0QSI?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'Global'
  },
  {
    id: 'v2',
    name: 'France 24 English',
    channel: 'France 24',
    url: 'https://www.youtube.com/watch?v=h3MuIUNCCzI',
    embedUrl: 'https://www.youtube.com/embed/h3MuIUNCCzI?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'Global'
  },
  {
    id: 'v3',
    name: 'DW News',
    channel: 'Deutsche Welle',
    url: 'https://www.youtube.com/watch?v=GE_SfNVNyqk',
    embedUrl: 'https://www.youtube.com/embed/GE_SfNVNyqk?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'Europe'
  },
  {
    id: 'v4',
    name: 'Sky News',
    channel: 'Sky News',
    url: 'https://www.youtube.com/watch?v=9Auq9mYxFEE',
    embedUrl: 'https://www.youtube.com/embed/9Auq9mYxFEE?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'UK'
  },
  {
    id: 'v5',
    name: 'ABC News',
    channel: 'ABC News',
    url: 'https://www.youtube.com/watch?v=w_Ma8oQLmSM',
    embedUrl: 'https://www.youtube.com/embed/w_Ma8oQLmSM?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'USA'
  },
  // Regional Streams
  {
    id: 'v6',
    name: 'i24 News (Israel)',
    channel: 'i24NEWS',
    url: 'https://www.youtube.com/watch?v=vgGnQC5aLdg',
    embedUrl: 'https://www.youtube.com/embed/vgGnQC5aLdg?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'Middle East'
  },
  {
    id: 'v7',
    name: 'WION (India)',
    channel: 'WION',
    url: 'https://www.youtube.com/watch?v=iC_s7E8fWlo',
    embedUrl: 'https://www.youtube.com/embed/iC_s7E8fWlo?autoplay=0',
    type: 'youtube',
    category: 'news',
    live: true,
    region: 'Asia'
  },
  // OSINT/Military
  {
    id: 'v8',
    name: 'NASA TV',
    channel: 'NASA',
    url: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
    embedUrl: 'https://www.youtube.com/embed/21X5lGlDOfg?autoplay=0',
    type: 'youtube',
    category: 'osint',
    live: true,
    region: 'Space'
  },
];

export default function LiveVideoPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoStream | null>(null);
  const [filter, setFilter] = useState<'all' | 'news' | 'osint'>('all');

  const filteredStreams = filter === 'all' 
    ? VIDEO_STREAMS 
    : VIDEO_STREAMS.filter(v => v.category === filter);

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-accent-red" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">LIVE VIDEO</span>
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red">
            <Radio className="w-2.5 h-2.5 animate-pulse" />
            LIVE
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Active Video Player */}
          {activeVideo && (
            <div className="border-b border-border-subtle">
              <div className="aspect-video bg-black">
                <iframe
                  src={activeVideo.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-3 py-2 bg-elevated/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-medium text-white">{activeVideo.name}</div>
                  <div className="text-[9px] text-text-muted">{activeVideo.channel} • {activeVideo.region}</div>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="text-[9px] text-accent-red hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="px-2 py-1.5 border-b border-border-subtle flex gap-1">
            {(['all', 'news', 'osint'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                  filter === cat
                    ? 'bg-accent-red/20 text-accent-red'
                    : 'text-text-dim hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? '📺 ALL' : cat === 'news' ? '📰 NEWS' : '🛰️ OSINT'}
              </button>
            ))}
          </div>

          {/* Stream List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredStreams.map((stream) => (
              <div
                key={stream.id}
                className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02] flex items-center justify-between cursor-pointer"
                onClick={() => setActiveVideo(stream)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-accent-red/20 flex items-center justify-center">
                    <Video className="w-4 h-4 text-accent-red" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-white">{stream.name}</div>
                    <div className="text-[9px] text-text-muted">{stream.channel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stream.live && (
                    <span className="flex items-center gap-1 text-[8px] text-accent-red">
                      <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                  <span className="text-[8px] text-text-dim">{stream.region}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-text-dim">{filteredStreams.length} streams available</span>
              <a
                href="https://www.youtube.com/results?search_query=live+news&sp=EgJAAQ%253D%253D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[8px] text-accent-red hover:underline"
              >
                More streams <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
