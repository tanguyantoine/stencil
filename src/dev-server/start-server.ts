import { createHttpServer } from './server-http';
import { createWebSocketServer } from './server-web-socket';
import { DevServerConfig, DevServerMessage, FileSystem } from '../declarations';
import { findOpenPorts } from './find-closest-port';
import { UNREGISTER_SW_URL } from './serve-file';


export async function startDevServer(config: DevServerConfig, fs: FileSystem) {
  await findOpenPorts(config);

  await createHttpServer(config, fs);

  await createWebSocketServer(config);

  notifyStartup(config);
}


function notifyStartup(config: DevServerConfig) {
  config.browserUrl = (config.address === '0.0.0.0') ? 'localhost' : config.address;
  config.browserUrl = `${config.protocol}://${config.browserUrl}:${config.httpPort}`;

  const msg: DevServerMessage = {
    startServerResponse: {
      protocol: config.protocol,
      address: config.address,
      httpPort: config.httpPort,
      browserUrl: config.browserUrl,
      openUrl: config.browserUrl
    }
  };

  if (config.unregisterServiceWorker) {
    msg.startServerResponse.openUrl += UNREGISTER_SW_URL;
  } else {
    msg.startServerResponse.openUrl += '/';
  }

  process.send(msg);
}
