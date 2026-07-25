/**
 * AstroDSJK — Ephemeris Engine Boundary & Stress Test Suite
 *
 * Tests adversarial edge cases:
 * 1. Leap Year Calculations (Feb 29 2000, Feb 29 2024, century leap years vs non-leap years)
 * 2. Timezone Extremes (-12 UTC to +14 UTC, sub-hour timezones, timezone equivalence)
 * 3. Extreme Latitudes (+89° N, -89° S, +90° N North Pole, -90° S South Pole)
 * 4. Boundary Longitudes near 0°/360° crossings (wrapping, precision, array indexing, Vargas)
 */

const assert = require('assert');
const AstroEngine = require('../js/astrology-engine.js');

console.log('================================================================');
console.log('=== AstroDSJK Ephemeris Engine Adversarial Boundary Test Suite ===');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const findings = [];

function testGroup(name) {
    console.log(`\n--- [TEST GROUP] ${name} ---`);
}

function runTest(description, testFn) {
    totalTests++;
    try {
        testFn();
        passedTests++;
        console.log(`✔ PASS: ${description}`);
    } catch (err) {
        failedTests++;
        console.error(`✘ FAIL: ${description}`);
        console.error(`  Details: ${err.message}`);
        findings.push({ description, error: err.message, stack: err.stack });
    }
}

// -----------------------------------------------------------------------------
// GROUP 1: LEAP YEAR & CALENDAR BOUNDARY TESTS
// -----------------------------------------------------------------------------
testGroup('1. Leap Year & Calendar Boundary Calculations');

runTest('Feb 29 2000 (Century Leap Year) Julian Day is exactly 2451604.0', () => {
    const jdFeb29 = AstroEngine.julianDay(2000, 2, 29, 12, 0, 0, 0);
    assert.strictEqual(jdFeb29, 2451604.0, `Expected 2451604.0, got ${jdFeb29}`);
});

runTest('Feb 29 2000 day continuity: Feb 28 -> Feb 29 -> Mar 1 increments by +1.0 day each step', () => {
    const jdFeb28 = AstroEngine.julianDay(2000, 2, 28, 12, 0, 0, 0);
    const jdFeb29 = AstroEngine.julianDay(2000, 2, 29, 12, 0, 0, 0);
    const jdMar01 = AstroEngine.julianDay(2000, 3, 1, 12, 0, 0, 0);

    const diff1 = jdFeb29 - jdFeb28;
    const diff2 = jdMar01 - jdFeb29;

    assert.strictEqual(diff1, 1.0, `Feb 28 to Feb 29 diff was ${diff1}, expected 1.0`);
    assert.strictEqual(diff2, 1.0, `Feb 29 to Mar 01 diff was ${diff2}, expected 1.0`);
});

runTest('Feb 29 2024 (Standard Leap Year) day continuity: Feb 28 -> Feb 29 -> Mar 1', () => {
    const jdFeb28 = AstroEngine.julianDay(2024, 2, 28, 12, 0, 0, 0);
    const jdFeb29 = AstroEngine.julianDay(2024, 2, 29, 12, 0, 0, 0);
    const jdMar01 = AstroEngine.julianDay(2024, 3, 1, 12, 0, 0, 0);

    assert.strictEqual(jdFeb29 - jdFeb28, 1.0, `Feb 28 to Feb 29 diff was ${jdFeb29 - jdFeb28}`);
    assert.strictEqual(jdMar01 - jdFeb29, 1.0, `Feb 29 to Mar 01 diff was ${jdMar01 - jdFeb29}`);
});

runTest('Century leap years vs non-leap years: 1600, 1700, 1800, 1900, 2000, 2100, 2400', () => {
    // Leap century years (divisible by 400): Feb 28 to Mar 1 has 2 days diff (Feb 29 exists)
    // Non-leap century years (divisible by 100 but not 400): Feb 28 to Mar 1 should be 1 day diff if Gregorian, or handled consistently
    const centuryCases = [
        { year: 1600, isLeap: true },
        { year: 1700, isLeap: false },
        { year: 1800, isLeap: false },
        { year: 1900, isLeap: false },
        { year: 2000, isLeap: true },
        { year: 2100, isLeap: false },
        { year: 2400, isLeap: true }
    ];

    centuryCases.forEach(({ year, isLeap }) => {
        const jdFeb28 = AstroEngine.julianDay(year, 2, 28, 12, 0, 0, 0);
        const jdMar01 = AstroEngine.julianDay(year, 3, 1, 12, 0, 0, 0);
        const diff = jdMar01 - jdFeb28;
        const expectedDiff = isLeap ? 2.0 : 1.0;

        assert.strictEqual(
            diff,
            expectedDiff,
            `Year ${year} (isLeap=${isLeap}): expected ${expectedDiff} days diff between Feb 28 and Mar 1, got ${diff}`
        );
    });
});

