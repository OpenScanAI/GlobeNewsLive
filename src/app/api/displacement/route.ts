import { NextResponse } from 'next/server';

interface DisplacementFlow {
  id: string;
  type: 'refugee' | 'idp' | 'returnee' | 'asylum_seeker';
  origin: string;
  originLat: number;
  originLon: number;
  destination: string;
  destLat: number;
  destLon: number;
  count: number;
  cause: string;
  status: 'active' | 'ongoing' | 'resolved';
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdate: string;
  source: string;
}

interface DisplacementHotspot {
  id: string;
  location: string;
  country: string;
  lat: number;
  lon: number;
  idpCount: number;
  refugeeCount: number;
  totalDisplaced: number;
  cause: string;
  severity: 'critical' | 'high' | 'moderate';
  trend: 'worsening' | 'stable' | 'improving';
  lastUpdate: string;
}

// Major displacement flows
function getDisplacementFlows(): DisplacementFlow[] {
  return [
    {
      id: 'flow-1',
      type: 'refugee',
      origin: 'Ukraine',
      originLat: 48.38,
      originLon: 31.17,
      destination: 'Poland',
      destLat: 52.23,
      destLon: 21.01,
      count: 1500000,
      cause: 'Russian invasion',
      status: 'ongoing',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
      source: 'UNHCR',
    },
    {
      id: 'flow-2',
      type: 'refugee',
      origin: 'Syria',
      originLat: 34.80,
      originLon: 38.99,
      destination: 'Turkey',
      destLat: 39.93,
      destLon: 32.86,
      count: 3600000,
      cause: 'Civil war',
      status: 'ongoing',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
      source: 'UNHCR',
    },
    {
      id: 'flow-3',
      type: 'idp',
      origin: 'Sudan',
      originLat: 15.50,
      originLon: 32.53,
      destination: 'Chad',
      destLat: 12.13,
      destLon: 15.05,
      count: 800000,
      cause: 'RSF-SAF conflict',
      status: 'active',
      trend: 'increasing',
      lastUpdate: new Date().toISOString(),
      source: 'UNHCR',
    },
    {
      id: 'flow-4',
      type: 'refugee',
      origin: 'Gaza',
      originLat: 31.50,
      originLon: 34.47,
      destination: 'Egypt',
      destLat: 31.25,
      destLon: 32.28,
      count: 100000,
      cause: 'Israel-Hamas conflict',
      status: 'active',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
      source: 'UNRWA',
    },
    {
      id: 'flow-5',
      type: 'idp',
      origin: 'Myanmar',
      originLat: 21.91,
      originLon: 95.96,
      destination: 'Internal',
      destLat: 19.76,
      destLon: 96.09,
      count: 2000000,
      cause: 'Military coup / civil war',
      status: 'ongoing',
      trend: 'increasing',
      lastUpdate: new Date().toISOString(),
      source: 'OCHA',
    },
    {
      id: 'flow-6',
      type: 'refugee',
      origin: 'Venezuela',
      originLat: 10.49,
      originLon: -66.88,
      destination: 'Colombia',
      destLat: 4.71,
      destLon: -74.07,
      count: 2900000,
      cause: 'Economic/political crisis',
      status: 'ongoing',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
      source: 'UNHCR',
    },
  ];
}

// Displacement hotspots
function getDisplacementHotspots(): DisplacementHotspot[] {
  return [
    {
      id: 'hot-1',
      location: 'Darfur',
      country: 'Sudan',
      lat: 13.45,
      lon: 25.35,
      idpCount: 3500000,
      refugeeCount: 800000,
      totalDisplaced: 4300000,
      cause: 'RSF-SAF conflict, ethnic violence',
      severity: 'critical',
      trend: 'worsening',
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'hot-2',
      location: 'Eastern Ukraine',
      country: 'Ukraine',
      lat: 48.59,
      lon: 37.99,
      idpCount: 5900000,
      refugeeCount: 6400000,
      totalDisplaced: 12300000,
      cause: 'Russian invasion',
      severity: 'critical',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'hot-3',
      location: 'Gaza Strip',
      country: 'Palestine',
      lat: 31.45,
      lon: 34.40,
      idpCount: 1900000,
      refugeeCount: 100000,
      totalDisplaced: 2000000,
      cause: 'Israel-Hamas conflict',
      severity: 'critical',
      trend: 'worsening',
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'hot-4',
      location: 'Rakhine State',
      country: 'Myanmar',
      lat: 20.15,
      lon: 92.90,
      idpCount: 600000,
      refugeeCount: 1100000,
      totalDisplaced: 1700000,
      cause: 'Rohingya persecution',
      severity: 'high',
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
    },
    {
      id: 'hot-5',
      location: 'Tigray',
      country: 'Ethiopia',
      lat: 14.12,
      lon: 38.77,
      idpCount: 2100000,
      refugeeCount: 60000,
      totalDisplaced: 2160000,
      cause: 'Civil war aftermath',
      severity: 'high',
      trend: 'improving',
      lastUpdate: new Date().toISOString(),
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'flows') {
    return NextResponse.json({ flows: getDisplacementFlows() });
  }
  if (type === 'hotspots') {
    return NextResponse.json({ hotspots: getDisplacementHotspots() });
  }

  // Summary stats
  const flows = getDisplacementFlows();
  const hotspots = getDisplacementHotspots();
  const totalDisplaced = hotspots.reduce((sum, h) => sum + h.totalDisplaced, 0);

  return NextResponse.json({
    flows,
    hotspots,
    summary: {
      totalDisplaced,
      activeFlows: flows.filter(f => f.status === 'active').length,
      criticalHotspots: hotspots.filter(h => h.severity === 'critical').length,
    },
    sources: ['UNHCR', 'UNRWA', 'OCHA', 'IOM'],
  });
}
