/**
 * AstroDSJK — Milestone 4: Ashta Kuta Gun Milan & Manglik Dosha Test Suite
 * Verifies all 8 Kuta calculations (36 points total), classical test couples,
 * boundary longitudes, Manglik detection, and Bhanga cancellation rules.
 */

const fs = require('fs');
const path = require('path');

// Load AstroEngine
const enginePath = path.join(__dirname, '../js/astrology-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');

const evalContext = new Function(engineCode + '; return AstroEngine;');
const AstroEngine = evalContext();

console.log('================================================================');
console.log('🧪 AstroDSJK Milestone 4: Gun Milan & Manglik Dosha Test Suite');
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
// 1. VARNA KUTA TESTS (1 point)
// -------------------------------------------------------------------------
console.log('1. Testing Varna Kuta (1 pt)...');
{
    // Boy Brahmin (Cancer 105° = Rashi 4) >= Girl Kshatriya (Aries 15° = Rashi 1) => 1 pt
    let res1 = AstroEngine.calculateGunMilan(105, 15);
    assert(res1.breakdown.varna === 1, `Boy Brahmin (Cancer) >= Girl Kshatriya (Aries) = 1 pt (Got ${res1.breakdown.varna})`);

    // Boy Vaishya (Taurus 45° = Rashi 2) < Girl Brahmin (Cancer 105° = Rashi 4) => 0 pt
    let res2 = AstroEngine.calculateGunMilan(45, 105);
    assert(res2.breakdown.varna === 0, `Boy Vaishya (Taurus) < Girl Brahmin (Cancer) = 0 pt (Got ${res2.breakdown.varna})`);

    // Boy Kshatriya (Leo 135° = Rashi 5) == Girl Kshatriya (Sagittarius 255° = Rashi 9) => 1 pt
    let res3 = AstroEngine.calculateGunMilan(135, 255);
    assert(res3.breakdown.varna === 1, `Boy Kshatriya == Girl Kshatriya = 1 pt (Got ${res3.breakdown.varna})`);
}

// -------------------------------------------------------------------------
// 2. VASHYA KUTA TESTS (2 points)
// -------------------------------------------------------------------------
console.log('\n2. Testing Vashya Kuta (2 pts)...');
{
    // Chatushpada vs Chatushpada (Aries 15° vs Taurus 45°) => 2 pts
    let res1 = AstroEngine.calculateGunMilan(15, 45);
    assert(res1.breakdown.vashya === 2, `Chatushpada vs Chatushpada = 2 pts (Got ${res1.breakdown.vashya})`);

    // Chatushpada vs Manav (Aries 15° vs Gemini 75°) => 1 pt
    let res2 = AstroEngine.calculateGunMilan(15, 75);
    assert(res2.breakdown.vashya === 1, `Chatushpada vs Manav = 1 pt (Got ${res2.breakdown.vashya})`);

    // Manav vs Jalachar (Gemini 75° vs Cancer 105°) => 0.5 pt
    let res3 = AstroEngine.calculateGunMilan(75, 105);
    assert(res3.breakdown.vashya === 0.5, `Manav vs Jalachar = 0.5 pt (Got ${res3.breakdown.vashya})`);

    // Vanachar vs Manav (Leo 135° vs Virgo 165°) => 0 pt
    let res4 = AstroEngine.calculateGunMilan(135, 165);
    assert(res4.breakdown.vashya === 0, `Vanachar vs Manav = 0 pt (Got ${res4.breakdown.vashya})`);

    // Keeta vs Keeta (Scorpio 225° vs Scorpio 235°) => 2 pts
    let res5 = AstroEngine.calculateGunMilan(225, 235);
    assert(res5.breakdown.vashya === 2, `Keeta vs Keeta = 2 pts (Got ${res5.breakdown.vashya})`);
}

