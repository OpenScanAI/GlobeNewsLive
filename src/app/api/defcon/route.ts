import { NextResponse } from 'next/server';

interface DefconStatus {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  color: string;
  lastUpdated: string;
  indicators: {
    name: string;
    status: 'normal' | 'elevated' | 'high' | 'critical';
    detail: string;
  }[];
  doomsdayClock: string;
  nuclearPosture: string;
}

// Current threat assessment (manually updated based on global situation)
function getDefconStatus(): DefconStatus {
  // As of early 2026 - elevated due to ongoing conflicts
  return {
    level: 3,
    name: 'ROUND HOUSE',
    description: 'Increase in force readiness above normal. Air Force ready to mobilize in 15 minutes.',
    color: '#FFCC00', // Yellow
    lastUpdated: new Date().toISOString(),
    indicators: [
      {
        name: 'Ukraine Conflict',
        status: 'high',
        detail: 'Active conventional warfare, nuclear rhetoric from Russia',
      },
      {
        name: 'Middle East',
        status: 'critical',
        detail: 'Multi-front conflict: Gaza, Lebanon, Yemen, Syria',
      },
      {
        name: 'Taiwan Strait',
        status: 'elevated',
        detail: 'Increased military activity, regular incursions',
      },
      {
        name: 'North Korea',
        status: 'elevated',
        detail: 'Continued missile tests, nuclear program active',
      },
      {
        name: 'Cyber Threats',
        status: 'high',
        detail: 'State-sponsored attacks on critical infrastructure',
      },
    ],
    doomsdayClock: '90 seconds to midnight',
    nuclearPosture: 'Strategic forces at normal peacetime readiness. No unusual activity detected.',
  };
}

// DEFCON Level descriptions
const DEFCON_LEVELS = {
  1: { name: 'COCKED PISTOL', desc: 'Nuclear war imminent. Maximum readiness.', color: '#FFFFFF' },
  2: { name: 'FAST PACE', desc: 'Next step to nuclear war. Armed forces ready in 6 hours.', color: '#FF0000' },
  3: { name: 'ROUND HOUSE', desc: 'Increase readiness above normal. Air Force ready in 15 min.', color: '#FFCC00' },
  4: { name: 'DOUBLE TAKE', desc: 'Increased intelligence watch. Strengthened security.', color: '#00FF00' },
  5: { name: 'FADE OUT', desc: 'Lowest readiness. Normal peacetime operations.', color: '#0088FF' },
};

export async function GET() {
  const status = getDefconStatus();
  
  return NextResponse.json({
    defcon: status,
    levels: DEFCON_LEVELS,
    source: 'Assessment based on open-source intelligence',
    disclaimer: 'This is an unofficial estimate. Actual DEFCON level is classified.',
  });
}
