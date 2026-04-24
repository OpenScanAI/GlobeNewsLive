// RSS Feed sources - Tier 1 (Wire services) and Tier 2 (Major outlets)
export const RSS_FEEDS = {
  tier1: [
    { name: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews', priority: 1 },
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', priority: 1 },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', priority: 1 },
  ],
  tier2: [
    { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', priority: 2 },
    { name: 'France24', url: 'https://www.france24.com/en/rss', priority: 2 },
    { name: 'DW News', url: 'https://rss.dw.com/xml/rss-en-world', priority: 2 },
  ],
  defense: [
    { name: 'Defense One', url: 'https://www.defenseone.com/rss/', priority: 2 },
    { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/', priority: 2 },
  ]
};

// Static data for military bases and chokepoints
export const MILITARY_BASES = [
  { name: 'Al Udeid Air Base', op: 'US', lat: 25.12, lon: 51.31, type: 'air' },
  { name: 'Camp Humphreys', op: 'US', lat: 36.96, lon: 127.03, type: 'army' },
  { name: 'Ramstein', op: 'US', lat: 49.44, lon: 7.60, type: 'air' },
  { name: 'Diego Garcia', op: 'US/UK', lat: -7.32, lon: 72.42, type: 'navy' },
  { name: 'Incirlik', op: 'US/TR', lat: 37.00, lon: 35.43, type: 'air' },
  { name: 'Yokosuka', op: 'US', lat: 35.29, lon: 139.67, type: 'navy' },
  { name: 'Kadena', op: 'US', lat: 26.35, lon: 127.77, type: 'air' },
  { name: 'Bahrain NSA', op: 'US', lat: 26.23, lon: 50.62, type: 'navy' },
  { name: 'Camp Lemonnier', op: 'US', lat: 11.55, lon: 43.15, type: 'joint' },
  { name: 'Thule', op: 'US', lat: 76.53, lon: -68.70, type: 'space' },
  { name: 'Guantanamo Bay', op: 'US', lat: 19.90, lon: -75.10, type: 'navy' },
  { name: 'Aviano', op: 'US', lat: 46.03, lon: 12.60, type: 'air' },
  { name: 'RAF Lakenheath', op: 'US/UK', lat: 52.41, lon: 0.56, type: 'air' },
  { name: 'Osan', op: 'US', lat: 37.09, lon: 127.03, type: 'air' },
  { name: 'Misawa', op: 'US', lat: 40.70, lon: 141.37, type: 'air' },
];

export const STRATEGIC_CHOKEPOINTS = [
  { name: 'Strait of Hormuz', lat: 26.57, lon: 56.25, oilMbpd: 21, risk: 'high' },
  { name: 'Strait of Malacca', lat: 2.50, lon: 101.80, tradePct: 25, risk: 'medium' },
  { name: 'Suez Canal', lat: 30.46, lon: 32.35, tradePct: 12, risk: 'medium' },
  { name: 'Bab el-Mandeb', lat: 12.58, lon: 43.33, oilMbpd: 6.2, risk: 'high' },
  { name: 'Turkish Straits', lat: 41.12, lon: 29.07, oilMbpd: 2.4, risk: 'medium' },
  { name: 'Panama Canal', lat: 9.08, lon: -79.68, tradePct: 5, risk: 'low' },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, tradePct: 50, risk: 'high' },
  { name: 'GIUK Gap', lat: 63.0, lon: -20.0, military: true, risk: 'medium' },
];

export const ACTIVE_CONFLICTS = [
  { name: 'Ukraine', lat: 48.38, lon: 37.62, type: 'war', intensity: 'high' },
  { name: 'Gaza', lat: 31.50, lon: 34.47, type: 'war', intensity: 'high' },
  { name: 'Sudan', lat: 15.50, lon: 32.53, type: 'civil war', intensity: 'high' },
  { name: 'Myanmar', lat: 19.75, lon: 96.10, type: 'civil war', intensity: 'medium' },
  { name: 'Syria', lat: 35.20, lon: 38.80, type: 'civil war', intensity: 'medium' },
  { name: 'Yemen', lat: 15.35, lon: 44.21, type: 'civil war', intensity: 'medium' },
  { name: 'Ethiopia (Amhara)', lat: 11.59, lon: 37.39, type: 'insurgency', intensity: 'medium' },
  { name: 'Sahel', lat: 14.50, lon: 0.00, type: 'insurgency', intensity: 'medium' },
  { name: 'DRC', lat: -1.65, lon: 29.22, type: 'insurgency', intensity: 'medium' },
  { name: 'Haiti', lat: 18.97, lon: -72.28, type: 'gang violence', intensity: 'high' },
];

export const NUCLEAR_FACILITIES = [
  { name: 'Kashiwazaki-Kariwa', lat: 37.43, lon: 138.60, country: 'Japan', reactors: 7, status: 'operational' },
  { name: 'Bruce', lat: 44.33, lon: -81.60, country: 'Canada', reactors: 8, status: 'operational' },
  { name: 'Hanford Site', lat: 46.55, lon: -119.49, country: 'USA', reactors: 0, status: 'decommissioned' },
  { name: 'Sellafield', lat: 54.42, lon: -3.50, country: 'UK', reactors: 0, status: 'reprocessing' },
  { name: 'Chernobyl', lat: 51.39, lon: 30.10, country: 'Ukraine', reactors: 0, status: 'disaster' },
  { name: 'Fukushima Daiichi', lat: 37.42, lon: 141.03, country: 'Japan', reactors: 0, status: 'disaster' },
  { name: 'Zaporizhzhia', lat: 47.51, lon: 34.59, country: 'Ukraine', reactors: 6, status: 'operational' },
  { name: 'Dimona', lat: 31.00, lon: 35.15, country: 'Israel', reactors: 1, status: 'operational' },
  { name: 'Natanz', lat: 33.72, lon: 51.72, country: 'Iran', reactors: 0, status: 'enrichment' },
  { name: 'Fordow', lat: 34.88, lon: 50.99, country: 'Iran', reactors: 0, status: 'enrichment' },
  { name: 'Bushehr', lat: 28.83, lon: 50.89, country: 'Iran', reactors: 1, status: 'operational' },
  { name: 'Yongbyon', lat: 39.80, lon: 125.75, country: 'DPRK', reactors: 1, status: 'operational' },
  { name: 'Mayak', lat: 55.70, lon: 60.80, country: 'Russia', reactors: 0, status: 'reprocessing' },
  { name: 'Seversk', lat: 56.60, lon: 84.90, country: 'Russia', reactors: 3, status: 'operational' },
  { name: 'La Hague', lat: 49.53, lon: -1.88, country: 'France', reactors: 0, status: 'reprocessing' },
  { name: 'Flamanville', lat: 49.54, lon: -1.88, country: 'France', reactors: 2, status: 'operational' },
  { name: 'Kalpakkam', lat: 12.56, lon: 80.17, country: 'India', reactors: 2, status: 'operational' },
  { name: 'Kudankulam', lat: 8.17, lon: 77.71, country: 'India', reactors: 2, status: 'operational' },
  { name: 'Taishan', lat: 21.92, lon: 112.98, country: 'China', reactors: 2, status: 'operational' },
  { name: 'Tianwan', lat: 34.69, lon: 119.46, country: 'China', reactors: 6, status: 'operational' },
  { name: 'Pakistan Institute of Nuclear Science', lat: 33.68, lon: 73.27, country: 'Pakistan', reactors: 1, status: 'operational' },
];

// Market symbols
export const MARKET_SYMBOLS = [
  { name: 'S&P 500', symbol: '^GSPC', type: 'index' },
  { name: 'Crude Oil', symbol: 'CL=F', type: 'commodity' },
  { name: 'Gold', symbol: 'GC=F', type: 'commodity' },
  { name: 'Bitcoin', symbol: 'BTC-USD', type: 'crypto' },
  { name: 'EUR/USD', symbol: 'EURUSD=X', type: 'forex' },
  { name: '10Y Treasury', symbol: '^TNX', type: 'bond' },
];
