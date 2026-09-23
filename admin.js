// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://kerxbonxdxjqhyogadql.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Yy1qrfUBS219K8UBzY06yg_pbxAP84L';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── ADMIN PASSWORD ───────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'THRILL2026';

// ─── STATE ────────────────────────────────────────────────────────────────────
let adminAuthenticated = false;
let events   = [];
let issues   = [];
let sponsors = [];
let editingEventId   = null;
let editingIssueId   = null;
let editingSponsorId = null;

const tierOrder  = { presenting:0, gold:1, silver:2, bronze:3, supporter:4 };
const tierLabels = { presenting:'Presenting Partner', gold:'Gold Sponsor', silver:'Silver Sponsor', bronze:'Bronze Sponsor', supporter:'Supporter' };
const tierColors = { presenting:'#C41230', gold:'#C8922A', silver:'#9BA3AF', bronze:'#A0654A', supporter:'rgba(248,248,248,0.4)' };

// ─── LOAD FROM SUPABASE ───────────────────────────────────────────────────────
async function loadAllData() {
  const [evRes, isRes, spRes] = await Promise.all([
    sb.from('events').select('*').order('sort_date', { ascending: true }),
    sb.from('issues').select('*').order('id', { ascending: true }),
    sb.from('sponsors').select('*').order('id', { ascending: true }),
  ]);
  events   = evRes.data  || [];
  issues   = isRes.data  || [];
  sponsors = spRes.data  || [];
  renderPublicEvents();
  renderPublicIssues();
  renderPublicSponsors();
}

// ─── SORT EVENTS ──────────────────────────────────────────────────────────────
function sortedEvents() {
  return [...events].sort((a, b) => {
    const da = a.sort_date || '9999-12-31';
    const db = b.sort_date || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    if (a.tbd !== b.tbd) return a.tbd ? 1 : -1;
    return 0;
  });
}

