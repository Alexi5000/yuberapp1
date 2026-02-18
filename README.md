<div align="center">

<img src="assets/icon.png" alt="Yuber Logo" width="120" />

# Yuber

### The Uber for Home Emergencies

**Tell the AI what broke. It finds the nearest pro, dispatches them, and tracks the job — all in under 60 seconds.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Mastra](https://img.shields.io/badge/Mastra-AI%20Agents-8b5cf6)](https://mastra.ai)
[![Bun](https://img.shields.io/badge/Bun-Runtime-f9f1e1?logo=bun)](https://bun.sh)
[![tRPC](https://img.shields.io/badge/tRPC-Typed%20API-2596be)](https://trpc.io)

[How It Works](#-how-it-works) · [Features](#-features) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Contributing](CONTRIBUTING.md)

---

<img src="assets/cover.png" alt="Yuber App" width="100%" />

</div>

---

## The Problem

Your pipe bursts at 2 AM. Your door lock jams on a Sunday. Your power goes out before a deadline. What do you do? Google frantically, call five numbers, get voicemail, and wait. The current system for emergency home services is broken — it's slow, stressful, and analog.

## The Solution

Yuber is **instant help with intelligent dispatch**. You tell the AI what happened in plain English. It understands your crisis, finds the nearest top-rated pro through Yelp, dispatches them automatically, and tracks the job until help arrives. No searching. No phone trees. No panic.

> *"My kitchen pipe burst and water is everywhere"*
>
> Yuber understands, finds a 4.8-star plumber 0.3 miles away, dispatches them, and gives you a live ETA. Done.

---

## The Origin Story

Yuber started in a late-night Discord voice call. Three strangers were talking about why every AI app still feels like a chatbot that can't help in the real world. We wondered why no one built an agent that actually solves problems — real problems. Pipes bursting. Doors locked. Power failing. That call turned into a mission, and we shipped a working prototype before sunrise.

---

## How It Works

| Step | What Happens |
|---|---|
| **1. Describe** | Tell the AI what went wrong in plain English |
| **2. Understand** | Mastra AI agents classify the emergency and extract requirements |
| **3. Search** | Yelp API finds the nearest top-rated professionals |
| **4. Dispatch** | The dispatch agent contacts and assigns the best match |
| **5. Track** | Real-time status updates until help arrives |

---

## Features

- **AI-Powered Triage** — Mastra agents understand your emergency and route to the right service category
- **Intelligent Dispatch** — Automated provider matching based on proximity, ratings, and availability
- **Yelp Integration** — Real-time search for top-rated local professionals
- **Google Maps** — Live location tracking and ETA visualization
- **Phone UI Experience** — Native mobile-app feel rendered in the browser
- **Typed API** — End-to-end type safety with tRPC + Zod validation
- **Cookie Auth** — JWT-based session management with demo login
- **Docker Ready** — Full Docker Compose setup for instant deployment
- **Multi-Agent System** — Help agent, dispatch agent, and settings agent working in concert

---

## AI Agent Architecture

Yuber uses **Mastra** to orchestrate three specialized AI agents:

| Agent | Role | What It Does |
|---|---|---|
| **Help Agent** | Triage & Chat | Understands the user's emergency, classifies urgency, asks clarifying questions |
| **Dispatch Agent** | Provider Matching | Searches Yelp, ranks providers, handles assignment and notification |
| **Settings Agent** | User Preferences | Manages location, notification preferences, and account settings |

Each agent has access to core functions: `chat`, `search_providers`, `dispatch`, and `get_history`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Bun |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **UI** | React + Tailwind CSS + Radix UI |
| **API** | tRPC + TanStack React Query |
| **AI Agents** | Mastra + OpenAI |
| **Database** | Turso (libSQL) + Drizzle ORM |
| **Provider Search** | Yelp Fusion API |
| **Maps** | Google Maps API |
| **Validation** | Zod |
| **Auth** | JWT cookie sessions |
| **Deployment** | Docker + Docker Compose |

---

## Quick Start

### Prerequisites

- **Bun** >= 1.0
- **Docker** (optional, for containerized setup)

### 1. Clone and Install

```bash
git clone https://github.com/Alexi5000/yuberapp1.git
cd yuberapp1
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Set your API keys:

| Variable | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | Turso/libSQL database URL |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `YELP_API_KEY` | Yes | Yelp Fusion API key for provider search |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps (client-side) |
| `JWT_SECRET` | Yes | Cookie/JWT session secret |
| `OPENAI_API_KEY` | Yes | OpenAI for Mastra agents |

### 3. Run Migrations

```bash
bun run db:push
```

### 4. Start Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker Setup

```bash
docker compose up
```

> Full setup guide: [SETUP.md](./SETUP.md)

---

## Architecture

### Rendering Model

Next.js App Router renders a minimal shell and dynamically loads the client app. `app/page.tsx` imports `client/src/app_entry.tsx` with `ssr: false`, creating a native phone-UI experience in the browser.

### API Model

tRPC provides end-to-end type safety from client to server. `server/routers.ts` defines the main `appRouter`, and `server/_core/context.ts` attaches authenticated user context.

### Auth Model

JWT cookie-based sessions with local auth (`server/_core/localAuth.ts`) and demo login support for quick testing.

### Database Model

Drizzle ORM with Turso/libSQL. Schema defined in `drizzle/schema.ts`, data access through `server/db.ts`.

---

## Project Structure

```
yuberapp1/
├── app/                   # Next.js App Router pages + API routes
│   ├── api/              # tRPC endpoint + auth routes
│   └── login/            # Login page
├── client/                # Phone UI client application
│   └── src/
│       ├── pages/        # Screen components (splash, home, tracking, etc.)
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       └── contexts/     # React context providers
├── server/                # Backend logic
│   ├── mastra/           # AI agent definitions and core functions
│   │   ├── agents/      # Help, Dispatch, Settings agents
│   │   └── core/        # Chat, search, dispatch, history functions
│   └── _core/            # Auth, env, DB, Yelp client utilities
├── shared/                # Shared constants and screen IDs
├── drizzle/               # Database schema + migrations
├── scripts/               # DB seed, inspect, and verification scripts
├── docs/                  # Architecture diagrams and notes
└── .github/               # CI/CD, issue templates, CODEOWNERS
```

---

## Scripts

```bash
bun run dev        # Start Next.js dev server
bun run build      # Production build
bun run start      # Run production server
bun run check      # TypeScript typecheck
bun run db:push    # Generate + apply Drizzle migrations
```

---

## Documentation

| Document | Description |
|---|---|
| [Setup Guide](./SETUP.md) | Local and Docker setup instructions |
| [Hackathon Guide](./HACKATHON.md) | Quick demo and review walkthrough |
| [Contributing](./CONTRIBUTING.md) | How to contribute |
| [Security](./SECURITY.md) | Vulnerability reporting |
| [Code of Conduct](./CODE_OF_CONDUCT.md) | Community guidelines |
| [Architecture Diagram](./docs/app_flow_and_agents.mmd) | Agent flow and system architecture |

---

## Roadmap

- [ ] Real-time push notifications for dispatch updates
- [ ] Expanded service categories (HVAC, pest control, appliance repair)
- [ ] Provider-side dashboard for job management
- [ ] Payment integration (Stripe)
- [ ] Rating and review system
- [ ] SMS/WhatsApp dispatch notifications
- [ ] Multi-language support

---

## Contributors

| Contributor | Role |
|---|---|
| [@Alexi5000](https://github.com/Alexi5000) | AI agents and automation |
| [@cipher-rc5](https://github.com/cipher-rc5) | System architecture |
| [@digitalpersonalab](https://github.com/digitalpersonalab) | Frontend and design |

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built by [Alex Cinovoj](https://github.com/Alexi5000) · [TechTide AI](https://github.com/Alexi5000)**

*Your pipe burst. Help is already on the way.*

</div>

