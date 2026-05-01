import { NextResponse } from 'next/server';
import { ACTIVE_CONFLICTS } from '@/lib/feeds';
import { MissileEvent } from '@/types';

export const revalidate = 60;

type SourceMeta = {
  source: MissileEvent['source'];
  fetchedAt: string;
  acledAvailable: boolean;
  gdeltAvailable: boolean;
  fallback: boolean;
  count: number;
};

interface AcledEvent {
  event_id_cnty?: string;
  event_id_no_cnty?: string | number;
  event_date?: string;
  sub_event_type?: string;
  country?: string;
  admin1?: string;
  location?: string;
  latitude?: string | number;
  longitude?: string | number;
  fatalities?: string | number;
  notes?: string;
}

interface AcledResponse {
  data?: AcledEvent[];
}

interface GdeltGeoFeature {
  name?: string;
  country?: string;
  adm1?: string;
  lat?: number | string;
  long?: number | string;
  lon?: number | string;
  geolat?: number | string;
  geolong?: number | string;
  count?: number | string;
}

interface GdeltGeoResponse {
  features?: GdeltGeoFeature[];
}

const MISSILE_SUB_EVENTS = ['Air/drone strike', 'Missile attack', 'Shelling/artillery'];

const REGION_ORIGINS: Record<string, [number, number]> = {
  Ukraine: [48.86, 31.7],
  Gaza: [31.78, 35.2],
  Sudan: [15.65, 30.6],
  Myanmar: [21.92, 95.95],
  Syria: [34.8, 36.3],
  Yemen: [15.7, 43.8],
  'Ethiopia (Amhara)': [9.15, 40.49],
  Sahel: [13.51, 2.11],
  DRC: [-1.68, 28.88],
  Haiti: [18.54, -72.34],
};

