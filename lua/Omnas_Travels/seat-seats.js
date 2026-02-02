// seat-seats.js (tiny fix for stray small '1' before total — no design changes)
// NOTE: include jsPDF UMD before this script in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

(() => {
  const API_BASE = 'http://localhost:8080';
  const TOTAL_SEATS = 45;

  // CLIENT-side seat type assignments requested
  const seatTypes = {};
  const seniorSeats = [7, 8, 11, 12];
  const mlaSeats = [5, 6];
  const femaleSeats = [19,20,21,22,23,24];
  const soldierSeats = [15,16];
  const preReservedLocal = [1,3,4]; // mirror of server reserved for visual fallback

  seniorSeats.forEach(n => seatTypes[n] = 'senior');
  mlaSeats.forEach(n => seatTypes[n] = 'mla');
  femaleSeats.forEach(n => seatTypes[n] = 'female');
  soldierSeats.forEach(n => seatTypes[n] = 'soldier');
  preReservedLocal.forEach(n => seatTypes[n] = 'reserved');

  // runtime
  let selectedSeats = new Set();
  let reservedSeats = new Set(preReservedLocal); // will be overridden by server data when available
  let trip = null;
  let tripSeatStatus = null; // array indexed 1..TOTAL_SEATS with boolean true=reserved
  let tripId = null;
  let tripDate = null;

  // DOM
  const seatMapContainer = document.getElementById('seatMap');
  const modalRoot = document.getElementById('modalRoot');
  const selectionSummary = document.getElementById('selectionSummary');
  const proceedBtn = document.getElementById('proceedBtn');
  const journeyTitle = document.getElementById('journeyTitle');
  const journeySub = document.getElementById('journeySub');
  const tripIdText = document.getElementById('tripIdText');
  const pricePerSeatEl = document.getElementById('pricePerSeat');

  function qp(name) { return new URLSearchParams(location.search).get(name); }

  // ---------- Minimal helpers to fix PDF issues ----------
  // remove zero-width and control chars
  function stripInvisibleChars(s) {
    if (s == null) return '';
    return String(s).replace(/[\u200B-\u200F\uFEFF\x00-\x1F\x7F]/g, '').trim();
  }

  // sanitize text for PDF route: remove strange punctuation and control chars,
  // replace unicode arrows with hyphen, collapse spaces.
  function sanitizeForPDF(s) {
    if (s == null) return '';
    s = String(s);
    s = stripInvisibleChars(s);
    // replace common arrows and dashes with hyphen
    s = s.replace(/→|–|—|−/g, '-');
    // remove stray punctuation sequences of chars like !' that might appear together
    s = s.replace(/[!'\u00A1\u00BF]+/g, ' ');
    // remove any characters outside printable ASCII range (keeps basic punctuation)
    s = s.replace(/[^\x20-\x7E\-]/g, ' ');
    // collapse whitespace
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  // Clean non-digit characters except dot and minus, returns Number or 0
  function cleanNumber(value) {
    if (value == null) return 0;
    // strip invisible characters first
    let s = stripInvisibleChars(value);
    // then remove currency symbols and anything not digit/dot/minus/comma
    s = String(s).replace(/[^\d\.\-,]/g, '');
    // remove commas (thousand separators) before parse
    s = s.replace(/,/g, '');
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  // Format number using Indian separators (1,250) — returns string
  function formatAmount(n) {
    const num = cleanNumber(n);
    return num.toLocaleString('en-IN');
  }

  // -------------------------
  // PDF helper (uses jsPDF UMD: window.jspdf.jsPDF)
  // Only small changes: use sanitizeForPDF for route and formatAmount for total.
  // Ensure font size is explicitly set before drawing total to avoid accidental tiny glyph.
  // -------------------------
  function generateTicketPDF(ticket, passengers, tripForPDF) {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        console.warn('jsPDF not available. Include the UMD script before this file.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'A4' });
      const pad = 40;
      let y = pad;

      // header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BusExpress — Ticket', pad, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      y += 22;
      const ticketIdText = `Ticket ID: ${ticket.id || '-'}`;
      const bookedAt = ticket.ts ? new Date(ticket.ts * 1000).toLocaleString() : new Date().toLocaleString();
      doc.text(ticketIdText, pad, y);
      doc.text(`Booking time: ${bookedAt}`, 330, y);
      y += 18;

      // trip block
      doc.setLineWidth(0.5);
      doc.line(pad, y, doc.internal.pageSize.getWidth() - pad, y);
      y += 14;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      // sanitize route components to avoid "Nagpur !' Mumbai" issue
      const fromText = sanitizeForPDF((tripForPDF && tripForPDF.from) || (trip && trip.from) || '-');
      const toText   = sanitizeForPDF((tripForPDF && tripForPDF.to)   || (trip && trip.to)   || '-');
      const route = `${fromText} - ${toText}`;
      doc.text(route, pad, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 16;
      doc.text(`Date: ${(tripForPDF && tripForPDF.date) || (trip && trip.date) || '-'}`, pad, y);
      doc.text(`Departure: ${(tripForPDF && tripForPDF.depart) || (trip && trip.depart) || '-'}`, 200, y);
      doc.text(`Service No: ${(tripForPDF && tripForPDF.serviceNo) || (trip && trip.serviceNo) || '-'}`, 360, y);
      doc.text(`Bus Type: ${(tripForPDF && tripForPDF.busType) || (trip && trip.busType) || '-'}`, 470, y);
      y += 16;
      doc.text(`Journey time: ${(tripForPDF && tripForPDF.journeyTime) || (trip && trip.journeyTime) || '-'}`, pad, y);
      doc.text(`Seats booked: ${ticket.seats || '-'}`, 300, y);

      // format total to avoid stray '1' or odd glyphs; ensure font size is set
      const totalFormatted = formatAmount(ticket.total || 0);
      doc.setFontSize(10); // explicitly set default size just before writing total
      // write 'Rs' explicitly to avoid any glyph issues
      doc.text(`Total Fare: Rs ${totalFormatted}`, 420, y);
      y += 20;

      // passenger table header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const colSeat = 48, colName = 100, colAge = 320, colGender = 370, colMobile = 430;
      doc.text('Seat', colSeat, y);
      doc.text('Name', colName, y);
      doc.text('Age', colAge, y);
      doc.text('Gender', colGender, y);
      doc.text('Mobile', colMobile, y);
      y += 8;
      doc.setLineWidth(0.5);
      doc.line(pad, y, doc.internal.pageSize.getWidth() - pad, y);
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // passenger rows
      (passengers || []).forEach((p) => {
        if (y > doc.internal.pageSize.getHeight() - 80) {
          doc.addPage();
          y = pad;
        }
        doc.text(String(p.seatNumber || '-'), colSeat, y);
        const nameLines = doc.splitTextToSize(p.name || '-', 200);
        doc.text(nameLines, colName, y);
        doc.text(String(p.age || '-'), colAge, y);
        doc.text(String(p.gender || '-'), colGender, y);
        doc.text(String(p.mobile || '-'), colMobile, y);
        y += Math.max(14, (nameLines.length * 12));
      });

      y += 20;
      doc.setFontSize(9);
      doc.setTextColor(90);
      const note = 'Please carry a valid photo ID while boarding. Cancellation rules apply as per policy.';
      const wrapped = doc.splitTextToSize(note, doc.internal.pageSize.getWidth() - pad * 2);
      doc.text(wrapped, pad, y);

      // filename (safe)
      const serviceSafe = ((tripForPDF && tripForPDF.serviceNo) || (trip && trip.serviceNo) || 'trip').replace(/[^\w\-]/g, '');
      const fname = `ticket_${ticket.id || 'n'}_${serviceSafe}.pdf`;
      doc.save(fname);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Ticket generated but PDF failed. Check console for details.');
    }
  }

  // -------------------------
  // Trip load & seat rendering
  // -------------------------
  async function loadTrip() {
    tripId = parseInt(qp('tripId') || qp('id') || '', 10);
    tripDate = qp('date') || '';
    if (!tripId) { alert('Missing tripId'); return; }
    if (tripIdText) tripIdText.innerText = tripId;
    try {
      const res = await fetch(`${API_BASE}/api/trip?id=${encodeURIComponent(tripId)}`);
      if (!res.ok) throw new Error('trip fetch failed: ' + res.status);
      const j = await res.json();
      if (!j || !j.trip) throw new Error('invalid trip data');
      trip = j.trip;
      tripSeatStatus = trip.seatStatus || null;

      if (journeyTitle) journeyTitle.innerText = `${trip.from} → ${trip.to}`;
      if (journeySub) journeySub.innerText = `${trip.date || tripDate} • ${trip.depart || ''} • ${trip.journeyTime || ''}`;
      if (pricePerSeatEl) pricePerSeatEl.innerText = '₹' + (trip.price || 0);

      reservedSeats = new Set();
      if (Array.isArray(tripSeatStatus)) {
        for (let i = 0; i < tripSeatStatus.length; i++) {
          if (tripSeatStatus[i]) reservedSeats.add(i + 1);
        }
      } else {
        (preReservedLocal || []).forEach(n => reservedSeats.add(n));
      }

      renderSeatMap();
    } catch (err) {
      console.error(err);
      alert('Failed to fetch trip details from server. Falling back to local view.');
      try {
        const res2 = await fetch(API_BASE + '/api/trips');
        const j2 = await res2.json();
        const found = j2 && Array.isArray(j2.trips) ? j2.trips.find(t => t.id === tripId) : null;
        if (found) {
          trip = found;
          if (journeyTitle) journeyTitle.innerText = `${trip.from} → ${trip.to}`;
          if (journeySub) journeySub.innerText = `${trip.date || tripDate} • ${trip.depart || ''} • ${trip.journeyTime || ''}`;
          if (pricePerSeatEl) pricePerSeatEl.innerText = '₹' + (trip.price || 0);
        }
      } catch (e2) { /* ignore */ }
      renderSeatMap();
    }
  }

  function createSeatEl(n, opts = {}) {
    const { isLastRow=false } = opts;
    const el = document.createElement('div');
    el.setAttribute('data-seat', n);
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Seat ' + n);
    el.className = 'seat' + (isLastRow ? ' last-row' : '');

    if (reservedSeats.has(n)) {
      el.className += ' s-reserved disabled';
      el.innerText = n;
      return el;
    }

    const st = seatTypes[n];
    if (st === 'senior') el.classList.add('s-senior');
    else if (st === 'mla') el.classList.add('s-mla');
    else if (st === 'female') el.classList.add('s-female');
    else if (st === 'soldier') el.classList.add('s-soldier');
    else el.classList.add('s-unreserved');

    el.innerText = n;
    if (selectedSeats.has(n)) el.classList.add('selected');
    el.addEventListener('click', () => onSeatClick(n, el));
    return el;
  }

  function renderSeatMap() {
    if (!seatMapContainer) return;
    seatMapContainer.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid';
    let seatNo = 1;

    for (let r = 1; r <= 10; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';

      const leftBlock = document.createElement('div'); leftBlock.className = 'block';
      leftBlock.appendChild(createSeatEl(seatNo++));
      leftBlock.appendChild(createSeatEl(seatNo++));

      const aisle = document.createElement('div'); aisle.className = 'aisle';

      const rightBlock = document.createElement('div'); rightBlock.className = 'block';
      rightBlock.appendChild(createSeatEl(seatNo++));
      rightBlock.appendChild(createSeatEl(seatNo++));

      rowEl.appendChild(leftBlock);
      rowEl.appendChild(aisle);
      rowEl.appendChild(rightBlock);
      grid.appendChild(rowEl);
    }

    const lastRow = document.createElement('div');
    lastRow.className = 'row';
    lastRow.style.justifyContent = 'center';
    const spacer = document.createElement('div'); spacer.style.width = '10px';
    lastRow.appendChild(spacer);
    for (let i = 0; i < 5; i++) {
      const seatEl = createSeatEl(seatNo++, { isLastRow: true });
      lastRow.appendChild(seatEl);
    }
    grid.appendChild(lastRow);

    seatMapContainer.appendChild(grid);
    updateSummary();
  }

  function onSeatClick(n, el) {
    if (reservedSeats.has(n)) return;
    if (selectedSeats.has(n)) {
      selectedSeats.delete(n);
      el.classList.remove('selected');
    } else {
      const availableCount = (trip && typeof trip.seats === 'number') ? trip.seats : TOTAL_SEATS;
      if (selectedSeats.size >= availableCount) { alert('No more seats available'); return; }
      selectedSeats.add(n);
      el.classList.add('selected');
    }
    updateSummary();
  }

  function updateSummary() {
    if (!selectionSummary) return;
    const count = selectedSeats.size;
    const price = (trip && trip.price) ? trip.price : 0;
    selectionSummary.innerText = `Selected: ${count} seat(s) — Total: ₹${count * price}`;
  }

  // passenger modal (one passenger per selected seat)
  function showPassengerModal() {
    if (selectedSeats.size === 0) { alert('Select seats first'); return; }
    const overlay = document.createElement('div'); overlay.className = 'modal-overlay';
    const modal = document.createElement('div'); modal.className = 'modal';
    const heading = document.createElement('h3'); heading.innerText = `Passenger details — ${selectedSeats.size} seat(s)`; modal.appendChild(heading);
    const descr = document.createElement('div'); descr.style.marginBottom='8px'; descr.style.color='#475569'; descr.innerText='Fill details for each selected seat.'; modal.appendChild(descr);

    const grid = document.createElement('div'); grid.className = 'passenger-grid';
    const seatsArr = Array.from(selectedSeats).sort((a,b)=>a-b);
    seatsArr.forEach(seatNo => {
      const row = document.createElement('div'); row.className='passenger-row'; row.dataset.seat = seatNo;
      const seatLabel = document.createElement('div'); seatLabel.style.minWidth='52px'; seatLabel.style.fontWeight='800'; seatLabel.innerText = `#${seatNo}`; row.appendChild(seatLabel);

      const nameInput = document.createElement('input'); nameInput.placeholder='Full name'; nameInput.dataset.field='name'; nameInput.style.flex='2'; row.appendChild(nameInput);
      const ageInput = document.createElement('input'); ageInput.placeholder='Age'; ageInput.type='number'; ageInput.min=0; ageInput.dataset.field='age'; ageInput.style.width='84px'; row.appendChild(ageInput);
      const genderSelect = document.createElement('select'); genderSelect.dataset.field='gender'; ['Male','Female','Other'].forEach(g=>{ const o=document.createElement('option'); o.value=g; o.text=g; genderSelect.appendChild(o);}); genderSelect.style.width='110px'; row.appendChild(genderSelect);
      const mobileInput = document.createElement('input'); mobileInput.placeholder='Mobile'; mobileInput.type='tel'; mobileInput.dataset.field='mobile'; mobileInput.style.width='140px'; row.appendChild(mobileInput);

      grid.appendChild(row);
    });

    modal.appendChild(grid);

    const actions = document.createElement('div'); actions.className='modal-actions';
    const cancelBtn = document.createElement('button'); cancelBtn.className='btn cancel'; cancelBtn.innerText='Cancel'; cancelBtn.addEventListener('click', ()=>document.body.removeChild(overlay));
    const confirmBtn = document.createElement('button'); confirmBtn.className='btn confirm'; confirmBtn.innerText='Confirm & Book';
    confirmBtn.addEventListener('click', async () => {
      // validate and collect
      const rows = Array.from(grid.querySelectorAll('.passenger-row'));
      const passengers = [];
      for (const r of rows) {
        const seatNo = parseInt(r.dataset.seat,10);
        const name = r.querySelector('input[data-field="name"]').value.trim();
        const ageVal = r.querySelector('input[data-field="age"]').value.trim();
        const gender = r.querySelector('select[data-field="gender"]').value;
        const mobile = r.querySelector('input[data-field="mobile"]').value.trim();
        if (!name) { alert(`Enter name for seat ${seatNo}`); return; }
        if (!ageVal || isNaN(ageVal) || Number(ageVal) <= 0) { alert(`Enter valid age for seat ${seatNo}`); return; }
        if (!mobile || mobile.length < 6) { alert(`Enter valid mobile for seat ${seatNo}`); return; }
        passengers.push({ seatNumber: seatNo, name, age: Number(ageVal), gender, mobile });
      }

      const seatNumbers = passengers.map(p=>p.seatNumber);
      const payload = { tripId, seats: seatNumbers.length, seatNumbers, passengers };

      try {
        const res = await fetch(API_BASE + '/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (res.status === 201 || (j && j.ok)) {
          // show confirmation (brief) - format total in alert too
          try {
            const ttotalRaw = (j.ticket && j.ticket.total) || 0;
            const ttotal = formatAmount(ttotalRaw);
            alert('Booked! Ticket ID: ' + (j.ticket && j.ticket.id) + '\nTotal: Rs ' + ttotal);
          } catch(e) {}

          // mark newly reserved seats visually (also server has them now)
          seatNumbers.forEach(n => reservedSeats.add(n));
          selectedSeats.clear();
          renderSeatMap();

          // generate and download PDF ticket (uses trip fetched earlier as fallback)
          try {
            const ticketForPDF = j.ticket || {};
            // attach minimal trip info into ticket object if server didn't include it
            if (!ticketForPDF.trip) ticketForPDF.trip = trip || {};
            generateTicketPDF(ticketForPDF, passengers, ticketForPDF.trip || trip || {});
          } catch (pdfErr) {
            console.error('PDF generation error', pdfErr);
          }

          // close modal
          document.body.removeChild(overlay);
        } else {
          alert('Booking failed: ' + (j.error || 'Unknown'));
          if (j && j.available !== undefined && trip) { trip.seats = j.available; renderSeatMap(); }
        }
      } catch (err) {
        console.error(err); alert('Booking error');
      }
    });

    actions.appendChild(cancelBtn); actions.appendChild(confirmBtn);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const first = grid.querySelector('input[data-field="name"]'); if (first) first.focus();
  }

  if (proceedBtn) proceedBtn.addEventListener('click', showPassengerModal);

  // initialize
  loadTrip();

  // expose generateTicketPDF for manual download if needed (optional)
  window.generateTicketPDF = generateTicketPDF;

})();
