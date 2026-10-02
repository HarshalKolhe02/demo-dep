
(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
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
    'Robotics Systems',
    'Embedded Devices',
    'Computer Vision Systems',
    'Multi-Agent Drones'
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
      title: 'Autonomous Multi-UAV Search and Rescue System',
      subtitle: 'Multi-agent coordination, spatial exploration, and target localization.',
      badges: [
        { label: 'Research', type: 'research' },
        { label: 'Jul 2025 - Jan 2026 ', type: 'date' }
      ],
      role: 'Team Captain',
      status: 'Active Research',
      impact: 'Detected 10 humans and simultaneously deployed 10 packages in 6.2 minutes, reducing mission time by 38% compared with a single-UAV system.',
      problem: 'In disaster areas, human rescue is bottlenecked by search times and hazardous environments. Single drones have limited battery and search area coverage, requiring a coordinated multi-agent system that functions without a single point of failure.',
      solution: 'Engineered a multi-UAV system where drones coordinate search in strips, and run on-board deep-learning models to detect survivors and deliver relief packages; while maintaining inter-drone communication using MAVLink messages.',
      challenges: 'Decentralized multi-UAV coordination under limited communication. Eliminated dependence on a ground station by implementing lightweight peer-to-peer MAVLink telemetry for sharing UAV state, mission progress, survivor locations, and workload updates, with event-based synchronization, heartbeats, and ACK-based retransmission',
      architecture: 'Decentralized swarm network: SIYI A8 Mini gimbaled RTSP camera streams directly into an edge inference node running TensorRT YOLOv8, synchronizing localized GPS telemetry across UAV peers via MAVSDK and ArduPilot.',
      archImage: 'assets/img/magentsys_archi.webp',
      archImageCaption: 'System Overview: Multi-UAV telemetry & vision pipeline',
      insights: 'Effective multi-UAV coordination requires reliable communication and adaptive workload management. Event-based telemetry and dynamic strip sharing allow UAVs to redistribute unfinished search areas and maintain efficient coverage throughout the mission.',
      highlights: [
        'Automated lawnmower search pattern navigation coordinated via MAVLink and ArduPilot.',
        'Fine-tuned YOLOv11n model delivering 90% human detection accuracy at 8 m altitude under variable outdoor conditions.',
        'RTSP video pipeline processing high-definition streams from a SIYI A8 Mini gimbaled sensor.',
        'Autonomous Multi-Level release mechanism delivering life-saving medical supplies directly to detected GPS coordinates.',
        'A Inter-UAV Communication pipeline to for load balancing and target sharing among drones.'
      ],
      tags: ['MAVLink', 'DroneKit', 'ArduPilot', 'YOLOv11n', 'OpenCV', 'RTSP Streaming', 'Python', 'C++'],
      links: [
        { label: 'GitHub Code', url: 'https://github.com/HarshalKolhe02/Multiagent_Disaster_Rescue_Drones_NIDAR', type: 'github' },
        //{ label: 'Research Preprint', url: '#publications', type: 'paper' },
        //{ label: 'Watch Demo Video', url: 'https://github.com/HarshalKolhe02/Multiagent_Disaster_Rescue_Drones_NIDAR', type: 'demo' }
      ]
    },
    'scan-spray': {
      title: 'Dual UAV Scan & Spray for Precision Agriculture',
      subtitle: 'Autonomous dual-UAV system for real-time crop monitoring, target geotagging, and precision spraying.',
      badges: [
        { label: 'Research', type: 'research' },
        { label: 'Computer Vision', type: 'tech' },
        { label: 'Embedded Systems', type: 'tech' },
        { label: 'Jan 2026 - Apr 2026', type: 'date' }
      ],
      role: 'Hardware & Systems Lead',
      status: 'Field-Tested',
      impact: 'Achieved 90–95% detection recall and refined target positioning from 1.6–2.4 m GPS-level error to 1–10 cm using vision-assisted centering.',
      problem: 'Conventional agricultural spraying treats large areas uniformly, leading to chemical wastage and limited ability to respond quickly to localized crop stress.',
      solution: 'Engineered a cooperative two-UAV system where a lightweight scanning drone performs onboard crop detection and photogrammetric geotagging, while a high-payload spraying drone autonomously receives targets and performs vision-assisted precision spraying.',
      challenges: 'Achieving reliable crop detection under changing sunlight and reducing meter-level GPS localization error; addressed using dual-region HSV masking, an ND filter, photogrammetric geotagging, and vision-based centering.',
      architecture: 'Cooperative dual-tier UAV network: Lightweight reconnaissance drone executes OpenCV HSV disease detection pipelines on a Raspberry Pi companion computer, relaying localized spray target coordinates over MAVLink telemetry to an ArduPilot heavy-lift quadrotor driving PWM-throttled high-pressure diaphragm spray nozzles.',
      archImage: 'assets/img/agri_system.webp',
      archImageCaption: 'Dual-UAV reconnaissance & targeted micro-spraying architecture',
      insights: 'Separating scanning from spraying enables continuous target detection and treatment, reducing idle hover time while vision-assisted centering converts meter-level positioning uncertainty into 1–10 cm spraying accuracy.',
      highlights: [
        'Real-time crop-stress detection using HSV segmentation, dual-region masking, and an ND filter, achieving 90–95% recall under field conditions.',
        'Designed and integrated dual UAV platforms for parallel scanning and targeted spraying across a 2-acre agricultural field.',
        'Designed custom PCB and Raspberry Pi controller driving dual high-pressure nozzles with PWM flow throttling.',
        'Implemented vision-assisted proportional control to center the spraying UAV over detected targets with 1–10 cm steady-state positioning error.'
      ],
      tags: ['Python', 'OpenCV', 'HSV Computer Vision', 'MAVLink', 'ArduPilot', 'Raspberry Pi 5', 'CubeOrange+', 'SIYI A8 Mini'],
      links: [
        { label: 'GitHub', url: 'https://github.com/IvLabs/Dual_UAV_Scan-and-Spray_for_Precision_Agriculture', type: 'github' }
        // { label: 'Flight Logs & Demo', url: 'https://github.com/HarshalKolhe02', type: 'demo' }
      ]
    },
    'gesture-quadcopter': {
      title: 'Gesture Controlled Quadcopter',
      subtitle: 'Autonomous flight control architecture and telemetry bridge translating pilot gestures into real-time quadcopter maneuvers.',
      badges: [
        { label: 'ArduPilot & SITL', type: 'code' },
        { label: 'Gazebo Simulation', type: 'tech' }
      ],
      role: 'UAV Flight Control & Robotics Developer',
      status: 'Simulation & Test Flight Verified',
      impact: 'Maintained sub-100ms command dispatch over MAVLink UDP with dual-stage flight safety interlocks preventing sudden aerial instability.',
      problem: 'Traditional drone control relies on manual RC transmitters or mobile apps, which can be unintuitive and inaccessible in hands-busy operational environments without dedicated pilot training.',
      solution: 'Developed an end-to-end vision-based flight control interface utilizing fine-tuned gesture inputs to dispatch autonomous MAVLink commands via ArduPilot, running across a multi-threaded telemetry architecture.',
      challenges: 'Eliminating false-positive triggers and erratic flight commands from transient hand movements; resolved by implementing a 15-frame rolling deque with a 70% consensus threshold and a 1.5s stabilization pause during gesture transitions (plus a 5s sustained hold for land commands).',
      architecture: 'Asynchronous flight control stack: Ground camera captures video frames evaluated by a fine-tuned gesture recognition thread, feeding a rolling deque stabilizer that dispatches thread-safe MAVLink commands over UDP to ArduPilot SITL and Gazebo Harmonic.',
      archImage: 'assets/img/gesture_archi.webp',
      archImageCaption: 'System Architecture',
      insights: 'Decoupling flight telemetry loops from input perception guarantees uninterrupted vehicle state monitoring, while introducing an inertial dampening pause between opposing flight vectors allows the autopilot to stabilize vehicle momentum without jerky oscillations.',
      highlights: [
        'Configured ArduPilot SITL coupled with Gazebo Harmonic to simulate multirotor aerodynamics, motor thrust, and flight dynamics.',
        'Multiplexed MAVProxy telemetry streams over concurrent UDP ports, synchronizing Mission Planner GCS and the Python flight execution controller.',
        'Implemented dual-threaded asynchronous architecture separating gesture evaluation from drone telemetry and MAVLink command dispatch.',
        'Engineered stability filters using a 15-frame deque (70% consensus) with 1.5s transition pause and 5s landing confirmation.',
        'Validated end-to-end autonomous navigation (Takeoff, Land, Forward, Backward, Left, Right) in ArduPilot SITL and Gazebo Harmonic simulation.'
      ],
      tags: ['ArduPilot', 'MAVLink', 'MAVProxy', 'Gazebo Harmonic', 'SITL Simulation', 'Autonomous Flight', 'Python'],
      links: [
        { label: 'GitHub', url: 'https://github.com/HarshalKolhe02/Gesture-Controlled-Quadcopter', type: 'github' }
      ]
    },
    'adaptive-nozzle': {
      title: 'Adaptive Dual-Nozzle Spraying System',
      subtitle: 'Adaptive dual-nozzle spraying system for precision agriculture, enabling dynamic switching between wide-area and targeted spraying based on plant clustering requirements.',
      badges: [
        { label: 'Embedded Systems', type: 'tech' },
        { label: 'Hardware & PCB', type: 'tech' },
        { label: 'Precision Agriculture', type: 'research' }
      ],
      role: 'Embedded Systems & Hardware Lead',
      status: 'Bench Tested & Flight Verified',
      impact: 'Enabled selective nozzle control for adaptive spraying while integrating pump control, power distribution, and valve switching into a compact custom PCB.',
      problem: 'Using a single nozzle for different plant sizes can lead to over-spraying for small plants or insufficient coverage for larger plants.',
      solution: 'Developed a Raspberry Pi–controlled dual-nozzle spraying system with a custom PCB, diaphragm pump, and independently controlled solenoid valves to dynamically select between precision and wide-area spraying.',
      challenges: 'Designing reliable switching between two spray paths while safely handling the pump and solenoid-valve loads; addressed through MOSFET-based switching, relay drivers, regulated power distribution, and custom PCB integration.',
      architecture: 'Hierarchical electro-fluidic architecture: 12V diaphragm pump draws fluid from the tank into a dual-manifold distribution line governed by independent solenoid valves. A custom controller PCB integrates MOSFET switching stages, optoisolated relay drivers, and an onboard 5V step-down regulator, controlled via Raspberry Pi lgpio library or ArduCopter RC channel triggers (Ch 5 pump, Ch 7 nozzle selector).',
      archImage: 'assets/img/nozzle_archi.webp',
      archImageCaption: 'System Architecture of the Adaptive Dual-Nozzle Spraying System',
      insights: 'Learned to integrate embedded control, power electronics, and fluid systems into a compact architecture, while using software-controlled valve sequencing to achieve adaptive spraying and prevent pump lock from pressure buildup.',
      highlights: [
        'Developed a Raspberry Pi-based spray controller using lgpio for pump and solenoid-valve control.',
        'Designed and fabricated a custom PCB integrating MOSFET switching, relay drivers, voltage regulation, and power distribution.',
        'Implemented fail-safe pressure relief logic in Python using the lgpio library to prevent pump stalls and hydraulic shock.',
        'Implemented a dual-path fluid system with a 12 V diaphragm pump and precision/wide-area spray nozzles.',
        'Added RC-based manual control, with separate channels for pump activation and nozzle selection.'
      ],
      tags: ['Raspberry Pi', 'Python', 'lgpio', 'PCB Design', 'MOSFET', 'Relay Control', 'Solenoid Valves', 'Pump Control', 'Embedded Systems', 'Precision Agriculture'],
      links: [
        { label: 'GitHub', url: 'https://github.com/HarshalKolhe02/Adaptive-Dual-Nozzle-Sprayer', type: 'github' }
      ]
    },
    'qr-checkin': {
      title: 'Real-Time QR Event Check-in System',
      subtitle: 'Sub-50ms synchronized admission verification and attendee management platform.',
      badges: [
        { label: 'Full-Stack', type: 'code' },
        { label: 'WebSockets', type: 'tech' },
        { label: '2023', type: 'date' }
      ],
      role: 'Full-Stack Developer',
      status: 'Deployed (Live Events)',
      impact: 'Verified 1,200+ event attendees across 6 concurrent scanners with zero ticket duplicate entries.',
      problem: 'High-volume college events encounter severe admission bottlenecks and ticket passback abuse when paper tickets or disconnected scanners are used.',
      solution: 'Developed a high-throughput WebSocket check-in platform featuring HMAC-signed dynamic QR codes and instantaneous bi-directional state synchronization.',
      challenges: 'Transient mobile network drops at gate entrance; solved with an offline client-side sync queue backed by IndexedDB with deterministic reconciliation.',
      architecture: 'Event-driven WebSocket client-server architecture: Node.js/Express server broadcasting real-time check-in events over Socket.IO to connected gate scanning clients, validating HMAC dynamic tokens and persisting attendance records in MongoDB with JWT role authorization.',
      archImage: 'assets/img/qr_checkin.webp',
      archImageCaption: 'Event Admission Architecture: Sub-50ms Socket.IO WebSocket synchronization & cryptographic QR verification',
      insights: 'Edge verification of cryptographically signed QR payloads reduces gate latency to under 30ms even under heavy network load.',
      highlights: [
        '7 RESTful API endpoints handling admission validation, attendee statuses, and credential issuance.',
        'Cryptographically secure UUID and dynamic QR code generation with automated SMTP ticket delivery.',
        'Live bidirectional state synchronization across 6 connected devices using Socket.IO WebSockets.',
        'Role-based access control (RBAC) with secure JWT tokens and MongoDB persistence.'
      ],
      tags: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'JWT', 'QR Generation', 'WebSockets'],
      links: [
        { label: 'GitHub Code', url: 'https://github.com/HarshalKolhe02', type: 'github' },
        { label: 'Live Demo', url: 'https://github.com/HarshalKolhe02', type: 'demo' }
      ]
    },
    'autograde': {
      title: 'AutoGrade — Intelligent Exam Evaluation System',
      subtitle: 'Multimodal OCR and semantic evaluation platform for handwritten examination grading.',
      badges: [
        { label: 'AI & Machine Learning', type: 'research' },
        { label: 'Document AI', type: 'tech' },
        { label: '2024', type: 'date' }
      ],
      role: 'ML & OCR Engineer',
      status: 'Benchmark Validated',
      impact: 'Evaluated 4,200+ student responses, reducing faculty grading turnaround time by 80%.',
      problem: 'Grading thousands of handwritten technical exam scripts is extraordinarily tedious, subject to subjective grader fatigue, and delays feedback to students for weeks.',
      solution: 'Engineered an optical-to-semantic evaluation system that deskews paper scans, segments question bounding boxes, and scores student answers against rubrics with LLM vision models.',
      challenges: 'Irregular handwriting, cursive slopes, and ink bleed-through; tackled using adaptive Otsu thresholding and an ensemble of PaddleOCR and Pixtral Large.',
      architecture: 'Multimodal Document AI pipeline: OpenCV image deskewing and adaptive line segmentation pipeline feeding segmented question crops into Pixtral Large multimodal LLM for semantic rubric grading, score generation, and automated feedback logging.',
      archImage: 'assets/img/autograde.webp',
      archImageCaption: 'Evaluation Pipeline: Multimodal OCR segmentation, rubric evaluation & Pixtral LLM scoring',
      insights: 'Prompting vision LLMs with structured step-by-step scoring criteria dramatically improves rubric alignment over direct score estimation.',
      highlights: [
        'Multimodal OCR pipeline combining Pixtral Large vision-language model, PaddleOCR, and EasyOCR.',
        'Automated handwriting skew correction, line segmentation, and question bounding-box detection.',
        'Evaluated 4,274 student responses against standardized rubrics with semantic keyword scoring.',
        'Decreased faculty grading turnaround time by 80% while providing audit trails.'
      ],
      tags: ['Pixtral Large', 'PaddleOCR', 'EasyOCR', 'Python', 'LLM', 'OCR', 'PyTorch'],
      links: [
        { label: 'GitHub Code', url: 'https://github.com/HarshalKolhe02', type: 'github' }
      ]
    }
  };

  // Compatibility aliases for legacy or alternate keys
  projectData['nav-assistant'] = projectData['gesture-quadcopter'];
  projectData['careflow'] = projectData['adaptive-nozzle'];
  projectData['gesture_quadcopter'] = projectData['gesture-quadcopter'];
  projectData['gesture-controlled-quadcopter'] = projectData['gesture-quadcopter'];
  projectData['adaptive_nozzle'] = projectData['adaptive-nozzle'];
  projectData['adaptive-dual-nozzle'] = projectData['adaptive-nozzle'];
  projectData['adaptive-dual-nozzle-sprayer'] = projectData['adaptive-nozzle'];

  const modal = $('#projModal');
  const modalClose = $('#projModalClose');
  const modalOverlay = $('#projModalOverlay');
  const modalBadges = $('#projModalBadges');
  const modalTitle = $('#projModalTitle');
  const modalSubtitle = $('#projModalSubtitle');
  const modalImpact = $('#projModalImpact');
  const modalImpactWrap = $('#projModalImpactWrap');
  const modalProblem = $('#projModalProblem');
  const modalSolution = $('#projModalSolution');
  const modalHighlights = $('#projModalHighlights');
  const modalChallenges = $('#projModalChallenges');
  const modalArchImgWrap = $('#projModalArchImgWrap');
  const modalArchImg = $('#projModalArchImg');
  const modalArchCaption = $('#projModalArchCaption');
  const modalInsights = $('#projModalInsights');
  const modalTags = $('#projModalTags');
  const modalActions = $('#projModalActions');

  const tabOverview = $('#tabOverview');
  const tabArch = $('#tabArch');
  const panelOverview = $('#panelOverview');
  const panelArch = $('#panelArch');

  function setModalTab(target) {
    if (!tabOverview || !tabArch || !panelOverview || !panelArch) return;
    if (target === 'arch') {
      tabArch.classList.add('active');
      tabArch.setAttribute('aria-selected', 'true');
      tabOverview.classList.remove('active');
      tabOverview.setAttribute('aria-selected', 'false');
      panelArch.classList.add('active');
      panelArch.hidden = false;
      panelOverview.classList.remove('active');
      panelOverview.hidden = true;
    } else {
      tabOverview.classList.add('active');
      tabOverview.setAttribute('aria-selected', 'true');
      tabArch.classList.remove('active');
      tabArch.setAttribute('aria-selected', 'false');
      panelOverview.classList.add('active');
      panelOverview.hidden = false;
      panelArch.classList.remove('active');
      panelArch.hidden = true;
    }
  }

  if (tabOverview) tabOverview.addEventListener('click', () => setModalTab('overview'));
  if (tabArch) tabArch.addEventListener('click', () => setModalTab('arch'));

  function openProjectModal(key) {
    if (!key) return;
    const data = projectData[key];
    if (!data) {
      console.warn(`[openProjectModal] Project data not found for key: "${key}"`);
      return;
    }
    if (!modal) return;

    setModalTab('overview');

    if (modalBadges) {
      modalBadges.innerHTML = (data.badges || [])
        .map(b => `<span class="proj-badge">${b.label}</span>`)
        .join('');
    }

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalSubtitle) modalSubtitle.textContent = data.subtitle || '';

    if (modalImpact) modalImpact.textContent = data.impact || '';
    if (modalImpactWrap) modalImpactWrap.style.display = data.impact ? 'block' : 'none';

    if (modalProblem) modalProblem.textContent = data.problem || '';
    if (modalSolution) modalSolution.textContent = data.solution || '';

    if (modalHighlights) {
      modalHighlights.innerHTML = (data.highlights || [])
        .map(h => `<li>${h}</li>`)
        .join('');
    }

    if (modalChallenges) modalChallenges.textContent = data.challenges || '';
    if (modalInsights) modalInsights.textContent = data.insights || '';

    if (modalArchImgWrap && modalArchImg) {
      if (data.archImage) {
        modalArchImg.src = data.archImage;
        modalArchImg.alt = data.archImageCaption || `${data.title} Architecture Diagram`;
        if (modalArchCaption) {
          if (data.archImageCaption) {
            modalArchCaption.textContent = data.archImageCaption;
            modalArchCaption.style.display = 'block';
          } else {
            modalArchCaption.style.display = 'none';
          }
        }
        modalArchImgWrap.style.display = 'block';
      } else {
        modalArchImgWrap.style.display = 'none';
        modalArchImg.src = '';
      }
    }

    if (modalTags) {
      modalTags.innerHTML = (data.tags || [])
        .map(t => `<span class="proj-card__tag">${t}</span>`)
        .join('');
    }

    if (modalActions) {
      modalActions.innerHTML = (data.links || [])
        .map(l => {
          let iconSvg = '';
          const lower = (l.label || '').toLowerCase();
          if (l.type === 'github' || lower.includes('github')) {
            iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
          } else if (l.type === 'paper' || lower.includes('publication') || lower.includes('preprint') || lower.includes('paper')) {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
          } else {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
          }
          return `
            <a class="proj-modal__btn" href="${l.url}" ${l.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
              ${iconSvg}
              <span>${l.label}</span>
            </a>
          `;
        }).join('');
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

  // Global event delegation fallback
  document.addEventListener('click', e => {
    const detailBtn = e.target.closest('.proj-card__detail-btn');
    if (detailBtn) {
      e.stopPropagation();
      const card = detailBtn.closest('.proj-card');
      const key = detailBtn.dataset.project || (card && card.dataset.project);
      if (key) openProjectModal(key);
      return;
    }

    const card = e.target.closest('.proj-card');
    if (card && !e.target.closest('a') && !e.target.closest('button')) {
      const key = card.dataset.project;
      if (key) openProjectModal(key);
    }
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
      window.location.href = `mailto:harshalkolhe03@gmail.com?subject=${subject}&body=${body}`;

      if (cfStatus) {
        cfStatus.textContent = 'Thank you! Your email client has been opened to send your message.';
        cfStatus.className = 'contact-form__status contact-form__status--success';
      }
      contactForm.reset();
    });
  }
})();
