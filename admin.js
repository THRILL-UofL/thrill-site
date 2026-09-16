// ─── ADMIN PANEL — THRILL ─────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'THRILL2026';

// ─── DATA STORE ───────────────────────────────────────────────────────────────
function loadEvents() {
  const saved = localStorage.getItem('thrill_events');
  if (saved) return JSON.parse(saved);
  return [
    { id: 1, sortDate: '2026-10-13', tbd: false, dateDisplay: 'Oct 13, 2026', title: 'Dennis Spiegel, Guest Speaker', detail: '5:00 PM at Ernst Hall. IAAPA Hall of Fame, Founder of ITPS, 65 years in the industry.', tag: 'speaker', tagLabel: 'Speaker' },
    { id: 2, sortDate: '2026-10-15', tbd: false, dateDisplay: 'Oct 15, 2026', title: 'Speed School Fall Festival', detail: '4:00 to 6:00 PM. THRILL tabling at the Speed School RSO Fair.', tag: 'fair', tagLabel: 'Fair' },
    { id: 3, sortDate: '2026-10-22', tbd: false, dateDisplay: 'Oct 22, 2026', title: 'CoasterVille: Coasters 101', detail: '6:00 to 8:00 PM at Ernst Hall. Six modules, Kahoot trivia, prizes, and a certificate for every attendee.', tag: 'event', tagLabel: 'Event' },
    { id: 4, sortDate: '2026-10-01', tbd: true,  dateDisplay: 'Oct TBD, 2026', title: 'Kentucky Kingdom Facility Tour', detail: 'A Saturday in October. Around $30 per person. Behind-the-scenes tour before park open, plus time in the park.', tag: 'tour', tagLabel: 'Tour' },
    { id: 5, sortDate: '2027-04-10', tbd: false, dateDisplay: 'Apr 10, 2027', title: 'REC Competition at Hersheypark', detail: 'National Ride Engineering Competition. Block Party challenge with two-train operation.', tag: 'comp', tagLabel: 'Competition' },
  ];
}
function saveEvents(e) { localStorage.setItem('thrill_events', JSON.stringify(e)); }

function loadIssues() {
  const saved = localStorage.getItem('thrill_issues');
  if (saved) return JSON.parse(saved);
  return [{ id: 1, volume: 1, issue: 1, date: 'Coming Soon', description: 'The inaugural issue of Industry Inversion. Stay tuned.', pdfData: null, pdfName: '', published: false }];
}
function saveIssues(i) { localStorage.setItem('thrill_issues', JSON.stringify(i)); }

function loadSponsors() {
  const saved = localStorage.getItem('thrill_sponsors');
  return saved ? JSON.parse(saved) : [];
}
function saveSponsors(s) { localStorage.setItem('thrill_sponsors', JSON.stringify(s)); }

function loadInquiries() {
  const saved = localStorage.getItem('thrill_inquiries');
  return saved ? JSON.parse(saved) : [];
}
function saveInquiries(i) { localStorage.setItem('thrill_inquiries', JSON.stringify(i)); }

// ─── STATE ────────────────────────────────────────────────────────────────────
let adminAuthenticated = false;
let events   = loadEvents();
let issues   = loadIssues();
let sponsors = loadSponsors();
let inquiries = loadInquiries();
let editingEventId = null;
let editingIssueId = null;
let editingSponsorId = null;

const tierOrder  = { presenting:0, gold:1, silver:2, bronze:3, supporter:4 };
const tierLabels = { presenting:'Presenting Partner', gold:'Gold Sponsor', silver:'Silver Sponsor', bronze:'Bronze Sponsor', supporter:'Supporter' };
const tierColors = { presenting:'#C41230', gold:'#C8922A', silver:'#9BA3AF', bronze:'#A0654A', supporter:'rgba(248,248,248,0.4)' };

