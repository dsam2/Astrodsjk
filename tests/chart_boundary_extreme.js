/**
 * AstroDSJK — Chart Renderer Extreme Boundary & Edge Case Verification Tests
 * Tests extreme inputs for js/chart-renderer.js:
 * 1. 9 planets in House 1 (Extreme Stellium)
 * 2. String lagnaRashi values ("12", "01", "invalid", "-5", etc.)
 * 3. Out-of-bounds rashi indices (0, 13, -1, 99) for both Lagna and Planets
 * 4. Empty planet objects/arrays, null, and undefined inputs
 * 5. Strict SVG syntax and numerical sanity validation across North, South, and East Indian charts
 */

const assert = require('assert');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('=== Running AstroDSJK Chart Renderer Extreme Boundary Tests ===\n');

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

/**
 * Validates that an SVG string is non-empty, well-formed, and free of invalid tokens.
 */
function assertValidSVG(svg, label) {
    assert.ok(typeof svg === 'string', `${label}: Output must be a string`);
    assert.ok(svg.length > 50, `${label}: SVG string length too short`);
    assert.ok(svg.trim().startsWith('<svg'), `${label}: Must start with <svg tag`);
    assert.ok(svg.trim().endsWith('</svg>'), `${label}: Must end with </svg> tag`);
    assert.ok(!svg.includes('NaN'), `${label}: Must not contain 'NaN'`);
    assert.ok(!svg.includes('undefined'), `${label}: Must not contain 'undefined'`);
    assert.ok(!svg.includes('null'), `${label}: Must not contain 'null'`);
    assert.ok(!svg.includes('Infinity'), `${label}: Must not contain 'Infinity'`);

    // Verify tag matching for <text> and <tspan>
    const openTextCount = (svg.match(/<text/g) || []).length;
    const closeTextCount = (svg.match(/<\/text>/g) || []).length;
    assert.strictEqual(openTextCount, closeTextCount, `${label}: <text> tag count (${openTextCount}) must match </text> count (${closeTextCount})`);

    const openTspanCount = (svg.match(/<tspan/g) || []).length;
    const closeTspanCount = (svg.match(/<\/tspan>/g) || []).length;
    assert.strictEqual(openTspanCount, closeTspanCount, `${label}: <tspan> tag count (${openTspanCount}) must match </tspan> count (${closeTspanCount})`);
}

// -----------------------------------------------------------------------------
// 1. Extreme Stellium: 9 Planets in House 1
// -----------------------------------------------------------------------------
const planetSet9 = {
    Sun: 1, Moon: 1, Mars: 1, Mercury: 1, Jupiter: 1,
    Venus: 1, Saturn: 1, Rahu: 1, Ketu: 1
};

runTest('North Indian Chart renders 9 planets in House 1 without error and with valid SVG scaling', () => {
    const svg = ChartRenderer.renderNorthIndianSVG(planetSet9, 1);
    assertValidSVG(svg, 'North 9-Planet Stellium');

    // Verify planet short codes exist
    const expectedShorts = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    expectedShorts.forEach(short => {
        assert.ok(svg.includes(short), `North SVG must contain planet code '${short}'`);
    });

    // Stellium >4 planets triggers dynamic scaling font-size and dy
    assert.ok(svg.includes('font-size='), 'North SVG 9-planet stellium must include dynamic font-size attribute');
    assert.ok(svg.includes('dy="2.2"'), 'North SVG 5-line stellium layout must use dy="2.2"');
});

runTest('South Indian Chart renders 9 planets in Sign 1 without error and with valid SVG scaling', () => {
    const svg = ChartRenderer.renderSouthIndianSVG(planetSet9, 1);
    assertValidSVG(svg, 'South 9-Planet Stellium');

    const expectedShorts = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    expectedShorts.forEach(short => {
        assert.ok(svg.includes(short), `South SVG must contain planet code '${short}'`);
    });

    assert.ok(svg.includes('font-size='), 'South SVG 9-planet stellium must include dynamic font-size attribute');
    assert.ok(svg.includes('dy="2.2"'), 'South SVG 5-line stellium layout must use dy="2.2"');
});

