import { NextResponse } from 'next/server';
import { Signal } from '@/types';

// Cache for AI briefs (expensive to generate)
let briefCache: { brief: SituationBrief; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface SituationBrief {
  timestamp: string;
  threatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';
  headline: string;
  summary: string;
  keyDevelopments: {
    region: string;
    headline: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    actors: string[];
  }[];
  watchList: string[];
  marketImplications: string;
  nextHours: string;
}

// Generate AI-style brief from signals (deterministic, no API needed)
function generateBrief(signals: Signal[]): SituationBrief {
  const now = new Date();
  
  // Analyze signals by severity and category
  const critical = signals.filter(s => s.severity === 'CRITICAL');
  const high = signals.filter(s => s.severity === 'HIGH');
  const military = signals.filter(s => s.category === 'military');
  const geopolitical = signals.filter(s => s.category === 'diplomacy' || s.category === 'politics');
  const cyber = signals.filter(s => s.category === 'cyber');
  const economic = signals.filter(s => s.category === 'economy');

  // Determine threat level
  let threatLevel: SituationBrief['threatLevel'] = 'LOW';
  if (critical.length >= 3) threatLevel = 'SEVERE';
  else if (critical.length >= 1 || high.length >= 5) threatLevel = 'HIGH';
  else if (high.length >= 2) threatLevel = 'ELEVATED';
  else if (high.length >= 1) threatLevel = 'GUARDED';

  // Extract key regions from signals
  const regionKeywords: Record<string, string[]> = {
    'EASTERN EUROPE': ['ukraine', 'russia', 'nato', 'crimea', 'donbas', 'kyiv', 'moscow'],
    'MIDDLE EAST': ['israel', 'palestine', 'gaza', 'hamas', 'hezbollah', 'iran', 'syria', 'lebanon', 'yemen', 'houthi'],
    'EAST ASIA': ['china', 'taiwan', 'philippines', 'south china sea', 'beijing', 'pyongyang', 'korea'],
    'AFRICA': ['sudan', 'sahel', 'mali', 'niger', 'ethiopia', 'somalia', 'wagner'],
    'SOUTH ASIA': ['india', 'pakistan', 'kashmir', 'afghanistan', 'taliban'],
    'GLOBAL': ['united nations', 'g20', 'g7', 'sanctions', 'cyber attack', 'oil', 'energy'],
  };

  // Find key developments by region
  const keyDevelopments: SituationBrief['keyDevelopments'] = [];
  const topSignals = [...critical, ...high].slice(0, 10);
  
  for (const signal of topSignals) {
    const text = (signal.title + ' ' + (signal.summary || '')).toLowerCase();
    let matchedRegion = 'GLOBAL';
    
    for (const [region, keywords] of Object.entries(regionKeywords)) {
      if (keywords.some(k => text.includes(k))) {
        matchedRegion = region;
        break;
      }
    }
    
    // Don't duplicate regions
    if (keyDevelopments.find(d => d.region === matchedRegion)) continue;
    if (keyDevelopments.length >= 4) break;

    // Extract actors from title
    const actorPatterns = /(russia|ukraine|israel|hamas|iran|china|us|nato|hezbollah|taliban|wagner)/gi;
    const matchedActors = (text.match(actorPatterns) || []).map(a => a.toUpperCase());
    const actors = Array.from(new Set(matchedActors));

    keyDevelopments.push({
      region: matchedRegion,
      headline: signal.title.length > 80 ? signal.title.substring(0, 77) + '...' : signal.title,
      severity: signal.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM',
      actors: actors.slice(0, 3),
    });
  }

  // Generate watchlist based on categories
  const watchList: string[] = [];
  if (military.length > 5) watchList.push('Elevated military activity across multiple theaters');
  if (cyber.length > 2) watchList.push('Active cyber operations detected');
  if (economic.length > 3) watchList.push('Economic tensions may escalate');
  if (geopolitical.length > 4) watchList.push('Diplomatic channels under strain');
  
  // Add specific watches based on content
  const allText = signals.map(s => s.title.toLowerCase()).join(' ');
  if (allText.includes('nuclear')) watchList.push('Nuclear rhetoric monitoring');
  if (allText.includes('drone') || allText.includes('uav')) watchList.push('Increased UAV activity reported');
  if (allText.includes('cease') || allText.includes('peace')) watchList.push('Ceasefire/peace negotiations ongoing');
  
  if (watchList.length === 0) watchList.push('No significant escalation indicators');

  // Market implications
  let marketImplications = 'Stable market conditions expected. ';
  if (critical.length > 0) {
    marketImplications = 'Risk-off sentiment likely. Safe haven assets (gold, USD, bonds) may see inflows. ';
  }
  if (allText.includes('oil') || allText.includes('energy') || allText.includes('strait')) {
    marketImplications += 'Energy markets sensitive to supply disruption concerns.';
  } else if (allText.includes('sanction')) {
    marketImplications += 'Sanctions-related news may impact affected currencies and commodities.';
  }

  // Next hours forecast
  let nextHours = 'Continue monitoring standard news cycle.';
  if (threatLevel === 'SEVERE' || threatLevel === 'HIGH') {
    nextHours = 'Recommend elevated alert status. Check for follow-up developments every 30 minutes.';
  } else if (threatLevel === 'ELEVATED') {
    nextHours = 'Watch for escalation signals. Key briefing times: 06:00, 12:00, 18:00 UTC.';
  }

  // Generate headline
  let headline = 'Global situation stable with no major incidents.';
  if (critical.length > 0) {
    headline = critical[0].title.length > 100 ? critical[0].title.substring(0, 97) + '...' : critical[0].title;
  } else if (high.length > 0) {
    headline = `${high.length} significant developments tracked across ${keyDevelopments.length} theaters.`;
  }

  // Generate summary
  const summaryParts: string[] = [];
  if (military.length > 0) summaryParts.push(`${military.length} military-related signals`);
  if (geopolitical.length > 0) summaryParts.push(`${geopolitical.length} geopolitical developments`);
  if (cyber.length > 0) summaryParts.push(`${cyber.length} cyber incidents`);
  if (economic.length > 0) summaryParts.push(`${economic.length} economic signals`);
  
  const summary = `Current tracking: ${summaryParts.join(', ') || 'standard global monitoring'}. ` +
    `Severity breakdown: ${critical.length} critical, ${high.length} high priority items. ` +
    `Primary focus areas: ${keyDevelopments.map(d => d.region).join(', ') || 'No specific hotspots'}.`;

  return {
    timestamp: now.toISOString(),
    threatLevel,
    headline,
    summary,
    keyDevelopments,
    watchList: watchList.slice(0, 5),
    marketImplications: marketImplications.trim(),
    nextHours,
  };
}

export async function GET() {
  try {
    // Check cache
    if (briefCache && Date.now() - briefCache.timestamp < CACHE_TTL) {
      return NextResponse.json({ brief: briefCache.brief, cached: true });
    }

    // Fetch current signals
    const signalsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3400'}/api/signals`);
    const { signals } = await signalsRes.json() as { signals: Signal[] };

    // Generate brief
    const brief = generateBrief(signals || []);

    // Cache it
    briefCache = { brief, timestamp: Date.now() };

    return NextResponse.json({ brief, cached: false });
  } catch (error) {
    console.error('Brief API error:', error);
    
    // Return a fallback brief
    const fallbackBrief: SituationBrief = {
      timestamp: new Date().toISOString(),
      threatLevel: 'LOW',
      headline: 'Unable to generate situation brief - data unavailable',
      summary: 'Signal feed temporarily unavailable. Attempting to reconnect.',
      keyDevelopments: [],
      watchList: ['Monitoring system status'],
      marketImplications: 'Unable to assess market implications.',
      nextHours: 'System will auto-retry in 5 minutes.',
    };
    
    return NextResponse.json({ brief: fallbackBrief, error: 'Partial data' });
  }
}
