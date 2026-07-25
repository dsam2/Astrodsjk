/**
 * AstroDSJK — Milestone 3 Panchang & Vimshottari Dasha Test Suite
 * Tests 5 Panchang limbs, 60 Karana mapping, 3-tier Vimshottari Dasha hierarchy,
 * millisecond date precision, boundary dates, benchmark charts, and <50ms execution performance.
 */

const fs = require('fs');
const path = require('path');

// Load AstroEngine
const enginePath = path.join(__dirname, '../js/astrology-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

const evalContext = new Function(engineCode + '; return AstroEngine;');
const AstroEngine = evalContext();

console.log('================================================================');
console.log('🧪 AstroDSJK Milestone 3: Panchang & Vimshottari Test Suite');
console.log('================================================================\n');

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

// -------------------------------------------------------------------------
// 1. PANCHANG UNIT TESTS
// -------------------------------------------------------------------------
console.log('1. Testing Panchang Tithi, Paksha, Vara, Nakshatra, Yoga & Karana...');

// 1.1 Tithi & Paksha Boundaries
let p1 = AstroEngine.calculatePanchang(0, 5, 2451545.0, 5.5); // diff = 5° -> Shukla Pratipada
assert(p1.tithi.number === 1 && p1.tithi.name === 'Pratipada' && p1.paksha === 'Shukla',
    `Tithi 1 (0-12° diff) is Shukla Pratipada (Got ${p1.tithi.name}, ${p1.paksha})`);

let p15 = AstroEngine.calculatePanchang(0, 175, 2451545.0, 5.5); // diff = 175° -> Shukla Purnima
assert(p15.tithi.number === 15 && p15.tithi.name === 'Purnima' && p15.paksha === 'Shukla',
    `Tithi 15 (168-180° diff) is Shukla Purnima (Got ${p15.tithi.name}, ${p15.paksha})`);

let p16 = AstroEngine.calculatePanchang(0, 185, 2451545.0, 5.5); // diff = 185° -> Krishna Pratipada
assert(p16.tithi.number === 16 && p16.tithi.name === 'Pratipada' && p16.paksha === 'Krishna' && p16.tithi.pakshaTithi === 1,
    `Tithi 16 (180-192° diff) is Krishna Pratipada (Got ${p16.tithi.name}, ${p16.paksha})`);

let p30 = AstroEngine.calculatePanchang(0, 355, 2451545.0, 5.5); // diff = 355° -> Krishna Amavasya
assert(p30.tithi.number === 30 && p30.tithi.name === 'Amavasya' && p30.paksha === 'Krishna' && p30.tithi.pakshaTithi === 15,
    `Tithi 30 (348-360° diff) is Krishna Amavasya (Got ${p30.tithi.name}, ${p30.paksha})`);

// 1.2 Authentic 60 Half-Tithi Karana Map
let k1 = AstroEngine.calculatePanchang(0, 3, 2451545.0, 5.5); // diff = 3° (half-tithi 1) -> Kintughna
assert(k1.karana.name === 'Kintughna' && k1.karana.type === 'Fixed' && k1.karana.halfTithi === 1,
    `Half-tithi 1 (0-6°) fixed Karana is Kintughna (Got ${k1.karana.name})`);

let k2 = AstroEngine.calculatePanchang(0, 9, 2451545.0, 5.5); // diff = 9° (half-tithi 2) -> Bava
assert(k2.karana.name === 'Bava' && k2.karana.type === 'Movable',
    `Half-tithi 2 (6-12°) movable Karana is Bava (Got ${k2.karana.name})`);

let k8 = AstroEngine.calculatePanchang(0, 45, 2451545.0, 5.5); // diff = 45° (half-tithi 8) -> Vishti (Bhadra)
assert(k8.karana.name === 'Vishti (Bhadra)' && k8.karana.type === 'Movable',
    `Half-tithi 8 (42-48°) movable Karana is Vishti (Bhadra) (Got ${k8.karana.name})`);

let k57 = AstroEngine.calculatePanchang(0, 345, 2451545.0, 5.5); // diff = 345° (half-tithi 58, 0-based 57) -> Shakuni
assert(k57.karana.name === 'Shakuni' && k57.karana.type === 'Fixed',
    `Half-tithi 58 / index 57 (342-348°) fixed Karana is Shakuni (Got ${k57.karana.name})`);

let k58 = AstroEngine.calculatePanchang(0, 351, 2451545.0, 5.5); // diff = 351° (half-tithi 59, 0-based 58) -> Chatushpada
assert(k58.karana.name === 'Chatushpada' && k58.karana.type === 'Fixed',
    `Half-tithi 59 / index 58 (348-354°) fixed Karana is Chatushpada (Got ${k58.karana.name})`);

let k59 = AstroEngine.calculatePanchang(0, 357, 2451545.0, 5.5); // diff = 357° (half-tithi 60, 0-based 59) -> Naga
assert(k59.karana.name === 'Naga' && k59.karana.type === 'Fixed',
    `Half-tithi 60 / index 59 (354-360°) fixed Karana is Naga (Got ${k59.karana.name})`);

// 1.3 Nakshatra, Yoga, Vara
let nak1 = AstroEngine.calculatePanchang(0, 5.0, 2451545.0, 5.5);
assert(nak1.nakshatra.name === 'Ashwini' && nak1.nakshatra.lord === 'Ketu' && nak1.nakshatra.pada === 2,
    `Nakshatra for Moon at 5° is Ashwini Pada 2 (Got ${nak1.nakshatra.name} Pada ${nak1.nakshatra.pada})`);

let yoga1 = AstroEngine.calculatePanchang(2.0, 3.0, 2451545.0, 5.5); // sum = 5° -> Vishkambha
assert(yoga1.yoga.id === 1 && yoga1.yoga.name === 'Vishkambha',
    `Yoga for Sun 2° + Moon 3° is Vishkambha (Got ${yoga1.yoga.name})`);

let vara1 = AstroEngine.calculatePanchang(0, 0, 2451545.0, 0); // J2000 12:00 UTC = Saturday
assert(vara1.vara.english === 'Saturday' && vara1.vara.name === 'Shanivara',
    `Vara for JD 2451545.0 is Saturday (Shanivara) (Got ${vara1.vara.name})`);


// -------------------------------------------------------------------------
// 2. VIMSHOTTARI DASHA 3-TIER HIERARCHY TESTS
// -------------------------------------------------------------------------
console.log('\n2. Testing 3-Tier Vimshottari Dasha Hierarchy (Mahadasha -> Antardasha -> Pratyantardasha)...');

let birth = new Date('2000-01-01T00:00:00Z');
let dashaTree = AstroEngine.calculateVimshottari(0.0, birth); // Moon at 0° Ashwini

assert(Array.isArray(dashaTree) && dashaTree.length === 9,
    `Vimshottari returns 9 Mahadashas (Got ${dashaTree.length})`);

// Check 1st Mahadasha structure
let m0 = dashaTree[0];
assert(m0.lord === 'Ketu' && m0.startDate instanceof Date && m0.endDate instanceof Date,
    `1st Mahadasha lord is Ketu with valid Date objects`);

assert(Array.isArray(m0.antardashas) && m0.antardashas.length === 9,
    `Each Mahadasha contains 9 Antardashas (Got ${m0.antardashas.length})`);

let a0 = m0.antardashas[0];
assert(a0.lord === 'Ketu' && a0.startDate instanceof Date && a0.endDate instanceof Date,
    `1st Antardasha in Ketu Mahadasha is Ketu-Ketu`);

assert(Array.isArray(a0.pratyantardashas) && a0.pratyantardashas.length === 9,
    `Each Antardasha contains 9 Pratyantardashas (Got ${a0.pratyantardashas.length})`);

let p00 = a0.pratyantardashas[0];
assert(p00.lord === 'Ketu' && p00.startDate instanceof Date && p00.endDate instanceof Date,
    `1st Pratyantardasha in Ketu-Ketu is Ketu-Ketu-Ketu`);

// Total count of sub-periods across 3 tiers
let totalMahadashas = dashaTree.length;
let totalAntardashas = dashaTree.reduce((sum, m) => sum + m.antardashas.length, 0);
let totalPratyantardashas = dashaTree.reduce((sum, m) => sum + m.antardashas.reduce((aSum, a) => aSum + a.pratyantardashas.length, 0), 0);

assert(totalMahadashas === 9 && totalAntardashas === 81 && totalPratyantardashas === 729,
    `Total hierarchy node count is exactly 9 Mahadashas, 81 Antardashas, and 729 Pratyantardashas`);

// Date math continuity & exactness
let subPeriodDateGapCount = 0;
for (let m = 0; m < 9; m++) {
    let md = dashaTree[m];
    for (let a = 0; a < 9; a++) {
        let ad = md.antardashas[a];
        if (a < 8) {
            let nextAd = md.antardashas[a + 1];
            if (ad.endDate.getTime() !== nextAd.startDate.getTime()) subPeriodDateGapCount++;
        }
        for (let p = 0; p < 9; p++) {
            let pd = ad.pratyantardashas[p];
            if (p < 8) {
                let nextPd = ad.pratyantardashas[p + 1];
                if (pd.endDate.getTime() !== nextPd.startDate.getTime()) subPeriodDateGapCount++;
            }
        }
    }
}
assert(subPeriodDateGapCount === 0,
    `Exact millisecond continuity: 0 gaps found across all 729 Pratyantardashas and 81 Antardashas`);


// -------------------------------------------------------------------------
// 3. BOUNDARY DATES & EDGE CASES
// -------------------------------------------------------------------------
console.log('\n3. Testing Boundary Dates & Edge Cases...');

// Moon at 0.0001° (Aries / Ashwini start)
let dashaAriesStart = AstroEngine.calculateVimshottari(0.0001, new Date('2020-01-01T00:00:00Z'));
assert(dashaAriesStart[0].lord === 'Ketu', `Moon at 0.0001° resolves to Ketu Mahadasha`);

// Moon at 359.999° (Pisces / Revati end)
let dashaRevatiEnd = AstroEngine.calculateVimshottari(359.999, new Date('2020-01-01T00:00:00Z'));
assert(dashaRevatiEnd[0].lord === 'Mercury', `Moon at 359.999° resolves to Mercury Mahadasha`);

// Leap year birth date (2000-02-29)
let leapBirth = new Date('2000-02-29T12:00:00Z');
let dashaLeap = AstroEngine.calculateVimshottari(100.0, leapBirth);
assert(dashaLeap[0].startDate.toISOString().startsWith('2000-02-29'),
    `Leap year birth date 2000-02-29 is accurately parsed and handled`);


// -------------------------------------------------------------------------
// 4. BENCHMARK CHARTS
// -------------------------------------------------------------------------
console.log('\n4. Running Benchmark Charts...');

const benchmarks = [
    { name: "J2000 Epoch", sunLon: 256.53, moonLon: 199.42, JD: 2451545.0, tz: 0, birth: "2000-01-01T12:00:00Z" },
    { name: "India Independence", sunLon: 118.0, moonLon: 94.5, JD: 2322839.25, tz: 5.5, birth: "1947-08-14T18:30:00Z" },
    { name: "Modern Birth", sunLon: 30.5, moonLon: 215.2, JD: 2449852.94, tz: 5.5, birth: "1995-05-15T10:30:00Z" }
];

benchmarks.forEach((b, idx) => {
    let p = AstroEngine.calculatePanchang(b.sunLon, b.moonLon, b.JD, b.tz);
    let d = AstroEngine.calculateVimshottari(b.moonLon, b.birth);
    assert(p.tithi && p.karana && d.length === 9,
        `Benchmark Chart #${idx + 1} (${b.name}): Panchang '${p.tithi.name}' & Vimshottari 1st Dasha '${d[0].lord}' calculated successfully`);
});


// -------------------------------------------------------------------------
// 5. PERFORMANCE BENCHMARK (< 50ms REQUIREMENT)
// -------------------------------------------------------------------------
console.log('\n5. Performance Execution Benchmark (< 50ms Requirement)...');

let iterations = 100;
let tStart = performance.now();

for (let i = 0; i < iterations; i++) {
    let p = AstroEngine.calculatePanchang(120.0 + i * 0.5, 200.0 + i * 1.2, 2451545.0 + i, 5.5);
    let d = AstroEngine.calculateVimshottari(200.0 + i * 1.2, '1990-01-01T00:00:00Z');
}

let tEnd = performance.now();
let totalMs = tEnd - tStart;
let avgMs = totalMs / iterations;

console.log(`  📊 Benchmark Results: ${iterations} full calculations completed in ${totalMs.toFixed(2)}ms (Avg ${avgMs.toFixed(3)}ms per calculation)`);

assert(avgMs < 50.0, `Single execution average time ${avgMs.toFixed(3)}ms is well below the <50ms requirement limit`);
assert(totalMs < 50.0 * iterations, `Total 100-run benchmark time ${totalMs.toFixed(2)}ms is under limit`);


// -------------------------------------------------------------------------
// RESULTS SUMMARY
// -------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================');

if (failCount > 0) process.exit(1);