runTest('East Indian Chart renders 9 planets in House 1 without error and with valid SVG scaling', () => {
    const svg = ChartRenderer.renderEastIndianSVG(planetSet9, 1);
    assertValidSVG(svg, 'East 9-Planet Stellium');

    const expectedShorts = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
    expectedShorts.forEach(short => {
        assert.ok(svg.includes(short), `East SVG must contain planet code '${short}'`);
    });

    assert.ok(svg.includes('font-size='), 'East SVG 9-planet stellium must include dynamic font-size attribute');
    assert.ok(svg.includes('dy="2.2"'), 'East SVG 5-line stellium layout must use dy="2.2"');
});

// -----------------------------------------------------------------------------
// 2. String lagnaRashi Values ("12", "01", "invalid", "-5")
// -----------------------------------------------------------------------------
runTest('All renderers handle string lagnaRashi "12"', () => {
    const vargaData = { Sun: 12, Moon: 1 };
    
    const northSVG = ChartRenderer.renderNorthIndianSVG(vargaData, "12");
    assertValidSVG(northSVG, 'North lagnaRashi="12"');
    assert.ok(northSVG.includes('class="house-num" text-anchor="middle">12</text>'), 'North H1 must show rashi 12');

    const southSVG = ChartRenderer.renderSouthIndianSVG(vargaData, "12");
    assertValidSVG(southSVG, 'South lagnaRashi="12"');
    // Box 12 xMin=2, yMin=2
    assert.ok(southSVG.includes('x1="2" y1="10" x2="10" y2="2"'), 'South Lagna=12 slash coordinates match Box 12 xMin=2, yMin=2');

    const eastSVG = ChartRenderer.renderEastIndianSVG(vargaData, "12");
    assertValidSVG(eastSVG, 'East lagnaRashi="12"');
    assert.ok(eastSVG.includes('class="house-num" text-anchor="middle">12</text>'), 'East H1 must show rashi 12');
});

runTest('All renderers handle string lagnaRashi "01"', () => {
    const vargaData = { Sun: 1 };

    const northSVG = ChartRenderer.renderNorthIndianSVG(vargaData, "01");
    assertValidSVG(northSVG, 'North lagnaRashi="01"');
    assert.ok(northSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'North H1 must show rashi 1');

    const southSVG = ChartRenderer.renderSouthIndianSVG(vargaData, "01");
    assertValidSVG(southSVG, 'South lagnaRashi="01"');

    const eastSVG = ChartRenderer.renderEastIndianSVG(vargaData, "01");
    assertValidSVG(eastSVG, 'East lagnaRashi="01"');
    assert.ok(eastSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'East H1 must show rashi 1');
});

runTest('All renderers fallback string lagnaRashi "invalid" to 1', () => {
    const vargaData = { Sun: 1 };

    const northSVG = ChartRenderer.renderNorthIndianSVG(vargaData, "invalid");
    assertValidSVG(northSVG, 'North lagnaRashi="invalid"');
    assert.ok(northSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'North H1 must fallback to rashi 1');

    const southSVG = ChartRenderer.renderSouthIndianSVG(vargaData, "invalid");
    assertValidSVG(southSVG, 'South lagnaRashi="invalid"');

    const eastSVG = ChartRenderer.renderEastIndianSVG(vargaData, "invalid");
    assertValidSVG(eastSVG, 'East lagnaRashi="invalid"');
    assert.ok(eastSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'East H1 must fallback to rashi 1');
});

runTest('All renderers clamp negative string lagnaRashi "-5" to 1', () => {
    const vargaData = { Sun: 1 };

    const northSVG = ChartRenderer.renderNorthIndianSVG(vargaData, "-5");
    assertValidSVG(northSVG, 'North lagnaRashi="-5"');
    assert.ok(northSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'North H1 must clamp to rashi 1');

    const southSVG = ChartRenderer.renderSouthIndianSVG(vargaData, "-5");
    assertValidSVG(southSVG, 'South lagnaRashi="-5"');

    const eastSVG = ChartRenderer.renderEastIndianSVG(vargaData, "-5");
    assertValidSVG(eastSVG, 'East lagnaRashi="-5"');
    assert.ok(eastSVG.includes('class="house-num" text-anchor="middle">1</text>'), 'East H1 must clamp to rashi 1');
});