// -------------------------------------------------------------------------
// 3. TARA KUTA TESTS (3 points)
// -------------------------------------------------------------------------
console.log('\n3. Testing Tara Kuta (3 pts)...');
{
    // Boy Ashwini (Nak 1) & Girl Bharani (Nak 2): Count 1->2=2 (Sampat, 1.5), 2->1=27 (Parama Mitra, 1.5) => 3 pts
    let res1 = AstroEngine.calculateGunMilan(5, 20); // Ashwini (0-13.33°), Bharani (13.33-26.66°)
    assert(res1.breakdown.tara === 3, `Ashwini to Bharani Auspicious Tara = 3 pts (Got ${res1.breakdown.tara})`);

    // Boy Ashwini (Nak 1) & Girl Krittika (Nak 3): Count 1->3=3 (Vipat, 0), 3->1=26 (Mitra, 1.5) => 1.5 pts
    let res2 = AstroEngine.calculateGunMilan(5, 30); // Ashwini vs Krittika
    assert(res2.breakdown.tara === 1.5, `Ashwini to Krittika Tara = 1.5 pts (Got ${res2.breakdown.tara})`);
}

// -------------------------------------------------------------------------
// 4. YONI KUTA TESTS (4 points)
// -------------------------------------------------------------------------
console.log('\n4. Testing Yoni Kuta (4 pts)...');
{
    // Same Yoni: Horse vs Horse (Ashwini 5° vs Shatabhisha 310°) => 4 pts
    let res1 = AstroEngine.calculateGunMilan(5, 310);
    assert(res1.breakdown.yoni === 4, `Horse vs Horse Yoni = 4 pts (Got ${res1.breakdown.yoni})`);

    // Sworn Enemy: Horse vs Buffalo (Ashwini 5° vs Swati 190°) => 0 pt
    let res2 = AstroEngine.calculateGunMilan(5, 190);
    assert(res2.breakdown.yoni === 0, `Horse vs Buffalo (Sworn Enemies) Yoni = 0 pt (Got ${res2.breakdown.yoni})`);

    // Sworn Enemy: Elephant vs Lion (Bharani 20° vs Dhanishta 300°) => 0 pt
    let res3 = AstroEngine.calculateGunMilan(20, 300);
    assert(res3.breakdown.yoni === 0, `Elephant vs Lion (Sworn Enemies) Yoni = 0 pt (Got ${res3.breakdown.yoni})`);

    // Friendly Yoni: Elephant vs Horse (Bharani 20° vs Ashwini 5°) => 3 pts
    let res4 = AstroEngine.calculateGunMilan(20, 5);
    assert(res4.breakdown.yoni === 3, `Elephant vs Horse Friendly Yoni = 3 pts (Got ${res4.breakdown.yoni})`);
}

// -------------------------------------------------------------------------
// 5. GRAHA MAITRI KUTA TESTS (5 points)
// -------------------------------------------------------------------------
console.log('\n5. Testing Graha Maitri Kuta (5 pts)...');
{
    // Same Lord: Aries (Mars) vs Scorpio (Mars) => 5 pts
    let res1 = AstroEngine.calculateGunMilan(15, 225);
    assert(res1.breakdown.maitri === 5, `Mars vs Mars Same Lord = 5 pts (Got ${res1.breakdown.maitri})`);

    // Friends: Aries (Mars) vs Leo (Sun) => 5 pts
    let res2 = AstroEngine.calculateGunMilan(15, 135);
    assert(res2.breakdown.maitri === 5, `Mars vs Sun Friends = 5 pts (Got ${res2.breakdown.maitri})`);

    // Friend-Neutral: Leo (Sun) vs Gemini (Mercury) => 4 pts
    let res3 = AstroEngine.calculateGunMilan(135, 75);
    assert(res3.breakdown.maitri === 4, `Sun vs Mercury Friend-Neutral = 4 pts (Got ${res3.breakdown.maitri})`);

    // Friend-Enemy: Cancer (Moon) vs Gemini (Mercury) => 1 pt
    let res4 = AstroEngine.calculateGunMilan(105, 75);
    assert(res4.breakdown.maitri === 1, `Moon vs Mercury Friend-Enemy = 1 pt (Got ${res4.breakdown.maitri})`);

    // Enemy-Enemy: Leo (Sun) vs Taurus (Venus) => 0 pt
    let res5 = AstroEngine.calculateGunMilan(135, 45);
    assert(res5.breakdown.maitri === 0, `Sun vs Venus Enemy-Enemy = 0 pt (Got ${res5.breakdown.maitri})`);
}

