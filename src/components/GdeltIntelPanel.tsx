'use client';

import { useState, useEffect } from 'react';

interface GdeltArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  country: string;
  lang: string;
  tone: number; // -100 to +100
  themes: string[];
  date: Date;
  mentions: number;
}

interface IntelTopic {
  id: string;
  name: string;
  icon: string;
  query: string;
  description: string;
}

const TOPICS: IntelTopic[] = [
  { id: 'conflict', name: 'Conflict', icon: '⚔️', query: 'war military attack', description: 'Armed conflicts and military operations' },
  { id: 'nuclear', name: 'Nuclear', icon: '☢️', query: 'nuclear weapon missile', description: 'Nuclear developments and threats' },
  { id: 'cyber', name: 'Cyber', icon: '💻', query: 'cyberattack hacker breach', description: 'Cyber operations and infrastructure attacks' },
  { id: 'terror', name: 'Terror', icon: '💣', query: 'terrorism attack extremist', description: 'Terrorist activities and extremism' },
  { id: 'economy', name: 'Economy', icon: '📉', query: 'sanctions economy crisis', description: 'Economic warfare and financial disruption' },
  { id: 'intel', name: 'Intel', icon: '🕵️', query: 'espionage spy intelligence', description: 'Intelligence operations and espionage' },
];

