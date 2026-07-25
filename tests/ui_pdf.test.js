/**
 * AstroDSJK — Milestone 5 UI Integration & PDF Export Test Suite
 * Verifies DOM structure in index.html, @media print CSS rules in style.css,
 * script wiring in script.js, and E2E integration of chart/panchang/dasha/gunmilan rendering.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 AstroDSJK Milestone 5: UI & PDF Export E2E Test Suite');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(description, testFn) {
    try {
        testFn();
        console.log(`  ✅ PASS: ${description}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
        failCount++;
    }
}

// -------------------------------------------------------------------------
// 1. DOM STRUCTURE INTEGRITY IN index.html
// -------------------------------------------------------------------------
console.log('1. Verifying HTML DOM Structure in index.html...');

const htmlPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

runTest('index.html contains birth detail form inputs (dob, tob, lat, long, timezone)', () => {
    assert.ok(htmlContent.includes('id="dob"'), 'Missing #dob input');
    assert.ok(htmlContent.includes('id="tob"'), 'Missing #tob input');
    assert.ok(htmlContent.includes('id="lat"'), 'Missing #lat input');
    assert.ok(htmlContent.includes('id="long"'), 'Missing #long input');
    assert.ok(htmlContent.includes('id="timezone"'), 'Missing #timezone input');
});

runTest('index.html contains chart style selector (#chartStyle) with North, South, East options', () => {
    assert.ok(htmlContent.includes('id="chartStyle"'), 'Missing #chartStyle select');
    assert.ok(htmlContent.includes('value="north"'), 'Missing north chart style option');
    assert.ok(htmlContent.includes('value="south"'), 'Missing south chart style option');
    assert.ok(htmlContent.includes('value="east"'), 'Missing east chart style option');
});

runTest('index.html contains SVG chart display container (#chartDisplay)', () => {
    assert.ok(htmlContent.includes('id="chartDisplay"'), 'Missing #chartDisplay container');
});

runTest('index.html contains Panchang display section (#panchangSection)', () => {
    assert.ok(htmlContent.includes('id="panchangSection"'), 'Missing #panchangSection container');
});

runTest('index.html contains Vimshottari Dasha accordion timeline (#dashaAccordion)', () => {
    assert.ok(htmlContent.includes('id="dashaAccordion"'), 'Missing #dashaAccordion container');
});

runTest('index.html contains Gun Milan matchmaker form & result display card (#calcMatchBtn & #matchResultsContainer)', () => {
    assert.ok(htmlContent.includes('id="calcMatchBtn"'), 'Missing #calcMatchBtn button');
    assert.ok(htmlContent.includes('id="matchResultsContainer"') || htmlContent.includes('id="gunMilanCard"'), 'Missing match results container');
});

runTest('index.html contains Print / Export PDF Report button with id="export-pdf-btn"', () => {
    assert.ok(htmlContent.includes('id="export-pdf-btn"'), 'Missing #export-pdf-btn button');
});


// -------------------------------------------------------------------------
// 2. @media print STYLESHEET RULES IN style.css
// -------------------------------------------------------------------------
console.log('\n2. Verifying @media print Stylesheet Rules in style.css...');

const cssPath = path.join(__dirname, '../style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

runTest('style.css contains @media print block', () => {
    assert.ok(cssContent.includes('@media print'), 'Missing @media print block');
});

runTest('@media print hides non-printable UI controls (buttons, forms, navbar)', () => {
    const printBlock = cssContent.slice(cssContent.indexOf('@media print'));
    assert.ok(printBlock.includes('display: none') || printBlock.includes('display:none'), '@media print must hide non-printable UI elements');
    assert.ok(printBlock.includes('.navbar') || printBlock.includes('button') || printBlock.includes('#export-pdf-btn'), '@media print must target navigation/buttons');
});

runTest('@media print formats printable cards and SVG chart elements', () => {
    const printBlock = cssContent.slice(cssContent.indexOf('@media print'));
    assert.ok(printBlock.includes('svg') || printBlock.includes('.kundali-svg') || printBlock.includes('chart-display-container'), '@media print must style SVG chart containers');
});

runTest('@media print enforces page break controls (page-break-inside: avoid / break-inside: avoid)', () => {
    const printBlock = cssContent.slice(cssContent.indexOf('@media print'));
    assert.ok(printBlock.includes('page-break-inside: avoid') || printBlock.includes('break-inside: avoid') || printBlock.includes('page-break-inside:avoid'), '@media print must specify page break controls');
});


// -------------------------------------------------------------------------
// 3. EVENT HANDLERS & INTEGRATION IN script.js
// -------------------------------------------------------------------------
console.log('\n3. Verifying Script Event Handlers in script.js...');

const jsPath = path.join(__dirname, '../script.js');
const jsContent = fs.readFileSync(jsPath, 'utf8');

runTest('script.js wires AstroEngine functions (julianDay, calculatePlanets, calculateVargas, calculatePanchang, calculateVimshottari, calculateGunMilan, calculateManglikDosha)', () => {
    assert.ok(jsContent.includes('julianDay'), 'script.js missing julianDay call');
    assert.ok(jsContent.includes('calculatePlanets'), 'script.js missing calculatePlanets call');
    assert.ok(jsContent.includes('calculateVargas'), 'script.js missing calculateVargas call');
    assert.ok(jsContent.includes('calculatePanchang'), 'script.js missing calculatePanchang call');
    assert.ok(jsContent.includes('calculateVimshottari'), 'script.js missing calculateVimshottari call');
    assert.ok(jsContent.includes('calculateGunMilan'), 'script.js missing calculateGunMilan call');
    assert.ok(jsContent.includes('calculateManglikDosha'), 'script.js missing calculateManglikDosha call');
});

runTest('script.js wires ChartRenderer functions (renderNorthIndianSVG, renderSouthIndianSVG, renderEastIndianSVG)', () => {
    assert.ok(jsContent.includes('renderNorthIndianSVG'), 'script.js missing renderNorthIndianSVG call');
    assert.ok(jsContent.includes('renderSouthIndianSVG'), 'script.js missing renderSouthIndianSVG call');
    assert.ok(jsContent.includes('renderEastIndianSVG'), 'script.js missing renderEastIndianSVG call');
});

runTest('script.js handles PDF export by invoking window.print()', () => {
    assert.ok(jsContent.includes('window.print()'), 'script.js missing window.print() call');
});


// -------------------------------------------------------------------------
// 4. END-TO-END ENGINE & CHART RENDER INTEGRATION
// -------------------------------------------------------------------------
console.log('\n4. Testing E2E Calculation & Multi-Format Chart Rendering...');

const enginePath = path.join(__dirname, '../js/astrology-engine.js');
const engineCode = fs.readFileSync(enginePath, 'utf8');
const AstroEngine = new Function(engineCode + '; return AstroEngine;')();

const rendererPath = path.join(__dirname, '../js/chart-renderer.js');
const rendererCode = fs.readFileSync(rendererPath, 'utf8');
const ChartRenderer = new Function(rendererCode + '; return ChartRenderer;')();

runTest('E2E Horoscope calculation produces valid planetary, varga, panchang & dasha data', () => {
    // 1995-05-15 10:30 IST New Delhi
    const JD = AstroEngine.julianDay(1995, 5, 15, 10, 30, 0, 5.5);
    const planets = AstroEngine.calculatePlanets(JD, 28.6139, 77.2090);
    assert.ok(planets && planets.Sun && planets.Moon, 'Planets calculation failed');
    
    const vargas = AstroEngine.calculateVargas(planets);
    assert.ok(vargas && vargas.D1 && vargas.D9, 'Vargas calculation failed');

    const panchang = AstroEngine.calculatePanchang(planets.Sun, planets.Moon, 1);
    assert.ok(panchang && panchang.tithiName && panchang.nakshatraName, 'Panchang calculation failed');

    const dasha = AstroEngine.calculateVimshottari(planets.Moon, new Date(1995, 4, 15));
    assert.ok(Array.isArray(dasha) && dasha.length >= 9, 'Vimshottari Dasha calculation failed');
});

runTest('E2E SVG Chart rendering produces valid North, South, and East Indian SVG charts', () => {
    const JD = AstroEngine.julianDay(1995, 5, 15, 10, 30, 0, 5.5);
    const planets = AstroEngine.calculatePlanets(JD, 28.6139, 77.2090);
    const vargas = AstroEngine.calculateVargas(planets);

    const northSvg = ChartRenderer.renderNorthIndianSVG(vargas.D1, vargas.D1.Ascendant);
    assert.ok(northSvg.includes('<svg') && northSvg.includes('viewBox="0 0 100 100"'), 'North Indian SVG invalid');

    const southSvg = ChartRenderer.renderSouthIndianSVG(vargas.D1, vargas.D1.Ascendant);
    assert.ok(southSvg.includes('<svg') && southSvg.includes('viewBox="0 0 100 100"'), 'South Indian SVG invalid');

    const eastSvg = ChartRenderer.renderEastIndianSVG(vargas.D1, vargas.D1.Ascendant);
    assert.ok(eastSvg.includes('<svg') && eastSvg.includes('viewBox="0 0 100 100"'), 'East Indian SVG invalid');
});

runTest('E2E Synastry calculation produces accurate Gun Milan and Manglik Dosha analysis', () => {
    const boyJD = AstroEngine.julianDay(1994, 8, 20, 14, 15, 0, 5.5);
    const girlJD = AstroEngine.julianDay(1996, 11, 10, 9, 45, 0, 5.5);

    const boyPlanets = AstroEngine.calculatePlanets(boyJD, 28.61, 77.20);
    const girlPlanets = AstroEngine.calculatePlanets(girlJD, 28.61, 77.20);

    const match = AstroEngine.calculateGunMilan(boyPlanets.Moon, girlPlanets.Moon);
    assert.ok(typeof match.totalScore === 'number' && match.totalScore >= 0 && match.totalScore <= 36, 'Invalid Gun Milan score');
    assert.ok(match.breakdown && typeof match.breakdown.nadiScore === 'number', 'Missing Gun Milan score breakdown');

    const boyManglik = AstroEngine.calculateManglikDosha(boyPlanets);
    const girlManglik = AstroEngine.calculateManglikDosha(girlPlanets);
    assert.ok(typeof boyManglik.isManglik === 'boolean', 'Invalid boy Manglik status');
    assert.ok(typeof girlManglik.isManglik === 'boolean', 'Invalid girl Manglik status');
});

console.log('\n================================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log('================================================================\n');

if (failCount > 0) {
    process.exit(1);
}
