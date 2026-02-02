-- server.lua (updated)
-- Single-file HTTP server for local prototyping.
-- Requires: LuaSocket and dkjson
-- Install: luarocks install luasocket dkjson
--
-- NOTES:
--  - This update adds basic per-seat tracking (trip.seatMap) and accepts the newer booking payload:
--      { tripId, seats, seatNumbers, passengers: [{seatNumber,name,age,gender,mobile}] }
--    or the old payload:
--      { tripId, name, seats }
--  - When booking with seatNumbers the server validates that requested seat numbers are available.
--  - Tickets store passengers and seatNumbers. Cancel frees the reserved seat numbers.
--  - GET /api/trips now returns a `reservedSeatNumbers` array per trip (sanitized view).
--  - This is still a prototype: no strong auth, tokens are simple, passwords stored in plain text.

local socket = require("socket")
local json = require("dkjson")
math.randomseed(os.time())

local PORT = 8080
local DATAFILE = "data.json"

-- ----------------------
-- File helpers
-- ----------------------
local function read_all(path)
  local f = io.open(path, "r")
  if not f then return nil end
  local s = f:read("*a")
  f:close()
  return s
end

local function write_all(path, txt)
  local f, err = io.open(path, "w")
  if not f then return false, err end
  f:write(txt)
  f:close()
  return true
end

-- ----------------------
-- URL query parser
-- ----------------------
local function url_decode(s)
  if not s then return s end
  s = s:gsub("+", " ")
  s = s:gsub("%%(%x%x)", function(h) return string.char(tonumber(h,16)) end)
  return s
end

local function parse_query(qs)
  local t = {}
  if not qs or qs == "" then return t end
  for pair in string.gmatch(qs, "([^&]+)") do
    local k, v = pair:match("([^=]+)=?(.*)")
    if k then
      k = url_decode(k)
      v = url_decode(v)
      t[k] = v
    end
  end
  return t
end

