/* =========================================================
   boot.js — Initial boot sequence animation
   ========================================================= */

const MMC_BOOT = (() => {
  const LOGO = `
  ███╗   ███╗███╗   ███╗ ██████╗
  ████╗ ████║████╗ ████║██╔════╝
  ██╔████╔██║██╔████╔██║██║
  ██║╚██╔╝██║██║╚██╔╝██║██║
  ██║ ╚═╝ ██║██║ ╚═╝ ██║╚██████╗
  ╚═╝     ╚═╝╚═╝     ╚═╝ ╚═════╝
  MOHAMED_MELEK_CHTOUROU // v2.0
`;

  const LINES = [
    { type: "logo" },
    { delay: 200, tag: "INFO", text: "BIOS v2.0.26 loading...", cls: "ok" },
    { delay: 80, tag: " OK ", text: "Memory test passed — 16384 MB", cls: "ok" },
    { delay: 80, tag: " OK ", text: "CPU: Intel Neural Core @ 3.6 GHz", cls: "ok" },
    { delay: 80, tag: " OK ", text: "Detecting peripherals...", cls: "ok" },
    { delay: 60, tag: " OK ", text: "Keyboard: connected", cls: "ok" },
    { delay: 60, tag: " OK ", text: "Mouse: connected (cybernetic)", cls: "ok" },
    { delay: 100, tag: " OK ", text: "Loading neural_net.sys", cls: "ok" },
    { delay: 150, tag: " OK ", text: "Mounting /dev/creativity", cls: "ok" },
    { delay: 120, tag: "WARN", text: "Coffee level: 42% — acceptable", cls: "warn" },
    { delay: 80, tag: " OK ", text: "Initializing dart_vm.dll", cls: "ok" },
    { delay: 60, tag: " OK ", text: "Initializing node_runtime.so", cls: "ok" },
    { delay: 60, tag: " OK ", text: "Initializing swift_kernel", cls: "ok" },
    { delay: 100, tag: " OK ", text: "Compiling personality matrix...", cls: "ok" },
    { delay: 150, tag: " OK ", text: "All systems nominal", cls: "ok" },
    { delay: 100, tag: "INFO", text: "Launching MMC_PORTFOLIO.EXE", cls: "ok" },
    { delay: 200, tag: " ➜ ", text: "Welcome, human. System online.", cls: "ok" },
  ];

  function run(onDone) {
    const overlay = document.getElementById("boot-sequence");
    if (!overlay) { if (onDone) onDone(); return; }
    const out = overlay.querySelector(".boot-output");
    if (!out) { if (onDone) onDone(); return; }

    // Skip on return visits
    if (sessionStorage.getItem("mmc_booted") === "1") {
      overlay.style.display = "none";
      if (onDone) onDone();
      return;
    }

    let total = 0;
    let i = 0;

    function addLine() {
      if (i >= LINES.length) {
        sessionStorage.setItem("mmc_booted", "1");
        setTimeout(() => {
          overlay.classList.add("done");
          if (window.MMC_SOUND) window.MMC_SOUND.presets.startup();
          setTimeout(() => {
            overlay.style.display = "none";
            if (onDone) onDone();
          }, 600);
        }, 400);
        return;
      }
      const line = LINES[i];
      const el = document.createElement("div");
      el.className = "boot-line " + (line.cls || "");
      if (line.type === "logo") {
        el.className = "boot-logo";
        el.textContent = LOGO;
      } else {
        el.innerHTML = `<span class="tag">${line.tag}</span> ${line.text}`;
      }
      out.appendChild(el);
      if (window.MMC_SOUND) window.MMC_SOUND.presets.typing();
      i++;
      setTimeout(addLine, line.delay || 80);
    }

    // Start immediately
    addLine();
  }

  return { run };
})();

window.MMC_BOOT = MMC_BOOT;
