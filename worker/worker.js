/* =========================================================
   mmc-feed — Cloudflare Worker for real-time portfolio events
   - POST /track   : ingest a single event
   - GET  /feed    : fetch latest N events (cursor-free)
   - GET  /stats   : basic counters
   Storage: Cloudflare KV (free tier ~100k reads/day)
   CORS: open for GET, protected POST with optional token
   ========================================================= */

const MAX_FEED_ITEMS = 2000; // keep last 2000 events in the ring buffer
const FEED_KEY = "mmc:feed"; // JSON array in KV

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-ingest-token",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, x-ingest-token",
      "access-control-max-age": "86400"
    }
  });
}

// Sanitize event payload: keep only primitive keys/values, cap string length
function sanitize(input) {
  if (!input || typeof input !== "object") return null;
  const out = {};
  let kept = 0;
  for (const key in input) {
    if (kept >= 40) break;
    if (!/^[a-zA-Z0-9_]{1,40}$/.test(key)) continue;
    let v = input[key];
    if (v == null) continue;
    if (typeof v === "object") continue;
    if (typeof v === "string") v = v.slice(0, 200);
    if (typeof v === "number" && !Number.isFinite(v)) continue;
    out[key] = v;
    kept++;
  }
  return kept > 0 ? out : null;
}

async function readFeed(env) {
  const raw = await env.MMC.get(FEED_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch (e) { return []; }
}

async function writeFeed(env, feed) {
  await env.MMC.put(FEED_KEY, JSON.stringify(feed));
}

async function handleTrack(req, env) {
  // Optional shared-secret guard
  if (env.INGEST_TOKEN && env.INGEST_TOKEN.length > 0) {
    const tok = req.headers.get("x-ingest-token") || "";
    if (tok !== env.INGEST_TOKEN) return json({ error: "unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: "invalid-json" }, 400);
  }
  const clean = sanitize(body);
  if (!clean || !clean.name) return json({ error: "missing-name" }, 400);

  // Server-side enrichment
  clean.server_ts = Date.now();
  clean.ip_hash = await hashIp(req.headers.get("cf-connecting-ip") || "");
  clean.country = (req.cf && req.cf.country) || "";
  clean.ua = (req.headers.get("user-agent") || "").slice(0, 120);

  const feed = await readFeed(env);
  feed.unshift(clean);
  if (feed.length > MAX_FEED_ITEMS) feed.length = MAX_FEED_ITEMS;
  await writeFeed(env, feed);

  return json({ ok: true });
}

async function hashIp(ip) {
  if (!ip) return "";
  const data = new TextEncoder().encode(ip + "|mmc-salt");
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).slice(0, 6)
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleFeed(req, env) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10), MAX_FEED_ITEMS);
  const feed = await readFeed(env);
  return json({ count: feed.length, items: feed.slice(0, limit) });
}

async function handleStats(req, env) {
  const feed = await readFeed(env);
  const counts = {};
  const uids = new Set();
  const sessions = new Set();
  const countries = {};
  let terminalOpens = 0;
  let ctfStarts = 0;
  let ctfSolves = 0;
  let eliteSolves = 0;
  let pageViews = 0;
  let now = Date.now();
  let in5m = 0, in1h = 0;

  for (const e of feed) {
    counts[e.name] = (counts[e.name] || 0) + 1;
    if (e.uid) uids.add(e.uid);
    if (e.session_id) sessions.add(e.session_id);
    if (e.country) countries[e.country] = (countries[e.country] || 0) + 1;
    if (e.name === "terminal_open") terminalOpens++;
    if (e.name === "ctf_start") ctfStarts++;
    if (e.name === "ctf_solved") ctfSolves++;
    if (e.name === "ctf_elite_solved") eliteSolves++;
    if (e.name === "page_view_enriched") pageViews++;
    if (e.server_ts && now - e.server_ts < 5 * 60 * 1000) in5m++;
    if (e.server_ts && now - e.server_ts < 60 * 60 * 1000) in1h++;
  }

  return json({
    total_events: feed.length,
    unique_uids: uids.size,
    unique_sessions: sessions.size,
    counts_by_event: counts,
    countries,
    terminal_opens: terminalOpens,
    ctf_starts: ctfStarts,
    ctf_solves: ctfSolves,
    elite_solves: eliteSolves,
    page_views: pageViews,
    events_last_5m: in5m,
    events_last_1h: in1h
  });
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return corsPreflight();
    const url = new URL(req.url);

    if (url.pathname === "/track" && req.method === "POST") return handleTrack(req, env);
    if (url.pathname === "/feed"  && req.method === "GET")  return handleFeed(req, env);
    if (url.pathname === "/stats" && req.method === "GET")  return handleStats(req, env);
    if (url.pathname === "/" && req.method === "GET") {
      return json({ service: "mmc-feed", endpoints: ["/track (POST)", "/feed?limit=100", "/stats"] });
    }
    return json({ error: "not-found" }, 404);
  }
};
