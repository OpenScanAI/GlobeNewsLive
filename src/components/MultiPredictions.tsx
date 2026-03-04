'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, BarChart3, Link2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface PredictionMarket {
  id: string;
  platform: 'Polymarket' | 'Kalshi' | 'Metaculus';
  question: string;
  probability: number;
  change24h: number;
  volume?: number;
  category: string;
  endDate?: string;
  url?: string;
}

interface Correlation {
  pair: string;
  correlation: number;
}

const PLATFORM_COLORS = {
  Polymarket: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  Kalshi: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Metaculus: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

const CATEGORY_ICONS: Record<string, string> = {
  Geopolitics: '🌍',
  Conflict: '⚔️',
  Nuclear: '☢️',
  Economy: '💰',
  Cyber: '💻',
  AI: '🤖',
  Commodities: '🛢️',
};

export default function MultiPredictions() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'kalshi' | 'metaculus' | 'polymarket' | 'correlations'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data, isLoading } = useSWR<{
    predictions: PredictionMarket[];
    correlations: Correlation[];
    byCategory: Record<string, PredictionMarket[]>;
  }>('/api/kalshi', fetcher, {
    refreshInterval: 60000,
  });

  const predictions = data?.predictions || [];
  const correlations = data?.correlations || [];
  const categories = ['all', ...Object.keys(data?.byCategory || {})];

  const filteredPredictions = predictions.filter(p => {
    if (activeTab !== 'all' && activeTab !== 'correlations' && p.platform.toLowerCase() !== activeTab) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-panel/50 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">PREDICTION MARKETS</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
            {predictions.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-text-dim" /> : <ChevronDown className="w-4 h-4 text-text-dim" />}
      </button>

      {isExpanded && (
        <>
          {/* Platform Tabs */}
          <div className="px-2 py-1.5 border-b border-border-subtle flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap ${
                activeTab === 'all' ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setActiveTab('kalshi')}
              className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap ${
                activeTab === 'kalshi' ? 'bg-blue-500/20 text-blue-400' : 'text-text-dim hover:text-white'
              }`}
            >
              KALSHI
            </button>
            <button
              onClick={() => setActiveTab('metaculus')}
              className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap ${
                activeTab === 'metaculus' ? 'bg-emerald-500/20 text-emerald-400' : 'text-text-dim hover:text-white'
              }`}
            >
              METACULUS
            </button>
            <button
              onClick={() => setActiveTab('polymarket')}
              className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap ${
                activeTab === 'polymarket' ? 'bg-purple-500/20 text-purple-400' : 'text-text-dim hover:text-white'
              }`}
            >
              POLYMARKET
            </button>
            <button
              onClick={() => setActiveTab('correlations')}
              className={`px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap ${
                activeTab === 'correlations' ? 'bg-accent-orange/20 text-accent-orange' : 'text-text-dim hover:text-white'
              }`}
            >
              <Link2 className="w-3 h-3 inline mr-1" />
              CORR
            </button>
          </div>

          {/* Category Filter */}
          {activeTab !== 'correlations' && (
            <div className="px-2 py-1 border-b border-border-subtle flex gap-1 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap ${
                    categoryFilter === cat ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white'
                  }`}
                >
                  {cat === 'all' ? '🌐 All' : `${CATEGORY_ICONS[cat] || '📊'} ${cat}`}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="text-[10px] text-text-muted animate-pulse">Loading markets...</div>
              </div>
            ) : activeTab === 'correlations' ? (
              // Correlations View
              <div className="p-2 space-y-2">
                <div className="text-[9px] text-text-muted px-1 mb-2">
                  Cross-market correlations based on historical data
                </div>
                {correlations.map((corr, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-elevated/30 rounded">
                    <span className="text-[10px] text-white">{corr.pair}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full ${corr.correlation > 0 ? 'bg-accent-green' : 'bg-accent-red'}`}
                          style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${corr.correlation > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {corr.correlation > 0 ? '+' : ''}{(corr.correlation * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Predictions List
              <div className="divide-y divide-border-subtle">
                {filteredPredictions.map(pred => {
                  const colors = PLATFORM_COLORS[pred.platform];
                  return (
                    <div key={pred.id} className="px-3 py-2 hover:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                          {pred.platform}
                        </span>
                        <div className="flex items-center gap-1">
                          {pred.change24h > 0 ? (
                            <TrendingUp className="w-3 h-3 text-accent-green" />
                          ) : pred.change24h < 0 ? (
                            <TrendingDown className="w-3 h-3 text-accent-red" />
                          ) : null}
                          <span className={`text-[9px] ${
                            pred.change24h > 0 ? 'text-accent-green' : pred.change24h < 0 ? 'text-accent-red' : 'text-text-dim'
                          }`}>
                            {pred.change24h > 0 ? '+' : ''}{(pred.change24h * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-white leading-snug mb-2">
                        {pred.question}
                      </p>
                      
                      {/* Probability Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              pred.probability >= 0.7 ? 'bg-accent-green' :
                              pred.probability >= 0.4 ? 'bg-yellow-500' : 'bg-accent-red'
                            }`}
                            style={{ width: `${pred.probability * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-white w-10 text-right">
                          {(pred.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] text-text-dim">
                          {CATEGORY_ICONS[pred.category] || '📊'} {pred.category}
                        </span>
                        {pred.volume && (
                          <span className="text-[8px] text-text-dim">
                            ${(pred.volume / 1000000).toFixed(1)}M vol
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-text-dim">
                3 platforms • {predictions.length} markets
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" title="Kalshi" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Metaculus" />
                <span className="w-2 h-2 rounded-full bg-purple-500" title="Polymarket" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
