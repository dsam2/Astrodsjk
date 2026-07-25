/**
 * AstroDSJK — Panchang & Vimshottari Dasha Stress Test Harness
 * 
 * Tests:
 * 1. Extreme Date Ranges (1900 to 2100)
 * 2. Moon/Sun Longitude Boundaries (0°, 0.001°, 359.999°, 360°, -0.001°, etc.)
 * 3. 1,000 Rapid Calculations (<50ms execution time per calculation)
 * 4. Date Continuity across all 729 Pratyantardasha nodes
 */

const fs = require('fs');
const path = require('path');

// Load AstroEngine
const enginePath = path.join(__dirname, '../js/astrology-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

const evalContext = new Function(engineCode + '; return AstroEngine;');
const AstroEngine = evalContext();

console.log('================================================================');
console.log('⚡ AstroDSJK: Panchang & Vimshottari Dasha Stress Test Suite');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, message, details = '') {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passCount++;
    } else {
        const failMsg = `❌ FAIL: ${message}${details ? ' -> ' + details : ''}`;
        console.error(`  ${failMsg}`);
        failCount++;
        failures.push(failMsg);
    }
}

// -------------------------------------------------------------------------
// TEST SUITE 1: EXTREME DATE RANGES (1900 TO 2100)
// -------------------------------------------------------------------------
console.log('----------------------------------------------------------------');
console.log('1. STRESS TEST: Extreme Date Ranges (Years 1900 to 2100)');
console.log('----------------------------------------------------------------');

const testDates = [
    { label: 'Start of 20th Century', iso: '1900-01-01T00:00:00.000Z', yr: 1900, mo: 1, dy: 1, hr: 0, min: 0, sec: 0 },
    { label: 'Non-Leap Century Year 1900 Feb End', iso: '1900-02-28T23:59:59.000Z', yr: 1900, mo: 2, dy: 28, hr: 23, min: 59, sec: 59 },
    { label: 'India Independence', iso: '1947-08-15T00:00:00.000Z', yr: 1947, mo: 8, dy: 15, hr: 0, min: 0, sec: 0 },
    { label: 'J2000 Epoch', iso: '2000-01-01T12:00:00.000Z', yr: 2000, mo: 1, dy: 1, hr: 12, min: 0, sec: 0 },
    { label: 'Leap Century Day (2000-02-29)', iso: '2000-02-29T12:00:00.000Z', yr: 2000, mo: 2, dy: 29, hr: 12, min: 0, sec: 0 },
    { label: 'Present Date Baseline', iso: '2026-07-25T11:34:07.000Z', yr: 2026, mo: 7, dy: 25, hr: 11, min: 34, sec: 7 },
    { label: 'Near End of 21st Century (2099)', iso: '2099-12-31T23:59:59.000Z', yr: 2099, mo: 12, dy: 31, hr: 23, min: 59, sec: 59 },
    { label: 'Start of Year 2100', iso: '2100-01-01T00:00:00.000Z', yr: 2100, mo: 1, dy: 1, hr: 0, min: 0, sec: 0 },
    { label: 'Non-Leap Century Year 2100 Feb End', iso: '2100-02-28T23:59:59.000Z', yr: 2100, mo: 2, dy: 28, hr: 23, min: 59, sec: 59 },
    { label: 'End of 21st Century (2100-12-31)', iso: '2100-12-31T23:59:59.000Z', yr: 2100, mo: 12, dy: 31, hr: 23, min: 59, sec: 59 }
];

