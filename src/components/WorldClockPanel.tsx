'use client';

import { useState, useEffect } from 'react';

interface CityEntry {
  id: string;
  city: string;
  country: string;
  flag: string;
  timezone: string;
  marketOpen?: number;
  marketClose?: number;
  significance: string;
}

const KEY_CITIES: CityEntry[] = [
  { id: 'washington', city: 'Washington DC', country: 'USA', flag: '🇺🇸', timezone: 'America/New_York', marketOpen: 9, marketClose: 16, significance: 'US Capital / NSC / Pentagon' },
  { id: 'london', city: 'London', country: 'UK', flag: '🇬🇧', timezone: 'Europe/London', marketOpen: 8, marketClose: 16, significance: 'NATO HQ / LSE / GCHQ' },
  { id: 'moscow', city: 'Moscow', country: 'Russia', flag: '🇷🇺', timezone: 'Europe/Moscow', significance: 'Kremlin / GRU / FSB' },
  { id: 'tehran', city: 'Tehran', country: 'Iran', flag: '🇮🇷', timezone: 'Asia/Tehran', significance: 'IRGC HQ / Revolutionary Council' },
  { id: 'beijing', city: 'Beijing', country: 'China', flag: '🇨🇳', timezone: 'Asia/Shanghai', marketOpen: 9, marketClose: 15, significance: 'PLA HQ / Zhongnanhai / PBoC' },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', timezone: 'Asia/Tokyo', marketOpen: 9, marketClose: 15, significance: 'JSDF / BOJ / US Forces Japan' },
  { id: 'jerusalem', city: 'Jerusalem', country: 'Israel', flag: '🇮🇱', timezone: 'Asia/Jerusalem', significance: 'IDF HQ / Mossad / AMAN' },
  { id: 'brussels', city: 'Brussels', country: 'EU', flag: '🇪🇺', timezone: 'Europe/Brussels', significance: 'NATO HQ / EU Council' },
  { id: 'pyongyang', city: 'Pyongyang', country: 'N. Korea', flag: '🇰🇵', timezone: 'Asia/Pyongyang', significance: 'KPA / Nuclear Command' },
  { id: 'dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', timezone: 'Asia/Dubai', marketOpen: 10, marketClose: 14, significance: 'CENTCOM FWD / Regional Hub' },
  { id: 'kyiv', city: 'Kyiv', country: 'Ukraine', flag: '🇺🇦', timezone: 'Europe/Kyiv', significance: 'ZSU Command / NATO Liaison' },
  { id: 'new-york', city: 'New York', country: 'USA', flag: '🇺🇸', timezone: 'America/New_York', marketOpen: 9, marketClose: 16, significance: 'UN HQ / NYSE / Wall Street' },
];

function isDayTime(hour: number): boolean {
  return hour >= 6 && hour < 20;
}

function isMarketOpen(city: CityEntry, now: Date): boolean {
  if (!city.marketOpen || !city.marketClose) return false;
  const h = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: city.timezone }).format(now));
  const m = parseInt(new Intl.DateTimeFormat('en-US', { minute: 'numeric', timeZone: city.timezone }).format(now));
  const weekday = parseInt(new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: city.timezone }).format(now) === 'Saturday' ? '6' : new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: city.timezone }).format(now) === 'Sunday' ? '0' : '1');
  if (weekday === 6 || weekday === 0) return false;
  const totalMin = h * 60 + m;
  return totalMin >= city.marketOpen * 60 && totalMin < city.marketClose * 60;
}

function formatTime(timezone: string, now: Date): { time: string; date: string; hour: number; day: string } {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: timezone,
  }).format(now);
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', timeZone: timezone,
  }).format(now);
  const hourStr = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', hour12: false, timeZone: timezone,
  }).format(now);
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short', timeZone: timezone,
  }).format(now);
  return { time, date, hour: parseInt(hourStr), day };
}

export default function WorldClockPanel() {
  const [now, setNow] = useState(new Date());
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕐</span>
          <div>
            <div className="text-[#00ff88] text-sm font-bold font-mono">WORLD CLOCK</div>
            <div className="text-white/40 text-[10px]">Strategic Timezones</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompact(!compact)}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 text-white/40 hover:text-white/60"
          >
            {compact ? 'FULL' : 'COMPACT'}
          </button>
        </div>
      </div>

      {/* UTC Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/5 border-b border-white/5">
        <span className="text-[10px] text-white/40 font-mono">UTC:</span>
        <span className="text-[#00ff88] font-mono font-bold text-sm">
          {now.toUTCString().split(' ')[4]}
        </span>
        <span className="text-white/30 font-mono text-[10px] ml-auto">
          {now.toUTCString().split(' ').slice(0, 4).join(' ')}
        </span>
      </div>

      {/* City Grid */}
      <div className="flex-1 overflow-y-auto">
        {KEY_CITIES.map(city => {
          const { time, date, hour, day } = formatTime(city.timezone, now);
          const isDay = isDayTime(hour);
          const marketOpen = isMarketOpen(city, now);
          return (
            <div key={city.id} className={`px-3 ${compact ? 'py-1.5' : 'py-2.5'} border-b border-white/5 hover:bg-white/3 transition-colors`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${isDay ? '' : 'opacity-70'}`}>{city.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{city.city}</span>
                    <span className="text-[9px] text-white/30">{city.country}</span>
                    {marketOpen && (
                      <span className="text-[8px] font-mono text-[#00ff88] bg-[#00ff88]/10 px-1 rounded">MARKET OPEN</span>
                    )}
                  </div>
                  {!compact && (
                    <div className="text-[9px] text-white/30 font-mono">{city.significance}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px]">{isDay ? '☀️' : '🌙'}</span>
                    <span className="text-sm font-bold font-mono text-[#00ff88]">{time.slice(0, 5)}</span>
                  </div>
                  <div className="text-[9px] text-white/30 font-mono">{day} {date}</div>
                </div>
              </div>
              {!compact && (
                <div className="mt-1.5 ml-9">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(hour / 24) * 100}%`,
                        background: isDay
                          ? 'linear-gradient(90deg, #ffaa00, #00ff88)'
                          : 'linear-gradient(90deg, #1a1a2e, #333366)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
