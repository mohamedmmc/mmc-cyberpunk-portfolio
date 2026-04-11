/* =========================================================
   games.js — Mini-games for the terminal:
   Snake, Hack (Fallout-style), 2048, Life (Conway)
   ========================================================= */

const MMC_GAMES = (() => {
  let active = null;
  let gameEl = null;

  // Track per-game lifecycle
  let _gameMeta = null;

  function setScore(score) { if (_gameMeta) _gameMeta.score = score || 0; }

  function createContainer(title) {
    stop();
    const gameName = (title || "").split(/[.\s]/)[0].toLowerCase();
    _gameMeta = { name: gameName, startedAt: Date.now(), score: 0 };
    if (window.MMC_TRACK) window.MMC_TRACK.gameStarted(gameName);
    gameEl = document.createElement("div");
    gameEl.className = "game-wrap";
    gameEl.innerHTML = `
      <div class="game-head">
        <span>${title}</span>
        <span class="game-hint">ESC to quit</span>
      </div>
      <div class="game-body"></div>
      <div class="game-foot"></div>
    `;
    const body = document.querySelector(".term-modal-body");
    if (body) body.appendChild(gameEl);
    return {
      body: gameEl.querySelector(".game-body"),
      foot: gameEl.querySelector(".game-foot")
    };
  }

  function stop() {
    if (active && active.stop) active.stop();
    // Report final score on close
    if (_gameMeta && window.MMC_TRACK) {
      const durS = Math.round((Date.now() - _gameMeta.startedAt) / 1000);
      window.MMC_TRACK.gameEnded(_gameMeta.name, _gameMeta.score || 0, durS);
    }
    _gameMeta = null;
    active = null;
    if (gameEl) { gameEl.remove(); gameEl = null; }
  }

  // ---------- SNAKE ----------
  function snake() {
    const { body, foot } = createContainer("SNAKE.EXE — use arrow keys or WASD");
    const W = 30, H = 16;
    let snake_ = [{ x: 15, y: 8 }];
    let dir = { x: 1, y: 0 };
    let food = place();
    let score = 0;
    let best = parseInt(localStorage.getItem("mmc_snake_best") || "0", 10);
    let dead = false;
    let loop = null;

    function place() {
      let f;
      do { f = { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) }; }
      while (snake_.some(s => s.x === f.x && s.y === f.y));
      return f;
    }

    function render() {
      const lines = [];
      for (let y = 0; y < H; y++) {
        let row = "";
        for (let x = 0; x < W; x++) {
          if (snake_[0].x === x && snake_[0].y === y) row += "@";
          else if (snake_.some(s => s.x === x && s.y === y)) row += "o";
          else if (food.x === x && food.y === y) row += "*";
          else row += "·";
        }
        lines.push(row);
      }
      body.innerHTML = `<pre class="game-grid">${lines.join("\n")}</pre>`;
      foot.innerHTML = `SCORE: <b>${score}</b>  //  BEST: <b>${best}</b>${dead ? '  //  <span style="color:var(--neon-danger)">GAME OVER — press R to restart</span>' : ""}`;
    }

    function tick() {
      if (dead) return;
      const head = { x: snake_[0].x + dir.x, y: snake_[0].y + dir.y };
      if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H) return gameOver();
      if (snake_.some(s => s.x === head.x && s.y === head.y)) return gameOver();
      snake_.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        setScore(score);
        food = place();
        if (window.MMC_SOUND) window.MMC_SOUND.presets.beep();
        if (score >= 20 && window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("SNAKE_20", "Scored 20 on Snake.");
        if (score >= 50 && window.MMC_ACHIEVEMENTS) {
          window.MMC_ACHIEVEMENTS.unlock("SNAKE_MASTER", "Scored 50 on Snake. You have no life (in a good way).");
          if (window.MMC_XP) window.MMC_XP.gain(100, "Snake master");
        }
      } else {
        snake_.pop();
      }
      render();
    }

    function gameOver() {
      dead = true;
      if (score > best) { best = score; localStorage.setItem("mmc_snake_best", String(best)); }
      if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
      if (window.MMC_XP && score > 0) window.MMC_XP.gain(Math.min(score * 2, 40), "Snake");
      render();
    }

    function onKey(e) {
      if (!active || active.name !== "snake") return;
      if (e.key === "Escape") { quit(); return; }
      if (dead && (e.key === "r" || e.key === "R")) {
        snake_ = [{ x: 15, y: 8 }];
        dir = { x: 1, y: 0 };
        food = place();
        score = 0;
        dead = false;
        render();
        return;
      }
      const map = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 }
      };
      const nd = map[e.key];
      if (!nd) return;
      // Prevent 180°
      if (nd.x === -dir.x && nd.y === -dir.y) return;
      dir = nd;
      e.preventDefault();
    }

    function quit() {
      clearInterval(loop);
      document.removeEventListener("keydown", onKey);
      stop();
    }

    // Touch swipe support
    let touchStart = null;
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function onTouchEnd(e) {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) { touchStart = null; return; }
      let nd;
      if (Math.abs(dx) > Math.abs(dy)) nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      else nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (!(nd.x === -dir.x && nd.y === -dir.y)) dir = nd;
      touchStart = null;
    }
    body.addEventListener("touchstart", onTouchStart, { passive: true });
    body.addEventListener("touchend", onTouchEnd, { passive: true });

    document.addEventListener("keydown", onKey);
    loop = setInterval(tick, 130);
    render();
    active = { name: "snake", stop: () => {
      clearInterval(loop);
      document.removeEventListener("keydown", onKey);
      body.removeEventListener("touchstart", onTouchStart);
      body.removeEventListener("touchend", onTouchEnd);
    } };
  }

  // ---------- HACK (Fallout-style password cracking) ----------
  function hack() {
    const { body, foot } = createContainer("HACK.EXE — guess the password");
    const words = [
      "KERNEL","SYSTEM","BINARY","DECODE","CIPHER","PACKET","SOCKET","THREAD",
      "MATRIX","HACKER","SERVER","CLIENT","RANDOM","MODULO","STRING","NUMBER"
    ];
    const length = 6;
    const pool = words.filter(w => w.length === length);
    const selected = [];
    while (selected.length < 8) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      if (!selected.includes(w)) selected.push(w);
    }
    const password = selected[Math.floor(Math.random() * selected.length)];
    let attempts = 4;
    const log = [];

    function likeness(guess) {
      let n = 0;
      for (let i = 0; i < guess.length; i++) if (guess[i] === password[i]) n++;
      return n;
    }

    function render() {
      body.innerHTML = `
        <div class="hack-grid">
          ${selected.map(w => `<button class="hack-word" data-word="${w}">${w}</button>`).join("")}
        </div>
        <div class="hack-log">${log.map(l => `<div class="${l.cls}">${l.text}</div>`).join("")}</div>
      `;
      foot.innerHTML = `ATTEMPTS: ${"█".repeat(attempts)}${"░".repeat(4 - attempts)}  //  ${attempts === 0 ? '<span style="color:var(--neon-danger)">LOCKED OUT</span>' : "click a word to try"}`;
      body.querySelectorAll(".hack-word").forEach(btn => btn.addEventListener("click", (e) => tryWord(e.currentTarget.dataset.word)));
    }

    function tryWord(w) {
      if (attempts <= 0) return;
      if (w === password) {
        log.unshift({ cls: "ok", text: `> ${w} — ACCESS GRANTED ✓` });
        attempts = 0;
        if (window.MMC_SOUND) window.MMC_SOUND.presets.success();
        if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("HACKER_ELITE", "You cracked the password. Fallout approves.");
        if (window.MMC_XP) window.MMC_XP.gain(80, "Hack cracked");
        render();
        return;
      }
      attempts--;
      const n = likeness(w);
      log.unshift({ cls: "err", text: `> ${w} — ${n}/${length} correct` });
      if (attempts === 0) {
        log.unshift({ cls: "err", text: `> LOCKED OUT. Password was: ${password}` });
        if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
      }
      render();
    }

    function onKey(e) { if (e.key === "Escape") quit(); }
    function quit() { document.removeEventListener("keydown", onKey); stop(); }
    document.addEventListener("keydown", onKey);
    render();
    active = { name: "hack", stop: () => document.removeEventListener("keydown", onKey) };
  }

  // ---------- 2048 ----------
  function g2048() {
    const { body, foot } = createContainer("2048.EXE — arrow keys to merge");
    let grid = Array(4).fill(0).map(() => Array(4).fill(0));
    let score = 0;
    let best = parseInt(localStorage.getItem("mmc_2048_best") || "0", 10);
    let dead = false;
    function spawn() {
      const empty = [];
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (grid[y][x] === 0) empty.push([x, y]);
      if (empty.length === 0) return;
      const [x, y] = empty[Math.floor(Math.random() * empty.length)];
      grid[y][x] = Math.random() > 0.9 ? 4 : 2;
    }
    function render() {
      const rows = grid.map(row => row.map(v => v === 0 ? "    ·" : String(v).padStart(5)).join(" ")).join("\n");
      body.innerHTML = `<pre class="game-grid">${rows}</pre>`;
      foot.innerHTML = `SCORE: <b>${score}</b>  //  BEST: <b>${best}</b>${dead ? '  //  <span style="color:var(--neon-danger)">GAME OVER — R to restart</span>' : ""}`;
    }
    function slide(row) {
      row = row.filter(v => v);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
          row[i] *= 2;
          score += row[i];
          row[i + 1] = 0;
        }
      }
      row = row.filter(v => v);
      while (row.length < 4) row.push(0);
      return row;
    }
    function rotate(m) {
      const n = Array(4).fill(0).map(() => Array(4).fill(0));
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) n[x][3 - y] = m[y][x];
      return n;
    }
    function move(dir) {
      const before = JSON.stringify(grid);
      let times = { left: 0, down: 1, right: 2, up: 3 }[dir];
      for (let i = 0; i < times; i++) grid = rotate(grid);
      grid = grid.map(slide);
      for (let i = 0; i < (4 - times) % 4; i++) grid = rotate(grid);
      if (JSON.stringify(grid) !== before) {
        spawn();
        setScore(score);
        if (window.MMC_SOUND) window.MMC_SOUND.presets.typing();
      }
      // Check 2048
      if (grid.some(r => r.some(v => v >= 2048))) {
        if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("G2048", "You reached 2048. Big brain.");
        if (window.MMC_XP) window.MMC_XP.gain(150, "2048");
      }
      // Check dead
      const hasEmpty = grid.some(r => r.some(v => v === 0));
      let canMerge = false;
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        if (x < 3 && grid[y][x] === grid[y][x + 1]) canMerge = true;
        if (y < 3 && grid[y][x] === grid[y + 1][x]) canMerge = true;
      }
      if (!hasEmpty && !canMerge) {
        dead = true;
        if (score > best) { best = score; localStorage.setItem("mmc_2048_best", String(best)); }
        if (window.MMC_XP) window.MMC_XP.gain(Math.min(Math.floor(score / 100), 50), "2048");
      }
      render();
    }
    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (dead && (e.key === "r" || e.key === "R")) { grid = Array(4).fill(0).map(() => Array(4).fill(0)); score = 0; dead = false; spawn(); spawn(); render(); return; }
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    }
    function quit() {
      document.removeEventListener("keydown", onKey);
      body.removeEventListener("touchstart", onTouchStart);
      body.removeEventListener("touchend", onTouchEnd);
      stop();
    }
    // Touch swipe support
    let touchStart = null;
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function onTouchEnd(e) {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { touchStart = null; return; }
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
      else move(dy > 0 ? "down" : "up");
      touchStart = null;
    }
    body.addEventListener("touchstart", onTouchStart, { passive: true });
    body.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("keydown", onKey);
    spawn(); spawn(); render();
    active = { name: "2048", stop: quit };
  }

  // ---------- LIFE (Conway's Game of Life) ----------
  function life() {
    const { body, foot } = createContainer("LIFE.EXE — Conway's Game of Life (auto)");
    const W = 50, H = 18;
    let grid = Array(H).fill(0).map(() => Array(W).fill(0).map(() => Math.random() > 0.7 ? 1 : 0));
    let gen = 0;
    let loop = null;
    function render() {
      const lines = grid.map(row => row.map(v => v ? "█" : "·").join("")).join("\n");
      body.innerHTML = `<pre class="game-grid">${lines}</pre>`;
      foot.innerHTML = `GENERATION: <b>${gen}</b>  //  R to randomize  //  SPACE to pause`;
    }
    function step() {
      const next = grid.map(r => r.slice());
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = (y + dy + H) % H;
            const nx = (x + dx + W) % W;
            if (grid[ny][nx]) n++;
          }
          if (grid[y][x] === 1 && (n < 2 || n > 3)) next[y][x] = 0;
          else if (grid[y][x] === 0 && n === 3) next[y][x] = 1;
        }
      }
      grid = next;
      gen++;
      render();
    }
    let paused = false;
    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (e.key === "r" || e.key === "R") {
        grid = Array(H).fill(0).map(() => Array(W).fill(0).map(() => Math.random() > 0.7 ? 1 : 0));
        gen = 0;
        render();
      }
      if (e.key === " ") { paused = !paused; }
    }
    function quit() { clearInterval(loop); document.removeEventListener("keydown", onKey); stop(); }
    document.addEventListener("keydown", onKey);
    loop = setInterval(() => { if (!paused) step(); }, 220);
    render();
    if (window.MMC_ACHIEVEMENTS) setTimeout(() => window.MMC_ACHIEVEMENTS.unlock("GAME_OF_LIFE", "You meditated in front of Conway's creation."), 3000);
    active = { name: "life", stop: () => { clearInterval(loop); document.removeEventListener("keydown", onKey); } };
  }

  // ---------- DONUT (ASCII 3D torus, Andy Sloane style) ----------
  function donut() {
    const { body, foot } = createContainer("DONUT.EXE — rotating 3D torus in ASCII");
    const W = 80, H = 24;
    const CHARS = ".,-~:;=!*#$@";
    let A = 0, B = 0;
    let paused = false;
    let loop = null;

    function render() {
      const b = new Array(W * H).fill(" ");
      const z = new Array(W * H).fill(0);
      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);
      for (let j = 0; j < 6.28; j += 0.07) {
        const cosJ = Math.cos(j), sinJ = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sinI = Math.sin(i), cosI = Math.cos(i);
          const h = cosJ + 2;
          const D = 1 / (sinI * h * sinA + sinJ * cosA + 5);
          const t = sinI * h * cosA - sinJ * sinA;
          const x = Math.floor(W / 2 + (W * 0.35) * D * (cosI * h * cosB - t * sinB));
          const y = Math.floor(H / 2 + (H * 0.5) * D * (cosI * h * sinB + t * cosB));
          const o = x + W * y;
          const N = Math.floor(8 * ((sinJ * sinA - sinI * cosJ * cosA) * cosB - sinI * cosJ * sinA - sinJ * cosA - cosI * cosJ * sinB));
          if (H > y && y >= 0 && x >= 0 && W > x && D > z[o]) {
            z[o] = D;
            b[o] = CHARS[Math.max(0, Math.min(N, CHARS.length - 1))];
          }
        }
      }
      const lines = [];
      for (let k = 0; k < H; k++) lines.push(b.slice(k * W, (k + 1) * W).join(""));
      body.innerHTML = `<pre class="game-grid" style="font-size:11px;line-height:1.05;">${lines.join("\n")}</pre>`;
      foot.innerHTML = `A=${A.toFixed(2)}  B=${B.toFixed(2)}  //  SPACE pause  //  1/2/3 shapes`;
      A += 0.04;
      B += 0.02;
    }

    function tick() { if (!paused) render(); }

    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (e.key === " ") { paused = !paused; e.preventDefault(); }
      if (e.key === "1") switchShape("donut");
      if (e.key === "2") switchShape("cube");
      if (e.key === "3") switchShape("sphere");
    }
    function switchShape(name) {
      quit();
      if (name === "cube") return cube();
      if (name === "sphere") return sphere();
      return donut();
    }
    function quit() {
      clearInterval(loop);
      document.removeEventListener("keydown", onKey);
      stop();
    }
    document.addEventListener("keydown", onKey);
    loop = setInterval(tick, 50);
    render();
    if (window.MMC_ACHIEVEMENTS) setTimeout(() => window.MMC_ACHIEVEMENTS.unlock("DONUT_MASTER", "You achieved zen with the rotating donut."), 4000);
    active = { name: "donut", stop: () => { clearInterval(loop); document.removeEventListener("keydown", onKey); } };
  }

  // ---------- CUBE (ASCII 3D cube) ----------
  function cube() {
    const { body, foot } = createContainer("CUBE.EXE — rotating 3D wireframe cube");
    const W = 80, H = 24;
    let A = 0, B = 0, C = 0;
    let paused = false;
    let loop = null;
    // 8 vertices
    const V = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1]
    ];
    const EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

    function project(v) {
      let [x, y, z] = v;
      // Rotate X
      let y2 = y * Math.cos(A) - z * Math.sin(A);
      let z2 = y * Math.sin(A) + z * Math.cos(A);
      // Rotate Y
      let x2 = x * Math.cos(B) + z2 * Math.sin(B);
      z2 = -x * Math.sin(B) + z2 * Math.cos(B);
      // Rotate Z
      let x3 = x2 * Math.cos(C) - y2 * Math.sin(C);
      let y3 = x2 * Math.sin(C) + y2 * Math.cos(C);
      const d = 5 / (5 + z2);
      return [Math.floor(W / 2 + x3 * d * (W * 0.3)), Math.floor(H / 2 + y3 * d * (H * 0.5))];
    }

    function render() {
      const b = [];
      for (let i = 0; i < H; i++) b.push(new Array(W).fill(" "));
      const projected = V.map(project);
      EDGES.forEach(([a, bi]) => {
        const [x1, y1] = projected[a];
        const [x2, y2] = projected[bi];
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        for (let i = 0; i <= steps; i++) {
          const x = Math.floor(x1 + ((x2 - x1) * i) / (steps || 1));
          const y = Math.floor(y1 + ((y2 - y1) * i) / (steps || 1));
          if (x >= 0 && x < W && y >= 0 && y < H) b[y][x] = "█";
        }
      });
      const lines = b.map((row) => row.join(""));
      body.innerHTML = `<pre class="game-grid" style="font-size:11px;line-height:1.05;">${lines.join("\n")}</pre>`;
      foot.innerHTML = `CUBE // SPACE pause // 1/2/3 shapes`;
      A += 0.04;
      B += 0.03;
      C += 0.02;
    }

    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (e.key === " ") { paused = !paused; e.preventDefault(); }
      if (e.key === "1") switchShape("donut");
      if (e.key === "2") switchShape("cube");
      if (e.key === "3") switchShape("sphere");
    }
    function switchShape(name) {
      quit();
      if (name === "sphere") return sphere();
      if (name === "donut") return donut();
      return cube();
    }
    function tick() { if (!paused) render(); }
    function quit() { clearInterval(loop); document.removeEventListener("keydown", onKey); stop(); }
    document.addEventListener("keydown", onKey);
    loop = setInterval(tick, 50);
    render();
    active = { name: "cube", stop: () => { clearInterval(loop); document.removeEventListener("keydown", onKey); } };
  }

  // ---------- SPHERE (ASCII 3D shaded sphere) ----------
  function sphere() {
    const { body, foot } = createContainer("SPHERE.EXE — shaded 3D sphere");
    const W = 80, H = 24;
    const CHARS = " .,-~:;=!*#$@";
    let A = 0;
    let paused = false;
    let loop = null;

    function render() {
      const b = new Array(W * H).fill(" ");
      const R = 8;
      const lx = Math.cos(A), ly = Math.sin(A), lz = 0.3;
      for (let y = -H / 2; y < H / 2; y += 0.5) {
        for (let x = -W / 2; x < W / 2; x += 0.5) {
          const nx = x / (W * 0.2);
          const ny = y / (H * 0.5);
          const d = nx * nx + ny * ny;
          if (d <= 1) {
            const nz = Math.sqrt(1 - d);
            const dot = nx * lx + ny * ly + nz * lz;
            const n = Math.floor(Math.max(0, dot) * CHARS.length);
            const sx = Math.floor(x + W / 2);
            const sy = Math.floor(y + H / 2);
            const o = sx + sy * W;
            if (o >= 0 && o < W * H) b[o] = CHARS[Math.min(CHARS.length - 1, n)];
          }
        }
      }
      const lines = [];
      for (let k = 0; k < H; k++) lines.push(b.slice(k * W, (k + 1) * W).join(""));
      body.innerHTML = `<pre class="game-grid" style="font-size:11px;line-height:1.05;">${lines.join("\n")}</pre>`;
      foot.innerHTML = `SPHERE // A=${A.toFixed(2)} // SPACE pause // 1/2/3 shapes`;
      A += 0.06;
    }

    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (e.key === " ") { paused = !paused; e.preventDefault(); }
      if (e.key === "1") switchShape("donut");
      if (e.key === "2") switchShape("cube");
      if (e.key === "3") switchShape("sphere");
    }
    function switchShape(name) {
      quit();
      if (name === "donut") return donut();
      if (name === "cube") return cube();
      return sphere();
    }
    function tick() { if (!paused) render(); }
    function quit() { clearInterval(loop); document.removeEventListener("keydown", onKey); stop(); }
    document.addEventListener("keydown", onKey);
    loop = setInterval(tick, 60);
    render();
    active = { name: "sphere", stop: () => { clearInterval(loop); document.removeEventListener("keydown", onKey); } };
  }

  // ---------- MANDELBROT (fractal explorer) ----------
  function mandelbrot() {
    const { body, foot } = createContainer("MANDELBROT.EXE — click to zoom, R to reset, C to cycle colors");
    body.innerHTML = `<canvas id="mandel-canvas" width="720" height="400" style="display:block;image-rendering:pixelated;margin:0 auto;border:1px solid var(--neon-primary);"></canvas>`;
    const canvas = document.getElementById("mandel-canvas");
    const ctx = canvas.getContext("2d");

    let centerX = -0.6, centerY = 0, scale = 2.8, maxIter = 80;
    let palette = 0;
    let zoomLevel = 0;

    const PALETTES = [
      (t) => [Math.floor(9 * (1 - t) * t * t * t * 255), Math.floor(15 * (1 - t) * (1 - t) * t * t * 255), Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255)],
      (t) => [Math.floor(t * 255), 0, Math.floor((1 - t) * 255)],
      (t) => [0, Math.floor(t * 255), Math.floor(t * 200)],
      (t) => [Math.floor(255 * Math.sin(t * 6)), Math.floor(255 * Math.sin(t * 6 + 2)), Math.floor(255 * Math.sin(t * 6 + 4))]
    ];

    function render() {
      const W = canvas.width, H = canvas.height;
      const img = ctx.createImageData(W, H);
      const aspect = W / H;
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const x0 = centerX + (px / W - 0.5) * scale * aspect;
          const y0 = centerY + (py / H - 0.5) * scale;
          let x = 0, y = 0, iter = 0;
          while (x * x + y * y <= 4 && iter < maxIter) {
            const xt = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xt;
            iter++;
          }
          const t = iter / maxIter;
          const idx = (py * W + px) * 4;
          if (iter === maxIter) {
            img.data[idx] = 0;
            img.data[idx + 1] = 0;
            img.data[idx + 2] = 0;
          } else {
            const [r, g, b] = PALETTES[palette](t);
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
          }
          img.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      foot.innerHTML = `ZOOM: ${Math.round(1 / scale * 100) / 100}x  //  CENTER: (${centerX.toFixed(4)}, ${centerY.toFixed(4)})  //  ITER: ${maxIter}  //  click to zoom, right-click to zoom out`;
    }

    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const aspect = canvas.width / canvas.height;
      centerX += (px - 0.5) * scale * aspect;
      centerY += (py - 0.5) * scale;
      scale *= 0.5;
      maxIter = Math.min(400, 80 + zoomLevel * 15);
      zoomLevel++;
      render();
      if (zoomLevel >= 8 && window.MMC_ACHIEVEMENTS) {
        window.MMC_ACHIEVEMENTS.unlock("FRACTAL_EXPLORER", "You dove deep into the Mandelbrot set.");
        if (window.MMC_XP) window.MMC_XP.gain(120, "Fractal explorer");
      }
    }
    function onRightClick(e) {
      e.preventDefault();
      scale *= 2;
      zoomLevel = Math.max(0, zoomLevel - 1);
      render();
    }
    function onKey(e) {
      if (e.key === "Escape") return quit();
      if (e.key === "r" || e.key === "R") { centerX = -0.6; centerY = 0; scale = 2.8; maxIter = 80; zoomLevel = 0; render(); }
      if (e.key === "c" || e.key === "C") { palette = (palette + 1) % PALETTES.length; render(); }
    }
    function quit() {
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("contextmenu", onRightClick);
      document.removeEventListener("keydown", onKey);
      stop();
    }

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", onRightClick);
    document.addEventListener("keydown", onKey);
    render();
    active = { name: "mandelbrot", stop: quit };
  }

  return { snake, hack, g2048, life, donut, cube, sphere, mandelbrot, stop };
})();

window.MMC_GAMES = MMC_GAMES;
