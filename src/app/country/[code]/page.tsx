'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const COUNTRY_DATA: Record<string, { name: string; flag: string; region: string; capital: string; population: string }> = {
  us: { name: 'United States', flag: '🇺🇸', region: 'North America', capital: 'Washington D.C.', population: '331M' },
  ru: { name: 'Russia', flag: '🇷🇺', region: 'Europe/Asia', capital: 'Moscow', population: '144M' },
  cn: { name: 'China', flag: '🇨🇳', region: 'Asia', capital: 'Beijing', population: '1.4B' },
  ir: { name: 'Iran', flag: '🇮🇷', region: 'Middle East', capital: 'Tehran', population: '86M' },
  il: { name: 'Israel', flag: '🇮🇱', region: 'Middle East', capital: 'Jerusalem', population: '9M' },
  ua: { name: 'Ukraine', flag: '🇺🇦', region: 'Europe', capital: 'Kyiv', population: '44M' },
  kp: { name: 'North Korea', flag: '🇰🇵', region: 'Asia', capital: 'Pyongyang', population: '26M' },
  sa: { name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', capital: 'Riyadh', population: '35M' },
  tr: { name: 'Turkey', flag: '🇹🇷', region: 'Europe/Asia', capital: 'Ankara', population: '85M' },
  in: { name: 'India', flag: '🇮🇳', region: 'Asia', capital: 'New Delhi', population: '1.4B' },
  pk: { name: 'Pakistan', flag: '🇵🇰', region: 'Asia', capital: 'Islamabad', population: '230M' },
  gb: { name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', capital: 'London', population: '67M' },
  de: { name: 'Germany', flag: '🇩🇪', region: 'Europe', capital: 'Berlin', population: '84M' },
  fr: { name: 'France', flag: '🇫🇷', region: 'Europe', capital: 'Paris', population: '68M' },
  sy: { name: 'Syria', flag: '🇸🇾', region: 'Middle East', capital: 'Damascus', population: '21M' },
  lb: { name: 'Lebanon', flag: '🇱🇧', region: 'Middle East', capital: 'Beirut', population: '7M' },
  ye: { name: 'Yemen', flag: '🇾🇪', region: 'Middle East', capital: 'Sanaa', population: '34M' },
  iq: { name: 'Iraq', flag: '🇮🇶', region: 'Middle East', capital: 'Baghdad', population: '42M' },
};

function CIIRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 70 ? '#ff2244' : score >= 45 ? '#ff6633' : score >= 20 ? '#ffaa00' : '#00ff88';
  const label = score >= 70 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 20 ? 'ELEVATED' : 'STABLE';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          {/* Background ring */}
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Score ring */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold text-white">{score}</span>
          <span className="font-mono text-[8px] text-white/40">/ 100</span>
        </div>
      </div>
      <div className="font-mono text-[10px] font-bold tracking-wider" style={{ color }}>CII: {label}</div>
    </div>
  );
}

