import * as d from '../../declarations';
import { initClientWebSocket } from './client-web-socket';
import { initDevServerLoad } from './dev-server-load';


export async function initClient(devServer: d.DevServerClientConfig, win: d.DevClientWindow, doc: Document) {
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

    await initClientWebSocket(devServer, win, doc);

  } catch (e) {
    console.error(e);
  }
}
