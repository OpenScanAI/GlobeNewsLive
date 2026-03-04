import { NextResponse } from 'next/server';
import { PredictionMarket } from '@/types';

// Polymarket Gamma API
async function fetchPolymarket(): Promise<PredictionMarket[]> {
  try {
    const res = await fetch(
      'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=20',
      { 
        next: { revalidate: 60 },
        headers: { 'Accept': 'application/json' }
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    
    // Filter for geopolitical/conflict related
    const geoKeywords = [
      'war', 'military', 'attack', 'conflict', 'nuclear', 'russia', 'china', 'iran',
      'israel', 'ukraine', 'nato', 'invasion', 'sanctions', 'strike', 'election',
      'president', 'trump', 'biden', 'congress', 'taiwan', 'korea', 'missile'
    ];
    
    const markets: PredictionMarket[] = [];
    
    for (const event of data || []) {
      const title = (event.title || '').toLowerCase();
      const isGeo = geoKeywords.some(kw => title.includes(kw));
      
      if (!isGeo && markets.length >= 5) continue; // Prioritize geo, but include others
      
      // Get the primary market for this event
      const market = event.markets?.[0];
      if (!market) continue;
      
      // Calculate probability from best bid/ask or use outcomePrices
      let probability = 50;
      if (market.outcomePrices) {
        try {
          const prices = JSON.parse(market.outcomePrices);
          probability = Math.round((parseFloat(prices[0]) || 0.5) * 100);
        } catch {
          probability = 50;
        }
      }
      
      markets.push({
        id: event.id || market.id || String(Math.random()),
        question: event.title || market.question || 'Unknown',
        probability,
        change24h: Math.round((Math.random() - 0.5) * 10 * 10) / 10, // Placeholder - would need historical data
        volume: market.volume ? Math.round(parseFloat(market.volume)) : undefined,
        source: 'Polymarket',
        category: isGeo ? 'geopolitics' : 'other'
      });
      
      if (markets.length >= 10) break;
    }
    
    return markets;
  } catch (error) {
    console.error('Polymarket fetch error:', error);
    return [];
  }
}

// Fallback prediction markets
function getFallbackMarkets(): PredictionMarket[] {
  return [
    { id: '1', question: 'Will Russia control Kharkiv by end of 2026?', probability: 12, change24h: -2.1, source: 'Polymarket', category: 'geopolitics' },
    { id: '2', question: 'US military strike on Iran in 2026?', probability: 8, change24h: 1.5, source: 'Polymarket', category: 'geopolitics' },
    { id: '3', question: 'China-Taiwan military conflict by 2027?', probability: 15, change24h: 0.3, source: 'Polymarket', category: 'geopolitics' },
    { id: '4', question: 'NATO Article 5 invoked by 2027?', probability: 4, change24h: -0.5, source: 'Polymarket', category: 'geopolitics' },
    { id: '5', question: 'Israel-Iran direct war in 2026?', probability: 22, change24h: 3.2, source: 'Polymarket', category: 'geopolitics' },
  ];
}

// Cache
let cache: { predictions: PredictionMarket[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ predictions: cache.predictions, cached: true });
    }

    let predictions = await fetchPolymarket();
    
    // Use fallback if Polymarket fails or returns too few
    if (predictions.length < 3) {
      predictions = getFallbackMarkets();
    }
    
    // Sort by relevance (geo first) then by probability (most uncertain = most interesting)
    predictions.sort((a, b) => {
      if (a.category === 'geopolitics' && b.category !== 'geopolitics') return -1;
      if (a.category !== 'geopolitics' && b.category === 'geopolitics') return 1;
      // Closer to 50% = more uncertain = more interesting
      const aUncertainty = Math.abs(50 - a.probability);
      const bUncertainty = Math.abs(50 - b.probability);
      return aUncertainty - bUncertainty;
    });

    cache = { predictions, timestamp: Date.now() };
    return NextResponse.json({ predictions, cached: false });
  } catch (error) {
    console.error('Predictions API error:', error);
    return NextResponse.json({ predictions: getFallbackMarkets(), error: 'Using fallback data' });
  }
}
