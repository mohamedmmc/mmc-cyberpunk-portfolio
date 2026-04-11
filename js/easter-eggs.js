/* =========================================================
   easter-eggs.js — Konami, achievements, hidden triggers
   ========================================================= */

const MMC_ACHIEVEMENTS = (() => {
  const stored = JSON.parse(localStorage.getItem("mmc_achievements") || "[]");
  // Back-compat: old storage was a flat array of IDs. New: array of {id, tier}.
  const unlocked = new Map();
  stored.forEach((item) => {
    if (typeof item === "string") unlocked.set(item, "common");
    else if (item && item.id) unlocked.set(item.id, item.tier || "common");
  });

  function save() {
    localStorage.setItem(
      "mmc_achievements",
      JSON.stringify([...unlocked.entries()].map(([id, tier]) => ({ id, tier })))
    );
  }

  // --- Toast queue — one at a time, staggered ---
  const queue = [];
  let processing = false;

  function enqueue(title, body, tier) {
    queue.push({ title, body, tier: tier || "common" });
    if (!processing) processQueue();
  }

  function processQueue() {
    if (queue.length === 0) { processing = false; return; }
    processing = true;
    const { title, body, tier } = queue.shift();
    const toast = document.createElement("div");
    toast.className = "toast toast-" + tier;
    toast.innerHTML = `<div class="toast-head">${title}</div><div class="toast-body">${body}</div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    const visibleMs = tier === "legendary" ? 4200 : 3000;
    const gapMs = 600;
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, visibleMs);
    setTimeout(processQueue, visibleMs + gapMs);
  }

  // XP bonus awarded on first unlock, per tier
  const TIER_XP = { common: 25, rare: 75, epic: 200, legendary: 500 };

  function unlock(id, message, tier) {
    if (unlocked.has(id)) return;
    const effectiveTier = tier || "common";
    unlocked.set(id, effectiveTier);
    save();
    enqueue(`ACHIEVEMENT: ${id}`, message || "", effectiveTier);
    if (window.MMC_TRACK) window.MMC_TRACK.achievement(id, effectiveTier);
    if (window.MMC_SOUND) {
      if (effectiveTier === "legendary") {
        setTimeout(() => window.MMC_SOUND.presets.konami(), 150);
      } else {
        setTimeout(() => window.MMC_SOUND.presets.success(), 150);
      }
    }
    // Tier-based XP bonus — single source, catches all achievement unlocks
    const xpAmount = TIER_XP[effectiveTier] || TIER_XP.common;
    if (window.MMC_XP) {
      // Small delay so the achievement toast shows before the XP gain toast
      setTimeout(() => window.MMC_XP.gain(xpAmount, `Achievement: ${id}`), 250);
    }
  }

  // Public showToast just enqueues (back-compat for external callers)
  function showToast(title, body, tier) { enqueue(title, body, tier); }

  function list() { return [...unlocked.keys()]; }
  function listWithTier() { return [...unlocked.entries()].map(([id, tier]) => ({ id, tier })); }
  function tierOf(id) { return unlocked.get(id) || null; }
  function has(id) { return unlocked.has(id); }

  // Re-read from localStorage (for bfcache / tab focus returns)
  function refresh() {
    try {
      const latest = JSON.parse(localStorage.getItem("mmc_achievements") || "[]");
      unlocked.clear();
      latest.forEach((item) => {
        if (typeof item === "string") unlocked.set(item, "common");
        else if (item && item.id) unlocked.set(item.id, item.tier || "common");
      });
    } catch (e) {}
  }

  return { unlock, showToast, list, listWithTier, tierOf, has, refresh };
})();

window.MMC_ACHIEVEMENTS = MMC_ACHIEVEMENTS;

const MMC_EASTER = (() => {
  // Konami code
  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "KeyB", "KeyA",
  ];
  let konamiIdx = 0;

  // Typing buffer for word triggers
  let typingBuffer = "";
  const WORDS = {
    mohamed: () => {
      MMC_ACHIEVEMENTS.unlock("NAME_CALLER", "You typed my name. Respect.", "rare");
      // Persistent toggle
      const enabled = localStorage.getItem("mmc_mohamed_theme") === "1";
      const next = !enabled;
      localStorage.setItem("mmc_mohamed_theme", next ? "1" : "0");
      document.documentElement.classList.toggle("mohamed-theme", next);
      MMC_ACHIEVEMENTS.showToast(
        "MOHAMED MODE",
        next ? "ENABLED. Type 'mohamed' again to disable." : "DISABLED. Normal colors restored.",
        "rare"
      );
    },
    hackerman: () => {
      MMC_ACHIEVEMENTS.unlock("HACKERMAN", "Hackerman.gif activated.");
      matrixMode();
    },
    neo: () => {
      MMC_ACHIEVEMENTS.unlock("WAKE_UP", "Wake up, Neo...");
      if (window.MMC_GLITCH) window.MMC_GLITCH.vhsBar();
    },
    geek: () => {
      MMC_ACHIEVEMENTS.unlock("GEEK_CERTIFIED", "You are now certified geek.");
    },
    tunisia: () => {
      MMC_ACHIEVEMENTS.unlock("GREETINGS_TN", "Tunisian represent! 🇹🇳");
    },
  };

  // Modifier/meta keys we ignore so they don't reset the Konami counter mid-sequence
  const KONAMI_IGNORE = new Set([
    "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight",
    "AltLeft", "AltRight", "MetaLeft", "MetaRight",
    "CapsLock", "Tab", "Escape", "Fn"
  ]);
  function handleKonami(e) {
    if (KONAMI_IGNORE.has(e.code)) return; // don't affect konamiIdx
    if (e.code === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        matrixMode();
        MMC_ACHIEVEMENTS.unlock("KONAMI_MASTER", "Up Up Down Down Left Right Left Right B A");
        if (window.MMC_TRACK) window.MMC_TRACK.easterEgg("konami_code");
        if (window.MMC_SOUND) window.MMC_SOUND.presets.konami();
      }
    } else {
      // Allow restarting a partial sequence: if the key matches KONAMI[0], start over from 1
      konamiIdx = e.code === KONAMI[0] ? 1 : 0;
    }
  }

  function handleTypingBuffer(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key && e.key.length === 1) {
      typingBuffer += e.key.toLowerCase();
      if (typingBuffer.length > 20) typingBuffer = typingBuffer.slice(-20);
      for (const word of Object.keys(WORDS)) {
        if (typingBuffer.endsWith(word)) {
          WORDS[word]();
          if (window.MMC_TRACK) window.MMC_TRACK.easterEgg("typed_" + word);
          typingBuffer = "";
          break;
        }
      }
    }
  }

  // Matrix mode — full overlay takeover
  function matrixMode() {
    const overlay = document.createElement("div");
    overlay.className = "matrix-takeover";
    overlay.innerHTML = `
      <div class="mt-text">WAKE UP</div>
      <div class="mt-sub">THE MATRIX HAS YOU...</div>
    `;
    document.body.appendChild(overlay);
    document.documentElement.setAttribute("data-theme", "matrix");
    if (window.MMC_MATRIX) window.MMC_MATRIX.setOpacity(0.5);
    setTimeout(() => overlay.classList.add("active"), 50);
    setTimeout(() => {
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.remove();
        const saved = localStorage.getItem("mmc_theme") || "";
        document.documentElement.setAttribute("data-theme", saved);
        if (window.MMC_MATRIX) window.MMC_MATRIX.setOpacity(0.18);
      }, 600);
    }, 3500);
  }

  // Theme cycling on logo click
  function initThemeCycle() {
    const themes = ["", "magenta", "matrix", "danger"];
    let idx = themes.indexOf(localStorage.getItem("mmc_theme") || "");
    const trigger = document.querySelector("[data-theme-cycle]");
    if (!trigger) return;
    let clickCount = 0;
    let clickTimer = null;
    trigger.addEventListener("click", (e) => {
      clickCount++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        if (clickCount >= 5) {
          idx = (idx + 1) % themes.length;
          const next = themes[idx];
          document.documentElement.setAttribute("data-theme", next);
          localStorage.setItem("mmc_theme", next);
          MMC_ACHIEVEMENTS.unlock("CHAMELEON", "You discovered the theme cycler.");
          if (window.MMC_TRACK) window.MMC_TRACK.themeChanged(next || "default");
          if (window.MMC_SOUND) window.MMC_SOUND.presets.success();
        }
        clickCount = 0;
      }, 500);
    });
  }

  // Console.log ASCII art for devs
  function consoleGreeting() {
    const style1 = "color:#00f0ff;font-family:monospace;font-size:12px;text-shadow:0 0 6px #00f0ff";
    const style2 = "color:#ff00ea;font-family:monospace;font-size:11px";
    const style3 = "color:#00ff41;font-family:monospace;font-size:11px";
    console.log("%c" + `
  ███╗   ███╗███╗   ███╗ ██████╗
  ████╗ ████║████╗ ████║██╔════╝
  ██╔████╔██║██╔████╔██║██║
  ██║╚██╔╝██║██║╚██╔╝██║██║
  ██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╗
  ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝
    `, style1);
    console.log("%c → Welcome to MMC Portfolio v2.0", style2);
    console.log("%c → Inspecting the source? Respect, fellow geek.", style3);
    console.log("%c → Psst: try typing 'mohamed' on the page.", style3);
    console.log("%c → Or press / to open the terminal.", style3);
    console.log("%c → Achievements: window.MMC_ACHIEVEMENTS.list()", style3);
    console.log("%c → You just unlocked: DEV_INSPECTOR", "color:#ffcc00;font-weight:bold");
    setTimeout(() => MMC_ACHIEVEMENTS.unlock("DEV_INSPECTOR", "You opened the console. Nice."), 500);
  }

  // Self-destruct fake on triple-click the danger zone
  function initSelfDestruct() {
    let clicks = 0;
    let timer = null;
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-self-destruct")) {
        clicks++;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 800);
        if (clicks >= 3) {
          clicks = 0;
          fakeSelfDestruct();
        }
      }
    });
  }

  function fakeSelfDestruct() {
    const msg = document.createElement("div");
    msg.style.cssText = "position:fixed;inset:0;background:#000;z-index:9990;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;font-family:'JetBrains Mono',monospace;color:#ff3366;text-shadow:0 0 20px #ff3366;text-align:center";
    msg.innerHTML = `
      <div style="font-size:clamp(2rem,6vw,4rem);letter-spacing:0.15em;">⚠ SELF-DESTRUCT INITIATED ⚠</div>
      <div id="sd-count" style="font-size:clamp(4rem,15vw,10rem);">5</div>
      <div style="font-size:0.9rem;opacity:0.7">JK, it's a portfolio 😏</div>
    `;
    document.body.appendChild(msg);
    if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
    let count = 5;
    const tick = setInterval(() => {
      count--;
      const el = document.getElementById("sd-count");
      if (el) el.textContent = count > 0 ? count : "CANCELLED";
      if (count <= 0) {
        clearInterval(tick);
        setTimeout(() => msg.remove(), 1200);
      }
    }, 1000);
    MMC_ACHIEVEMENTS.unlock("SELF_DESTRUCTED", "You triple-clicked the wrong button.");
  }

  // Right-click → fake 'access denied'
  let contextClicks = 0;
  function initContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      contextClicks++;
      if (contextClicks === 1) {
        e.preventDefault();
        MMC_ACHIEVEMENTS.unlock("NOSY", "Trying to inspect the source? Nice.");
      }
    });
  }

  // Idle detector (show hint after 20s idle)
  let idleTimer = null;
  function initIdle() {
    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        MMC_ACHIEVEMENTS.showToast("STILL THERE?", "Press / to open the terminal. Or type 'mohamed'.");
      }, 45000);
    }
    ["mousemove", "keydown", "scroll", "touchstart"].forEach((ev) =>
      document.addEventListener(ev, resetIdle, { passive: true })
    );
    resetIdle();
  }

  // Night owl mode — show a dismissible banner between 23h and 6h
  function initNightOwl() {
    const h = new Date().getHours();
    if (h < 23 && h >= 6) return;
    if (document.querySelector(".night-owl-banner")) return;
    const banner = document.createElement("div");
    banner.className = "night-owl-banner";
    banner.innerHTML = `Still coding at this hour? Respect. Coffee stats: critical. <button aria-label="close" style="background:transparent;border:none;color:inherit;margin-left:8px;font-size:0.9rem;cursor:pointer;">✕</button>`;
    document.body.appendChild(banner);
    banner.querySelector("button").addEventListener("click", () => {
      banner.style.transition = "opacity 0.4s";
      banner.style.opacity = "0";
      setTimeout(() => banner.remove(), 500);
    });
    setTimeout(() => {
      MMC_ACHIEVEMENTS.unlock("NIGHT_OWL", "You visited between 23:00 and 06:00. Welcome, fellow insomniac.");
      if (window.MMC_XP) window.MMC_XP.gain(60, "Night visit");
    }, 1500);
    // Auto-hide after 20s (user-dismissible via ✕)
    setTimeout(() => {
      if (!document.body.contains(banner)) return;
      banner.style.transition = "opacity 1.2s";
      banner.style.opacity = "0";
      setTimeout(() => banner.remove(), 1300);
    }, 20000);
  }

  function init() {
    document.addEventListener("keydown", handleKonami);
    document.addEventListener("keydown", handleTypingBuffer);
    initThemeCycle();
    initSelfDestruct();
    initContextMenu();
    initIdle();
    initNightOwl();
    consoleGreeting();
  }

  return { init, matrixMode };
})();

window.MMC_EASTER = MMC_EASTER;
