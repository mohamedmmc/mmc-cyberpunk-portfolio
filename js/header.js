/* =========================================================
   header.js — Shared header logic for ALL pages
   Handles: theme restore, theme toggle, language, sound
   Loaded before other modules in <head> or early in <body>.
   ========================================================= */

// 1. Restore theme ASAP (prevents white flash on dark-theme pages)
try {
  const t = localStorage.getItem("mmc_theme");
  if (t) document.documentElement.setAttribute("data-theme", t);
} catch (e) {}

document.addEventListener("DOMContentLoaded", () => {
  // ---- Theme toggle ----
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    if (document.documentElement.getAttribute("data-theme") === "light") {
      themeBtn.textContent = "☾ DARK";
    }
    themeBtn.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (isLight) {
        document.documentElement.setAttribute("data-theme", "");
        localStorage.setItem("mmc_theme", "");
        themeBtn.textContent = "☀ LIGHT";
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("mmc_theme", "light");
        themeBtn.textContent = "☾ DARK";
      }
      if (window.MMC_SOUND) MMC_SOUND.presets.success();
    });
  }

  // ---- Language buttons ----
  if (window.MMC_I18N) {
    const saved = localStorage.getItem("mmc_lang") || "fr";
    MMC_I18N.apply(saved);
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => MMC_I18N.apply(btn.getAttribute("data-lang")));
    });
  }

  // ---- Sound ----
  if (window.MMC_SOUND) MMC_SOUND.init();
  const soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      if (window.MMC_SOUND) MMC_SOUND.toggle();
    });
  }
});
