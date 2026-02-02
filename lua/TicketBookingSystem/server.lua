-- server.lua
-- Simple HTTP server in Lua using LuaSocket and dkjson
-- Serves static files from ./public and provides JSON API endpoints

local socket = require("socket")
local json = require("dkjson")
local lfs_ok, lfs = pcall(require, "lfs") -- optional, for nicer file checks

local HOST = "127.0.0.1"
local PORT = 8080
local PUBLIC_DIR = "public"
local BOOKINGS_FILE = "bookings.json"

-- Sample events (could be loaded from a file/database)
local events = {
  { id = 1, title = "Concert: The Lunar Trio", venue = "Main Hall", date = "2025-12-05", price = 499 },
  { id = 2, title = "Comedy Night", venue = "The Laugh House", date = "2025-12-12", price = 299 },
  { id = 3, title = "Tech Talk: Lua for Web", venue = "Conference Room A", date = "2025-12-20", price = 199 }
}

-- Load or create bookings (persisted to bookings.json)
local bookings = {}
local function load_bookings()
  local fh = io.open(BOOKINGS_FILE, "r")
  if fh then
    local content = fh:read("*a")
    fh:close()
    if content and #content > 0 then
      local decoded, pos, err = json.decode(content)
      if decoded then bookings = decoded end
    end
  end
end

local function save_bookings()
  local fh = io.open(BOOKINGS_FILE, "w+")
  if not fh then
    print("Warning: could not save bookings to file")
    return
  end
  fh:write(json.encode(bookings, { indent = true }))
  fh:close()
end

load_bookings()

-- Utility helpers
local function read_file(path)
  local f, err = io.open(path, "rb")
  if not f then return nil, err end
  local content = f:read("*a")
  f:close()
  return content
end

local function content_type_from_ext(ext)
  local map = {
    html = "text/html; charset=utf-8",
    css = "text/css",
    js = "application/javascript",
    png = "image/png",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    gif = "image/gif",
    ico = "image/x-icon",
    json = "application/json; charset=utf-8"
  }
  return map[ext:lower()] or "application/octet-stream"
end

local function url_decode(s)
  s = s:gsub('+',' ')
  return s:gsub("%%(%x%x)", function(h) return string.char(tonumber(h,16)) end)
end

-- Very simple HTTP parsing (enough for our small server)
local function parse_request(client)
  client:settimeout(1)
  local first_line, err = client:receive()
  if not first_line then return nil, "no request" end
  local method, path, httpver = first_line:match("^(%u+) (.-) (HTTP/%d%.%d)")
  local headers = {}
  while true do
    local line, err = client:receive()
    if not line then return nil, "incomplete headers" end
    if line == "" then break end
    local k,v = line:match("^(.-):%s*(.*)")
    if k and v then headers[k:lower()] = v end
  end
  local body = nil
  if headers["content-length"] then
    local len = tonumber(headers["content-length"])
    if len and len > 0 then
      body, err = client:receive(len)
    end
  end
  return { method = method, path = path, httpver = httpver, headers = headers, body = body }
end

