-- server.lua
-- Simple static HTTP server using LuaSocket
local socket = require("socket")

local host = "127.0.0.1"
local port = 8080

local server = assert(socket.bind(host, port))
print(("Server running at http://%s:%d/"):format(host, port))

while true do
  local client = server:accept()
  client:settimeout(1)

  -- Read request-line e.g. "GET / HTTP/1.1"
  local request_line, err = client:receive()
  if not request_line then
    client:close()
  else
    local method, path = request_line:match("^(%S+)%s(%S+)")
    -- drain headers
    while true do
      local line = client:receive()
      if not line or line == "" then break end
    end

    if path == "/" then path = "/index.html" end
    local filename = "." .. path

    local file = io.open(filename, "rb")
    if file then
      local body = file:read("*a")
      file:close()

      client:send("HTTP/1.1 200 OK\r\n")
      client:send("Content-Type: text/html; charset=utf-8\r\n")
      client:send("Content-Length: " .. tostring(#body) .. "\r\n")
      client:send("Connection: close\r\n")
      client:send("\r\n")
      client:send(body)
    else
      local body = "<h1>404 Not Found</h1><p>File not found: " .. path .. "</p>"
      client:send("HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\nContent-Length: " .. tostring(#body) .. "\r\nConnection: close\r\n\r\n" .. body)
    end

    client:close()
  end
end
