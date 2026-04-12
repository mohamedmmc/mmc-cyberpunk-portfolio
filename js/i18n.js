/* =========================================================
   i18n.js — Trilingual engine: FR / EN / 1337
   Usage: data-i18n="key" on elements
   ========================================================= */

const I18N = {
  fr: {
    // Status bar
    status_online: "NEO_CHTOUROU.EXE // SYSTEM ONLINE",
    status_uptime: "UPTIME",

    // Hero
    hero_badge: "DISPONIBLE POUR MISSION",
    hero_name_line1: "MOHAMED",
    hero_name_line2: "CHTOUROU",
    hero_role_text: "> Ingénieur",
    hero_role_kw: "FLUTTER & NODE.JS",
    hero_typing_prompt: "~$",
    hero_typing_1: "3 apps publiées sur les stores",
    hero_typing_2: "Fullstack Web & Mobile",
    hero_typing_3: "Je compile mes rêves en production",
    hero_typing_4: "Tunisie → Worldwide",
    hero_typing_5: "Dart, JS, Swift, Kotlin, Go...",
    hero_desc: "J'ai conçu, développé et déployé 3 apps en production sur l'App Store et Google Play. Stack Flutter + Node.js. Je transforme des specs en produits livrés.",
    hero_stat_apps: "APPS_DEPLOYED",
    hero_stat_years: "YEARS_CODING",
    hero_stat_stack: "STACK_FAMILIARS",
    hero_stat_coffee: "COFFEE_UNITS",
    hero_cta_view: "./view_projects",
    hero_cta_contact: "./transmit_signal",
    hero_scroll: "SCROLL TO DISCOVER",

    // About
    about_title: "// 01_ABOUT",
    about_prompt1: "whoami",
    about_whoami: "mohamed_melek_chtourou",
    about_prompt2: "cat /etc/about.txt",
    about_text: "Ingénieur fullstack spécialisé Flutter & Node.js. 3 apps livrées en production dont The Landlord — plateforme immobilière avec utilisateurs réels. Je conçois des systèmes propres, je livre des produits qui marchent, et je debug jusqu'à ce que tout soit green.",
    about_prompt3: "cat /etc/location.txt",
    about_location: "Tunisie, Earth (for now)",
    about_prompt4: "cat /etc/education.txt",
    about_education: "Esprit — École d'Ingénieurs",
    about_comment: "# Toujours en train de debug — never give up",

    // Skills
    skills_title: "// 02_SKILLS_MATRIX",
    skills_subtitle: "> Modules chargés dans le réseau neuronal actif",
    skill_mobile: "MOBILE",
    skill_mobile_label: "Natif & cross-platform",
    skill_backend: "BACKEND",
    skill_backend_label: "Serveurs & APIs",
    skill_frontend: "FRONTEND",
    skill_frontend_label: "Interfaces web",
    skill_db: "DATABASE",
    skill_db_label: "Persistance de données",

    // Projects
    projects_title: "// 03_PROJECTS.DB",
    projects_subtitle: "> SELECT * FROM projects ORDER BY impact DESC;",
    badge_production: "PRODUCTION",
    badge_personal: "PERSONAL",
    badge_academic: "ACADEMIC",
    p_thelandlord_desc: "Gestion immobilière complète — multi-plateforme, utilisateurs réels, en production.",
    p_lostfound_desc: "Retrouver les objets perdus — déployée sur iOS, Android et Huawei.",
    p_tesa_desc: "Écosystème esport — brackets Challonge, classements live, stats temps réel.",
    p_randev_desc: "Prise de rendez-vous B2B — double interface clients et commerçants.",
    p_artisandart_desc: "Marketplace artisans — full-stack, 60+ endpoints, paiement intégré.",
    p_esprit_desc: "App campus iOS native — actus, annuaire profs, carte MapKit.",
    project_view: "→ ACCÉDER",

    // Contact
    contact_title: "// 04_TRANSMIT_SIGNAL",
    contact_prompt: "./transmit --target=",
    contact_hint: "// Réponse garantie en moins de 24h",
    contact_form_name: "NOM",
    contact_form_email: "EMAIL",
    contact_form_msg: "MESSAGE // Écrivez ici...",
    contact_form_send: "→ TRANSMIT",
    contact_cv: "↓ DOWNLOAD_CV.pdf",

    // Footer
    footer_text: "Compiled with",
    footer_in: "in Tunisia",

    // Bottom bar
    bottom_hint: "Appuie sur / pour ouvrir le terminal — essaie \"help\"",

    // Terminal
    term_welcome: "Bienvenue sur chtourou.sh v2.0 — tape 'help' pour les commandes",
  },

  en: {
    status_online: "NEO_CHTOUROU.EXE // SYSTEM ONLINE",
    status_uptime: "UPTIME",

    hero_badge: "AVAILABLE FOR MISSION",
    hero_name_line1: "MOHAMED",
    hero_name_line2: "CHTOUROU",
    hero_role_text: "> ",
    hero_role_kw: "FLUTTER & NODE.JS ENGINEER",
    hero_typing_prompt: "~$",
    hero_typing_1: "3 apps live on the stores",
    hero_typing_2: "Fullstack Web & Mobile",
    hero_typing_3: "I compile dreams into production",
    hero_typing_4: "Tunisia → Worldwide",
    hero_typing_5: "Dart, JS, Swift, Kotlin, Go...",
    hero_desc: "I designed, built, and shipped 3 apps to the App Store and Google Play. Flutter + Node.js stack. I turn specs into shipped products.",
    hero_stat_apps: "APPS_DEPLOYED",
    hero_stat_years: "YEARS_CODING",
    hero_stat_stack: "STACK_FAMILIARS",
    hero_stat_coffee: "COFFEE_UNITS",
    hero_cta_view: "./view_projects",
    hero_cta_contact: "./transmit_signal",
    hero_scroll: "SCROLL TO DISCOVER",

    about_title: "// 01_ABOUT",
    about_prompt1: "whoami",
    about_whoami: "mohamed_melek_chtourou",
    about_prompt2: "cat /etc/about.txt",
    about_text: "Fullstack engineer specializing in Flutter & Node.js. Shipped 3 apps to production including The Landlord — a real-estate platform with real users. I build clean systems, ship products that work, and debug until everything is green.",
    about_prompt3: "cat /etc/location.txt",
    about_location: "Tunisia, Earth (for now)",
    about_prompt4: "cat /etc/education.txt",
    about_education: "Esprit — Engineering School",
    about_comment: "# Always debugging — never give up",

    skills_title: "// 02_SKILLS_MATRIX",
    skills_subtitle: "> Modules loaded in active neural network",
    skill_mobile: "MOBILE",
    skill_mobile_label: "Native & cross-platform",
    skill_backend: "BACKEND",
    skill_backend_label: "Servers & APIs",
    skill_frontend: "FRONTEND",
    skill_frontend_label: "Web interfaces",
    skill_db: "DATABASE",
    skill_db_label: "Data persistence",

    projects_title: "// 03_PROJECTS.DB",
    projects_subtitle: "> SELECT * FROM projects ORDER BY impact DESC;",
    badge_production: "PRODUCTION",
    badge_personal: "PERSONAL",
    badge_academic: "ACADEMIC",
    p_thelandlord_desc: "Full real-estate management — multi-platform, real users, live in production.",
    p_lostfound_desc: "Find lost items — deployed on iOS, Android, and Huawei.",
    p_tesa_desc: "Esports ecosystem — Challonge brackets, live rankings, real-time stats.",
    p_randev_desc: "B2B appointment booking — dual interface for clients and merchants.",
    p_artisandart_desc: "Artisan marketplace — full-stack, 60+ endpoints, integrated payments.",
    p_esprit_desc: "Native iOS campus app — news feed, faculty directory, MapKit.",
    project_view: "→ ACCESS",

    contact_title: "// 04_TRANSMIT_SIGNAL",
    contact_prompt: "./transmit --target=",
    contact_hint: "// Reply guaranteed within 24h",
    contact_form_name: "NAME",
    contact_form_email: "EMAIL",
    contact_form_msg: "MESSAGE // Write here...",
    contact_form_send: "→ TRANSMIT",
    contact_cv: "↓ DOWNLOAD_CV.pdf",

    footer_text: "Compiled with",
    footer_in: "in Tunisia",

    bottom_hint: "Press / to open terminal — try \"help\"",

    term_welcome: "Welcome to chtourou.sh v2.0 — type 'help' for commands",
  },

  "1337": {
    status_online: "N30_CH70UR0U.3X3 // 5Y573M 0NLIN3",
    status_uptime: "UP7IM3",

    hero_badge: "4V4IL4BL3 F0R MI55I0N",
    hero_name_line1: "M0H4M3D",
    hero_name_line2: "CH70UR0U",
    hero_role_text: "> ",
    hero_role_kw: "FLU773R & N0D3.J5 3NGIN33R",
    hero_typing_prompt: "~$",
    hero_typing_1: "3 4PP5 LIV3 0N 570R35",
    hero_typing_2: "FULL574CK W3B & M0BIL3",
    hero_typing_3: "I C0MPIL3 DR34M5 IN70 PR0DUC7I0N",
    hero_typing_4: "7UNI5I4 -> W0RLDWID3",
    hero_typing_5: "D4R7, J5, 5WIF7, K07LIN, G0...",
    hero_desc: "I D35IGN3D, BUIL7, 4ND 5HIPP3D 3 4PP5 70 7H3 4PP 570R3 4ND G00GL3 PL4Y. FLU773R + N0D3.J5 574CK. I 7URN 5P3C5 IN70 5HIPP3D PR0DUC75.",
    hero_stat_apps: "4PP5_D3PL0Y3D",
    hero_stat_years: "Y34R5_C0DING",
    hero_stat_stack: "574CK_F4MILI4R5",
    hero_stat_coffee: "C0FF33_UNI75",
    hero_cta_view: "./vi3w_pr0j3c75",
    hero_cta_contact: "./7r4n5mi7",
    hero_scroll: "5CR0LL 70 DI5C0V3R",

    about_title: "// 01_4B0U7",
    about_prompt1: "wh04mi",
    about_whoami: "m0h4m3d_m3l3k_ch70ur0u",
    about_prompt2: "c47 /37c/4b0u7.7x7",
    about_text: "FULL574CK 3NGIN33R 5P3CI4LIZING IN FLU773R & N0D3.J5. 5HIPP3D 3 4PP5 70 PR0DUC7I0N INCLUDING 7H3 L4NDL0RD. I BUILD CL34N 5Y573M5 4ND D3BUG UN7IL 3V3RY7HING I5 GR33N.",
    about_prompt3: "c47 /37c/l0c47i0n.7x7",
    about_location: "7UNI5I4, 34R7H (F0R N0W)",
    about_prompt4: "c47 /37c/3duc47i0n.7x7",
    about_education: "35PRI7 — 3NGIN33RING 5CH00L",
    about_comment: "# 4LW4Y5 D3BUGGING — N3V3R GIV3 UP",

    skills_title: "// 02_5KILL5_M47RIX",
    skills_subtitle: "> M0DUL35 L04D3D IN 4C7IV3 N3UR4L N37",
    skill_mobile: "M0BIL3",
    skill_mobile_label: "N47IV3 & CR055-PL47F0RM",
    skill_backend: "B4CK3ND",
    skill_backend_label: "53RV3R5 & 4PI5",
    skill_frontend: "FR0N73ND",
    skill_frontend_label: "W3B IN73RF4C35",
    skill_db: "D474B453",
    skill_db_label: "D474 P3R5I573NC3",

    projects_title: "// 03_PR0J3C75.DB",
    projects_subtitle: "> 53L3C7 * FR0M PR0J3C75 0RD3R BY IMP4C7 D35C;",
    badge_production: "PR0DUC7I0N",
    badge_personal: "P3R50N4L",
    badge_academic: "4C4D3MIC",
    p_thelandlord_desc: "R34L 3574T3 M4N4G3M3N7 — MUL7I-PL47F0RM, R34L U53R5, LIV3.",
    p_lostfound_desc: "FIND L057 I73M5 — D3PL0Y3D 0N I05, 4NDR0ID, HU4W3I.",
    p_tesa_desc: "35P0R75 3C05Y573M — BR4CK375, LIV3 R4NKING5, R34L-7IM3 57475.",
    p_randev_desc: "B2B 4PP0IN7M3N7 B00KING — DU4L IN73RF4C3.",
    p_artisandart_desc: "4R7I54N M4RK37PL4C3 — FULL-574CK, 60+ 3NDP0IN75.",
    p_esprit_desc: "N47IV3 I05 C4MPU5 4PP — N3W5, F4CUL7Y, M4PKI7.",
    project_view: "-> 4CC355",

    contact_title: "// 04_7R4N5MI7_5IGN4L",
    contact_prompt: "./7r4n5mi7 --74rg37=",
    contact_hint: "// R3PLY GU4R4N733D WI7HIN 24H",
    contact_form_name: "N4M3",
    contact_form_email: "3M4IL",
    contact_form_msg: "M3554G3 // WRI73 H3R3...",
    contact_form_send: "→ 7R4N5MI7",
    contact_cv: "↓ D0WNL04D_CV.pdf",

    footer_text: "C0MPIL3D WI7H",
    footer_in: "IN 7UNI5I4",

    bottom_hint: "PR355 / 70 0P3N 73RMIN4L — 7RY \"H3LP\"",

    term_welcome: "W3LC0M3 70 CH70UR0U.5H V2.0 — 7YP3 'H3LP' F0R C0MM4ND5",
  },
};

