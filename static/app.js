// ── Auth state ────────────────────────────────────────────────────────────────
let currentUser = null;
let authToken   = null;
let authIsNewUser = false;

function getStoredAuth() {
  try {
    authToken   = localStorage.getItem('sb_token');
    const ud    = localStorage.getItem('sb_user');
    currentUser = ud ? JSON.parse(ud) : null;
  } catch (e) { authToken = null; currentUser = null; }
}
function storeAuth(token, user) {
  authToken = token; currentUser = user;
  localStorage.setItem('sb_token', token);
  localStorage.setItem('sb_user', JSON.stringify(user));
}
function clearAuth() {
  authToken = null; currentUser = null;
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
}

// ── App state ─────────────────────────────────────────────────────────────────
let view          = 'home';   // 'home' | 'kanban' | 'list'
let sprint        = null;
let tasks         = [];
let users         = [];
let statuses      = [];
let sprintOverview = [];
let dragTaskId    = null;
let editTaskId    = null;
let defaultStatusId = null;
let modalSubtasks = [];
let toastTimer    = null;

// ── API helper (always injects auth header; redirects to login on 401) ────────
const api = {
  async req(method, url, data) {
    const opts = { method, headers: {} };
    if (authToken) opts.headers['Authorization'] = `Bearer ${authToken}`;
    if (data !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    }
    const r = await fetch(url, opts);
    if (r.status === 401) { clearAuth(); showAuthScreen(); return null; }
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || `HTTP ${r.status}`); }
    return r.status === 204 ? null : r.json();
  },
  get: (url)    => api.req('GET',    url),
  post: (url,d) => api.req('POST',   url, d),
  put:  (url,d) => api.req('PUT',    url, d),
  del:  (url)   => api.req('DELETE', url),
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ── XSS-safe escape ───────────────────────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// XSS-safe URL linkifier — escapes all text, then wraps bare URLs in <a> tags
function linkify(text) {
  if (!text) return '';
  const urlRegex = /https?:\/\/[^\s]+/g;
  let result = '', lastIndex = 0, match;
  while ((match = urlRegex.exec(text)) !== null) {
    result += esc(text.slice(lastIndex, match.index));
    const a = document.createElement('a');
    a.href = match[0]; a.textContent = match[0];
    a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'task-link';
    result += a.outerHTML;
    lastIndex = match.index + match[0].length;
  }
  result += esc(text.slice(lastIndex));
  return result;
}

const AVATAR_COLORS = ['#5b6af0','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
function avatarColor(id) { return AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length]; }

// ── Password utilities ─────────────────────────────────────────────────────────
function generatePassword(length = 16) {
  const upper  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower  = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*-_=+';
  const all    = upper + lower + digits + symbols;

  let pwd = '';
  // Ensure at least 1 of each type
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill rest randomly
  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle to avoid predictable patterns
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function checkPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: 'None', color: '#cbd5e0' };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*\-_=+]/.test(pwd)) score++;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
  const index = Math.min(Math.floor(score / 2), 4);

  return { score: Math.min(score, 5), label: labels[index], color: colors[index] };
}

// ── Auth screen ───────────────────────────────────────────────────────────────
function showAuthScreen() {
  document.getElementById('authScreen').classList.remove('hidden');
  // Reset to step 1
  document.getElementById('authStep1').style.display = '';
  document.getElementById('authStep2').style.display = 'none';
  document.getElementById('authEmail').value    = '';
  document.getElementById('authPassword').value = '';
  hideAuthError();
  setTimeout(() => document.getElementById('authEmail').focus(), 50);
}
function hideAuthScreen() {
  document.getElementById('authScreen').classList.add('hidden');
}
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg; el.classList.add('show');
}
function hideAuthError() {
  document.getElementById('authError').classList.remove('show');
}

async function authCheckEmail() {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) { showAuthError('Please enter your work email'); return; }
  hideAuthError();

  try {
    const res  = await fetch('/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) { showAuthError(data.detail || 'Invalid email'); return; }

    authIsNewUser = !data.exists;
    document.getElementById('authEmailChip').textContent = email;
    document.getElementById('authStep1').style.display = 'none';
    document.getElementById('authStep2').style.display = '';

    const nameField = document.getElementById('authNameField');
    const submitBtn = document.getElementById('authSubmitBtn');
    const suggestBtn = document.getElementById('authSuggestBtn');
    const confirmField = document.getElementById('authConfirmField');
    const passwordLabel = document.querySelector('.password-label-row label');
    const passwordRequirements = document.getElementById('authPasswordRequirements');

    if (authIsNewUser) {
      nameField.style.display = '';
      document.getElementById('authName').value = data.suggested_name;
      submitBtn.textContent = 'Create account';
      suggestBtn.style.display = '';
      passwordLabel.textContent = 'Create a password';
      passwordRequirements.style.display = '';
      // Clear and hide confirm field initially
      document.getElementById('authConfirmPassword').value = '';
      confirmField.style.display = 'none';
      // Reset password field
      document.getElementById('authPassword').value = '';
      document.getElementById('authPassword').type = 'password';
      document.getElementById('authPasswordToggle').textContent = '👁️';
      setTimeout(() => document.getElementById('authName').focus(), 50);
    } else {
      nameField.style.display = 'none';
      submitBtn.textContent = 'Sign in';
      suggestBtn.style.display = 'none';
      passwordLabel.textContent = 'Password';
      passwordRequirements.style.display = 'none';
      confirmField.style.display = 'none';
      // Reset password field
      document.getElementById('authPassword').value = '';
      document.getElementById('authPassword').type = 'password';
      document.getElementById('authPasswordToggle').textContent = '👁️';
      const strength = document.getElementById('authPasswordStrength');
      strength.style.display = 'none';
      setTimeout(() => document.getElementById('authPassword').focus(), 50);
    }
  } catch (e) {
    showAuthError('Something went wrong — please try again');
  }
}

