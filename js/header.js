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
  // ---- Theme glitch transition ----
  let glitchLock = false;

  function buildOverlay() {
    let o = document.getElementById("theme-glitch-overlay");
    if (o) return o;
    o = document.createElement("div");
    o.id = "theme-glitch-overlay";
    o.className = "theme-glitch-overlay";
    // Flash layer
    const flash = document.createElement("div");
    flash.className = "tg-flash";
    o.appendChild(flash);
    // Glitch bands (5 horizontal strips at random heights)
    const heights = [8, 12, 6, 15, 10];
    const tops = [5, 22, 45, 65, 82];
    for (let i = 0; i < 5; i++) {
      const band = document.createElement("div");
      band.className = "tg-band";
      band.style.top = tops[i] + "%";
      band.style.height = heights[i] + "px";
      o.appendChild(band);
    }
    // RGB split layer
    const rgb = document.createElement("div");
    rgb.className = "tg-rgb";
    o.appendChild(rgb);
    document.body.appendChild(o);
    return o;
  }

  function themeGlitch(toDark, callback) {
    if (glitchLock) return;
    glitchLock = true;

    const overlay = buildOverlay();
    const html = document.documentElement;
    const vhs = document.querySelector(".vhs-bar");

    // Randomise band positions each time
    overlay.querySelectorAll(".tg-band").forEach((b) => {
      b.style.top = (Math.random() * 85 + 5) + "%";
      b.style.height = (Math.random() * 12 + 4) + "px";
    });

    // Direction class (controls flash color)
    overlay.classList.remove("to-dark");
    if (toDark) overlay.classList.add("to-dark");

    // Start glitch
    overlay.classList.add("active");
    html.classList.add("theme-switching");
    if (vhs) vhs.classList.add("active");

    // Glitch sound burst
    if (window.MMC_SOUND) {
      MMC_SOUND.presets.glitch();
      setTimeout(() => MMC_SOUND.presets.glitch(), 80);
      setTimeout(() => MMC_SOUND.presets.glitch(), 180);
    }

    // Apply theme at the flash peak (~280ms)
    setTimeout(() => {
      callback();
      if (window.MMC_SOUND) MMC_SOUND.presets.success();
    }, 280);

    // Cleanup after animation ends (~750ms)
    setTimeout(() => {
      overlay.classList.remove("active", "to-dark");
      html.classList.remove("theme-switching");
      if (vhs) vhs.classList.remove("active");
      glitchLock = false;
    }, 750);
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
