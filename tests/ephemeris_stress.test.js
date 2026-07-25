/**
 * AstroDSJK — Ephemeris Engine 10,000 Random Epoch Stress & Property-Based Test Harness
 * Milestone 1 / Challenger 1
 * 
 * Verifies:
 * 1. 10,000 random Julian Days across 1000 CE to 3000 CE with random global coordinates.
 * 2. No NaN, null, undefined, or Infinity values produced.
 * 3. All longitudes strictly satisfy 0 <= lon < 360.
 * 4. All Shodasha Varga (D1-D60) sign indices strictly fall within [1, 12].
 * 5. Motion continuity over continuous time windows without teleportations.
 * 6. Adversarial boundary conditions (polar latitudes, exact rashi cusps, float micro-offsets).
 */

const assert = require('assert');
const AstroEngine = require('../js/astrology-engine.js');

console.log('================================================================');
console.log('  AstroDSJK Ephemeris Stress Harness — 10,000 Random Epochs  ');
console.log('================================================================\n');

const NUM_EPISODES = 10000;
const MIN_YEAR = 1000;
const MAX_YEAR = 3000;

// Convert 1000 CE Jan 1 and 3000 CE Dec 31 to Julian Days
const MIN_JD = AstroEngine.julianDay(MIN_YEAR, 1, 1, 0, 0, 0, 0);
const MAX_JD = AstroEngine.julianDay(MAX_YEAR, 12, 31, 23, 59, 59, 0);

const PLANET_NAMES = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const VARGA_NAMES = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'];

let stats = {
    totalEpochsTested: 0,
    nanNullInfinityErrors: 0,
    longitudeOutOfBounds: 0,
    vargaOutOfBounds: 0,
    degreeInSignOutOfBounds: 0,
    signIndexOutOfBounds: 0,
    continuityFailures: 0,
    adversarialFailures: 0,
    failedEpochDetails: []
};

function randomFloat(min, max) {
    return min + Math.random() * (max - min);
}

function isFiniteNum(val) {
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
}

// -----------------------------------------------------------------------------
// Test 1: 10,000 Random Epoch Stress Verification
// -----------------------------------------------------------------------------
console.log(`[Suite 1] Executing ${NUM_EPISODES.toLocaleString()} random epoch calculations across [${MIN_YEAR} CE - ${MAX_YEAR} CE]...`);
const startTime = Date.now();

for (let i = 1; i <= NUM_EPISODES; i++) {
    const randomJD = randomFloat(MIN_JD, MAX_JD);
    const randomLat = randomFloat(-89.9, 89.9);
    const randomLng = randomFloat(-180, 180);

    try {
        // 1. Calculate planets
        const planets = AstroEngine.calculatePlanets(randomJD, randomLat, randomLng);
        stats.totalEpochsTested++;

        // Ayanamsa check
        if (!isFiniteNum(planets.ayanamsa)) {
            stats.nanNullInfinityErrors++;
            stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `ayanamsa is invalid: ${planets.ayanamsa}` });
        }

        // Check each celestial entity
        PLANET_NAMES.forEach(name => {
            const p = planets[name];
            if (!p) {
                stats.nanNullInfinityErrors++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `Missing planet object for ${name}` });
                return;
            }

            // Lon check [0, 360)
            if (!isFiniteNum(p.longitude)) {
                stats.nanNullInfinityErrors++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `${name} longitude is non-finite: ${p.longitude}` });
            } else if (p.longitude < 0 || p.longitude >= 360) {
                stats.longitudeOutOfBounds++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `${name} longitude out of [0, 360): ${p.longitude}` });
            }

            // Speed check
            if (!isFiniteNum(p.speed)) {
                stats.nanNullInfinityErrors++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `${name} speed is non-finite: ${p.speed}` });
            }

            // Sign check [1, 12]
            if (!Number.isInteger(p.sign) || p.sign < 1 || p.sign > 12) {
                stats.signIndexOutOfBounds++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `${name} sign out of [1, 12]: ${p.sign}` });
            }

            // Degree in sign [0, 30)
            if (!isFiniteNum(p.degreeInSign) || p.degreeInSign < 0 || p.degreeInSign >= 30) {
                stats.degreeInSignOutOfBounds++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `${name} degreeInSign out of [0, 30): ${p.degreeInSign}` });
            }
        });

        // 2. Shodasha Vargas calculation
        const vargas = AstroEngine.calculateVargas(planets);
        VARGA_NAMES.forEach(vKey => {
            if (!vargas[vKey]) {
                stats.nanNullInfinityErrors++;
                stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `Missing Varga chart ${vKey}` });
                return;
            }
            PLANET_NAMES.forEach(name => {
                const signVal = vargas[vKey][name];
                if (!Number.isInteger(signVal) || signVal < 1 || signVal > 12) {
                    stats.vargaOutOfBounds++;
                    stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `Varga ${vKey} for ${name} invalid sign: ${signVal}` });
                }
            });
        });

        // 3. Auxiliary engine functions check
        const moonDegInfo = AstroEngine.getDegreeInfo(planets.Moon);
        if (!moonDegInfo || !isFiniteNum(moonDegInfo.totalDeg) || moonDegInfo.rashiIndex < 1 || moonDegInfo.rashiIndex > 12 || moonDegInfo.pada < 1 || moonDegInfo.pada > 4) {
            stats.nanNullInfinityErrors++;
            stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `getDegreeInfo returned invalid structure for Moon` });
        }

        const panchang = AstroEngine.calculatePanchang(planets.Sun, planets.Moon, Math.floor(Math.random() * 7));
        if (!panchang || !panchang.tithiName || !panchang.nakshatraName || !panchang.yogaName || !panchang.karanaName) {
            stats.nanNullInfinityErrors++;
            stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `calculatePanchang returned invalid structure` });
        }

        const match = AstroEngine.calculateGunMilan(planets.Moon, planets.Sun);
        if (!match || !isFiniteNum(match.totalGuna) || match.totalGuna < 0 || match.totalGuna > 36) {
            stats.nanNullInfinityErrors++;
            stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `calculateGunMilan returned invalid totalGuna: ${match?.totalGuna}` });
        }

    } catch (err) {
        stats.nanNullInfinityErrors++;
        stats.failedEpochDetails.push({ epoch: i, jd: randomJD, issue: `Exception thrown: ${err.message}` });
    }
}