function validatePassword(pwd) {
  const errors = [];
  if (pwd.length < 8) errors.push('At least 8 characters');
  if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) errors.push('Mix of upper & lowercase');
  if (!/[0-9]/.test(pwd)) errors.push('At least one number');
  if (!/[!@#$%^&*\-_=+]/.test(pwd)) errors.push('At least one symbol');
  return { valid: errors.length === 0, errors };
}

async function authSubmit() {
  const email    = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  hideAuthError();

  if (!password) { showAuthError('Please enter your password'); return; }

  // NEW USER: extra validation
  if (authIsNewUser) {
    const name = document.getElementById('authName').value.trim();
    if (!name) { showAuthError('Please enter your name'); return; }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.valid) {
      showAuthError('Password requirements not met: ' + validation.errors.join(', '));
      return;
    }

    // Validate passwords match
    const confirm = document.getElementById('authConfirmPassword').value;
    if (password !== confirm) {
      showAuthError('Passwords don\'t match');
      return;
    }
  }

  try {
    let res;
    if (authIsNewUser) {
      const name = document.getElementById('authName').value.trim();
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
    } else {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    }

    const data = await res.json();
    if (!res.ok) { showAuthError(data.detail || 'Authentication failed'); return; }

    storeAuth(data.access_token, data.user);
    hideAuthScreen();
    updateNavbarUser();
    await initApp();
    toast(`Welcome, ${data.user.name}! 👋`);
  } catch (e) {
    showAuthError('Something went wrong — please try again');
  }
}

function authGoBack() {
  document.getElementById('authStep1').style.display = '';
  document.getElementById('authStep2').style.display = 'none';
  document.getElementById('authPassword').value = '';
  document.getElementById('authPassword').type = 'password';
  document.getElementById('authPasswordToggle').textContent = '👁️';
  document.getElementById('authConfirmPassword').value = '';
  document.getElementById('authPasswordStrength').style.display = 'none';
  hideAuthError();
  setTimeout(() => document.getElementById('authEmail').focus(), 50);
}

// ── Password UI functions ──────────────────────────────────────────────────────
function suggestPassword() {
  const pwd = generatePassword(16);
  document.getElementById('authPassword').value = pwd;
  document.getElementById('authConfirmPassword').value = pwd;
  onPasswordInput();
  updateConfirmMatch();
  document.getElementById('authPassword').focus();
}

function togglePasswordVisibility() {
  const field = document.getElementById('authPassword');
  const toggle = document.getElementById('authPasswordToggle');
  if (field.type === 'password') {
    field.type = 'text';
    toggle.textContent = '🔒';
  } else {
    field.type = 'password';
    toggle.textContent = '👁️';
  }
}

