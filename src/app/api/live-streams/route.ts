import { NextResponse } from 'next/server';

// Live news stream configurations with multiple fallback URLs
// YouTube live streams change IDs frequently, so we provide multiple options
const LIVE_CHANNELS = [
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    shortName: 'AJE',
    logo: '📡',
    region: 'Qatar',
    focus: ['Middle East', 'Iran', 'Gaza'],
    priority: 1,
    // Direct HLS stream (more reliable than YouTube)
    hlsUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    youtubeChannel: 'aljaborzeera',
    youtubeSearch: 'Al Jazeera English live',
    directUrl: 'https://www.aljazeera.com/live/',
    color: '#d2a03c',
  },
  {
    id: 'france24',
    name: 'France 24 English',
    shortName: 'F24',
    logo: '🇫🇷',
    region: 'France',
    focus: ['Global', 'Europe', 'Africa'],
    priority: 1,
    hlsUrl: 'https://stream.france24.com/live/en.m3u8',
    youtubeChannel: 'FRANCE24English',
    youtubeSearch: 'France 24 English live',
    directUrl: 'https://www.france24.com/en/live',
    color: '#00a2e8',
  },
  {
    id: 'dw',
    name: 'DW News',
    shortName: 'DW',
    logo: '🇩🇪',
    region: 'Germany',
    focus: ['Europe', 'Global'],
    priority: 1,
    hlsUrl: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8',
    youtubeSearch: 'DW News live English',
    directUrl: 'https://www.dw.com/en/live-tv/s-100825',
    color: '#0061ff',
  },
  {
    id: 'skynews',
    name: 'Sky News',
    shortName: 'SKY',
    logo: '🔵',
    region: 'UK',
    focus: ['UK', 'Global'],
    priority: 1,
    hlsUrl: 'https://linear401-gb-hls1-prd-ak.cdn.skycdp.com/100e/Content/HLS_001_1080_30/Live/channel(skynews)/index.m3u8',
    youtubeSearch: 'Sky News live',
    directUrl: 'https://news.sky.com/watch-live',
    color: '#c8102e',
  },
  {
    id: 'i24',
    name: 'i24 News English',
    shortName: 'i24',
    logo: '🇮🇱',
    region: 'Israel',
    focus: ['Israel', 'Middle East', 'Iran'],
    priority: 1,
    youtubeSearch: 'i24NEWS English live',
    directUrl: 'https://www.i24news.tv/en/tv/live',
    color: '#1a1a6c',
  },
  {
    id: 'presstv',
    name: 'Press TV',
    shortName: 'PRESS',
    logo: '🇮🇷',
    region: 'Iran',
    focus: ['Iran', 'Middle East'],
    priority: 1,
    hlsUrl: 'https://cdnlive.presstv.ir/cdnlive/smil:live.smil/playlist.m3u8',
    youtubeSearch: 'Press TV live',
    directUrl: 'https://www.presstv.ir/live',
    color: '#006633',
  },
  {
    id: 'wion',
    name: 'WION',
    shortName: 'WION',
    logo: '🇮🇳',
    region: 'India',
    focus: ['Asia', 'Global'],
    priority: 2,
    youtubeSearch: 'WION live',
    directUrl: 'https://www.wionews.com/live-tv',
    color: '#e31837',
  },
  {
    id: 'trt',
    name: 'TRT World',
    shortName: 'TRT',
    logo: '🇹🇷',
    region: 'Turkey',
    focus: ['Middle East', 'Turkey'],
    priority: 2,
    hlsUrl: 'https://tv-trtworld.live.trt.com.tr/master.m3u8',
    youtubeSearch: 'TRT World live',
    directUrl: 'https://www.trtworld.com/live',
    color: '#e30a17',
  },
  {
    id: 'cgtn',
    name: 'CGTN',
    shortName: 'CGTN',
    logo: '🇨🇳',
    region: 'China',
    focus: ['China', 'Asia'],
    priority: 3,
    youtubeSearch: 'CGTN live English',
    directUrl: 'https://www.cgtn.com/live',
    color: '#e60012',
  },
  {
    id: 'rt',
    name: 'RT News',
    shortName: 'RT',
    logo: '🇷🇺',
    region: 'Russia',
    focus: ['Russia', 'Global'],
    priority: 3,
    youtubeSearch: 'RT News live',
    directUrl: 'https://www.rt.com/on-air/',
    color: '#4ca64c',
  },
  {
    id: 'nhk',
    name: 'NHK World',
    shortName: 'NHK',
    logo: '🇯🇵',
    region: 'Japan',
    focus: ['Japan', 'Asia'],
    priority: 2,
    hlsUrl: 'https://nhkworld.webcdn.stream.ne.jp/www11/nhkworld-tv/domestic/263942/live.m3u8',
    youtubeSearch: 'NHK World live',
    directUrl: 'https://www3.nhk.or.jp/nhkworld/en/live/',
    color: '#ff0033',
  },
  {
    id: 'abc',
    name: 'ABC News',
    shortName: 'ABC',
    logo: '🇺🇸',
    region: 'USA',
    focus: ['USA', 'Global'],
    priority: 2,
    youtubeSearch: 'ABC News live',
    directUrl: 'https://abcnews.go.com/Live',
    color: '#000000',
  },
];