const elapsedMs = Date.now() - startTime;
console.log(`✔ Completed 10,000 epoch stress run in ${elapsedMs} ms (${(elapsedMs / 1000).toFixed(2)}s).\n`);

// -----------------------------------------------------------------------------
// Test 2: Motion Continuity and Boundary Smoothness Check
// -----------------------------------------------------------------------------
console.log('[Suite 2] Testing Motion Continuity across continuous trajectory sampling...');

let continuityPassed = true;
const trajectorySteps = 500;
const startJD = AstroEngine.julianDay(2024, 1, 1, 0, 0, 0, 0);
const dtDays = 1 / 24; // 1-hour steps over ~20 days

let prevPlanets = AstroEngine.calculatePlanets(startJD, 28.6139, 77.2090);

for (let step = 1; step <= trajectorySteps; step++) {
    const curJD = startJD + step * dtDays;
    const curPlanets = AstroEngine.calculatePlanets(curJD, 28.6139, 77.2090);

    PLANET_NAMES.forEach(name => {
        const pPrev = prevPlanets[name];
        const pCur = curPlanets[name];

        let diff = pCur.longitude - pPrev.longitude;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        const maxAllowedHourlyMotion = name === 'Ascendant' ? 25.0 : name === 'Moon' ? 2.0 : 1.0;

        if (Math.abs(diff) > maxAllowedHourlyMotion) {
            continuityPassed = false;
            stats.continuityFailures++;
            console.error(`✘ Discontinuity detected for ${name} at step ${step} (JD=${curJD}): diff=${diff.toFixed(4)}° exceeds limit ${maxAllowedHourlyMotion}°/hr`);
        }
    });

    prevPlanets = curPlanets;
}

if (continuityPassed) {
    console.log(`✔ Continuous motion verified: ${trajectorySteps} trajectory steps showed smooth motion without teleportations.\n`);
}

// -----------------------------------------------------------------------------
// Test 3: Adversarial Boundary & Micro-Cusp Stress Testing
// -----------------------------------------------------------------------------
console.log('[Suite 3] Testing Adversarial Polar Coordinates & Micro-Cusp Boundaries...');

let adversarialPassed = true;

// Extreme / Cusp Test Inputs
const cuspLongitudes = [
    0.0, 0.0000001, 29.9999999, 30.0, 59.9999999, 60.0,
    119.9999999, 120.0, 179.9999999, 180.0, 359.9999999, 359.9999999999999, 360.0
];