// ─── SORT EVENTS ──────────────────────────────────────────────────────────────
function sortedEvents() {
  return [...events].sort((a, b) => {
    const da = a.sortDate || '9999-12-31';
    const db = b.sortDate || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    // TBD events go after confirmed dates in same month
    if (a.tbd !== b.tbd) return a.tbd ? 1 : -1;
    return 0;
  });
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function adminLogin() {
  const input = document.getElementById('admin-password-input').value;
  if (input === ADMIN_PASSWORD) {
    adminAuthenticated = true;
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminEvents();
    renderAdminIssues();
    renderAdminSponsors();
    renderAdminInquiries();
  } else {
    document.getElementById('admin-login-error').style.display = 'block';
    document.getElementById('admin-password-input').value = '';
  }
}

function adminLogout() {
  adminAuthenticated = false;
  document.getElementById('admin-login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-password-input').value = '';
  document.getElementById('admin-login-error').style.display = 'none';
}

document.getElementById('admin-password-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});

// ─── ADMIN TABS ───────────────────────────────────────────────────────────────
function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('admin-tab-' + tab).style.display = 'block';
  document.querySelector(`.admin-tab-btn[data-tab="${tab}"]`).classList.add('active');
}
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => showAdminTab(btn.dataset.tab));
});

