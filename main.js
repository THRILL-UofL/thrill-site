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

// ─── NEWSLETTER SIGNUP (Mailchimp) ────────────────────────────────────────────
// Any <form class="mc-signup"> posts to Mailchimp's JSONP endpoint so people stay
// on the page. Without JavaScript the form still works as a normal POST.
const MC_ACTION = 'https://thrilluofl.us3.list-manage.com/subscribe/post?u=ee407b01742dc2232d3efc60d&id=fb6d9f4140';
const MC_HONEYPOT = 'b_ee407b01742dc2232d3efc60d_fb6d9f4140';
const MC_SUBSCRIBED_KEY = 'thrill_newsletter_subscribed';
const MC_DISMISSED_KEY = 'thrill_newsletter_popup_dismissed';

function storeGet(key) { try { return localStorage.getItem(key); } catch (err) { return null; } }
function storeSet(key, value) { try { localStorage.setItem(key, value); } catch (err) { /* storage blocked */ } }

function cleanMailchimpMessage(msg) {
  const div = document.createElement('div');
  div.innerHTML = String(msg || '');
  return (div.textContent || '').replace(/^\d+\s*-\s*/, '').trim();
}

function wireMailchimpForm(form) {
  const status = form.querySelector('.mc-status');
  const button = form.querySelector('button[type="submit"]');

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove('is-success', 'is-error');
    if (kind) status.classList.add('is-' + kind);
  }

  function markDone(text) {
    form.classList.add('is-done');
    storeSet(MC_SUBSCRIBED_KEY, '1');
    setStatus(text, 'success');
    form.dispatchEvent(new CustomEvent('mc:subscribed', { bubbles: true }));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const callbackName = 'thrillMc_' + Date.now();
    const params = new URLSearchParams(new FormData(form));
    params.set('c', callbackName);
    const url = form.action.replace('/subscribe/post?', '/subscribe/post-json?') + '&' + params.toString();

    const script = document.createElement('script');
    let finished = false;
    const finish = () => {
      finished = true;
      clearTimeout(timer);
      script.remove();
      try { delete window[callbackName]; } catch (err) { window[callbackName] = undefined; }
      if (button) button.disabled = false;
    };
    const timer = setTimeout(() => {
      if (finished) return;
      finish();
      setStatus('Something went wrong. Please try again in a moment.', 'error');
    }, 12000);

    window[callbackName] = (data) => {
      finish();
      const msg = cleanMailchimpMessage(data && data.msg);
      if (data && data.result === 'success') {
        markDone(/confirm/i.test(msg)
          ? 'Almost there! Check your inbox and click the confirmation link to finish subscribing.'
          : "You're subscribed. Thanks for following THRILL!");
      } else if (/already subscribed/i.test(msg)) {
        markDone("You're already on the list. Thanks for following THRILL!");
      } else {
        setStatus(msg || 'Something went wrong. Please try again.', 'error');
      }
    };

    script.onerror = () => {
      if (finished) return;
      finish();
      setStatus('Could not reach the signup service. Please try again.', 'error');
    };

    if (button) button.disabled = true;
    setStatus('Signing you up…');
    script.src = url;
    document.body.appendChild(script);
  });
}

document.querySelectorAll('form.mc-signup').forEach(wireMailchimpForm);

// ─── NEWSLETTER POPUP ─────────────────────────────────────────────────────────
// Shows once after 20 seconds or halfway down the page. Skipped on the newsletter,
// join, and admin pages, for anyone who already subscribed, and for 14 days after
// someone closes it.
(function newsletterPopup() {
  const page = location.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  if (/^\/(newsletter|join|success)$/.test(page) || page.indexOf('admin') !== -1) return;
  if (storeGet(MC_SUBSCRIBED_KEY)) return;
  const dismissedAt = Number(storeGet(MC_DISMISSED_KEY) || 0);
  if (dismissedAt && Date.now() - dismissedAt < 14 * 24 * 60 * 60 * 1000) return;

  let shown = false;
  const timer = setTimeout(show, 20000);
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 200 && window.scrollY / max > 0.5) show();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Someone already typing into a signup form on the page doesn't need the popup.
  function onFocusIn(e) {
    if (shown || !e.target.closest || !e.target.closest('form.mc-signup')) return;
    shown = true;
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('focusin', onFocusIn);
  }
  document.addEventListener('focusin', onFocusIn);

  function show() {
    if (shown) return;
    if (document.querySelector('.mc-signup.is-done')) return;
    shown = true;
    clearTimeout(timer);
    window.removeEventListener('scroll', onScroll);

    const lastFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'mc-popup';
    overlay.innerHTML = `
      <div class="mc-popup-card" role="dialog" aria-modal="true" aria-labelledby="mc-popup-title">
        <button type="button" class="mc-popup-close" aria-label="Close">&times;</button>
        <p class="section-label">Industry Inversion</p>
        <h2 id="mc-popup-title" class="mc-popup-title" tabindex="-1">Stay in the loop</h2>
        <p class="mc-popup-copy">Get our member-written newsletter, THRILL news, and upcoming events in your inbox. Open to everyone, not just UofL students.</p>
        <form class="mc-signup mc-popup-form" action="${MC_ACTION}" method="post" target="_blank">
          <div class="mc-name-row">
            <div class="form-group"><label for="mc-pop-fname">First name</label><input type="text" id="mc-pop-fname" name="FNAME" autocomplete="given-name" required></div>
            <div class="form-group"><label for="mc-pop-lname">Last name</label><input type="text" id="mc-pop-lname" name="LNAME" autocomplete="family-name" required></div>
          </div>
          <div class="form-group"><label for="mc-pop-email">Email address</label><input type="email" id="mc-pop-email" name="EMAIL" autocomplete="email" required></div>
          <div class="mc-hp" aria-hidden="true"><input type="text" name="${MC_HONEYPOT}" tabindex="-1" value=""></div>
          <button type="submit" class="form-submit">Subscribe</button>
          <p class="mc-status" role="status" aria-live="polite"></p>
        </form>
        <button type="button" class="mc-popup-dismiss">No thanks</button>
      </div>`;
    document.body.appendChild(overlay);

    const card = overlay.querySelector('.mc-popup-card');
    const form = overlay.querySelector('form');
    const dismissBtn = overlay.querySelector('.mc-popup-dismiss');
    wireMailchimpForm(form);
    form.addEventListener('mc:subscribed', () => { dismissBtn.textContent = 'Close'; });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    overlay.querySelector('#mc-popup-title').focus({ preventScroll: true });

    function close() {
      if (!form.classList.contains('is-done')) storeSet(MC_DISMISSED_KEY, String(Date.now()));
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 250);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      const items = [...card.querySelectorAll('button, input:not([tabindex="-1"]), a[href]')]
        .filter(el => el.offsetParent !== null && !el.disabled);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !card.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.mc-popup-close').addEventListener('click', close);
    dismissBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }
})();
