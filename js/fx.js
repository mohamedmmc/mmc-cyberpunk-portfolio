/* =========================================================
   fx.js — Creative coding effects pool
   Modules: Flow field, Boids, Tron grid (can run in background
   canvas or a dedicated one). Plus a background manager.
   ========================================================= */

/* ---------- Perlin noise (tiny impl) ---------- */
const PERLIN = (() => {
  const p = new Uint8Array(512);
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  function noise2d(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];
    return (lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    ) + 1) / 2;
  }
  return { noise2d };
})();

/* =========================================================
   FLOW FIELD
   ========================================================= */
const MMC_FLOWFIELD = (() => {
  let canvas, ctx, animId, running = false;
  let particles = [];
  const PARTICLE_COUNT = 350;
  let mouseX = -9999, mouseY = -9999;
  let t = 0;

  function resize() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60
      });
    }
  }

  function getColor() {
    const s = getComputedStyle(document.documentElement);
    return s.getPropertyValue("--neon-primary").trim() || "#00f0ff";
  }

  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function draw() {
    if (!running) return;
    // Trail fade — adapt to theme
    ctx.fillStyle = isLight() ? "rgba(244, 246, 249, 0.05)" : "rgba(5, 6, 12, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const color = getColor();
    t += 0.003;

    particles.forEach((p) => {
      const angle = PERLIN.noise2d(p.x * 0.0024, p.y * 0.0024 + t) * Math.PI * 4;
      p.vx = Math.cos(angle) * 1.4;
      p.vy = Math.sin(angle) * 1.4;

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 22000) {
        const d = Math.sqrt(d2);
        const f = (22000 - d2) / 22000;
        p.vx += (dx / d) * f * 3;
        p.vy += (dy / d) * f * 3;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      if (
        p.x < 0 || p.x > canvas.width ||
        p.y < 0 || p.y > canvas.height ||
        p.life > p.maxLife
      ) {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.life = 0;
      }

      const alpha = Math.min(1, 1 - Math.abs(0.5 - p.life / p.maxLife) * 2) * 0.6;
      ctx.fillStyle = hexWithAlpha(color, alpha);
      ctx.fillRect(p.x, p.y, 1.2, 1.2);
    });

    animId = requestAnimationFrame(draw);
  }

  function hexWithAlpha(hex, a) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function onMouseMove(e) { mouseX = e.clientX; mouseY = e.clientY; }

  function start(el) {
    if (running) return;
    canvas = el || document.getElementById("matrix-canvas");
    if (!canvas) return;
    canvas.style.opacity = "0.45";
    ctx = canvas.getContext("2d");
    resize();
    initParticles();
    running = true;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    draw();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { start, stop };
})();
window.MMC_FLOWFIELD = MMC_FLOWFIELD;

/* =========================================================
   BOIDS (flocking)
   ========================================================= */
const MMC_BOIDS = (() => {
  let canvas, ctx, animId, running = false;
  let boids = [];
  const BOID_COUNT = 150;
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
  }

  function init() {
    boids = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      boids.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }
  }

  function limitSpeed(b, max) {
    const s = Math.hypot(b.vx, b.vy);
    if (s > max) { b.vx = (b.vx / s) * max; b.vy = (b.vy / s) * max; }
  }

  function getColor() {
    const s = getComputedStyle(document.documentElement);
    return s.getPropertyValue("--neon-primary").trim() || "#00f0ff";
  }

  function draw() {
    if (!running) return;
    const light = document.documentElement.getAttribute("data-theme") === "light";
    ctx.fillStyle = light ? "rgba(244, 246, 249, 0.15)" : "rgba(5, 6, 12, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const color = getColor();
    const VISUAL = 60;
    const SEPARATION = 22;

    boids.forEach((b, i) => {
      let ax = 0, ay = 0;       // alignment
      let cx = 0, cy = 0;       // cohesion
      let sx = 0, sy = 0;       // separation
      let neighbors = 0;
      let sepCount = 0;

      for (let j = 0; j < boids.length; j++) {
        if (i === j) continue;
        const o = boids[j];
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < VISUAL) {
          ax += o.vx; ay += o.vy;
          cx += o.x;  cy += o.y;
          neighbors++;
          if (d < SEPARATION) {
            sx -= dx / (d + 0.01);
            sy -= dy / (d + 0.01);
            sepCount++;
          }
        }
      }
      if (neighbors) {
        ax /= neighbors; ay /= neighbors;
        cx = cx / neighbors - b.x; cy = cy / neighbors - b.y;
      }
      b.vx += ax * 0.04 + cx * 0.0018 + sx * 0.06;
      b.vy += ay * 0.04 + cy * 0.0018 + sy * 0.06;

      // Mouse repulsion
      const mdx = b.x - mouseX;
      const mdy = b.y - mouseY;
      const mdist = Math.hypot(mdx, mdy);
      if (mdist < 110) {
        b.vx += (mdx / mdist) * (110 - mdist) * 0.02;
        b.vy += (mdy / mdist) * (110 - mdist) * 0.02;
      }

      limitSpeed(b, 2.2);
      b.x += b.vx;
      b.y += b.vy;

      // Wrap
      if (b.x < 0) b.x = canvas.width;
      if (b.x > canvas.width) b.x = 0;
      if (b.y < 0) b.y = canvas.height;
      if (b.y > canvas.height) b.y = 0;

      // Draw triangle
      const a = Math.atan2(b.vy, b.vx);
      ctx.beginPath();
      ctx.moveTo(b.x + Math.cos(a) * 6, b.y + Math.sin(a) * 6);
      ctx.lineTo(b.x + Math.cos(a + 2.6) * 4, b.y + Math.sin(a + 2.6) * 4);
      ctx.lineTo(b.x + Math.cos(a - 2.6) * 4, b.y + Math.sin(a - 2.6) * 4);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    animId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) { mouseX = e.clientX; mouseY = e.clientY; }

  function start(el) {
    if (running) return;
    canvas = el || document.getElementById("matrix-canvas");
    if (!canvas) return;
    canvas.style.opacity = "0.6";
    ctx = canvas.getContext("2d");
    resize();
    init();
    running = true;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    draw();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { start, stop };
})();
window.MMC_BOIDS = MMC_BOIDS;

