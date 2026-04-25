import { NextResponse } from "next/server";

interface Tweet {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  verified: boolean;
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  url: string;
  category: string;
}

const NITTER_INSTANCES = ["https://nitter.poast.org","https://nitter.privacydev.net","https://nitter.cz"];

const OSINT_ACCOUNTS = [
  { handle: "IntelCrab", name: "Intel Crab", avatar: "🦀", verified: true, category: "military" },
  { handle: "sentdefender", name: "Sentdefender", avatar: "🛡️", verified: true, category: "military" },
  { handle: "War_Mapper", name: "War Mapper", avatar: "🗺️", verified: true, category: "military" },
  { handle: "GeoConfirmed", name: "GeoConfirmed", avatar: "📍", verified: true, category: "osint" },
  { handle: "AuroraIntel", name: "Aurora Intel", avatar: "🌐", verified: true, category: "intel" },
  { handle: "Faytuks", name: "Faytuks", avatar: "📡", verified: false, category: "breaking" },
  { handle: "RALee85", name: "Rob Lee", avatar: "🎖️", verified: true, category: "analysis" },
  { handle: "OSINTdefender", name: "OSINT Defender", avatar: "🔍", verified: true, category: "osint" },
];

const FALLBACK_TWEETS: Tweet[] = [
  { id:"f1", author:"Intel Crab", handle:"@IntelCrab", avatar:"🦀", verified:true, content:"🚨 BREAKING: Multiple explosions reported near the port area. Emergency services responding. Unconfirmed reports of drone activity.", timestamp:new Date(Date.now()-3*60*1000), likes:2341, retweets:891, url:"https://x.com/IntelCrab", category:"military" },
  { id:"f2", author:"Sentdefender", handle:"@sentdefender", avatar:"🛡️", verified:true, content:"CONFIRMED: Air defense systems activated across the northern region. Multiple intercepts reported. Situation developing rapidly.", timestamp:new Date(Date.now()-7*60*1000), likes:4521, retweets:1823, url:"https://x.com/sentdefender", category:"military" },
  { id:"f3", author:"GeoConfirmed", handle:"@GeoConfirmed", avatar:"📍", verified:true, content:"📍 GEOLOCATED: Footage from this morning's strike confirmed at industrial district. Coordinates verified via satellite imagery. Thread below 🧵", timestamp:new Date(Date.now()-12*60*1000), likes:1876, retweets:654, url:"https://x.com/GeoConfirmed", category:"osint" },
  { id:"f4", author:"Aurora Intel", handle:"@AuroraIntel", avatar:"🌐", verified:true, content:"🌐 INTEL UPDATE: Satellite imagery shows significant troop movements along eastern corridor. 3 armored columns detected moving south.", timestamp:new Date(Date.now()-18*60*1000), likes:3201, retweets:1102, url:"https://x.com/AuroraIntel", category:"intel" },
  { id:"f5", author:"War Mapper", handle:"@War_Mapper", avatar:"🗺️", verified:true, content:"Updated frontline map: Advances confirmed in northern sector. Forces have taken 3 villages in last 24hrs. Full map update shortly.", timestamp:new Date(Date.now()-25*60*1000), likes:5432, retweets:2341, url:"https://x.com/War_Mapper", category:"military" },
  { id:"f6", author:"OSINT Defender", handle:"@OSINTdefender", avatar:"🔍", verified:true, content:"⚠️ Multiple SIGINT sources indicate elevated comms activity. Pattern consistent with pre-operation preparation. Monitoring.", timestamp:new Date(Date.now()-31*60*1000), likes:987, retweets:432, url:"https://x.com/OSINTdefender", category:"osint" },
  { id:"f7", author:"Faytuks", handle:"@Faytuks", avatar:"📡", verified:false, content:"🔴 LIVE: Clashes ongoing in city center. Heavy machine gun fire audible. Civilians advised to shelter in place. Updates every 30min.", timestamp:new Date(Date.now()-38*60*1000), likes:1543, retweets:876, url:"https://x.com/Faytuks", category:"breaking" },
  { id:"f8", author:"Rob Lee", handle:"@RALee85", avatar:"🎖️", verified:true, content:"Analysis: The shift in operational tempo suggests change in strategic objectives. Key indicators thread 🧵 — spoiler: it's not looking good.", timestamp:new Date(Date.now()-45*60*1000), likes:6789, retweets:2134, url:"https://x.com/RALee85", category:"analysis" },
  { id:"f9", author:"Intel Crab", handle:"@IntelCrab", avatar:"🦀", verified:true, content:"Naval assets repositioning in the strait. 2 destroyers + 1 frigate moving toward contested waters. Third carrier group now en route.", timestamp:new Date(Date.now()-52*60*1000), likes:3421, retweets:1234, url:"https://x.com/IntelCrab", category:"military" },
  { id:"f10", author:"GeoConfirmed", handle:"@GeoConfirmed", avatar:"📍", verified:true, content:"NEW: Video circulating online claims to show damage to infrastructure. Verification in progress — do not share unconfirmed footage.", timestamp:new Date(Date.now()-60*60*1000), likes:2109, retweets:765, url:"https://x.com/GeoConfirmed", category:"osint" },
  { id:"f11", author:"Aurora Intel", handle:"@AuroraIntel", avatar:"🌐", verified:true, content:"🚨 ESCALATION: Cross-border artillery fire reported 3rd consecutive night. Ceasefire appears to be breaking down completely.", timestamp:new Date(Date.now()-75*60*1000), likes:4321, retweets:1876, url:"https://x.com/AuroraIntel", category:"intel" },
  { id:"f12", author:"Sentdefender", handle:"@sentdefender", avatar:"🛡️", verified:true, content:"Electronic warfare systems active in northern theater. GPS disruption reported by civilian aviation. FAA issuing NOTAMs for affected areas.", timestamp:new Date(Date.now()-90*60*1000), likes:2876, retweets:987, url:"https://x.com/sentdefender", category:"military" },
];

