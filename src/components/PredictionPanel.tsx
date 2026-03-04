'use client';

import { PredictionMarket } from '@/types';

interface PredictionPanelProps {
  predictions: PredictionMarket[];
  loading?: boolean;
}

function ProbabilityBar({ probability }: { probability: number }) {
  const color = probability > 70 ? '#00ff88' : probability > 30 ? '#ffaa00' : '#ff2244';
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${probability}%`, backgroundColor: color }}
        />
      </div>
      <span 
        className="font-mono text-[12px] font-bold w-10 text-right"
        style={{ color }}
      >
        {probability}%
      </span>
    </div>
  );
}

function PredictionItem({ prediction }: { prediction: PredictionMarket }) {
  const changeColor = prediction.change24h >= 0 ? '#00ff88' : '#ff2244';
  
  return (
    <div className="p-2 bg-elevated/50 rounded border border-border-subtle hover:border-border-default transition-colors">
      <div className="text-[10px] text-white/90 leading-tight mb-2">
        {prediction.question}
      </div>
      
      <ProbabilityBar probability={prediction.probability} />
      
      <div className="flex items-center justify-between mt-1.5 text-[9px]">
        <span className="text-text-dim">
          {prediction.source}
        </span>
        <span style={{ color: changeColor }} className="font-mono">
          {prediction.change24h >= 0 ? '+' : ''}{prediction.change24h}% 24h
        </span>
      </div>
    </div>
  );
}

export default function PredictionPanel({ predictions, loading }: PredictionPanelProps) {
  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-panel/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-accent-gold">
            PREDICTION MARKETS
          </span>
        </div>
        {loading && (
          <span className="text-accent-gold text-[10px] animate-pulse">⟳</span>
        )}
      </div>
      
      <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
        {predictions.length === 0 ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-border-default rounded" />
            ))}
          </div>
        ) : (
          predictions.slice(0, 5).map((prediction) => (
            <PredictionItem key={prediction.id} prediction={prediction} />
          ))
        )}
      </div>
      
      <div className="px-3 py-1.5 border-t border-border-subtle bg-panel/30">
        <div className="text-[9px] text-text-dim text-center">
          Data from Polymarket • Not financial advice
        </div>
      </div>
    </div>
  );
}
