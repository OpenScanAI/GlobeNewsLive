import { NextResponse } from 'next/server';

interface WeatherAlert {
  id: string;
  type: 'hurricane' | 'typhoon' | 'flood' | 'wildfire' | 'earthquake' | 'tornado' | 'blizzard' | 'heatwave' | 'drought';
  severity: 'watch' | 'warning' | 'emergency';
  title: string;
  location: string;
  country: string;
  lat: number;
  lon: number;
  startTime: string;
  endTime?: string;
  description: string;
  source: string;
  affectedPopulation?: number;
}

interface ClimateAnomaly {
  id: string;
  type: 'temperature' | 'precipitation' | 'sea_level' | 'ice_extent' | 'drought';
  region: string;
  lat: number;
  lon: number;
  anomalyValue: number; // deviation from normal
  unit: string;
  period: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  source: string;
}

// Current active weather alerts
function getWeatherAlerts(): WeatherAlert[] {
  return [
    {
      id: 'wx-1',
      type: 'flood',
      severity: 'warning',
      title: 'Flash Flood Warning',
      location: 'Eastern Pakistan',
      country: 'Pakistan',
      lat: 31.5,
      lon: 74.3,
      startTime: new Date(Date.now() - 3600000 * 6).toISOString(),
      description: 'Heavy monsoon rains causing flash flooding in Punjab region',
      source: 'Pakistan Met Dept',
      affectedPopulation: 2000000,
    },
    {
      id: 'wx-2',
      type: 'heatwave',
      severity: 'warning',
      title: 'Extreme Heat Warning',
      location: 'Central India',
      country: 'India',
      lat: 23.2,
      lon: 77.4,
      startTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      description: 'Temperatures exceeding 45°C expected for next 5 days',
      source: 'IMD',
      affectedPopulation: 50000000,
    },
    {
      id: 'wx-3',
      type: 'wildfire',
      severity: 'emergency',
      title: 'Major Wildfire',
      location: 'Southern California',
      country: 'USA',
      lat: 34.1,
      lon: -118.4,
      startTime: new Date(Date.now() - 3600000 * 48).toISOString(),
      description: '50,000+ acres burned, 0% contained, evacuations in progress',
      source: 'CAL FIRE',
      affectedPopulation: 100000,
    },
    {
      id: 'wx-4',
      type: 'typhoon',
      severity: 'warning',
      title: 'Typhoon Approaching',
      location: 'Western Pacific',
      country: 'Philippines',
      lat: 14.6,
      lon: 125.5,
      startTime: new Date(Date.now() + 3600000 * 24).toISOString(),
      description: 'Category 3 typhoon expected to make landfall in 24 hours',
      source: 'PAGASA',
      affectedPopulation: 5000000,
    },
    {
      id: 'wx-5',
      type: 'drought',
      severity: 'watch',
      title: 'Severe Drought Conditions',
      location: 'Horn of Africa',
      country: 'Ethiopia',
      lat: 9.0,
      lon: 38.7,
      startTime: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
      description: 'Fourth consecutive failed rainy season, humanitarian crisis',
      source: 'UN OCHA',
      affectedPopulation: 20000000,
    },
  ];
}

// Climate anomalies
function getClimateAnomalies(): ClimateAnomaly[] {
  return [
    {
      id: 'clim-1',
      type: 'temperature',
      region: 'Arctic',
      lat: 75.0,
      lon: 0.0,
      anomalyValue: 4.2,
      unit: '°C above normal',
      period: 'February 2026',
      trend: 'increasing',
      source: 'NOAA',
    },
    {
      id: 'clim-2',
      type: 'sea_level',
      region: 'Pacific Islands',
      lat: -8.5,
      lon: 179.2,
      anomalyValue: 12,
      unit: 'cm above baseline',
      period: '2026 YTD',
      trend: 'increasing',
      source: 'NASA',
    },
    {
      id: 'clim-3',
      type: 'ice_extent',
      region: 'Antarctic',
      lat: -75.0,
      lon: 0.0,
      anomalyValue: -15,
      unit: '% below average',
      period: 'February 2026',
      trend: 'decreasing',
      source: 'NSIDC',
    },
    {
      id: 'clim-4',
      type: 'precipitation',
      region: 'Amazon Basin',
      lat: -3.4,
      lon: -62.2,
      anomalyValue: -35,
      unit: '% below normal',
      period: 'Jan-Feb 2026',
      trend: 'decreasing',
      source: 'INPE Brazil',
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'alerts') {
    return NextResponse.json({ alerts: getWeatherAlerts() });
  }
  if (type === 'climate') {
    return NextResponse.json({ anomalies: getClimateAnomalies() });
  }

  return NextResponse.json({
    alerts: getWeatherAlerts(),
    anomalies: getClimateAnomalies(),
    sources: ['NOAA', 'NASA', 'IMD', 'UN OCHA', 'CAL FIRE', 'PAGASA'],
  });
}
