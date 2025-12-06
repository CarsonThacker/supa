import { createBareServer } from "@tomphttp/bare-server-node"
import { createServer } from "node:http"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// Create bare server
const bare = createBareServer("/bare/")

// Create HTTP server
const server = createServer()

server.on("request", (req, res) => {
  // Handle bare server requests
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res)
  } else {
    // Health check endpoint
    if (req.url === "/" || req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "ok",
          message: "Supa Bare Server Running",
          timestamp: new Date().toISOString(),
        }),
      )
    } else {
      res.writeHead(404)
      res.end("Not Found")
    }
  }
})

server.on("upgrade", (req, socket, head) => {
  // Handle bare server upgrades (WebSocket)
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head)
  } else {
    socket.end()
  }
})

const PORT = process.env.PORT || 8080
const HOST = "0.0.0.0"

server.listen(PORT, HOST, () => {
  console.log(`🚀 Supa Bare Server running on http://${HOST}:${PORT}`)
  console.log(`📡 Bare endpoint: http://${HOST}:${PORT}/bare/`)
})
