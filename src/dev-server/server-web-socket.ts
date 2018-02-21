import { DevServerMessage, DevServerSocketConstructor } from '../declarations';
import * as http from 'http';


export function createWebSocketServer(server: http.Server) {
  const WebSocket: DevServerSocketConstructor = require('faye-websocket');

  server.on('upgrade', (request, socket, body) => {
    if (WebSocket.isWebSocket(request)) {
      let serverWs = new WebSocket(request, socket, body, ['xmpp']);

      serverWs.on('message', (event) => {
        // the server process has received a message from the browser
        // pass the message received from the browser to the main cli process
        process.send(JSON.parse(event.data));
      });

      serverWs.on('close', () => {
        // the server web socket has closed
        serverWs = null;
      });

      process.on('message', (msg: DevServerMessage) => {
        // the server process has received a message from the cli's main thread
        // pass it to the server's web socket to send to the browser
        if (serverWs) {
          serverWs.send(JSON.stringify(msg));
        }
      });
    }
  });
}