// Known working YouTube live stream IDs (updated 2026-03-02)
const KNOWN_YOUTUBE_IDS: Record<string, string[]> = {
  aljazeera: ['KyG6amQVSco', 'F-POY4Q0QSI', 'gCNeDWCI0vo'],
  france24: ['u9foWyMSrrQ', 'h3MuIUNCCzI', 'NiRIbKwAejk'],
  dw: ['pYFyp0aYPHw', 'GE_SfNVNyqk', 'G4DGrbFdLKs'],
  skynews: ['NygUCOEHrF8', '9Auq9mYxFEE', 'w9rJdMJwXqw'],
  i24: ['vgGnQC5aLdg', 'QsWFnMgQkNA'],
  wion: ['h2P5MhiPb0g', 'iC_s7E8fWlo'],
  trt: ['CV5Fooi8YJE', 'c7QhpJ8XYQY'],
  nhk: ['f0lYkdA-Gtw', 'cHkPxY6LuxM'],
  abc: ['w_Ma8oQLmSM', 'vOTiJkg1voo'],
  cgtn: ['sU8jxDU0eFw', '24h'],
};

export async function GET() {
  const channels = LIVE_CHANNELS.map(channel => {
    // Get YouTube embed URL from known IDs
    const ytIds = KNOWN_YOUTUBE_IDS[channel.id] || [];
    const primaryYtId = ytIds[0];
    
    return {
      ...channel,
      embedUrl: primaryYtId 
        ? `https://www.youtube.com/embed/${primaryYtId}?autoplay=1&mute=1&rel=0`
        : null,
      youtubeUrl: primaryYtId
        ? `https://www.youtube.com/watch?v=${primaryYtId}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(channel.youtubeSearch || channel.name + ' live')}&sp=EgJAAQ%3D%3D`,
      alternateIds: ytIds.slice(1),
      hasHls: !!channel.hlsUrl,
    };
  });

  // Sort by priority (Iran/Middle East focused first during conflict)
  channels.sort((a, b) => {
    const aIranFocus = a.focus?.some(f => ['Iran', 'Middle East', 'Israel', 'Gaza'].includes(f)) ? 0 : 1;
    const bIranFocus = b.focus?.some(f => ['Iran', 'Middle East', 'Israel', 'Gaza'].includes(f)) ? 0 : 1;
    if (aIranFocus !== bIranFocus) return aIranFocus - bIranFocus;
    return a.priority - b.priority;
  });

  return NextResponse.json({
    streams: channels, // Primary key for consistency
    channels, // Alias for backwards compatibility
    count: channels.length,
    timestamp: Date.now(),
    note: 'YouTube live stream IDs may change. Use directUrl as fallback.',
  });
}
