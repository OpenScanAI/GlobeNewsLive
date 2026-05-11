import { CountryMeta } from './economicCountries';

// ─── Sector Breakdown ───
export interface SectorBreakdown {
  services: number;  // % of GDP
  industry: number;  // % of GDP
  agriculture: number; // % of GDP
}

// ─── Trade Partners ───
export interface TradePartner {
  name: string;
  share: number; // % of exports/imports
  flag: string;
}

export interface TradePartners {
  exports: TradePartner[];
  imports: TradePartner[];
}

// ─── Historical Trends ───
export interface HistoricalData {
  years: number[];        // e.g. [2020, 2021, 2022, 2023, 2024]
  gdpGrowth: (number | null)[];
  inflation: (number | null)[];
  unemployment: (number | null)[];
  debtToGdp: (number | null)[];
}

// ─── Central Bank ───
export type RateDecision = 'hike' | 'cut' | 'hold';

export interface CentralBank {
  name: string;
  policyRate: number | null;      // current %
  previousRate: number | null;    // previous %
  lastDecision: RateDecision;
  lastMeeting: string;            // ISO date
  nextMeeting: string | null;     // ISO date
  meetingsPerYear: number;
  rateTrajectory: RateDecision[]; // last 6 decisions
}

// ─── Currency/Forex ───
export interface ForexDetail {
  rate: number | null;        // 1 USD = X local
  vsUSD: number | null;       // 1 local = X USD
  change24h: number | null;   // % change
  change1w: number | null;
  change1m: number | null;
  currencyCode: string;
  currencyName: string;
}

// ─── Commodity Dependency ───
export interface CommodityDependency {
  oil: number | null;      // % of imports that are oil/gas
  gas: number | null;
  food: number | null;    // % of imports that are food
  critical: boolean;        // flagged if any > 30%
}

// ─── Economic Calendar ───
export type ReleaseType = 'cpi' | 'gdp' | 'employment' | 'central_bank' | 'trade' | 'pmi';

export interface CalendarEvent {
  date: string;           // ISO date
  type: ReleaseType;
  name: string;
  forecast: string | null;
  previous: string | null;
  importance: 'high' | 'medium' | 'low';
}

// ─── Extended Country Profile ───
export interface ExtendedEconomicProfile {
  meta: CountryMeta;
  sectorBreakdown: SectorBreakdown;
  tradePartners: TradePartners;
  historical: HistoricalData;
  centralBank: CentralBank;
  forex: ForexDetail;
  commodityDependency: CommodityDependency;
  calendar: CalendarEvent[];
}

// ─── Static Data ───

export const SECTOR_DATA: Record<string, SectorBreakdown> = {
  us: { services: 77.6, industry: 18.2, agriculture: 4.2 },
  cn: { services: 54.3, industry: 38.3, agriculture: 7.4 },
  de: { services: 69.3, industry: 27.1, agriculture: 3.6 },
  jp: { services: 69.1, industry: 29.1, agriculture: 1.8 },
  in: { services: 48.4, industry: 25.9, agriculture: 25.7 },
  gb: { services: 79.8, industry: 17.4, agriculture: 2.8 },
  fr: { services: 78.8, industry: 16.7, agriculture: 4.5 },
  br: { services: 63.2, industry: 20.5, agriculture: 16.3 },
  it: { services: 73.9, industry: 23.4, agriculture: 2.7 },
  ca: { services: 73.0, industry: 24.1, agriculture: 2.9 },
  ru: { services: 56.7, industry: 32.6, agriculture: 10.7 },
  kr: { services: 57.6, industry: 32.4, agriculture: 10.0 },
  mx: { services: 60.0, industry: 30.6, agriculture: 9.4 },
  au: { services: 66.2, industry: 25.3, agriculture: 8.5 },
  es: { services: 74.7, industry: 22.0, agriculture: 3.3 },
  id: { services: 44.0, industry: 38.3, agriculture: 17.7 },
  sa: { services: 51.6, industry: 44.2, agriculture: 4.2 },
  tr: { services: 54.7, industry: 27.7, agriculture: 17.6 },
  tw: { services: 62.0, industry: 35.0, agriculture: 3.0 },
  ar: { services: 54.0, industry: 24.3, agriculture: 21.7 },
  za: { services: 67.9, industry: 26.2, agriculture: 5.9 },
  ua: { services: 67.8, industry: 25.9, agriculture: 6.3 },
  il: { services: 69.6, industry: 26.5, agriculture: 3.9 },
  ir: { services: 54.5, industry: 35.3, agriculture: 10.2 },
  ae: { services: 53.0, industry: 45.5, agriculture: 1.5 },
  eg: { services: 51.8, industry: 32.1, agriculture: 16.1 },
  vn: { services: 42.0, industry: 37.8, agriculture: 20.2 },
  pl: { services: 56.5, industry: 33.8, agriculture: 9.7 },
  ng: { services: 52.7, industry: 22.3, agriculture: 25.0 },
  pk: { services: 53.0, industry: 25.1, agriculture: 21.9 },
  bd: { services: 52.5, industry: 29.3, agriculture: 18.2 },
};

