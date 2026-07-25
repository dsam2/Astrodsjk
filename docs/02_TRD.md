# Document 02 — TRD (Technical Requirements Document)

## Technical Architecture Overview

| Component | Technical Selection & Stack |
| :--- | :--- |
| **Frontend Core** | HTML5, JavaScript (ES6+ Vanilla), CSS3 (Vanilla design tokens & responsive flexbox/grid) |
| **Calculation Engine** | Built-in mathematical Ephemeris (`js/astrology-engine.js`) using Lahiri Ayanamsa |
| **Graphics & Rendering** | SVG Vector Rendering Engine (`js/chart-renderer.js`) for North-Indian & South-Indian charts |
| **Database** | Built-in JSON offline city database (10,000+ cities map with lat/lng & timezones) + `localStorage` for user preferences |
| **Third-Party APIs** | Google Places API (optional fallback for non-database locations), Google Play Billing API (IAP) |
| **Deployment / Hosting** | Static Web Hosting / Progressive Web App (PWA) / Local Offline Bundle |

---

## Folder Structure & Conventions
```
Astrodsjk/
├── index.html                  # Main application HTML structure
├── style.css                   # Core styling system and theme tokens
├── script.js                   # UI interaction controllers & DOM events
├── js/
│   ├── astrology-engine.js     # Mathematical Ephemeris, Vargas, Dasha & Panchang engine
│   └── chart-renderer.js       # SVG Chart generator (North/South Indian styles)
├── docs/                       # Technical & product specification documents
│   ├── 01_PRD.md
│   ├── 02_TRD.md
│   ├── 03_APP_FLOW.md
│   ├── 04_UI_UX_DESIGN_BRIEF.md
│   ├── 05_BACKEND_SCHEMA.md
│   └── 06_IMPLEMENTATION_PLAN.md
└── requirements.md             # Master requirements reference
```

---

## Performance & Technical Constraints
1. **Offline-First Requirement**: All calculations must compute in-browser without network requests.
2. **Zero External Runtime Dependencies**: No heavy external frameworks (React/Vue/jQuery) required for core calculation execution.
3. **Print / PDF Optimization**: Standard CSS `@media print` rules for clean single-page and multi-page horoscope printing.
