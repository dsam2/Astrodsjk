/**
 * AstroDSJK — Dynamic Vector SVG Chart Rendering Engine
 * Renders North-Indian (Diamond), South-Indian (Box), and East-Indian (Square) Kundali charts
 * with responsive layout, non-overlapping multi-planet tspan line-wrapping,
 * non-overlapping house text coordinates, and visual Lagna styling.
 */

const ChartRenderer = (() => {

    const PLANET_SHORT = {
        Ascendant: "Asc", Asc: "Asc", Lagna: "Asc",
        Sun: "Su", Su: "Su",
        Moon: "Mo", Mo: "Mo",
        Mars: "Ma", Ma: "Ma",
        Mercury: "Me", Me: "Me",
        Jupiter: "Ju", Ju: "Ju",
        Venus: "Ve", Ve: "Ve",
        Saturn: "Sa", Sa: "Sa",
        Rahu: "Ra", Ra: "Ra",
        Ketu: "Ke", Ke: "Ke"
    };

    /**
     * Helper to split an array of planet short names into lines of max 2 planets
     * and format as SVG <text> with <tspan> children for non-overlapping vertical multi-line layout.
     */
    function formatPlanetText(x, y, planets) {
        if (!planets || planets.length === 0) return '';

        // Chunk planets into lines of max 2 planets for clean, narrow vertical stacking
        const maxPerLine = 2;
        const lines = [];
        for (let i = 0; i < planets.length; i += maxPerLine) {
            lines.push(planets.slice(i, i + maxPerLine).join(" "));
        }

        const count = planets.length;
        const isStellium = count > 4;

        // Dynamic responsive scaling for 5+ planet stelliums
        const fontSize = isStellium ? Math.max(2.0, Number((2.6 - Math.max(0, lines.length - 3) * 0.3).toFixed(1))) : null;
        const lineHeight = isStellium ? Math.max(2.2, Number((2.8 - Math.max(0, lines.length - 3) * 0.3).toFixed(1))) : 3.6;

        // Vertically center the multi-line block around y + 2.5
        const startY = y + 2.5 - ((lines.length - 1) * lineHeight) / 2;

        let tspanContent = '';
        lines.forEach((lineStr, index) => {
            const dy = index === 0 ? 0 : lineHeight;
            tspanContent += `<tspan x="${x}" dy="${dy}">${lineStr}</tspan>`;
        });

        const fontSizeAttr = fontSize ? ` font-size="${fontSize}px" style="font-size: ${fontSize}px;"` : '';
        return `<text x="${x}" y="${startY}" class="planet-label"${fontSizeAttr} text-anchor="middle">${tspanContent}</text>`;
    }

    /**
     * Renders a North Indian Diamond Chart (Lagna-centered)
     * @param {Object} vargaData Map of planets to rashi numbers (1-12)
     * @param {Number} lagnaRashi Rashi number of Ascendant (1-12)
     * @returns {String} SVG string
     */
    function renderNorthIndianSVG(vargaData, lagnaRashi = 1) {
        lagnaRashi = parseInt(lagnaRashi, 10) || 1;
        lagnaRashi = Math.min(12, Math.max(1, lagnaRashi));

        // House center positions in North Indian diamond grid (100x100 viewBox)
        const houseCoordinates = [
            { x: 50, y: 30 },  // H1 (Top Diamond Center)
            { x: 25, y: 15 },  // H2 (Top Left Triangle)
            { x: 12, y: 25 },  // H3 (Left Upper Triangle)
            { x: 30, y: 50 },  // H4 (Left Diamond Center)
            { x: 12, y: 75 },  // H5 (Left Lower Triangle)
            { x: 25, y: 85 },  // H6 (Bottom Left Triangle)
            { x: 50, y: 70 },  // H7 (Bottom Diamond Center)
            { x: 75, y: 85 },  // H8 (Bottom Right Triangle)
            { x: 88, y: 75 },  // H9 (Right Lower Triangle)
            { x: 70, y: 50 },  // H10 (Right Diamond Center)
            { x: 88, y: 25 },  // H11 (Right Upper Triangle)
            { x: 75, y: 15 }   // H12 (Top Right Triangle)
        ];

        // Map planets into house buckets (0-11)
        const housePlanets = Array.from({ length: 12 }, () => []);
        if (vargaData) {
            for (let p in vargaData) {
                let rashi = vargaData[p];
                rashi = Math.min(12, Math.max(1, parseInt(rashi, 10) || 1));
                let houseIdx = ((rashi - lagnaRashi) % 12 + 12) % 12;
                housePlanets[houseIdx].push(PLANET_SHORT[p] || p);
            }
        }

        let svgContent = `<svg viewBox="0 0 100 100" width="100%" height="100%" class="kundali-chart-svg">
    <style>
        .chart-line { stroke: var(--accent-primary, #8B5A2B); stroke-width: 0.8; fill: none; }
        .house-num { font-size: 3.5px; fill: var(--text-secondary, #64748b); font-family: monospace; }
        .planet-label { font-size: 3.5px; font-weight: bold; fill: var(--accent-primary, #8B5A2B); font-family: sans-serif; }
    </style>

    <!-- Outer Square -->
    <rect x="2" y="2" width="96" height="96" class="chart-line" />
    <!-- Diagonals -->
    <line x1="2" y1="2" x2="98" y2="98" class="chart-line" />
    <line x1="2" y1="98" x2="98" y2="2" class="chart-line" />
    <!-- Inner Diamond -->
    <polygon points="50,2 98,50 50,98 2,50" class="chart-line" />
`;

        for (let i = 0; i < 12; i++) {
            let coords = houseCoordinates[i];
            let rashiNum = ((lagnaRashi - 1 + i) % 12) + 1;
            let planetText = formatPlanetText(coords.x, coords.y, housePlanets[i]);

            svgContent += `
    <text x="${coords.x}" y="${coords.y - 4}" class="house-num" text-anchor="middle">${rashiNum}</text>
    ${planetText}`;
        }

        svgContent += `
</svg>`;
        return svgContent;
    }

    /**
     * Renders a South Indian Box Chart (Fixed Signs with visual Lagna indicator)
     * @param {Object} vargaData Map of planets to rashi numbers (1-12)
     * @param {Number} lagnaRashi Rashi number of Ascendant (1-12)
     * @returns {String} SVG string
     */
    function renderSouthIndianSVG(vargaData, lagnaRashi) {
        // If lagnaRashi is not passed explicitly, attempt to extract from vargaData
        if (!lagnaRashi && vargaData) {
            lagnaRashi = vargaData.Ascendant || vargaData.Asc || vargaData.Lagna || 1;
        }
        lagnaRashi = parseInt(lagnaRashi, 10) || 1;
        lagnaRashi = Math.min(12, Math.max(1, lagnaRashi));

        // Box centers and bounding top-left coordinates for signs 1-12
        const southBoxCoords = {
            12: { x: 14, y: 14, xMin: 2,  yMin: 2 },
            1:  { x: 38, y: 14, xMin: 26, yMin: 2 },
            2:  { x: 62, y: 14, xMin: 50, yMin: 2 },
            3:  { x: 86, y: 14, xMin: 74, yMin: 2 },
            11: { x: 14, y: 38, xMin: 2,  yMin: 26 },
            4:  { x: 86, y: 38, xMin: 74, yMin: 26 },
            10: { x: 14, y: 62, xMin: 2,  yMin: 50 },
            5:  { x: 86, y: 62, xMin: 74, yMin: 50 },
            9:  { x: 14, y: 86, xMin: 2,  yMin: 74 },
            8:  { x: 38, y: 86, xMin: 26, yMin: 74 },
            7:  { x: 62, y: 86, xMin: 50, yMin: 74 },
            6:  { x: 86, y: 86, xMin: 74, yMin: 74 }
        };

        const rashiPlanets = Array.from({ length: 13 }, () => []);
        if (vargaData) {
            for (let p in vargaData) {
                let rashi = vargaData[p];
                rashi = Math.min(12, Math.max(1, parseInt(rashi, 10) || 1));
                rashiPlanets[rashi].push(PLANET_SHORT[p] || p);
            }
        }

        let svgContent = `<svg viewBox="0 0 100 100" width="100%" height="100%" class="kundali-chart-svg">
    <style>
        .chart-line { stroke: var(--accent-primary, #8B5A2B); stroke-width: 0.8; fill: none; }
        .rashi-label { font-size: 3.2px; fill: var(--text-secondary, #64748b); font-family: monospace; }
        .planet-label { font-size: 3.5px; font-weight: bold; fill: var(--accent-primary, #8B5A2B); font-family: sans-serif; }
        .lagna-slash { stroke: var(--accent-primary, #8B5A2B); stroke-width: 1.2; stroke-linecap: round; }
        .lagna-label { font-size: 2.8px; font-weight: bold; fill: var(--accent-primary, #8B5A2B); }
    </style>

    <rect x="2" y="2" width="96" height="96" class="chart-line" />
    <!-- 4x4 Grid lines -->
    <line x1="26" y1="2" x2="26" y2="98" class="chart-line" />
    <line x1="50" y1="2" x2="50" y2="26" class="chart-line" />
    <line x1="50" y1="74" x2="50" y2="98" class="chart-line" />
    <line x1="74" y1="2" x2="74" y2="98" class="chart-line" />

    <line x1="2" y1="26" x2="98" y2="26" class="chart-line" />
    <line x1="2" y1="50" x2="26" y2="50" class="chart-line" />
    <line x1="74" y1="50" x2="98" y2="50" class="chart-line" />
    <line x1="2" y1="74" x2="98" y2="74" class="chart-line" />
`;

        for (let r = 1; r <= 12; r++) {
            let coords = southBoxCoords[r];
            let planetText = formatPlanetText(coords.x, coords.y, rashiPlanets[r]);
            let isLagna = (r === lagnaRashi);

            // Visual Lagna Slash Indicator in top-left corner of the Lagna sign box
            let lagnaIndicator = '';
            if (isLagna) {
                lagnaIndicator = `
    <line x1="${coords.xMin}" y1="${coords.yMin + 8}" x2="${coords.xMin + 8}" y2="${coords.yMin}" class="lagna-slash lagna-indicator" />
    <text x="${coords.xMin + 9}" y="${coords.yMin + 5}" class="lagna-label">Asc</text>`;
            }

            svgContent += `
    <text x="${coords.xMin + 2}" y="${coords.yMin + 5}" class="rashi-label">${r}</text>${lagnaIndicator}
    ${planetText}`;
        }

        svgContent += `
</svg>`;
        return svgContent;
    }

    /**
     * Renders an East Indian Style Chart (Non-overlapping coordinates)
     * @param {Object} vargaData Map of planets to rashi numbers (1-12)
     * @param {Number} lagnaRashi Rashi number of Ascendant (1-12)
     * @returns {String} SVG string
     */
    function renderEastIndianSVG(vargaData, lagnaRashi = 1) {
        lagnaRashi = parseInt(lagnaRashi, 10) || 1;
        lagnaRashi = Math.min(12, Math.max(1, lagnaRashi));

        // Non-overlapping house center coordinates avoiding grid diagonals (y=x and y=100-x) and cross lines
        const eastHouseCoords = [
            { x: 35, y: 14 },
            { x: 14, y: 20 },
            { x: 14, y: 80 },
            { x: 35, y: 86 },
            { x: 65, y: 86 },
            { x: 86, y: 80 },
            { x: 86, y: 20 },
            { x: 65, y: 14 },
            { x: 35, y: 38 },
            { x: 35, y: 62 },
            { x: 65, y: 62 },
            { x: 65, y: 38 }
        ];

        const housePlanets = Array.from({ length: 12 }, () => []);
        if (vargaData) {
            for (let p in vargaData) {
                let rashi = vargaData[p];
                rashi = Math.min(12, Math.max(1, parseInt(rashi, 10) || 1));
                let houseIdx = ((rashi - lagnaRashi) % 12 + 12) % 12;
                housePlanets[houseIdx].push(PLANET_SHORT[p] || p);
            }
        }

        let svgContent = `<svg viewBox="0 0 100 100" width="100%" height="100%" class="kundali-chart-svg">
    <style>
        .chart-line { stroke: var(--accent-primary, #8B5A2B); stroke-width: 0.8; fill: none; }
        .house-num { font-size: 3.2px; fill: var(--text-secondary, #64748b); font-family: monospace; }
        .planet-label { font-size: 3.5px; font-weight: bold; fill: var(--accent-primary, #8B5A2B); font-family: sans-serif; }
    </style>

    <rect x="2" y="2" width="96" height="96" class="chart-line" />
    <line x1="2" y1="2" x2="98" y2="98" class="chart-line" />
    <line x1="2" y1="98" x2="98" y2="2" class="chart-line" />
    <line x1="50" y1="2" x2="50" y2="98" class="chart-line" />
    <line x1="2" y1="50" x2="98" y2="50" class="chart-line" />
    <line x1="2" y1="26" x2="98" y2="26" class="chart-line" />
    <line x1="2" y1="74" x2="98" y2="74" class="chart-line" />
    <line x1="26" y1="2" x2="26" y2="98" class="chart-line" />
    <line x1="74" y1="2" x2="74" y2="98" class="chart-line" />
`;

        for (let i = 0; i < 12; i++) {
            let coords = eastHouseCoords[i];
            let rashiNum = ((lagnaRashi - 1 + i) % 12) + 1;
            let planetText = formatPlanetText(coords.x, coords.y, housePlanets[i]);

            svgContent += `
    <text x="${coords.x}" y="${coords.y - 3}" class="house-num" text-anchor="middle">${rashiNum}</text>
    ${planetText}`;
        }

        svgContent += `
</svg>`;
        return svgContent;
    }

    return {
        renderNorthIndianSVG,
        renderSouthIndianSVG,
        renderEastIndianSVG
    };
})();

if (typeof window !== 'undefined') {
    window.ChartRenderer = ChartRenderer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartRenderer;
}
