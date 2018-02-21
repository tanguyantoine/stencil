import * as d from '../../declarations';


export function initClientWebSocket(win: d.DevClientWindow, devServer: d.DevServerClientConfig) {
  return new Promise((resolve, reject) => {
    try {
      const ClientWebSocket = win.MozWebSocket || win.WebSocket;
      const protos = ['xmpp'];

      const socketUrl = `${devServer.ssl ? `wss` : `ws`}://${devServer.address}:${devServer.port}/`;
      const clientWs = new ClientWebSocket(socketUrl, protos);

      clientWs.onopen = () => {
        console.log('OPEN: ' + clientWs.protocol);
        clientWs.send('Hello, world');
        resolve();
      };

      clientWs.onerror = (event) => {
        console.log('ERROR: ' + event.message);
        reject('web socket error: ' + event.message);
      };

      clientWs.onmessage = (event) => {
        browserReceivedMessageFromServer(JSON.parse(event.data));
      };

      clientWs.onclose = (event) => {
        console.log('CLOSE: ' + event.code + ', ' + event.reason);
      };

    } catch (e) {
      reject('web socket error: ' + e);
    }
  });
}


function browserReceivedMessageFromServer(msg: d.DevServerMessage) {
  console.log('browserReceivedMessageFromServer', msg);
}
