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
    hero_desc: "Ingénieur spécialisé Flutter & Node.js avec une solide expérience fullstack. Je conçois et déploie des applications mobiles et web performantes — de l'idée jusqu'à l'App Store.",
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
    about_text: "Ingénieur spécialisé Flutter & Node.js avec une solide expérience fullstack web. J'ai conçu et publié 3 applications sur l'App Store et Google Play, dont The Landlord — une plateforme de gestion immobilière en production. Je cherche à rejoindre une équipe ambitieuse où je pourrai contribuer à des produits mobiles et web impactants.",
    about_prompt3: "cat /etc/location.txt",
    about_location: "Tunisie, Earth (for now)",
    about_prompt4: "cat /etc/education.txt",
    about_education: "Esprit — École d'Ingénieurs",
    about_comment: "# Toujours debug — never give up",

    // Skills
    skills_title: "// 02_SKILLS_MATRIX",
    skills_subtitle: "> Loaded modules in current neural net",
    skill_mobile: "MOBILE",
    skill_mobile_label: "Native & Cross-platform",
    skill_backend: "BACKEND",
    skill_backend_label: "Servers & APIs",
    skill_frontend: "FRONTEND",
    skill_frontend_label: "Web interfaces",
    skill_db: "DATABASE",
    skill_db_label: "Data persistence",

    // Projects
    projects_title: "// 03_PROJECTS.DB",
    projects_subtitle: "> SELECT * FROM projects ORDER BY impact DESC;",
    badge_production: "PRODUCTION",
    badge_personal: "PERSONAL",
    badge_academic: "ACADEMIC",
    p_thelandlord_desc: "Plateforme complète de gestion immobilière — multi-plateforme, déployée en production.",
    p_lostfound_desc: "App multi-plateforme pour retrouver les objets perdus. iOS, Android, Huawei.",
    p_tesa_desc: "Écosystème esport centralisé — brackets Challonge, classements temps réel.",
    p_randev_desc: "Gestion de rendez-vous B2B avec deux rôles — clients et commerçants.",
    p_artisandart_desc: "Marketplace full-stack connectant artisans et consommateurs — 60+ endpoints.",
    p_esprit_desc: "App campus iOS native — actualités, enseignants, carte MapKit.",
    project_view: "→ ACCÉDER",

    // Contact
    contact_title: "// 04_TRANSMIT_SIGNAL",
    contact_prompt: "./transmit --target=",
    contact_hint: "// Réponse garantie en moins de 24h",

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
    hero_desc: "Flutter & Node.js specialist with a solid fullstack background. I design and ship mobile and web apps — from raw idea to App Store release.",
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
    about_text: "Flutter & Node.js specialist with a solid fullstack web background. I designed and shipped 3 apps on the App Store and Google Play, including The Landlord — a live real-estate platform. I'm looking to join an ambitious team where I can contribute to impactful mobile and web products.",
    about_prompt3: "cat /etc/location.txt",
    about_location: "Tunisia, Earth (for now)",
    about_prompt4: "cat /etc/education.txt",
    about_education: "Esprit — Engineering School",
    about_comment: "# Always debugging — never give up",

    skills_title: "// 02_SKILLS_MATRIX",
    skills_subtitle: "> Loaded modules in current neural net",
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
    p_thelandlord_desc: "Full real estate management platform — multi-platform, live in production.",
    p_lostfound_desc: "Cross-platform app to find lost items. iOS, Android, Huawei.",
    p_tesa_desc: "Centralized esports ecosystem — Challonge brackets, real-time rankings.",
    p_randev_desc: "B2B appointment management with two roles — clients and merchants.",
    p_artisandart_desc: "Full-stack marketplace bridging artisans and customers — 60+ endpoints.",
    p_esprit_desc: "Native iOS campus app — news, teachers, MapKit integration.",
    project_view: "→ ACCESS",

    contact_title: "// 04_TRANSMIT_SIGNAL",
    contact_prompt: "./transmit --target=",
    contact_hint: "// Reply guaranteed within 24h",

    footer_text: "Compiled with",
    footer_in: "in Tunisia",

    bottom_hint: "Press / to open terminal — try \"help\"",

    term_welcome: "Welcome to chtourou.sh v2.0 — type 'help' for commands",
  },

  "1337": {
    status_online: "N30_CHT0UR0U.3X3 // 5Y5T3M 0NL1N3",
    status_uptime: "UPT1M3",

    hero_badge: "4V41L4BL3 F0R M1551ON",
    hero_name_line1: "M0H4M3D",
    hero_name_line2: "CHT0UR0U",
    hero_role_text: "> ",
    hero_role_kw: "FLUTT3R & N0D3.J5 3NG1N33R",
    hero_typing_prompt: "~$",
    hero_typing_1: "3 4PP5 L1V3 0N 5T0R35",
    hero_typing_2: "FULL5T4CK W3B & M0B1L3",
    hero_typing_3: "1 C0MP1L3 DR34M5 1NT0 PR0DUCT10N",
    hero_typing_4: "TUN1514 -> W0RLDW1D3",
    hero_typing_5: "D4RT, J5, 5W1FT, K0TL1N...",
    hero_desc: "FLUTT3R & N0D3.J5 5P3C14L15T W1TH F4T FULL5T4CK B4CKGR0UND. 1 D351GN 4ND 5H1P M0B1L3 4ND W3B 4PP5 FR0M R4W 1D34 T0 4PP 5T0R3 R3L3453.",
    hero_stat_apps: "4PP5_D3PL0Y3D",
    hero_stat_years: "Y34R5_C0D1NG",
    hero_stat_stack: "5T4CK_F4M1L14R5",
    hero_stat_coffee: "C0FF33_UN1T5",
    hero_cta_view: "./v13w_pr0j3ct5",
    hero_cta_contact: "./tr4n5m1t",
    hero_scroll: "5CR0LL T0 D15C0V3R",

    about_title: "// 01_4B0UT",
    about_prompt1: "wh04m1",
    about_whoami: "m0h4m3d_m3l3k_cht0ur0u",
    about_prompt2: "c4t /3tc/4b0ut.txt",
    about_text: "FLUTT3R & N0D3.J5 5P3C14L15T W1TH 50L1D FULL5T4CK W3B 3XP3R13NC3. 1 D351GN3D 4ND 5H1PP3D 3 4PP5 0N TH3 4PP 5T0R3 4ND G00GL3 PL4Y, 1NCLUD1NG TH3 L4NDL0RD - 4 L1V3 R34L-35T4T3 PL4TF0RM.",
    about_prompt3: "c4t /3tc/l0c4t10n.txt",
    about_location: "TUN1514, 34RTH (F0R N0W)",
    about_prompt4: "c4t /3tc/3duc4t10n.txt",
    about_education: "35PR1T - 3NG1N33R1NG 5CH00L",
    about_comment: "# 4LW4Y5 D3BUGG1NG - N3V3R G1V3 UP",

    skills_title: "// 02_5K1LL5_M4TR1X",
    skills_subtitle: "> L04D3D M0DUL35 1N CURR3NT N3UR4L N3T",
    skill_mobile: "M0B1L3",
    skill_mobile_label: "N4T1V3 & CR055-PL4TF0RM",
    skill_backend: "B4CK3ND",
    skill_backend_label: "53RV3R5 & 4P15",
    skill_frontend: "FR0NT3ND",
    skill_frontend_label: "W3B 1NT3RF4C35",
    skill_db: "D4T4B453",
    skill_db_label: "D4T4 P3R5151T3NC3",

    projects_title: "// 03_PR0J3CT5.DB",
    projects_subtitle: "> 53L3CT * FR0M PR0J3CT5 0RD3R BY 1MP4CT D35C;",
    badge_production: "PR0DUCT10N",
    badge_personal: "P3R50N4L",
    badge_academic: "4C4D3M1C",
    p_thelandlord_desc: "R34L 35T4T3 M4N4G3M3NT PL4TF0RM - MULT1-PL4TF0RM, L1V3.",
    p_lostfound_desc: "CR055-PL4TF0RM 4PP T0 F1ND L05T 1T3M5. 105, 4NDR01D, HU4W31.",
    p_tesa_desc: "C3NTR4L1Z3D 35P0RT5 3C05Y5T3M - CH4LL0NG3 BR4CK3T5.",
    p_randev_desc: "B2B 4PP01NTM3NT M4N4G3M3NT - CL13NT5 & M3RCH4NT5.",
    p_artisandart_desc: "FULL-5T4CK M4RK3TPL4C3 BR1DG1NG 4RT154N5 - 60+ 3NDP01NT5.",
    p_esprit_desc: "N4T1V3 105 C4MPU5 4PP - N3W5, T34CH3R5, M4P1T.",
    project_view: "-> 4CC355",

    contact_title: "// 04_TR4N5M1T_51GN4L",
    contact_prompt: "./tr4n5m1t --t4rg3t=",
    contact_hint: "// R3PLY GU4R4NT33D W1TH1N 24H",

    footer_text: "C0MP1L3D W1TH",
    footer_in: "1N TUN1514",

    bottom_hint: "PR355 / T0 0P3N T3RM1N4L - TRY \"H3LP\"",

    term_welcome: "W3LC0M3 T0 CHT0UR0U.5H V2.0 - TYP3 'H3LP' F0R C0MM4ND5",
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
  document.documentElement.lang = lang === "1337" ? "en" : lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang][key] !== undefined) {
      el.textContent = I18N[lang][key];
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
