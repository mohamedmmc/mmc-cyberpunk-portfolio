/* =========================================================
   terminal.js — Interactive terminal v2
   Uses MMC_VFS for a real filesystem + CTF + games + more
   ========================================================= */

const MMC_TERM = (() => {
  let modal, body, input, history = [], historyIdx = -1;

  // Password prompt state
  let pwPrompt = null;

  const NEOFETCH = `
            .-"""""-.
           /         \\       root@chtourou.sh
          |  ●     ●  |      ──────────────────
          |     ω     |      OS:       NeoLinux v2.0.26
           \\  \\___/  /       Host:     Chtourou_Device
            '-.....-'        Kernel:   creativity.core
                             Uptime:   ∞ years
                             Shell:    bash (geek-mode)
                             CPU:      Caffeine Accelerator
                             Memory:   Ideas unlimited
                             Stack:    Flutter + Node.js
                             Location: Tunisia → Worldwide
`;

  // ---------- Utility: ROT13 / base64 / hex decoders ----------
  function rot13(s) {
    return s.replace(/[A-Za-z]/g, c =>
      String.fromCharCode((c.charCodeAt(0) - (c <= "Z" ? 65 : 97) + 13) % 26 + (c <= "Z" ? 65 : 97))
    );
  }
  function b64decode(s) {
    try { return atob(s); } catch (e) { return null; }
  }
  function hexdecode(s) {
    try {
      return s.replace(/\s+/g, "").match(/.{1,2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join("");
    } catch (e) { return null; }
  }

  const COMMANDS = {
    help: () => ({
      lines: [
        { cls: "cta", text: "╔══════════════════════════════════════════════╗" },
        { cls: "cta", text: "║  ▶ HIDDEN CHALLENGE — 5 STEPS                ║" },
        { cls: "cta", text: "║    Crypto + culture. Non-devs welcome.       ║" },
        { cls: "cta", text: "║    Begin with:  ctf start                    ║" },
        { cls: "cta", text: "╚══════════════════════════════════════════════╝" },
        { cls: "out", text: "" },
        { cls: "ok", text: "═══════════════════════════════════" },
        { cls: "ok", text: "  COMMAND REFERENCE" },
        { cls: "ok", text: "═══════════════════════════════════" },
        { cls: "hint", text: "FILESYSTEM:" },
        { cls: "out", text: "  cd <path>       change directory" },
        { cls: "out", text: "  ls [path]       list files" },
        { cls: "out", text: "  pwd             print current dir" },
        { cls: "out", text: "  cat <file>      display file" },
        { cls: "out", text: "  tree [path]     directory tree" },
        { cls: "out", text: "  find <p> <ptn>  find by name" },
        { cls: "out", text: "  grep <ptn> <p>  grep recursively" },
        { cls: "out", text: "  sudo [cmd]      run as root (needs password)" },
        { cls: "hint", text: "CRYPTO TOOLS:" },
        { cls: "out", text: "  base64 -d <s>   decode base64" },
        { cls: "out", text: "  rot13 <s>       apply ROT13" },
        { cls: "out", text: "  hex -d <s>      decode hex to ASCII" },
        { cls: "hint", text: "CTF CHALLENGE:" },
        { cls: "out", text: "  ctf start       begin the 5-step challenge" },
        { cls: "out", text: "  ctf hint        get a hint" },
        { cls: "out", text: "  ctf status      see your progress" },
        { cls: "out", text: "  unlock <code>   submit the final flag" },
        { cls: "out", text: "  chip            call CHIP for a hint (3/step)" },
        { cls: "out", text: "  elite           elite CTF (after mode elite)" },
        { cls: "hint", text: "MINI-GAMES:" },
        { cls: "out", text: "  game snake      Snake (arrows/WASD)" },
        { cls: "out", text: "  game hack       Fallout password cracker" },
        { cls: "out", text: "  game 2048       classic 2048" },
        { cls: "out", text: "  game life       Conway's Game of Life" },
        { cls: "out", text: "  game donut      rotating 3D ASCII donut" },
        { cls: "out", text: "  game cube       rotating 3D cube" },
        { cls: "out", text: "  game sphere     shaded 3D sphere" },
        { cls: "out", text: "  game mandelbrot fractal explorer" },
        { cls: "hint", text: "TESTS & CHAT:" },
        { cls: "out", text: "  vk              Voight-Kampff test" },
        { cls: "out", text: "  ai              chat with AI.CHTOUROU" },
        { cls: "hint", text: "PLAYER:" },
        { cls: "out", text: "  achievements    dashboard (or click LVL in status bar)" },
        { cls: "out", text: "  level           show level & title" },
        { cls: "hint", text: "NAVIGATION:" },
        { cls: "out", text: "  projects        list all projects" },
        { cls: "out", text: "  open <name>     open a project page" },
        { cls: "hint", text: "APPEARANCE:" },
        { cls: "out", text: "  theme <name>    cyan|magenta|matrix|danger" },
        { cls: "out", text: "  bg <name>       matrix|flowfield|boids|off" },
        { cls: "out", text: "  lang <code>     fr|en|1337" },
        { cls: "out", text: "  mode <name>     casual|elite" },
        { cls: "out", text: "  sound           toggle sound" },
        { cls: "hint", text: "SHELL:" },
        { cls: "out", text: "  neofetch        system info" },
        { cls: "out", text: "  whoami          current user" },
        { cls: "out", text: "  date            current date" },
        { cls: "out", text: "  history         command history" },
        { cls: "out", text: "  clear           clear terminal" },
        { cls: "out", text: "  exit            close terminal" },
        { cls: "hint", text: "Also try: hack, matrix, cowsay, fortune" }
      ]
    }),

    // ---------- Filesystem ----------
    cd: (args) => {
      const r = window.MMC_VFS.cd(args[0] || "");
      return r.err ? { lines: [{ cls: "err", text: r.err }] } : { lines: [] };
    },
    pwd: () => ({ lines: [{ cls: "out", text: window.MMC_VFS.pwd() }] }),
    ls: (args) => {
      const r = window.MMC_VFS.ls(args[0] || window.MMC_VFS.pwd());
      if (r.err) return { lines: [{ cls: "err", text: r.err }] };
      return {
        lines: r.entries.map(e => {
          const tag = e.type === "dir" ? "d" : (e.type === "link" ? "l" : "-");
          const perm = e.perm === "root" ? "---" : (e.perm === "owner" ? "r--" : "rw-");
          const name = e.type === "dir" ? `${e.name}/` : (e.type === "link" ? `${e.name}@` : e.name);
          const color = e.type === "dir" ? "ok" : (e.type === "link" ? "hint" : "out");
          return { cls: color, text: `${tag}${perm} ${name}` };
        })
      };
    },
    cat: (args) => {
      if (!args[0]) return { lines: [{ cls: "err", text: "cat: missing file operand" }] };
      const r = window.MMC_VFS.cat(args[0]);
      if (r.err) return { lines: [{ cls: "err", text: r.err }] };
      // CTF detection: catting README advances step 1→2
      if (args[0].includes("README") && window.MMC_CTF) window.MMC_CTF.advance(2);
      if (args[0].includes("shadow") && window.MMC_VFS.state.sudoUnlocked && window.MMC_CTF) window.MMC_CTF.advance(4);
      return { lines: r.content.split("\n").map(l => ({ cls: "out", text: l })) };
    },
    tree: (args) => {
      const lines = window.MMC_VFS.tree_view(args[0], 0, 4);
      return { lines: lines.map(l => ({ cls: "out", text: l })) };
    },
    find: (args) => {
      if (args.length < 3 || args[1] !== "-name") {
        return { lines: [{ cls: "err", text: "usage: find <path> -name <pattern>" }] };
      }
      const r = window.MMC_VFS.find(args[0], args[2].replace(/["']/g, ""));
      if (r.err) return { lines: [{ cls: "err", text: r.err }] };
      return { lines: r.results.length ? r.results.map(p => ({ cls: "out", text: p })) : [{ cls: "hint", text: "(no matches)" }] };
    },
    grep: (args) => {
      if (args.length < 1) return { lines: [{ cls: "err", text: "usage: grep <pattern> [-r <path>]" }] };
      const pattern = args[0];
      const path = args.includes("-r") ? args[args.indexOf("-r") + 1] : "/";
      const r = window.MMC_VFS.grep(pattern, path);
      if (r.err) return { lines: [{ cls: "err", text: r.err }] };
      if (!r.results.length) return { lines: [{ cls: "hint", text: "(no matches)" }] };
      return { lines: r.results.slice(0, 30).map(m => ({ cls: "out", text: `${m.file}:${m.line}: ${m.text}` })) };
    },

    // ---------- Sudo ----------
    sudo: (args, raw) => {
      // Parse -p password flag
      let pwArgIdx = args.indexOf("-p");
      if (pwArgIdx >= 0 && args[pwArgIdx + 1]) {
        const pw = args[pwArgIdx + 1];
        const r = window.MMC_VFS.sudo(pw);
        if (r.ok) {
          // Step 3 (sudo password) cleared → user now on step 4 (ROT13 shadow)
          if (window.MMC_CTF) window.MMC_CTF.advance(4);
          // Run the rest of the command
          const rest = args.slice(pwArgIdx + 2);
          return runAsRoot(rest);
        }
        return { lines: [{ cls: "err", text: "sudo: incorrect password" }] };
      }
      // No password: ask for it
      pwPrompt = { cmd: args };
      return {
        lines: [
          { cls: "hint", text: "[sudo] password for root: (type it and press Enter)" },
          { cls: "hint", text: "         hint: The Ultimate Answer to Life, the Universe, and Everything." },
          { cls: "hint", text: "               — Douglas Adams, Hitchhiker's Guide to the Galaxy (1979)" },
          { cls: "hint", text: "         (tip: you can also pass it inline → sudo -p <pw> <cmd>)" }
        ]
      };
    },

    // ---------- Crypto tools ----------
    base64: (args) => {
      if (args[0] !== "-d" || !args[1]) return { lines: [{ cls: "err", text: "usage: base64 -d <string>" }] };
      const joined = args.slice(1).join("");
      const r = b64decode(joined);
      if (r === null) return { lines: [{ cls: "err", text: "base64: invalid input" }] };
      const lines = [{ cls: "ok", text: r }];
      // CTF auto-advance: decoded text points to /etc/shadow → step 2 cleared, user now on step 3 (sudo password)
      if (/\/etc\/shadow/i.test(r) && window.MMC_CTF) window.MMC_CTF.advance(3);
      // Orientation: if the decoded text mentions a shell command, nudge the user to run it
      else if (/\b(sudo|cat|ls|find|grep)\b/.test(r)) {
        lines.push({ cls: "hint", text: "  ↳ looks like a shell instruction. Try running the command part in your terminal." });
      }
      return { lines };
    },
    rot13: (args) => {
      if (!args.length) return { lines: [{ cls: "err", text: "usage: rot13 <string>" }] };
      const input = args.join(" ").replace(/^["']|["']$/g, "");
      const decoded = rot13(input);
      // CTF auto-advance: decoded shadow content mentions "hacker movie" → step 4 cleared, user now on step 5 (identify Gibson)
      if (/hacker movie|supercomputer/i.test(decoded) && window.MMC_CTF) window.MMC_CTF.advance(5);
      return { lines: [{ cls: "ok", text: decoded }] };
    },
    hex: (args) => {
      if (args[0] !== "-d" || !args[1]) return { lines: [{ cls: "err", text: "usage: hex -d <hexstring>" }] };
      const joined = args.slice(1).join("");
      const r = hexdecode(joined);
      if (r === null) return { lines: [{ cls: "err", text: "hex: invalid input" }] };
      return { lines: [{ cls: "ok", text: r }] };
    },

    // ---------- CTF ----------
    ctf: (args) => {
      if (!window.MMC_CTF) return { lines: [{ cls: "err", text: "CTF module not loaded." }] };
      const sub = args[0] || "status";
      if (sub === "start") return { lines: window.MMC_CTF.start() };
      if (sub === "hint") return { lines: window.MMC_CTF.hint() };
      if (sub === "status") return { lines: window.MMC_CTF.status() };
      if (sub === "reset") { window.MMC_CTF.reset(); return { lines: [{ cls: "ok", text: "CTF progress reset." }] }; }
      return { lines: [{ cls: "err", text: "ctf: unknown subcommand. Try: start, hint, status" }] };
    },

    // ---------- CHIP (friendly AI guide) ----------
    chip: (args) => {
      if (!window.MMC_CHIP) return { lines: [{ cls: "err", text: "CHIP is offline." }] };
      const sub = (args[0] || "").toLowerCase();
      if (sub === "joke") return { lines: window.MMC_CHIP.joke() };
      if (sub === "intro") return { lines: window.MMC_CHIP.intro() };
      if (sub === "reset") { window.MMC_CHIP.reset(); return { lines: [{ cls: "ok", text: "CHIP state reset." }] }; }
      // Default: give hint for current step (counter increments, 4th = angry)
      return { lines: window.MMC_CHIP.request() };
    },
    unlock: (args) => {
      if (!args[0]) return { lines: [{ cls: "err", text: "usage: unlock <code>" }] };
      if (!window.MMC_CTF) return { lines: [{ cls: "err", text: "CTF module not loaded." }] };
      return window.MMC_CTF.unlock(args[0]);
    },
    reset_ctf: () => { if (window.MMC_CTF) window.MMC_CTF.reset(); return { lines: [{ cls: "ok", text: "CTF reset." }] }; },

    // ---------- Games ----------
    game: (args) => {
      if (!window.MMC_GAMES) return { lines: [{ cls: "err", text: "games module not loaded." }] };
      const name = (args[0] || "").toLowerCase();
      const map = {
        snake: "snake",
        hack: "hack",
        "2048": "g2048",
        life: "life",
        donut: "donut",
        cube: "cube",
        sphere: "sphere",
        mandelbrot: "mandelbrot",
        fractal: "mandelbrot"
      };
      if (!map[name]) return { lines: [{ cls: "err", text: "game: available: snake, hack, 2048, life, donut, cube, sphere, mandelbrot" }] };
      setTimeout(() => window.MMC_GAMES[map[name]](), 50);
      return { lines: [{ cls: "ok", text: `Starting ${name}... (ESC to quit)` }] };
    },

    // ---------- Background effect ----------
    bg: (args) => {
      if (!window.MMC_BG) return { lines: [{ cls: "err", text: "bg module not loaded." }] };
      const name = (args[0] || "").toLowerCase();
      if (!name) return { lines: [
        { cls: "ok", text: `Current background: ${window.MMC_BG.getCurrent()}` },
        { cls: "hint", text: `Available: ${window.MMC_BG.list().join(", ")}` },
        { cls: "hint", text: "Usage: bg <name>" }
      ]};
      const ok = window.MMC_BG.set(name);
      if (!ok) return { lines: [{ cls: "err", text: `bg: unknown effect '${name}'. Try: ${window.MMC_BG.list().join(", ")}` }] };
      if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("BG_SWITCHER", "You discovered the bg command.", "rare");
      return { lines: [{ cls: "ok", text: `Background set to ${name}` }] };
    },

    // ---------- Mode (casual / elite) ----------
    mode: (args) => {
      if (!window.MMC_MODE) return { lines: [{ cls: "err", text: "mode module not loaded." }] };
      const target = (args[0] || "").toLowerCase();
      if (!target) return { lines: [
        { cls: "ok", text: `Current mode: ${window.MMC_MODE.get()}` },
        { cls: "hint", text: "Usage: mode casual | mode elite" },
        { cls: "hint", text: "Elite = no hand-holding, harder challenges, legendary achievements." }
      ]};
      if (target !== "casual" && target !== "elite") {
        return { lines: [{ cls: "err", text: "mode: must be 'casual' or 'elite'" }] };
      }
      window.MMC_MODE.set(target);
      return { lines: [
        { cls: "ok", text: `Mode set to ${target}.` },
        { cls: "hint", text: target === "elite" ? "Welcome. The Elite CTF is now available: run 'elite start' after solving the basic CTF." : "Casual mode. Hints enabled, tooltips visible." }
      ]};
    },

    // ---------- Elite CTF ----------
    elite: (args, raw) => {
      if (!window.MMC_CTF) return { lines: [{ cls: "err", text: "CTF module not loaded." }] };
      const sub = (args[0] || "status").toLowerCase();
      if (sub === "start") return { lines: window.MMC_CTF.eliteStart() };
      if (sub === "hint") {
        // elite hint [1|2|3] — progressive hint levels
        const level = args[1];
        return { lines: window.MMC_CTF.eliteHint(level) };
      }
      if (sub === "status") return { lines: window.MMC_CTF.eliteStatus() };
      if (sub === "reset") { window.MMC_CTF.eliteReset(); return { lines: [{ cls: "ok", text: "Elite CTF reset." }] }; }
      // elite <n> <answer>
      if (sub === "1" || sub === "2" || sub === "3") {
        const answer = args.slice(1).join(" ");
        return window.MMC_CTF.eliteSubmit(sub, answer);
      }
      return { lines: [{ cls: "err", text: "elite: unknown subcommand. Try: start, hint [1|2|3], status, 1 <user>, 2 <token>, 3 <port>" }] };
    },

    // ---------- Voight-Kampff + AI ----------
    vk: () => {
      if (window.MMC_VK) setTimeout(() => window.MMC_VK.open(), 50);
      return { lines: [{ cls: "ok", text: "Initializing Voight-Kampff protocol..." }] };
    },
    "voight-kampff": () => COMMANDS.vk(),
    ai: () => {
      if (window.MMC_AI) setTimeout(() => window.MMC_AI.open(), 50);
      return { lines: [{ cls: "ok", text: "Connecting to AI.CHTOUROU..." }] };
    },

    // ---------- XP dashboard ----------
    achievements: () => window.MMC_XP ? { lines: window.MMC_XP.dashboard() } : { lines: [] },
    xp: () => window.MMC_XP ? { lines: window.MMC_XP.dashboard() } : { lines: [] },
    level: () => window.MMC_XP ? { lines: [{ cls: "ok", text: `LVL ${window.MMC_XP.currentLevel()} [${window.MMC_XP.title()}]  XP: ${window.MMC_XP.state.xp}` }] } : { lines: [] },

    // ---------- System ----------
    neofetch: () => ({ lines: [{ cls: "ok", text: NEOFETCH, pre: true }] }),
    whoami: () => ({
      lines: [
        { cls: "ok", text: "mohamed_melek_chtourou" },
        { cls: "out", text: "→ Ingénieur Flutter & Node.js" },
        { cls: "out", text: "→ Tunisia → Worldwide" },
        { cls: "out", text: "→ 3 apps in production" }
      ]
    }),

    projects: () => ({
      lines: [
        { cls: "ok", text: "=== PROJECTS.DB ===" },
        { cls: "out", text: "  1. thelandlord   [PRODUCTION]  — Real-estate platform" },
        { cls: "out", text: "  2. lostfound     [PRODUCTION]  — Lost & Found multi-OS" },
        { cls: "out", text: "  3. tesa          [PERSONAL]    — Esports ecosystem" },
        { cls: "out", text: "  4. randev        [ACADEMIC]    — B2B appointments" },
        { cls: "out", text: "  5. artisandart   [ACADEMIC]    — Artisan marketplace" },
        { cls: "out", text: "  6. esprit        [ACADEMIC]    — Campus iOS app" },
        { cls: "hint", text: "Use: open <name>" }
      ]
    }),
    open: (args) => {
      const name = (args[0] || "").toLowerCase();
      const map = {
        thelandlord: "projects/thelandlord.html",
        landlord: "projects/thelandlord.html",
        lostfound: "projects/lost-found.html",
        lost: "projects/lost-found.html",
        tesa: "projects/tesa.html",
        randev: "projects/randev.html",
        artisandart: "projects/artisan-dart.html",
        artisan: "projects/artisan-dart.html",
        esprit: "projects/esprit-app.html",
        gibson: "gibson.html"
      };
      if (!map[name]) return { lines: [{ cls: "err", text: `open: unknown target '${name}'` }] };
      setTimeout(() => {
        const base = window.location.pathname.includes("/projects/") ? "../" + map[name] : map[name];
        window.location.href = base;
      }, 400);
      return { lines: [{ cls: "ok", text: `Opening ${name}...` }] };
    },

    theme: (args) => {
      const name = (args[0] || "").toLowerCase();
      const themes = ["cyan", "magenta", "matrix", "danger"];
      if (!themes.includes(name)) return { lines: [{ cls: "err", text: `theme: must be one of: ${themes.join(", ")}` }] };
      document.documentElement.setAttribute("data-theme", name === "cyan" ? "" : name);
      localStorage.setItem("mmc_theme", name);
      return { lines: [{ cls: "ok", text: `Theme set to ${name}` }] };
    },
    lang: (args) => {
      const code = (args[0] || "").toLowerCase();
      if (!["fr", "en", "1337"].includes(code)) return { lines: [{ cls: "err", text: "lang: fr | en | 1337" }] };
      if (window.MMC_I18N) window.MMC_I18N.apply(code);
      return { lines: [{ cls: "ok", text: `Language → ${code}` }] };
    },
    sound: () => {
      const enabled = window.MMC_SOUND ? window.MMC_SOUND.toggle() : false;
      return { lines: [{ cls: "ok", text: `Sound: ${enabled ? "ON" : "OFF"}` }] };
    },
    matrix: () => {
      if (window.MMC_EASTER) window.MMC_EASTER.matrixMode();
      return { lines: [{ cls: "ok", text: "Wake up..." }] };
    },
    hack: () => {
      const steps = [
        "Connecting to mainframe...",
        "Bypassing firewall...",
        "Injecting payload...",
        "Decrypting AES-256...",
        "Accessing root...",
        "HACKED THE PLANET ✓"
      ];
      steps.forEach((s, i) => setTimeout(() => append([{ cls: i === steps.length - 1 ? "ok" : "out", text: s }]), i * 400));
      return { lines: [] };
    },
    cowsay: (args) => {
      const msg = args.join(" ") || "Hello, geek!";
      const top = " " + "_".repeat(msg.length + 2);
      const bot = " " + "-".repeat(msg.length + 2);
      return { lines: [{ cls: "out", pre: true, text: `${top}\n< ${msg} >\n${bot}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||` }] };
    },
    fortune: () => {
      const quotes = [
        "The best error message is the one that never shows up. — Thomas Fuchs",
        "First, solve the problem. Then, write the code. — John Johnson",
        "Code is like humor. When you have to explain it, it's bad.",
        "It's not a bug, it's a feature.",
        "Talk is cheap. Show me the code. — Linus Torvalds",
        "Debugging is twice as hard as writing the code."
      ];
      return { lines: [{ cls: "out", text: quotes[Math.floor(Math.random() * quotes.length)] }] };
    },
    date: () => ({ lines: [{ cls: "out", text: new Date().toString() }] }),
    echo: (args) => ({ lines: [{ cls: "out", text: args.join(" ") }] }),
    history: () => ({ lines: history.map((h, i) => ({ cls: "out", text: `  ${i + 1}  ${h}` })) }),
    clear: () => { body.innerHTML = ""; return { lines: [], noPrompt: true }; },
    exit: () => { close(); return { lines: [] }; }
  };

  function runAsRoot(argv) {
    if (!argv.length) return { lines: [{ cls: "ok", text: "Now running as root. Try: cat /etc/shadow" }] };
    const name = argv[0].toLowerCase();
    const args = argv.slice(1);
    if (COMMANDS[name]) return COMMANDS[name](args);
    return { lines: [{ cls: "err", text: `sudo: ${name}: command not found` }] };
  }

  function append(lines, cmd) {
    if (cmd !== undefined) {
      const el = document.createElement("div");
      el.className = "line";
      const prompt = `root@chtourou:${window.MMC_VFS ? window.MMC_VFS.pwd() : "~"}$`;
      el.innerHTML = `<span class="prompt">${escapeHtml(prompt)}</span><span class="cmd">${escapeHtml(cmd)}</span>`;
      body.appendChild(el);
    }
    lines.forEach((line) => {
      const el = document.createElement("div");
      el.className = "line " + (line.cls || "out");
      if (line.pre) {
        const pre = document.createElement("pre");
        pre.style.margin = 0;
        pre.textContent = line.text;
        el.appendChild(pre);
      } else {
        el.textContent = line.text;
      }
      body.appendChild(el);
    });
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function exec(raw) {
    const cmd = raw.trim();

    // Password prompt mode (after sudo without -p)
    if (pwPrompt) {
      const pw = cmd;
      const r = window.MMC_VFS.sudo(pw);
      if (r.ok) {
        // Step 3 (sudo password) cleared → user now on step 4 (ROT13 shadow)
        if (window.MMC_CTF) window.MMC_CTF.advance(4);
        append([{ cls: "ok", text: "Password accepted. You are now root." }], "••••");
        if (pwPrompt.cmd && pwPrompt.cmd.length) {
          const result = runAsRoot(pwPrompt.cmd);
          append(result.lines || []);
        }
      } else {
        append([{ cls: "err", text: "sudo: incorrect password" }], "••••");
        if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
      }
      pwPrompt = null;
      return;
    }

    if (!cmd) { append([], ""); return; }
    history.push(cmd);
    historyIdx = history.length;
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    const handler = COMMANDS[name];
    // Track every command (known or not)
    if (window.MMC_TRACK) window.MMC_TRACK.terminal(cmd, !!handler);
    if (handler) {
      const result = handler(args, cmd);
      append(result.lines || [], cmd);
    } else {
      append([
        { cls: "err", text: `bash: ${name}: command not found` },
        { cls: "hint", text: "Try 'help' for a list of commands." }
      ], cmd);
      if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
      if (window.MMC_TRACK) window.MMC_TRACK.terminalUnknown(cmd);
    }
  }

  function updatePrompt() {
    const el = modal?.querySelector(".term-input-wrap .p");
    if (el && window.MMC_VFS) el.textContent = `root@chtourou:${window.MMC_VFS.pwd()}$`;
  }

  // Subtle advance notification with step-specific "next move" orientation
  function printAdvance(step) {
    if (!body) return;
    // Concrete next-move hints per step reached
    const NEXT_MOVES = {
      2: [
        "    → Next: the README contains a base64 string. Decode it.",
        "    → Try: ~$ base64 -d <the string above>"
      ],
      3: [
        "    → Next: that file needs root access. Find the sudo password.",
        "    → Try: ~$ sudo cat /etc/shadow    (the prompt will hint at the password)",
        "    → Or inline: ~$ sudo -p <pw> cat /etc/shadow"
      ],
      4: [
        "    → Next: you're root now. Read the protected file.",
        "    → Try: ~$ cat /etc/shadow",
        "    → Then decode it: ~$ rot13 \"<paste a line>\""
      ],
      5: [
        "    → Next: identify the supercomputer from the 1995 hacker movie.",
        "    → Then: ~$ unlock <answer>    (single word, lowercase)"
      ]
    };
    setTimeout(() => {
      const lines = [
        { cls: "ok", text: `  ✓ Progress: ${step}/5` }
      ];
      if (NEXT_MOVES[step]) NEXT_MOVES[step].forEach(t => lines.push({ cls: "hint", text: t }));
      lines.push({ cls: "hint", text: "    Stuck? Type 'chip' for a hint. (3 per step, 4th = rage quit)" });
      append(lines);
      if (window.MMC_SOUND) window.MMC_SOUND.presets.beep();
    }, 300);
  }

  // ---------- Tab completion ----------
  function longestCommonPrefix(arr) {
    if (!arr.length) return "";
    let p = arr[0];
    for (let i = 1; i < arr.length; i++) {
      while (!arr[i].startsWith(p)) {
        p = p.slice(0, -1);
        if (!p) return "";
      }
    }
    return p;
  }

  function handleTabComplete() {
    const val = input.value;
    // Split on space but keep the position
    const lastSpace = val.lastIndexOf(" ");
    const isFirstToken = lastSpace === -1;

    if (isFirstToken) {
      // Complete command name
      const prefix = val;
      const cmdList = Object.keys(COMMANDS);
      const matches = cmdList.filter(c => c.startsWith(prefix));
      if (matches.length === 0) return;
      if (matches.length === 1) {
        input.value = matches[0] + " ";
      } else {
        const common = longestCommonPrefix(matches);
        if (common.length > prefix.length) {
          input.value = common;
        } else {
          append([{ cls: "hint", text: matches.join("   ") }]);
        }
      }
      return;
    }

    // Complete path
    const pathArg = val.substring(lastSpace + 1);
    const lastSlash = pathArg.lastIndexOf("/");
    let dir, partial;
    if (lastSlash === -1) {
      dir = window.MMC_VFS.pwd();
      partial = pathArg;
    } else {
      let dirPart = pathArg.substring(0, lastSlash);
      if (dirPart === "") dirPart = "/";
      // Expand ~
      if (dirPart === "~") dirPart = "/home/chtourou";
      else if (dirPart.startsWith("~/")) dirPart = "/home/chtourou" + dirPart.slice(1);
      dir = dirPart;
      partial = pathArg.substring(lastSlash + 1);
    }

    const r = window.MMC_VFS.ls(dir);
    if (r.err) return;
    const matches = r.entries.filter(e => e.name.startsWith(partial));
    if (matches.length === 0) return;

    function finalize(name, isDir) {
      const prefix = lastSlash === -1 ? "" : pathArg.substring(0, lastSlash + 1);
      return val.substring(0, lastSpace + 1) + prefix + name + (isDir ? "/" : " ");
    }

    if (matches.length === 1) {
      input.value = finalize(matches[0].name, matches[0].type === "dir");
    } else {
      const common = longestCommonPrefix(matches.map(e => e.name));
      if (common.length > partial.length) {
        const prefix = lastSlash === -1 ? "" : pathArg.substring(0, lastSlash + 1);
        input.value = val.substring(0, lastSpace + 1) + prefix + common;
      } else {
        append([{ cls: "hint", text: matches.map(e => e.name + (e.type === "dir" ? "/" : "")).join("   ") }]);
      }
    }
  }

  function open(trigger) {
    if (!modal) return;
    const wasOpen = modal.classList.contains("active");
    modal.classList.add("active");
    setTimeout(() => input.focus(), 100);
    updatePrompt();
    if (window.MMC_SOUND) window.MMC_SOUND.presets.beep();
    if (!wasOpen && window.MMC_TRACK) window.MMC_TRACK.terminalOpen(trigger || "unknown");
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("active");
    if (input) input.blur();
    // Clean up any active game
    if (window.MMC_GAMES) window.MMC_GAMES.stop();
  }

  function toggle(trigger) {
    if (modal.classList.contains("active")) close();
    else open(trigger);
  }

  function injectFab() {
    if (document.querySelector(".term-fab")) return;
    const fab = document.createElement("button");
    fab.className = "term-fab";
    fab.innerHTML = `
      <span class="fab-icon">▷_</span>
      <span>OPEN TERMINAL</span>
      <span class="fab-key">/</span>
    `;
    fab.addEventListener("click", () => { open("fab_button"); });
    document.body.appendChild(fab);

    // First-visit tip (localStorage gate)
    if (!localStorage.getItem("mmc_fab_tip_seen")) {
      setTimeout(() => {
        const tip = document.createElement("div");
        tip.className = "term-fab-tip";
        tip.innerHTML = `
          <button class="tip-close" aria-label="close">✕</button>
          <strong>◆ GEEK MODE</strong>
          This site has a hidden terminal with a 5-step CTF, mini-games, an AI chat, a Voight-Kampff test, and more.<br><br>
          Click the button <em style="color:var(--neon-primary)">→</em> or press <kbd>/</kbd>
        `;
        document.body.appendChild(tip);
        const closeTip = () => {
          tip.style.transition = "opacity 0.4s, transform 0.4s";
          tip.style.opacity = "0";
          tip.style.transform = "translateY(12px)";
          localStorage.setItem("mmc_fab_tip_seen", "1");
          setTimeout(() => tip.remove(), 500);
        };
        tip.querySelector(".tip-close").addEventListener("click", closeTip);
        // Auto-hide after 10s
        setTimeout(closeTip, 10000);
      }, 2500);
    }
  }

  // ---------- Mobile keyboard handling via VisualViewport API ----------
  function setupVisualViewport() {
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    function apply() {
      if (!modal || !modal.classList.contains("active")) return;
      const inner = modal.querySelector(".term-modal-inner");
      if (!inner) return;
      // Only take over on mobile
      if (window.innerWidth > 900) {
        inner.style.height = "";
        inner.style.maxHeight = "";
        return;
      }
      // Use visualViewport height so the terminal fits above the keyboard
      const h = vv.height;
      inner.style.height = h + "px";
      inner.style.maxHeight = h + "px";
      // Offset if the keyboard pushes the layout (iOS)
      inner.style.transform = `translateY(${vv.offsetTop}px)`;
      // Scroll body to latest
      if (body) body.scrollTop = body.scrollHeight;
    }
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    window.addEventListener("orientationchange", () => setTimeout(apply, 200));
    // Re-apply when modal opens
    const observer = new MutationObserver(() => {
      if (modal.classList.contains("active")) setTimeout(apply, 50);
    });
    observer.observe(modal, { attributes: true, attributeFilter: ["class"] });
  }

  function injectVirtualKeys() {
    const wrap = modal.querySelector(".term-input-wrap");
    if (!wrap || wrap.querySelector(".term-virtual-keys")) return;
    const keys = document.createElement("div");
    keys.className = "term-virtual-keys";
    keys.innerHTML = `
      <button type="button" data-k="tab" aria-label="tab">⇥</button>
      <button type="button" data-k="up" aria-label="previous command">↑</button>
      <button type="button" data-k="down" aria-label="next command">↓</button>
      <button type="button" data-k="enter" aria-label="enter">⏎</button>
    `;
    // Insert before caret span
    const caret = wrap.querySelector(".caret");
    if (caret) wrap.insertBefore(keys, caret);
    else wrap.appendChild(keys);

    keys.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const k = btn.dataset.k;
      // Prevent input from losing focus
      e.preventDefault();
      input.focus();
      if (k === "tab") {
        handleTabComplete();
      } else if (k === "enter") {
        exec(input.value);
        input.value = "";
        updatePrompt();
      } else if (k === "up") {
        if (history.length === 0) return;
        historyIdx = Math.max(0, historyIdx - 1);
        input.value = history[historyIdx] || "";
      } else if (k === "down") {
        historyIdx = Math.min(history.length, historyIdx + 1);
        input.value = history[historyIdx] || "";
      }
    });
    // mousedown/touchstart: keep focus in input
    keys.addEventListener("mousedown", (e) => e.preventDefault());
    keys.addEventListener("touchstart", (e) => { e.preventDefault(); }, { passive: false });
  }

  function init() {
    modal = document.getElementById("term-modal");
    if (!modal) return;
    body = modal.querySelector(".term-modal-body");
    input = modal.querySelector("#term-input");
    if (!body || !input) return;

    injectFab();
    injectVirtualKeys();
    setupVisualViewport();

    append([
      { cls: "ok", text: (window.MMC_I18N ? window.MMC_I18N.t("term_welcome") : "Welcome to chtourou.sh v2.0") },
      { cls: "hint", text: "Type 'help' to see what's possible. ↑/↓ for history. Esc to close." }
    ]);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        exec(input.value);
        input.value = "";
        updatePrompt();
      } else if (e.key === "Escape") {
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
        handleTabComplete();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        historyIdx = Math.max(0, historyIdx - 1);
        input.value = history[historyIdx] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        historyIdx = Math.min(history.length, historyIdx + 1);
        input.value = history[historyIdx] || "";
      }
    });

    modal.querySelector(".t-close")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });

    // Global keyboard shortcut
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "/" || e.key === "`") {
        e.preventDefault();
        toggle(e.key === "/" ? "keyboard_slash" : "keyboard_backtick");
      } else if (e.key === "~") {
        // ~ now opens AI chat
        e.preventDefault();
        if (window.MMC_AI) window.MMC_AI.toggle();
      }
    });
  }

  return { init, open, close, toggle, exec, printAdvance };
})();

window.MMC_TERM = MMC_TERM;
