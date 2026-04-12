/* =========================================================
   xp.js — XP / Level / Achievements dashboard
   ========================================================= */

const MMC_XP = (() => {
  const KEY = "mmc_xp";
  const LEVELS = [
    { lvl: 0,  xp: 0,    title: "SCRIPT_KIDDIE" },
    { lvl: 1,  xp: 100,  title: "LURKER" },
    { lvl: 2,  xp: 250,  title: "TINKERER" },
    { lvl: 3,  xp: 500,  title: "CONSOLE_COWBOY" },
    { lvl: 4,  xp: 900,  title: "DECK_JOCKEY" },
    { lvl: 5,  xp: 1500, title: "WINTERMUTE" },
    { lvl: 6,  xp: 2100, title: "NEUROMANCER" },
    { lvl: 7,  xp: 2800, title: "ICE_BREAKER" },
    { lvl: 8,  xp: 3600, title: "FLATLINE" },
    { lvl: 9,  xp: 4500, title: "ZERO_COOL" },
    { lvl: 10, xp: 5500, title: "NEO" }
  ];
  const MAX_LEVEL = LEVELS.length - 1;

  // state.level is derived from state.xp via currentLevel() — not stored separately
  const raw = JSON.parse(localStorage.getItem(KEY) || '{"xp":0}');
  const state = { xp: raw.xp || 0 };

  function save() { localStorage.setItem(KEY, JSON.stringify({ xp: state.xp })); }

  function currentLevel() {
    let lvl = 0;
    for (const l of LEVELS) if (state.xp >= l.xp) lvl = l.lvl;
    return lvl;
  }

  function title() {
    const lvl = currentLevel();
    return LEVELS[lvl]?.title || "UNKNOWN";
  }

  function nextThreshold() {
    const lvl = currentLevel();
    return LEVELS[lvl + 1]?.xp || LEVELS[LEVELS.length - 1].xp;
  }

  function gain(amount, reason) {
    const prevLevel = currentLevel();
    state.xp += amount;
    const newLevel = currentLevel();
    save();
    renderBadge();
    if (window.MMC_TRACK) window.MMC_TRACK.xpGained(amount, reason, state.xp, newLevel);
    // Level up notification
    if (newLevel > prevLevel && window.MMC_ACHIEVEMENTS) {
      const t = LEVELS[newLevel].title;
      window.MMC_ACHIEVEMENTS.showToast(`LEVEL UP → ${t}`, `You are now level ${newLevel}. Keep hacking.`);
      if (window.MMC_SOUND) window.MMC_SOUND.presets.konami();
      if (window.MMC_TRACK) window.MMC_TRACK.levelUp(prevLevel, newLevel, t);
    }
    // Gain flash
    showGain(amount, reason);
  }

  function showGain(amount, reason) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed;
      bottom:60px;
      left:50%;
      transform:translateX(-50%) translateY(20px);
      background:rgba(5,6,12,0.95);
      border:1px solid var(--neon-accent);
      color:var(--neon-accent);
      padding:8px 18px;
      font-family:var(--font-mono);
      font-size:0.85rem;
      text-shadow:0 0 6px var(--neon-accent);
      box-shadow:0 0 12px rgba(0,255,65,0.4);
      z-index:9600;
      letter-spacing:0.08em;
      text-transform:uppercase;
      opacity:0;
      transition:opacity 0.3s, transform 0.4s;
    `;
    el.textContent = `+${amount} XP  ${reason ? '• ' + reason : ''}`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; }, 20);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(-50%) translateY(-20px)";
      setTimeout(() => el.remove(), 400);
    }, 1800);
  }

  function renderBadge() {
    const badge = document.getElementById("xp-badge");
    if (!badge) return;
    const lvl = currentLevel();
    const cur = state.xp;
    if (lvl >= MAX_LEVEL) {
      // Max level — show MAX instead of progress
      badge.innerHTML = `
        LVL ${lvl} [${title()}]
        <span class="xp-bar">██████████</span>
        MAX
      `;
      return;
    }
    const nextXp = nextThreshold();
    const prevXp = LEVELS[lvl].xp;
    const pct = Math.round(((cur - prevXp) / (nextXp - prevXp)) * 100);
    const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    badge.innerHTML = `
      LVL ${lvl} [${title()}]
      <span class="xp-bar">${bar}</span>
      ${cur}/${nextXp}
    `;
  }

  // Catalog of all achievements with their locked hints.
  // LOCKED list is filtered against actually-unlocked set.
  const CATALOG = [
    { id: "CTF_MASTER",       hint: "Crack the 5-step CTF", tier: "epic" },
    { id: "EXTREME_CTF",      hint: "Solve the Elite CTF",  tier: "legendary" },
    { id: "GIBSON_FOUND",     hint: "Reach the hidden Gibson page", tier: "epic" },
    { id: "ELITE_INITIATE",   hint: "Enter elite mode",      tier: "legendary" },
    { id: "NIGHT_OWL",        hint: "Visit between 23:00 and 06:00", tier: "rare" },
    { id: "LOST_IN_404",      hint: "Find the 404 page",     tier: "common" },
    { id: "SNAKE_MASTER",     hint: "Score 50 on Snake",     tier: "rare" },
    { id: "HACKER_ELITE",     hint: "Crack the Fallout Hack game", tier: "rare" },
    { id: "G2048",            hint: "Reach 2048 in the 2048 game", tier: "rare" },
    { id: "FRACTAL_EXPLORER", hint: "Dive 8 zooms into the Mandelbrot", tier: "rare" },
    { id: "CERTIFIED_HUMAN",  hint: "Pass the Voight-Kampff test", tier: "rare" },
    { id: "REPLICANT",        hint: "Fail the Voight-Kampff test", tier: "rare" },
    { id: "AI_WHISPERER",     hint: "Talk to AI.CHTOUROU (press ~)", tier: "common" },
    { id: "KONAMI_MASTER",    hint: "Type the Konami code",  tier: "rare" },
    { id: "NAME_CALLER",      hint: "Type 'mohamed' somewhere", tier: "rare" },
    { id: "CHAMELEON",        hint: "Click the hero badge 5 times", tier: "rare" },
    { id: "SELF_DESTRUCTED",  hint: "Triple-click a danger zone", tier: "rare" },
    { id: "BG_SWITCHER",      hint: "Use 'bg <name>' in the terminal", tier: "rare" }
  ];

  function dashboard() {
    const lvl = currentLevel();
    const cur = state.xp;
    const isMax = lvl >= MAX_LEVEL;
    const nextXp = nextThreshold();
    const prevXp = LEVELS[lvl].xp;
    const pct = isMax ? 100 : Math.round(((cur - prevXp) / (nextXp - prevXp)) * 100);
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
    const mode = window.MMC_MODE ? window.MMC_MODE.get() : "casual";
    const xpLine = isMax
      ? `  XP:  [${bar}] ${cur} — MAX LEVEL`
      : `  XP:  [${bar}] ${cur}/${nextXp}`;
    const lines = [
      { cls: "ok", text: "═══════════════════════════════════" },
      { cls: "ok", text: "  PLAYER DASHBOARD" },
      { cls: "ok", text: "═══════════════════════════════════" },
      { cls: "out", text: "" },
      { cls: "out", text: `  LVL ${lvl}  [${title()}]  (mode: ${mode})` },
      { cls: "out", text: xpLine },
      { cls: "hint", text: "  (all progress saved in localStorage — persists across sessions)" },
      { cls: "out", text: "" }
    ];

    const tierIcons = { common: "◆", rare: "◈", epic: "⬢", legendary: "★" };
    const tierColors = { common: "ok", rare: "ok", epic: "hint", legendary: "err" };
    const listW = window.MMC_ACHIEVEMENTS ? window.MMC_ACHIEVEMENTS.listWithTier() : [];
    const unlockedIds = new Set(listW.map(a => a.id));

    lines.push({ cls: "out", text: `  UNLOCKED (${listW.length}/${CATALOG.length}):` });
    if (listW.length === 0) {
      lines.push({ cls: "hint", text: "    (none yet — go explore)" });
    } else {
      ["legendary", "epic", "rare", "common"].forEach(t => {
        const items = listW.filter(a => (a.tier || "common") === t);
        if (!items.length) return;
        items.forEach(a => lines.push({
          cls: tierColors[t] || "ok",
          text: `    ${tierIcons[t] || "◆"} [${t.toUpperCase()}] ${a.id}`
        }));
      });
    }

    // LOCKED — filter out already-unlocked ones
    const stillLocked = CATALOG.filter(c => !unlockedIds.has(c.id));
    if (stillLocked.length > 0) {
      lines.push({ cls: "out", text: "" });
      lines.push({ cls: "hint", text: `  LOCKED (${stillLocked.length} remaining):` });
      // Sort: legendary first, then epic, rare, common
      const order = { legendary: 0, epic: 1, rare: 2, common: 3 };
      stillLocked.sort((a, b) => order[a.tier || "common"] - order[b.tier || "common"]);
      stillLocked.slice(0, 15).forEach(c => {
        const icon = tierIcons[c.tier] || "◇";
        lines.push({ cls: "hint", text: `    ${icon} ???  — ${c.hint}  [${c.tier}]` });
      });
      if (stillLocked.length > 15) {
        lines.push({ cls: "hint", text: `    ... and ${stillLocked.length - 15} more` });
      }
    } else {
      lines.push({ cls: "out", text: "" });
      lines.push({ cls: "ok", text: "  ALL ACHIEVEMENTS UNLOCKED. YOU ARE THE ONE." });
    }

    lines.push({ cls: "out", text: "" });
    lines.push({ cls: "ok", text: "═══════════════════════════════════" });
    return lines;
  }

  function reset() {
    state.xp = 0;
    state.level = 0;
    save();
    renderBadge();
  }

  function refresh() {
    // Re-read from localStorage (for bfcache / returning visits)
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '{"xp":0}');
      state.xp = raw.xp || 0;
      renderBadge();
    } catch (e) {}
  }

  function init() {
    // Inject the badge into status bar
    const statusRight = document.querySelector(".status-right");
    if (statusRight && !document.getElementById("xp-badge")) {
      const badge = document.createElement("span");
      badge.id = "xp-badge";
      badge.className = "xp-badge";
      badge.setAttribute("role", "button");
      badge.setAttribute("tabindex", "0");
      badge.setAttribute("title", "View achievements");
      statusRight.appendChild(badge);
      // Click → open terminal + show achievements
      const openDashboard = () => {
        if (window.MMC_TERM) {
          window.MMC_TERM.open("xp_badge");
          setTimeout(() => window.MMC_TERM.exec("achievements"), 120);
        }
      };
      badge.addEventListener("click", openDashboard);
      badge.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDashboard(); }
      });
    }
    renderBadge();
  }

  return { state, gain, currentLevel, title, dashboard, init, refresh, reset, renderBadge, LEVELS };
})();

window.MMC_XP = MMC_XP;
