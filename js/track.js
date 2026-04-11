/* =========================================================
   track.js — Custom analytics layer on top of GA4 + optional
               real-time Cloudflare Worker endpoint.
   - Anonymous stable pseudo-id (localStorage mmc_uid)
   - Enriches every event with snapshot state
   - Respects Do Not Track
   - Debug mode: localStorage.mmc_track_debug = "1"

   Depends on: analytics.js (window.gtag).
   Load order: analytics.js FIRST, then this file.
   ========================================================= */

const MMC_TRACK = (() => {
  // ---------- CONFIG ----------
  // Set to your deployed Cloudflare Worker URL (leave "" to use GA4 only)
  // e.g. "https://mmc-feed.your-subdomain.workers.dev"
  const ENDPOINT_BASE = "https://mmc-feed.purple-mode-c78c.workers.dev";
  const INGEST_TOKEN = ""; // optional shared token (must match worker secret)

  const DEBUG = (() => {
    try {
      return localStorage.getItem("mmc_track_debug") === "1";
    } catch (e) {
      return false;
    }
  })();

  // ---------- Do Not Track ----------
  const dntOn = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  if (dntOn) {
    const noop = () => {};
    return {
      init: noop,
      event: noop,
      terminal: noop,
      terminalOpen: noop,
      terminalUnknown: noop,
      ctfStart: noop,
      ctfStep: noop,
      ctfSolved: noop,
      ctfEliteStart: noop,
      ctfEliteStep: noop,
      ctfEliteSolved: noop,
      chipHint: noop,
      chipRageQuit: noop,
      achievement: noop,
      xpGained: noop,
      levelUp: noop,
      gameStarted: noop,
      gameEnded: noop,
      sectionView: noop,
      projectClick: noop,
      contactClick: noop,
      themeChanged: noop,
      modeChanged: noop,
      langChanged: noop,
      easterEgg: noop,
      voightKampff: noop,
      aiChat: noop,
      get uid() {
        return null;
      },
    };
  }

  // ---------- Pseudo-UID (anonymous, stable per browser) ----------
  let uid;
  try {
    uid = localStorage.getItem("mmc_uid");
    if (!uid) {
      uid =
        crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : "anon-" +
            Math.random().toString(36).slice(2, 10) +
            Date.now().toString(36);
      localStorage.setItem("mmc_uid", uid);
    }
  } catch (e) {
    uid = "anon-" + Math.random().toString(36).slice(2, 10);
  }

  // ---------- Session state ----------
  const sessionId = Math.random().toString(36).slice(2, 10);
  let sessionDepth = 0;
  const sessionStart = Date.now();

  // ---------- Snapshot reader ----------
  function snapshot() {
    sessionDepth++;
    const s = {
      uid,
      session_id: sessionId,
      session_depth: sessionDepth,
      session_age_s: Math.round((Date.now() - sessionStart) / 1000),
      page: location.pathname,
      ts: Date.now(),
    };
    try {
      s.ctf_progress = parseInt(
        localStorage.getItem("mmc_ctf_progress") || "0",
        10,
      );
      s.ctf_solved = localStorage.getItem("mmc_ctf_state") === "solved" ? 1 : 0;
      s.ctf_elite_solved =
        localStorage.getItem("mmc_ctf_elite_state") === "solved" ? 1 : 0;
    } catch (e) {}
    try {
      const xpRaw = JSON.parse(localStorage.getItem("mmc_xp") || '{"xp":0}');
      s.xp = xpRaw.xp || 0;
      s.level = window.MMC_XP ? window.MMC_XP.currentLevel() : 0;
    } catch (e) {}
    try {
      const achs = JSON.parse(localStorage.getItem("mmc_achievements") || "[]");
      s.achievements = achs.length;
    } catch (e) {}
    try {
      s.mode = localStorage.getItem("mmc_mode") || "casual";
      s.lang = localStorage.getItem("mmc_lang") || "fr";
      s.theme = localStorage.getItem("mmc_theme") || "";
    } catch (e) {}
    return s;
  }

  // ---------- GA4 send ----------
  function sendToGA4(name, params) {
    if (typeof window.gtag !== "function") return;
    try {
      const cleaned = {};
      for (const k in params) {
        let v = params[k];
        if (v == null) continue;
        if (typeof v === "string" && v.length > 100) v = v.slice(0, 100);
        cleaned[k] = v;
      }
      window.gtag("event", name, cleaned);
    } catch (e) {
      if (DEBUG) console.warn("[track] GA4 send error:", e);
    }
  }

  // ---------- Custom endpoint send (sendBeacon with text/plain, fetch fallback) ----------
  // NOTE: sendBeacon with Blob type "application/json" triggers a CORS preflight
  // cross-origin and is silently dropped by Chromium/Firefox. We use "text/plain"
  // (a CORS-safelisted MIME type) to avoid the preflight — the Worker parses the
  // body via req.json() regardless of content-type, so the payload is identical.
  function sendToEndpoint(name, params) {
    if (!ENDPOINT_BASE) return;
    try {
      const body = JSON.stringify({ name, ...params });
      const url = ENDPOINT_BASE.replace(/\/$/, "") + "/track";
      if (navigator.sendBeacon && !INGEST_TOKEN) {
        const blob = new Blob([body], { type: "text/plain" });
        const queued = navigator.sendBeacon(url, blob);
        if (!queued && DEBUG) console.warn("[track] sendBeacon refused");
      } else {
        const headers = { "content-type": "text/plain" };
        if (INGEST_TOKEN) headers["x-ingest-token"] = INGEST_TOKEN;
        fetch(url, { method: "POST", headers, body, keepalive: true }).catch(
          () => {},
        );
      }
    } catch (e) {
      if (DEBUG) console.warn("[track] endpoint send error:", e);
    }
  }

  // ---------- Core dispatcher ----------
  function event(name, params = {}) {
    const snap = snapshot();
    const full = { ...snap, ...params };
    if (DEBUG) console.log("[track]", name, full);
    sendToGA4(name, full);
    sendToEndpoint(name, full);
  }

  // ---------- Typed helpers ----------
  function terminal(cmd, success) {
    const cmdName = (cmd || "").trim().split(/\s+/)[0].toLowerCase();
    event("terminal_command", {
      cmd_name: cmdName || "(empty)",
      cmd_raw: (cmd || "").slice(0, 100),
      success: success === false ? 0 : 1,
    });
  }
  function terminalOpen(trigger) {
    event("terminal_open", { trigger: trigger || "unknown" });
  }
  function terminalUnknown(cmd) {
    event("terminal_command_unknown", { cmd_raw: (cmd || "").slice(0, 100) });
  }

  function ctfStart(mode) {
    event("ctf_start", { ctf_mode: mode || "basic" });
  }
  function ctfStep(step) {
    event("ctf_step_reached", { step });
  }
  function ctfSolved(timeS) {
    event("ctf_solved", { time_to_solve_s: timeS || 0 });
  }
  function ctfEliteStart() {
    event("ctf_elite_start", {});
  }
  function ctfEliteStep(step, correct) {
    event("ctf_elite_step", { step, correct: correct ? 1 : 0 });
  }
  function ctfEliteSolved(timeS) {
    event("ctf_elite_solved", { time_to_solve_s: timeS || 0 });
  }

  function chipHint(step, level) {
    event("ctf_hint_requested", { step, hint_level: level });
  }
  function chipRageQuit(step) {
    event("ctf_chip_rage_quit", { step });
  }

  function achievement(id, tier) {
    event("achievement_unlocked", {
      achievement_id: id,
      tier: tier || "common",
    });
  }
  function xpGained(amount, reason, totalXp, level) {
    event("xp_gained", {
      amount,
      reason: (reason || "").slice(0, 50),
      total_xp: totalXp,
      level,
    });
  }
  function levelUp(fromLevel, toLevel, title) {
    event("level_up", {
      from_level: fromLevel,
      to_level: toLevel,
      title: title || "",
    });
  }

  function gameStarted(game) {
    event("game_started", { game });
  }
  function gameEnded(game, score, durationS) {
    event("game_ended", {
      game,
      score: score || 0,
      duration_s: durationS || 0,
    });
  }

  function sectionView(section) {
    event("section_view", { section });
  }
  function projectClick(project) {
    event("project_clicked", { project });
  }
  function contactClick(location) {
    event("contact_cta_clicked", { location });
  }
  function themeChanged(theme) {
    event("theme_changed", { theme });
  }
  function modeChanged(mode) {
    event("mode_changed", { mode });
  }
  function langChanged(lang) {
    event("language_changed", { lang });
  }
  function easterEgg(name) {
    event("easter_egg_triggered", { easter_egg: name });
  }
  function voightKampff(humanScore, durationS) {
    event("voight_kampff_done", {
      human_score: humanScore,
      duration_s: durationS || 0,
    });
  }
  function aiChat(length) {
    event("ai_chat_message", { length: length || 0 });
  }

  // ---------- Init ----------
  function init() {
    if (typeof window.gtag === "function") {
      try {
        window.gtag("set", { user_id: uid });
        window.gtag("set", "user_properties", {
          mmc_lang: (() => {
            try {
              return localStorage.getItem("mmc_lang") || "fr";
            } catch (e) {
              return "fr";
            }
          })(),
          mmc_mode: (() => {
            try {
              return localStorage.getItem("mmc_mode") || "casual";
            } catch (e) {
              return "casual";
            }
          })(),
        });
      } catch (e) {}
    }
    event("page_view_enriched", {
      referrer: (document.referrer || "direct").slice(0, 100),
      screen: `${window.innerWidth}x${window.innerHeight}`,
    });
    window.addEventListener(
      "pagehide",
      () => {
        try {
          event("session_ping", { pagehide: 1 });
        } catch (e) {}
      },
      { once: true },
    );
    if (DEBUG)
      console.log("[track] initialized", {
        uid,
        sessionId,
        endpoint: ENDPOINT_BASE || "(GA4 only)",
      });
  }

  return {
    init,
    event,
    terminal,
    terminalOpen,
    terminalUnknown,
    ctfStart,
    ctfStep,
    ctfSolved,
    ctfEliteStart,
    ctfEliteStep,
    ctfEliteSolved,
    chipHint,
    chipRageQuit,
    achievement,
    xpGained,
    levelUp,
    gameStarted,
    gameEnded,
    sectionView,
    projectClick,
    contactClick,
    themeChanged,
    modeChanged,
    langChanged,
    easterEgg,
    voightKampff,
    aiChat,
    get uid() {
      return uid;
    },
  };
})();

window.MMC_TRACK = MMC_TRACK;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => MMC_TRACK.init());
} else {
  MMC_TRACK.init();
}
