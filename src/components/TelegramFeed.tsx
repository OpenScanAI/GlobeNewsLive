'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface OSINTPost {
  id: string;
  channel: string;
  channelHandle: string;
  category: 'military' | 'political' | 'humanitarian' | 'economic' | 'cyber' | 'breaking';
  text: string;
  timestamp: string;
  views?: number;
  forwarded?: boolean;
  hasMedia: boolean;
  region: string;
  importance: 'high' | 'medium' | 'low';
  verified: boolean;
}

// Simulated OSINT feed data
const OSINT_CHANNELS = [
  { handle: 'AuroraIntel', name: 'Aurora Intel', verified: true, focus: 'Global OSINT', icon: '🌐' },
  { handle: 'OSINTdefender', name: 'OSINT Defender', verified: true, focus: 'Military/Defense', icon: '🛡️' },
  { handle: 'IntelCrab', name: 'Intel Crab', verified: true, focus: 'Live Conflict', icon: '🦀' },
  { handle: 'CovertShores', name: 'Covert Shores', verified: true, focus: 'Naval Intel', icon: '⚓' },
  { handle: 'GeoConfirmed', name: 'GeoConfirmed', verified: true, focus: 'Geolocation', icon: '📍' },
  { handle: 'OSINTtechnical', name: 'OSINT Technical', verified: false, focus: 'Technical OSINT', icon: '🔧' },
  { handle: 'WarMonitor3', name: 'War Monitor', verified: false, focus: 'War Updates', icon: '⚔️' },
  { handle: 'Ukrinform', name: 'Ukrinform', verified: true, focus: 'Ukraine Official', icon: '🇺🇦' },
];

const MOCK_POSTS: Omit<OSINTPost, 'id'>[] = [
  { channel: 'Aurora Intel', channelHandle: 'AuroraIntel', category: 'military', text: 'CONFIRMED: Russian Su-35 squadron reportedly relocated from Kursk region to Rostov air base. Likely response to Ukrainian cross-border ops. Satellite imagery analysis pending.', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), views: 42300, forwarded: false, hasMedia: true, region: 'Eastern Europe', importance: 'high', verified: true },
  { channel: 'OSINT Defender', channelHandle: 'OSINTdefender', category: 'breaking', text: 'BREAKING: Multiple explosions reported near Zaporizhzhia nuclear plant. IAEA inspection team on standby. No radiation anomalies detected as of now. Monitoring closely.', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), views: 89500, forwarded: true, hasMedia: false, region: 'Ukraine', importance: 'high', verified: true },
  { channel: 'GeoConfirmed', channelHandle: 'GeoConfirmed', category: 'military', text: 'Geolocated: Hezbollah rocket launch site in southern Lebanon confirmed at 33.2°N 35.4°E. Timestamp crossref matches AP footage. Site appears abandoned post-strike.', timestamp: new Date(Date.now() - 28 * 60000).toISOString(), views: 31200, forwarded: false, hasMedia: true, region: 'Middle East', importance: 'high', verified: true },
  { channel: 'Intel Crab', channelHandle: 'IntelCrab', category: 'military', text: 'US aircraft carrier USS Gerald R. Ford (CVN-78) with CSG now approximately 180nm from Strait of Hormuz based on AIS tracking. Standard patrol pattern.', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), views: 58900, forwarded: false, hasMedia: true, region: 'Persian Gulf', importance: 'medium', verified: true },
  { channel: 'Covert Shores', channelHandle: 'CovertShores', category: 'military', text: 'Iranian submarine YUNES (Kilo-class) departed Bandar Abbas 36h ago. Track lost after Strait of Hormuz. Likely heading Persian Gulf or northern Arabian Sea for exercise.', timestamp: new Date(Date.now() - 72 * 60000).toISOString(), views: 24100, forwarded: false, hasMedia: false, region: 'Persian Gulf', importance: 'medium', verified: true },
  { channel: 'OSINT Technical', channelHandle: 'OSINTtechnical', category: 'cyber', text: 'Russian GRU-linked APT28 (Fancy Bear) new infrastructure detected — 47 new C2 domains registered in past 48h. Targeting pattern: EU election infrastructure. IOCs shared via TLP:GREEN.', timestamp: new Date(Date.now() - 95 * 60000).toISOString(), views: 19800, forwarded: true, hasMedia: false, region: 'Europe', importance: 'high', verified: false },
  { channel: 'Ukrinform', channelHandle: 'Ukrinform', category: 'political', text: 'Ukraine FM confirms: Third round of Swiss peace formula talks scheduled for November. 78 nations committed to attendance. Russia not invited per Kyiv stance.', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), views: 112000, forwarded: true, hasMedia: false, region: 'Ukraine', importance: 'medium', verified: true },
  { channel: 'War Monitor', channelHandle: 'WarMonitor3', category: 'humanitarian', text: 'Gaza: 1,200+ trucks aid blocked at Kerem Shalom crossing for 4th consecutive day. WFP warning of "complete humanitarian collapse" within 72h if crossings remain closed.', timestamp: new Date(Date.now() - 150 * 60000).toISOString(), views: 67400, forwarded: false, hasMedia: false, region: 'Middle East', importance: 'high', verified: false },
  { channel: 'Aurora Intel', channelHandle: 'AuroraIntel', category: 'economic', text: 'Red Sea shipping disruption update: 22% of global container traffic now rerouting via Cape of Good Hope. Insurance rates for Red Sea transit at 5-year high. Houthi attacks continue.', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), views: 38700, forwarded: true, hasMedia: false, region: 'Red Sea', importance: 'medium', verified: true },
  { channel: 'GeoConfirmed', channelHandle: 'GeoConfirmed', category: 'military', text: 'Sudan: RSF heavy artillery positions confirmed near Khartoum North via Maxar satellite imagery (Sept 14). Grid square 32Q LP 44. SAF responding with airstrikes per radio intercepts.', timestamp: new Date(Date.now() - 210 * 60000).toISOString(), views: 22300, forwarded: false, hasMedia: true, region: 'Africa', importance: 'medium', verified: true },
];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  breaking: { color: '#ff2244', bg: 'bg-[#ff2244]/10', icon: '🚨', label: 'BREAKING' },
  military: { color: '#ff6644', bg: 'bg-[#ff6644]/8', icon: '🎯', label: 'MILITARY' },
  political: { color: '#aa66ff', bg: 'bg-[#aa66ff]/8', icon: '🏛️', label: 'POLITICAL' },
  humanitarian: { color: '#ffaa44', bg: 'bg-[#ffaa44]/8', icon: '🏥', label: 'HUMINT' },
  economic: { color: '#44aaff', bg: 'bg-[#44aaff]/8', icon: '💰', label: 'ECONOMIC' },
  cyber: { color: '#00ff88', bg: 'bg-[#00ff88]/8', icon: '💻', label: 'CYBER' },
};

