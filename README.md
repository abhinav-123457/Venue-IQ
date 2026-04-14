# ⚡ VenueIQ

Real-time crowd intelligence platform for large-scale sporting venues. VenueIQ gives attendees personalized navigation, live crowd density data, AI-powered assistance, and accessible wayfinding — all from a single web app.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

---

## Features

**Live Crowd Visualization** — Google Maps hybrid satellite view with real-time color-coded density markers. Filter by zone type (gates, food, restrooms, parking) or accessibility. Simulate halftime crowd surges to stress-test the system.

**Personalized Section Intelligence** — Enter your ticket section once. VenueIQ maps it to the nearest gate, food court, restroom, and parking lot, then gives live tips based on current crowd conditions. Section preference persists across sessions via `localStorage`.

**AI Chat Assistant** — Natural language interface powered by Groq (LLaMA 3). The AI has full context on live venue data — crowd levels, wait times, zone accessibility — and responds in under a second.

**Turn-by-Turn Wayfinding** — Step-by-step walking directions from your section to any zone. Estimates walk time and distance. Accessible routes automatically include elevator/ramp instructions.

**Accessibility Mode** — Single toggle that persists across sessions. Prioritizes wheelchair-accessible zones in all recommendations, filters the map, adapts wayfinding routes, and surfaces ♿ badges throughout the UI.

**Smart Alerts** — Real-time feed for crowd surges, gate closures, weather warnings, and halftime rushes with severity-based color coding.

---

## Tech Stack

| Layer | Tech | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, proxy |
| Language | TypeScript 5 | Strict mode |
| Rendering | React 19 | Concurrent features |
| Styling | Tailwind CSS 4 | Dark theme, custom tokens |
| Animation | Framer Motion | Page transitions, micro-interactions |
| State | Zustand | Lightweight reactive store |
| AI | Groq SDK (LLaMA 3) | Sub-second inference |
| Maps | Google Maps JavaScript API | Hybrid view, custom circle overlays |
| Rate Limiting | Upstash Redis | Serverless, per-IP throttling |
| Icons | Lucide React | Tree-shakeable SVG icons |

---

## Architecture

```
src/
├── app/
│   ├── api/chat/route.ts        # POST — Groq chat completion (rate-limited)
│   ├── components/
│   │   ├── HomeTab.tsx           # Dashboard: stats, personalized info, quick actions
│   │   ├── VenueMap.tsx          # Google Maps with crowd density overlays
│   │   ├── ChatAssistant.tsx     # AI chat interface
│   │   ├── AlertsFeed.tsx        # Notification feed
│   │   ├── NavigationPanel.tsx   # Wayfinding modal with step-by-step directions
│   │   ├── SplashScreen.tsx      # Animated loading screen
│   │   └── BottomNav.tsx         # Mobile navigation
│   ├── globals.css               # Design tokens
│   ├── layout.tsx                # Root layout, fonts, Maps script
│   └── page.tsx                  # App shell — sidebar nav + tab router
├── lib/
│   ├── store.ts                  # Zustand store (zones, event, preferences)
│   ├── venueData.ts              # Zone dataset, personalization engine, wayfinding
│   ├── types.ts                  # Zone, VenueEvent, CrowdLevel interfaces
│   ├── groq.ts                   # Groq client init
│   └── ratelimit.ts              # Upstash rate limiter
└── proxy.ts                      # CORS handling for API routes
```

**State management** — `Zustand` store holds all venue zones, the live event object, user section, and accessibility preference. Components subscribe to slices they need; updates propagate reactively.

**Personalization engine** — `venueData.ts` maps ticket sections to venue areas (North/East/South/West), finds the nearest zone of each type, and generates contextual tips. When accessibility mode is on, it swaps in accessible alternatives automatically.

**Wayfinding** — `generateDirections()` builds a step sequence from section → concourse → destination, estimating distance and walk time. Accessible mode injects elevator/ramp steps and adjusts time estimates.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Groq API key](https://console.groq.com) (free tier available)
- A [Google Maps API key](https://console.cloud.google.com/apis/credentials) with Maps JavaScript API enabled

### Setup

```bash
git clone https://github.com/your-username/venue-iq.git
cd venue-iq
npm install
```

Create `.env.local`:

```env
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...

# Optional — enables rate limiting on /api/chat
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Development

```bash
npm run dev        # http://localhost:3000
```

### Production

```bash
npm run build
npm start
```

---

## Responsive Layout

| Viewport | Navigation | Layout |
|---|---|---|
| ≥ 768px | Fixed 72px left sidebar | Scrollable content area |
| < 768px | Bottom tab bar | Full-width stacked |

---

## Design

Dark theme built on the **Obsidian Command** design system:

- **Canvas**: `#000000` — true black for OLED
- **Surfaces**: `#111111` → `#1b1b1b` — tonal layering, no borders
- **Primary**: `#0070f3` (Vercel blue) with `#aec6ff` highlights
- **Secondary**: `#7928CA` purple gradients
- **Type**: Space Grotesk (headlines), Manrope (body)
- **Elevation**: Background color shifts + ambient glows — no drop shadows

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLaMA 3 chat completions |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Yes | Google Maps JavaScript API key |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis auth token |

---

## License

MIT
