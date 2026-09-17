        (function() {
            "use strict";

            // ============================================================
            //  GLOW ORB FOLLOWS MOUSE IN HERO
            // ============================================================
            const glowOrb = document.getElementById('glowOrb');
            document.addEventListener('mousemove', (e) => {
                if (glowOrb) {
                    const x = (e.clientX / window.innerWidth) * 100;
                    const y = (e.clientY / window.innerHeight) * 100;
                    glowOrb.style.transform = `translate(${x - 50}%, ${y - 50}%)`;
                }
            });

            // ============================================================
            //  THREE.JS BACKGROUND (optimized)
            // ============================================================
            const container = document.getElementById('three-canvas');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            container.appendChild(renderer.domElement);

            // Particles
            const count = 400;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 160;
            }
            const particlesGeometry = new THREE.BufferGeometry();
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.25,
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending,
            });
            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            // Lines (fewer)
            const linePositions = [];
            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const p1 = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]];
                    const p2 = [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]];
                    const dx = p1[0] - p2[0],
                        dy = p1[1] - p2[1],
                        dz = p1[2] - p2[2];
                    if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 12) {
                        linePositions.push(p1[0], p1[1], p1[2]);
                        linePositions.push(p2[0], p2[1], p2[2]);
                    }
                }
            }
            const linesGeometry = new THREE.BufferGeometry();
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            const linesMaterial = new THREE.LineBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.08,
                blending: THREE.AdditiveBlending,
            });
            const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
            scene.add(linesMesh);

            camera.position.z = 50;

            let mouse3D = { x: 0, y: 0 };
            document.addEventListener('mousemove', (e) => {
                mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;
            });

            function animateScene() {
                requestAnimationFrame(animateScene);
                particlesMesh.rotation.y += 0.0003;
                particlesMesh.rotation.x += 0.00015;
                linesMesh.rotation.y = particlesMesh.rotation.y;
                linesMesh.rotation.x = particlesMesh.rotation.x;
                // Parallax
                particlesMesh.rotation.x += (mouse3D.y * 0.015 - particlesMesh.rotation.x) * 0.01;
                particlesMesh.rotation.y += (mouse3D.x * 0.015 - particlesMesh.rotation.y) * 0.01;
                linesMesh.rotation.x = particlesMesh.rotation.x;
                linesMesh.rotation.y = particlesMesh.rotation.y;
                renderer.render(scene, camera);
            }
            animateScene();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // ============================================================
            //  TERMINAL TYPING EFFECT
            // ============================================================
            const termOutput = document.getElementById('termOutput');
            const terminalBody = document.getElementById('terminalBody');
            const commands = [
                { text: 'whoami', output: 'Nandalal Patil — Cybersecurity Analyst' },
                { text: 'cat skills.txt', output: 'VAPT, Threat Modeling (STRIDE), Secure SDLC, Python, React, Node.js' },
                { text: 'nmap -sV target.com', output: 'Scanning 20+ systems... All services secured.' },
                { text: 'status', output: '🟢 Junior System Engineer @ Knights Eye LLP — open to security roles.' },
            ];

            let cmdIndex = 0,
                charIndex = 0,
                isTyping = false,
                currentLine = null;

            function typeCommand() {
                if (cmdIndex >= commands.length) {
                    cmdIndex = 0;
                    const lines = terminalBody.querySelectorAll('.line');
                    lines.forEach((line, idx) => { if (idx > 1) line.remove(); });
                    termOutput.textContent = '';
                    setTimeout(typeCommand, 1000);
                    return;
                }
                const cmd = commands[cmdIndex];
                if (!isTyping) {
                    isTyping = true;
                    charIndex = 0;
                    const outputLine = document.createElement('div');
                    outputLine.className = 'line';
                    outputLine.innerHTML = `<span class="prompt">➜</span><span class="cmd"></span>`;
                    terminalBody.appendChild(outputLine);
                    currentLine = outputLine.querySelector('.cmd');
                    typeChar(cmd.text, currentLine, () => {
                        setTimeout(() => {
                            const outputDiv = document.createElement('div');
                            outputDiv.className = 'line';
                            outputDiv.innerHTML =
                                `<span class="prompt">➜</span><span class="output">${cmd.output}</span>`;
                            terminalBody.appendChild(outputDiv);
                            isTyping = false;
                            cmdIndex++;
                            setTimeout(typeCommand, 1200);
                        }, 400);
                    });
                }
            }

            function typeChar(text, element, callback) {
                if (charIndex < text.length) {
                    element.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(() => typeChar(text, element, callback), 30);
                } else {
                    if (callback) callback();
                }
            }
            setTimeout(typeCommand, 600);

            // ============================================================
            //  THEME TOGGLE
            // ============================================================
            const root = document.documentElement;
            const themeBtn = document.getElementById('themeToggle');
            const themeIcon = document.getElementById('themeToggle').querySelector('svg');

            let savedTheme = 'dark';
            try { savedTheme = localStorage.getItem('np-theme') || 'dark'; } catch (_) {}
            root.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);

            themeBtn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                updateThemeIcon(next);
                try { localStorage.setItem('np-theme', next); } catch (_) {}
            });

            function updateThemeIcon(theme) {
                if (theme === 'light') {
                    themeIcon.innerHTML =
                        `<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`;
                } else {
                    themeIcon.innerHTML =
                        `<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>`;
                }
            }

            // ============================================================
            //  ACCENT TOGGLE
            // ============================================================
            const accentBtn = document.getElementById('accentToggle');
            const accents = ['blue', 'cyan', 'purple', 'green', 'red'];
            let accentIndex = 0;
            accentBtn.addEventListener('click', () => {
                accentIndex = (accentIndex + 1) % accents.length;
                root.setAttribute('data-accent', accents[accentIndex]);
            });

            // ============================================================
            //  COMMAND PALETTE (Ctrl+K)
            // ============================================================
            const palette = document.getElementById('commandPalette');
            const overlay = document.getElementById('paletteOverlay');
            const paletteInput = document.getElementById('paletteInput');
            const results = document.getElementById('paletteResults');
            const paletteToggle = document.getElementById('paletteToggle');

            function openPalette() {
                palette.classList.add('open');
                overlay.classList.add('open');
                paletteInput.value = '';
                paletteInput.focus();
                filterResults('');
            }

            function closePalette() {
                palette.classList.remove('open');
                overlay.classList.remove('open');
            }

            paletteToggle.addEventListener('click', openPalette);
            overlay.addEventListener('click', closePalette);

            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    if (palette.classList.contains('open')) closePalette();
                    else openPalette();
                }
                if (e.key === 'Escape' && palette.classList.contains('open')) closePalette();
            });

            paletteInput.addEventListener('input', (e) => filterResults(e.target.value));

            function filterResults(query) {
                const items = results.querySelectorAll('.result-item');
                const lowerQuery = query.toLowerCase();
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(lowerQuery) || lowerQuery === '' ? 'flex' : 'none';
                });
            }

            results.addEventListener('click', (e) => {
                const item = e.target.closest('.result-item');
                if (!item) return;
                const target = item.dataset.target;
                const action = item.dataset.action;
                if (target) {
                    closePalette();
                    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
                }
                if (action === 'theme') { themeBtn.click();
                    closePalette(); }
                if (action && action.startsWith('accent-')) {
                    root.setAttribute('data-accent', action.split('-')[1]);
                    closePalette();
                }
            });

            // Keyboard nav
            paletteInput.addEventListener('keydown', (e) => {
                const items = [...results.querySelectorAll('.result-item')].filter(el => el.style.display !== 'none');
                if (!items.length) return;
                let activeIndex = items.findIndex(el => el.classList.contains('active'));
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (activeIndex < items.length - 1) {
                        if (activeIndex > -1) items[activeIndex].classList.remove('active');
                        items[activeIndex + 1].classList.add('active');
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (activeIndex > 0) {
                        items[activeIndex].classList.remove('active');
                        items[activeIndex - 1].classList.add('active');
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const active = items.find(el => el.classList.contains('active'));
                    if (active) active.click();
                    else if (items.length) items[0].click();
                }
            });

            // ============================================================
            //  MOBILE MENU
            // ============================================================
            const menuToggle = document.getElementById('menuToggle');
            const navLinks = document.getElementById('navLinks');
            menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
            navLinks.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => navLinks.classList.remove('open'));
            });

            // ============================================================
            //  ACTIVE NAV + REVEAL
            // ============================================================
            const sections = document.querySelectorAll('section[id]');
            const navAnchors = document.querySelectorAll('.nav-links a');
            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navAnchors.forEach(a => a.classList.remove('active'));
                        const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                        if (match) match.classList.add('active');
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            sections.forEach(s => navObserver.observe(s));

            const revealEls = document.querySelectorAll('.reveal');
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: .12 });
            revealEls.forEach(el => revealObserver.observe(el));

            // ============================================================
            //  PROJECT FILTER
            // ============================================================
            const filterBtns = document.querySelectorAll('.filter-btn');
            const cards = document.querySelectorAll('.pcard');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const f = btn.dataset.filter;
                    cards.forEach(c => {
                        const tags = c.dataset.tags || '';
                        c.classList.toggle('hidden', f !== 'all' && tags.indexOf(f) === -1);
                    });
                });
            });

            // ============================================================
            //  PROGRESS BAR
            // ============================================================
            const bar = document.getElementById('progressBar');
            window.addEventListener('scroll', () => {
                const h = document.documentElement;
                const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
                bar.style.width = scrolled + '%';
            });

            // ============================================================
            //  ANIMATED COUNTERS
            // ============================================================
            const counters = document.querySelectorAll('.num[data-count]');
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const target = parseFloat(el.dataset.count);
                        const isFloat = target % 1 !== 0;
                        let current = 0;
                        const increment = target / 60;
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
                            if (el.dataset.count === '9.7') el.textContent = '9.7';
                        }, 25);
                        counterObserver.unobserve(el);
                    }
                });
            }, { threshold: .5 });
            counters.forEach(c => counterObserver.observe(c));

            // ============================================================
            //  KEYBOARD SHORTCUTS
            // ============================================================
            document.addEventListener('keydown', (e) => {
                if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const target = e.target;
                    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
                        themeBtn.click();
                        e.preventDefault();
                    }
                }
                if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const target = e.target;
                    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
                        document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
                        e.preventDefault();
                    }
                }
            });

            // ============================================================
            //  SKILL GROUP MOUSE RADAR
            // ============================================================
            document.querySelectorAll('.skill-group').forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    el.style.setProperty('--mx', x + '%');
                    el.style.setProperty('--my', y + '%');
                });
            });

            // ============================================================
            //  BUTTON MOUSE RADAR
            // ============================================================
            document.querySelectorAll('.btn').forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    el.style.setProperty('--mx', x + '%');
                    el.style.setProperty('--my', y + '%');
                });
            });

            console.log('%c Nandalal Patil — Cybersecurity Analyst ',
                'background: #0a0a0a; color: #5B93FF; font-size: 14px; padding: 8px 12px; border-radius: 6px; font-weight: bold;'
                );
            console.log('%cThanks for stopping by — let\'s connect: nandlal.patil2004@gmail.com', 'color: #9aa2b5; font-size: 12px;');

        })();
