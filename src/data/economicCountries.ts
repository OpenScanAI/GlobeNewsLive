export interface CountryMeta {
  name: string;
  flag: string;
  iso3: string;
  region: string;
}

export interface MacroData {
  gdpGrowth: number | null;      // NY.GDP.MKTP.KD.ZG
  inflation: number | null;      // FP.CPI.TOTL.ZG
  unemployment: number | null;   // SL.UEM.TOTL.ZS
  debtToGdp: number | null;      // GC.DOD.TOTL.GD.ZS
  reserves: number | null;       // FI.RES.TOTL.CD (in USD)
  exports: number | null;        // BX.GSR.GNFS.CD (in USD)
  imports: number | null;        // BM.GSR.GNFS.CD (in USD)
  gdpPerCapita: number | null;  // NY.GDP.PCAP.CD
  tradeBalance: number | null;   // calculated
  lastUpdated: string;
}

export interface RiskScore {
  overall: number;        // 0-100, higher = worse
  debtStress: number;     // 0-100
  inflationRisk: number;  // 0-100
  reserveHealth: number;  // 0-100 (inverted, higher = worse)
  tradeVulnerability: number; // 0-100
  growthMomentum: number; // 0-100 (inverted, contraction = worse)
}

export interface EconomicAlert {
  country: string;
  type: 'inflation' | 'reserves' | 'debt' | 'recession' | 'currency' | 'trade';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  value: string;
}

export const COUNTRIES: Record<string, CountryMeta> = {
  us:  { name: 'United States', flag: '🇺🇸', iso3: 'USA', region: 'North America' },
  cn:  { name: 'China',       flag: '🇨🇳', iso3: 'CHN', region: 'Asia' },
  de:  { name: 'Germany',     flag: '🇩🇪', iso3: 'DEU', region: 'Europe' },
  jp:  { name: 'Japan',       flag: '🇯🇵', iso3: 'JPN', region: 'Asia' },
  in:  { name: 'India',       flag: '🇮🇳', iso3: 'IND', region: 'Asia' },
  gb:  { name: 'United Kingdom', flag: '🇬🇧', iso3: 'GBR', region: 'Europe' },
  fr:  { name: 'France',      flag: '🇫🇷', iso3: 'FRA', region: 'Europe' },
  br:  { name: 'Brazil',      flag: '🇧🇷', iso3: 'BRA', region: 'South America' },
  it:  { name: 'Italy',       flag: '🇮🇹', iso3: 'ITA', region: 'Europe' },
  ca:  { name: 'Canada',      flag: '🇨🇦', iso3: 'CAN', region: 'North America' },
  ru:  { name: 'Russia',      flag: '🇷🇺', iso3: 'RUS', region: 'Europe/Asia' },
  kr:  { name: 'South Korea', flag: '🇰🇷', iso3: 'KOR', region: 'Asia' },
  mx:  { name: 'Mexico',      flag: '🇲🇽', iso3: 'MEX', region: 'North America' },
  au:  { name: 'Australia',   flag: '🇦🇺', iso3: 'AUS', region: 'Oceania' },
  es:  { name: 'Spain',       flag: '🇪🇸', iso3: 'ESP', region: 'Europe' },
  id:  { name: 'Indonesia',   flag: '🇮🇩', iso3: 'IDN', region: 'Asia' },
  sa:  { name: 'Saudi Arabia', flag: '🇸🇦', iso3: 'SAU', region: 'Middle East' },
  tr:  { name: 'Turkey',      flag: '🇹🇷', iso3: 'TUR', region: 'Middle East' },
  tw:  { name: 'Taiwan',      flag: '🇹🇼', iso3: 'TWN', region: 'Asia' },
  ar:  { name: 'Argentina',   flag: '🇦🇷', iso3: 'ARG', region: 'South America' },
  za:  { name: 'South Africa', flag: '🇿🇦', iso3: 'ZAF', region: 'Africa' },
  ua:  { name: 'Ukraine',     flag: '🇺🇦', iso3: 'UKR', region: 'Europe' },
  il:  { name: 'Israel',      flag: '🇮🇱', iso3: 'ISR', region: 'Middle East' },
  ir:  { name: 'Iran',        flag: '🇮🇷', iso3: 'IRN', region: 'Middle East' },
  ae:  { name: 'UAE',         flag: '🇦🇪', iso3: 'ARE', region: 'Middle East' },
  eg:  { name: 'Egypt',       flag: '🇪🇬', iso3: 'EGY', region: 'Africa' },
  vn:  { name: 'Vietnam',     flag: '🇻🇳', iso3: 'VNM', region: 'Asia' },
  pl:  { name: 'Poland',      flag: '🇵🇱', iso3: 'POL', region: 'Europe' },
  ng:  { name: 'Nigeria',     flag: '🇳🇬', iso3: 'NGA', region: 'Africa' },
  pk:  { name: 'Pakistan',    flag: '🇵🇰', iso3: 'PAK', region: 'Asia' },
  bd:  { name: 'Bangladesh',  flag: '🇧🇩', iso3: 'BGD', region: 'Asia' },
};

export const COUNTRY_CODES = Object.keys(COUNTRIES);

