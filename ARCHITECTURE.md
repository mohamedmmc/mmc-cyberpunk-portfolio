# Architecture — NEO_CHTOUROU.EXE v2.0

## Tech Stack
- **HTML5** — Semantic markup, multi-page structure
- **CSS3** — Custom properties for theming, flexbox/grid, clip-path for shapes
- **Vanilla JavaScript** — No framework, no build step
- **Canvas API** — Matrix rain background effect
- **Web Audio API** — Synthesized 8-bit sound effects
- **IntersectionObserver** — Scroll reveal animations
- **localStorage/sessionStorage** — Theme, language, achievements, boot gating

## File Structure
```
mmc potfolio 2/
├── index.html              # Main landing page
├── 404.html                # SIGNAL_LOST error page
├── CLAUDE.md               # (not yet) - project agent instructions
├── STATUS.md               # Living status tracker
├── ARCHITECTURE.md         # This file
├── errors.md               # Error log
├── css/
│   ├── main.css            # Base styles, layout, typography, theme vars
│   ├── cyberpunk.css       # Neon, HUD, scanlines, glitch, terminal, project hero
│   └── animations.css      # Keyframes + reveal utilities
├── js/
│   ├── i18n.js             # Trilingual engine (FR / EN / 1337)
│   ├── sound.js            # Web Audio API synthesized SFX
│   ├── matrix-rain.js      # Canvas matrix rain with hidden message
│   ├── glitch.js           # Text glitch, typewriter, decoder, VHS bar
│   ├── boot.js             # Initial boot sequence animation
│   ├── terminal.js         # Interactive terminal with 25+ commands
│   ├── easter-eggs.js      # Konami, achievements, hidden triggers
│   └── main.js             # Orchestrator, scroll reveal, cursor, uptime
├── projects/
│   ├── thelandlord.html    # #001 Production — Real estate platform
│   ├── lost-found.html     # #002 Production — Lost items multi-OS
│   ├── tesa.html           # #003 Personal  — Esports ecosystem
│   ├── randev.html         # #004 Academic  — B2B appointments
│   ├── artisan-dart.html   # #005 Academic  — Artisan marketplace
│   └── esprit-app.html     # #006 Academic  — Campus iOS app
└── assets/
    └── img/
        ├── mmc2.jpg
        ├── iphone-mockup.png
        ├── macbook-mockup.png
        ├── favicon.png
        └── portfolio/      # Per-project image folders
```

## Key Architectural Decisions

### 1. No build step
Pure static site. Can be served from any CDN or static host. Zero dependencies beyond Google Fonts CDN. Load time < 500ms.

### 2. Theme system via CSS variables
`data-theme` attribute on `<html>` switches between `cyan` (default), `magenta`, `matrix`, `danger`. All colors, shadows, and glows reference CSS custom properties. Theme persists in localStorage.

### 3. i18n engine
Zero dependencies. Single `I18N` object with nested keys per language. Elements with `data-i18n="key"` are auto-updated. Language persists in localStorage. Events broadcast on language change so typing loops can refresh.

### 4. Matrix rain as background layer
Canvas drawn at z-index 1, opacity 0.18. Script draws random katakana + code symbols falling in columns. Every ~25s a "hidden message" column reveals `YOU_FOUND_ME_` in magenta. Respects `prefers-reduced-motion`.

### 5. Terminal as an Easter Egg AND a navigation tool
Press `/` or `~` or `` ` `` to open. 25+ commands including `open <project>` to navigate, `theme`, `lang`, `sound`, `matrix`, `hack`, `cowsay`, `neofetch`, etc. Accessible from any page.

### 6. Achievements via localStorage
`MMC_ACHIEVEMENTS.unlock(id, msg)` — idempotent, shows toast on first unlock. List via `MMC_ACHIEVEMENTS.list()`.

### 7. Boot sequence gated per session
`sessionStorage.mmc_booted === "1"` skips boot on in-session navigation between pages. Only fires once per fresh session.

### 8. Custom cursor only on desktop
Cursor disabled via `@media (max-width: 900px)` — mobile uses native touch.

## Data Flow
```
User loads page
  ↓
boot.js runs (if first visit this session)
  ↓
i18n.apply(savedLang) — translates all [data-i18n]
  ↓
Theme restored from localStorage
  ↓
main.js initializes modules in order:
  MMC_SOUND.init → MMC_MATRIX.start → MMC_GLITCH.init → MMC_TERM.init → MMC_EASTER.init
  ↓
IntersectionObserver watches .reveal elements for scroll reveal
  ↓
User interacts → events flow to the appropriate module
```

## Easter Egg Triggers
| Trigger                       | Effect                                  |
|-------------------------------|-----------------------------------------|
| Konami code                   | Matrix takeover overlay                 |
| Press `/` `~` `` ` ``         | Open interactive terminal               |
| Type `mohamed` anywhere       | Hue-rotate animation + achievement      |
| Type `neo` / `hackerman`      | Glitch / Matrix mode                    |
| Type `geek` / `tunisia`       | Achievement unlock                      |
| 5x click on hero badge        | Cycle theme                             |
| Right-click                   | `NOSY` achievement                      |
| Idle 45s                      | Hint toast                              |
| Open DevTools console         | ASCII art + `DEV_INSPECTOR` achievement |
| Terminal `cat .hidden_lore.md`| `LORE_KEEPER` achievement               |
| Terminal `hack`               | Fake hacking animation + achievement    |
| Visit 404                     | `LOST_IN_404` achievement               |

## Performance Budget
- HTML: < 25 KB per page
- CSS total: ~40 KB (3 files)
- JS total: ~35 KB (8 files)
- No images lazy-load blocking
- Fonts: Google Fonts with `display=swap`
