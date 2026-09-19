const API_TESTS = {
  bola: {
    id: 'bola',
    name: 'BOLA / IDOR',
    short: 'API1:2023',
    icon: '👤',
    description: 'Review whether object-level access checks are enforced consistently and whether the user can access another record without authorization.',
    summary: ['Object ID validation', 'User-to-resource ownership check', 'Permission boundary review'],
    defaultEndpoint: '/api/incidents'
  },
  auth: {
    id: 'auth',
    name: 'Broken Authentication',
    short: 'API2:2023',
    icon: '🔑',
    description: 'Validate token handling, expiry, replay resistance, and whether weak or shared credentials can authenticate against protected endpoints.',
    summary: ['Token integrity checks', 'Session replay validation', 'Credential rotation review'],
    defaultEndpoint: '/api/facie/status'
  },
  bplra: {
    id: 'bplra',
    name: 'BPLRA',
    short: 'API3:2023',
    icon: '👁️',
    description: 'Inspect whether the API exposes unnecessary fields, leaked properties, or over-fetches data beyond the requested scope and role.',
    summary: ['Field exposure check', 'Property-level access trace', 'Response minimization review'],
    defaultEndpoint: '/api/incidents'
  },
  unrestricted: {
    id: 'unrestricted',
    name: 'Unrestricted Resource Consumption',
    short: 'API4:2023',
    icon: '⚡',
    description: 'Measure whether rate limiting, payload ceilings, and retry loops can exhaust infrastructure, memory, or downstream dependencies.',
    summary: ['Rate limit scan', 'Payload size validation', 'Retry abuse detection'],
    defaultEndpoint: '/api/stats'
  }
};

const state = {
  selectedIncident: null,
  activeTestId: 'bola',
  socket: null
};

const $ = (selector) => document.querySelector(selector);

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function notify(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function setConnectionState(stateValue) {
  const status = $('#connStatus');
  if (!status) return;
  status.classList.toggle('connected', stateValue === 'up');
  $('#connLabel').textContent = stateValue === 'up' ? 'Connected' : stateValue === 'down' ? 'Reconnecting...' : 'Connecting...';
}

function loadSidebar() {
  const nav = $('#security-nav');
  if (!nav) return;
  nav.innerHTML = Object.values(API_TESTS).map((test) => `
    <button class="security-item ${state.activeTestId === test.id ? 'active' : ''}" type="button" data-test-id="${test.id}">
      <span class="security-icon">${test.icon}</span>
      <span class="security-copy">
        <span class="security-name">${test.name}</span>
        <span class="security-meta">${test.short}</span>
      </span>
    </button>
  `).join('');

  nav.querySelectorAll('.security-item').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTest(button.dataset.testId);
    });
  });
}

function setActiveTest(testId) {
  const test = API_TESTS[testId];
  if (!test) return;
  state.activeTestId = testId;
  loadSidebar();

  $('#active-test-title').textContent = test.name;
  $('#test-description').textContent = test.description;
  $('#test-summary-list').innerHTML = test.summary.map((item) => `
    <div class="summary-item"><strong>Check</strong><span>${esc(item)}</span></div>
  `).join('');
  $('#test-endpoint').value = test.defaultEndpoint;
  $('#test-status').textContent = 'Ready';
}

function openGuideModal() {
  const modal = $('#guide-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeGuideModal() {
  const modal = $('#guide-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function getHeadersFromInput(raw) {
  const headers = {};
  if (!raw) return headers;
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes(':')) return;
    const [key, ...rest] = trimmed.split(':');
    const value = rest.join(':').trim();
    if (key && value) headers[key.trim()] = value;
  });
  return headers;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function actionClass(action = 'ALLOW') {
  const value = String(action).toLowerCase();
  if (value.includes('allow')) return 'allow';
  if (value.includes('block')) return 'block';
  if (value.includes('rate')) return 'rate-limit';
  if (value.includes('challenge') || value.includes('review')) return 'review';
  return 'monitor';
}

function severity(score) {
  return score >= 70 ? 'high' : score >= 40 ? 'med' : 'low';
}