testDates.forEach(td => {
    try {
        const jd = AstroEngine.julianDay(td.yr, td.mo, td.dy, td.hr, td.min, td.sec, 0);
        assert(!isNaN(jd) && jd > 2400000, `Julian Day valid for ${td.label} (${td.iso}): JD=${jd}`);

        const planets = AstroEngine.calculatePlanets(jd, 28.6139, 77.2090);
        assert(planets && !isNaN(planets.Sun.longitude) && !isNaN(planets.Moon.longitude),
            `Planetary calculation valid for ${td.label}`);

        const panchang = AstroEngine.calculatePanchang(planets.Sun.longitude, planets.Moon.longitude, jd, 5.5);
        const validPanchang = panchang.tithi && panchang.tithi.name &&
                              panchang.vara && panchang.vara.name &&
                              panchang.nakshatra && panchang.nakshatra.name &&
                              panchang.yoga && panchang.yoga.name &&
                              panchang.karana && panchang.karana.name;
        assert(validPanchang, `Panchang 5 limbs valid for ${td.label} (${panchang.tithi.name}, ${panchang.nakshatra.name})`);

        const dasha = AstroEngine.calculateVimshottari(planets.Moon.longitude, new Date(td.iso));
        assert(Array.isArray(dasha) && dasha.length === 9, `Vimshottari dasha tree generated 9 Mahadashas for ${td.label}`);
        assert(!isNaN(dasha[0].startDate.getTime()) && !isNaN(dasha[8].endDate.getTime()),
            `Vimshottari dates valid for ${td.label} (1st: ${dasha[0].lord}, start ${dasha[0].startDate.toISOString()})`);
    } catch (err) {
        assert(false, `Unhandled exception for date ${td.label}`, err.message);
    }
});


// -------------------------------------------------------------------------
// TEST SUITE 2: MOON & SUN LONGITUDE BOUNDARIES
// -------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('2. STRESS TEST: Moon / Sun Longitude Boundaries (0°, 0.001°, 359.999°)');
console.log('----------------------------------------------------------------');

const boundaryLons = [
    { label: 'Exact 0.0°', val: 0.0 },
    { label: 'Tiny positive 0.001°', val: 0.001 },
    { label: 'Tiny positive 0.000001°', val: 0.000001 },
    { label: 'Near Aries/Revati Cusp 359.999°', val: 359.999 },
    { label: 'Near Aries/Revati Cusp 359.999999°', val: 359.999999 },
    { label: 'Exact 360.0° (Normalizes to 0°)', val: 360.0 },
    { label: 'Slightly Negative -0.001° (Normalizes to 359.999°)', val: -0.001 },
    { label: 'Over 360° (360.001° -> 0.001°)', val: 360.001 },
    { label: 'Double Wrap (720.5° -> 0.5°)', val: 720.5 }
];

// 2.1 Degree Info boundaries
boundaryLons.forEach(b => {
    try {
        const degInfo = AstroEngine.getDegreeInfo(b.val);
        assert(degInfo && degInfo.rashiName && degInfo.nakshatraName,
            `getDegreeInfo for ${b.label} (${b.val}°) -> Rashi: ${degInfo.rashiName}, Nakshatra: ${degInfo.nakshatraName}, Pada: ${degInfo.pada}`);
        assert(degInfo.rashiIndex >= 1 && degInfo.rashiIndex <= 12, `Rashi index in range [1, 12] for ${b.label}`);
        assert(degInfo.pada >= 1 && degInfo.pada <= 4, `Pada in range [1, 4] for ${b.label}`);
    } catch (e) {
        assert(false, `getDegreeInfo failed for ${b.label}`, e.message);
    }
});

// 2.2 Vimshottari Dasha Longitude Boundaries
boundaryLons.forEach(b => {
    try {
        const dasha = AstroEngine.calculateVimshottari(b.val, new Date('2026-01-01T00:00:00Z'));
        assert(Array.isArray(dasha) && dasha.length === 9, `calculateVimshottari returns 9 Mahadashas for ${b.label} (${b.val}°)`);
        assert(dasha[0].lord !== undefined, `1st Mahadasha lord is ${dasha[0].lord} for ${b.label}`);
    } catch (e) {
        assert(false, `calculateVimshottari failed for ${b.label}`, e.message);
    }
});

