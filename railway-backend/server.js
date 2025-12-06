import { createServer } from "node:http"
import { createBareServer } from "@tomphttp/bare-server-node"

const bareServer = createBareServer("/bare/")

const server = createServer()

server.on("request", (req, res) => {
  // Handle Bare server requests
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeRequest(req, res)
  }

  // Default response
  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  })
  res.end("Scramjet Bare Server Running - Supa Backend v1.0.0")
})

server.on("upgrade", (req, socket, head) => {
  // Handle WebSocket upgrades for Bare server
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeUpgrade(req, socket, head)
  }
  socket.end()
})

// Listen on Railway's PORT or fallback to 8080
const PORT = process.env.PORT || 8080
server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Supa Backend] Scramjet Bare Server running on port ${PORT}`)
  console.log(`[Supa Backend] Accessible at http://0.0.0.0:${PORT}`)
  console.log(`[Supa Backend] Bare endpoint: /bare/`)
})
