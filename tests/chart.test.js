/**
 * AstroDSJK — Dynamic Vector SVG Chart Renderer Unit & Layout Integrity Tests
 * Verifies SVG validity, multi-planet <tspan> vertical line-wrapping,
 * East-Indian non-overlapping house coordinates against grid lines,
 * South-Indian visual Lagna slash rendering, and responsive viewBox scaling.
 */

const assert = require('assert');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('=== Running AstroDSJK Dynamic Vector SVG Chart Renderer Tests ===\n');

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

// Sample planet placement data
const samplePlanets = {
    Sun: 1,
    Moon: 1,
    Mars: 1,
    Mercury: 1,
    Jupiter: 5,
    Venus: 9,
    Saturn: 10,
    Rahu: 2,
    Ketu: 8,
    Ascendant: 1
};

// 1. Valid SVG output & viewBox check across all 3 chart renderers
runTest('renderNorthIndianSVG produces valid SVG string with correct viewBox and elements', () => {
    const svg = ChartRenderer.renderNorthIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<svg'), 'North Indian SVG missing <svg> opening tag');
    assert.ok(svg.includes('viewBox="0 0 100 100"'), 'North Indian SVG missing viewBox="0 0 100 100"');
    assert.ok(svg.includes('</svg>'), 'North Indian SVG missing </svg> closing tag');
    assert.ok(svg.includes('class="kundali-chart-svg"'), 'North Indian SVG missing chart class');
});

runTest('renderSouthIndianSVG produces valid SVG string with correct viewBox and elements', () => {
    const svg = ChartRenderer.renderSouthIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<svg'), 'South Indian SVG missing <svg> opening tag');
    assert.ok(svg.includes('viewBox="0 0 100 100"'), 'South Indian SVG missing viewBox="0 0 100 100"');
    assert.ok(svg.includes('</svg>'), 'South Indian SVG missing </svg> closing tag');
    assert.ok(svg.includes('class="kundali-chart-svg"'), 'South Indian SVG missing chart class');
});

runTest('renderEastIndianSVG produces valid SVG string with correct viewBox and elements', () => {
    const svg = ChartRenderer.renderEastIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<svg'), 'East Indian SVG missing <svg> opening tag');
    assert.ok(svg.includes('viewBox="0 0 100 100"'), 'East Indian SVG missing viewBox="0 0 100 100"');
    assert.ok(svg.includes('</svg>'), 'East Indian SVG missing </svg> closing tag');
    assert.ok(svg.includes('class="kundali-chart-svg"'), 'East Indian SVG missing chart class');
});

// 2. Multi-planet houses line wrapping & <tspan> verification
runTest('Multi-planet house placements use <tspan> vertical line wrapping in North Indian chart', () => {
    // 4 planets + Ascendant in House 1 (rashi 1, lagna 1)
    const svg = ChartRenderer.renderNorthIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<tspan'), 'Multi-planet house must use <tspan> elements for layout');
    assert.ok(svg.includes('dy="3.6"') || svg.includes('dy="2.8"'), 'Multi-planet house <tspan> must specify vertical line offset dy');
});

runTest('Multi-planet house placements use <tspan> vertical line wrapping in South Indian chart', () => {
    const svg = ChartRenderer.renderSouthIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<tspan'), 'Multi-planet house in South Indian chart must use <tspan> elements');
    assert.ok(svg.includes('dy="3.6"') || svg.includes('dy="2.8"'), 'South Indian multi-planet <tspan> must specify vertical line offset dy');
});

runTest('Multi-planet house placements use <tspan> vertical line wrapping in East Indian chart', () => {
    const svg = ChartRenderer.renderEastIndianSVG(samplePlanets, 1);
    assert.ok(svg.includes('<tspan'), 'Multi-planet house in East Indian chart must use <tspan> elements');
    assert.ok(svg.includes('dy="3.6"') || svg.includes('dy="2.8"'), 'East Indian multi-planet <tspan> must specify vertical line offset dy');
});

