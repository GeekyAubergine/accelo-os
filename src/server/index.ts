import { WSMessage } from "../types";

const host = "0.0.0.0";
const port = 3000;

const sockets: WebSocket[] = [];

Bun.serve<WSMessage>({
  hostname: host,
  port: port,
  fetch: (req, server) => {
    const clientId = crypto.randomUUID();
    server.upgrade(req, {
      data: {
        id: clientId,
        createdAt: Date(),
      },
    });
    return new Response("Upgrade Failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      console.debug(`Client connected: ${ws.data.id}`);
      sockets.push(ws);
    },
    message: (ws, message) => {
      console.debug(`Message from client: ${ws.data.id}`);
      console.debug(message);
    },
    close(ws) {
      console.debug(`Closing connection with client: ${ws.data.id}`);
      sockets.splice(sockets.indexOf(ws), 1);
    },
  },
});

process.on("beforeExit", () => {
  manager.close();
});

console.debug(`Listening on ws://${host}:${port}`);
