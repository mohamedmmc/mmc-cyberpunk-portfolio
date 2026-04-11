# NEO_CHTOUROU.EXE

```
 ███╗   ███╗███╗   ███╗ ██████╗
 ████╗ ████║████╗ ████║██╔════╝
 ██╔████╔██║██╔████╔██║██║
 ██║╚██╔╝██║██║╚██╔╝██║██║
 ██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╗
 ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝
 PORTFOLIO v2.0 — est. 2077
```

A cyberpunk-themed engineering portfolio that doubles as a **hidden Capture-The-Flag** playground.
Built with vanilla HTML/CSS/JS — zero framework, zero build step, one live Cloudflare Worker.

> If you're a recruiter: the code tab is a normal portfolio.
> If you're a dev: **press `/` on the homepage. Type `help`. Start digging.**

---

## The Challenge

Somewhere in this site, there's a multi-step CTF. Two difficulties, one goal: find the Gibson.

```
  ┌──────────────┬─────────┬────────────────────────┐
  │ MODE         │ STEPS   │ AUDIENCE               │
  ├──────────────┼─────────┼────────────────────────┤
  │ BASIC        │ 5       │ curious devs           │
  │ ELITE        │ 3       │ sysadmin / unix brain  │
  └──────────────┴─────────┴────────────────────────┘
```

There's **no reset trick**, no inspecting `localStorage` to cheese it, no "view source" cheat code.
Everything lives behind the in-browser terminal. You have to read, think, and type the right commands.

The hints are there. CHIP will help you. But only three times per step before he rage-quits.

### What you're looking for (no spoilers)

- A basic CTF that rewards **patience and reading files**. Classic encoding tricks, a dash of pop culture, one nostalgic 90s hacker movie. If you grew up with a terminal, you'll feel at home.
- An Elite CTF that rewards **noticing things**. No crypto, no Python, no obscure tooling — just logs, shell history, and config files. If you've ever debugged a real production server, you already know the motions.
- Dozens of hidden **achievements**, tiered common → rare → epic → legendary. XP, levels, titles. Try to hit level 10 — `NEO`.

### Rules of engagement

1. Everything is solvable with the commands the terminal gives you. No external tools needed.
2. `devtools` + `grep` through the JS is a legit shortcut. Obscurity is not security. But if you do that, you're spoiling your own fun — the real win is solving it *with the terminal*.
3. If you get stuck, `chip` is your friend. Three hints per step. After that, CHIP is on break until you advance.
4. Finish the Elite CTF? DM me your proof (a screenshot of the final `elite status`). I collect them.

---

## What's under the hood

| Layer | What it is |
|---|---|
| **Frontend** | Vanilla HTML5 / CSS3 / ES modules. No React, no Vue, no Tailwind. ~35 KB JS total. |
| **Virtual filesystem** | A full in-memory Unix-like FS (`/etc`, `/var/log`, `/home`, `~/.bash_history`…) served via the in-browser terminal. `ls`, `cat`, `cd`, `tree`, `find`, `grep`, `rot13`, `base64`, `hex`, `sudo`. |
| **CTF engine** | `js/ctf.js` — deterministic step machine, progress persisted to `localStorage`. CHIP (`js/chip.js`) is the guide bot, per-step hint counter, rage-quit after 3 hints. |
| **Level system** | 11 tiers (SCRIPT_KIDDIE → NEO), achievements grant XP by tier, `MAX` clamp + badge. |
| **Games** | Snake, 2048, Conway's Life, Mandelbrot, spinning donut / cube / sphere — all in ASCII, all inside the terminal. |
| **Easter eggs** | Konami code, keyword triggers (`mohamed`, `neo`, `geek`, `tunisia`…), DevTools detector, idle hint toast, random VHS glitch, Voight-Kampff test modal, AI chat. |
| **Boot sequence** | Fake BIOS → kernel boot → login on first visit per session. `sessionStorage` gated so it only runs once. |
| **i18n** | Trilingual: French / English / Leet. Persists across visits. |
| **Themes** | Cyan / magenta / matrix / danger. 5× click the hero badge to cycle. |

## Analytics pipeline

Dual-stack, because one isn't enough:

```
   browser (js/track.js)
       │
       │ sendBeacon(text/plain)
       ▼
   ┌──────────────────────────┐        ┌──────────────────────┐
   │ Cloudflare Worker        │◀──────▶│ Cloudflare KV        │
   │ POST /track              │        │ ring buffer · 200    │
   │ GET  /feed?limit=100     │        │ events · hashed IPs  │
   │ GET  /stats              │        └──────────────────────┘
   └──────────────────────────┘
       │ (gtag, in parallel)
       ▼
   Google Analytics 4
```

