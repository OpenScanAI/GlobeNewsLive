import { NextResponse } from "next/server";

// Country-specific RSS feeds for economic news
const COUNTRY_RSS_FEEDS: Record<string, { name: string; url: string }[]> = {
  us: [
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
    { name: "CNBC", url: "https://www.cnbc.com/id/19746125/device/rss/rss.html" },
    { name: "MarketWatch", url: "https://feeds.content.dowjones.io/public/rss/mw_topstories" },
  ],
  gb: [
    { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  fr: [
    { name: "France24 Business", url: "https://www.france24.com/en/business/rss" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  de: [
    { name: "DW Business", url: "https://rss.dw.com/xml/rss-en-business" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  jp: [
    { name: "Nikkei", url: "https://asia.nikkei.com/rss/feed/nar" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  cn: [
    { name: "Reuters China", url: "https://feeds.reuters.com/reuters/ChinaNews" },
    { name: "Caixin", url: "https://www.caixinglobal.com/news/rss.xml" },
  ],
  in: [
    { name: "Economic Times", url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  br: [
    { name: "Reuters Brazil", url: "https://feeds.reuters.com/reuters/brazilNews" },
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
  ],
  default: [
    { name: "Reuters", url: "https://feeds.reuters.com/reuters/businessNews" },
    { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
    { name: "France24", url: "https://www.france24.com/en/rss" },
    { name: "DW", url: "https://rss.dw.com/xml/rss-en-world" },
    { name: "Guardian", url: "https://www.theguardian.com/world/rss" },
  ],
};

// Fallback headlines per country when RSS fails
const FALLBACK_NEWS: Record<string, { headline: string; time: string; priority: 'breaking' | 'high' | 'normal' }[]> = {
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

async function parseRSS(url: string, sourceName: string): Promise<{ headline: string; source: string; time: string; priority: 'breaking' | 'high' | 'normal' }[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "GlobeNewsLive/1.0 (News Aggregator)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items: { headline: string; source: string; time: string; priority: 'breaking' | 'high' | 'normal' }[] = [];

    const itemRegex = /<item[\s\S]*?<\/item>/g;
    const titleRegex = /<title[\s\S]*?>([\s\S]*?)<\/title>/;
    const cdataRegex = /<!\[CDATA\[(.*?)\]\]>/;

    const rawItems = xml.match(itemRegex) || [];

    for (const item of rawItems.slice(0, 5)) {
      const titleMatch = item.match(titleRegex);
      if (titleMatch) {
        let headline = titleMatch[1].trim();
        const cdataMatch = headline.match(cdataRegex);
        if (cdataMatch) headline = cdataMatch[1].trim();
        headline = headline
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");

        if (headline.length > 10 && headline.length < 200) {
          // Determine priority based on keywords
          const lower = headline.toLowerCase();
          let priority: 'breaking' | 'high' | 'normal' = 'normal';
          if (/\b(breaking|urgent|crisis|crash|collapse|surge|plunge|emergency)\b/.test(lower)) {
            priority = 'breaking';
          } else if (/\b(hike|cut|rate|inflation|gdp|recession|deficit|debt)\b/.test(lower)) {
            priority = 'high';
          }

          items.push({ headline, source: sourceName, time: 'Just now', priority });
        }
      }
    }

    return items;
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country')?.toLowerCase() || 'default';

  const feeds = COUNTRY_RSS_FEEDS[country] || COUNTRY_RSS_FEEDS.default;

  // Fetch from all feeds in parallel
  const results = await Promise.allSettled(
    feeds.map(feed => parseRSS(feed.url, feed.name))
  );

  const allNews: { headline: string; source: string; time: string; priority: 'breaking' | 'high' | 'normal' }[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allNews.push(...result.value);
    }
  }

  // If no news fetched, use fallback
  if (allNews.length === 0) {
    const fallback = FALLBACK_NEWS[country] || FALLBACK_NEWS.default;
    return NextResponse.json({
      news: fallback,
      count: fallback.length,
      source: 'fallback',
      country,
      updatedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" },
    });
  }

  // Deduplicate by headline similarity
  const seen = new Set<string>();
  const unique = allNews.filter(item => {
    const key = item.headline.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Limit to 10 items
  const final = unique.slice(0, 10);

  return NextResponse.json({
    news: final,
    count: final.length,
    source: 'rss',
    country,
    updatedAt: new Date().toISOString(),
  }, {
    headers: { "Cache-Control": "public, max-age=120, stale-while-revalidate=300" },
  });
}
