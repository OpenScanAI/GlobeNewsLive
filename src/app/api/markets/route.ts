import { NextResponse } from 'next/server';
import { MarketData } from '@/types';

// CoinGecko for crypto
async function fetchCrypto(): Promise<MarketData[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    
    return [
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        value: `$${data.bitcoin?.usd?.toLocaleString() || '—'}`,
        change: `${data.bitcoin?.usd_24h_change?.toFixed(2) || 0}%`,
        changePercent: String(data.bitcoin?.usd_24h_change?.toFixed(2) || 0),
        direction: (data.bitcoin?.usd_24h_change || 0) >= 0 ? 'up' : 'down'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        value: `$${data.ethereum?.usd?.toLocaleString() || '—'}`,
        change: `${data.ethereum?.usd_24h_change?.toFixed(2) || 0}%`,
        changePercent: String(data.ethereum?.usd_24h_change?.toFixed(2) || 0),
        direction: (data.ethereum?.usd_24h_change || 0) >= 0 ? 'up' : 'down'
      },
      {
        name: 'XRP',
        symbol: 'XRP',
        value: `$${data.ripple?.usd?.toFixed(4) || '—'}`,
        change: `${data.ripple?.usd_24h_change?.toFixed(2) || 0}%`,
        changePercent: String(data.ripple?.usd_24h_change?.toFixed(2) || 0),
        direction: (data.ripple?.usd_24h_change || 0) >= 0 ? 'up' : 'down'
      }
    ];
  } catch {
    return [];
  }
}

// Fallback mock data for traditional markets (Yahoo Finance requires API key for reliable access)
function getTraditionalMarkets(): MarketData[] {
  // In production, integrate with Yahoo Finance, Alpha Vantage, or similar
  // For now, return placeholder that will be replaced with real data
  return [
    { name: 'S&P 500', symbol: 'SPX', value: '5,234.18', change: '+0.32%', changePercent: '0.32', direction: 'up' },
    { name: 'Crude Oil', symbol: 'CL', value: '$78.24', change: '+1.15%', changePercent: '1.15', direction: 'up' },
    { name: 'Gold', symbol: 'GC', value: '$2,043.50', change: '-0.21%', changePercent: '-0.21', direction: 'down' },
    { name: 'EUR/USD', symbol: 'EUR', value: '1.0842', change: '-0.08%', changePercent: '-0.08', direction: 'down' },
  ];
}

// Cache
let cache: { markets: MarketData[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ markets: cache.markets, cached: true });
    }

    const [crypto, traditional] = await Promise.all([
      fetchCrypto(),
      Promise.resolve(getTraditionalMarkets())
    ]);

    const markets = [...traditional, ...crypto];
    cache = { markets, timestamp: Date.now() };

    return NextResponse.json({ markets, cached: false });
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json({ markets: [], error: 'Failed to fetch markets' }, { status: 500 });
  }
}