// -------------------------------------------------------------------------
// 6. GANA KUTA TESTS (6 points)
// -------------------------------------------------------------------------
console.log('\n6. Testing Gana Kuta (6 pts)...');
{
    // Deva & Deva: Ashwini (Nak 1) & Pushya (Nak 8) => 6 pts
    let res1 = AstroEngine.calculateGunMilan(5, 100);
    assert(res1.breakdown.gana === 6, `Deva & Deva Gana = 6 pts (Got ${res1.breakdown.gana})`);

    // Manushya & Manushya: Bharani (Nak 2) & Rohini (Nak 4) => 6 pts
    let res2 = AstroEngine.calculateGunMilan(20, 45);
    assert(res2.breakdown.gana === 6, `Manushya & Manushya Gana = 6 pts (Got ${res2.breakdown.gana})`);

    // Rakshasa & Rakshasa: Krittika (Nak 3) & Magha (Nak 10) => 6 pts
    let res3 = AstroEngine.calculateGunMilan(30, 125);
    assert(res3.breakdown.gana === 6, `Rakshasa & Rakshasa Gana = 6 pts (Got ${res3.breakdown.gana})`);

    // Boy Deva & Girl Manushya: Ashwini (1) & Bharani (2) => 6 pts
    let res4 = AstroEngine.calculateGunMilan(5, 20);
    assert(res4.breakdown.gana === 6, `Boy Deva & Girl Manushya Gana = 6 pts (Got ${res4.breakdown.gana})`);

    // Boy Manushya & Girl Deva: Bharani (2) & Ashwini (1) => 5 pts
    let res5 = AstroEngine.calculateGunMilan(20, 5);
    assert(res5.breakdown.gana === 5, `Boy Manushya & Girl Deva Gana = 5 pts (Got ${res5.breakdown.gana})`);

    // Boy Rakshasa & Girl Deva: Krittika (3) & Ashwini (1) => 0 pt
    let res6 = AstroEngine.calculateGunMilan(30, 5);
    assert(res6.breakdown.gana === 0, `Boy Rakshasa & Girl Deva Gana = 0 pt (Got ${res6.breakdown.gana})`);
}

// -------------------------------------------------------------------------
// 7. BHAKOOT KUTA TESTS (7 points)
// -------------------------------------------------------------------------
console.log('\n7. Testing Bhakoot Kuta (7 pts)...');
{
    // 1/1 (Eka Rashi): Aries (15°) & Aries (25°) => 7 pts
    let res1 = AstroEngine.calculateGunMilan(15, 25);
    assert(res1.breakdown.bhakoot === 7, `1/1 Eka Rashi Bhakoot = 7 pts (Got ${res1.breakdown.bhakoot})`);

    // 1/7 (Sama-Saptaka): Aries (15°) & Libra (195°) => 7 pts
    let res2 = AstroEngine.calculateGunMilan(15, 195);
    assert(res2.breakdown.bhakoot === 7, `1/7 Sama-Saptaka Bhakoot = 7 pts (Got ${res2.breakdown.bhakoot})`);

    // 3/11 (Tritiya-Ekadasha): Aries (15°) & Gemini (75°) => 7 pts
    let res3 = AstroEngine.calculateGunMilan(15, 75);
    assert(res3.breakdown.bhakoot === 7, `3/11 Tritiya-Ekadasha Bhakoot = 7 pts (Got ${res3.breakdown.bhakoot})`);

    // 4/10 (Chaturtha-Dashama): Aries (15°) & Cancer (105°) => 7 pts
    let res4 = AstroEngine.calculateGunMilan(15, 105);
    assert(res4.breakdown.bhakoot === 7, `4/10 Chaturtha-Dashama Bhakoot = 7 pts (Got ${res4.breakdown.bhakoot})`);

    // 2/12 (Dwi-Dwadasa): Aries (15°) & Taurus (45°) => 0 pt (Bhakoot Dosha)
    let res5 = AstroEngine.calculateGunMilan(15, 45);
    assert(res5.breakdown.bhakoot === 0, `2/12 Dwi-Dwadasa Bhakoot Dosha = 0 pt (Got ${res5.breakdown.bhakoot})`);

    // 5/9 (Nava-Panchama): Aries (15°) & Leo (135°) => 0 pt (Bhakoot Dosha)
    let res6 = AstroEngine.calculateGunMilan(15, 135);
    assert(res6.breakdown.bhakoot === 0, `5/9 Nava-Panchama Bhakoot Dosha = 0 pt (Got ${res6.breakdown.bhakoot})`);

    // 6/8 (Shadashtaka): Aries (15°) & Virgo (165°) => 0 pt (Bhakoot Dosha)
    let res7 = AstroEngine.calculateGunMilan(15, 165);
    assert(res7.breakdown.bhakoot === 0, `6/8 Shadashtaka Bhakoot Dosha = 0 pt (Got ${res7.breakdown.bhakoot})`);
}