function onPasswordInput() {
  const pwd = document.getElementById('authPassword').value;
  const strength = checkPasswordStrength(pwd);
  const fill = document.getElementById('authPasswordStrengthFill');
  const label = document.getElementById('authPasswordStrengthLabel');
  const meter = document.getElementById('authPasswordStrength');

  if (pwd.length > 0) {
    meter.style.display = '';
    fill.style.width = (strength.score * 20) + '%';
    fill.style.background = strength.color;
    label.textContent = strength.label;
    label.style.color = strength.color;
  } else {
    meter.style.display = 'none';
  }

  // Update requirements
  document.getElementById('reqLength').classList.toggle('done', pwd.length >= 8);
  document.getElementById('reqCase').classList.toggle('done', /[a-z]/.test(pwd) && /[A-Z]/.test(pwd));
  document.getElementById('reqDigit').classList.toggle('done', /[0-9]/.test(pwd));
  document.getElementById('reqSymbol').classList.toggle('done', /[!@#$%^&*\-_=+]/.test(pwd));

  // Show confirm field
  if (pwd.length > 0 && authIsNewUser) {
    document.getElementById('authConfirmField').style.display = '';
  }

  updateConfirmMatch();
}

function updateConfirmMatch() {
  if (!authIsNewUser) return;
  const pwd = document.getElementById('authPassword').value;
  const confirm = document.getElementById('authConfirmPassword').value;
  const hint = document.getElementById('authConfirmHint');

  if (confirm.length === 0) { hint.style.display = 'none'; return; }

  if (pwd === confirm) {
    hint.classList.add('success');
    hint.classList.remove('error');
    hint.textContent = '✓ Passwords match';
  } else {
    hint.classList.add('error');
    hint.classList.remove('success');
    hint.textContent = '✗ Passwords don\'t match';
  }
}

function logout() {
  if (!confirm('Sign out of SprintBoard?')) return;
  clearAuth();
  // Reset app state
  view = 'home'; sprint = null; tasks = []; sprintOverview = [];
  document.getElementById('navUser').style.display = 'none';
  showAuthScreen();
}

function updateNavbarUser() {
  if (!currentUser) return;
  const navUser   = document.getElementById('navUser');
  const navAvatar = document.getElementById('navUserAvatar');
  const navName   = document.getElementById('navUserName');
  navAvatar.textContent  = initials(currentUser.name);
  navAvatar.style.background = avatarColor(currentUser.id);
  navName.textContent    = currentUser.name;
  navUser.style.display  = 'flex';
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Wire event listeners once (not inside initApp to avoid duplicates)
  document.getElementById('newTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('usersBtn').addEventListener('click', openUserModal);
  document.getElementById('viewToggle').addEventListener('click', toggleView);

  getStoredAuth();

  if (!authToken) { showAuthScreen(); return; }

  // Verify stored token is still valid
  try {
    const r = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    if (!r.ok) throw new Error();
    const me = await r.json();
    currentUser = me;           // refresh user data from server
    localStorage.setItem('sb_user', JSON.stringify(me));
  } catch (e) {
    clearAuth(); showAuthScreen(); return;
  }

  hideAuthScreen();
  updateNavbarUser();
  await initApp();
}

async function initApp() {
  try {
    await Promise.all([loadUsers(), loadStatuses()]);
    await loadHomeView();
  } catch (e) {
    toast('Failed to initialise app', 'error');
  }
}

// ── Data loaders ──────────────────────────────────────────────────────────────
async function loadUsers()    { users    = await api.get('/api/users/');    }
async function loadStatuses() { statuses = await api.get('/api/statuses/'); }

// ── Home view ─────────────────────────────────────────────────────────────────
async function loadHomeView() {
  try {
    sprintOverview = await api.get('/api/sprints/overview');
    if (!sprintOverview) return;  // 401 redirected
  } catch (e) {
    toast('Failed to load sprints', 'error');
    sprintOverview = [];
  }
  view = 'home';
  renderView();
}

function renderHomeView() {
  const activeSection = document.getElementById('activeSprintSection');
  const pastGrid      = document.getElementById('pastSprintsGrid');
  const pastLabel     = document.getElementById('pastSprintsLabel');
  const noState       = document.getElementById('noSprintsState');
  const subtitle      = document.getElementById('homeSubtitle');

  activeSection.innerHTML = '';
  pastGrid.innerHTML      = '';

  const active = sprintOverview.find(s => s.active);
  const past   = sprintOverview.filter(s => !s.active);

  subtitle.textContent = `${sprintOverview.length} sprint${sprintOverview.length !== 1 ? 's' : ''}`;
  noState.style.display = (sprintOverview.length === 0) ? '' : 'none';

  if (active) activeSection.appendChild(buildSprintCard(active, true));
  if (past.length > 0) {
    pastLabel.style.display = '';
    past.forEach(s => pastGrid.appendChild(buildSprintCard(s, false)));
  } else {
    pastLabel.style.display = 'none';
  }
}

function buildSprintCard(s, isActive) {
  const card = document.createElement('div');
  card.className = 'sprint-card' + (isActive ? ' sprint-card-active' : '');

  const pct   = s.total_tasks > 0 ? Math.round((s.completed_tasks / s.total_tasks) * 100) : 0;
  const start = new Date(s.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end   = new Date(s.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const velStr   = formatVelocityDelta(s.velocity_delta);
  const velClass = velocityClass(s.velocity_delta);

  card.innerHTML = `
    <div class="sprint-card-header">
      <div class="sprint-card-meta">
        ${isActive ? '<span class="sprint-active-badge">Active</span>' : ''}
        <span class="sprint-card-dates">${start} – ${end}</span>
      </div>
      <span class="sprint-card-arrow">→</span>
    </div>
    <h3 class="sprint-card-name">${esc(s.name)}</h3>
    <div class="sprint-kpi-grid">
      <div class="kpi-item">
        <span class="stat-num">${s.total_tasks}</span>
        <span class="stat-lbl">Tasks</span>
      </div>
      <div class="kpi-item">
        <span class="stat-num green">${s.completed_tasks}<span class="kpi-pct">(${pct}%)</span></span>
        <span class="stat-lbl">Completed</span>
      </div>
      <div class="kpi-item">
        <span class="stat-num ${s.overdue_tasks > 0 ? 'red' : ''}">${s.overdue_tasks}</span>
        <span class="stat-lbl">Overdue</span>
      </div>
      <div class="kpi-item">
        <span class="stat-num">${s.rolled_in}</span>
        <span class="stat-lbl">Rolled In</span>
      </div>
      <div class="kpi-item">
        <span class="stat-num ${s.rolled_out > 0 ? 'red' : ''}">${s.rolled_out}</span>
        <span class="stat-lbl">Rolled Out</span>
      </div>
      <div class="kpi-item">
        <span class="stat-num ${velClass}">${velStr}</span>
        <span class="stat-lbl">Velocity</span>
      </div>
    </div>
    <div class="sprint-card-progress-wrap">
      <div class="sprint-card-progress-bar" style="width:${pct}%"></div>
    </div>
  `;
  card.addEventListener('click', () => openSprintBoard(s.id));
  return card;
}

function formatVelocityDelta(delta) {
  if (delta === null || delta === undefined) return '—';
  const sign = delta >= 0 ? '+' : '';
  return sign + Math.round(delta * 100) + '%';
}
function velocityClass(delta) {
  if (delta === null || delta === undefined) return 'velocity-flat';
  if (delta > 0) return 'velocity-up';
  if (delta < 0) return 'velocity-down';
  return 'velocity-flat';
}

// ── Navigation ────────────────────────────────────────────────────────────────
async function openSprintBoard(sprintId) {
  try {
    sprint = await api.get(`/api/sprints/${sprintId}`);
    tasks  = await api.get(`/api/tasks/sprint/${sprintId}`);
    if (!sprint || !tasks) return;  // 401 redirected
    view   = 'kanban';
    renderSprintHeader();
    updateStats();
    renderView();
  } catch (e) {
    toast('Failed to open sprint', 'error');
  }
}
function goHome() {
  view = 'home'; sprint = null;
  renderView();
}
function updateNavbarForView() {
  const isBoard = (view === 'kanban' || view === 'list');
  document.getElementById('navBreadcrumb').style.display = isBoard ? '' : 'none';
  document.getElementById('sprintInfo').style.display    = isBoard ? '' : 'none';
  document.getElementById('viewToggle').style.display    = isBoard ? '' : 'none';
  document.getElementById('newTaskBtn').style.display    = isBoard ? '' : 'none';
  document.getElementById('statsBar').style.display      = isBoard ? '' : 'none';
}

// ── View rendering ────────────────────────────────────────────────────────────
function toggleView() {
  view = (view === 'kanban') ? 'list' : 'kanban';
  document.getElementById('viewToggle').textContent = (view === 'kanban') ? '☰ List' : '⊞ Kanban';
  renderView();
}
function renderView() {
  document.getElementById('homeView').style.display   = (view === 'home')   ? '' : 'none';
  document.getElementById('kanbanView').style.display = (view === 'kanban') ? '' : 'none';
  document.getElementById('listView').style.display   = (view === 'list')   ? '' : 'none';
  updateNavbarForView();
  if (view === 'home')        renderHomeView();
  else if (view === 'kanban') renderKanban();
  else                        renderList();
}

// ── Sprint header (board view) ────────────────────────────────────────────────
function renderSprintHeader() {
  if (!sprint) return;
  const nameEl = document.getElementById('sprintName');
  nameEl.textContent = sprint.name;
  nameEl.title = 'Click to rename'; nameEl.style.cursor = 'pointer';
  nameEl.onclick = renameSprint;

  const start = new Date(sprint.start_date);
  const end   = new Date(sprint.end_date);
  document.getElementById('sprintDates').textContent =
    `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;

  const now = Date.now();
  const pct = Math.min(100, Math.max(0,
    ((now - start.getTime()) / (end.getTime() - start.getTime())) * 100
  ));
  document.getElementById('sprintProgressBar').style.width = pct + '%';
}

// ── Stats (board view) ────────────────────────────────────────────────────────
function updateStats() {
  const completedStatus = statuses.find(s => s.name === 'Completed');
  const now = new Date();
  document.getElementById('statTotal').textContent     = tasks.length;
  document.getElementById('statCompleted').textContent = tasks.filter(t => t.status_id === completedStatus?.id).length;
  document.getElementById('statOverdue').textContent   = tasks.filter(t =>
    t.deadline && new Date(t.deadline) < now && t.status_id !== completedStatus?.id
  ).length;
}

// ── Kanban ────────────────────────────────────────────────────────────────────
function renderKanban() {
  const board = document.getElementById('kanbanView');
  board.innerHTML = '';
  statuses.forEach(status => {
    const colTasks = tasks.filter(t => t.status_id === status.id);
    const col = document.createElement('div');
    col.className = 'kanban-col';
    col.style.setProperty('--col-color', status.color);

    const body = document.createElement('div');
    body.className = 'col-body';
    body.dataset.statusId = status.id;
    body.addEventListener('dragover',  e => { e.preventDefault(); body.classList.add('drag-over'); });
    body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
    body.addEventListener('drop',      e => { body.classList.remove('drag-over'); handleDrop(e, status.id); });

    if (colTasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'col-empty';
      empty.textContent = 'No tasks';
      body.appendChild(empty);
    } else {
      colTasks.forEach(task => body.appendChild(createTaskCard(task)));
    }

    const ghost = document.createElement('button');
    ghost.className = 'add-task-ghost';
    ghost.textContent = '＋ Add task';
    ghost.addEventListener('click', () => openTaskModal(null, status.id));

    col.innerHTML = `
      <div class="col-header">
        <div class="col-title">
          <span class="status-dot" style="background:${status.color}"></span>
          <span>${esc(status.name)}</span>
        </div>
        <span class="task-count">${colTasks.length}</span>
      </div>
    `;
    col.appendChild(body);
    col.appendChild(ghost);
    board.appendChild(col);
  });
}

function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card priority-${task.priority.toLowerCase()}`;
  card.draggable = true;

  const user         = users.find(u => u.id === task.assigned_user_id);
  const completedSubs = (task.subtasks || []).filter(s => s.completed).length;
  const totalSubs    = (task.subtasks || []).length;
  const isOverdue    = task.deadline && new Date(task.deadline) < new Date();
  const deadlineStr  = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;
  const avatarBg = avatarColor(task.assigned_user_id);

  const topDiv = document.createElement('div');
  topDiv.className = 'card-top';
  topDiv.innerHTML = `
    <span class="card-title">${esc(task.title)}</span>
    <div class="card-actions">
      <button class="btn-icon" title="Edit">✏️</button>
      <button class="btn-icon danger" title="Delete">🗑️</button>
    </div>
  `;
  topDiv.querySelector('.btn-icon').addEventListener('click', e => { e.stopPropagation(); openTaskModal(task.id); });
  topDiv.querySelector('.btn-icon.danger').addEventListener('click', e => { e.stopPropagation(); confirmDelete(task.id); });
  card.appendChild(topDiv);

  if (task.description) {
    const desc = document.createElement('div');
    desc.className = 'card-desc';
    const preview = task.description.length > 80 ? task.description.slice(0, 80) + '…' : task.description;
    desc.innerHTML = linkify(preview);
    card.appendChild(desc);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  footer.innerHTML = `
    <div class="card-footer-left">
      <span class="priority-badge priority-${task.priority.toLowerCase()}">${esc(task.priority)}</span>
      ${deadlineStr ? `<span class="deadline${isOverdue ? ' overdue' : ''}">📅 ${deadlineStr}</span>` : ''}
      ${totalSubs > 0 ? `<span class="subtask-progress">✓ ${completedSubs}/${totalSubs}</span>` : ''}
    </div>
    <span class="user-avatar" title="${esc(user?.name || 'Unassigned')}" style="background:${avatarBg}">${initials(user?.name)}</span>
  `;
  card.appendChild(footer);

  card.addEventListener('dragstart', () => { dragTaskId = task.id; card.classList.add('dragging'); });
  card.addEventListener('dragend',   () => card.classList.remove('dragging'));
  card.addEventListener('dblclick',  () => openTaskModal(task.id));
  return card;
}

// ── List View ─────────────────────────────────────────────────────────────────
function renderList() {
  const tbody = document.getElementById('taskTableBody');
  tbody.innerHTML = '';

  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No tasks yet — add one above</td></tr>';
    return;
  }

  // Group tasks by status, preserving status order
  statuses.forEach(status => {
    const group = tasks.filter(t => t.status_id === status.id);
    if (group.length === 0) return;

    // ── Status group header row ──
    const headerTr = document.createElement('tr');
    headerTr.className = 'status-group-header';
    headerTr.innerHTML = `
      <td colspan="6">
        <div class="status-group-label">
          <span class="status-group-dot" style="background:${status.color}"></span>
          <span class="status-group-name" style="color:${status.color}">${esc(status.name)}</span>
          <span class="status-group-count">${group.length}</span>
        </div>
      </td>
    `;
    tbody.appendChild(headerTr);

    // ── Task rows for this group ──
    group.forEach(task => {
      const user      = users.find(u => u.id === task.assigned_user_id);
      const isOverdue = task.deadline && new Date(task.deadline) < new Date();
      const avatarBg  = avatarColor(task.assigned_user_id);
      const subs      = task.subtasks || [];
      const hasSubs   = subs.length > 0;
      const doneCount = subs.filter(s => s.completed).length;

      // ── Task row ──
      const tr = document.createElement('tr');
      tr.className = 'task-list-row';
      tr.innerHTML = `
        <td>
          <div class="list-title-cell">
            <button class="subtask-chevron${hasSubs ? '' : ' invisible'}" aria-label="Toggle subtasks">
              <svg viewBox="0 0 10 10" width="10" height="10"><path d="M2 3 L5 7 L8 3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <span class="priority-badge priority-${task.priority.toLowerCase()}">${esc(task.priority)}</span>
            <span class="clickable list-task-title">${esc(task.title)}</span>
            ${hasSubs ? `<span class="subtask-chip">${doneCount}/${subs.length}</span>` : ''}
          </div>
        </td>
        <td>
          <span class="user-avatar sm" style="background:${avatarBg}">${initials(user?.name)}</span>
          <span style="margin-left:0.4rem">${esc(user?.name || 'Unassigned')}</span>
        </td>
        <td>
          <div class="status-select-wrap" style="background:${status.color}18;border:1px solid ${status.color}40;border-radius:99px">
            <select class="status-select-inline status-change-select" style="color:${status.color}" data-task-id="${task.id}">
              ${statuses.map(s => `<option value="${s.id}" ${s.id === task.status_id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select>
          </div>
        </td>
        <td>${esc(task.priority)}</td>
        <td class="${isOverdue ? 'overdue-text' : ''}">${task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}</td>
        <td>
          <button class="btn-icon edit-btn">✏️</button>
          <button class="btn-icon danger del-btn">🗑️</button>
        </td>
      `;

      // ── Subtask accordion row ──
      const subTr = document.createElement('tr');
      subTr.className = 'subtask-accordion-row';
      subTr.style.display = 'none';
      subTr.innerHTML = `
        <td colspan="6" class="subtask-accordion-cell">
          <ul class="subtask-accordion-list">
            ${subs.map(s => `
              <li class="subtask-accordion-item${s.completed ? ' done' : ''}">
                <span class="subtask-acc-check">${s.completed ? '✓' : '○'}</span>
                <span class="subtask-acc-title">${esc(s.title)}</span>
              </li>`).join('')}
          </ul>
        </td>
      `;

      // ── Wire events ──
      tr.querySelector('.list-task-title').addEventListener('click', () => openTaskModal(task.id));
      tr.querySelector('.edit-btn').addEventListener('click',        () => openTaskModal(task.id));
      tr.querySelector('.del-btn').addEventListener('click',         () => confirmDelete(task.id));

      // Inline status change → re-render list to move task to new group
      tr.querySelector('.status-change-select').addEventListener('change', async function () {
        const newStatusId = parseInt(this.value);
        try {
          await api.put(`/api/tasks/${task.id}`, { status_id: newStatusId });
          tasks = await api.get(`/api/tasks/sprint/${sprint.id}`);
          updateStats();
          renderList();
          toast('Status updated');
        } catch (e) { toast('Failed to update status', 'error'); renderList(); }
      });

      if (hasSubs) {
        const chevron = tr.querySelector('.subtask-chevron');
        chevron.addEventListener('click', () => {
          const open = subTr.style.display !== 'none';
          subTr.style.display = open ? 'none' : '';
          chevron.classList.toggle('open', !open);
          tr.classList.toggle('accordion-open', !open);
        });
      }

      tbody.appendChild(tr);
      tbody.appendChild(subTr);
    });
  });
}

// ── Drag & Drop ───────────────────────────────────────────────────────────────
async function handleDrop(e, statusId) {
  e.preventDefault();
  if (!dragTaskId) return;
  try {
    await api.put(`/api/tasks/${dragTaskId}`, { status_id: statusId });
    tasks = await api.get(`/api/tasks/sprint/${sprint.id}`);
    updateStats(); renderKanban(); dragTaskId = null;
  } catch (err) { toast('Failed to move task', 'error'); }
}

// ── Task Modal ────────────────────────────────────────────────────────────────
function openTaskModal(taskId = null, statusId = null) {
  editTaskId = taskId; defaultStatusId = statusId; modalSubtasks = [];
  document.getElementById('taskForm').reset();
  document.getElementById('subtasksList').innerHTML = '';
  populateSelects();
  if (taskId) {
    document.getElementById('modalTitle').textContent = 'Edit Task';
    loadTaskIntoModal(taskId);
  } else {
    document.getElementById('modalTitle').textContent = 'New Task';
    if (statusId) document.getElementById('taskStatus').value = statusId;
  }
  // Hide comments for new tasks; shown by loadTaskIntoModal for existing ones
  document.getElementById('commentsBlock').style.display = 'none';
  document.getElementById('commentsList').innerHTML = '';
  document.getElementById('commentInput').value = '';
  document.getElementById('taskModal').classList.add('open');
}
async function loadTaskIntoModal(taskId) {
  try {
    const task = await api.get(`/api/tasks/${taskId}`);
    if (!task) return;
    document.getElementById('taskTitle').value       = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskUser').value        = task.assigned_user_id;
    document.getElementById('taskStatus').value      = task.status_id;
    document.getElementById('taskPriority').value    = task.priority;
    if (task.deadline) {
      const d = new Date(task.deadline);
      document.getElementById('taskDeadline').value =
        new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    modalSubtasks = (task.subtasks || []).map(s => ({ ...s, _new: false, _deleted: false }));
    renderModalSubtasks();
    // Show comments section for existing tasks
    document.getElementById('commentsBlock').style.display = '';
    if (currentUser) {
      const av = document.getElementById('commentAvatar');
      av.textContent = initials(currentUser.name);
      av.style.background = avatarColor(currentUser.id);
    }
    await loadComments(taskId);
  } catch (err) { toast('Failed to load task', 'error'); }
}
function populateSelects() {
  document.getElementById('taskUser').innerHTML =
    (users.length === 0 ? '<option value="">No users — add via Team</option>' : '<option value="">Select user...</option>') +
    users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('');
  document.getElementById('taskStatus').innerHTML =
    statuses.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
}
function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('open');
  editTaskId = null; modalSubtasks = [];
}
async function saveTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { toast('Title is required', 'error'); return; }
  const userId = parseInt(document.getElementById('taskUser').value);
  if (!userId) { toast('Please assign a user', 'error'); return; }

  document.querySelectorAll('#subtasksList .subtask-row-stack').forEach((row, idx) => {
    if (!modalSubtasks[idx]) return;
    const titleInp = row.querySelector('.subtask-input');
    const descInp  = row.querySelector('.subtask-desc-input');
    if (titleInp) modalSubtasks[idx].title       = titleInp.value.trim();
    if (descInp)  modalSubtasks[idx].description = descInp.value.trim() || null;
  });
  const data = {
    title,
    description:      document.getElementById('taskDescription').value.trim() || null,
    assigned_user_id: userId,
    status_id:        parseInt(document.getElementById('taskStatus').value),
    priority:         document.getElementById('taskPriority').value,
    deadline:         document.getElementById('taskDeadline').value || null,
  };
  try {
    let taskId = editTaskId;
    if (taskId) {
      await api.put(`/api/tasks/${taskId}`, data);
    } else {
      const newTask = await api.post(`/api/tasks/?sprint_id=${sprint.id}`, data);
      taskId = newTask.id;
    }
    for (const sub of modalSubtasks) {
      if (sub._new && !sub._deleted && sub.title)
        await api.post(`/api/tasks/${taskId}/subtasks`, { title: sub.title, completed: sub.completed });
      else if (!sub._new && sub._deleted && sub.id)
        await api.del(`/api/tasks/subtask/${sub.id}`);
      else if (!sub._new && !sub._deleted && sub.id && sub.title)
        await api.put(`/api/tasks/subtask/${sub.id}`, { title: sub.title, completed: sub.completed });
    }
    closeTaskModal();
    tasks = await api.get(`/api/tasks/sprint/${sprint.id}`);
    updateStats(); renderView();
    toast(editTaskId ? 'Task updated' : 'Task created');
  } catch (err) { toast('Failed to save: ' + err.message, 'error'); }
}
async function confirmDelete(taskId) {
  if (!confirm('Delete this task?')) return;
  try {
    await api.del(`/api/tasks/${taskId}`);
    tasks = await api.get(`/api/tasks/sprint/${sprint.id}`);
    updateStats(); renderView(); toast('Task deleted');
  } catch (err) { toast('Failed to delete task', 'error'); }
}

// ── Subtasks in modal ─────────────────────────────────────────────────────────
function renderModalSubtasks() {
  const list = document.getElementById('subtasksList');
  list.innerHTML = '';
  modalSubtasks.forEach((sub, idx) => {
    if (sub._deleted) return;
    const row = document.createElement('div');
    row.className = 'subtask-row subtask-row-stack';
    row.innerHTML = `
      <div class="subtask-row-top">
        <input type="checkbox" ${sub.completed ? 'checked' : ''}>
        <input type="text" class="subtask-input ${sub.completed ? 'done' : ''}" value="${esc(sub.title)}" placeholder="Subtask title">
        <button type="button" class="subtask-del">×</button>
      </div>
      <textarea class="subtask-desc-input" rows="1" placeholder="Add a note… (optional)">${esc(sub.description || '')}</textarea>
    `;
    const cb   = row.querySelector('input[type="checkbox"]');
    const inp  = row.querySelector('.subtask-input');
    const desc = row.querySelector('.subtask-desc-input');

    cb.addEventListener('change', () => { modalSubtasks[idx].completed = cb.checked; inp.classList.toggle('done', cb.checked); });
    inp.addEventListener('input',  () => { modalSubtasks[idx].title = inp.value; });
    desc.addEventListener('input', () => {
      modalSubtasks[idx].description = desc.value || null;
      // Auto-grow up to 2 rows
      desc.rows = Math.min(2, desc.value.split('\n').length || 1);
    });
    row.querySelector('.subtask-del').addEventListener('click', () => {
      if (sub._new) modalSubtasks.splice(idx, 1);
      else modalSubtasks[idx]._deleted = true;
      renderModalSubtasks();
    });
    list.appendChild(row);
  });
}
function addSubtaskRow() {
  modalSubtasks.push({ id: null, title: '', description: null, completed: false, _new: true, _deleted: false });
  renderModalSubtasks();
  const inputs = document.querySelectorAll('#subtasksList .subtask-input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

// ── Sprint management ─────────────────────────────────────────────────────────
async function createNewSprint() {
  const name = prompt('Sprint name:', `Sprint ${new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`);
  if (!name) return;
  try {
    const newSprint = await api.post('/api/sprints/', { name });
    if (!newSprint) return;
    sprintOverview  = await api.get('/api/sprints/overview') || sprintOverview;
    sprint = newSprint;
    tasks  = await api.get(`/api/tasks/sprint/${newSprint.id}`) || [];
    view   = 'kanban';
    renderSprintHeader(); updateStats(); renderView();
    toast('New sprint created!');
  } catch (err) { toast('Failed to create sprint', 'error'); }
}
async function renameSprint() {
  if (!sprint) return;
  const name = prompt('Rename sprint:', sprint.name);
  if (!name || name === sprint.name) return;
  try {
    sprint = await api.put(`/api/sprints/${sprint.id}/rename`, { name });
    if (!sprint) return;
    renderSprintHeader();
    sprintOverview = await api.get('/api/sprints/overview') || sprintOverview;
    toast('Sprint renamed');
  } catch (err) { toast('Failed to rename', 'error'); }
}

// ── User modal ────────────────────────────────────────────────────────────────
function openUserModal()  { renderUserList(); document.getElementById('userModal').classList.add('open'); }
function closeUserModal() { document.getElementById('userModal').classList.remove('open'); }

function renderUserList() {
  const list = document.getElementById('userList');
  list.innerHTML = users.length === 0
    ? '<div class="empty-state" style="padding:1rem">No team members yet</div>'
    : users.map(u => `
        <div class="user-row">
          <span class="user-avatar" style="background:${avatarColor(u.id)}">${initials(u.name)}</span>
          <div class="user-info">
            <strong>${esc(u.name)}</strong>
            <span>${esc(u.email)}</span>
          </div>
        </div>`).join('');
}
async function addUser(e) {
  e.preventDefault();
  const name  = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  if (!name || !email) return;
  try {
    const user = await api.post('/api/users/', { name, email });
    if (!user) return;
    users.push(user);
    document.getElementById('addUserForm').reset();
    renderUserList();
    toast(`${name} added to team`);
  } catch (err) { toast('Failed — email may already exist', 'error'); }
}

// ── Close modals on overlay click ─────────────────────────────────────────────
document.addEventListener('click', e => {
  if (e.target.id === 'taskModal')    closeTaskModal();
  if (e.target.id === 'userModal')    closeUserModal();
  if (e.target.id === 'profileModal') closeProfileModal();
});

// ── Comments ───────────────────────────────────────────────────────────────────
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function loadComments(taskId) {
  try {
    const comments = await api.get(`/api/tasks/${taskId}/comments`);
    if (!comments) return;
    renderComments(comments, taskId);
  } catch (e) { /* silently fail */ }
}

function renderComments(comments, taskId) {
  const list  = document.getElementById('commentsList');
  const count = document.getElementById('commentsCount');
  count.textContent = comments.length > 0 ? `${comments.length}` : '';
  list.innerHTML = '';

  if (comments.length === 0) {
    list.innerHTML = '<div class="comments-empty">No comments yet — be the first!</div>';
    return;
  }

  comments.forEach(c => {
    const isOwn = currentUser && c.author.id === currentUser.id;
    const row = document.createElement('div');
    row.className = 'comment-row';
    row.innerHTML = `
      <span class="user-avatar sm comment-avatar" style="background:${avatarColor(c.author.id)}">${esc(initials(c.author.name))}</span>
      <div class="comment-bubble">
        <div class="comment-meta">
          <strong class="comment-author">${esc(c.author.name)}</strong>
          <span class="comment-time">${relativeTime(c.created_at)}</span>
        </div>
        <div class="comment-body">${esc(c.content)}</div>
      </div>
      ${isOwn ? `<button class="btn-icon danger comment-del-btn" title="Delete comment">🗑️</button>` : '<span style="width:28px;flex-shrink:0"></span>'}
    `;
    if (isOwn) {
      row.querySelector('.comment-del-btn').addEventListener('click', () => deleteComment(c.id, taskId));
    }
    list.appendChild(row);
  });

  // Auto-scroll to latest
  list.scrollTop = list.scrollHeight;
}

async function submitComment() {
  const input   = document.getElementById('commentInput');
  const content = input.value.trim();
  if (!content || !editTaskId) return;

  const btn = document.querySelector('.comment-post-btn');
  btn.disabled = true;
  try {
    await api.post(`/api/tasks/${editTaskId}/comments`, { content });
    input.value = '';
    await loadComments(editTaskId);
  } catch (e) {
    toast('Failed to post comment', 'error');
  } finally {
    btn.disabled = false;
    input.focus();
  }
}

async function deleteComment(commentId, taskId) {
  if (!confirm('Delete this comment?')) return;
  try {
    await api.del(`/api/comments/${commentId}`);
    await loadComments(taskId);
  } catch (e) { toast('Failed to delete comment', 'error'); }
}

// ── Profile modal ──────────────────────────────────────────────────────────────
function openProfileModal() {
  if (!currentUser) return;
  document.getElementById('profileName').value    = currentUser.name || '';
  document.getElementById('profileSlackId').value = currentUser.slack_member_id || '';
  _updateSlackStatus(currentUser.slack_member_id);
  document.getElementById('profileModal').classList.add('open');
}
function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('open');
}
function _updateSlackStatus(slackId) {
  const el = document.getElementById('profileSlackStatus');
  if (slackId) {
    el.style.display = '';
    el.className = 'slack-status connected';
    el.textContent = '✓ Slack connected — you will receive DMs';
  } else {
    el.style.display = 'none';
  }
}
async function saveProfile() {
  const name    = document.getElementById('profileName').value.trim();
  const slackId = document.getElementById('profileSlackId').value.trim();
  if (!name) { toast('Name cannot be empty', 'error'); return; }
  try {
    const updated = await api.put(`/api/users/${currentUser.id}`, { name, slack_member_id: slackId || null });
    if (!updated) return;
    currentUser = { ...currentUser, name: updated.name, slack_member_id: updated.slack_member_id };
    localStorage.setItem('sb_user', JSON.stringify(currentUser));
    updateNavbarUser();
    _updateSlackStatus(updated.slack_member_id);
    await loadUsers();  // refresh team list
    closeProfileModal();
    toast('Profile saved');
  } catch (e) { toast('Failed to save profile', 'error'); }
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();
