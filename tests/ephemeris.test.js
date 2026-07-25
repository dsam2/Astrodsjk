/**
 * AstroDSJK — Ephemeris & Astronomical Engine Unit & Benchmark Tests
 * Verifies planetary longitudes within 0.05° Lahiri benchmark across multi-date epochs,
 * Lagna accuracy, Rahu/Ketu sidereal conversion, Shodasha Vargas (D1-D60) population,
 * D10 even-sign Varga start correctness, and daily velocity / retrograde determination.
 */

const assert = require('assert');
const AstroEngine = require('../js/astrology-engine.js');

console.log('=== Running AstroDSJK Ephemeris & Astronomical Engine Tests ===\n');

let totalTests = 0;
let passedTests = 0;

function runTest(description, testFn) {
    totalTests++;
    try {
        testFn();
        passedTests++;
        console.log(`✔ PASS: ${description}`);
    } catch (err) {
        console.error(`✘ FAIL: ${description}`);
        console.error(`  Error: ${err.message}`);
        throw err;
    }
}

// 1. Julian Day & Lahiri Ayanamsa Test
const JD_J2000 = AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 0);
const LAT_DELHI = 28.6139;
const LNG_DELHI = 77.2090;

runTest('Julian Day determination at J2000.0 epoch equals 2451545.0', () => {
    assert.strictEqual(JD_J2000, 2451545.0, `Expected 2451545.0, got ${JD_J2000}`);
});

runTest('Lahiri Ayanamsa at J2000.0 is approximately 23.853°', () => {
    const ayanamsa = AstroEngine.getLahiriAyanamsa(JD_J2000);
    const diff = Math.abs(ayanamsa - 23.853056);
    assert.ok(diff < 0.01, `Ayanamsa diff ${diff} exceeds 0.01° tolerance`);
});

// 2. Multi-Date Planetary Benchmark Verification (<0.05° requirement)
const MULTI_DATE_BENCHMARKS = [
    {
        name: 'J2000.0 Epoch (2000-01-01 12:00:00 UTC)',
        y: 2000, m: 1, d: 1, h: 12, min: 0, s: 0, tz: 0,
        targets: {
            Sun: 256.5284,
            Moon: 199.4187,
            Mercury: 248.0540,
            Venus: 217.7262,
            Mars: 304.1233,
            Jupiter: 1.4671,
            Saturn: 16.5498,
            Rahu: 101.1915,
            Ketu: 281.1915,
            Lagna: 76.3420
        }
    },
    {
        name: '2025 Epoch (2025-01-01 12:00:00 UTC)',
        y: 2025, m: 1, d: 1, h: 12, min: 0, s: 0, tz: 0,
        targets: {
            Sun: 257.1281,
            Moon: 276.5137,
            Mercury: 236.3227,
            Venus: 304.0518,
            Mars: 97.5606,
            Jupiter: 48.9411,
            Saturn: 320.4115,
            Rahu: 337.2688,
            Ketu: 157.2688,
            Lagna: 76.8134
        }
    },
    {
        name: '2026 Epoch (2026-07-25 12:00:00 UTC)',
        y: 2026, m: 7, d: 25, h: 12, min: 0, s: 0, tz: 0,
        targets: {
            Sun: 98.3564,
            Moon: 233.0769,
            Mercury: 82.2078,
            Venus: 142.9950,
            Mars: 54.4284,
            Jupiter: 101.2859,
            Saturn: 350.5339,
            Rahu: 307.0633,
            Ketu: 127.0633,
            Lagna: 252.0552
        }
    },
    {
        name: '1985 Historical Epoch (1985-05-15 12:00:00 UTC)',
        y: 1985, m: 5, d: 15, h: 12, min: 0, s: 0, tz: 0,
        targets: {
            Sun: 30.9549,
            Moon: 343.0385,
            Mercury: 8.5080,
            Venus: 349.3220,
            Mars: 49.5388,
            Jupiter: 292.7112,
            Saturn: 211.1912,
            Rahu: 24.3807,
            Ketu: 204.3807,
            Lagna: 191.6159
        }
    }
];

MULTI_DATE_BENCHMARKS.forEach(epoch => {
    const jd = AstroEngine.julianDay(epoch.y, epoch.m, epoch.d, epoch.h, epoch.min, epoch.s, epoch.tz);
    const res = AstroEngine.calculatePlanets(jd, LAT_DELHI, LNG_DELHI);

    for (const body in epoch.targets) {
        const target = epoch.targets[body];
        const actual = res[body].longitude;

        runTest(`Accuracy for ${body} on ${epoch.name} within 0.05° (${target}°)`, () => {
            let diff = Math.abs(actual - target);
            if (diff > 180) diff = 360 - diff;
            assert.ok(
                diff <= 0.05,
                `${body} calculated ${actual.toFixed(4)}° differs from benchmark ${target}° by ${diff.toFixed(4)}° (exceeds 0.05° threshold)`
            );
        });
    }
});

