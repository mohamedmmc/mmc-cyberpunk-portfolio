/* =========================================================
   voight-kampff.js — Blade Runner style empathy test
   ========================================================= */

const MMC_VK = (() => {
  const QUESTIONS = [
    {
      q: "You're given a calfskin wallet for your birthday. Your reaction?",
      opts: [
        { t: "Thank them warmly, I appreciate the thought.", human: 2 },
        { t: "I refuse it. A calf was killed for this.", human: 3 },
        { t: "I'd prefer vegan leather.", human: 1 },
        { t: "I calculate its market value.", human: 0 }
      ]
    },
    {
      q: "A tortoise lies on its back in the desert. You see it struggling. You do not help. Why?",
      opts: [
        { t: "What's a tortoise?", human: 0 },
        { t: "I was scared of it.", human: 1 },
        { t: "I wasn't really there.", human: 0 },
        { t: "I would definitely help it.", human: 3 }
      ]
    },
    {
      q: "Describe, in single words, only the good things that come to your mind about your mother.",
      opts: [
        { t: "Warm. Kind. Safe.", human: 3 },
        { t: "Let me tell you about my mother...", human: -2 },
        { t: "I don't have a mother.", human: 0 },
        { t: "I'd rather not answer that.", human: 1 }
      ]
    },
    {
      q: "You're in a restaurant. You order soup. You find a wasp in it. What do you do?",
      opts: [
        { t: "Send it back and ask politely for another.", human: 3 },
        { t: "Kill the wasp and continue eating.", human: 0 },
        { t: "Scream and leave the restaurant.", human: 2 },
        { t: "Analyze the wasp's species.", human: 1 }
      ]
    },
    {
      q: "You see a film where people dance in the rain. How does it make you feel?",
      opts: [
        { t: "Joyful. Free. Alive.", human: 3 },
        { t: "Indifferent. It's just water.", human: 0 },
        { t: "Nostalgic for something I can't name.", human: 3 },
        { t: "I compute their motion vectors.", human: 0 }
      ]
    }
  ];

  let modal, body, currentQ, score, startTime;

  function build() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "vk-modal";
    modal.innerHTML = `
      <div class="vk-inner">
        <div class="vk-head">
          <span class="vk-title">VOIGHT-KAMPFF TEST // v2.26</span>
          <button class="vk-close" aria-label="close">✕</button>
        </div>
        <div class="vk-scan"></div>
        <div class="vk-body"></div>
        <div class="vk-foot">
          <span class="vk-progress">Q 0/0</span>
          <span class="vk-timer">00:00</span>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    body = modal.querySelector(".vk-body");
    modal.querySelector(".vk-close").addEventListener("click", close);
  }

  function open() {
    build();
    modal.classList.add("active");
    currentQ = 0;
    score = 0;
    startTime = Date.now();
    renderQ();
    if (window.MMC_SOUND) window.MMC_SOUND.presets.beep();
  }

  function close() {
    if (modal) modal.classList.remove("active");
  }

  function renderQ() {
    const q = QUESTIONS[currentQ];
    if (!q) return finish();
    modal.querySelector(".vk-progress").textContent = `Q ${currentQ + 1}/${QUESTIONS.length}`;
    body.innerHTML = `
      <div class="vk-q">${q.q}</div>
      <div class="vk-opts">
        ${q.opts.map((o, i) => `<button class="vk-opt" data-i="${i}">${String.fromCharCode(65 + i)}. ${o.t}</button>`).join("")}
      </div>
    `;
    body.querySelectorAll(".vk-opt").forEach(btn => btn.addEventListener("click", (e) => {
      const i = parseInt(e.currentTarget.dataset.i, 10);
      score += q.opts[i].human;
      if (window.MMC_SOUND) window.MMC_SOUND.presets.click();
      currentQ++;
      setTimeout(renderQ, 300);
    }));
  }

  function finish() {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const max = QUESTIONS.reduce((acc, q) => acc + Math.max(...q.opts.map(o => o.human)), 0);
    const ratio = score / max;
    let verdict = "REPLICANT";
    let color = "var(--neon-danger)";
    let msg = "Subject fails empathy threshold. Retirement recommended.";
    if (ratio >= 0.75) { verdict = "HUMAN"; color = "var(--neon-accent)"; msg = "Subject passes the test. Baseline emotions detected."; }
    else if (ratio >= 0.5) { verdict = "INCONCLUSIVE"; color = "var(--neon-warn)"; msg = "Results borderline. Recheck advised."; }

    body.innerHTML = `
      <div class="vk-result">
        <div class="vk-verdict" style="color:${color};text-shadow:0 0 12px ${color};">${verdict}</div>
        <div class="vk-msg">${msg}</div>
        <div class="vk-stats">
          <div>EMPATHY SCORE: <b>${score}/${max}</b></div>
          <div>TIME ELAPSED:  <b>${elapsed}s</b></div>
        </div>
        <button class="vk-opt" id="vk-retry">RETRY TEST</button>
      </div>
    `;
    body.querySelector("#vk-retry").addEventListener("click", () => { currentQ = 0; score = 0; startTime = Date.now(); renderQ(); });

    if (verdict === "HUMAN") {
      if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("CERTIFIED_HUMAN", "Passed the Voight-Kampff. Your empathy is intact.");
      if (window.MMC_XP) window.MMC_XP.gain(120, "V-K passed");
    } else if (verdict === "REPLICANT") {
      if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("REPLICANT", "You might be synthetic. Run, Blade Runners are coming.");
      if (window.MMC_XP) window.MMC_XP.gain(80, "V-K replicant");
    } else {

    }
  }

  return { open, close };
})();

window.MMC_VK = MMC_VK;
