/**
 * WorldMonitor RSS Feed Configuration
 * 170+ sources organized by category
 */

export interface Feed {
  name: string;
  url: string | Record<string, string>;
  tier?: number;
  region?: string;
  lang?: string;
  isGov?: boolean;
  type?: string;
}

// Source tier system for prioritization (lower = more authoritative)
export const SOURCE_TIERS: Record<string, number> = {
  // Tier 1 - Wire Services
  'Reuters': 1, 'AP News': 1, 'AFP': 1, 'Bloomberg': 1,
  'Reuters World': 1, 'Reuters Business': 1, 'Reuters US': 1,
  
  // Tier 2 - Major Outlets
  'BBC World': 2, 'BBC Middle East': 2, 'Guardian World': 2, 'Guardian ME': 2,
  'NPR News': 2, 'CNN World': 2, 'CNBC': 2, 'MarketWatch': 2,
  'Al Jazeera': 2, 'Financial Times': 2, 'Politico': 2, 'Axios': 2,
  'EuroNews': 2, 'France 24': 2, 'Le Monde': 2,
  'Wall Street Journal': 1, 'Fox News': 2, 'NBC News': 2,
  'CBS News': 2, 'ABC News': 2, 'PBS NewsHour': 2,
  
  // Tier 1 - Official Government & International Orgs
  'White House': 1, 'State Dept': 1, 'Pentagon': 1,
  'UN News': 1, 'CISA': 1, 'Treasury': 2, 'DOJ': 2,
  'DHS': 2, 'CDC': 2, 'FEMA': 2, 'Federal Reserve': 3, 'SEC': 3,
  
  // Tier 3 - Specialty
  'Defense One': 3, 'Breaking Defense': 3, 'The War Zone': 3,
  'Defense News': 3, 'Janes': 3, 'Military Times': 2,
  'Task & Purpose': 3, 'USNI News': 2, 'gCaptain': 3,
  'Oryx OSINT': 2, 'UK MOD': 1, 'Foreign Policy': 3,
  'The Diplomat': 3, 'Bellingcat': 3, 'Krebs Security': 3,
  'Ransomware.live': 3, 'MIT Tech Review': 3, 'Ars Technica': 3,
  'Atlantic Council': 3, 'Foreign Affairs': 3, 'CrisisWatch': 3,
  'CSIS': 3, 'RAND': 3, 'Brookings': 3, 'Carnegie': 3,
  'IAEA': 1, 'WHO': 1, 'UNHCR': 1,
  
  // Tech/Finance
  'Hacker News': 4, 'The Verge': 4, 'TechCrunch': 4,
  'Y Combinator Blog': 2, 'a16z Blog': 2, 'Sequoia Blog': 2,
  'Crunchbase News': 2, 'CB Insights': 2, 'PitchBook News': 2,
  
  // Think Tanks
  'War on the Rocks': 2, 'AEI': 3, 'Responsible Statecraft': 3,
  'FPRI': 3, 'Jamestown': 3, 'RUSI': 2,
};

export type SourceType = 'wire' | 'gov' | 'intel' | 'mainstream' | 'market' | 'tech' | 'other';

export const SOURCE_TYPES: Record<string, SourceType> = {
  'Reuters': 'wire', 'AP News': 'wire', 'AFP': 'wire', 'Bloomberg': 'wire',
  'Reuters World': 'wire', 'Reuters Business': 'wire', 'Reuters US': 'wire',
  'BBC World': 'mainstream', 'BBC Middle East': 'mainstream',
  'Guardian World': 'mainstream', 'Al Jazeera': 'mainstream',
  'White House': 'gov', 'State Dept': 'gov', 'Pentagon': 'gov',
  'UN News': 'gov', 'CISA': 'gov', 'Defense One': 'intel',
  'Breaking Defense': 'intel', 'The War Zone': 'intel',
  'Foreign Policy': 'intel', 'CSIS': 'intel', 'RAND': 'intel',
  'CNBC': 'market', 'Financial Times': 'market',
  'Hacker News': 'tech', 'The Verge': 'tech', 'TechCrunch': 'tech',
};

// Helper to create RSS proxy URL
const rss = (url: string) => `/api/rss-proxy?url=${encodeURIComponent(url)}`;

