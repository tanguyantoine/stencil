import * as d from '../../declarations';
import { initClientWebSocket } from './client-web-socket';
import { initDevServerLoad } from './dev-server-load';
import { setupDocument } from './setup-document';


export async function initClient(win: d.DevClientWindow, doc: Document, devServer: d.DevServerClientConfig) {
  try {
    if (!devServer) {
      console.error(`invalid client-side dev server config`);
      return;
    }

    if (devServer.hasClientInitialized) {
      return;
    }
    devServer.hasClientInitialized = true;

    if (devServer.initialDevServerLoad) {
      initDevServerLoad(win);
    }

    await initClientWebSocket(win, devServer);

    setupDocument(doc);

  } catch (e) {
    console.error(e);
  }
}
