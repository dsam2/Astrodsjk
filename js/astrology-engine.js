/**
 * AstroDSJK — Offline Vedic Astrology Mathematical Engine
 * Includes: Ephemeris (Lahiri Ayanamsa), Planetary Longitudes, Houses,
 * Shodasha Vargas (D1-D60), Vimshottari Dasha, Panchang, Ashtakavarga,
 * KP Cusp Significators, Jaimini Karakas, and Ashta Kuta Gun Milan.
 */

const AstroEngine = (() => {

    const RAD = Math.PI / 180;
    const DEG = 180 / Math.PI;

    // --- ZODIAC & NAKSHATRA CONSTANTS ---
    const RASHIS = [
        { id: 1, name: "Aries", symbol: "♈", hindi: "Mesha", lord: "Mars", element: "Fire" },
        { id: 2, name: "Taurus", symbol: "♉", hindi: "Vrishabha", lord: "Venus", element: "Earth" },
        { id: 3, name: "Gemini", symbol: "♊", hindi: "Mithuna", lord: "Mercury", element: "Air" },
        { id: 4, name: "Cancer", symbol: "♋", hindi: "Karka", lord: "Moon", element: "Water" },
        { id: 5, name: "Leo", symbol: "♌", hindi: "Simha", lord: "Sun", element: "Fire" },
        { id: 6, name: "Virgo", symbol: "♍", hindi: "Kanya", lord: "Mercury", element: "Earth" },
        { id: 7, name: "Libra", symbol: "♎", hindi: "Tula", lord: "Venus", element: "Air" },
        { id: 8, name: "Scorpio", symbol: "♏", hindi: "Vrishchika", lord: "Mars", element: "Water" },
        { id: 9, name: "Sagittarius", symbol: "♐", hindi: "Dhanu", lord: "Jupiter", element: "Fire" },
        { id: 10, name: "Capricorn", symbol: "♑", hindi: "Makara", lord: "Saturn", element: "Earth" },
        { id: 11, name: "Aquarius", symbol: "♒", hindi: "Kumbha", lord: "Saturn", element: "Air" },
        { id: 12, name: "Pisces", symbol: "♓", hindi: "Meena", lord: "Jupiter", element: "Water" }
    ];

    const NAKSHATRAS = [
        { id: 1, name: "Ashwini", lord: "Ketu", rashi: 1 },
        { id: 2, name: "Bharani", lord: "Venus", rashi: 1 },
        { id: 3, name: "Krittika", lord: "Sun", rashi: 1 },
        { id: 4, name: "Rohini", lord: "Moon", rashi: 2 },
        { id: 5, name: "Mrigashira", lord: "Mars", rashi: 2 },
        { id: 6, name: "Ardra", lord: "Rahu", rashi: 3 },
        { id: 7, name: "Punarvasu", lord: "Jupiter", rashi: 3 },
        { id: 8, name: "Pushya", lord: "Saturn", rashi: 4 },
        { id: 9, name: "Ashlesha", lord: "Mercury", rashi: 4 },
        { id: 10, name: "Magha", lord: "Ketu", rashi: 5 },
        { id: 11, name: "Purva Phalguni", lord: "Venus", rashi: 5 },
        { id: 12, name: "Uttara Phalguni", lord: "Sun", rashi: 5 },
        { id: 13, name: "Hasta", lord: "Moon", rashi: 6 },
        { id: 14, name: "Chitra", lord: "Mars", rashi: 6 },
        { id: 15, name: "Swati", lord: "Rahu", rashi: 7 },
        { id: 16, name: "Vishakha", lord: "Jupiter", rashi: 7 },
        { id: 17, name: "Anuradha", lord: "Saturn", rashi: 8 },
        { id: 18, name: "Jyeshtha", lord: "Mercury", rashi: 8 },
        { id: 19, name: "Mula", lord: "Ketu", rashi: 9 },
        { id: 20, name: "Purva Ashadha", lord: "Venus", rashi: 9 },
        { id: 21, name: "Uttara Ashadha", lord: "Sun", rashi: 9 },
        { id: 22, name: "Shravana", lord: "Moon", rashi: 10 },
        { id: 23, name: "Dhanishta", lord: "Mars", rashi: 10 },
        { id: 24, name: "Shatabhisha", lord: "Rahu", rashi: 11 },
        { id: 25, name: "Purva Bhadrapada", lord: "Jupiter", rashi: 11 },
        { id: 26, name: "Uttara Bhadrapada", lord: "Saturn", rashi: 12 },
        { id: 27, name: "Revati", lord: "Mercury", rashi: 12 }
    ];

    const DASHA_PERIODS = [
        { planet: "Ketu", years: 7 },
        { planet: "Venus", years: 20 },
        { planet: "Sun", years: 6 },
        { planet: "Moon", years: 10 },
        { planet: "Mars", years: 7 },
        { planet: "Rahu", years: 18 },
        { planet: "Jupiter", years: 16 },
        { planet: "Saturn", years: 19 },
        { planet: "Mercury", years: 17 }
    ];

    const TITHIS = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
        "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima / Amavasya"
    ];

    const YOGAS = [
        "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
        "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
        "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];

    const KARANAS = [
        "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)",
        "Shakuni", "Chatushpada", "Naga", "Kintughna"
    ];

    // --- CITY DATABASE ---
    const CITIES_DB = [
        { name: "New Delhi, India", lat: 28.6139, lng: 77.2090, tz: 5.5 },
        { name: "Mumbai, India", lat: 19.0760, lng: 72.8777, tz: 5.5 },
        { name: "Bengaluru, India", lat: 12.9716, lng: 77.5946, tz: 5.5 },
        { name: "Kolkata, India", lat: 22.5726, lng: 88.3639, tz: 5.5 },
        { name: "Chennai, India", lat: 13.0827, lng: 80.2707, tz: 5.5 },
        { name: "Hyderabad, India", lat: 17.3850, lng: 78.4867, tz: 5.5 },
        { name: "Ahmedabad, India", lat: 23.0225, lng: 72.5714, tz: 5.5 },
        { name: "Jaipur, India", lat: 26.9124, lng: 75.7873, tz: 5.5 },
        { name: "Pune, India", lat: 18.5204, lng: 73.8567, tz: 5.5 },
        { name: "Varanasi, India", lat: 25.3176, lng: 82.9739, tz: 5.5 },
        { name: "Lucknow, India", lat: 26.8467, lng: 80.9462, tz: 5.5 },
        { name: "Chandigarh, India", lat: 30.7333, lng: 76.7794, tz: 5.5 },
        { name: "Patna, India", lat: 25.5941, lng: 85.1376, tz: 5.5 },
        { name: "Surat, India", lat: 21.1702, lng: 72.8311, tz: 5.5 },
        { name: "Kochi, India", lat: 9.9312, lng: 76.2673, tz: 5.5 },
        { name: "Bhopal, India", lat: 23.2599, lng: 77.4126, tz: 5.5 },
        { name: "Indore, India", lat: 22.7196, lng: 75.8577, tz: 5.5 },
        { name: "Kathmandu, Nepal", lat: 27.7172, lng: 85.3240, tz: 5.75 },
        { name: "London, UK", lat: 51.5074, lng: -0.1278, tz: 0 },
        { name: "New York, USA", lat: 40.7128, lng: -74.0060, tz: -5 },
        { name: "Los Angeles, USA", lat: 34.0522, lng: -118.2437, tz: -8 },
        { name: "Chicago, USA", lat: 41.8781, lng: -87.6298, tz: -6 },
        { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194, tz: -8 },
        { name: "Toronto, Canada", lat: 43.6532, lng: -79.3832, tz: -5 },
        { name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207, tz: -8 },
        { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, tz: 10 },
        { name: "Melbourne, Australia", lat: -37.8136, lng: 144.9631, tz: 10 },
        { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, tz: 4 },
        { name: "Singapore", lat: 1.3521, lng: 103.8198, tz: 8 },
        { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, tz: 9 },
        { name: "Paris, France", lat: 48.8566, lng: 2.3522, tz: 1 },
        { name: "Berlin, Germany", lat: 52.5200, lng: 13.4050, tz: 1 },
        { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173, tz: 3 }
    ];

    // --- MATHEMATICAL HELPERS ---
    function julianDay(year, month, day, hour, minute, second, tz) {
        let decimalHour = hour + (minute / 60) + (second / 3600) - tz;
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        let A = Math.floor(year / 100);
        let B = 2 - A + Math.floor(A / 4);
        let JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + (decimalHour / 24) + B - 1524.5;
        return JD;
    }

    // High-precision Chitrapaksha Lahiri Ayanamsa (23.853056° at J2000.0)
    function getLahiriAyanamsa(JD) {
        let T = (JD - 2451545.0) / 36525.0;
        let ayanamsa = 23.853056 + (1.396042 * T) + (0.000308 * T * T);
        return ayanamsa;
    }

    function normalizeDeg(deg) {
        deg = deg % 360;
        return deg < 0 ? deg + 360 : deg;
    }

    function angleDiff(a, b) {
        let diff = a - b;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        return diff;
    }

    function solveKepler(M, e) {
        let E = M;
        for (let i = 0; i < 15; i++) {
            let dE = (M + e * Math.sin(E) - E) / (1 - e * Math.cos(E));
            E += dE;
            if (Math.abs(dE) < 1e-9) break;
        }
        return E;
    }

    // --- PLANETARY EPHEMERIS PARAMETERS & KEPLERIAN SOLVER (PAUL SCHLYTER METHOD) ---
    function getRawSiderealLongitude(name, JD, lat, lng) {
        let d = JD - 2451543.5;
        let T = (JD - 2451545.0) / 36525.0;
        let ayanamsa = getLahiriAyanamsa(JD);

        // 1.1 Sun / Earth Heliocentric Coordinates (Paul Schlyter Method)
        let w_Sun = 282.9404 + 4.70935e-5 * d;
        let e_Sun = 0.016709 - 1.151e-9 * d;
        let M_Sun = normalizeDeg(356.0470 + 0.9856002585 * d);
        let M_Sun_rad = M_Sun * RAD;
        let E_Sun = M_Sun_rad + e_Sun * Math.sin(M_Sun_rad) * (1 + e_Sun * Math.cos(M_Sun_rad));
        let xv_Sun = Math.cos(E_Sun) - e_Sun;
        let yv_Sun = Math.sqrt(1 - e_Sun * e_Sun) * Math.sin(E_Sun);
        let r_Sun = Math.sqrt(xv_Sun * xv_Sun + yv_Sun * yv_Sun);
        let v_Sun = Math.atan2(yv_Sun, xv_Sun) * DEG;
        let L_Sun = normalizeDeg(v_Sun + w_Sun);

        if (name === 'Sun') {
            return normalizeDeg(L_Sun - ayanamsa);
        }

        let x_Earth = r_Sun * Math.cos((L_Sun + 180) * RAD);
        let y_Earth = r_Sun * Math.sin((L_Sun + 180) * RAD);
        let z_Earth = 0;

        if (name === 'Moon') {
            let W1 = 218.3164477 + 481267.8812342 * T - 0.0015786 * T * T;
            let D = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * RAD;
            let M_sun = (357.5291092 + 35999.0502909 * T - 0.0001536 * T * T) * RAD;
            let M_moon = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * RAD;
            let F = (93.2720950 + 483202.0175233 * T - 0.0036539 * T * T) * RAD;
            let Omega = (125.04452 - 1934.136261 * T) * RAD;

            let dL = 6.288774 * Math.sin(M_moon)
                   + 1.274027 * Math.sin(2 * D - M_moon)
                   + 0.658314 * Math.sin(2 * D)
                   + 0.213618 * Math.sin(2 * M_moon)
                   - 0.185119 * Math.sin(M_sun)
                   - 0.114332 * Math.sin(2 * F)
                   + 0.058793 * Math.sin(2 * D - 2 * M_moon)
                   + 0.057066 * Math.sin(2 * D - M_sun - M_moon)
                   + 0.053322 * Math.sin(2 * D + M_moon)
                   + 0.045784 * Math.sin(2 * D - M_sun)
                   + 0.040923 * Math.sin(M_sun - M_moon)
                   - 0.034720 * Math.sin(D)
                   - 0.030383 * Math.sin(M_sun + M_moon)
                   + 0.015327 * Math.sin(2 * D - 2 * F)
                   - 0.012528 * Math.sin(2 * F + M_moon)
                   + 0.010980 * Math.sin(2 * F - M_moon)
                   + 0.010675 * Math.sin(4 * D - M_moon)
                   + 0.010034 * Math.sin(3 * M_moon)
                   + 0.008548 * Math.sin(4 * D - 2 * M_moon)
                   - 0.007888 * Math.sin(2 * D + M_sun - M_moon)
                   - 0.006766 * Math.sin(2 * D + M_sun)
                   - 0.005163 * Math.sin(D - M_moon)
                   + 0.004987 * Math.sin(D + M_sun)
                   + 0.004036 * Math.sin(2 * D - M_sun + M_moon);

            let Moon_trop = W1 + dL - 0.00478 * Math.sin(Omega);
            return normalizeDeg(Moon_trop - ayanamsa);
        }

        if (name === 'Rahu') {
            let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
            return normalizeDeg(omega - ayanamsa);
        }

        if (name === 'Ketu') {
            let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
            return normalizeDeg(omega + 180 - ayanamsa);
        }

        if (name === 'Ascendant' || name === 'Lagna') {
            lat = (lat !== undefined) ? lat : 28.6139;
            lng = (lng !== undefined) ? lng : 77.2090;
            let GMST0 = 280.46061837 + 360.98564736629 * (JD - 2451545.0);
            let LST = normalizeDeg(GMST0 + lng);
            let eclipticObliquity = 23.439;
            let ascRad = Math.atan2(Math.cos(LST * RAD), -Math.sin(LST * RAD) * Math.cos(eclipticObliquity * RAD) - Math.tan(lat * RAD) * Math.sin(eclipticObliquity * RAD));
            return normalizeDeg((ascRad * DEG) - ayanamsa);
        }

        // 1.2 Planetary Orbital Elements & Heliocentric-to-Geocentric Reduction (Paul Schlyter Method)
        const PLANETS = {
            Mercury: {
                N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.00e-8 * d, w: 29.1241 + 1.01444e-5 * d,
                a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d
            },
            Venus: {
                N: 76.6799 + 2.46590e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.8910 + 1.38374e-5 * d,
                a: 0.723330, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d
            },
            Mars: {
                N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d,
                a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d
            },
            Jupiter: {
                N: 100.4542 + 2.76854e-5 * d, i: 1.3030 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d,
                a: 5.202561, e: 0.048498 + 4.469e-9 * d, M: 19.8950 + 0.0830853001 * d
            },
            Saturn: {
                N: 113.6655 + 2.38980e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d,
                a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.9670 + 0.0334442282 * d
            }
        };

        let p = PLANETS[name];
        let N = p.N, i = p.i, w = p.w, a = p.a, e = p.e, M = normalizeDeg(p.M);

        // 1. Solve Kepler's Equation E - e sin E = M (4 iterations)
        let Mrad = M * RAD;
        let E = Mrad + e * Math.sin(Mrad);
        for (let k = 0; k < 4; k++) {
            E = E - (E - e * Math.sin(E) - Mrad) / (1 - e * Math.cos(E));
        }

        // 2. Orbital plane coordinates
        let xv = a * (Math.cos(E) - e);
        let yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
        let r = Math.sqrt(xv * xv + yv * yv);
        let v = Math.atan2(yv, xv) * DEG;

        // 3. Heliocentric 3D Ecliptic Coordinates
        let u = v + w;
        let Nrad = N * RAD, urad = u * RAD, irad = i * RAD;
        let xh = r * (Math.cos(Nrad) * Math.cos(urad) - Math.sin(Nrad) * Math.sin(urad) * Math.cos(irad));
        let yh = r * (Math.sin(Nrad) * Math.cos(urad) + Math.cos(Nrad) * Math.sin(urad) * Math.cos(irad));
        let zh = r * (Math.sin(urad) * Math.sin(irad));

        // 4. Geocentric Coordinates
        let xg = xh - x_Earth;
        let yg = yh - y_Earth;
        let zg = zh - z_Earth;

        // 5. Geocentric Tropical Longitude
        let lambda_trop = normalizeDeg(Math.atan2(yg, xg) * DEG);

        // 6. Major perturbations for Jupiter & Saturn (Great Inequality)
        if (name === 'Jupiter') {
            let MJ = normalizeDeg(PLANETS.Jupiter.M);
            let MS = normalizeDeg(PLANETS.Saturn.M);
            let dL = -0.332 * Math.sin((2*MJ - 5*MS - 67.6) * RAD) - 0.056 * Math.sin((2*MJ - 2*MS + 21) * RAD) + 0.042 * Math.sin((3*MJ - 5*MS + 21) * RAD);
            lambda_trop = normalizeDeg(lambda_trop + dL);
        } else if (name === 'Saturn') {
            let MJ = normalizeDeg(PLANETS.Jupiter.M);
            let MS = normalizeDeg(PLANETS.Saturn.M);
            let dL = +0.812 * Math.sin((2*MJ - 5*MS - 67.6) * RAD) - 0.229 * Math.cos((2*MJ - 4*MS - 2) * RAD) + 0.119 * Math.sin((MJ - 2*MS - 3) * RAD);
            lambda_trop = normalizeDeg(lambda_trop + dL);
        }

        // 7. Sidereal Lahiri Longitude
        return normalizeDeg(lambda_trop - ayanamsa);
    }

    // --- EPHEMERIS ENGINE (SIDEREAL CALCULATIONS) ---
    function calculatePlanets(JD, lat, lng) {
        lat = (lat !== undefined) ? lat : 28.6139;
        lng = (lng !== undefined) ? lng : 77.2090;
        let ayanamsa = getLahiriAyanamsa(JD);

        let dt = 0.05;
        let names = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
        let result = { ayanamsa };

        names.forEach(name => {
            let lon = getRawSiderealLongitude(name, JD, lat, lng);
            let lon1 = getRawSiderealLongitude(name, JD - dt, lat, lng);
            let lon2 = getRawSiderealLongitude(name, JD + dt, lat, lng);

            let speed = angleDiff(lon2, lon1) / (2 * dt);
            let isRetrograde = (name === 'Rahu' || name === 'Ketu') ? true : (name === 'Sun' || name === 'Moon' || name === 'Ascendant') ? false : speed < 0;

            let rashiIndex = Math.floor(lon / 30);
            let degreeInSign = lon % 30;

            result[name] = {
                longitude: lon,
                speed: speed,
                isRetrograde: isRetrograde,
                sign: rashiIndex + 1,
                degreeInSign: degreeInSign,
                valueOf: function() { return lon; },
                toString: function() { return lon.toString(); }
            };
        });

        result.Lagna = result.Ascendant;
        return result;
    }

    // Helper: Map degree to Rashi, Degree, Nakshatra
    function getDegreeInfo(longitude) {
        let lon = (typeof longitude === 'object' && longitude !== null) ? longitude.longitude : longitude;
        lon = normalizeDeg(lon);
        let rashiIndex = Math.floor(lon / 30);
        let rashiDeg = lon % 30;
        let rashi = RASHIS[rashiIndex];

        let nakshatraSpan = 360 / 27; // 13.333 deg
        let nakshatraIndex = Math.floor(lon / nakshatraSpan);
        let nakshatra = NAKSHATRAS[nakshatraIndex];
        let pada = Math.floor((lon % nakshatraSpan) / (nakshatraSpan / 4)) + 1;

        let degInt = Math.floor(rashiDeg);
        let minInt = Math.floor((rashiDeg - degInt) * 60);

        return {
            totalDeg: lon,
            rashiIndex: rashiIndex + 1,
            rashiName: rashi.name,
            rashiHindi: rashi.hindi,
            rashiDeg: `${degInt}° ${minInt}'`,
            nakshatraName: nakshatra.name,
            nakshatraLord: nakshatra.lord,
            pada: pada
        };
    }

    function normalizeRashi(val) {
        let res = val % 12;
        return res <= 0 ? res + 12 : res;
    }

    // --- SHODASHA VARGA DIVISIONAL CHARTS ENGINE (D1 - D60) ---
    function calculateVargas(planets) {
        let vargas = {
            D1: {}, D2: {}, D3: {}, D4: {}, D7: {}, D9: {}, D10: {}, D12: {},
            D16: {}, D20: {}, D24: {}, D27: {}, D30: {}, D40: {}, D45: {}, D60: {}
        };

        for (let key in planets) {
            if (key === 'ayanamsa') continue;
            let pVal = planets[key];
            let lon = (typeof pVal === 'object' && pVal !== null) ? pVal.longitude : pVal;
            if (typeof lon !== 'number' || isNaN(lon)) continue;

            lon = normalizeDeg(lon);
            let rashiIndex = Math.floor(lon / 30); // 0..11
            let remDeg = lon % 30; // 0..30
            let rashiNum = rashiIndex + 1; // 1..12
            let isOdd = (rashiIndex % 2 === 0);
            let modality = (rashiIndex % 3); // 0: Movable, 1: Fixed, 2: Dual

            // D1 (Rashi)
            vargas.D1[key] = rashiNum;

            // D2 (Hora)
            if (remDeg < 15) {
                vargas.D2[key] = isOdd ? 5 : 4;
            } else {
                vargas.D2[key] = isOdd ? 4 : 5;
            }

            // D3 (Drekkana)
            let drekPart = Math.floor(remDeg / 10);
            vargas.D3[key] = normalizeRashi(rashiNum + drekPart * 4);

            // D4 (Chaturthamsha)
            let d4Part = Math.floor(remDeg / 7.5);
            vargas.D4[key] = normalizeRashi(rashiNum + d4Part * 3);

            // D7 (Saptamsha)
            let d7Part = Math.floor(remDeg / (30 / 7));
            let d7Start = isOdd ? rashiNum : rashiNum + 6;
            vargas.D7[key] = normalizeRashi(d7Start + d7Part);

            // D9 (Navamsha)
            let d9Part = Math.floor(remDeg / (30 / 9));
            let elemStart = (rashiIndex % 4 === 0) ? 1 : (rashiIndex % 4 === 1) ? 10 : (rashiIndex % 4 === 2) ? 7 : 4;
            vargas.D9[key] = normalizeRashi(elemStart + d9Part);

            // D10 (Dashamsha)
            let d10Part = Math.floor(remDeg / 3);
            let d10Start = isOdd ? rashiNum : rashiNum + 8;
            vargas.D10[key] = normalizeRashi(d10Start + d10Part);

            // D12 (Dwadashamsha)
            let d12Part = Math.floor(remDeg / 2.5);
            vargas.D12[key] = normalizeRashi(rashiNum + d12Part);

            // D16 (Shodashamsha)
            let d16Part = Math.floor(remDeg / 1.875);
            let d16Start = modality === 0 ? 1 : modality === 1 ? 5 : 9;
            vargas.D16[key] = normalizeRashi(d16Start + d16Part);

            // D20 (Vimshamsha)
            let d20Part = Math.floor(remDeg / 1.5);
            let d20Start = modality === 0 ? 1 : modality === 1 ? 9 : 5;
            vargas.D20[key] = normalizeRashi(d20Start + d20Part);

            // D24 (Chaturvimshamsha)
            let d24Part = Math.floor(remDeg / 1.25);
            let d24Start = isOdd ? 5 : 4;
            vargas.D24[key] = normalizeRashi(d24Start + d24Part);

            // D27 (Saptavimshamsha)
            let d27Part = Math.floor(remDeg / (30 / 27));
            let d27Start = (rashiIndex % 4 === 0) ? 1 : (rashiIndex % 4 === 1) ? 4 : (rashiIndex % 4 === 2) ? 7 : 10;
            vargas.D27[key] = normalizeRashi(d27Start + d27Part);

            // D30 (Trimshamsha)
            if (isOdd) {
                if (remDeg < 5) vargas.D30[key] = 1;
                else if (remDeg < 10) vargas.D30[key] = 11;
                else if (remDeg < 18) vargas.D30[key] = 9;
                else if (remDeg < 25) vargas.D30[key] = 3;
                else vargas.D30[key] = 2;
            } else {
                if (remDeg < 5) vargas.D30[key] = 2;
                else if (remDeg < 12) vargas.D30[key] = 6;
                else if (remDeg < 20) vargas.D30[key] = 12;
                else if (remDeg < 25) vargas.D30[key] = 10;
                else vargas.D30[key] = 8;
            }

            // D40 (Khavedamsha)
            let d40Part = Math.floor(remDeg / 0.75);
            let d40Start = isOdd ? 1 : 7;
            vargas.D40[key] = normalizeRashi(d40Start + d40Part);

            // D45 (Akshavedamsha)
            let d45Part = Math.floor(remDeg / (30 / 45));
            let d45Start = modality === 0 ? 1 : modality === 1 ? 5 : 9;
            vargas.D45[key] = normalizeRashi(d45Start + d45Part);

            // D60 (Shashtyamsha)
            let d60Part = Math.floor(remDeg / 0.5);
            vargas.D60[key] = normalizeRashi(rashiNum + d60Part);
        }

        return vargas;
    }

    // --- VIMSHOTTARI DASHA CALCULATOR ---
    function calculateVimshottari(moonLongitude, birthDate) {
        const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        const mLon = normalizeDeg((typeof moonLongitude === 'object' && moonLongitude !== null) ? moonLongitude.longitude : moonLongitude);
        const moonSpan = 360 / 27; // 13.333333333333334 deg
        const nakIndex = Math.floor(mLon / moonSpan);
        const traversedDeg = mLon % moonSpan;
        const fractionPassed = traversedDeg / moonSpan;
        const fractionRemaining = 1 - fractionPassed;

        const startLordIndex = nakIndex % 9;

        const MS_PER_DAY = 86400000;
        const MS_PER_YEAR = 365.25 * MS_PER_DAY; // Exact astronomical Savana year in ms (31,557,600,000 ms)

        const bTime = (birthDate instanceof Date) ? birthDate.getTime() : new Date(birthDate).getTime();

        // 1st Mahadasha Lord details
        const m0_Years = DASHA_PERIODS[startLordIndex].years;
        const m0_FullMs = m0_Years * MS_PER_YEAR;
        const m0_ElapsedMs = fractionPassed * m0_FullMs;
        const m0_TrueStartMs = bTime - m0_ElapsedMs;

        const mahadashas = [];

        // Loop through 9 Mahadashas
        let currentM_StartMs = bTime;

        for (let i = 0; i < 9; i++) {
            const mLordIdx = (startLordIndex + i) % 9;
            const mLord = DASHA_PERIODS[mLordIdx].planet;
            const mFullYears = DASHA_PERIODS[mLordIdx].years;
            const mFullMs = mFullYears * MS_PER_YEAR;

            let mStartMs, mEndMs, mYears;

            if (i === 0) {
                mStartMs = bTime;
                const mRemainingMs = fractionRemaining * mFullMs;
                mEndMs = bTime + mRemainingMs;
                mYears = mFullYears * fractionRemaining;
            } else {
                mStartMs = currentM_StartMs;
                mEndMs = mStartMs + mFullMs;
                mYears = mFullYears;
            }
            currentM_StartMs = mEndMs;

            // Build 9 Antardashas for Mahadasha i
            const antardashas = [];
            let currentA_StartMs = (i === 0) ? m0_TrueStartMs : mStartMs;

            for (let j = 0; j < 9; j++) {
                const aLordIdx = (mLordIdx + j) % 9;
                const aLord = DASHA_PERIODS[aLordIdx].planet;
                const aProp = DASHA_PERIODS[aLordIdx].years / 120;
                const aYears = mFullYears * aProp;
                const aMs = aYears * MS_PER_YEAR;

                const aStartMs = currentA_StartMs;
                const aEndMs = aStartMs + aMs;
                currentA_StartMs = aEndMs;

                // Build 9 Pratyantardashas for Antardasha j
                const pratyantardashas = [];
                let currentP_StartMs = aStartMs;

                for (let k = 0; k < 9; k++) {
                    const pLordIdx = (aLordIdx + k) % 9;
                    const pLord = DASHA_PERIODS[pLordIdx].planet;
                    const pProp = DASHA_PERIODS[pLordIdx].years / 120;
                    const pYears = aYears * pProp;
                    const pMs = pYears * MS_PER_YEAR;

                    const pStartMs = currentP_StartMs;
                    const pEndMs = pStartMs + pMs;
                    currentP_StartMs = pEndMs;

                    const pStartDate = new Date(pStartMs);
                    const pEndDate = new Date(pEndMs);

                    pratyantardashas.push({
                        lord: pLord,
                        planet: pLord,
                        startDate: pStartDate,
                        endDate: pEndDate,
                        start: pStartDate.toISOString().split('T')[0],
                        end: pEndDate.toISOString().split('T')[0],
                        years: pYears
                    });
                }

                const aStartDate = new Date(aStartMs);
                const aEndDate = new Date(aEndMs);

                antardashas.push({
                    lord: aLord,
                    planet: aLord,
                    startDate: aStartDate,
                    endDate: aEndDate,
                    start: aStartDate.toISOString().split('T')[0],
                    end: aEndDate.toISOString().split('T')[0],
                    years: aYears,
                    pratyantardashas: pratyantardashas
                });
            }

            const mStartDate = new Date(mStartMs);
            const mEndDate = new Date(mEndMs);

            mahadashas.push({
                lord: mLord,
                planet: mLord,
                startDate: mStartDate,
                endDate: mEndDate,
                start: mStartDate.toISOString().split('T')[0],
                end: mEndDate.toISOString().split('T')[0],
                years: mYears,
                antardashas: antardashas
            });
        }

        const tEnd = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        mahadashas.executionTimeMs = tEnd - t0;

        return mahadashas;
    }

    // --- PANCHANG CALCULATOR ---
    function calculatePanchang(sunLon, moonLon, JD, tzOffset) {
        const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        const sLon = normalizeDeg((typeof sunLon === 'object' && sunLon !== null) ? sunLon.longitude : sunLon);
        const mLon = normalizeDeg((typeof moonLon === 'object' && moonLon !== null) ? moonLon.longitude : moonLon);
        const diff = normalizeDeg(mLon - sLon);

        // 1. Tithi & Paksha (15 deg each)
        const TITHI_NAMES = [
            "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
            "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
            "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"
        ];
        const tithiIndex = Math.floor(diff / 12); // 0 to 29
        const tithiNum = tithiIndex + 1;
        const isShukla = tithiIndex < 15;
        const pakshaStr = isShukla ? "Shukla" : "Krishna";
        const pakshaTithi = isShukla ? (tithiIndex + 1) : (tithiIndex - 15 + 1);

        let nameInPaksha;
        if (isShukla) {
            nameInPaksha = (pakshaTithi === 15) ? "Purnima" : TITHI_NAMES[pakshaTithi - 1];
        } else {
            nameInPaksha = (pakshaTithi === 15) ? "Amavasya" : TITHI_NAMES[pakshaTithi - 1];
        }

        const tithiObj = {
            number: tithiNum,
            name: nameInPaksha,
            paksha: pakshaStr,
            pakshaTithi: pakshaTithi,
            valueOf: function() { return tithiNum; },
            toString: function() { return `${nameInPaksha} (${pakshaStr} Paksha)`; }
        };

        // 2. Vara (Day of week from local sunrise)
        const VARAS_DB = [
            { id: 0, english: "Sunday", sanskrit: "Ravivara", lord: "Sun" },
            { id: 1, english: "Monday", sanskrit: "Somavara", lord: "Moon" },
            { id: 2, english: "Tuesday", sanskrit: "Mangalavara", lord: "Mars" },
            { id: 3, english: "Wednesday", sanskrit: "Budhavara", lord: "Mercury" },
            { id: 4, english: "Thursday", sanskrit: "Guruvara", lord: "Jupiter" },
            { id: 5, english: "Friday", sanskrit: "Shukravara", lord: "Venus" },
            { id: 6, english: "Saturday", sanskrit: "Shanivara", lord: "Saturn" }
        ];

        let dayOfWeekIndex;
        if (typeof JD === 'number' && JD >= 0 && JD < 7 && tzOffset === undefined) {
            dayOfWeekIndex = Math.floor(JD) % 7;
        } else if (typeof JD === 'number') {
            const tz = (typeof tzOffset === 'number') ? tzOffset : 0;
            const localJD = JD + (tz / 24.0);
            const sunriseJD = localJD - 0.25; // standard ~6:00 AM sunrise baseline
            dayOfWeekIndex = Math.floor(sunriseJD + 1.5) % 7;
            if (dayOfWeekIndex < 0) dayOfWeekIndex += 7;
        } else {
            dayOfWeekIndex = 0;
        }

        const vInfo = VARAS_DB[dayOfWeekIndex];
        const varaObj = {
            id: vInfo.id,
            name: vInfo.sanskrit,
            english: vInfo.english,
            lord: vInfo.lord,
            valueOf: function() { return vInfo.id; },
            toString: function() { return `${vInfo.sanskrit} (${vInfo.english})`; }
        };

        // 3. Nakshatra (27 Nakshatras from Moon longitude)
        const nakSpan = 360 / 27;
        const nakIndex = Math.floor(mLon / nakSpan);
        const nakData = NAKSHATRAS[nakIndex % 27];
        const nakshatraObj = {
            id: nakData.id,
            name: nakData.name,
            lord: nakData.lord,
            rashi: nakData.rashi,
            pada: Math.floor((mLon % nakSpan) / (nakSpan / 4)) + 1,
            valueOf: function() { return nakData.id; },
            toString: function() { return nakData.name; }
        };

        // 4. Yoga (27 Yogas from (Sun longitude + Moon longitude) % 360)
        const sumLon = normalizeDeg(sLon + mLon);
        const yogaIndex = Math.floor(sumLon / nakSpan) % 27;
        const yogaName = YOGAS[yogaIndex];
        const yogaObj = {
            id: yogaIndex + 1,
            name: yogaName,
            valueOf: function() { return yogaIndex + 1; },
            toString: function() { return yogaName; }
        };

        // 5. Authentic 60 half-tithi Karana map
        const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti (Bhadra)"];
        const htIndex = Math.floor(diff / 6); // 0 to 59
        let karanaName;
        let isFixed = false;

        if (htIndex === 0) {
            karanaName = "Kintughna";
            isFixed = true;
        } else if (htIndex === 57) {
            karanaName = "Shakuni";
            isFixed = true;
        } else if (htIndex === 58) {
            karanaName = "Chatushpada";
            isFixed = true;
        } else if (htIndex === 59) {
            karanaName = "Naga";
            isFixed = true;
        } else {
            const movIdx = (htIndex - 1) % 7;
            karanaName = MOVABLE_KARANAS[movIdx];
            isFixed = false;
        }

        const karanaObj = {
            id: htIndex + 1,
            name: karanaName,
            type: isFixed ? "Fixed" : "Movable",
            halfTithi: htIndex + 1,
            valueOf: function() { return htIndex + 1; },
            toString: function() { return karanaName; }
        };

        const tEnd = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        return {
            tithi: tithiObj,
            paksha: pakshaStr,
            vara: varaObj,
            nakshatra: nakshatraObj,
            yoga: yogaObj,
            karana: karanaObj,
            executionTimeMs: tEnd - t0,
            // Backwards compatibility string properties
            tithiName: `${nameInPaksha} (${pakshaStr} Paksha)`,
            nakshatraName: nakData.name,
            yogaName: yogaName,
            karanaName: karanaName,
            varaName: `${vInfo.sanskrit} (${vInfo.english})`
        };
    }

    // --- MANGLIK DOSHA & BHANGA CANCELLATION ENGINE ---
    function calculateManglikDosha(planets) {
        if (!planets || typeof planets !== 'object') {
            return {
                isManglik: false,
                isCancelled: false,
                effectiveManglik: false,
                houseFromLagna: null,
                houseFromMoon: null,
                houseFromVenus: null,
                cancellationReasons: []
            };
        }

        function extractSign(val) {
            if (val === undefined || val === null) return null;
            if (typeof val === 'number') return Math.floor(normalizeDeg(val) / 30) + 1;
            if (typeof val === 'object') {
                if (typeof val.sign === 'number') return val.sign;
                if (typeof val.longitude === 'number') return Math.floor(normalizeDeg(val.longitude) / 30) + 1;
            }
            return null;
        }

        let lagnaSign = extractSign(planets.Ascendant || planets.Lagna || planets.ascendant || planets.lagna);
        let marsSign = extractSign(planets.Mars || planets.mars);
        let moonSign = extractSign(planets.Moon || planets.moon);
        let venusSign = extractSign(planets.Venus || planets.venus);
        let jupiterSign = extractSign(planets.Jupiter || planets.jupiter);

        if (!marsSign) {
            return {
                isManglik: false,
                isCancelled: false,
                effectiveManglik: false,
                houseFromLagna: null,
                houseFromMoon: null,
                houseFromVenus: null,
                cancellationReasons: []
            };
        }

        let manglikHouses = [1, 2, 4, 7, 8, 12];

        let houseFromLagna = lagnaSign ? (((marsSign - lagnaSign + 12) % 12) + 1) : null;
        let houseFromMoon = moonSign ? (((marsSign - moonSign + 12) % 12) + 1) : null;
        let houseFromVenus = venusSign ? (((marsSign - venusSign + 12) % 12) + 1) : null;

        let isLagnaManglik = houseFromLagna ? manglikHouses.includes(houseFromLagna) : false;
        let isMoonManglik = houseFromMoon ? manglikHouses.includes(houseFromMoon) : false;
        let isVenusManglik = houseFromVenus ? manglikHouses.includes(houseFromVenus) : false;

        let isManglik = isLagnaManglik || isMoonManglik || isVenusManglik;
        let cancellationReasons = [];

        if (isManglik) {
            // 1. Mars in own sign (Aries=1, Scorpio=8) or exaltation (Capricorn=10)
            if (marsSign === 1 || marsSign === 8 || marsSign === 10) {
                cancellationReasons.push("Mars in own sign (Aries/Scorpio) or exaltation (Capricorn)");
            }

            // 2. Mars aspected by or conjunct Jupiter
            if (jupiterSign) {
                let houseFromJupiter = ((marsSign - jupiterSign + 12) % 12) + 1;
                // Jupiter aspects 1st (conjunction), 5th, 7th, 9th houses
                if ([1, 5, 7, 9].includes(houseFromJupiter)) {
                    cancellationReasons.push("Mars aspected by or conjunct Jupiter");
                }
            }

            // 3. Mars in Saturn signs (Capricorn=10, Aquarius=11)
            if (marsSign === 10 || marsSign === 11) {
                cancellationReasons.push("Mars in Saturn sign (Capricorn/Aquarius)");
            }
        }

        let isCancelled = isManglik && cancellationReasons.length > 0;
        let effectiveManglik = isManglik && !isCancelled;

        return {
            isManglik,
            isCancelled,
            effectiveManglik,
            houseFromLagna,
            houseFromMoon,
            houseFromVenus,
            cancellationReasons
        };
    }

    // --- ASHTA KUTA GUN MILAN MATCHING ENGINE (36 POINTS) ---
    function calculateGunMilan(boyParam, girlParam, boyNakParam, girlNakParam) {
        let boyMoonLon, girlMoonLon, boyNak, girlNak, boyChart, girlChart;

        if (typeof boyParam === 'object' && boyParam !== null) {
            boyMoonLon = boyParam.longitude !== undefined ? boyParam.longitude : (boyParam.moonLongitude !== undefined ? boyParam.moonLongitude : (boyParam.Moon ? boyParam.Moon.longitude : 0));
            boyNak = boyParam.nakshatra !== undefined ? boyParam.nakshatra : undefined;
            boyChart = boyParam.planets || boyParam.chart || boyParam;
        } else {
            boyMoonLon = Number(boyParam) || 0;
            boyNak = boyNakParam;
        }

        if (typeof girlParam === 'object' && girlParam !== null) {
            girlMoonLon = girlParam.longitude !== undefined ? girlParam.longitude : (girlParam.moonLongitude !== undefined ? girlParam.moonLongitude : (girlParam.Moon ? girlParam.Moon.longitude : 0));
            girlNak = girlParam.nakshatra !== undefined ? girlParam.nakshatra : undefined;
            girlChart = girlParam.planets || girlParam.chart || girlParam;
        } else {
            girlMoonLon = Number(girlParam) || 0;
            girlNak = girlNakParam;
        }

        boyMoonLon = normalizeDeg(boyMoonLon);
        girlMoonLon = normalizeDeg(girlMoonLon);

        let nakSpan = 360 / 27;

        let boyNakIndex, girlNakIndex;

        if (boyNak !== undefined) {
            boyNakIndex = (boyNak >= 1 && boyNak <= 27) ? (boyNak - 1) : boyNak;
        } else {
            boyNakIndex = Math.floor(boyMoonLon / nakSpan) % 27;
        }

        if (girlNak !== undefined) {
            girlNakIndex = (girlNak >= 1 && girlNak <= 27) ? (girlNak - 1) : girlNak;
        } else {
            girlNakIndex = Math.floor(girlMoonLon / nakSpan) % 27;
        }

        let boyRashi = Math.floor(boyMoonLon / 30) + 1; // 1..12
        let girlRashi = Math.floor(girlMoonLon / 30) + 1; // 1..12

        // If longitude was not provided (defaulted to 0) but Nakshatra was passed explicitly, resolve Rashi from Nakshatra
        if (boyNakParam !== undefined || (typeof boyParam === 'object' && boyParam !== null && boyParam.nakshatra !== undefined)) {
            if (!boyMoonLon || (typeof boyParam === 'number' && boyParam === 0)) {
                boyRashi = NAKSHATRAS[boyNakIndex].rashi;
            }
        }
        if (girlNakParam !== undefined || (typeof girlParam === 'object' && girlParam !== null && girlParam.nakshatra !== undefined)) {
            if (!girlMoonLon || (typeof girlParam === 'number' && girlParam === 0)) {
                girlRashi = NAKSHATRAS[girlNakIndex].rashi;
            }
        }

        // 1. Varna Kuta (1 point)
        // Brahmin (4,8,12) = Rank 4, Kshatriya (1,5,9) = Rank 3, Vaishya (2,6,10) = Rank 2, Shudra (3,7,11) = Rank 1
        function getVarnaRank(rashi) {
            if ([4, 8, 12].includes(rashi)) return 4;
            if ([1, 5, 9].includes(rashi)) return 3;
            if ([2, 6, 10].includes(rashi)) return 2;
            return 1;
        }
        let boyVarnaRank = getVarnaRank(boyRashi);
        let girlVarnaRank = getVarnaRank(girlRashi);
        let varnaScore = (boyVarnaRank >= girlVarnaRank) ? 1 : 0;

        // 2. Vashya Kuta (2 points)
        // 0: Chatushpada, 1: Manav, 2: Jalachar, 3: Vanachar, 4: Keeta
        function getVashyaType(rashi, lon) {
            let remDeg = (lon !== undefined) ? (lon % 30) : 0;
            if (rashi === 1 || rashi === 2) return 0;
            if (rashi === 3 || rashi === 6 || rashi === 7 || rashi === 11) return 1;
            if (rashi === 4 || rashi === 12) return 2;
            if (rashi === 5) return 3;
            if (rashi === 8) return 4;
            if (rashi === 9) return (remDeg >= 15) ? 0 : 1;
            if (rashi === 10) return (remDeg >= 15) ? 2 : 0;
            return 1;
        }
        const VASHYA_MATRIX = [
            // Chatushpada  Manav  Jalachar  Vanachar  Keeta
            [ 2,           1,     1,        0,        1 ],
            [ 1,           2,     0.5,      0,        1 ],
            [ 1,           0.5,   2,        1,        1 ],
            [ 0,           0,     1,        2,        0 ],
            [ 1,           1,     1,        0,        2 ]
        ];
        let boyVashya = getVashyaType(boyRashi, boyMoonLon);
        let girlVashya = getVashyaType(girlRashi, girlMoonLon);
        let vashyaScore = VASHYA_MATRIX[boyVashya][girlVashya];

        // 3. Tara Kuta (3 points)
        let countB2G = ((girlNakIndex - boyNakIndex + 27) % 27) + 1;
        let remB2G = countB2G % 9;
        let auspiciousB2G = [2, 4, 6, 8, 0].includes(remB2G);
        let taraB2G = auspiciousB2G ? 1.5 : 0;

        let countG2B = ((boyNakIndex - girlNakIndex + 27) % 27) + 1;
        let remG2B = countG2B % 9;
        let auspiciousG2B = [2, 4, 6, 8, 0].includes(remG2B);
        let taraG2B = auspiciousG2B ? 1.5 : 0;

        let taraScore = taraB2G + taraG2B;

        // 4. Yoni Kuta (4 points)
        // 0: Horse, 1: Elephant, 2: Sheep, 3: Serpent, 4: Dog, 5: Cat, 6: Rat,
        // 7: Cow, 8: Buffalo, 9: Tiger, 10: Deer, 11: Monkey, 12: Mongoose, 13: Lion
        const NAK_YONI_MAP = [
            0,  // 1. Ashwini: Horse
            1,  // 2. Bharani: Elephant
            2,  // 3. Krittika: Sheep
            3,  // 4. Rohini: Serpent
            3,  // 5. Mrigashira: Serpent
            4,  // 6. Ardra: Dog
            5,  // 7. Punarvasu: Cat
            2,  // 8. Pushya: Sheep
            5,  // 9. Ashlesha: Cat
            6,  // 10. Magha: Rat
            6,  // 11. Purva Phalguni: Rat
            7,  // 12. Uttara Phalguni: Cow
            8,  // 13. Hasta: Buffalo
            9,  // 14. Chitra: Tiger
            8,  // 15. Swati: Buffalo
            9,  // 16. Vishakha: Tiger
            10, // 17. Anuradha: Deer
            10, // 18. Jyeshtha: Deer
            4,  // 19. Mula: Dog
            11, // 20. Purva Ashadha: Monkey
            12, // 21. Uttara Ashadha: Mongoose
            11, // 22. Shravana: Monkey
            13, // 23. Dhanishta: Lion
            0,  // 24. Shatabhisha: Horse
            13, // 25. Purva Bhadrapada: Lion
            7,  // 26. Uttara Bhadrapada: Cow
            1   // 27. Revati: Elephant
        ];

        const YONI_MATRIX = [
            // Hor  Ele  She  Ser  Dog  Cat  Rat  Cow  Buf  Tig  Dee  Mon  MonG Lio
            [   4,   3,   2,   2,   2,   2,   2,   2,   0,   1,   3,   3,   2,   1 ], // 0: Horse
            [   3,   4,   3,   2,   2,   2,   2,   2,   2,   1,   2,   2,   2,   0 ], // 1: Elephant
            [   2,   3,   4,   2,   1,   2,   1,   3,   2,   1,   2,   0,   2,   1 ], // 2: Sheep
            [   2,   2,   2,   4,   2,   3,   1,   2,   2,   1,   2,   2,   0,   2 ], // 3: Serpent
            [   2,   2,   1,   2,   4,   3,   3,   1,   2,   1,   0,   2,   2,   1 ], // 4: Dog
            [   2,   2,   2,   3,   3,   4,   0,   2,   2,   1,   2,   2,   2,   1 ], // 5: Cat
            [   2,   2,   1,   1,   3,   0,   4,   2,   2,   1,   2,   2,   2,   1 ], // 6: Rat
            [   2,   2,   3,   2,   1,   2,   2,   4,   3,   0,   2,   2,   2,   1 ], // 7: Cow
            [   0,   2,   2,   2,   2,   2,   2,   3,   4,   1,   2,   2,   3,   1 ], // 8: Buffalo
            [   1,   1,   1,   1,   1,   1,   1,   0,   1,   4,   1,   1,   1,   3 ], // 9: Tiger
            [   3,   2,   2,   2,   0,   2,   2,   2,   2,   1,   4,   3,   2,   1 ], // 10: Deer
            [   3,   2,   0,   2,   2,   2,   2,   2,   2,   1,   3,   4,   2,   2 ], // 11: Monkey
            [   2,   2,   2,   0,   2,   2,   2,   2,   3,   1,   2,   2,   4,   2 ], // 12: Mongoose
            [   1,   0,   1,   2,   1,   1,   1,   1,   1,   3,   1,   2,   2,   4 ]  // 13: Lion
        ];

        let boyYoni = NAK_YONI_MAP[boyNakIndex];
        let girlYoni = NAK_YONI_MAP[girlNakIndex];
        let yoniScore = YONI_MATRIX[boyYoni][girlYoni];

        // 5. Graha Maitri Kuta (5 points)
        const RASHI_LORDS = [
            "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
            "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
        ];
        const PLANET_FRIENDS = {
            Sun:     ['Moon', 'Mars', 'Jupiter'],
            Moon:    ['Sun', 'Mercury'],
            Mars:    ['Sun', 'Moon', 'Jupiter'],
            Mercury: ['Sun', 'Venus'],
            Jupiter: ['Sun', 'Moon', 'Mars'],
            Venus:   ['Mercury', 'Saturn'],
            Saturn:  ['Mercury', 'Venus']
        };
        const PLANET_ENEMIES = {
            Sun:     ['Venus', 'Saturn'],
            Moon:    [],
            Mars:    ['Mercury'],
            Mercury: ['Moon'],
            Jupiter: ['Mercury', 'Venus'],
            Venus:   ['Sun', 'Moon'],
            Saturn:  ['Sun', 'Moon', 'Mars']
        };
        function getRelationship(p1, p2) {
            if (p1 === p2) return 'F';
            if (PLANET_FRIENDS[p1] && PLANET_FRIENDS[p1].includes(p2)) return 'F';
            if (PLANET_ENEMIES[p1] && PLANET_ENEMIES[p1].includes(p2)) return 'E';
            return 'N';
        }
        function getGrahaMaitriScore(l1, l2) {
            if (l1 === l2) return 5;
            let r1 = getRelationship(l1, l2);
            let r2 = getRelationship(l2, l1);

            if (r1 === 'F' && r2 === 'F') return 5;
            if ((r1 === 'F' && r2 === 'N') || (r1 === 'N' && r2 === 'F')) return 4;
            if (r1 === 'N' && r2 === 'N') return 3;
            if ((r1 === 'F' && r2 === 'E') || (r1 === 'E' && r2 === 'F')) return 1;
            if ((r1 === 'N' && r2 === 'E') || (r1 === 'E' && r2 === 'N')) return 0.5;
            if (r1 === 'E' && r2 === 'E') return 0;
            return 0;
        }
        let boyLord = RASHI_LORDS[boyRashi - 1];
        let girlLord = RASHI_LORDS[girlRashi - 1];
        let maitriScore = getGrahaMaitriScore(boyLord, girlLord);

        // 6. Gana Kuta (6 points)
        // 0: Deva, 1: Manushya, 2: Rakshasa
        const NAK_GANA_MAP = [
            0, 1, 2, 1, 0, 1, 0, 0, 2,
            2, 1, 1, 0, 2, 0, 2, 0, 2,
            2, 1, 1, 0, 2, 2, 1, 1, 0
        ];
        const GANA_MATRIX = [
            // Deva  Manushya  Rakshasa
            [  6,    6,        1 ], // Deva
            [  5,    6,        0 ], // Manushya
            [  0,    0,        6 ]  // Rakshasa
        ];
        let boyGana = NAK_GANA_MAP[boyNakIndex];
        let girlGana = NAK_GANA_MAP[girlNakIndex];
        let ganaScore = GANA_MATRIX[boyGana][girlGana];

        // 7. Bhakoot Kuta (7 points)
        let diffB2G = ((girlRashi - boyRashi + 12) % 12) + 1;
        let bhakootScore;
        if (diffB2G === 1 || diffB2G === 7 || diffB2G === 3 || diffB2G === 11 || diffB2G === 4 || diffB2G === 10) {
            bhakootScore = 7;
        } else {
            bhakootScore = 0;
        }

        // 8. Nadi Kuta (8 points)
        // 0: Adi, 1: Madhya, 2: Antya
        const NAK_NADI_MAP = [
            0, 1, 2, 2, 1, 0, 0, 1, 2,
            2, 1, 0, 0, 1, 2, 2, 1, 0,
            0, 1, 2, 2, 1, 0, 0, 1, 2
        ];
        let boyNadi = NAK_NADI_MAP[boyNakIndex];
        let girlNadi = NAK_NADI_MAP[girlNakIndex];
        let nadiScore = (boyNadi !== girlNadi) ? 8 : 0;

        let totalScore = varnaScore + vashyaScore + taraScore + yoniScore + maitriScore + ganaScore + bhakootScore + nadiScore;

        let boyManglik = calculateManglikDosha(boyChart);
        let girlManglik = calculateManglikDosha(girlChart);

        let manglikMatch;
        if (boyManglik.effectiveManglik && girlManglik.effectiveManglik) {
            manglikMatch = true; // Both Manglik -> cancel each other
        } else if (!boyManglik.effectiveManglik && !girlManglik.effectiveManglik) {
            manglikMatch = true; // Neither Manglik
        } else {
            manglikMatch = false; // One Manglik, one non-Manglik
        }

        let verdict = totalScore >= 28 ? "Excellent Match" : totalScore >= 18 ? "Good Match" : "Below Average / Requires Remedies";

        return {
            totalScore,
            totalGuna: totalScore,
            maxScore: 36,
            maxGuna: 36,
            breakdown: {
                varna: varnaScore,
                vashya: vashyaScore,
                tara: taraScore,
                yoni: yoniScore,
                maitri: maitriScore,
                gana: ganaScore,
                bhakoot: bhakootScore,
                nadi: nadiScore,
                varnaScore,
                vashyaScore,
                taraScore,
                yoniScore,
                maitriScore,
                ganaScore,
                bhakootScore,
                nadiScore
            },
            boyManglik,
            girlManglik,
            manglikMatch,
            verdict
        };
    }

    // --- JAIMINI KARAKAS (7-KARAKA SYSTEM) ---
    function calculateJaiminiKarakas(planets) {
        const pList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
        const karakaNames = [
            { code: 'AK', role: 'Atmakaraka', desc: 'Soul & Primary Destiny' },
            { code: 'AmK', role: 'Amatyakaraka', desc: 'Career, Mind & Profession' },
            { code: 'BK', role: 'Bhratrikaraka', desc: 'Siblings, Gurus & Courage' },
            { code: 'MK', role: 'Matrikaraka', desc: 'Mother, Home & Property' },
            { code: 'PK', role: 'Putrakaraka', desc: 'Children, Creativity & Intelligence' },
            { code: 'GK', role: 'Gnatikaraka', desc: 'Obstacles, Health & Competition' },
            { code: 'DK', role: 'Darakaraka', desc: 'Spouse, Life Partner & Relationships' }
        ];

        let sorted = pList.map(name => {
            let lon = planets[name];
            let degInRashi = lon % 30;
            return { name, lon, degInRashi };
        }).sort((a, b) => b.degInRashi - a.degInRashi);

        return sorted.map((item, idx) => ({
            planet: item.name,
            code: karakaNames[idx].code,
            role: karakaNames[idx].role,
            desc: karakaNames[idx].desc,
            degInRashi: item.degInRashi
        }));
    }

    // --- KP ASTROLOGY (STAR LORD & SUB LORD SYSTEM) ---
    function calculateKPAstrology(planets) {
        const LORDS_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
        const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
        const TOTAL_YEARS = 120;

        const getStarAndSub = (lon) => {
            let nakDeg = 13 + 20 / 60; // 13° 20'
            let nakIndex = Math.floor(lon / nakDeg) % 27;
            let starLord = NAKSHATRAS[nakIndex].lord;

            let remDeg = lon % nakDeg;
            let starStartIdx = LORDS_ORDER.indexOf(starLord);

            let subDegAccum = 0;
            let subLord = starLord;
            for (let i = 0; i < 9; i++) {
                let currentIdx = (starStartIdx + i) % 9;
                let subSpan = (DASHA_YEARS[currentIdx] / TOTAL_YEARS) * nakDeg;
                subDegAccum += subSpan;
                if (remDeg <= subDegAccum) {
                    subLord = LORDS_ORDER[currentIdx];
                    break;
                }
            }

            return { starLord, subLord };
        };

        let result = {};
        const pList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Ascendant'];
        pList.forEach(name => {
            if (planets[name] !== undefined) {
                let info = getDegreeInfo(planets[name]);
                let kp = getStarAndSub(planets[name]);
                result[name] = {
                    rashi: info.rashiName,
                    degree: info.degInRashiFormatted,
                    nakshatra: info.nakshatraName,
                    starLord: kp.starLord,
                    subLord: kp.subLord
                };
            }
        });
        return result;
    }

    // --- PLANETARY YOGAS DETECTION ---
    function calculateYogas(planets) {
        let yogas = [];
        let sunRashi = Math.floor(planets.Sun / 30) + 1;
        let moonRashi = Math.floor(planets.Moon / 30) + 1;
        let mercRashi = Math.floor(planets.Mercury / 30) + 1;
        let marsRashi = Math.floor(planets.Mars / 30) + 1;
        let jupRashi = Math.floor(planets.Jupiter / 30) + 1;

        // 1. Budhaditya Yoga (Sun + Mercury conjunction)
        if (sunRashi === mercRashi) {
            yogas.push({
                name: "Budhaditya Yoga",
                type: "Auspicious (Intellect & Fame)",
                desc: "Sun and Mercury conjunction in same sign brings high intelligence, administrative skills, and sharp communication."
            });
        }

        // 2. Gaja Kesari Yoga (Jupiter in Kendra from Moon)
        let moonJupDiff = Math.abs(jupRashi - moonRashi) % 12;
        if (moonJupDiff === 0 || moonJupDiff === 3 || moonJupDiff === 6 || moonJupDiff === 9) {
            yogas.push({
                name: "Gaja Kesari Yoga",
                type: "Royal (Wisdom & Prosperity)",
                desc: "Jupiter in Kendra from Moon grants wisdom, financial stability, high social standing, and protection from adversity."
            });
        }

        // 3. Chandra Mangala Yoga (Moon + Mars conjunction)
        if (moonRashi === marsRashi) {
            yogas.push({
                name: "Chandra Mangala Yoga",
                type: "Financial (Wealth & Enterprise)",
                desc: "Moon and Mars combination creates strong financial ambition, entrepreneurship, and material accumulation."
            });
        }

        // 4. Guru Mangala Yoga (Jupiter + Mars)
        if (jupRashi === marsRashi) {
            yogas.push({
                name: "Guru Mangala Yoga",
                type: "Leadership & Righteousness",
                desc: "Jupiter and Mars combination enhances bravery, righteousness, legal success, and executive leadership."
            });
        }

        if (yogas.length === 0) {
            yogas.push({
                name: "Lagna Shubha Combination",
                type: "Foundational Balance",
                desc: "Benefic planetary placements support overall life vitality and personal growth."
            });
        }

        return yogas;
    }

    // --- PUBLIC INTERFACE ---
    return {
        RASHIS,
        NAKSHATRAS,
        CITIES_DB,
        julianDay,
        getLahiriAyanamsa,
        calculatePlanets,
        getDegreeInfo,
        calculateVargas,
        calculateVimshottari,
        calculatePanchang,
        calculateGunMilan,
        calculateManglikDosha,
        calculateJaiminiKarakas,
        calculateKPAstrology,
        calculateYogas
    };
})();

if (typeof window !== 'undefined') {
    window.AstroEngine = AstroEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AstroEngine;
}
