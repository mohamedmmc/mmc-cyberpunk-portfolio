/* =========================================================
   ctf.js — Capture The Flag quest orchestration
   ========================================================= */

const MMC_CTF = (() => {
  const STATE_KEY = "mmc_ctf_state";
  const PROGRESS_KEY = "mmc_ctf_progress";
  const START_TS_KEY = "mmc_ctf_start_ts";
  const ELITE_START_TS_KEY = "mmc_ctf_elite_start_ts";

  const state = {
    started: localStorage.getItem(STATE_KEY) === "started",
    progress: parseInt(localStorage.getItem(PROGRESS_KEY) || "0", 10),
    solved: localStorage.getItem(STATE_KEY) === "solved"
  };

  const STEPS = [
    {
      id: 1,
      title: "STEP 1 / 5 — The README",
      desc: "Start by reading the hidden README in /home/chtourou.",
      hint: "~$ cat ~/README.md"
    },
    {
      id: 2,
      title: "STEP 2 / 5 — Base64 decoding",
      desc: "README points to a base64-encoded command. Decode it.",
      hint: "~$ base64 -d <the string>  — and run what it outputs"
    },
    {
      id: 3,
      title: "STEP 3 / 5 — Permission denied",
      desc: "The file requires root access. Find the magic password.",
      hint: "Hint: the answer to life, the universe, and everything (HGTTG — 1979)"
    },
    {
      id: 4,
      title: "STEP 4 / 5 — ROT13",
      desc: "The shadow file contains a ROT13 cipher. Decode it.",
      hint: "~$ rot13 \"Gur fhcrepbzchgre ...\""
    },
    {
      id: 5,
      title: "STEP 5 / 5 — Geek culture",
      desc: "Identify the supercomputer from the 1995 hacker movie.",
      hint: "Then run: unlock <answer>  (single word, lowercase)"
    }
  ];

  function start() {
    state.started = true;
    state.progress = 1;
    localStorage.setItem(STATE_KEY, "started");
    localStorage.setItem(PROGRESS_KEY, "1");
    try { localStorage.setItem(START_TS_KEY, String(Date.now())); } catch (e) {}
    if (window.MMC_TRACK) window.MMC_TRACK.ctfStart("basic");
    // Reset CHIP state for a fresh run
    if (window.MMC_CHIP) window.MMC_CHIP.reset();
    const lines = [
      { cls: "ok", text: "╔══════════════════════════════════════╗" },
      { cls: "ok", text: "║  CHALLENGE STARTED // 5 STEPS        ║" },
      { cls: "ok", text: "╚══════════════════════════════════════╝" },
      { cls: "out", text: "" }
    ];
    if (window.MMC_CHIP) {
      lines.push(...window.MMC_CHIP.intro());
    }
    lines.push({ cls: "out", text: "" });
    lines.push({ cls: "hint", text: "Type 'chip' if stuck, 'ctf status' for progress." });
    return lines;
  }

  function hint() {
    if (!state.started) return [{ cls: "err", text: "CTF not started. Run: ctf start" }];
    if (state.solved) return [{ cls: "ok", text: "CTF already solved. Nice work, cowboy." }];
    const step = STEPS[state.progress - 1];
    return [
      { cls: "hint", text: step.title },
      { cls: "out", text: step.desc },
      { cls: "hint", text: "Hint: " + step.hint }
    ];
  }

  function status() {
    if (!state.started) return [{ cls: "out", text: "CTF not started. Run: ctf start" }];
    if (state.solved) return [
      { cls: "ok", text: "Progress: 5/5 — SOLVED ✓" },
      { cls: "ok", text: "You earned the CTF_MASTER title." },
      { cls: "hint", text: "Visit: /gibson.html (or run 'open gibson')" }
    ];
    const bar = "█".repeat(state.progress) + "░".repeat(5 - state.progress);
    return [
      { cls: "ok", text: `Progress: ${state.progress}/5  [${bar}]` },
      { cls: "out", text: STEPS[state.progress - 1].title },
      { cls: "hint", text: "Type 'ctf hint' for a clue." }
    ];
  }

  // Called when user successfully reads README (step 1 → 2)
  function advance(step) {
    if (!state.started) return;
    if (state.progress < step) {
      state.progress = step;
      localStorage.setItem(PROGRESS_KEY, String(step));
      if (window.MMC_SOUND) window.MMC_SOUND.presets.success();
      if (window.MMC_TRACK) window.MMC_TRACK.ctfStep(step);
      // Reset CHIP hint counter for the new step
      if (window.MMC_CHIP) window.MMC_CHIP.onAdvance(step);
      // Subtle advance notification in terminal (no auto CHIP dialog)
      if (window.MMC_TERM && window.MMC_TERM.printAdvance) {
        window.MMC_TERM.printAdvance(step);
      }
    }
  }

  // Called when user runs the right unlock
  function unlock(answer) {
    if (!state.started) {
      return { lines: [{ cls: "err", text: "CTF not started. Run: ctf start" }] };
    }
    const ans = (answer || "").toLowerCase().trim();
    if (ans === "gibson") {
      state.solved = true;
      state.progress = 5;
      localStorage.setItem(STATE_KEY, "solved");
      localStorage.setItem(PROGRESS_KEY, "5");
      if (window.MMC_TRACK) {
        let timeS = 0;
        try {
          const startTs = parseInt(localStorage.getItem(START_TS_KEY) || "0", 10);
          if (startTs) timeS = Math.round((Date.now() - startTs) / 1000);
        } catch (e) {}
        window.MMC_TRACK.ctfSolved(timeS);
      }
      if (window.MMC_ACHIEVEMENTS) {
        window.MMC_ACHIEVEMENTS.unlock("CTF_MASTER", "You cracked the 5-step CTF. Welcome to Gibson.", "epic");
      }
      if (window.MMC_XP) window.MMC_XP.gain(300, "CTF solved");
      setTimeout(() => {
        const base = location.pathname.includes("/projects/") ? "../gibson.html" : "gibson.html";
        window.location.href = base;
      }, 4500);
      const lines = [
        { cls: "ok", text: "════════════════════════════════════════════════" },
        { cls: "ok", text: "  ACCESS GRANTED // GIBSON UNLOCKED" },
        { cls: "ok", text: "════════════════════════════════════════════════" },
        { cls: "out", text: "" }
      ];
      if (window.MMC_CHIP) lines.push(...window.MMC_CHIP.onSolved());
      return { lines };
    }
    // Wrong guesses with cheeky hints
    const wrongs = {
      "zero_cool": "Close, but Zero Cool is the hacker, not his target.",
      "crash_override": "That's his other alias. Think: what do they hack?",
      "acid_burn": "Also a hacker in that movie. Keep thinking.",
      "hal": "Different movie. 2001: A Space Odyssey.",
      "skynet": "Different franchise. Think '95 hacker movie specifically.",
      "wopr": "WarGames (1983). Not the right movie.",
      "matrix": "Different movie. 1999.",
      "neo": "Wrong movie — try the 1995 one with teenage hackers.",
      "rollerball": "The movie is about hacking a single supercomputer. Single word."
    };
    if (wrongs[ans]) return { lines: [{ cls: "err", text: "Wrong. " + wrongs[ans] }] };
    if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
    return { lines: [{ cls: "err", text: `unlock: '${ans}' is not the flag. Try 'ctf hint'.` }] };
  }

  function reset() {
    state.started = false;
    state.progress = 0;
    state.solved = false;
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    if (window.MMC_CHIP) window.MMC_CHIP.reset();
  }

  // ---------- ELITE CTF (3 logic steps after solving basic CTF) ----------
  // v2: rewritten for accessibility — pure logic, basic shell commands, no crypto.
  const ELITE_STATE_KEY = "mmc_ctf_elite_state";
  const ELITE_PROG_KEY = "mmc_ctf_elite_progress";
  const ELITE_HINT_KEY = "mmc_ctf_elite_hint_level"; // per-step hint level

  const eliteState = {
    started: localStorage.getItem(ELITE_STATE_KEY) === "started",
    progress: parseInt(localStorage.getItem(ELITE_PROG_KEY) || "0", 10),
    solved: localStorage.getItem(ELITE_STATE_KEY) === "solved"
  };

  const ELITE_STEPS = [
    {
      id: 1,
      title: "ELITE STEP 1 / 3 — Who opened the door?",
      desc: "A sensitive file was written on the server. Read the auth log and identify WHICH user gained root access and wrote /root/.access_token. Answer: elite 1 <username>",
      hints: [
        "Auth events are logged in /var/log. Poke around there.",
        "Try: cat /var/log/secure.log — look for the line that mentions /root/.access_token",
        "The username is written right after 'user:' on the line about privilege escalation."
      ]
    },
    {
      id: 2,
      title: "ELITE STEP 2 / 3 — The history never lies",
      desc: "The previous user left their shell history behind. Find the value of the ADMIN_TOKEN they exported. Answer: elite 2 <token>",
      hints: [
        "Bash keeps a history file in the home directory. It starts with a dot.",
        "Try: cat ~/.bash_history — scan the lines for an export statement.",
        "Look for a line starting with 'export ADMIN_TOKEN=...' — the value is between the quotes."
      ]
    },
    {
      id: 3,
      title: "ELITE STEP 3 / 3 — Port knock",
      desc: "You have the token, you have the user. You just need the port. Read the SSH client config and find the port used by the host named 'admin'. Answer: elite 3 <port>",
      hints: [
        "SSH configuration lives in /etc. There's a subdirectory for it.",
        "Try: cat /etc/ssh/config — find the 'Host admin' block.",
        "Inside the 'Host admin' block, the value after 'Port' is what you want. Just the number."
      ]
    }
  ];

  function eliteStart() {
    if (!state.solved) {
      return [{ cls: "err", text: "Elite CTF locked. Finish the basic CTF first (5 steps)." }];
    }
    if (!window.MMC_MODE || !window.MMC_MODE.isElite()) {
      return [{ cls: "err", text: "Elite CTF requires elite mode. Run: mode elite" }];
    }
    eliteState.started = true;
    if (eliteState.progress < 1) eliteState.progress = 1;
    localStorage.setItem(ELITE_STATE_KEY, "started");
    localStorage.setItem(ELITE_PROG_KEY, String(eliteState.progress));
    try { localStorage.setItem(ELITE_START_TS_KEY, String(Date.now())); } catch (e) {}
    if (window.MMC_TRACK) window.MMC_TRACK.ctfEliteStart();
    return [
      { cls: "ok", text: "╔═══════════════════════════════════════╗" },
      { cls: "ok", text: "║   ELITE CTF INITIATED                 ║" },
      { cls: "ok", text: "╚═══════════════════════════════════════╝" },
      { cls: "out", text: "" },
      { cls: "hint", text: "Three steps. Pure logic. Basic Unix commands only." },
      { cls: "hint", text: "Stuck? Type 'elite hint' for a gentle nudge, 'elite hint 2' or 'elite hint 3' for more." },
      { cls: "out", text: "" },
      { cls: "hint", text: ELITE_STEPS[eliteState.progress - 1].title },
      { cls: "out", text: ELITE_STEPS[eliteState.progress - 1].desc }
    ];
  }

  function eliteHint(levelArg) {
    if (!eliteState.started) return [{ cls: "err", text: "Elite CTF not started. Run: elite start" }];
    if (eliteState.solved) return [{ cls: "ok", text: "Elite CTF solved. Respect." }];
    const s = ELITE_STEPS[eliteState.progress - 1];
    // Parse hint level (1, 2, or 3). Default = 1.
    let level = parseInt(levelArg, 10);
    if (!level || level < 1) level = 1;
    if (level > 3) level = 3;
    // Remember highest hint level used (for future "Pure Mind" achievement)
    try {
      const key = ELITE_HINT_KEY + "_" + eliteState.progress;
      const prev = parseInt(localStorage.getItem(key) || "0", 10);
      if (level > prev) localStorage.setItem(key, String(level));
    } catch (e) {}
    const lines = [
      { cls: "hint", text: s.title },
      { cls: "out", text: s.desc },
      { cls: "out", text: "" }
    ];
    for (let i = 0; i < level; i++) {
      lines.push({ cls: "hint", text: `Hint ${i + 1}/3: ` + s.hints[i] });
    }
    if (level < 3) {
      lines.push({ cls: "out", text: "" });
      lines.push({ cls: "out", text: `(Need more help? Type: elite hint ${level + 1})` });
    }
    return lines;
  }

  function eliteStatus() {
    if (!eliteState.started) return [{ cls: "out", text: "Elite CTF not started. Run: elite start (after: mode elite)" }];
    if (eliteState.solved) return [
      { cls: "ok", text: "Elite progress: 3/3 — SOLVED ✓" },
      { cls: "ok", text: "Achievement: EXTREME_CTF [LEGENDARY]" }
    ];
    const bar = "█".repeat(eliteState.progress) + "░".repeat(3 - eliteState.progress);
    return [
      { cls: "ok", text: `Elite progress: ${eliteState.progress}/3  [${bar}]` },
      { cls: "out", text: ELITE_STEPS[eliteState.progress - 1].title },
      { cls: "hint", text: "Type 'elite hint' for a clue." }
    ];
  }

  function eliteSubmit(stepNum, answer) {
    if (!eliteState.started) return { lines: [{ cls: "err", text: "Elite CTF not started. Run: elite start" }] };
    const step = parseInt(stepNum, 10);
    if (step !== eliteState.progress) {
      return { lines: [{ cls: "err", text: `You are on step ${eliteState.progress}, not ${step}.` }] };
    }
    // Normalize: trim, remove surrounding quotes (users may paste "blackwall-2077")
    const raw = (answer || "").trim().replace(/^["']|["']$/g, "");
    const ans = raw.toLowerCase();
    let correct = false;
    if (step === 1) correct = ans === "oracle";
    if (step === 2) correct = ans === "blackwall-2077";
    if (step === 3) correct = ans === "4242";
    if (!correct) {
      if (window.MMC_SOUND) window.MMC_SOUND.presets.error();
      if (window.MMC_TRACK) window.MMC_TRACK.ctfEliteStep(step, false);
      return { lines: [{ cls: "err", text: "Wrong answer. Try 'elite hint' (or 'elite hint 2' / 'elite hint 3')." }] };
    }
    if (window.MMC_SOUND) window.MMC_SOUND.presets.success();
    if (window.MMC_TRACK) window.MMC_TRACK.ctfEliteStep(step, true);
    if (step < 3) {
      eliteState.progress = step + 1;
      localStorage.setItem(ELITE_PROG_KEY, String(eliteState.progress));
      return {
        lines: [
          { cls: "ok", text: `✓ Step ${step} solved.` },
          { cls: "out", text: "" },
          { cls: "hint", text: ELITE_STEPS[eliteState.progress - 1].title },
          { cls: "out", text: ELITE_STEPS[eliteState.progress - 1].desc }
        ]
      };
    }
    // Step 3 cleared
    eliteState.solved = true;
    localStorage.setItem(ELITE_STATE_KEY, "solved");
    localStorage.setItem(ELITE_PROG_KEY, "3");
    if (window.MMC_TRACK) {
      let timeS = 0;
      try {
        const startTs = parseInt(localStorage.getItem(ELITE_START_TS_KEY) || "0", 10);
        if (startTs) timeS = Math.round((Date.now() - startTs) / 1000);
      } catch (e) {}
      window.MMC_TRACK.ctfEliteSolved(timeS);
    }
    if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("EXTREME_CTF", "You cracked the Elite CTF. Welcome to the Deep Core.", "legendary");
    if (window.MMC_XP) window.MMC_XP.gain(600, "Elite CTF solved");
    return {
      lines: [
        { cls: "ok", text: "╔══════════════════════════════════════════╗" },
        { cls: "ok", text: "║  ELITE CTF SOLVED // DEEP CORE UNLOCKED  ║" },
        { cls: "ok", text: "╚══════════════════════════════════════════╝" },
        { cls: "out", text: "" },
        { cls: "hint", text: "You are now a Deck Jockey, cowboy." }
      ]
    };
  }

  function eliteReset() {
    eliteState.started = false;
    eliteState.progress = 0;
    eliteState.solved = false;
    localStorage.removeItem(ELITE_STATE_KEY);
    localStorage.removeItem(ELITE_PROG_KEY);
    // Also clear hint level counters
    try {
      for (let i = 1; i <= 3; i++) localStorage.removeItem(ELITE_HINT_KEY + "_" + i);
    } catch (e) {}
  }

  return { state, start, hint, status, advance, unlock, reset, STEPS, eliteState, eliteStart, eliteHint, eliteStatus, eliteSubmit, eliteReset };
})();

window.MMC_CTF = MMC_CTF;
