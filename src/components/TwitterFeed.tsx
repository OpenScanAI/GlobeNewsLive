'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Twitter, ExternalLink, RefreshCw, Heart, Repeat2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Tweet {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  url: string;
}

export default function TwitterFeed() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data, error, isLoading, mutate } = useSWR<{ tweets: Tweet[] }>('/api/twitter', fetcher, {
    refreshInterval: 120000, // 2 minutes
  });

  const tweets = data?.tweets || [];

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">OSINT FEED</span>
          <span className="text-[9px] text-text-dim">X/Twitter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-text-muted">{tweets.length} posts</span>
          <button
            onClick={() => mutate()}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3 h-3 text-text-dim ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tweet List */}
      <div className="max-h-[300px] overflow-y-auto">
        {isLoading && tweets.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-[10px] text-text-muted animate-pulse">Loading OSINT feed...</div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="text-[10px] text-accent-red">Failed to load tweets</div>
          </div>
        ) : tweets.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-[10px] text-text-muted">No tweets available</div>
            <div className="text-[9px] text-text-dim mt-1">Nitter instances may be rate-limited</div>
          </div>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet.id} className="px-3 py-2 border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
              {/* Author */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#1DA1F2]/20 flex items-center justify-center">
                    <span className="text-[9px]">🐦</span>
                  </div>
                  <span className="text-[10px] font-medium text-white">{tweet.author}</span>
                  <span className="text-[9px] text-text-dim">{tweet.handle}</span>
                </div>
                <span className="text-[8px] text-text-dim">
                  {formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: true })}
                </span>
              </div>

              {/* Content */}
              <p className="text-[10px] text-text-muted leading-relaxed mb-1.5">
                {tweet.content}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-text-dim">
                    <Heart className="w-3 h-3" />
                    <span className="text-[8px]">{tweet.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text-dim">
                    <Repeat2 className="w-3 h-3" />
                    <span className="text-[8px]">{tweet.retweets}</span>
                  </div>
                </div>
                <a
                  href={tweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[8px] text-[#1DA1F2] hover:underline"
                >
                  <span>View</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-text-dim">
            Sources: @IntelCrab, @sentdefender, @War_Mapper, @RALee85...
          </span>
          <span className="text-[8px] text-text-dim">via Nitter</span>
        </div>
      </div>
    </div>
  );
}