function renderStats(stats) {
  const ready = stats?.facie?.status === 'ready';
  const cards = [
    ['APIs protected', stats.apis_protected || 0],
    ['Requests', stats.requests || 0],
    ['Threats', stats.threats || 0],
    ['Blocked', stats.blocked || 0, 'green'],
    ['Critical', stats.critical || 0, 'red'],
    ['Facie engine', ready ? `Ready · ${stats.facie.states || 0} states` : 'Offline', ready ? 'green' : 'red']
  ];

  const statsArea = $('#stats');
  if (!statsArea) return;
  statsArea.innerHTML = cards.map(([label, value, tone]) => `
    <div class="stat">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value ${tone || ''}">${esc(value)}</div>
      ${label === 'Facie engine' && ready ? '<div class="stat-sub">Adaptive policy engine online</div>' : ''}
    </div>
  `).join('');
}

function renderIncidents(items) {
  const incidentCount = $('#incidentCount');
  const emptyState = $('#emptyState');
  const tableBody = $('#incidents');
  if (!incidentCount || !tableBody) return;

  incidentCount.textContent = `${items.length} recent`;
  emptyState.hidden = items.length > 0;

  tableBody.innerHTML = items.map((item) => {
    const risk = Number(item.risk_score || 0);
    const selected = state.selectedIncident && Number(item.id) === Number(state.selectedIncident.id);
    return `
      <tr class="${selected ? 'selected' : ''}" data-id="${item.id}" aria-label="Show incident ${item.id}">
        <td class="id">INC-${esc(item.id)}</td>
        <td>${esc(item.threat_type)}</td>
        <td class="endpoint" title="${esc(item.endpoint)}">${esc(item.endpoint)}</td>
        <td>
          <div class="risk-cell">
            <span class="risk-num">${risk}</span>
            <span class="risk-bar"><span class="risk-fill" style="width:${Math.min(100, risk)}%"></span></span>
          </div>
        </td>
        <td><span class="pill ${actionClass(item.ai_action || item.action)}">${esc(item.ai_action || item.action)}</span></td>
        <td><span class="pill ${actionClass(item.action)}">${esc(item.action)}</span></td>
      </tr>
    `;
  }).join('');

  tableBody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', () => {
      showIncident(Number(row.dataset.id));
    });
  });
}

async function loadDashboard(manual = false) {
  try {
    const [stats, incidents] = await Promise.all([
      fetchJson('/api/stats'),
      fetchJson('/api/incidents')
    ]);
    renderStats(stats);
    renderIncidents(incidents);
    setConnectionState('up');
    if (manual) notify('Telemetry refreshed');
  } catch (error) {
    setConnectionState('down');
    if (manual) notify('Sentinel API unavailable');
  }
}

async function showIncident(id) {
  try {
    const incident = await fetchJson(`/api/incidents/${id}`);
    const events = await fetchJson('/api/events');
    const event = events.find((item) => item.id === incident.event_id);
    const risk = Number(incident.risk_score || 0);

    state.selectedIncident = incident;
    renderIncidents(await fetchJson('/api/incidents'));

    const detail = $('#detail');
    if (detail) {
      detail.classList.add('open');
      $('#detail-title').textContent = `INCIDENT #${id}`;
      $('#detail-endpoint').textContent = incident.endpoint;
      $('#detail-threat').textContent = incident.threat_type;
      $('#detail-confidence').textContent = incident.ai_confidence ? `${Math.round(incident.ai_confidence * 100)}%` : 'n/a';
      $('#detail-action').textContent = incident.action;
      $('#detail-risk').textContent = `${risk}/100`;
      const isLowRisk = risk < 30;
      $('#detail-recommendation').hidden = !isLowRisk;
      $('#detail-recommendation').textContent = isLowRisk
        ? 'Low-risk incident: apply a temporary rate limit after human approval.'
        : 'Choose an action after reviewing the evidence and risk score.';
      $('#rate-limit-button').classList.toggle('recommended', isLowRisk);
      $('#gaugeArc').style.stroke = risk >= 70 ? 'var(--red)' : risk >= 40 ? 'var(--amber)' : 'var(--green)';
      $('#gaugeArc').style.strokeDashoffset = 314.16 - (314.16 * risk / 100);
      $('#detail-reasons').innerHTML = (event?.reason || incident.ai_reason || 'Security rule matched').split('; ').map((reason) => `<li>${esc(reason)}</li>`).join('');
    }
  } catch (error) {
    notify('Unable to load incident details');
  }
}

