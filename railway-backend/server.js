import { createServer } from "node:http";
import { ScramjetServer } from "@mercuryworkshop/scramjet/server";
import { createBareServer } from "@tomphttp/bare-server-node";
import { EpoxyTransport } from "@mercuryworkshop/epoxy-transport";
import { BareMuxConnection } from "@mercuryworkshop/bare-mux/node";

const bareServer = createBareServer("/bare/");
const scramjet = new ScramjetServer({
  prefix: "/scramjet/",
  transport: new EpoxyTransport({
    conn: new BareMuxConnection(bareServer),
  }),
});

const server = createServer(async (req, res) => {
  try {
    // 1. Scramjet routing
    if (scramjet.route(req)) {
      return scramjet.fetch(req, res);
    }

    // 2. Bare server routing
    if (bareServer.shouldRoute(req)) {
      return bareServer.routeRequest(req, res);
    }

    // 3. Default response
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Scramjet v0 Backend Running on Railway");
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

// WebSocket support
server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeUpgrade(req, socket, head);
  }
  socket.end();
});

// Railway port binding
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log("────────────────────────────────────────");
  console.log(` Scramjet v0 Backend Online`);
  console.log(` Railway Port: ${PORT}`);
  console.log(` Bare Endpoint: /bare/`);
  console.log(` Scramjet Endpoint: /scramjet/`);
  console.log("────────────────────────────────────────");
});