runTest('Behavior on invalid Feb 29 input in non-leap year (e.g. 1900-02-29, 2023-02-29)', () => {
    // If user passes 2023-02-29, does julianDay handle it as 2023-03-01?
    const jdFeb29_2023 = AstroEngine.julianDay(2023, 2, 29, 12, 0, 0, 0);
    const jdMar01_2023 = AstroEngine.julianDay(2023, 3, 1, 12, 0, 0, 0);

    // In standard astronomical JD formula, day=29 in Feb (month=14, year=2022) evaluates to March 1st.
    assert.strictEqual(
        jdFeb29_2023,
        jdMar01_2023,
        `2023-02-29 (${jdFeb29_2023}) should equal 2023-03-01 (${jdMar01_2023}) when day overflows`
    );
});


// -----------------------------------------------------------------------------
// GROUP 2: TIMEZONE EXTREME & EQUIVALENCE TESTS
// -----------------------------------------------------------------------------
testGroup('2. Timezone Extreme & Equivalence Calculations');

runTest('Julian Day calculation across extreme timezones (-12 UTC to +14 UTC)', () => {
    const tzExtremes = [-12, -11, -9.5, -5, -3.5, 0, 3.5, 5.5, 5.75, 8, 9.5, 12, 12.75, 13, 14];

    tzExtremes.forEach(tz => {
        const jd = AstroEngine.julianDay(2024, 6, 1, 12, 0, 0, tz);
        assert.ok(!isNaN(jd) && isFinite(jd), `Julian Day for tz=${tz} is invalid: ${jd}`);
    });
});

runTest('Timezone equivalence invariant: Same physical instant across UTC-12, UTC+0, UTC+5.5, UTC+14 yields identical JD & positions', () => {
    // Instant: 2024-06-01 12:00:00 UTC (tz=0)
    // Equivalent local times:
    // London (UTC+0): 2024-06-01 12:00:00
    // Kiritimati (UTC+14): 2024-06-02 02:00:00
    // Baker Island (UTC-12): 2024-06-01 00:00:00
    // India (UTC+5.5): 2024-06-01 17:30:00
    // Nepal (UTC+5.75): 2024-06-01 17:45:00
    // Newfoundland (UTC-3.5): 2024-06-01 08:30:00

    const instant_utc0  = AstroEngine.julianDay(2024, 6, 1, 12,  0, 0, 0);
    const instant_utc14 = AstroEngine.julianDay(2024, 6, 2,  2,  0, 0, 14);
    const instant_utc_neg12 = AstroEngine.julianDay(2024, 6, 1,  0,  0, 0, -12);
    const instant_utc5_5 = AstroEngine.julianDay(2024, 6, 1, 17, 30, 0, 5.5);
    const instant_utc5_75 = AstroEngine.julianDay(2024, 6, 1, 17, 45, 0, 5.75);
    const instant_utc_neg3_5 = AstroEngine.julianDay(2024, 6, 1,  8, 30, 0, -3.5);

    const targetJD = 2460463.0;

    assert.strictEqual(instant_utc0, targetJD, `UTC+0 JD expected ${targetJD}, got ${instant_utc0}`);
    assert.strictEqual(instant_utc14, targetJD, `UTC+14 JD expected ${targetJD}, got ${instant_utc14}`);
    assert.strictEqual(instant_utc_neg12, targetJD, `UTC-12 JD expected ${targetJD}, got ${instant_utc_neg12}`);
    assert.strictEqual(instant_utc5_5, targetJD, `UTC+5.5 JD expected ${targetJD}, got ${instant_utc5_5}`);
    assert.strictEqual(instant_utc5_75, targetJD, `UTC+5.75 JD expected ${targetJD}, got ${instant_utc5_75}`);
    assert.strictEqual(instant_utc_neg3_5, targetJD, `UTC-3.5 JD expected ${targetJD}, got ${instant_utc_neg3_5}`);

    // Planetary positions must be identical for all equivalent timezones
    const res0 = AstroEngine.calculatePlanets(instant_utc0, 28.6139, 77.2090);
    const res14 = AstroEngine.calculatePlanets(instant_utc14, 28.6139, 77.2090);

    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
        assert.strictEqual(
            res0[p].longitude,
            res14[p].longitude,
            `Planet ${p} longitude mismatch between UTC+0 (${res0[p].longitude}) and UTC+14 (${res14[p].longitude})`
        );
    });
});


