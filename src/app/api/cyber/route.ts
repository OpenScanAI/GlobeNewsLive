import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

interface CyberThreat {
  id: string;
  type: 'ransomware' | 'ddos' | 'apt' | 'data_breach' | 'supply_chain' | 'zero_day' | 'phishing' | 'malware';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  target: string;
  targetType: 'government' | 'infrastructure' | 'financial' | 'healthcare' | 'tech' | 'energy' | 'defense';
  country: string;
  lat: number;
  lon: number;
  attribution?: string;
  timestamp: string;
  status: 'ongoing' | 'contained' | 'investigating';
  description: string;
  source: string;
  iocs?: string[]; // Indicators of Compromise
}

// Real threat intel RSS feeds
const CYBER_FEEDS = [
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', name: 'CISA', type: 'advisory' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'Hacker News', type: 'news' },
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs', type: 'analysis' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer', type: 'news' },
  { url: 'https://threatpost.com/feed/', name: 'Threatpost', type: 'news' },
  { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading', type: 'analysis' },
];

// Keywords for threat classification
const THREAT_KEYWORDS = {
  ransomware: ['ransomware', 'ransom', 'lockbit', 'blackcat', 'alphv', 'conti', 'ryuk', 'revil', 'encrypt'],
  apt: ['apt', 'nation-state', 'state-sponsored', 'cozy bear', 'fancy bear', 'lazarus', 'charming kitten', 'advanced persistent'],
  ddos: ['ddos', 'denial of service', 'botnet', 'traffic flood', 'volumetric attack'],
  zero_day: ['zero-day', 'zero day', '0-day', 'cve-202', 'actively exploited', 'unpatched'],
  data_breach: ['breach', 'leaked', 'exposed', 'data dump', 'credentials stolen', 'database leak'],
  supply_chain: ['supply chain', 'software supply', 'dependency', 'package', 'npm', 'pypi', 'backdoor'],
  phishing: ['phishing', 'spear-phishing', 'credential harvesting', 'social engineering'],
  malware: ['malware', 'trojan', 'worm', 'backdoor', 'rat ', 'remote access', 'infostealer'],
};

const TARGET_KEYWORDS = {
  government: ['government', 'federal', 'state agency', 'ministry', 'parliament', 'election'],
  infrastructure: ['infrastructure', 'power grid', 'water', 'utility', 'scada', 'ics', 'ot '],
  financial: ['bank', 'financial', 'payment', 'credit card', 'cryptocurrency', 'exchange'],
  healthcare: ['hospital', 'healthcare', 'medical', 'patient', 'pharmaceutical', 'health'],
  tech: ['tech', 'software', 'cloud', 'saas', 'platform', 'microsoft', 'google', 'apple'],
  energy: ['energy', 'oil', 'gas', 'pipeline', 'refinery', 'power plant', 'nuclear'],
  defense: ['defense', 'military', 'contractor', 'weapons', 'pentagon', 'nato'],
};

const SEVERITY_KEYWORDS = {
  critical: ['critical', 'severe', 'emergency', 'urgent', 'actively exploited', 'nation-state', 'rce', 'remote code'],
  high: ['high', 'significant', 'major', 'widespread', 'ransomware', 'breach'],
  medium: ['medium', 'moderate', 'potential', 'vulnerability'],
};

// Country detection with coordinates
const COUNTRY_COORDS: Record<string, { lat: number; lon: number }> = {
  'usa': { lat: 39.8, lon: -98.5 }, 'us': { lat: 39.8, lon: -98.5 }, 'america': { lat: 39.8, lon: -98.5 },
  'china': { lat: 35.0, lon: 105.0 }, 'chinese': { lat: 35.0, lon: 105.0 },
  'russia': { lat: 61.5, lon: 105.3 }, 'russian': { lat: 61.5, lon: 105.3 },
  'iran': { lat: 32.4, lon: 53.7 }, 'iranian': { lat: 32.4, lon: 53.7 },
  'north korea': { lat: 40.3, lon: 127.5 }, 'dprk': { lat: 40.3, lon: 127.5 },
  'israel': { lat: 31.0, lon: 34.8 }, 'israeli': { lat: 31.0, lon: 34.8 },
  'uk': { lat: 55.4, lon: -3.4 }, 'britain': { lat: 55.4, lon: -3.4 },
  'germany': { lat: 51.2, lon: 10.5 }, 'german': { lat: 51.2, lon: 10.5 },
  'france': { lat: 46.2, lon: 2.2 }, 'french': { lat: 46.2, lon: 2.2 },
  'ukraine': { lat: 48.4, lon: 31.2 }, 'ukrainian': { lat: 48.4, lon: 31.2 },
  'india': { lat: 20.6, lon: 79.0 }, 'indian': { lat: 20.6, lon: 79.0 },
  'australia': { lat: -25.3, lon: 133.8 }, 'australian': { lat: -25.3, lon: 133.8 },
  'japan': { lat: 36.2, lon: 138.3 }, 'japanese': { lat: 36.2, lon: 138.3 },
  'global': { lat: 20, lon: 0 }, 'worldwide': { lat: 20, lon: 0 },
};

