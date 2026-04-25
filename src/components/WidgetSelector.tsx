'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Plus, Grid3x3 } from 'lucide-react';

export interface WidgetConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  visible: boolean;
  defaultSize: { w: number; h: number };
}

export const WIDGET_REGISTRY: Omit<WidgetConfig, 'visible'>[] = [
  {
    id: 'signal-feed',
    name: 'Signal Feed',
    icon: '📡',
    description: 'Live intelligence signals',
    defaultSize: { w: 3, h: 16 },
  },
  {
    id: 'country-intelligence',
    name: 'Country Intel Index',
    icon: '🌍',
    description: 'Country Instability Index — live risk scores for 18 countries',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'cross-source-signals',
    name: 'Cross-Source Signals',
    icon: '⚡',
    description: 'Multi-source correlated intelligence signals',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'chat-analyst',
    name: 'Intel Analyst',
    icon: '🧠',
    description: 'AI-powered intelligence analyst chat with quick actions',
    defaultSize: { w: 4, h: 8 },
  },
  {
    id: 'nk-missiles',
    name: 'NK Missile Tests',
    icon: '🚀',
    description: 'North Korea missile test visualization 1984-2026',
    defaultSize: { w: 6, h: 10 },
  },
  {
    id: 'globe-3d',
    name: '3D Globe',
    icon: '🌐',
    description: 'Interactive 3D globe with conflict markers and arcs',
    defaultSize: { w: 6, h: 10 },
  },
  {
    id: 'world-map',
    name: 'World Map',
    icon: '🗺️',
    description: 'Interactive global threat map',
    defaultSize: { w: 6, h: 10 },
  },
  {
    id: 'risk-dashboard',
    name: 'Risk Dashboard',
    icon: '⚠️',
    description: 'Regional risk scoring',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'sentiment-meter',
    name: 'Sentiment Meter',
    icon: '📊',
    description: 'Market & conflict sentiment',
    defaultSize: { w: 3, h: 5 },
  },
  {
    id: 'flight-radar',
    name: 'Flight Radar',
    icon: '✈️',
    description: 'Military flight tracking',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'military-tracker',
    name: 'Military Tracker',
    icon: '🎖️',
    description: 'Active military movements',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'cyber-feed',
    name: 'Cyber Feed',
    icon: '💻',
    description: 'Real-time cyberattacks',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'twitter-feed',
    name: 'Intelligence Feed',
    icon: '🐦',
    description: 'Live social intelligence',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'hotspot-streams',
    name: 'Hotspot Streams',
    icon: '🔥',
    description: 'Live video from conflict zones',
    defaultSize: { w: 4, h: 5 },
  },
  {
    id: 'attack-timeline',
    name: 'Attack Timeline',
    icon: '⏱️',
    description: 'Chronological attack log',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    icon: '🧠',
    description: 'AI-powered analysis',
    defaultSize: { w: 3, h: 5 },
  },
  {
    id: 'market-ticker',
    name: 'Market Ticker',
    icon: '📈',
    description: 'Financial markets data',
    defaultSize: { w: 4, h: 5 },
  },
  {
    id: 'multi-predictions',
    name: 'Predictions',
    icon: '🔮',
    description: 'Prediction markets',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'country-risk',
    name: 'Country Risk',
    icon: '🌍',
    description: 'Per-country risk index',
    defaultSize: { w: 3, h: 6 },
  },
  {
    id: 'climate-anomaly',
    name: 'Climate Anomaly',
    icon: '🌡️',
    description: 'Temperature & precip deviations in conflict zones',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'displacement',
    name: 'Displacement',
    icon: '🏕️',
    description: 'UN OCHA refugee & IDP flows',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'gulf-economies',
    name: 'Gulf Economies',
    icon: '🏦',
    description: 'GCC markets, oil prices, currencies',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'satellite-fires',
    name: 'Satellite Fires',
    icon: '🔥',
    description: 'NASA FIRMS fire detection data',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'telegram-feed',
    name: 'OSINT Intel Feed',
    icon: '📡',
    description: 'Telegram OSINT channels live intelligence',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'playback-control',
    name: 'Historical Playback',
    icon: '⏱️',
    description: 'Scrub through historical events timeline',
    defaultSize: { w: 6, h: 4 },
  },
  {
    id: 'cii-panel',
    name: 'CII Panel',
    icon: '🌡️',
    description: 'Country Instability Index — 0-100 score ring with top 10 unstable countries',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'oref-sirens',
    name: 'OREF Sirens',
    icon: '🚨',
    description: 'Israel Home Front Command — real-time siren alerts by location',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'strategic-posture',
    name: 'Strategic Posture',
    icon: '🎯',
    description: 'Military readiness levels — DEFCON-style indicators by country',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'ucdp-events',
    name: 'UCDP Events',
    icon: '📊',
    description: 'Uppsala Conflict Data Program — conflict fatalities and historical comparison',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'world-clock',
    name: 'World Clock',
    icon: '🕐',
    description: 'Strategic timezone display — DC, London, Moscow, Tehran, Beijing, Tokyo',
    defaultSize: { w: 3, h: 8 },
  },
  {
    id: 'security-advisories',
    name: 'Security Advisories',
    icon: '🛡️',
    description: 'Government travel advisories — US, UK, AU, CA risk levels',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    icon: '🚢',
    description: 'Global supply chain disruptions — chokepoints, shipping, critical minerals',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'population-exposure',
    name: 'Population Exposure',
    icon: '👥',
    description: 'Civilians in conflict zones — displacement, evacuation, humanitarian access',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'gdelt-intel',
    name: 'GDELT Intel',
    icon: '🌐',
    description: 'Global Events Language & Tone — real-time event monitoring, sentiment trends',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'macro-signals',
    name: 'Macro Signals',
    icon: '📈',
    description: 'Economic indicators — currency movements, bond yields, commodities',
    defaultSize: { w: 3, h: 10 },
  },
  {
    id: 'deduction-panel',
    name: 'AI Deduction Engine',
    icon: '🧠',
    description: 'AI-powered scenario analysis, probability assessments, and forecasting',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'country-deep-dive',
    name: 'Country Deep Dive',
    icon: '🌍',
    description: 'Detailed country analysis — Economy, Military, Politics, Signals tabs',
    defaultSize: { w: 4, h: 14 },
  },
  {
    id: 'economic-panel',
    name: 'Economic Dashboard',
    icon: '📊',
    description: 'GDP, inflation, oil & gas, forex, and central bank policy tracker',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'strategic-risk',
    name: 'Strategic Risk Matrix',
    icon: '⚠️',
    description: 'Risk matrix visualization, threat assessment, and mitigation strategies',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'etf-flows',
    name: 'ETF Fund Flows',
    icon: '💹',
    description: 'ETF inflows/outflows tracking, asset allocation, and fund performance',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'stablecoin-panel',
    name: 'Stablecoin Monitor',
    icon: '💲',
    description: 'Stablecoin market caps, de-peg alerts, USDT/USDC/DAI tracking',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'trade-policy',
    name: 'Trade Policy Tracker',
    icon: '🚢',
    description: 'Trade restrictions, tariff trends, trade flows, and sanctions tracker',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'intelligence-gaps',
    name: 'Intelligence Coverage',
    icon: '📡',
    description: 'Data source coverage, reliability scoring, and intelligence gap analysis',
    defaultSize: { w: 3, h: 12 },
  },
  {
    id: 'signal-detail',
    name: 'Signal Detail View',
    icon: '🎯',
    description: 'Detailed signal analysis with source verification and related events',
    defaultSize: { w: 3, h: 14 },
  },
  {
    id: 'country-timeline',
    name: 'Country Event Timeline',
    icon: '⏱️',
    description: 'Interactive country event timeline with filtering and zoom capabilities',
    defaultSize: { w: 4, h: 12 },
  },
];

