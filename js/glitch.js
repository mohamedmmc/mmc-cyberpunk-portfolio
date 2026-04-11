/* =========================================================
   glitch.js — Text glitch effects, typing, decoder
   ========================================================= */

const MMC_GLITCH = (() => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?~";

  // Typewriter effect on an element with data-typing attribute
  function typewriter(el, text, speed = 35, cb) {
    if (!el) return;
    el.textContent = "";
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i];
        if (window.MMC_SOUND && window.MMC_SOUND.isEnabled()) {
          if (i % 2 === 0) window.MMC_SOUND.presets.typing();
        }
        i++;
        setTimeout(tick, speed + Math.random() * 20);
      } else if (cb) cb();
    };
    tick();
  }

  // Decoder scramble effect
  function decode(el, finalText, duration = 900) {
    if (!el) return;
    const start = performance.now();
    const step = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealCount = Math.floor(finalText.length * progress);
      let output = "";
      for (let i = 0; i < finalText.length; i++) {
        if (i < revealCount) output += finalText[i];
        else if (finalText[i] === " ") output += " ";
        else output += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      el.textContent = output;
      if (progress < 1) requestAnimationFrame(step);
    };
    step();
  }

  // Cyclic typing loop (multiple phrases)
  function typeLoop(el, phrases, opts = {}) {
    const { speed = 45, delay = 1500, backSpeed = 25 } = opts;
    if (!el || !phrases.length) return;
    let phraseIdx = 0;
    let i = 0;
    let deleting = false;

    const tick = () => {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        el.textContent = phrase.slice(0, i + 1);
        i++;
        if (i === phrase.length) {
          deleting = true;
          setTimeout(tick, delay);
          return;
        }
      } else {
        el.textContent = phrase.slice(0, i - 1);
        i--;
        if (i === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? backSpeed : speed + Math.random() * 20);
    };
    tick();
  }

  // Trigger a quick glitch on an element
  function pulse(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    if (window.MMC_SOUND) window.MMC_SOUND.presets.glitch();
  }

  // Random VHS tracking bar
  function vhsBar() {
    const bar = document.querySelector(".vhs-bar");
    if (!bar) return;
    bar.classList.remove("active");
    void bar.offsetWidth;
    bar.classList.add("active");
    if (window.MMC_SOUND && Math.random() > 0.7) window.MMC_SOUND.presets.glitch();
    setTimeout(() => bar.classList.remove("active"), 1200);
  }

  function initVhsScheduler() {
    if (document.querySelector(".vhs-bar")) {
      setInterval(() => {
        if (Math.random() > 0.5) vhsBar();
      }, 18000 + Math.random() * 15000);
    }
  }

  // Initialize all glitch text elements with their data-text
  function initGlitchText() {
    document.querySelectorAll(".glitch").forEach((el) => {
      if (!el.hasAttribute("data-text")) {
        el.setAttribute("data-text", el.textContent);
      }
    });
  }

  return {
    typewriter,
    decode,
    typeLoop,
    pulse,
    vhsBar,
    initVhsScheduler,
    initGlitchText,
  };
})();

window.MMC_GLITCH = MMC_GLITCH;