export const TRADE_PARTNERS: Record<string, TradePartners> = {
  us: {
    exports: [
      { name: 'Canada', share: 17.8, flag: '🇨🇦' },
      { name: 'Mexico', share: 15.9, flag: '🇲🇽' },
      { name: 'China', share: 7.5, flag: '🇨🇳' },
      { name: 'Japan', share: 4.2, flag: '🇯🇵' },
      { name: 'UK', share: 3.8, flag: '🇬🇧' },
    ],
    imports: [
      { name: 'China', share: 16.5, flag: '🇨🇳' },
      { name: 'Mexico', share: 14.3, flag: '🇲🇽' },
      { name: 'Canada', share: 12.9, flag: '🇨🇦' },
      { name: 'Germany', share: 4.8, flag: '🇩🇪' },
      { name: 'Japan', share: 4.1, flag: '🇯🇵' },
    ],
  },
  cn: {
    exports: [
      { name: 'USA', share: 14.8, flag: '🇺🇸' },
      { name: 'Japan', share: 5.9, flag: '🇯🇵' },
      { name: 'South Korea', share: 4.4, flag: '🇰🇷' },
      { name: 'Vietnam', share: 4.1, flag: '🇻🇳' },
      { name: 'Germany', share: 3.5, flag: '🇩🇪' },
    ],
    imports: [
      { name: 'Taiwan', share: 8.8, flag: '🇹🇼' },
      { name: 'South Korea', share: 7.4, flag: '🇰🇷' },
      { name: 'Japan', share: 6.8, flag: '🇯🇵' },
      { name: 'USA', share: 6.3, flag: '🇺🇸' },
      { name: 'Australia', share: 5.0, flag: '🇦🇺' },
    ],
  },
  de: {
    exports: [
      { name: 'USA', share: 9.5, flag: '🇺🇸' },
      { name: 'France', share: 7.8, flag: '🇫🇷' },
      { name: 'China', share: 6.3, flag: '🇨🇳' },
      { name: 'Netherlands', share: 6.1, flag: '🇳🇱' },
      { name: 'Italy', share: 5.2, flag: '🇮🇹' },
    ],
    imports: [
      { name: 'China', share: 11.8, flag: '🇨🇳' },
      { name: 'Netherlands', share: 7.5, flag: '🇳🇱' },
      { name: 'USA', share: 6.3, flag: '🇺🇸' },
      { name: 'Poland', share: 5.1, flag: '🇵🇱' },
      { name: 'Italy', share: 4.8, flag: '🇮🇹' },
    ],
  },
  jp: {
    exports: [
      { name: 'China', share: 19.4, flag: '🇨🇳' },
      { name: 'USA', share: 15.7, flag: '🇺🇸' },
      { name: 'South Korea', share: 7.3, flag: '🇰🇷' },
      { name: 'Taiwan', share: 6.0, flag: '🇹🇼' },
      { name: 'Hong Kong', share: 4.3, flag: '🇭🇰' },
    ],
    imports: [
      { name: 'China', share: 23.3, flag: '🇨🇳' },
      { name: 'USA', share: 11.0, flag: '🇺🇸' },
      { name: 'Australia', share: 6.2, flag: '🇦🇺' },
      { name: 'UAE', share: 4.9, flag: '🇦🇪' },
      { name: 'Saudi Arabia', share: 4.3, flag: '🇸🇦' },
    ],
  },
  in: {
    exports: [
      { name: 'USA', share: 17.7, flag: '🇺🇸' },
      { name: 'UAE', share: 6.9, flag: '🇦🇪' },
      { name: 'UK', share: 3.5, flag: '🇬🇧' },
      { name: 'China', share: 3.2, flag: '🇨🇳' },
      { name: 'Singapore', share: 3.0, flag: '🇸🇬' },
    ],
    imports: [
      { name: 'China', share: 15.4, flag: '🇨🇳' },
      { name: 'UAE', share: 7.1, flag: '🇦🇪' },
      { name: 'USA', share: 7.0, flag: '🇺🇸' },
      { name: 'Saudi Arabia', share: 5.5, flag: '🇸🇦' },
      { name: 'Russia', share: 4.2, flag: '🇷🇺' },
    ],
  },
  gb: {
    exports: [
      { name: 'USA', share: 14.9, flag: '🇺🇸' },
      { name: 'Germany', share: 9.5, flag: '🇩🇪' },
      { name: 'Netherlands', share: 7.8, flag: '🇳🇱' },
      { name: 'France', share: 6.8, flag: '🇫🇷' },
      { name: 'Ireland', share: 6.2, flag: '🇮🇪' },
    ],
    imports: [
      { name: 'China', share: 13.4, flag: '🇨🇳' },
      { name: 'Germany', share: 9.4, flag: '🇩🇪' },
      { name: 'USA', share: 9.2, flag: '🇺🇸' },
      { name: 'Netherlands', share: 7.2, flag: '🇳🇱' },
      { name: 'France', share: 4.4, flag: '🇫🇷' },
    ],
  },
  fr: {
    exports: [
      { name: 'Germany', share: 14.5, flag: '🇩🇪' },
      { name: 'Italy', share: 7.9, flag: '🇮🇹' },
      { name: 'USA', share: 7.6, flag: '🇺🇸' },
      { name: 'Belgium', share: 7.4, flag: '🇧🇪' },
      { name: 'Spain', share: 7.2, flag: '🇪🇸' },
    ],
    imports: [
      { name: 'Germany', share: 14.9, flag: '🇩🇪' },
      { name: 'China', share: 9.3, flag: '🇨🇳' },
      { name: 'Italy', share: 7.8, flag: '🇮🇹' },
      { name: 'USA', share: 6.2, flag: '🇺🇸' },
      { name: 'Belgium', share: 6.1, flag: '🇧🇪' },
    ],
  },
  br: {
    exports: [
      { name: 'China', share: 31.5, flag: '🇨🇳' },
      { name: 'USA', share: 11.2, flag: '🇺🇸' },
      { name: 'Argentina', share: 4.4, flag: '🇦🇷' },
      { name: 'Netherlands', share: 3.6, flag: '🇳🇱' },
      { name: 'Japan', share: 2.5, flag: '🇯🇵' },
    ],
    imports: [
      { name: 'China', share: 22.1, flag: '🇨🇳' },
      { name: 'USA', share: 17.6, flag: '🇺🇸' },
      { name: 'Argentina', share: 5.9, flag: '🇦🇷' },
      { name: 'Germany', share: 5.7, flag: '🇩🇪' },
      { name: 'India', share: 3.2, flag: '🇮🇳' },
    ],
  },
  it: {
    exports: [
      { name: 'Germany', share: 12.2, flag: '🇩🇪' },
      { name: 'France', share: 10.5, flag: '🇫🇷' },
      { name: 'USA', share: 9.8, flag: '🇺🇸' },
      { name: 'Spain', share: 5.3, flag: '🇪🇸' },
      { name: 'UK', share: 5.1, flag: '🇬🇧' },
    ],
    imports: [
      { name: 'Germany', share: 16.1, flag: '🇩🇪' },
      { name: 'China', share: 8.8, flag: '🇨🇳' },
      { name: 'France', share: 8.3, flag: '🇫🇷' },
      { name: 'Netherlands', share: 5.6, flag: '🇳🇱' },
      { name: 'Spain', share: 4.7, flag: '🇪🇸' },
    ],
  },
  ca: {
    exports: [
      { name: 'USA', share: 75.2, flag: '🇺🇸' },
      { name: 'China', share: 3.7, flag: '🇨🇳' },
      { name: 'UK', share: 2.8, flag: '🇬🇧' },
      { name: 'Japan', share: 2.2, flag: '🇯🇵' },
      { name: 'Mexico', share: 1.2, flag: '🇲🇽' },
    ],
    imports: [
      { name: 'USA', share: 49.1, flag: '🇺🇸' },
      { name: 'China', share: 14.1, flag: '🇨🇳' },
      { name: 'Mexico', share: 5.5, flag: '🇲🇽' },
      { name: 'Germany', share: 3.2, flag: '🇩🇪' },
      { name: 'Japan', share: 3.0, flag: '🇯🇵' },
    ],
  },
  ru: {
    exports: [
      { name: 'China', share: 14.1, flag: '🇨🇳' },
      { name: 'Netherlands', share: 10.3, flag: '🇳🇱' },
      { name: 'Turkey', share: 7.2, flag: '🇹🇷' },
      { name: 'Italy', share: 5.6, flag: '🇮🇹' },
      { name: 'Kazakhstan', share: 4.8, flag: '🇰🇿' },
    ],
    imports: [
      { name: 'China', share: 34.7, flag: '🇨🇳' },
      { name: 'Germany', share: 5.9, flag: '🇩🇪' },
      { name: 'USA', share: 5.3, flag: '🇺🇸' },
      { name: 'Belarus', share: 4.6, flag: '🇧🇾' },
      { name: 'France', share: 4.2, flag: '🇫🇷' },
    ],
  },
  kr: {
    exports: [
      { name: 'China', share: 19.6, flag: '🇨🇳' },
      { name: 'USA', share: 15.2, flag: '🇺🇸' },
      { name: 'Vietnam', share: 8.9, flag: '🇻🇳' },
      { name: 'Hong Kong', share: 6.1, flag: '🇭🇰' },
      { name: 'Japan', share: 4.9, flag: '🇯🇵' },
    ],
    imports: [
      { name: 'China', share: 21.8, flag: '🇨🇳' },
      { name: 'USA', share: 11.8, flag: '🇺🇸' },
      { name: 'Japan', share: 7.5, flag: '🇯🇵' },
      { name: 'Australia', share: 5.2, flag: '🇦🇺' },
      { name: 'Germany', share: 4.4, flag: '🇩🇪' },
    ],
  },
  mx: {
    exports: [
      { name: 'USA', share: 78.3, flag: '🇺🇸' },
      { name: 'Canada', share: 2.6, flag: '🇨🇦' },
      { name: 'China', share: 1.8, flag: '🇨🇳' },
      { name: 'Germany', share: 1.4, flag: '🇩🇪' },
      { name: 'Japan', share: 1.1, flag: '🇯🇵' },
    ],
    imports: [
      { name: 'USA', share: 43.9, flag: '🇺🇸' },
      { name: 'China', share: 15.2, flag: '🇨🇳' },
      { name: 'Japan', share: 5.1, flag: '🇯🇵' },
      { name: 'Germany', share: 4.1, flag: '🇩🇪' },
      { name: 'South Korea', share: 3.8, flag: '🇰🇷' },
    ],
  },
  au: {
    exports: [
      { name: 'China', share: 32.2, flag: '🇨🇳' },
      { name: 'Japan', share: 15.5, flag: '🇯🇵' },
      { name: 'South Korea', share: 6.7, flag: '🇰🇷' },
      { name: 'USA', share: 5.4, flag: '🇺🇸' },
      { name: 'India', share: 4.2, flag: '🇮🇳' },
    ],
    imports: [
      { name: 'China', share: 24.4, flag: '🇨🇳' },
      { name: 'USA', share: 11.7, flag: '🇺🇸' },
      { name: 'Japan', share: 7.5, flag: '🇯🇵' },
      { name: 'Germany', share: 4.5, flag: '🇩🇪' },
      { name: 'Thailand', share: 4.0, flag: '🇹🇭' },
    ],
  },
  es: {
    exports: [
      { name: 'France', share: 15.1, flag: '🇫🇷' },
      { name: 'Germany', share: 11.3, flag: '🇩🇪' },
      { name: 'Italy', share: 7.8, flag: '🇮🇹' },
      { name: 'Portugal', share: 7.5, flag: '🇵🇹' },
      { name: 'UK', share: 6.5, flag: '🇬🇧' },
    ],
    imports: [
      { name: 'China', share: 12.1, flag: '🇨🇳' },
      { name: 'Germany', share: 11.2, flag: '🇩🇪' },
      { name: 'France', share: 10.5, flag: '🇫🇷' },
      { name: 'Italy', share: 5.8, flag: '🇮🇹' },
      { name: 'USA', share: 4.3, flag: '🇺🇸' },
    ],
  },
  id: {
    exports: [
      { name: 'China', share: 22.3, flag: '🇨🇳' },
      { name: 'USA', share: 11.2, flag: '🇺🇸' },
      { name: 'Japan', share: 8.1, flag: '🇯🇵' },
      { name: 'India', share: 6.3, flag: '🇮🇳' },
      { name: 'Malaysia', share: 5.2, flag: '🇲🇾' },
    ],
    imports: [
      { name: 'China', share: 28.3, flag: '🇨🇳' },
      { name: 'Japan', share: 8.1, flag: '🇯🇵' },
      { name: 'USA', share: 7.2, flag: '🇺🇸' },
      { name: 'Singapore', share: 5.9, flag: '🇸🇬' },
      { name: 'Thailand', share: 5.3, flag: '🇹🇭' },
    ],
  },
  sa: {
    exports: [
      { name: 'China', share: 17.9, flag: '🇨🇳' },
      { name: 'Japan', share: 11.3, flag: '🇯🇵' },
      { name: 'India', share: 10.1, flag: '🇮🇳' },
      { name: 'South Korea', share: 9.4, flag: '🇰🇷' },
      { name: 'USA', share: 8.5, flag: '🇺🇸' },
    ],
    imports: [
      { name: 'China', share: 19.9, flag: '🇨🇳' },
      { name: 'USA', share: 11.8, flag: '🇺🇸' },
      { name: 'UAE', share: 11.0, flag: '🇦🇪' },
      { name: 'India', share: 5.5, flag: '🇮🇳' },
      { name: 'Germany', share: 5.1, flag: '🇩🇪' },
    ],
  },
  tr: {
    exports: [
      { name: 'Germany', share: 8.4, flag: '🇩🇪' },
      { name: 'USA', share: 6.9, flag: '🇺🇸' },
      { name: 'Iraq', share: 5.8, flag: '🇮🇶' },
      { name: 'UK', share: 5.4, flag: '🇬🇧' },
      { name: 'Italy', share: 4.9, flag: '🇮🇹' },
    ],
    imports: [
      { name: 'Russia', share: 11.9, flag: '🇷🇺' },
      { name: 'China', share: 9.8, flag: '🇨🇳' },
      { name: 'Germany', share: 8.5, flag: '🇩🇪' },
      { name: 'USA', share: 5.2, flag: '🇺🇸' },
      { name: 'Italy', share: 4.6, flag: '🇮🇹' },
    ],
  },
  tw: {
    exports: [
      { name: 'China', share: 26.3, flag: '🇨🇳' },
      { name: 'USA', share: 14.8, flag: '🇺🇸' },
      { name: 'Hong Kong', share: 11.5, flag: '🇭🇰' },
      { name: 'Japan', share: 6.8, flag: '🇯🇵' },
      { name: 'Singapore', share: 5.2, flag: '🇸🇬' },
    ],
    imports: [
      { name: 'China', share: 20.9, flag: '🇨🇳' },
      { name: 'Japan', share: 12.4, flag: '🇯🇵' },
      { name: 'USA', share: 10.5, flag: '🇺🇸' },
      { name: 'South Korea', share: 6.8, flag: '🇰🇷' },
      { name: 'Singapore', share: 4.9, flag: '🇸🇬' },
    ],
  },
  ar: {
    exports: [
      { name: 'Brazil', share: 15.2, flag: '🇧🇷' },
      { name: 'China', share: 9.8, flag: '🇨🇳' },
      { name: 'USA', share: 7.5, flag: '🇺🇸' },
      { name: 'Chile', share: 6.3, flag: '🇨🇱' },
      { name: 'India', share: 4.1, flag: '🇮🇳' },
    ],
    imports: [
      { name: 'China', share: 21.4, flag: '🇨🇳' },
      { name: 'Brazil', share: 18.9, flag: '🇧🇷' },
      { name: 'USA', share: 10.2, flag: '🇺🇸' },
      { name: 'Germany', share: 4.8, flag: '🇩🇪' },
      { name: 'Paraguay', share: 3.5, flag: '🇵🇾' },
    ],
  },
  za: {
    exports: [
      { name: 'China', share: 10.7, flag: '🇨🇳' },
      { name: 'USA', share: 8.3, flag: '🇺🇸' },
      { name: 'Germany', share: 7.5, flag: '🇩🇪' },
      { name: 'Japan', share: 5.9, flag: '🇯🇵' },
      { name: 'UK', share: 5.1, flag: '🇬🇧' },
    ],
    imports: [
      { name: 'China', share: 18.2, flag: '🇨🇳' },
      { name: 'Germany', share: 9.5, flag: '🇩🇪' },
      { name: 'USA', share: 6.8, flag: '🇺🇸' },
      { name: 'India', share: 5.4, flag: '🇮🇳' },
      { name: 'Saudi Arabia', share: 4.9, flag: '🇸🇦' },
    ],
  },
  ua: {
    exports: [
      { name: 'Poland', share: 12.8, flag: '🇵🇱' },
      { name: 'Egypt', share: 8.5, flag: '🇪🇬' },
      { name: 'Turkey', share: 7.2, flag: '🇹🇷' },
      { name: 'China', share: 6.9, flag: '🇨🇳' },
      { name: 'Italy', share: 5.3, flag: '🇮🇹' },
    ],
    imports: [
      { name: 'China', share: 14.8, flag: '🇨🇳' },
      { name: 'Germany', share: 11.5, flag: '🇩🇪' },
      { name: 'Poland', share: 9.2, flag: '🇵🇱' },
      { name: 'USA', share: 7.8, flag: '🇺🇸' },
      { name: 'Turkey', share: 6.1, flag: '🇹🇷' },
    ],
  },
  il: {
    exports: [
      { name: 'USA', share: 26.3, flag: '🇺🇸' },
      { name: 'China', share: 8.5, flag: '🇨🇳' },
      { name: 'UK', share: 7.2, flag: '🇬🇧' },
      { name: 'India', share: 5.1, flag: '🇮🇳' },
      { name: 'Germany', share: 4.8, flag: '🇩🇪' },
    ],
    imports: [
      { name: 'China', share: 12.1, flag: '🇨🇳' },
      { name: 'USA', share: 10.5, flag: '🇺🇸' },
      { name: 'Turkey', share: 7.8, flag: '🇹🇷' },
      { name: 'Germany', share: 6.9, flag: '🇩🇪' },
      { name: 'Switzerland', share: 5.4, flag: '🇨🇭' },
    ],
  },
  ir: {
    exports: [
      { name: 'China', share: 28.8, flag: '🇨🇳' },
      { name: 'Turkey', share: 12.5, flag: '🇹🇷' },
      { name: 'India', share: 10.2, flag: '🇮🇳' },
      { name: 'UAE', share: 8.5, flag: '🇦🇪' },
      { name: 'Iraq', share: 6.3, flag: '🇮🇶' },
    ],
    imports: [
      { name: 'China', share: 24.8, flag: '🇨🇳' },
      { name: 'UAE', share: 15.2, flag: '🇦🇪' },
      { name: 'Turkey', share: 11.5, flag: '🇹🇷' },
      { name: 'India', share: 6.8, flag: '🇮🇳' },
      { name: 'Germany', share: 5.9, flag: '🇩🇪' },
    ],
  },
  ae: {
    exports: [
      { name: 'India', share: 10.5, flag: '🇮🇳' },
      { name: 'Japan', share: 9.8, flag: '🇯🇵' },
      { name: 'China', share: 8.5, flag: '🇨🇳' },
      { name: 'Saudi Arabia', share: 7.2, flag: '🇸🇦' },
      { name: 'Iraq', share: 5.9, flag: '🇮🇶' },
    ],
    imports: [
      { name: 'China', share: 15.8, flag: '🇨🇳' },
      { name: 'India', share: 11.2, flag: '🇮🇳' },
      { name: 'USA', share: 9.5, flag: '🇺🇸' },
      { name: 'Japan', share: 6.8, flag: '🇯🇵' },
      { name: 'Germany', share: 5.4, flag: '🇩🇪' },
    ],
  },
  eg: {
    exports: [
      { name: 'Turkey', share: 8.5, flag: '🇹🇷' },
      { name: 'Italy', share: 7.8, flag: '🇮🇹' },
      { name: 'India', share: 6.9, flag: '🇮🇳' },
      { name: 'USA', share: 6.5, flag: '🇺🇸' },
      { name: 'Saudi Arabia', share: 5.8, flag: '🇸🇦' },
    ],
    imports: [
      { name: 'China', share: 14.8, flag: '🇨🇳' },
      { name: 'Saudi Arabia', share: 9.5, flag: '🇸🇦' },
      { name: 'USA', share: 7.8, flag: '🇺🇸' },
      { name: 'Germany', share: 6.9, flag: '🇩🇪' },
      { name: 'UAE', share: 6.2, flag: '🇦🇪' },
    ],
  },
  vn: {
    exports: [
      { name: 'USA', share: 28.6, flag: '🇺🇸' },
      { name: 'China', share: 16.8, flag: '🇨🇳' },
      { name: 'Japan', share: 6.5, flag: '🇯🇵' },
      { name: 'South Korea', share: 6.2, flag: '🇰🇷' },
      { name: 'Germany', share: 4.1, flag: '🇩🇪' },
    ],
    imports: [
      { name: 'China', share: 37.2, flag: '🇨🇳' },
      { name: 'South Korea', share: 16.5, flag: '🇰🇷' },
      { name: 'Japan', share: 7.8, flag: '🇯🇵' },
      { name: 'Taiwan', share: 6.5, flag: '🇹🇼' },
      { name: 'USA', share: 4.8, flag: '🇺🇸' },
    ],
  },
  pl: {
    exports: [
      { name: 'Germany', share: 28.9, flag: '🇩🇪' },
      { name: 'Czechia', share: 6.5, flag: '🇨🇿' },
      { name: 'France', share: 5.8, flag: '🇫🇷' },
      { name: 'UK', share: 5.2, flag: '🇬🇧' },
      { name: 'Italy', share: 4.8, flag: '🇮🇹' },
    ],
    imports: [
      { name: 'Germany', share: 21.5, flag: '🇩🇪' },
      { name: 'China', share: 14.2, flag: '🇨🇳' },
      { name: 'Russia', share: 6.8, flag: '🇷🇺' },
      { name: 'Italy', share: 4.5, flag: '🇮🇹' },
      { name: 'USA', share: 4.1, flag: '🇺🇸' },
    ],
  },
  ng: {
    exports: [
      { name: 'India', share: 16.8, flag: '🇮🇳' },
      { name: 'Spain', share: 12.5, flag: '🇪🇸' },
      { name: 'Netherlands', share: 9.2, flag: '🇳🇱' },
      { name: 'USA', share: 7.8, flag: '🇺🇸' },
      { name: 'France', share: 6.5, flag: '🇫🇷' },
    ],
    imports: [
      { name: 'China', share: 23.5, flag: '🇨🇳' },
      { name: 'Netherlands', share: 10.2, flag: '🇳🇱' },
      { name: 'USA', share: 8.5, flag: '🇺🇸' },
      { name: 'India', share: 7.8, flag: '🇮🇳' },
      { name: 'Belgium', share: 5.9, flag: '🇧🇪' },
    ],
  },
  pk: {
    exports: [
      { name: 'USA', share: 16.8, flag: '🇺🇸' },
      { name: 'China', share: 8.5, flag: '🇨🇳' },
      { name: 'UK', share: 7.2, flag: '🇬🇧' },
      { name: 'Germany', share: 6.1, flag: '🇩🇪' },
      { name: 'UAE', share: 5.8, flag: '🇦🇪' },
    ],
    imports: [
      { name: 'China', share: 24.8, flag: '🇨🇳' },
      { name: 'UAE', share: 14.5, flag: '🇦🇪' },
      { name: 'Saudi Arabia', share: 8.2, flag: '🇸🇦' },
      { name: 'Indonesia', share: 5.9, flag: '🇮🇩' },
      { name: 'USA', share: 5.2, flag: '🇺🇸' },
    ],
  },
  bd: {
    exports: [
      { name: 'Germany', share: 15.8, flag: '🇩🇪' },
      { name: 'USA', share: 14.2, flag: '🇺🇸' },
      { name: 'UK', share: 10.5, flag: '🇬🇧' },
      { name: 'Spain', share: 6.8, flag: '🇪🇸' },
      { name: 'France', share: 5.9, flag: '🇫🇷' },
    ],
    imports: [
      { name: 'China', share: 24.5, flag: '🇨🇳' },
      { name: 'India', share: 14.2, flag: '🇮🇳' },
      { name: 'Singapore', share: 8.5, flag: '🇸🇬' },
      { name: 'Indonesia', share: 6.9, flag: '🇮🇩' },
      { name: 'Malaysia', share: 5.8, flag: '🇲🇾' },
    ],
  },
};