// -----------------------------------------------------------------------------
// GROUP 3: EXTREME LATITUDE TESTS (+89° N, -89° S, +90° N, -90° S)
// -----------------------------------------------------------------------------
testGroup('3. Extreme Latitude & Polar Circle Calculations');

const JD_TEST = AstroEngine.julianDay(2024, 1, 1, 12, 0, 0, 0);

runTest('Ascendant calculation at extreme sub-polar latitudes (+89° N, -89° S, +89.9° N, -89.9° S)', () => {
    const latCases = [89.0, 89.9, -89.0, -89.9];

    latCases.forEach(lat => {
        const result = AstroEngine.calculatePlanets(JD_TEST, lat, 77.2090);
        const ascLon = result.Ascendant.longitude;

        assert.ok(!isNaN(ascLon), `Ascendant is NaN at lat=${lat}`);
        assert.ok(isFinite(ascLon), `Ascendant is non-finite at lat=${lat}`);
        assert.ok(ascLon >= 0 && ascLon < 360, `Ascendant longitude out of range [0, 360) at lat=${lat}: ${ascLon}`);
    });
});

runTest('Ascendant calculation at geographic poles (+90° North Pole, -90° South Pole)', () => {
    // Note: At lat = ±90°, Math.tan(±90 * RAD) equals ±Infinity (or huge number due to float precision).
    // Let's test if calculatePlanets survives or throws NaN/Infinity.
    const northPole = AstroEngine.calculatePlanets(JD_TEST, 90.0, 0.0);
    const southPole = AstroEngine.calculatePlanets(JD_TEST, -90.0, 0.0);

    assert.ok(!isNaN(northPole.Ascendant.longitude), `Ascendant is NaN at North Pole (+90°)`);
    assert.ok(!isNaN(southPole.Ascendant.longitude), `Ascendant is NaN at South Pole (-90°)`);
    assert.ok(isFinite(northPole.Ascendant.longitude), `Ascendant is non-finite at North Pole (+90°)`);
    assert.ok(isFinite(southPole.Ascendant.longitude), `Ascendant is non-finite at South Pole (-90°)`);
});

runTest('Planetary longitudes remain invariant with respect to latitude changes', () => {
    const delhiRes = AstroEngine.calculatePlanets(JD_TEST, 28.6139, 77.2090);
    const polarRes = AstroEngine.calculatePlanets(JD_TEST, 89.5, 77.2090);

    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach(p => {
        assert.strictEqual(
            delhiRes[p].longitude,
            polarRes[p].longitude,
            `Planet ${p} changed longitude when latitude changed from 28.6139 to 89.5`
        );
    });
});


// -----------------------------------------------------------------------------
// GROUP 4: BOUNDARY LONGITUDES NEAR 0°/360° CROSSINGS & ARRAY INDEXING
// -----------------------------------------------------------------------------
testGroup('4. Boundary Longitudes near 0°/360° Crossings');

runTest('getDegreeInfo handling at boundary longitudes: 0.0°, 360.0°, -0.0°, 359.99999999999994°', () => {
    const testLons = [
        { lon: 0.0, expectedRashi: 'Aries', expectedNak: 'Ashwini' },
        { lon: 360.0, expectedRashi: 'Aries', expectedNak: 'Ashwini' },
        { lon: -0.0, expectedRashi: 'Aries', expectedNak: 'Ashwini' },
        { lon: 359.99999999999994, expectedRashi: 'Pisces', expectedNak: 'Revati' },
        { lon: -0.0001, expectedRashi: 'Pisces', expectedNak: 'Revati' },
        { lon: 360.0001, expectedRashi: 'Aries', expectedNak: 'Ashwini' },
        { lon: 720.0, expectedRashi: 'Aries', expectedNak: 'Ashwini' },
        { lon: -360.0, expectedRashi: 'Aries', expectedNak: 'Ashwini' }
    ];

    testLons.forEach(({ lon, expectedRashi, expectedNak }) => {
        const info = AstroEngine.getDegreeInfo(lon);
        assert.ok(info.rashiName, `getDegreeInfo(${lon}) returned undefined rashiName`);
        assert.ok(info.nakshatraName, `getDegreeInfo(${lon}) returned undefined nakshatraName`);
        assert.strictEqual(info.rashiName, expectedRashi, `lon=${lon}: expected Rashi ${expectedRashi}, got ${info.rashiName}`);
        assert.strictEqual(info.nakshatraName, expectedNak, `lon=${lon}: expected Nakshatra ${expectedNak}, got ${info.nakshatraName}`);
    });
});

