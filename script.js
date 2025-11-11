// script.js — cleaned and simplified

// THEME TOGGLE: toggle a "light-mode" class so the default (dark) remains if no class is present
const toggle = document.getElementById('mode-toggle');
if (toggle) {
  toggle.addEventListener('click', () => document.body.classList.toggle('light-mode'));
}

// Smooth scrolling (single implementation)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Parallax effect for intro (guarded)
const intro = document.querySelector('.intro');
if (intro) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    intro.style.transform = `translateY(${scrolled * 0.5}px)`;
    intro.style.opacity = Math.max(0, 1 - scrolled / 500);
  }, { passive: true });
}

// 3D particle background (creates canvas if missing) - lightweight
try {
  if (typeof THREE !== 'undefined') {
    let bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) {
      bgCanvas = document.createElement('canvas');
      bgCanvas.id = 'bg-canvas';
      document.body.appendChild(bgCanvas);
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);
    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    const particlesCount = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    for (let i=0;i<particlesCount*3;i++) positions[i] = (Math.random()-0.5)*20;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
    const material = new THREE.PointsMaterial({ color: 0xc08e7c, size: 0.08 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    function animate() {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0008;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }
} catch (e) {
  console.warn('Particle background init failed', e);
}

// Background video playback fallback handler
const bgVideo = document.getElementById('bg-video');
if (bgVideo) {
  bgVideo.addEventListener('error', (e) => console.error('BG VIDEO error', e));
  // Try to autoplay; if blocked, defer to user gesture
  const tryPlay = () => bgVideo.play().catch(() => {
    const startOnGesture = () => { bgVideo.play().catch(()=>{}); window.removeEventListener('click', startOnGesture); window.removeEventListener('touchstart', startOnGesture); };
    window.addEventListener('click', startOnGesture, { once: true });
    window.addEventListener('touchstart', startOnGesture, { once: true });
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') tryPlay();
  else document.addEventListener('DOMContentLoaded', tryPlay);
}

// Contact form handler (keeps your formspree integration)
const contactForm = document.getElementById('contact-form');
const submitButton = document.getElementById('submit-button');
if (contactForm && submitButton) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // If no action is configured (local/test), simulate success to avoid network errors
    if (!this.action || this.action.trim() === '') {
      setTimeout(() => {
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        this.reset();
        setTimeout(() => { submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; }, 1800);
      }, 800);
      return;
    }

    try {
      const response = await fetch(this.action, { method: 'POST', body: new FormData(this), headers: { 'Accept': 'application/json' } });
      if (response.ok) {
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        this.reset();
        setTimeout(() => { submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; }, 2500);
      } else throw new Error('Failed to send');
    } catch (err) {
      submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
      setTimeout(() => { submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; }, 2500);
    }
  });
}