export const HISTORICAL_DATA: Record<string, HistoricalData> = {
  us: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.8, 5.9, 1.9, 2.5, 2.5],
    inflation: [1.2, 4.7, 8.0, 4.1, 3.4],
    unemployment: [8.1, 5.4, 3.6, 3.6, 3.9],
    debtToGdp: [128, 127, 124, 123, 123],
  },
  cn: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [2.2, 8.4, 3.0, 5.2, 5.2],
    inflation: [2.5, 0.9, 2.0, 0.2, 0.2],
    unemployment: [5.2, 5.1, 5.5, 5.2, 5.2],
    debtToGdp: [66, 70, 74, 77, 77],
  },
  de: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-3.7, 2.6, 1.8, -0.3, -0.3],
    inflation: [0.5, 3.1, 6.9, 2.5, 2.5],
    unemployment: [3.8, 3.6, 3.0, 3.2, 3.2],
    debtToGdp: [69, 69, 66, 66, 66],
  },
  jp: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-4.3, 2.2, 1.0, 1.9, 1.9],
    inflation: [0.0, -0.2, 2.5, 2.8, 2.8],
    unemployment: [2.8, 2.8, 2.6, 2.6, 2.6],
    debtToGdp: [266, 257, 261, 255, 255],
  },
  in: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-5.8, 9.1, 7.2, 7.8, 7.8],
    inflation: [6.2, 5.1, 6.7, 5.4, 5.4],
    unemployment: [7.9, 5.9, 7.3, 7.1, 7.1],
    debtToGdp: [75, 84, 83, 83, 83],
  },
  gb: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-9.3, 7.6, 4.3, 0.1, 0.1],
    inflation: [0.9, 2.6, 9.1, 4.0, 4.0],
    unemployment: [4.6, 4.5, 3.7, 4.3, 4.3],
    debtToGdp: [104, 103, 101, 101, 101],
  },
  fr: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-7.9, 6.8, 2.5, 0.9, 0.9],
    inflation: [0.5, 1.6, 5.2, 2.3, 2.3],
    unemployment: [8.0, 7.9, 7.3, 7.3, 7.3],
    debtToGdp: [115, 113, 112, 111, 111],
  },
  br: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-3.3, 4.8, 3.0, 2.9, 2.9],
    inflation: [3.2, 8.3, 9.3, 4.6, 4.6],
    unemployment: [13.2, 11.1, 9.3, 7.5, 7.5],
    debtToGdp: [89, 74, 73, 75, 75],
  },
  it: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-9.0, 7.0, 4.0, 0.7, 0.7],
    inflation: [-0.1, 1.9, 8.2, 1.7, 1.7],
    unemployment: [9.3, 9.5, 8.1, 7.2, 7.2],
    debtToGdp: [155, 151, 144, 137, 137],
  },
  ca: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-5.2, 4.6, 3.8, 1.1, 1.1],
    inflation: [0.7, 3.4, 6.8, 2.4, 2.4],
    unemployment: [9.5, 7.5, 5.3, 5.8, 5.8],
    debtToGdp: [118, 113, 107, 107, 107],
  },
  ru: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.7, 5.6, -2.1, 3.6, 3.6],
    inflation: [3.4, 6.7, 13.8, 7.4, 7.4],
    unemployment: [5.8, 4.8, 3.6, 2.8, 2.8],
    debtToGdp: [19, 17, 15, 14, 14],
  },
  kr: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-0.7, 4.3, 2.6, 3.1, 3.1],
    inflation: [0.5, 2.5, 5.1, 2.9, 2.9],
    unemployment: [3.9, 3.7, 2.9, 2.7, 2.7],
    debtToGdp: [48, 51, 54, 54, 54],
  },
  mx: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-8.3, 4.7, 3.9, 3.2, 3.2],
    inflation: [3.4, 5.7, 7.9, 4.7, 4.7],
    unemployment: [4.4, 4.1, 3.3, 2.9, 2.9],
    debtToGdp: [52, 52, 51, 60, 60],
  },
  au: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.2, 5.1, 3.7, 1.5, 1.5],
    inflation: [0.9, 2.8, 6.6, 3.6, 3.6],
    unemployment: [6.5, 5.1, 3.7, 3.7, 3.7],
    debtToGdp: [58, 55, 47, 50, 50],
  },
  es: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-11.2, 5.5, 5.8, 2.5, 2.5],
    inflation: [-0.3, 3.1, 8.4, 2.4, 2.4],
    unemployment: [15.5, 14.8, 12.9, 11.8, 11.8],
    debtToGdp: [120, 118, 113, 108, 108],
  },
  id: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.1, 3.7, 5.3, 5.0, 5.0],
    inflation: [2.0, 1.6, 4.2, 2.6, 2.6],
    unemployment: [7.1, 6.5, 5.9, 5.3, 5.3],
    debtToGdp: [39, 41, 40, 39, 39],
  },
  sa: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-4.1, 3.2, 8.7, 0.8, 0.8],
    inflation: [3.4, 3.1, 2.5, 2.3, 2.3],
    unemployment: [8.0, 6.9, 5.6, 5.6, 5.6],
    debtToGdp: [32, 30, 24, 24, 24],
  },
  tr: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [1.9, 11.4, 5.6, 4.5, 4.5],
    inflation: [12.3, 21.3, 72.3, 53.9, 53.9],
    unemployment: [13.1, 12.0, 10.4, 8.5, 8.5],
    debtToGdp: [39, 41, 34, 26, 26],
  },
  tw: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [3.4, 6.6, 2.5, 1.4, 1.4],
    inflation: [-0.2, 2.0, 2.9, 2.2, 2.2],
    unemployment: [3.9, 4.0, 3.7, 3.4, 3.4],
    debtToGdp: [31, 29, 28, 29, 29],
  },
  ar: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-9.9, 10.7, 5.0, -1.6, -1.6],
    inflation: [42.0, 48.4, 72.4, 211.4, 211.4],
    unemployment: [11.4, 8.7, 6.8, 5.7, 5.7],
    debtToGdp: [65, 54, 55, 89, 89],
  },
  za: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-6.4, 4.9, 1.9, 0.6, 0.6],
    inflation: [3.3, 4.5, 6.9, 5.1, 5.1],
    unemployment: [28.7, 34.3, 33.5, 32.1, 32.1],
    debtToGdp: [63, 69, 72, 72, 72],
  },
  ua: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-3.8, 3.4, -29.1, 5.0, 5.0],
    inflation: [5.0, 9.4, 20.2, 5.1, 5.1],
    unemployment: [9.5, 9.8, 25.0, 19.5, 19.5],
    debtToGdp: [51, 49, 78, 78, 78],
  },
  il: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.2, 8.6, 6.5, 2.0, 2.0],
    inflation: [-0.6, 1.5, 4.4, 2.5, 2.5],
    unemployment: [4.3, 5.0, 3.8, 3.2, 3.2],
    debtToGdp: [71, 68, 61, 58, 58],
  },
  ir: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [1.0, 4.7, 3.8, 3.8, 3.8],
    inflation: [36.5, 40.2, 43.0, 40.0, 40.0],
    unemployment: [10.8, 9.2, 8.9, 9.0, 9.0],
    debtToGdp: [37, 34, 34, 34, 34],
  },
  ae: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-5.0, 4.4, 7.4, 3.4, 3.4],
    inflation: [-2.1, 0.2, 3.2, 1.9, 1.9],
    unemployment: [3.6, 3.4, 2.8, 2.8, 2.8],
    debtToGdp: [40, 36, 31, 30, 30],
  },
  eg: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [3.6, 3.3, 6.6, 2.5, 2.5],
    inflation: [5.0, 5.2, 13.9, 33.0, 33.0],
    unemployment: [7.9, 7.4, 7.2, 7.0, 7.0],
    debtToGdp: [90, 91, 88, 96, 96],
  },
  vn: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [2.9, 2.6, 8.0, 5.1, 5.1],
    inflation: [3.2, 1.8, 3.2, 3.3, 3.3],
    unemployment: [2.5, 3.2, 2.3, 2.3, 2.3],
    debtToGdp: [46, 39, 35, 34, 34],
  },
  pl: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.0, 6.9, 5.6, 0.2, 0.2],
    inflation: [3.4, 5.1, 14.4, 3.9, 3.9],
    unemployment: [3.2, 3.4, 2.9, 2.8, 2.8],
    debtToGdp: [57, 53, 49, 50, 50],
  },
  ng: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-1.8, 3.6, 3.3, 2.7, 2.7],
    inflation: [13.2, 17.0, 18.8, 24.2, 24.2],
    unemployment: [33.3, 33.3, 5.0, 5.0, 5.0],
    debtToGdp: [35, 37, 38, 39, 39],
  },
  pk: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-0.9, 5.7, 6.2, 2.4, 2.4],
    inflation: [10.7, 8.9, 12.2, 23.4, 23.4],
    unemployment: [6.5, 6.3, 6.2, 8.5, 8.5],
    debtToGdp: [78, 75, 75, 74, 74],
  },
  bd: {
    years: [2020, 2021, 2022, 2023, 2024],
    gdpGrowth: [-2.4, 6.9, 7.1, 5.8, 5.8],
    inflation: [5.7, 5.5, 7.7, 9.7, 9.7],
    unemployment: [5.3, 5.2, 5.3, 5.3, 5.3],
    debtToGdp: [40, 39, 38, 39, 39],
  },
};

