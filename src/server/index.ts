import { WSMessage } from "../types";

const host = "0.0.0.0";
const port = 3000;

const sockets: Record<string, WebSocket> = {};

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
      sockets[ws.data.id] = ws;
    },
    message: (ws, message) => {
      console.debug(`Message from client: ${ws.data.id}`);
      Object.keys(sockets).forEach((key) => {
        if (key !== ws.data.id) {
          sockets[key].send(message);
          console.debug(`Sending message to client: ${key}`);
        }
      });
    },
    close(ws) {
      console.debug(`Closing connection with client: ${ws.data.id}`);
      delete sockets[ws.data.id];
    },
  },
});

process.on("beforeExit", () => {
  manager.close();
});

console.debug(`Listening on ws://${host}:${port}`);
