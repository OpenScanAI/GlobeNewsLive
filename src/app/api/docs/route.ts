import { NextResponse } from 'next/server';

const API_DOCS = {
  name: 'GlobeNews Live API',
  version: '2.0.0',
  description: 'Real-time global intelligence signals, conflict tracking, and market data',
  baseUrl: 'https://globenews.live/api',
  license: 'MIT',
  
  endpoints: [
    {
      path: '/signals',
      method: 'GET',
      description: 'Aggregated news signals from 9+ global sources with threat classification',
      refreshInterval: '60 seconds',
      response: {
        signals: [
          {
            id: 'string',
            title: 'string',
            severity: 'CRITICAL | HIGH | MEDIUM | LOW | INFO',
            category: 'military | geopolitical | cyber | economic | disaster | other',
            source: 'string (e.g., Reuters, BBC, Al Jazeera)',
            sourceUrl: 'string',
            timeAgo: 'string (e.g., 2h ago)',
            timestamp: 'ISO 8601 date',
            summary: 'string (max 200 chars)',
          }
        ],
        cached: 'boolean'
      },
      example: 'GET /api/signals → { signals: [...], cached: false }'
    },
    {
      path: '/brief',
      method: 'GET',
      description: 'AI-generated situation brief with threat assessment and key developments',
      refreshInterval: '30 minutes',
      response: {
        brief: {
          timestamp: 'ISO 8601 date',
          threatLevel: 'LOW | GUARDED | ELEVATED | HIGH | SEVERE',
          headline: 'string',
          summary: 'string',
          keyDevelopments: [
            {
              region: 'string',
              headline: 'string',
              severity: 'CRITICAL | HIGH | MEDIUM',
              actors: ['string']
            }
          ],
          watchList: ['string'],
          marketImplications: 'string',
          nextHours: 'string'
        },
        cached: 'boolean'
      },
      example: 'GET /api/brief → { brief: {...}, cached: false }'
    },
    {
      path: '/markets',
      method: 'GET',
      description: 'Cryptocurrency and traditional market data from CoinGecko',
      refreshInterval: '30 seconds',
      response: {
        markets: [
          {
            symbol: 'string (e.g., BTC, ETH, GlobeNews)',
            name: 'string',
            price: 'number',
            change24h: 'number',
            volume24h: 'number',
            marketCap: 'number'
          }
        ],
        cached: 'boolean'
      },
      example: 'GET /api/markets → { markets: [...], cached: false }'
    },
    {
      path: '/predictions',
      method: 'GET',
      description: 'Prediction market data from Polymarket',
      refreshInterval: '60 seconds',
      response: {
        predictions: [
          {
            id: 'string',
            title: 'string',
            probability: 'number (0-1)',
            volume: 'number',
            category: 'string',
            endDate: 'ISO 8601 date'
          }
        ],
        cached: 'boolean'
      },
      example: 'GET /api/predictions → { predictions: [...], cached: false }'
    },
    {
      path: '/earthquakes',
      method: 'GET',
      description: 'Recent earthquakes from USGS (M4.5+)',
      refreshInterval: '2 minutes',
      response: {
        earthquakes: [
          {
            id: 'string',
            magnitude: 'number',
            location: 'string',
            latitude: 'number',
            longitude: 'number',
            depth: 'number (km)',
            timestamp: 'ISO 8601 date',
            url: 'string (USGS detail page)'
          }
        ],
        cached: 'boolean'
      },
      example: 'GET /api/earthquakes → { earthquakes: [...], cached: false }'
    },
    {
      path: '/conflicts',
      method: 'GET',
      description: 'Active conflict events (ACLED-style data)',
      refreshInterval: '5 minutes',
      response: {
        conflicts: [
          {
            id: 'string',
            event_date: 'YYYY-MM-DD',
            event_type: 'string',
            sub_event_type: 'string',
            actor1: 'string',
            actor2: 'string | null',
            country: 'string',
            admin1: 'string',
            location: 'string',
            latitude: 'number',
            longitude: 'number',
            fatalities: 'number',
            notes: 'string',
            source: 'string'
          }
        ],
        cached: 'boolean'
      },
      example: 'GET /api/conflicts → { conflicts: [...], cached: false }'
    }
  ],
  
  rateLimits: {
    requests: '100 per minute',
    burst: '10 per second',
    note: 'No API key required. Please cache responses on your end.'
  },
  
  cors: {
    enabled: true,
    origins: '*',
    note: 'CORS is enabled for all origins. Attribution appreciated.'
  },
  
  attribution: {
    sources: [
      'Reuters (RSS)',
      'BBC World (RSS)',
      'Al Jazeera (RSS)',
      'The Guardian (RSS)',
      'France24 (RSS)',
      'DW News (RSS)',
      'Defense One (RSS)',
      'Breaking Defense (RSS)',
      'BleepingComputer (RSS)',
      'CoinGecko (API)',
      'Polymarket (API)',
      'USGS (API)',
      'ACLED (methodology)'
    ],
    license: 'MIT - Free to use with attribution'
  },
  
  examples: {
    curl: {
      signals: "curl 'https://globenews.live/api/signals'",
      brief: "curl 'https://globenews.live/api/brief'",
      markets: "curl 'https://globenews.live/api/markets'",
    },
    javascript: `
fetch('https://globenews.live/api/signals')
  .then(r => r.json())
  .then(data => {
    const critical = data.signals.filter(s => s.severity === 'CRITICAL');
    console.log(\`\${critical.length} critical signals\`);
  });`,
    python: `
import requests

response = requests.get('https://globenews.live/api/signals')
data = response.json()
critical = [s for s in data['signals'] if s['severity'] == 'CRITICAL']
print(f"{len(critical)} critical signals")`
  }
};

export async function GET() {
  return NextResponse.json(API_DOCS, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    }
  });
}
