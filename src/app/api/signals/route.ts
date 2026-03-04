import { NextResponse } from 'next/server';
import { classifyThreat, classifyCategory, formatTimeAgo } from '@/lib/classify';
import { Signal } from '@/types';

// Comprehensive RSS Feed Sources - All perspectives on Iran conflict
const FEEDS = [
  // === TIER 1: Wire Services (Breaking News) ===
  { name: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews', tier: 1, region: 'global' },
  { name: 'AP News', url: 'https://rsshub.app/apnews/topics/world-news', tier: 1, region: 'global' },
  { name: 'AFP', url: 'https://www.france24.com/en/rss', tier: 1, region: 'global' },
  
  // === TIER 1: Major Global Networks ===
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', tier: 1, region: 'uk' },
  { name: 'BBC Middle East', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', tier: 1, region: 'mena' },
  { name: 'CNN', url: 'https://rss.cnn.com/rss/edition_world.rss', tier: 1, region: 'us' },
  { name: 'Sky News', url: 'https://feeds.skynews.com/feeds/rss/world.xml', tier: 1, region: 'uk' },
  
  // === MIDDLE EAST REGIONAL ===
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', tier: 1, region: 'qatar' },
  { name: 'Al Arabiya', url: 'https://www.alarabiya.net/feed/rss2/ar.xml', tier: 1, region: 'saudi' },
  { name: 'Middle East Eye', url: 'https://www.middleeasteye.net/rss', tier: 2, region: 'mena' },
  { name: 'The National UAE', url: 'https://www.thenationalnews.com/rss', tier: 2, region: 'uae' },
  { name: 'Gulf News', url: 'https://gulfnews.com/rss', tier: 2, region: 'uae' },
  
  // === ISRAELI SOURCES ===
  { name: 'Times of Israel', url: 'https://www.timesofisrael.com/feed/', tier: 1, region: 'israel' },
  { name: 'Jerusalem Post', url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', tier: 1, region: 'israel' },
  { name: 'Haaretz', url: 'https://www.haaretz.com/cmlink/1.628752', tier: 2, region: 'israel' },
  { name: 'Ynet News', url: 'https://www.ynetnews.com/RSS/rss.html', tier: 2, region: 'israel' },
  { name: 'Israel Hayom', url: 'https://www.israelhayom.com/feed/', tier: 2, region: 'israel' },
  { name: 'i24 News', url: 'https://www.i24news.tv/en/rss', tier: 2, region: 'israel' },
  
  // === IRANIAN PERSPECTIVE ===
  { name: 'Press TV', url: 'https://www.presstv.ir/RSS', tier: 2, region: 'iran' },
  { name: 'Tehran Times', url: 'https://www.tehrantimes.com/rss', tier: 2, region: 'iran' },
  { name: 'IRNA', url: 'https://en.irna.ir/rss.aspx', tier: 2, region: 'iran' },
  { name: 'Tasnim News', url: 'https://www.tasnimnews.com/en/rss', tier: 2, region: 'iran' },
  { name: 'Fars News', url: 'https://www.farsnews.ir/rss', tier: 2, region: 'iran' },
  
  // === US GOVERNMENT & MILITARY ===
  { name: 'CENTCOM', url: 'https://www.centcom.mil/RSS/', tier: 1, region: 'us-mil' },
  { name: 'DOD News', url: 'https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10', tier: 1, region: 'us-mil' },
  { name: 'State Dept', url: 'https://www.state.gov/rss-feed/press-releases/feed/', tier: 1, region: 'us-gov' },
  
  // === EUROPEAN ===
  { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', tier: 1, region: 'uk' },
  { name: 'DW News', url: 'https://rss.dw.com/xml/rss-en-world', tier: 2, region: 'germany' },
  { name: 'France 24', url: 'https://www.france24.com/en/middle-east/rss', tier: 2, region: 'france' },
  { name: 'EuroNews', url: 'https://www.euronews.com/rss?level=theme&name=world', tier: 2, region: 'eu' },
  
  // === DEFENSE & MILITARY ANALYSIS ===
  { name: 'Defense One', url: 'https://www.defenseone.com/rss/', tier: 2, region: 'defense' },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/', tier: 2, region: 'defense' },
  { name: 'War on the Rocks', url: 'https://warontherocks.com/feed/', tier: 2, region: 'defense' },
  { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml', tier: 2, region: 'defense' },
  { name: 'Naval News', url: 'https://www.navalnews.com/feed/', tier: 3, region: 'defense' },
  { name: 'The Drive', url: 'https://www.thedrive.com/the-war-zone/feed', tier: 2, region: 'defense' },
  
  // === OSINT & ANALYSIS ===
  { name: 'ISW', url: 'https://www.understandingwar.org/rss.xml', tier: 1, region: 'analysis' },
  { name: 'Bellingcat', url: 'https://www.bellingcat.com/feed/', tier: 2, region: 'osint' },
  { name: 'CSIS', url: 'https://www.csis.org/rss.xml', tier: 2, region: 'analysis' },
  { name: 'War Zone', url: 'https://www.twz.com/feed', tier: 2, region: 'analysis' },
  
  // === REGIONAL CONFLICTS ===
  { name: 'Syria Direct', url: 'https://syriadirect.org/feed/', tier: 3, region: 'syria' },
  { name: 'Lebanon 24', url: 'https://www.lebanon24.com/rss', tier: 3, region: 'lebanon' },
  { name: 'Iraq News', url: 'https://www.iraqinews.com/feed/', tier: 3, region: 'iraq' },
  { name: 'Yemen Post', url: 'https://www.yemenpost.net/rss', tier: 3, region: 'yemen' },
  
  // === SHIPPING & TRADE (Red Sea) ===
  { name: 'Lloyd\'s List', url: 'https://lloydslist.maritimeintelligence.informa.com/RSS', tier: 2, region: 'shipping' },
  { name: 'Splash247', url: 'https://splash247.com/feed/', tier: 3, region: 'shipping' },
  { name: 'gCaptain', url: 'https://gcaptain.com/feed/', tier: 3, region: 'shipping' },
  
  // === NUCLEAR & ARMS CONTROL ===
  { name: 'Arms Control Today', url: 'https://www.armscontrol.org/rss.xml', tier: 2, region: 'nuclear' },
  { name: 'NTI', url: 'https://www.nti.org/rss/', tier: 2, region: 'nuclear' },
  
  // === CYBER SECURITY ===
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', tier: 3, region: 'cyber' },
  { name: 'The Record', url: 'https://therecord.media/feed', tier: 3, region: 'cyber' },
  { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', tier: 3, region: 'cyber' },
  
  // === FINANCIAL IMPACT ===
  { name: 'OilPrice', url: 'https://oilprice.com/rss/main', tier: 2, region: 'commodities' },
  { name: 'Platts', url: 'https://www.spglobal.com/platts/RSSFeed', tier: 2, region: 'commodities' },
  
  // === MIDDLE EAST GOVERNMENT SOURCES ===
  // Israel Government
  { name: 'Israel MFA', url: 'https://www.gov.il/en/api/PublicationApi/Index?limit=20&publicationType=news&ministry=foreignaffairs', tier: 1, region: 'israel-gov', isGov: true },
  { name: 'Israel PMO', url: 'https://www.gov.il/en/api/PublicationApi/Index?limit=20&publicationType=news&ministry=primeminister', tier: 1, region: 'israel-gov', isGov: true },
  { name: 'IDF Official', url: 'https://www.idf.il/en/mini-sites/press-releases/feed/', tier: 1, region: 'israel-mil', isGov: true },
  
  // Iran Government
  { name: 'Iran MFA', url: 'https://en.mfa.gov.ir/rss/news', tier: 1, region: 'iran-gov', isGov: true },
  { name: 'IRIB News', url: 'https://www.iribnews.ir/rss', tier: 1, region: 'iran-gov', isGov: true },
  { name: 'Mehr News', url: 'https://en.mehrnews.com/rss', tier: 2, region: 'iran-gov', isGov: true },
  
  // Saudi Arabia
  { name: 'Saudi MFA', url: 'https://www.mofa.gov.sa/RSS/RSSFeed.aspx?lang=en', tier: 1, region: 'saudi-gov', isGov: true },
  { name: 'Saudi Press Agency', url: 'https://www.spa.gov.sa/rss/english.php', tier: 1, region: 'saudi-gov', isGov: true },
  
  // UAE
  { name: 'UAE MFA', url: 'https://www.mofaic.gov.ae/en/RSS', tier: 1, region: 'uae-gov', isGov: true },
  { name: 'WAM Emirates', url: 'https://www.wam.ae/en/rss/news', tier: 1, region: 'uae-gov', isGov: true },
  
  // Turkey
  { name: 'Turkey MFA', url: 'https://www.mfa.gov.tr/rss/news.xml', tier: 1, region: 'turkey-gov', isGov: true },
  { name: 'Anadolu Agency', url: 'https://www.aa.com.tr/en/rss/default?cat=world', tier: 1, region: 'turkey-gov', isGov: true },
  
  // Qatar
  { name: 'Qatar MFA', url: 'https://www.mofa.gov.qa/en/rss', tier: 1, region: 'qatar-gov', isGov: true },
  { name: 'Qatar News Agency', url: 'https://www.qna.org.qa/en/rss', tier: 1, region: 'qatar-gov', isGov: true },
  
  // Jordan
  { name: 'Jordan MFA', url: 'https://www.mfa.gov.jo/RSS/news.xml', tier: 2, region: 'jordan-gov', isGov: true },
  { name: 'Petra News', url: 'https://petra.gov.jo/RSS/Petra_En.xml', tier: 2, region: 'jordan-gov', isGov: true },
  
  // Egypt
  { name: 'Egypt MFA', url: 'https://www.mfa.gov.eg/RSS', tier: 1, region: 'egypt-gov', isGov: true },
  { name: 'Egypt State Info', url: 'https://www.sis.gov.eg/RSS', tier: 2, region: 'egypt-gov', isGov: true },
  
  // Iraq
  { name: 'Iraq MFA', url: 'https://www.mofa.gov.iq/rss/en', tier: 2, region: 'iraq-gov', isGov: true },
  { name: 'Iraqi News Agency', url: 'https://www.ina.iq/rss', tier: 2, region: 'iraq-gov', isGov: true },
  
  // Lebanon
  { name: 'Lebanon NNA', url: 'https://nna-leb.gov.lb/en/rss', tier: 2, region: 'lebanon-gov', isGov: true },
  
  // Syria
  { name: 'SANA Syria', url: 'https://sana.sy/en/?feed=rss2', tier: 2, region: 'syria-gov', isGov: true },
  
  // Yemen (Houthi-controlled)
  { name: 'Saba News Yemen', url: 'https://www.saba.ye/en/rss', tier: 3, region: 'yemen-gov', isGov: true },
  
  // Pakistan (Iran neighbor)
  { name: 'Pakistan MFA', url: 'https://www.mofa.gov.pk/rss', tier: 2, region: 'pakistan-gov', isGov: true },
  
  // === INTERNATIONAL ORGANIZATIONS ===
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', tier: 1, region: 'un', isGov: true },
  { name: 'UN Security Council', url: 'https://www.un.org/securitycouncil/content/feed', tier: 1, region: 'un', isGov: true },
  { name: 'IAEA', url: 'https://www.iaea.org/feeds/topnews', tier: 1, region: 'nuclear', isGov: true },
  { name: 'NATO News', url: 'https://www.nato.int/cps/en/natohq/news.htm?mode=pressrelease&rss=1', tier: 1, region: 'nato', isGov: true },
  { name: 'EU External Action', url: 'https://www.eeas.europa.eu/eeas/rss_en', tier: 1, region: 'eu-gov', isGov: true },
  
  // === US GOVERNMENT EXPANDED ===
  { name: 'White House', url: 'https://www.whitehouse.gov/briefing-room/feed/', tier: 1, region: 'us-gov', isGov: true },
  { name: 'State Dept Briefings', url: 'https://www.state.gov/rss-feed/press-briefings-and-daily-press-briefings/feed/', tier: 1, region: 'us-gov', isGov: true },
  { name: 'Treasury News', url: 'https://home.treasury.gov/system/files/rss/treasury_news.xml', tier: 1, region: 'us-gov', isGov: true },
  { name: 'CISA Alerts', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/feed', tier: 1, region: 'us-gov', isGov: true },
  
  // === UK GOVERNMENT ===
  { name: 'UK FCDO', url: 'https://www.gov.uk/government/organisations/foreign-commonwealth-development-office.atom', tier: 1, region: 'uk-gov', isGov: true },
  { name: 'UK MOD', url: 'https://www.gov.uk/government/organisations/ministry-of-defence.atom', tier: 1, region: 'uk-gov', isGov: true },
];

// Iran-related keywords for priority boosting
const IRAN_KEYWORDS = [
  'iran', 'tehran', 'persian', 'irgc', 'quds force', 'khamenei', 'raisi', 'zarif',
  'strait of hormuz', 'hormuz', 'persian gulf', 'natanz', 'fordow', 'bushehr', 'arak',
  'hezbollah', 'houthi', 'houthis', 'ansar allah', 'axis of resistance', 'militia',
  'israel', 'idf', 'mossad', 'netanyahu', 'tel aviv', 'jerusalem', 'gaza', 'hamas',
  'strike', 'missile', 'drone', 'attack', 'retaliation', 'escalation', 'war',
  'nuclear', 'enrichment', 'uranium', 'centrifuge', 'iaea', 'jcpoa', 'sanctions',
  'red sea', 'bab el mandeb', 'suez', 'shipping', 'tanker', 'cargo',
  'syria', 'damascus', 'lebanon', 'beirut', 'iraq', 'baghdad', 'yemen', 'sanaa',
  'centcom', 'pentagon', 'uss', 'b-52', 'f-35', 'aircraft carrier', 'deployment',
  'oil', 'crude', 'brent', 'energy', 'pipeline', 'lng',
  'proxy', 'militia', 'paramilitary', 'revolutionary guard', 'basij',
];

// Simple XML parser for RSS and ATOM feeds (no external dependency)
function parseRSS(xml: string, sourceName: string, region: string): Signal[] {
  const items: Signal[] = [];
  
  // Try RSS format first (<item>), then ATOM format (<entry>)
  const isAtom = xml.includes('<entry>') || xml.includes('<entry ');
  const itemRegex = isAtom 
    ? /<entry[^>]*>([\s\S]*?)<\/entry>/gi
    : /<item[^>]*>([\s\S]*?)<\/item>/gi;
  
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    
    // Parse title (same for RSS and ATOM)
    const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
    
    // Parse link - ATOM uses href attribute, RSS uses element content
    let link = '';
    if (isAtom) {
      // ATOM: <link href="..." /> or <link rel="alternate" href="..." />
      const linkMatch = item.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      link = linkMatch?.[1] || '';
    } else {
      // RSS: <link>...</link>
      link = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || '';
    }
    
    // Parse date - ATOM uses <updated> or <published>, RSS uses <pubDate>
    const pubDate = isAtom
      ? (item.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim() || 
         item.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim())
      : item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
    
    // Parse description/summary - ATOM uses <summary> or <content>, RSS uses <description>
    const description = isAtom
      ? (item.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1]?.trim() ||
         item.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i)?.[1]?.trim() || '')
      : item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || '';
    
    if (!title) continue;
    
    // Clean HTML from title and description
    const cleanTitle = title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 300);
    
    const timestamp = pubDate ? new Date(pubDate) : new Date();
    const fullText = (cleanTitle + ' ' + cleanDesc).toLowerCase();
    
    // Check Iran relevance
    const iranRelevance = IRAN_KEYWORDS.filter(kw => fullText.includes(kw.toLowerCase())).length;
    
    const { severity } = classifyThreat(cleanTitle + ' ' + cleanDesc);
    const category = classifyCategory(cleanTitle + ' ' + cleanDesc);
    
    // Boost severity for Iran-related content
    let adjustedSeverity = severity;
    if (iranRelevance >= 3) {
      adjustedSeverity = severity === 'LOW' ? 'MEDIUM' : severity === 'MEDIUM' ? 'HIGH' : severity;
    }
    
    items.push({
      id: Buffer.from(link || cleanTitle).toString('base64').substring(0, 16),
      title: cleanTitle,
      severity: adjustedSeverity,
      category,
      source: sourceName,
      sourceUrl: link,
      timeAgo: formatTimeAgo(timestamp),
      timestamp,
      summary: cleanDesc,
      region,
      iranRelevance,
    } as Signal & { iranRelevance: number });
  }
  
  return items;
}

// Also try Atom feeds
function parseAtom(xml: string, sourceName: string, region: string): Signal[] {
  const items: Signal[] = [];
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;
  
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || '';
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*>/i)?.[1] || '';
    const updated = entry.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim();
    const published = entry.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim();
    const summary = entry.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1]?.trim() || '';
    const content = entry.match(/<content[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content>/i)?.[1]?.trim() || '';
    
    if (!title) continue;
    
    const cleanTitle = title.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
    const cleanDesc = (summary || content).replace(/<[^>]*>/g, '').substring(0, 300);
    
    const timestamp = new Date(published || updated || Date.now());
    const fullText = (cleanTitle + ' ' + cleanDesc).toLowerCase();
    const iranRelevance = IRAN_KEYWORDS.filter(kw => fullText.includes(kw.toLowerCase())).length;
    
    const { severity } = classifyThreat(cleanTitle + ' ' + cleanDesc);
    const category = classifyCategory(cleanTitle + ' ' + cleanDesc);
    
    let adjustedSeverity = severity;
    if (iranRelevance >= 3) {
      adjustedSeverity = severity === 'LOW' ? 'MEDIUM' : severity === 'MEDIUM' ? 'HIGH' : severity;
    }
    
    items.push({
      id: Buffer.from(link || cleanTitle).toString('base64').substring(0, 16),
      title: cleanTitle,
      severity: adjustedSeverity,
      category,
      source: sourceName,
      sourceUrl: link,
      timeAgo: formatTimeAgo(timestamp),
      timestamp,
      summary: cleanDesc,
      region,
      iranRelevance,
    } as Signal & { iranRelevance: number });
  }
  
  return items;
}

// Cache for RSS data
let cache: { signals: Signal[]; timestamp: number; sources: { success: number; failed: number } } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter'); // 'iran', 'israel', 'all'
  const refresh = searchParams.get('refresh') === 'true';
  
  try {
    // Return cached data if fresh (unless refresh requested)
    if (!refresh && cache && Date.now() - cache.timestamp < CACHE_TTL) {
      let signals = cache.signals;
      if (filter === 'iran') {
        signals = signals.filter((s: any) => s.iranRelevance > 0);
      }
      return NextResponse.json({ signals, cached: true, sources: cache.sources });
    }

    // Fetch all feeds in parallel with timeout
    const fetchWithTimeout = async (url: string, timeout = 10000): Promise<string | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; GlobeNews-Live/2.0; +https://globenews.live)',
            'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          },
          next: { revalidate: 60 },
        });
        clearTimeout(timeoutId);
        return res.ok ? await res.text() : null;
      } catch {
        clearTimeout(timeoutId);
        return null;
      }
    };

    let successCount = 0;
    let failCount = 0;

    const results = await Promise.all(
      FEEDS.map(async (feed) => {
        const xml = await fetchWithTimeout(feed.url);
        if (!xml) {
          failCount++;
          return [];
        }
        successCount++;
        // Try RSS first, then Atom
        let items = parseRSS(xml, feed.name, feed.region);
        if (items.length === 0) {
          items = parseAtom(xml, feed.name, feed.region);
        }
        return items;
      })
    );

    // Merge and sort
    let allSignals = results.flat();
    
    // Simple deduplication by title similarity
    const seen = new Set<string>();
    allSignals = allSignals.filter(s => {
      const key = s.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort: Iran relevance > severity > timestamp
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    allSignals.sort((a: any, b: any) => {
      // Iran-related first
      if (a.iranRelevance !== b.iranRelevance) {
        return b.iranRelevance - a.iranRelevance;
      }
      // Then by severity
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      // Then by recency
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Limit to top 100
    const signals = allSignals.slice(0, 100);
    
    // Update cache
    cache = { 
      signals, 
      timestamp: Date.now(),
      sources: { success: successCount, failed: failCount }
    };

    let filteredSignals = signals;
    if (filter === 'iran') {
      filteredSignals = signals.filter((s: any) => s.iranRelevance > 0);
    }

    return NextResponse.json({ 
      signals: filteredSignals, 
      cached: false,
      sources: { success: successCount, failed: failCount, total: FEEDS.length },
      iranRelated: signals.filter((s: any) => s.iranRelevance > 0).length,
    });
  } catch (error) {
    console.error('Signals API error:', error);
    return NextResponse.json({ signals: [], error: 'Failed to fetch signals' }, { status: 500 });
  }
}
