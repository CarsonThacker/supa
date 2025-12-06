import { createServer } from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import { BareMuxConnection } from "@mercuryworkshop/bare-mux/node";
import { EpoxyTransport } from "@mercuryworkshop/epoxy-transport";

const bareServer = createBareServer("/bare/");

const mux = new BareMuxConnection(bareServer);
const epoxy = new EpoxyTransport({ conn: mux });

const server = createServer((req, res) => {
  // Handle Bare
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeRequest(req, res);
  }

  // Handle Epoxy
  if (epoxy.shouldRoute(req)) {
    return epoxy.route(req, res);
  }

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Scramjet v0 Backend Running");
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    return bareServer.routeUpgrade(req, socket, head);
  }
  socket.end();
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Scramjet v0 Backend running on port " + PORT);
});

