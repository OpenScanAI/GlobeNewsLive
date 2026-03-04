'use client';

import { useState } from 'react';

interface DeductionResult {
  scenario: string;
  probability: number;
  timeframe: string;
  impacts: string[];
  confidence: 'low' | 'medium' | 'high';
}

const MOCK_DEDUCTIONS: Record<string, DeductionResult[]> = {
  default: [
    {
      scenario: 'Escalation of regional conflict',
      probability: 67,
      timeframe: '24-48 hours',
      impacts: ['Oil price spike +8-12%', 'Regional safe-haven demand', 'Aviation route disruptions'],
      confidence: 'medium',
    },
    {
      scenario: 'Diplomatic negotiation breakthrough',
      probability: 23,
      timeframe: '72 hours',
      impacts: ['Market stability', 'Ceasefire declaration', 'Humanitarian corridor opening'],
      confidence: 'low',
    },
    {
      scenario: 'Status quo maintained',
      probability: 10,
      timeframe: '7 days',
      impacts: ['Continued low-level skirmishes', 'Refugee flow continues', 'Sanctions persist'],
      confidence: 'high',
    },
  ],
};

export default function DeductionPanel() {
  const [query, setQuery] = useState('');
  const [geoCtx, setGeoCtx] = useState('');
  const [results, setResults] = useState<DeductionResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);

    // Simulate AI analysis
    await new Promise(r => setTimeout(r, 1800));

    setResults(MOCK_DEDUCTIONS.default);
    setLoading(false);
  };

  const confColor: Record<string, string> = {
    high: 'text-[#00ff88]',
    medium: 'text-yellow-400',
    low: 'text-red-400',
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[#00ff88] text-sm font-mono">🧠 AI DEDUCTION ENGINE</span>
        <span className="ml-auto text-[10px] text-white/30 font-mono">BETA</span>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-3 flex flex-col gap-2">
        <textarea
          className="w-full bg-black/40 border border-white/10 text-white text-xs font-mono rounded p-2 resize-none focus:outline-none focus:border-[#00ff88]/40 placeholder-white/20"
          rows={3}
          placeholder="E.g., What will happen in the next 24h in the South China Sea?"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <input
          className="w-full bg-black/40 border border-white/10 text-white text-xs font-mono rounded p-2 focus:outline-none focus:border-[#00ff88]/40 placeholder-white/20"
          placeholder="Optional: geographic or situation context..."
          value={geoCtx}
          onChange={e => setGeoCtx(e.target.value)}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !query.trim()}
          className="self-end px-4 py-1.5 bg-[#00ff88]/20 text-[#00ff88] text-xs font-mono rounded border border-[#00ff88]/30 hover:bg-[#00ff88]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'ANALYZING...' : 'ANALYZE →'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass-panel p-4 text-center">
          <div className="text-[#00ff88]/60 text-xs font-mono animate-pulse">
            Processing intelligence data...
          </div>
          <div className="mt-2 h-1 bg-[#00ff88]/10 rounded overflow-hidden">
            <div className="h-full bg-[#00ff88]/50 rounded animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">SCENARIO ANALYSIS</div>
          {results.map((r, i) => (
            <div key={i} className="glass-panel p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-mono">{r.scenario}</span>
                <span className={`text-xs font-mono font-bold ${confColor[r.confidence]}`}>
                  {r.probability}%
                </span>
              </div>

              {/* Probability Bar */}
              <div className="h-1.5 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${r.probability}%`,
                    background: r.probability > 50 ? '#ff4444' : r.probability > 25 ? '#ffaa00' : '#00ff88',
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-white/40">⏱ {r.timeframe}</span>
                <span className={`ml-auto ${confColor[r.confidence]}`}>
                  CONF: {r.confidence.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {r.impacts.map((imp, j) => (
                  <div key={j} className="text-[10px] text-white/60 font-mono flex items-start gap-1">
                    <span className="text-[#00ff88]/60 mt-0.5">▸</span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && (
        <div className="flex-1 flex items-center justify-center text-white/20 text-xs font-mono text-center">
          Enter a question to generate<br />AI-powered scenario analysis
        </div>
      )}
    </div>
  );
}
