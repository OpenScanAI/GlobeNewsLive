import { NextResponse } from 'next/server';

const FOREX_BASE = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ForexData {
  base: string;
  rates: Record<string, number>;
  lastUpdate: string;
}

let cache: { data: ForexData; timestamp: number } | null = null;

const KEY_CURRENCIES = [
  'USD','EUR','GBP','JPY','CNY','INR','KRW','BRL','CAD','AUD',
  'CHF','SEK','NZD','MXN','SGD','HKD','NOK','TRY','ZAR','RUB',
  'AED','SAR','ILS','PLN','THB','IDR','MYR','PHP','VND','PKR',
  'BDT','EGP','NGN','UAH','ARS','CLP','COP','PEN','RON','HUF',
  'CZK','DKK','HRK','BGN','ISK','MXN',
];

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    const res = await fetch(FOREX_BASE, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Forex API ${res.status}`);
    const json = await res.json();

    const filtered: Record<string, number> = {};
    for (const c of KEY_CURRENCIES) {
      if (json.rates?.[c] !== undefined) filtered[c] = json.rates[c];
    }

    const data: ForexData = {
      base: 'USD',
      rates: filtered,
      lastUpdate: new Date().toISOString(),
    };

    cache = { data, timestamp: Date.now() };
    return NextResponse.json({ ...data, cached: false });
  } catch (err) {
    console.error('[Forex API Error]', err);
    // Fallback: return stale cache if available
    if (cache) {
      return NextResponse.json({ ...cache.data, cached: true, stale: true });
    }
    return NextResponse.json(
      { error: 'Failed to fetch forex data', details: String(err) },
      { status: 500 }
    );
  }
}