// 3. East Indian chart 3x3 grid partition lines and house coordinates verification
runTest('East Indian chart renders 3x3 grid partition lines and updated house coordinates', () => {
    const svg = ChartRenderer.renderEastIndianSVG(samplePlanets, 1);
    
    // Check 3x3 grid partition lines
    assert.ok(svg.includes('<line x1="2" y1="26" x2="98" y2="26" class="chart-line" />'), 'East Indian SVG missing y=26 partition line');
    assert.ok(svg.includes('<line x1="2" y1="74" x2="98" y2="74" class="chart-line" />'), 'East Indian SVG missing y=74 partition line');
    assert.ok(svg.includes('<line x1="26" y1="2" x2="26" y2="98" class="chart-line" />'), 'East Indian SVG missing x=26 partition line');
    assert.ok(svg.includes('<line x1="74" y1="2" x2="74" y2="98" class="chart-line" />'), 'East Indian SVG missing x=74 partition line');

    // Regex to match house number text elements and extract x, y coordinates
    const houseTextRegex = /<text\s+x="([\d.]+)"\s+y="([\d.]+)"\s+class="house-num"/g;
    const matches = [];
    let match;
    while ((match = houseTextRegex.exec(svg)) !== null) {
        matches.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
    }

    assert.strictEqual(matches.length, 12, 'East Indian SVG must contain 12 house number text elements');

    const expectedCoords = [
        { x: 35, y: 11 }, // H1
        { x: 14, y: 17 }, // H2
        { x: 14, y: 77 }, // H3
        { x: 35, y: 83 }, // H4
        { x: 65, y: 83 }, // H5
        { x: 86, y: 77 }, // H6
        { x: 86, y: 17 }, // H7
        { x: 65, y: 11 }, // H8
        { x: 35, y: 35 }, // H9
        { x: 35, y: 59 }, // H10
        { x: 65, y: 59 }, // H11
        { x: 65, y: 35 }  // H12
    ];

    expectedCoords.forEach((exp, idx) => {
        const actual = matches[idx];
        assert.strictEqual(actual.x, exp.x, `H${idx + 1} x coord (${actual.x}) does not match expected (${exp.x})`);
        assert.strictEqual(actual.y, exp.y, `H${idx + 1} y coord (${actual.y}) does not match expected (${exp.y})`);
    });
});

// 4. South Indian visual Lagna indicator verification
runTest('South Indian chart renders explicit visual Lagna indicator (slash line)', () => {
    const svgLagna1 = ChartRenderer.renderSouthIndianSVG(samplePlanets, 1);
    assert.ok(svgLagna1.includes('class="lagna-slash'), 'South Indian SVG must render <line class="lagna-slash"> for Lagna sign');
    assert.ok(svgLagna1.includes('class="lagna-label"'), 'South Indian SVG must render Asc/Lagna label for Lagna sign');

    // Test with a different Lagna sign (e.g. Lagna = 8 Scorpio)
    const svgLagna8 = ChartRenderer.renderSouthIndianSVG(samplePlanets, 8);
    assert.ok(svgLagna8.includes('class="lagna-slash'), 'South Indian SVG for Lagna=8 must render lagna-slash');
    // Ensure slash coordinates match sign box 8 (xMin: 26, yMin: 74)
    assert.ok(svgLagna8.includes('x1="26"'), 'South Indian Lagna=8 slash x1 coordinate must match Scorpio box xMin');
});

// 5. Responsive scaling attributes verification
runTest('All chart renderers set responsive scaling SVG attributes', () => {
    [
        ChartRenderer.renderNorthIndianSVG(samplePlanets, 1),
        ChartRenderer.renderSouthIndianSVG(samplePlanets, 1),
        ChartRenderer.renderEastIndianSVG(samplePlanets, 1)
    ].forEach((svg, idx) => {
        const names = ['North Indian', 'South Indian', 'East Indian'];
        assert.ok(svg.includes('width="100%"'), `${names[idx]} chart missing width="100%"`);
        assert.ok(svg.includes('height="100%"'), `${names[idx]} chart missing height="100%"`);
        assert.ok(svg.includes('viewBox="0 0 100 100"'), `${names[idx]} chart missing viewBox="0 0 100 100"`);
    });
});

console.log(`\n==================================================`);
console.log(`All ${passedTests}/${totalTests} Chart Renderer tests passed successfully!`);
console.log(`==================================================\n`);
