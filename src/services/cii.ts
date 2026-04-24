/**
 * Country Instability Index (CII) Service
 * Calculates and provides country-level instability scores
 */

export interface CountryInstabilityData {
  code: string;
  name: string;
  cii: number; // 0-100 scale
  trend: 'rising' | 'falling' | 'stable';
  change7d: number;
  change30d: number;
  activeConflicts: number;
  recentEvents: number;
  riskFactors: RiskFactor[];
  lastUpdated: Date;
}

export interface RiskFactor {
  type: 'conflict' | 'political' | 'economic' | 'social' | 'environmental' | 'humanitarian';
  severity: number; // 0-10
  description: string;
}

// Base CII data (would be dynamically calculated in production)
const BASE_CII_DATA: Record<string, CountryInstabilityData> = {
  SY: {
    code: 'SY',
    name: 'Syria',
    cii: 95,
    trend: 'rising',
    change7d: 2,
    change30d: 5,
    activeConflicts: 3,
    recentEvents: 45,
    riskFactors: [
      { type: 'conflict', severity: 10, description: 'Ongoing civil war' },
      { type: 'political', severity: 9, description: 'Government instability' },
      { type: 'economic', severity: 8, description: 'Economic collapse' },
    ],
    lastUpdated: new Date(),
  },
  YE: {
    code: 'YE',
    name: 'Yemen',
    cii: 92,
    trend: 'rising',
    change7d: 1,
    change30d: 3,
    activeConflicts: 2,
    recentEvents: 38,
    riskFactors: [
      { type: 'conflict', severity: 10, description: 'Civil war and humanitarian crisis' },
      { type: 'environmental', severity: 8, description: 'Water scarcity' },
      { type: 'economic', severity: 9, description: 'Economic collapse' },
    ],
    lastUpdated: new Date(),
  },
  SD: {
    code: 'SD',
    name: 'Sudan',
    cii: 90,
    trend: 'rising',
    change7d: 5,
    change30d: 15,
    activeConflicts: 2,
    recentEvents: 52,
    riskFactors: [
      { type: 'conflict', severity: 10, description: 'Civil war' },
      { type: 'political', severity: 9, description: 'Military coup aftermath' },
      { type: 'humanitarian', severity: 10, description: 'Humanitarian crisis' },
    ],
    lastUpdated: new Date(),
  },
  AF: {
    code: 'AF',
    name: 'Afghanistan',
    cii: 88,
    trend: 'stable',
    change7d: 0,
    change30d: -2,
    activeConflicts: 1,
    recentEvents: 28,
    riskFactors: [
      { type: 'political', severity: 9, description: 'Taliban governance' },
      { type: 'economic', severity: 9, description: 'Economic crisis' },
      { type: 'social', severity: 8, description: 'Human rights concerns' },
    ],
    lastUpdated: new Date(),
  },
  MM: {
    code: 'MM',
    name: 'Myanmar',
    cii: 85,
    trend: 'rising',
    change7d: 2,
    change30d: 8,
    activeConflicts: 2,
    recentEvents: 35,
    riskFactors: [
      { type: 'conflict', severity: 9, description: 'Civil war' },
      { type: 'political', severity: 9, description: 'Military junta' },
      { type: 'economic', severity: 7, description: 'Economic decline' },
    ],
    lastUpdated: new Date(),
  },
  IQ: {
    code: 'IQ',
    name: 'Iraq',
    cii: 84,
    trend: 'stable',
    change7d: 0,
    change30d: 1,
    activeConflicts: 1,
    recentEvents: 22,
    riskFactors: [
      { type: 'political', severity: 8, description: 'Political instability' },
      { type: 'conflict', severity: 7, description: 'Militant activity' },
      { type: 'economic', severity: 6, description: 'Economic challenges' },
    ],
    lastUpdated: new Date(),
  },
  UA: {
    code: 'UA',
    name: 'Ukraine',
    cii: 82,
    trend: 'stable',
    change7d: 0,
    change30d: 2,
    activeConflicts: 1,
    recentEvents: 48,
    riskFactors: [
      { type: 'conflict', severity: 10, description: 'Full-scale war' },
      { type: 'economic', severity: 7, description: 'War economy' },
      { type: 'environmental', severity: 6, description: 'Infrastructure damage' },
    ],
    lastUpdated: new Date(),
  },
  SO: {
    code: 'SO',
    name: 'Somalia',
    cii: 80,
    trend: 'stable',
    change7d: -1,
    change30d: -2,
    activeConflicts: 2,
    recentEvents: 18,
    riskFactors: [
      { type: 'conflict', severity: 9, description: 'Insurgency' },
      { type: 'political', severity: 7, description: 'Political fragility' },
      { type: 'environmental', severity: 8, description: 'Drought and famine' },
    ],
    lastUpdated: new Date(),
  },
  CD: {
    code: 'CD',
    name: 'DR Congo',
    cii: 78,
    trend: 'rising',
    change7d: 1,
    change30d: 4,
    activeConflicts: 3,
    recentEvents: 25,
    riskFactors: [
      { type: 'conflict', severity: 8, description: 'Multiple armed groups' },
      { type: 'humanitarian', severity: 9, description: 'Displacement crisis' },
      { type: 'economic', severity: 6, description: 'Resource conflict' },
    ],
    lastUpdated: new Date(),
  },
  ML: {
    code: 'ML',
    name: 'Mali',
    cii: 77,
    trend: 'rising',
    change7d: 2,
    change30d: 5,
    activeConflicts: 2,
    recentEvents: 20,
    riskFactors: [
      { type: 'conflict', severity: 8, description: 'Jihadist insurgency' },
      { type: 'political', severity: 8, description: 'Military junta' },
      { type: 'social', severity: 6, description: 'Ethnic tensions' },
    ],
    lastUpdated: new Date(),
  },
  BF: {
    code: 'BF',
    name: 'Burkina Faso',
    cii: 76,
    trend: 'rising',
    change7d: 1,
    change30d: 3,
    activeConflicts: 1,
    recentEvents: 15,
    riskFactors: [
      { type: 'conflict', severity: 8, description: 'Jihadist insurgency' },
      { type: 'political', severity: 7, description: 'Coup aftermath' },
    ],
    lastUpdated: new Date(),
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    cii: 75,
    trend: 'stable',
    change7d: 0,
    change30d: 1,
    activeConflicts: 2,
    recentEvents: 30,
    riskFactors: [
      { type: 'conflict', severity: 7, description: 'Boko Haram insurgency' },
      { type: 'economic', severity: 6, description: 'Economic inequality' },
      { type: 'social', severity: 7, description: 'Ethnic/religious tensions' },
    ],
    lastUpdated: new Date(),
  },
  ET: {
    code: 'ET',
    name: 'Ethiopia',
    cii: 74,
    trend: 'falling',
    change7d: -2,
    change30d: -5,
    activeConflicts: 1,
    recentEvents: 12,
    riskFactors: [
      { type: 'conflict', severity: 6, description: 'Regional conflicts' },
      { type: 'political', severity: 6, description: 'Political transition' },
      { type: 'environmental', severity: 7, description: 'Drought conditions' },
    ],
    lastUpdated: new Date(),
  },
  PK: {
    code: 'PK',
    name: 'Pakistan',
    cii: 72,
    trend: 'stable',
    change7d: 0,
    change30d: 1,
    activeConflicts: 1,
    recentEvents: 24,
    riskFactors: [
      { type: 'political', severity: 7, description: 'Political instability' },
      { type: 'economic', severity: 7, description: 'Economic crisis' },
      { type: 'conflict', severity: 5, description: 'Border tensions' },
    ],
    lastUpdated: new Date(),
  },
  LY: {
    code: 'LY',
    name: 'Libya',
    cii: 71,
    trend: 'stable',
    change7d: 0,
    change30d: 0,
    activeConflicts: 1,
    recentEvents: 10,
    riskFactors: [
      { type: 'political', severity: 8, description: 'Political division' },
      { type: 'conflict', severity: 6, description: 'Militia activity' },
    ],
    lastUpdated: new Date(),
  },
  VE: {
    code: 'VE',
    name: 'Venezuela',
    cii: 70,
    trend: 'stable',
    change7d: 0,
    change30d: -1,
    activeConflicts: 0,
    recentEvents: 8,
    riskFactors: [
      { type: 'economic', severity: 9, description: 'Economic collapse' },
      { type: 'political', severity: 7, description: 'Political crisis' },
      { type: 'social', severity: 8, description: 'Humanitarian crisis' },
    ],
    lastUpdated: new Date(),
  },
  IR: {
    code: 'IR',
    name: 'Iran',
    cii: 68,
    trend: 'rising',
    change7d: 3,
    change30d: 8,
    activeConflicts: 2,
    recentEvents: 42,
    riskFactors: [
      { type: 'conflict', severity: 8, description: 'Regional tensions' },
      { type: 'political', severity: 7, description: 'Domestic protests' },
      { type: 'economic', severity: 7, description: 'Economic sanctions' },
    ],
    lastUpdated: new Date(),
  },
  KP: {
    code: 'KP',
    name: 'North Korea',
    cii: 67,
    trend: 'stable',
    change7d: 0,
    change30d: 0,
    activeConflicts: 0,
    recentEvents: 5,
    riskFactors: [
      { type: 'political', severity: 9, description: 'Authoritarian regime' },
      { type: 'conflict', severity: 6, description: 'Nuclear tensions' },
      { type: 'economic', severity: 8, description: 'Economic isolation' },
    ],
    lastUpdated: new Date(),
  },
  RU: {
    code: 'RU',
    name: 'Russia',
    cii: 65,
    trend: 'rising',
    change7d: 1,
    change30d: 3,
    activeConflicts: 1,
    recentEvents: 35,
    riskFactors: [
      { type: 'conflict', severity: 8, description: 'Ukraine invasion' },
      { type: 'economic', severity: 7, description: 'Sanctions impact' },
      { type: 'political', severity: 6, description: 'International isolation' },
    ],
    lastUpdated: new Date(),
  },
  BY: {
    code: 'BY',
    name: 'Belarus',
    cii: 64,
    trend: 'stable',
    change7d: 0,
    change30d: 0,
    activeConflicts: 0,
    recentEvents: 4,
    riskFactors: [
      { type: 'political', severity: 7, description: 'Authoritarian regime' },
      { type: 'economic', severity: 6, description: 'Sanctions' },
    ],
    lastUpdated: new Date(),
  },
};

