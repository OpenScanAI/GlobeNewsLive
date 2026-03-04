// Global Trade Routes - Connection mesh like worldmonitor.app

export interface TradeHub {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  tradeVolume: string; // Daily volume
  type: 'major' | 'regional' | 'emerging';
}

export interface TradeRoute {
  from: string;
  to: string;
  volume: number; // Relative 1-100
  type: 'maritime' | 'overland' | 'digital';
  active: boolean;
  risk?: 'low' | 'medium' | 'high' | 'critical';
}

// Major Global trade hubs
export const TRADE_HUBS: TradeHub[] = [
  // Asia Pacific
  { id: 'singapore', name: 'Singapore', lat: 1.3521, lon: 103.8198, region: 'ASIA', tradeVolume: '$2.4B', type: 'major' },
  { id: 'hong-kong', name: 'Hong Kong', lat: 22.3193, lon: 114.1694, region: 'ASIA', tradeVolume: '$1.8B', type: 'major' },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lon: 139.6503, region: 'ASIA', tradeVolume: '$1.2B', type: 'major' },
  { id: 'shanghai', name: 'Shanghai', lat: 31.2304, lon: 121.4737, region: 'ASIA', tradeVolume: '$890M', type: 'major' },
  { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lon: 72.8777, region: 'ASIA', tradeVolume: '$650M', type: 'regional' },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lon: 55.2708, region: 'MENA', tradeVolume: '$1.1B', type: 'major' },
  { id: 'seoul', name: 'Seoul', lat: 37.5665, lon: 126.9780, region: 'ASIA', tradeVolume: '$420M', type: 'regional' },
  { id: 'taipei', name: 'Taipei', lat: 25.0330, lon: 121.5654, region: 'ASIA', tradeVolume: '$380M', type: 'regional' },
  
  // Europe
  { id: 'london', name: 'London', lat: 51.5074, lon: -0.1278, region: 'EUROPE', tradeVolume: '$1.5B', type: 'major' },
  { id: 'frankfurt', name: 'Frankfurt', lat: 50.1109, lon: 8.6821, region: 'EUROPE', tradeVolume: '$680M', type: 'regional' },
  { id: 'zurich', name: 'Zürich', lat: 47.3769, lon: 8.5417, region: 'EUROPE', tradeVolume: '$520M', type: 'regional' },
  { id: 'paris', name: 'Paris', lat: 48.8566, lon: 2.3522, region: 'EUROPE', tradeVolume: '$310M', type: 'regional' },
  { id: 'amsterdam', name: 'Amsterdam', lat: 52.3676, lon: 4.9041, region: 'EUROPE', tradeVolume: '$280M', type: 'regional' },
  
  // Americas
  { id: 'new-york', name: 'New York', lat: 40.7128, lon: -74.0060, region: 'NORTH AMERICA', tradeVolume: '$2.1B', type: 'major' },
  { id: 'chicago', name: 'Chicago', lat: 41.8781, lon: -87.6298, region: 'NORTH AMERICA', tradeVolume: '$450M', type: 'regional' },
  { id: 'miami', name: 'Miami', lat: 25.7617, lon: -80.1918, region: 'NORTH AMERICA', tradeVolume: '$320M', type: 'regional' },
  { id: 'sao-paulo', name: 'São Paulo', lat: -23.5505, lon: -46.6333, region: 'SOUTH AMERICA', tradeVolume: '$180M', type: 'emerging' },
  { id: 'mexico-city', name: 'Mexico City', lat: 19.4326, lon: -99.1332, region: 'NORTH AMERICA', tradeVolume: '$120M', type: 'emerging' },
  
  // Africa & Middle East
  { id: 'johannesburg', name: 'Johannesburg', lat: -26.2041, lon: 28.0473, region: 'AFRICA', tradeVolume: '$95M', type: 'emerging' },
  { id: 'lagos', name: 'Lagos', lat: 6.5244, lon: 3.3792, region: 'AFRICA', tradeVolume: '$75M', type: 'emerging' },
  { id: 'cairo', name: 'Cairo', lat: 30.0444, lon: 31.2357, region: 'MENA', tradeVolume: '$85M', type: 'emerging' },
  { id: 'riyadh', name: 'Riyadh', lat: 24.7136, lon: 46.6753, region: 'MENA', tradeVolume: '$210M', type: 'regional' },
  
  // Oceania
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lon: 151.2093, region: 'OCEANIA', tradeVolume: '$340M', type: 'regional' },
];

