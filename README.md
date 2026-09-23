# Test Repo Env Vars

A small React + Vite frontend with a Node.js backend for demonstrating and testing environment variables, including a server-only `EXPERIMENT_TOKEN`.

The browser never receives `EXPERIMENT_TOKEN` or any other secret. The frontend calls the backend through `/api`, and Vite proxies those requests in development.

## Setup

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` asks for the app name, welcome message, local ports, and a required `EXPERIMENT_TOKEN`. It writes a local `.env` file, which is ignored by git.

For a non-interactive setup, copy the example file instead:

```bash
cp .env.example .env
```

Then edit `.env` and set a non-empty `EXPERIMENT_TOKEN` before starting the app. Do not commit `.env`.

Open the Vite preview URL:

```text
http://localhost:3000
```

The Vite dev server is configured for browser-preview environments with host `0.0.0.0` and port `3000`. The backend runs on `127.0.0.1:8787`, and the frontend uses Vite's `/api` proxy.

## Environment Variables

| Variable | Used by | Browser-visible? | Restart required? | Purpose |
| --- | --- | --- | --- | --- |
| `APP_NAME` | Backend | Yes, via `/api/config` | Yes | App name displayed in the UI |
| `WELCOME_MESSAGE` | Backend | Yes, via `/api/config` | Yes | Welcome copy displayed in the UI |
| `BACKEND_HOST` | Backend | No | Yes | Backend bind host |
| `BACKEND_PORT` | Backend and Vite proxy | No | Yes | Backend port |
| `FRONTEND_HOST` | Vite | No | Yes | Frontend bind host |
| `FRONTEND_PORT` | Vite | No | Yes | Frontend port |
| `PORT` | Vite fallback | No | Yes | Preview port when `FRONTEND_PORT` is not set |
| `EXPERIMENT_TOKEN` | Backend | No | Yes | Required for backend startup and enables the protected experiment endpoint |

Node reads `.env` when each server process starts. After changing `.env`, stop `npm run dev` and start it again.

## Test Missing `EXPERIMENT_TOKEN`

Leave `EXPERIMENT_TOKEN` empty or unset in `.env`, then start the app:

```bash
npm run dev:backend
```

The backend should refuse to start with:

```text
Missing required environment variable: EXPERIMENT_TOKEN
```

## Test Present `EXPERIMENT_TOKEN`

Run `npm run setup` again and enter a non-empty token, or set a local value in `.env`:

```bash
EXPERIMENT_TOKEN="local-development-token"
```

Restart `npm run dev`, then click **Run Experiment** again. The UI should show a success message. The token value is never included in the response.

## Test Changed App Copy

Run `npm run setup` again and enter new copy, or edit `.env`:

```bash
APP_NAME="Staging Env Lab"
WELCOME_MESSAGE="This copy came from the backend environment."
```

Restart `npm run dev` and reload the page. The heading and welcome message should update.

## API Endpoints

- `GET /api/config` returns public app display values.
- `GET /api/health` returns backend health information.
- `POST /api/ping` confirms normal API calls work.
- `POST /api/experiment` requires server-only `EXPERIMENT_TOKEN`.

## Tests

```bash
npm test
```

The tests start isolated backend instances and verify health, config, startup token validation, and token-safe experiment behavior.
