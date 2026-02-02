// app.js - frontend logic for booking demo
const API_ROOT = "/api";

async function fetchEvents() {
  const res = await fetch(API_ROOT + "/events");
  return res.json();
}

async function fetchBookings() {
  const res = await fetch(API_ROOT + "/bookings");
  return res.json();
}

function renderEvents(list) {
  const container = document.getElementById("events");
  container.innerHTML = "";
  const select = document.getElementById("eventSelect");
  select.innerHTML = "";
  list.forEach(evt => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${evt.title}</h3>
      <p>${evt.date} • ${evt.venue}</p>
      <p>Price: ₹${evt.price}</p>`;
    container.appendChild(card);

    const opt = document.createElement("option");
    opt.value = evt.id;
    opt.textContent = `${evt.title} — ₹${evt.price}`;
    select.appendChild(opt);
  });
}

function renderBookings(bookings) {
  const container = document.getElementById("bookings");
  container.innerHTML = "";
  if (!bookings || bookings.length === 0) {
    container.textContent = "No bookings yet.";
    return;
  }
  bookings.slice().reverse().forEach(b => {
    const d = document.createElement("div");
    d.className = "booking";
    d.innerHTML = `<strong>${b.name}</strong> — ${b.eventTitle}
      <div>Qty: ${b.quantity} | Total: ₹${b.total} | ${new Date(b.createdAt).toLocaleString()}</div>`;
    container.appendChild(d);
  });
}

async function refreshAll() {
  const [evts, bks] = await Promise.all([fetchEvents(), fetchBookings()]);
  renderEvents(evts);
  renderBookings(bks);
}

document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const eventId = Number(document.getElementById("eventSelect").value);
  const quantity = Number(document.getElementById("quantity").value);

  const res = await fetch(API_ROOT + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, eventId, quantity })
  });
  const data = await res.json();
  const out = document.getElementById("booking-result");
  if (!res.ok) {
    out.style.color = "crimson";
    out.textContent = data.error || "Booking failed";
  } else {
    out.style.color = "green";
    out.textContent = `Booked ${data.booking.quantity} tickets for "${data.booking.eventTitle}". Total ₹${data.booking.total}.`;
    document.getElementById("booking-form").reset();
    setTimeout(() => out.textContent = "", 6000);
    refreshAll();
  }
});

// initial load
refreshAll();
