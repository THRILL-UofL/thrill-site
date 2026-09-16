// ─── ADMIN PANEL — THRILL ────────────────────────────────────────────────────
// Change 'THRILL2026' below to update the admin password
const ADMIN_PASSWORD = 'THRILL2026';

// ─── DATA STORE ──────────────────────────────────────────────────────────────
function loadEvents() {
  const saved = localStorage.getItem('thrill_events');
  if (saved) return JSON.parse(saved);
  return [
    { id: 1, date: 'Oct 13, 2026', title: 'Dennis Spiegel, Guest Speaker', detail: '5:00 PM at Ernst Hall. IAAPA Hall of Fame, Founder of ITPS, 65 years in the industry.', tag: 'speaker', tagLabel: 'Speaker' },
    { id: 2, date: 'Oct 15, 2026', title: 'Speed School Fall Festival', detail: '4:00 to 6:00 PM. THRILL tabling at the Speed School RSO Fair.', tag: 'fair', tagLabel: 'Fair' },
    { id: 3, date: 'Oct 22, 2026', title: 'CoasterVille: Coasters 101', detail: '6:00 to 8:00 PM at Ernst Hall. Six modules, Kahoot trivia, prizes, and a certificate for every attendee.', tag: 'event', tagLabel: 'Event' },
    { id: 4, date: 'Oct TBD, 2026', title: 'Kentucky Kingdom Facility Tour', detail: 'A Saturday in October. Around $30 per person. Behind-the-scenes tour before park open, plus time in the park.', tag: 'tour', tagLabel: 'Tour' },
    { id: 5, date: 'Apr 10, 2027', title: 'REC Competition at Hersheypark', detail: 'National Ride Engineering Competition. Block Party challenge with two-train operation.', tag: 'comp', tagLabel: 'Competition' },
  ];
}
function saveEvents(events) { localStorage.setItem('thrill_events', JSON.stringify(events)); }

function loadIssues() {
  const saved = localStorage.getItem('thrill_issues');
  if (saved) return JSON.parse(saved);
  return [
    { id: 1, volume: 1, issue: 1, date: 'Coming Soon', description: 'The inaugural issue of Industry Inversion. Stay tuned.', filename: '', published: false }
  ];
}
function saveIssues(issues) { localStorage.setItem('thrill_issues', JSON.stringify(issues)); }

// ─── STATE ───────────────────────────────────────────────────────────────────
let adminAuthenticated = false;
let events = loadEvents();
let issues = loadIssues();
let editingEventId = null;
let editingIssueId = null;

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function adminLogin() {
  const input = document.getElementById('admin-password-input').value;
  if (input === ADMIN_PASSWORD) {
    adminAuthenticated = true;
    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    renderAdminEvents();
    renderAdminIssues();
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

document.getElementById('admin-password-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') adminLogin();
});

// ─── ADMIN TABS ──────────────────────────────────────────────────────────────
function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('admin-tab-' + tab).style.display = 'block';
  document.querySelector(`.admin-tab-btn[data-tab="${tab}"]`).classList.add('active');
}

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => showAdminTab(btn.dataset.tab));
});

