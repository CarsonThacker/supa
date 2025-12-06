import { createBareServer } from "@tomphttp/bare-server-node"
import { createServer } from "node:http"
import { Server as WispServer } from "@mercuryworkshop/wisp-js/server"

const bare = createBareServer("/bare/")
const server = createServer()

const wisp = new WispServer()

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
          message: "Supa Bare + Wisp Server Running",
          endpoints: {
            bare: "/bare/",
            wisp: "ws://",
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
    console.log("[WISP] Routing upgrade to Wisp server")
    wisp.routeRequest(req, socket, head)
  }
})

const PORT = process.env.PORT || 8080
const HOST = "0.0.0.0"

server.listen(PORT, HOST, () => {
  console.log(`🚀 Supa Server running on http://${HOST}:${PORT}`)
  console.log(`📡 Bare endpoint: /bare/`)
  console.log(`🌐 Wisp endpoint: ws://`)
  console.log(`✅ Ready to receive connections`)
})