// ─── EVENTS ADMIN ─────────────────────────────────────────────────────────────
function renderAdminEvents() {
  const list = document.getElementById('admin-events-list');
  list.innerHTML = '';
  sortedEvents().forEach(ev => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-info">
        <span class="admin-row-date">${ev.dateDisplay}</span>
        <span class="admin-row-title">${ev.title}</span>
        <span class="event-tag tag-${ev.tag}" style="font-size:0.7rem;padding:0.2rem 0.6rem;">${ev.tagLabel}</span>
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editEvent(${ev.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteEvent(${ev.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  renderPublicEvents();
}

function openNewEventForm() {
  editingEventId = null;
  document.getElementById('event-form-title').textContent = 'Add Event';
  document.getElementById('event-date-input').value = '';
  document.getElementById('event-tbd').checked = false;
  document.getElementById('event-title').value = '';
  document.getElementById('event-detail').value = '';
  document.getElementById('event-tag').value = 'event';
  document.getElementById('event-tag-label').value = 'Event';
  toggleTBD();
  document.getElementById('event-form-modal').style.display = 'flex';
}

function editEvent(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  editingEventId = id;
  document.getElementById('event-form-title').textContent = 'Edit Event';
  document.getElementById('event-date-input').value = ev.sortDate || '';
  document.getElementById('event-tbd').checked = ev.tbd || false;
  document.getElementById('event-title').value = ev.title;
  document.getElementById('event-detail').value = ev.detail;
  document.getElementById('event-tag').value = ev.tag;
  document.getElementById('event-tag-label').value = ev.tagLabel;
  toggleTBD();
  document.getElementById('event-form-modal').style.display = 'flex';
}

function toggleTBD() {
  const tbd = document.getElementById('event-tbd').checked;
  document.getElementById('event-date-input').disabled = tbd;
  document.getElementById('event-date-input').style.opacity = tbd ? '0.3' : '1';
}

function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== id);
  saveEvents(events);
  renderAdminEvents();
}

function closeEventForm() {
  document.getElementById('event-form-modal').style.display = 'none';
  editingEventId = null;
}

function saveEventForm() {
  const rawDate  = document.getElementById('event-date-input').value;
  const tbd      = document.getElementById('event-tbd').checked;
  const title    = document.getElementById('event-title').value.trim();
  const detail   = document.getElementById('event-detail').value.trim();
  const tag      = document.getElementById('event-tag').value;
  const tagLabel = document.getElementById('event-tag-label').value.trim();

  if (!tbd && !rawDate) { alert('Please pick a date or check TBD.'); return; }
  if (!title) { alert('Title is required.'); return; }

  // Build display date from sortDate
  let sortDate = rawDate || '9999-12-31';
  let dateDisplay;
  if (tbd) {
    if (rawDate) {
      const d = new Date(rawDate + 'T12:00:00');
      dateDisplay = d.toLocaleString('en-US', { month: 'short', year: 'numeric' }) + ' TBD';
      // Use first of that month for sort
      sortDate = rawDate.slice(0, 7) + '-01';
    } else {
      dateDisplay = 'TBD';
    }
  } else {
    const d = new Date(rawDate + 'T12:00:00');
    dateDisplay = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const entry = { sortDate, tbd, dateDisplay, title, detail, tag, tagLabel };
  if (editingEventId) {
    const idx = events.findIndex(e => e.id === editingEventId);
    events[idx] = { id: editingEventId, ...entry };
  } else {
    const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
    events.push({ id: newId, ...entry });
  }
  saveEvents(events);
  closeEventForm();
  renderAdminEvents();
}

document.getElementById('event-tag').addEventListener('change', function() {
  const labels = { speaker:'Speaker', tour:'Tour', event:'Event', comp:'Competition', fair:'Fair' };
  document.getElementById('event-tag-label').value = labels[this.value] || 'Event';
});

// ─── ISSUES ADMIN ─────────────────────────────────────────────────────────────
function renderAdminIssues() {
  const list = document.getElementById('admin-issues-list');
  list.innerHTML = '';
  if (!issues.length) {
    list.innerHTML = '<p style="color:rgba(248,248,248,0.3);font-size:0.9rem;padding:1rem 0;">No issues yet.</p>';
  }
  issues.forEach(iss => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-info">
        <span class="admin-row-date">Vol ${iss.volume}, Issue ${iss.issue}</span>
        <span class="admin-row-title">Industry Inversion</span>
        <span style="font-size:0.75rem;color:rgba(248,248,248,0.4);">${iss.date}</span>
        ${iss.pdfUrl ? '<span style="font-size:0.75rem;color:#7EC8A0;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">PDF LINKED</span>' : ''}
        ${iss.published
          ? '<span style="font-size:0.75rem;color:#7EC8A0;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">PUBLISHED</span>'
          : '<span style="font-size:0.75rem;color:#C8922A;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">UNPUBLISHED</span>'}
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editIssue(${iss.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteIssue(${iss.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  renderPublicIssues();
}

function openNewIssueForm() {
  editingIssueId = null;
  const nextNum = issues.length + 1;
  document.getElementById('issue-form-title').textContent = 'Add Issue';
  document.getElementById('issue-volume').value = 1;
  document.getElementById('issue-number').value = nextNum;
  document.getElementById('issue-date').value = '';
  document.getElementById('issue-description').value = '';
  document.getElementById('issue-pdf-url').value = '';
  document.getElementById('issue-published').checked = false;
  document.getElementById('issue-form-modal').style.display = 'flex';
}

function editIssue(id) {
  const iss = issues.find(i => i.id === id);
  if (!iss) return;
  editingIssueId = id;
  document.getElementById('issue-form-title').textContent = 'Edit Issue';
  document.getElementById('issue-volume').value = iss.volume;
  document.getElementById('issue-number').value = iss.issue;
  document.getElementById('issue-date').value = iss.date;
  document.getElementById('issue-description').value = iss.description;
  document.getElementById('issue-pdf-url').value = iss.pdfUrl || '';
  document.getElementById('issue-published').checked = iss.published;
  document.getElementById('issue-form-modal').style.display = 'flex';
}

function deleteIssue(id) {
  if (!confirm('Delete this issue?')) return;
  issues = issues.filter(i => i.id !== id);
  saveIssues(issues);
  renderAdminIssues();
}

function closeIssueForm() {
  document.getElementById('issue-form-modal').style.display = 'none';
  editingIssueId = null;
}

function saveIssueForm() {
  const volume      = parseInt(document.getElementById('issue-volume').value) || 1;
  const issueNum    = parseInt(document.getElementById('issue-number').value) || 1;
  const date        = document.getElementById('issue-date').value.trim();
  const description = document.getElementById('issue-description').value.trim();
  const published   = document.getElementById('issue-published').checked;
  const pdfUrl      = document.getElementById('issue-pdf-url').value.trim();

  if (!date) { alert('Date is required.'); return; }

  const entry = { volume, issue: issueNum, date, description, pdfUrl, published };
  if (editingIssueId) {
    const idx = issues.findIndex(i => i.id === editingIssueId);
    issues[idx] = { id: editingIssueId, ...entry };
  } else {
    const newId = issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1;
    issues.push({ id: newId, ...entry });
  }
  saveIssues(issues);
  closeIssueForm();
  renderAdminIssues();
}

// ─── SPONSORS ADMIN ───────────────────────────────────────────────────────────
function renderAdminSponsors() {
  const list = document.getElementById('admin-sponsors-list');
  if (!list) return;
  list.innerHTML = '';
  if (!sponsors.length) {
    list.innerHTML = '<p style="color:rgba(248,248,248,0.3);font-size:0.9rem;padding:1rem 0;">No sponsors yet.</p>';
  }
  [...sponsors].sort((a,b) => (tierOrder[a.tier]||9)-(tierOrder[b.tier]||9)).forEach(sp => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-info">
        <span class="admin-row-title">${sp.name}</span>
        <span style="font-size:0.78rem;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;color:${tierColors[sp.tier]||'#fff'}">${tierLabels[sp.tier]||sp.tier}</span>
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editSponsor(${sp.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteSponsor(${sp.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  renderPublicSponsors();
}

function openNewSponsorForm() {
  editingSponsorId = null;
  document.getElementById('sponsor-form-title').textContent = 'Add Sponsor';
  document.getElementById('sponsor-name').value = '';
  document.getElementById('sponsor-tier').value = 'gold';
  document.getElementById('sponsor-url').value = '';
  document.getElementById('sponsor-logo').value = '';
  document.getElementById('sponsor-form-modal').style.display = 'flex';
}

function editSponsor(id) {
  const sp = sponsors.find(s => s.id === id);
  if (!sp) return;
  editingSponsorId = id;
  document.getElementById('sponsor-form-title').textContent = 'Edit Sponsor';
  document.getElementById('sponsor-name').value = sp.name;
  document.getElementById('sponsor-tier').value = sp.tier;
  document.getElementById('sponsor-url').value = sp.url || '';
  document.getElementById('sponsor-logo').value = sp.logo || '';
  document.getElementById('sponsor-form-modal').style.display = 'flex';
}

function deleteSponsor(id) {
  if (!confirm('Remove this sponsor?')) return;
  sponsors = sponsors.filter(s => s.id !== id);
  saveSponsors(sponsors);
  renderAdminSponsors();
}

function closeSponsorForm() {
  document.getElementById('sponsor-form-modal').style.display = 'none';
  editingSponsorId = null;
}

function saveSponsorForm() {
  const name = document.getElementById('sponsor-name').value.trim();
  const tier = document.getElementById('sponsor-tier').value;
  const url  = document.getElementById('sponsor-url').value.trim();
  const logo = document.getElementById('sponsor-logo').value.trim();
  if (!name) { alert('Company name is required.'); return; }
  if (editingSponsorId) {
    const idx = sponsors.findIndex(s => s.id === editingSponsorId);
    sponsors[idx] = { id: editingSponsorId, name, tier, url, logo };
  } else {
    const newId = sponsors.length ? Math.max(...sponsors.map(s => s.id)) + 1 : 1;
    sponsors.push({ id: newId, name, tier, url, logo });
  }
  saveSponsors(sponsors);
  closeSponsorForm();
  renderAdminSponsors();
}

// ─── INQUIRIES ADMIN ──────────────────────────────────────────────────────────
function renderAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  if (!list) return;
  inquiries = loadInquiries();
  const unread = inquiries.filter(i => !i.read).length;
  const tabBtn = document.querySelector('.admin-tab-btn[data-tab="inquiries"]');
  if (tabBtn) tabBtn.textContent = unread > 0 ? `Inquiries (${unread})` : 'Inquiries';

  if (!inquiries.length) {
    list.innerHTML = '<p style="color:rgba(248,248,248,0.3);font-size:0.9rem;padding:1rem 0;">No inquiries yet.</p>';
    return;
  }
  list.innerHTML = '';
  inquiries.forEach(inq => {
    const card = document.createElement('div');
    card.className = 'inquiry-card' + (inq.read ? '' : ' inquiry-unread');
    card.innerHTML = `
      <div class="inquiry-card-header">
        <div>
          <span class="inquiry-name">${inq.name}</span>
          <span class="inquiry-company">${inq.company}</span>
          ${!inq.read ? '<span class="inquiry-badge">New</span>' : ''}
        </div>
        <div style="display:flex;gap:0.5rem;align-items:center;">
          <span class="inquiry-date">${inq.receivedAt}</span>
          <button class="admin-btn-delete" onclick="deleteInquiry(${inq.id})" style="font-size:0.75rem;padding:0.25rem 0.6rem;">Delete</button>
        </div>
      </div>
      <div class="inquiry-card-body">
        <div class="inquiry-field"><span class="inquiry-label">Email</span><a href="mailto:${inq.email}" style="color:#6BAADC;">${inq.email}</a></div>
        ${inq.phone ? `<div class="inquiry-field"><span class="inquiry-label">Phone</span><span>${inq.phone}</span></div>` : ''}
        ${inq.interest ? `<div class="inquiry-field"><span class="inquiry-label">Interest</span><span>${inq.interest}</span></div>` : ''}
        ${inq.message ? `<div class="inquiry-field"><span class="inquiry-label">Message</span><p class="inquiry-message">${inq.message}</p></div>` : ''}
        ${!inq.read ? `<button class="admin-btn-edit" style="margin-top:0.75rem;font-size:0.8rem;" onclick="markRead(${inq.id})">Mark as Read</button>` : ''}
      </div>`;
    list.appendChild(card);
  });
}

function markRead(id) {
  inquiries = loadInquiries();
  const inq = inquiries.find(i => i.id === id);
  if (inq) { inq.read = true; saveInquiries(inquiries); renderAdminInquiries(); }
}

function deleteInquiry(id) {
  if (!confirm('Delete this inquiry?')) return;
  inquiries = loadInquiries();
  inquiries = inquiries.filter(i => i.id !== id);
  saveInquiries(inquiries);
  renderAdminInquiries();
}

function clearAllInquiries() {
  if (!confirm('Clear all inquiries?')) return;
  saveInquiries([]);
  inquiries = [];
  renderAdminInquiries();
}

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'inquiries') renderAdminInquiries();
  });
});

// ─── SPONSOR INQUIRY FORM (public page) ──────────────────────────────────────
const sponsorFormEl = document.getElementById('sponsor-form');
if (sponsorFormEl) {
  sponsorFormEl.addEventListener('submit', () => {
    setTimeout(() => {
      if (typeof showToast === 'function') showToast('Inquiry received. We will be in touch soon.');
      sponsorFormEl.reset();
    }, 500);
  });
}

// ─── PUBLIC RENDERS ───────────────────────────────────────────────────────────
function renderPublicEvents() {
  const sorted = sortedEvents();
  ['home-events-preview', 'public-events-list'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const list = id === 'home-events-preview' ? sorted.slice(0, 3) : sorted;
    el.innerHTML = list.map(ev => `
      <div class="event-item">
        <div class="event-date">${ev.dateDisplay}</div>
        <div class="event-info"><h3>${ev.title}</h3><p>${ev.detail}</p></div>
        <span class="event-tag tag-${ev.tag}">${ev.tagLabel}</span>
      </div>`).join('');
  });
  renderCalendar();
}

function renderPublicIssues() {
  const grid = document.getElementById('newsletter-issues-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!issues.length) {
    grid.innerHTML = `<div class="newsletter-issue coming-soon">
      <div class="issue-number">01</div>
      <div class="issue-meta"><div class="issue-label">Volume 1, Issue 1</div><div class="issue-date">Coming Soon</div></div>
      <p class="issue-desc">The inaugural issue of Industry Inversion. Stay tuned.</p>
      <span class="issue-btn-disabled">Not Yet Published</span>
    </div>`;
    return;
  }
  issues.forEach(iss => {
    const card = document.createElement('div');
    card.className = 'newsletter-issue' + (iss.published ? '' : ' coming-soon');
    card.innerHTML = `
      <div class="issue-number">${String(iss.issue).padStart(2,'0')}</div>
      <div class="issue-meta">
        <div class="issue-label">Volume ${iss.volume}, Issue ${iss.issue}</div>
        <div class="issue-date">${iss.date}</div>
      </div>
      <p class="issue-desc">${iss.description}</p>
      ${iss.published && iss.pdfUrl
        ? `<a href="${iss.pdfUrl}" target="_blank" class="btn-primary" style="font-size:0.9rem;align-self:flex-start;text-decoration:none;">Read Issue</a>`
        : `<span class="issue-btn-disabled">Not Yet Published</span>`}`;
    grid.appendChild(card);
  });
}

function openPDF(id) {
  const iss = issues.find(i => i.id === id);
  if (!iss || !iss.pdfData) return;
  const win = window.open();
  win.document.write(`<iframe src="${iss.pdfData}" style="width:100%;height:100vh;border:none;"></iframe>`);
}

function renderPublicSponsors() {
  const grid = document.getElementById('sponsors-grid');
  if (!grid) return;
  if (!sponsors.length) {
    grid.innerHTML = `<div class="sponsor-placeholder"><p>Be our first sponsor.</p><a href="/contact.html" class="btn-outline" style="margin-top:1rem;font-size:0.9rem;display:inline-block;">Get in Touch</a></div>`;
    return;
  }
  const grouped = {};
  [...sponsors].sort((a,b) => (tierOrder[a.tier]||9)-(tierOrder[b.tier]||9)).forEach(sp => {
    if (!grouped[sp.tier]) grouped[sp.tier] = [];
    grouped[sp.tier].push(sp);
  });
  grid.innerHTML = '';
  Object.entries(grouped).forEach(([tier, list]) => {
    const hdr = document.createElement('div');
    hdr.className = 'sponsor-tier-header';
    hdr.style.color = tierColors[tier] || '#fff';
    hdr.textContent = tierLabels[tier] || tier;
    grid.appendChild(hdr);
    const row = document.createElement('div');
    row.className = 'sponsor-tier-row';
    list.forEach(sp => {
      const card = document.createElement('div');
      card.className = 'sponsor-card';
      const wrap = sp.url ? `<a href="${sp.url}" target="_blank" rel="noopener" class="sponsor-card-link">` : '<div class="sponsor-card-link">';
      const wrapClose = sp.url ? '</a>' : '</div>';
      card.innerHTML = `${wrap}${sp.logo ? `<img src="${sp.logo}" alt="${sp.name}" class="sponsor-logo-img">` : `<div class="sponsor-name-text">${sp.name}</div>`}${wrapClose}`;
      row.appendChild(card);
    });
    grid.appendChild(row);
  });
}

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function renderCalendar() {
  const container = document.getElementById('events-calendar');
  if (!container) return;

  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  function draw() {
    const monthEvents = sortedEvents().filter(ev => {
      if (!ev.sortDate || ev.sortDate === '9999-12-31') return false;
      const d = new Date(ev.sortDate + 'T12:00:00');
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    let html = `
      <div class="cal-header">
        <button class="cal-nav" onclick="calPrev()">&#8592;</button>
        <span class="cal-month-label">${monthName}</span>
        <button class="cal-nav" onclick="calNext()">&#8594;</button>
      </div>
      <div class="cal-grid">
        <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div>
        <div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>`;

    for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell cal-empty"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = (d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear());
      const dayEvents = monthEvents.filter(ev => {
        const evDate = new Date(ev.sortDate + 'T12:00:00');
        return evDate.getDate() === d;
      });
      html += `<div class="cal-cell${isToday ? ' cal-today' : ''}${dayEvents.length ? ' cal-has-event' : ''}">
        <span class="cal-day-num">${d}</span>
        ${dayEvents.map(ev => `<div class="cal-event-dot tag-dot-${ev.tag}" title="${ev.title}"></div>`).join('')}
      </div>`;
    }

    html += '</div>';

    // Event list for this month
    if (monthEvents.length) {
      html += '<div class="cal-month-events">';
      monthEvents.forEach(ev => {
        html += `<div class="cal-event-item">
          <span class="event-tag tag-${ev.tag}" style="font-size:0.7rem;padding:0.2rem 0.5rem;">${ev.tagLabel}</span>
          <span class="cal-event-date">${ev.dateDisplay}</span>
          <span class="cal-event-title">${ev.title}</span>
        </div>`;
      });
      html += '</div>';
    }

    container.innerHTML = html;
    container._calPrev = () => { if (viewMonth === 0) { viewMonth = 11; viewYear--; } else viewMonth--; draw(); };
    container._calNext = () => { if (viewMonth === 11) { viewMonth = 0; viewYear++; } else viewMonth++; draw(); };
  }

  window.calPrev = () => container._calPrev();
  window.calNext = () => container._calNext();
  draw();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderPublicEvents();
renderPublicIssues();
renderPublicSponsors();
