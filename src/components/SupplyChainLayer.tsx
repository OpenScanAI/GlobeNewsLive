'use client';

import { useState, useEffect } from 'react';
import { MAJOR_PORTS, CHOKEPOINTS, TRADE_ROUTES } from '@/lib/supply-chain';

interface SupplyChainMapData {
  ports: Array<{
    name: string;
    status: string;
    lat: number;
    lon: number;
  }>;
  chokepoints: Array<{
    name: string;
    status: string;
    lat: number;
    lon: number;
    delayHours: number;
  }>;
  routes: Array<{
    name: string;
    from: string;
    to: string;
    via: string[];
    status: string;
  }>;
}

export default function SupplyChainLayer() {
  const [data, setData] = useState<SupplyChainMapData | null>(null);

  useEffect(() => {
    fetch('/api/supply-chain')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  const statusColors: Record<string, string> = {
    normal: '#00ff88',
    congested: '#ff6633',
    restricted: '#ffaa00',
    closed: '#ff2244',
    open: '#00ff88',
    delayed: '#ff2244',
    partial: '#ff6633',
  };

  // Get port coordinates
  const getPortCoords = (name: string) => {
    const port = MAJOR_PORTS.find((p) => p.name === name);
    return port ? { x: ((port.lon + 180) / 360) * 100, y: ((90 - port.lat) / 180) * 100 } : null;
  };

  // Get chokepoint coordinates
  const getChokepointCoords = (name: string) => {
    const cp = CHOKEPOINTS.find((c) => c.name === name);
    return cp ? { x: ((cp.lon + 180) / 360) * 100, y: ((90 - cp.lat) / 180) * 100 } : null;
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Route lines */}
        {data.routes.map((route) => {
          const from = getPortCoords(route.from);
          const to = getPortCoords(route.to);
          if (!from || !to) return null;

          const color = statusColors[route.status] || '#00ff88';
          const isDisrupted = route.status === 'delayed' || route.status === 'partial';

          return (
            <g key={route.name}>
              {/* Main route line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={isDisrupted ? 0.3 : 0.15}
                strokeDasharray={isDisrupted ? '2,1' : 'none'}
                opacity={isDisrupted ? 0.8 : 0.4}
              />
              {/* Animated pulse for disrupted routes */}
              {isDisrupted && (
                <circle r="0.8" fill={color} opacity="0.6">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                  />
                </circle>
              )}
            </g>
          );
        })}

        {/* Chokepoint markers */}
        {data.chokepoints.map((cp) => {
          const coords = { x: ((cp.lon + 180) / 360) * 100, y: ((90 - cp.lat) / 180) * 100 };
          const color = statusColors[cp.status] || '#00ff88';
          const isDisrupted = cp.status === 'delayed' || cp.status === 'partial';

          return (
            <g key={cp.name}>
              {/* Outer ring for disrupted chokepoints */}
              {isDisrupted && (
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="1.5"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.2"
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    values="1.5;2.5;1.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0.2;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              {/* Core marker */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isDisrupted ? 1 : 0.6}
                fill={color}
                opacity={isDisrupted ? 0.9 : 0.6}
              />
            </g>
          );
        })}

        {/* Port markers */}
        {data.ports.map((port) => {
          const portDef = MAJOR_PORTS.find((p) => p.name === port.name);
          if (!portDef) return null;
          const coords = { x: ((portDef.lon + 180) / 360) * 100, y: ((90 - portDef.lat) / 180) * 100 };
          const color = statusColors[port.status] || '#00ff88';
          const isDisrupted = port.status === 'congested' || port.status === 'restricted' || port.status === 'closed';

          return (
            <g key={port.name}>
              {/* Port dot */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r={isDisrupted ? 0.8 : 0.5}
                fill={color}
                opacity={isDisrupted ? 0.9 : 0.5}
              />
              {/* Label for major ports */}
              {['Shanghai', 'Singapore', 'Rotterdam', 'Los Angeles', 'Dubai (Jebel Ali)'].includes(port.name) && (
                <text
                  x={coords.x + 1}
                  y={coords.y - 1}
                  fill="white"
                  fontSize="2"
                  opacity="0.7"
                  fontFamily="monospace"
                >
                  {port.name.split(' ')[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
