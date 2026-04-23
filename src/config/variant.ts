/**
 * Site Variant Configuration
 * Supports: full (geopolitical), tech, finance, happy
 */

export type SiteVariant = 'full' | 'tech' | 'finance' | 'happy';

// Get variant from environment or default to full
export const SITE_VARIANT: SiteVariant = (process.env.NEXT_PUBLIC_SITE_VARIANT as SiteVariant) || 'full';

// Variant display names
export const VARIANT_NAMES: Record<SiteVariant, string> = {
  full: 'WorldMonitor',
  tech: 'TechMonitor',
  finance: 'FinanceMonitor',
  happy: 'HappyMonitor',
};

// Variant colors/themes
export const VARIANT_THEMES: Record<SiteVariant, { primary: string; secondary: string; accent: string }> = {
  full: {
    primary: '#00ff88',
    secondary: '#00ccff',
    accent: '#ff4444',
  },
  tech: {
    primary: '#00d4ff',
    secondary: '#7c3aed',
    accent: '#f59e0b',
  },
  finance: {
    primary: '#10b981',
    secondary: '#3b82f6',
    accent: '#f59e0b',
  },
  happy: {
    primary: '#f59e0b',
    secondary: '#ec4899',
    accent: '#10b981',
  },
};

// Variant descriptions
export const VARIANT_DESCRIPTIONS: Record<SiteVariant, string> = {
  full: 'Real-time geopolitical intelligence and global conflict monitoring',
  tech: 'Startup ecosystem tracking, AI developments, and tech industry insights',
  finance: 'Global markets, trading intelligence, and economic indicators',
  happy: 'Positive news, acts of kindness, and uplifting stories from around the world',
};

// Variant features
export const VARIANT_FEATURES: Record<SiteVariant, string[]> = {
  full: [
    '170+ RSS sources',
    '45+ map layers',
    'Conflict tracking',
    'Military activity',
    'Cyber threats',
    'Economic indicators',
    'AI synthesis',
    'CII Choropleth',
  ],
  tech: [
    'Startup funding tracking',
    'AI/ML news aggregation',
    'VC blog monitoring',
    'Tech event tracking',
    'Cloud region mapping',
    'GitHub trending',
    'Product Hunt launches',
  ],
  finance: [
    'Market data feeds',
    'Central bank monitoring',
    'Commodity tracking',
    'Crypto market data',
    'Trade route mapping',
    'Economic indicators',
    'Institutional flows',
  ],
  happy: [
    'Positive news only',
    'Acts of kindness',
    'Species recovery',
    'Clean energy progress',
    'Scientific breakthroughs',
    'Community heroes',
    'Good news network',
  ],
};

// Check if feature is available in current variant
export function isFeatureAvailable(feature: string): boolean {
  return VARIANT_FEATURES[SITE_VARIANT].includes(feature);
}

// Get variant-specific config
export function getVariantConfig() {
  return {
    name: VARIANT_NAMES[SITE_VARIANT],
    theme: VARIANT_THEMES[SITE_VARIANT],
    description: VARIANT_DESCRIPTIONS[SITE_VARIANT],
    features: VARIANT_FEATURES[SITE_VARIANT],
  };
}
