import * as d from '../../declarations';
import { updateDocument } from './update-document';


export function initClientWebSocket(devServer: d.DevServerClientConfig, win: d.DevClientWindow, doc: Document) {
  return new Promise((resolve, reject) => {
    try {
      const ClientWebSocket = win.MozWebSocket || win.WebSocket;
      const protos = ['xmpp'];

      const socketUrl = `${devServer.ssl ? `wss` : `ws`}://${devServer.address}:${devServer.port}/`;
      const clientWs = new ClientWebSocket(socketUrl, protos);

      clientWs.onopen = () => {
        clientWebSocketOpened(clientWs);
        resolve();
      };

      clientWs.onerror = (event) => {
        console.log('dev server web socket error: ' + event.message);
        reject('dev server web socket error: ' + event.message);
      };

      clientWs.onmessage = (event) => {
        browserReceivedMessageFromServer(devServer, doc, JSON.parse(event.data));
      };

      clientWs.onclose = (event) => {
        console.log('dev server web socket closed: ' + event.code + ', ' + event.reason);
      };

    } catch (e) {
      reject('web socket error: ' + e);
    }
  });
}


function clientWebSocketOpened(clientWs: d.DevClientSocket) {
  const msg: d.DevServerMessage = {
    requestBuildResults: true
  };
  clientWs.send(JSON.stringify(msg));
}


function browserReceivedMessageFromServer(devServer: d.DevServerClientConfig, doc: Document, msg: d.DevServerMessage) {
  console.log('browserReceivedMessageFromServer', msg);

  if (msg.buildResults) {
    updateDocument(devServer, doc, msg.buildResults);
  }
}