// -------------------------------------------------------------------------
// 8. NADI KUTA TESTS (8 points)
// -------------------------------------------------------------------------
console.log('\n8. Testing Nadi Kuta (8 pts)...');
{
    // Different Nadis: Ashwini (Adi, 5°) & Bharani (Madhya, 20°) => 8 pts
    let res1 = AstroEngine.calculateGunMilan(5, 20);
    assert(res1.breakdown.nadi === 8, `Adi vs Madhya Different Nadi = 8 pts (Got ${res1.breakdown.nadi})`);

    // Same Nadi: Ashwini (Adi, 5°) & Ardra (Adi, 70°) => 0 pt (Nadi Dosha)
    let res2 = AstroEngine.calculateGunMilan(5, 70);
    assert(res2.breakdown.nadi === 0, `Adi vs Adi Same Nadi (Nadi Dosha) = 0 pt (Got ${res2.breakdown.nadi})`);
}

// -------------------------------------------------------------------------
// 9. CLASSICAL TEST COUPLES & TOTAL SCORE ACCURACY
// -------------------------------------------------------------------------
console.log('\n9. Testing Classical Test Couples & Total Score Accuracy...');
{
    // Couple A: Ashwini (Aries 5°) & Bharani (Aries 20°)
    // Varna: 1, Vashya: 2, Tara: 3, Yoni: 3, Maitri: 5, Gana: 6, Bhakoot: 7, Nadi: 8 => 35 / 36 pts
    let resA = AstroEngine.calculateGunMilan(5, 20);
    assert(resA.totalScore === 35, `Couple A Total Score = 35 / 36 (Got ${resA.totalScore})`);

    // Verify breakdown sum equals totalScore
    let sumA = Object.values(resA.breakdown).slice(0, 8).reduce((a, b) => a + b, 0);
    assert(sumA === resA.totalScore, `Sum of breakdown equals totalScore (${sumA} == ${resA.totalScore})`);

    // Couple B: Ashwini (Aries 5°) & Swati (Libra 190°)
    // Boy: Aries (Kshatriya, Chatushpada, Mars, Deva, Adi, Horse)
    // Girl: Libra (Shudra, Manav, Venus, Deva, Antya, Buffalo)
    // Varna: 1, Vashya: 1, Tara: 3, Yoni: 0 (Sworn enemy), Maitri: 3 (Mars vs Venus), Gana: 6 (Deva-Deva), Bhakoot: 7 (1/7), Nadi: 8 (Adi vs Antya)
    let resB = AstroEngine.calculateGunMilan(5, 190);
    assert(resB.breakdown.yoni === 0, `Couple B has Yoni 0 due to Sworn Enemies (Horse vs Buffalo)`);
    assert(resB.totalScore === 27.5, `Couple B Total Score = 27.5 / 36 (Got ${resB.totalScore})`);
}

// -------------------------------------------------------------------------
// 10. BOUNDARY LONGITUDES & NAKSHATRA INPUTS
// -------------------------------------------------------------------------
console.log('\n10. Testing Boundary Longitudes & Nakshatra Input Options...');
{
    let b0 = AstroEngine.calculateGunMilan(0.0, 359.999);
    assert(typeof b0.totalScore === 'number' && !isNaN(b0.totalScore), `Boundary longitudes 0.0° & 359.999° executed cleanly`);

    let b360 = AstroEngine.calculateGunMilan(360.0, 720.0);
    assert(typeof b360.totalScore === 'number' && !isNaN(b360.totalScore), `Wrap-around longitudes 360° & 720° handled correctly`);

    // Test passing explicit Nakshatra indices (1-based: 1 and 2)
    let nExplicit = AstroEngine.calculateGunMilan(0, 0, 1, 2);
    assert(nExplicit.breakdown.tara === 3 && nExplicit.breakdown.nadi === 8, `Explicit Nakshatras (1, 2) parsed correctly`);
}