// -----------------------------------------------------------------------------
// 3. Out of Bounds Rashi Indices (0, 13, -1, 99)
// -----------------------------------------------------------------------------
runTest('All renderers sanitize out-of-bounds lagnaRashi values (0, 13, -1, 99)', () => {
    const testCases = [
        { input: 0, expectedRashi: 1 },
        { input: 13, expectedRashi: 12 },
        { input: -1, expectedRashi: 1 },
        { input: 99, expectedRashi: 12 },
        { input: "0", expectedRashi: 1 },
        { input: "13", expectedRashi: 12 },
        { input: "-1", expectedRashi: 1 },
        { input: "99", expectedRashi: 12 }
    ];

    testCases.forEach(({ input, expectedRashi }) => {
        const north = ChartRenderer.renderNorthIndianSVG({}, input);
        assertValidSVG(north, `North OOB lagna ${input}`);
        assert.ok(north.includes(`class="house-num" text-anchor="middle">${expectedRashi}</text>`), `North lagna ${input} expected H1 rashi ${expectedRashi}`);

        const south = ChartRenderer.renderSouthIndianSVG({}, input);
        assertValidSVG(south, `South OOB lagna ${input}`);

        const east = ChartRenderer.renderEastIndianSVG({}, input);
        assertValidSVG(east, `East OOB lagna ${input}`);
        assert.ok(east.includes(`class="house-num" text-anchor="middle">${expectedRashi}</text>`), `East lagna ${input} expected H1 rashi ${expectedRashi}`);
    });
});

runTest('All renderers sanitize out-of-bounds planet rashi indices (0, 13, -1, 99)', () => {
    const oobPlanets = {
        Sun: 0,       // -> clamped to 1
        Moon: 13,     // -> clamped to 12
        Mars: -1,     // -> clamped to 1
        Jupiter: 99,  // -> clamped to 12
        Venus: "0",   // -> clamped to 1
        Saturn: "13", // -> clamped to 12
        Rahu: "-1",   // -> clamped to 1
        Ketu: "99"    // -> clamped to 12
    };

    [
        { name: 'North', render: ChartRenderer.renderNorthIndianSVG },
        { name: 'South', render: ChartRenderer.renderSouthIndianSVG },
        { name: 'East',  render: ChartRenderer.renderEastIndianSVG }
    ].forEach(({ name, render }) => {
        const svg = render(oobPlanets, 1);
        assertValidSVG(svg, `${name} OOB planet rashi indices`);

        // Check all planet codes exist in output
        ['Su', 'Mo', 'Ma', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].forEach(code => {
            assert.ok(svg.includes(code), `${name} chart must contain planet '${code}'`);
        });
    });
});

// -----------------------------------------------------------------------------
// 4. Empty Planet Arrays & Null / Undefined Varga Data
// -----------------------------------------------------------------------------
runTest('All renderers handle empty planet objects and arrays without error', () => {
    const emptyObjects = [
        {},
        null,
        undefined,
        { Sun: null, Moon: undefined, Mars: NaN, Mercury: "invalid" }
    ];

    emptyObjects.forEach((vData, idx) => {
        const label = `vargaData case #${idx}`;
        
        const northSVG = ChartRenderer.renderNorthIndianSVG(vData, 1);
        assertValidSVG(northSVG, `North ${label}`);

        const southSVG = ChartRenderer.renderSouthIndianSVG(vData, 1);
        assertValidSVG(southSVG, `South ${label}`);

        const eastSVG = ChartRenderer.renderEastIndianSVG(vData, 1);
        assertValidSVG(eastSVG, `East ${label}`);
    });
});

runTest('South Indian chart extracts Lagna from vargaData when lagnaRashi parameter is omitted', () => {
    const vargaData = { Lagna: 4, Sun: 4, Moon: 10 };
    const svg = ChartRenderer.renderSouthIndianSVG(vargaData);
    assertValidSVG(svg, 'South auto-extract Lagna');
    
    // Box 4 has xMin: 74, yMin: 26 -> Lagna slash line: x1="74" y1="34" x2="82" y2="26"
    assert.ok(svg.includes('x1="74" y1="34" x2="82" y2="26"'), 'South SVG must highlight Sign 4 as Lagna');
});

console.log(`\n==================================================`);
console.log(`All ${passedTests}/${totalTests} Chart Boundary Extreme tests passed successfully!`);
console.log(`==================================================\n`);
