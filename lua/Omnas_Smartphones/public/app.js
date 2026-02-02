// public/app.js
// Combined: product loader, hero carousel, location dropdown
// - Renders extended product schema
// - Accessible hero carousel with dots/arrows/keyboard/auto-rotate
// - Robust location dropdown (click, keyboard, outside click, persistence)

/* ========== Products ========== */
function renderProducts(data){
  const el = document.getElementById('products');
  if(!el) return;
  if(!data || data.length === 0){
    el.innerHTML = `<p style="color:#666">No products found.</p>`;
    return;
  }

  el.innerHTML = data.map(p => {
    // support both old schema (name, desc) and new schema
    const image = p.image || p.imagePath || p.img || '';
    const brand = p.brand || (p.name ? p.name.split(' ')[0] : '') || '';
    const model = p.model || p.name || '';
    const price = p.price || '';
    const ram = p.ram || p.RAM || '—';
    const rom = p.rom || p.ROM || '—';
    const display = p.display || '—';
    const processor = p.processor || '—';
    const battery = p.battery || '—';
    const cameraRear = (p.camera && (p.camera.rear || p.camera.Rrear)) || p.cameraRear || '—';
    const cameraFront = (p.camera && (p.camera.front || p.camera.Rfront)) || p.cameraFront || '—';
    const desc = p.desc || p.description || '';

    return `
      <div class="card" role="article" tabindex="0">
        ${image ? `<img src="${image}" alt="${brand} ${model}">` : `<div style="height:140px;background:#fff;border-radius:8px"></div>`}
        <h3 style="margin:10px 0 6px">${brand} ${model}</h3>
        <div style="font-weight:700;margin-bottom:8px">${price}</div>
        <div style="font-size:13px;color:#555;line-height:1.3">
          <div><strong>RAM:</strong> ${ram} • <strong>ROM:</strong> ${rom}</div>
          <div><strong>Display:</strong> ${display}</div>
          <div><strong>Camera:</strong> Rear ${cameraRear}, Front ${cameraFront}</div>
          <div><strong>Processor:</strong> ${processor}</div>
          <div><strong>Battery:</strong> ${battery}</div>
          ${desc ? `<div style="margin-top:8px;color:#666">${desc}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function loadProductsAndRender(){
  fetch('/api/products')
    .then(r => r.ok ? r.json() : Promise.resolve([]))
    .then(d => renderProducts(d || []))
    .catch(e => {
      console.error("Failed to load products", e);
      renderProducts([]);
    });
}

/* Load products initially */
loadProductsAndRender();

/* ========== Hero Carousel ========== */
(function(){
  // images array — update with any additional filenames placed in public/images/
  const images = [
    "images/hero1.png",
    "images/hero2.png",
    //"images/hero1.png"
  ];

  let idx = 0;
  const heroImg = document.getElementById('heroImg');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dots');

  if(!heroImg){
    // nothing to do if hero area missing
    return;
  }

  function makeDots(){
    if(!dotsContainer) return;
    dotsContainer.innerHTML = images.map((_,i) => `<span class="dot ${i===idx ? 'active' : ''}" data-i="${i}" role="button" aria-label="slide ${i+1}"></span>`).join('');
    Array.from(dotsContainer.querySelectorAll('.dot')).forEach(dot=>{
      dot.addEventListener('click', ()=> {
        idx = Number(dot.dataset.i);
        updateHero(true);
      });
    });
  }

  function updateHero(animate){
    if(!heroImg) return;
    heroImg.style.transition = 'opacity .35s ease';
    heroImg.style.opacity = 0;
    setTimeout(()=> {
      heroImg.src = images[idx] || images[0] || '';
      heroImg.alt = `Slide ${idx+1}`;
      heroImg.style.opacity = 1;
    }, animate ? 260 : 0);

    // update dots
    if(dotsContainer){
      Array.from(dotsContainer.children).forEach((d,i)=>{
        d.classList.toggle('active', i === idx);
      });
    }
  }

  if(prevBtn) prevBtn.addEventListener('click', ()=> { idx = (idx-1+images.length)%images.length; updateHero(true); });
  if(nextBtn) nextBtn.addEventListener('click', ()=> { idx = (idx+1)%images.length; updateHero(true); });

  // keyboard navigation for carousel
  window.addEventListener('keydown', (ev) => {
    if(ev.key === "ArrowLeft"){ idx=(idx-1+images.length)%images.length; updateHero(true); }
    if(ev.key === "ArrowRight"){ idx=(idx+1)%images.length; updateHero(true); }
  });

  // auto-rotate with pause on hover/focus
  let auto = setInterval(()=> { idx=(idx+1)%images.length; updateHero(true); }, 6000);
  const frame = document.querySelector('.hero-frame');
  if(frame){
    frame.addEventListener('mouseenter', ()=> clearInterval(auto));
    frame.addEventListener('mouseleave', ()=> auto = setInterval(()=> { idx=(idx+1)%images.length; updateHero(true); }, 6000));
    frame.addEventListener('focusin', ()=> clearInterval(auto));
    frame.addEventListener('focusout', ()=> auto = setInterval(()=> { idx=(idx+1)%images.length; updateHero(true); }, 6000));
  }

  // initialize
  makeDots();
  // initial fade-in and set
  heroImg.style.transition = 'opacity .35s ease, transform .9s cubic-bezier(.2,.9,.2,1)';
  heroImg.style.opacity = 1;
  updateHero(false);
})();

/* ========== Location dropdown ========== */
// Robust, accessible location dropdown with keyboard support and persistence
(function(){
  const widget = document.getElementById('location-widget');
  const dropdown = document.getElementById('location-dropdown');
  const selectedText = document.getElementById('selected-location');
  const toggleBtn = document.getElementById('loc-toggle');

  if(!widget || !dropdown || !selectedText || !toggleBtn){
    // If any element missing, skip safely
    return;
  }

  function openDropdown() {
    widget.classList.add('open');
    widget.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-expanded', 'true');
    const first = dropdown.querySelector('.loc-option');
    if(first) first.focus();
  }
  function closeDropdown() {
    widget.classList.remove('open');
    widget.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleDropdown(e) {
    e && e.stopPropagation();
    if(widget.classList.contains('open')) closeDropdown(); else openDropdown();
  }

  function selectLocation(city) {
    if(!city) return;
    selectedText.textContent = city;
    closeDropdown();
    try { localStorage.setItem('omnas_city', city); } catch(e){}
    // Optionally, you could reload products or filter by city here
    // loadProductsAndRender();
  }

  // click on option
  dropdown.addEventListener('click', function(ev){
    const opt = ev.target.closest('.loc-option');
    if(!opt) return;
    const city = opt.dataset.city || opt.textContent.trim();
    selectLocation(city);
  });

  // keyboard navigation inside dropdown
  dropdown.addEventListener('keydown', function(ev){
    const opts = Array.from(dropdown.querySelectorAll('.loc-option'));
    const active = document.activeElement;
    const idx = opts.indexOf(active);
    if(ev.key === 'ArrowDown'){
      ev.preventDefault();
      const next = opts[(idx + 1) % opts.length];
      if(next) next.focus();
    } else if(ev.key === 'ArrowUp'){
      ev.preventDefault();
      const prev = opts[(idx - 1 + opts.length) % opts.length];
      if(prev) prev.focus();
    } else if(ev.key === 'Enter' || ev.key === ' '){
      ev.preventDefault();
      if(active && active.classList.contains('loc-option')){
        selectLocation(active.dataset.city || active.textContent.trim());
      }
    } else if(ev.key === 'Escape'){
      closeDropdown();
      toggleBtn.focus();
    }
  });

  // widget click toggles dropdown
  widget.addEventListener('click', toggleDropdown);

  // close on outside click
  document.addEventListener('click', function(ev){
    if(!widget.contains(ev.target)){
      closeDropdown();
    }
  });

  // close on global Escape
  document.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape') closeDropdown();
  });

  // prevent dropdown clicks from bubbling up and closing it
  dropdown.addEventListener('click', function(ev){ ev.stopPropagation(); });

  // load persisted city if present
  try {
    const saved = localStorage.getItem('omnas_city');
    if(saved) selectedText.textContent = saved;
  } catch(e){ /* ignore */ }

  // expose a helper for inline onclick handlers (if you still use them)
  window.selectLocation = function(city){ selectLocation(city); };
})();

/* ========== Optional: expose reload helper ========== */
window.reloadProducts = loadProductsAndRender;


/*review*/
/* Reviews carousel logic */
(function(){
  const track = document.getElementById('reviewsTrack');
  const prev = document.getElementById('revPrev');
  const next = document.getElementById('revNext');
  const dotsWrap = document.getElementById('reviewsDots');

  if(!track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  let idx = 0;
  let cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : 320;
  const gap = parseInt(getComputedStyle(track).gap || 20, 10) || 20;

  // create dots
  function createDots(){
    if(!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for(let i=0;i<cards.length;i++){
      const d = document.createElement('span');
      d.className = 'dot' + (i===0? ' active':'');
      d.dataset.i = i;
      d.addEventListener('click', ()=> { goTo(i); resetAuto(); });
      dotsWrap.appendChild(d);
    }
  }

  function updateCardWidth(){
    cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : 320;
  }

  function goTo(i){
    idx = Math.max(0, Math.min(i, cards.length-1));
    const x = idx * (cardWidth + gap);
    track.style.transform = `translateX(-${x}px)`;
    updateDots();
  }

  function updateDots(){
    if(!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((d, i)=> d.classList.toggle('active', i===idx));
  }

  if(prev) prev.addEventListener('click', ()=> { goTo(idx-1); resetAuto(); });
  if(next) next.addEventListener('click', ()=> { goTo(idx+1); resetAuto(); });

  // resize handling
  window.addEventListener('resize', ()=> {
    updateCardWidth();
    goTo(idx);
  });

  // autoplay
  let auto = setInterval(()=> { goTo((idx+1) % cards.length); }, 5000);
  function resetAuto(){
    clearInterval(auto);
    auto = setInterval(()=> { goTo((idx+1) % cards.length); }, 5000);
  }

  // initial setup
  updateCardWidth();
  createDots();
  goTo(0);

  // swipe support for touch (mobile)
  (function() {
    let startX=0, dist=0, isTouch=false;
    track.addEventListener('touchstart', (e)=> {
      isTouch=true; startX = e.touches[0].clientX; clearInterval(auto);
    }, {passive:true});
    track.addEventListener('touchmove', (e)=> {
      if(!isTouch) return;
      const dx = e.touches[0].clientX - startX;
      track.style.transform = `translateX(calc(-${idx*(cardWidth+gap)}px + ${dx}px))`;
    }, {passive:true});
    track.addEventListener('touchend', (e)=> {
      isTouch=false;
      const dx = (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0) - startX;
      if(Math.abs(dx) > 60){
        if(dx < 0) goTo(idx+1); else goTo(idx-1);
      } else {
        goTo(idx);
      }
      resetAuto();
    }, {passive:true});
  })();

})();

/*sorting & filtering */
// public/app.js
// Loads /api/products, renders product cards, and provides filtering/sorting + clear

// -------------------------
// 1) declare core vars up-front
// -------------------------
let allProducts = [];         // will be filled from /api/products
const productsGrid = document.getElementById('products');

// -------------------------
// 2) helper utilities
// -------------------------
function extractPriceVal(price){
  if(price == null) return 0;
  if(typeof price === 'number') return price;
  // remove non-digits (keeps - and .)
  return Number((price + "").replace(/[^\d.-]/g, "")) || 0;
}

function createCardHTML(p){
  const image = p.image || '';
  const brand = p.brand || '';
  const model = p.model || '';
  const ram = p.ram || '';
  const rom = p.rom || p.storage || '';
  const display = p.display || '';
  const processor = p.processor || '';
  const battery = p.battery || '';
  const cameraRear = p.camera && p.camera.rear ? p.camera.rear : (p.cameraRear || '—');
  const cameraFront = p.camera && p.camera.front ? p.camera.front : (p.cameraFront || '—');
  const price = p.price || '';

  return `
    <div class="card" role="article" tabindex="0">
      ${image ? `<img src="${image}" alt="${brand} ${model}" loading="lazy">` : `<div style="height:140px;background:#fff;border-radius:8px"></div>`}
      <h3 style="margin:10px 0 6px">${brand} ${model}</h3>
      <div style="font-weight:700;margin-bottom:8px">${price}</div>
      <div style="font-size:13px;color:#555;line-height:1.3">
        <div><strong>RAM:</strong> ${ram} • <strong>ROM:</strong> ${rom}</div>
        <div><strong>Display:</strong> ${display}</div>
        <div><strong>Camera:</strong> Rear ${cameraRear}, Front ${cameraFront}</div>
        <div><strong>Processor:</strong> ${processor}</div>
        <div><strong>Battery:</strong> ${battery}</div>
      </div>
    </div>
  `;
}

// -------------------------
// 3) render function
// -------------------------
function renderProducts(list){
  if(!productsGrid) return;
  if(!list || list.length === 0){
    productsGrid.innerHTML = `<p style="color:#666">No products found.</p>`;
    productsGrid.classList.add('visible');
    return;
  }
  productsGrid.innerHTML = list.map(createCardHTML).join('');
  // show with animation class
  requestAnimationFrame(()=> productsGrid.classList.add('visible'));
}

// -------------------------
// 4) Filtering & Sorting logic
// -------------------------
const brandEl = document.getElementById('filter-brand');
const ramEl = document.getElementById('filter-ram');
const storageEl = document.getElementById('filter-storage');
const priceEl = document.getElementById('filter-price');
const sortEl = document.getElementById('sort-by');
const clearBtn = document.getElementById('clearFilters');
const activeCountEl = document.getElementById('activeCount');

function getSelectedValues(selectEl){
  if(!selectEl) return [];
  return Array.from(selectEl.selectedOptions || []).map(o => o.value).filter(Boolean);
}

function countActiveFilters(){
  let cnt = 0;
  if(getSelectedValues(brandEl).length) cnt++;
  if(getSelectedValues(ramEl).length) cnt++;
  if(getSelectedValues(storageEl).length) cnt++;
  if(priceEl && priceEl.value) cnt++;
  if(sortEl && sortEl.value) cnt++;
  return cnt;
}

function clearFilters(){
  if(brandEl) Array.from(brandEl.options).forEach(o => o.selected = false);
  if(ramEl) Array.from(ramEl.options).forEach(o => o.selected = false);
  if(storageEl) Array.from(storageEl.options).forEach(o => o.selected = false);
  if(priceEl) priceEl.value = "";
  if(sortEl) sortEl.value = "";
  if(activeCountEl) activeCountEl.textContent = `0 filters`;
}

function applyFilters(){
  if(!allProducts) return;
  // hide grid during compute for smoothness
  if(productsGrid) productsGrid.classList.remove('visible');

  let filtered = allProducts.slice();

  // Brand filter (case-insensitive match)
  const brands = getSelectedValues(brandEl).map(s => s.toUpperCase());
  if(brands.length) filtered = filtered.filter(p => (p.brand || "").toUpperCase() && brands.includes((p.brand || "").toUpperCase()));

  // RAM filter
  const rams = getSelectedValues(ramEl);
  if(rams.length) filtered = filtered.filter(p => {
    const r = (p.ram || "").toString();
    return rams.some(v => r.includes(v));
  });

  // Storage/ROM filter
  const stor = getSelectedValues(storageEl);
  if(stor.length) filtered = filtered.filter(p => {
    const s = (p.rom || p.storage || "").toString();
    return stor.some(v => s.includes(v));
  });

  // Price range
  if(priceEl && priceEl.value){
    const parts = priceEl.value.split('-').map(Number);
    const min = parts[0] || 0;
    const max = parts[1] || 1e12;
    filtered = filtered.filter(p => {
      const pr = extractPriceVal(p.price);
      return pr >= min && pr <= max;
    });
  }

  // Sort
  const sortBy = sortEl ? sortEl.value : "";
  if(sortBy === "low") filtered.sort((a,b) => extractPriceVal(a.price) - extractPriceVal(b.price));
  else if(sortBy === "high") filtered.sort((a,b) => extractPriceVal(b.price) - extractPriceVal(a.price));
  else if(sortBy === "rating") filtered.sort((a,b) => (b.rating||0) - (a.rating||0));
  else if(sortBy === "new") filtered.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));

  // render and update badge
  renderProducts(filtered);
  if(activeCountEl) {
    const cnt = countActiveFilters();
    activeCountEl.textContent = `${cnt} filter${cnt===1 ? '' : 's'}`;
    if(cnt>0) activeCountEl.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:200});
  }
}

// Attach listeners safely
[brandEl, ramEl, storageEl, priceEl, sortEl].forEach(el=>{
  if(!el) return;
  el.addEventListener('change', applyFilters);
});

// clear button
if(clearBtn){
  clearBtn.addEventListener('click', ()=>{
    clearFilters();
    applyFilters();
    clearBtn.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:220});
  });
}

// -------------------------
// 5) fetch products and initialize
// -------------------------
function initProducts(){
  fetch('/api/products')
    .then(r => {
      if(!r.ok) throw new Error("Failed to fetch products");
      return r.json();
    })
    .then(data => {
      // ensure array
      allProducts = Array.isArray(data) ? data : [];
      // normalize some fields (optional)
      allProducts = allProducts.map(p => {
        // ensure price numeric accessible
        p._priceVal = extractPriceVal(p.price);
        return p;
      });
      applyFilters(); // first render
    })
    .catch(err => {
      console.error("Error loading products:", err);
      allProducts = [];
      renderProducts([]);
    });
}

// run
initProducts();

/* Optional helper: expose reload */
window.reloadProducts = initProducts;



// Logout Button Logic (Safe)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/index.html";
  });
}

