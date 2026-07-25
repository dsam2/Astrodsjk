# Document 01 — PRD (Product Requirements Document)

## App Overview
- **App Name**: AstroDSJK
- **Tagline**: Discover Your Cosmic Blueprint — Precision Offline Vedic Horoscope & Ephemeris Engine.
- **Problem**: Most astrology websites require continuous internet access, send personal birth data to third-party web servers, or provide generic non-astronomical interpretations.
- **Target User**: Modern individuals, astrology enthusiasts, and Vedic practitioners seeking accurate, instant, private, offline birth charts, planetary positions, Vimshottari dasha timelines, and Panchang calculations.

---

## Core Features (Must-Have)

1. **Offline Birth Chart Generation (Kundali)**
   - Sidereal calculations using the Lahiri Ayanamsa.
   - Support for North-Indian (Diamond), South-Indian (Box), and East-Indian chart styles.
   - Calculation of Shodasha Vargas (D1 Rashi, D2 Hora, D3 Drekkana, D7 Saptamsha, D9 Navamsha, D10 Dashamsha, up to D60).

2. **Planetary Positions & Details**
   - Precise longitudes (degree, minute, second) for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.
   - Nakshatra, Pada, Rashi, and Avastha determinations.

3. **Vimshottari Dasha Engine**
   - Chronological breakdown of Mahadasha, Antardasha, and Pratyantardasha based on Moon's birth Nakshatra.

4. **Daily Panchang & Muhurta**
   - Five-fold auspicious elements: Tithi, Vara, Nakshatra, Yoga, Karana.
   - Rahu Kalam, Choghadiya, and Hora timing indicators.

5. **Kundali Matching (Ashta Kuta Gun Milan)**
   - 36-guna scoring system evaluating Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, and Nadi with Manglik Dosha analysis.

6. **Export & Print**
   - Printable PDF horoscope report generation.

---

## Out of Scope (v1)
- User registration / mandatory account login (keeping app 100% private and offline-first).
- Cloud data syncing or server database storage of birth charts.

---

## User Stories
- *As a native*, I want to enter my birth date, time, and city so that I can generate an authentic Vedic horoscope instantly without sending my data online.
- *As an astrologer*, I want to view divisional charts (D9 Navamsha, D10 Dashamsha) so that I can analyze career and marriage karma precisely.
- *As a user*, I want to check daily Panchang and Rahu Kalam so that I can pick auspicious times for new projects.

---

## Success Metrics
- 100% offline calculation capability without external API dependencies.
- Sub-second birth chart rendering speed.