// 2.3 Sun / Moon Panchang Boundary Matrix
const sunMoonPairs = [
    { s: 0.0, m: 0.0, desc: 'Sun 0.0°, Moon 0.0°' },
    { s: 0.001, m: 0.001, desc: 'Sun 0.001°, Moon 0.001°' },
    { s: 359.999, m: 359.999, desc: 'Sun 359.999°, Moon 359.999°' },
    { s: 359.999, m: 0.001, desc: 'Sun 359.999°, Moon 0.001° (New Moon / Pratipada boundary)' },
    { s: 0.001, m: 359.999, desc: 'Sun 0.001°, Moon 359.999° (Amavasya boundary)' },
    { s: 0.0, m: 180.0, desc: 'Sun 0.0°, Moon 180.0° (Exact Full Moon Purnima boundary)' },
    { s: 0.0, m: 179.999, desc: 'Sun 0.0°, Moon 179.999° (Just before Purnima)' },
    { s: 0.0, m: 180.001, desc: 'Sun 0.0°, Moon 180.001° (Just after Purnima -> Krishna Paksha)' },
    { s: 360.0, m: 720.0, desc: 'Sun 360.0°, Moon 720.0° (Multiple wraps)' }
];

sunMoonPairs.forEach(pair => {
    try {
        const p = AstroEngine.calculatePanchang(pair.s, pair.m, 2451545.0, 5.5);
        assert(p && p.tithi && p.nakshatra && p.yoga && p.karana,
            `Panchang calculated for ${pair.desc}: Tithi=${p.tithi.name} (#${p.tithi.number}), Paksha=${p.paksha}, Karana=${p.karana.name} (#${p.karana.id})`);
        assert(p.tithi.number >= 1 && p.tithi.number <= 30, `Tithi number within [1, 30] for ${pair.desc}`);
        assert(p.karana.id >= 1 && p.karana.id <= 60, `Karana id within [1, 60] for ${pair.desc}`);
    } catch (e) {
        assert(false, `calculatePanchang failed for ${pair.desc}`, e.message);
    }
});


// -------------------------------------------------------------------------
// TEST SUITE 3: 1,000 RAPID CALCULATIONS (<50ms REQUIREMENT)
// -------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('3. STRESS TEST: 1,000 Rapid Calculations (Execution time < 50ms per run)');
console.log('----------------------------------------------------------------');

const ITERATIONS = 1000;
let maxTimeSingle = 0;
let minTimeSingle = Infinity;
let totalPanchangDashaTime = 0;
let violationsCount = 0;

const startTimeGlobal = (typeof performance !== 'undefined') ? performance.now() : Date.now();

for (let i = 0; i < ITERATIONS; i++) {
    // Generate pseudo-random inputs within valid ranges
    const sLon = (i * 137.508) % 360;
    const mLon = (i * 265.419) % 360;
    const jd = 2451545.0 + (i - 500) * 365.25; // 1000 years span around J2000
    const birthDate = new Date(1900 + (i % 200), i % 12, (i % 28) + 1);

    const tStart = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    
    // Execute full Panchang and Vimshottari dasha calculations
    const panchang = AstroEngine.calculatePanchang(sLon, mLon, jd, 5.5);
    const dasha = AstroEngine.calculateVimshottari(mLon, birthDate);
    
    const tEnd = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    const duration = tEnd - tStart;

    totalPanchangDashaTime += duration;
    if (duration > maxTimeSingle) maxTimeSingle = duration;
    if (duration < minTimeSingle) minTimeSingle = duration;

    if (duration >= 50) {
        violationsCount++;
    }

    // Basic validity check on iterations to ensure no corruption during rapid loop
    if (i % 250 === 0) {
        if (!panchang.tithi || dasha.length !== 9) {
            assert(false, `Data corruption detected at iteration ${i}`);
        }
    }
}

const endTimeGlobal = (typeof performance !== 'undefined') ? performance.now() : Date.now();
const totalWallClock = endTimeGlobal - startTimeGlobal;
const avgTimePerRun = totalPanchangDashaTime / ITERATIONS;

console.log(`  📊 Benchmark Summary (1,000 iterations):`);
console.log(`     - Total wall-clock time: ${totalWallClock.toFixed(2)} ms`);
console.log(`     - Total calc time:       ${totalPanchangDashaTime.toFixed(2)} ms`);
console.log(`     - Average per calc:      ${avgTimePerRun.toFixed(4)} ms`);
console.log(`     - Min calc time:         ${minTimeSingle.toFixed(4)} ms`);
console.log(`     - Max calc time:         ${maxTimeSingle.toFixed(4)} ms`);
console.log(`     - Calls >= 50ms:         ${violationsCount}`);

