# 🌐 XDC World Feed

**Real-time global conflict intelligence dashboard. Open source. No login required.**

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://feed.xdc.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

![XDC World Feed Screenshot](https://feed.xdc.network/og-image.png)

## 🚀 Features

### Real-Time Intelligence
- **📡 Signal Feed** — Live news from Reuters, BBC, Al Jazeera, Guardian, France24, DW News, Defense One, Breaking Defense
- **🎯 Threat Classification** — Auto-classifies news as CRITICAL, HIGH, MEDIUM, LOW using keyword analysis
- **⚠️ Breaking Alerts** — Flashing banner for critical events with optional sound alerts
- **🧠 AI Situation Briefs** — Algorithm-generated intelligence summaries with threat assessments (v2.0)

### Interactive Map
- **🗺️ World Map** — Dark-themed MapLibre GL with multiple layers
- **🌍 3D Globe** — Three.js rotating earth with live conflict pins (War Room mode)
- **⚔️ Conflict Zones** — 10 active conflict markers (Ukraine, Gaza, Sudan, etc.)
- **🎖️ Military Bases** — 15 US/NATO bases worldwide
- **⚓ Strategic Chokepoints** — Strait of Hormuz, Suez, Malacca, etc.
- **🌍 Earthquakes** — Live USGS data (M4.5+ past 24h)

### War Room Mode
- **⚔️ Theater Selector** — Focus on Global, Ukraine, Middle East, Sahel/Sudan, Asia-Pacific
- **🌐 Live 3D Globe** — Interactive Three.js globe with auto-rotation
- **📊 Conflict Stats** — Active wars, insurgencies, high intensity zones
- **🔴 ACLED-style Events** — Real conflict event feed by theater

### Market Intelligence
- **📈 Live Markets** — S&P 500, Oil, Gold, EUR/USD, BTC, ETH
- **📊 Trading Charts** — TradingView widget with Gold, Silver, Bitcoin, Oil, S&P 500
- **🎯 Prediction Markets** — Polymarket geopolitical contracts with probability bars

### Tracking
- **✈️ Flight Tracking** — ADS-B Exchange embed (military + civilian)
- **🚢 Ship Tracking** — MarineTraffic embed (Strait of Hormuz focus)
- **🌍 Earthquake Monitor** — USGS live feed with magnitude badges

### Mobile Responsive
- **📱 4-tab mobile layout** — Feed / Map / Markets / Track
- **🔔 Push-style badges** — Critical count on mobile nav
- **👆 Touch-optimized** — Larger tap targets, swipeable panels

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Map | MapLibre GL JS + Carto dark tiles |
| Charts | TradingView Widget |
| State | React Hooks + SWR |
| Hosting | Any Node.js server + nginx |

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/xdc-world-feed.git
cd xdc-world-feed

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3400
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🚀 Deployment

### Option 1: PM2 (Recommended)

```bash
# Build the app
npm run build

# Start with PM2
pm2 start npm --name "xdc-world-feed" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Option 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3400
CMD ["npm", "start"]
```

### Nginx Configuration

```nginx
server {
    server_name feed.xdc.network;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:3400;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/feed.xdc.network/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/feed.xdc.network/privkey.pem;
}

server {
    listen 80;
    server_name feed.xdc.network;
    return 301 https://$host$request_uri;
}
```

### SSL with Certbot

```bash
certbot certonly --webroot -w /var/www/html -d feed.xdc.network
```

## 📡 Public API (v2.0)

All endpoints are free, no API key required.

```bash
# Get live signals
curl https://feed.xdc.network/api/signals

# Get AI situation brief
curl https://feed.xdc.network/api/brief

# Get market data
curl https://feed.xdc.network/api/markets

# Get conflict events
curl https://feed.xdc.network/api/conflicts

# Get earthquake data
curl https://feed.xdc.network/api/earthquakes

# Get full API documentation
curl https://feed.xdc.network/api/docs
```

### Response Examples

**GET /api/brief**
```json
{
  "brief": {
    "threatLevel": "SEVERE",
    "headline": "Major escalation in Middle East...",
    "summary": "Current tracking: 3 military, 8 geopolitical signals...",
    "keyDevelopments": [
      { "region": "MIDDLE EAST", "headline": "...", "severity": "CRITICAL" }
    ],
    "watchList": ["Elevated military activity..."],
    "marketImplications": "Risk-off sentiment likely...",
    "nextHours": "Recommend elevated alert status..."
  }
}
```

## 📊 Data Sources

| Source | Data | Refresh |
|--------|------|---------|
| Reuters RSS | World news | 60s |
| BBC World RSS | World news | 60s |
| Al Jazeera RSS | World news | 60s |
| Guardian RSS | World news | 60s |
| France24 RSS | World news | 60s |
| DW News RSS | World news | 60s |
| Defense One RSS | Defense news | 60s |
| Breaking Defense RSS | Defense news | 60s |
| BleepingComputer RSS | Cyber news | 60s |
| CoinGecko API | Crypto prices | 30s |
| Polymarket API | Prediction markets | 60s |
| USGS API | Earthquakes | 120s |

**Total API cost: $0/month** — All sources are free.

## 🎨 Customization

### Adding News Sources

Edit `src/app/api/signals/route.ts`:

```typescript
const FEEDS = [
  { name: 'Your Source', url: 'https://example.com/rss', tier: 2 },
  // ...
];
```

### Adding Map Layers

Edit `src/lib/feeds.ts` to add:
- Military bases
- Conflict zones
- Strategic chokepoints

### Changing Threat Keywords

Edit `src/lib/classify.ts`:

```typescript
const THREAT_KEYWORDS = {
  CRITICAL: ['nuclear', 'invasion', ...],
  HIGH: ['airstrike', 'missile', ...],
  // ...
};
```

## 📁 Project Structure

```
xdc-world-feed/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── api/
│   │       ├── signals/       # RSS aggregation
│   │       ├── markets/       # Market data
│   │       ├── predictions/   # Polymarket
│   │       └── earthquakes/   # USGS data
│   ├── components/
│   │   ├── Header.tsx         # Top bar with threat level
│   │   ├── SignalFeed.tsx     # News feed
│   │   ├── WorldMap.tsx       # MapLibre map
│   │   ├── MarketTicker.tsx   # Market prices
│   │   ├── PredictionPanel.tsx # Prediction markets
│   │   ├── TrackingPanel.tsx  # Flights/Ships/Quakes
│   │   ├── TradingChart.tsx   # TradingView widget
│   │   ├── MobileNav.tsx      # Mobile navigation
│   │   └── StatsBar.tsx       # Footer stats
│   ├── lib/
│   │   ├── classify.ts        # Threat classification
│   │   └── feeds.ts           # Static data
│   └── types/
│       └── index.ts           # TypeScript types
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

## 🔧 Environment Variables

No environment variables required for basic operation.

Optional:
```env
# For enhanced features (not required)
GROQ_API_KEY=xxx          # AI classification (optional)
NASA_FIRMS_KEY=xxx        # Fire data (optional)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

## 🙏 Credits

- **News Sources**: Reuters, BBC, Al Jazeera, Guardian, France24, DW, Defense One, Breaking Defense
- **Map**: MapLibre GL + Carto dark tiles
- **Charts**: TradingView
- **Markets**: CoinGecko, Polymarket
- **Earthquakes**: USGS
- **Flight Tracking**: ADS-B Exchange
- **Ship Tracking**: MarineTraffic

## 🔗 Links

- **Live Demo**: https://feed.xdc.network
- **Repository**: https://github.com/your-username/xdc-world-feed

---

Built with ❤️ for the OSINT community. Monitor the world. Stay informed.
# Test push
