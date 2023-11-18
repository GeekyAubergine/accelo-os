const server = Bun.serve<{ authToken: string }>({
    fetch(req, server) {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }
  
      // handle HTTP request normally
      return new Response("Hello world!");
    },
    websocket: {
        message(ws, message) {}, // a message is received
        open(ws) {}, // a socket is opened
        close(ws, code, message) {}, // a socket is closed
        drain(ws) {}, // the socket is ready to receive more data
    },
  });
  
  console.log(`Listening on localhost:\${server.port}`);