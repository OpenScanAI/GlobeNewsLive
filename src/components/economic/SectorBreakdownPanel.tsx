'use client';

import { SectorBreakdown } from '@/data/economicExtended';

interface SectorBreakdownPanelProps {
  data: SectorBreakdown;
}

export default function SectorBreakdownPanel({ data }: SectorBreakdownPanelProps) {
  const { services, industry, agriculture } = data;
  const total = services + industry + agriculture;

  // SVG doughnut chart
  const size = 120;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const servicesOffset = 0;
  const servicesLength = (services / total) * circumference;
  const industryOffset = servicesLength;
  const industryLength = (industry / total) * circumference;
  const agricultureOffset = servicesLength + industryLength;
  const agricultureLength = (agriculture / total) * circumference;

  const colors = {
    services: '#378ADD',
    industry: '#00C9A7',
    agriculture: '#F0C000',
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-5 hover:border-white/10 transition-all duration-200">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-sm">🏭</span>
        <span className="text-sm text-white/40 tracking-wide uppercase font-medium">Sector Breakdown</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Doughnut */}
        <svg width={size} height={size} className="shrink-0">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Services */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.services}
            strokeWidth={strokeWidth}
            strokeDasharray={`${servicesLength} ${circumference - servicesLength}`}
            strokeDashoffset={-servicesOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Industry */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.industry}
            strokeWidth={strokeWidth}
            strokeDasharray={`${industryLength} ${circumference - industryLength}`}
            strokeDashoffset={-industryOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Agriculture */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.agriculture}
            strokeWidth={strokeWidth}
            strokeDasharray={`${agricultureLength} ${circumference - agricultureLength}`}
            strokeDashoffset={-agricultureOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />
          {/* Center text */}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            className="fill-white/80"
            style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}
          >
            {services.toFixed(0)}%
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            className="fill-white/40"
            style={{ fontSize: '8px', fontFamily: 'monospace' }}
          >
            Services
          </text>
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.services }} />
              <span className="text-sm text-white/60">Services</span>
            </div>
            <span className="text-sm text-white/80 font-medium">{services.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.industry }} />
              <span className="text-sm text-white/60">Industry</span>
            </div>
            <span className="text-sm text-white/80 font-medium">{industry.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.agriculture }} />
              <span className="text-sm text-white/60">Agriculture</span>
            </div>
            <span className="text-sm text-white/80 font-medium">{agriculture.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