const MOCK_ARTICLES: Record<string, GdeltArticle[]> = {
  conflict: [
    { id: '1', title: 'Russian forces advance in Avdiivka sector amid heavy fighting', url: '#', source: 'Reuters', country: '🇬🇧', lang: 'EN', tone: -72, themes: ['WAR_UKRAINE', 'MILITARY', 'GROUND_FORCES'], date: new Date(Date.now() - 15 * 60000), mentions: 847 },
    { id: '2', title: 'IDF expands operations in northern Gaza amid diplomatic pressure', url: '#', source: 'AP', country: '🇺🇸', lang: 'EN', tone: -65, themes: ['WAR_GAZA', 'HUMANITARIAN', 'MILITARY'], date: new Date(Date.now() - 35 * 60000), mentions: 623 },
    { id: '3', title: 'Sudan RSF forces attack civilian convoy in Darfur', url: '#', source: 'Al Jazeera', country: '🇶🇦', lang: 'EN', tone: -81, themes: ['WAR_SUDAN', 'ATROCITIES', 'CIVILIANS'], date: new Date(Date.now() - 52 * 60000), mentions: 412 },
    { id: '4', title: 'Myanmar junta airstrikes kill 20 in Sagaing region', url: '#', source: 'Irrawaddy', country: '🇲🇲', lang: 'EN', tone: -78, themes: ['WAR_MYANMAR', 'AIRSTRIKE', 'CIVILIANS'], date: new Date(Date.now() - 78 * 60000), mentions: 289 },
    { id: '5', title: 'M23 rebels capture key town as UN calls emergency session', url: '#', source: 'BBC', country: '🇬🇧', lang: 'EN', tone: -69, themes: ['WAR_DRC', 'REBEL', 'UN'], date: new Date(Date.now() - 95 * 60000), mentions: 334 },
  ],
  nuclear: [
    { id: '1', title: 'North Korea tests new ICBM capable of reaching US mainland', url: '#', source: 'Yonhap', country: '🇰🇷', lang: 'EN', tone: -88, themes: ['NUCLEAR', 'ICBM', 'NORTH_KOREA'], date: new Date(Date.now() - 8 * 3600000), mentions: 1204 },
    { id: '2', title: 'Iran enriching uranium to 84% purity — IAEA report', url: '#', source: 'Reuters', country: '🇬🇧', lang: 'EN', tone: -75, themes: ['NUCLEAR', 'IRAN', 'IAEA'], date: new Date(Date.now() - 12 * 3600000), mentions: 892 },
    { id: '3', title: 'Russia updates nuclear doctrine, lowers threshold for use', url: '#', source: 'Moscow Times', country: '🇷🇺', lang: 'EN', tone: -82, themes: ['NUCLEAR', 'RUSSIA', 'DOCTRINE'], date: new Date(Date.now() - 24 * 3600000), mentions: 1567 },
  ],
  cyber: [
    { id: '1', title: 'Critical infrastructure in Europe hit by coordinated cyberattack', url: '#', source: 'ENISA', country: '🇪🇺', lang: 'EN', tone: -71, themes: ['CYBER', 'INFRASTRUCTURE', 'EUROPE'], date: new Date(Date.now() - 2 * 3600000), mentions: 445 },
    { id: '2', title: 'Volt Typhoon implants found in US power grid controls', url: '#', source: 'WSJ', country: '🇺🇸', lang: 'EN', tone: -79, themes: ['CYBER', 'CHINA', 'CRITICAL_INFRA'], date: new Date(Date.now() - 6 * 3600000), mentions: 892 },
    { id: '3', title: 'Ukrainian railway systems disrupted by wiper malware', url: '#', source: 'Bleeping Computer', country: '🇺🇸', lang: 'EN', tone: -66, themes: ['CYBER', 'UKRAINE', 'MALWARE'], date: new Date(Date.now() - 10 * 3600000), mentions: 321 },
  ],
  terror: [
    { id: '1', title: 'ISIS-K claims bombing at Kabul mosque killing 47', url: '#', source: 'TOLOnews', country: '🇦🇫', lang: 'EN', tone: -91, themes: ['TERRORISM', 'ISIS', 'AFGHANISTAN'], date: new Date(Date.now() - 4 * 3600000), mentions: 678 },
    { id: '2', title: 'Sahel: JNIM attacks French-backed forces in Mali', url: '#', source: 'RFI', country: '🇫🇷', lang: 'FR', tone: -74, themes: ['TERRORISM', 'SAHEL', 'MALI'], date: new Date(Date.now() - 9 * 3600000), mentions: 234 },
  ],
  economy: [
    { id: '1', title: 'US expands semiconductor export controls targeting China', url: '#', source: 'Bloomberg', country: '🇺🇸', lang: 'EN', tone: -45, themes: ['SANCTIONS', 'CHIPS', 'CHINA_US'], date: new Date(Date.now() - 3 * 3600000), mentions: 1123 },
    { id: '2', title: 'Russia sanctions evasion network uncovered in UAE, Turkey', url: '#', source: 'FT', country: '🇬🇧', lang: 'EN', tone: -52, themes: ['SANCTIONS', 'RUSSIA', 'EVASION'], date: new Date(Date.now() - 7 * 3600000), mentions: 445 },
    { id: '3', title: 'Global shipping insurance costs surge 300% on Red Sea attacks', url: '#', source: 'Lloyd\'s', country: '🇬🇧', lang: 'EN', tone: -58, themes: ['ECONOMY', 'SHIPPING', 'INSURANCE'], date: new Date(Date.now() - 15 * 3600000), mentions: 567 },
  ],
  intel: [
    { id: '1', title: 'GRU officer arrested in NATO country on espionage charges', url: '#', source: 'The Guardian', country: '🇬🇧', lang: 'EN', tone: -64, themes: ['INTELLIGENCE', 'RUSSIA', 'NATO'], date: new Date(Date.now() - 5 * 3600000), mentions: 789 },
    { id: '2', title: 'China MSS officer network dismantled across five countries', url: '#', source: 'NYT', country: '🇺🇸', lang: 'EN', tone: -71, themes: ['INTELLIGENCE', 'CHINA', 'ESPIONAGE'], date: new Date(Date.now() - 11 * 3600000), mentions: 934 },
    { id: '3', title: 'Iran HUMINT network exposed in Germany targeting dissidents', url: '#', source: 'Spiegel', country: '🇩🇪', lang: 'DE', tone: -68, themes: ['INTELLIGENCE', 'IRAN', 'GERMANY'], date: new Date(Date.now() - 18 * 3600000), mentions: 445 },
  ],
};

