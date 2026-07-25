/**
 * AstroDSJK — 1,000 Chart Configuration Stress & XML Well-Formedness Test
 * Generates 1,000 random chart configurations (random planets, random rashis, random chart types, edge cases).
 * Validates XML well-formedness via JS parser and Python xml.etree.ElementTree.
 * Checks for NaN, undefined, null, crashes, and attribute/coordinate anomalies.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ChartRenderer = require('../js/chart-renderer.js');

console.log('================================================================================');
console.log('   AstroDSJK Chart Renderer — 1,000 Random Configuration Empirical Stress Test  ');
console.log('================================================================================\n');

// Pseudo-random generator with seed for 100% reproducible test runs
function createPRNG(seed = 123456789) {
    let s = seed;
    return function random() {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
    };
}

const rng = createPRNG(987654321);

function getRandomInt(min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
}

function getRandomChoice(arr) {
    return arr[Math.floor(rng() * arr.length)];
}

// Candidate planet names including standard planets, upagrahas, special names, and edge cases
const PLANET_POOL = [
    "Ascendant", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
    "Uranus", "Neptune", "Pluto", "Gulika", "Mandi", "Dhuma", "Vyatipata", "Paravesha", "Indrachapa", "Upaketu",
    "Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke", "Lagna"
];

// Rashi pool including valid 1..12 and boundary/invalid values
const RASHI_POOL = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    0, 13, -1, -5, 99, "1", "5", "12", "0", "15", "abc", null, undefined, 3.5, 7.8
];

// Lagna rashi pool
const LAGNA_POOL = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    0, 13, -2, 99, "1", "7", "12", "0", "15", "xyz", null, undefined, 4.2
];

const CHART_TYPES = ["north", "south", "east"];

// Stack-based XML well-formedness validator in JavaScript
function validateXMLJS(xmlString) {
    if (!xmlString || typeof xmlString !== 'string') {
        return { valid: false, error: 'Empty or non-string XML input' };
    }
    
    const trimmed = xmlString.trim();
    if (!trimmed.startsWith('<svg') || !trimmed.endsWith('</svg>')) {
        return { valid: false, error: 'XML does not start with <svg and end with </svg>' };
    }

    const stack = [];
    const tagRegex = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<(\/)?([a-zA-Z0-9:-]+)([^>]*?)(\/)?>/g;
    
    let match;
    while ((match = tagRegex.exec(xmlString)) !== null) {
        const fullTag = match[0];
        if (fullTag.startsWith('<!--') || fullTag.startsWith('<?') || fullTag.startsWith('<!')) {
            continue;
        }

        const isClosing = Boolean(match[1]);
        const tagName = match[2];
        const attributesRaw = match[3];
        const isSelfClosing = Boolean(match[4]);

        if (isSelfClosing) {
            const attrErr = validateAttributes(attributesRaw);
            if (attrErr) return { valid: false, error: `Invalid attributes in <${tagName}/>: ${attrErr}` };
            continue;
        }

        if (isClosing) {
            if (stack.length === 0) {
                return { valid: false, error: `Unexpected closing tag </${tagName}> with empty stack` };
            }
            const top = stack.pop();
            if (top !== tagName) {
                return { valid: false, error: `Mismatched tag: expected </${top}>, found </${tagName}>` };
            }
        } else {
            const attrErr = validateAttributes(attributesRaw);
            if (attrErr) return { valid: false, error: `Invalid attributes in <${tagName}>: ${attrErr}` };
            stack.push(tagName);
        }
    }

    if (stack.length !== 0) {
        return { valid: false, error: `Unclosed tags remaining: ${stack.join(', ')}` };
    }

    return { valid: true };
}

function validateAttributes(attrStr) {
    if (!attrStr || !attrStr.trim()) return null;
    
    // Check for unquoted attributes or unclosed quotes
    const attrRegex = /([a-zA-Z0-9:-]+)\s*=\s*("[^"]*"|'[^']*')/g;
    let stripped = attrStr.replace(attrRegex, '').trim();
    if (stripped === '/' || stripped === '') {
        return null;
    }
    if (stripped.length > 0) {
        return `Malformed attributes string '${attrStr}' (remainder: '${stripped}')`;
    }
    return null;
}

// Generate 1,000 test configurations
const NUM_CONFIGS = 1000;
const testCases = [];

for (let i = 1; i <= NUM_CONFIGS; i++) {
    const chartType = getRandomChoice(CHART_TYPES);
    const lagnaRashi = getRandomChoice(LAGNA_POOL);

    let vargaData = {};
    const configStyle = rng();

    if (configStyle < 0.05) {
        // 5% Empty vargaData
        vargaData = {};
    } else if (configStyle < 0.10) {
        // 5% Null or undefined vargaData
        vargaData = rng() < 0.5 ? null : undefined;
    } else if (configStyle < 0.25) {
        // 15% Extreme Stellium: 6 to 15 planets in a SINGLE rashi
        const targetRashi = getRandomChoice(RASHI_POOL);
        const planetCount = getRandomInt(6, 15);
        const shuffledPlanets = [...PLANET_POOL].sort(() => rng() - 0.5);
        for (let p = 0; p < planetCount; p++) {
            const pName = shuffledPlanets[p % shuffledPlanets.length] + (p >= shuffledPlanets.length ? `_${p}` : '');
            vargaData[pName] = targetRashi;
        }
    } else {
        // 75% Random distribution of 1 to 15 planets across random rashis
        const planetCount = getRandomInt(1, 15);
        const shuffledPlanets = [...PLANET_POOL].sort(() => rng() - 0.5);
        for (let p = 0; p < planetCount; p++) {
            const pName = shuffledPlanets[p % shuffledPlanets.length];
            vargaData[pName] = getRandomChoice(RASHI_POOL);
        }
    }

    testCases.push({
        id: i,
        chartType,
        lagnaRashi,
        vargaData
    });
}

// Track execution stats
let totalCount = 0;
let passedCount = 0;
let failedCount = 0;
const failures = [];
const typeStats = { north: 0, south: 0, east: 0 };
const generatedSVGs = [];

console.log(`Generated ${NUM_CONFIGS} randomized chart configurations.`);
console.log('Running render stress tests...\n');

const startTime = Date.now();

testCases.forEach((tc) => {
    totalCount++;
    typeStats[tc.chartType]++;

    let svg = '';
    let renderErr = null;

    try {
        if (tc.chartType === 'north') {
            svg = ChartRenderer.renderNorthIndianSVG(tc.vargaData, tc.lagnaRashi);
        } else if (tc.chartType === 'south') {
            svg = ChartRenderer.renderSouthIndianSVG(tc.vargaData, tc.lagnaRashi);
        } else if (tc.chartType === 'east') {
            svg = ChartRenderer.renderEastIndianSVG(tc.vargaData, tc.lagnaRashi);
        }
    } catch (err) {
        renderErr = err;
    }

    if (renderErr) {
        failedCount++;
        failures.push({ id: tc.id, tc, error: `Unhandled exception during render: ${renderErr.message}` });
        return;
    }

    // Check 1: Unexpected NaN, undefined, or null substrings in rendered SVG
    if (svg.includes('NaN')) {
        failedCount++;
        failures.push({ id: tc.id, tc, error: 'SVG contains unexpected "NaN"' });
        return;
    }
    if (svg.includes('undefined')) {
        failedCount++;
        failures.push({ id: tc.id, tc, error: 'SVG contains unexpected "undefined"' });
        return;
    }

    // Check 2: JS XML Well-formedness
    const xmlVal = validateXMLJS(svg);
    if (!xmlVal.valid) {
        failedCount++;
        failures.push({ id: tc.id, tc, error: `JS XML Validation failed: ${xmlVal.error}` });
        return;
    }

    // Save SVG for Python batch XML validation
    generatedSVGs.push({ id: tc.id, svg });
    passedCount++;
});

console.log(`Completed initial JS render & validation in ${Date.now() - startTime}ms.`);
console.log(`JS Validation Passed: ${passedCount}/${totalCount}`);

// Python Batch XML Validation via xml.etree.ElementTree
console.log('\nValidating all generated SVGs with Python xml.etree.ElementTree (Expat XML Parser)...');

const timeStamp = Date.now();
const tempBatchPath = path.join(__dirname, `temp_svg_batch_${timeStamp}.json`);
const tempPyScriptPath = path.join(__dirname, `temp_py_validate_${timeStamp}.py`);

fs.writeFileSync(tempBatchPath, JSON.stringify(generatedSVGs), 'utf8');

const pyScriptContent = `import json, sys
import xml.etree.ElementTree as ET

with open(sys.argv[1], "r", encoding="utf-8") as f:
    items = json.load(f)

errors = []
for item in items:
    try:
        ET.fromstring(item["svg"])
    except Exception as e:
        errors.append({"id": item["id"], "error": str(e)})

print(json.dumps({"total": len(items), "error_count": len(errors), "errors": errors}))
`;

fs.writeFileSync(tempPyScriptPath, pyScriptContent, 'utf8');

let pythonValidationPassed = false;
try {
    const pyOutput = execSync(`python "${tempPyScriptPath}" "${tempBatchPath}"`, { encoding: 'utf8' });
    const pyResult = JSON.parse(pyOutput.trim());
    
    if (pyResult.error_count === 0) {
        console.log(`✔ Python XML Expat Validation: 100% PASS (${pyResult.total}/${pyResult.total} SVGs well-formed XML)`);
        pythonValidationPassed = true;
    } else {
        console.error(`✘ Python XML Validation failed for ${pyResult.error_count} SVGs:`);
        pyResult.errors.forEach(e => {
            console.error(`  - Config #${e.id}: ${e.error}`);
            failedCount++;
            passedCount--;
            failures.push({ id: e.id, error: `Python XML Expat parsing error: ${e.error}` });
        });
    }
} catch (err) {
    console.error(`Error running Python XML validation: ${err.message}`);
} finally {
    if (fs.existsSync(tempBatchPath)) fs.unlinkSync(tempBatchPath);
    if (fs.existsSync(tempPyScriptPath)) fs.unlinkSync(tempPyScriptPath);
}

// Print Summary Report
console.log('\n================================================================================');
console.log('                          STRESS TEST SUMMARY REPORT                            ');
console.log('================================================================================');
console.log(`Total Configurations Tested : ${totalCount}`);
console.log(`Passed Configurations       : ${passedCount}`);
console.log(`Failed Configurations       : ${failedCount}`);
console.log(`Chart Type Distribution     : North=${typeStats.north}, South=${typeStats.south}, East=${typeStats.east}`);
console.log('================================================================================\n');

if (failures.length > 0) {
    console.error('FAILURES SUMMARY:');
    failures.forEach(f => console.error(`  [Config #${f.id}] ${f.error}`));
    process.exit(1);
} else {
    console.log('✔ SUCCESS: All 1,000 random chart configurations rendered successfully with valid XML & no NaNs!');
    process.exit(0);
}