/* =========================================================
   TRON GRID (perspective grid, canvas 2D)
   Used for the dedicated #cyberspace section.
   Desktop: mouse parallax.
   Mobile: device orientation (gyroscope) for all-direction look.
   ========================================================= */
const MMC_TRON = (() => {
  let canvas, ctx, animId, running = false;
  let scroll = 0;
  let mouseOffset = 0;
  let tiltX = 0, tiltY = 0;
  let orientationActive = false;

  function resize() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * (window.devicePixelRatio || 1);
    canvas.height = r.height * (window.devicePixelRatio || 1);
  }

  function draw() {
    if (!running) return;
    const w = canvas.width;
    const h = canvas.height;

    // Tilt influences camera (vanishing point + horizon shift)
    // Desktop: mouseOffset only (X). Mobile: tiltX (left/right) + tiltY (forward/back).
    const camX = orientationActive ? tiltX * 200 : mouseOffset * 0.1;
    const camY = orientationActive ? tiltY * 140 : 0;

    // Gradient background (synthwave sun)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a0420");
    grad.addColorStop(0.45, "#1a0a3a");
    grad.addColorStop(0.5, "#2a0a50");
    grad.addColorStop(0.55, "#0a0420");
    grad.addColorStop(1, "#05060c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Sun (half circle behind horizon) — shifted by camY
    const horizon = h * 0.52 + camY * 0.3;
    const sunR = Math.min(w, h) * 0.22;
    const sunX = w / 2 + camX * 0.5;
    const sunY = horizon;
    const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY);
    sunGrad.addColorStop(0, "#ffcc00");
    sunGrad.addColorStop(0.4, "#ff00ea");
    sunGrad.addColorStop(1, "#8800ff");

    // Save state + clip to sun shape before drawing sun + stripes
    ctx.save();
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, Math.PI, 0);
    ctx.closePath();
    ctx.clip();

    // Fill the sun
    ctx.fillStyle = sunGrad;
    ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR);

    // Sun stripes — repaint the sky gradient OVER the sun, clipped to circle
    ctx.fillStyle = grad;
    for (let i = 0; i < 6; i++) {
      const y = sunY - sunR * (0.3 + i * 0.11);
      ctx.fillRect(sunX - sunR, y, sunR * 2, 3 + i);
    }
    ctx.restore();

    // Grid floor
    scroll += 1.2;
    const gridSize = 80;

    ctx.lineWidth = 1.5;

    // Horizontal lines (perspective)
    const nLines = 24;
    for (let i = 0; i < nLines; i++) {
      const frac = (i * gridSize + (scroll % gridSize)) / (nLines * gridSize);
      const z = Math.pow(frac, 2.4);
      const y = horizon + (h - horizon) * z;
      if (y > h || y < horizon) continue;
      const alpha = (1 - frac) * 0.85;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vertical lines (converging at vanishing point influenced by tilt)
    const vanishX = w / 2 + camX;
    for (let i = -24; i <= 24; i++) {
      const xNear = w / 2 + i * (w / 14);
      const alpha = Math.max(0, 0.65 - Math.abs(i) * 0.025);
      if (alpha <= 0) continue;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(xNear, h);
      ctx.lineTo(vanishX, horizon);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Horizon line
    ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Floating particles (stars)
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 30; i++) {
      const x = (i * 71 + (Date.now() / 40) * 0.1) % w;
      const y = (Math.sin(i * 2.3 + Date.now() / 1000) * 0.3 + 0.3) * horizon;
      const s = 1 + (i % 3) * 0.5;
      ctx.fillRect(x, y, s, s);
    }

    animId = requestAnimationFrame(draw);
  }

  function onMouse(e) {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    mouseOffset = e.clientX - (r.left + r.width / 2);
  }

  // Device orientation: gamma = left/right tilt (-90..90), beta = forward/back (-180..180)
  function onOrientation(e) {
    // Normalize to -1..1
    const gamma = e.gamma || 0; // left/right
    const beta = e.beta || 0;   // forward/back
    // Adjust for portrait: tilting left/right gives gamma; tilting forward/back gives beta
    // Smooth with exponential moving average
    const targetX = Math.max(-1, Math.min(1, gamma / 45));
    const targetY = Math.max(-1, Math.min(1, (beta - 40) / 45));
    tiltX += (targetX - tiltX) * 0.15;
    tiltY += (targetY - tiltY) * 0.15;
  }

  async function enableOrientation() {
    if (orientationActive) return true;
    // iOS 13+ requires explicit permission via user gesture
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const resp = await DeviceOrientationEvent.requestPermission();
        if (resp !== "granted") return false;
      } catch (e) {
        return false;
      }
    }
    if (typeof DeviceOrientationEvent === "undefined") return false;
    window.addEventListener("deviceorientation", onOrientation);
    orientationActive = true;
    return true;
  }

  function disableOrientation() {
    if (!orientationActive) return;
    window.removeEventListener("deviceorientation", onOrientation);
    orientationActive = false;
    tiltX = 0;
    tiltY = 0;
  }

  // Touch swipe support (also for mobile)
  let touchStart = null;
  let touchTiltX = 0, touchTiltY = 0;
  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchMove(e) {
    if (!touchStart || e.touches.length !== 1 || orientationActive) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    touchTiltX = Math.max(-1, Math.min(1, dx / 120));
    touchTiltY = Math.max(-1, Math.min(1, dy / 120));
    tiltX += (touchTiltX - tiltX) * 0.2;
    tiltY += (touchTiltY - tiltY) * 0.2;
    e.preventDefault();
  }
  function onTouchEnd() {
    touchStart = null;
    // Slowly return to center
    const decay = setInterval(() => {
      tiltX *= 0.9;
      tiltY *= 0.9;
      if (Math.abs(tiltX) < 0.01 && Math.abs(tiltY) < 0.01) {
        tiltX = 0; tiltY = 0;
        clearInterval(decay);
      }
    }, 30);
  }

  function start(el) {
    if (running) return;
    canvas = el;
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    running = true;
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouse);
    // Touch: enable manual "look around" on mobile even without gyro permission
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    // On non-iOS, auto-enable orientation (no permission needed)
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", onOrientation);
      orientationActive = true;
    }
    draw();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
    if (canvas) {
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    }
    disableOrientation();
  }

  return { start, stop, enableOrientation, disableOrientation };
})();
window.MMC_TRON = MMC_TRON;

