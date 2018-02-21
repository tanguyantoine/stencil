import { DevServerMessage, DevServerSocket, DevServerSocketConstructor } from '../declarations';
import * as http from 'http';


export function createWebSocketServer(server: http.Server) {
  const WebSocket: DevServerSocketConstructor = require('faye-websocket');

  server.on('upgrade', (request, socket, body) => {
    if (WebSocket.isWebSocket(request)) {
      let serverWs = new WebSocket(request, socket, body, ['xmpp']);

      serverWs.on('message', (event) => {
        // received a message from the browser
        serverReceivedMessageFromBrowser(serverWs, event.data);
      });

      serverWs.on('close', (event: any) => {
        console.log('web socket close', event);
        serverWs = null;
      });

      process.on('message', (msg: DevServerMessage) => {
        // received a message from the cli's main thread
        // pass it onto the browser
        if (serverWs) {
          serverWs.send(JSON.stringify(msg));
        }
      });
    }
  });
}


function serverReceivedMessageFromBrowser(_serverWs: DevServerSocket, msg: DevServerMessage) {
  console.log('serverReceivedMessageFromBrowser', msg);
}
