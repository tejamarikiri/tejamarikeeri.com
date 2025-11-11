// penguin.js (clean, safe, single fish-cursor)
// Loads after three.min.js and after DOM elements exist (index.html includes it after body elements).

document.addEventListener('DOMContentLoaded', () => {
  const log = (...a) => console.log('[PENGUIN]', ...a);
  const err = (...a) => console.error('[PENGUIN]', ...a);

  // DOM refs (guarded)
  const canvas = document.getElementById('penguin-canvas');
  const panel = document.getElementById('penguin-panel');
  const openBtn = document.getElementById('penguin-open');
  const closeBtn = document.getElementById('penguin-close');
  const inputEl = document.getElementById('penguin-input');
  const sendBtn = document.getElementById('penguin-send');
  const voiceBtn = document.getElementById('penguin-voice');
  const messages = document.getElementById('penguin-messages');
  const fallbackImg = document.getElementById('penguin-fallback');
  const fishContainer = document.getElementById('fish-cursor-container');

  if (!canvas) { err('Missing canvas#penguin-canvas'); return; }

  // Resume data
  const RESUME = {
    name: "Markeeri Teja",
    title: "Java Developer | Data Science & Web Development Enthusiast",
    contact: { email: "tejamarikiri@gmail.com", phone: "+91-9392586419", github: "https://github.com/tejamarikiri", linkedin: "https://www.linkedin.com/in/markeeri-teja-ba1870273" },
    education: { degree: "B.Tech in Computer Science and Engineering (Data Science)", school: "Sri Venkateswara College Of Engineering and Technology, Chittoor", years: "2021 - 2025", cgpa: "8.72" },
    internships: [
      { title: "Data Science and Machine Learning", company: "Upskills Online", dates: "15 June 2023 - 30 July 2023", summary: "Data collection, cleaning, model selection, deployment (Python, SQL)." },
      { title: "Python Internship", company: "APSCHE-SlashMark Online", dates: "13 May 2024 - 6 July 2024", summary: "OOP concepts, MySQL fundamentals." }
    ],
    projects: [
      { title: "AI Voice Detection System", summary: "Detects AI-generated voice scams and flags suspicious calls.", tech: ["python", "ml", "APIs"], github: "https://github.com/tejamarikiri/voice-recognization" },
      { title: "Employee Management System", summary: "Java Servlets + MySQL CRUD with JSP frontend", tech: ["Java", "MySQL", "JSP"] }
    ],
    skills: ["Java", "MySQL", "JavaScript", "React", "HTML", "CSS", "Problem Solving"],
    experience: [{ title: "Smart India Hackathon - Finalist (Dec 2023)", details: "IPv4/IPv6 vulnerability analysis." }]
  };

  // UI helpers
  function pushMsg(sender, text) {
    if (!messages) return;
    const d = document.createElement('div');
    d.className = `peng-msg ${sender}`;
    d.innerHTML = `<div class="peng-msg-text">${text}</div>`;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
  }

  // female voice heuristic
  function speakPrefer(text) {
    if (!('speechSynthesis' in window)) return;
    const speakNow = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleKeywords = ['samantha','zira','amelia','victoria','paulina','google','alloy'];
      let preferred = voices.find(v => femaleKeywords.some(k => v.name && v.name.toLowerCase().includes(k)));
      if (!preferred) preferred = voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];
      const u = new SpeechSynthesisUtterance(text);
      if (preferred) u.voice = preferred;
      u.pitch = 1.15;
      u.rate = 1;
      try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch (e) { err('Speech fail', e); }
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakNow;
    } else speakNow();
  }

  // simple QA
  function simpleAnswer(qRaw) {
    if (!qRaw) return null;
    const q = qRaw.toLowerCase();
    if (q.includes('intern')) return RESUME.internships.map(i => `${i.title} at ${i.company} (${i.dates}) — ${i.summary}`).join(' / ');
    if (q.includes('project')) return RESUME.projects.map(p => `${p.title}: ${p.summary} (tech: ${p.tech.join(', ')})${p.github ? ' — ' + p.github : ''}`).join(' || ');
    if (q.includes('skill')) return `Skills: ${RESUME.skills.join(', ')}`;
    if (q.includes('education') || q.includes('degree') || q.includes('cgpa')) {
      const e = RESUME.education;
      return `${RESUME.name} is pursuing ${e.degree} at ${e.school} (${e.years}) with CGPA ${e.cgpa}.`;
    }
    if (q.includes('contact') || q.includes('email') || q.includes('phone')) {
      const c = RESUME.contact || {};
      return `Contact: ${c.email || '—'}, phone ${c.phone || '—'}. GitHub: ${c.github || '—'}.`;
    }
    if (q.match(/about (me|yourself)|who are you/)) {
      return `Hello, I'm ${RESUME.name}, a ${RESUME.title}. Projects: ${RESUME.projects.map(p => p.title).join(', ')}.`;
    }

    // fallback token search
    const tokens = q.split(/\W+/).filter(Boolean);
    if (!tokens.length) return null;
    const corpus = [];
    RESUME.projects.forEach(p => corpus.push({ type: 'project', txt: (p.title + ' ' + p.summary + ' ' + p.tech.join(' ')).toLowerCase(), doc: p }));
    RESUME.internships.forEach(i => corpus.push({ type: 'intern', txt: (i.title + ' ' + i.company + ' ' + (i.summary||'')).toLowerCase(), doc: i }));
    if (RESUME.education) corpus.push({ type: 'education', txt: (RESUME.education.degree + ' ' + RESUME.education.school).toLowerCase(), doc: RESUME.education });

    let best = null, bestScore = 0;
    corpus.forEach(item => {
      let score = 0;
      tokens.forEach(t => { if (item.txt.includes(t)) score++; });
      if (score > bestScore) { bestScore = score; best = item; }
    });

    if (best && bestScore > 0) {
      if (best.type === 'project') {
        const p = best.doc;
        return `Project ${p.title}: ${p.summary}. Tech: ${p.tech.join(', ')}${p.github ? ' — ' + p.github : ''}`;
      }
      if (best.type === 'intern') {
        const i = best.doc;
        return `Internship ${i.title} at ${i.company} (${i.dates}): ${i.summary}`;
      }
      if (best.type === 'education') {
        const e = best.doc;
        return `${RESUME.name}'s ${e.degree} at ${e.school} (${e.years}), CGPA ${e.cgpa}.`;
      }
    }
    return `Hi, I'm ${RESUME.name}. Ask about projects, internships, skills or education.`;
  }

  // handle user query
  function handleQuery(q) {
    if (!q) return;
    pushMsg('user', q);
    const reply = simpleAnswer(q) || "Sorry, I couldn't find that. Try asking about projects, internships, or skills.";
    setTimeout(() => { pushMsg('peng', reply); speakPrefer(reply); }, 200);
  }

  // wire UI events
  if (sendBtn) sendBtn.addEventListener('click', () => {
    const q = inputEl ? inputEl.value.trim() : '';
    if (!q) return;
    if (inputEl) inputEl.value = '';
    handleQuery(q);
  });
  if (inputEl) inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sendBtn && sendBtn.click(); } });

  // SpeechRecognition (guarded)
  let recognition = null;
  if (window.SpeechRecognition || window.webkitSpeechRecognition) {
    try {
      const S = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new S();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = e => {
        const t = e.results[0][0].transcript;
        if (inputEl) inputEl.value = t;
        handleQuery(t);
      };
      recognition.onstart = () => voiceBtn && voiceBtn.classList.add('listening');
      recognition.onend = () => voiceBtn && voiceBtn.classList.remove('listening');
      if (voiceBtn) voiceBtn.addEventListener('click', () => { try { recognition.start(); } catch (e) { err(e); } });
    } catch (e) { log('SpeechRecognition not available', e); }
  } else {
    if (voiceBtn) voiceBtn.addEventListener('click', () => { speakPrefer('Voice recognition not supported. Please type.'); });
  }

  if (openBtn) openBtn.addEventListener('click', () => {
    panel && panel.classList.remove('hidden');
    const greet = `Hi — I'm Pengo. Ask me about your projects, internships or skills.`;
    pushMsg('peng', greet);
    speakPrefer(greet);
  });
  if (closeBtn) closeBtn.addEventListener('click', () => panel && panel.classList.add('hidden'));

  // section-aware greetings
  let currentSection = 'home';
  const sections = Array.from(document.querySelectorAll('main section'));
  if (sections.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          currentSection = en.target.id || currentSection;
          const msg = `Viewing ${currentSection}.`;
          pushMsg('peng', msg);
          speakPrefer(msg);
        }
      });
    }, { threshold: 0.6 });
    sections.forEach(s => io.observe(s));
  }

  // Three.js penguin (lightweight textured plane)
  if (typeof THREE === 'undefined') {
    err('Three.js missing — penguin 3D disabled');
    if (fallbackImg) fallbackImg.style.display = 'block';
  } else {
    let renderer, scene, camera, penguinMesh, clock;
    const assetPath = 'assets/penguin.png';
    function initThree() {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const size = Math.min(window.innerWidth * 0.18, 220);
      renderer.setSize(size, size);
      renderer.setClearColor(0x000000, 0);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, 3.2);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5,5,5); scene.add(dir);

      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('');
      loader.load(assetPath,
        tex => {
          tex.encoding = THREE.sRGBEncoding;
          const geo = new THREE.PlaneGeometry(1.6, 1.6, 36, 36);
          const pos = geo.attributes.position;
          for (let i=0;i<pos.count;i++){
            const x = pos.getX(i), y = pos.getY(i);
            const r = Math.sqrt(x*x + y*y);
            const z = Math.exp(- (r*r) * 2.2) * 0.06 * (Math.random()*0.6 + 0.7);
            pos.setZ(i, z);
          }
          geo.computeVertexNormals();
          const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.05 });
          penguinMesh = new THREE.Mesh(geo, mat);
          scene.add(penguinMesh);
          fallbackImg && (fallbackImg.style.display = 'none');
          log('Penguin loaded');
        },
        undefined,
        e => { err('Penguin texture failed', e); fallbackImg && (fallbackImg.style.display = 'block'); canvas.style.display = 'none'; }
      );

      clock = new THREE.Clock();
      animate();
      window.addEventListener('resize', onResize);
    }

    let targetOffsetX = 0;
    function animate() {
      requestAnimationFrame(animate);
      const t = clock ? clock.getElapsedTime() : performance.now()*0.001;
      if (penguinMesh) {
        penguinMesh.rotation.y = Math.sin(t * 0.6) * 0.16 + (targetOffsetX * 0.05);
        penguinMesh.position.y = Math.sin(t * 1.2) * 0.11 + 0.05;
        penguinMesh.position.x += (targetOffsetX - penguinMesh.position.x) * 0.08;
      }
      renderer && renderer.render(scene, camera);
    }
    function onResize() {
      if (!renderer) return;
      const size = Math.min(window.innerWidth * 0.18, 220);
      renderer.setSize(size, size);
      camera.aspect = 1; camera.updateProjectionMatrix();
    }

    canvas.addEventListener('click', () => {
      panel && panel.classList.remove('hidden');
      const greet = `You're on ${currentSection || 'home'}. Ask me about your ${currentSection}.`;
      pushMsg('peng', greet);
      speakPrefer(greet);
    });
    canvas.addEventListener('mouseenter', () => canvas.style.transform = 'scale(1.03)');
    canvas.addEventListener('mouseleave', () => canvas.style.transform = 'scale(1)');

    initThree();
  }

  // fish-cursor (single implementation)
  (function initFishCursor() {
    if (!fishContainer) { log('No fish container — skipping fish cursor'); return; }
    const fishSVGs = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><path fill="%23ff9f9f" d="M52 20c0 0-5-9-17-9s-17 9-17 9 6 9 17 9 17-9 17-9z"/><path fill="%23ff6b6b" d="M11 15c0 0 6 1 6 5s-6 5-6 5l-6-5 6-5z"/><circle cx="43" cy="16" r="2" fill="%23000"/></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><path fill="%239fe7ff" d="M50 20c0 0-5-8-15-8s-15 8-15 8 5 8 15 8 15-8 15-8z"/><path fill="%2380d4ff" d="M12 15c0 0 6 1 6 5s-6 5-6 5l-6-5 6-5z"/><circle cx="39" cy="16" r="2" fill="%23000"/></svg>'
    ];
    const N = 8;
    const fishes = [];
    for (let i=0;i<N;i++){
      const el = document.createElement('div');
      el.className = 'fish';
      const img = document.createElement('img');
      img.src = fishSVGs[i % fishSVGs.length];
      el.appendChild(img);
      fishContainer.appendChild(el);
      fishes.push({ el, x: window.innerWidth/2, y: window.innerHeight/2, speed: 0.12 + Math.random() * 0.25 });
    }
    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

    function loop() {
      for (let i=0;i<fishes.length;i++){
        const f = fishes[i];
        const targetX = mouseX + Math.sin((i + performance.now()/600) * 0.9) * 40 + (i * 12 - fishes.length*6);
        const targetY = mouseY + Math.cos((i + performance.now()/500) * 0.7) * 30 + (i * 6 - fishes.length*3);
        f.x += (targetX - f.x) * (0.08 + f.speed*0.02);
        f.y += (targetY - f.y) * (0.08 + f.speed*0.02);
        const dx = targetX - f.x, dy = targetY - f.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        f.el.style.transform = `translate(${f.x - 18}px, ${f.y - 12}px) rotate(${angle}deg)`;
        f.el.style.opacity = 0.95 - i*0.06;
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();

  // initial greeting
  setTimeout(() => { pushMsg('peng', `Hi — I'm Pengo. Ask me about projects, internships or skills.`); speakPrefer(`Hi! I'm Pengo.`); }, 900);

  log('penguin.js initialized');
});
