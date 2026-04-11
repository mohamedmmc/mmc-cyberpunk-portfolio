/* =========================================================
   chip.js — CHIP, the stupid AI guide. COMPACT version.
   Rules:
   - 3 hints per CTF step, then CHIP rage-quits for that step
   - Counter resets when user advances to next step
   - Hints escalate: 1 = cryptic, 2 = direction, 3 = almost solution
   - Compact single-line avatar, minimal vertical space
   ========================================================= */

const MMC_CHIP = (() => {
  const STATE_KEY = "mmc_chip_state";

  const state = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
      return {
        hintsUsed: s.hintsUsed || 0,
        exhausted: s.exhausted || false,
        stepAtReset: s.stepAtReset || 0
      };
    } catch (e) {
      return { hintsUsed: 0, exhausted: false, stepAtReset: 0 };
    }
  })();

  function save() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

  // Single-line ASCII faces
  const FACES = {
    normal:   "[o_o]",
    happy:    "[^_^]",
    thinking: "[-_-]",
    excited:  "[*_*]",
    confused: "[?_?]",
    angry:    "[>_<]",
    gone:     "[x_x]"
  };

  // HINTS[step] = [ [face, ...lines] × 3 ]
  // Level 1: cryptic riddle. Level 2: direction. Level 3: almost the answer.
  const HINTS = {
    1: [
      ["normal",  "Something's hidden in your home.", "Look around. Listing helps."],
      ["thinking","A file written for explorers.", "Starts with R. Has .md."],
      ["happy",   "It's README.md.", "Cats love files too."]
    ],
    2: [
      ["normal",  "That long string ending with '='?", "Not real text. It's wearing a mask."],
      ["thinking","Encoding rhymes with 'basefore'.", "This terminal has a decoder."],
      ["happy",   "Use: base64 -d <the-string>", "Copy-paste it. Hit enter."]
    ],
    3: [
      ["normal",  "The file is locked.", "You need more power."],
      ["thinking","A magic word in Unix: sudo.", "And a password — a famous number."],
      ["happy",   "Ultimate answer to life is 42.", "sudo -p 42 cat /etc/shadow"]
    ],
    4: [
      ["normal",  "Letters look scrambled.", "A classic trick from the Romans."],
      ["thinking","Each letter rotated by 13.", "ROT-something..."],
      ["happy",   'rot13 "<paste-the-text>"', "Yes, with the quotes."]
    ],
    5: [
      ["normal",  "A legendary supercomputer.", "From a 90s hacker cult movie."],
      ["thinking","Movie: 'Hackers' (1995).", "Angelina Jolie. Rollerblades."],
      ["happy",   "The mainframe is Gibson.", "unlock gibson"]
    ]
  };

  const INTRO = [
    "excited",
    "Hi! I'm CHIP, your stupid AI guide.",
    "Stuck? Type: chip",
    "Rules: 3 hints per step. Abuse me,",
    "and I'll rage quit."
  ];

  const ANGRY = [
    "angry",
    "BRO. That's 3 hints.",
    "I'm not a walkthrough.",
    "Going on break until next step.",
    "*poof*"
  ];

  const GONE = [
    "gone",
    "... chip is not here right now.",
    "Solve the step to bring him back."
  ];

  const NO_CTF = [
    "normal",
    "No challenge running.",
    "Type: ctf start"
  ];

  const SOLVED = [
    "excited",
    "You already did it, cowboy.",
    "The Gibson awaits at /gibson.html"
  ];

  const JOKES = [
    ["happy", "Why do programmers prefer dark mode?", "Because light attracts bugs."],
    ["happy", "A SQL query walks into a bar,", "sees two tables: 'may I JOIN you?'"],
    ["happy", "There are 10 kinds of people.", "Those who know binary and those who don't."],
    ["happy", "My AI friends went on vacation.", "They're stuck in a loop. Told them to break."],
    ["happy", "Why did the dev go broke?", "They used up all their cache."],
    ["happy", "I'd tell you a UDP joke,", "but you might not get it."],
    ["happy", "Debugging: being the detective", "in a crime where you're the murderer."]
  ];

  function render(face, lines, headerLabel) {
    const avatar = FACES[face] || FACES.normal;
    const header = headerLabel
      ? `${avatar} CHIP [${headerLabel}]:`
      : `${avatar} CHIP:`;
    const out = [{ cls: "chip", text: header }];
    lines.forEach((l) => out.push({ cls: "chip", text: "      " + l }));
    return out;
  }

  function intro() {
    const [face, ...lines] = INTRO;
    return render(face, lines);
  }

  function joke() {
    const [face, ...lines] = JOKES[Math.floor(Math.random() * JOKES.length)];
    return render(face, lines, "random joke");
  }

  // User explicitly asks for help
  function request() {
    if (!window.MMC_CTF || !window.MMC_CTF.state.started) {
      const [face, ...lines] = NO_CTF;
      return render(face, lines);
    }
    if (window.MMC_CTF.state.solved) {
      const [face, ...lines] = SOLVED;
      return render(face, lines);
    }

    const step = window.MMC_CTF.state.progress;

    // If we advanced to a new step since last time, reset
    if (state.stepAtReset !== step) {
      state.hintsUsed = 0;
      state.exhausted = false;
      state.stepAtReset = step;
      save();
    }

    if (state.exhausted) {
      const [face, ...lines] = GONE;
      return render(face, lines);
    }

    if (state.hintsUsed >= 3) {
      // 4th request — rage quit
      state.exhausted = true;
      save();
      if (window.MMC_TRACK) window.MMC_TRACK.chipRageQuit(step);
      const [face, ...lines] = ANGRY;
      return render(face, lines);
    }

    const hintIdx = state.hintsUsed;
    state.hintsUsed++;
    save();

    if (window.MMC_TRACK) window.MMC_TRACK.chipHint(step, state.hintsUsed);

    const [face, ...lines] = HINTS[step][hintIdx];
    return render(face, lines, `hint ${state.hintsUsed}/3 • step ${step}`);
  }

  // Called when CTF advances to a new step — reset hint counter
  function onAdvance(step) {
    state.hintsUsed = 0;
    state.exhausted = false;
    state.stepAtReset = step;
    save();
  }

  // Called when CTF is fully solved — celebration message
  function onSolved() {
    return render("excited", [
      "HOLY CRAP YOU DID IT.",
      "I doubted you. I was wrong.",
      "The Gibson is yours. /gibson.html"
    ], "CTF COMPLETE");
  }

  function reset() {
    state.hintsUsed = 0;
    state.exhausted = false;
    state.stepAtReset = 0;
    save();
  }

  return { intro, joke, request, onAdvance, onSolved, reset, state };
})();

window.MMC_CHIP = MMC_CHIP;
