import * as d from '../../declarations';


export function initClientWebSocket(win: d.DevClientWindow, devServer: d.DevServerClientConfig) {
  return new Promise((resolve, reject) => {
    try {
      const Socket = win.MozWebSocket || win.WebSocket;
      const protos = ['xmpp'];

      const socketUrl = `${devServer.ssl ? `wss` : `ws`}://${devServer.address}:${devServer.port}/`;
      const socket = new Socket(socketUrl, protos);

      socket.onopen = () => {
        console.log('OPEN: ' + socket.protocol);
        socket.send('Hello, world');
        resolve();
      };

      socket.onerror = (event) => {
        console.log('ERROR: ' + event.message);
        reject('web socket error: ' + event.message);
      };

      socket.onmessage = (event) => {
        clientReceivedMessageFromServer(event.data);
      };

      socket.onclose = (event) => {
        console.log('CLOSE: ' + event.code + ', ' + event.reason);
      };

    } catch (e) {
      reject('web socket error: ' + e);
    }
  });
}


function clientReceivedMessageFromServer(msg: d.DevServerMessage) {
  console.log('clientReceivedMessageFromServer', msg);
}
