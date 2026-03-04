import type { Signal } from '@/types';

export type MapRenderer = 'flat' | 'globe';
export type MapVariant = 'full' | 'tech' | 'finance' | 'happy';

export interface LayerDefinition {
  key: string;
  icon: string;
  label: string;
  renderers: MapRenderer[];
  variant: MapVariant[];
}

// 45+ Map Layer Definitions
export const LAYER_REGISTRY: Record<string, LayerDefinition> = {
  // Geopolitical Layers
  iranAttacks: {
    key: 'iranAttacks',
    icon: '🎯',
    label: 'Iran Attacks',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  hotspots: {
    key: 'hotspots',
    icon: '🎯',
    label: 'Intel Hotspots',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  conflicts: {
    key: 'conflicts',
    icon: '⚔️',
    label: 'Conflict Zones',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  geopoliticalBoundaries: {
    key: 'geopoliticalBoundaries',
    icon: '⚖️',
    label: 'Geopolitical Boundaries',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Military Layers
  bases: {
    key: 'bases',
    icon: '🏛️',
    label: 'Military Bases',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  nuclear: {
    key: 'nuclear',
    icon: '☢️',
    label: 'Nuclear Sites',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  irradiators: {
    key: 'irradiators',
    icon: '⚠️',
    label: 'Gamma Irradiators',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  spaceports: {
    key: 'spaceports',
    icon: '🚀',
    label: 'Spaceports',
    renderers: ['flat', 'globe'],
    variant: ['full', 'tech'],
  },
  military: {
    key: 'military',
    icon: '✈️',
    label: 'Military Activity',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Infrastructure Layers
  cables: {
    key: 'cables',
    icon: '🔌',
    label: 'Undersea Cables',
    renderers: ['flat', 'globe'],
    variant: ['full', 'tech', 'finance'],
  },
  pipelines: {
    key: 'pipelines',
    icon: '🚒',
    label: 'Pipelines',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  datacenters: {
    key: 'datacenters',
    icon: '💻',
    label: 'AI Data Centers',
    renderers: ['flat', 'globe'],
    variant: ['full', 'tech'],
  },
  
  // Transportation Layers
  ais: {
    key: 'ais',
    icon: '🚢',
    label: 'Ship Traffic',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  tradeRoutes: {
    key: 'tradeRoutes',
    icon: '⚓',
    label: 'Trade Routes',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  flights: {
    key: 'flights',
    icon: '✈️',
    label: 'Flight Delays',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Event Layers
  protests: {
    key: 'protests',
    icon: '📢',
    label: 'Protests',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  ucdpEvents: {
    key: 'ucdpEvents',
    icon: '⚔️',
    label: 'Armed Conflict Events',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  displacement: {
    key: 'displacement',
    icon: '👥',
    label: 'Displacement Flows',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Environmental Layers
  climate: {
    key: 'climate',
    icon: '🌫️',
    label: 'Climate Anomalies',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  weather: {
    key: 'weather',
    icon: '⛈️',
    label: 'Weather Alerts',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  natural: {
    key: 'natural',
    icon: '🍃',
    label: 'Natural Events',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  fires: {
    key: 'fires',
    icon: '🔥',
    label: 'Fires',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Cyber/Security Layers
  outages: {
    key: 'outages',
    icon: '📡',
    label: 'Internet Outages',
    renderers: ['flat', 'globe'],
    variant: ['full', 'tech', 'finance'],
  },
  cyberThreats: {
    key: 'cyberThreats',
    icon: '🛡️',
    label: 'Cyber Threats',
    renderers: ['flat', 'globe'],
    variant: ['full', 'tech'],
  },
  gpsJamming: {
    key: 'gpsJamming',
    icon: '📡',
    label: 'GPS Jamming',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Economic Layers
  economic: {
    key: 'economic',
    icon: '💰',
    label: 'Economic Centers',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  minerals: {
    key: 'minerals',
    icon: '💎',
    label: 'Critical Minerals',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  waterways: {
    key: 'waterways',
    icon: '⚓',
    label: 'Strategic Waterways',
    renderers: ['flat', 'globe'],
    variant: ['full', 'finance'],
  },
  
  // Intelligence Layers
  ciiChoropleth: {
    key: 'ciiChoropleth',
    icon: '🌎',
    label: 'CII Instability',
    renderers: ['flat'],
    variant: ['full'],
  },
  dayNight: {
    key: 'dayNight',
    icon: '🌓',
    label: 'Day/Night',
    renderers: ['flat'],
    variant: ['full', 'tech', 'finance'],
  },
  sanctions: {
    key: 'sanctions',
    icon: '🚷',
    label: 'Sanctions',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
  
  // Tech Variant Layers
  startupHubs: {
    key: 'startupHubs',
    icon: '🚀',
    label: 'Startup Hubs',
    renderers: ['flat', 'globe'],
    variant: ['tech'],
  },
  techHQs: {
    key: 'techHQs',
    icon: '🏗️',
    label: 'Tech HQs',
    renderers: ['flat', 'globe'],
    variant: ['tech'],
  },
  accelerators: {
    key: 'accelerators',
    icon: '⚡',
    label: 'Accelerators',
    renderers: ['flat', 'globe'],
    variant: ['tech'],
  },
  cloudRegions: {
    key: 'cloudRegions',
    icon: '☁️',
    label: 'Cloud Regions',
    renderers: ['flat', 'globe'],
    variant: ['tech'],
  },
  techEvents: {
    key: 'techEvents',
    icon: '📅',
    label: 'Tech Events',
    renderers: ['flat', 'globe'],
    variant: ['tech'],
  },
  
  // Finance Variant Layers
  stockExchanges: {
    key: 'stockExchanges',
    icon: '🏛️',
    label: 'Stock Exchanges',
    renderers: ['flat', 'globe'],
    variant: ['finance'],
  },
  financialCenters: {
    key: 'financialCenters',
    icon: '💰',
    label: 'Financial Centers',
    renderers: ['flat', 'globe'],
    variant: ['finance'],
  },
  centralBanks: {
    key: 'centralBanks',
    icon: '🏤',
    label: 'Central Banks',
    renderers: ['flat', 'globe'],
    variant: ['finance'],
  },
  commodityHubs: {
    key: 'commodityHubs',
    icon: '📦',
    label: 'Commodity Hubs',
    renderers: ['flat', 'globe'],
    variant: ['finance'],
  },
  gulfInvestments: {
    key: 'gulfInvestments',
    icon: '🌐',
    label: 'GCC Investments',
    renderers: ['flat', 'globe'],
    variant: ['finance'],
  },
  
  // Happy Variant Layers
  positiveEvents: {
    key: 'positiveEvents',
    icon: '🌟',
    label: 'Positive Events',
    renderers: ['flat', 'globe'],
    variant: ['happy'],
  },
  kindness: {
    key: 'kindness',
    icon: '💚',
    label: 'Acts of Kindness',
    renderers: ['flat', 'globe'],
    variant: ['happy'],
  },
  happiness: {
    key: 'happiness',
    icon: '😊',
    label: 'World Happiness',
    renderers: ['flat', 'globe'],
    variant: ['happy'],
  },
  speciesRecovery: {
    key: 'speciesRecovery',
    icon: '🐾',
    label: 'Species Recovery',
    renderers: ['flat', 'globe'],
    variant: ['happy'],
  },
  renewableInstallations: {
    key: 'renewableInstallations',
    icon: '⚡',
    label: 'Clean Energy',
    renderers: ['flat', 'globe'],
    variant: ['happy'],
  },
};

// Layer order by variant
export const VARIANT_LAYER_ORDER: Record<MapVariant, string[]> = {
  full: [
    'iranAttacks', 'hotspots', 'conflicts', 'geopoliticalBoundaries',
    'bases', 'nuclear', 'irradiators', 'spaceports',
    'cables', 'pipelines', 'datacenters', 'military',
    'ais', 'tradeRoutes', 'flights', 'protests',
    'ucdpEvents', 'displacement', 'climate', 'weather',
    'outages', 'cyberThreats', 'natural', 'fires',
    'waterways', 'economic', 'minerals', 'gpsJamming',
    'ciiChoropleth', 'dayNight', 'sanctions',
  ],
  tech: [
    'startupHubs', 'techHQs', 'accelerators', 'cloudRegions',
    'datacenters', 'cables', 'outages', 'cyberThreats',
    'techEvents', 'natural', 'fires', 'dayNight',
  ],
  finance: [
    'stockExchanges', 'financialCenters', 'centralBanks', 'commodityHubs',
    'gulfInvestments', 'tradeRoutes', 'cables', 'pipelines',
    'outages', 'weather', 'economic', 'waterways',
    'natural', 'cyberThreats', 'dayNight',
  ],
  happy: [
    'positiveEvents', 'kindness', 'happiness',
    'speciesRecovery', 'renewableInstallations',
  ],
};

export function getLayersForVariant(variant: MapVariant, renderer: MapRenderer): LayerDefinition[] {
  const keys = VARIANT_LAYER_ORDER[variant] ?? VARIANT_LAYER_ORDER.full;
  return keys
    .map(k => LAYER_REGISTRY[k])
    .filter(d => d && d.renderers.includes(renderer));
}

export function getAllLayers(): LayerDefinition[] {
  return Object.values(LAYER_REGISTRY);
}

export function getLayersByVariant(variant: MapVariant): LayerDefinition[] {
  return Object.values(LAYER_REGISTRY).filter(l => l.variant.includes(variant));
}

// Military bases data
export const MILITARY_BASES = [
  { name: 'Al Udeid Air Base', op: 'US', lat: 25.12, lon: 51.31, type: 'air' },
  { name: 'Camp Humphreys', op: 'US', lat: 36.96, lon: 127.03, type: 'army' },
  { name: 'Ramstein', op: 'US', lat: 49.44, lon: 7.60, type: 'air' },
  { name: 'Diego Garcia', op: 'US/UK', lat: -7.32, lon: 72.42, type: 'navy' },
  { name: 'Incirlik', op: 'US/TR', lat: 37.00, lon: 35.43, type: 'air' },
  { name: 'Yokosuka', op: 'US', lat: 35.29, lon: 139.67, type: 'navy' },
  { name: 'Kadena', op: 'US', lat: 26.35, lon: 127.77, type: 'air' },
  { name: 'Bahrain NSA', op: 'US', lat: 26.23, lon: 50.62, type: 'navy' },
  { name: 'Camp Lemonnier', op: 'US', lat: 11.55, lon: 43.15, type: 'joint' },
  { name: 'Thule', op: 'US', lat: 76.53, lon: -68.70, type: 'space' },
  { name: 'Guantanamo Bay', op: 'US', lat: 19.90, lon: -75.10, type: 'navy' },
  { name: 'Aviano', op: 'US', lat: 46.03, lon: 12.60, type: 'air' },
  { name: 'RAF Lakenheath', op: 'US/UK', lat: 52.41, lon: 0.56, type: 'air' },
  { name: 'Osan', op: 'US', lat: 37.09, lon: 127.03, type: 'air' },
  { name: 'Misawa', op: 'US', lat: 40.70, lon: 141.37, type: 'air' },
];

// Strategic chokepoints
export const STRATEGIC_CHOKEPOINTS = [
  { name: 'Strait of Hormuz', lat: 26.57, lon: 56.25, oilMbpd: 21, risk: 'high' },
  { name: 'Strait of Malacca', lat: 2.50, lon: 101.80, tradePct: 25, risk: 'medium' },
  { name: 'Suez Canal', lat: 30.46, lon: 32.35, tradePct: 12, risk: 'medium' },
  { name: 'Bab el-Mandeb', lat: 12.58, lon: 43.33, oilMbpd: 6.2, risk: 'high' },
  { name: 'Turkish Straits', lat: 41.12, lon: 29.07, oilMbpd: 2.4, risk: 'medium' },
  { name: 'Panama Canal', lat: 9.08, lon: -79.68, tradePct: 5, risk: 'low' },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, tradePct: 50, risk: 'high' },
  { name: 'GIUK Gap', lat: 63.0, lon: -20.0, military: true, risk: 'medium' },
];

// Active conflicts
export const ACTIVE_CONFLICTS = [
  { name: 'Ukraine', lat: 48.38, lon: 37.62, type: 'war', intensity: 'high' },
  { name: 'Gaza', lat: 31.50, lon: 34.47, type: 'war', intensity: 'high' },
  { name: 'Sudan', lat: 15.50, lon: 32.53, type: 'civil war', intensity: 'high' },
  { name: 'Myanmar', lat: 19.75, lon: 96.10, type: 'civil war', intensity: 'medium' },
  { name: 'Syria', lat: 35.20, lon: 38.80, type: 'civil war', intensity: 'medium' },
  { name: 'Yemen', lat: 15.35, lon: 44.21, type: 'civil war', intensity: 'medium' },
  { name: 'Ethiopia (Amhara)', lat: 11.59, lon: 37.39, type: 'insurgency', intensity: 'medium' },
  { name: 'Sahel', lat: 14.50, lon: 0.00, type: 'insurgency', intensity: 'medium' },
  { name: 'DRC', lat: -1.65, lon: 29.22, type: 'insurgency', intensity: 'medium' },
  { name: 'Haiti', lat: 18.97, lon: -72.28, type: 'gang violence', intensity: 'high' },
];

// Nuclear sites
export const NUCLEAR_SITES = [
  { name: 'Natanz', lat: 33.72, lon: 51.72, country: 'Iran', type: 'enrichment' },
  { name: 'Fordow', lat: 34.88, lon: 50.99, country: 'Iran', type: 'enrichment' },
  { name: 'Bushehr', lat: 28.83, lon: 50.89, country: 'Iran', type: 'power' },
  { name: 'Arak', lat: 34.37, lon: 49.24, country: 'Iran', type: 'research' },
  { name: 'Isfahan', lat: 32.65, lon: 51.68, country: 'Iran', type: 'conversion' },
];

// Data centers
export const DATA_CENTERS = [
  { name: 'Northern Virginia', lat: 38.8, lon: -77.3, country: 'USA', provider: 'Multiple' },
  { name: 'Dublin', lat: 53.35, lon: -6.26, country: 'Ireland', provider: 'Multiple' },
  { name: 'Frankfurt', lat: 50.11, lon: 8.68, country: 'Germany', provider: 'Multiple' },
  { name: 'Singapore', lat: 1.35, lon: 103.82, country: 'Singapore', provider: 'Multiple' },
  { name: 'Tokyo', lat: 35.68, lon: 139.76, country: 'Japan', provider: 'Multiple' },
  { name: 'Sydney', lat: -33.87, lon: 151.21, country: 'Australia', provider: 'Multiple' },
  { name: 'Sao Paulo', lat: -23.55, lon: -46.63, country: 'Brazil', provider: 'Multiple' },
  { name: 'Mumbai', lat: 19.08, lon: 72.88, country: 'India', provider: 'Multiple' },
];

// Undersea cables
export const UNDERSEA_CABLES = [
  { name: 'SEA-ME-WE 3', from: 'Asia', to: 'Europe', lat: 25, lon: 60 },
  { name: 'SEA-ME-WE 4', from: 'Singapore', to: 'France', lat: 15, lon: 65 },
  { name: 'SEA-ME-WE 5', from: 'Singapore', to: 'France', lat: 12, lon: 70 },
  { name: 'AAG', from: 'USA', to: 'Asia', lat: 35, lon: -150 },
  { name: 'Marea', from: 'USA', to: 'Spain', lat: 45, lon: -45 },
  { name: 'TGN-EA', from: 'India', to: 'France', lat: 10, lon: 50 },
  { name: 'FALCON', from: 'India', to: 'Middle East', lat: 20, lon: 60 },
  { name: 'IMEWE', from: 'India', to: 'France', lat: 18, lon: 55 },
];

// Stock exchanges
export const STOCK_EXCHANGES = [
  { name: 'NYSE', lat: 40.71, lon: -74.01, country: 'USA', timezone: 'EST' },
  { name: 'NASDAQ', lat: 40.71, lon: -74.01, country: 'USA', timezone: 'EST' },
  { name: 'LSE', lat: 51.51, lon: -0.09, country: 'UK', timezone: 'GMT' },
  { name: 'TSE', lat: 35.68, lon: 139.76, country: 'Japan', timezone: 'JST' },
  { name: 'SSE', lat: 31.23, lon: 121.47, country: 'China', timezone: 'CST' },
  { name: 'HKEX', lat: 22.28, lon: 114.16, country: 'Hong Kong', timezone: 'HKT' },
  { name: 'Euronext', lat: 48.86, lon: 2.35, country: 'France', timezone: 'CET' },
  { name: 'Deutsche Börse', lat: 50.11, lon: 8.68, country: 'Germany', timezone: 'CET' },
];

// Cloud regions
export const CLOUD_REGIONS = [
  { provider: 'AWS', region: 'us-east-1', lat: 38.8, lon: -77.3, location: 'N. Virginia' },
  { provider: 'AWS', region: 'us-west-2', lat: 45.5, lon: -122.7, location: 'Oregon' },
  { provider: 'AWS', region: 'eu-west-1', lat: 53.35, lon: -6.26, location: 'Dublin' },
  { provider: 'AWS', region: 'ap-southeast-1', lat: 1.35, lon: 103.82, location: 'Singapore' },
  { provider: 'Azure', region: 'East US', lat: 38.8, lon: -77.3, location: 'Virginia' },
  { provider: 'Azure', region: 'West Europe', lat: 52.37, lon: 4.90, location: 'Netherlands' },
  { provider: 'GCP', region: 'us-central1', lat: 41.9, lon: -87.6, location: 'Iowa' },
  { provider: 'GCP', region: 'europe-west1', lat: 50.85, lon: 4.35, location: 'Belgium' },
];

// Country Instability Index data (sample)
export const COUNTRY_INSTABILITY_INDEX: Record<string, number> = {
  SY: 95, YE: 92, SD: 90, AF: 88, MM: 85, IQ: 84, UA: 82, SO: 80,
  CD: 78, ML: 77, BF: 76, NG: 75, ET: 74, PK: 72, LY: 71, VE: 70,
  IR: 68, KP: 67, RU: 65, BY: 64, ZW: 63, LK: 62, BO: 61, HN: 60,
  // ... more countries
};