function toNumber(value: string | number | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function jitter(value: number, seed: number, scale: number): number {
  const x = Math.sin(seed * 9301 + value * 49297) * 233280;
  return value + (x - Math.floor(x) - 0.5) * scale;
}

function classifyType(text: string): MissileEvent['type'] {
  const value = text.toLowerCase();
  if (value.includes('intercept')) return 'INTERCEPTION';
  if (value.includes('drone') || value.includes('uav')) return 'DRONE';
  if (value.includes('air')) return 'AIRSTRIKE';
  if (value.includes('shell') || value.includes('artillery')) return 'ARTILLERY';
  if (value.includes('cruise')) return 'CRUISE';
  if (value.includes('ballistic') || value.includes('missile')) return 'SRBM';
  return 'AIRSTRIKE';
}

function performanceForType(type: MissileEvent['type']): Pick<MissileEvent, 'speed' | 'altitude' | 'warhead'> {
  switch (type) {
    case 'ICBM':
      return { speed: 7000, altitude: 1200, warhead: 'strategic' };
    case 'MRBM':
      return { speed: 4200, altitude: 600, warhead: 'conventional' };
    case 'SRBM':
      return { speed: 1800, altitude: 120, warhead: 'conventional' };
    case 'CRUISE':
      return { speed: 880, altitude: 0.25, warhead: 'conventional' };
    case 'DRONE':
      return { speed: 180, altitude: 0.12, warhead: 'loitering munition' };
    case 'ARTILLERY':
      return { speed: 900, altitude: 12, warhead: 'high explosive' };
    case 'INTERCEPTION':
      return { speed: 3000, altitude: 80, warhead: 'kinetic interceptor' };
    case 'AIRSTRIKE':
    default:
      return { speed: 950, altitude: 10, warhead: 'precision munition' };
  }
}

function buildEvent(params: {
  id: string;
  type: MissileEvent['type'];
  target: [number, number];
  label: string;
  source: MissileEvent['source'];
  timestamp: string;
  region: string;
  fatalities: number;
  confidence: number;
  status?: MissileEvent['status'];
  seed: number;
}): MissileEvent {
  const baseOrigin = REGION_ORIGINS[params.region] ?? [
    params.target[0] + (params.seed % 2 === 0 ? 1.2 : -1.2),
    params.target[1] + (params.seed % 3 === 0 ? 1.8 : -1.8),
  ];
  const performance = performanceForType(params.type);

  return {
    id: params.id,
    type: params.type,
    origin: [jitter(baseOrigin[0], params.seed, 0.8), jitter(baseOrigin[1], params.seed + 1, 0.8)],
    target: params.target,
    lat: params.target[0],
    lon: params.target[1],
    location: params.label,
    label: params.label,
    description: `${params.type} strike in ${params.region}`,
    severity: params.fatalities > 10 ? 'CRITICAL' : params.fatalities > 5 ? 'HIGH' : 'MEDIUM',
    status: params.status ?? (params.type === 'INTERCEPTION' ? 'intercepted' : 'active'),
    confidence: params.confidence,
    source: params.source,
    timestamp: params.timestamp,
    region: params.region,
    fatalities: params.fatalities,
    ...performance,
  };
}

async function fetchAcledEvents(): Promise<MissileEvent[]> {
  const key = process.env.ACLED_API_KEY;
  const email = process.env.ACLED_EMAIL;
  if (!key || !email) return [];

  const params = new URLSearchParams({
    key,
    email,
    event_type: 'Explosions/Remote violence',
    sub_event_type: MISSILE_SUB_EVENTS.join('|'),
    limit: '50',
    order_by: 'event_date',
    order: 'desc',
  });

  const response = await fetch(`https://api.acleddata.com/acled/read?${params.toString()}`, {
    headers: { 'User-Agent': 'GlobeNewsLive/2.6 missile-events' },
    next: { revalidate },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) throw new Error(`ACLED ${response.status}`);
  const payload = (await response.json()) as AcledResponse;

  return (payload.data ?? []).flatMap((event, index) => {
    const lat = toNumber(event.latitude);
    const lon = toNumber(event.longitude);
    if (lat === null || lon === null) return [];

    const type = classifyType(`${event.sub_event_type ?? ''} ${event.notes ?? ''}`);
    const region = event.country ?? event.admin1 ?? 'Unknown';
    const eventDate = event.event_date ? new Date(event.event_date) : new Date();
    const timestamp = Number.isNaN(eventDate.getTime()) ? new Date().toISOString() : eventDate.toISOString();

    return buildEvent({
      id: `acled-${event.event_id_cnty ?? event.event_id_no_cnty ?? index}`,
      type,
      target: [lat, lon],
      label: event.location ?? event.notes?.slice(0, 80) ?? `${type} event`,
      source: 'ACLED',
      timestamp,
      region,
      fatalities: toNumber(event.fatalities) ?? 0,
      confidence: 0.86,
      seed: index + lat + lon,
    });
  });
}

async function fetchGdeltEvents(): Promise<MissileEvent[]> {
  const query = encodeURIComponent('(missile OR drone strike OR airstrike OR shelling OR rocket attack)');
  const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=${query}&format=json&maxrecords=50&timespan=24h`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'GlobeNewsLive/2.6 missile-events' },
    next: { revalidate },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) throw new Error(`GDELT ${response.status}`);
  const payload = (await response.json()) as GdeltGeoResponse;

  return (payload.features ?? []).flatMap((feature, index) => {
    const lat = toNumber(feature.lat ?? feature.geolat);
    const lon = toNumber(feature.long ?? feature.lon ?? feature.geolong);
    if (lat === null || lon === null) return [];

    const label = feature.name ?? `${feature.country ?? 'GDELT'} missile event`;
    const type = classifyType(label);
    const region = feature.country ?? feature.adm1 ?? 'Unknown';
    const count = toNumber(feature.count) ?? 1;

    return buildEvent({
      id: `gdelt-${region.replace(/\W+/g, '-').toLowerCase()}-${index}`,
      type,
      target: [lat, lon],
      label,
      source: 'GDELT',
      timestamp: new Date().toISOString(),
      region,
      fatalities: 0,
      confidence: Math.min(0.76, 0.45 + count * 0.03),
      seed: index + lat + lon,
    });
  });
}

function syntheticEvents(): MissileEvent[] {
  return ACTIVE_CONFLICTS.map((zone, index) => {
    const types: MissileEvent['type'][] = ['DRONE', 'AIRSTRIKE', 'ARTILLERY', 'SRBM', 'CRUISE'];
    const type = types[index % types.length];
    const timestamp = new Date(Date.now() - index * 6 * 60 * 1000).toISOString();

    return buildEvent({
      id: `synthetic-${zone.name.replace(/\W+/g, '-').toLowerCase()}`,
      type,
      target: [jitter(zone.lat, index, 0.6), jitter(zone.lon, index + 10, 0.6)],
      label: `${zone.name} ${type.toLowerCase()} activity`,
      source: 'SYNTHETIC',
      timestamp,
      region: zone.name,
      fatalities: 0,
      confidence: zone.intensity === 'high' ? 0.58 : 0.44,
      status: index % 5 === 0 ? 'IMPACTED' : 'active',
      seed: index,
    });
  });
}

export async function GET() {
  const fetchedAt = new Date().toISOString();
  let events: MissileEvent[] = [];
  let source: MissileEvent['source'] = 'SYNTHETIC';
  let acledAvailable = false;
  let gdeltAvailable = false;

  try {
    events = await fetchAcledEvents();
    acledAvailable = events.length > 0;
    if (events.length > 0) source = 'ACLED';
  } catch (error) {
    console.error('ACLED missile-events failed:', error);
  }

  if (events.length === 0) {
    try {
      events = await fetchGdeltEvents();
      gdeltAvailable = events.length > 0;
      if (events.length > 0) source = 'GDELT';
    } catch (error) {
      console.error('GDELT missile-events failed:', error);
    }
  }

  if (events.length === 0) {
    events = syntheticEvents();
    source = 'SYNTHETIC';
  }

  const meta: SourceMeta = {
    source,
    fetchedAt,
    acledAvailable,
    gdeltAvailable,
    fallback: source === 'SYNTHETIC',
    count: events.length,
  };

  return NextResponse.json({ events, meta });
}
