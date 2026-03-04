'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Tv, ChevronDown, ChevronUp, ExternalLink, RefreshCw, AlertCircle, Play, Volume2, VolumeX } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Channel {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  region: string;
  focus?: string[];
  embedUrl: string | null;
  youtubeUrl: string;
  directUrl: string;
  hlsUrl?: string;
  color: string;
  hasHls: boolean;
}

export default function NewsChannels() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mideast' | 'west'>('all');

  const { data, isLoading, mutate } = useSWR<{ channels: Channel[] }>(
    '/api/live-streams',
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 300000 } // Refresh every 5 min
  );

  const channels = data?.channels || [];
  
  // Filter channels
  const filteredChannels = channels.filter(ch => {
    if (filter === 'mideast') return ch.focus?.some(f => ['Iran', 'Middle East', 'Israel', 'Gaza', 'Turkey'].includes(f));
    if (filter === 'west') return ch.focus?.some(f => ['USA', 'UK', 'Europe', 'Global'].includes(f));
    return true;
  });

  // Set default channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels, activeChannel]);

  const handleChannelChange = (channel: Channel) => {
    setActiveChannel(channel);
    setIsPlaying(true);
    setHasError(false);
  };

  const handleIframeError = () => {
    setHasError(true);
  };

  const currentEmbedUrl = activeChannel?.embedUrl 
    ? `${activeChannel.embedUrl}${isMuted ? '&mute=1' : '&mute=0'}`
    : null;

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-gradient-to-r from-red-500/10 to-transparent flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-accent-red" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">LIVE NEWS</span>
          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red">
            <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-dim">{channels.length} channels</span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
        </div>
      </button>

      {isExpanded && (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-subtle bg-black/20">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded text-[9px] font-mono ${filter === 'all' ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter('mideast')}
              className={`px-2 py-1 rounded text-[9px] font-mono ${filter === 'mideast' ? 'bg-orange-500/20 text-orange-400' : 'text-text-dim hover:text-orange-400'}`}
            >
              🇮🇷 IRAN/ME
            </button>
            <button
              onClick={() => setFilter('west')}
              className={`px-2 py-1 rounded text-[9px] font-mono ${filter === 'west' ? 'bg-blue-500/20 text-blue-400' : 'text-text-dim hover:text-blue-400'}`}
            >
              🌍 WEST
            </button>
            <button
              onClick={() => mutate()}
              className="ml-auto p-1 rounded text-text-dim hover:text-white hover:bg-white/10"
              title="Refresh streams"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Channel Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-border-subtle bg-black/30">
            {filteredChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => handleChannelChange(channel)}
                className={`flex-shrink-0 px-3 py-2 text-[9px] font-mono border-b-2 transition-all ${
                  activeChannel?.id === channel.id
                    ? 'border-accent-red text-white bg-white/5'
                    : 'border-transparent text-text-dim hover:text-white hover:bg-white/5'
                }`}
                title={`${channel.name} (${channel.region})`}
              >
                <span className="mr-1 text-base">{channel.logo}</span>
                <span className="hidden sm:inline">{channel.shortName}</span>
              </button>
            ))}
          </div>

          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-accent-red animate-spin mx-auto mb-2" />
                  <div className="text-[10px] text-text-muted">Loading streams...</div>
                </div>
              </div>
            ) : !activeChannel ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[10px] text-text-muted">Select a channel</div>
              </div>
            ) : hasError || !currentEmbedUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center p-4">
                  <AlertCircle className="w-8 h-8 text-accent-orange mx-auto mb-2" />
                  <div className="text-[11px] text-white mb-2">Stream unavailable</div>
                  <div className="flex gap-2 justify-center">
                    <a
                      href={activeChannel.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-accent-red text-white text-[10px] rounded hover:bg-accent-red/80 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Watch on site
                    </a>
                    <a
                      href={activeChannel.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      ▶ YouTube
                    </a>
                  </div>
                </div>
              </div>
            ) : isPlaying ? (
              <>
                <iframe
                  key={activeChannel.id}
                  src={currentEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handleIframeError}
                />
                {/* Controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="text-[10px] text-white">{activeChannel.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={activeChannel.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-white/70 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group hover:bg-white/5 transition-colors"
                onClick={() => setIsPlaying(true)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mb-3 group-hover:bg-accent-red/30 transition-colors">
                    <Play className="w-8 h-8 text-accent-red" />
                  </div>
                  <div className="text-3xl mb-2">{activeChannel.logo}</div>
                  <div className="text-[12px] text-white font-medium">{activeChannel.name}</div>
                  <div className="text-[9px] text-text-muted mt-1">{activeChannel.region} • Click to play</div>
                </div>
              </div>
            )}
            
            {/* Live indicator */}
            {isPlaying && activeChannel && (
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-600 rounded text-[9px] text-white font-bold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
          </div>

          {/* Channel Info */}
          {activeChannel && (
            <div className="px-3 py-2 bg-elevated/30 flex items-center justify-between border-t border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-white">{activeChannel.name}</span>
                  {activeChannel.focus?.includes('Iran') && (
                    <span className="text-[8px] px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">IRAN</span>
                  )}
                </div>
                <div className="text-[9px] text-text-muted">{activeChannel.region} • {activeChannel.focus?.slice(0, 2).join(', ')}</div>
              </div>
              <a
                href={activeChannel.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[9px] text-accent-green hover:underline"
              >
                Official site <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Quick Switch Grid */}
          <div className="px-2 py-2 bg-black/30 border-t border-border-subtle">
            <div className="grid grid-cols-6 gap-1">
              {filteredChannels.slice(0, 12).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleChannelChange(ch)}
                  className={`aspect-square rounded flex items-center justify-center text-lg transition-all ${
                    activeChannel?.id === ch.id 
                      ? 'bg-accent-red/20 ring-1 ring-accent-red' 
                      : 'bg-elevated hover:bg-white/10'
                  }`}
                  title={`${ch.name} (${ch.region})`}
                >
                  {ch.logo}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
