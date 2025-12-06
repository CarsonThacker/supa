import { createBareServer } from "@tomphttp/bare-server-node"
import { createServer } from "node:http"

const bare = createBareServer("/bare/")
const server = createServer()

server.on("request", (req, res) => {
  console.log(`[HTTP] ${req.method} ${req.url}`)

  // Handle bare server requests
  if (bare.shouldRoute(req)) {
    console.log(`[BARE] Routing request: ${req.url}`)
    bare.routeRequest(req, res)
  } else {
    // Health check endpoint
    if (req.url === "/" || req.url === "/health") {
      console.log("[HEALTH] Health check accessed")
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      })
      res.end(
        JSON.stringify({
          status: "ok",
          message: "Supa Bare Server Running",
          endpoints: {
            bare: "/bare/",
          },
          timestamp: new Date().toISOString(),
        }),
      )
    } else {
      console.log(`[404] Not found: ${req.url}`)
      res.writeHead(404)
      res.end("Not Found")
    }
  }
})

server.on("upgrade", (req, socket, head) => {
  console.log(`[UPGRADE] WebSocket upgrade request: ${req.url}`)

  if (bare.shouldRoute(req)) {
    console.log("[BARE] Routing upgrade to Bare server")
    bare.routeUpgrade(req, socket, head)
  } else {
    console.log("[UPGRADE] Unknown upgrade request, closing")
    socket.end()
  }
})

const PORT = process.env.PORT || 8080
const HOST = "0.0.0.0"

server.listen(PORT, HOST, () => {
  console.log(`🚀 Supa Bare Server running on http://${HOST}:${PORT}`)
  console.log(`📡 Bare endpoint: /bare/`)
  console.log(`✅ Ready to receive connections`)
})