cuspLongitudes.forEach(lon => {
    const testPlanets = {
        ayanamsa: 23.85,
        Sun: lon,
        Moon: (lon + 30) % 360,
        Mars: (lon + 60) % 360
    };
    try {
        const vargas = AstroEngine.calculateVargas(testPlanets);
        VARGA_NAMES.forEach(vKey => {
            const rSun = vargas[vKey].Sun;
            if (!Number.isInteger(rSun) || rSun < 1 || rSun > 12) {
                adversarialPassed = false;
                stats.adversarialFailures++;
                console.error(`✘ Cusp failure for lon=${lon}: Varga ${vKey} sign=${rSun}`);
            }
        });
    } catch (err) {
        adversarialPassed = false;
        stats.adversarialFailures++;
        console.error(`✘ Exception at cusp lon=${lon}: ${err.message}`);
    }
});

// Polar Coordinates Check (Lat = 90, -90, 89.999, -89.999)
const polarLats = [90, -90, 89.9999, -89.9999];
polarLats.forEach(lat => {
    try {
        const planets = AstroEngine.calculatePlanets(2451545.0, lat, 77.2090);
        if (!isFiniteNum(planets.Ascendant.longitude) || planets.Ascendant.longitude < 0 || planets.Ascendant.longitude >= 360) {
            adversarialPassed = false;
            stats.adversarialFailures++;
            console.error(`✘ Polar lat failure at lat=${lat}: Ascendant lon=${planets.Ascendant.longitude}`);
        }
    } catch (err) {
        adversarialPassed = false;
        stats.adversarialFailures++;
        console.error(`✘ Exception at polar lat=${lat}: ${err.message}`);
    }
});

if (adversarialPassed) {
    console.log('✔ Adversarial boundary & polar coordinate checks verified successfully.\n');
}

// -----------------------------------------------------------------------------
// Results Summary & Assertions
// -----------------------------------------------------------------------------
console.log('================================================================');
console.log('                     STRESS TEST RESULTS SUMMARY                 ');
console.log('================================================================');
console.log(`Total Epochs Tested       : ${stats.totalEpochsTested.toLocaleString()}`);
console.log(`NaN/Null/Infinity Errors   : ${stats.nanNullInfinityErrors}`);
console.log(`Longitude Out of [0, 360) : ${stats.longitudeOutOfBounds}`);
console.log(`Sign Out of [1, 12]       : ${stats.signIndexOutOfBounds}`);
console.log(`DegreeInSign Out of [0,30): ${stats.degreeInSignOutOfBounds}`);
console.log(`Varga Sign Out of [1, 12] : ${stats.vargaOutOfBounds}`);
console.log(`Continuity Failures       : ${stats.continuityFailures}`);
console.log(`Adversarial Failures      : ${stats.adversarialFailures}`);
console.log('================================================================\n');

try {
    assert.strictEqual(stats.nanNullInfinityErrors, 0, `Encountered ${stats.nanNullInfinityErrors} NaN/Null/Infinity errors`);
    assert.strictEqual(stats.longitudeOutOfBounds, 0, `Encountered ${stats.longitudeOutOfBounds} longitude out-of-bounds errors`);
    assert.strictEqual(stats.signIndexOutOfBounds, 0, `Encountered ${stats.signIndexOutOfBounds} sign index out-of-bounds errors`);
    assert.strictEqual(stats.degreeInSignOutOfBounds, 0, `Encountered ${stats.degreeInSignOutOfBounds} degreeInSign out-of-bounds errors`);
    assert.strictEqual(stats.vargaOutOfBounds, 0, `Encountered ${stats.vargaOutOfBounds} Varga out-of-bounds errors`);
    assert.strictEqual(stats.continuityFailures, 0, `Encountered ${stats.continuityFailures} continuity failures`);
    assert.strictEqual(stats.adversarialFailures, 0, `Encountered ${stats.adversarialFailures} adversarial boundary failures`);
    console.log('SUCCESS: All 10,000 epoch stress tests and property invariants PASSED!\n');
} catch (err) {
    console.error(`FAILURE: ${err.message}\n`);
    if (stats.failedEpochDetails.length > 0) {
        console.error('First 5 Failed Epoch Samples:');
        console.error(JSON.stringify(stats.failedEpochDetails.slice(0, 5), null, 2));
    }
    process.exit(1);
}
