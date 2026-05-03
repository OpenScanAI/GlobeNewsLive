'use client';

import { useState, useEffect } from 'react';

interface StreamChannel {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  region: string;
  embedUrl: string | null;
  directUrl: string;
  color: string;
}

// Country to primary news channel mapping
const COUNTRY_STREAMS: Record<string, string> = {
  us: 'abc', gb: 'skynews', fr: 'france24', de: 'dw', it: 'france24',
  es: 'france24', jp: 'nhk', cn: 'cgtn', in: 'wion', br: 'france24',
  ca: 'abc', ru: 'rt', kr: 'nhk', mx: 'france24', au: 'france24',
  id: 'france24', sa: 'aljazeera', tr: 'trt', tw: 'nhk', ar: 'france24',
  za: 'france24', ua: 'skynews', il: 'i24', ir: 'presstv', ae: 'aljazeera',
  eg: 'aljazeera', vn: 'france24', pl: 'dw', ng: 'france24', pk: 'wion',
  bd: 'wion',
};

const DEFAULT_STREAM = 'france24';

// Country-specific breaking news
const COUNTRY_NEWS: Record<string, { headline: string; time: string; priority: 'breaking' | 'high' | 'normal' }[]> = {
  us: [
    { headline: 'Fed signals potential rate pause as inflation cools to 2.9%', time: '2m ago', priority: 'breaking' },
    { headline: 'US debt/GDP hits 118% - sustainability concerns mount', time: '15m ago', priority: 'high' },
    { headline: 'Trade deficit widens to $903B as imports surge', time: '32m ago', priority: 'normal' },
    { headline: 'Dollar index steadies near 104 ahead of jobs data', time: '1h ago', priority: 'normal' },
  ],
  gb: [
    { headline: 'UK GDP contracts 0.3% in Q1, recession fears mount', time: '5m ago', priority: 'breaking' },
    { headline: 'BoE holds rates at 5.25%, Bailey warns on sticky inflation', time: '20m ago', priority: 'high' },
    { headline: 'UK debt/GDP at 131% - default risk elevated', time: '45m ago', priority: 'high' },
    { headline: 'Sterling weakens to $1.24 on growth concerns', time: '1h ago', priority: 'normal' },
  ],
  fr: [
    { headline: 'France debt/GDP at 111% - sustainability concerns', time: '12m ago', priority: 'high' },
    { headline: 'Macron pushes pension reform amid strike threats', time: '30m ago', priority: 'normal' },
    { headline: 'French manufacturing PMI shows modest expansion', time: '1h ago', priority: 'normal' },
    { headline: 'ECB holds rates steady, Lagarde warns on services inflation', time: '2h ago', priority: 'normal' },
  ],
  de: [
    { headline: 'German manufacturing PMI falls to 42.5, contraction deepens', time: '18m ago', priority: 'high' },
    { headline: 'Bundesbank warns of structural economic weakness', time: '40m ago', priority: 'high' },
    { headline: 'German exports decline 2.1% on weak China demand', time: '1h ago', priority: 'normal' },
    { headline: 'DAX rebounds 0.8% on tech sector strength', time: '2h ago', priority: 'normal' },
  ],
  it: [
    { headline: 'Italy debt/GDP at 137% - default risk elevated', time: '8m ago', priority: 'breaking' },
    { headline: 'Meloni government passes new budget deficit measures', time: '25m ago', priority: 'high' },
    { headline: 'Italian banks face scrutiny over NPL exposure', time: '50m ago', priority: 'normal' },
    { headline: 'Rome-Beijing BRI tensions ease slightly', time: '1h ago', priority: 'normal' },
  ],
  jp: [
    { headline: 'Japan yen hits 155 per dollar, intervention risk rises', time: '22m ago', priority: 'high' },
    { headline: 'BoJ maintains negative rates, Ueda signals gradual shift', time: '45m ago', priority: 'high' },
    { headline: 'Japan debt/GDP at 255% - highest in monitored countries', time: '1h ago', priority: 'breaking' },
    { headline: 'Toyota reports record profits on hybrid demand', time: '2h ago', priority: 'normal' },
  ],
  cn: [
    { headline: 'China exports beat expectations, trade surplus widens', time: '25m ago', priority: 'normal' },
    { headline: 'PBOC cuts reserve ratio to boost liquidity', time: '1h ago', priority: 'high' },
    { headline: 'Property sector stress continues with Evergrande liquidation', time: '2h ago', priority: 'high' },
    { headline: 'CPI shows deflationary pressure persists at -0.2%', time: '3h ago', priority: 'normal' },
  ],
  in: [
    { headline: 'India GDP growth 8.2% in FY24, fastest among major economies', time: '45m ago', priority: 'normal' },
    { headline: 'RBI holds rates at 6.5%, Das flags inflation vigilance', time: '1h ago', priority: 'normal' },
    { headline: 'India-Pakistan trade tensions flare over Kashmir', time: '2h ago', priority: 'high' },
    { headline: 'Sensex crosses 75,000 on foreign fund inflows', time: '3h ago', priority: 'normal' },
  ],
  ar: [
    { headline: 'Argentina inflation hits 220%, central bank hikes 600bps', time: '15m ago', priority: 'breaking' },
    { headline: 'Milei slashes peso devaluation by 50% in shock move', time: '30m ago', priority: 'breaking' },
    { headline: 'IMF approves $4.7B disbursement under extended facility', time: '1h ago', priority: 'high' },
    { headline: 'Argentina risk score jumps to 80 - highest monitored', time: '2h ago', priority: 'high' },
  ],
  tr: [
    { headline: 'Turkey inflation at 58.5% - hyperinflation territory', time: '10m ago', priority: 'breaking' },
    { headline: 'CBRT holds rates at 50%, signals no early cuts', time: '35m ago', priority: 'high' },
    { headline: 'Lira stabilizes near 32 per dollar after rate pause', time: '1h ago', priority: 'normal' },
    { headline: 'Turkey-EU customs union talks stall again', time: '2h ago', priority: 'normal' },
  ],
  default: [
    { headline: 'Global debt hits $315T, emerging markets face refinancing cliff', time: '5m ago', priority: 'breaking' },
    { headline: 'Oil prices surge above $85 on Middle East tensions', time: '20m ago', priority: 'breaking' },
    { headline: 'ECB holds rates steady, Lagarde warns on services inflation', time: '40m ago', priority: 'high' },
    { headline: 'Dollar index steadies near 104 ahead of jobs data', time: '1h ago', priority: 'normal' },
  ],
};

