import { NextResponse } from 'next/server';

interface EnergyRow {
  rank: number;
  country: string;
  production: number;
  consumption: number;
  reserves: number;
  netExport: number;
}

/* ─── Yahoo Finance: crude oil (CL=F), natural gas (NG=F), Brent (BZ=F) ─── */
interface YahooChartResult {
  chart?: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
      };
    }>;
  };
}

async function fetchYahooPrice(symbol: string): Promise<{ price: number; change: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      },
    });
    if (!res.ok) return null;
    const data: YahooChartResult = await res.json();
    const meta = data.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice || !meta.chartPreviousClose) return null;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    return { price: Number(price.toFixed(2)), change: Number((((price - prev) / prev) * 100).toFixed(2)) };
  } catch {
    return null;
  }
}

/* ─── Static fallback for country-level energy data (EIA API requires key) ─── */
const energyData: EnergyRow[] = [
  { rank: 1, country: "United States", production: 12900, consumption: 20000, reserves: 68800, netExport: -7100 },
  { rank: 2, country: "Saudi Arabia", production: 10800, consumption: 3200, reserves: 267190, netExport: 7600 },
  { rank: 3, country: "Russia", production: 10500, consumption: 3500, reserves: 107800, netExport: 7000 },
  { rank: 4, country: "Canada", production: 5700, consumption: 2400, reserves: 171500, netExport: 3300 },
  { rank: 5, country: "China", production: 4100, consumption: 15400, reserves: 26200, netExport: -11300 },
  { rank: 6, country: "Iraq", production: 4400, consumption: 800, reserves: 145020, netExport: 3600 },
  { rank: 7, country: "Brazil", production: 3800, consumption: 3200, reserves: 13100, netExport: 600 },
  { rank: 8, country: "UAE", production: 3700, consumption: 900, reserves: 97800, netExport: 2800 },
  { rank: 9, country: "Iran", production: 3600, consumption: 1900, reserves: 208600, netExport: 1700 },
  { rank: 10, country: "Kuwait", production: 2700, consumption: 500, reserves: 101500, netExport: 2200 }
];

export async function GET() {
  const [wti, brent, gas] = await Promise.all([
    fetchYahooPrice('CL=F'),
    fetchYahooPrice('BZ=F'),
    fetchYahooPrice('NG=F'),
  ]);

  return NextResponse.json({
    rows: energyData,
    prices: {
      wti: wti ?? { price: 78.45, change: 0.0 },
      brent: brent ?? { price: 82.30, change: 0.0 },
      naturalGas: gas ?? { price: 2.15, change: 0.0 },
    },
    source: wti && brent && gas ? 'yahoo-finance' : 'static+partial',
    timestamp: new Date().toISOString(),
  });
}
