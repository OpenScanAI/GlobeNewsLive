'use client';

import { HistoricalData } from '@/data/economicExtended';

interface HistoricalTrendPanelProps {
  data: HistoricalData;
}

export default function HistoricalTrendPanel({ data }: HistoricalTrendPanelProps) {
  const { years, gdpGrowth, inflation, unemployment, debtToGdp } = data;

  const width = 280;
  const height = 80;
  const padding = { top: 5, right: 5, bottom: 15, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = [...gdpGrowth, ...inflation, ...unemployment, ...debtToGdp].filter((v): v is number => v !== null);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  const scaleY = (val: number | null) => {
    if (val === null) return null;
    return chartHeight - ((val - minVal) / range) * chartHeight + padding.top;
  };

  const scaleX = (index: number) => padding.left + (index / (years.length - 1)) * chartWidth;

  const linePath = (values: (number | null)[]) => {
    const points = values.map((v, i) => {
      const y = scaleY(v);
      if (y === null) return null;
      return `${scaleX(i)},${y}`;
    }).filter(Boolean);
    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  };

  const colors = {
    gdpGrowth: '#00C9A7',
    inflation: '#F0C000',
    unemployment: '#FF6B6B',
    debtToGdp: '#378ADD',
  };

  const metrics = [
    { key: 'gdpGrowth', label: 'GDP Growth', values: gdpGrowth, color: colors.gdpGrowth },
    { key: 'inflation', label: 'Inflation', values: inflation, color: colors.inflation },
    { key: 'unemployment', label: 'Unemployment', values: unemployment, color: colors.unemployment },
    { key: 'debtToGdp', label: 'Debt/GDP', values: debtToGdp, color: colors.debtToGdp },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">📈</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Historical Trends</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.key}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: metric.color }} />
              <span className="text-xs text-white/50 font-medium">{metric.label}</span>
            </div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: 70 }}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={padding.left}
                  y1={padding.top + chartHeight * pct}
                  x2={width - padding.right}
                  y2={padding.top + chartHeight * pct}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* X axis labels */}
              {years.map((year, i) => (
                <text
                  key={year}
                  x={scaleX(i)}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-white/20"
                  style={{ fontSize: '9px', fontFamily: 'monospace' }}
                >
                  {year}
                </text>
              ))}

              {/* Line */}
              <path
                d={linePath(metric.values)}
                fill="none"
                stroke={metric.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dots */}
              {metric.values.map((v, i) => {
                const y = scaleY(v);
                if (y === null) return null;
                return (
                  <circle
                    key={i}
                    cx={scaleX(i)}
                    cy={y}
                    r="2"
                    fill={metric.color}
                    opacity="0.8"
                  />
                );
              })}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
