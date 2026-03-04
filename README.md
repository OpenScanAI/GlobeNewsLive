# 🌐 WorldMonitor - Global Intelligence Platform

**Real-time geopolitical intelligence with 170+ sources, 45+ map layers, and AI synthesis. Open source. No login required.**

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://worldmonitor.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

![WorldMonitor Screenshot](https://worldmonitor.com/og-image.png)

## 🚀 Features

### Real-Time Intelligence
- **📡 Signal Feed** — Live news from 170+ sources including Reuters, BBC, Al Jazeera, Defense One, and more
- **🎯 Threat Classification** — Auto-classifies news as CRITICAL, HIGH, MEDIUM, LOW using AI
- **⚠️ Breaking Alerts** — Flashing banner for critical events with optional sound alerts
- **🧠 AI Synthesis** — LLM-powered intelligence summaries with sentiment analysis
- **🔍 Headline Memory** — Vector-based RAG search across historical headlines
- **📊 Country Instability Index** — Real-time CII scores with choropleth visualization

### Interactive Maps
- **🗺️ Dual Map Engine** — Flat map (deck.gl) + 3D Globe (Three.js)
- **🌍 45+ Map Layers** — Conflicts, military bases, nuclear sites, cables, pipelines, datacenters
- **🌓 Day/Night Overlay** — Real-time terminator line
- **📈 CII Choropleth** — Country Instability Index heatmap
- **⚔️ Conflict Zones** — 10 active conflict markers with intensity levels
- **🎖️ Military Bases** — 15 US/NATO bases worldwide
- **⚓ Strategic Chokepoints** — Strait of Hormuz, Suez, Malacca, Taiwan Strait

### AI-Powered Analysis
- **🤖 Local LLM Support** — Ollama and LM Studio integration
- **📝 AI Synthesis** — Multi-source headline summarization
- **🔮 Deduction Engine** — Situation analysis and forecasting
- **💾 Headline Memory** — Semantic search with vector embeddings
- **🎯 Focal Point Detection** — Automatic hotspot identification

### Multi-Language Support
- **🌍 21 Languages** — English, Arabic, Spanish, French, German, Chinese, Japanese, Korean, Russian, Portuguese, Italian, Dutch, Turkish, Polish, Swedish, Hindi, Vietnamese, Thai, Hebrew, Greek
- **↔️ RTL Support** — Full right-to-left language support

### Platform Variants
- **🌐 WorldMonitor** — Full geopolitical intelligence
- **💻 TechMonitor** — Startup ecosystem and AI news
- **📈 FinanceMonitor** — Markets, trading, and economic data
- **😊 HappyMonitor** — Positive news and acts of kindness

### Infrastructure
- **💻 Desktop App** — Tauri-based native app (Windows, macOS, Linux)
- **📱 PWA** — Progressive Web App with offline support
- **⚡ Redis Caching** — High-performance caching layer
- **🔌 Proto-first API** — gRPC/Protocol Buffer contracts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Maps | MapLibre GL + deck.gl |
| 3D Globe | Three.js + React Three Fiber |
| State | React Hooks + SWR |
| AI/ML | Local LLM (Ollama/LM Studio) |
| Cache | Upstash Redis |
| Desktop | Tauri |
| Protocol | gRPC / Protocol Buffers |

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Ollama for local LLM
- (Optional) Redis for caching

### Quick Start

```bash
# Clone the repository
git clone https://github.com/worldmonitor/app.git
cd app

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3400
```

### Environment Variables

```bash
# Redis (optional)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Local LLM (optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Site Variant (optional)
NEXT_PUBLIC_SITE_VARIANT=full|tech|finance|happy
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

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

### Desktop App (Tauri)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Tauri CLI
cargo install tauri-cli

# Build desktop app
cargo tauri build
```

## 📡 Public API

All endpoints are free, no API key required.

```bash
# Get live signals
curl https://worldmonitor.com/api/signals

# Get signals with filter
curl "https://worldmonitor.com/api/signals?filter=iran"

# Get AI situation brief
curl https://worldmonitor.com/api/brief

# Get market data
curl https://worldmonitor.com/api/markets

# Get conflict events
curl https://worldmonitor.com/api/conflicts

# Get CII data
curl https://worldmonitor.com/api/cii

# Get earthquake data
curl https://worldmonitor.com/api/earthquakes
```

### Response Examples

**GET /api/signals**
```json
{
  "signals": [
    {
      "id": "abc123",
      "title": "Major military operation begins...",
      "severity": "CRITICAL",
      "category": "military",
      "source": "Reuters",
      "timestamp": "2024-01-15T10:30:00Z",
      "region": "middleeast"
    }
  ],
  "cached": false,
  "sources": { "success": 45, "failed": 5, "total": 50 }
}
```

**GET /api/cii**
```json
{
  "countries": [
    {
      "code": "SY",
      "name": "Syria",
      "cii": 95,
      "trend": "rising",
      "change7d": 2,
      "activeConflicts": 3,
      "riskFactors": [
        { "type": "conflict", "severity": 10, "description": "Ongoing civil war" }
      ]
    }
  ]
}
```

## 📊 Data Sources

| Source | Data | Count |
|--------|------|-------|
| RSS Feeds | World news | 170+ |
| Map Layers | Geospatial | 45+ |
| Military Bases | Locations | 15 |
| Conflict Zones | Active | 10 |
| Nuclear Sites | Facilities | 5 |
| CII Data | Countries | 20+ |

**Total API cost: $0/month** — All sources are free.

## 🎨 Customization

### Adding News Sources

Edit `src/config/feeds.ts`:

```typescript
export const FULL_FEEDS = {
  mycategory: [
    { name: 'My Source', url: rss('https://example.com/rss') },
  ],
};
```

### Adding Map Layers

Edit `src/config/map-layers.ts`:

```typescript
export const LAYER_REGISTRY = {
  mylayer: {
    key: 'mylayer',
    icon: '📍',
    label: 'My Layer',
    renderers: ['flat', 'globe'],
    variant: ['full'],
  },
};
```

### Creating a Variant

Edit `src/config/variant.ts`:

```typescript
export const VARIANT_FEATURES = {
  myvariant: ['Feature 1', 'Feature 2'],
};
```

## 📁 Project Structure

```
worldmonitor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout
│   │   ├── api/                  # API routes
│   │   │   ├── signals/          # RSS aggregation
│   │   │   ├── markets/          # Market data
│   │   │   ├── cii/              # Country Instability Index
│   │   │   └── rss-proxy/        # RSS proxy
│   │   └── ...
│   ├── components/               # React components
│   ├── config/
│   │   ├── feeds.ts              # 170+ RSS sources
│   │   ├── map-layers.ts         # 45+ map layers
│   │   └── variant.ts            # Site variants
│   ├── lib/
│   │   ├── redis.ts              # Redis client
│   │   └── classify.ts           # Threat classification
│   ├── locales/                  # 21 language translations
│   ├── services/
│   │   ├── ai-synthesis.ts       # AI synthesis engine
│   │   ├── headline-memory.ts    # RAG vector search
│   │   └── cii.ts                # Country Instability Index
│   └── types/
│       └── index.ts              # TypeScript types
├── proto/                        # Protocol Buffer definitions
├── src-tauri/                    # Tauri desktop app
├── public/
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker
└── ...
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

- **News Sources**: 170+ RSS feeds from major outlets
- **Maps**: MapLibre GL, deck.gl, Carto tiles
- **AI**: Ollama, LM Studio
- **Data**: USGS, ACLED, various open sources

## 🔗 Links

- **Live Demo**: https://worldmonitor.com
- **Repository**: https://github.com/worldmonitor/app
- **Documentation**: https://docs.worldmonitor.com

---

Built with ❤️ for the OSINT community. Monitor the world. Stay informed.
