// ─── MOBILE NAV ───────────────────────────────────────────────────────────────
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('nav').classList.toggle('nav-mobile-open');
});

// Close mobile nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('nav').classList.remove('nav-mobile-open');
  });
});

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
const contactFormEl = document.getElementById('contact-form');
if (contactFormEl) {
  contactFormEl.addEventListener('submit', () => {
    // Netlify handles the POST — form redirects to /success.html
  });
}

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .pillar-item, .stat').forEach(el => {
  revealObserver.observe(el);
});

// ─── INTERACTIVE PILLAR CYCLE (home page only) ────────────────────────────────
const PILLAR_DATA = [
  { name: 'Educate', blurb: 'We break down the engineering, physics, and design behind themed rides, making the amusement industry accessible to everyone through events like CoasterVille and our Industry Inversion newsletter.' },
  { name: 'Inspire', blurb: 'We bring the industry to campus through guest speakers, facility tours, and behind-the-scenes access that show students exactly what a career in themed entertainment looks like.' },
  { name: 'Connect', blurb: 'We build real relationships between UofL students and amusement industry leaders. From LinkedIn connections to internship pipelines at parks and manufacturers around the world.' },
  { name: 'Innovate', blurb: 'We compete. Our team designs, builds, and operates a functional scale roller coaster at the national Ride Engineering Competition each spring: real engineering, real stakes, real results.' }
];

let activePillar = 0;
let pillarTimer = null;
let userHovering = false;

function setPillar(index) {
  activePillar = index;
  document.querySelectorAll('.hero-pillar-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  const label = document.getElementById('pillar-blurb-label');
  const text  = document.getElementById('pillar-blurb-text');
  const inner = document.getElementById('pillar-blurb-inner');
  if (label && text && inner) {
    inner.style.animation = 'none';
    inner.offsetHeight;
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
      setPillar(activePillar);
    }
  }, 3200);
}

const pillarBtns = document.querySelectorAll('.hero-pillar-btn');
if (pillarBtns.length) {
  setPillar(0);
  startPillarCycle();
  pillarBtns.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => { userHovering = true; setPillar(i); });
    btn.addEventListener('mouseleave', () => { userHovering = false; activePillar = i; startPillarCycle(); });
    btn.addEventListener('click', () => { setPillar(i); activePillar = i; });
  });
}

// ─── NETLIFY IDENTITY (CMS login redirect) ────────────────────────────────────
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    if (!user) {
      window.netlifyIdentity.on('login', () => {
        document.location.href = '/admin/';
      });
    }
  });
}
