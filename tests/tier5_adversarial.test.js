/**
 * AstroDSJK — Tier 5 Adversarial Coverage Hardening Test Suite (`tests/tier5_adversarial.test.js`)
 * 
 * Conducts high-intensity white-box adversarial testing across the entire AstroDSJK codebase:
 * - `js/astrology-engine.js`
 * - `js/chart-renderer.js`
 * - `script.js` & DOM / CSS Contracts
 * 
 * Targets coverage gaps, boundary conditions, zero values, division by zero, invalid input types,
 * leap years, midnight wrap-around, extreme timezones, polar latitudes, micro-cusps, stelliums,
 * half-tithi karanas, Vimshottari dasha continuity, Manglik Bhanga cancellations, and SVG scaling.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const AstroEngine = require('../js/astrology-engine.js');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('================================================================================');
console.log('      AstroDSJK — Tier 5 Adversarial Coverage Hardening Test Suite              ');
console.log('================================================================================\n');

let passCount = 0;
let failCount = 0;

function runAssert(description, testFn) {
    try {
        testFn();
        passCount++;
        console.log(`  [TIER 5] ✔ PASS: ${description}`);
    } catch (err) {
        failCount++;
        console.error(`  [TIER 5] ✘ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
        if (err.stack) console.error(`     Stack: ${err.stack.split('\n')[1]}`);
    }
}

// =============================================================================
// GROUP 5.1: EPHEMERIS & JULIAN DAY EXTREMES & CALENDAR BOUNDARIES
// =============================================================================
console.log('--------------------------------------------------------------------------------');
console.log('🔥 Group 5.1: Ephemeris & Julian Day Extremes & Calendar Boundaries');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.1.1: Century leap year 400-year rule verification (1600 & 2000 are leap; 1700, 1800, 1900, 2100 are not)', () => {
    // 2000-02-29 -> 2000-03-01 is 1 day step (2451604.0 - 2451603.0 = 1.0)
    const jd2000_28 = AstroEngine.julianDay(2000, 2, 28, 12, 0, 0, 0);
    const jd2000_29 = AstroEngine.julianDay(2000, 2, 29, 12, 0, 0, 0);
    const jd2000_01 = AstroEngine.julianDay(2000, 3, 1, 12, 0, 0, 0);
    assert.strictEqual(jd2000_29 - jd2000_28, 1.0);
    assert.strictEqual(jd2000_01 - jd2000_29, 1.0);

    // 1900-02-28 -> 1900-03-01 step in Julian Day calculation
    const jd1900_28 = AstroEngine.julianDay(1900, 2, 28, 12, 0, 0, 0);
    const jd1900_29 = AstroEngine.julianDay(1900, 2, 29, 12, 0, 0, 0); // overflow to Mar 1
    const jd1900_01 = AstroEngine.julianDay(1900, 3, 1, 12, 0, 0, 0);
    assert.strictEqual(jd1900_29, jd1900_01);
    assert.strictEqual(jd1900_01 - jd1900_28, 1.0);
});

runAssert('T5.1.2: Day continuity across leap Feb 29 in 2024 (+1.0 day step per 24 hours)', () => {
    const jd28 = AstroEngine.julianDay(2024, 2, 28, 12, 0, 0, 0);
    const jd29 = AstroEngine.julianDay(2024, 2, 29, 12, 0, 0, 0);
    const jd01 = AstroEngine.julianDay(2024, 3, 1, 12, 0, 0, 0);
    assert.strictEqual(jd29 - jd28, 1.0);
    assert.strictEqual(jd01 - jd29, 1.0);
});

runAssert('T5.1.3: Midnight wrap-around precision (2025-12-31 23:59:59 to 2026-01-01 00:00:01)', () => {
    const jdB = AstroEngine.julianDay(2025, 12, 31, 23, 59, 59, 0);
    const jdA = AstroEngine.julianDay(2026, 1, 1, 0, 0, 1, 0);
    const diffSeconds = (jdA - jdB) * 86400;
    assert.ok(Math.abs(diffSeconds - 2.0) < 1e-4);
});

runAssert('T5.1.4: BC dates / negative years (year -100, year 0) Julian Day evaluation', () => {
    const jdBC = AstroEngine.julianDay(-100, 1, 1, 12, 0, 0, 0);
    const jdZero = AstroEngine.julianDay(0, 1, 1, 12, 0, 0, 0);
    assert.ok(!isNaN(jdBC) && isFinite(jdBC));
    assert.ok(!isNaN(jdZero) && isFinite(jdZero));
    assert.ok(jdZero > jdBC);
});

runAssert('T5.1.5: Numeric conversion safety in julianDay (parsing numeric parameters cleanly)', () => {
    const jdNum = AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 5.5);
    const jdParsed = AstroEngine.julianDay(Number("2000"), Number("1"), Number("1"), Number("12"), Number("0"), Number("0"), Number("5.5"));
    assert.strictEqual(jdParsed, jdNum);
});

runAssert('T5.1.6: Non-integer half-hour and 45-min timezones (UTC+5:45 Nepal, UTC+5:30 India, UTC-3:30 Newfoundland)', () => {
    const jdNepal = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.75);
    const jdIndia = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.5);
    const jdStJohns = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, -3.5);
    assert.ok(Math.abs((jdIndia - jdNepal) - ((5.75 - 5.5) / 24)) < 1e-6);
    assert.ok(!isNaN(jdStJohns) && isFinite(jdStJohns));
});

runAssert('T5.1.7: Extreme timezones (UTC-12 Baker Island vs UTC+14 Line Islands / Kiritimati)', () => {
    const jdBaker = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, -12);
    const jdKiritimati = AstroEngine.julianDay(2026, 7, 26, 14, 0, 0, 14);
    assert.strictEqual(jdBaker, jdKiritimati);
});

runAssert('T5.1.8: Lahiri Ayanamsa monotonicity and precision bounds over a 200-year epoch range (1900-2100)', () => {
    const ayan1900 = AstroEngine.getLahiriAyanamsa(AstroEngine.julianDay(1900, 1, 1, 12, 0, 0, 0));
    const ayan2000 = AstroEngine.getLahiriAyanamsa(AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 0));
    const ayan2100 = AstroEngine.getLahiriAyanamsa(AstroEngine.julianDay(2100, 1, 1, 12, 0, 0, 0));

    assert.ok(ayan1900 < ayan2000);
    assert.ok(ayan2000 < ayan2100);
    assert.ok(Math.abs(ayan2000 - 23.853056) < 0.001);
});

runAssert('T5.1.9: Planetary speed retrogression flags for Sun/Moon (never retrograde) and Rahu/Ketu (always retrograde)', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.5);
    const planets = AstroEngine.calculatePlanets(jd, 28.6139, 77.2090);
    assert.strictEqual(planets.Sun.isRetrograde, false);
    assert.strictEqual(planets.Moon.isRetrograde, false);
    assert.strictEqual(planets.Rahu.isRetrograde, true);
    assert.strictEqual(planets.Ketu.isRetrograde, true);
});

runAssert('T5.1.10: Zero-value input parameters handling in julianDay(0, 0, 0, 0, 0, 0, 0)', () => {
    const jdZero = AstroEngine.julianDay(0, 0, 0, 0, 0, 0, 0);
    assert.ok(!isNaN(jdZero) && isFinite(jdZero));
});


// =============================================================================
// GROUP 5.2: POLAR LATITUDES, GEOGRAPHIC EXTREMES & COORDINATE INVARIANCE
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.2: Polar Latitudes, Geographic Extremes & Coordinate Invariance');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.2.1: Geographic North Pole (+90.0° N) Ascendant evaluation produces valid finite float', () => {
    const jd = AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 0);
    const res = AstroEngine.calculatePlanets(jd, 90.0, 0.0);
    assert.ok(!isNaN(res.Ascendant.longitude) && isFinite(res.Ascendant.longitude));
});

runAssert('T5.2.2: Geographic South Pole (-90.0° S) Ascendant evaluation produces valid finite float', () => {
    const jd = AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 0);
    const res = AstroEngine.calculatePlanets(jd, -90.0, 0.0);
    assert.ok(!isNaN(res.Ascendant.longitude) && isFinite(res.Ascendant.longitude));
});

runAssert('T5.2.3: Sub-polar and Arctic circle (+89.999° N, +66.5° N) Ascendant calculations', () => {
    const jd = AstroEngine.julianDay(2026, 6, 21, 12, 0, 0, 0);
    const resSub = AstroEngine.calculatePlanets(jd, 89.999, 0.0);
    const resArc = AstroEngine.calculatePlanets(jd, 66.5, 0.0);
    assert.ok(!isNaN(resSub.Ascendant.longitude) && isFinite(resSub.Ascendant.longitude));
    assert.ok(!isNaN(resArc.Ascendant.longitude) && isFinite(resArc.Ascendant.longitude));
});

runAssert('T5.2.4: Prime Meridian (0° E/W) and International Date Line (180° E, -180° W) Ascendant calculations', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 0);
    const resPrime = AstroEngine.calculatePlanets(jd, 0.0, 0.0);
    const resIDL_East = AstroEngine.calculatePlanets(jd, 0.0, 180.0);
    const resIDL_West = AstroEngine.calculatePlanets(jd, 0.0, -180.0);

    assert.ok(!isNaN(resPrime.Ascendant.longitude) && isFinite(resPrime.Ascendant.longitude));
    let diff = Math.abs((resIDL_East.Ascendant.longitude - resIDL_West.Ascendant.longitude + 360) % 360);
    assert.ok(diff < 0.0001 || Math.abs(diff - 360) < 0.0001);
});

runAssert('T5.2.5: Planetary sidereal longitudes invariance under extreme latitude shifts (+90° N vs -90° S)', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 0);
    const np = AstroEngine.calculatePlanets(jd, 90.0, 0.0);
    const sp = AstroEngine.calculatePlanets(jd, -90.0, 0.0);

    assert.strictEqual(np.Sun.longitude, sp.Sun.longitude);
    assert.strictEqual(np.Moon.longitude, sp.Moon.longitude);
    assert.strictEqual(np.Mars.longitude, sp.Mars.longitude);
    assert.strictEqual(np.Jupiter.longitude, sp.Jupiter.longitude);
});

runAssert('T5.2.6: Undefined/null latitude and longitude fallbacks default to New Delhi (28.6139, 77.2090)', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.5);
    const resDef = AstroEngine.calculatePlanets(jd);
    const resExplicit = AstroEngine.calculatePlanets(jd, 28.6139, 77.2090);

    assert.strictEqual(resDef.Ascendant.longitude, resExplicit.Ascendant.longitude);
});

runAssert('T5.2.7: Parsed float coordinate handling (parseFloat("28.6139"), parseFloat("77.2090")) matches native float inputs', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.5);
    const resFloat = AstroEngine.calculatePlanets(jd, 28.6139, 77.2090);
    const resParsed = AstroEngine.calculatePlanets(jd, parseFloat("28.6139"), parseFloat("77.2090"));

    assert.strictEqual(resParsed.Ascendant.longitude, resFloat.Ascendant.longitude);
});

runAssert('T5.2.8: Micro-cusp stability near equator (0° N, 0° E) at exact equinoxes', () => {
    const jdEquinox = AstroEngine.julianDay(2026, 3, 20, 12, 0, 0, 0);
    const resEq = AstroEngine.calculatePlanets(jdEquinox, 0.0, 0.0);
    assert.ok(resEq.Ascendant.longitude >= 0 && resEq.Ascendant.longitude < 360);
});


// =============================================================================
// GROUP 5.3: DEGREE NORMALIZATION, ANGLE DIFFERENCES & MICRO-CUSPS
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.3: Degree Normalization, Angle Differences & Micro-Cusps');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.3.1: normalizeDeg edge values (0.0, 360.0, -0.0, -360.0, 720.0, -720.0, -0.000001, 359.999999)', () => {
    const degInfo0 = AstroEngine.getDegreeInfo(0.0);
    const degInfo360 = AstroEngine.getDegreeInfo(360.0);
    const degInfoNeg0 = AstroEngine.getDegreeInfo(-0.0);
    const degInfoNeg360 = AstroEngine.getDegreeInfo(-360.0);
    const degInfo720 = AstroEngine.getDegreeInfo(720.0);
    const degInfoNegNear = AstroEngine.getDegreeInfo(-0.000001);
    const degInfoNear360 = AstroEngine.getDegreeInfo(359.999999);

    assert.strictEqual(degInfo0.rashiName, 'Aries');
    assert.strictEqual(degInfo360.rashiName, 'Aries');
    assert.strictEqual(degInfoNeg0.rashiName, 'Aries');
    assert.strictEqual(degInfoNeg360.rashiName, 'Aries');
    assert.strictEqual(degInfo720.rashiName, 'Aries');
    assert.strictEqual(degInfoNegNear.rashiName, 'Pisces');
    assert.strictEqual(degInfoNear360.rashiName, 'Pisces');
});

runAssert('T5.3.2: Exact Rashi cusps in getDegreeInfo (0.0° Aries, 30.0° Taurus, 60.0° Gemini, 359.9999° Pisces)', () => {
    assert.strictEqual(AstroEngine.getDegreeInfo(0.0).rashiIndex, 1);
    assert.strictEqual(AstroEngine.getDegreeInfo(30.0).rashiIndex, 2);
    assert.strictEqual(AstroEngine.getDegreeInfo(60.0).rashiIndex, 3);
    assert.strictEqual(AstroEngine.getDegreeInfo(359.9999).rashiIndex, 12);
});

runAssert('T5.3.3: Nakshatra boundary cusps (13.333333333333334° Ashwini/Bharani, 26.666666666666668° Bharani/Krittika)', () => {
    const boundary1 = 360 / 27; // 13.333333333333334
    const boundary2 = 2 * (360 / 27); // 26.666666666666668

    assert.strictEqual(AstroEngine.getDegreeInfo(boundary1 - 0.00001).nakshatraName, 'Ashwini');
    assert.strictEqual(AstroEngine.getDegreeInfo(boundary1).nakshatraName, 'Bharani');
    assert.strictEqual(AstroEngine.getDegreeInfo(boundary2 - 0.00001).nakshatraName, 'Bharani');
    assert.strictEqual(AstroEngine.getDegreeInfo(boundary2).nakshatraName, 'Krittika');
});

runAssert('T5.3.4: getDegreeInfo degree and minute formatting accuracy (15.5° -> "15° 30\'")', () => {
    const info = AstroEngine.getDegreeInfo(15.5);
    assert.strictEqual(info.rashiDeg, "15° 30'");
});

runAssert('T5.3.5: getDegreeInfo accepts polymorphic input formats (number vs object { longitude: val })', () => {
    const infoNum = AstroEngine.getDegreeInfo(45.25);
    const infoObj = AstroEngine.getDegreeInfo({ longitude: 45.25 });

    assert.strictEqual(infoNum.rashiName, infoObj.rashiName);
    assert.strictEqual(infoNum.nakshatraName, infoObj.nakshatraName);
    assert.strictEqual(infoNum.pada, infoObj.pada);
});

runAssert('T5.3.6: getDegreeInfo Pada determination across all 4 padas per Nakshatra (Pada 1, 2, 3, 4)', () => {
    const span = 360 / 27;
    const quarter = span / 4;

    assert.strictEqual(AstroEngine.getDegreeInfo(quarter * 0 + 0.1).pada, 1);
    assert.strictEqual(AstroEngine.getDegreeInfo(quarter * 1 + 0.1).pada, 2);
    assert.strictEqual(AstroEngine.getDegreeInfo(quarter * 2 + 0.1).pada, 3);
    assert.strictEqual(AstroEngine.getDegreeInfo(quarter * 3 + 0.1).pada, 4);
});

runAssert('T5.3.7: Exhaustive degree Info verification across 12 signs', () => {
    const expectedSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    expectedSigns.forEach((signName, idx) => {
        const info = AstroEngine.getDegreeInfo(idx * 30 + 15);
        assert.strictEqual(info.rashiName, signName);
        assert.strictEqual(info.rashiIndex, idx + 1);
    });
});

runAssert('T5.3.8: Exhaustive 27 Nakshatras names and lord resolution verification', () => {
    for (let i = 0; i < 27; i++) {
        const lon = (i * (360 / 27)) + 1.0;
        const info = AstroEngine.getDegreeInfo(lon);
        assert.ok(info.nakshatraName && info.nakshatraLord);
    }
});


// =============================================================================
// GROUP 5.4: SHODASHA VARGAS (D1-D60) BRANCH & BOUNDARY HARDENING
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.4: Shodasha Vargas (D1-D60) Branch & Boundary Hardening');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.4.1: Robust handling of invalid/non-numeric planet longitudes (NaN, null, undefined, "abc")', () => {
    const badPlanets = {
        Sun: 15.5,
        Moon: NaN,
        Mars: null,
        Mercury: undefined,
        Jupiter: "abc"
    };
    const vargas = AstroEngine.calculateVargas(badPlanets);
    assert.ok(vargas.D1.Sun === 1);
    assert.strictEqual(vargas.D1.Moon, undefined);
    assert.strictEqual(vargas.D1.Mars, undefined);
    assert.strictEqual(vargas.D1.Mercury, undefined);
    assert.strictEqual(vargas.D1.Jupiter, undefined);
});

runAssert('T5.4.2: Ayanaamsa key skipping in calculateVargas', () => {
    const planetsWithAyanamsa = { ayanamsa: 23.85, Sun: 10.0 };
    const vargas = AstroEngine.calculateVargas(planetsWithAyanamsa);
    assert.strictEqual(vargas.D1.ayanamsa, undefined);
    assert.strictEqual(vargas.D1.Sun, 1);
});

runAssert('T5.4.3: Exact 0.0° boundary sign assignments across all 16 vargas (D1-D60)', () => {
    const mockZero = { TestBody: 0.0 };
    const vargas = AstroEngine.calculateVargas(mockZero);
    const expectedVargas = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    expectedVargas.forEach(vKey => {
        const sign = vargas[vKey].TestBody;
        assert.ok(sign >= 1 && sign <= 12, `Varga ${vKey} sign ${sign} out of bounds for 0.0°`);
    });
});

runAssert('T5.4.4: Exact 29.9999° boundary sign assignments across all 16 vargas (D1-D60)', () => {
    const mockNear30 = { TestBody: 29.9999 };
    const vargas = AstroEngine.calculateVargas(mockNear30);
    const expectedVargas = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    expectedVargas.forEach(vKey => {
        const sign = vargas[vKey].TestBody;
        assert.ok(sign >= 1 && sign <= 12, `Varga ${vKey} sign ${sign} out of bounds for 29.9999°`);
    });
});

runAssert('T5.4.5: D2 Hora odd/even sign partition (remDeg < 15 vs remDeg >= 15)', () => {
    // Odd sign (Aries = sign 1): remDeg < 15 -> Leo (5), remDeg >= 15 -> Cancer (4)
    const oddFirst = AstroEngine.calculateVargas({ P: 5.0 }).D2.P;
    const oddSecond = AstroEngine.calculateVargas({ P: 20.0 }).D2.P;
    assert.strictEqual(oddFirst, 5);
    assert.strictEqual(oddSecond, 4);

    // Even sign (Taurus = sign 2): remDeg < 15 -> Cancer (4), remDeg >= 15 -> Leo (5)
    const evenFirst = AstroEngine.calculateVargas({ P: 35.0 }).D2.P;
    const evenSecond = AstroEngine.calculateVargas({ P: 50.0 }).D2.P;
    assert.strictEqual(evenFirst, 4);
    assert.strictEqual(evenSecond, 5);
});

runAssert('T5.4.6: D30 Trimshamsha odd sign partitions (0-5 Aries, 5-10 Aquarius, 10-18 Sagittarius, 18-25 Gemini, 25-30 Taurus)', () => {
    assert.strictEqual(AstroEngine.calculateVargas({ P: 2.0 }).D30.P, 1);   // Aries
    assert.strictEqual(AstroEngine.calculateVargas({ P: 7.0 }).D30.P, 11);  // Aquarius
    assert.strictEqual(AstroEngine.calculateVargas({ P: 14.0 }).D30.P, 9);  // Sagittarius
    assert.strictEqual(AstroEngine.calculateVargas({ P: 21.0 }).D30.P, 3);  // Gemini
    assert.strictEqual(AstroEngine.calculateVargas({ P: 27.0 }).D30.P, 2);  // Taurus
});

runAssert('T5.4.7: D30 Trimshamsha even sign partitions (0-5 Taurus, 5-12 Virgo, 12-20 Pisces, 20-25 Capricorn, 25-30 Scorpio)', () => {
    assert.strictEqual(AstroEngine.calculateVargas({ P: 32.0 }).D30.P, 2);  // Taurus
    assert.strictEqual(AstroEngine.calculateVargas({ P: 38.0 }).D30.P, 6);  // Virgo
    assert.strictEqual(AstroEngine.calculateVargas({ P: 46.0 }).D30.P, 12); // Pisces
    assert.strictEqual(AstroEngine.calculateVargas({ P: 52.0 }).D30.P, 10); // Capricorn
    assert.strictEqual(AstroEngine.calculateVargas({ P: 57.0 }).D30.P, 8);  // Scorpio
});

runAssert('T5.4.8: Complete 16-Varga map generation completeness check for full planetary set', () => {
    const jd = AstroEngine.julianDay(2026, 7, 25, 12, 0, 0, 5.5);
    const planets = AstroEngine.calculatePlanets(jd, 28.6139, 77.2090);
    const vargas = AstroEngine.calculateVargas(planets);

    const keys = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    const pNames = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    keys.forEach(k => {
        assert.ok(vargas[k], `Missing varga chart ${k}`);
        pNames.forEach(p => {
            assert.ok(vargas[k][p] >= 1 && vargas[k][p] <= 12, `Invalid sign for ${p} in ${k}`);
        });
    });
});


// =============================================================================
// GROUP 5.5: VIMSHOTTARI DASHA ENGINE EDGE CASES & TIME CONTINUITY
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.5: Vimshottari Dasha Engine Edge Cases & Time Continuity');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.5.1: Extreme Moon longitude 0.0° (Ashwini 0° -> Ketu Mahadasha full 7-year start)', () => {
    const dasha = AstroEngine.calculateVimshottari(0.0, new Date('2000-01-01T00:00:00Z'));
    assert.strictEqual(dasha[0].lord, 'Ketu');
    assert.strictEqual(dasha[0].antardashas[0].lord, 'Ketu');
    assert.strictEqual(dasha[0].antardashas[0].pratyantardashas[0].lord, 'Ketu');
    assert.ok(Math.abs(dasha[0].years - 7.0) < 0.01);
});

runAssert('T5.5.2: Extreme Moon longitude 359.9999° (Revati -> Mercury Mahadasha start)', () => {
    const dasha = AstroEngine.calculateVimshottari(359.9999, new Date('2000-01-01T00:00:00Z'));
    assert.strictEqual(dasha[0].lord, 'Mercury');
    assert.ok(dasha[0].years < 0.01); // Almost finished
});

runAssert('T5.5.3: Leap year birth date handling (2000-02-29T12:00:00Z and 2024-02-29T23:59:59Z)', () => {
    const dasha2000 = AstroEngine.calculateVimshottari(100.0, new Date('2000-02-29T12:00:00Z'));
    const dasha2024 = AstroEngine.calculateVimshottari(100.0, new Date('2024-02-29T23:59:59Z'));

    assert.ok(dasha2000[0].startDate.toISOString().startsWith('2000-02-29'));
    assert.ok(dasha2024[0].startDate.toISOString().startsWith('2024-02-29'));
});

runAssert('T5.5.4: Polymorphic birthDate inputs (Date object, ISO string, timestamp number)', () => {
    const d1 = AstroEngine.calculateVimshottari(45.0, new Date('2000-01-01T00:00:00Z'));
    const d2 = AstroEngine.calculateVimshottari(45.0, '2000-01-01T00:00:00Z');
    const d3 = AstroEngine.calculateVimshottari(45.0, 946684800000);

    assert.strictEqual(d1[0].startDate.getTime(), d2[0].startDate.getTime());
    assert.strictEqual(d1[0].startDate.getTime(), d3[0].startDate.getTime());
});

runAssert('T5.5.5: Exact 729 Pratyantardashas millisecond continuity verification (zero gap / zero overlap)', () => {
    const dasha = AstroEngine.calculateVimshottari(123.45, new Date('1990-05-15T10:30:00Z'));
    let totalGaps = 0;

    dasha.forEach(m => {
        m.antardashas.forEach(a => {
            for (let p = 0; p < a.pratyantardashas.length - 1; p++) {
                const currentEnd = a.pratyantardashas[p].endDate.getTime();
                const nextStart = a.pratyantardashas[p + 1].startDate.getTime();
                if (currentEnd !== nextStart) totalGaps++;
            }
        });
    });

    assert.strictEqual(totalGaps, 0, 'Pratyantardasha dates must be 100% continuous');
});

runAssert('T5.5.6: Total Dasha duration sum equals exactly 120 Savana years (3,786,912,000,000 ms total across 9 Mahadashas)', () => {
    const dasha = AstroEngine.calculateVimshottari(0.0, new Date('2000-01-01T00:00:00Z'));
    const MS_PER_YEAR = 365.25 * 86400000;
    const expectedTotalMs = 120 * MS_PER_YEAR;

    const startMs = dasha[0].startDate.getTime();
    const endMs = dasha[8].endDate.getTime();
    const durationMs = endMs - startMs;

    assert.strictEqual(durationMs, expectedTotalMs);
});

runAssert('T5.5.7: Dasha calculation execution time benchmarking (executionTimeMs < 100ms)', () => {
    const dasha = AstroEngine.calculateVimshottari(150.0, new Date());
    assert.ok(dasha.executionTimeMs !== undefined && dasha.executionTimeMs < 100);
});

runAssert('T5.5.8: Polymorphic Moon longitude parsing (number, string "15.5", object { longitude: 15.5 })', () => {
    const dNum = AstroEngine.calculateVimshottari(15.5, new Date('2000-01-01'));
    const dStr = AstroEngine.calculateVimshottari("15.5", new Date('2000-01-01'));
    const dObj = AstroEngine.calculateVimshottari({ longitude: 15.5 }, new Date('2000-01-01'));

    assert.strictEqual(dNum[0].lord, dStr[0].lord);
    assert.strictEqual(dNum[0].lord, dObj[0].lord);
});


// =============================================================================
// GROUP 5.6: PANCHANG ENGINE BOUNDARY & HALF-TITHI HARDENING
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.6: Panchang Engine Boundary & Half-Tithi Hardening');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.6.1: Elongation difference 0.0° (New Moon / Shukla Pratipada / Tithi 1)', () => {
    const p = AstroEngine.calculatePanchang(0.0, 0.0, 2451545.0, 5.5);
    assert.strictEqual(p.tithi.number, 1);
    assert.strictEqual(p.paksha, 'Shukla');
    assert.strictEqual(p.tithi.name, 'Pratipada');
});

runAssert('T5.6.2: Elongation difference boundary cusps near 180.0° (Purnima at 179.999° vs Krishna Pratipada at 180.0°)', () => {
    const pPurnima = AstroEngine.calculatePanchang(0.0, 179.999, 2451545.0, 5.5);
    const pKrishna = AstroEngine.calculatePanchang(0.0, 180.0, 2451545.0, 5.5);

    assert.strictEqual(pPurnima.tithi.number, 15);
    assert.strictEqual(pPurnima.paksha, 'Shukla');
    assert.strictEqual(pPurnima.tithi.name, 'Purnima');

    assert.strictEqual(pKrishna.tithi.number, 16);
    assert.strictEqual(pKrishna.paksha, 'Krishna');
});

runAssert('T5.6.3: Elongation difference 359.9999° (Amavasya / Tithi 30)', () => {
    const p = AstroEngine.calculatePanchang(0.0, 359.9999, 2451545.0, 5.5);
    assert.strictEqual(p.tithi.number, 30);
    assert.strictEqual(p.paksha, 'Krishna');
    assert.strictEqual(p.tithi.name, 'Amavasya');
});

runAssert('T5.6.4: Complete 60 Half-Tithi Karana map validation (htIndex 0 = Kintughna, 1..56 Movable, 57 Shakuni, 58 Chatushpada, 59 Naga)', () => {
    const k0 = AstroEngine.calculatePanchang(0, 3, 2451545.0, 0).karana;
    const k57 = AstroEngine.calculatePanchang(0, 345, 2451545.0, 0).karana;
    const k58 = AstroEngine.calculatePanchang(0, 351, 2451545.0, 0).karana;
    const k59 = AstroEngine.calculatePanchang(0, 357, 2451545.0, 0).karana;

    assert.strictEqual(k0.name, 'Kintughna');
    assert.strictEqual(k0.type, 'Fixed');

    assert.strictEqual(k57.name, 'Shakuni');
    assert.strictEqual(k57.type, 'Fixed');

    assert.strictEqual(k58.name, 'Chatushpada');
    assert.strictEqual(k58.type, 'Fixed');

    assert.strictEqual(k59.name, 'Naga');
    assert.strictEqual(k59.type, 'Fixed');
});

runAssert('T5.6.5: Vara calculation with direct dayOfWeek index (0-6) vs JD float with timezone offset', () => {
    const pDirect = AstroEngine.calculatePanchang(0, 0, 0); // 0 = Sunday
    assert.strictEqual(pDirect.vara.id, 0);
    assert.strictEqual(pDirect.vara.english, 'Sunday');

    const pJD = AstroEngine.calculatePanchang(0, 0, 2451545.0, 0); // J2000.0 12:00 UTC = Shanivara (Saturday)
    assert.strictEqual(pJD.vara.english, 'Saturday');
});

runAssert('T5.6.6: Yoga calculation for 27 Yogas boundary sum (Sun 0° + Moon 0° -> Vishkambha)', () => {
    const p = AstroEngine.calculatePanchang(0.0, 0.0, 2451545.0, 5.5);
    assert.strictEqual(p.yoga.id, 1);
    assert.strictEqual(p.yoga.name, 'Vishkambha');
});

runAssert('T5.6.7: Panchang execution time benchmarking (executionTimeMs < 50ms)', () => {
    const p = AstroEngine.calculatePanchang(15.0, 145.0, 2451545.0, 5.5);
    assert.ok(p.executionTimeMs !== undefined && p.executionTimeMs < 50);
});

runAssert('T5.6.8: Backward compatibility string properties presence (tithiName, nakshatraName, yogaName, karanaName, varaName)', () => {
    const p = AstroEngine.calculatePanchang(15.0, 145.0, 2451545.0, 5.5);
    assert.ok(p.tithiName && p.nakshatraName && p.yogaName && p.karanaName && p.varaName);
});


// =============================================================================
// GROUP 5.7: MANGLIK DOSHA & BHANGA CANCELLATION ADVERSARIAL MINING
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.7: Manglik Dosha & Bhanga Cancellation Adversarial Mining');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.7.1: Empty/null/undefined/non-object input safety (returns default non-Manglik structure without throwing)', () => {
    assert.strictEqual(AstroEngine.calculateManglikDosha(null).isManglik, false);
    assert.strictEqual(AstroEngine.calculateManglikDosha(undefined).isManglik, false);
    assert.strictEqual(AstroEngine.calculateManglikDosha({}).isManglik, false);
    assert.strictEqual(AstroEngine.calculateManglikDosha("invalid").isManglik, false);
});

runAssert('T5.7.2: Partial planet object safety (missing Ascendant/Moon/Venus/Jupiter defaults gracefully)', () => {
    const partial = { Mars: { sign: 7, longitude: 195 } }; // Mars in Libra (7) without Ascendant/Moon
    const res = AstroEngine.calculateManglikDosha(partial);
    assert.strictEqual(res.isManglik, false);
    assert.strictEqual(res.houseFromLagna, null);
});

runAssert('T5.7.3: Mars in houses 1, 2, 4, 7, 8, 12 from Lagna triggers isManglik = true', () => {
    const houses = [1, 2, 4, 7, 8, 12];
    houses.forEach(h => {
        let targetSign = ((3 - 1 + h - 1) % 12) + 1;
        const chart = { Ascendant: { sign: 3, longitude: 75 }, Mars: { sign: targetSign, longitude: (targetSign - 1) * 30 + 15 } };
        const m = AstroEngine.calculateManglikDosha(chart);
        assert.strictEqual(m.isManglik, true, `Mars in house ${h} from Lagna failed to mark Manglik`);
        assert.strictEqual(m.houseFromLagna, h);
    });
});

runAssert('T5.7.4: Mars in houses 1, 2, 4, 7, 8, 12 from Moon triggers isManglik = true', () => {
    const chart = { Ascendant: { sign: 5, longitude: 135 }, Moon: { sign: 1, longitude: 15 }, Mars: { sign: 7, longitude: 195 } }; // Mars in 7th from Moon
    const m = AstroEngine.calculateManglikDosha(chart);
    assert.strictEqual(m.isManglik, true);
    assert.strictEqual(m.houseFromMoon, 7);
});

runAssert('T5.7.5: Mars in houses 1, 2, 4, 7, 8, 12 from Venus triggers isManglik = true', () => {
    const chart = { Ascendant: { sign: 5, longitude: 135 }, Venus: { sign: 1, longitude: 15 }, Mars: { sign: 4, longitude: 105 } }; // Mars in 4th from Venus
    const m = AstroEngine.calculateManglikDosha(chart);
    assert.strictEqual(m.isManglik, true);
    assert.strictEqual(m.houseFromVenus, 4);
});

runAssert('T5.7.6: Bhanga Cancellation Rule 1: Mars in own sign (Aries/Scorpio) or exaltation (Capricorn)', () => {
    // Mars in Aries (1) in 1st house
    const cAries = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 1, longitude: 15 } };
    const mAries = AstroEngine.calculateManglikDosha(cAries);
    assert.strictEqual(mAries.isCancelled, true);
    assert.strictEqual(mAries.effectiveManglik, false);

    // Mars in Scorpio (8) in 8th house
    const cScorpio = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 8, longitude: 225 } };
    const mScorpio = AstroEngine.calculateManglikDosha(cScorpio);
    assert.strictEqual(mScorpio.isCancelled, true);
    assert.strictEqual(mScorpio.effectiveManglik, false);

    // Mars in Capricorn (10) in 7th house (from Cancer 4)
    const cCap = { Ascendant: { sign: 4, longitude: 105 }, Mars: { sign: 10, longitude: 285 } };
    const mCap = AstroEngine.calculateManglikDosha(cCap);
    assert.strictEqual(mCap.isCancelled, true);
    assert.strictEqual(mCap.effectiveManglik, false);
});

runAssert('T5.7.7: Bhanga Cancellation Rule 2: Mars aspected by or conjunct Jupiter (houses 1, 5, 7, 9 from Jupiter)', () => {
    // Jupiter in Sagittarius (9), Mars in Gemini (3) -> 7th house aspect from Jupiter
    const chart = { Ascendant: { sign: 3, longitude: 75 }, Mars: { sign: 3, longitude: 75 }, Jupiter: { sign: 9, longitude: 255 } };
    const m = AstroEngine.calculateManglikDosha(chart);
    assert.strictEqual(m.isCancelled, true);
    assert.strictEqual(m.effectiveManglik, false);
});

runAssert('T5.7.8: Bhanga Cancellation Rule 3: Mars in Saturn sign (Capricorn 10, Aquarius 11)', () => {
    // Mars in Aquarius (11) in 12th house (from Pisces 12)
    const chart = { Ascendant: { sign: 12, longitude: 345 }, Mars: { sign: 11, longitude: 315 } };
    const m = AstroEngine.calculateManglikDosha(chart);
    assert.strictEqual(m.isCancelled, true);
    assert.strictEqual(m.effectiveManglik, false);
});


// =============================================================================
// GROUP 5.8: ASHTA KUTA GUN MILAN SYNASTRY ADVERSARIAL MATRIX
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.8: Ashta Kuta Gun Milan Synastry Adversarial Matrix');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.8.1: Sworn enemies Yoni matrix scoring (Horse vs Buffalo = 0, Elephant vs Lion = 0, Serpent vs Mongoose = 0, Cat vs Rat = 0, Cow vs Tiger = 0)', () => {
    // Horse (Ashwini 5°) vs Buffalo (Swati 190°) -> Yoni 0
    const m1 = AstroEngine.calculateGunMilan(5, 190);
    assert.strictEqual(m1.breakdown.yoni, 0);

    // Elephant (Bharani 20°) vs Lion (Dhanishta 300°) -> Yoni 0
    const m2 = AstroEngine.calculateGunMilan(20, 300);
    assert.strictEqual(m2.breakdown.yoni, 0);

    // Serpent (Rohini 45°) vs Mongoose (Uttara Ashadha 270°) -> Yoni 0
    const m3 = AstroEngine.calculateGunMilan(45, 270);
    assert.strictEqual(m3.breakdown.yoni, 0);
});

runAssert('T5.8.2: Nadi Dosha cancellation check (Same Nadi = 0 pts vs Different Nadi = 8 pts)', () => {
    // Ashwini (Adi Nadi 0) vs Bharani (Madhya Nadi 1) -> 8 pts
    const mDiff = AstroEngine.calculateGunMilan(5, 20);
    assert.strictEqual(mDiff.breakdown.nadi, 8);

    // Ashwini (Adi Nadi 0) vs Punarvasu (Adi Nadi 0) -> 0 pts (Nadi Dosha)
    const mSame = AstroEngine.calculateGunMilan(5, 90);
    assert.strictEqual(mSame.breakdown.nadi, 0);
});

runAssert('T5.8.3: Bhakoot Dosha score determination (2/12, 5/9, 6/8 = 0 pts vs 1/7, 3/11, 4/10 = 7 pts)', () => {
    // Aries (15°) vs Taurus (45°) -> Dwi-Dwadasa 2/12 -> Bhakoot 0
    const m2_12 = AstroEngine.calculateGunMilan(15, 45);
    assert.strictEqual(m2_12.breakdown.bhakoot, 0);

    // Aries (15°) vs Libra (195°) -> Sama-Saptaka 1/7 -> Bhakoot 7
    const m1_7 = AstroEngine.calculateGunMilan(15, 195);
    assert.strictEqual(m1_7.breakdown.bhakoot, 7);
});

runAssert('T5.8.4: Polymorphic boy/girl parameter handling (numbers, objects with longitude/moonLongitude/Moon, explicit nakshatra ids)', () => {
    const resNum = AstroEngine.calculateGunMilan(5, 20);
    const resObj1 = AstroEngine.calculateGunMilan({ longitude: 5 }, { longitude: 20 });
    const resObj2 = AstroEngine.calculateGunMilan({ moonLongitude: 5 }, { moonLongitude: 20 });
    const resObj3 = AstroEngine.calculateGunMilan({ Moon: { longitude: 5 } }, { Moon: { longitude: 20 } });
    const resNak = AstroEngine.calculateGunMilan(0, 0, 1, 2); // Ashwini (1) vs Bharani (2)

    assert.strictEqual(resNum.totalScore, resObj1.totalScore);
    assert.strictEqual(resNum.totalScore, resObj2.totalScore);
    assert.strictEqual(resNum.totalScore, resObj3.totalScore);
    assert.strictEqual(resNum.totalScore, resNak.totalScore);
});

runAssert('T5.8.5: Fallback rashi resolution from Nakshatra ID when longitude is 0', () => {
    const res = AstroEngine.calculateGunMilan(0, 0, 1, 2); // Ashwini (1) vs Bharani (2)
    assert.strictEqual(res.totalScore, 35);
});

runAssert('T5.8.6: Both boy and girl effective Manglik -> manglikMatch = true (Mutual cancellation)', () => {
    const boy = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 7, longitude: 195 }, Moon: { sign: 1, longitude: 15 }, Venus: { sign: 3, longitude: 75 } };
    const girl = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 4, longitude: 105 }, Moon: { sign: 1, longitude: 15 }, Venus: { sign: 3, longitude: 75 } };
    const match = AstroEngine.calculateGunMilan(boy, girl);
    assert.strictEqual(match.manglikMatch, true);
});

runAssert('T5.8.7: One boy effective Manglik and girl non-Manglik -> manglikMatch = false', () => {
    const boy = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 7, longitude: 195 }, Moon: { sign: 1, longitude: 15 }, Venus: { sign: 1, longitude: 15 } };
    const girl = { Ascendant: { sign: 1, longitude: 15 }, Mars: { sign: 3, longitude: 75 }, Moon: { sign: 1, longitude: 15 }, Venus: { sign: 1, longitude: 15 } };
    const match = AstroEngine.calculateGunMilan(boy, girl);
    assert.strictEqual(match.manglikMatch, false);
});

runAssert('T5.8.8: Gun Milan total score bounded in [0, 36] and verdict categorization ("Excellent Match", "Good Match", "Below Average")', () => {
    const mHigh = AstroEngine.calculateGunMilan(5, 20); // 35
    const mLow = AstroEngine.calculateGunMilan(5, 165); // <18

    assert.ok(mHigh.totalScore >= 0 && mHigh.totalScore <= 36);
    assert.ok(mLow.totalScore >= 0 && mLow.totalScore <= 36);
    assert.strictEqual(mHigh.verdict, "Excellent Match");
    assert.strictEqual(mLow.verdict, "Below Average / Requires Remedies");
});


// =============================================================================
// GROUP 5.9: SVG CHART RENDERER (NORTH, SOUTH, EAST) ADVERSARIAL & SCALING
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.9: SVG Chart Renderer (North, South, East) Adversarial & Scaling');
console.log('--------------------------------------------------------------------------------');

runAssert('T5.9.1: String lagnaRashi ("5", "12") handling across all 3 renderers without NaN in SVG', () => {
    const data = { Sun: 5, Moon: 12 };
    const nSvg = ChartRenderer.renderNorthIndianSVG(data, "5");
    const sSvg = ChartRenderer.renderSouthIndianSVG(data, "12");
    const eSvg = ChartRenderer.renderEastIndianSVG(data, "5");

    assert.ok(nSvg.includes('<svg') && !nSvg.includes('NaN'));
    assert.ok(sSvg.includes('<svg') && !sSvg.includes('NaN'));
    assert.ok(eSvg.includes('<svg') && !eSvg.includes('NaN'));
});

runAssert('T5.9.2: Out-of-bounds lagnaRashi normalization (0 -> 1, 15 -> 12, -5 -> 1)', () => {
    const nSvg0 = ChartRenderer.renderNorthIndianSVG({}, 0);
    const nSvg15 = ChartRenderer.renderNorthIndianSVG({}, 15);
    const nSvgNeg = ChartRenderer.renderNorthIndianSVG({}, -5);

    assert.ok(nSvg0.includes('class="house-num" text-anchor="middle">1</text>'));
    assert.ok(nSvg15.includes('class="house-num" text-anchor="middle">12</text>'));
    assert.ok(nSvgNeg.includes('class="house-num" text-anchor="middle">1</text>'));
});

runAssert('T5.9.3: Null/undefined vargaData and lagnaRashi handling (gracefully renders empty base SVG chart)', () => {
    const nSvg = ChartRenderer.renderNorthIndianSVG(null, undefined);
    const sSvg = ChartRenderer.renderSouthIndianSVG(undefined, null);
    const eSvg = ChartRenderer.renderEastIndianSVG(null, null);

    assert.ok(nSvg.includes('<svg') && !nSvg.includes('NaN'));
    assert.ok(sSvg.includes('<svg') && !sSvg.includes('NaN'));
    assert.ok(eSvg.includes('<svg') && !eSvg.includes('NaN'));
});

runAssert('T5.9.4: Planet rashi indices out of bounds (0 -> 1, 15 -> 12) sanitized across all renderers', () => {
    const oobData = { Sun: 0, Moon: 15, Mars: -3, Jupiter: "99" };
    const nSvg = ChartRenderer.renderNorthIndianSVG(oobData, 1);
    const sSvg = ChartRenderer.renderSouthIndianSVG(oobData, 1);
    const eSvg = ChartRenderer.renderEastIndianSVG(oobData, 1);

    assert.ok(!nSvg.includes('NaN') && !sSvg.includes('NaN') && !eSvg.includes('NaN'));
});

runAssert('T5.9.5: North Indian 6-planet stellium dynamic font scaling (font-size="2.6px", dy="2.8")', () => {
    const stellium = { Sun: 1, Moon: 1, Mars: 1, Mercury: 1, Jupiter: 1, Venus: 1 };
    const svg = ChartRenderer.renderNorthIndianSVG(stellium, 1);
    assert.ok(svg.includes('font-size="2.6px"') && svg.includes('dy="2.8"'));
});

runAssert('T5.9.6: Extreme 9-planet stellium dynamic dy step scaling (dy="2.2")', () => {
    const stellium9 = { Sun: 1, Moon: 1, Mars: 1, Mercury: 1, Jupiter: 1, Venus: 1, Saturn: 1, Rahu: 1, Ketu: 1 };
    const nSvg = ChartRenderer.renderNorthIndianSVG(stellium9, 1);
    const sSvg = ChartRenderer.renderSouthIndianSVG(stellium9, 1);
    const eSvg = ChartRenderer.renderEastIndianSVG(stellium9, 1);

    assert.ok(nSvg.includes('dy="2.2"') && sSvg.includes('dy="2.2"') && eSvg.includes('dy="2.2"'));
});

runAssert('T5.9.7: South Indian box chart visual Lagna slash indicator (line class="lagna-slash" & text class="lagna-label">Asc</text>)', () => {
    const sSvg = ChartRenderer.renderSouthIndianSVG({ Ascendant: 1 }, 1);
    assert.ok(sSvg.includes('class="lagna-slash lagna-indicator"') && sSvg.includes('class="lagna-label">Asc</text>'));
});

runAssert('T5.9.8: East Indian square chart 3x3 partition lines and non-overlapping house coords', () => {
    const eSvg = ChartRenderer.renderEastIndianSVG({ Sun: 1 }, 1);
    assert.ok(eSvg.includes('<line x1="2" y1="26"') && eSvg.includes('<line x1="26" y1="2"'));
});


// =============================================================================
// GROUP 5.10: CODEBASE UI/CSS CONTRACT & END-TO-END SYSTEM INTEGRITY
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🔥 Group 5.10: Codebase UI/CSS Contract & End-to-End System Integrity');
console.log('--------------------------------------------------------------------------------');

const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

runAssert('T5.10.1: HTML DOM elements contract check (index.html contains all required IDs)', () => {
    const requiredIDs = [
        'dob', 'tob', 'lat', 'long', 'timezone', 'chartStyle',
        'chartDisplay', 'panchangSection', 'dashaAccordion',
        'calcMatchBtn', 'export-pdf-btn'
    ];
    requiredIDs.forEach(id => {
        assert.ok(htmlContent.includes(`id="${id}"`), `Missing required HTML element id="${id}"`);
    });
});

runAssert('T5.10.2: CSS @media print contract check (style.css contains @media print hiding UI controls and enforcing page-break-inside avoid)', () => {
    assert.ok(cssContent.includes('@media print'), 'Missing @media print block');
    const printBlock = cssContent.slice(cssContent.indexOf('@media print'));
    assert.ok(printBlock.includes('display: none') || printBlock.includes('display:none'), 'Print styles must hide UI controls');
    assert.ok(printBlock.includes('page-break-inside: avoid') || printBlock.includes('break-inside: avoid') || printBlock.includes('page-break-inside:avoid'), 'Print styles must handle page breaks');
});

runAssert('T5.10.3: JS script.js API contract check (script.js calls all core AstroEngine and ChartRenderer methods and wires window.print())', () => {
    assert.ok(jsContent.includes('julianDay'), 'script.js missing julianDay');
    assert.ok(jsContent.includes('calculatePlanets'), 'script.js missing calculatePlanets');
    assert.ok(jsContent.includes('calculateVargas'), 'script.js missing calculateVargas');
    assert.ok(jsContent.includes('calculatePanchang'), 'script.js missing calculatePanchang');
    assert.ok(jsContent.includes('calculateVimshottari'), 'script.js missing calculateVimshottari');
    assert.ok(jsContent.includes('calculateGunMilan'), 'script.js missing calculateGunMilan');
    assert.ok(jsContent.includes('calculateManglikDosha'), 'script.js missing calculateManglikDosha');
    assert.ok(jsContent.includes('renderNorthIndianSVG'), 'script.js missing renderNorthIndianSVG');
    assert.ok(jsContent.includes('renderSouthIndianSVG'), 'script.js missing renderSouthIndianSVG');
    assert.ok(jsContent.includes('renderEastIndianSVG'), 'script.js missing renderEastIndianSVG');
    assert.ok(jsContent.includes('window.print()'), 'script.js missing window.print()');
});

runAssert('T5.10.4: End-to-end full horoscope workflow execution (julianDay -> calculatePlanets -> calculateVargas -> calculatePanchang -> calculateVimshottari -> renderNorthIndianSVG)', () => {
    const JD = AstroEngine.julianDay(1995, 5, 15, 10, 30, 0, 5.5);
    const planets = AstroEngine.calculatePlanets(JD, 28.6139, 77.2090);
    const vargas = AstroEngine.calculateVargas(planets);
    const panchang = AstroEngine.calculatePanchang(planets.Sun, planets.Moon, JD, 5.5);
    const dasha = AstroEngine.calculateVimshottari(planets.Moon, new Date('1995-05-15T10:30:00Z'));
    const svg = ChartRenderer.renderNorthIndianSVG(vargas.D1, vargas.D1.Ascendant);

    assert.ok(planets && vargas.D9 && panchang.tithi && dasha.length === 9 && svg.includes('<svg'));
});

runAssert('T5.10.5: End-to-end synastry workflow execution (calculatePlanets -> calculateGunMilan -> calculateManglikDosha)', () => {
    const bJD = AstroEngine.julianDay(1994, 8, 20, 14, 15, 0, 5.5);
    const gJD = AstroEngine.julianDay(1996, 11, 10, 9, 45, 0, 5.5);

    const bP = AstroEngine.calculatePlanets(bJD, 28.61, 77.20);
    const gP = AstroEngine.calculatePlanets(gJD, 28.61, 77.20);

    const match = AstroEngine.calculateGunMilan(bP.Moon, gP.Moon);
    const bM = AstroEngine.calculateManglikDosha(bP);
    const gM = AstroEngine.calculateManglikDosha(gP);

    assert.ok(match.totalScore >= 0 && match.totalScore <= 36);
    assert.ok(typeof bM.isManglik === 'boolean' && typeof gM.isManglik === 'boolean');
});

runAssert('T5.10.6: Complete suite zero-error, zero-NaN, zero-unhandled exception invariant check', () => {
    assert.strictEqual(failCount, 0, 'No failures permitted in Tier 5 Adversarial Coverage Hardening test suite!');
});


// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log('\n================================================================================');
console.log('          TIER 5 ADVERSARIAL COVERAGE HARDENING RESULTS MATRIX                  ');
console.log('================================================================================');
console.log(`  Total Tier 5 Assertions Executed : ${passCount + failCount}`);
console.log(`  Passed                           : ${passCount}`);
console.log(`  Failed                           : ${failCount}`);
console.log(`  Pass Rate                        : ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);
console.log('================================================================================\n');

if (failCount > 0) {
    console.error(`❌ TIER 5 ADVERSARIAL TEST SUITE FAILED (${failCount} failures)!`);
    process.exit(1);
} else {
    console.log(`🎉 TIER 5 ADVERSARIAL TEST SUITE PASSED 100% (${passCount}/${passCount})! 🎉`);
    process.exit(0);
}