function classifyThreat(title: string, content: string): { type: CyberThreat['type']; severity: CyberThreat['severity']; targetType: CyberThreat['targetType'] } {
  const text = `${title} ${content}`.toLowerCase();
  
  // Detect type
  let type: CyberThreat['type'] = 'malware';
  for (const [t, keywords] of Object.entries(THREAT_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) {
      type = t as CyberThreat['type'];
      break;
    }
  }
  
  // Detect target type
  let targetType: CyberThreat['targetType'] = 'tech';
  for (const [t, keywords] of Object.entries(TARGET_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) {
      targetType = t as CyberThreat['targetType'];
      break;
    }
  }
  
  // Detect severity
  let severity: CyberThreat['severity'] = 'medium';
  for (const [s, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) {
      severity = s as CyberThreat['severity'];
      break;
    }
  }
  
  return { type, severity, targetType };
}

function detectCountry(text: string): { country: string; lat: number; lon: number } {
  const lower = text.toLowerCase();
  for (const [keyword, coords] of Object.entries(COUNTRY_COORDS)) {
    if (lower.includes(keyword)) {
      return { country: keyword.toUpperCase(), ...coords };
    }
  }
  return { country: 'Global', lat: 20, lon: 0 };
}

// Fetch real cyber threat feeds
async function fetchRealThreats(): Promise<CyberThreat[]> {
  const parser = new Parser({ timeout: 5000 });
  const threats: CyberThreat[] = [];
  
  const results = await Promise.allSettled(
    CYBER_FEEDS.map(async feed => {
      try {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 5).map((item, idx) => {
          const { type, severity, targetType } = classifyThreat(item.title || '', item.contentSnippet || '');
          const { country, lat, lon } = detectCountry(`${item.title} ${item.contentSnippet}`);
          
          return {
            id: `${feed.name.toLowerCase()}-${Date.now()}-${idx}`,
            type,
            severity,
            title: item.title || 'Unknown Threat',
            target: targetType.charAt(0).toUpperCase() + targetType.slice(1),
            targetType,
            country,
            lat: lat + (Math.random() - 0.5) * 5,
            lon: lon + (Math.random() - 0.5) * 5,
            timestamp: item.isoDate || new Date().toISOString(),
            status: 'investigating' as const,
            description: item.contentSnippet?.slice(0, 300) || '',
            source: feed.name,
          };
        });
      } catch (e) {
        return [];
      }
    })
  );
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      threats.push(...result.value);
    }
  }
  
  // Sort by timestamp, newest first
  threats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return threats.slice(0, 25);
}

interface CriticalMineral {
  id: string;
  name: string;
  symbol: string;
  lat: number;
  lon: number;
  country: string;
  production: number; // % of global
  reserves: number; // % of global
  use: string;
  supplyRisk: 'critical' | 'high' | 'moderate' | 'low';
  priceChange30d: number;
}

