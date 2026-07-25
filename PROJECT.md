# AstroDSJK — Master Project Scope & Architecture

## Architecture
AstroDSJK is an autonomous, offline-first Vedic Astrology Web Application with zero runtime external dependencies.
- **Frontend Stack**: Pure Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Core Calculation Engine** (`js/astrology-engine.js`): High-precision astronomical ephemeris, Lahiri Ayanamsa, Shodasha Vargas (D1-D60), Vimshottari Dasha timeline, Panchang engine, Ashta Kuta Gun Milan & Manglik Dosha.
- **SVG Chart Renderer** (`js/chart-renderer.js`): Dynamic vector rendering for North-Indian (Diamond), South-Indian (Box), and East-Indian (Square) Kundali charts.
- **UI Controller** (`script.js` & `index.html`): Responsive web interface, dark/light theme, input form, calculation wiring, printable PDF reports.
- **Verification Harness**: Automated Node test scripts (`tests/`) verifying ephemeris accuracy against standard benchmarks (<0.05°), SVG layout integrity, performance (<50ms), and 36-point Gun Milan matching.

## Code Layout
```
x:\Techora\Astrodsjk\
├── index.html                 # Main web application entry point
├── style.css                  # CSS styling system & @media print rules
├── script.js                  # UI controller & DOM event handling
├── js/
│   ├── astrology-engine.js    # Astronomical ephemeris, Vargas, Dasha, Panchang, Gun Milan
│   └── chart-renderer.js      # SVG Chart Renderer (North/South/East Indian)
├── tests/                     # Automated unit & E2E verification test suite
│   ├── ephemeris.test.js      # Benchmark tests for 0.05° planetary accuracy
│   ├── chart.test.js          # SVG chart layout & rendering integrity tests
│   ├── panchang_dasha.test.js # Panchang & Vimshottari Dasha sub-period tests
│   ├── gunmilan.test.js       # Ashta Kuta 36-point & Manglik tests
│   └── e2e_runner.js          # Master E2E runner for Tiers 1-4 & Tier 5
├── PROJECT.md                 # Master project index
└── TEST_INFRA.md              # E2E test infrastructure specification
```

## Milestones

| # | Milestone Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Ephemeris & Astronomical Engine | Implement Meeus/Keplerian periodic series for 0.05° accuracy (Sun, Moon, planets), Lahiri Ayanamsa, Rahu/Ketu sidereal fix, full D1-D60 Shodasha Vargas, retrograde/speed/combustion | None | DONE |
| M2 | Dynamic Vector SVG Chart Renderer | Multi-planet line wrapping/tspan, fix East Indian diagonal text overlap, South Indian Lagna styling, responsive non-overlapping layout across North, South, and East Indian charts | M1 | DONE |
| M3 | Panchang & Vimshottari Dasha Engine | Authentic 60 half-tithi Karana map, sunrise Vara, Tithi Amavasya/Purnima fix; 3-tier Dasha hierarchy (Mahadasha, Antardasha, Pratyantardasha) with millisecond date math (<50ms execution) | M1 | DONE |
| M4 | Ashta Kuta Gun Milan & Manglik Engine | Classical Parashari tables (Varna, Vashya matrix, Yoni 14x14 matrix, Graha Maitri friendship matrix, Gana, Nadi); complete Manglik Dosha engine with Bhanga rules | M1 | DONE |
| M5 | PDF Report Export & UI Integration | Comprehensive `@media print` CSS stylesheet, printable multi-page report template, UI form & card integration | M2, M3, M4 | DONE |
| M6 | Final Milestone: E2E Test Suite & Hardening | Pass 100% E2E tests (Tiers 1-4) published in TEST_READY.md, followed by Tier 5 Adversarial Coverage Hardening | M1-M5 | DONE |

## Interface Contracts

### `AstroEngine` (`js/astrology-engine.js`)
- `julianDay(year, month, day, hour, minute, second, tzOffset)` -> `number`
- `getLahiriAyanamsa(JD)` -> `number`
- `calculatePlanets(JD)` -> `{ Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu, Lagna, ayanamsa }` (each with `longitude`, `sign`, `degreeInSign`, `isRetrograde`, `speed`)
- `calculateVargas(planets)` -> `{ D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60 }`
- `calculatePanchang(sunLon, moonLon, JD, tzOffset)` -> `{ tithi, paksha, vara, nakshatra, yoga, karana, executionTimeMs }`
- `calculateVimshottari(moonLon, birthDate)` -> `Array<{ lord, startDate, endDate, years, antardashas: Array<{ lord, startDate, endDate, pratyantardashas }> }>`
- `calculateGunMilan(boyMoonLon, girlMoonLon, boyNak, girlNak)` -> `{ totalScore, breakdown: { varna, vashya, tara, yoni, maitri, gana, bhakoot, nadi }, boyManglik, girlManglik, manglikMatch }`

### `ChartRenderer` (`js/chart-renderer.js`)
- `renderNorthIndianSVG(planets, lagnaRashi)` -> `SVGString`
- `renderSouthIndianSVG(planets, lagnaRashi)` -> `SVGString`
- `renderEastIndianSVG(planets, lagnaRashi)` -> `SVGString`
