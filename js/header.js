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
  // ---- Theme glitch transition (GPU-only: filter + transform + opacity) ----
  let glitchLock = false;
  let flashEl = null;

  function getFlash() {
    if (flashEl) return flashEl;
    flashEl = document.createElement("div");
    flashEl.className = "theme-flash-overlay";
    document.body.appendChild(flashEl);
    return flashEl;
  }

  function themeGlitch(toDark, callback) {
    if (glitchLock) return;
    glitchLock = true;

    const html = document.documentElement;
    const flash = getFlash();

    // Set direction
    html.classList.remove("to-dark");
    flash.classList.remove("to-dark", "active");
    if (toDark) {
      html.classList.add("to-dark");
      flash.classList.add("to-dark");
    }

    // Force reflow so re-triggering the animation works
    void flash.offsetWidth;

    // Start — CSS filter distortion on page + flash overlay
    html.classList.add("theme-switching");
    flash.classList.add("active");

    // Sound
    if (window.MMC_SOUND) MMC_SOUND.presets.glitch();

    // Apply theme at distortion peak (~230ms)
    setTimeout(() => {
      callback();
      if (window.MMC_SOUND) MMC_SOUND.presets.success();
    }, 230);

    // Cleanup after animation (550ms)
    setTimeout(() => {
      html.classList.remove("theme-switching", "to-dark");
      flash.classList.remove("active", "to-dark");
      glitchLock = false;
    }, 580);
  }

  // ---- Theme toggle ----
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    if (document.documentElement.getAttribute("data-theme") === "light") {
      themeBtn.textContent = "☾ DARK";
    }
    themeBtn.addEventListener("click", () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      themeGlitch(isLight, () => {
        if (isLight) {
          document.documentElement.setAttribute("data-theme", "");
          localStorage.setItem("mmc_theme", "");
          themeBtn.textContent = "☀ LIGHT";
        } else {
          document.documentElement.setAttribute("data-theme", "light");
          localStorage.setItem("mmc_theme", "light");
          themeBtn.textContent = "☾ DARK";
        }
      });
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