-- Build responses
local function send_response(client, status_code, status_text, headers, body)
  client:send(string.format("HTTP/1.1 %d %s\r\n", status_code, status_text))
  headers = headers or {}
  headers["Server"] = "LuaSimpleServer/1.0"
  headers["Content-Length"] = tostring(#(body or ""))
  for k,v in pairs(headers) do
    client:send(string.format("%s: %s\r\n", k, v))
  end
  client:send("\r\n")
  if body and #body > 0 then client:send(body) end
end

-- Route requests
local function handle_request(req)
  -- Basic path and query parsing
  local path, query = req.path, ""
  do
    local qpos = req.path:find("?", 1, true)
    if qpos then
      path = req.path:sub(1, qpos-1)
      query = req.path:sub(qpos+1)
    end
  end

  -- API endpoints
  if path == "/" or path == "/index.html" then
    local p = PUBLIC_DIR .. "/index.html"
    local content, err = read_file(p)
    if not content then
      return 404, "Not Found", { ["Content-Type"] = "text/plain" }, "Index not found"
    end
    return 200, "OK", { ["Content-Type"] = "text/html; charset=utf-8" }, content
  elseif path:match("^/static/") or path:match("^/public/") or path:match("^/assets/") then
    -- Prevent path traversal
    local rel = path:gsub("^/","")
    if rel:find("%.%.") then
      return 403, "Forbidden", { ["Content-Type"] = "text/plain" }, "Forbidden"
    end
    local p = rel
    local content, err = read_file(p)
    if not content then
      return 404, "Not Found", { ["Content-Type"] = "text/plain" }, "File not found"
    end
    local ext = p:match("%.([^%.]+)$") or ""
    return 200, "OK", { ["Content-Type"] = content_type_from_ext(ext) }, content
  elseif path:match("^/api/") then
    -- Simple CORS header
    local headers = { ["Content-Type"] = "application/json; charset=utf-8", ["Access-Control-Allow-Origin"] = "*" }
    if req.method == "OPTIONS" then
      headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
      headers["Access-Control-Allow-Headers"] = "Content-Type"
      return 204, "No Content", headers, ""
    end

    if path == "/api/events" and req.method == "GET" then
      return 200, "OK", headers, json.encode(events)
    elseif path == "/api/bookings" and req.method == "GET" then
      return 200, "OK", headers, json.encode(bookings)
    elseif path == "/api/book" and req.method == "POST" then
      if not req.body or #req.body == 0 then
        return 400, "Bad Request", headers, json.encode({ error = "Empty body" })
      end
      local ok, data = pcall(function() return json.decode(req.body) end)
      if not ok or type(data) ~= "table" then
        return 400, "Bad Request", headers, json.encode({ error = "Invalid JSON" })
      end
      -- Validate minimal fields: name, email, eventId, quantity
      if not data.name or not data.email or not data.eventId or not data.quantity then
        return 400, "Bad Request", headers, json.encode({ error = "Missing fields" })
      end
      -- find event
      local evt = nil
      for _,e in ipairs(events) do if e.id == tonumber(data.eventId) then evt = e; break end end
      if not evt then
        return 404, "Not Found", headers, json.encode({ error = "Event not found" })
      end
      -- create booking
      local booking = {
        id = (#bookings) + 1,
        name = data.name,
        email = data.email,
        eventId = evt.id,
        eventTitle = evt.title,
        quantity = tonumber(data.quantity),
        total = tonumber(evt.price) * tonumber(data.quantity),
        createdAt = os.date("!%Y-%m-%dT%H:%M:%SZ") -- UTC timestamp
      }
      table.insert(bookings, booking)
      save_bookings()
      return 201, "Created", headers, json.encode({ success = true, booking = booking })
    else
      return 404, "Not Found", { ["Content-Type"] = "application/json; charset=utf-8" }, json.encode({ error = "API endpoint not found" })
    end
  else
    -- Serve static files from PUBLIC_DIR
    local safe = path:gsub("^/","")
    if safe:find("%.%.") then
      return 403, "Forbidden", { ["Content-Type"] = "text/plain" }, "Forbidden"
    end
    local p = PUBLIC_DIR .. "/" .. safe
    local content, err = read_file(p)
    if not content then
      return 404, "Not Found", { ["Content-Type"] = "text/plain" }, "Not found"
    end
    local ext = p:match("%.([^%.]+)$") or ""
    return 200, "OK", { ["Content-Type"] = content_type_from_ext(ext) }, content
  end
end

-- Start server
local server = assert(socket.bind(HOST, PORT))
local ip, port = server:getsockname()
print(string.format("Server running on http://%s:%d/  (public dir: %s)", ip, port, PUBLIC_DIR))

while true do
  local client = server:accept()
  client:settimeout(2)
  local ok, req = pcall(parse_request, client)
  if not ok or not req then
    client:close()
  else
    local status, status_text, headers, body = handle_request(req)
    if not status then
      send_response(client, 500, "Internal Server Error", { ["Content-Type"] = "text/plain" }, "Server error")
    else
      -- ensure headers table keys are proper strings
      headers = headers or {}
      send_response(client, status, status_text, headers, body)
    end
    client:close()
  end
end
