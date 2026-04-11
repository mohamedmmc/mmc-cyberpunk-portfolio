/* =========================================================
   mode.js — Casual vs Elite mode system
   Casual: hints visible, easier challenges, default.
   Elite : no handholding, legendary tier, CTF Elite unlock.
   ========================================================= */

const MMC_MODE = (() => {
  const KEY = "mmc_mode";
  let current = localStorage.getItem(KEY) || "casual";

  function isElite() { return current === "elite"; }
  function isCasual() { return current === "casual"; }
  function get() { return current; }

  function set(mode) {
    if (mode !== "casual" && mode !== "elite") return false;
    const prev = current;
    current = mode;
    localStorage.setItem(KEY, mode);
    document.documentElement.setAttribute("data-mode", mode);
    renderBadge();
    if (mode === "elite" && prev !== "elite") {
      if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("ELITE_INITIATE", "You chose the hard path. Respect.", "legendary");
      if (window.MMC_XP) window.MMC_XP.gain(200, "Elite mode unlocked");
      if (window.MMC_SOUND) window.MMC_SOUND.presets.konami();
    }
    window.dispatchEvent(new CustomEvent("mode-changed", { detail: { mode } }));
    if (window.MMC_TRACK && prev !== mode) window.MMC_TRACK.modeChanged(mode);
    return true;
  }

  function renderBadge() {
    const xp = document.getElementById("xp-badge");
    if (!xp) return;
    xp.classList.toggle("xp-elite", current === "elite");
  }

  function toggle() { return set(current === "elite" ? "casual" : "elite"); }

  function init() {
    document.documentElement.setAttribute("data-mode", current);
    renderBadge();
  }

  return { get, set, isElite, isCasual, toggle, init };
})();
window.MMC_MODE = MMC_MODE;
