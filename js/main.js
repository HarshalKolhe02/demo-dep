/* =================================================================
   Pavan Varma Pothuri - Portfolio interactions (job-focused edition)
   Vanilla JS · no dependencies
   ================================================================= */
(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Year ---------- */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero: reveal immediately ---------- */
  startHero();

  /* ---------- Scroll: nav, progress, active section, rail ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const sections = $$('main section[id]');
  const navLinkEls = $$('.nav__links a');
  const rail = $('#rail');
  const railLinks = rail ? $$('a', rail) : [];

  let docH = 0, offsets = [], lastIdx = -1;
  function measure() {
    docH = document.documentElement.scrollHeight - innerHeight;
    offsets = sections.map(s => ({ id: s.id, top: s.offsetTop }));
  }
  let scrollQueued = false;
  function onScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    nav && nav.classList.toggle('scrolled', y > 40);
    if (progress) progress.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
    let current = offsets.length ? offsets[0].id : '';
    for (const o of offsets) if (y >= o.top - innerHeight * 0.35) current = o.id;
    navLinkEls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    let idx = 0;
    railLinks.forEach((a, i) => { if (a.getAttribute('href') === '#' + current) idx = i; });
    railLinks.forEach((a, i) => { a.classList.toggle('is-active', i === idx); a.classList.toggle('visited', i < idx); });
    if (idx !== lastIdx) { lastIdx = idx; if (rail && railLinks[idx]) rail.style.setProperty('--flown', railLinks[idx].offsetTop + 'px'); }
  }
  addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('load', () => { measure(); onScroll(); });
  measure(); onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $('#navBurger');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  }
  navLinkEls.forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => {
    if (nav && nav.classList.contains('open') &&
        !e.target.closest('.nav__links') && !e.target.closest('.nav__burger')) {
      setMenu(false);
    }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Theme toggle ---------- */
  const toggle = $('#themeToggle');
  const stored = localStorage.getItem('theme-v2');
  if (stored === 'light' || stored === 'dark') document.documentElement.setAttribute('data-theme', stored);
  toggle && toggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem('theme-v2', cur);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', cur === 'light' ? '#F6F6F9' : '#0D0E13');
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = el.style.transitionDelay || (i % 5) * 0.06 + 's';
    io.observe(el);
  });

  /* Skill bars removed — Technical Arsenal uses domain cards instead */

  /* ---------- Stat counters ---------- */
  const counted = new WeakSet();
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting || counted.has(en.target)) return;
      counted.add(en.target);
      const el = en.target;
      const raw = el.dataset.count;
      if (!raw) return;
      const target = parseFloat(raw);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1400; const t0 = performance.now();
      (function run(now) {
        const k = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = prefix + (target * eased).toFixed(dec) + (k === 1 ? suffix : '');
        if (k < 1) requestAnimationFrame(run);
        else el.textContent = prefix + target.toFixed(dec) + suffix;
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Back to top ---------- */
  const toTop = $('#toTop');
  toTop && toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));

  /* ---------- Hero title reveal ---------- */
  function startHero() {
    const title = $('.hero__title');
    title && title.classList.add('in');
    $$('.hero .reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- Typing animation ---------- */
  const typeWords = [
    'UAV Systems Engineer',
    'Robotics Developer',
    'ML & CV Engineer',
    'Embedded Systems Dev',
    'Full-Stack Developer'
  ];
  let twi = 0, tci = 0, typing = true;

  function runTyping() {
    const typeEl = $('#typeText');
    if (!typeEl) return;
    if (prefersReduced) { typeEl.textContent = typeWords[0]; return; }

    function tick() {
      const word = typeWords[twi];
      if (typing) {
        tci++;
        typeEl.textContent = word.slice(0, tci);
        if (tci === word.length) {
          typing = false;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 75 + Math.random() * 35);
      } else {
        tci--;
        typeEl.textContent = word.slice(0, tci);
        if (tci === 0) {
          typing = true;
          twi = (twi + 1) % typeWords.length;
          setTimeout(tick, 320);
          return;
        }
        setTimeout(tick, 42 + Math.random() * 20);
      }
    }
    setTimeout(tick, 900);
  }
  runTyping();

  /* =================================================================
     Drone - a single quad-rotor that follows the cursor across the hero
     ================================================================= */
  const dCanvas = $('#droneCanvas');
  if (dCanvas && !prefersReduced) {
    const dctx = dCanvas.getContext('2d');
    let W, H, DPR;

    function accent() {
      const v = getComputedStyle(dCanvas).getPropertyValue('--accent').trim().replace('#', '');
      const r = parseInt(v.substring(0, 2), 16), g = parseInt(v.substring(2, 4), 16), b = parseInt(v.substring(4, 6), 16);
      return [r || 169, g || 164, b || 255];
    }
    let RGB = accent();
    new MutationObserver(() => { RGB = accent(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    function size() {
      DPR = Math.min(devicePixelRatio || 1, 2);
      W = dCanvas.clientWidth; H = dCanvas.clientHeight;
      dCanvas.width = W * DPR; dCanvas.height = H * DPR;
      dctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    addEventListener('resize', size);

    const drone = { x: W * 0.5, y: H * 0.45, vx: 0, vy: 0, tilt: 0, bob: 0 };
    const target = { x: W * 0.5, y: H * 0.45, active: false };

    function aim(clientX, clientY) {
      const r = dCanvas.getBoundingClientRect();
      const mx = clientX - r.left, my = clientY - r.top;
      if (mx >= 0 && my >= 0 && mx <= W && my <= H) { target.x = mx; target.y = my; target.active = true; }
      else { target.active = false; }
    }
    addEventListener('mousemove', e => aim(e.clientX, e.clientY));
    addEventListener('mouseleave', () => { target.active = false; });
    addEventListener('touchmove', e => {
      const t = e.touches[0];
      if (t) aim(t.clientX, t.clientY);
    }, { passive: true });
    addEventListener('touchend', () => { target.active = false; }, { passive: true });

    let roamT = 0, rx = drone.x, ry = drone.y, raf2;

    function frame() {
      if (!target.active) {
        roamT += 0.0026;
        rx = W * (0.5 + 0.34 * Math.cos(roamT * 0.9));
        ry = H * (0.45 + 0.26 * Math.sin(roamT * 1.3));
      }
      const tx = target.active ? target.x : rx;
      const ty = target.active ? target.y : ry;

      drone.vx = (drone.vx + (tx - drone.x) * 0.0034) * 0.93;
      drone.vy = (drone.vy + (ty - drone.y) * 0.0034) * 0.93;
      const sp = Math.hypot(drone.vx, drone.vy), MAX = 3.6;
      if (sp > MAX) { drone.vx = drone.vx / sp * MAX; drone.vy = drone.vy / sp * MAX; }
      drone.x += drone.vx; drone.y += drone.vy;
      drone.tilt += ((-drone.vx * 0.05) - drone.tilt) * 0.12;
      drone.bob += 0.05;
      const cy = drone.y + Math.sin(drone.bob) * 1.6;

      dctx.clearRect(0, 0, W, H);
      const [r, g, b] = RGB;
      drawDrone(drone.x, cy, drone.tilt, r, g, b);
      raf2 = requestAnimationFrame(frame);
    }

    function roundRect(c, x, y, w, h, rr) {
      c.beginPath(); c.moveTo(x + rr, y);
      c.arcTo(x + w, y, x + w, y + h, rr); c.arcTo(x + w, y + h, x, y + h, rr);
      c.arcTo(x, y + h, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath();
    }
    function drawDrone(x, y, tilt, r, g, b) {
      const A = (a) => `rgba(${r},${g},${b},${a})`;
      const spin = performance.now() * 0.045, S = 1.7;
      const mx = 25 * S, my = 19 * S, propR = 14 * S;
      const motors = [[-mx, -my], [mx, -my], [-mx, my], [mx, my]];
      dctx.save();
      dctx.translate(x, y); dctx.rotate(tilt);
      dctx.lineCap = 'round'; dctx.lineJoin = 'round';

      dctx.strokeStyle = A(0.5); dctx.lineWidth = 3.4 * S;
      motors.forEach(([cx, cy2]) => { dctx.beginPath(); dctx.moveTo(0, 0); dctx.lineTo(cx, cy2); dctx.stroke(); });

      motors.forEach(([cx, cy2], i) => {
        const dir = i % 2 ? 1 : -1;
        dctx.save(); dctx.translate(cx, cy2);
        dctx.fillStyle = A(0.06); dctx.beginPath(); dctx.arc(0, 0, propR, 0, Math.PI * 2); dctx.fill();
        dctx.strokeStyle = A(0.16); dctx.lineWidth = 1; dctx.beginPath(); dctx.arc(0, 0, propR, 0, Math.PI * 2); dctx.stroke();
        dctx.save(); dctx.rotate(spin * dir); dctx.fillStyle = A(0.42);
        dctx.beginPath(); dctx.ellipse(0, 0, propR, 2.4 * S, 0, 0, Math.PI * 2); dctx.fill();
        dctx.beginPath(); dctx.ellipse(0, 0, 2.4 * S, propR, 0, 0, Math.PI * 2); dctx.fill();
        dctx.restore();
        dctx.fillStyle = A(0.92); dctx.beginPath(); dctx.arc(0, 0, 3.4 * S, 0, Math.PI * 2); dctx.fill();
        dctx.restore();
      });

      dctx.fillStyle = A(0.22); dctx.strokeStyle = A(0.95); dctx.lineWidth = 2.2 * S;
      roundRect(dctx, -11 * S, -8 * S, 22 * S, 16 * S, 5 * S); dctx.fill(); dctx.stroke();
      dctx.fillStyle = A(0.4);
      roundRect(dctx, -7 * S, -5.5 * S, 14 * S, 11 * S, 3 * S); dctx.fill();
      dctx.fillStyle = A(1); dctx.beginPath(); dctx.arc(0, 9.5 * S, 3.2 * S, 0, Math.PI * 2); dctx.fill();
      dctx.fillStyle = A(0.35); dctx.beginPath(); dctx.arc(0, 9.5 * S, 1.5 * S, 0, Math.PI * 2); dctx.fill();
      dctx.restore();
    }

    frame();

    const heroD = $('#hero');
    if (heroD) new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!raf2) frame(); }
      else { cancelAnimationFrame(raf2); raf2 = null; }
    }, { threshold: 0 }).observe(heroD);
  }

  /* =================================================================
     Project Popup Modal
     ================================================================= */
  const projectData = {
    'disaster-drones': {
      title: 'Multiagent Hybrid Disaster Rescue Drones',
      category: 'UAV & Robotics · Autonomous Systems',
      desc: 'A cooperative multi-drone system engineered for post-disaster search, victim detection, and precision emergency aid delivery in challenging environments. The system integrates low-latency video transmission directly to edge inference engines for immediate situational awareness.',
      highlights: [
        'Automated lawnmower search pattern navigation coordinated via MAVSDK and ArduPilot flight stack.',
        'Fine-tuned YOLOv8 model delivering 90% human detection accuracy at 8 m altitude under variable outdoor conditions.',
        'RTSP video pipeline processing high-definition streams from a SIYI A8 Mini gimbaled sensor.',
        'Autonomous release mechanism delivering life-saving medical supplies directly to detected GPS coordinates.'
      ],
      tags: ['YOLOv8', 'OpenCV', 'MAVLink', 'ArduPilot', 'Python', 'MAVSDK', 'Autonomous Flight'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' },
        { label: 'View Publication', url: '#publications' }
      ]
    },
    'scan-spray': {
      title: 'Dual UAV Scan & Spray — Precision Agriculture',
      category: 'UAV & Robotics · Agricultural Automation',
      desc: 'An autonomous dual-drone ecosystem engineered to optimize crop disease detection and micro-targeted chemical spraying, minimizing chemical waste while safeguarding crop yields.',
      highlights: [
        'Real-time crop disease detection using HSV segmentation and dual-mask thresholding (70% accuracy at 6 m altitude).',
        'Fabricated custom carbon-fiber quadrotor frame engineered to carry 10 kg fluid payload with 25 cm spraying accuracy.',
        'Designed custom PCB and Raspberry Pi controller driving dual high-pressure nozzles with PWM flow throttling.',
        'Rigorously tested under variable outdoor solar conditions and gusty wind profiles.'
      ],
      tags: ['OpenCV', 'Raspberry Pi', 'PCB Design', 'UAV Fabrication', 'C++', 'Python', 'Precision Ag'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' }
      ]
    },
    'nav-assistant': {
      title: 'Context Aware Navigation Assistant',
      category: 'Computer Vision & Robotics · Perception',
      desc: 'End-to-end perception and dynamic reasoning engine developed for real-time robotic navigation in high-density urban environments with moving obstacles.',
      highlights: [
        'YOLOv8 + OpenCV perception pipeline detecting vehicles, pedestrians, and traffic signals (75% accuracy, 90% precision).',
        'Custom spatial reasoning engine calculating object velocity vectors and time-to-collision.',
        'Dynamic risk assessment module issuing instant navigational directives: stop, proceed, or safely turn.',
        'Operates in real-time under low light, heavy rainfall, and partial lens occlusions.'
      ],
      tags: ['YOLOv8', 'OpenCV', 'Python', 'Spatial Reasoning', 'Risk Assessment', 'Robotics'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' }
      ]
    },
    'careflow': {
      title: 'CareFlow — Clinic Management System',
      category: 'Backend & DevOps · Healthcare Platform',
      desc: 'A production-grade enterprise clinic management solution built with modern API architecture and relational data integrity to streamline clinic workflows.',
      highlights: [
        '38 REST API endpoints built with FastAPI across 5 decoupled modules (patients, doctors, appointments, billing, analytics).',
        '11-table Oracle SQL database schema equipped with 3 automated PL/SQL triggers for audit logging and fee computation.',
        '4 analytical database views providing administrators with instantaneous revenue and workload insights.',
        'Containerized with Docker and tested with automated pytest integration suites.'
      ],
      tags: ['FastAPI', 'Oracle SQL', 'PL/SQL', 'Docker', 'Python', 'REST API', 'Microservices'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' }
      ]
    },
    'qr-checkin': {
      title: 'Real-Time QR Event Check-in System',
      category: 'Full-Stack Web · Real-Time Systems',
      desc: 'High-throughput event admission and attendee management platform featuring instantaneous sub-50ms synchronization across concurrent check-in stations.',
      highlights: [
        '7 RESTful API endpoints handling admission validation, attendee statuses, and credential issuance.',
        'Cryptographically secure UUID and dynamic QR code generation with automated SMTP ticket delivery.',
        'Live bidirectional state synchronization across 6 connected devices using Socket.IO WebSockets.',
        'Role-based access control (RBAC) with secure JWT tokens and MongoDB persistence.'
      ],
      tags: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'JWT', 'QR Generation', 'WebSockets'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' }
      ]
    },
    'autograde': {
      title: 'AutoGrade — Intelligent Exam Evaluation System',
      category: 'Machine Learning · Document AI',
      desc: 'Automated optical and semantic grading system developed to ingest scanned handwritten examination sheets, transcribe responses, and produce step-by-step scoring.',
      highlights: [
        'Multimodal OCR pipeline combining Pixtral Large vision-language model, PaddleOCR, and EasyOCR.',
        'Automated handwriting skew correction, line segmentation, and question bounding-box detection.',
        'Evaluated 4,274 student responses against standardized rubrics with semantic keyword scoring.',
        'Decreased faculty grading turnaround time by 80% while providing audit trails.'
      ],
      tags: ['Pixtral Large', 'PaddleOCR', 'EasyOCR', 'Python', 'LLM', 'OCR', 'PyTorch'],
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/HarshalKolhe02' }
      ]
    }
  };

  const modal = $('#projModal');
  const modalClose = $('#projModalClose');
  const modalOverlay = $('#projModalOverlay');
  const modalCategory = $('#projModalCategory');
  const modalTitle = $('#projModalTitle');
  const modalDesc = $('#projModalDesc');
  const modalHighlights = $('#projModalHighlights');
  const modalTags = $('#projModalTags');
  const modalActions = $('#projModalActions');

  function openProjectModal(key) {
    const data = projectData[key];
    if (!data || !modal) return;

    if (modalCategory) modalCategory.textContent = data.category;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;

    if (modalHighlights) {
      modalHighlights.innerHTML = data.highlights
        .map(h => `<li>${h}</li>`)
        .join('');
    }

    if (modalTags) {
      modalTags.innerHTML = data.tags
        .map(t => `<span class="proj-card__tag">${t}</span>`)
        .join('');
    }

    if (modalActions) {
      modalActions.innerHTML = data.links
        .map(l => `
          <a href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
            ${l.label} &rarr;
          </a>
        `).join('');
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeProjectModal);
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });

  // Attach card listeners
  $$('.proj-card').forEach(card => {
    const key = card.dataset.project;
    if (!key) return;

    // Click on detail button
    const btn = card.querySelector('.proj-card__detail-btn');
    if (btn) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openProjectModal(key);
      });
    }

    // Click on card itself (unless clicking an <a> link)
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openProjectModal(key);
    });
  });

  /* =================================================================
     Contact Form Handling
     ================================================================= */
  const contactForm = $('#contactForm');
  const cfStatus = $('#cfStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const message = (fd.get('message') || '').trim();

      if (!name || !email || !message) {
        if (cfStatus) {
          cfStatus.textContent = 'Please fill out all fields.';
          cfStatus.className = 'contact-form__status contact-form__status--error';
        }
        return;
      }

      const subject = encodeURIComponent(`Portfolio Message from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:harshalkolhe04@gmail.com?subject=${subject}&body=${body}`;

      if (cfStatus) {
        cfStatus.textContent = 'Thank you! Your email client has been opened to send your message.';
        cfStatus.className = 'contact-form__status contact-form__status--success';
      }
      contactForm.reset();
    });
  }
})();
