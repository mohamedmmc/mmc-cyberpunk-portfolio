/* =========================================================
   main.js — Main orchestrator & glue
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
  // --- Restore theme ---
  const savedTheme = localStorage.getItem("mmc_theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  // --- Sound init ---
  if (window.MMC_SOUND) MMC_SOUND.init();

  // --- i18n: apply saved language ---
  if (window.MMC_I18N) {
    const saved = localStorage.getItem("mmc_lang") || "fr";
    MMC_I18N.apply(saved);
    document.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => MMC_I18N.apply(btn.getAttribute("data-lang")));
    });
  }

  // --- Boot sequence ---
  if (window.MMC_BOOT) {
    MMC_BOOT.run(() => {
      startMainPage();
    });
  } else {
    startMainPage();
  }
});

function startMainPage() {
  // --- XP system ---
  if (window.MMC_XP) MMC_XP.init();
  if (window.MMC_MODE) MMC_MODE.init();

  // --- Background effect via manager (respects saved preference) ---
  if (window.MMC_BG) {
    MMC_BG.startCurrent();
  } else if (window.MMC_MATRIX) {
    MMC_MATRIX.start();
  }

  // --- Glitch text init ---
  if (window.MMC_GLITCH) {
    MMC_GLITCH.initGlitchText();
    MMC_GLITCH.initVhsScheduler();

    // Typing effect for hero
    const heroType = document.getElementById("hero-typing-text");
    if (heroType && window.MMC_I18N) {
      const phrases = [
        MMC_I18N.t("hero_typing_1"),
        MMC_I18N.t("hero_typing_2"),
        MMC_I18N.t("hero_typing_3"),
        MMC_I18N.t("hero_typing_4"),
        MMC_I18N.t("hero_typing_5"),
      ];
      MMC_GLITCH.typeLoop(heroType, phrases);

      // Restart on language change
      window.addEventListener("lang-changed", () => {
        heroType.textContent = "";
        setTimeout(() => {
          const newPhrases = [
            MMC_I18N.t("hero_typing_1"),
            MMC_I18N.t("hero_typing_2"),
            MMC_I18N.t("hero_typing_3"),
            MMC_I18N.t("hero_typing_4"),
            MMC_I18N.t("hero_typing_5"),
          ];
          MMC_GLITCH.typeLoop(heroType, newPhrases);
        }, 200);
      });
    }
  }

  // --- Reveal on scroll ---
  initScrollReveal();

  // --- Skill bars animation ---
  initSkillBars();

  // --- Custom cursor: handled by cursor.js auto-init ---

  // --- Uptime counter ---
  initUptime();

  // --- Sound toggle ---
  const soundBtn = document.getElementById("sound-toggle");
  if (soundBtn) soundBtn.addEventListener("click", () => MMC_SOUND.toggle());

  // --- Terminal ---
  if (window.MMC_TERM) MMC_TERM.init();

  // --- Easter eggs ---
  if (window.MMC_EASTER) MMC_EASTER.init();

  // --- Parallax on profile holo ---
  initProfileHolo();

  // --- Smooth scroll for anchors ---
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // --- Analytics bindings (section view, project/CTA clicks) ---
  initAnalyticsBindings();
}

/* ---------- Analytics bindings ---------- */
function initAnalyticsBindings() {
  if (!window.MMC_TRACK) return;

  // Section view via IntersectionObserver
  const sections = document.querySelectorAll("section[id]");
  if (sections.length && "IntersectionObserver" in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target.id)) {
          seen.add(entry.target.id);
          window.MMC_TRACK.sectionView(entry.target.id);
        }
      });
    }, { threshold: 0.35 });
    sections.forEach((s) => io.observe(s));
  }

  // Project card clicks (on index.html)
  document.querySelectorAll("a[href*='projects/']").forEach((a) => {
    a.addEventListener("click", () => {
      const href = a.getAttribute("href") || "";
      const m = href.match(/projects\/([a-z0-9\-]+)\.html/i);
      if (m) window.MMC_TRACK.projectClick(m[1]);
    });
  });

  // Contact CTA (email + phone + social)
  document.querySelectorAll("a[href^='mailto:']").forEach((a) => {
    a.addEventListener("click", () => window.MMC_TRACK.contactClick("email"));
  });
  document.querySelectorAll("a[href^='tel:']").forEach((a) => {
    a.addEventListener("click", () => window.MMC_TRACK.contactClick("phone"));
  });
  document.querySelectorAll("a[href*='linkedin.com']").forEach((a) => {
    a.addEventListener("click", () => window.MMC_TRACK.contactClick("linkedin"));
  });
  document.querySelectorAll("a[href*='github.com']").forEach((a) => {
    a.addEventListener("click", () => window.MMC_TRACK.contactClick("github"));
  });
}

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((i) => io.observe(i));
}

/* ---------- Skill bars animated fill ---------- */
function initSkillBars() {
  const bars = document.querySelectorAll(".skill-bar-fill");
  if (!bars.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const val = el.getAttribute("data-val") || "0";
          el.style.setProperty("--val", val + "%");
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((b) => io.observe(b));
}

/* ---------- Uptime counter ---------- */
function initUptime() {
  const el = document.getElementById("uptime-counter");
  if (!el) return;
  const start = Date.now();
  function tick() {
    const s = Math.floor((Date.now() - start) / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    el.textContent = `${h}:${m}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Parallax tilt on profile holo ---------- */
function initProfileHolo() {
  const holo = document.querySelector(".profile-holo");
  if (!holo) return;
  const parent = holo.parentElement;
  parent.addEventListener("mousemove", (e) => {
    const rect = parent.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    holo.style.transform = `perspective(900px) rotateY(${cx * 12}deg) rotateX(${-cy * 12}deg)`;
  });
  parent.addEventListener("mouseleave", () => {
    holo.style.transform = "perspective(900px) rotateY(-6deg) rotateX(4deg)";
  });
}
