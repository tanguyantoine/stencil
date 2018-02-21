import { DevServerConfig, DevServerMessage, DevServerSocketConstructor } from '../declarations';
import * as http from 'http';


export function createWebSocketServer(config: DevServerConfig, server: http.Server) {
  const WebSocket: DevServerSocketConstructor = require('faye-websocket');

  server.on('upgrade', (request, socket, body) => {
    if (WebSocket.isWebSocket(request)) {
      let ws = new WebSocket(request, socket, body, ['xmpp']);

      ws.on('message', (event) => {
        serverReceivedMessageFromClient(config, event.data);
      });

      ws.on('close', (event: any) => {
        console.log('web socket close', event);
        ws = null;
      });
    }
  });
}


function serverReceivedMessageFromClient(_config: DevServerConfig, msg: DevServerMessage) {
  console.log('serverReceivedMessageFromClient', msg);
}
