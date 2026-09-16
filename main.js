// ─── NAVIGATION ─────────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => a.classList.remove('active'));

  const target = document.getElementById(pageId);
  if (target) target.classList.add('active');

  const navLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if (navLink) navLink.classList.add('active');

  document.querySelector('nav').classList.remove('nav-mobile-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hamburger
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('nav').classList.toggle('nav-mobile-open');
});

// All data-page links
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-page]');
  if (el && el.dataset.page) {
    e.preventDefault();
    showPage(el.dataset.page);
  }
});

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Contact form
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Message received. We\'ll get back to you.');
  e.target.reset();
});

// Start on home
showPage('home');

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

function attachReveal() {
  document.querySelectorAll('.reveal, .pillar-item, .stat').forEach(el => {
    revealObserver.observe(el);
  });
}

// Re-run reveal when pages switch
const origShowPage = showPage;
window.showPage = function(pageId) {
  origShowPage(pageId);
  setTimeout(attachReveal, 50);
};

attachReveal();

// ─── INTERACTIVE PILLAR CYCLE ─────────────────────────────────────────────────
const PILLAR_DATA = [
  {
    name: 'Educate',
    blurb: 'We break down the engineering, physics, and design behind themed rides, making the amusement industry accessible to everyone through events like CoasterVille and our Industry Inversion newsletter.'
  },
  {
    name: 'Inspire',
    blurb: 'We bring the industry to campus through guest speakers, facility tours, and behind-the-scenes access that show students exactly what a career in themed entertainment looks like.'
  },
  {
    name: 'Connect',
    blurb: 'We build real relationships between UofL students and amusement industry leaders. From LinkedIn connections to internship pipelines at parks and manufacturers around the world.'
  },
  {
    name: 'Innovate',
    blurb: 'We compete. Our team designs, builds, and operates a functional scale roller coaster at the national Ride Engineering Competition each spring: real engineering, real stakes, real results.'
  }
];

let activePillar = 0;
let pillarTimer = null;
let userHovering = false;

function setPillar(index, fromHover) {
  activePillar = index;

  // Update buttons
  document.querySelectorAll('.hero-pillar-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  // Swap blurb with fade
  const label = document.getElementById('pillar-blurb-label');
  const text  = document.getElementById('pillar-blurb-text');
  const inner = document.getElementById('pillar-blurb-inner');

  if (label && text && inner) {
    inner.style.animation = 'none';
    inner.offsetHeight; // reflow
    inner.style.animation = '';
    label.textContent = PILLAR_DATA[index].name;
    text.textContent  = PILLAR_DATA[index].blurb;
  }
}

function startPillarCycle() {
  clearInterval(pillarTimer);
  pillarTimer = setInterval(() => {
    if (!userHovering) {
      activePillar = (activePillar + 1) % PILLAR_DATA.length;
      setPillar(activePillar, false);
    }
  }, 3200);
}

function initPillars() {
  const btns = document.querySelectorAll('.hero-pillar-btn');
  if (!btns.length) return;

  // Set initial state
  setPillar(0);
  startPillarCycle();

  btns.forEach((btn, i) => {
    // Hover — pause cycle and show this pillar
    btn.addEventListener('mouseenter', () => {
      userHovering = true;
      setPillar(i, true);
    });

    // Leave — resume cycle from this pillar
    btn.addEventListener('mouseleave', () => {
      userHovering = false;
      activePillar = i;
      startPillarCycle();
    });

    // Click also works (good for mobile)
    btn.addEventListener('click', () => {
      setPillar(i, true);
      activePillar = i;
    });
  });
}

// Run on load and re-run whenever home page is shown
initPillars();

const _origShowPage = window.showPage || showPage;
window.showPage = function(pageId) {
  _origShowPage(pageId);
  if (pageId === 'home') {
    setTimeout(initPillars, 60);
  }
};