export const CENTRAL_BANK_DATA: Record<string, CentralBank> = {
  us: {
    name: 'Federal Reserve',
    policyRate: 5.50,
    previousRate: 5.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-31',
    nextMeeting: '2024-03-20',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  cn: {
    name: "People's Bank of China",
    policyRate: 3.45,
    previousRate: 3.45,
    lastDecision: 'hold',
    lastMeeting: '2024-02-20',
    nextMeeting: '2024-03-15',
    meetingsPerYear: 4,
    rateTrajectory: ['hold', 'hold', 'cut', 'cut', 'hold', 'hold'],
  },
  de: {
    name: 'European Central Bank',
    policyRate: 4.50,
    previousRate: 4.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-07',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  jp: {
    name: 'Bank of Japan',
    policyRate: -0.10,
    previousRate: -0.10,
    lastDecision: 'hold',
    lastMeeting: '2024-01-23',
    nextMeeting: '2024-03-19',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hold', 'hold', 'hold'],
  },
  in: {
    name: 'Reserve Bank of India',
    policyRate: 6.50,
    previousRate: 6.50,
    lastDecision: 'hold',
    lastMeeting: '2024-02-08',
    nextMeeting: '2024-04-05',
    meetingsPerYear: 6,
    rateTrajectory: ['hold', 'hold', 'hold', 'hold', 'hike', 'hike'],
  },
  gb: {
    name: 'Bank of England',
    policyRate: 5.25,
    previousRate: 5.25,
    lastDecision: 'hold',
    lastMeeting: '2024-02-01',
    nextMeeting: '2024-03-21',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  fr: {
    name: 'European Central Bank',
    policyRate: 4.50,
    previousRate: 4.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-07',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  br: {
    name: 'Central Bank of Brazil',
    policyRate: 10.75,
    previousRate: 11.75,
    lastDecision: 'cut',
    lastMeeting: '2024-02-07',
    nextMeeting: '2024-03-20',
    meetingsPerYear: 8,
    rateTrajectory: ['cut', 'cut', 'hold', 'hold', 'hike', 'hike'],
  },
  it: {
    name: 'European Central Bank',
    policyRate: 4.50,
    previousRate: 4.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-07',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  ca: {
    name: 'Bank of Canada',
    policyRate: 5.00,
    previousRate: 5.00,
    lastDecision: 'hold',
    lastMeeting: '2024-01-24',
    nextMeeting: '2024-03-06',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  ru: {
    name: 'Central Bank of Russia',
    policyRate: 16.00,
    previousRate: 16.00,
    lastDecision: 'hold',
    lastMeeting: '2024-02-16',
    nextMeeting: '2024-03-22',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hike', 'hike', 'hike', 'hike', 'hike'],
  },
  kr: {
    name: 'Bank of Korea',
    policyRate: 3.50,
    previousRate: 3.50,
    lastDecision: 'hold',
    lastMeeting: '2024-02-22',
    nextMeeting: '2024-04-11',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  mx: {
    name: 'Bank of Mexico',
    policyRate: 11.25,
    previousRate: 11.25,
    lastDecision: 'hold',
    lastMeeting: '2024-02-08',
    nextMeeting: '2024-03-21',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  au: {
    name: 'Reserve Bank of Australia',
    policyRate: 4.35,
    previousRate: 4.35,
    lastDecision: 'hold',
    lastMeeting: '2024-02-06',
    nextMeeting: '2024-03-19',
    meetingsPerYear: 11,
    rateTrajectory: ['hold', 'hold', 'hike', 'hike', 'hike', 'hold'],
  },
  es: {
    name: 'European Central Bank',
    policyRate: 4.50,
    previousRate: 4.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-07',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  id: {
    name: 'Bank Indonesia',
    policyRate: 6.00,
    previousRate: 6.00,
    lastDecision: 'hold',
    lastMeeting: '2024-01-18',
    nextMeeting: '2024-03-21',
    meetingsPerYear: 12,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  sa: {
    name: 'Saudi Arabian Monetary Authority',
    policyRate: 6.00,
    previousRate: 6.00,
    lastDecision: 'hold',
    lastMeeting: '2024-01-29',
    nextMeeting: '2024-03-20',
    meetingsPerYear: 12,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  tr: {
    name: 'Central Bank of Turkey',
    policyRate: 45.00,
    previousRate: 42.50,
    lastDecision: 'hike',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-02-22',
    meetingsPerYear: 12,
    rateTrajectory: ['hike', 'hike', 'hike', 'hike', 'hike', 'hike'],
  },
  tw: {
    name: 'Central Bank of Taiwan',
    policyRate: 1.875,
    previousRate: 1.875,
    lastDecision: 'hold',
    lastMeeting: '2024-01-18',
    nextMeeting: '2024-03-21',
    meetingsPerYear: 4,
    rateTrajectory: ['hold', 'hold', 'hold', 'hold', 'hike', 'hike'],
  },
  ar: {
    name: 'Central Bank of Argentina',
    policyRate: 100.00,
    previousRate: 133.00,
    lastDecision: 'cut',
    lastMeeting: '2024-01-11',
    nextMeeting: '2024-02-15',
    meetingsPerYear: 12,
    rateTrajectory: ['cut', 'cut', 'hike', 'hike', 'hike', 'hike'],
  },
  za: {
    name: 'South African Reserve Bank',
    policyRate: 8.25,
    previousRate: 8.25,
    lastDecision: 'hold',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-28',
    meetingsPerYear: 6,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  ua: {
    name: 'National Bank of Ukraine',
    policyRate: 14.50,
    previousRate: 15.00,
    lastDecision: 'cut',
    lastMeeting: '2024-01-25',
    nextMeeting: '2024-03-15',
    meetingsPerYear: 12,
    rateTrajectory: ['cut', 'cut', 'hold', 'hold', 'hike', 'hike'],
  },
  il: {
    name: 'Bank of Israel',
    policyRate: 4.50,
    previousRate: 4.75,
    lastDecision: 'cut',
    lastMeeting: '2024-01-08',
    nextMeeting: '2024-02-26',
    meetingsPerYear: 8,
    rateTrajectory: ['cut', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  ir: {
    name: 'Central Bank of Iran',
    policyRate: 23.00,
    previousRate: 23.00,
    lastDecision: 'hold',
    lastMeeting: '2024-01-15',
    nextMeeting: '2024-03-15',
    meetingsPerYear: 4,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hold'],
  },
  ae: {
    name: 'Central Bank of UAE',
    policyRate: 5.40,
    previousRate: 5.40,
    lastDecision: 'hold',
    lastMeeting: '2024-02-01',
    nextMeeting: '2024-03-21',
    meetingsPerYear: 12,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  eg: {
    name: 'Central Bank of Egypt',
    policyRate: 22.00,
    previousRate: 19.25,
    lastDecision: 'hike',
    lastMeeting: '2024-02-01',
    nextMeeting: '2024-03-28',
    meetingsPerYear: 12,
    rateTrajectory: ['hike', 'hike', 'hike', 'hike', 'hold', 'hold'],
  },
  vn: {
    name: 'State Bank of Vietnam',
    policyRate: 4.50,
    previousRate: 4.50,
    lastDecision: 'hold',
    lastMeeting: '2024-01-15',
    nextMeeting: '2024-03-22',
    meetingsPerYear: 4,
    rateTrajectory: ['hold', 'hold', 'cut', 'cut', 'hold', 'hold'],
  },
  pl: {
    name: 'National Bank of Poland',
    policyRate: 5.75,
    previousRate: 5.75,
    lastDecision: 'hold',
    lastMeeting: '2024-01-10',
    nextMeeting: '2024-03-06',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hold', 'hike', 'hike', 'hike'],
  },
  ng: {
    name: 'Central Bank of Nigeria',
    policyRate: 18.75,
    previousRate: 18.75,
    lastDecision: 'hold',
    lastMeeting: '2024-01-26',
    nextMeeting: '2024-02-27',
    meetingsPerYear: 12,
    rateTrajectory: ['hold', 'hold', 'hike', 'hike', 'hike', 'hike'],
  },
  pk: {
    name: 'State Bank of Pakistan',
    policyRate: 22.00,
    previousRate: 22.00,
    lastDecision: 'hold',
    lastMeeting: '2024-01-29',
    nextMeeting: '2024-03-18',
    meetingsPerYear: 8,
    rateTrajectory: ['hold', 'hold', 'hike', 'hike', 'hike', 'hike'],
  },
  bd: {
    name: 'Bangladesh Bank',
    policyRate: 8.00,
    previousRate: 7.25,
    lastDecision: 'hike',
    lastMeeting: '2024-01-24',
    nextMeeting: '2024-03-28',
    meetingsPerYear: 6,
    rateTrajectory: ['hike', 'hike', 'hold', 'hold', 'hold', 'hold'],
  },
};

export const FOREX_DATA: Record<string, ForexDetail> = {
  us: { rate: 1.00, vsUSD: 1.00, change24h: 0.0, change1w: 0.1, change1m: 0.3, currencyCode: 'USD', currencyName: 'US Dollar' },
  cn: { rate: 7.19, vsUSD: 0.139, change24h: 0.15, change1w: -0.2, change1m: 0.8, currencyCode: 'CNY', currencyName: 'Chinese Yuan' },
  de: { rate: 0.92, vsUSD: 1.087, change24h: -0.08, change1w: 0.3, change1m: -0.5, currencyCode: 'EUR', currencyName: 'Euro' },
  jp: { rate: 150.2, vsUSD: 0.0067, change24h: -0.45, change1w: -1.2, change1m: -2.1, currencyCode: 'JPY', currencyName: 'Japanese Yen' },
  in: { rate: 83.1, vsUSD: 0.012, change24h: 0.05, change1w: -0.1, change1m: 0.2, currencyCode: 'INR', currencyName: 'Indian Rupee' },
  gb: { rate: 0.79, vsUSD: 1.266, change24h: -0.12, change1w: 0.4, change1m: -1.1, currencyCode: 'GBP', currencyName: 'British Pound' },
  fr: { rate: 0.92, vsUSD: 1.087, change24h: -0.08, change1w: 0.3, change1m: -0.5, currencyCode: 'EUR', currencyName: 'Euro' },
  br: { rate: 4.95, vsUSD: 0.202, change24h: 0.35, change1w: -0.8, change1m: 1.5, currencyCode: 'BRL', currencyName: 'Brazilian Real' },
  it: { rate: 0.92, vsUSD: 1.087, change24h: -0.08, change1w: 0.3, change1m: -0.5, currencyCode: 'EUR', currencyName: 'Euro' },
  ca: { rate: 1.35, vsUSD: 0.741, change24h: 0.08, change1w: -0.3, change1m: 0.5, currencyCode: 'CAD', currencyName: 'Canadian Dollar' },
  ru: { rate: 92.5, vsUSD: 0.0108, change24h: -0.25, change1w: -0.5, change1m: -3.2, currencyCode: 'RUB', currencyName: 'Russian Ruble' },
  kr: { rate: 1335, vsUSD: 0.00075, change24h: -0.15, change1w: -0.4, change1m: -1.8, currencyCode: 'KRW', currencyName: 'South Korean Won' },
  mx: { rate: 17.1, vsUSD: 0.0585, change24h: 0.12, change1w: -0.2, change1m: 0.9, currencyCode: 'MXN', currencyName: 'Mexican Peso' },
  au: { rate: 1.53, vsUSD: 0.654, change24h: -0.18, change1w: 0.2, change1m: -1.5, currencyCode: 'AUD', currencyName: 'Australian Dollar' },
  es: { rate: 0.92, vsUSD: 1.087, change24h: -0.08, change1w: 0.3, change1m: -0.5, currencyCode: 'EUR', currencyName: 'Euro' },
  id: { rate: 15600, vsUSD: 0.000064, change24h: 0.05, change1w: -0.1, change1m: 0.3, currencyCode: 'IDR', currencyName: 'Indonesian Rupiah' },
  sa: { rate: 3.75, vsUSD: 0.267, change24h: 0.0, change1w: 0.0, change1m: 0.0, currencyCode: 'SAR', currencyName: 'Saudi Riyal' },
  tr: { rate: 31.2, vsUSD: 0.032, change24h: -0.85, change1w: -2.1, change1m: -5.5, currencyCode: 'TRY', currencyName: 'Turkish Lira' },
  tw: { rate: 31.5, vsUSD: 0.0317, change24h: 0.02, change1w: -0.1, change1m: 0.1, currencyCode: 'TWD', currencyName: 'Taiwan Dollar' },
  ar: { rate: 820, vsUSD: 0.0012, change24h: -2.5, change1w: -8.0, change1m: -25.0, currencyCode: 'ARS', currencyName: 'Argentine Peso' },
  za: { rate: 18.9, vsUSD: 0.0529, change24h: 0.22, change1w: -0.5, change1m: 1.2, currencyCode: 'ZAR', currencyName: 'South African Rand' },
  ua: { rate: 38.2, vsUSD: 0.0262, change24h: -0.15, change1w: -0.3, change1m: -1.5, currencyCode: 'UAH', currencyName: 'Ukrainian Hryvnia' },
  il: { rate: 3.65, vsUSD: 0.274, change24h: -0.08, change1w: 0.1, change1m: -0.5, currencyCode: 'ILS', currencyName: 'Israeli Shekel' },
  ir: { rate: 42000, vsUSD: 0.000024, change24h: -1.5, change1w: -4.0, change1m: -12.0, currencyCode: 'IRR', currencyName: 'Iranian Rial' },
  ae: { rate: 3.67, vsUSD: 0.272, change24h: 0.0, change1w: 0.0, change1m: 0.0, currencyCode: 'AED', currencyName: 'UAE Dirham' },
  eg: { rate: 30.9, vsUSD: 0.0324, change24h: -0.5, change1w: -1.2, change1m: -3.5, currencyCode: 'EGP', currencyName: 'Egyptian Pound' },
  vn: { rate: 24500, vsUSD: 0.000041, change24h: 0.03, change1w: -0.1, change1m: 0.2, currencyCode: 'VND', currencyName: 'Vietnamese Dong' },
  pl: { rate: 4.02, vsUSD: 0.249, change24h: -0.12, change1w: 0.3, change1m: -0.8, currencyCode: 'PLN', currencyName: 'Polish Zloty' },
  ng: { rate: 1500, vsUSD: 0.00067, change24h: -1.2, change1w: -3.5, change1m: -8.0, currencyCode: 'NGN', currencyName: 'Nigerian Naira' },
  pk: { rate: 279, vsUSD: 0.0036, change24h: -0.35, change1w: -1.0, change1m: -2.5, currencyCode: 'PKR', currencyName: 'Pakistani Rupee' },
  bd: { rate: 109.5, vsUSD: 0.0091, change24h: 0.02, change1w: -0.1, change1m: 0.3, currencyCode: 'BDT', currencyName: 'Bangladeshi Taka' },
};

export const COMMODITY_DATA: Record<string, CommodityDependency> = {
  us: { oil: 8, gas: 4, food: 6, critical: false },
  cn: { oil: 15, gas: 10, food: 8, critical: false },
  de: { oil: 12, gas: 18, food: 7, critical: false },
  jp: { oil: 20, gas: 15, food: 12, critical: false },
  in: { oil: 25, gas: 8, food: 5, critical: false },
  gb: { oil: 10, gas: 15, food: 9, critical: false },
  fr: { oil: 11, gas: 14, food: 8, critical: false },
  br: { oil: 5, gas: 3, food: 4, critical: false },
  it: { oil: 13, gas: 16, food: 9, critical: false },
  ca: { oil: 8, gas: 5, food: 7, critical: false },
  ru: { oil: 35, gas: 25, food: 8, critical: true },
  kr: { oil: 22, gas: 18, food: 10, critical: false },
  mx: { oil: 12, gas: 6, food: 8, critical: false },
  au: { oil: 8, gas: 5, food: 6, critical: false },
  es: { oil: 14, gas: 12, food: 10, critical: false },
  id: { oil: 18, gas: 8, food: 12, critical: false },
  sa: { oil: 65, gas: 20, food: 15, critical: true },
  tr: { oil: 20, gas: 25, food: 8, critical: false },
  tw: { oil: 25, gas: 15, food: 10, critical: false },
  ar: { oil: 8, gas: 12, food: 5, critical: false },
  za: { oil: 15, gas: 3, food: 8, critical: false },
  ua: { oil: 5, gas: 30, food: 10, critical: true },
  il: { oil: 10, gas: 15, food: 12, critical: false },
  ir: { oil: 45, gas: 30, food: 15, critical: true },
  ae: { oil: 40, gas: 20, food: 18, critical: true },
  eg: { oil: 12, gas: 8, food: 20, critical: false },
  vn: { oil: 10, gas: 5, food: 8, critical: false },
  pl: { oil: 15, gas: 35, food: 8, critical: true },
  ng: { oil: 55, gas: 15, food: 12, critical: true },
  pk: { oil: 22, gas: 12, food: 15, critical: false },
  bd: { oil: 12, gas: 18, food: 18, critical: false },
};

export const CALENDAR_DATA: Record<string, CalendarEvent[]> = {
  us: [
    { date: '2024-03-12', type: 'cpi', name: 'CPI YoY', forecast: '3.1%', previous: '3.4%', importance: 'high' },
    { date: '2024-03-20', type: 'central_bank', name: 'FOMC Decision', forecast: 'Hold 5.50%', previous: '5.50%', importance: 'high' },
    { date: '2024-03-08', type: 'employment', name: 'Nonfarm Payrolls', forecast: '200K', previous: '353K', importance: 'high' },
    { date: '2024-03-28', type: 'gdp', name: 'Q4 GDP Final', forecast: '3.2%', previous: '3.3%', importance: 'medium' },
    { date: '2024-03-14', type: 'pmi', name: 'Manufacturing PMI', forecast: '47.8', previous: '47.6', importance: 'medium' },
  ],
  cn: [
    { date: '2024-03-09', type: 'cpi', name: 'CPI YoY', forecast: '0.1%', previous: '-0.8%', importance: 'high' },
    { date: '2024-03-15', type: 'central_bank', name: 'MLF Rate', forecast: '2.50%', previous: '2.50%', importance: 'medium' },
    { date: '2024-03-18', type: 'trade', name: 'Trade Balance', forecast: '$80B', previous: '$75B', importance: 'high' },
  ],
  de: [
    { date: '2024-03-07', type: 'central_bank', name: 'ECB Rate Decision', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'high' },
    { date: '2024-03-12', type: 'pmi', name: 'ZEW Economic Sentiment', forecast: '22.5', previous: '19.5', importance: 'medium' },
    { date: '2024-03-22', type: 'gdp', name: 'Q4 GDP Final', forecast: '-0.3%', previous: '-0.3%', importance: 'medium' },
  ],
  jp: [
    { date: '2024-03-19', type: 'central_bank', name: 'BoJ Decision', forecast: 'Hold -0.10%', previous: '-0.10%', importance: 'high' },
    { date: '2024-03-08', type: 'gdp', name: 'Q4 GDP Final', forecast: '1.9%', previous: '1.9%', importance: 'medium' },
    { date: '2024-03-22', type: 'cpi', name: 'CPI YoY', forecast: '2.8%', previous: '2.8%', importance: 'high' },
  ],
  in: [
    { date: '2024-03-12', type: 'cpi', name: 'CPI YoY', forecast: '5.2%', previous: '5.4%', importance: 'high' },
    { date: '2024-04-05', type: 'central_bank', name: 'RBI Rate Decision', forecast: 'Hold 6.50%', previous: '6.50%', importance: 'high' },
    { date: '2024-03-15', type: 'trade', name: 'Trade Balance', forecast: '-$18B', previous: '-$19B', importance: 'medium' },
  ],
  gb: [
    { date: '2024-03-21', type: 'central_bank', name: 'BoE Rate Decision', forecast: 'Hold 5.25%', previous: '5.25%', importance: 'high' },
    { date: '2024-03-13', type: 'cpi', name: 'CPI YoY', forecast: '3.8%', previous: '4.0%', importance: 'high' },
    { date: '2024-03-28', type: 'gdp', name: 'Q4 GDP Final', forecast: '0.1%', previous: '0.1%', importance: 'medium' },
  ],
  fr: [
    { date: '2024-03-07', type: 'central_bank', name: 'ECB Rate Decision', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'high' },
    { date: '2024-03-14', type: 'pmi', name: 'Manufacturing PMI', forecast: '47.2', previous: '46.5', importance: 'medium' },
  ],
  br: [
    { date: '2024-03-20', type: 'central_bank', name: 'Copom Rate', forecast: '10.25%', previous: '10.75%', importance: 'high' },
    { date: '2024-03-12', type: 'cpi', name: 'CPI YoY', forecast: '4.2%', previous: '4.6%', importance: 'high' },
  ],
  it: [
    { date: '2024-03-07', type: 'central_bank', name: 'ECB Rate Decision', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'high' },
    { date: '2024-03-15', type: 'gdp', name: 'Q4 GDP Final', forecast: '0.7%', previous: '0.7%', importance: 'medium' },
  ],
  ca: [
    { date: '2024-03-06', type: 'central_bank', name: 'BoC Rate Decision', forecast: 'Hold 5.00%', previous: '5.00%', importance: 'high' },
    { date: '2024-03-19', type: 'cpi', name: 'CPI YoY', forecast: '2.8%', previous: '2.4%', importance: 'high' },
  ],
  ru: [
    { date: '2024-03-22', type: 'central_bank', name: 'CBR Rate', forecast: 'Hold 16.00%', previous: '16.00%', importance: 'high' },
    { date: '2024-03-08', type: 'gdp', name: 'Q4 GDP Final', forecast: '3.6%', previous: '3.6%', importance: 'medium' },
  ],
  kr: [
    { date: '2024-04-11', type: 'central_bank', name: 'BOK Rate', forecast: 'Hold 3.50%', previous: '3.50%', importance: 'high' },
    { date: '2024-03-05', type: 'cpi', name: 'CPI YoY', forecast: '2.8%', previous: '2.9%', importance: 'high' },
  ],
  mx: [
    { date: '2024-03-21', type: 'central_bank', name: 'Banxico Rate', forecast: 'Hold 11.25%', previous: '11.25%', importance: 'high' },
    { date: '2024-03-07', type: 'cpi', name: 'CPI YoY', forecast: '4.3%', previous: '4.7%', importance: 'high' },
  ],
  au: [
    { date: '2024-03-19', type: 'central_bank', name: 'RBA Rate', forecast: 'Hold 4.35%', previous: '4.35%', importance: 'high' },
    { date: '2024-03-13', type: 'employment', name: 'Employment Change', forecast: '+25K', previous: '+15K', importance: 'high' },
  ],
  es: [
    { date: '2024-03-07', type: 'central_bank', name: 'ECB Rate Decision', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'high' },
    { date: '2024-03-14', type: 'cpi', name: 'CPI YoY', forecast: '2.8%', previous: '2.4%', importance: 'high' },
  ],
  id: [
    { date: '2024-03-21', type: 'central_bank', name: 'BI Rate', forecast: 'Hold 6.00%', previous: '6.00%', importance: 'high' },
    { date: '2024-03-01', type: 'trade', name: 'Trade Balance', forecast: '$1.5B', previous: '$2.0B', importance: 'medium' },
  ],
  sa: [
    { date: '2024-03-20', type: 'central_bank', name: 'SAMA Rate', forecast: 'Hold 6.00%', previous: '6.00%', importance: 'medium' },
    { date: '2024-03-10', type: 'gdp', name: 'Q4 GDP', forecast: '0.8%', previous: '0.8%', importance: 'medium' },
  ],
  tr: [
    { date: '2024-02-22', type: 'central_bank', name: 'CBRT Rate', forecast: 'Hike 47.50%', previous: '45.00%', importance: 'high' },
    { date: '2024-03-05', type: 'cpi', name: 'CPI YoY', forecast: '55.0%', previous: '53.9%', importance: 'high' },
  ],
  tw: [
    { date: '2024-03-21', type: 'central_bank', name: 'CBC Rate', forecast: 'Hold 1.875%', previous: '1.875%', importance: 'medium' },
    { date: '2024-03-08', type: 'trade', name: 'Export Orders', forecast: '+5%', previous: '+3%', importance: 'medium' },
  ],
  ar: [
    { date: '2024-02-15', type: 'central_bank', name: 'BCRA Rate', forecast: 'Cut 85%', previous: '100%', importance: 'high' },
    { date: '2024-03-12', type: 'cpi', name: 'CPI YoY', forecast: '200%', previous: '211%', importance: 'high' },
  ],
  za: [
    { date: '2024-03-28', type: 'central_bank', name: 'SARB Rate', forecast: 'Hold 8.25%', previous: '8.25%', importance: 'high' },
    { date: '2024-03-20', type: 'cpi', name: 'CPI YoY', forecast: '5.3%', previous: '5.1%', importance: 'high' },
  ],
  ua: [
    { date: '2024-03-15', type: 'central_bank', name: 'NBU Rate', forecast: 'Cut 14.00%', previous: '14.50%', importance: 'high' },
    { date: '2024-03-05', type: 'gdp', name: 'Q4 GDP', forecast: '5.0%', previous: '5.0%', importance: 'medium' },
  ],
  il: [
    { date: '2024-02-26', type: 'central_bank', name: 'BoI Rate', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'high' },
    { date: '2024-03-15', type: 'cpi', name: 'CPI YoY', forecast: '2.6%', previous: '2.5%', importance: 'high' },
  ],
  ir: [
    { date: '2024-03-15', type: 'central_bank', name: 'CBI Rate', forecast: 'Hold 23%', previous: '23%', importance: 'medium' },
    { date: '2024-03-10', type: 'cpi', name: 'CPI YoY', forecast: '42%', previous: '40%', importance: 'high' },
  ],
  ae: [
    { date: '2024-03-21', type: 'central_bank', name: 'CBUAE Rate', forecast: 'Hold 5.40%', previous: '5.40%', importance: 'medium' },
    { date: '2024-03-05', type: 'trade', name: 'Non-Oil Trade', forecast: '+8%', previous: '+7%', importance: 'medium' },
  ],
  eg: [
    { date: '2024-03-28', type: 'central_bank', name: 'CBE Rate', forecast: 'Hold 22%', previous: '22%', importance: 'high' },
    { date: '2024-03-10', type: 'cpi', name: 'CPI YoY', forecast: '35%', previous: '33%', importance: 'high' },
  ],
  vn: [
    { date: '2024-03-22', type: 'central_bank', name: 'SBV Rate', forecast: 'Hold 4.50%', previous: '4.50%', importance: 'medium' },
    { date: '2024-03-08', type: 'trade', name: 'Export Growth', forecast: '+12%', previous: '+10%', importance: 'high' },
  ],
  pl: [
    { date: '2024-03-06', type: 'central_bank', name: 'NBP Rate', forecast: 'Hold 5.75%', previous: '5.75%', importance: 'high' },
    { date: '2024-03-14', type: 'cpi', name: 'CPI YoY', forecast: '4.0%', previous: '3.9%', importance: 'high' },
  ],
  ng: [
    { date: '2024-02-27', type: 'central_bank', name: 'CBN Rate', forecast: 'Hold 18.75%', previous: '18.75%', importance: 'high' },
    { date: '2024-03-15', type: 'cpi', name: 'CPI YoY', forecast: '26%', previous: '24%', importance: 'high' },
  ],
  pk: [
    { date: '2024-03-18', type: 'central_bank', name: 'SBP Rate', forecast: 'Hold 22%', previous: '22%', importance: 'high' },
    { date: '2024-03-01', type: 'cpi', name: 'CPI YoY', forecast: '24%', previous: '23%', importance: 'high' },
  ],
  bd: [
    { date: '2024-03-28', type: 'central_bank', name: 'BB Rate', forecast: 'Hold 8%', previous: '8%', importance: 'medium' },
    { date: '2024-03-05', type: 'trade', name: 'Export Growth', forecast: '+6%', previous: '+5%', importance: 'medium' },
  ],
};
