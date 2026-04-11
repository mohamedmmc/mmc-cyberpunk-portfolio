/* =========================================================
   sound.js — 8-bit style beeps via Web Audio API
   No assets needed, everything is synthesized.
   ========================================================= */

const MMC_SOUND = (() => {
  let enabled = localStorage.getItem("mmc_sound") === "on";
  let ctx = null;

  function ensureCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function play(freq = 440, dur = 0.08, type = "square", vol = 0.08) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }

  function sweep(from, to, dur = 0.2, type = "sawtooth", vol = 0.06) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  }

  function noise(dur = 0.1, vol = 0.05) {
    if (!enabled) return;
    const c = ensureCtx();
    if (!c) return;
    const bufSize = c.sampleRate * dur;
    const buffer = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1000 + Math.random() * 2000;
    src.buffer = buffer;
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    src.start();
  }

  // Preset sounds
  const presets = {
    click: () => play(880, 0.04, "square", 0.04),
    hover: () => play(1200, 0.025, "square", 0.02),
    beep: () => play(660, 0.1, "square", 0.06),
    error: () => { play(180, 0.15, "sawtooth", 0.08); setTimeout(() => play(120, 0.2, "sawtooth", 0.08), 80); },
    success: () => { play(660, 0.08); setTimeout(() => play(880, 0.08), 60); setTimeout(() => play(1100, 0.12), 120); },
    typing: () => play(1800 + Math.random() * 400, 0.015, "square", 0.015),
    boot: () => sweep(100, 1200, 0.5, "square", 0.05),
    glitch: () => noise(0.08, 0.07),
    startup: () => {
      play(523, 0.1);
      setTimeout(() => play(659, 0.1), 100);
      setTimeout(() => play(784, 0.1), 200);
      setTimeout(() => play(1047, 0.18), 300);
    },
    konami: () => {
      const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
      notes.forEach((n, i) => setTimeout(() => play(n, 0.1, "square", 0.06), i * 80));
    },
  };

  function toggle() {
    enabled = !enabled;
    localStorage.setItem("mmc_sound", enabled ? "on" : "off");
    updateButton();
    if (enabled) presets.boot();
    return enabled;
  }

  function updateButton() {
    const btn = document.getElementById("sound-toggle");
    if (btn) {
      btn.textContent = enabled ? "SOUND:ON" : "SOUND:OFF";
      btn.classList.toggle("active", enabled);
    }
  }

  function init() {
    updateButton();
    // Auto-bind hover sounds to interactive elements
    document.addEventListener("click", (e) => {
      if (e.target.closest("a, button, .project-card, .skill-card")) {
        presets.click();
      }
    });
    let lastHover = 0;
    document.addEventListener("mouseover", (e) => {
      const now = Date.now();
      if (now - lastHover < 40) return;
      if (e.target.closest("a, button, .project-card, .skill-card")) {
        lastHover = now;
        presets.hover();
      }
    });
  }

  return { play, sweep, noise, presets, toggle, init, isEnabled: () => enabled };
})();

window.MMC_SOUND = MMC_SOUND;