// 3. Lagna Property Alias & Accuracy Test
const planetsResult = AstroEngine.calculatePlanets(JD_J2000, LAT_DELHI, LNG_DELHI);

runTest('Lagna property alias presence and equivalence to Ascendant', () => {
    assert.ok(planetsResult.Lagna, 'Lagna property must exist in calculatePlanets return object');
    assert.strictEqual(planetsResult.Lagna.longitude, planetsResult.Ascendant.longitude, 'Lagna longitude must match Ascendant longitude');
});

// 4. Rahu / Ketu Sidereal Correctness Test
runTest('Rahu and Ketu sidereal longitude conversion correctness', () => {
    const rahuLon = planetsResult.Rahu.longitude;
    const ketuLon = planetsResult.Ketu.longitude;

    let nodesDiff = Math.abs((ketuLon - rahuLon + 360) % 360 - 180);
    assert.ok(nodesDiff < 0.0001, `Ketu is not 180° opposite Rahu (diff=${nodesDiff})`);

    assert.ok(Math.abs(rahuLon - 125.0445) > 10, 'Rahu appears to be output in Tropical longitude rather than Sidereal');
    assert.strictEqual(planetsResult.Rahu.isRetrograde, true, 'Rahu must be marked as retrograde');
    assert.strictEqual(planetsResult.Ketu.isRetrograde, true, 'Ketu must be marked as retrograde');
});

// 5. Population of all 16 Shodasha Vargas & D10 Even Sign Start Fix
runTest('Population of all 16 Parashari Shodasha Vargas (D1-D60) & D10 Even Sign Start Fix', () => {
    const vargas = AstroEngine.calculateVargas(planetsResult);
    const expectedVargas = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];
    const expectedEntities = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    expectedVargas.forEach(vargaKey => {
        assert.ok(vargas[vargaKey], `Varga chart ${vargaKey} is missing from calculateVargas result`);
        expectedEntities.forEach(entity => {
            const rashiVal = vargas[vargaKey][entity];
            assert.ok(
                typeof rashiVal === 'number' && Number.isInteger(rashiVal) && rashiVal >= 1 && rashiVal <= 12,
                `Varga ${vargaKey} entity ${entity} invalid Rashi value: ${rashiVal}`
            );
        });
    });

    // Specific D10 even sign start test: Taurus (even, rashiNum 2) at 0° should yield (2+8)=10 (Capricorn)
    const mockTaurusPlanet = { TestBody: { longitude: 30.5 } }; // 0° 30' Taurus (sign 2)
    const taurusVargas = AstroEngine.calculateVargas(mockTaurusPlanet);
    assert.strictEqual(taurusVargas.D10.TestBody, 10, 'D10 for 0° Taurus (even sign) must start at 9th sign (Capricorn, sign 10)');
});

// 6. Daily Velocity & Retrograde Detection Test
runTest('Planetary daily velocity and retrograde status determination', () => {
    const expectedEntities = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

    expectedEntities.forEach(entity => {
        const pObj = planetsResult[entity];
        assert.ok(typeof pObj.speed === 'number', `${entity} missing numeric speed property`);
        assert.ok(typeof pObj.isRetrograde === 'boolean', `${entity} missing boolean isRetrograde property`);
        assert.ok(typeof pObj.sign === 'number' && pObj.sign >= 1 && pObj.sign <= 12, `${entity} invalid sign property: ${pObj.sign}`);
        assert.ok(typeof pObj.degreeInSign === 'number' && pObj.degreeInSign >= 0 && pObj.degreeInSign < 30, `${entity} invalid degreeInSign: ${pObj.degreeInSign}`);
    });

    assert.strictEqual(planetsResult.Sun.isRetrograde, false, 'Sun should never be retrograde');
    assert.strictEqual(planetsResult.Moon.isRetrograde, false, 'Moon should never be retrograde');
    assert.strictEqual(planetsResult.Rahu.isRetrograde, true, 'Rahu must be retrograde');
    assert.strictEqual(planetsResult.Ketu.isRetrograde, true, 'Ketu must be retrograde');
});

console.log(`\n==================================================`);
console.log(`All ${passedTests}/${totalTests} Ephemeris tests passed successfully!`);
console.log(`==================================================\n`);
