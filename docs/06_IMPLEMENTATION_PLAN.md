# Document 06 — Implementation Plan & Build Sequence

## Step-by-Step Execution Sequence

### Phase 1: Foundation & Project Structure (Completed)
- [x] Extract and organize source files into clean directory hierarchy (`css/`, `js/`, `docs/`).
- [x] Build core HTML5 layout with semantically structured sections (`#home`, `#kundali`, `#charts`, `#planets`, `#predictions`, `#panchang`, `#compatibility`).

### Phase 2: Design System & Styling (Completed)
- [x] Create comprehensive CSS design system with CSS tokens (`style.css`).
- [x] Implement theme toggles (Dark/Light mode) and No-AI Editorial Handcrafted theme (`css/editorial-style.css`) with 1-click Kill Switch.

### Phase 3: Mathematical Ephemeris Engine (Completed)
- [x] Implement offline Julian Day & Lahiri Ayanamsa calculation engine (`js/astrology-engine.js`).
- [x] Compute planetary longitudes for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu & Ascendant.
- [x] Implement Shodasha Varga divisional charts (D1 Rashi, D2 Hora, D3 Drekkana, D7 Saptamsha, D9 Navamsha, D10 Dashamsha).
- [x] Build Vimshottari Dasha timeline calculation engine.
- [x] Build Daily Panchang engine (Tithi, Vara, Nakshatra, Yoga, Karana).
- [x] Implement Ashta Kuta (36 Guna) Kundali Matching engine.
- [x] Include built-in 10,000+ city latitude/longitude database.

### Phase 4: Dynamic Vector SVG Chart Renderer (Completed)
- [x] Build SVG North-Indian (Diamond) and South-Indian (Box) chart generators (`js/chart-renderer.js`).

### Phase 5: UI Controller Integration & PDF Export (Completed)
- [x] Wire birth details form input to mathematical engine (`script.js`).
- [x] Dynamically update planetary cards, Dasha timeline, Panchang grid, and SVG charts upon form submission.
- [x] Enable `@media print` / browser PDF horoscope report printing.
