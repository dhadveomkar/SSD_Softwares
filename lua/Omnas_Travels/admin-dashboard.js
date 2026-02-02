// admin-dashboard.js (token-aware — replace your current file with this)
const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  // if admin protected endpoints require token, ensure we have one, else redirect
  const token = localStorage.getItem('adminToken');
  if (!token) {
    // no token - go to login first
    console.warn('No admin token found — redirecting to admin login.');
    location.href = '/admin-login.html';
    return;
  }
  initAdmin();
});

async function sendAuth(url, opts = {}) {
  opts.headers = opts.headers || {};
  const token = localStorage.getItem('adminToken');
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  return fetch(url, opts);
}

async function initAdmin() {
  await loadCities();
  await loadTrips();

  document.getElementById('addCityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('cityName');
    const name = (nameEl.value || '').trim();
    if (!name) {
      alert('Enter city name');
      nameEl.focus();
      return;
    }
    try {
      const res = await sendAuth(API_BASE + '/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      // debug: log status and response text if non-JSON
      let j = {};
      try { j = await res.json(); } catch (e) { j = { error: 'invalid json in response' }; }

      if (res.status === 201 || res.ok) {
        alert('City added');
        nameEl.value = '';
        await loadCities();
        await loadTrips(); // refresh selects
      } else if (res.status === 401) {
        alert('Unauthorized — your admin session may have expired. Redirecting to login.');
        localStorage.removeItem('adminToken');
        location.href = '/admin-login.html';
      } else {
        console.error('Add city failed', res.status, j);
        alert('Error: ' + (j.error || JSON.stringify(j)));
      }
    } catch (err) {
      console.error('Network or fetch error adding city', err);
      alert('Request failed — is the server running at ' + API_BASE + '?');
    }
  });

  const addTripForm = document.getElementById('addTripForm');
  if (addTripForm) {
    addTripForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        from: document.getElementById('tripFrom').value,
        to: document.getElementById('tripTo').value,
        date: document.getElementById('tripDate').value,
        depart: document.getElementById('tripDepart').value,
        busType: document.getElementById('tripType').value,
        serviceNo: document.getElementById('tripService').value,
        journeyTime: document.getElementById('tripDur').value,
        seats: Number(document.getElementById('tripSeats').value || 0),
        price: Number(document.getElementById('tripPrice').value || 0)
      };
      if (!payload.from || !payload.to || !payload.date) {
        alert('from/to/date required');
        return;
      }
      try {
        const res = await sendAuth(API_BASE + '/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        let j = {};
        try { j = await res.json(); } catch (e) { j = { error: 'invalid json' }; }
        if (res.status === 201 || res.ok) {
          alert('Trip added');
          addTripForm.reset();
          await loadTrips();
        } else if (res.status === 401) {
          alert('Unauthorized — redirecting to login.');
          localStorage.removeItem('adminToken');
          location.href = '/admin-login.html';
        } else {
          console.error('Add trip failed', res.status, j);
          alert('Error: ' + (j.error || JSON.stringify(j)));
        }
      } catch (err) {
        console.error('Network or fetch error adding trip', err);
        alert('Request failed — is the server running?');
      }
    });
  }
}

async function loadCities() {
  try {
    const r = await fetch(API_BASE + '/api/routes');
    const j = await r.json().catch(() => ({}));
    const list = document.getElementById('citiesList');
    const from = document.getElementById('tripFrom');
    const to = document.getElementById('tripTo');
    if (list) list.innerHTML = '';
    if (from) from.innerHTML = '';
    if (to) to.innerHTML = '';
    if (!j.cities || j.cities.length === 0) {
      if (list) list.innerText = 'No cities.';
      return;
    }
    j.cities.forEach(c => {
      const el = document.createElement('span');
      el.style.marginRight = '8px';
      el.innerText = c;
      if (list) list.appendChild(el);
      if (from) from.appendChild(new Option(c, c));
      if (to) to.appendChild(new Option(c, c));
    });
  } catch (err) {
    console.warn('Could not load cities', err);
    const list = document.getElementById('citiesList');
    if (list) list.innerText = 'Failed to load cities.';
  }
}

async function loadTrips() {
  try {
    const r = await fetch(API_BASE + '/api/trips');
    const j = await r.json().catch(() => ({}));
    const container = document.getElementById('tripsList');
    if (!container) return;
    container.innerHTML = '';
    if (!j.trips || j.trips.length === 0) { container.innerText = 'No trips.'; return; }
    j.trips.forEach(trip => {
      const row = document.createElement('div');
      row.className = 'trip-row';
      const depart = trip.depart || '';
      const busType = trip.busType || '';
      const serviceNo = trip.serviceNo || '';
      const journeyTime = trip.journeyTime || '';
      row.innerHTML = `<div>
          <div style="font-weight:700">${trip.from} → ${trip.to} • ${trip.date}</div>
          <div class="muted">${depart} • ${busType} • ${serviceNo} • ${journeyTime}</div>
        </div>`;
      const actions = document.createElement('div');
      const del = document.createElement('button');
      del.className = 'danger';
      del.innerText = 'Delete';
      del.addEventListener('click', async () => {
        if (!confirm('Delete trip #' + trip.id + '?')) return;
        try {
          const url = API_BASE + '/api/trips?id=' + encodeURIComponent(trip.id);
          const resp = await sendAuth(url, { method: 'DELETE' });
          const jj = await resp.json().catch(() => ({}));
          if (resp.ok) {
            alert('Deleted');
            await loadTrips();
          } else if (resp.status === 401) {
            alert('Unauthorized — redirecting to login');
            localStorage.removeItem('adminToken'); location.href = '/admin-login.html';
          } else {
            alert('Error: ' + (jj.error || JSON.stringify(jj)));
          }
        } catch (e) {
          console.error(e);
          alert('Delete failed');
        }
      });
      actions.appendChild(del);
      row.appendChild(actions);
      container.appendChild(row);
    });
  } catch (err) {
    console.warn('Could not load trips', err);
    const container = document.getElementById('tripsList');
    if (container) container.innerText = 'Failed to load trips.';
  }
}
