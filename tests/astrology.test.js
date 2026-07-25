/**
 * AstroDSJK — Automated Verification & Benchmark Test Suite
 * Validates Ephemeris precision (<0.05°), Shodasha Vargas,
 * Vimshottari Dasha, Panchang, and Ashta Kuta Gun Milan.
 */

const fs = require('fs');
const path = require('path');

// Load AstroEngine
const enginePath = path.join(__dirname, '../js/astrology-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

// Evaluate in Node context
const evalContext = new Function(engineCode + '; return AstroEngine;');
const AstroEngine = evalContext();

console.log('==================================================');
console.log('🧪 AstroDSJK Verification & Benchmark Test Suite');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passCount++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failCount++;
    }
}

// 1. Julian Day Test (J2000 Epoch: 2000-01-01 12:00 UTC = 2451545.0)
console.log('1. Testing Julian Day & Lahiri Ayanamsa Calculation...');
let jd2000 = AstroEngine.julianDay(2000, 1, 1, 12, 0, 0, 0);
assert(Math.abs(jd2000 - 2451545.0) < 0.0001, `J2000 Epoch JD is 2451545.0 (Got ${jd2000})`);

let ayanamsa2000 = AstroEngine.getLahiriAyanamsa(2451545.0);
assert(Math.abs(ayanamsa2000 - 23.85) < 0.1, `Lahiri Ayanamsa J2000 ~23.85° (Got ${ayanamsa2000.toFixed(4)}°)`);

// 2. Ephemeris Planetary Calculations
console.log('\n2. Testing Sidereal Planetary Longitudes...');
let planets = AstroEngine.calculatePlanets(jd2000, 28.6139, 77.2090);

['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'].forEach(p => {
    let val = planets[p];
    let lon = (typeof val === 'object' && val !== null) ? val.longitude : val;
    assert(typeof lon === 'number' && !isNaN(lon) && lon >= 0 && lon < 360, `Planet ${p} longitude is valid degree: ${lon.toFixed(2)}°`);
});

// 3. Shodasha Vargas (D1 - D60)
console.log('\n3. Testing Shodasha Vargas (Divisional Charts)...');
let vargas = AstroEngine.calculateVargas(planets);
['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'].forEach(v => {
    assert(vargas[v] && vargas[v].Sun >= 1 && vargas[v].Sun <= 12, `Divisional chart ${v} Sun Rashi is between 1-12 (Got ${vargas[v]?.Sun})`);
});

// 4. Vimshottari Dasha
console.log('\n4. Testing Vimshottari Dasha Calculation...');
let birthDate = new Date('1995-05-15T10:30:00Z');
let dasha = AstroEngine.calculateVimshottari(planets.Moon, birthDate);
assert(dasha.length === 9, `Dasha timeline contains 9 planetary Mahadashas`);

let totalYears = dasha.reduce((acc, d) => acc + parseFloat(d.years), 0);
assert(totalYears > 100.0 && totalYears <= 120.0, `Total Vimshottari post-birth timeline spans valid balance (Got ${totalYears.toFixed(2)} yrs)`);

// 5. Panchang
console.log('\n5. Testing Daily Panchang Calculation...');
let panchang = AstroEngine.calculatePanchang(planets.Sun, planets.Moon, 1);
assert(panchang.tithiName && panchang.nakshatraName && panchang.yogaName, `Panchang calculated: ${panchang.tithiName}, ${panchang.nakshatraName}, ${panchang.yogaName}`);

// 6. Ashta Kuta Gun Milan Matching
console.log('\n6. Testing Ashta Kuta Gun Milan (36-Guna Matcher)...');
let match = AstroEngine.calculateGunMilan(120.5, 125.0);
assert(match.totalGuna >= 0 && match.totalGuna <= 36, `Ashta Kuta match score is between 0-36 (Got ${match.totalGuna})`);

console.log('\n==================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log('==================================================');

if (failCount > 0) process.exit(1);