interface WidgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onAddWidget: (id: string) => void;
}

export default function WidgetSelector({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onAddWidget,
}: WidgetSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const filtered = widgets.filter(w => {
    if (filter === 'visible') return w.visible;
    if (filter === 'hidden') return !w.visible;
    return true;
  });

  const visibleCount = widgets.filter(w => w.visible).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[85]"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-[90] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full w-72 bg-[#0a0a0f] border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-[#0f0f1a]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Grid3x3 size={14} className="text-[#00ff88]" />
                <h3 className="font-mono text-xs font-bold text-[#00ff88] tracking-wider">
                  WIDGET SELECTOR
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={13} />
              </button>
            </div>
            <div className="text-[9px] text-white/30 font-mono mb-3">
              {visibleCount} of {widgets.length} widgets active
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1">
              {(['all', 'visible', 'hidden'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 text-[9px] font-mono rounded transition-all capitalize ${
                    filter === f
                      ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30'
                      : 'bg-white/5 text-white/30 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Widget List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map(widget => (
              <div
                key={widget.id}
                className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  widget.visible
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-transparent border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg flex-shrink-0">{widget.icon}</span>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-mono font-medium truncate ${widget.visible ? 'text-white' : 'text-white/40'}`}>
                      {widget.name}
                    </div>
                    <div className="text-[9px] text-white/25 truncate">{widget.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {!widget.visible && (
                    <button
                      onClick={() => { onAddWidget(widget.id); onToggleWidget(widget.id); }}
                      className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88] text-[9px] font-mono rounded hover:bg-[#00ff88]/25 transition-all"
                      title="Add to dashboard"
                    >
                      <Plus size={9} />
                    </button>
                  )}
                  <button
                    onClick={() => onToggleWidget(widget.id)}
                    className={`p-1.5 rounded transition-all ${
                      widget.visible
                        ? 'text-[#00ff88] hover:bg-white/10'
                        : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                    }`}
                    title={widget.visible ? 'Hide widget' : 'Show widget'}
                  >
                    {widget.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-white/10 bg-[#0f0f1a]">
            <div className="text-[9px] text-white/25 font-mono text-center leading-relaxed">
              Drag widgets to reorder<br />
              Resize from panel corners
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