const priorityColors = {
  breaking: 'text-red-400 border-red-400/20 bg-red-400/5',
  high: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
  normal: 'text-white/50 border-white/10 bg-white/5',
};

export default function EconomicVideoWall({ selectedCode }: { selectedCode: string | null }) {
  const [stream, setStream] = useState<StreamChannel | null>(null);
  const [news, setNews] = useState(COUNTRY_NEWS.default);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/live-streams')
      .then(r => r.json())
      .then(data => {
        const allChannels: StreamChannel[] = data.channels || data.streams || [];
        const streamId = selectedCode ? (COUNTRY_STREAMS[selectedCode] || DEFAULT_STREAM) : DEFAULT_STREAM;
        const found = allChannels.find((c: StreamChannel) => c.id === streamId);
        setStream(found || allChannels[0]);
        
        // Set country-specific news
        const countryNews = selectedCode ? (COUNTRY_NEWS[selectedCode] || COUNTRY_NEWS.default) : COUNTRY_NEWS.default;
        setNews(countryNews);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCode]);

  // Auto-scroll news every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex(prev => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3 mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-1 aspect-video bg-white/5 rounded animate-pulse" />
          <div className="lg:col-span-2 space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!stream) return null;

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0d0d14] p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">📺</span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-white/80">
            LIVE STREAM
          </span>
          {selectedCode && (
            <span className="text-[9px] font-mono text-white/40">
              — {selectedCode.toUpperCase()}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-red-400 font-bold">LIVE</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Single small video stream */}
        <div className="lg:col-span-1">
          <div 
            className="relative aspect-video rounded-md overflow-hidden border border-white/[0.08]"
            style={{ backgroundColor: stream.color + '15' }}
          >
            {stream.embedUrl ? (
              <iframe
                src={stream.embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl mb-1">{stream.logo}</span>
                <span className="text-[9px] font-mono text-white/40">{stream.name}</span>
                <a 
                  href={stream.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 px-2 py-0.5 rounded bg-white/10 text-[8px] font-mono text-white/60 hover:bg-white/20 transition-colors"
                >
                  Open →
                </a>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-1.5 py-0.5 bg-gradient-to-b from-black/70 to-transparent">
              <span className="flex items-center gap-1">
                <span className="text-[9px]">{stream.logo}</span>
                <span className="text-[8px] font-mono font-bold text-white/80">{stream.shortName}</span>
              </span>
              {stream.embedUrl && (
                <span className="flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[7px] font-mono text-red-400">LIVE</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breaking news ticker - auto scroll */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-white/30 tracking-wider">
              BREAKING NEWS — {selectedCode?.toUpperCase() || 'GLOBAL'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[8px] font-mono text-amber-400">AUTO</span>
            </span>
          </div>

          <div className="flex-1 space-y-1.5 overflow-hidden">
            {news.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-2 py-1.5 rounded border ${priorityColors[item.priority]} transition-all duration-500 ${
                  i === scrollIndex ? 'opacity-100 scale-[1.01]' : 'opacity-50 scale-100'
                }`}
              >
                <span className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded shrink-0 mt-0.5 ${
                  item.priority === 'breaking' ? 'bg-red-500/20 text-red-400' :
                  item.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-white/10 text-white/40'
                }`}>
                  {item.priority === 'breaking' ? 'BREAKING' : item.priority === 'high' ? 'HIGH' : 'NEWS'}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/80 leading-tight block">{item.headline}</span>
                  <span className="text-[8px] font-mono text-white/30">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