// ─── EVENTS ADMIN ────────────────────────────────────────────────────────────
function renderAdminEvents() {
  const list = document.getElementById('admin-events-list');
  list.innerHTML = '';
  events.forEach(ev => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-info">
        <span class="admin-row-date">${ev.date}</span>
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

function editEvent(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  editingEventId = id;
  document.getElementById('event-form-title').textContent = 'Edit Event';
  document.getElementById('event-date').value = ev.date;
  document.getElementById('event-title').value = ev.title;
  document.getElementById('event-detail').value = ev.detail;
  document.getElementById('event-tag').value = ev.tag;
  document.getElementById('event-tag-label').value = ev.tagLabel;
  document.getElementById('event-form-modal').style.display = 'flex';
}

function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  events = events.filter(e => e.id !== id);
  saveEvents(events);
  renderAdminEvents();
}

function openNewEventForm() {
  editingEventId = null;
  document.getElementById('event-form-title').textContent = 'Add Event';
  document.getElementById('event-date').value = '';
  document.getElementById('event-title').value = '';
  document.getElementById('event-detail').value = '';
  document.getElementById('event-tag').value = 'event';
  document.getElementById('event-tag-label').value = 'Event';
  document.getElementById('event-form-modal').style.display = 'flex';
}

function closeEventForm() {
  document.getElementById('event-form-modal').style.display = 'none';
  editingEventId = null;
}

function saveEventForm() {
  const date     = document.getElementById('event-date').value.trim();
  const title    = document.getElementById('event-title').value.trim();
  const detail   = document.getElementById('event-detail').value.trim();
  const tag      = document.getElementById('event-tag').value;
  const tagLabel = document.getElementById('event-tag-label').value.trim();
  if (!date || !title) { alert('Date and title are required.'); return; }
  if (editingEventId) {
    const idx = events.findIndex(e => e.id === editingEventId);
    events[idx] = { id: editingEventId, date, title, detail, tag, tagLabel };
  } else {
    const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
    events.push({ id: newId, date, title, detail, tag, tagLabel });
  }
  saveEvents(events);
  closeEventForm();
  renderAdminEvents();
}

document.getElementById('event-tag').addEventListener('change', function () {
  const labels = { speaker: 'Speaker', tour: 'Tour', event: 'Event', comp: 'Competition', fair: 'Fair' };
  document.getElementById('event-tag-label').value = labels[this.value] || 'Event';
});

// ─── ISSUES ADMIN ─────────────────────────────────────────────────────────────
function renderAdminIssues() {
  const list = document.getElementById('admin-issues-list');
  list.innerHTML = '';

  if (issues.length === 0) {
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
        ${iss.published
          ? `<span style="font-size:0.75rem;color:#7EC8A0;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">PUBLISHED</span>`
          : `<span style="font-size:0.75rem;color:#C8922A;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">UNPUBLISHED</span>`}
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editIssue(${iss.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteIssue(${iss.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });

  // PDF instructions box
  const instructions = document.getElementById('pdf-instructions');
  if (instructions) {
    const nextNum = issues.length + 1;
    instructions.innerHTML = `
      <p style="font-family:var(--font-display);font-size:0.85rem;font-weight:700;color:var(--gold);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">How to publish a new issue</p>
      <ol style="color:rgba(248,248,248,0.6);font-size:0.88rem;line-height:1.9;padding-left:1.25rem;">
        <li>Name your PDF file exactly: <code style="background:rgba(255,255,255,0.08);padding:0.1rem 0.4rem;color:#F8F8F8;">industry-inversion-${String(nextNum).padStart(2,'0')}.pdf</code></li>
        <li>Drop it into the <code style="background:rgba(255,255,255,0.08);padding:0.1rem 0.4rem;color:#F8F8F8;">thrill-site/pdfs/</code> folder</li>
        <li>Click <strong style="color:#F8F8F8;">Add Issue</strong> above, fill in the details, check <em>Published</em>, and save</li>
        <li>Re-deploy your site (drag the folder to Netlify Drop)</li>
      </ol>`;
  }

  renderPublicIssues();
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
  document.getElementById('issue-filename').value = iss.filename;
  document.getElementById('issue-published').checked = iss.published;
  document.getElementById('issue-form-modal').style.display = 'flex';
}

function deleteIssue(id) {
  if (!confirm('Delete this issue entry? This does not delete the PDF file itself.')) return;
  issues = issues.filter(i => i.id !== id);
  saveIssues(issues);
  renderAdminIssues();
}

function openNewIssueForm() {
  editingIssueId = null;
  const nextIssueNum = issues.length + 1;
  document.getElementById('issue-form-title').textContent = 'Add Issue';
  document.getElementById('issue-volume').value = 1;
  document.getElementById('issue-number').value = nextIssueNum;
  document.getElementById('issue-date').value = '';
  document.getElementById('issue-description').value = '';
  document.getElementById('issue-filename').value = `industry-inversion-${String(nextIssueNum).padStart(2,'0')}.pdf`;
  document.getElementById('issue-published').checked = false;
  document.getElementById('issue-form-modal').style.display = 'flex';
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
  const filename    = document.getElementById('issue-filename').value.trim();
  const published   = document.getElementById('issue-published').checked;

  if (!date) { alert('Date is required.'); return; }

  if (editingIssueId) {
    const idx = issues.findIndex(i => i.id === editingIssueId);
    issues[idx] = { id: editingIssueId, volume, issue: issueNum, date, description, filename, published };
  } else {
    const newId = issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1;
    issues.push({ id: newId, volume, issue: issueNum, date, description, filename, published });
  }
  saveIssues(issues);
  closeIssueForm();
  renderAdminIssues();
}

// ─── PUBLIC RENDERS ──────────────────────────────────────────────────────────
function renderPublicEvents() {
  ['home-events-preview', 'public-events-list'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const list = id === 'home-events-preview' ? events.slice(0, 3) : events;
    el.innerHTML = list.map(ev => `
      <div class="event-item">
        <div class="event-date">${ev.date}</div>
        <div class="event-info"><h3>${ev.title}</h3><p>${ev.detail}</p></div>
        <span class="event-tag tag-${ev.tag}">${ev.tagLabel}</span>
      </div>`).join('');
  });
}

function renderPublicIssues() {
  const grid = document.getElementById('newsletter-issues-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (issues.length === 0) {
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
      ${iss.published && iss.filename
        ? `<a href="pdfs/${iss.filename}" target="_blank" class="btn-primary" style="font-size:0.9rem;align-self:flex-start;">Read Issue</a>`
        : `<span class="issue-btn-disabled">Not Yet Published</span>`}`;
    grid.appendChild(card);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderPublicEvents();
renderPublicIssues();

// ─── SPONSORS ADMIN ───────────────────────────────────────────────────────────
function loadSponsors() {
  const saved = localStorage.getItem('thrill_sponsors');
  if (saved) return JSON.parse(saved);
  return [];
}
function saveSponsors(sponsors) { localStorage.setItem('thrill_sponsors', JSON.stringify(sponsors)); }

let sponsors = loadSponsors();
let editingSponsorId = null;

const tierOrder = { presenting: 0, gold: 1, silver: 2, bronze: 3, supporter: 4 };
const tierLabels = { presenting: 'Presenting Partner', gold: 'Gold Sponsor', silver: 'Silver Sponsor', bronze: 'Bronze Sponsor', supporter: 'Supporter' };
const tierColors = { presenting: '#C41230', gold: '#C8922A', silver: '#9BA3AF', bronze: '#A0654A', supporter: 'rgba(248,248,248,0.4)' };

function renderAdminSponsors() {
  const list = document.getElementById('admin-sponsors-list');
  if (!list) return;
  list.innerHTML = '';
  if (sponsors.length === 0) {
    list.innerHTML = '<p style="color:rgba(248,248,248,0.3);font-size:0.9rem;padding:1rem 0;">No sponsors yet. Add your first one above.</p>';
  }
  [...sponsors].sort((a,b) => (tierOrder[a.tier]||9) - (tierOrder[b.tier]||9)).forEach(sp => {
    const row = document.createElement('div');
    row.className = 'admin-row';
    row.innerHTML = `
      <div class="admin-row-info">
        <span class="admin-row-title">${sp.name}</span>
        <span style="font-size:0.78rem;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;color:${tierColors[sp.tier]||'#fff'}">${tierLabels[sp.tier]||sp.tier}</span>
        ${sp.url ? `<span style="font-size:0.75rem;color:rgba(248,248,248,0.3);">${sp.url}</span>` : ''}
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editSponsor(${sp.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteSponsor(${sp.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
  renderPublicSponsors();
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

function openNewSponsorForm() {
  editingSponsorId = null;
  document.getElementById('sponsor-form-title').textContent = 'Add Sponsor';
  document.getElementById('sponsor-name').value = '';
  document.getElementById('sponsor-tier').value = 'gold';
  document.getElementById('sponsor-url').value = '';
  document.getElementById('sponsor-logo').value = '';
  document.getElementById('sponsor-form-modal').style.display = 'flex';
}

function closeSponsorForm() {
  document.getElementById('sponsor-form-modal').style.display = 'none';
  editingSponsorId = null;
}

function saveSponsorForm() {
  const name  = document.getElementById('sponsor-name').value.trim();
  const tier  = document.getElementById('sponsor-tier').value;
  const url   = document.getElementById('sponsor-url').value.trim();
  const logo  = document.getElementById('sponsor-logo').value.trim();
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

function renderPublicSponsors() {
  const grid = document.getElementById('sponsors-grid');
  if (!grid) return;
  if (sponsors.length === 0) {
    grid.innerHTML = `<div class="sponsor-placeholder">
      <p>Be our first sponsor.</p>
      <a href="#" class="btn-outline" data-page="contact" style="margin-top:1rem;font-size:0.9rem;display:inline-block;">Get in Touch</a>
    </div>`;
    return;
  }
  // Group by tier
  const grouped = {};
  [...sponsors].sort((a,b) => (tierOrder[a.tier]||9) - (tierOrder[b.tier]||9)).forEach(sp => {
    if (!grouped[sp.tier]) grouped[sp.tier] = [];
    grouped[sp.tier].push(sp);
  });
  grid.innerHTML = '';
  Object.entries(grouped).forEach(([tier, list]) => {
    const tierHeader = document.createElement('div');
    tierHeader.className = 'sponsor-tier-header';
    tierHeader.style.color = tierColors[tier] || '#fff';
    tierHeader.textContent = tierLabels[tier] || tier;
    grid.appendChild(tierHeader);
    const row = document.createElement('div');
    row.className = 'sponsor-tier-row';
    list.forEach(sp => {
      const card = document.createElement('div');
      card.className = 'sponsor-card';
      const inner = sp.url ? `<a href="${sp.url}" target="_blank" rel="noopener" class="sponsor-card-link">` : '<div class="sponsor-card-link">';
      const innerClose = sp.url ? '</a>' : '</div>';
      card.innerHTML = `${inner}
        ${sp.logo
          ? `<img src="${sp.logo}" alt="${sp.name}" class="sponsor-logo-img">`
          : `<div class="sponsor-name-text">${sp.name}</div>`}
      ${innerClose}`;
      row.appendChild(card);
    });
    grid.appendChild(row);
  });
}

// ─── SPONSOR INQUIRY STORAGE ──────────────────────────────────────────────────
function loadInquiries() {
  const saved = localStorage.getItem('thrill_inquiries');
  return saved ? JSON.parse(saved) : [];
}
function saveInquiries(list) { localStorage.setItem('thrill_inquiries', JSON.stringify(list)); }

let inquiries = loadInquiries();

// Wire up the public sponsor inquiry form to save submissions
const sponsorFormEl = document.getElementById('sponsor-form');
if (sponsorFormEl) {
  sponsorFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const fields = [...e.target.querySelectorAll('input, select, textarea')];
    const entry = {
      id: Date.now(),
      receivedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      read: false,
      name:     fields[0]?.value || '',
      company:  fields[1]?.value || '',
      email:    fields[2]?.value || '',
      phone:    fields[3]?.value || '',
      interest: fields[4]?.value || '',
      message:  fields[5]?.value || '',
    };
    inquiries = loadInquiries();
    inquiries.unshift(entry);
    saveInquiries(inquiries);
    showToast('Inquiry received. We will be in touch soon.');
    e.target.reset();
  });
}

// Render inquiries in admin panel
function renderAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  if (!list) return;
  inquiries = loadInquiries();

  if (inquiries.length === 0) {
    list.innerHTML = '<p style="color:rgba(248,248,248,0.3);font-size:0.9rem;padding:1rem 0;">No inquiries yet. Submissions from the Sponsor Us page will appear here.</p>';
    return;
  }

  // Update tab badge
  const unread = inquiries.filter(i => !i.read).length;
  const tabBtn = document.querySelector('.admin-tab-btn[data-tab="inquiries"]');
  if (tabBtn) {
    tabBtn.textContent = unread > 0 ? `Inquiries (${unread})` : 'Inquiries';
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
  if (!confirm('Clear all inquiries? This cannot be undone.')) return;
  saveInquiries([]);
  inquiries = [];
  renderAdminInquiries();
}

// Hook into tab switching to render inquiries when that tab is opened
// and mark all visible as read
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'inquiries') {
      renderAdminInquiries();
    }
  });
});

// Init
renderAdminInquiries();

// Init sponsors (separated from inquiry init above)
renderAdminSponsors();
renderPublicSponsors();
