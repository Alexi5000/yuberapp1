# Yuber 3 - Local Development Setup

This guide describes how to set up the Yuber 3 application locally for development.

## Prerequisites

- **Docker Desktop** (for Option A)
- **Bun** runtime (v1.x) (for Option B)
- **Turso Account**: You need a Turso database URL and Auth Token.
  - Sign up/login at [turso.tech](https://turso.tech)
  - Create a database: `turso db create yuber-local`
  - Get URL: `turso db show yuber-local --url`
  - Get Token: `turso db tokens create yuber-local`

## Setup

1.  **Clone the Repository** (if you haven't already):
    ```bash
    git clone https://github.com/cipher-rc5/yuber_3.git
    cd yuber_3
    ```

2.  **Environment Configuration**:
    Copy the example environment file and fill in your details.
    ```bash
    cp env.example .env
    ```
    Open `.env` in your editor and populate:
    - `TURSO_DATABASE_URL`: `libsql://...`
    - `TURSO_AUTH_TOKEN`: `...`
    - Other keys as needed (Yelp/Groq keys can be placeholders for initial startup).

## Option A: Docker Setup (Recommended)

1.  **Build and Start**:
    ```bash
    docker-compose up --build
    ```
    This command will build the image using `oven/bun` and start the service on port 3000.

2.  **Database Migration**:
    Open a new terminal and run migrations inside the container:
    ```bash
    docker-compose exec app bun run db:push
    ```

3.  **Seed Data** (Optional):
    ```bash
    docker-compose exec app bun run scripts/seed-providers.mjs
    ```

## Option B: Local Setup

1.  **Install Dependencies**:
    ```bash
    bun install
    ```

2.  **Database Migration**:
    ```bash
    bun run db:push
    ```

3.  **Start Dev Server**:
    ```bash
    bun run dev
    ```

## Verify

- [ ] **Service Running**: Access [http://localhost:3000](http://localhost:3000)
- [ ] **Health Check**: Verify app loads without crashing.
- [ ] **Database**: Ensure data can be read/written (e.g., login or view providers).

## Troubleshooting

- **Database Connection Failed**:
    - Verify `TURSO_DATABASE_URL` starts with `libsql://` (or `wss://` for client mode) and `TURSO_AUTH_TOKEN` is valid.
    - Check if you are behind a firewall blocking WebSocket/HTTPs traffic to Turso.

- **Port 3000 in Use**:
    - Change the port in `docker-compose.yml` (`ports: "3001:3000"`) or `.env` (`PORT=3001`).

- **Bun Not Found**:
    - Ensure Bun is installed (`curl -fsSL https://bun.sh/install | bash`) or use the Docker option.

- **Missing Environment Variables**:
    - Double-check `.env` exists and is populated. Note that `.env.example` was renamed to `env.example` in this repo to avoid gitignore issues.