// Get CII for a specific country
export function getCountryCII(countryCode: string): CountryInstabilityData | null {
  return BASE_CII_DATA[countryCode.toUpperCase()] || null;
}

// Get all CII data
export function getAllCII(): CountryInstabilityData[] {
  return Object.values(BASE_CII_DATA);
}

// Get CII by risk level
export function getCIIByRiskLevel(
  level: 'critical' | 'high' | 'medium' | 'low'
): CountryInstabilityData[] {
  const thresholds = { critical: 80, high: 60, medium: 40, low: 0 };
  const upperThresholds = { critical: 100, high: 80, medium: 60, low: 40 };
  
  return Object.values(BASE_CII_DATA).filter(
    c => c.cii >= thresholds[level] && c.cii < upperThresholds[level]
  );
}

// Get trending countries (rising CII)
export function getTrendingCountries(limit: number = 5): CountryInstabilityData[] {
  return Object.values(BASE_CII_DATA)
    .filter(c => c.trend === 'rising')
    .sort((a, b) => b.change30d - a.change30d)
    .slice(0, limit);
}

// Get choropleth data for map
export function getChoroplethData(): Record<string, number> {
  const data: Record<string, number> = {};
  
  for (const [code, country] of Object.entries(BASE_CII_DATA)) {
    data[code] = country.cii;
  }
  
  return data;
}

// Calculate CII color for choropleth
export function getCIIColor(score: number): string {
  if (score >= 80) return '#7f1d1d'; // Dark red
  if (score >= 60) return '#dc2626'; // Red
  if (score >= 40) return '#f59e0b'; // Orange
  if (score >= 20) return '#eab308'; // Yellow
  return '#22c55e'; // Green
}

// Get CII trend indicator
export function getCIITrendIcon(trend: string): string {
  switch (trend) {
    case 'rising': return '↗️';
    case 'falling': return '↘️';
    default: return '➡️';
  }
}
