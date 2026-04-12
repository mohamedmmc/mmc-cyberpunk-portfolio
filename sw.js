/* =========================================================
   sw.js — Service Worker for offline caching
   Cache-first for static assets, network-first for HTML
   ========================================================= */

const CACHE_NAME = "mmc-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/main.css",
  "/css/cyberpunk.css",
  "/css/animations.css",
  "/css/games.css",
  "/js/main.js",
  "/js/glitch.js",
  "/js/fx.js",
  "/js/i18n.js",
  "/js/xp.js",
  "/js/sound.js",
  "/js/easter-eggs.js",
  "/js/terminal.js",
  "/js/games.js",
  "/assets/img/mmc2.webp",
  "/assets/img/favicon.png",
];

// Install — cache core shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — purge old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and external requests
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  // HTML pages — network first, fall back to cache
  if (e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets — cache first, fall back to network
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