-- ----------------------
-- Static file server
-- ----------------------
local function serve_static(client, path)
  if not path then return false end
  if path == "/" then path = "/index.html" end
  if path:find("%.%.") then
    local payload = json.encode({ error = "forbidden" })
    local resp = table.concat({
      "HTTP/1.1 403 Forbidden",
      "Content-Type: application/json; charset=utf-8",
      "Content-Length: " .. tostring(#payload),
      "Connection: close",
      "",
      payload
    }, "\r\n")
    client:send(resp)
    return true
  end
  local fn = path:sub(2) -- remove leading '/'
  local f = io.open(fn, "rb")
  if not f then return false end
  local content = f:read("*a")
  f:close()
  local ctype = "text/plain"
  if fn:match("%.html$") then ctype = "text/html; charset=utf-8"
  elseif fn:match("%.css$") then ctype = "text/css; charset=utf-8"
  elseif fn:match("%.js$") then ctype = "application/javascript; charset=utf-8"
  elseif fn:match("%.png$") then ctype = "image/png"
  elseif fn:match("%.jpg$") or fn:match("%.jpeg$") then ctype = "image/jpeg" end
  local headers = {
    "HTTP/1.1 200 OK",
    "Content-Type: " .. ctype,
    "Content-Length: " .. tostring(#content),
    "Connection: close",
    "",
    content
  }
  client:send(table.concat(headers, "\r\n"))
  return true
end

-- ----------------------
-- Data initialization / persistence
-- ----------------------
local function make_seatmap(total)
  -- seatMap is a table indexed 1..total, value = passenger object or nil when free
  local m = {}
  for i = 1, (total or 45) do m[i] = nil end
  return m
end

local function ensure_data()
  local raw = read_all(DATAFILE)
  if raw then
    local obj, pos, err = json.decode(raw)
    if obj then
      obj.tokens = obj.tokens or {}
      -- ensure each trip has a seatMap field (backwards compatible)
      for _, t in ipairs(obj.trips or {}) do
        t.totalSeats = t.totalSeats or 45
        t.seatMap = t.seatMap or make_seatmap(t.totalSeats)
      end
      return obj
    end
  end

  local now = os.date("%Y-%m-%d")
  local init = {
    cities = {"Mumbai","Pune","Nashik","Ahmednagar","Nagpur","Aurangabad","Goa","Delhi"},
    users = {
      { id = 1, email = "admin@example.com", password = "adminpass", role = "admin" }
    },
    recent = {},
    trips = {
      {
        id = 1,
        from = "Mumbai",
        to = "Pune",
        date = now,
        depart = "08:00",
        busType = "AC Sleeper",
        serviceNo = "BX-101",
        journeyTime = "4h 15m",
        seats = 30,             -- available seats count
        price = 350,
        totalSeats = 45,
        seatMap = make_seatmap(45)
      },
      {
        id = 2,
        from = "Pune",
        to = "Mumbai",
        date = now,
        depart = "10:30",
        busType = "Non-AC Seater",
        serviceNo = "PX-210",
        journeyTime = "4h 00m",
        seats = 12,
        price = 360,
        totalSeats = 45,
        seatMap = make_seatmap(45)
      },
      {
        id = 3,
        from = "Mumbai",
        to = "Goa",
        date = "2025-11-25",
        depart = "22:00",
        busType = "AC Semi-Sleeper",
        serviceNo = "GX-330",
        journeyTime = "10h 30m",
        seats = 20,
        price = 900,
        totalSeats = 45,
        seatMap = make_seatmap(45)
      }
    },
    tickets = {},
    tokens = {}
  }
  write_all(DATAFILE, json.encode(init, { indent = true }))
  return init
end

local DATA = ensure_data()

local function persist()
  write_all(DATAFILE, json.encode(DATA, { indent = true }))
end

-- ----------------------
-- Token helpers (simple)
-- ----------------------
local function gen_token()
  return "adm_" .. tostring(os.time()) .. "_" .. tostring(math.random(100000,999999))
end

local function validate_token(tok)
  if not tok then return nil, "missing token" end
  if not DATA.tokens or not DATA.tokens[tok] then return nil, "invalid token" end
  local meta = DATA.tokens[tok]
  if meta.exp and os.time() > meta.exp then
    DATA.tokens[tok] = nil
    persist()
    return nil, "token expired"
  end
  for _, u in ipairs(DATA.users) do
    if u.id == meta.userId then
      if u.role and u.role:lower() == "admin" then
        return u, nil
      else
        return nil, "not admin"
      end
    end
  end
  return nil, "user not found"
end

-- ----------------------
-- HTTP response helper
-- ----------------------
local function send_response(client, status_line, tbl, ctype)
  local payload = (tbl and json.encode(tbl) or "")
  local headers = {
    "HTTP/1.1 " .. (status_line or "200 OK"),
    "Connection: close",
    "Content-Length: " .. tostring(#payload),
    "Content-Type: " .. (ctype or "application/json; charset=utf-8"),
    "",
    payload
  }
  local response = table.concat(headers, "\r\n")
  client:send(response)
end

-- ----------------------
-- Utility: get reserved seat numbers for a trip
-- ----------------------
local function reserved_seat_numbers(trip)
  local out = {}
  if not trip or not trip.seatMap then return out end
  for i = 1, #trip.seatMap do
    if trip.seatMap[i] ~= nil then table.insert(out, i) end
  end
  return out
end

-- ----------------------
-- Server start & loop
-- ----------------------
local server = assert(socket.bind("*", PORT))
server:settimeout(0.001)
print("Server running at http://localhost:" .. PORT)

local function handle_request(client)
  client:settimeout(1)
  local req_line, err = client:receive()
  if not req_line then client:close(); return end

  local method, fullpath = req_line:match("^(%u+) (%S+)")
  if not method or not fullpath then client:close(); return end

  local path = fullpath
  local qs = nil
  if fullpath:find("?", 1, true) then
    path, qs = fullpath:match("([^%?]+)%?(.*)")
  end

  -- read headers
  local headers = {}
  while true do
    local line = client:receive()
    if not line or line == "" then break end
    local k, v = line:match("([^:]+):%s*(.*)")
    if k then headers[k:lower()] = v end
  end

  -- read body if present
  local body = nil
  if headers["content-length"] then
    local len = tonumber(headers["content-length"])
    if len and len > 0 then body = client:receive(len) end
  end

  -- ----------------------
  -- Routing: API endpoints
  -- ----------------------

  -- GET /api/routes
  if method == "GET" and path == "/api/routes" then
    send_response(client, "200 OK", { cities = DATA.cities })
    return
  end

  -- GET /api/trips  (sanitized: include reservedSeatNumbers)
  if method == "GET" and path == "/api/trips" then
    local out = {}
    for _, t in ipairs(DATA.trips) do
      local copy = {}
      for k, v in pairs(t) do
        if k ~= "seatMap" then copy[k] = v end
      end
      copy.reservedSeatNumbers = reserved_seat_numbers(t)
      table.insert(out, copy)
    end
    send_response(client, "200 OK", { trips = out })
    return
  end

  -- GET /api/trip?id= (detailed trip info including seatMap summary)
  if method == "GET" and path == "/api/trip" then
    local q = parse_query(qs)
    local id = tonumber(q.id)
    if not id then send_response(client, "400 Bad Request", { error = "need id" }); return end
    local trip = nil
    for _, t in ipairs(DATA.trips) do if t.id == id then trip = t; break end end
    if not trip then send_response(client, "404 Not Found", { error = "trip not found" }); return end
    -- build sanitized seatMap: true means reserved, false means free
    local seatStatus = {}
    for i = 1, (trip.totalSeats or 45) do
      seatStatus[i] = (trip.seatMap and trip.seatMap[i]) and true or false
    end
    local copy = {}
    for k, v in pairs(trip) do if k ~= "seatMap" then copy[k] = v end end
    copy.seatStatus = seatStatus
    send_response(client, "200 OK", { trip = copy })
    return
  end

  -- GET /api/search?from=..&to=..&date=..
  if method == "GET" and path == "/api/search" then
    local q = parse_query(qs)
    local from = q.from or ""
    local to = q.to or ""
    local date = q.date or ""
    local found = {}
    for _, t in ipairs(DATA.trips) do
      if t.from == from and t.to == to and (date == "" or t.date == date) then
        table.insert(found, t)
      end
    end
    table.insert(DATA.recent, { from = from, to = to, date = date or "", ts = os.time() })
    while #DATA.recent > 50 do table.remove(DATA.recent, 1) end
    persist()
    send_response(client, "200 OK", { found = (#found > 0), trips = found })
    return
  end

  -- POST /api/search (legacy / alternate)
  if method == "POST" and path == "/api/search" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload then
      send_response(client, "400 Bad Request", { error = "invalid json" })
      return
    end
    local from = payload.from or ""
    local to = payload.to or ""
    local date = payload.date or ""
    local found = {}
    for _, t in ipairs(DATA.trips) do
      if t.from == from and t.to == to and (date == "" or t.date == date) then
        table.insert(found, t)
      end
    end
    table.insert(DATA.recent, { from = from, to = to, date = date or "", ts = os.time() })
    while #DATA.recent > 50 do table.remove(DATA.recent, 1) end
    persist()
    send_response(client, "200 OK", { found = (#found > 0), trips = found })
    return
  end

  -- GET /api/recent
  if method == "GET" and path == "/api/recent" then
    send_response(client, "200 OK", { recent = DATA.recent })
    return
  end

  -- POST /api/signup
  if method == "POST" and path == "/api/signup" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.email or not payload.password then
      send_response(client, "400 Bad Request", { error = "need email and password" })
      return
    end
    for _, u in ipairs(DATA.users) do
      if u.email == payload.email then
        send_response(client, "409 Conflict", { error = "email exists" })
        return
      end
    end
    local newu = { id = #DATA.users + 1, email = payload.email, password = payload.password, role = payload.role or "user" }
    table.insert(DATA.users, newu)
    persist()
    send_response(client, "201 Created", { ok = true, user = { id = newu.id, email = newu.email, role = newu.role } })
    return
  end

  -- POST /api/login (user)
  if method == "POST" and path == "/api/login" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.email or not payload.password then
      send_response(client, "400 Bad Request", { error = "need email and password" })
      return
    end
    for _, u in ipairs(DATA.users) do
      if u.email == payload.email and u.password == payload.password then
        local token = "tok_" .. tostring(os.time()) .. "_" .. tostring(u.id)
        send_response(client, "200 OK", { ok = true, user = { id = u.id, email = u.email, role = u.role }, token = token })
        return
      end
    end
    send_response(client, "401 Unauthorized", { error = "invalid credentials" })
    return
  end

  -- POST /api/admin/login (admin token issuance)
  if method == "POST" and path == "/api/admin/login" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.email or not payload.password then
      send_response(client, "400 Bad Request", { error = "need email and password" })
      return
    end
    local user = nil
    for _, u in ipairs(DATA.users) do
      if u.email == payload.email and u.password == payload.password and u.role and u.role:lower() == "admin" then
        user = u; break
      end
    end
    if not user then
      send_response(client, "401 Unauthorized", { error = "invalid admin credentials" })
      return
    end
    local token = gen_token()
    DATA.tokens = DATA.tokens or {}
    DATA.tokens[token] = { userId = user.id, role = "admin", ts = os.time(), exp = os.time() + (60*60*2) } -- 2 hours
    persist()
    send_response(client, "200 OK", { ok = true, token = token, expires_in = 60*60*2 })
    return
  end

  -- Protected admin endpoints: require Authorization: Bearer <token>

  -- POST /api/routes  (add city)  <-- protected
  if method == "POST" and path == "/api/routes" then
    local auth = headers["authorization"]
    local tok = nil
    if auth then tok = auth:match("^%s*[Bb]earer%s+(.+)%s*$") end
    local user, terr = validate_token(tok)
    if not user then
      send_response(client, "401 Unauthorized", { error = "unauthorized: " .. (terr or "invalid token") })
      return
    end

    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.name then
      send_response(client, "400 Bad Request", { error = "need name" })
      return
    end
    local name = payload.name
    for _, c in ipairs(DATA.cities) do
      if c:lower() == name:lower() then
        send_response(client, "409 Conflict", { error = "city exists" })
        return
      end
    end
    table.insert(DATA.cities, name)
    persist()
    send_response(client, "201 Created", { ok = true, city = name, cities = DATA.cities })
    return
  end

  -- POST /api/trips  (add trip)  <-- protected
  if method == "POST" and path == "/api/trips" then
    local auth = headers["authorization"]
    local tok = nil
    if auth then tok = auth:match("^%s*[Bb]earer%s+(.+)%s*$") end
    local user, terr = validate_token(tok)
    if not user then
      send_response(client, "401 Unauthorized", { error = "unauthorized: " .. (terr or "invalid token") })
      return
    end

    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.from or not payload.to or not payload.date then
      send_response(client, "400 Bad Request", { error = "need from,to,date" })
      return
    end
    local maxid = 0
    for _, t in ipairs(DATA.trips) do if t.id and t.id > maxid then maxid = t.id end end
    local totalSeats = tonumber(payload.totalSeats) or 45
    local newtrip = {
      id = maxid + 1,
      from = payload.from,
      to = payload.to,
      date = payload.date,
      depart = payload.depart or "",
      busType = payload.busType or "",
      serviceNo = payload.serviceNo or "",
      journeyTime = payload.journeyTime or "",
      seats = tonumber(payload.seats) or 0,
      price = tonumber(payload.price) or 0,
      totalSeats = totalSeats,
      seatMap = make_seatmap(totalSeats)
    }
    table.insert(DATA.trips, newtrip)
    persist()
    send_response(client, "201 Created", { ok = true, trip = newtrip })
    return
  end

  -- DELETE /api/trips?id=...  <-- protected
  if method == "DELETE" and path == "/api/trips" then
    local auth = headers["authorization"]
    local tok = nil
    if auth then tok = auth:match("^%s*[Bb]earer%s+(.+)%s*$") end
    local user, terr = validate_token(tok)
    if not user then
      send_response(client, "401 Unauthorized", { error = "unauthorized: " .. (terr or "invalid token") })
      return
    end
    local q = parse_query(qs)
    local id = tonumber(q.id)
    if not id then
      send_response(client, "400 Bad Request", { error = "need id query param" })
      return
    end
    local idx = nil
    for i, t in ipairs(DATA.trips) do if t.id == id then idx = i; break end end
    if not idx then
      send_response(client, "404 Not Found", { error = "trip not found" })
      return
    end
    table.remove(DATA.trips, idx)
    persist()
    send_response(client, "200 OK", { ok = true, removed = id })
    return
  end

  -- POST /api/book
  -- Accepts:
  --  - Old style { tripId, name, seats }
  --  - New style { tripId, seats, seatNumbers, passengers: [{seatNumber,name,age,gender,mobile}] }
  if method == "POST" and path == "/api/book" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.tripId then
      send_response(client, "400 Bad Request", { error = "need tripId" })
      return
    end

    local trip = nil
    for _, t in ipairs(DATA.trips) do if t.id == payload.tripId then trip = t; break end end
    if not trip then send_response(client, "404 Not Found", { error = "trip not found" }); return end

    -- derive passengers & seatNumbers & count
    local passengers = payload.passengers    -- optional
    local seatNumbers = payload.seatNumbers  -- optional
    local requestedSeats = tonumber(payload.seats) or 0

    -- backward compatibility: single-name payload
    if (not passengers or #passengers == 0) and payload.name then
      passengers = { { name = payload.name, age = payload.age, gender = payload.gender, mobile = payload.mobile } }
      if requestedSeats == 0 then requestedSeats = 1 end
    end

    -- if passengers provided, use their count
    if passengers and type(passengers) == "table" then
      requestedSeats = #passengers
    end

    if requestedSeats <= 0 then
      send_response(client, "400 Bad Request", { error = "need seats or passengers data" })
      return
    end

    -- validate availability
    if trip.seats < requestedSeats then
      send_response(client, "409 Conflict", { error = "not enough seats", available = trip.seats })
      return
    end

    -- ensure seatNumbers length matches count if provided
    if seatNumbers and type(seatNumbers) == "table" and #seatNumbers > 0 then
      if #seatNumbers ~= requestedSeats then
        send_response(client, "400 Bad Request", { error = "seatNumbers count mismatch with seats/passengers" })
        return
      end
      -- validate seat numbers within range and not already reserved
      for _, sn in ipairs(seatNumbers) do
        if type(sn) ~= "number" or sn < 1 or sn > (trip.totalSeats or 45) then
          send_response(client, "400 Bad Request", { error = "invalid seat number: " .. tostring(sn) })
          return
        end
        if trip.seatMap and trip.seatMap[sn] then
          send_response(client, "409 Conflict", { error = "seat already reserved", seat = sn })
          return
        end
      end
    else
      -- auto-assign seatNumbers: find first free seats
      seatNumbers = {}
      for i = 1, (trip.totalSeats or 45) do
        if not trip.seatMap or not trip.seatMap[i] then
          table.insert(seatNumbers, i)
          if #seatNumbers >= requestedSeats then break end
        end
      end
      if #seatNumbers < requestedSeats then
        send_response(client, "409 Conflict", { error = "not enough free seat numbers", available = trip.seats })
        return
      end
    end

    -- Now reserve: mark trip.seatMap entries and decrement trip.seats
    for _, sn in ipairs(seatNumbers) do
      trip.seatMap[sn] = { reserved_at = os.time() }
    end
    trip.seats = trip.seats - requestedSeats
    if trip.seats < 0 then trip.seats = 0 end

    -- create ticket record (store passengers & seatNumbers if provided)
    local ticket = {
      id = (#DATA.tickets) + 1,
      tripId = trip.id,
      seats = requestedSeats,
      seatNumbers = seatNumbers,
      passengers = passengers or {},
      pricePerSeat = trip.price,
      total = (trip.price * requestedSeats),
      status = "booked",
      ts = os.time()
    }
    table.insert(DATA.tickets, ticket)
    persist()
    send_response(client, "201 Created", { ok = true, ticket = ticket })
    return
  end

  -- POST /api/cancel
  -- body: { ticketId }
  if method == "POST" and path == "/api/cancel" then
    local ok, payload = pcall(function() return json.decode(body) end)
    if not ok or not payload or not payload.ticketId then
      send_response(client, "400 Bad Request", { error = "need ticketId" })
      return
    end
    local ticket = nil
    for _, t in ipairs(DATA.tickets) do if t.id == payload.ticketId then ticket = t; break end end
    if not ticket then send_response(client, "404 Not Found", { error = "ticket not found" }); return end
    if ticket.status == "cancelled" then send_response(client, "409 Conflict", { error = "already cancelled" }); return end

    -- free seatMap entries if ticket contains seatNumbers
    for _, trip in ipairs(DATA.trips) do
      if trip.id == ticket.tripId then
        if ticket.seatNumbers and type(ticket.seatNumbers) == "table" then
          for _, sn in ipairs(ticket.seatNumbers) do
            if trip.seatMap and trip.seatMap[sn] then trip.seatMap[sn] = nil end
          end
        end
        trip.seats = trip.seats + (ticket.seats or 0)
        break
      end
    end

    ticket.status = "cancelled"
    persist()
    send_response(client, "200 OK", { ok = true, ticket = ticket })
    return
  end

  -- ----------------------
  -- Fallback: serve static files
  -- ----------------------
  if method == "GET" then
    local served = serve_static(client, path)
    if served then return end
  end

  -- Unknown route
  send_response(client, "404 Not Found", { error = "unknown route" })
end

-- Main loop
while true do
  local client = server:accept()
  if client then
    local ok, err = pcall(function() handle_request(client) end)
    if not ok then
      print("Request error:", err)
      pcall(function() client:close() end)
    end
  else
    socket.sleep(0.01)
  end
end
