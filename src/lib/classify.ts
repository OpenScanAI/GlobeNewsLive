import { Severity, SignalCategory } from '@/types';

// Keyword-based threat classification (fast, no API needed)
const THREAT_KEYWORDS: Record<Severity, string[]> = {
  CRITICAL: [
    'nuclear strike', 'nuclear attack', 'invasion', 'chemical attack', 'coup',
    'martial law', 'missile impact', 'mass casualty', 'declaration of war',
    'troops invaded', 'air strike kills', 'bombing kills', 'terror attack',
    'hostages', 'assassination', 'nuclear', 'ww3', 'world war'
  ],
  HIGH: [
    'airstrike', 'missile launch', 'missile strike', 'troops deployed',
    'cyberattack', 'border clash', 'naval confrontation', 'military strike',
    'drone strike', 'explosion', 'bombing', 'shells', 'artillery',
    'fighter jets', 'warship', 'military buildup', 'mobilization',
    'escalation', 'retaliation', 'combat', 'casualties'
  ],
  MEDIUM: [
    'sanctions', 'military exercise', 'protest', 'election dispute',
    'trade war', 'embassy closure', 'naval patrol', 'diplomatic crisis',
    'tensions', 'warning', 'threat', 'condemn', 'ultimatum',
    'emergency', 'evacuate', 'refugees', 'displacement'
  ],
  LOW: [
    'diplomatic meeting', 'trade agreement', 'ceasefire talks',
    'aid delivery', 'joint statement', 'un resolution', 'peace talks',
    'negotiation', 'summit', 'bilateral', 'cooperation'
  ],
  INFO: []
};

const CATEGORY_KEYWORDS: Record<SignalCategory, string[]> = {
  conflict: ['war', 'conflict', 'fighting', 'battle', 'combat', 'clash', 'attack', 'strike'],
  military: ['military', 'army', 'navy', 'air force', 'troops', 'soldiers', 'defense', 'weapon'],
  diplomacy: ['diplomat', 'embassy', 'foreign minister', 'summit', 'treaty', 'agreement'],
  cyber: ['cyber', 'hack', 'breach', 'ransomware', 'malware', 'ddos', 'infrastructure attack'],
  disaster: ['earthquake', 'tsunami', 'hurricane', 'typhoon', 'flood', 'wildfire', 'volcano'],
  economy: ['economy', 'market', 'trade', 'sanction', 'tariff', 'gdp', 'inflation', 'currency'],
  politics: ['election', 'vote', 'president', 'prime minister', 'parliament', 'government'],
  terrorism: ['terror', 'isis', 'al-qaeda', 'extremist', 'radical', 'bomb', 'hostage'],
  protest: ['protest', 'demonstration', 'riot', 'unrest', 'civil', 'activist'],
  infrastructure: ['power', 'grid', 'pipeline', 'internet', 'outage', 'blackout', 'cable']
};

export function classifyThreat(text: string): { severity: Severity; confidence: number } {
  const lower = text.toLowerCase();
  
  for (const [severity, keywords] of Object.entries(THREAT_KEYWORDS) as [Severity, string[]][]) {
    if (severity === 'INFO') continue;
    const matches = keywords.filter(kw => lower.includes(kw));
    if (matches.length > 0) {
      const confidence = Math.min(0.95, 0.6 + (matches.length * 0.1));
      return { severity, confidence };
    }
  }
  
  return { severity: 'INFO', confidence: 0.5 };
}

export function classifyCategory(text: string): SignalCategory {
  const lower = text.toLowerCase();
  let bestMatch: SignalCategory = 'politics';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [SignalCategory, string[]][]) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }
  
  return bestMatch;
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return '#ff2244';
    case 'HIGH': return '#ff6633';
    case 'MEDIUM': return '#ffaa00';
    case 'LOW': return '#00ff88';
    case 'INFO': return '#6688aa';
  }
}

export function getThreatLevelFromSignals(signals: { severity: Severity }[]): 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE' {
  const critical = signals.filter(s => s.severity === 'CRITICAL').length;
  const high = signals.filter(s => s.severity === 'HIGH').length;
  
  if (critical >= 3) return 'SEVERE';
  if (critical >= 1 || high >= 5) return 'HIGH';
  if (high >= 2) return 'ELEVATED';
  if (high >= 1) return 'GUARDED';
  return 'LOW';
}