async function overrideIncident(action) {
  if (!state.selectedIncident) return;
  try {
    await fetchJson(`/api/incidents/${state.selectedIncident.id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: 'Reviewed in Sentinel dashboard', reviewer: 'dashboard-user' })
    });
    notify(`Incident action changed to ${action}`);
    await loadDashboard();
    await showIncident(state.selectedIncident.id);
  } catch (error) {
    notify('Unable to update incident');
  }
}

function startSocket() {
  if (window.location.hostname.endsWith('.vercel.app')) {
    setConnectionState('up');
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const target = `${protocol}://${window.location.host}/ws/events`;

  try {
    state.socket = new WebSocket(target);
    state.socket.onopen = () => setConnectionState('up');
    state.socket.onmessage = () => loadDashboard();
    state.socket.onclose = () => {
      setConnectionState('down');
      setTimeout(startSocket, 2000);
    };
    state.socket.onerror = () => {
      if (state.socket) state.socket.close();
    };
  } catch (error) {
    setConnectionState('down');
  }
}

function parseResultOutcome(result, targetTest) {
  if (targetTest.id === 'unrestricted') return result.ok ? 'THROTTLED' : 'BLOCKED';
  return result.ok ? 'PASS' : 'BLOCKED';
}

async function runApiSecurityTest() {
  const test = API_TESTS[state.activeTestId];
  const endpoint = $('#test-endpoint')?.value?.trim() || test.defaultEndpoint;
  const token = $('#test-token')?.value?.trim() || '';
  const requestCount = Number($('#test-count')?.value || 1);
  const rawHeaders = $('#test-headers')?.value || '';
  const headers = getHeadersFromInput(rawHeaders);
  const statusPill = $('#test-status');
  const results = $('#test-results');

  if (!results || !statusPill) return;

  if (token) {
    headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  statusPill.textContent = 'Running';
  results.innerHTML = '<div class="log-entry">Preparing request sequence…</div>';

  const attempts = [];
  const maxAttempts = Math.min(Math.max(requestCount, 1), 10);

  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const method = test.id === 'unrestricted' ? 'POST' : 'GET';
      const payload = test.id === 'unrestricted' ? { payload: 'X'.repeat(2048 * (i + 1)) } : undefined;
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: payload ? JSON.stringify(payload) : undefined
      });
      const result = {
        ok: response.ok,
        status: response.status,
        message: await response.text()
      };
      attempts.push({ ok: result.ok, label: `${i + 1}/${maxAttempts}`, details: `${result.status} · ${parseResultOutcome(result, test)} · ${test.name}` });
      results.innerHTML = attempts.map((entry) => `
        <div class="log-entry ${entry.ok ? '' : 'error'}">
          ${esc(entry.label)} — ${esc(entry.details)}
        </div>
      `).join('');
    } catch (error) {
      attempts.push({ ok: false, label: `${i + 1}/${maxAttempts}`, details: `Request error · ${error.message}` });
      results.innerHTML = attempts.map((entry) => `
        <div class="log-entry error">
          ${esc(entry.label)} — ${esc(entry.details)}
        </div>
      `).join('');
    }
  }

  const outcome = attempts.some((entry) => entry.ok === false) ? 'Review' : 'Pass';
  statusPill.textContent = outcome;
  notify(`${test.name} test sequence completed`);
}

function bindModalAndControls() {
  $('#api-guide-button')?.addEventListener('click', openGuideModal);
  $('#close-guide-button')?.addEventListener('click', closeGuideModal);
  $('#guide-cta')?.addEventListener('click', closeGuideModal);
  $('#run-test-button')?.addEventListener('click', runApiSecurityTest);
  $('#guide-modal')?.addEventListener('click', (event) => {
    if (event.target === $('#guide-modal')) closeGuideModal();
  });
}

function init() {
  loadSidebar();
  setActiveTest(state.activeTestId);
  bindModalAndControls();
  loadDashboard();
  startSocket();
  setInterval(() => loadDashboard(), 15000);
}

window.refreshDashboard = loadDashboard;
window.overrideIncident = overrideIncident;

document.addEventListener('DOMContentLoaded', init);