runTest('calculateVargas (D1-D60) at exact sign boundaries: 0°, 30°, 60°, 359.9999°, 360°', () => {
    const samplePlanets = {
        ayanamsa: 23.85,
        Sun: { longitude: 0.0 },
        Moon: { longitude: 30.0 },
        Mars: { longitude: 59.99999 },
        Mercury: { longitude: 359.99999 },
        Venus: { longitude: 360.0 },
        Jupiter: { longitude: -0.0001 }
    };

    const vargas = AstroEngine.calculateVargas(samplePlanets);
    const expectedVargaKeys = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    const sampleEntities = ['Sun', 'Moon', 'Mars', 'Mercury', 'Venus', 'Jupiter'];

    expectedVargaKeys.forEach(vKey => {
        assert.ok(vargas[vKey], `Varga ${vKey} missing from calculateVargas result`);
        sampleEntities.forEach(ent => {
            const rVal = vargas[vKey][ent];
            assert.ok(
                typeof rVal === 'number' && Number.isInteger(rVal) && rVal >= 1 && rVal <= 12,
                `Varga ${vKey} for ${ent} (lon=${samplePlanets[ent].longitude}) returned invalid Rashi value: ${rVal}`
            );
        });
    });
});

runTest('Panchang & Vimshottari at exact 0°, 360°, 359.9999° boundary longitudes', () => {
    // Panchang test
    const panchang1 = AstroEngine.calculatePanchang(0.0, 0.0, 0); // New Moon at 0°
    assert.ok(panchang1.tithiName, 'Panchang tithiName missing for 0°/0°');
    assert.ok(panchang1.nakshatraName, 'Panchang nakshatraName missing for 0°/0°');

    const panchang2 = AstroEngine.calculatePanchang(359.999, 0.001, 1);
    assert.ok(panchang2.tithiName, 'Panchang tithiName missing for 359.999°/0.001°');

    // Vimshottari test
    const dasha1 = AstroEngine.calculateVimshottari(0.0, '2000-01-01');
    assert.strictEqual(dasha1[0].planet, 'Ketu', `Dasha at 0.0° should start with Ketu (Ashwini)`);

    const dasha2 = AstroEngine.calculateVimshottari(359.9999, '2000-01-01');
    assert.strictEqual(dasha2[0].planet, 'Mercury', `Dasha at 359.9999° should start with Mercury (Revati)`);

    const dasha3 = AstroEngine.calculateVimshottari(360.0, '2000-01-01');
    assert.strictEqual(dasha3[0].planet, 'Ketu', `Dasha at 360.0° should wrap to Ketu (Ashwini)`);
});

runTest('Retrograde & Velocity continuity across 0°/360° crossing', () => {
    // Test planet crossing 0° longitude (e.g. from 359.5° to 0.5°)
    // We test calculatePlanets near dates where Sun or Moon crosses 0°
    // Sun reaches 0° sidereal around April 14 (Mesha Sankranti)
    const jdSankranti = AstroEngine.julianDay(2024, 4, 13, 12, 0, 0, 0);
    const resSankranti = AstroEngine.calculatePlanets(jdSankranti, 28.6139, 77.2090);

    const sunSpeed = resSankranti.Sun.speed;
    assert.ok(
        sunSpeed > 0.9 && sunSpeed < 1.1,
        `Sun speed during 0° crossing was ${sunSpeed}°/day (expected ~0.98°/day, not wrapped speed spike)`
    );
    assert.strictEqual(resSankranti.Sun.isRetrograde, false, 'Sun should not be marked retrograde during 0° crossing');
});


// -----------------------------------------------------------------------------
// SUMMARY & RESULTS REPORT
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TEST RESULTS SUMMARY:`);
console.log(`  Total Executed Tests: ${totalTests}`);
console.log(`  Passed Tests:        ${passedTests}`);
console.log(`  Failed Tests:        ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
    console.error(`✘ SUITE FAILED WITH ${failedTests} FAILURE(S).`);
    process.exit(1);
} else {
    console.log(`✔ ALL ${totalTests} BOUNDARY TESTS PASSED SUCCESSFULLY!`);
    process.exit(0);
}