// -------------------------------------------------------------------------
// 11. MANGLIK DOSHA DETECTION & BHANGA CANCELLATION
// -------------------------------------------------------------------------
console.log('\n11. Testing Manglik Dosha Detection & Bhanga Cancellation...');
{
    // Test 11.1: Mars in House 5 from Lagna, Moon, and Venus (Lagna=1, Moon=1, Venus=1, Mars=5 -> House 5: Not Manglik)
    let chart1 = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 5, longitude: 135 },
        Moon: { sign: 1, longitude: 15 },
        Venus: { sign: 1, longitude: 15 }
    };
    let m1 = AstroEngine.calculateManglikDosha(chart1);
    assert(!m1.isManglik, `Mars in 5th house from Lagna is NOT Manglik`);

    // Test 11.2: Mars in House 7 from Lagna (Lagna Virgo = 6, Mars Gemini = 3 -> House 10? Wait: 3 - 6 + 12 + 1 = 10 -> Not Manglik)
    // Mars in House 7: Lagna Aries (1), Mars Libra (7)
    let chart2 = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 7, longitude: 195 }, // House 7
        Moon: { sign: 2, longitude: 45 },
        Venus: { sign: 3, longitude: 75 }
    };
    let m2 = AstroEngine.calculateManglikDosha(chart2);
    assert(m2.isManglik, `Mars in 7th house from Lagna IS Manglik`);
    assert(m2.effectiveManglik, `Mars in Libra 7th house has NO Bhanga => Effective Manglik`);

    // Test 11.3: Bhanga Cancellation - Mars in Own Sign (Scorpio = 8) in 8th house from Aries Lagna
    let chart3 = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 8, longitude: 225 }, // House 8, Own sign Scorpio
        Moon: { sign: 2, longitude: 45 },
        Venus: { sign: 3, longitude: 75 }
    };
    let m3 = AstroEngine.calculateManglikDosha(chart3);
    assert(m3.isManglik, `Mars in 8th house is Manglik`);
    assert(m3.isCancelled, `Mars in Scorpio (Own Sign) triggers Bhanga Cancellation`);
    assert(!m3.effectiveManglik, `Mars in Scorpio is NOT Effective Manglik after Bhanga`);

    // Test 11.4: Bhanga Cancellation - Mars aspected by Jupiter
    let chart4 = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 4, longitude: 105 }, // House 4 (Cancer - Manglik)
        Jupiter: { sign: 12, longitude: 345 }, // Jupiter in Pisces aspects Cancer (5th aspect from Pisces)
        Moon: { sign: 2, longitude: 45 },
        Venus: { sign: 3, longitude: 75 }
    };
    let m4 = AstroEngine.calculateManglikDosha(chart4);
    assert(m4.isManglik, `Mars in 4th house is Manglik`);
    assert(m4.isCancelled, `Mars aspected by Jupiter (5th house aspect) triggers Bhanga Cancellation`);
    assert(!m4.effectiveManglik, `Mars aspected by Jupiter is NOT Effective Manglik`);

    // Test 11.5: Bhanga Cancellation - Mars in Saturn Sign (Aquarius = 11) in 12th house from Pisces Lagna (12)
    let chart5 = {
        Ascendant: { sign: 12, longitude: 345 },
        Mars: { sign: 11, longitude: 315 }, // House 12 (Aquarius)
        Moon: { sign: 2, longitude: 45 },
        Venus: { sign: 3, longitude: 75 }
    };
    let m5 = AstroEngine.calculateManglikDosha(chart5);
    assert(m5.isManglik, `Mars in 12th house is Manglik`);
    assert(m5.isCancelled, `Mars in Saturn sign (Aquarius) triggers Bhanga Cancellation`);

    // Test 11.6: Mutual Cancellation between Boy and Girl in Gun Milan
    let boyChart = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 7, longitude: 195 }, // House 7 -> Manglik
        Moon: { sign: 1, longitude: 15 },
        Venus: { sign: 3, longitude: 75 }
    };
    let girlChart = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 4, longitude: 105 }, // House 4 (Cancer) -> Manglik (no Jup)
        Moon: { sign: 1, longitude: 20 },
        Venus: { sign: 3, longitude: 75 }
    };
    let matchRes = AstroEngine.calculateGunMilan(boyChart, girlChart);
    assert(matchRes.boyManglik.effectiveManglik, `Boy is Effective Manglik`);
    assert(matchRes.girlManglik.effectiveManglik, `Girl is Effective Manglik`);
    assert(matchRes.manglikMatch === true, `Both partners are Manglik => Mutual Cancellation => manglikMatch = true`);

    // Test 11.7: Mars in 2nd house from Lagna
    let chart2ndLagna = {
        Ascendant: { sign: 1, longitude: 15 },
        Mars: { sign: 2, longitude: 45 }, // House 2 (Taurus)
        Moon: { sign: 5, longitude: 135 },
        Venus: { sign: 6, longitude: 165 }
    };
    let m2Lagna = AstroEngine.calculateManglikDosha(chart2ndLagna);
    assert(m2Lagna.isManglik, `Mars in 2nd house from Lagna IS Manglik`);
    assert(m2Lagna.houseFromLagna === 2, `houseFromLagna is 2`);
    assert(m2Lagna.effectiveManglik, `Mars in Taurus 2nd house has NO Bhanga => Effective Manglik`);

    // Test 11.8: Mars in 2nd house from Moon
    let chart2ndMoon = {
        Ascendant: { sign: 5, longitude: 135 },
        Mars: { sign: 2, longitude: 45 },
        Moon: { sign: 1, longitude: 15 }, // House 2 from Moon
        Venus: { sign: 6, longitude: 165 }
    };
    let m2Moon = AstroEngine.calculateManglikDosha(chart2ndMoon);
    assert(m2Moon.isManglik, `Mars in 2nd house from Moon IS Manglik`);
    assert(m2Moon.houseFromMoon === 2, `houseFromMoon is 2`);
    assert(m2Moon.effectiveManglik, `Mars in 2nd house from Moon => Effective Manglik`);

    // Test 11.9: Mars in 2nd house from Venus
    let chart2ndVenus = {
        Ascendant: { sign: 5, longitude: 135 },
        Mars: { sign: 2, longitude: 45 },
        Moon: { sign: 6, longitude: 165 },
        Venus: { sign: 1, longitude: 15 } // House 2 from Venus
    };
    let m2Venus = AstroEngine.calculateManglikDosha(chart2ndVenus);
    assert(m2Venus.isManglik, `Mars in 2nd house from Venus IS Manglik`);
    assert(m2Venus.houseFromVenus === 2, `houseFromVenus is 2`);
    assert(m2Venus.effectiveManglik, `Mars in 2nd house from Venus => Effective Manglik`);

    // Test 11.10: Mars in 2nd house from Lagna with Bhanga Cancellation (Mars in Own Sign Aries)
    let chart2ndBhanga = {
        Ascendant: { sign: 12, longitude: 345 },
        Mars: { sign: 1, longitude: 15 }, // House 2 from Pisces (12) -> Aries (1), Own Sign
        Moon: { sign: 5, longitude: 135 },
        Venus: { sign: 6, longitude: 165 }
    };
    let m2Bhanga = AstroEngine.calculateManglikDosha(chart2ndBhanga);
    assert(m2Bhanga.isManglik, `Mars in 2nd house from Lagna (Aries) is Manglik`);
    assert(m2Bhanga.isCancelled, `Mars in Aries (Own Sign) in 2nd house triggers Bhanga Cancellation`);
    assert(!m2Bhanga.effectiveManglik, `Mars in 2nd house with Bhanga is NOT Effective Manglik`);
}

// -------------------------------------------------------------------------
// TEST RESULTS SUMMARY
// -------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 Test Results: ${passCount} Passed, ${failCount} Failed`);
console.log('================================================================');

if (failCount > 0) {
    console.error('❌ SOME TESTS FAILED!');
    process.exit(1);
} else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (100% PASS)');
    process.exit(0);
}