function getToneColor(tone: number): string {
  if (tone < -60) return '#ff4444';
  if (tone < -30) return '#ff8800';
  if (tone < 0) return '#ffaa00';
  if (tone > 30) return '#00ff88';
  return '#888888';
}

function timeSince(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}

export default function GdeltIntelPanel() {
  const [activeTopic, setActiveTopic] = useState<IntelTopic>(TOPICS[0]!);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const articles = MOCK_ARTICLES[activeTopic.id] || [];
  const avgTone = articles.length > 0 ? Math.round(articles.reduce((s, a) => s + a.tone, 0) / articles.length) : 0;
  const totalMentions = articles.reduce((s, a) => s + a.mentions, 0);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <div>
            <div className="text-[#00aaff] text-sm font-bold font-mono">GDELT INTEL</div>
            <div className="text-white/40 text-[10px]">Global Events Language & Tone</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold font-mono" style={{ color: getToneColor(avgTone) }}>
            {avgTone > 0 ? '+' : ''}{avgTone}
          </div>
          <div className="text-[9px] text-white/30 font-mono">avg tone</div>
        </div>
      </div>

      {/* Topic Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(topic)}
            className={`flex items-center gap-1 px-3 py-1.5 text-[9px] font-mono whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTopic.id === topic.id
                ? 'text-[#00aaff] border-b-2 border-[#00aaff] bg-[#00aaff]/5'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span>{topic.icon}</span>
            <span>{topic.name}</span>
          </button>
        ))}
      </div>

      {/* Topic Stats */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-white/3 border-b border-white/5">
        <div>
          <div className="text-[9px] text-white/30 font-mono">ARTICLES</div>
          <div className="text-xs font-bold font-mono text-white">{articles.length}</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 font-mono">MENTIONS</div>
          <div className="text-xs font-bold font-mono text-[#00aaff]">{totalMentions.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 font-mono">SENTIMENT</div>
          <div className="text-xs font-bold font-mono" style={{ color: getToneColor(avgTone) }}>
            {avgTone > 0 ? 'POSITIVE' : avgTone < -60 ? 'VERY NEGATIVE' : avgTone < -30 ? 'NEGATIVE' : 'NEUTRAL'}
          </div>
        </div>
        <div className="ml-auto">
          <div className="text-[9px] text-white/30 font-mono">{activeTopic.description}</div>
        </div>
      </div>

      {/* Tone Distribution Bar */}
      <div className="px-3 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/30 font-mono">TONE</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 flex">
              <div className="h-full bg-[#ff4444]/60" style={{ width: '50%' }} />
              <div className="h-full bg-[#00ff88]/60" style={{ width: '50%' }} />
            </div>
            <div
              className="absolute top-0 h-full w-1 bg-white rounded-full"
              style={{ left: `${((avgTone + 100) / 200) * 100}%` }}
            />
          </div>
          <span className="text-[9px] font-mono" style={{ color: getToneColor(avgTone) }}>{avgTone}</span>
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto">
        {articles.map(article => (
          <div key={article.id} className="px-3 py-2.5 border-b border-white/5 hover:bg-white/3 transition-colors">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white leading-snug">{article.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-white/50 font-mono">{article.country} {article.source}</span>
                  <span className="text-[9px] text-white/30">·</span>
                  <span className="text-[9px] text-white/30 font-mono">{timeSince(article.date)} ago</span>
                  <span className="text-[9px] text-white/30">·</span>
                  <span className="text-[9px] text-[#00aaff] font-mono">{article.mentions.toLocaleString()} mentions</span>
                </div>
                {article.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {article.themes.slice(0, 3).map(t => (
                      <span key={t} className="text-[8px] font-mono text-white/30 bg-white/5 px-1 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className="text-xs font-bold font-mono px-1.5 py-0.5 rounded"
                  style={{ color: getToneColor(article.tone), backgroundColor: getToneColor(article.tone) + '22' }}
                >
                  {article.tone}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-white/5 text-[8px] text-white/20 font-mono">
        Source: GDELT Project (gdeltproject.org) • Updated every 15 minutes
      </div>
    </div>
  );
}
