// app.js — frontend behavior for homepage
// Place this file in the same folder as index.html and styles.css
// Make sure server.lua is running at http://localhost:8080 for API calls

(() => {
  const API_BASE = 'http://localhost:8080';

  const slides = [
    'https://img.freepik.com/premium-photo/modern-bus-is-transporting-passengers-mountains-with-sunset-holiday-banner-generative-ai_699690-36094.jpg?w=2000?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    'https://images.unsplash.com/photo-1694002142645-417138f98b6d?q=80&w=1309&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder',
    'https://www.sustainable-bus.com/wp-content/uploads/2023/05/IVECO-BUS-STREETWAY-ELEC-scaled.jpg?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder'
  ];

  document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    attachUiListeners();
    loadRoutes();
    renderRecent();
  });

  function initCarousel() {
    const imgEl = document.getElementById('carouselImage');
    const dotsContainer = document.getElementById('dots');
    if (!imgEl || !dotsContainer) return;

    slides.forEach((s, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => setSlide(i));
      dotsContainer.appendChild(d);
    });

    let idx = 0;
    imgEl.src = slides[0];
    setInterval(() => {
      idx = (idx + 1) % slides.length;
      setSlide(idx);
    }, 4500);

    function setSlide(i) {
      imgEl.src = slides[i];
      document.querySelectorAll('.dot').forEach((dot, j) => dot.classList.toggle('active', i === j));
    }
  }

  function attachUiListeners() {
    const swapBtn = document.getElementById('swapBtn');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const f = document.getElementById('from'), t = document.getElementById('to');
        if (!f || !t) return;
        const tmp = f.value; f.value = t.value; t.value = tmp;
      });
    }

    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        const fromEl = document.getElementById('from');
        const toEl = document.getElementById('to');
        const dateEl = document.getElementById('date');
        const from = fromEl ? fromEl.value : '';
        const to = toEl ? toEl.value : '';
        const date = dateEl ? dateEl.value : '';
        if (!from || !to) { alert('Please select both source and destination'); return; }
        const qs = new URLSearchParams({ from, to, date }).toString();
        window.location.href = '/search-results.html?' + qs;
      });
    }

    const userBtn = document.getElementById('userBtn');
    if (userBtn) userBtn.addEventListener('click', (e) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      location.href = '/user-dashboard.html';
    });

    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
      if (adminBtn.tagName === 'A' && adminBtn.getAttribute('href')) adminBtn.removeAttribute('href');

      adminBtn.addEventListener('click', async (e) => {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        const token = localStorage.getItem('adminToken');
        if (!token) {
          location.href = '/admin-login.html';
          return;
        }

        try {
          const res = await fetch(API_BASE + '/api/trips', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
          });

          if (res.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            alert('Session expired — please sign in again.');
            location.href = '/admin-login.html';
            return;
          }

          location.href = '/admin-dashboard.html';
        } catch (err) {
          console.warn('Could not validate admin token:', err);
          location.href = '/admin-login.html';
        }
      });
    }

    const dt = document.getElementById('date');
    if (dt) {
      try { dt.valueAsDate = new Date(); } catch (e) {}
    }
  }

  async function loadRoutes() {
    try {
      const res = await fetch(API_BASE + '/api/routes');
      const data = await res.json();
      if (!data || !Array.isArray(data.cities)) return;
      const from = document.getElementById('from');
      const to = document.getElementById('to');
      if (!from || !to) return;
      from.innerHTML = ''; to.innerHTML = '';
      data.cities.forEach(city => {
        from.appendChild(new Option(city, city));
        to.appendChild(new Option(city, city));
      });
    } catch (err) {
      console.warn('Could not load routes:', err);
      const defaultCities = ['Mumbai','Pune','Nagpur','Goa'];
      const from = document.getElementById('from');
      const to = document.getElementById('to');
      if (!from || !to) return;
      from.innerHTML = ''; to.innerHTML = '';
      defaultCities.forEach(city => {
        from.appendChild(new Option(city, city));
        to.appendChild(new Option(city, city));
      });
    }
  }

  async function renderRecent() {
    try {
      const r = await fetch(API_BASE + '/api/recent');
      const j = await r.json();
      const ct = document.getElementById('recentList');
      if (!ct) return;
      ct.innerHTML = '';

      if (!j.recent || j.recent.length === 0) {
        ct.innerText = '—';
        return;
      }

      const seen = new Set();
      const unique = [];

      j.recent.slice().reverse().forEach(it => {
        const key = `${it.from}_${it.to}_${it.date || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(it);
        }
      });

      unique.forEach(it => {
        const el = document.createElement('div');
        el.className = 'recent-item';
        el.style.cursor = 'pointer';
        const dateText = it.date ? it.date : 'Any date';
        el.innerText = `${it.from} → ${it.to} • ${dateText}`;

        el.addEventListener('click', () => {
          const qs = new URLSearchParams({
            from: it.from,
            to: it.to,
            date: it.date || ''
          }).toString();

          window.location.href = '/search-results.html?' + qs;
        });

        ct.appendChild(el);
      });

    } catch (e) {
      console.warn('Could not fetch recent searches', e);
    }
  }

})();