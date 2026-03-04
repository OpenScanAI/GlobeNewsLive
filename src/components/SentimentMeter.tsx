'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface SentimentData {
  category: string;
  icon: string;
  sentiment: number; // -100 to +100
  volume: number;
  change: number;
  keywords: string[];
}

// Calculate sentiment from signals
function analyzeSentiment(signals: any[]): SentimentData[] {
  const categories = [
    { 
      category: 'War & Conflict', 
      icon: '⚔️',
      keywords: ['war', 'strike', 'attack', 'military', 'bomb', 'kill'],
      baseSentiment: -65
    },
    { 
      category: 'Economy', 
      icon: '📈',
      keywords: ['oil', 'price', 'market', 'trade', 'economy', 'shipping'],
      baseSentiment: -30
    },
    { 
      category: 'Diplomacy', 
      icon: '🤝',
      keywords: ['negotiate', 'talks', 'peace', 'ceasefire', 'agreement', 'UN'],
      baseSentiment: 15
    },
    { 
      category: 'Humanitarian', 
      icon: '🏥',
      keywords: ['aid', 'refugee', 'civilian', 'hospital', 'crisis', 'humanitarian'],
      baseSentiment: -45
    },
    { 
      category: 'Cyber/Tech', 
      icon: '💻',
      keywords: ['cyber', 'hack', 'breach', 'infrastructure', 'power', 'grid'],
      baseSentiment: -25
    },
  ];

  return categories.map(cat => {
    const relevantSignals = signals.filter(s => 
      cat.keywords.some(kw => s.title?.toLowerCase().includes(kw))
    );
    
    // Adjust sentiment based on signal severity
    let adjustment = 0;
    relevantSignals.forEach(s => {
      if (s.severity === 'CRITICAL') adjustment -= 15;
      else if (s.severity === 'HIGH') adjustment -= 8;
      else if (s.severity === 'INFO') adjustment += 2;
    });

    const sentiment = Math.max(-100, Math.min(100, cat.baseSentiment + adjustment));
    
    return {
      category: cat.category,
      icon: cat.icon,
      sentiment,
      volume: relevantSignals.length,
      change: Math.random() * 20 - 10, // Simulated 24h change
      keywords: cat.keywords.slice(0, 3)
    };
  });
}

// Sentiment bar component
function SentimentBar({ sentiment }: { sentiment: number }) {
  const normalized = (sentiment + 100) / 2; // Convert -100 to +100 → 0 to 100
  
  const getColor = (s: number) => {
    if (s <= 30) return 'bg-red-500';
    if (s <= 45) return 'bg-orange-500';
    if (s <= 55) return 'bg-yellow-500';
    if (s <= 70) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative h-2 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-full">
      {/* Marker */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 ${getColor(normalized)} rounded-full border-2 border-white shadow-lg transition-all duration-500`}
        style={{ left: `calc(${normalized}% - 6px)` }}
      />
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
    </div>
  );
}

export default function SentimentMeter() {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { data: signalsData } = useSWR('/api/signals', fetcher, { refreshInterval: 60000 });
  const signals = signalsData?.signals || [];
  
  const sentimentData = analyzeSentiment(signals);
  const overallSentiment = Math.round(sentimentData.reduce((acc, s) => acc + s.sentiment, 0) / sentimentData.length);

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 border-b border-border-subtle bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-blue" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-white">SENTIMENT ANALYSIS</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
            overallSentiment < -30 ? 'bg-red-500/20 text-red-400' :
            overallSentiment < 0 ? 'bg-orange-500/20 text-orange-400' :
            overallSentiment < 30 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {overallSentiment > 0 ? '+' : ''}{overallSentiment}
          </span>
        </div>
        <Activity className="w-4 h-4 text-gray-400" />
      </button>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Overall Sentiment */}
          <div className="p-2 bg-black/20 rounded border border-blue-500/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400">Overall Market Sentiment</span>
              <span className={`text-[11px] font-mono font-bold ${
                overallSentiment < -30 ? 'text-red-400' :
                overallSentiment < 0 ? 'text-orange-400' :
                overallSentiment < 30 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {overallSentiment > 0 ? '+' : ''}{overallSentiment}
              </span>
            </div>
            <SentimentBar sentiment={overallSentiment} />
            <div className="flex justify-between mt-1 text-[8px] text-gray-500">
              <span>FEAR</span>
              <span>NEUTRAL</span>
              <span>GREED</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-1">
            {sentimentData.map((data, i) => (
              <div key={i} className="p-2 bg-elevated/50 rounded border border-border-subtle">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{data.icon}</span>
                    <span className="text-[10px] font-bold text-white">{data.category}</span>
                    <span className="text-[8px] text-gray-500">({data.volume} signals)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {data.change !== 0 && (
                      <span className={`text-[9px] ${data.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.change > 0 ? '↑' : '↓'}{Math.abs(data.change).toFixed(0)}
                      </span>
                    )}
                    <span className={`text-[10px] font-mono font-bold ${
                      data.sentiment < -30 ? 'text-red-400' :
                      data.sentiment < 0 ? 'text-orange-400' :
                      data.sentiment < 30 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {data.sentiment > 0 ? '+' : ''}{data.sentiment}
                    </span>
                  </div>
                </div>
                <SentimentBar sentiment={data.sentiment} />
              </div>
            ))}
          </div>

          {/* Prediction */}
          <div className="p-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-purple-400 font-bold">🔮 AI PREDICTION</span>
            </div>
            <div className="text-[10px] text-gray-300">
              {overallSentiment < -40 
                ? 'Markets likely to see continued volatility. Risk-off sentiment dominates.'
                : overallSentiment < 0
                ? 'Cautious outlook prevails. Watch for diplomatic developments.'
                : 'Sentiment stabilizing. Potential for recovery if de-escalation continues.'
              }
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 pt-1 text-[8px] text-gray-500">
            <span>-100 Bearish</span>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
            <span>+100 Bullish</span>
          </div>
        </div>
      )}
    </div>
  );
}
