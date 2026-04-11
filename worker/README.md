# mmc-feed — Cloudflare Worker

A tiny real-time ingest + feed endpoint for the portfolio. GA4 handles aggregate analytics;
this worker gives you a **live stream of events** so you can watch visitors hit the site
(useful right after posting on LinkedIn).

## What it does

- `POST /track` — ingests an event (JSON body). Adds `server_ts`, `ip_hash`, `country`, `ua`.
- `GET /feed?limit=100` — returns the last N events (newest first, ring-buffer of 200).
- `GET /stats` — aggregated counters: unique_uids, sessions, ctf_starts, solves, countries…

Storage is a single KV key `mmc:feed` that holds a JSON array of the last 200 events.
No cron, no DB — free tier is plenty.

## Prereqs

```bash
npm install -g wrangler
wrangler login
```

## Deploy

```bash
cd worker

# 1. Create a KV namespace
wrangler kv:namespace create MMC
#   → copy the "id" it prints into wrangler.toml (replace REPLACE_WITH_KV_NAMESPACE_ID)

# 2. (Optional) protect POST /track with a shared token
wrangler secret put INGEST_TOKEN
#   → enter a random string. Put the same string in js/track.js INGEST_TOKEN.

# 3. Deploy
wrangler deploy
#   → prints a URL like:  https://mmc-feed.<your-subdomain>.workers.dev
```

## Wire the site to it

Open `js/track.js` and set:

```js
const ENDPOINT_BASE = "https://mmc-feed.<your-subdomain>.workers.dev";
const INGEST_TOKEN  = "";   // or the token from step 2
```

That's it — every event now flows to both GA4 AND your worker.

## Test locally

```bash
# Start preview
wrangler dev

# In another shell
curl -X POST http://localhost:8787/track \
  -H "content-type: application/json" \
  -d '{"name":"test_event","uid":"hello","page":"/"}'

curl http://localhost:8787/feed
curl http://localhost:8787/stats
```

## Monitor live

Use `live.html` at the project root (open it in a browser) — it polls `/stats` and `/feed`
every 3 seconds and shows recent events, active visitors, CTF progress, country breakdown, etc.

Bookmark it. Right before you post on LinkedIn, open `live.html` in a tab and watch.
