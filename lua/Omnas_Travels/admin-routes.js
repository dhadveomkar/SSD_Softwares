// admin-routes.js (updated to use admin token)
const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  // if not logged in as admin, redirect to admin login
  const token = localStorage.getItem('adminToken');
  if (!token) {
    location.href = '/admin-login.html';
    return;
  }
  initAdmin();
});

async function sendAuth(url, opts)
{
  opts = opts || {};
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
    const name = document.getElementById('cityName').value.trim();
    if (!name) return alert('Enter city name');
    try {
      const res = await sendAuth(API_BASE + '/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const j = await res.json().catch(()=>({}));
      if (res.status === 201 || res.ok) {
        alert('City added');
        document.getElementById('cityName').value = '';
        await loadCities();
        await loadTrips();
      } else if (res.status === 401) {
        alert('Unauthorized — your session may have expired. Redirecting to login.');
        localStorage.removeItem('adminToken');
        location.href = '/admin-login.html';
      } else {
        alert('Error: ' + (j.error || JSON.stringify(j)));
      }
    } catch (err) { console.error(err); alert('Request failed'); }
  });

  document.getElementById('addTripForm').addEventListener('submit', async (e) => {
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
    if (!payload.from || !payload.to || !payload.date) return alert('from/to/date required');
    try {
      const res = await sendAuth(API_BASE + '/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await res.json().catch(()=>({}));
      if (res.status === 201 || res.ok) {
        alert('Trip added');
        document.getElementById('addTripForm').reset();
        await loadTrips();
      } else if (res.status === 401) {
        alert('Unauthorized — redirecting to login.');
        localStorage.removeItem('adminToken');
        location.href = '/admin-login.html';
      } else {
        alert('Error: ' + (j.error || JSON.stringify(j)));
      }
    } catch (err) { console.error(err); alert('Request failed'); }
  });
}

async function loadCities() {
  try {
    const r = await fetch(API_BASE + '/api/routes');
    const j = await r.json();
    const list = document.getElementById('citiesList');
    const from = document.getElementById('tripFrom');
    const to = document.getElementById('tripTo');
    list.innerHTML = '';
    from.innerHTML = '';
    to.innerHTML = '';
    if (!j.cities || j.cities.length === 0) { list.innerText = 'No cities.'; return; }
    j.cities.forEach(c => {
      const el = document.createElement('span'); el.style.marginRight = '8px';
      el.innerText = c; list.appendChild(el);
      from.appendChild(new Option(c, c));
      to.appendChild(new Option(c, c));
    });
  } catch (err) {
    console.warn('Could not load cities', err);
    document.getElementById('citiesList').innerText = 'Failed to load cities.';
  }
}

async function loadTrips() {
  try {
    const r = await fetch(API_BASE + '/api/trips');
    const j = await r.json();
    const container = document.getElementById('tripsList');
    container.innerHTML = '';
    if (!j.trips || j.trips.length === 0) { container.innerText = 'No trips.'; return; }
    j.trips.forEach(trip => {
      const row = document.createElement('div'); row.className = 'trip-row';
      // note: use || for safe fallback
      row.innerHTML = `<div>
          <div style="font-weight:700">${trip.from} → ${trip.to} • ${trip.date}</div>
          <div class="muted">${trip.depart || ''} • ${trip.busType || ''} • ${trip.serviceNo || ''} • ${trip.journeyTime || ''}</div>
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
          const jj = await resp.json().catch(()=>({}));
          if (resp.ok) {
            alert('Deleted');
            await loadTrips();
          } else if (resp.status === 401) {
            alert('Unauthorized — redirecting to login');
            localStorage.removeItem('adminToken'); location.href = '/admin-login.html';
          } else {
            alert('Error: ' + (jj.error || JSON.stringify(jj)));
          }
        } catch (e) { console.error(e); alert('Delete failed'); }
      });
      actions.appendChild(del);
      row.appendChild(actions);
      container.appendChild(row);
    });
  } catch (err) {
    console.warn('Could not load trips', err);
    document.getElementById('tripsList').innerText = 'Failed to load trips.';
  }
}
