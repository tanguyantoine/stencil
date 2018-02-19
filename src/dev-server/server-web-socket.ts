import { DevServerConfig } from '../declarations';
import * as http from 'http';


export function createWebSocketServer(config: DevServerConfig) {
  const WebSocket = require('faye-websocket');

  const server = http.createServer();

  server.on('upgrade', (request, socket, body) => {
    if (WebSocket.isWebSocket(request)) {
      let ws = new WebSocket(request, socket, body);

      ws.on('message', (event: any) => {
        ws.send(event.data);
      });

      ws.on('close', (event: any) => {
        console.log('close', event.code, event.reason);
        ws = null;
      });
    }
  });

  server.listen(config.liveReload);
}
