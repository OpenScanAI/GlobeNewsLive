import { NextResponse } from 'next/server';

interface MilitaryAircraft {
  id: string;
  callsign: string;
  type: string;
  country: string;
  altitude: number;
  speed: number;
  heading: number;
  lat: number;
  lon: number;
  squawk: string;
  lastSeen: string;
  category: 'recon' | 'tanker' | 'transport' | 'fighter' | 'bomber' | 'awacs' | 'drone' | 'other';
}

// Known military callsign prefixes
const MILITARY_CALLSIGNS: Record<string, { country: string; type: string; category: MilitaryAircraft['category'] }> = {
  // US Reconnaissance
  'FORTE': { country: 'USA', type: 'RQ-4 Global Hawk', category: 'recon' },
  'JAKE': { country: 'USA', type: 'E-8 JSTARS', category: 'recon' },
  'HOMER': { country: 'USA', type: 'RC-135', category: 'recon' },
  'VIPER': { country: 'USA', type: 'RC-135V/W Rivet Joint', category: 'recon' },
  'COBRA': { country: 'USA', type: 'RC-135S Cobra Ball', category: 'recon' },
  // US Tankers
  'LAGR': { country: 'USA', type: 'KC-135 Stratotanker', category: 'tanker' },
  'NCHO': { country: 'USA', type: 'KC-135 Stratotanker', category: 'tanker' },
  'PEARL': { country: 'USA', type: 'KC-46 Pegasus', category: 'tanker' },
  // US AWACS
  'MAGIC': { country: 'USA', type: 'E-3 Sentry AWACS', category: 'awacs' },
  'DARKSTAR': { country: 'USA', type: 'E-3 Sentry AWACS', category: 'awacs' },
  // US Transport
  'REACH': { country: 'USA', type: 'C-17 Globemaster', category: 'transport' },
  'RCH': { country: 'USA', type: 'C-17 Globemaster', category: 'transport' },
  // UK
  'RRR': { country: 'UK', type: 'RAF Aircraft', category: 'other' },
  'ASCOT': { country: 'UK', type: 'RAF Transport', category: 'transport' },
  // NATO
  'NATO': { country: 'NATO', type: 'NATO Aircraft', category: 'awacs' },
  // Drones
  'REAPER': { country: 'USA', type: 'MQ-9 Reaper', category: 'drone' },
  'PRED': { country: 'USA', type: 'MQ-1 Predator', category: 'drone' },
};

// Simulated military aircraft tracking (in production, use ADS-B Exchange API)
function getMilitaryAircraft(): MilitaryAircraft[] {
  const now = new Date();
  
  // Current known areas of interest
  const aircraft: MilitaryAircraft[] = [
    // Black Sea region
    {
      id: 'FORTE11',
      callsign: 'FORTE11',
      type: 'RQ-4 Global Hawk',
      country: 'USA',
      altitude: 55000,
      speed: 310,
      heading: 45,
      lat: 44.2 + Math.random() * 0.5,
      lon: 35.8 + Math.random() * 0.5,
      squawk: '0000',
      lastSeen: now.toISOString(),
      category: 'recon',
    },
    // Eastern Med
    {
      id: 'HOMER71',
      callsign: 'HOMER71',
      type: 'RC-135V Rivet Joint',
      country: 'USA',
      altitude: 32000,
      speed: 420,
      heading: 90,
      lat: 34.5 + Math.random() * 0.3,
      lon: 33.2 + Math.random() * 0.3,
      squawk: '0000',
      lastSeen: now.toISOString(),
      category: 'recon',
    },
    // Gulf region
    {
      id: 'LAGR234',
      callsign: 'LAGR234',
      type: 'KC-135 Stratotanker',
      country: 'USA',
      altitude: 28000,
      speed: 450,
      heading: 180,
      lat: 27.3 + Math.random() * 0.2,
      lon: 51.2 + Math.random() * 0.2,
      squawk: '1234',
      lastSeen: now.toISOString(),
      category: 'tanker',
    },
    // Red Sea
    {
      id: 'REAPER21',
      callsign: 'REAPER21',
      type: 'MQ-9 Reaper',
      country: 'USA',
      altitude: 25000,
      speed: 180,
      heading: 270,
      lat: 15.8 + Math.random() * 0.3,
      lon: 42.5 + Math.random() * 0.3,
      squawk: '0000',
      lastSeen: now.toISOString(),
      category: 'drone',
    },
    // NATO AWACS - Poland
    {
      id: 'NATO01',
      callsign: 'NATO01',
      type: 'E-3A Sentry AWACS',
      country: 'NATO',
      altitude: 35000,
      speed: 380,
      heading: 90,
      lat: 51.8 + Math.random() * 0.2,
      lon: 20.5 + Math.random() * 0.2,
      squawk: '7700',
      lastSeen: now.toISOString(),
      category: 'awacs',
    },
    // Pacific - near Taiwan
    {
      id: 'FORTE12',
      callsign: 'FORTE12',
      type: 'RQ-4 Global Hawk',
      country: 'USA',
      altitude: 58000,
      speed: 290,
      heading: 315,
      lat: 24.2 + Math.random() * 0.3,
      lon: 121.5 + Math.random() * 0.3,
      squawk: '0000',
      lastSeen: now.toISOString(),
      category: 'recon',
    },
  ];
  
  return aircraft;
}

// Cache
let cache: { aircraft: MilitaryAircraft[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ aircraft: cache.aircraft, cached: true });
    }

    const aircraft = getMilitaryAircraft();
    
    cache = { aircraft, timestamp: Date.now() };
    return NextResponse.json({
      aircraft,
      cached: false,
      callsigns: MILITARY_CALLSIGNS,
      disclaimer: 'Simulated data for demonstration. In production, uses ADS-B Exchange API.',
    });
  } catch (error) {
    console.error('Military aircraft API error:', error);
    return NextResponse.json({ aircraft: [], error: 'Failed to fetch aircraft' });
  }
}
