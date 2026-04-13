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
  // Theme restore handled by header.js

  // Sound init handled by header.js

  // Language init handled by header.js

  // --- Boot sequence ---
  if (window.MMC_BOOT) {
    MMC_BOOT.run(() => {
      startMainPage();
    });
  } else {
    startMainPage();
  }

  // ---- Scroll progress bar ----
  const scrollBar = document.querySelector(".scroll-progress");
  if (scrollBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollBar.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // Light mode toggle handled by header.js
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

  // Sound toggle handled by header.js

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

  // ---- Contact form submission ----
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("contact-submit");
      const status = document.getElementById("contact-status");
      const fd = new FormData(contactForm);
      const payload = {
        name: fd.get("name"),
        email: fd.get("email"),
        message: fd.get("message")
      };

      // Validate
      if (!payload.name || !payload.email || !payload.message) {
        showStatus(status, "⚠ Remplis tous les champs.", "var(--neon-warn)");
        return;
      }

      // UI feedback
      btn.disabled = true;
      btn.textContent = "⏳ SENDING...";
      showStatus(status, "", "");

      try {
        const res = await fetch("/api/contact.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.ok) {
          showStatus(status, "✅ Message transmis ! Réponse sous 24h.", "var(--neon-accent)");
          contactForm.reset();
          if (window.MMC_SOUND) MMC_SOUND.presets.success();
          if (window.MMC_TRACK) MMC_TRACK.contactClick("form");
        } else if (data.error === "rate-limited") {
          showStatus(status, "⏳ Un message déjà envoyé, réessaie dans 5 min.", "var(--neon-warn)");
        } else {
          showStatus(status, "❌ Erreur : " + (data.error || "inconnue"), "var(--neon-danger)");
        }
      } catch (err) {
        showStatus(status, "❌ Réseau indisponible, réessaie.", "var(--neon-danger)");
      }

      btn.disabled = false;
      btn.textContent = "→ TRANSMIT";
    });
  }
}

function showStatus(el, text, color) {
  if (!el) return;
  el.textContent = text;
  el.style.color = color;
  el.style.display = text ? "block" : "none";
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
