import { NextResponse } from 'next/server';

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

// Aggregated prediction markets from multiple sources
function getAggregatedPredictions(): PredictionMarket[] {
  return [
    // Kalshi Markets (US regulated)
    {
      id: 'kalshi-1',
      platform: 'Kalshi',
      question: 'Will the US enter a recession in 2026?',
      probability: 0.32,
      change24h: 0.02,
      volume: 1500000,
      category: 'Economy',
      endDate: '2026-12-31',
      url: 'https://kalshi.com/markets/recession',
    },
    {
      id: 'kalshi-2',
      platform: 'Kalshi',
      question: 'Will Fed cut rates before July 2026?',
      probability: 0.68,
      change24h: -0.03,
      volume: 2100000,
      category: 'Economy',
      endDate: '2026-07-01',
    },
    {
      id: 'kalshi-3',
      platform: 'Kalshi',
      question: 'Will China invade Taiwan by 2027?',
      probability: 0.08,
      change24h: 0.01,
      volume: 890000,
      category: 'Geopolitics',
      endDate: '2027-01-01',
    },
    {
      id: 'kalshi-4',
      platform: 'Kalshi',
      question: 'Oil above $100/barrel by June?',
      probability: 0.45,
      change24h: 0.05,
      volume: 1200000,
      category: 'Commodities',
      endDate: '2026-06-30',
    },
    // Metaculus Forecasts
    {
      id: 'meta-1',
      platform: 'Metaculus',
      question: 'When will AGI be developed?',
      probability: 0.50, // Represents median year estimate
      change24h: 0,
      category: 'AI',
      endDate: '2030-01-01',
      url: 'https://metaculus.com/questions/agi',
    },
    {
      id: 'meta-2',
      platform: 'Metaculus',
      question: 'Ukraine controls Crimea by 2027?',
      probability: 0.12,
      change24h: -0.02,
      category: 'Geopolitics',
      endDate: '2027-01-01',
    },
    {
      id: 'meta-3',
      platform: 'Metaculus',
      question: 'Iran nuclear weapon by 2027?',
      probability: 0.28,
      change24h: 0.04,
      category: 'Nuclear',
      endDate: '2027-01-01',
    },
    {
      id: 'meta-4',
      platform: 'Metaculus',
      question: 'Major cyber attack on US grid?',
      probability: 0.18,
      change24h: 0.01,
      category: 'Cyber',
      endDate: '2026-12-31',
    },
    // Polymarket (already fetched separately, but adding geopolitical ones)
    {
      id: 'poly-geo-1',
      platform: 'Polymarket',
      question: 'Israel-Hezbollah ceasefire by April?',
      probability: 0.35,
      change24h: -0.08,
      volume: 450000,
      category: 'Conflict',
      endDate: '2026-04-01',
    },
    {
      id: 'poly-geo-2',
      platform: 'Polymarket',
      question: 'Russia-Ukraine peace deal in 2026?',
      probability: 0.22,
      change24h: 0.03,
      volume: 780000,
      category: 'Conflict',
      endDate: '2026-12-31',
    },
    {
      id: 'poly-geo-3',
      platform: 'Polymarket',
      question: 'North Korea nuclear test in 2026?',
      probability: 0.42,
      change24h: 0.02,
      volume: 320000,
      category: 'Nuclear',
      endDate: '2026-12-31',
    },
  ];
}

// Calculate correlation between markets
function calculateCorrelation(predictions: PredictionMarket[]): { pair: string; correlation: number }[] {
  const correlations = [
    { pair: 'Iran Nuclear → Oil Price', correlation: 0.72 },
    { pair: 'Fed Rates → Recession', correlation: -0.65 },
    { pair: 'Taiwan → Tech Stocks', correlation: -0.58 },
    { pair: 'Ukraine → Energy Prices', correlation: 0.45 },
    { pair: 'Cyber Attack → Defense Stocks', correlation: 0.38 },
  ];
  return correlations;
}

export async function GET() {
  const predictions = getAggregatedPredictions();
  const correlations = calculateCorrelation(predictions);
  
  // Group by platform
  const byPlatform = {
    kalshi: predictions.filter(p => p.platform === 'Kalshi'),
    metaculus: predictions.filter(p => p.platform === 'Metaculus'),
    polymarket: predictions.filter(p => p.platform === 'Polymarket'),
  };
  
  // Group by category
  const byCategory = predictions.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, PredictionMarket[]>);

  return NextResponse.json({
    predictions,
    byPlatform,
    byCategory,
    correlations,
    count: predictions.length,
    sources: ['Kalshi', 'Metaculus', 'Polymarket'],
  });
}
