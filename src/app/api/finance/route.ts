import { NextResponse } from 'next/server';

export const revalidate = 30;

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
  const url = `${baseUrl}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GlobeNewsLive/1.0)' },
      next: { revalidate: 30 },
    } as RequestInit & { next?: { revalidate?: number } });
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

    return {
      symbol,
      price: lastPrice,
      change,
      sparkline: prices,
      currency: meta?.currency || 'USD',
    };
  } catch {
    return null;
  }
}

interface CoinGeckoResult {
  bitcoin?: { usd?: number; usd_24h_change?: number };
  ethereum?: { usd?: number; usd_24h_change?: number };
  solana?: { usd?: number; usd_24h_change?: number };
}

async function fetchCoinGecko() {
  const ids = 'bitcoin,ethereum,solana';
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }
  try {
    const res = await fetch(url, { headers, next: { revalidate: 30 } } as RequestInit & { next?: { revalidate?: number } });
    if (!res.ok) return null;
    return (await res.json()) as CoinGeckoResult;
  } catch {
    return null;
  }
}

const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500', display: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ', display: 'NASDAQ' },
  { symbol: '^GDAXI', name: 'DAX', display: 'DAX' },
  { symbol: '^N225', name: 'Nikkei 225', display: 'Nikkei' },
  { symbol: '^FTSE', name: 'FTSE 100', display: 'FTSE 100' },
  { symbol: '^HSI', name: 'Hang Seng', display: 'Hang Seng' },
];

const COMMODITIES = [
  { symbol: 'GC=F', name: 'Gold', display: 'Gold' },
  { symbol: 'SI=F', name: 'Silver', display: 'Silver' },
  { symbol: 'CL=F', name: 'WTI Oil', display: 'Oil WTI' },
  { symbol: 'BZ=F', name: 'Brent Oil', display: 'Oil Brent' },
  { symbol: 'NG=F', name: 'Natural Gas', display: 'NatGas' },
  { symbol: 'HG=F', name: 'Copper', display: 'Copper' },
];

const FOREX = [
  { symbol: 'EURUSD=X', name: 'EUR/USD', display: 'EUR/USD' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', display: 'GBP/USD' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', display: 'USD/JPY' },
  { symbol: 'USDCNY=X', name: 'USD/CNY', display: 'USD/CNY' },
];

const TREASURY_YIELDS = [
  { symbol: '^TNX', name: '10Y Yield', display: '10Y' },
  { symbol: '^FVX', name: '5Y Yield', display: '5Y' },
  { symbol: '^IRX', name: '13W T-Bill', display: '13W' },
];

const VIX = { symbol: '^VIX', name: 'VIX', display: 'VIX' };

function computeComposite(
  indices: Array<{ symbol: string; change: number | null }>,
  commodities: Array<{ symbol: string; change: number | null }>,
  crypto: Array<{ symbol: string; change24h: number | null }>,
  forex: Array<{ symbol: string; change: number | null }>
) {
  const validIndices = indices.filter((i) => i.change !== null);
  const avgIndexChange = validIndices.length
    ? validIndices.reduce((s, i) => s + (i.change || 0), 0) / validIndices.length
    : 0;

  const momentum = Math.max(-1, Math.min(1, avgIndexChange / 3));

  let volatility = 0;
  if (validIndices.length > 1) {
    const mean = avgIndexChange;
    const variance = validIndices.reduce((s, i) => s + Math.pow((i.change || 0) - mean, 2), 0) / validIndices.length;
    volatility = Math.max(-1, Math.min(1, -Math.sqrt(variance) / 2));
  }

  const upCount = validIndices.filter((i) => (i.change || 0) > 0).length;
  const breadth = validIndices.length ? (upCount / validIndices.length) * 2 - 1 : 0;

  const gold = commodities.find((c) => c.symbol === 'GC=F');
  const btc = crypto.find((c) => c.symbol === 'BTC');
  let sentiment = 0;
  if (btc && btc.change24h !== null) {
    sentiment = Math.max(-1, Math.min(1, btc.change24h / 8));
  } else if (gold && gold.change !== null) {
    sentiment = Math.max(-1, Math.min(1, -(gold.change) / 3));
  }

  const spx = indices.find((i) => i.symbol === '^GSPC');
  let flow = 0;
  if (btc && btc.change24h !== null && spx && spx.change !== null) {
    flow = Math.max(-1, Math.min(1, (btc.change24h - spx.change) / 8));
  }

  const oil = commodities.find((c) => c.symbol === 'CL=F');
  let credit = 0;
  if (oil && oil.change !== null && gold && gold.change !== null) {
    credit = Math.max(-1, Math.min(1, (oil.change - gold.change) / 4));
  }

  const usdPairs = forex.filter((f) => f.change !== null);
  let macro = 0;
  if (usdPairs.length) {
    let usdScore = 0;
    let count = 0;
    for (const p of usdPairs) {
      if (p.symbol === 'USDJPY=X' || p.symbol === 'USDCNY=X') {
        usdScore += (p.change || 0) > 0 ? 1 : -1;
        count++;
      } else if (p.symbol === 'EURUSD=X' || p.symbol === 'GBPUSD=X') {
        usdScore += (p.change || 0) < 0 ? 1 : -1;
        count++;
      }
    }
    macro = count ? Math.max(-1, Math.min(1, usdScore / count)) : 0;
  }

  const signals = [
    { name: 'momentum', value: momentum },
    { name: 'volatility', value: volatility },
    { name: 'breadth', value: breadth },
    { name: 'sentiment', value: sentiment },
    { name: 'flow', value: flow },
    { name: 'credit', value: credit },
    { name: 'macro', value: macro },
  ];

  const composite = signals.reduce((s, sig) => s + sig.value, 0) / signals.length;
  const compositeScore = Math.round(((composite + 1) / 2) * 100);

  return { compositeScore, signals };
}

export async function GET() {
  try {
    const indexResults = [];
    for (const meta of INDICES) {
      const data = await fetchYahooChart(meta.symbol);
      if (data) {
        indexResults.push({ ...meta, ...data });
      } else {
        indexResults.push({ ...meta, price: null, change: null, sparkline: [] as number[], currency: 'USD' });
      }
    }

    const commodityResults = [];
    for (const meta of COMMODITIES) {
      const data = await fetchYahooChart(meta.symbol);
      if (data) {
        commodityResults.push({ ...meta, ...data });
      } else {
        commodityResults.push({ ...meta, price: null, change: null, sparkline: [] as number[], currency: 'USD' });
      }
    }

    const forexResults = [];
    for (const meta of FOREX) {
      const data = await fetchYahooChart(meta.symbol);
      if (data) {
        forexResults.push({ ...meta, ...data });
      } else {
        forexResults.push({ ...meta, price: null, change: null, sparkline: [] as number[], currency: 'USD' });
      }
    }

    const cg = await fetchCoinGecko();
    const cryptoResults = [
      { symbol: 'BTC', name: 'Bitcoin', display: 'BTC', price: cg?.bitcoin?.usd ?? null, change24h: cg?.bitcoin?.usd_24h_change ?? null },
      { symbol: 'ETH', name: 'Ethereum', display: 'ETH', price: cg?.ethereum?.usd ?? null, change24h: cg?.ethereum?.usd_24h_change ?? null },
      { symbol: 'SOL', name: 'Solana', display: 'SOL', price: cg?.solana?.usd ?? null, change24h: cg?.solana?.usd_24h_change ?? null },
    ];

    const vixData = await fetchYahooChart(VIX.symbol);
    const vixResult = vixData ? { ...VIX, ...vixData } : { ...VIX, price: null, change: null, sparkline: [] as number[], currency: 'USD' };

    const treasuryResults = [];
    for (const meta of TREASURY_YIELDS) {
      const data = await fetchYahooChart(meta.symbol);
      if (data) {
        treasuryResults.push({ ...meta, ...data });
      } else {
        treasuryResults.push({ ...meta, price: null, change: null, sparkline: [] as number[], currency: 'USD' });
      }
    }

    const { compositeScore, signals } = computeComposite(indexResults, commodityResults, cryptoResults, forexResults);

    return NextResponse.json({
      indices: indexResults,
      commodities: commodityResults,
      crypto: cryptoResults,
      forex: forexResults,
      vix: vixResult,
      treasuryYields: treasuryResults,
      composite: { score: compositeScore, signals },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Finance API error:', error);
    return NextResponse.json(
      { indices: [], commodities: [], crypto: [], forex: [], composite: { score: 50, signals: [] }, error: 'Failed to fetch finance data' },
      { status: 500 }
    );
  }
}
