/* =========================================================
   project-page.js — Shared init for all project detail pages
   Handles: modules init, reveal on scroll, gallery modal.
   ========================================================= */

// Re-sync from localStorage on return visits (bfcache, tab focus, back button)
function mmcResyncFromStorage() {
  if (window.MMC_ACHIEVEMENTS && window.MMC_ACHIEVEMENTS.refresh) MMC_ACHIEVEMENTS.refresh();
  if (window.MMC_XP && window.MMC_XP.refresh) MMC_XP.refresh();
  if (window.MMC_MODE && window.MMC_MODE.init) MMC_MODE.init();
}
window.addEventListener("pageshow", (e) => {
  if (e.persisted) mmcResyncFromStorage();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") mmcResyncFromStorage();
});
window.addEventListener("storage", (e) => {
  if (e.key && e.key.startsWith("mmc_")) mmcResyncFromStorage();
});

document.addEventListener("DOMContentLoaded", () => {
  // --- Restore theme + mode ---
  const savedTheme = localStorage.getItem("mmc_theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  // --- Init modules in safe order ---
  if (window.MMC_SOUND) MMC_SOUND.init();
  if (window.MMC_I18N) MMC_I18N.apply(localStorage.getItem("mmc_lang") || "fr");
  if (window.MMC_XP) MMC_XP.init();
  if (window.MMC_MODE) MMC_MODE.init();
  if (window.MMC_BG) MMC_BG.startCurrent();
  else if (window.MMC_MATRIX) MMC_MATRIX.start();
  if (window.MMC_GLITCH) {
    MMC_GLITCH.initGlitchText();
    MMC_GLITCH.initVhsScheduler();
  }
  if (window.MMC_TERM) MMC_TERM.init();
  if (window.MMC_EASTER) MMC_EASTER.init();

  // --- Scroll reveal ---
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // --- Year in footer ---
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // --- Gallery modal ---
  const gmodal = document.getElementById("g-modal");
  if (!gmodal) return;
  const gimg = gmodal.querySelector("img");
  const items = [...document.querySelectorAll(".gallery-item")];
  if (!items.length) return;

  let gi = 0;
  function show(i) {
    gi = (i + items.length) % items.length;
    gimg.src = items[gi].dataset.img;
    gmodal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function hide() {
    gmodal.classList.remove("active");
    document.body.style.overflow = "";
  }
  items.forEach((it, i) => it.addEventListener("click", () => show(i)));
  gmodal.querySelector(".g-close")?.addEventListener("click", hide);
  gmodal.addEventListener("click", (e) => { if (e.target === gmodal) hide(); });
  gmodal.querySelector(".g-prev")?.addEventListener("click", (e) => { e.stopPropagation(); show(gi - 1); });
  gmodal.querySelector(".g-next")?.addEventListener("click", (e) => { e.stopPropagation(); show(gi + 1); });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!gmodal.classList.contains("active")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(gi - 1);
    if (e.key === "ArrowRight") show(gi + 1);
  });

  // Swipe on mobile
  let touchStartX = null;
  gmodal.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
  }, { passive: true });
  gmodal.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) show(gi + (dx < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
});
