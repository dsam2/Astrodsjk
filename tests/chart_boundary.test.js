/**
 * AstroDSJK — Chart Renderer Boundary & Type Normalization Tests
 * Tests edge cases: string lagnaRashi ("5"), out-of-bound rashi (0, 15, -3),
 * null/undefined inputs, and invalid type conversions across North, South, and East Indian charts.
 */

const assert = require('assert');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('=== Running AstroDSJK Chart Renderer Boundary Tests ===\n');

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

// 1. String lagnaRashi normalization tests
runTest('North Indian chart handles string lagnaRashi "5"', () => {
    const vargaData = { Sun: 5, Moon: 6 };
    const svg = ChartRenderer.renderNorthIndianSVG(vargaData, "5");
    assert.ok(svg.includes('<svg'), 'SVG must render properly');
    assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    assert.ok(!svg.includes('undefined'), 'SVG must not contain undefined');
    // H1 top center should show rashi 5
    assert.ok(svg.includes('class="house-num" text-anchor="middle">5</text>'), 'H1 house number must be 5');
});

runTest('South Indian chart handles string lagnaRashi "5"', () => {
    const vargaData = { Sun: 5, Moon: 6 };
    const svg = ChartRenderer.renderSouthIndianSVG(vargaData, "5");
    assert.ok(svg.includes('<svg'), 'SVG must render properly');
    assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    assert.ok(!svg.includes('undefined'), 'SVG must not contain undefined');
    // South chart should render lagna indicator for sign 5 (xMin: 74, yMin: 50)
    assert.ok(svg.includes('x1="74"'), 'South Indian Lagna=5 slash x1 must match sign 5 xMin (74)');
});

runTest('East Indian chart handles string lagnaRashi "5"', () => {
    const vargaData = { Sun: 5, Moon: 6 };
    const svg = ChartRenderer.renderEastIndianSVG(vargaData, "5");
    assert.ok(svg.includes('<svg'), 'SVG must render properly');
    assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    assert.ok(!svg.includes('undefined'), 'SVG must not contain undefined');
    assert.ok(svg.includes('class="house-num" text-anchor="middle">5</text>'), 'H1 house number must be 5');
});

// 2. Out-of-bounds lagnaRashi (0, 15, -3) normalization tests
runTest('North Indian chart normalizes out-of-bound lagnaRashi 0 to 1', () => {
    const svg = ChartRenderer.renderNorthIndianSVG({}, 0);
    assert.ok(svg.includes('<svg'), 'SVG must render properly');
    assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    assert.ok(svg.includes('class="house-num" text-anchor="middle">1</text>'), 'H1 house number must default to 1');
});

runTest('North Indian chart clamps out-of-bound lagnaRashi 15 to 12', () => {
    const svg = ChartRenderer.renderNorthIndianSVG({}, 15);
    assert.ok(svg.includes('<svg'), 'SVG must render properly');
    assert.ok(!svg.includes('NaN'), 'SVG must not contain NaN');
    assert.ok(svg.includes('class="house-num" text-anchor="middle">12</text>'), 'H1 house number must clamp to 12');
});

runTest('South Indian chart normalizes out-of-bound lagnaRashi 0 and 15 without crash', () => {
    const svg0 = ChartRenderer.renderSouthIndianSVG({}, 0);
    assert.ok(svg0.includes('<svg'), 'SVG must render for lagna 0');
    assert.ok(!svg0.includes('NaN'), 'SVG must not contain NaN for lagna 0');

    const svg15 = ChartRenderer.renderSouthIndianSVG({}, 15);
    assert.ok(svg15.includes('<svg'), 'SVG must render for lagna 15');
    assert.ok(!svg15.includes('NaN'), 'SVG must not contain NaN for lagna 15');
});

runTest('East Indian chart normalizes out-of-bound lagnaRashi 0 and 15 without crash', () => {
    const svg0 = ChartRenderer.renderEastIndianSVG({}, 0);
    assert.ok(svg0.includes('<svg'), 'SVG must render for lagna 0');
    assert.ok(!svg0.includes('NaN'), 'SVG must not contain NaN for lagna 0');

    const svg15 = ChartRenderer.renderEastIndianSVG({}, 15);
    assert.ok(svg15.includes('<svg'), 'SVG must render for lagna 15');
    assert.ok(!svg15.includes('NaN'), 'SVG must not contain NaN for lagna 15');
});

// 3. Out-of-bound planet rashi values (0, 15, -3, "99")
runTest('All renderers sanitize out-of-bound planet rashi indices (0 -> 1, 15 -> 12)', () => {
    const vargaDataWithOOB = {
        Sun: 0,       // Out of bound 0 -> sanitized to 1
        Moon: 15,     // Out of bound 15 -> sanitized to 12
        Mars: -3,     // Out of bound -3 -> sanitized to 1
        Jupiter: "99" // Out of bound string "99" -> sanitized to 12
    };

    const northSVG = ChartRenderer.renderNorthIndianSVG(vargaDataWithOOB, 1);
    assert.ok(northSVG.includes('<svg'), 'North SVG must render');
    assert.ok(!northSVG.includes('NaN'), 'North SVG must not contain NaN');
    assert.ok(northSVG.includes('Su'), 'Sun must be placed');
    assert.ok(northSVG.includes('Mo'), 'Moon must be placed');

    const southSVG = ChartRenderer.renderSouthIndianSVG(vargaDataWithOOB, 1);
    assert.ok(southSVG.includes('<svg'), 'South SVG must render');
    assert.ok(!southSVG.includes('NaN'), 'South SVG must not contain NaN');
    assert.ok(southSVG.includes('Su'), 'Sun must be placed');
    assert.ok(southSVG.includes('Mo'), 'Moon must be placed');

    const eastSVG = ChartRenderer.renderEastIndianSVG(vargaDataWithOOB, 1);
    assert.ok(eastSVG.includes('<svg'), 'East SVG must render');
    assert.ok(!eastSVG.includes('NaN'), 'East SVG must not contain NaN');
    assert.ok(eastSVG.includes('Su'), 'Sun must be placed');
    assert.ok(eastSVG.includes('Mo'), 'Moon must be placed');
});

// 4. Null / Undefined / Invalid Type Handling
runTest('Renderers handle null or undefined vargaData gracefully', () => {
    const northSVG = ChartRenderer.renderNorthIndianSVG(null, undefined);
    assert.ok(northSVG.includes('<svg'), 'North SVG renders with null data');

    const southSVG = ChartRenderer.renderSouthIndianSVG(undefined, null);
    assert.ok(southSVG.includes('<svg'), 'South SVG renders with null data');

    const eastSVG = ChartRenderer.renderEastIndianSVG(null, "abc");
    assert.ok(eastSVG.includes('<svg'), 'East SVG renders with invalid lagna string');
});

console.log(`\n==================================================`);
console.log(`All ${passedTests}/${totalTests} Chart Boundary tests passed successfully!`);
console.log(`==================================================\n`);