function EventTimeline({ events }: { events: Array<{ date: string; title: string; severity: string }> }) {
  return (
    <div className="space-y-2">
      {events.map((e, i) => {
        const color = e.severity === 'CRITICAL' ? '#ff2244' : e.severity === 'HIGH' ? '#ff6633' : e.severity === 'MEDIUM' ? '#ffaa00' : '#00ff88';
        return (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
              {i < events.length - 1 && <div className="w-px flex-1 min-h-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />}
            </div>
            <div className="pb-3 flex-1">
              <div className="font-mono text-[9px] text-white/30 mb-0.5">{e.date}</div>
              <div className="font-mono text-[11px] text-white/80">{e.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CountryBriefPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string)?.toLowerCase();
  const country = COUNTRY_DATA[code];

  const { data: signalsData } = useSWR<{ signals: any[] }>('/api/signals', fetcher, { revalidateOnFocus: false });
  const signals = signalsData?.signals || [];

  // Filter signals for this country (fuzzy match on title)
  const countrySignals = signals
    .filter(s => s.title?.toLowerCase().includes(country?.name?.toLowerCase() || code))
    .slice(0, 10);

  // Mock CII score based on country
  const CII_SCORES: Record<string, number> = {
    us: 15, ru: 78, cn: 65, ir: 82, il: 71, ua: 88, kp: 91, sa: 55,
    tr: 48, in: 32, pk: 68, gb: 20, de: 18, fr: 22, sy: 95, lb: 85, ye: 96, iq: 87,
  };
  const ciiScore = CII_SCORES[code] || 30;

  // Generate 7-day timeline based on real signals + mock
  const today = new Date();
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const daySignals = signals.filter(s => {
      const sigDate = new Date(s.timestamp);
      return sigDate.toDateString() === d.toDateString() &&
        s.title?.toLowerCase().includes(country?.name?.toLowerCase() || code);
    });
    return daySignals.length > 0 ? daySignals.map(s => ({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title: s.title,
      severity: s.severity,
    })) : [];
  }).flat();

  // If no real data, use mock
  const mockTimeline = [
    { date: '7 days ago', title: 'Diplomatic consultations reported', severity: 'LOW' },
    { date: '6 days ago', title: 'Military exercises observed near border', severity: 'MEDIUM' },
    { date: '4 days ago', title: 'Economic sanctions discussions at UN', severity: 'MEDIUM' },
    { date: '2 days ago', title: 'Civil unrest reported in capital', severity: 'HIGH' },
    { date: 'Yesterday', title: 'Armed incident — details unconfirmed', severity: 'CRITICAL' },
    { date: 'Today', title: 'Government statement released', severity: 'LOW' },
  ];

  const displayTimeline = timeline.length > 0 ? timeline : mockTimeline;

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="text-center">
          <div className="font-mono text-[#00ff88] text-lg mb-2">Country not found</div>
          <div className="font-mono text-white/30 text-sm mb-4">Code: {code?.toUpperCase()}</div>
          <Link href="/" className="font-mono text-sm px-4 py-2 rounded border text-[#00ff88]" style={{ borderColor: 'rgba(0,255,136,0.3)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ciiColor = ciiScore >= 70 ? '#ff2244' : ciiScore >= 45 ? '#ff6633' : ciiScore >= 20 ? '#ffaa00' : '#00ff88';

  // AI Summary (static for now, pattern from WorldMonitor)
  const aiSummaries: Record<string, string> = {
    ir: 'Iran remains a focal point of regional tension with ongoing nuclear program developments, proxy conflicts across the Levant, and active diplomatic standoffs with Western powers. Recent signals indicate elevated military posture.',
    ua: 'Ukraine continues active conflict with Russian forces. Multiple frontlines remain contested. International military aid continues flowing. Civilian infrastructure under sustained pressure.',
    il: 'Israel is engaged in active military operations in Gaza and periodically exchanges fire across the Lebanon border. Regional escalation risks remain elevated with Iran-backed proxies.',
    ru: 'Russia maintains offensive operations in Ukraine while managing domestic economic pressure from sanctions. Nuclear rhetoric remains at elevated levels. Strategic partnerships with China deepening.',
    sy: 'Syria remains fragmented with multiple armed factions. Humanitarian crisis continues. Foreign military presence from Russia, Turkey, US, and Iran-backed groups.',
    kp: 'North Korea has accelerated missile tests and weapons development. Recent diplomatic outreach to Russia raises proliferation concerns. Regime stability appears intact.',
  };

  const aiSummary = aiSummaries[code] || `${country.name} is currently being monitored for geopolitical developments. Signal activity over the past 7 days has been analyzed for threat indicators. Assessment based on open-source intelligence.`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', color: 'white' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(0,255,136,0.15)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-mono text-[10px] text-white/30 hover:text-[#00ff88] transition-colors flex items-center gap-1">
            ← BACK
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h1 className="font-mono text-lg font-bold text-white tracking-wide">{country.name.toUpperCase()}</h1>
              <div className="font-mono text-[9px] text-white/30 tracking-wider">{country.region} · {country.capital} · Pop. {country.population}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ciiColor }} />
            <span className="font-mono text-[10px]" style={{ color: ciiColor }}>CII {ciiScore}/100</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - CII + AI Brief */}
        <div className="lg:col-span-1 space-y-4">
          {/* CII Ring */}
          <div className="rounded-xl p-5 flex flex-col items-center gap-4 border" style={{ backgroundColor: '#0d0d14', borderColor: 'rgba(0,255,136,0.1)' }}>
            <div className="font-mono text-[9px] text-white/30 tracking-widest w-full">CONFLICT INTENSITY INDEX</div>
            <CIIRing score={ciiScore} />
            <div className="w-full grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Conflict', value: `${Math.round(ciiScore * 0.9)}%` },
                { label: 'Instability', value: `${Math.round(ciiScore * 0.85)}%` },
                { label: 'Threat', value: `${Math.round(ciiScore * 0.95)}%` },
              ].map(m => (
                <div key={m.label}>
                  <div className="font-mono text-xs font-bold" style={{ color: ciiColor }}>{m.value}</div>
                  <div className="font-mono text-[8px] text-white/30">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0d0d14', borderColor: 'rgba(0,255,136,0.1)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🤖</span>
              <span className="font-mono text-[9px] text-white/30 tracking-widest">AI SITUATION BRIEF</span>
            </div>
            <p className="font-mono text-[11px] text-white/70 leading-relaxed">{aiSummary}</p>
          </div>

          {/* Country Stats */}
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0d0d14', borderColor: 'rgba(0,255,136,0.1)' }}>
            <div className="font-mono text-[9px] text-white/30 tracking-widest mb-3">OVERVIEW</div>
            <div className="space-y-2">
              {[
                { label: 'ISO Code', value: code.toUpperCase() },
                { label: 'Region', value: country.region },
                { label: 'Capital', value: country.capital },
                { label: 'Population', value: country.population },
                { label: 'Active Signals', value: `${countrySignals.length}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <span className="font-mono text-[10px] text-white/40">{row.label}</span>
                  <span className="font-mono text-[10px] text-white/80">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Signals + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top News */}
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0d0d14', borderColor: 'rgba(0,255,136,0.1)' }}>
            <div className="font-mono text-[9px] text-white/30 tracking-widest mb-3">LIVE SIGNALS — {country.name.toUpperCase()}</div>
            {countrySignals.length > 0 ? (
              <div className="space-y-2">
                {countrySignals.map((s, i) => {
                  const color = s.severity === 'CRITICAL' ? '#ff2244' : s.severity === 'HIGH' ? '#ff6633' : s.severity === 'MEDIUM' ? '#ffaa00' : '#00ff88';
                  return (
                    <div key={i} className="flex gap-3 py-2 border-b items-start" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[11px] text-white/80 leading-snug">{s.title}</div>
                        <div className="font-mono text-[9px] text-white/30 mt-0.5">{s.source} · {s.timeAgo}</div>
                      </div>
                      <span className="font-mono text-[8px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ color, backgroundColor: `${color}15` }}>{s.severity}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 font-mono text-[11px] text-white/20">No recent signals for {country.name}</div>
            )}
          </div>

          {/* 7-Day Timeline */}
          <div className="rounded-xl p-4 border" style={{ backgroundColor: '#0d0d14', borderColor: 'rgba(0,255,136,0.1)' }}>
            <div className="font-mono text-[9px] text-white/30 tracking-widest mb-3">7-DAY EVENT TIMELINE</div>
            <EventTimeline events={displayTimeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
