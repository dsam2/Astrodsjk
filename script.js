document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mouse Parallax Effect
    const heroRight = document.querySelector('.hero-right');
    const particles = document.getElementById('particles');

    // Create particles safely if particles container exists
    if (particles) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = '#64748b';
            particle.style.borderRadius = '50%';
            particle.style.top = Math.random() * 100 + 'vh';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.opacity = Math.random() * 0.5;
            particle.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
            particle.dataset.speedx = (Math.random() - 0.5) * 0.5;
            particle.dataset.speedy = (Math.random() - 0.5) * 0.5;
            particles.appendChild(particle);
        }
    }

    const wrapper = document.querySelector('.kundali-3d-wrapper');
    if (heroRight && wrapper) {
        heroRight.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            wrapper.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        });
        
        heroRight.addEventListener('mouseleave', () => {
            wrapper.style.transform = `rotateY(0deg) rotateX(0deg)`;
        });
    }

    // 4. FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        if (btn) {
            btn.addEventListener('click', () => {
                faqItems.forEach(other => {
                    if (other !== item) other.classList.remove('active');
                });
                item.classList.toggle('active');
            });
        }
    });

    // 5. Scroll Reveals (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.glass-card, .section-title, .dasha-node');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // 6. Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        const savedTheme = localStorage.getItem('astro-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        const updateThemeState = () => {
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            }
            
            document.querySelectorAll('#particles div').forEach(p => {
                p.style.background = currentTheme === 'dark' ? '#fff' : '#64748b';
                p.style.boxShadow = currentTheme === 'dark' ? '0 0 10px #fff' : '0 0 10px rgba(0,0,0,0.1)';
            });
        };
        
        updateThemeState();
        
        themeToggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('astro-theme', currentTheme);
            updateThemeState();
        });
    }

    // City Auto-lookup & Coordinates Auto-fill
    const birthPlaceInput = document.getElementById('birthPlace');
    const latInput = document.getElementById('lat');
    const longInput = document.getElementById('long');
    const tzInput = document.getElementById('timezone');

    if (birthPlaceInput && window.AstroEngine && window.AstroEngine.CITIES_DB) {
        const acContainer = document.createElement('div');
        acContainer.className = 'autocomplete-dropdown hidden';
        if (birthPlaceInput.parentElement) {
            birthPlaceInput.parentElement.appendChild(acContainer);
        }

        const updateLocationCoords = (cityName) => {
            if (!cityName) return;
            const query = cityName.trim().toLowerCase();
            const match = window.AstroEngine.CITIES_DB.find(c => 
                c.name.toLowerCase().includes(query) || 
                query.includes(c.name.split(',')[0].toLowerCase())
            );
            if (match) {
                if (latInput) latInput.value = match.lat;
                if (longInput) longInput.value = match.lng;
                if (tzInput) tzInput.value = match.tz;
            }
        };

        birthPlaceInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 1) {
                acContainer.classList.add('hidden');
                return;
            }

            const matches = window.AstroEngine.CITIES_DB.filter(c => 
                c.name.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                acContainer.innerHTML = matches.map(c => `
                    <div class="ac-item" data-name="${c.name}" data-lat="${c.lat}" data-lng="${c.lng}" data-tz="${c.tz}">
                        📍 ${c.name} <small style="opacity: 0.7;">(${c.lat}°N, ${c.lng}°E)</small>
                    </div>
                `).join('');
                acContainer.classList.remove('hidden');
            } else {
                acContainer.classList.add('hidden');
            }

            updateLocationCoords(query);
        });

        acContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.ac-item');
            if (item) {
                const name = item.getAttribute('data-name');
                const lat = item.getAttribute('data-lat');
                const lng = item.getAttribute('data-lng');
                const tz = item.getAttribute('data-tz');

                birthPlaceInput.value = name;
                if (latInput) latInput.value = lat;
                if (longInput) longInput.value = lng;
                if (tzInput) tzInput.value = tz;

                acContainer.classList.add('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!birthPlaceInput.contains(e.target) && !acContainer.contains(e.target)) {
                acContainer.classList.add('hidden');
            }
        });

        birthPlaceInput.addEventListener('change', (e) => {
            updateLocationCoords(e.target.value);
        });
    }

    // 7. Interactive Offline Horoscope Generator & Ephemeris Engine
    const triggerCalculation = (scroll = true) => {
        if (!window.AstroEngine || !window.ChartRenderer) return;
        const fullName = document.getElementById('fullName')?.value || "Native";
        const dob = document.getElementById('dob')?.value || "1995-05-15";
        const tob = document.getElementById('tob')?.value || "10:30";
        const cityName = document.getElementById('birthPlace')?.value || "New Delhi";
        const latVal = parseFloat(document.getElementById('lat')?.value) || 28.6139;
        const longVal = parseFloat(document.getElementById('long')?.value) || 77.2090;
        const tzVal = parseFloat(document.getElementById('timezone')?.value) || 5.5;
        const chartStyle = document.getElementById('chartStyle')?.value || "north";

        // Parse Date & Time
        const dateParts = dob.split('-').map(Number);
        const timeParts = tob.split(':').map(Number);

        let year = dateParts[0] || 1995;
        let month = dateParts[1] || 5;
        let day = dateParts[2] || 15;
        let hour = timeParts[0] || 10;
        let minute = timeParts[1] || 30;

        // Julian Day & Ephemeris Calculation
        let JD = AstroEngine.julianDay(year, month, day, hour, minute, 0, tzVal);
        let planets = AstroEngine.calculatePlanets(JD, latVal, longVal);
        let vargas = AstroEngine.calculateVargas(planets);
        // Populate Print / PDF Report Details
        const pName = document.getElementById('printName'); if (pName) pName.textContent = fullName;
        const pDob = document.getElementById('printDob'); if (pDob) pDob.textContent = dob;
        const pTob = document.getElementById('printTob'); if (pTob) pTob.textContent = tob;
        const pPlace = document.getElementById('printPlace'); if (pPlace) pPlace.textContent = cityName;
        const pCoords = document.getElementById('printCoords'); if (pCoords) pCoords.textContent = `${latVal}° N, ${longVal}° E`;
        const pTz = document.getElementById('printTz'); if (pTz) pTz.textContent = `+${tzVal} hrs`;

        // Render SVG Chart based on selected style
        let selectedSvg = '';
        if (chartStyle === 'south') {
            selectedSvg = ChartRenderer.renderSouthIndianSVG(vargas.D1, vargas.D1.Ascendant);
        } else if (chartStyle === 'east') {
            selectedSvg = ChartRenderer.renderEastIndianSVG(vargas.D1, vargas.D1.Ascendant);
        } else {
            selectedSvg = ChartRenderer.renderNorthIndianSVG(vargas.D1, vargas.D1.Ascendant);
        }

        let northSvg = ChartRenderer.renderNorthIndianSVG(vargas.D1, vargas.D1.Ascendant);
        let southSvg = ChartRenderer.renderSouthIndianSVG(vargas.D1);
        let eastSvg = ChartRenderer.renderEastIndianSVG(vargas.D1, vargas.D1.Ascendant);

        // Update SVG Containers
        let chartDisplayCard = document.getElementById('chartDisplayCard');
        if (chartDisplayCard) chartDisplayCard.classList.remove('hidden');

        let chartDisplay = document.getElementById('chartDisplay');
        if (chartDisplay) chartDisplay.innerHTML = selectedSvg;

        let hero3d = document.querySelector('.kundali-chart-3d');
        if (hero3d) hero3d.innerHTML = selectedSvg;

        let northCard = document.querySelector('.chart-illus.north-indian');
        if (northCard) northCard.innerHTML = northSvg;

        let southCard = document.querySelector('.chart-illus.south-indian');
        if (southCard) southCard.innerHTML = southSvg;

        let eastCard = document.querySelector('.chart-illus.east-indian');
        if (eastCard) eastCard.innerHTML = eastSvg;

        // Render Planetary Position Cards
        const planetGrid = document.querySelector('.planet-grid');
        if (planetGrid) {
            let planetHTML = '';
            const planetList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

            planetList.forEach(p => {
                let info = AstroEngine.getDegreeInfo(planets[p]);
                let isExalted = (p === 'Sun' && info.rashiIndex === 1) || (p === 'Moon' && info.rashiIndex === 2);
                let isDebilitated = (p === 'Sun' && info.rashiIndex === 7) || (p === 'Mars' && info.rashiIndex === 4);
                let badgeClass = isExalted ? 'badge-exalted' : isDebilitated ? 'badge-debilitated' : 'badge-own';
                let badgeText = isExalted ? 'Exalted' : isDebilitated ? 'Debilitated' : 'Direct';

                planetHTML += `
                    <div class="planet-card glass-card">
                        <div class="planet-header">
                            <div class="planet-icon ${p.toLowerCase()}-icon"></div>
                            <h3>${p}</h3>
                        </div>
                        <div class="planet-stats">
                            <div class="stat"><span class="label">Sign</span><span class="value">${info.rashiName} (${info.rashiHindi})</span></div>
                            <div class="stat"><span class="label">Degree</span><span class="value font-num">${info.rashiDeg}</span></div>
                            <div class="stat"><span class="label">Nakshatra</span><span class="value">${info.nakshatraName} (P${info.pada})</span></div>
                        </div>
                        <div class="planet-status ${badgeClass}">${badgeText}</div>
                    </div>
                `;
            });
            planetGrid.innerHTML = planetHTML;
        }

        // Render Panchang
        let dayOfWeek = new Date(year, month - 1, day).getDay();
        let panchang = AstroEngine.calculatePanchang(planets.Sun, planets.Moon, dayOfWeek);
        const panchangGrid = document.querySelector('.panchang-grid');
        if (panchangGrid) {
            panchangGrid.innerHTML = `
                <div class="p-item"><span class="p-label">Tithi</span><span class="p-val">${panchang.tithiName} (${panchang.paksha})</span></div>
                <div class="p-item"><span class="p-label">Nakshatra</span><span class="p-val">${panchang.nakshatraName}</span></div>
                <div class="p-item"><span class="p-label">Yoga</span><span class="p-val">${panchang.yogaName}</span></div>
                <div class="p-item"><span class="p-label">Karana</span><span class="p-val">${panchang.karanaName}</span></div>
                <div class="p-item"><span class="p-label">Vara</span><span class="p-val">${panchang.varaName}</span></div>
                <div class="p-item"><span class="p-label">Ayanamsa</span><span class="p-val font-num">${planets.ayanamsa.toFixed(2)}° Lahiri</span></div>
            `;
        }

        // Render KP System
        if (AstroEngine.calculateKPAstrology) {
            const kpData = AstroEngine.calculateKPAstrology(planets);
            const kpContainer = document.getElementById('kpContainer');
            if (kpContainer) {
                let kpHTML = '';
                Object.keys(kpData).forEach(p => {
                    let d = kpData[p];
                    kpHTML += `
                        <div class="kp-card glass-card" style="padding: 1rem; border-radius: 8px;">
                            <h4 style="color: var(--accent-primary); margin-bottom: 0.5rem;">${p}</h4>
                            <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.25rem;">
                                <div><strong>Sign:</strong> ${d.rashi} (${d.degree})</div>
                                <div><strong>Nakshatra:</strong> ${d.nakshatra}</div>
                                <div><strong>Star Lord:</strong> <span style="color: var(--accent-secondary);">${d.starLord}</span></div>
                                <div><strong>Sub Lord:</strong> <span style="color: #f59e0b; font-weight: 600;">${d.subLord}</span></div>
                            </div>
                        </div>
                    `;
                });
                kpContainer.innerHTML = kpHTML;
            }
        }

        // Render Jaimini Karakas
        if (AstroEngine.calculateJaiminiKarakas) {
            const jaiminiData = AstroEngine.calculateJaiminiKarakas(planets);
            const jaiminiContainer = document.getElementById('jaiminiContainer');
            if (jaiminiContainer) {
                let jaiminiHTML = '';
                jaiminiData.forEach(k => {
                    jaiminiHTML += `
                        <div class="jaimini-card glass-card" style="padding: 1rem; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <h4 style="color: var(--accent-primary); margin: 0;">${k.planet}</h4>
                                <span style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; padding: 0.15rem 0.5rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem;">${k.code}</span>
                            </div>
                            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${k.role}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${k.desc}</div>
                        </div>
                    `;
                });
                jaiminiContainer.innerHTML = jaiminiHTML;
            }
        }

        // Render Yogas
        if (AstroEngine.calculateYogas) {
            const yogasData = AstroEngine.calculateYogas(planets);
            const yogasContainer = document.getElementById('yogasContainer');
            if (yogasContainer) {
                let yogasHTML = '';
                yogasData.forEach(y => {
                    yogasHTML += `
                        <div class="yoga-card glass-card" style="padding: 1rem; border-radius: 8px; border-left: 4px solid var(--accent-primary);">
                            <h4 style="color: var(--accent-primary); margin-bottom: 0.25rem;">${y.name} <small style="font-size: 0.75rem; opacity: 0.8; font-weight: normal;">[${y.type}]</small></h4>
                            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${y.desc}</p>
                        </div>
                    `;
                });
                yogasContainer.innerHTML = yogasHTML;
            }
        }

        // Render Dasha Timeline & Accordion
        let birthDateObj = new Date(year, month - 1, day);
        let dashaTimeline = AstroEngine.calculateVimshottari(planets.Moon, birthDateObj);
        const dashaAccordion = document.getElementById('dashaAccordion');
        const dashaNodes = document.querySelector('.dasha-nodes');
        
        if (dashaNodes) {
            let dashaHTML = '';
            let now = new Date();

            dashaTimeline.slice(0, 9).forEach((d, idx) => {
                let startDate = new Date(d.start);
                let endDate = new Date(d.end);
                let status = (now >= startDate && now <= endDate) ? 'active' : (now > endDate) ? 'past' : 'future';
                let badgeLabel = status === 'active' ? 'Active' : (status === 'past' ? 'Completed' : 'Upcoming');

                let antardashaHTML = '';
                if (d.antardashas) {
                    antardashaHTML = d.antardashas.map(ad => `
                        <div class="antardasha-item" style="margin-top: 0.25rem; font-size: 0.8rem; color: var(--text-secondary);">
                            • ${ad.lord}: ${ad.start.slice(0,10)} to ${ad.end.slice(0,10)}
                        </div>
                    `).join('');
                }

                dashaHTML += `
                    <div class="dasha-node ${status} accordion-item" data-index="${idx}">
                        <div class="dasha-node-header">
                            <div class="node-circle"></div>
                            <h4 style="font-size: 1.05rem; margin: 0; font-family: var(--font-heading);">${d.planet} Mahadasha</h4>
                            <span class="dasha-badge">${badgeLabel}</span>
                        </div>
                        <div class="dasha-dates font-num" style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                            📅 ${d.start.slice(0,4)} – ${d.end.slice(0,4)}
                        </div>
                        <div class="dasha-accordion-toggle" style="font-size: 0.75rem; color: var(--accent-primary); opacity: 0.8;">
                            Click to view Antardashas ▼
                        </div>
                        <div class="dasha-accordion-content hidden" style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border); width: 100%;">
                            ${antardashaHTML}
                        </div>
                    </div>
                `;
            });
            dashaNodes.innerHTML = dashaHTML;

            // Wire click to expand accordion items
            dashaNodes.querySelectorAll('.accordion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const content = item.querySelector('.dasha-accordion-content');
                    if (content) {
                        content.classList.toggle('hidden');
                    }
                });
            });
        }

        // Smooth Scroll if requested
        if (scroll) {
            const chartDisplayCard = document.getElementById('chartDisplayCard');
            if (chartDisplayCard) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const targetPos = chartDisplayCard.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        }
    };

    // Initial state: website starts completely clean without preloaded data
    // Horoscope is calculated only when user enters birth details and clicks Generate Horoscope

    // Form Generate Buttons & Event Listeners
    const formGenBtn = document.getElementById('generateChartBtn') || document.querySelector('.birth-form button');
    if (formGenBtn) {
        formGenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            triggerCalculation(true);
        });
    }

    const birthForm = document.querySelector('.birth-form');
    if (birthForm) {
        birthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            triggerCalculation(true);
        });
    }

    // Update on chart style change
    const chartStyleSelect = document.getElementById('chartStyle');
    if (chartStyleSelect) {
        chartStyleSelect.addEventListener('change', () => {
            triggerCalculation(false);
        });
    }

    // Wire Premium Features Grid Cards to smooth scroll to their sections
    const featureCards = document.querySelectorAll('.features-grid .feature-card');
    const featureTargets = [
        'kundali',          // 1. Birth Charts
        'kp-system',        // 2. KP Astrology
        'jaimini-system',   // 3. Jaimini System
        'planets',          // 4. Planetary Details
        'predictions',      // 5. Dasha Timeline
        'panchang',         // 6. Daily Panchang
        'yogas-section',    // 7. Yogas
        'compatibility'     // 8. Compatibility
    ];

    featureCards.forEach((card, idx) => {
        if (featureTargets[idx]) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSec = document.getElementById(featureTargets[idx]);
                if (targetSec) {
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                    const targetPos = targetSec.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });
                }
            });
        }
    });

    // Interactive Preview Buttons on Chart Cards (North, South, East)
    const chartCards = document.querySelectorAll('.chart-card');
    chartCards.forEach(card => {
        const previewBtn = card.querySelector('.btn-outline');
        const cardTitle = card.querySelector('h3')?.textContent.toLowerCase();
        
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let styleVal = 'north';
                if (cardTitle?.includes('south')) styleVal = 'south';
                else if (cardTitle?.includes('east')) styleVal = 'east';

                if (chartStyleSelect) chartStyleSelect.value = styleVal;
                triggerCalculation(true);
            });
        }
    });

    // Hero & Navbar Generate Buttons
    const topCTA = document.querySelectorAll('.nav-cta button, .hero-buttons .btn-primary');
    topCTA.forEach(btn => {
        btn.addEventListener('click', () => {
            const formSec = document.getElementById('kundali');
            if (formSec) {
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                const targetPos = formSec.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
                document.getElementById('fullName')?.focus();
            }
        });
    });

    // Smooth Scroll for Navigation Bar Links
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    navAnchors.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetSec = document.querySelector(targetId);
                if (targetSec) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                    const targetPos = targetSec.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });
                    history.pushState(null, null, targetId);
                }
            }
        });
    });

    // 8. Kundali Matching (Gun Milan Calculator)
    const calcMatchBtn = document.getElementById('calcMatchBtn');
    if (calcMatchBtn && window.AstroEngine) {
        calcMatchBtn.addEventListener('click', () => {
            const boyName = document.getElementById('boyName')?.value || "Boy Native";
            const boyDob = document.getElementById('boyDob')?.value || "1994-08-20";
            const boyTob = document.getElementById('boyTob')?.value || "14:15";

            const girlName = document.getElementById('girlName')?.value || "Girl Native";
            const girlDob = document.getElementById('girlDob')?.value || "1996-11-10";
            const girlTob = document.getElementById('girlTob')?.value || "09:45";

            // Boy calculations
            let boyParts = boyDob.split('-').map(Number);
            let boyTimeParts = boyTob.split(':').map(Number);
            let boyJD = AstroEngine.julianDay(boyParts[0]||1994, boyParts[1]||8, boyParts[2]||20, boyTimeParts[0]||14, boyTimeParts[1]||15, 0, 5.5);
            let boyPlanets = AstroEngine.calculatePlanets(boyJD, 28.61, 77.20);
            let boyMoonInfo = AstroEngine.getDegreeInfo(boyPlanets.Moon);
            let boyManglik = AstroEngine.calculateManglikDosha(boyPlanets);

            // Girl calculations
            let girlParts = girlDob.split('-').map(Number);
            let girlTimeParts = girlTob.split(':').map(Number);
            let girlJD = AstroEngine.julianDay(girlParts[0]||1996, girlParts[1]||11, girlParts[2]||10, girlTimeParts[0]||9, girlTimeParts[1]||45, 0, 5.5);
            let girlPlanets = AstroEngine.calculatePlanets(girlJD, 28.61, 77.20);
            let girlMoonInfo = AstroEngine.getDegreeInfo(girlPlanets.Moon);
            let girlManglik = AstroEngine.calculateManglikDosha(girlPlanets);

            // Gun Milan & Synastry
            let match = AstroEngine.calculateGunMilan(boyPlanets.Moon, girlPlanets.Moon);

            // Update UI & Unhide Match Results Container
            const matchResultsContainer = document.getElementById('matchResultsContainer');
            if (matchResultsContainer) matchResultsContainer.classList.remove('hidden');

            const resBoyNameEl = document.getElementById('resBoyName');
            if (resBoyNameEl) resBoyNameEl.textContent = boyName;

            const resBoyMoonEl = document.getElementById('resBoyMoon');
            if (resBoyMoonEl) resBoyMoonEl.textContent = `Moon: ${boyMoonInfo.rashiName} (${boyMoonInfo.nakshatraName}) ${boyManglik.isManglik ? '[Manglik]' : '[Non-Manglik]'}`;

            const resGirlNameEl = document.getElementById('resGirlName');
            if (resGirlNameEl) resGirlNameEl.textContent = girlName;

            const resGirlMoonEl = document.getElementById('resGirlMoon');
            if (resGirlMoonEl) resGirlMoonEl.textContent = `Moon: ${girlMoonInfo.rashiName} (${girlMoonInfo.nakshatraName}) ${girlManglik.isManglik ? '[Manglik]' : '[Non-Manglik]'}`;

            let scoreValEl = document.getElementById('gunaScoreVal');
            if (scoreValEl) scoreValEl.innerHTML = `${match.totalGuna}<span class="total">/36</span>`;

            let verdictEl = document.getElementById('gunaVerdict');
            if (verdictEl) verdictEl.textContent = match.verdict;

            const resContainer = document.getElementById('matchResultsContainer');
            if (resContainer) resContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // PDF / Print Export Handlers
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            window.print();
        });
    }

    const printBtns = document.querySelectorAll('.btn-primary, .nav-cta button, #reportExportPdfBtn');
    printBtns.forEach(btn => {
        if (btn.textContent.includes('Report') || btn.textContent.includes('PDF') || btn.textContent.includes('Print')) {
            btn.addEventListener('click', () => {
                window.print();
            });
        }
    });
});