assert(violationsCount === 0, `0 calculations exceeded 50ms threshold (Max single run: ${maxTimeSingle.toFixed(2)} ms)`);
assert(avgTimePerRun < 10, `Average execution time strictly < 10ms (Actual: ${avgTimePerRun.toFixed(4)} ms)`);


// -------------------------------------------------------------------------
// TEST SUITE 4: DATE CONTINUITY ACROSS ALL 729 PRATYANTARDASHA NODES
// -------------------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('4. STRESS TEST: Date Continuity across all 729 Pratyantardasha Nodes');
console.log('----------------------------------------------------------------');

const testBirthDates = [
    new Date('1900-01-01T00:00:00Z'),
    new Date('1950-06-15T12:00:00Z'),
    new Date('2000-01-01T00:00:00Z'),
    new Date('2026-07-25T11:34:07Z'),
    new Date('2100-12-31T23:59:59Z')
];

testBirthDates.forEach((bDate, bIdx) => {
    const dashaTree = AstroEngine.calculateVimshottari(45.6789, bDate); // Moon in Rohini

    let totalM = dashaTree.length;
    let totalA = 0;
    let totalP = 0;

    let nodeGaps = 0;
    let nodeOverlaps = 0;
    let invalidDates = 0;
    let nonMonotonicNodes = 0;

    let previousNodeEndDate = null;

    // Flatten all 729 Pratyantardashas into a sequence for sequential verification
    const allPratyantardashas = [];

    dashaTree.forEach((mDasha, mIndex) => {
        totalA += mDasha.antardashas.length;
        mDasha.antardashas.forEach((aDasha, aIndex) => {
            totalP += aDasha.pratyantardashas.length;

            aDasha.pratyantardashas.forEach((pDasha, pIndex) => {
                allPratyantardashas.push({
                    mIndex, aIndex, pIndex,
                    lordPath: `${mDasha.lord}-${aDasha.lord}-${pDasha.lord}`,
                    startDate: pDasha.startDate,
                    endDate: pDasha.endDate
                });
            });
        });
    });

    assert(totalM === 9 && totalA === 81 && totalP === 729,
        `BirthDate #${bIdx + 1} (${bDate.toISOString()}): Extracted exact 9 M, 81 A, 729 P nodes`);

    // Verify sequential continuity across all 729 Pratyantardasha nodes
    for (let k = 0; k < allPratyantardashas.length; k++) {
        const curr = allPratyantardashas[k];

        if (isNaN(curr.startDate.getTime()) || isNaN(curr.endDate.getTime())) {
            invalidDates++;
        }

        if (curr.startDate.getTime() >= curr.endDate.getTime()) {
            nonMonotonicNodes++;
        }

        if (previousNodeEndDate !== null) {
            const diffMs = curr.startDate.getTime() - previousNodeEndDate.getTime();
            if (diffMs > 1) nodeGaps++;
            if (diffMs < -1) nodeOverlaps++;
        }

        previousNodeEndDate = curr.endDate;
    }

    assert(invalidDates === 0, `BirthDate #${bIdx + 1}: 0 Invalid Date objects among 729 nodes`);
    assert(nonMonotonicNodes === 0, `BirthDate #${bIdx + 1}: All 729 nodes have startDate < endDate`);
    assert(nodeGaps === 0, `BirthDate #${bIdx + 1}: 0 timeline gaps (>1ms) between consecutive nodes`);
    assert(nodeOverlaps === 0, `BirthDate #${bIdx + 1}: 0 timeline overlaps (>1ms) between consecutive nodes`);
});


// -------------------------------------------------------------------------
// SUMMARY & RESULTS
// -------------------------------------------------------------------------
console.log('\n================================================================');
console.log('📋 STRESS TEST SUMMARY');
console.log('================================================================');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount > 0) {
    console.log('\nFailures breakdown:');
    failures.forEach(f => console.log(`  ${f}`));
    process.exit(1);
} else {
    console.log('\n✨ ALL STRESS TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
}
