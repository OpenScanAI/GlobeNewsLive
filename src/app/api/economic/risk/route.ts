import { NextResponse } from 'next/server';
import {
  COUNTRIES, COUNTRY_CODES,
  MacroData, RiskScore, EconomicAlert,
  calculateRisk, generateAlerts,
} from '@/data/economicCountries';

const MACRO_API = 'http://localhost:3400/api/economic/macro';
const FOREX_API = 'http://localhost:3400/api/economic/forex';

// Country currency mapping
const CURRENCY_MAP: Record<string, string> = {
  us: 'USD', cn: 'CNY', de: 'EUR', jp: 'JPY', in: 'INR',
  gb: 'GBP', fr: 'EUR', br: 'BRL', it: 'EUR', ca: 'CAD',
  ru: 'RUB', kr: 'KRW', mx: 'MXN', au: 'AUD', es: 'EUR',
  id: 'IDR', sa: 'SAR', tr: 'TRY', tw: 'TWD', ar: 'ARS',
  za: 'ZAR', ua: 'UAH', il: 'ILS', ir: 'IRR', ae: 'AED',
  eg: 'EGP', vn: 'VND', pl: 'PLN', ng: 'NGN', pk: 'PKR',
  bd: 'BDT',
};

interface CountryEconomicProfile {
  meta: typeof COUNTRIES[string];
  macro: MacroData;
  risk: RiskScore;
  forex: { rate: number | null; vsUSD: number | null };
  alerts: EconomicAlert[];
}

export async function GET() {
  try {
    // Fetch macro and forex in parallel
    const [macroRes, forexRes] = await Promise.all([
      fetch(MACRO_API, { next: { revalidate: 3600 } }).catch(() => null),
      fetch(FOREX_API, { next: { revalidate: 300 } }).catch(() => null),
    ]);

    const macroData = macroRes?.ok ? await macroRes.json() : null;
    const forexData = forexRes?.ok ? await forexRes.json() : null;

    const profiles: Record<string, CountryEconomicProfile> = {};
    const allAlerts: EconomicAlert[] = [];
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;

    for (const code of COUNTRY_CODES) {
      const macro: MacroData = macroData?.data?.[code] || {
        gdpGrowth: null, inflation: null, unemployment: null,
        debtToGdp: null, reserves: null, exports: null,
        imports: null, gdpPerCapita: null, tradeBalance: null,
        lastUpdated: new Date().toISOString(),
      };

      const risk = calculateRisk(macro);
      const alerts = generateAlerts(code, macro);

      const currency = CURRENCY_MAP[code];
      const rate = currency && forexData?.rates?.[currency] ? forexData.rates[currency] : null;
      const vsUSD = rate !== null ? (1 / rate) : null;

      profiles[code] = {
        meta: COUNTRIES[code],
        macro,
        risk,
        forex: { rate, vsUSD },
        alerts,
      };

      for (const a of alerts) {
        allAlerts.push(a);
        if (a.severity === 'critical') criticalCount++;
        else if (a.severity === 'high') highCount++;
        else mediumCount++;
      }
    }

    // Sort by risk score descending
    const rankings = Object.entries(profiles)
      .sort(([, a], [, b]) => b.risk.overall - a.risk.overall)
      .map(([code, p]) => ({ code, ...p }));

    return NextResponse.json({
      profiles,
      rankings,
      alerts: allAlerts.sort((a, b) => {
        const sev = { critical: 3, high: 2, medium: 1 };
        return sev[b.severity] - sev[a.severity];
      }),
      summary: {
        totalCountries: COUNTRY_CODES.length,
        criticalAlerts: criticalCount,
        highAlerts: highCount,
        mediumAlerts: mediumCount,
        mostAtRisk: rankings.slice(0, 5).map(r => ({ code: r.code, name: r.meta.name, score: r.risk.overall })),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[Economic Risk API Error]', err);
    return NextResponse.json(
      { error: 'Failed to compute risk data', details: String(err) },
      { status: 500 }
    );
  }
}
