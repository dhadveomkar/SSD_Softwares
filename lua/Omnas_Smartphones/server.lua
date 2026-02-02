local socket = require("socket")
local json = require("dkjson")

-- ===== helpers =====
local function readFile(path)
  local f = io.open(path, "rb")
  if not f then return nil end
  local d = f:read("*a")
  f:close()
  return d
end

local function writeFile(path, data)
  local f = assert(io.open(path, "wb"))
  f:write(data)
  f:close()
end

local function fileExists(path)
  local f = io.open(path, "rb")
  if f then f:close(); return true end
  return false
end

local function guessContentType(path)
  local ext = path:match("^.+(%..+)$") or ""
  ext = ext:lower()
  if ext == ".html" then return "text/html; charset=utf-8"
  elseif ext == ".css" then return "text/css; charset=utf-8"
  elseif ext == ".js" then return "application/javascript; charset=utf-8"
  elseif ext == ".json" then return "application/json; charset=utf-8"
  elseif ext == ".png" then return "image/png"
  elseif ext == ".jpg" or ext == ".jpeg" then return "image/jpeg"
  end
  return "application/octet-stream"
end

-- ===== PRODUCTS =====
local function loadProducts()
  local raw = readFile("data/products.json") or "[]"
  return json.decode(raw) or {}
end

local function saveProducts(tbl)
  writeFile("data/products.json", json.encode(tbl, { indent = true }))
end

local function nextId(tbl)
  local max = 0
  for _, p in ipairs(tbl) do
    local id = tonumber(p.id) or 0
    if id > max then max = id end
  end
  return max + 1
end

-- ===== ADMIN =====
local ADMIN_USER = "admin"
local ADMIN_PASS = "admin123"
local ADMIN_TOKEN = "TOK_ADMIN_12345"

-- ===== SERVER =====
local server = assert(socket.bind("*", 8080))
server:settimeout(0.01)
print("Server running at http://localhost:8080")

while true do
  local client = server:accept()

  if client then
    client:settimeout(1)

    local skip = false  -- <== prevents using goto

    local req_line = client:receive("*l")

    if req_line then
      local method, path = req_line:match("^(%u+)%s+([^%s]+)")

      -- Read headers
      local headers = {}
      while true do
        local line = client:receive("*l")
        if not line or line == "" then break end
        local key, val = line:match("^(.-):%s*(.*)")
        if key then headers[key:lower()] = val end
      end

      -- Prepare CORS
      local corsHeaders =
        "Access-Control-Allow-Origin: *\r\n" ..
        "Access-Control-Allow-Headers: Content-Type\r\n" ..
        "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n"

      -- Handle OPTIONS
      if method == "OPTIONS" then
        client:send("HTTP/1.1 200 OK\r\n" .. corsHeaders .. "\r\n")
        skip = true
      end

      if not skip then
        -- Read body
        local body = ""
        local len = tonumber(headers["content-length"])
        if len and len > 0 then
          body = client:receive(len)
        end

        if path == "/" then path = "/index.html" end

        -- API ROUTES ----------------------------------

        if method == "GET" and path == "/api/products" then
          local data = json.encode(loadProducts())
          client:send("HTTP/1.1 200 OK\r\n" .. corsHeaders ..
            "Content-Type: application/json\r\n" ..
            "Content-Length: " .. #data .. "\r\n\r\n" ..
            data)

        elseif method == "POST" and path == "/api/login" then
          local data = json.decode(body) or {}
          local ok = data.username == ADMIN_USER and data.password == ADMIN_PASS

          local out = ok
            and json.encode({ success = true, token = ADMIN_TOKEN })
            or json.encode({ success = false })

          client:send("HTTP/1.1 200 OK\r\n" .. corsHeaders ..
            "Content-Type: application/json\r\nContent-Length: " .. #out ..
            "\r\n\r\n" .. out)

        elseif method == "POST" and path == "/api/add-product" then
          local data = json.decode(body) or {}

          if data.token ~= ADMIN_TOKEN then
            local out = json.encode({ success = false, message = "Unauthorized" })
            client:send("HTTP/1.1 403 Forbidden\r\n" .. corsHeaders ..
              "Content-Type: application/json\r\nContent-Length: " .. #out ..
              "\r\n\r\n" .. out)
          else
            data.token = nil
            local prods = loadProducts()
            data.id = nextId(prods)
            table.insert(prods, data)
            saveProducts(prods)

            local out = json.encode({ success = true })
            client:send("HTTP/1.1 200 OK\r\n" .. corsHeaders ..
              "Content-Type: application/json\r\nContent-Length: " .. #out ..
              "\r\n\r\n" .. out)
          end

        -- STATIC FILES ---------------------------------

        else
          local cleanPath = path:gsub("%.%.", ""):gsub("^/", "")
          local fs = "public/" .. cleanPath

          if fileExists(fs) then
            local content = readFile(fs)
            client:send("HTTP/1.1 200 OK\r\n" .. corsHeaders ..
              "Content-Type: " .. guessContentType(fs) .. "\r\n" ..
              "Content-Length: " .. #content .. "\r\n\r\n" ..
              content)
          else
            local msg = "<h1>404 Not Found</h1>"
            client:send("HTTP/1.1 404 Not Found\r\n" .. corsHeaders ..
              "Content-Type: text/html\r\nContent-Length: " .. #msg ..
              "\r\n\r\n" .. msg)
          end
        end
      end
    end

    client:close()
  end

  socket.sleep(0.01)
end