const I18N_STATE = {
  current: localStorage.getItem("mmc_lang") || "fr",
};

function applyI18n(lang) {
  if (!I18N[lang]) return;
  const prev = I18N_STATE.current;
  I18N_STATE.current = lang;
  localStorage.setItem("mmc_lang", lang);
  if (prev !== lang && window.MMC_TRACK) window.MMC_TRACK.langChanged(lang);
  // Full-screen glitch effect on language switch
  if (prev !== lang) {
    const overlay = document.querySelector(".lang-glitch-overlay") || (() => {
      const el = document.createElement("div");
      el.className = "lang-glitch-overlay";
      document.body.appendChild(el);
      return el;
    })();
    overlay.classList.remove("active");
    void overlay.offsetWidth;
    overlay.classList.add("active");
    if (window.MMC_SOUND) window.MMC_SOUND.presets.glitch();
    if (window.MMC_GLITCH) window.MMC_GLITCH.vhsBar();
    setTimeout(() => overlay.classList.remove("active"), 700);
  }
  document.documentElement.lang = lang === "1337" ? "en" : lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang][key] !== undefined) {
      // Decode scramble effect on visible elements during language switch
      if (prev !== lang && window.MMC_GLITCH && el.getBoundingClientRect().top < window.innerHeight) {
        window.MMC_GLITCH.decode(el, I18N[lang][key], 500);
      } else {
        el.textContent = I18N[lang][key];
      }
    }
  });
  // Update glitch data-text attributes too
  document.querySelectorAll("[data-i18n].glitch").forEach((el) => {
    el.setAttribute("data-text", el.textContent);
  });
  // Highlight active lang button
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
  // Broadcast event
  window.dispatchEvent(new CustomEvent("lang-changed", { detail: { lang } }));
}

function t(key) {
  return (I18N[I18N_STATE.current] && I18N[I18N_STATE.current][key]) || key;
}

// Expose
window.MMC_I18N = { apply: applyI18n, state: I18N_STATE, t };
