'use client';

import { useEffect, useRef, useState } from 'react';

interface ThreatSignal {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
  category: 'confirmed' | 'cluster' | 'monitoring' | 'context';
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const CATEGORY_COLORS = {
  confirmed: '#ff3333',
  cluster: '#4488ff',
  monitoring: '#ff8800',
  context: '#00cc88',
};

interface ThreatMapProps {
  signals: ThreatSignal[];
  selectedSignal: string | null;
  onSelectSignal: (id: string | null) => void;
}

export default function ThreatMap({ signals, selectedSignal, onSelectSignal }: ThreatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Simple equirectangular projection
  const project = (lat: number, lng: number, width: number, height: number) => {
    const x = (lng + 180) / 360 * width;
    const y = (90 - lat) / 180 * height;
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Draw dark grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 360; i += 30) {
      const x = (i / 360) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = -90; i <= 90; i += 30) {
      const y = ((90 - i) / 180) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw improved continent shapes
    ctx.strokeStyle = 'rgba(100,120,140,0.15)';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(30,40,55,0.5)';

    const drawContinent = (points: number[][]) => {
      if (points.length < 2) return;
      ctx.beginPath();
      const start = project(points[0][0], points[0][1], w, h);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < points.length; i++) {
        const p = project(points[i][0], points[i][1], w, h);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    const continents = [
      [[72,-168],[75,-140],[72,-100],[65,-85],[55,-70],[48,-60],[42,-65],[38,-75],[30,-85],[25,-100],[28,-115],[35,-120],[45,-125],[55,-130],[65,-140],[72,-168]],
      [[12,-72],[8,-60],[5,-50],[2,-35],[-5,-35],[-10,-40],[-18,-45],[-25,-45],[-32,-52],[-38,-58],[-45,-65],[-52,-75],[-42,-75],[-30,-72],[-20,-70],[-10,-72],[12,-72]],
      [[72,-25],[75,10],[72,25],[65,30],[60,25],[55,35],[50,30],[45,10],[40,0],[42,-10],[48,-5],[55,-10],[60,-5],[65,-10],[70,-15],[72,-25]],
      [[38,-10],[35,10],[30,15],[25,15],[15,15],[5,10],[-5,12],[-15,12],[-25,15],[-30,18],[-33,25],[-30,32],[-25,35],[-15,35],[-5,32],[5,30],[15,25],[25,20],[30,15],[35,10],[38,-10]],
      [[75,40],[72,50],[65,60],[55,75],[45,85],[35,100],[25,110],[15,115],[10,110],[15,100],[25,90],[35,80],[45,70],[55,60],[65,55],[75,50],[78,40],[75,40]],
      [[-12,115],[-15,125],[-20,135],[-25,140],[-30,145],[-35,145],[-38,140],[-35,130],[-30,125],[-25,120],[-20,118],[-15,116],[-12,115]],
      [[72,-55],[78,-45],[80,-30],[78,-20],[72,-25],[68,-35],[68,-45],[72,-55]],
      [[45,140],[40,142],[35,140],[32,135],[35,130],[40,135],[45,140]],
      [[60,-10],[58,-5],[55,-2],[52,0],[50,-5],[52,-10],[55,-8],[58,-6],[60,-10]],
      [[5,95],[0,100],[-5,105],[-8,110],[-5,115],[0,120],[5,125],[8,120],[5,110],[5,95]],
    ];

    continents.forEach(drawContinent);

    // Draw signals
    signals.forEach((signal, idx) => {
      const pos = project(signal.lat, signal.lng, w, h);
      const isSelected = selectedSignal === signal.id;
      const isHovered = hovered === signal.id;
      const color = CATEGORY_COLORS[signal.category];

      // Pulse ring
      const time = Date.now() / 1000;
      const pulseRadius = 10 + Math.sin(time * 2 + idx * 1.5) * 5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = color + '12';
      ctx.fill();

      // Outer glow
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected ? 16 : isHovered ? 13 : 10, 0, Math.PI * 2);
      ctx.fillStyle = color + '25';
      ctx.fill();

      // Main marker
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isSelected ? 9 : isHovered ? 7 : 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White center dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Number label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((idx + 1).toString(), pos.x, pos.y + 1);

      // Tooltip
      if (isSelected || isHovered) {
        const tooltipW = 200;
        const tooltipH = 55;
        const tooltipX = Math.min(pos.x + 18, w - tooltipW - 10);
        const tooltipY = Math.max(pos.y - tooltipH - 12, 10);

        // Tooltip bg
        ctx.fillStyle = 'rgba(10,12,20,0.92)';
        ctx.strokeStyle = color + '50';
        ctx.lineWidth = 1;
        roundRect(ctx, tooltipX, tooltipY, tooltipW, tooltipH, 8);
        ctx.fill();
        ctx.stroke();

        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        const title = signal.title.length > 30 ? signal.title.substring(0, 30) + '...' : signal.title;
        ctx.fillText(title, tooltipX + 10, tooltipY + 18);

        // Location + severity
        ctx.fillStyle = color;
        ctx.font = '9px monospace';
        ctx.fillText(`${signal.location} • ${signal.severity.toUpperCase()}`, tooltipX + 10, tooltipY + 34);

        // Date + source
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '8px monospace';
        ctx.fillText(`${signal.date} • ${signal.source}`, tooltipX + 10, tooltipY + 48);
      }
    });
  }, [signals, selectedSignal, hovered]);

  // Animation loop
  useEffect(() => {
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Trigger redraw via state toggle
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found: string | null = null;
    signals.forEach(signal => {
      const pos = project(signal.lat, signal.lng, rect.width, rect.height);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < 14) found = signal.id;
    });
    setHovered(found);
  };

  const handleClick = () => {
    if (hovered) {
      onSelectSignal(hovered === selectedSignal ? null : hovered);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(null)}
      onClick={handleClick}
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