- **Real-time feed** — `live.html` polls the Worker every 3s and renders a cyberpunk dashboard: active visitors, CTF progress, countries, event firehose. Useful the moment you share the link on social media.
- **GA4 (dual-send)** — same payload goes to gtag with ~30 custom dimensions (ctf_progress, ctf_solved, xp, level, mode, lang, theme, session_depth…). Long-term aggregation + funnels + retention.
- **Privacy** — anonymous pseudo-UID (`crypto.randomUUID` in `localStorage`, no cookies), respects `navigator.doNotTrack`, SHA-256(IP + salt) truncated to 12 hex chars. No PII stored.
- **CORS-safelisted beacon** — the Worker accepts `text/plain` to skip the preflight round-trip. `sendBeacon` survives page-unloads so you still capture last-click events.

Worker source: [`worker/worker.js`](worker/worker.js) (~170 LOC, zero deps, free tier).

---

## File layout

```
mmc-portfolio/
├── index.html                # Main landing (boot → hero → skills → projects → contact)
├── 404.html                  # SIGNAL_LOST
├── gibson.html               # The final reward (you need to earn the URL)
├── live.html                 # Real-time Worker dashboard
├── css/
│   ├── main.css              # Layout, typography, theming
│   ├── cyberpunk.css         # Neon, HUD, scanlines, glitch, terminal, modals
│   └── animations.css        # Keyframes and scroll-reveal utils
├── js/
│   ├── analytics.js          # gtag init (GA4)
│   ├── track.js              # Event bus → GA4 + Worker dual-send
│   ├── vfs.js                # In-memory Unix FS
│   ├── terminal.js           # 60+ terminal commands
│   ├── ctf.js                # Basic + Elite CTF engines
│   ├── chip.js               # The stupid AI hint bot
│   ├── xp.js                 # Levels, titles, badges
│   ├── easter-eggs.js        # Achievements + triggers
│   ├── games.js              # ASCII games
│   ├── voight-kampff.js      # Blade Runner test
│   ├── ai-chat.js            # Chat panel
│   ├── fx.js                 # Flow-field, boids, tron backgrounds
│   └── …                     # glitch, sound, boot, i18n, matrix-rain, mode, cursor, main
├── projects/                 # 6 case-study pages (Flutter, Swift, Kotlin, React, Node…)
├── assets/                   # Images, fonts, mocks
└── worker/                   # Cloudflare Worker (real-time ingest)
```

---

## Run it locally

No build, no npm install, no lockfile. Just a static server.

```bash
git clone https://github.com/mohamedmmc/mmc-cyberpunk-portfolio.git
cd mmc-cyberpunk-portfolio

# Any static server works. Pick one:
python3 -m http.server 8000
# or
npx serve .
# or VS Code "Live Server" extension
```

Open <http://localhost:8000> and go.

### Resetting your progress

If you want a clean slate (to replay the CTF from zero, or to test a friend's attempt):

```js
// Open DevTools → Console and run:
localStorage.clear()
location.reload()
```

### Deploying your own copy of the Worker

See [`worker/README.md`](worker/README.md). TL;DR: `wrangler kv:namespace create MMC`, paste the id into `wrangler.toml`, `wrangler deploy`, then update the `ENDPOINT_BASE` constant in `js/track.js` to point at your worker URL.

---

## Tech philosophy

- **No framework.** Every `<script>` is plain ES5-ish JS with an IIFE wrapper exposing a `window.MMC_*` namespace. Load order matters; that's on purpose.
- **Progressive enhancement.** The site works without JS (you just don't get the fun parts). CSS does the heavy lifting for layout and theming.
- **Persistence is opt-in.** All state lives in `localStorage`. Nothing touches a server until you actually trigger an analytics event.
- **One script, one job.** 20+ JS files, each under ~400 lines. `ctf.js` doesn't know about `xp.js` doesn't know about `chip.js` — they talk through `window.MMC_*` globals, Unix-pipe style.
- **Performance budget:** first meaningful paint < 500 ms on a cold cache. Zero external blocking requests beyond Google Fonts.

---

## Leaderboard / Hall of Fame

Solved the Elite CTF without peeking at the source? Open a PR adding yourself to `HALL_OF_FAME.md` (use any pseudonym). Include:

- Your completion time (check `elite status`)
- How many hints you used (0 = legend)
- Whether you used the browser terminal only (`vanilla`) or dev-tools (`tainted`)

I'll merge it.

---

## Credits

Designed, built, and broken by **Mohamed Melek Chtourou** — software engineer, Flutter / Node / Swift, based in Tunisia.
Portfolio live at: <https://mohamedmelekchtourou.com>
LinkedIn: <https://www.linkedin.com/in/mohamed-melek-chtourou/>

```
           ╔══════════════════════════════════╗
           ║  WAKE UP, NEO.                   ║
           ║  THE TERMINAL KEY IS `/`.        ║
           ║  EVERYTHING ELSE IS UP TO YOU.   ║
           ╚══════════════════════════════════╝
```
