/* =========================================================
   cursor.js — Custom crosshair cursor, auto-initializing
   Also restores the mohamed-theme flag as early as possible.
   Works on every page that includes this script.
   ========================================================= */

// Restore mohamed-theme before first paint to avoid flash
try {
  if (localStorage.getItem("mmc_mohamed_theme") === "1") {
    document.documentElement.classList.add("mohamed-theme");
  }
} catch (e) {}

(function () {
  function init() {
    // Mobile: keep native cursor
    if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) return;
    if (document.querySelector(".cursor-dot")) return; // already inited

    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    // Start centered to avoid invisible cursor before first mousemove
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x, ry = y;
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";

    document.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.left = x + "px";
      dot.style.top = y + "px";
    });

    function loop() {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    const interactive = "a, button, .project-card, .skill-card, input, textarea, [data-theme-cycle], .hack-word, .vk-opt, .ai-input, .gallery-item, .t-close, .g-nav, .g-close";

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactive)) ring.classList.add("hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactive)) ring.classList.remove("hover");
    });

    // Hide when mouse leaves window, show when it returns
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
