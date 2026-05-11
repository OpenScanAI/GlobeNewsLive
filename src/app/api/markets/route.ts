import { NextResponse } from 'next/server';
import { MarketData } from '@/types';

// CoinGecko for crypto
async function fetchCrypto(): Promise<MarketData[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd&include_24hr_change=true',
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

/* ─── Yahoo Finance v8 fetch (reused pattern from /api/finance) ─── */
interface YahooChartResult {
  chart?: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        currency?: string;
      };
      indicators?: {
        quote?: Array<{
          close?: (number | null)[];
        }>;
      };
    }>;
  };
}

async function fetchYahooChart(symbol: string) {
  const proxy = process.env.YAHOO_FINANCE_PROXY;
  const baseUrl = proxy ? proxy.replace(/\/$/, '') : 'https://query1.finance.yahoo.com';
  const url = `${baseUrl}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      },
    } as RequestInit);
    if (!res.ok) return null;
    const json: YahooChartResult = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const prices = result.indicators?.quote?.[0]?.close?.filter((v): v is number => v !== null && v !== undefined) ?? [];
    const lastPrice = meta?.regularMarketPrice ?? meta?.previousClose ?? prices[prices.length - 1] ?? null;
    const prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? prices[prices.length - 2] ?? lastPrice ?? null;

    let change: number | null = null;
    if (lastPrice !== null && prevClose !== null && prevClose !== 0) {
      change = ((lastPrice - prevClose) / prevClose) * 100;
    }

    return { price: lastPrice, change, currency: meta?.currency || 'USD' };
  } catch {
    return null;
  }
}

const TRADITIONAL_SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500', display: 'S&P 500', format: (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
  { symbol: '^IXIC', name: 'NASDAQ', display: 'NASDAQ', format: (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
  { symbol: '^DJI', name: 'Dow Jones', display: 'Dow Jones', format: (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
  { symbol: 'CL=F', name: 'Crude Oil', display: 'Oil WTI', format: (n: number) => `$${n.toFixed(2)}` },
  { symbol: 'GC=F', name: 'Gold', display: 'Gold', format: (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}` },
  { symbol: 'EURUSD=X', name: 'EUR/USD', display: 'EUR/USD', format: (n: number) => n.toFixed(4) },
];

async function getTraditionalMarkets(): Promise<MarketData[]> {
  const results = await Promise.all(
    TRADITIONAL_SYMBOLS.map(async (meta) => {
      const data = await fetchYahooChart(meta.symbol);
      if (!data || data.price === null) {
        return {
          name: meta.display,
          symbol: meta.symbol.replace(/[^A-Z]/g, '').slice(0, 4) || meta.display.slice(0, 4),
          value: '—',
          change: '0.00%',
          changePercent: '0.00',
          direction: 'up' as const,
        };
      }
      const change = data.change ?? 0;
      return {
        name: meta.display,
        symbol: meta.symbol.replace(/[^A-Z]/g, '').slice(0, 4) || meta.display.slice(0, 4),
        value: meta.format(data.price),
        change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
        changePercent: change.toFixed(2),
        direction: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
      };
    })
  );
  return results;
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
      getTraditionalMarkets(),
    ]);

    const markets = [...traditional, ...crypto];
    cache = { markets, timestamp: Date.now() };

    return NextResponse.json({ markets, cached: false });
  } catch (error) {
    console.error('Markets API error:', error);
    return NextResponse.json({ markets: [], error: 'Failed to fetch markets' }, { status: 500 });
  }
}