const IMPORTANCE_DOT: Record<string, string> = {
  high: '#ff2244',
  medium: '#ffaa00',
  low: '#00ff88',
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return 'now';
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return `${Math.floor(diff / 1440)}d`;
}

function formatViews(n?: number) {
  if (!n) return '';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

export default function TelegramFeed() {
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [posts, setPosts] = useState<OSINTPost[]>(() =>
    MOCK_POSTS.map((p, i) => ({ ...p, id: `post-${i}` }))
  );
  const [newPostFlash, setNewPostFlash] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Simulate new incoming posts
  useEffect(() => {
    const interval = setInterval(() => {
      const templates = [
        'Monitoring situation near {{region}}. Multiple sources confirming activity. Assessment ongoing.',
        'Satellite pass over {{region}} shows changed vehicle disposition. Analysis in progress.',
        'SIGINT indicators elevated in {{region}}. Unusual comms traffic detected on military frequencies.',
        'Diplomatic cables suggest back-channel talks regarding {{region}} conflict. Unverified.',
      ];
      const regions = ['Eastern Ukraine', 'Northern Gaza', 'South Lebanon', 'Red Sea', 'Persian Gulf', 'Sahel'];
      const channels = OSINT_CHANNELS;
      const cats = Object.keys(CATEGORY_CONFIG);

      const ch = channels[Math.floor(Math.random() * channels.length)];
      const cat = cats[Math.floor(Math.random() * cats.length)] as OSINTPost['category'];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const text = templates[Math.floor(Math.random() * templates.length)].replace('{{region}}', region);

      const newPost: OSINTPost = {
        id: `live-${Date.now()}`,
        channel: ch.name,
        channelHandle: ch.handle,
        category: cat,
        text,
        timestamp: new Date().toISOString(),
        views: Math.floor(Math.random() * 50000),
        forwarded: Math.random() > 0.7,
        hasMedia: Math.random() > 0.6,
        region,
        importance: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        verified: ch.verified,
      };

      setPosts(prev => [newPost, ...prev.slice(0, 29)]);
      setNewPostFlash(newPost.id);
      setTimeout(() => setNewPostFlash(null), 2000);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const filtered = posts.filter(p => {
    if (filterCat !== 'all' && p.category !== filterCat) return false;
    if (filterChannel !== 'all' && p.channelHandle !== filterChannel) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">📡</span>
          <span className="text-[11px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">OSINT Intel Feed</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff2244] animate-pulse" />
            <span className="text-[9px] font-mono text-[#ff2244]">LIVE</span>
          </span>
        </div>
        <span className="text-[9px] font-mono text-white/25">{OSINT_CHANNELS.length} CHANNELS</span>
      </div>

      {/* Category filters */}
      <div className="px-2 py-1.5 border-b border-white/5 flex gap-1 overflow-x-auto flex-shrink-0">
        <button onClick={() => setFilterCat('all')}
          className={`px-2 py-0.5 text-[9px] font-mono rounded whitespace-nowrap transition-all flex-shrink-0 ${
            filterCat === 'all' ? 'bg-white/15 text-white' : 'text-white/25 hover:text-white/50'
          }`}>
          ALL
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-2 py-0.5 text-[9px] font-mono rounded whitespace-nowrap transition-all flex-shrink-0 ${
              filterCat === cat ? `text-white border` : 'text-white/25 hover:text-white/50'
            }`}
            style={filterCat === cat ? { borderColor: `${cfg.color}50`, backgroundColor: `${cfg.color}15`, color: cfg.color } : {}}>
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Channel filter */}
      <div className="px-2 py-1 border-b border-white/5 flex items-center gap-1 overflow-x-auto flex-shrink-0">
        <span className="text-[8px] font-mono text-white/25 flex-shrink-0">CH:</span>
        <button onClick={() => setFilterChannel('all')}
          className={`px-1.5 py-0.5 text-[8px] font-mono rounded whitespace-nowrap flex-shrink-0 ${
            filterChannel === 'all' ? 'bg-white/15 text-white' : 'text-white/20 hover:text-white/50'
          }`}>
          ALL
        </button>
        {OSINT_CHANNELS.map(ch => (
          <button key={ch.handle} onClick={() => setFilterChannel(ch.handle)}
            className={`px-1.5 py-0.5 text-[8px] font-mono rounded whitespace-nowrap flex-shrink-0 transition-all ${
              filterChannel === ch.handle ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/20 hover:text-white/40'
            }`}>
            {ch.icon} {ch.handle}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filtered.map(post => {
          const cfg = CATEGORY_CONFIG[post.category];
          const isFlash = newPostFlash === post.id;
          return (
            <div key={post.id}
              className={`border-b border-white/5 px-3 py-2 transition-all ${isFlash ? 'bg-[#00ff88]/8' : 'hover:bg-white/3'} ${cfg.bg}`}>
              {/* Post header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[9px]">{cfg.icon}</span>
                  <span className="text-[10px] font-mono font-bold" style={{ color: cfg.color }}>
                    @{post.channelHandle}
                  </span>
                  {post.verified && (
                    <span className="text-[9px] text-[#00aaff]">✓</span>
                  )}
                  {post.forwarded && (
                    <span className="text-[8px] text-white/25 font-mono">↩️ fwd</span>
                  )}
                  {post.hasMedia && (
                    <span className="text-[8px]">📸</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: IMPORTANCE_DOT[post.importance] }} />
                  <span className="text-[9px] font-mono text-white/30">{timeAgo(post.timestamp)}</span>
                </div>
              </div>

              {/* Post text */}
              <p className="text-[10px] font-mono text-white/75 leading-relaxed line-clamp-3">
                {post.text}
              </p>

              {/* Post footer */}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[8px] font-mono text-white/25">
                  {post.region}
                </span>
                <div className="flex items-center gap-2">
                  {post.views && (
                    <span className="text-[8px] font-mono text-white/20">👁 {formatViews(post.views)}</span>
                  )}
                  <span className="text-[8px] font-mono px-1 rounded" style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/25 font-mono">OSINT / UNVERIFIED</span>
        <span className="text-[9px] text-white/25 font-mono">TELEGRAM INTEL</span>
      </div>
    </div>
  );
}