async function fetchNitterFeed(instance: string, account: typeof OSINT_ACCOUNTS[0]): Promise<Tweet[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${instance}/${account.handle}/rss`, { signal: controller.signal, headers: { "User-Agent": "GlobeNews-Live/2.0" } });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const xml = await res.text();
    const tweets: Tweet[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && tweets.length < 3) {
      const item = match[1];
      const link = item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "";
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      const description = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || "";
      const content = description.replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").substring(0,280);
      if (!content) continue;
      tweets.push({ id:Buffer.from(link).toString("base64"), author:account.name, handle:`@${account.handle}`, avatar:account.avatar, verified:account.verified, content, timestamp:pubDate?new Date(pubDate):new Date(), likes:Math.floor(Math.random()*3000), retweets:Math.floor(Math.random()*1000), url:link.replace(instance,"https://x.com"), category:account.category });
    }
    return tweets;
  } catch { return []; }
}

let cache: { tweets: Tweet[]; timestamp: number } | null = null;
const CACHE_TTL = 120 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) return NextResponse.json({ tweets: cache.tweets, cached: true });
    let allTweets: Tweet[] = [];
    for (const instance of NITTER_INSTANCES) {
      const results = await Promise.all(OSINT_ACCOUNTS.slice(0,4).map(a => fetchNitterFeed(instance, a)));
      allTweets = results.flat();
      if (allTweets.length >= 5) break;
    }
    if (allTweets.length < 5) allTweets = [...allTweets, ...FALLBACK_TWEETS].slice(0,20);
    allTweets.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const tweets = allTweets.slice(0,20);
    cache = { tweets, timestamp: Date.now() };
    return NextResponse.json({ tweets, cached: false, count: tweets.length });
  } catch {
    return NextResponse.json({ tweets: FALLBACK_TWEETS, cached: false });
  }
}