function isUpcoming(ev) {
  if (!ev.sort_date || ev.sort_date === '9999-12-31') return true;
  const today = new Date();
  today.setHours(0,0,0,0);
  return new Date(ev.sort_date + 'T00:00:00') >= today;
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
        <span class="admin-row-date">${ev.date_display}</span>
        <span class="admin-row-title">${ev.title}</span>
        <span class="event-tag tag-${ev.tag}" style="font-size:0.7rem;padding:0.2rem 0.6rem;">${ev.tag_label}</span>
      </div>
      <div class="admin-row-actions">
        <button class="admin-btn-edit" onclick="editEvent(${ev.id})">Edit</button>
        <button class="admin-btn-delete" onclick="deleteEvent(${ev.id})">Delete</button>
      </div>`;
    list.appendChild(row);
  });
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
  document.getElementById('event-date-input').value = ev.sort_date || '';
  document.getElementById('event-tbd').checked = ev.tbd || false;
  document.getElementById('event-title').value = ev.title;
  document.getElementById('event-detail').value = ev.detail;
  document.getElementById('event-tag').value = ev.tag;
  document.getElementById('event-tag-label').value = ev.tag_label;
  toggleTBD();
  document.getElementById('event-form-modal').style.display = 'flex';
}

function toggleTBD() {
  const tbd = document.getElementById('event-tbd').checked;
  document.getElementById('event-date-input').disabled = tbd;
  document.getElementById('event-date-input').style.opacity = tbd ? '0.3' : '1';
}

async function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;
  await sb.from('events').delete().eq('id', id);
  events = events.filter(e => e.id !== id);
  renderAdminEvents();
  renderPublicEvents();
}

function closeEventForm() {
  document.getElementById('event-form-modal').style.display = 'none';
  editingEventId = null;
}

async function saveEventForm() {
  const rawDate  = document.getElementById('event-date-input').value;
  const tbd      = document.getElementById('event-tbd').checked;
  const title    = document.getElementById('event-title').value.trim();
  const detail   = document.getElementById('event-detail').value.trim();
  const tag      = document.getElementById('event-tag').value;
  const tag_label = document.getElementById('event-tag-label').value.trim();

  if (!tbd && !rawDate) { alert('Please pick a date or check TBD.'); return; }
  if (!title) { alert('Title is required.'); return; }

  let sort_date = rawDate || '9999-12-31';
  let date_display;
  if (tbd) {
    if (rawDate) {
      const d = new Date(rawDate + 'T12:00:00');
      date_display = d.toLocaleString('en-US', { month:'short', year:'numeric' }) + ' TBD';
      sort_date = rawDate.slice(0,7) + '-01';
    } else {
      date_display = 'TBD';
    }
  } else {
    const d = new Date(rawDate + 'T12:00:00');
    date_display = d.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric' });
  }

  const payload = { sort_date, tbd, date_display, title, detail, tag, tag_label };

  if (editingEventId) {
    const { data } = await sb.from('events').update(payload).eq('id', editingEventId).select();
    const idx = events.findIndex(e => e.id === editingEventId);
    if (data && data[0]) events[idx] = data[0];
  } else {
    const { data } = await sb.from('events').insert(payload).select();
    if (data && data[0]) events.push(data[0]);
  }
  closeEventForm();
  renderAdminEvents();
  renderPublicEvents();
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
        <span class="admin-row-date">Vol ${iss.volume}, Issue ${iss.issue_number}</span>
        <span class="admin-row-title">Industry Inversion</span>
        <span style="font-size:0.75rem;color:rgba(248,248,248,0.4);">${iss.date}</span>
        ${iss.pdf_url ? '<span style="font-size:0.75rem;color:#7EC8A0;font-family:var(--font-display);font-weight:600;letter-spacing:0.06em;">PDF LINKED</span>' : ''}
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
}

function openNewIssueForm() {
  editingIssueId = null;
  document.getElementById('issue-form-title').textContent = 'Add Issue';
  document.getElementById('issue-volume').value = 1;
  document.getElementById('issue-number').value = issues.length + 1;
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
  document.getElementById('issue-number').value = iss.issue_number;
  document.getElementById('issue-date').value = iss.date;
  document.getElementById('issue-description').value = iss.description;
  document.getElementById('issue-pdf-url').value = iss.pdf_url || '';
  document.getElementById('issue-published').checked = iss.published;
  document.getElementById('issue-form-modal').style.display = 'flex';
}

async function deleteIssue(id) {
  if (!confirm('Delete this issue?')) return;
  await sb.from('issues').delete().eq('id', id);
  issues = issues.filter(i => i.id !== id);
  renderAdminIssues();
  renderPublicIssues();
}

function closeIssueForm() {
  document.getElementById('issue-form-modal').style.display = 'none';
  editingIssueId = null;
}

async function saveIssueForm() {
  const volume      = parseInt(document.getElementById('issue-volume').value) || 1;
  const issue_number = parseInt(document.getElementById('issue-number').value) || 1;
  const date        = document.getElementById('issue-date').value.trim();
  const description = document.getElementById('issue-description').value.trim();
  const pdf_url     = document.getElementById('issue-pdf-url').value.trim();
  const published   = document.getElementById('issue-published').checked;

  if (!date) { alert('Date is required.'); return; }

  const payload = { volume, issue_number, date, description, pdf_url, published };

  if (editingIssueId) {
    const { data } = await sb.from('issues').update(payload).eq('id', editingIssueId).select();
    const idx = issues.findIndex(i => i.id === editingIssueId);
    if (data && data[0]) issues[idx] = data[0];
  } else {
    const { data } = await sb.from('issues').insert(payload).select();
    if (data && data[0]) issues.push(data[0]);
  }
  closeIssueForm();
  renderAdminIssues();
  renderPublicIssues();
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

async function deleteSponsor(id) {
  if (!confirm('Remove this sponsor?')) return;
  await sb.from('sponsors').delete().eq('id', id);
  sponsors = sponsors.filter(s => s.id !== id);
  renderAdminSponsors();
  renderPublicSponsors();
}

function closeSponsorForm() {
  document.getElementById('sponsor-form-modal').style.display = 'none';
  editingSponsorId = null;
}

async function saveSponsorForm() {
  const name = document.getElementById('sponsor-name').value.trim();
  const tier = document.getElementById('sponsor-tier').value;
  const url  = document.getElementById('sponsor-url').value.trim();
  const logo = document.getElementById('sponsor-logo').value.trim();
  if (!name) { alert('Company name is required.'); return; }

  const payload = { name, tier, url, logo };

  if (editingSponsorId) {
    const { data } = await sb.from('sponsors').update(payload).eq('id', editingSponsorId).select();
    const idx = sponsors.findIndex(s => s.id === editingSponsorId);
    if (data && data[0]) sponsors[idx] = data[0];
  } else {
    const { data } = await sb.from('sponsors').insert(payload).select();
    if (data && data[0]) sponsors.push(data[0]);
  }
  closeSponsorForm();
  renderAdminSponsors();
  renderPublicSponsors();
}

// ─── INQUIRIES (localStorage — admin only) ────────────────────────────────────
function loadInquiries() {
  const saved = localStorage.getItem('thrill_inquiries');
  return saved ? JSON.parse(saved) : [];
}
function saveInquiries(list) { localStorage.setItem('thrill_inquiries', JSON.stringify(list)); }

function renderAdminInquiries() {
  const list = document.getElementById('admin-inquiries-list');
  if (!list) return;
  const inquiries = loadInquiries();
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
  const inquiries = loadInquiries();
  const inq = inquiries.find(i => i.id === id);
  if (inq) { inq.read = true; saveInquiries(inquiries); renderAdminInquiries(); }
}

function deleteInquiry(id) {
  if (!confirm('Delete this inquiry?')) return;
  let inquiries = loadInquiries();
  inquiries = inquiries.filter(i => i.id !== id);
  saveInquiries(inquiries);
  renderAdminInquiries();
}

function clearAllInquiries() {
  if (!confirm('Clear all inquiries?')) return;
  saveInquiries([]);
  renderAdminInquiries();
}

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'inquiries') renderAdminInquiries();
  });
});

// Sponsor inquiry form — save to localStorage for admin panel
const sponsorFormEl = document.getElementById('sponsor-form');
if (sponsorFormEl) {
  sponsorFormEl.addEventListener('submit', () => {
    const fields = [...sponsorFormEl.querySelectorAll('input, select, textarea')];
    const entry = {
      id: Date.now(),
      receivedAt: new Date().toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }),
      read: false,
      name:     fields.find(f => f.name === 'name')?.value || '',
      company:  fields.find(f => f.name === 'company')?.value || '',
      email:    fields.find(f => f.name === 'email')?.value || '',
      phone:    fields.find(f => f.name === 'phone')?.value || '',
      interest: fields.find(f => f.name === 'interest')?.value || '',
      message:  fields.find(f => f.name === 'message')?.value || '',
    };
    const inquiries = loadInquiries();
    inquiries.unshift(entry);
    saveInquiries(inquiries);
  });
}

// ─── PUBLIC RENDERS ───────────────────────────────────────────────────────────
function eventCardHTML(ev) {
  return `<div class="event-item" onclick="location.href='/event.html?id=${ev.id}'" style="cursor:pointer;">
    <div class="event-date">${ev.date_display}</div>
    <div class="event-info"><h3>${ev.title}</h3><p>${ev.detail}</p></div>
    <span class="event-tag tag-${ev.tag}">${ev.tag_label}</span>
  </div>`;
}

function renderPublicEvents() {
  const sorted   = sortedEvents();
  const upcoming = sorted.filter(isUpcoming);
  const past     = sorted.filter(e => !isUpcoming(e)).reverse();

  const homeEl = document.getElementById('home-events-preview');
  if (homeEl) homeEl.innerHTML = upcoming.slice(0,3).map(eventCardHTML).join('') ||
    '<p style="color:rgba(248,248,248,0.4);font-size:0.9rem;padding:1rem 0;">No upcoming events. Check back soon.</p>';

  const upcomingEl = document.getElementById('public-events-upcoming');
  if (upcomingEl) upcomingEl.innerHTML = upcoming.map(eventCardHTML).join('') ||
    '<p style="color:rgba(248,248,248,0.4);font-size:0.9rem;padding:1rem 0;">No upcoming events right now.</p>';

  const pastEl = document.getElementById('public-events-past');
  if (pastEl) pastEl.innerHTML = past.map(ev => `
    <div class="event-item" onclick="location.href='/event.html?id=${ev.id}'" style="cursor:pointer;opacity:0.7;">
      <div class="event-date">${ev.date_display}</div>
      <div class="event-info"><h3>${ev.title}</h3></div>
      <span class="event-tag tag-${ev.tag}">${ev.tag_label}</span>
    </div>`).join('') ||
    '<p style="color:rgba(248,248,248,0.4);font-size:0.9rem;padding:1rem 0;">No past events yet.</p>';

  const detailEl = document.getElementById('event-detail-container');
  if (detailEl) {
    const id = parseInt(new URLSearchParams(window.location.search).get('id'));
    const ev = sorted.find(e => e.id === id);
    if (ev) {
      document.title = ev.title + ' | THRILL';
      detailEl.innerHTML = `
        <div style="max-width:800px;margin:0 auto;padding:5rem 5vw;">
          <a href="/events.html" style="font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(248,248,248,0.4);text-decoration:none;">Back to Events</a>
          <div style="margin-top:2rem;">
            <span class="event-tag tag-${ev.tag}" style="margin-bottom:1rem;display:inline-block;">${ev.tag_label}</span>
            <h1 style="font-family:'Barlow Condensed',sans-serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:800;color:#F8F8F8;line-height:1;margin:0.5rem 0 1rem;">${ev.title}</h1>
            <p style="font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:600;color:var(--gold);margin-bottom:2rem;">${ev.date_display}</p>
            <p style="font-size:1rem;color:rgba(248,248,248,0.75);line-height:1.8;max-width:60ch;">${ev.detail}</p>
            <div style="margin-top:3rem;">
              <a href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Sm4k3TRUFU6K45Gtl5eyCSk1h0RKy19KmGPSjp9gwUJUMkxBMTVJUjYzVU82VDJEQk9XSVUwSllZWi4u" target="_blank" class="btn-primary">Join THRILL</a>
            </div>
          </div>
        </div>`;
    } else {
      detailEl.innerHTML = `<div style="max-width:800px;margin:0 auto;padding:5rem 5vw;text-align:center;">
        <p style="color:rgba(248,248,248,0.4);">Event not found.</p>
        <a href="/events.html" class="btn-outline" style="margin-top:1rem;display:inline-block;">Back to Events</a>
      </div>`;
    }
  }

  renderCalendar();
}

function renderPublicIssues() {
  const grid = document.getElementById('newsletter-issues-grid');
  if (!grid) return;
  if (!issues.length) {
    grid.innerHTML = `<div class="newsletter-issue coming-soon">
      <div class="issue-number">01</div>
      <div class="issue-meta"><div class="issue-label">Volume 1, Issue 1</div><div class="issue-date">Coming Soon</div></div>
      <p class="issue-desc">The inaugural issue of Industry Inversion. Stay tuned.</p>
      <span class="issue-btn-disabled">Not Yet Published</span>
    </div>`;
    return;
  }
  grid.innerHTML = '';
  issues.forEach(iss => {
    const card = document.createElement('div');
    card.className = 'newsletter-issue' + (iss.published ? '' : ' coming-soon');
    card.innerHTML = `
      <div class="issue-number">${String(iss.issue_number).padStart(2,'0')}</div>
      <div class="issue-meta">
        <div class="issue-label">Volume ${iss.volume}, Issue ${iss.issue_number}</div>
        <div class="issue-date">${iss.date}</div>
      </div>
      <p class="issue-desc">${iss.description}</p>
      ${iss.published && iss.pdf_url
        ? `<a href="${iss.pdf_url}" target="_blank" class="btn-primary" style="font-size:0.9rem;align-self:flex-start;text-decoration:none;">Read Issue</a>`
        : `<span class="issue-btn-disabled">Not Yet Published</span>`}`;
    grid.appendChild(card);
  });
}

function renderPublicSponsors() {
  const grid = document.getElementById('sponsors-grid');
  if (!grid) return;
  if (!sponsors.length) {
    grid.innerHTML = `<div class="sponsor-placeholder"><p>Be our first sponsor.</p><a href="/contact.html" class="btn-outline" style="margin-top:1rem;font-size:0.9rem;display:inline-block;">Get in Touch</a></div>`;
    return;
  }
  const grouped = {};
  [...sponsors].sort((a,b)=>(tierOrder[a.tier]||9)-(tierOrder[b.tier]||9)).forEach(sp => {
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
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function draw() {
    const monthEvents = sortedEvents().filter(ev => {
      if (!ev.sort_date || ev.sort_date === '9999-12-31') return false;
      const d = new Date(ev.sort_date + 'T12:00:00');
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', { month:'long', year:'numeric' });

    let html = `<div class="cal-header">
      <button class="cal-nav" onclick="calPrev()">&#8592;</button>
      <span class="cal-month-label">${monthName}</span>
      <button class="cal-nav" onclick="calNext()">&#8594;</button>
    </div>
    <div class="cal-grid">
      <div class="cal-dow">Sun</div><div class="cal-dow">Mon</div><div class="cal-dow">Tue</div>
      <div class="cal-dow">Wed</div><div class="cal-dow">Thu</div><div class="cal-dow">Fri</div><div class="cal-dow">Sat</div>`;

    for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell cal-empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      const dayEvents = monthEvents.filter(ev => new Date(ev.sort_date + 'T12:00:00').getDate() === d);
      html += `<div class="cal-cell${isToday?' cal-today':''}${dayEvents.length?' cal-has-event':''}">
        <span class="cal-day-num">${d}</span>
        ${dayEvents.map(ev => `<div class="cal-event-dot tag-dot-${ev.tag}" title="${ev.title}"></div>`).join('')}
      </div>`;
    }
    html += '</div>';

    if (monthEvents.length) {
      html += '<div class="cal-month-events">';
      monthEvents.forEach(ev => {
        html += `<div class="cal-event-item">
          <span class="event-tag tag-${ev.tag}" style="font-size:0.7rem;padding:0.2rem 0.5rem;">${ev.tag_label}</span>
          <span class="cal-event-date">${ev.date_display}</span>
          <span class="cal-event-title">${ev.title}</span>
        </div>`;
      });
      html += '</div>';
    }
    container.innerHTML = html;
    container._calPrev = () => { if (viewMonth===0){viewMonth=11;viewYear--;}else viewMonth--; draw(); };
    container._calNext = () => { if (viewMonth===11){viewMonth=0;viewYear++;}else viewMonth++; draw(); };
  }

  window.calPrev = () => container._calPrev();
  window.calNext = () => container._calNext();
  draw();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadAllData();
