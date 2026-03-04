import { NextResponse } from 'next/server';

interface InternetOutage {
  id: string;
  country: string;
  countryCode: string;
  region?: string;
  provider?: string;
  severity: 'partial' | 'major' | 'total';
  startTime: string;
  endTime?: string;
  affectedUsers: number;
  source: string;
  lat: number;
  lon: number;
  cause?: string;
}

interface GPSJamming {
  id: string;
  location: string;
  lat: number;
  lon: number;
  radius: number; // km
  severity: 'low' | 'moderate' | 'severe';
  affectedSystems: string[];
  firstDetected: string;
  source: string;
}

// Current internet outages and GPS jamming events
function getOutages(): InternetOutage[] {
  return [
    {
      id: 'out-1',
      country: 'Iran',
      countryCode: 'IR',
      severity: 'partial',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      affectedUsers: 5000000,
      source: 'NetBlocks',
      lat: 35.69,
      lon: 51.39,
      cause: 'Government-imposed throttling',
    },
    {
      id: 'out-2',
      country: 'Russia',
      countryCode: 'RU',
      region: 'Belgorod Oblast',
      severity: 'partial',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      affectedUsers: 200000,
      source: 'Cloudflare Radar',
      lat: 50.60,
      lon: 36.58,
      cause: 'Infrastructure damage',
    },
    {
      id: 'out-3',
      country: 'Sudan',
      countryCode: 'SD',
      severity: 'major',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      affectedUsers: 10000000,
      source: 'IODA',
      lat: 15.50,
      lon: 32.53,
      cause: 'Conflict-related infrastructure damage',
    },
    {
      id: 'out-4',
      country: 'Myanmar',
      countryCode: 'MM',
      severity: 'partial',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      affectedUsers: 3000000,
      source: 'OONI',
      lat: 16.87,
      lon: 96.20,
      cause: 'Military junta restrictions',
    },
  ];
}

function getGPSJamming(): GPSJamming[] {
  return [
    {
      id: 'gps-1',
      location: 'Eastern Mediterranean',
      lat: 34.50,
      lon: 33.00,
      radius: 350,
      severity: 'severe',
      affectedSystems: ['Aviation', 'Maritime', 'GPS'],
      firstDetected: new Date(Date.now() - 86400000 * 30).toISOString(),
      source: 'OPSGROUP',
    },
    {
      id: 'gps-2',
      location: 'Baltic Sea',
      lat: 55.00,
      lon: 20.00,
      radius: 200,
      severity: 'moderate',
      affectedSystems: ['Aviation', 'GPS'],
      firstDetected: new Date(Date.now() - 86400000 * 60).toISOString(),
      source: 'Eurocontrol',
    },
    {
      id: 'gps-3',
      location: 'Black Sea',
      lat: 43.50,
      lon: 34.00,
      radius: 400,
      severity: 'severe',
      affectedSystems: ['Aviation', 'Maritime', 'GPS', 'ADS-B'],
      firstDetected: new Date(Date.now() - 86400000 * 90).toISOString(),
      source: 'OPSGROUP',
    },
    {
      id: 'gps-4',
      location: 'Persian Gulf',
      lat: 26.50,
      lon: 52.00,
      radius: 250,
      severity: 'moderate',
      affectedSystems: ['Maritime', 'GPS'],
      firstDetected: new Date(Date.now() - 86400000 * 14).toISOString(),
      source: 'US Maritime Advisory',
    },
    {
      id: 'gps-5',
      location: 'Sea of Japan',
      lat: 38.50,
      lon: 131.00,
      radius: 150,
      severity: 'low',
      affectedSystems: ['GPS'],
      firstDetected: new Date(Date.now() - 86400000 * 7).toISOString(),
      source: 'Japan Coast Guard',
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'gps') {
    return NextResponse.json({
      jamming: getGPSJamming(),
      count: getGPSJamming().length,
    });
  }

  if (type === 'internet') {
    return NextResponse.json({
      outages: getOutages(),
      count: getOutages().length,
    });
  }

  // Return both
  return NextResponse.json({
    outages: getOutages(),
    gpsJamming: getGPSJamming(),
    sources: ['NetBlocks', 'Cloudflare Radar', 'IODA', 'OONI', 'OPSGROUP', 'Eurocontrol'],
  });
}
