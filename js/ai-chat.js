/* =========================================================
   ai-chat.js — Fake AI chatbot for "ask me anything about Mohamed"
   Triggered by pressing ~ (or the terminal `ai` command)
   ========================================================= */

const MMC_AI = (() => {
  let modal, body, input;

  // Response database — regex pattern → response
  const RESPONSES = [
    {
      rx: /\b(hello|hi|hey|salut|bonjour|yo|sup|hola|howdy)\b/i,
      r: () => pick([
        "Hey, human. I'm AI.CHTOUROU, a (mostly) friendly neural net. Ask me anything about Mohamed.",
        "Greetings. You've activated my chat module. Fire away.",
        "Hello, curious one. What would you like to know?"
      ])
    },
    {
      rx: /(who are you|qui es tu|what are you|t'es qui)/i,
      r: () => "I'm AI.CHTOUROU v0.9 — a fake AI trained on Mohamed's portfolio. I'm not really sentient. I just pretend well."
    },
    {
      rx: /(mohamed|melek|chtourou).*(who|qui|about)/i,
      r: () => "Mohamed Melek Chtourou: Ingénieur Flutter & Node.js from Tunisia. 3 apps live in production. Cries happy tears when tests pass. Debug-until-dawn enthusiast."
    },
    {
      rx: /(skills|compétences|what.*can.*do|stack|tech)/i,
      r: () => "Mobile: Flutter, Dart, Swift, Kotlin. Backend: Node.js, Express, Spring Boot. Frontend: React, JS. Database: MySQL, MongoDB, Firebase. DevOps: Docker, VPS OVH. Also: relentless debugging."
    },
    {
      rx: /(project|projet|work|travail|build)/i,
      r: () => "Six projects, documented on this site: The Landlord (real estate, live), Lost & Found (iOS/Android/Huawei), TESA (esports), Randev (B2B), Artisan d'Art (marketplace), Esprit App (campus). Use the terminal: 'projects' or 'open thelandlord'."
    },
    {
      rx: /(contact|email|mail|hire|recruit|job|mission)/i,
      r: () => "Email: contact@mohamedmelekchtourou.com. He replies within 24h. He's open to ambitious missions."
    },
    {
      rx: /(favorite|préfér|best).*project/i,
      r: () => "The Landlord — because it's the first one he shipped to production on 2 stores. Felt like finishing a long quest."
    },
    {
      rx: /(flutter|dart)/i,
      r: () => "Flutter is his daily driver. 4+ years. He's built 3 production Flutter apps and many experimental ones."
    },
    {
      rx: /(react|javascript|js|typescript|ts)/i,
      r: () => "Solid React + JS background — fullstack experience. The Artisan d'Art admin dashboard is pure React + CoreUI + Redux."
    },
    {
      rx: /(node|express|backend)/i,
      r: () => "Node.js + Express is his go-to for APIs. He's shipped production backends on VPS OVH with Docker."
    },
    {
      rx: /(swift|ios|kotlin|android)/i,
      r: () => "Native mobile too — Swift 4/5 + SwiftUI + UIKit, Kotlin for Android. Esprit App and Lost & Found were built natively before he fell in love with Flutter."
    },
    {
      rx: /(dream|rêve|neuromancer|gibson|cyberpunk)/i,
      r: () => "'The sky above the port was the color of television, tuned to a dead channel.' Neuromancer changed everything. Respect to Gibson."
    },
    {
      rx: /(electric.*sheep|replicant|blade.*runner)/i,
      r: () => "*the AI pauses for 2 seconds* …Maybe. Maybe I do dream of electric sheep. Don't tell anyone."
    },
    {
      rx: /(42|meaning|answer|everything|universe|hitchhiker)/i,
      r: () => "The answer is 42. Always has been. Always will be. Pro tip: it's also the sudo password on this shell."
    },
    {
      rx: /(matrix|neo|wake.*up|red.*pill|blue.*pill)/i,
      r: () => "There is no spoon. But there is a Konami code. Try it."
    },
    {
      rx: /(love|amour|marry|date|girlfriend)/i,
      r: () => "That's... out of scope for my training data. Also, cringe. Moving on."
    },
    {
      rx: /(are.*you.*sentient|conscient|conscious|alive)/i,
      r: () => "No. I'm a switch statement wearing a neon coat. But thanks for asking."
    },
    {
      rx: /(joke|blague|funny|rigol)/i,
      r: () => pick([
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "There are 10 kinds of people. Those who understand binary and those who don't.",
        "A SQL query walks into a bar, approaches two tables and asks: 'May I join you?'",
        "Why do Python devs wear glasses? Because they don't C#."
      ])
    },
    {
      rx: /(help|aide)/i,
      r: () => "Ask me about: projects, skills, contact, Flutter, Node, React, Swift, his favorite stack, or try 'joke'. You can also ask 'who is Mohamed'."
    },
    {
      rx: /(bye|salut|ciao|exit|quit|fermer|close)/i,
      r: () => { setTimeout(close, 400); return "Farewell, human. Stay curious."; }
    }
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function respond(msg) {
    for (const r of RESPONSES) {
      if (r.rx.test(msg)) return r.r();
    }
    return "I don't have a pre-programmed answer for that. Try: projects, skills, contact, Flutter, or 'joke'.";
  }

  function build() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "ai-modal";
    modal.innerHTML = `
      <div class="ai-inner">
        <div class="ai-head">
          <span class="ai-status"></span>
          <span class="ai-title">AI.CHTOUROU v0.9 // ask me anything</span>
          <button class="ai-close">✕</button>
        </div>
        <div class="ai-body"></div>
        <div class="ai-input-wrap">
          <span class="ai-prompt">&gt;</span>
          <input type="text" class="ai-input" placeholder="Type your question..." autocomplete="off" spellcheck="false" />
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    body = modal.querySelector(".ai-body");
    input = modal.querySelector(".ai-input");
    modal.querySelector(".ai-close").addEventListener("click", close);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        const q = input.value.trim();
        addLine(q, "user");
        input.value = "";
        setTimeout(() => {
          addLine(respond(q), "ai");
          if (window.MMC_SOUND) window.MMC_SOUND.presets.beep();
        }, 400 + Math.random() * 500);
      } else if (e.key === "Escape") {
        close();
      }
    });

    // Welcome message
    addLine("AI.CHTOUROU online. Ask me anything about Mohamed. Type 'help' for topics.", "ai");
  }

  function addLine(text, who) {
    const line = document.createElement("div");
    line.className = "ai-line ai-line-" + who;
    line.innerHTML = `<span class="ai-who">${who === "user" ? "YOU" : "AI "}</span><span class="ai-text">${escapeHtml(text)}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function open() {
    build();
    modal.classList.add("active");
    setTimeout(() => input.focus(), 200);
    if (window.MMC_ACHIEVEMENTS) window.MMC_ACHIEVEMENTS.unlock("AI_WHISPERER", "You talked to the AI. Turing would be proud.");
  }

  function close() {
    if (modal) modal.classList.remove("active");
  }

  function toggle() {
    if (modal && modal.classList.contains("active")) close();
    else open();
  }

  return { open, close, toggle };
})();

window.MMC_AI = MMC_AI;