// Full geopolitical feeds (170+ sources)
export const FULL_FEEDS: Record<string, Feed[]> = {
  politics: [
    { name: 'BBC World', url: rss('https://feeds.bbci.co.uk/news/world/rss.xml') },
    { name: 'Guardian World', url: rss('https://www.theguardian.com/world/rss') },
    { name: 'AP News', url: rss('https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Reuters World', url: rss('https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en') },
    { name: 'CNN World', url: rss('https://news.google.com/rss/search?q=site:cnn.com+world+news+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'NPR News', url: rss('https://feeds.npr.org/1001/rss.xml') },
    { name: 'PBS NewsHour', url: rss('https://www.pbs.org/newshour/feeds/rss/headlines') },
    { name: 'ABC News', url: rss('https://feeds.abcnews.com/abcnews/topstories') },
    { name: 'CBS News', url: rss('https://www.cbsnews.com/latest/rss/main') },
    { name: 'NBC News', url: rss('https://feeds.nbcnews.com/nbcnews/public/news') },
    { name: 'Wall Street Journal', url: rss('https://feeds.content.dowjones.io/public/rss/RSSUSnews') },
    { name: 'Politico', url: rss('https://rss.politico.com/politics-news.xml') },
    { name: 'The Hill', url: rss('https://thehill.com/news/feed') },
    { name: 'Axios', url: rss('https://api.axios.com/feed/') },
    { name: 'Fox News', url: rss('https://moxie.foxnews.com/google-publisher/us.xml') },
  ],
  us: [
    { name: 'Reuters US', url: rss('https://news.google.com/rss/search?q=site:reuters.com+US&hl=en-US&gl=US&ceid=US:en') },
    { name: 'NPR News', url: rss('https://feeds.npr.org/1001/rss.xml') },
    { name: 'PBS NewsHour', url: rss('https://www.pbs.org/newshour/feeds/rss/headlines') },
    { name: 'ABC News', url: rss('https://feeds.abcnews.com/abcnews/topstories') },
    { name: 'CBS News', url: rss('https://www.cbsnews.com/latest/rss/main') },
    { name: 'NBC News', url: rss('https://feeds.nbcnews.com/nbcnews/public/news') },
    { name: 'Wall Street Journal', url: rss('https://feeds.content.dowjones.io/public/rss/RSSUSnews') },
    { name: 'Politico', url: rss('https://rss.politico.com/politics-news.xml') },
    { name: 'The Hill', url: rss('https://thehill.com/news/feed') },
    { name: 'Axios', url: rss('https://api.axios.com/feed/') },
    { name: 'Fox News', url: rss('https://moxie.foxnews.com/google-publisher/us.xml') },
  ],
  europe: [
    { name: 'France 24', url: { en: rss('https://www.france24.com/en/rss'), fr: rss('https://www.france24.com/fr/rss'), es: rss('https://www.france24.com/es/rss'), ar: rss('https://www.france24.com/ar/rss') } },
    { name: 'EuroNews', url: { en: rss('https://www.euronews.com/rss?format=xml'), fr: rss('https://fr.euronews.com/rss?format=xml'), de: rss('https://de.euronews.com/rss?format=xml'), it: rss('https://it.euronews.com/rss?format=xml'), es: rss('https://es.euronews.com/rss?format=xml'), pt: rss('https://pt.euronews.com/rss?format=xml'), ru: rss('https://ru.euronews.com/rss?format=xml') } },
    { name: 'Le Monde', url: { en: rss('https://www.lemonde.fr/en/rss/une.xml'), fr: rss('https://www.lemonde.fr/rss/une.xml') } },
    { name: 'DW News', url: { en: rss('https://rss.dw.com/xml/rss-en-all'), de: rss('https://rss.dw.com/xml/rss-de-all') } },
    { name: 'El Pais', url: rss('https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'), lang: 'es' },
    { name: 'El Mundo', url: rss('https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml'), lang: 'es' },
    { name: 'BBC Mundo', url: rss('https://www.bbc.com/mundo/index.xml'), lang: 'es' },
    { name: 'Tagesschau', url: rss('https://www.tagesschau.de/xml/rss2/'), lang: 'de' },
    { name: 'Der Spiegel', url: rss('https://www.spiegel.de/schlagzeilen/tops/index.rss'), lang: 'de' },
    { name: 'Die Zeit', url: rss('https://newsfeed.zeit.de/index'), lang: 'de' },
    { name: 'ANSA', url: rss('https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml'), lang: 'it' },
    { name: 'Corriere della Sera', url: rss('https://www.corriere.it/rss/homepage.xml'), lang: 'it' },
    { name: 'Repubblica', url: rss('https://www.repubblica.it/rss/homepage/rss2.0.xml'), lang: 'it' },
    { name: 'NOS Nieuws', url: rss('https://feeds.nos.nl/nosnieuwsalgemeen'), lang: 'nl' },
    { name: 'NRC', url: rss('https://www.nrc.nl/rss/'), lang: 'nl' },
    { name: 'SVT Nyheter', url: rss('https://www.svt.se/nyheter/rss.xml'), lang: 'sv' },
    { name: 'Dagens Nyheter', url: rss('https://www.dn.se/rss/'), lang: 'sv' },
    { name: 'BBC Turkce', url: rss('https://feeds.bbci.co.uk/turkce/rss.xml'), lang: 'tr' },
    { name: 'DW Turkish', url: rss('https://rss.dw.com/xml/rss-tur-all'), lang: 'tr' },
    { name: 'TVN24', url: rss('https://tvn24.pl/swiat.xml'), lang: 'pl' },
    { name: 'BBC Russian', url: rss('https://feeds.bbci.co.uk/russian/rss.xml'), lang: 'ru' },
    { name: 'Meduza', url: rss('https://meduza.io/rss/all'), lang: 'ru' },
    { name: 'TASS', url: rss('https://news.google.com/rss/search?q=site:tass.com+OR+TASS+Russia+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'RT', url: rss('https://www.rt.com/rss/') },
    { name: 'Kyiv Independent', url: rss('https://news.google.com/rss/search?q=site:kyivindependent.com+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  middleeast: [
    { name: 'BBC Middle East', url: rss('https://feeds.bbci.co.uk/news/world/middle_east/rss.xml') },
    { name: 'Al Jazeera', url: { en: rss('https://www.aljazeera.com/xml/rss/all.xml'), ar: rss('https://www.aljazeera.net/aljazeerarss/a7c186be-1adb-4b11-a982-4783e765316e/4e17ecdc-8fb9-40de-a5d6-d00f72384a51') } },
    { name: 'Al Arabiya', url: { en: rss('https://news.google.com/rss/search?q=site:english.alarabiya.net+when:2d&hl=en-US&gl=US&ceid=US:en'), ar: rss('https://www.alarabiya.net/tools/mrss/?cat=main') } },
    { name: 'Guardian ME', url: rss('https://www.theguardian.com/world/middleeast/rss') },
    { name: 'BBC Persian', url: rss('http://feeds.bbci.co.uk/persian/tv-and-radio-37434376/rss.xml') },
    { name: 'Iran International', url: rss('https://news.google.com/rss/search?q=site:iranintl.com+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Fars News', url: rss('https://news.google.com/rss/search?q=site:farsnews.ir+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Haaretz', url: rss('https://news.google.com/rss/search?q=site:haaretz.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'The National', url: rss('https://news.google.com/rss/search?q=site:thenationalnews.com+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Oman Observer', url: rss('https://www.omanobserver.om/rssFeed/1') },
    { name: 'Asharq Business', url: rss('https://asharqbusiness.com/rss.xml') },
    { name: 'Asharq News', url: rss('https://asharq.com/snapchat/rss.xml'), lang: 'ar' },
  ],
  tech: [
    { name: 'Hacker News', url: rss('https://hnrss.org/frontpage') },
    { name: 'Ars Technica', url: rss('https://feeds.arstechnica.com/arstechnica/technology-lab') },
    { name: 'The Verge', url: rss('https://www.theverge.com/rss/index.xml') },
    { name: 'MIT Tech Review', url: rss('https://www.technologyreview.com/feed/') },
    { name: 'TechCrunch', url: rss('https://techcrunch.com/feed/') },
    { name: 'Engadget', url: rss('https://www.engadget.com/rss.xml') },
    { name: 'ZDNet', url: rss('https://www.zdnet.com/news/rss.xml') },
    { name: 'TechMeme', url: rss('https://www.techmeme.com/feed.xml') },
  ],
  ai: [
    { name: 'AI News', url: rss('https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"large+language+model"+OR+ChatGPT)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'VentureBeat AI', url: rss('https://venturebeat.com/category/ai/feed/') },
    { name: 'The Verge AI', url: rss('https://www.theverge.com/rss/ai-artificial-intelligence/index.xml') },
    { name: 'MIT Tech Review AI', url: rss('https://www.technologyreview.com/topic/artificial-intelligence/feed') },
    { name: 'ArXiv AI', url: rss('https://export.arxiv.org/rss/cs.AI') },
    { name: 'ArXiv ML', url: rss('https://export.arxiv.org/rss/cs.LG') },
  ],
  finance: [
    { name: 'CNBC', url: rss('https://www.cnbc.com/id/100003114/device/rss/rss.html') },
    { name: 'MarketWatch', url: rss('https://news.google.com/rss/search?q=site:marketwatch.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Yahoo Finance', url: rss('https://finance.yahoo.com/rss/topstories') },
    { name: 'Financial Times', url: rss('https://www.ft.com/rss/home') },
    { name: 'Reuters Business', url: rss('https://news.google.com/rss/search?q=site:reuters.com+business+markets&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Bloomberg Markets', url: rss('https://news.google.com/rss/search?q=site:bloomberg.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Seeking Alpha', url: rss('https://seekingalpha.com/market_currents.xml') },
  ],
  gov: [
    { name: 'White House', url: rss('https://news.google.com/rss/search?q=site:whitehouse.gov&hl=en-US&gl=US&ceid=US:en') },
    { name: 'State Dept', url: rss('https://news.google.com/rss/search?q=site:state.gov+OR+"State+Department"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Pentagon', url: rss('https://news.google.com/rss/search?q=site:defense.gov+OR+Pentagon&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Treasury', url: rss('https://news.google.com/rss/search?q=site:treasury.gov+OR+"Treasury+Department"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'DOJ', url: rss('https://news.google.com/rss/search?q=site:justice.gov+OR+"Justice+Department"+DOJ&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Federal Reserve', url: rss('https://www.federalreserve.gov/feeds/press_all.xml') },
    { name: 'SEC', url: rss('https://www.sec.gov/news/pressreleases.rss') },
    { name: 'CDC', url: rss('https://news.google.com/rss/search?q=site:cdc.gov+OR+CDC+health&hl=en-US&gl=US&ceid=US:en') },
    { name: 'FEMA', url: rss('https://news.google.com/rss/search?q=site:fema.gov+OR+FEMA+emergency&hl=en-US&gl=US&ceid=US:en') },
    { name: 'DHS', url: rss('https://news.google.com/rss/search?q=site:dhs.gov+OR+"Homeland+Security"&hl=en-US&gl=US&ceid=US:en') },
    { name: 'UN News', url: rss('https://news.un.org/feed/subscribe/en/news/all/rss.xml') },
    { name: 'CISA', url: rss('https://www.cisa.gov/cybersecurity-advisories/all.xml') },
  ],
  layoffs: [
    { name: 'Layoffs.fyi', url: rss('https://news.google.com/rss/search?q=tech+company+layoffs+announced&hl=en&gl=US&ceid=US:en') },
    { name: 'TechCrunch Layoffs', url: rss('https://techcrunch.com/tag/layoffs/feed/') },
    { name: 'Layoffs News', url: rss('https://news.google.com/rss/search?q=(layoffs+OR+"job+cuts"+OR+"workforce+reduction")+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  thinktanks: [
    { name: 'Foreign Policy', url: rss('https://foreignpolicy.com/feed/') },
    { name: 'Atlantic Council', url: rss('https://www.atlanticcouncil.org/feed/') },
    { name: 'Foreign Affairs', url: rss('https://www.foreignaffairs.com/rss.xml') },
    { name: 'CSIS', url: rss('https://news.google.com/rss/search?q=site:csis.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'RAND', url: rss('https://news.google.com/rss/search?q=site:rand.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Brookings', url: rss('https://news.google.com/rss/search?q=site:brookings.edu+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Carnegie', url: rss('https://news.google.com/rss/search?q=site:carnegieendowment.org+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'War on the Rocks', url: rss('https://warontherocks.com/feed') },
    { name: 'AEI', url: rss('https://www.aei.org/feed/') },
    { name: 'Responsible Statecraft', url: rss('https://responsiblestatecraft.org/feed/') },
    { name: 'FPRI', url: rss('https://www.fpri.org/feed/') },
    { name: 'Jamestown', url: rss('https://jamestown.org/feed/') },
    { name: 'RUSI', url: rss('https://news.google.com/rss/search?q=site:rusi.org+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  crisis: [
    { name: 'CrisisWatch', url: rss('https://www.crisisgroup.org/rss') },
    { name: 'IAEA', url: rss('https://www.iaea.org/feeds/topnews') },
    { name: 'WHO', url: rss('https://www.who.int/rss-feeds/news-english.xml') },
    { name: 'UNHCR', url: rss('https://news.google.com/rss/search?q=site:unhcr.org+OR+UNHCR+refugees+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  africa: [
    { name: 'Africa News', url: rss('https://news.google.com/rss/search?q=(Africa+OR+Nigeria+OR+Kenya+OR+"South+Africa"+OR+Ethiopia)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'BBC Africa', url: rss('https://feeds.bbci.co.uk/news/world/africa/rss.xml') },
    { name: 'News24', url: rss('https://feeds.news24.com/articles/news24/TopStories/rss') },
    { name: 'Premium Times', url: rss('https://www.premiumtimesng.com/feed') },
    { name: 'Channels TV', url: rss('https://www.channelstv.com/feed/') },
    { name: 'Daily Trust', url: rss('https://dailytrust.com/feed/') },
  ],
  latam: [
    { name: 'BBC Latin America', url: rss('https://feeds.bbci.co.uk/news/world/latin_america/rss.xml') },
    { name: 'Reuters LatAm', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(Brazil+OR+Mexico+OR+Argentina)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Guardian Americas', url: rss('https://www.theguardian.com/world/americas/rss') },
    { name: 'Clarin', url: rss('https://www.clarin.com/rss/lo-ultimo/'), lang: 'es' },
    { name: 'Folha de S.Paulo', url: rss('https://feeds.folha.uol.com.br/emcimadahora/rss091.xml'), lang: 'pt' },
    { name: 'InSight Crime', url: rss('https://insightcrime.org/feed/') },
    { name: 'Mexico News Daily', url: rss('https://mexiconewsdaily.com/feed/') },
  ],
  asia: [
    { name: 'BBC Asia', url: rss('https://feeds.bbci.co.uk/news/world/asia/rss.xml') },
    { name: 'The Diplomat', url: rss('https://thediplomat.com/feed/') },
    { name: 'South China Morning Post', url: rss('https://www.scmp.com/rss/91/feed/') },
    { name: 'Reuters Asia', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(China+OR+Japan+OR+Taiwan+OR+Korea)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Xinhua', url: rss('https://news.google.com/rss/search?q=site:xinhuanet.com+OR+Xinhua+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Nikkei Asia', url: rss('https://news.google.com/rss/search?q=site:asia.nikkei.com+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'The Hindu', url: rss('https://www.thehindu.com/news/national/feeder/default.rss'), lang: 'en' },
    { name: 'CNA', url: rss('https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml') },
    { name: 'VnExpress', url: rss('https://vnexpress.net/rss/tin-moi-nhat.rss'), lang: 'vi' },
    { name: 'Bangkok Post', url: rss('https://news.google.com/rss/search?q=site:bangkokpost.com+when:1d&hl=en-US&gl=US&ceid=US:en'), lang: 'th' },
    { name: 'Yonhap News', url: rss('https://www.yonhapnewstv.co.kr/browse/feed/'), lang: 'ko' },
    { name: 'ABC News Australia', url: rss('https://www.abc.net.au/news/feed/2942460/rss.xml') },
  ],
  energy: [
    { name: 'Oil & Gas', url: rss('https://news.google.com/rss/search?q=(oil+price+OR+OPEC+OR+"natural+gas"+OR+pipeline+OR+LNG)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Nuclear Energy', url: rss('https://news.google.com/rss/search?q=("nuclear+energy"+OR+"nuclear+power"+OR+uranium+OR+IAEA)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Reuters Energy', url: rss('https://news.google.com/rss/search?q=site:reuters.com+(oil+OR+gas+OR+energy+OR+OPEC)+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Mining & Resources', url: rss('https://news.google.com/rss/search?q=(lithium+OR+"rare+earth"+OR+cobalt+OR+mining)+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  defense: [
    { name: 'Defense One', url: rss('https://www.defenseone.com/rss/all/') },
    { name: 'Breaking Defense', url: rss('https://breakingdefense.com/feed/') },
    { name: 'The War Zone', url: rss('https://www.twz.com/feed') },
    { name: 'Defense News', url: rss('https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml') },
    { name: 'Janes', url: rss('https://news.google.com/rss/search?q=site:janes.com+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Military Times', url: rss('https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml') },
    { name: 'Task & Purpose', url: rss('https://taskandpurpose.com/feed/') },
    { name: 'USNI News', url: rss('https://news.usni.org/feed') },
    { name: 'UK MOD', url: rss('https://www.gov.uk/government/organisations/ministry-of-defence.atom') },
  ],
  cyber: [
    { name: 'Krebs Security', url: rss('https://krebsonsecurity.com/feed/') },
    { name: 'The Hacker News', url: rss('https://feeds.feedburner.com/TheHackersNews') },
    { name: 'Dark Reading', url: rss('https://www.darkreading.com/rss.xml') },
    { name: 'BleepingComputer', url: rss('https://www.bleepingcomputer.com/feed/') },
    { name: 'Ransomware.live', url: rss('https://www.ransomware.live/rss.xml') },
  ],
  osint: [
    { name: 'Bellingcat', url: rss('https://news.google.com/rss/search?q=site:bellingcat.com+when:30d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Oryx OSINT', url: rss('https://www.oryxspioenkop.com/feeds/posts/default?alt=rss') },
  ],
  startups: [
    { name: 'TechCrunch Startups', url: rss('https://techcrunch.com/category/startups/feed/') },
    { name: 'VentureBeat', url: rss('https://venturebeat.com/feed/') },
    { name: 'Crunchbase News', url: rss('https://news.crunchbase.com/feed/') },
    { name: 'Y Combinator Blog', url: rss('https://www.ycombinator.com/blog/rss/') },
    { name: 'CB Insights', url: rss('https://www.cbinsights.com/research/feed/') },
    { name: 'EU Startups', url: rss('https://news.google.com/rss/search?q=site:eu-startups.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Tech in Asia', url: rss('https://news.google.com/rss/search?q=site:techinasia.com+when:7d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'TechCabal', url: rss('https://techcabal.com/feed/') },
  ],
  commodities: [
    { name: 'Oil & Gas', url: rss('https://news.google.com/rss/search?q=(oil+price+OR+OPEC+OR+"natural+gas"+OR+"crude+oil")+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Gold & Metals', url: rss('https://news.google.com/rss/search?q=(gold+price+OR+silver+price+OR+copper+OR+platinum)+when:2d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Agriculture', url: rss('https://news.google.com/rss/search?q=(wheat+OR+corn+OR+soybeans+OR+coffee)+price+OR+commodity+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  crypto: [
    { name: 'CoinDesk', url: rss('https://www.coindesk.com/arc/outboundfeeds/rss/') },
    { name: 'Cointelegraph', url: rss('https://cointelegraph.com/rss') },
    { name: 'Crypto News', url: rss('https://news.google.com/rss/search?q=(bitcoin+OR+ethereum+OR+crypto)+when:1d&hl=en-US&gl=US&ceid=US:en') },
  ],
  centralbanks: [
    { name: 'Federal Reserve', url: rss('https://www.federalreserve.gov/feeds/press_all.xml') },
    { name: 'ECB Watch', url: rss('https://news.google.com/rss/search?q=("European+Central+Bank"+OR+ECB)+monetary+policy+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'BoJ Watch', url: rss('https://news.google.com/rss/search?q=("Bank+of+Japan"+OR+BoJ)+monetary+policy+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Global Central Banks', url: rss('https://news.google.com/rss/search?q=("rate+hike"+OR+"rate+cut")+central+bank+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
};

// Export based on variant
export const FEEDS = FULL_FEEDS;

// Default enabled sources
export const DEFAULT_ENABLED_SOURCES: Record<string, string[]> = {
  politics: ['BBC World', 'Guardian World', 'AP News', 'Reuters World', 'CNN World'],
  us: ['Reuters US', 'NPR News', 'PBS NewsHour', 'ABC News', 'CBS News', 'NBC News', 'Wall Street Journal', 'Politico', 'The Hill'],
  europe: ['France 24', 'EuroNews', 'Le Monde', 'DW News', 'Tagesschau', 'ANSA', 'NOS Nieuws', 'SVT Nyheter'],
  middleeast: ['BBC Middle East', 'Al Jazeera', 'Al Arabiya', 'Guardian ME', 'BBC Persian', 'Iran International', 'Haaretz', 'Asharq News', 'The National'],
  africa: ['BBC Africa', 'News24', 'Africa News', 'Premium Times', 'Channels TV', 'Daily Trust'],
  latam: ['BBC Latin America', 'Reuters LatAm', 'InSight Crime', 'Mexico News Daily', 'Clarin', 'Folha de S.Paulo'],
  asia: ['BBC Asia', 'The Diplomat', 'South China Morning Post', 'Reuters Asia', 'Nikkei Asia', 'CNA', 'Asia News', 'The Hindu'],
  tech: ['Hacker News', 'Ars Technica', 'The Verge', 'MIT Tech Review'],
  ai: ['AI News', 'VentureBeat AI', 'The Verge AI', 'MIT Tech Review', 'ArXiv AI'],
  finance: ['CNBC', 'MarketWatch', 'Yahoo Finance', 'Financial Times', 'Reuters Business'],
  gov: ['White House', 'State Dept', 'Pentagon', 'UN News', 'CISA', 'Treasury', 'DOJ', 'CDC'],
  layoffs: ['Layoffs.fyi', 'TechCrunch Layoffs', 'Layoffs News'],
  thinktanks: ['Foreign Policy', 'Atlantic Council', 'Foreign Affairs', 'CSIS', 'RAND', 'Brookings', 'Carnegie', 'War on the Rocks'],
  crisis: ['CrisisWatch', 'IAEA', 'WHO', 'UNHCR'],
  energy: ['Oil & Gas', 'Nuclear Energy', 'Reuters Energy', 'Mining & Resources'],
  defense: ['Defense One', 'Breaking Defense', 'The War Zone', 'Defense News', 'Military Times', 'USNI News'],
  cyber: ['Krebs Security', 'The Hacker News', 'Dark Reading', 'BleepingComputer'],
};

// Alert keywords
export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'airstrike', 'drone strike', 'troops deployed', 'armed conflict', 'bombing', 'casualties',
  'ceasefire', 'peace treaty', 'nato', 'coup', 'martial law',
  'assassination', 'terrorist', 'terror attack', 'cyber attack', 'hostage', 'evacuation order',
];

// Exclusions
export const ALERT_EXCLUSIONS = [
  'protein', 'couples', 'relationship', 'dating', 'diet', 'fitness',
  'recipe', 'cooking', 'shopping', 'fashion', 'celebrity', 'movie',
  'tv show', 'sports', 'game', 'concert', 'festival', 'wedding',
  'vacation', 'travel tips', 'life hack', 'self-care', 'wellness',
];

// Helper functions
export function getSourceTier(sourceName: string): number {
  return SOURCE_TIERS[sourceName] ?? 4;
}

export function getSourceType(sourceName: string): SourceType {
  return SOURCE_TYPES[sourceName] ?? 'other';
}

export function getTotalFeedCount(): number {
  const all = new Set<string>();
  for (const feeds of Object.values(FEEDS)) {
    for (const f of feeds) all.add(f.name);
  }
  return all.size;
}

export function getAllDefaultEnabledSources(): Set<string> {
  const s = new Set<string>();
  for (const names of Object.values(DEFAULT_ENABLED_SOURCES)) {
    names.forEach(n => s.add(n));
  }
  return s;
}
