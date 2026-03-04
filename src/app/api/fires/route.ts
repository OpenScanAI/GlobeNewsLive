import { NextResponse } from 'next/server';

interface FireEvent {
  id: string;
  lat: number;
  lon: number;
  brightness: number;
  confidence: number;
  frp: number; // Fire Radiative Power
  timestamp: string;
  satellite: string;
  country?: string;
}

// NASA FIRMS API (free, no key required for basic access)
async function fetchNASAFires(): Promise<FireEvent[]> {
  try {
    // FIRMS CSV endpoint - last 24h, MODIS + VIIRS
    const url = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv/VALID_KEY/VIIRS_SNPP_NRT/world/1';
    
    // For demo, use curated active fire data
    const fires: FireEvent[] = [
      // California wildfires
      { id: 'fire-1', lat: 34.05, lon: -118.25, brightness: 340, confidence: 95, frp: 45.2, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'USA' },
      // Amazon
      { id: 'fire-2', lat: -3.47, lon: -62.21, brightness: 320, confidence: 85, frp: 32.1, timestamp: new Date().toISOString(), satellite: 'MODIS', country: 'Brazil' },
      // Indonesia
      { id: 'fire-3', lat: -2.21, lon: 113.91, brightness: 315, confidence: 80, frp: 28.5, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Indonesia' },
      // Australia
      { id: 'fire-4', lat: -33.87, lon: 151.21, brightness: 310, confidence: 75, frp: 22.3, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Australia' },
      // Siberia
      { id: 'fire-5', lat: 62.03, lon: 129.73, brightness: 335, confidence: 90, frp: 41.0, timestamp: new Date().toISOString(), satellite: 'MODIS', country: 'Russia' },
      // Africa
      { id: 'fire-6', lat: -8.84, lon: 13.23, brightness: 325, confidence: 88, frp: 35.2, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Angola' },
      { id: 'fire-7', lat: 12.37, lon: -1.52, brightness: 318, confidence: 82, frp: 29.8, timestamp: new Date().toISOString(), satellite: 'MODIS', country: 'Burkina Faso' },
      // Middle East (conflict-related)
      { id: 'fire-8', lat: 31.52, lon: 34.45, brightness: 380, confidence: 98, frp: 65.4, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Palestine' },
      { id: 'fire-9', lat: 33.89, lon: 35.50, brightness: 355, confidence: 92, frp: 48.2, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Lebanon' },
      // Ukraine
      { id: 'fire-10', lat: 48.59, lon: 37.99, brightness: 375, confidence: 96, frp: 58.9, timestamp: new Date().toISOString(), satellite: 'VIIRS', country: 'Ukraine' },
    ];

    return fires;
  } catch (error) {
    console.error('NASA FIRMS fetch error:', error);
    return [];
  }
}

// Cache
let cache: { fires: FireEvent[]; timestamp: number } | null = null;
const CACHE_TTL = 300 * 1000; // 5 minutes

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ fires: cache.fires, cached: true });
    }

    const fires = await fetchNASAFires();
    cache = { fires, timestamp: Date.now() };

    return NextResponse.json({
      fires,
      cached: false,
      count: fires.length,
      source: 'NASA FIRMS (simulated)',
    });
  } catch (error) {
    console.error('Fires API error:', error);
    return NextResponse.json({ fires: [], error: 'Failed to fetch fire data' });
  }
}
