export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type SignalCategory = 
  | 'conflict' 
  | 'military' 
  | 'diplomacy' 
  | 'cyber' 
  | 'disaster' 
  | 'economy' 
  | 'politics' 
  | 'terrorism'
  | 'protest'
  | 'infrastructure';

export interface Signal {
  id: string;
  title: string;
  severity: Severity;
  category: SignalCategory;
  source: string;
  sourceUrl?: string;
  timeAgo: string;
  timestamp: Date;
  lat?: number;
  lon?: number;
  summary?: string;
  region?: string;
  // AI metadata
  entities?: string[];
  sentimentScore?: number;
  relatedSignals?: string[];
}

export interface MarketData {
  name: string;
  symbol: string;
  value: string;
  change: string;
  changePercent: string;
  direction: 'up' | 'down';
  price?: number;
  volume?: number;
  high24h?: number;
  low24h?: number;
  type?: 'equity' | 'crypto' | 'forex' | 'commodity' | 'bond' | 'index';
}

export interface PredictionMarket {
  id: string;
  question: string;
  probability: number;
  change24h: number;
  volume?: number;
  source: 'Polymarket' | 'Kalshi';
  category: string;
}

export interface ConflictMarker {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: 'conflict' | 'military' | 'protest' | 'disaster' | 'infrastructure';
  severity: Severity;
  description?: string;
  timestamp: Date;
}

export interface CountryRisk {
  code: string;
  name: string;
  cii: number; // Country Instability Index 0-100
  trend: 'rising' | 'falling' | 'stable';
  activeConflicts: number;
  change7d?: number;
  change30d?: number;
  riskFactors?: RiskFactor[];
}

export interface RiskFactor {
  type: 'conflict' | 'political' | 'economic' | 'social' | 'environmental' | 'humanitarian';
  severity: number;
  description: string;
}

export type ThreatLevel = 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';

export interface DashboardState {
  threatLevel: ThreatLevel;
  activeConflicts: number;
  militaryAlerts: number;
  lastUpdate: Date;
  timeFilter: '1h' | '6h' | '24h' | '48h' | '7d';
  activeLayers: string[];
}

export interface GeoFeature {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  properties: Record<string, string>;
  layer: string;
}

export interface MapLayer {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
  renderers: ('flat' | 'globe')[];
}

export interface AISynthesis {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  sources: string[];
}

export interface AIDeduction {
  deduction: string;
  reasoning: string;
  confidence: number;
  relatedEvents: string[];
}

export type Language = 
  | 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru' | 'pt'
  | 'it' | 'nl' | 'tr' | 'pl' | 'sv' | 'hi' | 'vi' | 'th' | 'he' | 'el';

export interface Translation {
  [key: string]: string | Translation;
}