// World Bank indicator codes
export const WB_INDICATORS = {
  gdpGrowth:    'NY.GDP.MKTP.KD.ZG',
  inflation:    'FP.CPI.TOTL.ZG',
  unemployment: 'SL.UEM.TOTL.ZS',
  debtToGdp:    'GC.DOD.TOTL.GD.ZS',
  reserves:     'FI.RES.TOTL.CD',
  exports:      'BX.GSR.GNFS.CD',
  imports:      'BM.GSR.GNFS.CD',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
} as const;

// Alert thresholds
export const ALERT_THRESHOLDS = {
  inflation: { critical: 20, high: 10, medium: 5 },
  reservesDrop: { critical: 40, high: 20, medium: 10 }, // % YoY drop
  debtToGdp: { critical: 120, high: 90, medium: 70 },
  gdpGrowth: { critical: -5, high: -2, medium: 0 }, // contraction
  tradeDeficit: { critical: -15, high: -10, medium: -5 }, // % of GDP
};

export function calculateRisk(data: MacroData): RiskScore {
  const debtStress = data.debtToGdp !== null
    ? Math.min(100, Math.max(0, (data.debtToGdp - 40) / 80 * 100))
    : 50;

  const inflationRisk = data.inflation !== null
    ? Math.min(100, Math.max(0, data.inflation / 20 * 100))
    : 50;

  const reserveHealth = data.reserves !== null && data.imports !== null
    ? Math.min(100, Math.max(0, (1 - Math.min(data.reserves / (data.imports * 3), 1)) * 100))
    : 50;

  const tradeVulnerability = data.tradeBalance !== null && data.gdpPerCapita !== null
    ? Math.min(100, Math.max(0, Math.abs(data.tradeBalance) / data.gdpPerCapita / 500 * 100))
    : 50;

  const growthMomentum = data.gdpGrowth !== null
    ? Math.min(100, Math.max(0, (2 - data.gdpGrowth) / 7 * 100))
    : 50;

  const overall = Math.round((debtStress * 0.25 + inflationRisk * 0.25 + reserveHealth * 0.2 + tradeVulnerability * 0.15 + growthMomentum * 0.15));

  return {
    overall: Math.round(overall),
    debtStress: Math.round(debtStress),
    inflationRisk: Math.round(inflationRisk),
    reserveHealth: Math.round(reserveHealth),
    tradeVulnerability: Math.round(tradeVulnerability),
    growthMomentum: Math.round(growthMomentum),
  };
}

export function generateAlerts(code: string, data: MacroData, prevData?: MacroData): EconomicAlert[] {
  const country = COUNTRIES[code]?.name || code;
  const alerts: EconomicAlert[] = [];

  if (data.inflation !== null) {
    if (data.inflation >= ALERT_THRESHOLDS.inflation.critical) {
      alerts.push({ country, type: 'inflation', severity: 'critical', message: `${country} inflation at ${data.inflation.toFixed(1)}% — hyperinflation territory`, value: `${data.inflation.toFixed(1)}%` });
    } else if (data.inflation >= ALERT_THRESHOLDS.inflation.high) {
      alerts.push({ country, type: 'inflation', severity: 'high', message: `${country} inflation elevated at ${data.inflation.toFixed(1)}%`, value: `${data.inflation.toFixed(1)}%` });
    } else if (data.inflation >= ALERT_THRESHOLDS.inflation.medium) {
      alerts.push({ country, type: 'inflation', severity: 'medium', message: `${country} inflation above target at ${data.inflation.toFixed(1)}%`, value: `${data.inflation.toFixed(1)}%` });
    }
  }

  if (data.debtToGdp !== null) {
    if (data.debtToGdp >= ALERT_THRESHOLDS.debtToGdp.critical) {
      alerts.push({ country, type: 'debt', severity: 'critical', message: `${country} debt/GDP at ${data.debtToGdp.toFixed(0)}% — default risk elevated`, value: `${data.debtToGdp.toFixed(0)}%` });
    } else if (data.debtToGdp >= ALERT_THRESHOLDS.debtToGdp.high) {
      alerts.push({ country, type: 'debt', severity: 'high', message: `${country} debt/GDP at ${data.debtToGdp.toFixed(0)}% — sustainability concerns`, value: `${data.debtToGdp.toFixed(0)}%` });
    }
  }

  if (data.gdpGrowth !== null && data.gdpGrowth <= ALERT_THRESHOLDS.gdpGrowth.critical) {
    alerts.push({ country, type: 'recession', severity: 'critical', message: `${country} GDP contracted ${data.gdpGrowth.toFixed(1)}% — severe recession`, value: `${data.gdpGrowth.toFixed(1)}%` });
  } else if (data.gdpGrowth !== null && data.gdpGrowth <= ALERT_THRESHOLDS.gdpGrowth.high) {
    alerts.push({ country, type: 'recession', severity: 'high', message: `${country} GDP contracted ${data.gdpGrowth.toFixed(1)}% — recession risk`, value: `${data.gdpGrowth.toFixed(1)}%` });
  }

  if (data.tradeBalance !== null && data.gdpPerCapita !== null) {
    const deficitPct = (data.tradeBalance / (data.imports || 1)) * 100;
    if (deficitPct <= -50) {
      alerts.push({ country, type: 'trade', severity: 'high', message: `${country} trade deficit severe at ${Math.abs(deficitPct).toFixed(0)}% of imports`, value: `${data.tradeBalance.toFixed(0)}B` });
    }
  }

  return alerts;
}