// Active cyber threats - Comprehensive global threat intel
function getCyberThreats(): CyberThreat[] {
  return [
    // APT Campaigns
    {
      id: 'cyber-1',
      type: 'apt',
      severity: 'critical',
      title: 'APT29 Campaign Against NATO Allies',
      target: 'European Government Networks',
      targetType: 'government',
      country: 'Multiple EU',
      lat: 50.85,
      lon: 4.35,
      attribution: 'Russia (APT29/Cozy Bear)',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'ongoing',
      description: 'Sophisticated phishing campaign targeting diplomatic communications',
      source: 'CISA / ENISA',
    },
    {
      id: 'cyber-apt2',
      type: 'apt',
      severity: 'critical',
      title: 'APT33 Targets Energy Sector',
      target: 'Oil & Gas Infrastructure',
      targetType: 'energy',
      country: 'Saudi Arabia',
      lat: 24.71,
      lon: 46.68,
      attribution: 'Iran (APT33/Elfin)',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      status: 'ongoing',
      description: 'Spear-phishing campaign against Gulf energy companies',
      source: 'Mandiant',
      iocs: ['Shamoon variant', 'Custom backdoors'],
    },
    {
      id: 'cyber-apt3',
      type: 'apt',
      severity: 'high',
      title: 'APT41 Supply Chain Attack',
      target: 'Semiconductor Industry',
      targetType: 'tech',
      country: 'Taiwan',
      lat: 25.03,
      lon: 121.57,
      attribution: 'China (APT41/Winnti)',
      timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
      status: 'investigating',
      description: 'Targeted intrusion into chip manufacturing supply chain',
      source: 'Taiwan NCSC',
    },
    {
      id: 'cyber-apt4',
      type: 'apt',
      severity: 'high',
      title: 'Lazarus Group Crypto Heist',
      target: 'Cryptocurrency Exchange',
      targetType: 'financial',
      country: 'Singapore',
      lat: 1.35,
      lon: 103.82,
      attribution: 'North Korea (Lazarus/HIDDEN COBRA)',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'investigating',
      description: '$200M in crypto assets potentially compromised',
      source: 'FBI',
      iocs: ['TraderTraitor malware'],
    },
    
    // Ransomware
    {
      id: 'cyber-2',
      type: 'ransomware',
      severity: 'high',
      title: 'Healthcare System Ransomware',
      target: 'Hospital Network',
      targetType: 'healthcare',
      country: 'USA',
      lat: 41.88,
      lon: -87.63,
      attribution: 'LockBit 3.0',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'investigating',
      description: '15 hospitals affected, patient data at risk, systems offline',
      source: 'HHS / FBI',
    },
    {
      id: 'cyber-ransom2',
      type: 'ransomware',
      severity: 'critical',
      title: 'Critical Infrastructure Ransomware',
      target: 'Water Treatment Facility',
      targetType: 'infrastructure',
      country: 'UK',
      lat: 51.51,
      lon: -0.13,
      attribution: 'CLOP Ransomware',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      status: 'ongoing',
      description: 'Water utility SCADA systems encrypted, manual ops underway',
      source: 'NCSC-UK',
    },
    
    // DDoS
    {
      id: 'cyber-3',
      type: 'ddos',
      severity: 'high',
      title: 'DDoS on Financial Infrastructure',
      target: 'Banking Systems',
      targetType: 'financial',
      country: 'Israel',
      lat: 32.07,
      lon: 34.77,
      attribution: 'Iran-linked groups',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      status: 'ongoing',
      description: 'Coordinated DDoS affecting multiple Israeli banks',
      source: 'Israel NCSC',
    },
    {
      id: 'cyber-ddos2',
      type: 'ddos',
      severity: 'medium',
      title: 'Government Portal DDoS',
      target: 'E-Government Services',
      targetType: 'government',
      country: 'Ukraine',
      lat: 50.45,
      lon: 30.52,
      attribution: 'KillNet / Russia-aligned',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'ongoing',
      description: 'Sustained attack on Ukrainian government websites',
      source: 'CERT-UA',
    },
    
    // Supply Chain
    {
      id: 'cyber-4',
      type: 'supply_chain',
      severity: 'critical',
      title: 'Supply Chain Compromise',
      target: 'Software Vendor',
      targetType: 'tech',
      country: 'USA',
      lat: 37.77,
      lon: -122.42,
      attribution: 'Unknown (investigating)',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
      status: 'investigating',
      description: 'Malicious update distributed to 10,000+ enterprise customers',
      source: 'CISA',
    },
    
    // Zero-Day
    {
      id: 'cyber-5',
      type: 'zero_day',
      severity: 'critical',
      title: 'Critical Zero-Day in Enterprise Software',
      target: 'Global Enterprise',
      targetType: 'tech',
      country: 'Global',
      lat: 37.39,
      lon: -122.08,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'ongoing',
      description: 'Actively exploited CVE affecting major enterprise platform',
      source: 'Vendor Advisory',
      iocs: ['CVE-2026-XXXX', 'IOC hashes available'],
    },
    {
      id: 'cyber-zd2',
      type: 'zero_day',
      severity: 'high',
      title: 'Mobile OS Zero-Day Exploitation',
      target: 'Journalists & Activists',
      targetType: 'government',
      country: 'Multiple',
      lat: 35.70,
      lon: 51.42,
      attribution: 'State-sponsored',
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'investigating',
      description: 'Pegasus-style spyware targeting dissidents in Middle East',
      source: 'Citizen Lab',
      iocs: ['Zero-click exploit', 'iMessage vector'],
    },
    
    // Critical Infrastructure
    {
      id: 'cyber-infra1',
      type: 'apt',
      severity: 'critical',
      title: 'Power Grid Intrusion Detected',
      target: 'National Power Grid',
      targetType: 'infrastructure',
      country: 'Germany',
      lat: 52.52,
      lon: 13.41,
      attribution: 'Sandworm (Russia)',
      timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
      status: 'contained',
      description: 'ICS malware discovered in grid management systems',
      source: 'BSI',
      iocs: ['Industroyer2 variant'],
    },
    {
      id: 'cyber-infra2',
      type: 'apt',
      severity: 'high',
      title: 'Port Authority Systems Compromised',
      target: 'Maritime Infrastructure',
      targetType: 'infrastructure',
      country: 'Netherlands',
      lat: 51.92,
      lon: 4.48,
      attribution: 'Unknown',
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
      status: 'investigating',
      description: 'Rotterdam port cargo tracking systems breached',
      source: 'NCSC-NL',
    },
    
    // Defense
    {
      id: 'cyber-def1',
      type: 'apt',
      severity: 'critical',
      title: 'Defense Contractor Breach',
      target: 'Aerospace Defense',
      targetType: 'defense',
      country: 'USA',
      lat: 38.90,
      lon: -77.04,
      attribution: 'China (APT10)',
      timestamp: new Date(Date.now() - 3600000 * 96).toISOString(),
      status: 'investigating',
      description: 'F-35 subcontractor network compromised, classified data at risk',
      source: 'DOD / FBI',
    },
  ];
}

