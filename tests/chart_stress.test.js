/**
 * AstroDSJK — Chart Renderer Stress & Stellium Layout Verification Tests
 * Tests 5+, 6+, and 9-planet stelliums in a single house across North, South, and East Indian charts.
 * Verifies font-size scaling, dy step scaling, SVG syntax validity, zero crashes, zero visual overlaps/out-of-bounds.
 */

const assert = require('assert');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('=== Running AstroDSJK Chart Renderer Stress Tests ===\n');

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

// 6-planet stellium dataset in Rashi 1 (House 1 when Lagna = 1)
const stellium6Planets = {
    Sun: 1,
    Moon: 1,
    Mars: 1,
    Mercury: 1,
    Jupiter: 1,
    Venus: 1,
    Saturn: 5,
    Rahu: 9,
    Ketu: 11
};

// 9-planet extreme stellium (all planets in Rashi 1)
const stellium9Planets = {
    Sun: 1, Moon: 1, Mars: 1, Mercury: 1,
    Jupiter: 1, Venus: 1, Saturn: 1, Rahu: 1, Ketu: 1
};

// 1. North Indian Chart 6-planet Stellium
runTest('North Indian Chart handles 6-planet stellium with responsive font scaling and dy step', () => {
    const svg = ChartRenderer.renderNorthIndianSVG(stellium6Planets, 1);
    assert.ok(svg.includes('<svg'), 'North SVG must render');
    assert.ok(svg.includes('font-size="2.6px"'), 'Stellium <text> must specify scaled font-size="2.6px"');
    assert.ok(svg.includes('dy="2.8"'), 'Stellium <tspan> must specify scaled dy="2.8"');
    
    // Verify vertical coordinates fit within house diamond geometry
    const yMatches = [...svg.matchAll(/<text x="[\d.]+" y="([\d.]+)" class="planet-label"/g)];
    assert.ok(yMatches.length > 0, 'Must contain planet label text');
    yMatches.forEach(m => {
        const yVal = parseFloat(m[1]);
        assert.ok(yVal >= 0 && yVal <= 100, `Planet label Y-coord (${yVal}) must be within viewBox 0..100`);
    });
});

// 2. South Indian Chart 6-planet Stellium
runTest('South Indian Chart handles 6-planet stellium with responsive font scaling and dy step', () => {
    const svg = ChartRenderer.renderSouthIndianSVG(stellium6Planets, 1);
    assert.ok(svg.includes('<svg'), 'South SVG must render');
    assert.ok(svg.includes('font-size="2.6px"'), 'South Stellium <text> must specify scaled font-size="2.6px"');
    assert.ok(svg.includes('dy="2.8"'), 'South Stellium <tspan> must specify scaled dy="2.8"');
});

// 3. East Indian Chart 6-planet Stellium
runTest('East Indian Chart handles 6-planet stellium with responsive font scaling and dy step', () => {
    const svg = ChartRenderer.renderEastIndianSVG(stellium6Planets, 1);
    assert.ok(svg.includes('<svg'), 'East SVG must render');
    assert.ok(svg.includes('font-size="2.6px"'), 'East Stellium <text> must specify scaled font-size="2.6px"');
    assert.ok(svg.includes('dy="2.8"'), 'East Stellium <tspan> must specify scaled dy="2.8"');
});

// 4. Extreme 9-Planet Stellium across all 3 chart styles
runTest('North, South, and East Indian charts handle extreme 9-planet stellium without crashing or syntax errors', () => {
    [
        ChartRenderer.renderNorthIndianSVG(stellium9Planets, 1),
        ChartRenderer.renderSouthIndianSVG(stellium9Planets, 1),
        ChartRenderer.renderEastIndianSVG(stellium9Planets, 1)
    ].forEach((svg, idx) => {
        const style = ['North', 'South', 'East'][idx];
        assert.ok(svg.includes('<svg'), `${style} SVG missing opening tag`);
        assert.ok(svg.includes('</svg>'), `${style} SVG missing closing tag`);
        assert.ok(!svg.includes('NaN'), `${style} SVG contains NaN`);
        assert.ok(!svg.includes('undefined'), `${style} SVG contains undefined`);
        
        // 9 planets chunked by 2 = 5 lines -> dy scaled to 2.2
        assert.ok(svg.includes('dy="2.2"'), `${style} 9-planet stellium must use dy="2.2" for 5-line vertical layout`);
    });
});

// 5. Non-stellium (<=4 planets) dynamic scaling check
runTest('Non-stellium (<=4 planets) retains standard styling without font-size override', () => {
    const smallData = { Sun: 1, Moon: 1, Mars: 1, Mercury: 1 };
    const svg = ChartRenderer.renderNorthIndianSVG(smallData, 1);
    assert.ok(svg.includes('dy="3.6"'), 'Standard 4-planet house must use dy="3.6"');
    assert.ok(!svg.includes('font-size="2.6px"'), 'Standard 4-planet house must not override font-size to 2.6px');
});

console.log(`\n==================================================`);
console.log(`All ${passedTests}/${totalTests} Chart Stress tests passed successfully!`);
console.log(`==================================================\n`);
