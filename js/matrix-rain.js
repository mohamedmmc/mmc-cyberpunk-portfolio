/* =========================================================
   matrix-rain.js — Canvas matrix rain effect
   Includes katakana, code symbols, and hidden message
   ========================================================= */

const MATRIX_RAIN = (() => {
  let canvas, ctx, cols, drops, animId;
  let running = false;

  // Mix katakana + code symbols + hidden Mohamed name
  const KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  const CODE = "01{}<>/=+*-[]()#@$&!?;:";
  const NAME = "MOHAMEDCHTOUROU";
  const CHARS = KATAKANA + CODE + NAME;
  const FONT_SIZE = 15;

  // Hidden message that appears randomly in specific column
  const HIDDEN_MSG = "YOU_FOUND_ME_";
  let hiddenCol = -1;
  let hiddenRow = 0;
  let hiddenIdx = 0;

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / FONT_SIZE);
    drops = new Array(cols).fill(1).map(() => Math.random() * -50);
  }

  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function getColor() {
    const style = getComputedStyle(document.documentElement);
    return (style.getPropertyValue("--neon-primary").trim() || "#00f0ff");
  }

  function draw() {
    if (!ctx || !running) return;
    const light = isLight();

    // Fade trail — light bg fades to white, dark bg fades to near-black
    ctx.fillStyle = light ? "rgba(244, 246, 249, 0.06)" : "rgba(5, 6, 12, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

    const color = getColor();
    // Light mode: use slightly darker/more saturated colors for visibility
    const headColor = light ? "#0055aa" : "#ffffff";
    const hiddenColor = light ? "#cc0066" : "#ff00ea";

    for (let i = 0; i < drops.length; i++) {
      let ch;
      if (i === hiddenCol && drops[i] >= hiddenRow && hiddenIdx < HIDDEN_MSG.length) {
        ch = HIDDEN_MSG[hiddenIdx];
        hiddenIdx++;
      } else {
        ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      }

      // Head of the rain (brighter)
      if (Math.random() > 0.96) {
        ctx.fillStyle = headColor;
        ctx.shadowColor = color;
        ctx.shadowBlur = light ? 4 : 8;
      } else if (i === hiddenCol && ch !== CHARS[Math.floor(Math.random() * CHARS.length)]) {
        ctx.fillStyle = hiddenColor;
        ctx.shadowColor = hiddenColor;
        ctx.shadowBlur = light ? 6 : 12;
      } else {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = light ? 1 : 3;
      }

      ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);

      if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    ctx.shadowBlur = 0;
    animId = requestAnimationFrame(draw);
  }

  // Trigger hidden message reveal
  function triggerHidden() {
    hiddenCol = Math.floor(Math.random() * cols);
    hiddenRow = Math.floor(drops[hiddenCol] + 2);
    hiddenIdx = 0;
  }

  function start() {
    if (running) return;
    canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    running = true;
    draw();

    // Schedule hidden messages every 20-40s
    setInterval(triggerHidden, 25000);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
  }

  function setOpacity(val) {
    if (canvas) canvas.style.opacity = val;
  }

  window.addEventListener("resize", resize);
  return { start, stop, setOpacity, triggerHidden };
})();

window.MMC_MATRIX = MATRIX_RAIN;