/* =========================================================
   BACKGROUND MANAGER
   Switches the global background canvas between effects.
   ========================================================= */
const MMC_BG = (() => {
  const EFFECTS = {
    matrix: () => window.MMC_MATRIX,
    flowfield: () => window.MMC_FLOWFIELD,
    boids: () => window.MMC_BOIDS,
    off: () => ({
      start: () => {
        const c = document.getElementById("matrix-canvas");
        if (c) c.style.opacity = "0";
      },
      stop: () => {}
    })
  };

  let current = localStorage.getItem("mmc_bg") || "matrix";

  function set(name) {
    if (!EFFECTS[name]) return false;
    const cur = EFFECTS[current];
    if (cur && cur()) cur().stop?.();
    // Reset canvas opacity before new effect takes over
    const c = document.getElementById("matrix-canvas");
    if (c) c.style.opacity = "";
    current = name;
    localStorage.setItem("mmc_bg", name);
    const next = EFFECTS[name];
    if (next && next()) next().start?.();
    return true;
  }

  function startCurrent() {
    const e = EFFECTS[current];
    if (e && e()) e().start?.();
  }

  function getCurrent() { return current; }
  function list() { return Object.keys(EFFECTS); }

  return { set, startCurrent, getCurrent, list };
})();
window.MMC_BG = MMC_BG;