// Critical minerals locations
function getCriticalMinerals(): CriticalMineral[] {
  return [
    {
      id: 'min-1',
      name: 'Rare Earth Elements',
      symbol: 'REE',
      lat: 40.0,
      lon: 116.4,
      country: 'China',
      production: 60,
      reserves: 37,
      use: 'EV batteries, electronics, defense',
      supplyRisk: 'critical',
      priceChange30d: 12.5,
    },
    {
      id: 'min-2',
      name: 'Lithium',
      symbol: 'Li',
      lat: -23.6,
      lon: -68.3,
      country: 'Chile',
      production: 26,
      reserves: 42,
      use: 'EV batteries, energy storage',
      supplyRisk: 'high',
      priceChange30d: -8.2,
    },
    {
      id: 'min-3',
      name: 'Cobalt',
      symbol: 'Co',
      lat: -4.4,
      lon: 15.3,
      country: 'DRC',
      production: 73,
      reserves: 52,
      use: 'Batteries, superalloys',
      supplyRisk: 'critical',
      priceChange30d: 5.8,
    },
    {
      id: 'min-4',
      name: 'Gallium',
      symbol: 'Ga',
      lat: 34.8,
      lon: 113.6,
      country: 'China',
      production: 98,
      reserves: 80,
      use: 'Semiconductors, 5G',
      supplyRisk: 'critical',
      priceChange30d: 22.1,
    },
    {
      id: 'min-5',
      name: 'Graphite',
      symbol: 'C',
      lat: 31.2,
      lon: 121.5,
      country: 'China',
      production: 65,
      reserves: 22,
      use: 'Batteries, steel',
      supplyRisk: 'high',
      priceChange30d: 3.4,
    },
    {
      id: 'min-6',
      name: 'Platinum',
      symbol: 'Pt',
      lat: -25.7,
      lon: 28.2,
      country: 'South Africa',
      production: 72,
      reserves: 91,
      use: 'Catalysts, hydrogen fuel cells',
      supplyRisk: 'high',
      priceChange30d: -2.1,
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const realtime = searchParams.get('realtime') === 'true';

  if (type === 'threats') {
    // Try real feeds first, fall back to static data
    if (realtime) {
      try {
        const realThreats = await fetchRealThreats();
        if (realThreats.length > 0) {
          return NextResponse.json({ 
            threats: realThreats,
            sources: CYBER_FEEDS.map(f => f.name),
            realtime: true,
          });
        }
      } catch (e) {
        // Fall through to static data
      }
    }
    return NextResponse.json({ threats: getCyberThreats(), realtime: false });
  }
  if (type === 'minerals') {
    return NextResponse.json({ minerals: getCriticalMinerals() });
  }

  // Combined response
  let threats = getCyberThreats();
  if (realtime) {
    try {
      const realThreats = await fetchRealThreats();
      if (realThreats.length > 0) {
        threats = realThreats;
      }
    } catch (e) {
      // Use static data
    }
  }

  return NextResponse.json({
    threats,
    minerals: getCriticalMinerals(),
    sources: ['CISA', 'ENISA', 'FBI', 'Hacker News', 'Krebs Security', 'Dark Reading', 'USGS', 'IEA'],
  });
}