// Trade route connections (bidirectional)
export const TRADE_ROUTES: TradeRoute[] = [
  // Major Asia-Europe corridor
  { from: 'singapore', to: 'hong-kong', volume: 95, type: 'maritime', active: true },
  { from: 'singapore', to: 'dubai', volume: 85, type: 'maritime', active: true, risk: 'high' },
  { from: 'hong-kong', to: 'shanghai', volume: 90, type: 'maritime', active: true },
  { from: 'hong-kong', to: 'tokyo', volume: 80, type: 'maritime', active: true },
  { from: 'dubai', to: 'london', volume: 75, type: 'maritime', active: true },
  { from: 'dubai', to: 'mumbai', volume: 70, type: 'maritime', active: true },
  
  // Asia-Americas
  { from: 'singapore', to: 'new-york', volume: 65, type: 'digital', active: true },
  { from: 'tokyo', to: 'new-york', volume: 60, type: 'digital', active: true },
  { from: 'hong-kong', to: 'new-york', volume: 70, type: 'digital', active: true },
  { from: 'shanghai', to: 'chicago', volume: 45, type: 'maritime', active: true },
  
  // Europe internal
  { from: 'london', to: 'frankfurt', volume: 80, type: 'digital', active: true },
  { from: 'london', to: 'zurich', volume: 65, type: 'digital', active: true },
  { from: 'london', to: 'amsterdam', volume: 55, type: 'digital', active: true },
  { from: 'frankfurt', to: 'zurich', volume: 50, type: 'digital', active: true },
  { from: 'paris', to: 'london', volume: 45, type: 'digital', active: true },
  
  // Europe-Americas
  { from: 'london', to: 'new-york', volume: 90, type: 'digital', active: true },
  { from: 'frankfurt', to: 'new-york', volume: 55, type: 'digital', active: true },
  
  // Americas internal
  { from: 'new-york', to: 'chicago', volume: 70, type: 'digital', active: true },
  { from: 'new-york', to: 'miami', volume: 50, type: 'digital', active: true },
  { from: 'miami', to: 'sao-paulo', volume: 35, type: 'digital', active: true },
  { from: 'new-york', to: 'mexico-city', volume: 30, type: 'digital', active: true },
  
  // Emerging markets
  { from: 'dubai', to: 'mumbai', volume: 65, type: 'digital', active: true },
  { from: 'singapore', to: 'mumbai', volume: 55, type: 'maritime', active: true },
  { from: 'london', to: 'johannesburg', volume: 25, type: 'digital', active: true },
  { from: 'dubai', to: 'cairo', volume: 30, type: 'digital', active: true },
  { from: 'dubai', to: 'riyadh', volume: 45, type: 'digital', active: true },
  { from: 'singapore', to: 'sydney', volume: 40, type: 'digital', active: true },
  { from: 'hong-kong', to: 'taipei', volume: 60, type: 'digital', active: true },
  { from: 'tokyo', to: 'seoul', volume: 55, type: 'digital', active: true },
  { from: 'lagos', to: 'london', volume: 20, type: 'digital', active: true },
  { from: 'johannesburg', to: 'dubai', volume: 25, type: 'digital', active: true },
  
  // Critical chokepoint routes (Red Sea, Hormuz)
  { from: 'singapore', to: 'dubai', volume: 85, type: 'maritime', active: true, risk: 'critical' },
  { from: 'mumbai', to: 'cairo', volume: 30, type: 'maritime', active: false, risk: 'critical' }, // Red Sea disruption
];

// Get route coordinates for drawing lines
export function getRouteCoordinates(route: TradeRoute): [[number, number], [number, number]] | null {
  const fromHub = TRADE_HUBS.find(h => h.id === route.from);
  const toHub = TRADE_HUBS.find(h => h.id === route.to);
  
  if (!fromHub || !toHub) return null;
  
  return [
    [fromHub.lon, fromHub.lat],
    [toHub.lon, toHub.lat]
  ];
}

// Get all routes as GeoJSON for MapLibre
export function getRoutesGeoJSON() {
  const features = TRADE_ROUTES
    .map(route => {
      const coords = getRouteCoordinates(route);
      if (!coords) return null;
      
      return {
        type: 'Feature' as const,
        properties: {
          volume: route.volume,
          type: route.type,
          active: route.active,
          risk: route.risk || 'low',
          from: route.from,
          to: route.to,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: coords,
        },
      };
    })
    .filter(Boolean);
  
  return {
    type: 'FeatureCollection' as const,
    features,
  };
}

// Get hubs as GeoJSON
export function getHubsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: TRADE_HUBS.map(hub => ({
      type: 'Feature' as const,
      properties: {
        id: hub.id,
        name: hub.name,
        region: hub.region,
        tradeVolume: hub.tradeVolume,
        type: hub.type,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [hub.lon, hub.lat],
      },
    })),
  };
}

// Event cluster regions
export const CLUSTER_REGIONS: { name: string; lat: number; lon: number; radius: number }[] = [
  { name: 'EUROPE', lat: 50, lon: 10, radius: 15 },
  { name: 'ASIA', lat: 35, lon: 105, radius: 25 },
  { name: 'NORTH AMERICA', lat: 40, lon: -100, radius: 20 },
  { name: 'SOUTH AMERICA', lat: -15, lon: -60, radius: 15 },
  { name: 'AFRICA', lat: 5, lon: 20, radius: 20 },
  { name: 'OCEANIA', lat: -25, lon: 135, radius: 15 },
];
