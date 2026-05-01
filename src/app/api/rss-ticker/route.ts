import { NextResponse } from "next/server";

const RSS_FEEDS = [
  { name: "Reuters", url: "https://feeds.reuters.com/reuters/worldNews" },
  { name: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "France24", url: "https://www.france24.com/en/rss" },
  { name: "DW", url: "https://rss.dw.com/xml/rss-en-world" },
];

// Parse basic RSS XML to extract titles
async function parseRSS(url: string): Promise<string[]> {
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
    const titles: string[] = [];

    // Simple regex-based extraction (no external XML parser needed)
    const itemRegex = /<item[\s\S]*?<\/item>/g;
    const titleRegex = /<title[\s\S]*?>([\s\S]*?)<\/title>/;
    const cdataRegex = /<!\[CDATA\[(.*?)\]\]>/;

    const items = xml.match(itemRegex) || [];

    for (const item of items.slice(0, 5)) {
      const titleMatch = item.match(titleRegex);
      if (titleMatch) {
        let title = titleMatch[1].trim();
        // Handle CDATA
        const cdataMatch = title.match(cdataRegex);
        if (cdataMatch) {
          title = cdataMatch[1].trim();
        }
        // Decode basic HTML entities
        title = title
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ");

        if (title.length > 10 && title.length < 200) {
          titles.push(title);
        }
      }
    }

    return titles;
  } catch {
    return [];
  }
}

export async function GET() {
  const allHeadlines: { source: string; title: string }[] = [];

  // Fetch from all feeds in parallel
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const titles = await parseRSS(feed.url);
      return titles.map((title) => ({ source: feed.name, title }));
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allHeadlines.push(...result.value);
    }
  }

  // Shuffle and deduplicate by title similarity
  const seen = new Set<string>();
  const unique: { source: string; title: string }[] = [];

  for (const item of allHeadlines) {
    const key = item.title.toLowerCase().slice(0, 40);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  // Limit to ~30 headlines for the ticker
  const final = unique.slice(0, 30);

  return NextResponse.json(
    { headlines: final, count: final.length, updatedAt: new Date().toISOString() },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    }
  );
}
