"use client";

import { useEffect, useRef } from "react";
import type { FinanceData } from "@/types/finance";

interface TickerItem {
  label: string;
  value: string;
  change: number | null;
  sparkline?: number[];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 40;
  const h = 14;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FinanceTickerProps {
  data: FinanceData | undefined;
}

export default function FinanceTicker({ data }: FinanceTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let pos = 0;
    const step = () => {
      pos -= 0.5;
      if (Math.abs(pos) >= el.scrollWidth / 2) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data]);

  const items: TickerItem[] = [];
  if (data) {
    data.indices.forEach((i) =>
      items.push({
        label: i.display,
        value: i.price !== null ? i.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—",
        change: i.change,
        sparkline: i.sparkline?.slice(-20),
      })
    );
    data.commodities.forEach((c) =>
      items.push({
        label: c.display,
        value: c.price !== null ? c.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—",
        change: c.change,
        sparkline: c.sparkline?.slice(-20),
      })
    );
    data.crypto.forEach((c) =>
      items.push({
        label: c.display,
        value: c.price !== null ? c.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—",
        change: c.change24h,
      })
    );
    data.forex.forEach((f) =>
      items.push({
        label: f.display,
        value: f.price !== null ? f.price.toFixed(4) : "—",
        change: f.change,
        sparkline: f.sparkline?.slice(-20),
      })
    );
    // VIX
    if (data.vix) {
      items.push({
        label: "VIX",
        value: data.vix.price !== null ? data.vix.price.toFixed(2) : "—",
        change: data.vix.change,
        sparkline: data.vix.sparkline?.slice(-20),
      });
    }
    // Treasury
    data.treasuryYields?.forEach((t) =>
      items.push({
        label: t.display,
        value: t.price !== null ? `${t.price.toFixed(2)}%` : "—",
        change: t.change,
      })
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-950 border-b border-gray-800 py-1.5 overflow-hidden">
        <div className="text-[10px] font-mono text-gray-500 px-3">Loading market data…</div>
      </div>
    );
  }

  const renderItem = (item: TickerItem, idx: number) => {
    const isUp = (item.change ?? 0) > 0;
    const isDown = (item.change ?? 0) < 0;
    const color = isUp ? "#4ade80" : isDown ? "#f87171" : "#fbbf24";
    const arrow = isUp ? "▲" : isDown ? "▼" : "—";
    return (
      <span key={idx} className="inline-flex items-center gap-1.5 mx-4 whitespace-nowrap">
        <span className="text-[10px] text-gray-400 font-mono">{item.label}</span>
        {item.sparkline && item.sparkline.length > 1 && (
          <MiniSparkline data={item.sparkline} color={color} />
        )}
        <span className="text-[11px] text-white font-mono">{item.value}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>
          {arrow} {item.change !== null ? `${Math.abs(item.change).toFixed(2)}%` : "—"}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-gray-950 border-b border-gray-800 py-1.5 overflow-hidden relative">
      <div ref={scrollRef} className="flex whitespace-nowrap will-change-transform">
        {[...items, ...items].map((item, idx) => renderItem(item, idx))}
      </div>
    </div>
  );
}
